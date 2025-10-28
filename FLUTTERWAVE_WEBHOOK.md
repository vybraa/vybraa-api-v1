# Flutterwave Webhook Integration

This document explains the Flutterwave webhook implementation in the payment module.

## Overview

The Flutterwave webhook endpoint handles payment notifications from Flutterwave, processes transactions, and updates request statuses - following the same pattern as the Paystack webhook.

## Webhook Endpoint

**URL**: `POST /payment/flutterwave/webhook`
**Access**: Public (no authentication required)
**Content-Type**: `application/json`

## Supported Events

### 1. charge.completed

**Description**: Triggered when a payment is successfully completed

**Handling**:

- Find request by payment reference (`tx_ref`)
- Update request `isRequestPaid` status to `true`
- Create COMPLETED transaction record with escrow
- Store Flutterwave metadata (flw_ref, fees, customer info)

### 2. charge.failed

**Description**: Triggered when a payment fails

**Handling**:

- Find request by payment reference
- Create FAILED transaction record
- Store failure reason and processor response

### 3. transfer.completed

**Description**: Triggered when a transfer is completed

**Handling**:

- Find transaction by reference
- Update transaction status to COMPLETED
- Update wallet balance if not in escrow

### 4. refund.completed

**Description**: Triggered when a refund is processed

**Handling**:

- Find transaction by reference
- Update transaction status to FAILED
- Update escrow status to REFUNDED
- Store refund metadata

## Webhook Payload Structure

### Request Body

```json
{
  "event": "charge.completed",
  "data": {
    "id": 12345,
    "tx_ref": "VYBRAA_1234567890_ABC",
    "flw_ref": "FLW-MOCK-123456789",
    "amount": 5000,
    "currency": "NGN",
    "charged_amount": 5000,
    "app_fee": 70,
    "merchant_fee": 0,
    "processor_response": "Approved",
    "status": "successful",
    "payment_type": "card",
    "customer": {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "phone_number": "+2348012345678"
    },
    "created_at": "2025-10-10T12:00:00Z"
  }
}
```

## Response Format

### Success Response

```json
{
  "status": "success",
  "result": {
    "status": "success",
    "reference": "VYBRAA_1234567890_ABC",
    "requestId": "req-uuid",
    "transactionId": "txn-uuid"
  }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Webhook received but processing failed",
  "error": "Error description"
}
```

## Implementation Details

### Files Modified

1. **`dtos/flutterwave-webhook.dto.ts`** (Created)

   - FlutterwaveWebhookDto
   - FlutterwaveWebhookData
   - FlutterwaveCustomer
   - FlutterwaveCard

2. **`payment.service.ts`**

   - `handleFlutterwaveWebhook(webhookData)` - Main webhook handler
   - `processFlutterwavePaymentSuccess(data)` - Handle successful payments
   - `processFlutterwavePaymentFailed(data)` - Handle failed payments
   - `processFlutterwaveTransferCompleted(data)` - Handle transfers
   - `processFlutterwaveRefundCompleted(data)` - Handle refunds

3. **`payment.controller.ts`**
   - `POST /payment/flutterwave/webhook` - Webhook endpoint

## Transaction Creation Pattern

Follows the same pattern as Paystack webhook:

```typescript
// 1. Find request by payment reference
const request = await this.findRequestByPaymentReference(data.tx_ref);

// 2. Update request paid status
await this.updateRequestIsPaidStatus(request.id);

// 3. Create transaction record
await this.createPaymentRecord({
  userId: request.userId,
  requestId: request.id,
  amount: data.amount,
  currency: data.currency,
  paymentMethod: data.payment_type,
  paymentReference: data.tx_ref,
  status: TransactionStatus.COMPLETED,
  metadata: {
    /* Flutterwave data */
  },
});
```

## Security Notes

### Signature Validation (Not Implemented)

As requested, signature validation is **not implemented**.

To add signature validation in the future:

```typescript
@Post('flutterwave/webhook')
async handleFlutterwaveWebhook(
  @Body() webhookData: FlutterwaveWebhookDto,
  @Headers('verif-hash') signature: string,
) {
  // Validate signature
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  if (signature !== secretHash) {
    throw new UnauthorizedException('Invalid signature');
  }
  // ... process webhook
}
```

### Current Approach

- No signature validation
- All webhook events are processed
- Errors are logged and returned as 200 OK to prevent retries
- Production deployment should add IP whitelist or signature validation

## Testing

### Test Webhook Locally

```bash
curl -X POST http://localhost:7000/payment/flutterwave/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "charge.completed",
    "data": {
      "tx_ref": "test-reference-123",
      "amount": 5000,
      "currency": "NGN",
      "status": "successful",
      "payment_type": "card",
      "customer": {
        "email": "test@example.com",
        "name": "Test User"
      }
    }
  }'
```

### Test Events

1. **Successful Payment**:

   - Event: `charge.completed`
   - Status: `successful`
   - Expected: Request marked as paid, transaction created

2. **Failed Payment**:

   - Event: `charge.failed`
   - Status: `failed`
   - Expected: Failed transaction record created

3. **Transfer Completed**:

   - Event: `transfer.completed`
   - Expected: Transaction updated, wallet balance updated

4. **Refund Completed**:
   - Event: `refund.completed`
   - Expected: Transaction marked as refunded

## Flutterwave Dashboard Configuration

### Webhook Setup

1. Log in to Flutterwave Dashboard
2. Go to Settings → Webhooks
3. Add webhook URL: `https://your-domain.com/payment/flutterwave/webhook`
4. Select events to subscribe:
   - charge.completed
   - charge.failed
   - transfer.completed
   - refund.completed
5. Save configuration

### Event Types

Flutterwave sends different event types:

- `charge.completed` - Payment successful
- `charge.failed` - Payment failed
- `transfer.completed` - Payout/transfer completed
- `transfer.failed` - Payout failed
- `refund.completed` - Refund processed
- `refund.failed` - Refund failed

## Comparison with Paystack Webhook

| Feature                  | Paystack                    | Flutterwave                    |
| ------------------------ | --------------------------- | ------------------------------ |
| **Endpoint**             | `/payment/paystack/webhook` | `/payment/flutterwave/webhook` |
| **Signature Header**     | `x-paystack-signature`      | `verif-hash`                   |
| **Signature Validation** | Yes                         | No (as requested)              |
| **Success Event**        | `charge.success`            | `charge.completed`             |
| **Failed Event**         | `charge.failed`             | `charge.failed`                |
| **Reference Field**      | `data.reference`            | `data.tx_ref`                  |
| **Amount Format**        | Kobo (÷100)                 | Main unit (no conversion)      |
| **Metadata Fields**      | Paystack-specific           | Flutterwave-specific           |

## Error Handling

### Request Not Found

```json
{
  "status": "request_not_found",
  "reference": "tx_ref"
}
```

### Transaction Not Found

```json
{
  "status": "transaction_not_found",
  "reference": "tx_ref"
}
```

### Processing Error

```json
{
  "status": "error",
  "message": "Webhook received but processing failed",
  "error": "Error details"
}
```

## Monitoring and Logging

All webhook events are logged with:

- Event type
- Payment reference
- Processing status
- Error details (if any)

Check logs for:

```
[PaymentController] Received Flutterwave webhook
[PaymentService] Processing Flutterwave payment success
[PaymentService] Flutterwave payment processed successfully
```

## Best Practices

1. **Always Return 200**: Even on errors, return 200 OK to prevent Flutterwave from retrying
2. **Log Everything**: Log all webhook data for debugging
3. **Idempotency**: Check if transaction already exists before creating
4. **Async Processing**: Consider moving heavy operations to background jobs
5. **Monitoring**: Set up alerts for failed webhook processing

## Future Enhancements

1. **Signature Validation**: Add `verif-hash` header validation
2. **Idempotency Keys**: Prevent duplicate webhook processing
3. **Retry Logic**: Handle failed database operations with retries
4. **Event Streaming**: Stream events to analytics service
5. **Webhook Logs**: Store webhook events in database for audit trail
