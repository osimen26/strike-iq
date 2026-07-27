# 08_COMPONENT_LIBRARY.md

# Strike IQ Component Library


Related Documents

- 07_DESIGN_SYSTEM.md
- 03_ARCHITECTURE.md
- 02_APPLICATION_PRD.md

---

# Purpose

This document defines every reusable UI component used throughout Strike IQ.

Every component must be:

- Reusable
- Accessible
- Fully typed
- Responsive
- Theme aware
- Production ready

The application should build on top of shadcn/ui whenever possible instead of creating custom implementations.

---

# Component Architecture

Each component should contain:

Component

Logic

Types

Stories (Future)

Tests

Documentation

Example structure

components/

Button/

Button.tsx

Button.types.ts

Button.test.tsx

index.ts

---

# Foundation Components

## Button

Purpose

Primary interaction component.

Variants

- Primary
- Secondary
- Outline
- Ghost
- Link
- Destructive

Sizes

- Small
- Medium
- Large
- Icon

States

- Default
- Hover
- Focus
- Active
- Disabled
- Loading

Accessibility

- Keyboard accessible
- Focus visible
- ARIA labels where appropriate

---

## Input

Features

- Label
- Helper text
- Validation
- Prefix
- Suffix
- Error message
- Disabled state

Types

- Text
- Email
- Password
- Search
- Number

---

## Textarea

Supports

- Auto resize
- Character count
- Validation
- Disabled state

---

## Select

Supports

- Search
- Keyboard navigation
- Placeholder
- Disabled state
- Clear option

---

## Checkbox

Supports

- Label
- Description
- Error state

---

## Radio Group

Supports

- Horizontal
- Vertical
- Validation

---

## Switch

Used for

- Settings
- Notifications
- Preferences

---

## Badge

Variants

- Success
- Warning
- Error
- Info
- Premium

---

## Avatar

Supports

- Image
- Initials
- Fallback

---

## Spinner

Used during asynchronous operations.

---

## Skeleton

Used while loading data.

---

# Navigation Components

## Sidebar

Features

- Collapsible
- Nested navigation
- Active state
- Icons
- Role-aware items

---

## Top Navigation

Contains

- Search
- Notifications
- User menu
- Theme switcher

---

## Breadcrumb

Shows current page hierarchy.

---

# Feedback Components

## Alert

Variants

- Success
- Error
- Warning
- Info

---

## Toast

Use Sonner.

Supports

- Success
- Error
- Loading
- Promise handling

---

## Empty State

Used for

- No predictions
- No notifications
- No saved matches

Each empty state should include:

- Illustration
- Message
- Call to Action

---

## Error State

Used when data cannot be loaded.

Should provide retry actions.

---

# Data Display Components

## Card

Variants

- Default
- Statistics
- Prediction
- Premium
- Admin

---

## Statistic Card

Displays

- Revenue
- Active Users
- Accuracy
- Premium Members

Supports

- Trend
- Percentage
- Icon

---

## Prediction Card

Displays

- Teams
- League
- Match Time
- Prediction
- Confidence
- AI Summary
- Save Button

---

## Confidence Badge

Displays

- Low
- Medium
- High
- Very High

Uses semantic colors only.

---

## League Badge

Displays league branding consistently.

---

## Team Logo

Displays optimized team logos.

Supports fallback.

---

# Table Components

## Data Table

Features

- Sorting
- Filtering
- Pagination
- Search
- Loading
- Empty state
- Row actions
- Responsive

---

# Form Components

## Form Wrapper

Provides

- Validation
- Error summary
- Submit handling

---

## Password Input

Supports

- Show/Hide password
- Strength indicator

---

## Search Field

Supports

- Debounce
- Clear button

---

# Modal Components

## Dialog

Used for

- Confirmations
- Editing
- Viewing details

---

## Confirmation Modal

Reusable confirmation component.

Examples

- Delete
- Publish
- Archive
- Cancel Subscription

---

# Dashboard Components

## Dashboard Header

Contains

- Title
- Description
- Actions

---

## Dashboard Section

Reusable content container.

---

## Metric Card

Displays

- Value
- Label
- Trend
- Change Percentage

---

## Chart Card

Wraps charts consistently.

---

## Activity Feed

Displays

- User actions
- Prediction updates
- Payment events

---

# Prediction Components

## Prediction List

Supports

- Filters
- Infinite scroll (future)
- Pagination

---

## Prediction Details

Displays

- Match details
- Statistics
- AI explanation
- Confidence score
- Historical performance

---

## AI Explanation Panel

Displays

- Summary
- Supporting statistics
- Key insights

---

# Admin Components

## Match Form

Supports

- Create
- Edit

---

## Prediction Editor

Supports

- AI draft
- Manual editing
- Publish
- Save draft

---

## User Table

Displays

- Name
- Email
- Role
- Subscription
- Status

Supports admin actions.

---

## Audit Timeline

Displays administrative history.

---

# Billing Components

## Subscription Card

Displays

- Current Plan
- Renewal Date
- Status

---

## Payment History Table

Displays

- Amount
- Date
- Status
- Method

---

# Notification Components

## Notification Item

Displays

- Icon
- Message
- Timestamp
- Read state

---

## Notification Center

Supports

- Mark as read
- Mark all as read
- Filtering

---

# Component Standards

Every component must:

- Accept className
- Forward refs when appropriate
- Be fully typed
- Support dark mode
- Support loading state
- Support disabled state
- Avoid inline styles
- Use semantic HTML

---

# Accessibility

All components must:

- Support keyboard navigation
- Include focus indicators
- Meet WCAG 2.2 AA
- Expose correct ARIA attributes

---

# Testing

Each component should include:

- Unit tests
- Accessibility tests
- Interaction tests

---

# Success Criteria

The component library is complete when:

- Every screen is built using reusable components.
- No duplicate components exist.
- Components are documented.
- Components are theme aware.
- Components are responsive.
- Components are accessible.

---

# Next Document

Proceed to **09_USER_DASHBOARD.md**

This document defines every authenticated user page, layout, interaction, and workflow for the Strike IQ platform.