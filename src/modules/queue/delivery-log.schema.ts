import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeliveryLogDocument = DeliveryLog & Document;

@Schema({ timestamps: { createdAt: false, updatedAt: false } })
export class DeliveryLog {
  @Prop({ type: Types.ObjectId, required: true })
  campaignId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  subscriptionId: Types.ObjectId;

  @Prop({ required: true, enum: ['SENT', 'FAILED'] })
  status: 'SENT' | 'FAILED';

  @Prop()
  error?: string;

  @Prop({ default: Date.now })
  sentAt: Date;
}

export const DeliveryLogSchema = SchemaFactory.createForClass(DeliveryLog);
