import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { ALLOWED_IMAGE_EXTENSIONS } from '../enums/image.enum';
import { FolderEnum } from 'src/utils/enum';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'vybraa',
    transformation?: any[],
  ): Promise<UploadApiResponse> {
    try {
      // Convert buffer to base64 string
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const uploadOptions: any = {
        folder,
        resource_type: 'auto',
        allowed_formats: ALLOWED_IMAGE_EXTENSIONS,
        transformation: transformation || [
          { width: 800, height: 800, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      };

      const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

      return result;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadProfilePhoto(
    file: Express.Multer.File,
    userId: string,
    folder: FolderEnum = FolderEnum.PROFILE,
  ): Promise<UploadApiResponse> {
    const transformation = [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ];

    return this.uploadImage(file, `${folder}/${userId}`, transformation);
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  async getImageUrl(publicId: string, transformation?: any[]): Promise<string> {
    try {
      const url = cloudinary.url(publicId, {
        transformation: transformation || [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });
      return url;
    } catch (error) {
      throw new Error(`Failed to generate image URL: ${error.message}`);
    }
  }

  async optimizeImage(publicId: string, options: any = {}): Promise<string> {
    try {
      const defaultOptions = {
        width: 800,
        height: 800,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto',
        fetch_format: 'auto',
      };

      const url = cloudinary.url(publicId, {
        transformation: { ...defaultOptions, ...options },
      });
      return url;
    } catch (error) {
      throw new Error(`Failed to optimize image: ${error.message}`);
    }
  }

  async uploadVideo(
    file: Express.Multer.File,
    folder: string = 'vybraa/videos',
    transformation?: any[],
  ): Promise<UploadApiResponse> {
    try {
      // Convert buffer to base64 string
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const uploadOptions: any = {
        folder,
        resource_type: 'video',
        allowed_formats: ['mp4', 'mov', 'avi', 'wmv', 'webm', '3gp', 'flv'],
        transformation: transformation || [
          { quality: 'auto', fetch_format: 'auto' },
        ],
        chunk_size: 6000000, // 6MB chunks for large videos
        eager: [
          { width: 1280, height: 720, crop: 'scale', quality: 'auto' },
          { width: 854, height: 480, crop: 'scale', quality: 'auto' },
        ],
        eager_async: true,
      };

      const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

      return result;
    } catch (error) {
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  }

  async uploadRequestVideo(
    file: Express.Multer.File,
    requestId: string,
    folder: string = 'vybraa/request-videos',
  ): Promise<UploadApiResponse> {
    const transformation = [{ quality: 'auto', fetch_format: 'auto' }];

    return this.uploadVideo(file, `${folder}/${requestId}`, transformation);
  }

  async deleteVideo(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'video',
      });
    } catch (error) {
      throw new Error(`Failed to delete video: ${error.message}`);
    }
  }

  async getVideoUrl(publicId: string, transformation?: any[]): Promise<string> {
    try {
      const url = cloudinary.url(publicId, {
        resource_type: 'video',
        transformation: transformation || [
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });
      return url;
    } catch (error) {
      throw new Error(`Failed to generate video URL: ${error.message}`);
    }
  }
}
