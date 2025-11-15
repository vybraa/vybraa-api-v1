import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { addMinutes } from 'date-fns';
import configuration from 'src/config/configuration';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  brevoTemplateConfig,
  generateEmailVerificationToken,
} from 'src/utils/helper';

@Injectable()
export class UserListener {
  private readonly logger = new Logger(UserListener.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  @OnEvent('verification.sent')
  async handleVerificationSent(event: {
    name: string;
    email: string;
    appName: string;
  }) {
    // handle and process "OrderCreatedEvent" event
    try {
      console.log('log', this.configService.get('brevo.apiUrl'));
      const verificationToken = await generateEmailVerificationToken();
      this.saveVerificationToken(verificationToken);
      console.log('log', verificationToken);
      const brevoPostMessage = {
        sender: {
          name: 'Vybraa Team',
          email: 'admin@vybraa.com',
        },
        to: [
          {
            name: event.name,
            email: event.email,
          },
        ],
        templateId: brevoTemplateConfig['Vybraa_Verify_Mail'],
        params: {
          name: event.name,
          appName: event.appName,
          verificationCode: verificationToken,
        },
      };
      console.log('log', brevoPostMessage);
      const responseObj = await this.httpService.axiosRef.post(
        `${this.configService.get('brevo.apiUrl')}/smtp/email`,
        brevoPostMessage,
        {
          headers: {
            'api-key': this.configService.get('brevo.apiSecret'),
            'content-type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      this.logger.log('log response', responseObj.data);
      this.logger.log(`Email Verification sent to ${event.email}`);
    } catch (err) {
      this.logger.error(
        `An error occured while sending verification token ${err}`,
      );
      console.error(err);
    }
  }

  @OnEvent('password.reset.sent')
  async handlePasswordResetSent(event: {
    name: string;
    email: string;
    resetToken: string;
    appName: string;
  }) {
    try {
      console.log('Sending password reset email to:', event.email);
      const brevoPostMessage = {
        sender: {
          name: 'DIT Team',
          email: 'no-reply@dit.com',
        },
        to: [
          {
            name: event.name,
            email: event.email,
          },
        ],
        templateId: brevoTemplateConfig['Dit_Password_Reset_Mail'],
        params: {
          name: event.name,
          appName: event.appName,
          resetToken: event.resetToken,
          resetUrl: `${this.configService.get('FRONTEND_URL')}/reset-password?token=${event.resetToken}`,
        },
      };

      const responseObj = await this.httpService.axiosRef.post(
        `${this.configService.get('brevo.apiUrl')}/smtp/email`,
        brevoPostMessage,
        {
          headers: {
            'api-key': this.configService.get('brevo.apiSecret'),
            'content-type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      this.logger.log('Password reset email response:', responseObj.data);
      this.logger.log(`Password reset email sent to ${event.email}`);
    } catch (err) {
      this.logger.error(
        'An error occurred while sending password reset email',
        err,
      );
    }
  }

  @OnEvent('magic.link.sent')
  async handleMagicLinkSent(event: {
    email: string;
    token: string;
    appName: string;
  }) {
    try {
      console.log('Sending magic link email to:', event.email);
    } catch (err) {
      this.logger.error(
        'An error occurred while sending magic link email',
        err,
      );
    }
  }

  async saveVerificationToken(token: string) {
    const ttl = addMinutes(new Date(), 15); // token expires in 15 minutes

    await this.prisma.verifyToken.create({
      data: {
        token,
        ttl,
      },
    });
  }

  @OnEvent('wallet.created')
  async createWallet(userId: string) {
    //find currency by name
    const currency = await this.prisma.currency.findFirst({
      where: {
        code: 'USD',
      },
    });
    if (currency) {
      //create wallet
      await this.prisma.wallet.create({
        data: {
          userId,
          walletBalance: 0,
          currencyId: currency.id,
          isActive: true,
          isFreezed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  @OnEvent('ip.address.country.updated')
  async updateIpAddressCountry(userId: string, userIp: string) {
    console.log('Test ip address of anouther country', userIp);

    const url = `${configuration().ipinfoUrl}/${userIp}/json?token=${configuration().ipinfoToken}`;

    const response = await this.httpService.axiosRef.get(url);

    const country = response.data?.country?.toLowerCase() || '';
    // const ipInfo = {
    //   data: {
    //     ip: '8.8.8.8',
    //     city: 'Mountain View',
    //     region: 'California',
    //     country: 'US',
    //     loc: '37.4056,-122.0775',
    //     org: 'AS15169 Google LLC',
    //     timezone: 'America/Los_Angeles',
    //   },
    // };

    // console.log('ipInfo', ipInfo.data);
    await this.prisma.user.update({
      where: { id: userId },
      data: { ipAddressCountry: country },
    });
  }
}
