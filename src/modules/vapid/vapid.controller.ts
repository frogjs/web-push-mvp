import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VapidService } from './vapid.service';

@ApiTags('vapid')
@Controller('vapid')
export class VapidController {
  constructor(private readonly vapidService: VapidService) {}

  @Get('public-key')
  getPublicKey() {
    return { publicKey: this.vapidService.getPublicKey() };
  }
}
