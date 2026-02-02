import { Body, Controller, Post } from '@nestjs/common';
import { SupportTicketService } from './support-ticket.service';
import { CreateSupportTicketDto } from './dtos/support-ticket.dto';
import { SupportTicket } from '@prisma/client';
import { Public } from 'src/decorators';

@Controller('support-ticket')
export class SupportTicketController {
  constructor(private readonly supportTicketService: SupportTicketService) {}

  @Post()
  @Public()
  async createSupportTicket(
    @Body() createSupportTicketDto: CreateSupportTicketDto,
  ): Promise<SupportTicket> {
    return this.supportTicketService.createSupportTicket(
      createSupportTicketDto,
    );
  }
}
