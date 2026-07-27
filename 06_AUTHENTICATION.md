# 06_AUTHENTICATION.md

# Strike IQ Authentication Specification


Related Documents

- 00_PROJECT_OVERVIEW.md
- 01_ENGINEERING_RULES.md
- 02_APPLICATION_PRD.md
- 03_ARCHITECTURE.md
- 04_DATABASE.md
- 05_API.md

---

# Purpose

This document defines the authentication architecture for Strike IQ.

Authentication is responsible for:

- User Registration
- Login
- Logout
- Google OAuth
- Email Verification
- Password Reset
- Session Management
- Route Protection

Authentication identifies users but does not determine feature access. Authorization and subscription checks are handled separately.

---

# Authentication Stack

Framework

- Next.js 15

Authentication

- Better Auth (Community Edition)

Database

- PostgreSQL

ORM

- Prisma

OAuth Provider

- Google OAuth

Email Provider

- Resend

Deployment

- Vercel

---

# Authentication Methods

The application supports the following methods.

## Email & Password

Users can:

- Register
- Login
- Reset Password
- Verify Email

---

## Google OAuth

Users may authenticate using their Google account.

If an account with the same email already exists, it must be linked automatically.

Duplicate accounts must never be created.

---

# User Lifecycle

```text
Visitor
      │
      ▼
Register
      │
      ▼
Email Verification
      │
      ▼
Login
      │
      ▼
Session Created
      │
      ▼
Dashboard
```

---

# Registration Flow

## Goal

Create a secure account.

### Steps

1. User enters:

- Name
- Email
- Password

2. Validate input.

3. Check email uniqueness.

4. Hash password.

5. Create user.

6. Generate verification token.

7. Send verification email.

8. Await verification.

9. Activate account.

---

# Google OAuth Flow

```text
Login

↓

Google OAuth

↓

Better Auth

↓

Retrieve Google Profile

↓

Existing User?

↓

Yes ───────────────► Login

↓

No

↓

Create Account

↓

Create Session

↓

Dashboard
```

---

# Login Flow

Steps

1. Validate credentials.
2. Retrieve user.
3. Verify password.
4. Create secure session.
5. Redirect to dashboard.

---

# Logout Flow

Steps

1. Destroy session.
2. Clear cookies.
3. Redirect to landing page.

---

# Password Reset

Workflow

1. User requests password reset.
2. Generate secure token.
3. Store token.
4. Send email using Resend.
5. User opens link.
6. Validate token.
7. Update password.
8. Delete token.
9. Redirect to login.

---

# Email Verification

Workflow

1. Generate verification token.
2. Send email.
3. User clicks verification link.
4. Validate token.
5. Mark emailVerified = true.
6. Delete token.

---

# Session Management

Better Auth manages secure sessions.

Sessions should:

- Be HTTP Only.
- Use Secure Cookies in production.
- Automatically expire.
- Support session refresh.
- Be invalidated on logout.

---

# Authentication States

Guest

- Can access public pages.

Authenticated User

- Can access dashboard.

Authenticated Premium

- Can access premium features.

Administrator

- Can access admin dashboard.

Super Admin

- Full system access.

---

# Route Protection

## Public

- /
- /pricing
- /about
- /faq
- /login
- /register
- /forgot-password

---

## Protected

- /dashboard
- /profile
- /settings
- /billing
- /notifications

---

## Admin

- /admin
- /admin/users
- /admin/predictions
- /admin/matches
- /admin/analytics

---

# Middleware Rules

Every protected request must verify:

- Session exists.
- Session is valid.
- User exists.
- Account is active.

Admin routes must additionally verify:

- User role.

Premium features must additionally verify:

- Active subscription.

---

# User Roles

```text
Guest

↓

User

↓

Premium

↓

Admin

↓

Super Admin
```

Role is stored in the User table.

Subscription status is stored separately.

Never use roles to determine Premium access.

---

# Authentication Events

Log the following events.

- Registration
- Login
- Logout
- Email Verification
- Password Reset
- Google OAuth Login
- Failed Login
- Session Expired

---

# Security Requirements

Passwords

- Never stored in plain text.

Tokens

- Single-use.
- Expire automatically.

Cookies

- HTTP Only
- Secure
- SameSite=Lax

Rate Limiting

- Login
- Register
- Forgot Password

Email verification links expire after 24 hours.

Password reset links expire after 30 minutes.

---

# Environment Variables

```env
DATABASE_URL=

BETTER_AUTH_SECRET=

BETTER_AUTH_URL=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

RESEND_API_KEY=

EMAIL_FROM=
```

---

# Better Auth Configuration

Better Auth should be configured with:

- Prisma Adapter
- Google OAuth Provider
- Email & Password Provider
- Resend Email Integration
- Secure Sessions

The configuration should remain modular and reusable.

---

# Error Handling

Authentication errors must never expose sensitive information.

Examples

- Invalid credentials
- Email already exists
- Invalid verification token
- Password reset expired
- Session expired

Always return user-friendly messages.

---

# Testing Requirements

Authentication testing must cover:

- Registration
- Login
- Google OAuth
- Logout
- Password Reset
- Email Verification
- Session Expiry
- Route Protection
- Middleware

---

# Success Criteria

Authentication is complete when:

- Users can register successfully.
- Google OAuth functions correctly.
- Verification emails are delivered.
- Password reset works.
- Sessions remain secure.
- Protected routes are inaccessible to guests.
- Authentication integrates seamlessly with the User Dashboard and Admin Dashboard.

---

# Next Document

Proceed to **06.5_AUTHORIZATION.md**

This document defines role-based access control, Premium feature gating, middleware authorization, server action guards, and resource ownership policies.