```markdown
# 20_DEPLOYMENT.md

# Strike IQ Deployment

Version: 1.0.0

Status: Approved

Related Documents

- 03_ARCHITECTURE.md
- 04_DATABASE.md
- 05_API.md
- 06_AUTHENTICATION.md
- 07_DESIGN_SYSTEM.md
- 08_COMPONENT_LIBRARY.md
- 12_SUBSCRIPTIONS_MODULE.md
- 13_PAYMENTS_MODULE.md

---

# Purpose

This document defines how the Strike IQ platform is deployed, configured, and maintained across development and production environments.

The deployment process should ensure reliable releases, secure configuration management, and minimal downtime.

---

# Technology Stack

Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

Backend

- Next.js Route Handlers
- Server Actions

Database

- Supabase PostgreSQL

Authentication

- Supabase Auth
- Google OAuth

Payments

- Flutterwave

Email

- Resend

Artificial Intelligence

- OpenAI

Hosting

- Vercel

Storage

- Supabase Storage

Version Control

- GitHub

---

# Environments

Development

Local development environment.

Production

Live environment accessible by users.

---

# Deployment Architecture

Users

↓

Vercel

↓

Next.js Application

↓

Supabase

├── Authentication

├── PostgreSQL Database

└── Storage

↓

External Services

- Flutterwave
- OpenAI
- Resend
- Google OAuth

---

# Environment Variables

Application

NEXT_PUBLIC_APP_URL

NEXT_PUBLIC_APP_NAME

---

Supabase

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

---

Google OAuth

GOOGLE_CLIENT_ID

GOOGLE_CLIENT_SECRET

---

Flutterwave

FLUTTERWAVE_PUBLIC_KEY

FLUTTERWAVE_SECRET_KEY

FLUTTERWAVE_WEBHOOK_SECRET

---

OpenAI

OPENAI_API_KEY

---

Resend

RESEND_API_KEY

FROM_EMAIL

---

Security

JWT_SECRET

---

# Deployment Process

Deployment workflow

1. Push code to GitHub
2. GitHub triggers Vercel deployment
3. Install dependencies
4. Run linting
5. Run type checking
6. Build application
7. Apply database migrations
8. Deploy application
9. Verify deployment health

---

# Build Requirements

Before deployment, ensure:

- TypeScript compiles successfully.
- ESLint passes.
- Production build completes successfully.
- Environment variables are configured.
- Database migrations are ready.
- All Design System components compile successfully.
- Design Tokens are available.
- Shared UI Components build successfully.

Deployment must fail if any required step fails.

---

# Design System Validation

The deployed application must:

- Use the shared Design System.
- Use approved UI components from the Component Library.
- Use design tokens consistently.
- Avoid duplicate UI components.
- Preserve responsive layouts.
- Preserve accessibility requirements.

---

# Database Deployment

Database updates must:

- Use version-controlled migrations.
- Be tested locally before production.
- Preserve existing data.
- Avoid manual schema changes in production.

---

# Storage

Provider

Supabase Storage

Used for

- User avatars
- Future uploaded assets

Requirements

- Validate file type.
- Validate file size.
- Secure uploads.
- Public access only where required.

---

# Domain

Production

https://strikeiq.ai

Future

admin.strikeiq.ai

---

# SSL

HTTPS is required.

Redirect all HTTP traffic to HTTPS.

---

# Monitoring

Monitor

- Application availability
- API availability
- Database availability
- Authentication
- Payment webhooks
- AI generation
- Email delivery

---

# Logging

Log

- Deployment failures
- API errors
- Authentication errors
- Payment verification failures
- AI generation failures

Sensitive data must never be logged.

---

# Backup Strategy

Supabase automatic backups should remain enabled.

Database backups must be restorable.

Uploaded files remain in Supabase Storage.

---

# Rollback Strategy

If deployment fails

- Roll back to the previous deployment.
- Verify database integrity.
- Restore service availability.

---

# Security

Production secrets must

- Be stored in Vercel Environment Variables.
- Never be committed to Git.
- Never be exposed to the client.

Service Role Keys must only be used on the server.

---

# Performance

The deployed application should

- Optimize images.
- Optimize fonts.
- Cache static assets.
- Use lazy loading.
- Code split dashboard routes.
- Use Design System components efficiently.
- Avoid loading unused UI components.

---

# Deployment Checklist

Before Deployment

- Code reviewed
- Lint passes
- TypeScript passes
- Build successful
- Design System validated
- Component Library validated
- Database migrations ready
- Environment variables configured

After Deployment

- Landing page loads
- Dashboard loads
- Authentication works
- Google OAuth works
- Flutterwave checkout works
- Payment webhook works
- AI prediction generation works
- Email delivery works
- Profile image uploads work

---

# Success Criteria

Deployment is complete when

- Application builds successfully.
- Deployment succeeds.
- Design System renders correctly.
- Component Library functions correctly.
- Authentication works.
- Payments work.
- AI generation works.
- Emails send successfully.
- Production environment is healthy.

---

# Next Document

Proceed to

21_TESTING.md
```
