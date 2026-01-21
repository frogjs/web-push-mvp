import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PushQueueService } from '../queue/push-queue.service';
import { Subscription, SubscriptionDocument } from '../subscriptions/subscription.schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { Campaign, CampaignDocument } from './campaign.schema';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name) private readonly campaignModel: Model<CampaignDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    private readonly pushQueueService: PushQueueService,
  ) {}

  async createCampaign(dto: CreateCampaignDto) {
    const campaign = await this.campaignModel.create({
      status: 'CREATED',
      payload: dto,
      counters: { queued: 0, sent: 0, failed: 0 },
    });

    const subscriptions = await this.subscriptionModel.find().select('_id').lean();
    const queued = subscriptions.length;

    if (queued === 0) {
      await this.campaignModel.updateOne(
        { _id: campaign._id },
        { $set: { status: 'DONE', finishedAt: new Date() } },
      );
      return { id: campaign._id.toString(), queued: 0 };
    }

    await this.campaignModel.updateOne(
      { _id: campaign._id },
      { $set: { status: 'SENDING' }, $inc: { 'counters.queued': queued } },
    );

    await this.pushQueueService.enqueueCampaign(
      campaign._id.toString(),
      subscriptions.map((sub) => sub._id.toString()),
    );

    return { id: campaign._id.toString(), queued };
  }

  async getCampaign(id: string) {
    return this.campaignModel.findById(id).lean();
  }
}
