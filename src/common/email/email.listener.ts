import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';
import { Injectable, Logger } from '@nestjs/common';
import { EmailTemplateValueType } from 'src/types/email';

@Injectable()
export class EmailListener {
  private readonly logger = new Logger(EmailListener.name);
  constructor(private readonly emailService: EmailService) {}

  @OnEvent('email.notification')
  async handleEmailNotification(event: {
    toName: string;
    toEmail: string;
    templateId: keyof EmailTemplateValueType;
    params: any;
  }) {
    try {
      await this.emailService.sendEmailNotification(
        event.toName,
        event.toEmail,
        event.templateId,
        event.params,
      );
    } catch (error) {
      this.logger.error('Error sending email notification', error);
    }
  }
}
