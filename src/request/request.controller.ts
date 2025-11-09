import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { RequestService } from './request.service';
import {
  CelebrityProfile,
  Requests,
  RequestStatus,
  Role,
  User,
} from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards';
import { ChangeRequestStatusDto, RequestsDto } from './dtos/requests.dto';
import { UserDecorator } from 'src/decorators';
import { CelebrityRequest, RequestSummary } from 'src/types/request';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoUploadInterceptor } from 'src/common/interceptors/video-upload.interceptor';

@Controller('requests')
@UseGuards(AuthGuard)
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Get()
  async findAll(
    @Query('status') status: RequestStatus,
    @Query('includeUnpaid') includeUnpaid: string,
    @Query('onlyUnpaid') onlyUnpaid: string,
    @UserDecorator() user: User & { celebrityProfile: CelebrityProfile },
  ): Promise<Array<Partial<CelebrityRequest>>> {
    const includeUnpaidBoolean = includeUnpaid === 'true';
    const onlyUnpaidBoolean = onlyUnpaid === 'true';
    return this.requestService.findAll(
      user,
      status,
      includeUnpaidBoolean,
      onlyUnpaidBoolean,
    );
  }

  @Get('payment-info/:id')
  async celebrityRequestPaymentInfo(
    @Param('id') id: string,
    @UserDecorator() user: User,
  ): Promise<
    {
      name: string;
      price: string;
      currency: string;
      duration: string;
    }[]
  > {
    return this.requestService.celebrityRequestPaymentInfo(id, user);
  }

  @Get('summary-requests')
  @Roles(Role.FAN)
  async requestSummary(
    @UserDecorator() user: User & { celebrityProfile: CelebrityProfile },
  ): Promise<RequestSummary> {
    return this.requestService.requestSummary(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Requests> {
    return this.requestService.findOne(id);
  }

  @Put(':id/status')
  @Roles(Role.CELEBRITY)
  async changeRequestStatus(
    @Param('id') id: string,
    @Body() request: ChangeRequestStatusDto,
    @UserDecorator() user: User & { celebrityProfile: CelebrityProfile },
  ) {
    return this.requestService.changeRequestStatus(id, request, user);
  }

  @Post()
  @Roles(Role.FAN)
  async create(@Body() request: RequestsDto, @UserDecorator() user: User) {
    return await this.requestService.create(request, user);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() request: Requests,
  ): Promise<Requests> {
    return this.requestService.update(id, request);
  }

  @Put(':id/video')
  @Roles(Role.CELEBRITY)
  @UseInterceptors(
    FileInterceptor('video', {
      limits: {
        fileSize: 15 * 1024 * 1024, // 15MB
      },
    }),
    VideoUploadInterceptor,
  )
  async updateVideo(
    @UserDecorator() user: User & { celebrityProfile: CelebrityProfile },
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; videoUrl: string; requestId: string }> {
    console.log('file', file);
    const updatedRequest = await this.requestService.updateVideo(
      id,
      file,
      user,
    );
    return {
      message: 'Video uploaded successfully',
      videoUrl: updatedRequest.videoUrl,
      requestId: updatedRequest.id,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.requestService.delete(id);
  }
}
