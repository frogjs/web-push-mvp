import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ClientEventDocument = ClientEvent & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class ClientEvent {
  @Prop({ required: true, enum: ['CLICK', 'CLOSE'] })
  type: 'CLICK' | 'CLOSE';

  @Prop({ type: Types.ObjectId })
  campaignId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  subscriptionId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed })
  raw?: Record<string, unknown>;
}

export const ClientEventSchema = SchemaFactory.createForClass(ClientEvent);
