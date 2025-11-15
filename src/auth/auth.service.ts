import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  RegisterDto,
  VerificationTokenDto,
  LoginDto,
  SocialAuthDto,
  PasswordlessSignupDto,
} from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CelebrityGallery, CelebrityProfile, User } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { randomBytes } from 'crypto';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { FolderEnum } from 'src/utils/enum';
import configuration from 'src/config/configuration';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private httpService: HttpService,
    private cloudinaryService: CloudinaryService,
  ) {}

  private activityLogsService: any; // Will be injected lazily to avoid circular dependency

  /**
   * Log activity (lazy-loaded to avoid circular dependency)
   */
  private async logActivity(data: any) {
    try {
      if (!this.activityLogsService) {
        const { ActivityLogsService } = await import(
          '../activity-logs/activity-logs.service'
        );
        this.activityLogsService = new ActivityLogsService(this.prisma);
      }
      await this.activityLogsService.create(data);
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - logging should not break main flow
    }
  }

  async create(signupDto: RegisterDto) {
    // For traditional registration, we still need a password
    // This method is kept for backward compatibility
    throw new BadRequestException(
      'Please use passwordless-signup endpoint for new registrations',
    );
  }

  async login(loginDto: LoginDto, realIp: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await argon2.verify(
        user.password,
        loginDto.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isVerified) {
        // Resend verification email
        this.eventEmitter.emit('verification.sent', {
          name: user.firstName,
          email: user.email,
          appName: 'VYBRAA',
        });
        throw new BadRequestException('Please verify your email first');
      }

      this.eventEmitter.emit('ip.address.country.updated', user.id, realIp);

      // Log login activity
      // await this.logActivity({
      //   userId: user.id,
      //   action: 'USER_LOGIN',
      //   actionDescription: `User ${user.email} logged in`,
      //   ipAddress: loginDto.ipAddress,
      //   userAgent: loginDto.userAgent,
      //   metadata: {
      //     email: user.email,
      //     userType: user.userType,
      //     loginTime: new Date().toISOString(),
      //   },
      // });

      const jwtSecret = this.configService.get<string>('AUTH_JWT_SECRET');
      const token = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
        },
        { secret: jwtSecret, expiresIn: '24h' },
      );

      // Generate refresh token
      const refreshToken = await this.generateRefreshToken(user.id);

      return {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          isVerified: user.isVerified,
        },
        accessToken: token,
        refreshToken,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.log('Login error:', error);
      throw new InternalServerErrorException('Login failed');
    }
  }

  async socialAuth(socialAuthDto: SocialAuthDto) {
    try {
      let socialUserData;

      // Verify the social token and get user data
      switch (socialAuthDto.provider) {
        case 'google':
          socialUserData = await this.verifyGoogleToken(
            socialAuthDto.accessToken,
          );
          break;
        case 'facebook':
          socialUserData = await this.verifyFacebookToken(
            socialAuthDto.accessToken,
          );
          break;
        case 'apple':
          socialUserData = await this.verifyAppleToken(
            socialAuthDto.accessToken,
          );
          break;
        default:
          throw new BadRequestException('Unsupported social provider');
      }

      // Check if user exists
      let user = await this.prisma.user.findUnique({
        where: { email: socialUserData.email },
      });

      if (!user) {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email: socialUserData.email,
            firstName:
              socialUserData.firstName || socialAuthDto.firstName || 'User',
            lastName: socialUserData.lastName || socialAuthDto.lastName || '',
            isVerified: true, // Social auth users are pre-verified
            password: '', // No password for social auth users
          },
        });
      }

      const jwtSecret = this.configService.get<string>('AUTH_JWT_SECRET');
      const token = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          isVerified: user.isVerified,
        },
        { secret: jwtSecret, expiresIn: '24h' },
      );

      // Generate refresh token
      const refreshToken = await this.generateRefreshToken(user.id);

      return {
        message: 'Social authentication successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          isVerified: user.isVerified,
        },
        accessToken: token,
        refreshToken,
      };
    } catch (error) {
      console.log('Social auth error:', error);
      throw new InternalServerErrorException('Social authentication failed');
    }
  }

  private async verifyGoogleToken(accessToken: string) {
    try {
      const response = await this.httpService.axiosRef.get(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`,
      );

      return {
        email: response.data.email,
        firstName: response.data.given_name,
        lastName: response.data.family_name,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  private async verifyFacebookToken(accessToken: string) {
    try {
      const response = await this.httpService.axiosRef.get(
        `https://graph.facebook.com/me?fields=id,email,first_name,last_name&access_token=${accessToken}`,
      );

      return {
        email: response.data.email,
        firstName: response.data.first_name,
        lastName: response.data.last_name,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Facebook token');
    }
  }

  private async verifyAppleToken(accessToken: string) {
    // Apple token verification is more complex and requires JWT verification
    // This is a simplified version - in production you'd need proper JWT verification
    try {
      // For now, we'll assume the token is valid and extract user info from the request
      // In a real implementation, you'd verify the JWT signature and extract claims
      return {
        email: '', // Apple doesn't always provide email
        firstName: '',
        lastName: '',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Apple token');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // Find refresh token in database
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if token has expired
      if (storedToken.expiresAt < new Date()) {
        // Delete expired token
        await this.prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
        throw new UnauthorizedException('Refresh token has expired');
      }

      const user = storedToken.user;
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new access token
      const jwtSecret = this.configService.get<string>('AUTH_JWT_SECRET');
      const newToken = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          isVerified: user.isVerified,
        },
        { secret: jwtSecret, expiresIn: '24h' },
      );

      return {
        accessToken: newToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          isVerified: user.isVerified,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          message: 'If the email exists, a password reset link has been sent',
        };
      }

      const resetToken = this.generateResetToken();
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Save reset token to database with email association
      await this.prisma.resetToken.create({
        data: {
          token: resetToken,
          email: email,
          ttl: resetTokenExpiry,
        },
      });

      // Send password reset email
      this.eventEmitter.emit('password.reset.sent', {
        name: user.firstName,
        email: user.email,
        resetToken,
        appName: 'VYBRAA',
      });

      return { message: 'Password reset email sent' };
    } catch (error) {
      console.log('Forgot password error:', error);
      throw new InternalServerErrorException(
        'Failed to process password reset',
      );
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const resetToken = await this.prisma.resetToken.findFirst({
        where: { token },
      });

      if (!resetToken) {
        throw new BadRequestException('Invalid reset token');
      }

      if (resetToken.ttl < new Date()) {
        throw new BadRequestException('Reset token has expired');
      }

      // Hash new password
      const hashedPassword = await argon2.hash(newPassword);

      // Update user password
      await this.prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      });

      // Delete used token
      await this.prisma.resetToken.delete({
        where: { id: resetToken.id },
      });

      return { message: 'Password reset successful' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.log('Reset password error:', error);
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  private generateResetToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    // Generate a secure random token
    const token = randomBytes(32).toString('hex');

    // Store in database with 30 days expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async verifyToken(body: VerificationTokenDto, user: User) {
    try {
      const tokenExist = await this.prisma.verifyToken.findFirst({
        where: {
          token: body.token,
        },
      });

      if (tokenExist) {
        const now = new Date();

        if (tokenExist.ttl < now) {
          throw new BadRequestException('Token has expired');
        }

        await this.prisma.user.update({
          where: {
            email: user.email,
          },
          data: {
            isVerified: true, // Or any field you're updating
          },
        });

        // Optionally delete the used token
        await this.prisma.verifyToken.delete({
          where: {
            id: tokenExist.id,
          },
        });

        //get user by id include celebrityProfile
        const getUser = await this.prisma.user.findUnique({
          where: {
            id: user.id,
          },
          include: {
            celebrityProfile: true,
          },
        });

        // access token
        const jwtSecret = this.configService.get<string>('AUTH_JWT_SECRET');
        const accessToken = this.jwtService.sign(
          {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            userType: user.userType,
            isVerified: getUser.isVerified,
            celebrityProfile: getUser.celebrityProfile,
          },
          { secret: jwtSecret, expiresIn: '24h' },
        );

        // Generate refresh token
        const refreshToken = await this.generateRefreshToken(user.id);

        // Determine onboarding status and next step
        let onboardingInfo = null;
        if (getUser.userType === 'CELEBRITY') {
          if (getUser.celebrityProfile) {
            // User has started onboarding, check current step
            onboardingInfo = {
              hasStartedOnboarding: true,
              currentStep: getUser.celebrityProfile.onboardingStep,
              isOnboardingComplete:
                getUser.celebrityProfile.isOnboardingComplete,
              nextStep: getUser.celebrityProfile.onboardingStep + 1,
            };
          } else {
            // User hasn't started onboarding yet
            onboardingInfo = {
              hasStartedOnboarding: false,
              currentStep: 0,
              isOnboardingComplete: false,
              nextStep: 1,
            };
          }
        }

        return {
          success: true,
          accessToken,
          refreshToken,
          user: {
            id: getUser.id,
            email: getUser.email,
            firstName: getUser.firstName,
            lastName: getUser.lastName,
            userType: getUser.userType,
            isVerified: getUser.isVerified,
            celebrityProfile: getUser.celebrityProfile,
          },
          onboardingInfo,
        };
      }

      throw new BadRequestException('Token is not valid');
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.log('error:', error);
      throw new InternalServerErrorException();
    }
  }

  async getMe(user: User) {
    try {
      const userDetail = await this.prisma.user.findFirst({
        where: {
          id: user.id,
        },
        include: {
          celebrityProfile: true,
        },
      });

      if (!userDetail) {
        throw new BadRequestException('Not a valid User');
      }

      return {
        ...userDetail,
        password: undefined,
        createdAt: undefined,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.log('error:', error);
      throw new InternalServerErrorException();
    }
  }

  async requestToken(user: User) {
    const appName = 'VYBRAA';
    this.eventEmitter.emit('verification.sent', {
      name: user.firstName,
      email: user.email,
      appName,
    });

    return {
      success: true,
    };
  }

  async logout(user: User) {
    // Delete all refresh tokens for this user
    await this.prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    return { message: 'Logged out successfully' };
  }

  async passwordlessSignup(signupDto: PasswordlessSignupDto, realIp: string) {
    try {
      // Check if user exists by email
      const existingUser = await this.prisma.user.findUnique({
        where: { email: signupDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      // Create user without password
      const newUser = await this.prisma.user.create({
        data: {
          email: signupDto.email,
          firstName: signupDto.firstName,
          lastName: signupDto.lastName,
          password: '', // No password for passwordless auth
          isVerified: false,
        },
      });

      // Generate magic link token
      // const magicLinkToken = this.generateMagicLinkToken();
      // const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // // Store magic link token
      // await this.prisma.magicLinkToken.create({
      //   data: {
      //     token: magicLinkToken,
      //     email: signupDto.email,
      //     ttl: tokenExpiry,
      //     type: 'SIGNUP',
      //   },
      // });

      // Send magic link email
      this.eventEmitter.emit('verification.sent', {
        name: signupDto.firstName,
        email: signupDto.email,
        appName: 'VYBRAA',
      });

      this.eventEmitter.emit('ip.address.country.updated', newUser.id, realIp);

      // Generate JWT token for immediate use (optional)
      const jwtSecret = this.configService.get<string>('auth.jwt.secret');
      const accessToken = this.jwtService.sign(
        {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          userType: newUser.userType,
          isVerified: newUser.isVerified,
        },
        { secret: jwtSecret, expiresIn: '24h' },
      );

      // Generate refresh token
      const refreshToken = await this.generateRefreshToken(newUser.id);

      return {
        message:
          'Magic link sent to your email. Please check your inbox and click the link to complete your registration.',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          userType: newUser.userType,
          isVerified: newUser.isVerified,
        },
        accessToken, // Return token for immediate authentication
        refreshToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.log('Passwordless signup error:', error);
      throw new InternalServerErrorException('Passwordless signup failed');
    }
  }

  async passwordlessLogin(email: string, realIp: string) {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new BadRequestException('User not found. Please sign up first.');
      }

      // Generate magic link token
      // const magicLinkToken = this.generateMagicLinkToken();
      // const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // // Store magic link token
      // await this.prisma.magicLinkToken.create({
      //   data: {
      //     token: magicLinkToken,
      //     email: email,
      //     ttl: tokenExpiry,
      //     type: 'LOGIN',
      //   },
      // });

      // Send magic link email
      this.eventEmitter.emit('verification.sent', {
        name: user.firstName,
        email: user.email,
        appName: 'VYBRAA',
      });

      this.eventEmitter.emit('ip.address.country.updated', user.id, realIp);
      const jwtSecret = this.configService.get<string>('auth.jwt.secret');
      const accessToken = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          isVerified: user.isVerified,
        },
        { secret: jwtSecret, expiresIn: '24h' },
      );

      // Generate refresh token
      const refreshToken = await this.generateRefreshToken(user.id);

      return {
        message:
          'Magic link sent to your email. Please check your inbox and click the link to log in.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.log('Passwordless login error:', error);
      throw new InternalServerErrorException('Passwordless login failed');
    }
  }

  async verifyMagicLink(token: string) {
    try {
      // Find magic link token
      const magicLinkToken = await this.prisma.magicLinkToken.findFirst({
        where: { token },
      });

      if (!magicLinkToken) {
        throw new BadRequestException('Invalid magic link token');
      }

      if (magicLinkToken.ttl < new Date()) {
        throw new BadRequestException('Magic link has expired');
      }

      // Get user
      const user = await this.prisma.user.findUnique({
        where: { email: magicLinkToken.email },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // If this is a signup verification, mark user as verified
      if (magicLinkToken.type === 'SIGNUP' && !user.isVerified) {
        await this.prisma.user.update({
          where: { email: user.email },
          data: { isVerified: true },
        });
        user.isVerified = true;
      }

      // Generate JWT token
      const jwtSecret = this.configService.get<string>('AUTH_JWT_SECRET');
      const accessToken = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          isVerified: user.isVerified,
        },
        { secret: jwtSecret, expiresIn: '24h' },
      );

      // Generate refresh token
      const refreshToken = await this.generateRefreshToken(user.id);

      // Delete used magic link token
      await this.prisma.magicLinkToken.delete({
        where: { id: magicLinkToken.id },
      });

      return {
        message:
          magicLinkToken.type === 'SIGNUP'
            ? 'Account verified successfully'
            : 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.log('Magic link verification error:', error);
      throw new InternalServerErrorException('Magic link verification failed');
    }
  }

  private generateMagicLinkToken(): string {
    return randomBytes(32).toString('hex');
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, user: User, updateAuthDto: UpdateAuthDto) {
    const data: UpdateAuthDto = {
      firstName: updateAuthDto.firstName,
      lastName: updateAuthDto.lastName,
    };
    return this.prisma.user.update({
      where: { id: user.id },
      data: data,
    });
  }

  async updateProfilePhoto(file: Express.Multer.File, user: User) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload file to Cloudinary
    console.log('Backend: Uploading file to Cloudinary');
    const uploadResult = await this.cloudinaryService.uploadProfilePhoto(
      file,
      user.id,
      FolderEnum.PROFILE,
    );
    console.log('Backend: File uploaded to Cloudinary successfully');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { profilePhotoUrl: uploadResult.secure_url },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async updateCelebrityProfile(updateAuthDto: CelebrityProfile, user: User) {
    console.log('Backend: Updating celebrity profile:', updateAuthDto);
    const data: Partial<CelebrityProfile> = {
      legalName: updateAuthDto.legalName || undefined,
      displayName: updateAuthDto.displayName || undefined,
      dateOfBirth: updateAuthDto.dateOfBirth || undefined,
      countryCodeId: updateAuthDto.countryCodeId || undefined,
      phoneNumber: updateAuthDto.phoneNumber || undefined,
      countryOfResidence: updateAuthDto.countryOfResidence || undefined,
      primarySocialPlatform: updateAuthDto.primarySocialPlatform || undefined,
      socialHandle: updateAuthDto.socialHandle || undefined,
      followers: updateAuthDto.followers || undefined,
      profession: updateAuthDto.profession || undefined,
      requestPrice: updateAuthDto.requestPrice || undefined,
      managerName: updateAuthDto.managerName || undefined,
      managerPhone: updateAuthDto.managerPhone || undefined,
      additionalDescription: updateAuthDto.additionalDescription || undefined,
    };

    console.log('Backend: Updating celebrity profile:', data);

    await this.prisma.celebrityProfile.update({
      where: { userId: user.id },
      data,
    });

    return {
      message: 'Celebrity profile updated successfully',
      data,
    };
  }

  async updateCelebrityGallery(
    file: Express.Multer.File,
    celebrityGallery: CelebrityGallery,
    user: User,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload file to Cloudinary
    console.log('Backend: Uploading file to Cloudinary');
    const uploadResult = await this.cloudinaryService.uploadProfilePhoto(
      file,
      user.id,
      FolderEnum.CELEBRITY_PROFILE,
    );
    console.log('Backend: File uploaded to Cloudinary successfully');
    const data: Partial<CelebrityGallery> = {
      videoUrl: celebrityGallery.videoUrl || undefined,
      imageUrl: celebrityGallery.imageUrl || undefined,
    };

    const celebrityProfile = await this.prisma.celebrityProfile.findUnique({
      where: { userId: user.id },
    });

    if (!celebrityProfile) {
      throw new BadRequestException('Celebrity profile not found');
    }

    await this.prisma.celebrityGallery.create({
      data: {
        celebrityProfileId: celebrityProfile.id,
        videoUrl: celebrityGallery.videoUrl || undefined,
        imageUrl: celebrityGallery.imageUrl || undefined,
      },
    });
    return {
      message: 'Celebrity gallery updated successfully',
      data,
    };
  }
}
