# 09_DASHBOARD_OVERVIEW.md

# Strike IQ Dashboard Overview

Version: 1.0.0

Status: Approved

Related Documents

- 03_ARCHITECTURE.md
- 04_DATABASE.md
- 05_API.md
- 06_AUTHENTICATION.md
- 06.5_AUTHORIZATION.md
- 07_DESIGN_SYSTEM.md
- 08_COMPONENT_LIBRARY.md

---

# Purpose

The Dashboard Overview is the primary landing page for authenticated users.

It provides a personalized summary of the user's account, today's predictions, subscription status, saved predictions, notifications, and recent activity.

The dashboard should prioritize speed, clarity, and actionable insights.

---

# Goals

The dashboard should allow users to:

- View today's predictions
- View premium recommendations (if eligible)
- Check subscription status
- Continue recently viewed predictions
- View unread notifications
- Save predictions
- Upgrade to Premium (Free users)
- Navigate quickly to all platform features

---

# Dashboard Layout

The page consists of the following sections:

1. Top Navigation
2. Welcome Header
3. Quick Actions
4. Statistics Cards
5. Today's Predictions
6. Premium Banner (Free users only)
7. Saved Predictions
8. Recent Activity
9. Notifications Preview

---

# Page Structure

```text
Dashboard

├── Header
├── Welcome Section
├── Statistics Cards
├── Today's Predictions
├── Premium Upgrade Banner
├── Saved Predictions
├── Recent Activity
└── Notifications
```

---

# Header

Displays:

- User avatar
- Greeting
- Current date
- Search bar
- Notification icon
- Theme switcher

Actions:

- Open profile
- Logout
- Open notifications

---

# Welcome Section

Displays

- Welcome message
- User name
- Subscription badge
- CTA based on account status

Examples

Free User

"Upgrade to Premium to unlock expert AI predictions."

Premium User

"Welcome back. Today's premium insights are ready."

---

# Quick Actions

Buttons

- Browse Predictions
- Saved Predictions
- Billing
- Settings

Admins additionally see

- Admin Dashboard

---

# Statistics Cards

Display the following metrics:

## Predictions Today

Shows the number of available predictions.

---

## Saved Predictions

Shows the user's saved predictions.

---

## Premium Status

Displays:

- Free
- Premium Monthly
- Premium Yearly

Includes renewal date if applicable.

---

## Prediction Accuracy

Displays historical platform accuracy.

Visible to Premium users only.

---

# Today's Predictions

Displays prediction cards.

Each card includes:

- Home Team
- Away Team
- League
- Kickoff Time
- Prediction
- Confidence Level
- Save Button
- View Details

Premium users also see:

- AI Explanation
- Advanced Statistics

---

# Premium Upgrade Banner

Visible only to Free users.

Displays:

- Premium benefits
- Monthly pricing
- Upgrade button

Hidden for Premium users.

---

# Saved Predictions

Displays bookmarked predictions.

Supports:

- Remove bookmark
- Open prediction
- Empty state

---

# Recent Activity

Displays

- Recently viewed predictions
- Subscription changes
- Profile updates

Maximum

10 items

---

# Notifications Preview

Displays

- Latest five notifications

Actions

- Mark as read
- View all notifications

---

# Sidebar Navigation

Items

Dashboard

Predictions

Saved Predictions

Billing

Notifications

Profile

Settings

Premium (conditional)

Admins additionally see

Admin Dashboard

---

# Empty States

If the user has:

No saved predictions

Display:

"Save predictions to quickly find them later."

Button

Browse Predictions

---

No notifications

Display

"You're all caught up."

---

No recent activity

Display

"Activity will appear here."

---

# Loading States

Every dashboard section should provide skeleton loaders.

Never display blank content while data is loading.

---

# Error States

Display friendly error messages.

Provide retry actions.

---

# Responsive Behaviour

Desktop

Sidebar expanded.

Tablet

Sidebar collapsible.

Mobile

Bottom navigation with drawer.

---

# Performance

Load dashboard in parallel.

Use React Server Components where appropriate.

Cache:

- Dashboard summary
- Statistics
- Today's predictions

Do not cache:

- Notifications
- Subscription status

---

# Server Data

Dashboard should retrieve:

Authenticated User

Subscription

Today's Predictions

Saved Predictions

Recent Activity

Unread Notifications

Dashboard Metrics

All requests should execute concurrently.

---

# Security

Only authenticated users may access the dashboard.

Premium content must be verified server-side.

Admin links should only render for authorized users.

---

# Accessibility

The dashboard must support:

- Keyboard navigation
- Screen readers
- Focus management
- Reduced motion
- High contrast

---

# Analytics Events

Track:

- Dashboard Viewed
- Prediction Opened
- Prediction Saved
- Upgrade Clicked
- Notification Opened

---

# Success Criteria

The Dashboard Overview is complete when:

- All sections load independently.
- Data is retrieved efficiently.
- Premium content is protected.
- Empty and loading states are implemented.
- The layout is responsive.
- Accessibility requirements are met.

---

# Next Document

Proceed to **10_PREDICTIONS_MODULE.md**

This document defines the complete prediction browsing experience, filtering, search, AI explanations, confidence scoring, and premium feature gating.