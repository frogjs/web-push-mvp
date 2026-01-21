import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Queue } from 'bullmq';
import { Campaign, CampaignSchema } from '../campaigns/campaign.schema';
import { Subscription, SubscriptionSchema } from '../subscriptions/subscription.schema';
import { VapidModule } from '../vapid/vapid.module';
import { DeliveryLog, DeliveryLogSchema } from './delivery-log.schema';
import { PushQueueService } from './push-queue.service';
import { PushWorkerService } from './push-worker.service';
import { PUSH_QUEUE_NAME, PUSH_QUEUE_TOKEN } from './queue.constants';

@Module({
  imports: [
    VapidModule,
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: DeliveryLog.name, schema: DeliveryLogSchema },
    ]),
  ],
  providers: [
    {
      provide: PUSH_QUEUE_TOKEN,
      useFactory: (configService: ConfigService) => {
        return new Queue(PUSH_QUEUE_NAME, {
          connection: {
            host: configService.get<string>('REDIS_HOST') || 'redis',
            port: Number(configService.get<string>('REDIS_PORT') || 6379),
          },
        });
      },
      inject: [ConfigService],
    },
    PushQueueService,
    PushWorkerService,
  ],
  exports: [PushQueueService],
})
export class QueueModule {}
