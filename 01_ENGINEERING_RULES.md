## Purpose

This document defines the mandatory engineering standards, coding principles, architectural decisions, and AI implementation rules for the Strike IQ platform.

Every implementation must comply with these standards.

---

## 🛑 MANDATORY AI WORKFLOW RULE: ALWAYS CREATE AN IMPLEMENTATION PLAN FIRST
Whenever a user asks to build, modify, add features, refactor, or make any changes to the Strike IQ codebase:
1. The AI MUST stop and create/update an implementation plan (`implementation_plan.md`).
2. The AI MUST present the plan to the user for review.
3. The AI MUST NOT make any code modifications or run modifying commands until the user explicitly gives their go-ahead/approval.

# User Dashboard

## Goal

Provide authenticated users with a centralized dashboard to access predictions, manage subscriptions, review saved matches, and configure account settings.

---

## Description

The User Dashboard is the primary workspace after authentication. It should present relevant information immediately while keeping navigation simple and scalable.

---

## Business Requirements

- Only authenticated users may access the dashboard.
- Premium content must be hidden from free users.
- Subscription status must update automatically after payment confirmation.
- Dashboard data must always reflect the latest backend state.

---

## Functional Requirements

### Dashboard Home

The system shall:

- Display today's featured predictions.
- Display recent prediction history.
- Display saved predictions.
- Display subscription status.
- Display account summary.

---

## User Stories

**As a free user**

I want to view today's predictions

So that I can decide whether to subscribe.

---

**As a premium user**

I want to access premium predictions

So that I receive additional insights.

---

## Acceptance Criteria

- Dashboard loads within 2 seconds.
- Unauthorized users are redirected to login.
- Premium widgets are hidden from free users.
- User profile information is displayed correctly.

---

## API Dependencies

- GET /api/dashboard
- GET /api/predictions
- GET /api/profile

---

## Database Dependencies

Tables:

- users
- predictions
- subscriptions
- saved_predictions

---

## Components

- DashboardLayout
- Sidebar
- PredictionCard
- SubscriptionCard
- RecentPredictions
- StatsCard

---

## Edge Cases

- No predictions available.
- Subscription expired.
- User has never saved a prediction.
- API unavailable.

---

## Future Enhancements

- Personalized recommendations
- AI chat assistant
- Live match tracking
...