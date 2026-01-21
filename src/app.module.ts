import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { EventsModule } from './modules/events/events.module';
import { QueueModule } from './modules/queue/queue.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { VapidModule } from './modules/vapid/vapid.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    VapidModule,
    SubscriptionsModule,
    CampaignsModule,
    EventsModule,
    QueueModule,
  ],
})
export class AppModule {}
