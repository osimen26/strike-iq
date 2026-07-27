````markdown
# 25_CODING_STANDARDS.md

# Strike IQ Coding Standards

Version: 1.0.0

Status: Approved

Related Documents

- 03_ARCHITECTURE.md
- 07_DESIGN_SYSTEM.md
- 08_COMPONENT_LIBRARY.md
- 21_TESTING.md
- 22_CI_CD.md
- 23_SECURITY.md
- 24_PERFORMANCE.md

---

# Purpose

This document defines the coding standards and development guidelines for the Strike IQ platform.

The objective is to ensure that the codebase remains clean, maintainable, scalable, and consistent across the entire application.

Every contributor should follow these standards.

---

# Objectives

The codebase should be:

- Readable
- Maintainable
- Reusable
- Consistent
- Well-structured
- Type-safe

---

# Technology Standards

Frontend

- Next.js App Router
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

---

# Project Structure

The project should follow a feature-based structure.

Example

```
src/

app/

components/

features/

hooks/

lib/

services/

types/

utils/

constants/

providers/

styles/
```

Each folder should have a single responsibility.

---

# Naming Conventions

Components

PascalCase

Example

PredictionCard.tsx

---

Hooks

camelCase

Example

usePredictions.ts

---

Utilities

camelCase

Example

formatCurrency.ts

---

Types

PascalCase

Example

Prediction.ts

---

Constants

UPPER_SNAKE_CASE

Example

MAX_FREE_PREDICTIONS

---

Routes

kebab-case

Example

/dashboard/profile

/admin/predictions

---

# Component Guidelines

Components should:

- Have one responsibility.
- Be reusable.
- Accept typed props.
- Avoid unnecessary complexity.
- Be easy to test.

Prefer composition over deeply nested components.

---

# Design System Rules

All UI must use:

- Design Tokens
- Shared Components
- Typography System
- Color Palette
- Spacing Scale

Do not recreate existing components.

Always check the Component Library before building new UI.

---

# TypeScript Standards

Avoid the use of:

- any

Prefer:

- interfaces
- type aliases
- enums (when appropriate)

Enable strict typing throughout the project.

---

# State Management

Use:

- React State
- React Context
- Server Components where appropriate

Avoid unnecessary global state.

---

# API Standards

API routes should:

- Validate input
- Return consistent responses
- Use appropriate HTTP status codes
- Handle errors gracefully

Standard response format

Success

```json
{
  "success": true,
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Error message"
}
```

---

# Error Handling

Handle:

- Validation errors
- Network errors
- Authentication errors
- Database errors
- External API failures

Never expose internal implementation details.

---

# Form Standards

Forms should:

- Validate required fields
- Display inline errors
- Prevent duplicate submissions
- Show loading states

---

# Styling Standards

Use:

- Tailwind CSS
- Design Tokens
- Utility-first styling

Avoid:

- Inline styles
- Hardcoded colors
- Hardcoded spacing values

---

# File Organization

Each feature should group related files.

Example

```
features/

predictions/

components/

hooks/

services/

types/

utils/
```

---

# Reusability

Before creating:

- Component
- Hook
- Utility
- Service

Check whether an existing implementation already exists.

Avoid duplicate code.

---

# Imports

Import order

1. External libraries
2. Internal libraries
3. Components
4. Hooks
5. Utilities
6. Types
7. Styles

Group imports logically.

---

# Comments

Use comments only when they improve understanding.

Avoid obvious comments.

Document complex business logic where necessary.

---

# Accessibility

Components should:

- Use semantic HTML
- Support keyboard navigation
- Include accessible labels
- Maintain visible focus states

---

# Performance

Avoid:

- Unnecessary re-renders
- Large components
- Duplicate API calls

Use:

- Lazy loading
- Memoization when appropriate
- Efficient rendering patterns

---

# Git Commit Convention

Use descriptive commit messages.

Examples

```
feat: add prediction details page

fix: resolve payment verification issue

refactor: simplify subscription service

docs: update AI engine documentation

style: improve dashboard spacing
```

---

# Pull Request Standards

Every Pull Request should include:

- Summary
- Testing completed
- Screenshots for UI changes
- Related issue or task

---

# Code Review Checklist

Verify:

- Follows project architecture
- Uses Design System
- Reuses Component Library
- Uses TypeScript correctly
- Handles errors
- Includes loading states
- Includes empty states
- Is accessible
- Is responsive

---

# Documentation

New features should include:

- Clear naming
- Self-explanatory code
- Updated documentation when necessary

---

# Dependencies

Before adding a new package:

- Confirm it is necessary.
- Check for existing alternatives.
- Verify maintenance status.
- Avoid duplicate functionality.

---

# Refactoring

Refactor code when it:

- Improves readability
- Reduces duplication
- Simplifies maintenance

Do not refactor unrelated code within the same feature unless necessary.

---

# Success Criteria

Coding standards are successfully adopted when:

- The codebase is consistent.
- Components are reusable.
- Type safety is maintained.
- The Design System is followed.
- Code reviews are straightforward.
- New contributors can understand the project quickly.

---

# Next Document

Proceed to

26_PROJECT_ROADMAP.md
````
