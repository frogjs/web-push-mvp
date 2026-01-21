import { Module } from '@nestjs/common';
import { VapidController } from './vapid.controller';
import { VapidService } from './vapid.service';

@Module({
  controllers: [VapidController],
  providers: [VapidService],
  exports: [VapidService],
})
export class VapidModule {}
