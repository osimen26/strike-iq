# 16_ADMIN_MODULE.md

# Strike IQ Admin Module

Version: 1.0.0

Status: Approved

Related Documents

- 03_ARCHITECTURE.md
- 04_DATABASE.md
- 05_API.md
- 06_AUTHENTICATION.md
- 06.5_AUTHORIZATION.md
- 10_PREDICTIONS_MODULE.md
- 11_MATCHES_MODULE.md
- 12_SUBSCRIPTIONS_MODULE.md
- 13_PAYMENTS_MODULE.md
- 15_NOTIFICATIONS_MODULE.md

---

# Purpose

The Admin Module provides operational control over the Strike IQ platform.

It allows authorized administrators to manage:

- Users
- Matches
- Predictions
- AI Generation
- Subscriptions
- Payments
- Notifications
- Analytics
- Audit Logs
- Platform Settings

Only Admin and Super Admin users may access this module.

---

# Objectives

Administrators should be able to:

- Publish predictions
- Create and edit matches
- Import fixtures
- Manage users
- View subscriptions
- Review payments
- Send notifications
- Monitor platform analytics
- Review audit logs
- Configure platform settings

Every action must be logged.

---

# Admin Layout

```
Admin

├── Dashboard
├── Matches
├── Predictions
├── Users
├── Subscriptions
├── Payments
├── Notifications
├── Analytics
├── Audit Logs
├── AI Engine
└── Settings
```

---

# Admin Dashboard

Displays

- Total Users
- Active Premium Users
- Matches Today
- Published Predictions
- Revenue
- Failed Payments
- Pending Imports
- AI Generation Queue

Quick Actions

- Import Fixtures
- Create Match
- Generate Predictions
- Publish Predictions
- View Audit Logs

---

# Users Management

Route

/admin/users

Display

- Avatar
- Name
- Email
- Role
- Subscription
- Status
- Registration Date

Search

- Name
- Email

Filters

- Role
- Subscription
- Status

Actions

- View User
- Edit Role
- Suspend
- Restore
- Grant Premium
- View Activity

Only Super Admin may assign Admin roles.

---

# Match Management

Route

/admin/matches

Features

- Import Fixtures
- Create Match
- Edit Match
- Archive Match
- Search
- Filters
- Bulk Actions

Bulk Actions

- Publish
- Archive
- Generate AI
- Re-sync Fixtures

---

# Prediction Management

Route

/admin/predictions

Display

- Match
- League
- Prediction
- Confidence
- AI Status
- Publish Status

Actions

- Generate AI Prediction
- Edit Prediction
- Edit AI Explanation
- Save Draft
- Publish
- Unpublish
- Archive

Bulk Actions

- Publish Selected
- Archive Selected
- Regenerate AI

Only Published predictions are visible to users.

---

# AI Engine Management

Route

/admin/ai

Display

- AI Queue
- Generation Status
- Failed Jobs
- Success Rate
- Average Processing Time

Actions

- Retry Failed Jobs
- Cancel Job
- Generate Prediction
- Regenerate Explanation

Future

- AI Prompt Management
- Model Selection
- Cost Dashboard

---

# Subscription Management

Route

/admin/subscriptions

Display

- User
- Plan
- Status
- Expiration
- Payment Status

Actions

- Grant Complimentary Premium
- Extend Subscription
- Cancel Subscription
- View Billing

---

# Payments Management

Route

/admin/payments

Display

- Transaction Reference
- User
- Amount
- Currency
- Method
- Status
- Date

Actions

- View Details
- Verify Payment
- Retry Verification
- Refund (Future)

---

# Notification Management

Route

/admin/notifications

Actions

- Send Announcement
- Send Maintenance Notice
- Broadcast Notification

Future

- Scheduled Campaigns

---

# Analytics Dashboard

Display

Users

Revenue

Predictions

Accuracy

Subscriptions

Payments

Matches

AI Performance

Charts

- Revenue
- User Growth
- Premium Conversion
- Prediction Accuracy
- Daily Active Users

---

# Audit Logs

Route

/admin/audit

Every privileged action must be logged.

Display

- User
- Action
- Entity
- Timestamp
- IP Address
- Device

Filters

- User
- Action
- Date

Audit records are immutable.

---

# Platform Settings

Only Super Admin

Manage

- Site Name
- Branding
- Maintenance Mode
- Feature Flags
- API Keys (Metadata Only)
- Default Subscription Pricing
- Email Templates
- Legal Pages

Sensitive secrets must never be editable from the UI.

---

# Admin Roles

## Admin

Can

- Manage Matches
- Manage Predictions
- Manage Users
- View Analytics
- Manage Notifications

Cannot

- Create Admins
- Modify System Settings
- View Secrets

---

## Super Admin

Can

- Everything

Additional Permissions

- Create Admins
- Remove Admins
- Platform Settings
- Feature Flags
- Audit Review
- System Configuration

---

# Search

Every admin table supports

- Search
- Filters
- Pagination
- Sorting
- Export (Future)

---

# Bulk Actions

Supported

Users

- Suspend
- Restore

Matches

- Publish
- Archive

Predictions

- Publish
- Archive
- Generate AI

Notifications

- Broadcast

Subscriptions

- Extend

---

# Dashboard Widgets

Widgets

- Revenue Today
- Active Users
- Premium Users
- AI Queue
- Upcoming Fixtures
- Published Predictions
- Failed Jobs
- Failed Payments

Widgets should be configurable.

---

# API Endpoints

GET /api/admin/dashboard

GET /api/admin/users

GET /api/admin/matches

GET /api/admin/predictions

GET /api/admin/payments

GET /api/admin/subscriptions

GET /api/admin/analytics

GET /api/admin/audit

PATCH /api/admin/users/:id

PATCH /api/admin/predictions/:id

PATCH /api/admin/matches/:id

POST /api/admin/matches/import

POST /api/admin/predictions/generate

POST /api/admin/notifications/broadcast

---

# Security

Every admin request must

- Validate session
- Validate role
- Log audit event

Critical actions require confirmation.

Examples

- Delete
- Suspend
- Publish
- Archive
- Grant Premium

---

# Performance

Dashboard widgets should load independently.

Large tables should use:

- Pagination
- Server-side filtering
- Database indexes

Long-running tasks

- AI generation
- Fixture imports
- Email broadcasts

should execute as background jobs.

---

# Accessibility

Support

- Keyboard navigation
- Screen readers
- Focus indicators
- High contrast mode

---

# Analytics

Track

- Admin Login
- Prediction Published
- Fixture Imported
- AI Generation Started
- AI Generation Failed
- User Suspended
- Subscription Granted
- Broadcast Sent

---

# Error Handling

Examples

Permission denied

Import failed

Prediction generation failed

Database transaction failed

Webhook verification failed

Errors should be logged with correlation IDs.

---

# Future Enhancements

Support

- Multi-admin collaboration
- Admin comments
- Internal notes
- Approval workflows
- Scheduled publishing
- Role-specific dashboards
- Multi-language administration

---

# Success Criteria

The Admin Module is complete when:

- Administrators can manage all platform resources.
- Every privileged action is audited.
- Background jobs are reliable.
- Authorization is enforced consistently.
- Performance scales with platform growth.
- Sensitive operations require confirmation.

---

# Next Document

Proceed to

17_AI_ENGINE.md