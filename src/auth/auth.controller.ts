import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAuthDto,
  RegisterDto,
  VerificationTokenDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SocialAuthDto,
  RefreshTokenDto,
  PasswordlessSignupDto,
  PasswordlessLoginDto,
  VerifyMagicLinkDto,
} from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Public } from 'src/decorators/auth.decorator';
import { UserDecorator } from 'src/decorators/user.decorator';
import { CelebrityProfile, User } from '@prisma/client';
import { FileUploadInterceptor } from 'src/common/interceptors/file-upload.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  async create(@Body() createAuthDto: RegisterDto) {
    return await this.authService.create(createAuthDto);
  }

  @Post('passwordless-signup')
  @Public()
  async passwordlessSignup(
    @Body() passwordlessSignupDto: PasswordlessSignupDto,
  ) {
    return await this.authService.passwordlessSignup(passwordlessSignupDto);
  }

  @Post('passwordless-login')
  @Public()
  async passwordlessLogin(@Body() passwordlessLoginDto: PasswordlessLoginDto) {
    return await this.authService.passwordlessLogin(passwordlessLoginDto.email);
  }

  @Post('verify-magic-link')
  @Public()
  async verifyMagicLink(@Body() verifyMagicLinkDto: VerifyMagicLinkDto) {
    return await this.authService.verifyMagicLink(verifyMagicLinkDto.token);
  }

  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @Public()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @Public()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Post('social-auth')
  @Public()
  async socialAuth(@Body() socialAuthDto: SocialAuthDto) {
    return await this.authService.socialAuth(socialAuthDto);
  }

  @Post('refresh-token')
  @Public()
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  async logout(@UserDecorator() user: User) {
    return await this.authService.logout(user);
  }

  @Post('verify-token')
  async verifyToken(
    @Body() body: VerificationTokenDto,
    @UserDecorator() user: User,
  ) {
    return await this.authService.verifyToken(body, user);
  }

  @Get('me')
  async getMe(@UserDecorator() user: User) {
    return await this.authService.getMe(user);
  }

  @Post('request-token')
  async requestToken(@UserDecorator() user: User) {
    return await this.authService.requestToken(user);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch('celebrity-profile')
  updateCelebrityProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body() celebrityProfile: CelebrityProfile,
    @UserDecorator() user: User,
  ) {
    return this.authService.updateCelebrityProfile(celebrityProfile, user);
  }

  @Patch()
  update(
    @Param('id') id: string,
    @Body() updateAuthDto: UpdateAuthDto,
    @UserDecorator() user: User,
  ) {
    return this.authService.update(+id, user, updateAuthDto);
  }

  @Patch('profile-photo')
  @UseInterceptors(FileUploadInterceptor)
  updateProfilePhoto(
    @UploadedFile() file: Express.Multer.File,

    @UserDecorator() user: User,
  ) {
    return this.authService.updateProfilePhoto(file, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

  // @Patch('celebrity-gallery')
  // @UseInterceptors(FileUploadInterceptor)
  // updateCelebrityGallery(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Body() celebrityGallery: CelebrityGallery,
  //   @UserDecorator() user: User,
  // ) {
  //   return this.authService.updateCelebrityGallery(celebrityGallery, user);
  // }
}
