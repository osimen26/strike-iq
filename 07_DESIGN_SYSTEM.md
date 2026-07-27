# 07_DESIGN_SYSTEM.md

# Strike IQ Design System Specification


Related Documents

- 00_PROJECT_OVERVIEW.md
- 01_ENGINEERING_RULES.md
- 02_APPLICATION_PRD.md
- 03_ARCHITECTURE.md
- 06_AUTHENTICATION.md
- 06.5_AUTHORIZATION.md

---

# Purpose

This document defines the visual language for the authenticated Strike IQ platform.

The goal is not to redesign the brand.

Instead, the authenticated application should extend the existing React marketing website into a complete product experience.

Users should feel they are using one product—not switching between two applications.

---

# Design Philosophy

Strike IQ should communicate:

- Trust
- Intelligence
- Precision
- Performance
- Simplicity

Every interface should reduce cognitive load.

Every interaction should feel intentional.

The design should prioritize clarity over decoration.

---

# Design Principles

Every screen should answer:

- Where am I?
- What can I do?
- What should I do next?

Avoid visual clutter.

Avoid unnecessary animations.

Prioritize readability.

---

# Existing Brand

The existing marketing website is the source of truth for:

- Primary colors
- Typography
- Brand identity
- Logo
- Visual tone
- Illustration style
- Marketing imagery

The authenticated platform must inherit these foundations.

Do not redesign the existing brand.

---

# Design Tokens

The design system should create reusable design tokens.

## Color Tokens

Create semantic color variables.

Examples

- Primary
- Secondary
- Background
- Surface
- Border
- Text Primary
- Text Secondary
- Success
- Warning
- Error
- Info

Avoid hardcoded colors.

Use CSS variables.

---

## Typography

Create reusable typography tokens.

Levels

- Display
- H1
- H2
- H3
- H4
- Body Large
- Body
- Small
- Caption

Typography should match the marketing website.

---

## Spacing

Use an 8-point spacing system.

Examples

- 4
- 8
- 12
- 16
- 24
- 32
- 40
- 48
- 64

Never use arbitrary spacing values.

---

## Border Radius

Create reusable radius tokens.

Examples

- Small
- Medium
- Large
- Extra Large
- Full

---

## Shadows

Create elevation tokens.

Levels

- Small
- Medium
- Large
- Floating

Shadows should remain subtle.

---

## Iconography

Use a single icon library.

Recommended

- Lucide React

Icons should:

- Be consistent
- Match stroke width
- Support dark mode

---

# Layout System

The authenticated platform consists of:

- Sidebar
- Top Navigation
- Content Area
- Utility Panel (Future)

Layouts should remain consistent across all pages.

---

# Grid System

Desktop

12-column grid.

Tablet

8-column grid.

Mobile

4-column grid.

Use responsive layouts.

---

# Dashboard Layout

Every dashboard page should contain:

- Sidebar
- Header
- Breadcrumb
- Page Title
- Action Area
- Main Content
- Footer (Optional)

---

# Theme Support

The application should support:

- Light Mode
- Dark Mode
- System Theme

Theme preference should persist across sessions.

---

# Motion Principles

Animations should communicate state.

Use motion only for:

- Page transitions
- Modal appearance
- Loading indicators
- Dropdowns
- Notifications

Avoid decorative animations.

Use Framer Motion.

---

# Loading States

Every asynchronous component should provide a loading state.

Examples

- Skeleton loaders
- Progress indicators
- Button loading state

Never leave blank screens.

---

# Empty States

Every data-driven page should include meaningful empty states.

Examples

- No predictions
- No notifications
- No saved matches
- No subscriptions

Empty states should guide users toward the next action.

---

# Error States

Every page should include consistent error handling.

Examples

- Network failure
- Permission denied
- Server error
- Data unavailable

Provide clear messaging and recovery actions.

---

# Accessibility

The design system must support:

- WCAG 2.2 AA
- Keyboard navigation
- Screen readers
- Focus indicators
- Accessible forms
- Color contrast compliance

Accessibility is required—not optional.

---

# Responsive Design

Support:

Desktop

≥ 1280px

Laptop

1024px

Tablet

768px

Mobile

390px+

Every page must be responsive.

---

# Component Rules

Every reusable component must:

- Accept variants
- Support loading state
- Support disabled state
- Support dark mode
- Be fully typed
- Be accessible

Avoid duplicate components.

---

# Dashboard Experience

The dashboard should feel:

- Fast
- Calm
- Professional
- Data-driven

Avoid excessive gradients or visual noise.

Data should always remain the primary focus.

---

# Charts

Use a consistent charting library.

Recommended

- Recharts

Supported charts

- Line
- Bar
- Pie
- Area
- Donut

Charts must support dark mode.

---

# Forms

Every form should support:

- Client validation
- Server validation
- Loading state
- Success state
- Error state

Validation should use Zod.

---

# Tables

Tables should support:

- Search
- Pagination
- Sorting
- Filtering
- Row actions
- Empty state
- Loading state

---

# Notifications

Notifications should support:

- Success
- Warning
- Error
- Information

Recommended library

- Sonner

---

# Design System Deliverables

The design system should produce:

- Design Tokens
- Layout System
- Theme System
- Component Library
- Form Patterns
- Table Patterns
- Modal Patterns
- Dashboard Templates
- Accessibility Standards

---

# Success Criteria

The design system is complete when:

- All components share consistent styling.
- Branding matches the marketing website.
- No hardcoded design values exist.
- Dark mode is fully supported.
- Accessibility requirements are met.
- Components are reusable across the platform.

---

# Next Document

Proceed to **08_COMPONENT_LIBRARY.md**.

This document defines every reusable UI component, its purpose, properties, variants, states, accessibility requirements, and implementation guidelines.