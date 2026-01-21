import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Subscription, SubscriptionDocument } from './subscription.schema';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async upsertSubscription(dto: CreateSubscriptionDto) {
    return this.subscriptionModel.findOneAndUpdate(
      { endpoint: dto.endpoint },
      {
        $set: { endpoint: dto.endpoint, keys: dto.keys },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, new: true },
    );
  }

  async listSubscriptions() {
    return this.subscriptionModel.find().lean();
  }
}
