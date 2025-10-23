# Background Jobs Documentation

This document describes the background jobs implemented in the Vybraa system for handling payment processing and cleanup.

## Overview

The background jobs system uses NestJS's `@nestjs/schedule` package to run periodic tasks that handle various aspects of the payment and request lifecycle.

## Jobs

### 1. Payment Cleanup Job (`checkPendingPayments`)

**Schedule**: Every hour (`@Cron(CronExpression.EVERY_HOUR)`)

**Purpose**: Monitors and processes pending payments that may have been missed by webhooks or failed to process.

#### What it does:

1. **Finds pending transactions**: Looks for transactions that are:

   - In escrow status `PENDING`
   - Have transaction status `PENDING`
   - Created more than 24 hours ago

2. **Verifies payments**: For each pending transaction:

   - If it has a payment reference, verifies with Paystack API
   - Updates transaction and request status based on verification result
   - Handles timeouts for unverifiable payments

3. **Processes payment results**:

   - **Success**: Updates transaction to `COMPLETED`, request to `IN_PROGRESS`
   - **Failure**: Updates transaction to `FAILED`, request to `DECLINED`
   - **Timeout**: Marks as failed due to no response from payment provider

4. **Handles request timeouts**: Finds requests that have been pending for more than 48 hours without payment and marks them as declined.

### 2. Escrow Release Job (`releaseEscrowPayments`)

**Schedule**: Every 2 hours (`@Cron(CronExpression.EVERY_2_HOURS)`)

**Purpose**: Releases escrow payments to celebrities when requests are completed.

#### What it does:

1. **Finds completed requests**: Looks for requests that are:

   - Status `COMPLETED`
   - Have pending escrow transactions

2. **Releases escrow**: For each completed request:
   - Updates transaction escrow status to `RELEASED`
   - Transfers funds to celebrity's wallet
   - Records release metadata

### 3. Wallet Creation Job (`createWalletForUserWithoutWallet`)

**Schedule**: Every day at 10 AM (`@Cron(CronExpression.EVERY_DAY_AT_10AM)`)

**Purpose**: Creates wallets for verified users who don't have one.

### 4. Flutterwave Key Update Job (`updateFlutterWaveKey`)

**Schedule**: Every minute (`@Cron(CronExpression.EVERY_MINUTE)`)

**Purpose**: Updates Flutterwave access tokens when they expire.

## Payment Processing Flow

### 1. Payment Initiation

- User creates a request
- Payment is initiated with Paystack
- Transaction record is created in escrow status `PENDING`

### 2. Webhook Processing

- Paystack sends webhook when payment status changes
- Webhook updates transaction and request status
- If webhook fails, background job will catch it

### 3. Background Job Cleanup

- Hourly job checks for missed webhooks
- Verifies payment status with Paystack
- Updates transaction and request accordingly

### 4. Escrow Release

- When request is completed, escrow is released
- Funds are transferred to celebrity's wallet
- Transaction status is updated to `RELEASED`

## Error Handling

### Payment Verification Failures

- If Paystack API is unavailable, payment is marked as failed
- Timeout handling for payments that never get verified
- Comprehensive logging for debugging

### Request Timeouts

- Requests without payment for 48+ hours are declined
- Failed transaction records are created for audit trail
- Users are notified of timeout (if notification system is implemented)

### Escrow Release Failures

- If celebrity doesn't have a wallet, escrow remains pending
- Logs errors for manual intervention
- Retries on next run

## Monitoring

### Logs

All jobs include comprehensive logging:

- Job start/completion times
- Number of items processed
- Success/failure counts
- Error details for debugging

### Database Records

- All actions are recorded in the database
- Transaction history is maintained
- Audit trail for all payment operations

## Configuration

### Environment Variables

```env
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_URL=https://api.paystack.co
```

### Timeout Settings

- **Payment verification timeout**: 24 hours
- **Request timeout**: 48 hours
- **Escrow release check**: Every 2 hours

## Troubleshooting

### Common Issues

1. **Payments not being verified**

   - Check Paystack API connectivity
   - Verify webhook configuration
   - Check payment reference storage

2. **Escrow not being released**

   - Verify celebrity has a wallet
   - Check request completion status
   - Review transaction escrow status

3. **Jobs not running**
   - Check NestJS scheduler configuration
   - Verify cron expressions
   - Check application logs for errors

### Manual Intervention

If background jobs fail to process payments correctly:

1. **Check transaction status**:

   ```sql
   SELECT * FROM wallet_transactions
   WHERE isInEscrow = true AND escrowStatus = 'PENDING';
   ```

2. **Verify with Paystack**:

   ```bash
   curl -H "Authorization: Bearer sk_test_..." \
        "https://api.paystack.co/transaction/verify/REFERENCE"
   ```

3. **Manual status update**:
   ```sql
   UPDATE wallet_transactions
   SET status = 'COMPLETED', escrowStatus = 'RELEASED'
   WHERE id = 'transaction_id';
   ```

## Performance Considerations

- Jobs process items in batches to avoid memory issues
- Database queries are optimized with proper indexing
- Error handling prevents job failures from affecting other operations
- Logging is structured for easy monitoring and alerting

## Future Enhancements

- Add email notifications for failed payments
- Implement retry logic with exponential backoff
- Add metrics and monitoring dashboards
- Implement job queuing for high-volume processing

