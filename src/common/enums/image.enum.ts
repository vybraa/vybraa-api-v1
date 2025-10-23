export enum ImageType {
  JPEG = 'image/jpeg',
  JPG = 'image/jpg',
  PNG = 'image/png',
  GIF = 'image/gif',
  WEBP = 'image/webp',
}

export enum ImageExtension {
  JPEG = 'jpg',
  JPG = 'jpg',
  PNG = 'png',
  GIF = 'gif',
  WEBP = 'webp',
}

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
