# Flutterwave Webhook Testing Guide

## Overview

This guide provides test payloads and scenarios for testing the Flutterwave webhook integration.

## Test Endpoint

```
POST http://localhost:7000/payment/flutterwave/webhook
Content-Type: application/json
```

## Test Payloads

### 1. Successful Payment (charge.completed)

```json
{
  "event": "charge.completed",
  "data": {
    "id": 285959875,
    "tx_ref": "VYBRAA_1696518400000_XYZ123",
    "flw_ref": "FLW-MOCK-72d663275a32f04bba10620f2219fb4b",
    "device_fingerprint": "N/A",
    "amount": 5000,
    "currency": "NGN",
    "charged_amount": 5070,
    "app_fee": 70,
    "merchant_fee": 0,
    "processor_response": "Approved. Successful",
    "auth_model": "PIN",
    "ip": "197.210.64.96",
    "narration": "CARD Transaction ",
    "status": "successful",
    "payment_type": "card",
    "created_at": "2025-10-10T14:30:00.000Z",
    "account_id": 17321,
    "amount_settled": 4930,
    "customer": {
      "id": 215604089,
      "name": "John Doe",
      "phone_number": "+2348012345678",
      "email": "john.doe@example.com",
      "created_at": "2020-10-15T14:01:45.000Z"
    },
    "card": {
      "first_6digits": "553188",
      "last_4digits": "2950",
      "issuer": "MASTERCARD  CREDIT",
      "country": "NG",
      "type": "MASTERCARD",
      "token": "flw-t1nf-f9b3bf384cd30d6fca42b6df9d27bd2f-m03k",
      "expiry": "09/32"
    }
  }
}
```

**Expected Result**:

- Request found and marked as paid
- Transaction created with COMPLETED status
- Response: `{ status: 'success', reference: 'VYBRAA_1696518400000_XYZ123', requestId: '...', transactionId: '...' }`

### 2. Failed Payment (charge.failed)

```json
{
  "event": "charge.failed",
  "data": {
    "id": 285959876,
    "tx_ref": "VYBRAA_1696518400000_FAIL123",
    "flw_ref": "FLW-MOCK-FAILED-123",
    "amount": 5000,
    "currency": "NGN",
    "charged_amount": 0,
    "app_fee": 0,
    "merchant_fee": 0,
    "processor_response": "Insufficient Funds",
    "status": "failed",
    "payment_type": "card",
    "created_at": "2025-10-10T14:30:00.000Z",
    "customer": {
      "id": 215604089,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone_number": "+2348012345678"
    }
  }
}
```

**Expected Result**:

- Request found
- Failed transaction record created
- Response: `{ status: 'failed', reference: '...', requestId: '...', transactionId: '...' }`

### 3. Transfer Completed (transfer.completed)

```json
{
  "event": "transfer.completed",
  "data": {
    "id": 12345,
    "account_number": "0690000031",
    "bank_code": "044",
    "full_name": "John Doe",
    "created_at": "2025-10-10T14:30:00.000Z",
    "currency": "NGN",
    "debit_currency": "NGN",
    "amount": 10000,
    "fee": 45,
    "status": "SUCCESSFUL",
    "reference": "transfer-ref-123",
    "meta": null,
    "narration": "Payout for celebrity earnings",
    "complete_message": "Transfer was successful",
    "requires_approval": 0,
    "is_approved": 1,
    "bank_name": "Access Bank"
  }
}
```

**Expected Result**:

- Transaction found and updated to COMPLETED
- Wallet balance updated if not in escrow
- Response: `{ status: 'success', reference: 'transfer-ref-123', transactionId: '...' }`

### 4. Refund Completed (refund.completed)

```json
{
  "event": "refund.completed",
  "data": {
    "id": 12346,
    "tx_ref": "VYBRAA_1696518400000_REFUND",
    "flw_ref": "FLW-MOCK-REFUND-123",
    "amount": 5000,
    "currency": "NGN",
    "status": "completed",
    "created_at": "2025-10-10T15:00:00.000Z",
    "customer": {
      "id": 215604089,
      "email": "john.doe@example.com"
    }
  }
}
```

**Expected Result**:

- Transaction found and status updated to FAILED
- Escrow status updated to REFUNDED
- Response: `{ status: 'success', reference: '...', transactionId: '...' }`

## Testing with cURL

### Test Successful Payment

```bash
curl -X POST http://localhost:7000/payment/flutterwave/webhook \
  -H "Content-Type: application/json" \
  -d @flutterwave-success-payload.json
```

### Test Failed Payment

```bash
curl -X POST http://localhost:7000/payment/flutterwave/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "charge.failed",
    "data": {
      "tx_ref": "test-ref-failed",
      "amount": 5000,
      "currency": "NGN",
      "status": "failed",
      "processor_response": "Declined by bank"
    }
  }'
```

## Testing with Postman

### Setup

1. Create new request: `POST {{baseUrl}}/payment/flutterwave/webhook`
2. Set Headers: `Content-Type: application/json`
3. Set Body: Use JSON payloads above
4. Send request
5. Check response and database

### Test Collection

Create a Postman collection with:

- Successful payment test
- Failed payment test
- Transfer completed test
- Refund completed test
- Invalid reference test
- Unknown event test

## Integration Testing

### Prerequisites

1. Database with test data
2. Test request with payment reference
3. Running API server
4. Flutterwave sandbox account

### Test Flow

```typescript
describe('Flutterwave Webhook', () => {
  it('should process successful payment webhook', async () => {
    // 1. Create test request
    const request = await createTestRequest();

    // 2. Send webhook
    const response = await sendWebhook({
      event: 'charge.completed',
      data: { tx_ref: request.paymentReference, amount: 5000 },
    });

    // 3. Verify request is paid
    const updatedRequest = await getRequest(request.id);
    expect(updatedRequest.isRequestPaid).toBe(true);

    // 4. Verify transaction created
    const transaction = await getTransaction(request.id);
    expect(transaction.status).toBe('COMPLETED');
  });
});
```

## Webhook Simulator

For local testing without Flutterwave:

```typescript
// test/webhook-simulator.ts
import axios from 'axios';

export async function simulateFlutterwaveWebhook(
  event: string,
  reference: string,
  amount: number,
  status: 'successful' | 'failed' = 'successful',
) {
  const payload = {
    event,
    data: {
      tx_ref: reference,
      flw_ref: `FLW-MOCK-${Date.now()}`,
      amount,
      currency: 'NGN',
      status,
      payment_type: 'card',
      processor_response: status === 'successful' ? 'Approved' : 'Declined',
      customer: {
        email: 'test@example.com',
        name: 'Test User',
      },
    },
  };

  const response = await axios.post(
    'http://localhost:7000/payment/flutterwave/webhook',
    payload,
  );

  return response.data;
}
```

## Debugging

### Enable Detailed Logging

Check console logs for:

```
Processing Flutterwave payment success: VYBRAA_...
Flutterwave payment processed successfully for request: req-uuid
```

### Common Issues

1. **Request not found**: Check payment reference matches
2. **Transaction already exists**: Webhook might be duplicate
3. **Amount mismatch**: Flutterwave sends amount in main currency unit (not kobo)
4. **Currency conversion**: Ensure currency handling is correct

## Production Checklist

- [ ] Add signature validation with `verif-hash` header
- [ ] Configure webhook URL in Flutterwave dashboard
- [ ] Set up monitoring and alerts
- [ ] Test all event types in staging
- [ ] Add database indexes for payment reference lookups
- [ ] Implement idempotency checks
- [ ] Set up webhook event logging
- [ ] Configure IP whitelist if needed












