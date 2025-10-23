# API Throttling Implementation

This API now includes rate limiting to prevent abuse and ensure fair usage.

## Current Implementation

### 1. Basic Rate Limiting (main.ts)

- **Rate Limit**: 100 requests per minute per IP address
- **Window**: 1 minute sliding window
- **Storage**: In-memory (resets on server restart)
- **Response**: HTTP 429 (Too Many Requests) with retry-after header

### 2. NestJS Throttler Module

- **Package**: `@nestjs/throttler`
- **Configuration**: Multiple throttling tiers
  - Short: 10 requests per second
  - Medium: 100 requests per minute
  - Long: 1000 requests per hour
- **Global Guard**: Applied to all endpoints

## Usage

### Default Throttling

All endpoints are automatically rate-limited based on IP address.

### Custom Throttling

You can apply custom throttling to specific endpoints:

```typescript
import { Throttle, SkipThrottle } from './common/throttler';

@Controller('auth')
export class AuthController {
  // Custom throttling: 5 requests per minute
  @Throttle({ ttl: 60000, limit: 5 })
  @Post('login')
  async login() {
    // ...
  }

  // Skip throttling for this endpoint
  @SkipThrottle()
  @Get('health')
  async health() {
    // ...
  }
}
```

## Configuration

### Environment Variables

You can customize throttling limits by setting environment variables:

```env
# Rate limiting configuration
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Throttler Module Configuration

The throttler module can be configured in `src/common/throttler/throttler.module.ts`:

```typescript
throttlers: [
  {
    name: 'short',
    ttl: 1000, // 1 second
    limit: 10, // 10 requests per second
  },
  {
    name: 'medium',
    ttl: 60000, // 1 minute
    limit: 100, // 100 requests per minute
  },
  {
    name: 'long',
    ttl: 3600000, // 1 hour
    limit: 1000, // 1000 requests per hour
  },
];
```

## Monitoring

### Rate Limit Headers

The API includes rate limit headers in responses:

- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

### Logging

Rate limit violations are logged for monitoring purposes.

## Best Practices

1. **Use appropriate limits** for different endpoint types
2. **Monitor rate limit violations** to identify abuse patterns
3. **Consider user authentication** for more granular rate limiting
4. **Implement exponential backoff** for retry logic
5. **Use Redis** for distributed rate limiting in production

## Production Considerations

For production environments, consider:

1. **Redis Storage**: Replace in-memory storage with Redis for distributed deployments
2. **User-based Limiting**: Implement rate limiting based on user ID or API key
3. **Different Limits**: Apply different limits for authenticated vs anonymous users
4. **Monitoring**: Integrate with monitoring tools to track rate limit usage
5. **Whitelisting**: Add IP whitelist for trusted clients
