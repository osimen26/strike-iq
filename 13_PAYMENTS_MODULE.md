# 13_PAYMENTS_MODULE.md

# Strike IQ Payments Module

Version: 1.0.0

Status: Approved

Related Documents

- 04_DATABASE.md
- 05_API.md
- 06_AUTHENTICATION.md
- 06.5_AUTHORIZATION.md
- 12_SUBSCRIPTIONS_MODULE.md

---

# Purpose

The Payments Module manages all financial transactions within Strike IQ.

It is responsible for:

- Payment initiation
- Flutterwave integration
- Payment verification
- Webhook processing
- Subscription activation
- Billing records
- Payment history
- Audit logging

Payments never grant Premium access directly.

Only verified subscriptions unlock Premium features.

---

# Payment Provider

Provider

Flutterwave

Integration Type

Hosted Checkout

Verification

Server-side

Webhook

Required

Currency

NGN

Future Support

USD

EUR

GHS

KES

ZAR

---

# Payment Principles

Payments must follow these principles.

- Never trust the frontend.
- Always verify transactions server-side.
- Every payment must have a unique reference.
- Webhooks must be idempotent.
- Every payment must create an audit record.
- Failed payments should never activate subscriptions.

---

# Payment Lifecycle

```text
User Selects Plan

↓

Generate Payment Reference

↓

Create Pending Payment Record

↓

Flutterwave Checkout

↓

Payment Completed

↓

Flutterwave Webhook

↓

Verify Transaction

↓

Payment Confirmed

↓

Activate Subscription

↓

Grant Entitlements

↓

Send Confirmation Email

↓

Dashboard Updated
```

---

# Payment Status

Pending

Successful

Failed

Cancelled

Refunded

Expired

Disputed (Future)

---

# Payment Record

Each payment stores

- Payment ID
- User ID
- Subscription ID
- Plan
- Amount
- Currency
- Payment Reference
- Flutterwave Transaction ID
- Status
- Payment Method
- Paid At
- Created At
- Updated At

---

# Payment Methods

Supported

- Card
- Bank Transfer
- USSD
- Bank Account
- Mobile Money (Future)

---

# Checkout Flow

1. User selects plan.
2. Generate unique payment reference.
3. Store pending payment.
4. Redirect to Flutterwave Checkout.
5. Await webhook.
6. Verify payment.
7. Update payment record.
8. Activate subscription.
9. Notify user.

---

# Webhook Processing

Webhook Endpoint

POST

/api/webhooks/flutterwave

Requirements

- Verify webhook signature.
- Verify transaction with Flutterwave API.
- Check payment reference.
- Check idempotency.
- Update payment.
- Activate subscription.
- Grant entitlements.
- Create audit log.
- Send email notification.

Never trust webhook payload alone.

Always verify with Flutterwave.

---

# Idempotency

Duplicate webhook deliveries are expected.

The system must:

- Detect duplicate transaction IDs.
- Ignore already processed events.
- Return success to Flutterwave.

This prevents duplicate subscriptions.

---

# Payment Verification

Verification steps

1. Receive webhook.
2. Validate signature.
3. Retrieve transaction.
4. Verify:

- Amount
- Currency
- Reference
- Status

5. Mark payment successful.
6. Activate subscription.

---

# Failed Payments

Reasons

- User cancellation
- Declined card
- Network timeout
- Verification failure
- Fraud detection

Behavior

- Keep payment as Failed.
- Do not activate subscription.
- Notify user if appropriate.

---

# Payment History

Users should view

- Date
- Amount
- Currency
- Plan
- Status
- Payment Method
- Reference

History is read-only.

---

# Admin Dashboard

Administrators should view

- Total Revenue
- Daily Revenue
- Monthly Revenue
- Payment Success Rate
- Failed Payments
- Refund Requests
- Average Order Value

Supports

- Search
- Filters
- Export CSV (Future)

---

# Refunds

Future Support

Workflow

1. Admin initiates refund.
2. Verify eligibility.
3. Process refund through Flutterwave.
4. Update payment.
5. Cancel subscription if required.
6. Notify user.
7. Create audit record.

---

# Notifications

Send emails for

- Payment successful
- Payment failed
- Refund completed
- Subscription activated

Use Resend.

---

# API Endpoints

POST /api/payments/checkout

GET /api/payments/history

GET /api/payments/:id

POST /api/webhooks/flutterwave

GET /api/admin/payments

POST /api/admin/payments/refund (Future)

---

# Database Tables

payments

payment_webhooks

subscriptions

plans

users

audit_logs

---

# Security

Every payment request must

- Validate authentication
- Validate plan
- Generate unique reference
- Prevent duplicate checkout

Webhook must

- Validate signature
- Verify transaction
- Reject invalid requests

Sensitive data must never be logged.

---

# Performance

Webhook processing should complete quickly.

Long-running tasks such as:

- Email sending
- Analytics updates
- Reporting

should execute asynchronously.

---

# Logging

Log

- Checkout initiated
- Webhook received
- Verification completed
- Subscription activated
- Payment failed
- Refund processed

Logs must include

- User ID
- Payment Reference
- Transaction ID
- Timestamp

---

# Error Handling

Examples

Invalid webhook signature

Payment verification failed

Duplicate transaction

Reference mismatch

Subscription activation failed

Errors should:

- Return appropriate HTTP status codes
- Be logged
- Never expose sensitive details

---

# Analytics

Track

- Gross Revenue
- Net Revenue
- Successful Payments
- Failed Payments
- Conversion Rate
- Average Transaction Value
- Premium Upgrades
- Refund Rate

---

# Future Enhancements

Support

- Multiple currencies
- Coupon codes
- Gift cards
- Installment payments
- Alternative payment providers
- Automatic invoicing

---

# Success Criteria

The Payments Module is complete when:

- Payments are verified server-side.
- Webhooks are idempotent.
- Subscriptions activate only after verification.
- Billing history is accurate.
- Audit logs capture every transaction.
- Payment failures do not affect subscriptions.

---

# Next Document

Proceed to **14_PROFILE_MODULE.md**

This document defines user profile management, account settings, preferences, security options, notification preferences, and account lifecycle management.