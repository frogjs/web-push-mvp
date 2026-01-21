import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Subscription {
  @Prop({ required: true, unique: true })
  endpoint: string;

  @Prop({
    required: true,
    type: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  })
  keys: { p256dh: string; auth: string };
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
SubscriptionSchema.index({ endpoint: 1 }, { unique: true });
