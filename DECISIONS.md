# MonkChat Guide - Decision Log

This document records the confirmed decisions made during the project's lifecycle.

## 1. Project Name
- **Decision**: Project name is MonkChat Guide.
- **Reason**: Official name provided by the project owner.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 2. Application Architecture
- **Decision**: Build a mobile-first PWA.
- **Reason**: Ensures accessibility on mobile devices without requiring native app store submissions.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 3. Prototype Languages
- **Decision**: Prototype languages: English and Thai.
- **Reason**: Covers the immediate needs of foreign visitors and internal MonkChat team members.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 4. Default Language
- **Decision**: Default interface language is English.
- **Reason**: Primary target audience for the public facing side is foreign visitors.
- **Status**: 🔄 SUPERSEDED
- **Date**: 2026-08-12

## 4.1. Primary and Default Language
- **Decision**: Thai is the primary and default interface language.
- **Reason**: Confirmed by the Project Owner. English remains available as a secondary supported language for foreign visitors. Users can switch between Thai and English.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 5. Future Language Scalability
- **Decision**: Support adding more languages later.
- **Reason**: The application will need to scale globally and accommodate more languages over time.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 6. Public User Accounts
- **Decision**: Public users do not need accounts.
- **Reason**: Lowers the barrier to entry so visitors can immediately access content by scanning a QR code.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 7. Team Accounts
- **Decision**: Owner and Team Members have individual login accounts.
- **Reason**: Allows secure, role-based access control for content management.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 8. Content Management Permissions
- **Decision**: Team Members can manage website content.
- **Reason**: Enables non-developers to maintain and update the platform's resources easily.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 9. Analytics
- **Decision**: Basic anonymous statistics are included.
- **Reason**: Provides insight into usage (track plays, completions, clicks) without violating user privacy.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 10. Budget Constraints
- **Decision**: Runtime and deployment budget: 0 THB.
- **Reason**: Explicitly requested to keep the prototype free; will use Supabase Free and Cloudflare Pages Free.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 11. Third-Party API Limits
- **Decision**: No paid APIs or AI APIs inside the deployed application.
- **Reason**: Ensures the project remains strictly within the 0 THB budget and prevents overage spending.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 12. Out of Scope Features
- **Decision**: Real-time rooms, ranking, matchmaking and native mobile apps are out of scope.
- **Reason**: Keeps the 1-week prototype focused on core requirements.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 13. Database Architecture
- **Decision**: The language-scalable database architecture is approved. Text translations will use separate translation tables.
- **Reason**: Ensures future scalability for additional languages without requiring schema alterations.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 14. Authentication and Roles
- **Decision**: Supabase Auth will manage team login. Owner and Team Member roles will be used.
- **Reason**: Provides a secure and straightforward role-based access control system.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 15. Role Permissions
- **Decision**: Only the Owner can verify Q&A and manage team roles. Team Members can add, edit, and archive content. Only the Owner can permanently delete archived content.
- **Reason**: Enforces strict governance over content deletion and team access.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 16. Anonymous Statistics Constraints
- **Decision**: Anonymous statistics must not store names, emails, IP addresses, or public user IDs.
- **Reason**: Protects user privacy while still tracking usage metrics.
- **Status**: 🔄 SUPERSEDED by Decision 16.1
- **Date**: 2026-08-12

## 16.1. Privacy-Preserving Unique Visitor Measurement
- **Decision**: Estimate unique visitors with a random browser-generated `visitor_id` and a temporary `session_id`. Continue to prohibit IP addresses, names, emails, user-agent strings, device details, and browser fingerprints. Add database-generated audit logs for authenticated Owner and Team Member content changes; only the Owner can read the complete audit history.
- **Reason**: The Project Owner approved anonymous unique-visitor measurement and accountable CMS activity history without collecting raw IP addresses or claiming to identify public visitors.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-15

## 17. Implementation Plan
- **Decision**: The seven-day implementation plan is approved.
- **Reason**: Confirmed by the Project Owner.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 18. Technology Stack
- **Decision**: The complete technology stack is approved (React, Vite, TypeScript, Tailwind CSS, React Router, Supabase JavaScript client, i18next and react-i18next, vite-plugin-pwa, Vitest and React Testing Library, Supabase Edge Functions Free, Cloudflare Pages Free).
- **Reason**: Confirmed by the Project Owner.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 19. Secure Team-Account Management
- **Decision**: Supabase Edge Functions Free will be used for secure team-account management. The Supabase service-role key must remain only in server-side secrets.
- **Reason**: Confirmed by the Project Owner for security.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12

## 20. Responsive Support
- **Decision**: Responsive support is required at 360px, 390px, 768px, 1024px, and 1440px. Mobile-first means mobile-first, not mobile-only. Both public pages and the CMS must support phones, tablets, laptops, and desktop computers.
- **Reason**: Confirmed by the Project Owner.
- **Status**: ✅ CONFIRMED
- **Date**: 2026-08-12
