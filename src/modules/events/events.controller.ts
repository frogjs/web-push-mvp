import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateClientEventDto } from './dto/create-client-event.dto';
import { EventsService } from './events.service';

@ApiTags('client-events')
@Controller('client-events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() dto: CreateClientEventDto) {
    return this.eventsService.createEvent(dto);
  }
}
