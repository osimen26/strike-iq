# 10_PREDICTIONS_MODULE.md

# Strike IQ Predictions Module

Version: 1.0.0

Status: Approved

Related Documents

- 03_ARCHITECTURE.md
- 04_DATABASE.md
- 05_API.md
- 06_AUTHENTICATION.md
- 06.5_AUTHORIZATION.md
- 07_DESIGN_SYSTEM.md
- 08_COMPONENT_LIBRARY.md
- 09_DASHBOARD_OVERVIEW.md

---

# Purpose

The Predictions Module is the primary feature of Strike IQ.

It allows users to browse AI-powered sports predictions, analyze supporting data, save predictions, filter results, and access premium insights.

The module must support both Football and Basketball.

Supported competitions include:

Football

- Premier League
- La Liga
- Serie A
- Bundesliga
- Ligue 1
- UEFA Champions League
- UEFA Europa League
- FIFA Club World Cup
- International Competitions

Basketball

- NBA
- EuroLeague
- NCAA Basketball (Future)

---

# Goals

Users should be able to:

- Browse predictions
- Search predictions
- Filter predictions
- View prediction details
- Save predictions
- Share predictions
- View AI explanations
- View confidence ratings
- View historical statistics
- Access premium analysis (Premium only)

---

# Navigation

Routes

```
/dashboard/predictions

/dashboard/predictions/[predictionId]
```

---

# Prediction Types

Supported prediction markets

Match Winner

Double Chance

Both Teams To Score

Over/Under Goals

Correct Score (Premium)

First Half Winner

Second Half Winner

Draw No Bet

Asian Handicap (Future)

Basketball

Moneyline

Spread

Over/Under Points

Player Props (Future)

---

# Prediction Status

Draft

Review

Published

Live

Completed

Archived

Only Published predictions are visible to users.

---

# Prediction Card

Every prediction card displays:

- Home Team
- Away Team
- Team Logos
- League
- Match Date
- Kickoff Time
- Sport
- Prediction Type
- Prediction
- Confidence Rating
- Premium Badge (if applicable)
- Save Button
- View Details Button

---

# Confidence Levels

The platform exposes four confidence bands.

Very High

90–100%

High

75–89%

Medium

60–74%

Low

Below 60%

Confidence should always include:

- Percentage
- Label
- Visual indicator

---

# Search

Supports:

- Team Name
- League
- Competition
- Prediction Type

Search should debounce requests.

---

# Filters

Users can filter by:

Sport

League

Competition

Prediction Type

Confidence

Date

Premium

Status

---

# Sorting

Newest

Kickoff Time

Confidence

League

Alphabetical

---

# Prediction Details

Displays:

Match Summary

Prediction

Confidence

AI Explanation

Head-to-Head

Recent Form

Home Performance

Away Performance

League Position

Goals Statistics

Injury Summary

Momentum Analysis

Expected Outcome

Related Predictions

---

# AI Explanation

The explanation should summarize:

- Why the prediction was generated
- Supporting statistics
- Current team form
- Tactical observations
- Confidence reasoning

The explanation must remain concise and readable.

---

# Historical Statistics

Display:

Last 5 Matches

Last 10 Matches

Head-to-Head Record

Goals Scored

Goals Conceded

Win Rate

Draw Rate

Loss Rate

Average Goals

Home Form

Away Form

---

# Save Predictions

Authenticated users can:

- Save
- Remove
- View saved predictions

Duplicate saves should be ignored.

---

# Sharing

Users can generate a share link.

Future support:

- WhatsApp
- X (Twitter)
- Facebook
- Telegram

---

# Premium Features

Premium users receive:

- AI Explanation
- Advanced Statistics
- Historical Trends
- Confidence Breakdown
- Correct Score Predictions
- Premium Prediction Feed

Free users see:

- Basic prediction
- Confidence
- Upgrade prompt

---

# Empty States

No predictions

Display:

"No predictions available for the selected filters."

Provide:

Reset Filters

---

# Loading States

Prediction cards use skeleton loaders.

Prediction details load progressively.

---

# Error States

Network failure

Prediction unavailable

Permission denied

Server error

Provide retry actions where applicable.

---

# Performance

Predictions list should be paginated.

Default page size:

20

Infinite scrolling may be introduced later.

Cache:

Published predictions

Leagues

Competitions

Do not cache:

Saved predictions

Premium status

---

# API Integration

Endpoints

GET /api/predictions

GET /api/predictions/:id

POST /api/predictions/:id/save

DELETE /api/predictions/:id/save

---

# Database Entities

predictions

prediction_explanations

prediction_statistics

saved_predictions

matches

teams

leagues

---

# Analytics Events

Track:

Prediction Viewed

Prediction Saved

Prediction Shared

Prediction Filtered

Prediction Searched

Upgrade Banner Clicked

Premium Prediction Viewed

---

# Security

Only Published predictions are publicly accessible.

Premium content requires:

- Authenticated session
- Active subscription

Never expose unpublished predictions.

---

# Accessibility

Prediction cards must support:

- Keyboard navigation
- Screen readers
- Focus management
- Accessible labels

---

# Success Criteria

The Predictions Module is complete when:

- Users can browse predictions efficiently.
- Filtering and search work correctly.
- Premium content is protected.
- AI explanations are displayed consistently.
- Saving and sharing work reliably.
- Performance targets are met.
- Accessibility standards are satisfied.

---

# Next Document

Proceed to **11_MATCHES_MODULE.md**

This document defines how sports fixtures are created, imported, managed, updated, and synchronized between external sports APIs and the Strike IQ platform.