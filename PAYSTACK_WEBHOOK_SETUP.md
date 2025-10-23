# Paystack Webhook Setup

This document explains how to set up and configure Paystack webhooks for the Vybraa payment system.

## Webhook Endpoints

### Main Webhook Endpoint

- **URL**: `POST /payment/webhook`
- **Purpose**: Receives payment status updates from Paystack
- **Authentication**: Validates webhook signature using Paystack secret key

### Test Endpoint

- **URL**: `POST /payment/webhook/test`
- **Purpose**: Test webhook connectivity and basic functionality
- **Authentication**: None (for testing only)

## Supported Webhook Events

The webhook handles the following Paystack events:

1. **charge.success** - Payment completed successfully
2. **charge.failed** - Payment failed
3. **subscription.create** - Subscription created
4. **subscription.disable** - Subscription disabled
5. **invoice.create** - Invoice created
6. **invoice.payment_failed** - Invoice payment failed

## Webhook Processing

### Payment Success (`charge.success`)

1. Validates webhook signature
2. Finds request by payment reference
3. Updates request status to `IN_PROGRESS`
4. Creates payment record with `COMPLETED` status
5. Logs success details

### Payment Failure (`charge.failed`)

1. Validates webhook signature
2. Finds request by payment reference
3. Updates request status to `DECLINED`
4. Creates payment record with `FAILED` status
5. Logs failure details and reason

## Database Schema

### PaymentRecord Model

```prisma
model PaymentRecord {
  id                    String   @id @default(uuid())
  requestId             String
  amount                Float
  currency              String
  paymentMethod         String
  paymentReference      String   @unique
  status                String   // PENDING, COMPLETED, FAILED, CANCELLED
  paystackTransactionId String
  customerEmail         String?
  customerPhone         String?
  failureReason         String?
  metadata              Json?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  request               Requests @relation(fields: [requestId], references: [id], onDelete: Cascade)
}
```

### Updated Requests Model

```prisma
model Requests {
  // ... existing fields
  paymentReference      String?           @unique
  paymentRecord         PaymentRecord?
  // ... other relations
}
```

## Security

### Webhook Signature Validation

The webhook validates incoming requests using Paystack's signature verification:

```typescript
const secretKey = configuration().paystack.secretKey;
const hash = crypto
  .createHmac('sha512', secretKey)
  .update(JSON.stringify(payload))
  .digest('hex');

return hash === signature;
```

## Configuration

### Environment Variables

Ensure the following environment variables are set:

```env
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_URL=https://api.paystack.co
```

### Paystack Dashboard Setup

1. Log into your Paystack dashboard
2. Go to Settings > Webhooks
3. Add webhook URL: `https://your-domain.com/payment/webhook`
4. Select events to send:
   - charge.success
   - charge.failed
   - subscription.create
   - subscription.disable
   - invoice.create
   - invoice.payment_failed

## Testing

### Test Webhook Connectivity

```bash
curl -X POST https://your-domain.com/payment/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Test with Paystack

Use Paystack's webhook testing tools or create test payments to verify webhook processing.

## Error Handling

The webhook includes comprehensive error handling:

- Invalid signature rejection
- Request not found handling
- Database operation error handling
- Detailed logging for debugging

## Monitoring

Monitor webhook performance through:

- Application logs
- Database payment records
- Request status updates
- Paystack dashboard webhook logs

## Troubleshooting

### Common Issues

1. **Invalid signature**: Check Paystack secret key configuration
2. **Request not found**: Verify payment reference is stored correctly
3. **Database errors**: Check Prisma schema and migrations
4. **Timeout issues**: Ensure webhook responds within Paystack's timeout window

### Logs

Check application logs for detailed error information:

```bash
# View webhook logs
grep "webhook" /var/log/vybraa/app.log
```

