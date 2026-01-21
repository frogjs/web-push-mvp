import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument } from '../subscriptions/subscription.schema';
import { CreateClientEventDto } from './dto/create-client-event.dto';
import { ClientEvent, ClientEventDocument } from './client-event.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(ClientEvent.name) private readonly eventModel: Model<ClientEventDocument>,
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async createEvent(dto: CreateClientEventDto) {
    let subscriptionId: Types.ObjectId | undefined;
    if (dto.subscriptionEndpoint) {
      const subscription = await this.subscriptionModel
        .findOne({ endpoint: dto.subscriptionEndpoint })
        .select('_id')
        .lean();
      if (subscription?._id) {
        subscriptionId = new Types.ObjectId(subscription._id.toString());
      }
    }

    const campaignIdRaw = dto.campaignId || dto.notificationData?.campaignId;
    const campaignId =
      typeof campaignIdRaw === 'string' && Types.ObjectId.isValid(campaignIdRaw)
        ? new Types.ObjectId(campaignIdRaw)
        : undefined;

    return this.eventModel.create({
      type: dto.type,
      campaignId,
      subscriptionId,
      raw: dto,
    });
  }
}
