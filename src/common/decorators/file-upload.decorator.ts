import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadInterceptor } from '../interceptors/file-upload.interceptor';
import { ALLOWED_IMAGE_TYPES } from '../enums/image.enum';

export function UploadFile(fieldName: string = 'file') {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: undefined, // Use memory storage for Cloudinary
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
          console.log(
            'File filter: checking file:',
            file.originalname,
            file.mimetype,
          );
          if (ALLOWED_IMAGE_TYPES.includes(file.mimetype as any)) {
            cb(null, true);
          } else {
            cb(new Error('Invalid file type'), false);
          }
        },
      }),
      FileUploadInterceptor,
    ),
  );
}
