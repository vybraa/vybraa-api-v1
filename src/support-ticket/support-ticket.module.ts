import { JwtService } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { Module } from '@nestjs/common';
import { SupportTicketService } from './support-ticket.service';
import { SupportTicketController } from './support-ticket.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SupportTicketController],
  providers: [SupportTicketService, JwtService],
  exports: [SupportTicketService],
})
export class SupportTicketModule {}
