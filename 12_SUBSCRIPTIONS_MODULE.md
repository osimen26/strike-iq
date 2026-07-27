# 12_SUBSCRIPTIONS_MODULE.md

# Strike IQ Subscription Module

Version: 1.0.0

Status: Approved

Related Documents

- 04_DATABASE.md
- 05_API.md
- 06_AUTHENTICATION.md
- 06.5_AUTHORIZATION.md
- 10_PREDICTIONS_MODULE.md
- 11_MATCHES_MODULE.md

---

# Purpose

The Subscription Module manages Premium access within Strike IQ.

It determines what content and features a user can access based on their active subscription.

Payments confirm purchases.

Subscriptions grant entitlements.

These responsibilities must remain separate.

---

# Objectives

The Subscription Module should allow users to:

- View available plans
- Upgrade to Premium
- Renew subscriptions
- Cancel subscriptions
- View subscription history
- View billing information
- Check renewal dates

Administrators should be able to:

- View all subscriptions
- Extend subscriptions
- Revoke subscriptions
- Grant complimentary Premium access
- Monitor subscription analytics

---

# Subscription Plans

## Free

Features

- Dashboard
- Limited predictions
- Save predictions
- Account management

Restrictions

- Premium predictions
- AI explanations
- Advanced statistics
- Confidence breakdown
- Historical analytics

---

## Premium Monthly

Billing Cycle

30 Days

Features

- Full prediction access
- AI explanations
- Historical statistics
- Confidence breakdown
- Premium dashboard
- Future Premium features

---

## Premium Yearly

Billing Cycle

365 Days

Includes all Premium Monthly benefits.

---

# Subscription Lifecycle

```text
Free User

↓

Upgrade

↓

Flutterwave Checkout

↓

Payment Verification

↓

Subscription Activated

↓

Premium Access Granted

↓

Expiration

↓

Downgrade to Free
```

---

# Subscription States

Pending

Active

Expired

Cancelled

Suspended

Complimentary

---

# Entitlement Model

Premium features are unlocked through entitlements.

Examples

Premium Prediction

AI Explanation

Historical Analysis

Advanced Statistics

Premium Dashboard Widgets

Future AI Tools

Entitlements should be determined dynamically from the active subscription.

---

# Upgrade Flow

1. User selects plan.
2. Generate Flutterwave checkout.
3. Redirect to payment.
4. Wait for webhook verification.
5. Activate subscription.
6. Grant entitlements.
7. Notify user.
8. Refresh dashboard.

Premium access must **never** be granted before successful webhook verification.

---

# Renewal Flow

If payment succeeds:

- Extend expiration date.
- Preserve subscription history.
- Notify user.

If payment fails:

- Maintain current status until expiration.
- Notify user.

---

# Cancellation Flow

Users may cancel at any time.

Cancellation behavior:

- Subscription remains active until expiration.
- No immediate loss of Premium access.
- Auto-renew (future) disabled if implemented.

---

# Expiration Workflow

Daily scheduled job

↓

Find expired subscriptions

↓

Mark as Expired

↓

Remove Premium entitlements

↓

Notify user

↓

Update dashboard

---

# Complimentary Access

Administrators may grant complimentary Premium.

Fields

- Granted By
- Reason
- Expiration Date

No payment record is required.

All complimentary grants must be logged.

---

# Subscription History

Display

- Plan
- Purchase Date
- Expiration Date
- Renewal Date
- Payment Status
- Payment Reference

History is read-only.

---

# Subscription Dashboard

Users should see

Current Plan

Subscription Status

Expiration Date

Days Remaining

Upgrade Button (Free)

Renew Button (Expired)

Manage Subscription

Billing History

---

# Admin Dashboard

Administrators should view

- Active subscriptions
- Expired subscriptions
- Monthly revenue
- Annual revenue
- Complimentary accounts
- Cancellation rate
- Conversion rate

---

# API Endpoints

GET /api/plans

GET /api/subscriptions/current

GET /api/subscriptions/history

POST /api/subscriptions/upgrade

POST /api/subscriptions/cancel

POST /api/admin/subscriptions/grant

PATCH /api/admin/subscriptions/:id

---

# Database Tables

plans

subscriptions

payments

payment_webhooks

users

audit_logs

---

# Business Rules

Premium access requires:

- Authenticated session
- Active subscription
- Valid entitlement

Expired subscriptions immediately lose Premium access.

Cancelled subscriptions retain Premium access until expiration.

Complimentary subscriptions behave exactly like paid Premium subscriptions.

---

# Notifications

Notify users when:

- Subscription activated
- Payment successful
- Renewal successful
- Subscription expires soon
- Subscription expired
- Complimentary access granted

---

# Analytics

Track

- Upgrades
- Renewals
- Expirations
- Cancellations
- Conversion Rate
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Active Premium Users

---

# Security

All subscription changes must:

- Validate administrator permissions
- Create audit logs
- Verify payment before activation
- Prevent duplicate activations

---

# Error Handling

Examples

Payment not verified

Subscription already active

Plan unavailable

Expired payment session

Webhook validation failed

Provide user-friendly messages and log technical details.

---

# Future Enhancements

Support

- Free trials
- Coupons
- Referral rewards
- Family plans
- Team plans
- Gift subscriptions
- Promotional campaigns

---

# Success Criteria

The Subscription Module is complete when:

- Users can upgrade securely.
- Premium access is entitlement-based.
- Subscription lifecycle is automated.
- Complimentary access is supported.
- Administrators can manage subscriptions.
- Analytics reflect subscription performance accurately.

---

# Next Document

Proceed to **13_PAYMENTS_MODULE.md**

This document defines Flutterwave integration, webhook processing, transaction verification, payment reconciliation, refunds, and billing records.