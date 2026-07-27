# Strike IQ Project Overview

---

# Overview

Strike IQ is an AI-powered Sports Betting Intelligence Platform that helps users make informed betting decisions using explainable AI, statistical analysis, confidence scoring, and structured sports data.

Strike IQ is **not** a sportsbook or gambling operator. The platform provides intelligent decision support through transparent insights and analytics.

This repository contains the authenticated application that powers Strike IQ.


# Phase 1 — Foundation

Objective

Establish the core development environment and project infrastructure for the Strike IQ platform.

Tasks

- Initialize the Next.js application
- Configure TypeScript
- Configure GitHub repository
- Configure Supabase project
- Configure Google OAuth authentication
- Configure Flutterwave integration
- Configure Resend integration
- Configure OpenAI integration
- Configure Vercel deployment
- Configure environment variables
- Establish the shared Design System
- Build the shared Component Library

Deliverables

- Running Next.js application
- Connected Supabase project
- Shared Design System
- Shared Component Library
- Initial deployment pipeline

Status

Completed

---

# Current Project Status

## Completed

The public marketing website has already been designed and developed.

Technology:

* React
* TypeScript
* Tailwind CSS

The marketing website includes:

* Landing Page
* Features
* Pricing
* FAQ
* Testimonials
* Footer
* Responsive Layout

The marketing website is **outside the scope** of this implementation.

Do not redesign, replace, or modify it unless specifically requested.

---

# Scope

Development begins after the visitor clicks:

* Get Started
* Login
* Register

This project is responsible for building the authenticated platform.

---

# Objectives

Build a production-ready application including:

* Authentication
* User Dashboard
* Admin Dashboard
* AI Prediction Engine
* Prediction Management
* Premium Subscription
* Billing
* Notifications
* Analytics
* Backend APIs
* Database
* Deployment

---

# Platform Architecture

The Strike IQ ecosystem consists of two frontend applications connected to one shared backend.

## Marketing Website

Status: Complete

Technology:

* React
* TypeScript
* Tailwind CSS

Responsibilities:

* Marketing
* SEO
* Product Information
* Pricing
* Visitor Conversion

The marketing website should only redirect users into the authenticated application.

Business logic must never live here.

---

## Authenticated Platform

Status: In Development

Technology:

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS

Responsibilities:

* Authentication
* User Dashboard
* Admin Dashboard
* AI Predictions
* Billing
* Notifications
* Analytics
* Settings

All business logic belongs here.

---

# Shared Backend

Both frontend applications share the same backend services.

Backend Stack

* PostgreSQL
* Prisma ORM
* Better Auth
* Google OAuth
* Flutterwave
* Upstash Redis
* Supabase Storage

The backend is the single source of truth.

---

# Development Principles

Every implementation should prioritize:

* Trust
* Performance
* Security
* Scalability
* Maintainability
* Accessibility
* Reusability

Avoid:

* Duplicate business logic
* Hardcoded values
* Placeholder code
* Tight coupling
* Technical debt

---

# Design

A design system has **not** been created yet.

The authenticated platform should establish its own reusable design system during development.

The design system should include:

* Color Tokens
* Typography Scale
* Spacing Scale
* Grid System
* Border Radius
* Shadows
* Icons
* Buttons
* Forms
* Tables
* Cards
* Dialogs
* Navigation Components
* Dashboard Components
* Charts
* Empty States
* Loading States

All new UI components should be built using this design system.

The visual language should remain consistent with the existing marketing website while expanding it for authenticated experiences.

---

# Authentication

Authentication will use:

* Better Auth
* Google OAuth
* Email & Password

Users should authenticate once and maintain secure sessions.

---

# Payments

Subscriptions will use Flutterwave.

Supported payment methods:

* Card
* Bank Transfer
* USSD
* Mobile Money

Premium access must only be granted after successful server-side payment verification.

---

# AI Workflow

Predictions follow this lifecycle:

1. Match imported or created manually.
2. AI analyzes available data.
3. AI generates prediction draft.
4. Administrator reviews prediction.
5. Administrator edits if necessary.
6. Prediction is published.
7. Published prediction becomes immediately available to users.

AI assists administrators but never publishes content automatically.

---

# Admin Dashboard

The Admin Dashboard functions as the operational control center.

Administrators can:

* Upload matches
* Generate predictions
* Edit predictions
* Publish predictions
* Manage users
* Manage subscriptions
* View analytics

The Admin Dashboard shares the same backend and database as the User Dashboard.

---

# User Dashboard

Users can:

* View predictions
* Read AI explanations
* Save predictions
* Upgrade to Premium
* Manage subscriptions
* Edit profile
* Manage notifications

---

# Synchronization Rules

The Marketing Website and Authenticated Platform are separate frontend applications but operate as one product.

They share:

* Backend
* Authentication
* Database
* Branding
* API Layer

The backend is the only source of truth.

No feature should duplicate business logic across applications.

---

# Repository Structure

```text
strike-iq/
│
├── marketing/              # Existing React marketing website
├── platform/               # Next.js authenticated platform
│
├── docs/
│   ├── 00_PROJECT_OVERVIEW.md
│   ├── 01_AGENT.md
│   ├── 02_APPLICATION_PRD.md
│   ├── 03_ARCHITECTURE.md
│   ├── 04_DATABASE.md
│   ├── 05_API.md
│   ├── 06_AUTH.md
│   ├── 07_PAYMENTS.md
│   ├── 08_AI_SYSTEM.md
│   ├── 09_ADMIN_DASHBOARD.md
│   ├── 10_USER_DASHBOARD.md
│   ├── 11_DESIGN_SYSTEM.md
│   ├── 12_COMPONENT_LIBRARY.md
│   ├── 13_SECURITY.md
│   ├── 14_DEPLOYMENT.md
│   ├── 15_ROADMAP.md
│   └── 16_TASKS.md
│
└── README.md
```

---

# Development Workflow

The implementation order is:

1. Read all documentation.
2. Validate documentation consistency.
3. Configure architecture.
4. Configure database.
5. Configure authentication.
6. Build the design system.
7. Build reusable components.
8. Build the User Dashboard.
9. Build the Admin Dashboard.
10. Integrate the AI workflow.
11. Configure Flutterwave billing.
12. Deploy to Vercel.
13. Test all features.
14. Optimize for production.

---

# Definition of Done

The project is complete when:

* The existing marketing website integrates seamlessly with the authenticated platform.
* Authentication is fully operational.
* The User Dashboard is complete.
* The Admin Dashboard is complete.
* AI-assisted prediction workflows function correctly.
* Flutterwave subscriptions work reliably.
* The design system is fully established and reused throughout the application.
* The application deploys successfully on Vercel.
* All documentation remains synchronized with the implementation.

