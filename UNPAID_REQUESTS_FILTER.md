# Unpaid Requests Filter

This document describes the new filter functionality for including unpaid requests in the `findAll` method of the Request Service.

## Overview

The `findAll` method in the Request Service now supports an optional `includeUnpaid` parameter that allows filtering requests based on their payment status.

## API Changes

### Request Service Method

```typescript
async findAll(
  user: User & { celebrityProfile: CelebrityProfile },
  status: RequestStatus,
  includeUnpaid: boolean = false,
  onlyUnpaid: boolean = false,
): Promise<Array<Partial<CelebrityRequest>>>
```

### Request Controller Endpoint

```typescript
@Get()
async findAll(
  @Query('status') status: RequestStatus,
  @Query('includeUnpaid') includeUnpaid: string,
  @Query('onlyUnpaid') onlyUnpaid: string,
  @UserDecorator() user: User & { celebrityProfile: CelebrityProfile },
): Promise<Array<Partial<CelebrityRequest>>>
```

## Usage

### Default Behavior (Paid Requests Only)

```bash
GET /requests?status=PENDING
```

Returns only requests where `isRequestPaid = true`

### Include Unpaid Requests

```bash
GET /requests?status=PENDING&includeUnpaid=true
```

Returns all requests regardless of payment status

### Show Only Unpaid Requests

```bash
GET /requests?status=PENDING&onlyUnpaid=true
```

Returns only requests where `isRequestPaid = false`

### Exclude Unpaid Requests (Explicit)

```bash
GET /requests?status=PENDING&includeUnpaid=false
```

Returns only requests where `isRequestPaid = true`

## Implementation Details

### For Celebrities

- When `includeUnpaid = false` and `onlyUnpaid = false` (default): Only shows paid requests
- When `includeUnpaid = true`: Shows all requests regardless of payment status
- When `onlyUnpaid = true`: Shows only unpaid requests

### For Fans

- When `includeUnpaid = false` and `onlyUnpaid = false` (default): Only shows paid requests
- When `includeUnpaid = true`: Shows all requests regardless of payment status
- When `onlyUnpaid = true`: Shows only unpaid requests

## Use Cases

### 1. Celebrity Dashboard

- **Default view**: Show only paid requests that need attention
- **Admin view**: Show all requests including unpaid ones for monitoring

### 2. Fan Dashboard

- **Default view**: Show only paid requests in their history
- **Pending view**: Show all pending requests including unpaid ones

### 3. Background Jobs

- **Payment cleanup**: Include unpaid requests to process timeouts
- **Monitoring**: Track all requests regardless of payment status

## Query Parameters

| Parameter       | Type          | Default  | Description                                   |
| --------------- | ------------- | -------- | --------------------------------------------- |
| `status`        | RequestStatus | Required | Filter by request status                      |
| `includeUnpaid` | string        | 'false'  | Include unpaid requests ('true' or 'false')   |
| `onlyUnpaid`    | string        | 'false'  | Show only unpaid requests ('true' or 'false') |

## Examples

### Get all pending requests (paid only)

```bash
curl "https://api.vybraa.com/requests?status=PENDING"
```

### Get all pending requests (including unpaid)

```bash
curl "https://api.vybraa.com/requests?status=PENDING&includeUnpaid=true"
```

### Get completed requests (paid only)

```bash
curl "https://api.vybraa.com/requests?status=COMPLETED"
```

### Get all declined requests (including unpaid)

```bash
curl "https://api.vybraa.com/requests?status=DECLINED&includeUnpaid=true"
```

### Get only unpaid pending requests

```bash
curl "https://api.vybraa.com/requests?status=PENDING&onlyUnpaid=true"
```

## Backward Compatibility

This change is fully backward compatible:

- Existing API calls without the `includeUnpaid` parameter will continue to work
- Default behavior remains the same (only paid requests)
- No breaking changes to existing functionality

## Database Impact

The filter is applied at the database level using Prisma's `where` clause:

- When `includeUnpaid = false`: `isRequestPaid: true` is added to the where clause
- When `includeUnpaid = true`: No payment status filter is applied

## Performance Considerations

- The filter is applied at the database level, so it's efficient
- No additional queries are required
- Index on `isRequestPaid` field is recommended for optimal performance

## Testing

### Test Cases

1. **Default behavior**: Verify only paid requests are returned when `includeUnpaid` is not specified
2. **Include unpaid**: Verify all requests are returned when `includeUnpaid=true`
3. **Exclude unpaid**: Verify only paid requests are returned when `includeUnpaid=false`
4. **Status filtering**: Verify status filtering works correctly with both paid and unpaid requests
5. **User types**: Verify behavior is consistent for both celebrities and fans

### Example Test

```typescript
// Test default behavior (paid only)
const paidRequests = await requestService.findAll(user, RequestStatus.PENDING);
expect(paidRequests.every((req) => req.isRequestPaid === true)).toBe(true);

// Test including unpaid requests
const allRequests = await requestService.findAll(
  user,
  RequestStatus.PENDING,
  true,
);
expect(allRequests.length).toBeGreaterThanOrEqual(paidRequests.length);
```
