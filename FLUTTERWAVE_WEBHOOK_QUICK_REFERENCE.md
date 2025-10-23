# Flutterwave Webhook - Quick Reference

## Endpoint

```
POST /payment/flutterwave/webhook
```

## Events Handled

| Event                | Handler                               | Action                                          |
| -------------------- | ------------------------------------- | ----------------------------------------------- |
| `charge.completed`   | `processFlutterwavePaymentSuccess`    | Mark request paid, create COMPLETED transaction |
| `charge.failed`      | `processFlutterwavePaymentFailed`     | Create FAILED transaction                       |
| `transfer.completed` | `processFlutterwaveTransferCompleted` | Update transaction, update wallet               |
| `refund.completed`   | `processFlutterwaveRefundCompleted`   | Mark as REFUNDED                                |

## Key Fields

| Purpose               | Paystack              | Flutterwave           |
| --------------------- | --------------------- | --------------------- |
| Payment Reference     | `data.reference`      | `data.tx_ref`         |
| Flutterwave Reference | N/A                   | `data.flw_ref`        |
| Amount                | Kobo (÷100)           | Main unit             |
| Customer Email        | `data.customer.email` | `data.customer.email` |

## Quick Test

```bash
curl -X POST http://localhost:7000/payment/flutterwave/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "charge.completed",
    "data": {
      "tx_ref": "test-ref",
      "amount": 5000,
      "currency": "NGN",
      "status": "successful"
    }
  }'
```

## Response Codes

- `200 OK` - All cases (success and error)
- Never throws 4xx/5xx to prevent Flutterwave retries

## Security

- ✅ Signature validation implemented
- Uses `verif-hash` header
- Set `FLUTTERWAVE_SECRET_HASH` in environment variables
