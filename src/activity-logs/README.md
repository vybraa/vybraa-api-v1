# Activity Logs Module

## Quick Start

The Activity Logs module is fully integrated and automatically tracks:

- ✅ User logins
- ✅ Request status changes (especially celebrity actions)
- ✅ Video uploads
- ✅ Payment events

## Files Created

```
src/activity-logs/
├── activity-logs.module.ts           # Module definition
├── activity-logs.service.ts          # Core service with logging methods
├── activity-logs.controller.ts       # API endpoints
├── dtos/
│   ├── create-activity-log.dto.ts   # DTO for creating logs
│   └── query-activity-log.dto.ts    # DTO for querying logs
└── README.md                         # This file
```

## Database Migration

The migration `20251012122525_add_activity_logs` has been applied, creating:

- `activity_logs` table with indexed fields
- `ActivityAction` enum with all supported actions

## Integration Points

### 1. Authentication (src/auth/auth.service.ts)

Logs user logins automatically with IP address and user agent.

### 2. Request Service (src/request/request.service.ts)

Logs:

- Request status changes (ACCEPTED, DECLINED, COMPLETED, CANCELLED)
- Video uploads by celebrities

### 3. Payment Service (src/payment/payment.service.ts)

Logs payment events from webhooks:

- Payment completed
- Payment failed

## API Endpoints

All endpoints are protected by authentication. Admin-only endpoints are marked.

| Endpoint                                      | Method | Access | Description                |
| --------------------------------------------- | ------ | ------ | -------------------------- |
| `/activity-logs`                              | GET    | Admin  | Get all logs with filters  |
| `/activity-logs/me`                           | GET    | User   | Get current user's logs    |
| `/activity-logs/me/summary`                   | GET    | User   | Get current user's summary |
| `/activity-logs/me/recent`                    | GET    | User   | Get recent activities      |
| `/activity-logs/user/:userId`                 | GET    | Admin  | Get user's logs            |
| `/activity-logs/user/:userId/summary`         | GET    | Admin  | Get user's summary         |
| `/activity-logs/entity/:entityType/:entityId` | GET    | Admin  | Get entity logs            |

## Usage Examples

### Get Current User's Recent Activities

```typescript
GET /activity-logs/me/recent?limit=10
Authorization: Bearer <token>
```

### Get Activities for a Specific Request (Admin)

```typescript
GET / activity - logs / entity / Request / request - uuid;
Authorization: Bearer<token>;
```

### Filter Payment Activities

```typescript
GET /activity-logs?action=PAYMENT_COMPLETED&startDate=2025-10-01T00:00:00.000Z
Authorization: Bearer <token>
```

## Tracked Actions

### Authentication

- `USER_LOGIN` - User logged in
- `USER_LOGOUT` - User logged out
- `USER_REGISTER` - New user registered
- `PASSWORD_RESET` - Password reset
- `EMAIL_VERIFIED` - Email verified

### Requests

- `REQUEST_CREATED` - New request created
- `REQUEST_ACCEPTED` - Celebrity accepted request ✨
- `REQUEST_DECLINED` - Celebrity declined request ✨
- `REQUEST_COMPLETED` - Celebrity completed request ✨
- `REQUEST_CANCELLED` - Request cancelled ✨
- `REQUEST_VIDEO_UPLOADED` - Celebrity uploaded video ✨

### Payments

- `PAYMENT_INITIATED` - Payment started
- `PAYMENT_COMPLETED` - Payment successful
- `PAYMENT_FAILED` - Payment failed
- `PAYMENT_REFUNDED` - Payment refunded

## Log Structure

Each log entry contains:

- `id` - Unique identifier
- `userId` - User who performed the action (initiator)
- `recipientId` - User affected by the action (e.g., fan receiving request)
- `action` - Type of action (enum)
- `actionDescription` - Human-readable description
- `entityType` - Type of entity (Request, Payment, User, etc.)
- `entityId` - ID of the affected entity
- `metadata` - Additional contextual data (JSON)
- `ipAddress` - IP address (for login tracking)
- `userAgent` - User agent string (for login tracking)
- `createdAt` - Timestamp

## Special Features

### Actor and Recipient Tracking

Every request-related action tracks:

- **Initiator** (`userId`): The celebrity who performed the action
- **Recipient** (`recipientId`): The fan who is affected

Example:

```json
{
  "userId": "celebrity-uuid",
  "recipientId": "fan-uuid",
  "action": "REQUEST_ACCEPTED",
  "actionDescription": "Accepted request",
  "metadata": {
    "previousStatus": "PENDING",
    "newStatus": "ACCEPTED"
  }
}
```

### Metadata Examples

**Request Status Change:**

```json
{
  "previousStatus": "PENDING",
  "newStatus": "ACCEPTED",
  "changedAt": "2025-10-12T12:00:00.000Z"
}
```

**Video Upload:**

```json
{
  "videoUrl": "https://cloudinary.com/...",
  "uploadedAt": "2025-10-12T12:00:00.000Z"
}
```

**Payment:**

```json
{
  "provider": "flutterwave",
  "flw_ref": "FLW-REF-123",
  "payment_type": "card",
  "amount": 5000,
  "currency": "NGN",
  "requestId": "request-uuid"
}
```

## Performance

The module is optimized with:

- Database indexes on frequently queried fields
- Pagination support (default: 50 per page)
- Efficient query filtering
- Lazy loading to avoid circular dependencies

## Error Handling

Activity logging is designed to be **non-intrusive**:

- Errors are caught and logged
- Main application flow continues even if logging fails
- No exceptions thrown to calling code

## Maintenance

### Cleanup Old Logs

```typescript
// Delete logs older than 90 days
await activityLogsService.deleteOldLogs(90);
```

This should be run periodically via a cron job for GDPR compliance.

## Testing

Test the module by:

1. Logging in (check for `USER_LOGIN` log)
2. Creating a request (check for `REQUEST_CREATED` log)
3. Accepting a request as a celebrity (check for `REQUEST_ACCEPTED` log with initiator and recipient)
4. Uploading a video (check for `REQUEST_VIDEO_UPLOADED` log)
5. Completing a payment (check for `PAYMENT_COMPLETED` log via webhook)

## Documentation

See `ACTIVITY_LOGS.md` in the project root for comprehensive documentation including:

- Detailed API reference
- Database schema
- Use cases and examples
- Implementation notes











