# 05_API.md

# Strike IQ API Specification

Related Documents

* 00_PROJECT_OVERVIEW.md
* 01_ENGINEERING_RULES.md
* 02_APPLICATION_PRD.md
* 02.5_PRODUCT_WORKFLOWS.md
* 03_ARCHITECTURE.md
* 04_DATABASE.md

---

# Purpose

This document defines every API endpoint, Server Action, authentication requirement, authorization rule, request contract, response contract, validation rule, and business rule for the Strike IQ platform.

Every endpoint must follow these specifications.

---

# API Design Principles

Every endpoint must:

* Be fully typed.
* Validate all inputs.
* Return consistent responses.
* Never expose internal implementation details.
* Respect authentication.
* Respect authorization.
* Log critical actions.
* Return meaningful error messages.

---

# API Response Format

## Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

---

## Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request."
  }
}
```

---

# Authentication APIs

## Register User

Method

POST

Route

/api/auth/register

Authentication

Public

Purpose

Create a new user account.

### Request

* name
* email
* password

### Validation

* Email must be unique.
* Password minimum 8 characters.
* Strong password required.

### Business Rules

* Create user.
* Send verification email.
* Assign User role.

### Responses

201 Created

400 Validation Error

409 Email Exists

500 Internal Error

---

## Login

POST

/api/auth/login

Authentication

Public

### Request

* email
* password

### Success

* Create secure session.
* Return authenticated user.

---

## Logout

POST

/api/auth/logout

Authentication

Required

Destroy active session.

---

## Forgot Password

POST

/api/auth/forgot-password

---

## Reset Password

POST

/api/auth/reset-password

---

## Verify Email

POST

/api/auth/verify-email

---

# User APIs

## Get Current User

GET

/api/users/me

Authentication

Required

Returns

* Profile
* Subscription
* Preferences
* Role

---

## Update Profile

PATCH

/api/users/me

Validation

* Name
* Avatar
* Preferences

---

## Change Password

POST

/api/users/change-password

---

# Dashboard APIs

## Dashboard Overview

GET

/api/dashboard

Returns

* Today's Predictions
* Saved Predictions
* Subscription Status
* Recent Activity

Caching

60 seconds

---

# Prediction APIs

## List Predictions

GET

/api/predictions

Authentication

Required

Supports Filters

* League
* Sport
* Confidence
* Date
* Search
* Status

Pagination

Required

Sorting

Required

---

## Prediction Details

GET

/api/predictions/:id

Returns

* Match
* Prediction
* AI Explanation
* Statistics
* Confidence
* Historical Performance

---

## Save Prediction

POST

/api/predictions/:id/save

Authentication

Required

Business Rules

Duplicate saves are ignored.

---

## Remove Saved Prediction

DELETE

/api/predictions/:id/save

---

# Subscription APIs

## Available Plans

GET

/api/plans

Public

---

## Subscribe

POST

/api/subscriptions

Authentication

Required

Business Rules

Generate Flutterwave Checkout Session.

Never activate Premium here.

---

## Current Subscription

GET

/api/subscriptions/current

---

## Cancel Subscription

POST

/api/subscriptions/cancel

---

# Payment APIs

## Flutterwave Webhook

POST

/api/webhooks/flutterwave

Authentication

Flutterwave Signature

Business Rules

* Verify Signature
* Verify Transaction
* Store Webhook
* Update Subscription
* Create Audit Log
* Notify User

Must be idempotent.

---

## Payment History

GET

/api/payments

Authentication

Required

---

# Notification APIs

## List Notifications

GET

/api/notifications

---

## Mark Read

PATCH

/api/notifications/:id/read

---

## Mark All Read

PATCH

/api/notifications/read-all

---

# Admin APIs

Authentication

Admin Only

---

## Dashboard Metrics

GET

/api/admin/dashboard

Returns

* Revenue
* Active Users
* Published Predictions
* Matches

---

## Create Match

POST

/api/admin/matches

Validation

* Teams
* League
* Kickoff

---

## Update Match

PATCH

/api/admin/matches/:id

---

## Delete Match

DELETE

/api/admin/matches/:id

Soft Delete Only

---

## Import Matches

POST

/api/admin/matches/import

Business Rules

* Validate API response.
* Skip duplicates.
* Log import summary.

---

## Generate AI Prediction

POST

/api/admin/predictions/generate

Business Rules

Creates Draft Only.

Never Publish.

---

## Publish Prediction

POST

/api/admin/predictions/:id/publish

Business Rules

* Validate prediction.
* Publish immediately.
* Notify users.
* Refresh dashboard cache.

---

## Archive Prediction

POST

/api/admin/predictions/:id/archive

---

## Manage Users

GET

/api/admin/users

Supports

* Search
* Filter
* Pagination

---

## Suspend User

PATCH

/api/admin/users/:id/suspend

---

## Restore User

PATCH

/api/admin/users/:id/restore

---

# Analytics APIs

GET

/api/admin/analytics

Returns

* Revenue
* Prediction Accuracy
* Active Users
* Conversion Rate
* Subscription Growth

---

# Authorization Matrix

| Endpoint            | Guest | User | Premium | Admin |
| ------------------- | ----- | ---- | ------- | ----- |
| Register            | ✅     | ❌    | ❌       | ❌     |
| Login               | ✅     | ❌    | ❌       | ❌     |
| Dashboard           | ❌     | ✅    | ✅       | ✅     |
| Predictions         | ❌     | ✅    | ✅       | ✅     |
| Premium Predictions | ❌     | ❌    | ✅       | ✅     |
| Admin APIs          | ❌     | ❌    | ❌       | ✅     |

---

# Validation Standards

Every endpoint must validate:

* Authentication
* Authorization
* Request Body
* Query Parameters
* Route Parameters
* Business Rules

Use

* Zod
* Prisma
* Better Auth

---

# Rate Limiting

Authentication

5 requests / minute

Register

3 requests / minute

Forgot Password

3 requests / hour

Prediction Search

60 requests / minute

Flutterwave Webhook

Unlimited (signature validation required)

---

# Caching Strategy

Cache

* Dashboard
* Predictions
* Plans
* Analytics

Do not cache

* Authentication
* Payments
* Webhooks
* User Sessions

---

# Logging

Every endpoint should log:

* User ID
* IP Address
* Endpoint
* Duration
* Status
* Timestamp

Admin endpoints additionally log:

* Action
* Resource
* Before/After Changes

---

# Server Actions vs Route Handlers

## Use Server Actions For

* User profile updates
* Saving predictions
* Updating settings
* Changing passwords
* Internal dashboard actions
* Subscription management initiated from the UI

## Use Route Handlers For

* Authentication callbacks
* Flutterwave webhooks
* Public endpoints
* Third-party integrations
* Admin import endpoints
* Future mobile API support

---

# API Versioning

Current Version

v1

Future versions should follow:

/api/v2/

without breaking existing clients.

---

# Success Criteria

The API layer is complete when:

* Every business workflow has a corresponding endpoint or Server Action.
* All endpoints are fully typed.
* Validation is enforced consistently.
* Authentication and authorization are secure.
* Responses follow the standard format.
* Logging and audit requirements are implemented.
* APIs are production-ready and documented.

---

# Next Document

Proceed to **06_AUTHENTICATION.md**

This document will define Better Auth configuration, Google OAuth integration, role-based access control, session lifecycle, protected routes, middleware, and authentication workflows.
