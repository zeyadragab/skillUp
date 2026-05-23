# Product

## Register

product

## Users

Multi-role admin team managing the skillup skill-sharing platform:

- **Super Admin**: Full platform access. Manages other admins, platform settings, feature flags, financial controls, and security logs.
- **Content Moderator**: Reviews reports, approves skills and teachers, manages users, handles disputes.
- **Support Team**: Replies to tickets, manages broadcast notifications, limited user profile access.
- **Analytics Admin**: Read-only access to growth metrics, revenue reports, and campaign management.

Sidebar navigation, visible actions, and data access all adapt per role. Activity logs are tracked per admin. Access management has its own dedicated section.

## Product Purpose

A kanban-style operations workspace for the skillup admin team. The dashboard is a command center: platform health understood in under 10 seconds.

Homepage structure:

- **Left column**: operational queues — pending teacher verifications, reported users, skill approval requests, session disputes, support tickets
- **Center**: live platform activity — new users today, active sessions, messages sent, recent actions feed
- **Right column**: business and system insights — revenue, token purchases, retention, API/server health, notifications

Beyond the dashboard, admins manage: user profiles (full CRUD), skills and categories (approve, reject, tag), broadcast notifications (all users or by role), and the token/payment system (top-ups, refunds, transaction history).

## Brand Personality

Calm, structured, fast, intelligent. Modern startup internal tooling, not corporate BI software. References: Linear, Stripe Dashboard, Notion, Vercel. The interface reads as a live operations workspace with clear workflow hierarchy.

## Anti-references

- Generic Bootstrap or AdminLTE-style panels
- Heavy neon or cyberpunk dark aesthetics
- Identical same-size card grids
- Charts used as decoration rather than information
- Dense tables with no hierarchy or breathing room
- Equal visual weight across all elements — no urgency signaling

## Design Principles

1. **Operational hierarchy first**: surface urgency (pending actions, failures, alerts) before statistics. The morning scan takes under 10 seconds.
2. **Role-adaptive surface**: the interface is not built for one admin. Four distinct roles have different cognitive needs; the UI adapts accordingly.
3. **Variable-weight blocks**: different content types earn different visual prominence. Kanban lanes, live feeds, and insight panels coexist without competing.
4. **Status colors only**: color signals state (warning, error, success, neutral) and nothing else. No decorative color.
5. **Typography as the primary contrast mechanism**: hierarchy through scale and weight, not through card fills or border accents.

## Accessibility & Inclusion

WCAG AA minimum. Reduced motion required (the interface is function-first; motion is an enhancement, never load-bearing). Keyboard navigation required for all queue actions.
