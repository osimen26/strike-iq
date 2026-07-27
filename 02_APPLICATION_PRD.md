# 02_APPLICATION_PRD.md

# Strike IQ Application Product Requirements Document (PRD)


Related Documents:

* 00_PROJECT_OVERVIEW.md
* 01_ENGINEERING_RULES.md

---

# Goal

Build a production-ready authenticated application that transforms Strike IQ from a marketing website into a scalable AI-powered Sports Betting Intelligence platform.

The application must provide a premium experience for users while giving administrators complete control over predictions, subscriptions, analytics, and AI-generated content.

---

# Product Description

Strike IQ is an AI-powered Sports Betting Intelligence platform.

The application helps users make more informed betting decisions by combining statistical analysis, AI-generated explanations, confidence scoring, and historical performance metrics.

The application is **not** a sportsbook.

Users do not place bets inside the platform.

The platform provides decision intelligence only.

---

# Objectives

The application must:

* Authenticate users securely.
* Manage subscriptions.
* Deliver AI-powered predictions.
* Allow administrators to manage matches and predictions.
* Synchronize published predictions instantly.
* Scale to thousands of concurrent users.
* Maintain a premium user experience.

---

# Target Users

## Guest

A visitor exploring the product before registration.

Goals:

* Learn about Strike IQ
* Compare plans
* Register

---

## Free User

A registered user without an active subscription.

Goals:

* View limited predictions
* Upgrade to Premium
* Save favourite matches

---

## Premium User

A paying subscriber.

Goals:

* View premium predictions
* Read AI explanations
* Access historical analytics
* Manage subscription

---

## Administrator

Platform operator.

Goals:

* Upload matches
* Generate predictions
* Review AI output
* Publish predictions
* Manage users
* Monitor analytics

---

# Core Features

## Authentication

### Description

Provide secure access to the platform using Better Auth.

### Functional Requirements

* Email registration
* Email login
* Google OAuth
* Password reset
* Email verification
* Session management
* Logout

### Acceptance Criteria

* User can register successfully.
* Google authentication works.
* Sessions persist securely.
* Unauthorized users cannot access protected routes.

---

## User Dashboard

### Description

The primary workspace for authenticated users.

### Functional Requirements

* Dashboard overview
* Today's predictions
* Prediction details
* Saved predictions
* Subscription status
* Account settings
* Notification center

### Acceptance Criteria

* Dashboard loads within acceptable performance targets.
* Only authenticated users can access it.
* Subscription status is always accurate.

---

## Prediction System

### Description

Display AI-assisted match predictions with supporting insights.

### Functional Requirements

* Match information
* Prediction outcome
* Confidence score
* AI explanation
* Supporting statistics
* Historical performance

### Acceptance Criteria

* Every prediction includes an explanation.
* Confidence is displayed consistently.
* Users can filter and search predictions.

---

## Premium Subscription

### Description

Manage access to premium features using Flutterwave.

### Functional Requirements

* Subscribe
* Upgrade
* Renew
* Cancel
* Billing history

### Acceptance Criteria

* Premium access activates only after verified payment.
* Subscription status updates automatically.
* Billing history remains accessible.

---

## Notifications

### Functional Requirements

* Subscription updates
* Prediction alerts
* Account notifications
* System announcements

---

## User Profile

### Functional Requirements

* Update profile
* Change password
* Manage preferences
* Upload avatar

---

# Admin Dashboard

## Goal

Provide administrators with complete operational control over the platform.

---

## Features

### Match Management

Administrators can:

* Create matches
* Edit matches
* Delete matches
* Import matches
* Schedule matches

---

### Prediction Management

Administrators can:

* Generate AI predictions
* Edit AI output
* Save drafts
* Publish predictions
* Archive predictions

---

### User Management

Administrators can:

* Search users
* Suspend users
* Restore users
* Manage roles
* View subscriptions

---

### Analytics

Administrators can monitor:

* User growth
* Active subscriptions
* Revenue
* Prediction accuracy
* Match activity

---

# AI Workflow

## Goal

Assist administrators while maintaining human oversight.

Workflow:

1. Match created
2. AI analyses match
3. Draft prediction generated
4. Administrator reviews
5. Administrator edits
6. Administrator publishes
7. Prediction appears immediately in User Dashboard

AI must never publish predictions automatically.

---

# Navigation

Authenticated Routes

```text
/dashboard
/dashboard/predictions
/dashboard/predictions/[id]
/dashboard/saved
/dashboard/profile
/dashboard/settings
/dashboard/billing
/dashboard/notifications

/admin
/admin/matches
/admin/predictions
/admin/users
/admin/subscriptions
/admin/analytics
/admin/settings
```

---

# Functional Requirements

The application shall:

* Support role-based access control.
* Synchronize admin and user data.
* Protect premium content.
* Validate all server requests.
* Maintain audit logs.
* Handle payment webhooks securely.

---

# Non-Functional Requirements

The application shall be:

* Responsive
* Accessible
* Secure
* Scalable
* Maintainable
* Fully typed
* Production-ready

---

# API Dependencies

Depends on:

* Authentication API
* Prediction API
* Subscription API
* User API
* Notification API
* Analytics API

---

# Database Dependencies

Core entities include:

* Users
* Sessions
* Accounts
* Matches
* Predictions
* Prediction Explanations
* Subscriptions
* Payments
* Notifications
* Roles
* Audit Logs

---

# Security Requirements

* Server-side authentication
* Role-based authorization
* CSRF protection
* XSS protection
* Input validation
* Rate limiting
* Secure payment verification

---

# Success Metrics

The platform is considered successful when:

* Authentication success rate exceeds target thresholds.
* Predictions synchronize instantly after publication.
* Premium users receive immediate access after verified payment.
* Dashboard performance meets Lighthouse targets.
* Zero duplicate business logic exists across applications.

---

# Out of Scope

The following are **not** part of this project:

* Sportsbook functionality
* Bet placement
* Gambling wallet
* Cryptocurrency payments
* Live betting engine
* Cash-out functionality

---

# Dependencies

Requires:

* 03_ARCHITECTURE.md
* 04_DATABASE.md
* 05_API.md
* 06_AUTHENTICATION.md
* 07_PAYMENTS.md
* 08_AI_SYSTEM.md

---

# Definition of Done

The PRD is considered complete when every feature described in this document has:

* A corresponding architecture design.
* Database support.
* API specification.
* Acceptance criteria.
* Security requirements.
* Test coverage.
* Implementation documentation.
