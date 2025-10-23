import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateValueType } from 'src/types/email';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async sendEmailNotification<T extends keyof EmailTemplateValueType>(
    toName: string,
    toEmail: string,
    templateId: T,
    property: EmailTemplateValueType[T],
  ): Promise<void> {
    const brevoPostMessage = {
      sender: {
        name: this.configService.get('brevo.name'),
        email: this.configService.get('brevo.email'),
      },
      templateId: templateId,
      params: property,
      to: [{ name: toName, email: toEmail }],
    };
    this.logger.log('brevoPostMessage', brevoPostMessage);

    try {
      const responseObj = await this.httpService.axiosRef.post(
        `${this.configService.get('brevo.apiUrl')}/smtp/email`,
        brevoPostMessage,
        {
          headers: {
            'api-key': this.configService.get('brevo.apiSecret'),
          },
        },
      );
      this.logger.log('Email sent successfully', responseObj.data);
    } catch (error) {
      this.logger.error('Error sending email', error);
      throw new Error('Error sending email');
    }
  }
}
