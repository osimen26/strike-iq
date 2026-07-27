# 03_ARCHITECTURE.md

# Strike IQ Software Architecture


**Architecture Style:**

* Domain-Driven Design (DDD)
* Feature-Based Architecture
* Clean Architecture
* Modular Monolith (Phase 1)
* Microservice Ready (Future)

---

# Purpose

This document defines the software architecture of Strike IQ.

It describes how the platform is organized, how domains communicate, where business logic lives, and how new features should be implemented.

This architecture is designed for:

* Scalability
* Maintainability
* AI-assisted development
* Production deployment
* Future microservice extraction

---

# Architectural Principles

Every feature must follow these principles.

## 1. Domain First

Organize code around business domains instead of technical layers.

Example:

```
Authentication

Users

Predictions

Matches

Subscriptions

Payments

Analytics

Notifications

Admin

AI
```

Avoid organizing code by "controllers", "services", or "models" alone.

---

## 2. Single Source of Truth

Business logic must exist in one location only.

Never duplicate:

* Validation
* Business rules
* Database queries
* Permission logic

---

## 3. Feature Isolation

Each domain owns:

* Components
* Hooks
* Services
* Types
* Validation
* API handlers
* Business logic

---

## 4. Composition Over Inheritance

Build reusable modules.

Avoid deep inheritance chains.

---

# High-Level Architecture

```
                    React Marketing Website
                              │
                              ▼
                      Next.js Platform
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
         Authentication   User Dashboard   Admin Dashboard
                │             │             │
                └─────────────┼─────────────┘
                              ▼
                     Domain Services Layer
                              │
      ┌──────────┬──────────┬──────────┬──────────┐
      ▼          ▼          ▼          ▼          ▼
 Authentication Matches Predictions Payments Notifications
      ▼          ▼          ▼          ▼          ▼
                PostgreSQL + Prisma ORM
                              │
                              ▼
                     External Integrations
                Flutterwave • Google OAuth
             Sports APIs • Supabase Storage
```

---

# Domain Architecture

## Authentication Domain

### Responsibilities

* Registration
* Login
* Google OAuth
* Sessions
* Password Reset
* Email Verification

### Owns

* Authentication logic
* Session validation
* Route protection

---

## Users Domain

### Responsibilities

* Profiles
* Preferences
* Roles
* Saved Predictions
* User Settings

---

## Matches Domain

### Responsibilities

* Create Match
* Update Match
* Delete Match
* Import Match
* League Management

---

## Predictions Domain

### Responsibilities

* Prediction Records
* Confidence Scores
* Prediction History
* Filters
* Search

---

## AI Domain

### Responsibilities

* Generate Predictions
* Generate Explanations
* Confidence Calculations
* Draft Generation

AI never publishes predictions.

---

## Payments Domain

### Responsibilities

* Flutterwave
* Webhooks
* Billing
* Subscription Activation

Premium status is updated only after successful webhook verification.

---

## Subscription Domain

### Responsibilities

* Premium Access
* Expiration
* Renewals
* Downgrades

---

## Notifications Domain

### Responsibilities

* System Notifications
* Billing Alerts
* Prediction Alerts
* User Messages

---

## Analytics Domain

### Responsibilities

* Revenue
* Active Users
* Prediction Accuracy
* Dashboard Metrics

---

## Admin Domain

### Responsibilities

* Match Management
* Prediction Publishing
* User Management
* Platform Configuration
* Audit Logs

---

# Folder Structure

```
platform/

├── app/
│
├── features/
│   ├── authentication/
│   ├── users/
│   ├── predictions/
│   ├── matches/
│   ├── subscriptions/
│   ├── payments/
│   ├── notifications/
│   ├── analytics/
│   ├── admin/
│   └── ai/
│
├── components/
├── hooks/
├── lib/
├── services/
├── prisma/
├── types/
├── utils/
├── providers/
├── constants/
└── middleware.ts
```

---

# Layer Responsibilities

## Presentation Layer

Responsible for:

* UI
* Forms
* Tables
* Layouts
* Navigation

No business logic.

---

## Application Layer

Responsible for:

* Use Cases
* Orchestration
* Feature Workflows

Coordinates between domains.

---

## Domain Layer

Contains:

* Business Rules
* Validation
* Policies
* Domain Services

No UI code.

---

## Infrastructure Layer

Contains:

* Prisma
* Redis
* External APIs
* Storage
* Payments

No UI logic.

---

# Data Flow

```
User Action
      │
      ▼
Page
      │
      ▼
Server Action / API Route
      │
      ▼
Application Service
      │
      ▼
Domain Service
      │
      ▼
Repository
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
```

---

# Cross-Domain Communication

Domains must communicate through services.

Avoid direct imports between unrelated domains.

Example:

```
Predictions

↓

Subscriptions

↓

Users
```

Never:

```
Predictions

↓

Payments

↓

Matches

↓

Authentication

↓

Analytics
```

This creates tight coupling.

---

# State Management

## Server State

* TanStack Query

## Local State

* React State

## Global State

* React Context (minimal)

Avoid unnecessary global state libraries.

---

# Security Boundaries

Every request must:

* Validate authentication
* Validate authorization
* Validate ownership
* Validate input

Never trust client data.

---

# Performance Strategy

Use:

* Server Components
* Dynamic Imports
* Code Splitting
* Route Groups
* Image Optimization
* Query Caching
* Lazy Loading

---

# Error Handling

Every domain returns standardized errors.

Example:

```
{
  success: false,
  error: {
    code: "PREDICTION_NOT_FOUND",
    message: "Prediction does not exist."
  }
}
```

Never expose stack traces.

---

# Logging Strategy

Log:

* Authentication
* Payments
* Admin Actions
* Prediction Publishing
* AI Generation
* Subscription Changes

---

# Future Architecture

The current implementation is a Modular Monolith.

Future extraction candidates:

* AI Service
* Notification Service
* Payment Service
* Analytics Service

No code should prevent future migration to microservices.

---

# Success Criteria

The architecture is considered successful when:

* Domains are isolated.
* Business logic is not duplicated.
* Features remain independently maintainable.
* New domains can be added without modifying existing ones.
* AI coding agents can identify domain ownership quickly.
* The platform scales without architectural rewrites.

---

# Next Document

Proceed to **04_DATABASE.md**.

The database schema must reflect the domain boundaries defined in this architecture.
