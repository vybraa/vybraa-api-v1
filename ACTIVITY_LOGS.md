# Activity Logs Module

## Overview

The Activity Logs module provides comprehensive tracking and auditing of user activities within the Vybraa platform. It automatically logs critical actions such as logins, request status changes (especially by celebrities), payments, and other significant events.

## Features

- **User Authentication Tracking**: Logs user logins and logouts
- **Request Activity Tracking**: Tracks request creation, status changes, and video uploads
- **Payment Activity Tracking**: Logs payment initiations, completions, and failures
- **Actor Identification**: Tracks both the action initiator and recipient
- **Metadata Support**: Stores additional contextual information with each log
- **Query & Filtering**: Flexible API for retrieving logs with various filters
- **User Summaries**: Provides activity summaries for users

## Database Schema

### ActivityLog Model

```prisma
model ActivityLog {
  id                String          @id @default(uuid())
  userId            String          // User who performed the action
  action            ActivityAction  // Type of action performed
  actionDescription String          // Human-readable description
  entityType        String?         // Type of entity affected (Request, Payment, User)
  entityId          String?         // ID of the affected entity
  recipientId       String?         // ID of user affected by the action (for requests)
  metadata          Json?           // Additional data (before/after state, etc.)
  ipAddress         String?         // IP address of the user
  userAgent         String?         // User agent string
  createdAt         DateTime        @default(now())

  // Relations
  user              User            @relation(fields: [userId], references: [id])
  recipient         User?           @relation("ActivityRecipient", fields: [recipientId], references: [id])

  @@index([userId])
  @@index([action])
  @@index([entityType, entityId])
  @@index([createdAt])
  @@map("activity_logs")
}
```

### ActivityAction Enum

```prisma
enum ActivityAction {
  // Auth actions
  USER_LOGIN
  USER_LOGOUT
  USER_REGISTER
  PASSWORD_RESET
  EMAIL_VERIFIED

  // Request actions
  REQUEST_CREATED
  REQUEST_ACCEPTED
  REQUEST_DECLINED
  REQUEST_COMPLETED
  REQUEST_CANCELLED
  REQUEST_VIDEO_UPLOADED

  // Payment actions
  PAYMENT_INITIATED
  PAYMENT_COMPLETED
  PAYMENT_FAILED
  PAYMENT_REFUNDED

  // Wallet actions
  WALLET_CREATED
  WALLET_CREDITED
  WALLET_DEBITED
  WITHDRAWAL_INITIATED
  WITHDRAWAL_COMPLETED

  // Profile actions
  PROFILE_UPDATED
  PROFILE_PHOTO_UPDATED
  PRICE_UPDATED
}
```

## API Endpoints

### Get All Activity Logs (Admin Only)

```http
GET /activity-logs
Authorization: Bearer <token>

Query Parameters:
- userId: Filter by user ID
- action: Filter by action type
- entityType: Filter by entity type
- entityId: Filter by entity ID
- startDate: Filter by start date (ISO 8601)
- endDate: Filter by end date (ISO 8601)
- page: Page number (default: 1)
- limit: Results per page (default: 50)
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "action": "REQUEST_ACCEPTED",
      "actionDescription": "Accepted request",
      "entityType": "Request",
      "entityId": "request-uuid",
      "recipientId": "fan-uuid",
      "metadata": {
        "previousStatus": "PENDING",
        "newStatus": "ACCEPTED",
        "changedAt": "2025-10-12T12:00:00.000Z"
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-10-12T12:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "userType": "CELEBRITY"
      },
      "recipient": {
        "id": "fan-uuid",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com"
      }
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

### Get Current User's Activity Logs

```http
GET /activity-logs/me
Authorization: Bearer <token>

Query Parameters:
- page: Page number (default: 1)
- limit: Results per page (default: 50)
```

### Get Current User's Activity Summary

```http
GET /activity-logs/me/summary
Authorization: Bearer <token>
```

**Response:**

```json
{
  "userId": "user-uuid",
  "totalActivities": 150,
  "loginCount": 25,
  "requestActivities": 40,
  "paymentActivities": 15
}
```

### Get Recent Activities

```http
GET /activity-logs/me/recent
Authorization: Bearer <token>

Query Parameters:
- limit: Number of recent activities (default: 10)
```

### Get User Activities (Admin Only)

```http
GET /activity-logs/user/:userId
Authorization: Bearer <token>

Query Parameters:
- page: Page number (default: 1)
- limit: Results per page (default: 50)
```

### Get User Activity Summary (Admin Only)

```http
GET /activity-logs/user/:userId/summary
Authorization: Bearer <token>
```

### Get Entity Activities (Admin Only)

```http
GET /activity-logs/entity/:entityType/:entityId
Authorization: Bearer <token>
```

## Automatic Logging

### Authentication Tracking

Login activities are automatically logged when users authenticate:

```typescript
// In auth.service.ts - login method
await this.logActivity({
  userId: user.id,
  action: 'USER_LOGIN',
  actionDescription: `User ${user.email} logged in`,
  ipAddress: loginDto.ipAddress,
  userAgent: loginDto.userAgent,
  metadata: {
    email: user.email,
    userType: user.userType,
    loginTime: new Date().toISOString(),
  },
});
```

### Request Status Changes

Celebrity actions that change request status are automatically logged:

```typescript
// In request.service.ts - changeRequestStatus method
await this.logRequestStatusChange(
  user.id, // Celebrity user ID
  id, // Request ID
  rq.userId, // Fan user ID (recipient)
  request.status, // New status
  previousStatus, // Previous status
);
```

**Tracked Actions:**

- `REQUEST_ACCEPTED`: Celebrity accepts a request
- `REQUEST_DECLINED`: Celebrity declines a request
- `REQUEST_COMPLETED`: Celebrity completes a request
- `REQUEST_CANCELLED`: Request is cancelled

### Video Upload Tracking

Video uploads are automatically logged:

```typescript
// In request.service.ts - video upload method
await this.logVideoUpload(
  user.id, // Celebrity user ID
  id, // Request ID
  request.userId, // Fan user ID (recipient)
  uploadResult.secure_url, // Video URL
);
```

### Payment Tracking

Payment events from webhooks are automatically logged:

```typescript
// In payment.service.ts - webhook handlers
await this.logPaymentActivity(
  request.userId, // User ID
  'PAYMENT_COMPLETED', // Action
  data.tx_ref, // Payment reference
  data.amount, // Amount
  data.currency, // Currency
  request.id, // Request ID
  {
    provider: 'flutterwave',
    flw_ref: data.flw_ref,
    payment_type: data.payment_type,
  },
);
```

**Tracked Actions:**

- `PAYMENT_INITIATED`: Payment process started
- `PAYMENT_COMPLETED`: Payment successful
- `PAYMENT_FAILED`: Payment failed
- `PAYMENT_REFUNDED`: Payment refunded

## Service Methods

### ActivityLogsService

#### create(data: CreateActivityLogDto)

Creates a new activity log entry.

#### logLogin(userId, ipAddress?, userAgent?)

Logs user login activity.

#### logLogout(userId)

Logs user logout activity.

#### logRequestCreated(userId, requestId, celebrityId, metadata?)

Logs request creation.

#### logRequestStatusChange(celebrityUserId, requestId, fanUserId, action, previousStatus, newStatus)

Logs request status changes by celebrities.

#### logVideoUploaded(celebrityUserId, requestId, fanUserId, videoUrl)

Logs video uploads for requests.

#### logPayment(userId, action, paymentReference, amount, currency, requestId?, metadata?)

Logs payment activities.

#### findAll(query: QueryActivityLogDto)

Retrieves activity logs with filtering and pagination.

#### findByUserId(userId, page?, limit?)

Retrieves activity logs for a specific user.

#### findByEntity(entityType, entityId)

Retrieves activity logs for a specific entity.

#### getUserActivitySummary(userId)

Gets activity summary for a user.

#### getRecentActivities(userId, limit?)

Gets recent activities for a user.

#### deleteOldLogs(daysOld?)

Deletes activity logs older than specified days (for GDPR compliance).

## Use Cases

### 1. Audit Trail for Celebrity Actions

Track all celebrity actions on requests:

```typescript
// Get all activities for a specific request
const activities = await activityLogsService.findByEntity('Request', requestId);

// View timeline of request status changes
activities.forEach((log) => {
  console.log(
    `${log.createdAt}: ${log.user.firstName} ${log.actionDescription}`,
  );
  if (log.metadata) {
    console.log(
      `  Status changed: ${log.metadata.previousStatus} → ${log.metadata.newStatus}`,
    );
  }
});
```

### 2. User Activity Dashboard

Display user activity summary:

```typescript
const summary = await activityLogsService.getUserActivitySummary(userId);
const recentActivities = await activityLogsService.getRecentActivities(
  userId,
  10,
);
```

### 3. Payment Audit Trail

Track all payment activities for a user:

```typescript
const paymentLogs = await activityLogsService.findAll({
  userId: userId,
  action: ActivityAction.PAYMENT_COMPLETED,
});
```

### 4. Security Monitoring

Monitor login activities:

```typescript
const loginLogs = await activityLogsService.findAll({
  action: ActivityAction.USER_LOGIN,
  startDate: '2025-10-01T00:00:00.000Z',
  endDate: '2025-10-12T23:59:59.999Z',
});
```

## Implementation Notes

### Lazy Loading to Avoid Circular Dependencies

The activity logging is implemented using dynamic imports to avoid circular dependency issues:

```typescript
private async logActivity(data: any) {
  try {
    if (!this.activityLogsService) {
      const { ActivityLogsService } = await import(
        '../activity-logs/activity-logs.service'
      );
      this.activityLogsService = new ActivityLogsService(this.prisma);
    }
    await this.activityLogsService.create(data);
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging should not break main flow
  }
}
```

### Error Handling

Activity logging is designed to be non-intrusive:

- Errors are caught and logged but don't break the main application flow
- If logging fails, the primary operation continues successfully

### Performance Considerations

- Indexed fields: `userId`, `action`, `entityType + entityId`, `createdAt`
- Pagination support for large datasets
- Optional automatic cleanup of old logs

## Data Retention

Use the `deleteOldLogs` method for GDPR compliance:

```typescript
// Delete logs older than 90 days (can be configured)
await activityLogsService.deleteOldLogs(90);
```

## Future Enhancements

Potential additions:

1. Real-time activity feeds using WebSockets
2. Activity analytics and insights
3. Configurable retention policies per action type
4. Export functionality for compliance audits
5. Activity notifications for important events














