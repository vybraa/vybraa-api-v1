# Cloudinary Integration Setup

## Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Getting Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to your Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your `.env` file

## Features

- **Image Upload**: Automatic image optimization and transformation
- **Profile Photos**: 400x400 crop with face detection
- **File Validation**: JPEG, PNG, GIF, WebP support, 5MB limit
- **Automatic Cleanup**: Images deleted when onboarding is reset
- **CDN Delivery**: Fast global image delivery

## Usage

The Cloudinary service is automatically integrated into the onboarding flow:

- **Step 2**: Profile photo upload with automatic optimization
- **Image Storage**: Organized in `vybraa/profiles/{userId}` folders
- **Transformations**: Automatic resizing, cropping, and format optimization

## Security

- File type validation
- File size limits (5MB)
- Secure URL generation
- Automatic cleanup on reset
