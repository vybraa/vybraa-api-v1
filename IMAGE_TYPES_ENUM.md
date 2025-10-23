# Image Types Enum Documentation

## Overview

The application now uses a centralized enum system for image types to ensure consistency and maintainability across both backend and frontend.

## Backend Enum (`src/common/enums/image.enum.ts`)

### ImageType Enum

```typescript
export enum ImageType {
  JPEG = 'image/jpeg',
  JPG = 'image/jpg',
  PNG = 'image/png',
  GIF = 'image/gif',
  WEBP = 'image/webp',
}
```

### ImageExtension Enum

```typescript
export enum ImageExtension {
  JPEG = 'jpg',
  JPG = 'jpg',
  PNG = 'png',
  GIF = 'gif',
  WEBP = 'webp',
}
```

### Constants

```typescript
export const ALLOWED_IMAGE_TYPES = [
  ImageType.JPEG,
  ImageType.JPG,
  ImageType.PNG,
  ImageType.GIF,
  ImageType.WEBP,
];

export const ALLOWED_IMAGE_EXTENSIONS = [
  ImageExtension.JPEG,
  ImageExtension.PNG,
  ImageExtension.GIF,
  ImageExtension.WEBP,
];
```

## Frontend Enum (`constants/ImageTypes.ts`)

The frontend uses the same enum structure to maintain consistency with the backend.

## Usage Throughout the Application

### 1. Cloudinary Service

- **File**: `src/common/cloudinary/cloudinary.service.ts`
- **Usage**: `allowed_formats: ALLOWED_IMAGE_EXTENSIONS`
- **Purpose**: Defines which image formats Cloudinary accepts for uploads

### 2. File Upload Interceptor

- **File**: `src/common/interceptors/file-upload.interceptor.ts`
- **Usage**: `ALLOWED_IMAGE_TYPES.includes(file.mimetype)`
- **Purpose**: Validates uploaded files against allowed MIME types

### 3. File Upload Decorator

- **File**: `src/common/decorators/file-upload.decorator.ts`
- **Usage**: `ALLOWED_IMAGE_TYPES.includes(file.mimetype)`
- **Purpose**: File filter validation in Multer configuration

### 4. Frontend Image Upload

- **File**: `app/(auth)/onboarding/celebrity-step2.tsx`
- **Usage**: `type: ImageType.JPEG`
- **Purpose**: Sets the correct MIME type when creating FormData for uploads

## Benefits of Using Enums

### 1. **Type Safety**

- Prevents typos in image type strings
- Provides IntelliSense and autocomplete
- Catches errors at compile time

### 2. **Centralized Management**

- Single source of truth for image types
- Easy to add/remove supported formats
- Consistent validation across the application

### 3. **Maintainability**

- Changes to supported formats only require enum updates
- No need to search and replace strings throughout the codebase
- Clear documentation of supported formats

### 4. **Validation Consistency**

- Same validation logic used in multiple places
- Ensures backend and frontend use identical type lists
- Reduces the chance of validation mismatches

## Supported Image Formats

| Format | MIME Type    | Extension | Description                            |
| ------ | ------------ | --------- | -------------------------------------- |
| JPEG   | `image/jpeg` | `.jpg`    | Standard JPEG format, widely supported |
| JPG    | `image/jpg`  | `.jpg`    | Alternative JPEG MIME type             |
| PNG    | `image/png`  | `.png`    | Lossless format, supports transparency |
| GIF    | `image/gif`  | `.gif`    | Animated images, limited color palette |
| WebP   | `image/webp` | `.webp`   | Modern format, better compression      |

## File Size Limits

- **Maximum Upload Size**: 5MB
- **Enforced In**: File upload decorator and interceptor
- **Purpose**: Prevents abuse and ensures reasonable upload times

## Security Features

### 1. **File Type Validation**

- Only allows predefined image MIME types
- Prevents malicious file uploads
- Consistent validation across all upload endpoints

### 2. **File Size Limits**

- Prevents large file uploads that could impact performance
- Protects against DoS attacks
- Configurable limit for different use cases

### 3. **Automatic Cleanup**

- Images deleted from Cloudinary when onboarding is reset
- Prevents orphaned files in cloud storage
- Maintains clean storage environment

## Future Enhancements

### 1. **Additional Formats**

- Easy to add new formats by updating the enum
- Consider adding AVIF, HEIC, or other modern formats
- Maintain backward compatibility

### 2. **Format-Specific Validation**

- Different size limits for different formats
- Format-specific transformation options
- Quality settings based on format

### 3. **Dynamic Format Support**

- Runtime configuration of supported formats
- Environment-based format restrictions
- User preference-based format selection

## Migration Notes

If you need to add or remove supported image formats:

1. **Update the enum** in both backend and frontend
2. **Update validation logic** in interceptors and decorators
3. **Update Cloudinary configuration** if needed
4. **Test file uploads** with new/removed formats
5. **Update documentation** and user guidelines

## Example Usage

### Backend

```typescript
import { ImageType, ALLOWED_IMAGE_TYPES } from '../enums/image.enum';

// Validate file type
if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
  throw new BadRequestException('Invalid file type');
}

// Use specific type
const mimeType = ImageType.JPEG;
```

### Frontend

```typescript
import { ImageType } from '@/constants/ImageTypes';

// Create file object
const imageFile = {
  uri: selectedImage.uri,
  type: ImageType.JPEG,
  name: 'profile-photo.jpg',
};
```

This enum system ensures that image handling is consistent, secure, and maintainable across the entire application.
