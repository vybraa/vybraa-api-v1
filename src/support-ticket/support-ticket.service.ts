import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportTicketDto } from './dtos/support-ticket.dto';
import { SupportTicket, SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from '@prisma/client';

@Injectable()
export class SupportTicketService {
  constructor(private readonly prisma: PrismaService) {}

  async createSupportTicket(
    createSupportTicketDto: CreateSupportTicketDto,
  ): Promise<SupportTicket> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: createSupportTicketDto.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.supportTicket.create({
      data: {
        subject: createSupportTicketDto.subject || "Support Ticket",
        description: createSupportTicketDto.description || "No description provided",
        priority: createSupportTicketDto.priority || SupportTicketPriority.LOW,
        category: createSupportTicketDto.category || SupportTicketCategory.GENERAL_SUPPORT,
        status: SupportTicketStatus.OPEN,
        userId: user.id,
      },
    });
  }
}
