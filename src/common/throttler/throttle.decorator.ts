import { SetMetadata } from '@nestjs/common';

export const THROTTLE_KEY = 'throttle';
export const SKIP_THROTTLE_KEY = 'skipThrottle';

export interface ThrottleOptions {
  name?: string;
  ttl?: number;
  limit?: number;
}

export const Throttle = (options: ThrottleOptions) =>
  SetMetadata(THROTTLE_KEY, options);
export const SkipThrottle = () => SetMetadata(SKIP_THROTTLE_KEY, true);
