# 14_PROFILE_MODULE.md

# Strike IQ Profile Module

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

The Profile Module allows users to manage their personal account information, security settings, preferences, and subscription details.

This module serves as the central location for account management.

---

# Objectives

Users should be able to:

- View profile information
- Edit personal details
- Upload profile picture
- Change password
- Manage Google account connection
- Configure notification preferences
- View subscription details
- View account activity
- Delete account (Future)

---

# Navigation

Routes

/dashboard/profile

/dashboard/profile/account

/dashboard/profile/security

/dashboard/profile/preferences

/dashboard/profile/subscription

---

# Profile Overview

Display

- Avatar
- Full Name
- Email Address
- Role
- Premium Status
- Join Date
- Last Login

Quick Actions

- Edit Profile
- Change Password
- Manage Subscription
- Notification Settings

---

# Personal Information

Editable Fields

- First Name
- Last Name
- Display Name
- Country
- Timezone

Read Only

- Email Address
- User ID
- Account Created Date

Validation

- Required fields
- Maximum character limits
- Prevent invalid characters

---

# Profile Picture

Users may

- Upload image
- Replace image
- Remove image

Requirements

- JPG
- PNG
- WEBP

Maximum Size

5MB

Storage

Supabase Storage

Generate optimized thumbnails.

---

# Security

Users may

- Change password
- View active sessions
- Logout other devices
- View recent login history

Google OAuth users

- Cannot change password unless a password has been set.

---

# Active Sessions

Display

- Device
- Browser
- IP Address
- Location (Approximate)
- Last Active

Actions

- Logout Session
- Logout All Devices

Current session cannot be accidentally revoked without confirmation.

---

# Notification Preferences

Users may configure

Email Notifications

- Prediction Alerts
- Subscription Updates
- Security Alerts
- Marketing Emails

Future

Push Notifications

SMS Notifications

---

# Theme Preferences

Users may select

- Light
- Dark
- System

Preference should sync across devices.

---

# Language

Initial Support

English

Future

French

Spanish

Arabic

---

# Subscription Summary

Display

Current Plan

Status

Renewal Date

Expiration Date

Payment Method

Actions

Upgrade

Renew

Cancel

View Billing History

---

# Account Activity

Display

- Recent logins
- Password changes
- Subscription changes
- Security events

Maximum

20 records

---

# Forms

Every form must support

- Client Validation
- Server Validation
- Optimistic UI
- Loading State
- Success Feedback
- Error Feedback

Validation Library

Zod

---

# API Endpoints

GET /api/profile

PATCH /api/profile

POST /api/profile/avatar

DELETE /api/profile/avatar

PATCH /api/profile/password

GET /api/profile/sessions

DELETE /api/profile/sessions/:id

DELETE /api/profile/sessions

PATCH /api/profile/preferences

GET /api/profile/activity

---

# Database Tables

users

user_preferences

sessions

subscriptions

audit_logs

---

# Security

Every profile update must

- Validate session
- Validate ownership
- Log audit event

Sensitive actions

Require password confirmation

Examples

- Password change
- Email change (Future)
- Delete account

---

# Accessibility

Support

- Keyboard navigation
- Screen readers
- Focus indicators
- Accessible forms
- High contrast mode

---

# Analytics

Track

- Profile Updated
- Avatar Uploaded
- Password Changed
- Session Revoked
- Theme Changed
- Notification Preference Updated

---

# Error Handling

Examples

Invalid Image

Password Too Weak

Session Expired

Validation Failed

Unauthorized

Provide clear recovery actions.

---

# Future Enhancements

Support

- Two-Factor Authentication (2FA)
- Passkeys
- Account Export
- Account Deletion
- Social Connections
- Device Trust

---

# Success Criteria

The Profile Module is complete when

- Users can manage profile information.
- Security settings function correctly.
- Sessions can be managed.
- Preferences persist.
- Subscription information is accurate.
- Profile updates are secure.

---

# Next Document

Proceed to

15_NOTIFICATIONS_MODULE.md