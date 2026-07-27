# 04_DATABASE.md

# Strike IQ Database Specification


Related Documents

* 00_PROJECT_OVERVIEW.md
* 01_ENGINEERING_RULES.md
* 02_APPLICATION_PRD.md
* 02.5_PRODUCT_WORKFLOWS.md
* 03_ARCHITECTURE.md

---

# Goal

Design a scalable PostgreSQL database that supports every business workflow of Strike IQ while maintaining data integrity, performance, security, and future scalability.

The database must support:

* Authentication
* Users
* Matches
* Predictions
* AI
* Payments
* Subscriptions
* Notifications
* Analytics
* Admin Dashboard

---

# Database Principles

The database must satisfy the following principles.

## Single Source of Truth

Every piece of business data exists only once.

Duplicate data should never be stored unless required for historical snapshots.

---

## Data Integrity

Every relationship must use foreign keys.

Every critical table must include:

* id
* createdAt
* updatedAt

Soft deletion should be used where historical records are valuable.

---

## Scalability

The schema should support millions of records without structural redesign.

---

# Core Domains

The database is divided into business domains.

Authentication

Users

Sports

Predictions

AI

Subscriptions

Payments

Notifications

Analytics

Administration

---

# Authentication Tables

## users

Purpose

Stores registered users.

Fields

* id
* name
* email
* passwordHash
* avatar
* role
* emailVerified
* status
* lastLogin
* createdAt
* updatedAt

---

## accounts

OAuth provider accounts.

Fields

* id
* userId
* provider
* providerAccountId
* accessToken
* refreshToken

---

## sessions

Active user sessions.

Fields

* id
* userId
* token
* expiresAt

---

## verification_tokens

Stores email verification and password reset tokens.

---

# Sports Domain

## sports

Example

Football

Basketball

---

## leagues

Examples

Premier League

La Liga

NBA

Serie A

Bundesliga

---

## teams

Stores all participating teams.

Fields

* id
* name
* logo
* country
* leagueId

---

## matches

Stores upcoming and completed matches.

Fields

* id
* homeTeamId
* awayTeamId
* kickoff
* venue
* status
* leagueId
* season
* createdBy

---

# Prediction Domain

## predictions

Stores prediction records.

Fields

* id
* matchId
* predictionType
* predictionValue
* confidence
* probability
* status
* publishedAt
* createdBy

Status

* Draft
* Review
* Published
* Archived

---

## prediction_explanations

Stores AI explanations.

Fields

* id
* predictionId
* explanation
* generatedAt
* model

---

## prediction_statistics

Stores structured statistical evidence.

Examples

* Head-to-head
* Team Form
* Goals
* Injuries
* Possession

---

# User Domain

## saved_predictions

Stores bookmarks.

Fields

* userId
* predictionId

---

## user_preferences

Stores:

* Theme
* Notifications
* Favourite Leagues

---

# Subscription Domain

## plans

Subscription plans.

Examples

Free

Premium Monthly

Premium Yearly

---

## subscriptions

Fields

* id
* userId
* planId
* status
* startDate
* endDate
* renewalDate

Status

* Active
* Expired
* Cancelled

---

# Payment Domain

## payments

Stores verified Flutterwave payments.

Fields

* id
* userId
* subscriptionId
* amount
* currency
* reference
* transactionId
* paymentMethod
* status
* paidAt

---

## payment_webhooks

Stores every webhook received.

Purpose

Audit

Retry

Debugging

---

# Notification Domain

## notifications

Fields

* id
* userId
* title
* message
* type
* read
* createdAt

---

# Admin Domain

## admin_logs

Stores administrator activity.

Examples

* Prediction Published
* Match Created
* User Suspended
* Subscription Modified

---

## audit_logs

Stores platform-wide activity.

Never delete audit records.

---

# Analytics Domain

## prediction_results

Stores completed prediction outcomes.

Used for:

* Accuracy
* Historical Performance
* Success Rate

---

## dashboard_metrics

Stores aggregated statistics.

Examples

* Active Users
* Monthly Revenue
* Published Predictions

---

# Relationships

Users

↓

Subscriptions

↓

Payments

Users

↓

Saved Predictions

↓

Predictions

Predictions

↓

Matches

↓

Teams

↓

Leagues

Predictions

↓

AI Explanations

Payments

↓

Flutterwave Webhooks

Admins

↓

Audit Logs

---

# Index Strategy

Indexes should exist for:

users.email

matches.kickoff

predictions.matchId

predictions.status

subscriptions.userId

payments.reference

notifications.userId

---

# Soft Delete Policy

Use soft deletion for:

Users

Matches

Predictions

Notifications

Never soft delete:

Payments

Audit Logs

Webhooks

---

# Data Retention

Payments

Retain indefinitely.

Audit Logs

Retain indefinitely.

Sessions

Expire automatically.

Notifications

Retain for one year.

---

# Security

Sensitive fields

Passwords

Tokens

OAuth Secrets

must always be encrypted or securely hashed.

Never expose internal IDs to the frontend where unnecessary.

---

# Future Expansion

Database should support future additions without redesign.

Potential future modules

* Live Scores
* Betting History
* AI Models
* Referral System
* Affiliate System
* Multi-language Support

---

# Success Criteria

The database is considered complete when:

✓ Every business workflow has a supporting schema.

✓ Relationships are normalized.

✓ Foreign keys enforce integrity.

✓ Prisma models can be generated directly.

✓ APIs can be implemented without schema changes.

✓ Admin and User dashboards share the same data model.

---

# Next Document

Proceed to **05_API.md**

The API specification must expose the database safely through secure, versioned endpoints while respecting authentication, authorization, and business rules.
