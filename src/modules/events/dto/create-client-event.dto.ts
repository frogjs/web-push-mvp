import { IsIn, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateClientEventDto {
  @IsIn(['CLICK', 'CLOSE'])
  type: 'CLICK' | 'CLOSE';

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  subscriptionEndpoint?: string;

  @IsOptional()
  @IsObject()
  notificationData?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  timestamp?: number;
}
