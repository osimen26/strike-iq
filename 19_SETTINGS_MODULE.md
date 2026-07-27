# 19_SETTINGS_MODULE.md

# Strike IQ Settings Module

Version: 1.0.0

Status: Approved

Related Documents

- 03_ARCHITECTURE.md
- 04_DATABASE.md
- 05_API.md
- 06.5_AUTHORIZATION.md
- 16_ADMIN_MODULE.md

---

# Purpose

The Settings Module allows Super Administrators to configure global platform settings without modifying the application code.

These settings affect the behavior of the Strike IQ platform and are available only to authorized administrators.

---

# Objectives

The Settings Module should allow Super Administrators to:

- Update general platform settings
- Manage feature availability
- Configure AI settings
- Configure payment settings
- Configure email settings
- Enable or disable maintenance mode
- Manage legal pages
- Configure application preferences

---

# Navigation

Route

/admin/settings

---

# Settings Categories

The Settings Module contains the following sections:

- General
- AI
- Payments
- Email
- Features
- Maintenance
- Legal

---

# General Settings

Manage:

- Platform Name
- Platform Description
- Support Email
- Contact Email
- Default Timezone
- Default Currency

---

# AI Settings

Manage:

- AI Provider
- AI Model
- Default Prediction Confidence Threshold
- Enable AI Prediction Generation

Future

- Multiple AI Providers
- Prompt Version Selection

---

# Payment Settings

Display

- Flutterwave Status
- Supported Currency

Manage

- Premium Monthly Price
- Premium Yearly Price

Payment Secret Keys must never be editable from the dashboard.

---

# Email Settings

Display

- Resend Connection Status
- Sender Email
- Sender Name

Manage

- Welcome Email
- Payment Confirmation Email
- Subscription Email
- Password Reset Email

Email API Keys must never be editable from the dashboard.

---

# Feature Management

Enable or disable features.

Examples

- Premium Predictions
- AI Explanations
- User Registration
- Google Login
- Match Import
- AI Generation

Feature changes should take effect immediately.

---

# Maintenance Mode

Super Administrators may:

- Enable Maintenance Mode
- Disable Maintenance Mode
- Set Maintenance Message

During maintenance:

- Users cannot access the dashboard.
- Administrators retain access.
- Landing page remains accessible.

---

# Legal Pages

Manage content for:

- Privacy Policy
- Terms of Service
- Cookie Policy

Content should support rich text editing.

---

# API Endpoints

GET /api/admin/settings

PATCH /api/admin/settings/general

PATCH /api/admin/settings/ai

PATCH /api/admin/settings/payments

PATCH /api/admin/settings/email

PATCH /api/admin/settings/features

PATCH /api/admin/settings/maintenance

PATCH /api/admin/settings/legal

---

# Database Tables

settings

feature_flags

---

# Security

Only Super Administrators may:

- Modify settings
- Enable maintenance mode
- Change feature availability

Every settings update must:

- Validate permissions
- Create an audit log
- Record the administrator who made the change

---

# Validation

Validate:

- Required fields
- Email format
- Numeric values
- Currency values
- Boolean feature flags

Prevent invalid configuration values.

---

# Performance

Settings should be cached after retrieval.

Cache should refresh automatically whenever settings are updated.

---

# Error Handling

Handle:

- Validation errors
- Permission denied
- Database errors
- Invalid configuration

Return user-friendly messages and log server-side errors.

---

# Future Enhancements

Support:

- Multiple currencies
- Multi-language settings
- White-label branding
- Theme customization
- API management
- Backup and Restore

---

# Success Criteria

The Settings Module is complete when:

- Super Administrators can manage platform settings.
- Feature flags work correctly.
- Maintenance mode functions properly.
- Sensitive secrets remain secure.
- All changes are audited.

---

# Next Document

Proceed to

20_DEPLOYMENT.md