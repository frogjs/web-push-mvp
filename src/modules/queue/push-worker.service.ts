import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Worker } from 'bullmq';
import { Model, Types } from 'mongoose';
import webpush from 'web-push';
import { Campaign, CampaignDocument } from '../campaigns/campaign.schema';
import { Subscription, SubscriptionDocument } from '../subscriptions/subscription.schema';
import { VapidService } from '../vapid/vapid.service';
import { DeliveryLog, DeliveryLogDocument } from './delivery-log.schema';
import { PUSH_QUEUE_NAME } from './queue.constants';

@Injectable()
export class PushWorkerService implements OnModuleInit, OnModuleDestroy {
  private worker: Worker;

  constructor(
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
    @InjectModel(DeliveryLog.name)
    private readonly deliveryLogModel: Model<DeliveryLogDocument>,
    private readonly vapidService: VapidService,
  ) {}

  onModuleInit() {
    this.vapidService.configureWebPush();

    this.worker = new Worker(
      PUSH_QUEUE_NAME,
      async (job) => {
        const { campaignId, subscriptionId } = job.data as {
          campaignId: string;
          subscriptionId: string;
        };

        const subscription = await this.subscriptionModel.findById(subscriptionId).lean();
        if (!subscription) {
          return;
        }

        const campaign = await this.campaignModel.findById(campaignId).lean();
        if (!campaign) {
          return;
        }

        const payload = {
          ...campaign.payload,
          campaignId: campaign._id.toString(),
        };

        try {
          await webpush.sendNotification(subscription, JSON.stringify(payload));

          await this.deliveryLogModel.create({
            campaignId: new Types.ObjectId(campaignId),
            subscriptionId: new Types.ObjectId(subscriptionId),
            status: 'SENT',
            sentAt: new Date(),
          });

          await this.campaignModel.updateOne(
            { _id: campaignId },
            { $inc: { 'counters.sent': 1 } },
          );
        } catch (error) {
          const statusCode = (error as { statusCode?: number }).statusCode;
          const errorMessage = error instanceof Error ? error.message : 'Push failed';

          await this.deliveryLogModel.create({
            campaignId: new Types.ObjectId(campaignId),
            subscriptionId: new Types.ObjectId(subscriptionId),
            status: 'FAILED',
            error: errorMessage,
            sentAt: new Date(),
          });

          await this.campaignModel.updateOne(
            { _id: campaignId },
            { $inc: { 'counters.failed': 1 } },
          );

          if (statusCode === 404 || statusCode === 410) {
            await this.subscriptionModel.deleteOne({ _id: subscriptionId });
          }
        }

        await this.maybeFinalizeCampaign(campaignId);
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'redis',
          port: Number(process.env.REDIS_PORT || 6379),
        },
      },
    );
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
  }

  private async maybeFinalizeCampaign(campaignId: string) {
    const campaign = await this.campaignModel.findById(campaignId).lean();
    if (!campaign) {
      return;
    }

    const total = campaign.counters.sent + campaign.counters.failed;
    if (campaign.status !== 'DONE' && total >= campaign.counters.queued) {
      await this.campaignModel.updateOne(
        { _id: campaignId },
        { $set: { status: 'DONE', finishedAt: new Date() } },
      );
    }
  }
}
