import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CampaignDocument = Campaign & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Campaign {
  @Prop({ required: true, enum: ['CREATED', 'SENDING', 'DONE'], default: 'CREATED' })
  status: 'CREATED' | 'SENDING' | 'DONE';

  @Prop({
    required: true,
    type: {
      title: { type: String, required: true },
      body: { type: String, required: true },
      icon: { type: String },
      url: { type: String },
      data: { type: MongooseSchema.Types.Mixed },
    },
  })
  payload: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    data?: Record<string, unknown>;
  };

  @Prop({
    required: true,
    type: {
      queued: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
  })
  counters: { queued: number; sent: number; failed: number };

  @Prop()
  finishedAt?: Date;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
