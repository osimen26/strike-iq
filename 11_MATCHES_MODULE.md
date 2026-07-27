# 11_MATCHES_MODULE.md

# Strike IQ Matches Module

Version: 1.0.0

Status: Approved

Related Documents

- 03_ARCHITECTURE.md
- 04_DATABASE.md
- 05_API.md
- 10_PREDICTIONS_MODULE.md

---

# Purpose

The Matches Module manages all sporting events available on the Strike IQ platform.

It is responsible for:

- Importing fixtures
- Creating matches manually
- Updating match information
- Synchronizing live fixture changes
- Providing match data for AI predictions
- Managing match lifecycle

The Matches module is the single source of truth for all sporting events.

---

# Goals

The module should allow administrators to:

- Import fixtures
- Create fixtures manually
- Edit fixtures
- Delete fixtures (Soft Delete)
- Archive completed matches
- Manage competitions
- Manage seasons
- View fixture history

Users should be able to:

- View published fixtures
- View prediction-related match information

---

# Supported Sports

Football

Basketball

Future

- Tennis
- Baseball
- UFC
- Formula 1

---

# Match Lifecycle

Draft

↓

Scheduled

↓

Published

↓

Live

↓

Finished

↓

Archived

Only Published, Live, and Finished matches are visible to users.

---

# Match Structure

Each match contains:

Unique ID

Sport

League

Season

Round

Home Team

Away Team

Venue

Kickoff Time

Timezone

Status

Created By

Updated By

Created At

Updated At

---

# Match Status

Draft

Scheduled

Published

Live

Postponed

Cancelled

Finished

Archived

---

# Match Details Page

Displays:

- Home Team
- Away Team
- Team Logos
- Competition
- Season
- Venue
- Kickoff
- Match Status
- Prediction Count
- Published Prediction
- Historical Results

Admin-only information:

- External API ID
- Import Source
- Sync Status
- Last Sync
- Audit History

---

# External Sports APIs

The system should support one or more providers.

Examples

- API-Football
- SportMonks
- TheSportsDB
- Basketball APIs

Provider abstraction should allow switching providers without affecting business logic.

---

# Import Workflow

Administrator initiates import.

↓

Fetch fixtures from provider.

↓

Validate payload.

↓

Skip duplicates.

↓

Create new fixtures.

↓

Update existing fixtures.

↓

Log import summary.

↓

Queue AI prediction generation (optional).

---

# Duplicate Detection

A match is considered duplicate when:

- Same provider ID, or
- Same sport
- Same competition
- Same kickoff time
- Same home team
- Same away team

Duplicate imports must update existing records instead of creating new ones.

---

# Manual Match Creation

Administrators can manually create fixtures.

Required fields

- Sport
- Competition
- Season
- Home Team
- Away Team
- Kickoff
- Venue

Validation

- Teams cannot be identical.
- Kickoff must be in the future.
- Competition must exist.
- Season must exist.

---

# Match Editing

Administrators may update:

- Kickoff
- Venue
- Status
- Teams (before publication)
- Competition
- Season

All edits must create audit records.

---

# Match Deletion

Matches are never permanently deleted.

Soft Delete only.

If predictions exist, deletion is prohibited.

Instead:

Archive the match.

---

# Match Synchronization

Automatic synchronization should update:

- Status
- Kickoff changes
- Venue changes
- Competition updates

Synchronization must never overwrite:

- AI Predictions
- Manual notes
- Admin changes (unless explicitly configured)

---

# Related Data

Every match may contain:

Predictions

Statistics

AI Explanation

Odds (Future)

Live Events (Future)

Player Statistics (Future)

---

# Search

Supports:

- Team
- League
- Competition
- Season
- Match Status

---

# Filters

Sport

League

Season

Status

Kickoff Date

Prediction Status

---

# Sorting

Kickoff

League

Competition

Created Date

Recently Updated

---

# Pagination

Default page size

25

---

# Admin Dashboard Features

The Matches page includes:

- Search
- Filters
- Bulk actions
- Import fixtures
- Create fixture
- Edit fixture
- Archive fixture
- View predictions
- View audit history

---

# Bulk Actions

Administrators may:

- Publish
- Archive
- Delete (Soft Delete)
- Trigger AI generation
- Re-sync selected fixtures

---

# API Endpoints

GET /api/admin/matches

GET /api/admin/matches/:id

POST /api/admin/matches

PATCH /api/admin/matches/:id

DELETE /api/admin/matches/:id

POST /api/admin/matches/import

POST /api/admin/matches/sync

POST /api/admin/matches/generate-predictions

---

# Database Tables

matches

sports

leagues

seasons

teams

predictions

audit_logs

---

# Analytics

Track:

Fixture Created

Fixture Updated

Fixture Archived

Fixtures Imported

Fixtures Synced

Prediction Generation Triggered

---

# Security

Only Administrators and Super Administrators may manage matches.

Every action must:

- Validate session
- Validate role
- Log activity

---

# Performance

Match imports should execute as background jobs.

Large imports should be chunked.

Database writes should use transactions.

Indexes should exist on:

- kickoff
- leagueId
- seasonId
- status
- providerMatchId

---

# Error Handling

Examples

Import failed

Provider unavailable

Duplicate fixture

Invalid teams

Invalid competition

Database transaction failed

Every error should provide a user-friendly message and be logged.

---

# Future Enhancements

Support:

- Live scores
- Live events
- Player lineups
- Match statistics
- Injury reports
- Weather conditions
- Referee assignments
- Betting odds
- Multi-provider synchronization

---

# Success Criteria

The Matches Module is complete when:

- Fixtures can be imported automatically.
- Fixtures can be created manually.
- Duplicate handling works correctly.
- Synchronization updates existing fixtures safely.
- Soft deletion preserves historical data.
- Predictions remain linked to their parent match.
- Admins can efficiently manage large fixture lists.

---

# Next Document

Proceed to **12_SUBSCRIPTIONS_MODULE.md**

This document defines subscription plans, premium access, entitlement checks, upgrade and downgrade workflows, renewal lifecycle, and integration with Flutterwave payments.