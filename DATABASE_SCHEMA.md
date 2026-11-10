# ✅ APPROVED: MonkChat Guide Database Schema

This revised database structure is approved for Supabase Free. It is designed to be language-scalable, separating core records from their translations to allow any number of languages to be added in the future without altering the schema.

The overall architecture is **APPROVED** by the project owner. Individual implementation details may remain as proposals until they are implemented.
- **Thai** is confirmed as the default language.
- **Additional languages** can be added later without schema changes.

## Security Rules
- Public users can read only published content.
- Authenticated `'student'` accounts can read only published public/storage content plus their own `profiles` and `student_practice_progress` rows; they cannot view unpublished drafts or access `/admin` / CMS tables.
- Team Members can manage content but cannot manage roles.
- Only the Owner can manage team profiles, roles, cohort invites, and student account lifecycle/password resets.
- Only the Owner can verify Q&A.
- Team Members and Students cannot promote themselves to Owner.
- Permissions must be enforced using Supabase Row Level Security (RLS), not only by hiding interface buttons.
- Service-role keys must never be exposed in browser code.
- Foreign-key relationships and unique constraints should prevent duplicate translations for the same language.
- Archive content before permanent deletion.
- Only the Owner may permanently delete archived content.

---

## 1. Profiles Table (`profiles`)
- **What it stores**: Information about registered team members (`owner`, `team_member`) and Cohort Student Monks (`student`). It does not duplicate authentication passwords (authentication remains in Supabase Auth; students authenticate via internal `${student_code}@student.monkchat.invalid` emails).
- **Important fields**: `id`, `display_name`, `role` (`owner`, `team_member`, or `student`), `is_active`, `student_code` (nullable unique `4011001–6911060`), `cohort_year` (`40–69`), `dharma_name`, `created_at`.
- **Who can view it**: Owners can view all profiles (`team-management` filters CMS members `owner`/`team_member`, while `student-cohorts` manages `student` rows); Team Members and Students can view their own profile.
- **Who can add, edit, archive, or permanently delete it**: Only the Owner (or Edge Function `student-register` via `service_role` during a valid Cohort Invite claim) can add or edit profile privilege/status fields (`guard_managed_profile()` locks `id`, `role`, `student_code`, `cohort_year` from browser edits). Only the Owner can permanently delete profiles.

## 2. Languages Table (`languages`)
- **What it stores**: The list of supported languages. Thai is the default application language. The system must allow more language records to be added later.
- **Important fields**: `code` (e.g., th or en), `native_name`, `is_active`.
- **Who can view it**: Public users, Team Members, and Owners.
- **Who can add, edit, archive, or permanently delete it**: Owners can add, edit, and archive languages. Only the Owner can permanently delete them.

## 3. Meditation Tracks Table (`meditation_tracks`)
- **What it stores**: Core metadata and file references for meditation audio, independent of any language.
- **Important fields**: `id`, `audio_storage_path`, `source_language_code`, `is_recommended`, `speaker_name`, `duration_seconds`, `is_published`, `archived_at`, `created_by`, `updated_by`, `created_at`, `updated_at`.
- **Logic constraints**: `is_recommended` is restricted to the Owner. Max 1 recommended track per `source_language_code`. Track must be `is_published = true` and `content_status = 'published'` to be recommended.
- **Who can view it**: Public users can view published tracks. Owners and Team Members can view all tracks.
- **Who can add, edit, archive, or permanently delete it**: Team Members and Owners can add, edit, and archive. Only the Owner can permanently delete.

## 4. Meditation Track Translations (`meditation_track_translations`)
- **What it stores**: Language-specific titles, descriptions, transcripts, and subtitles for meditation tracks. One track can have translations in multiple languages. It does not use fixed columns like `title_th` or `title_en`.
- **Important fields**: `id`, `track_id`, `language_code`, `title`, `description`, `transcript`, `subtitle_vtt_storage_path`.
- **Who can view it**: Public users can view translations of published tracks. Owners and Team Members can view all translations.
- **Who can add, edit, archive, or permanently delete it**: Team Members and Owners can add, edit, and archive. Only the Owner can permanently delete.

## 5. Q&A Items Table (`qa_items`)
- **What it stores**: Core information for Buddhism and meditation-related questions, independent of language. Only verified Q&A may be published publicly.
- **Important fields**: `id`, `category`, `source_reference`, `verification_status` (draft or verified), `verified_by`, `verified_at`, `is_published`, `archived_at`, `created_by`, `updated_by`, `created_at`, `updated_at`.
- **Who can view it**: Public users can view published and verified Q&A items. Owners and Team Members can view all items.
- **Who can add, edit, archive, or permanently delete it**: Team Members and Owners can add, edit, and archive. Only the Owner can verify a Q&A item. Only the Owner can permanently delete.

## 6. Q&A Translations Table (`qa_translations`)
- **What it stores**: Language-specific questions and answers for Q&A items. It does not use fixed columns like `question_th` or `question_en`.
- **Important fields**: `id`, `qa_item_id`, `language_code`, `question`, `short_answer`, `detailed_answer`.
- **Who can view it**: Public users can view translations of published/verified Q&A items. Owners and Team Members can view all translations.
- **Who can add, edit, archive, or permanently delete it**: Team Members and Owners can add, edit, and archive. Only the Owner can permanently delete.

## 7. DCI Centers Table (`dci_centers`)
- **What it stores**: Core location and contact information for DCI centers, independent of language.
- **Important fields**: `id`, `country_code`, `city`, `address`, `map_url`, `website_url`, `contact_url`, `is_published`, `archived_at`, `created_by`, `updated_by`, `created_at`, `updated_at`.
- **Who can view it**: Public users can view published centers. Owners and Team Members can view all centers.
- **Who can add, edit, archive, or permanently delete it**: Team Members and Owners can add, edit, and archive. Only the Owner can permanently delete.

## 8. DCI Center Translations (`dci_center_translations`)
- **What it stores**: Language-specific names and descriptions for DCI centers.
- **Important fields**: `id`, `center_id`, `language_code`, `name`, `description`.
- **Who can view it**: Public users can view translations of published centers. Owners and Team Members can view all translations.
- **Who can add, edit, archive, or permanently delete it**: Team Members and Owners can add, edit, and archive. Only the Owner can permanently delete.

## 9. BioPage Links Table (`bio_links`)
- **What it stores**: Core configuration for important links displayed on the main BioPage, independent of language.
- **Important fields**: `id`, `url`, `display_order`, `is_published`, `archived_at`, `created_by`, `updated_by`, `created_at`, `updated_at`.
- **Who can view it**: Public users can view published links. Owners and Team Members can view all links.
- **Who can add, edit, archive, or permanently delete it**: Team Members and Owners can add, edit, and archive. Only the Owner can permanently delete.

## 10. BioPage Link Translations (`bio_link_translations`)
- **What it stores**: Language-specific titles for BioPage links.
- **Important fields**: `id`, `bio_link_id`, `language_code`, `title`.
- **Who can view it**: Public users can view translations of published links. Owners and Team Members can view all translations.
- **Who can add, edit, archive, or permanently delete it**: Team Members and Owners can add, edit, and archive. Only the Owner can permanently delete.

## 11. Usage Events Table (`usage_events`)
- **What it stores**: Anonymous usage statistics for sessions, page views, audio interactions, and BioPage link clicks. A random browser-generated visitor UUID estimates unique visitors; it is not a real identity. The table does not store names, emails, IP addresses, user-agent strings, device details, or browser fingerprints.
- **Important fields**: `id`, `event_type` (session_start, page_view, audio_play, audio_complete, or bio_link_click), `visitor_id`, `session_id`, `page_path`, `resource_type`, `resource_id`, `created_at`.
- **Who can view it**: Owners and Team Members can view statistics.
- **Who can add, edit, archive, or permanently delete it**: Public and signed-in clients can append only validated events through the narrow `record_usage_event` database function. Direct inserts, updates, and truncation are denied. Only the Owner can permanently delete data through RLS.

## 12. Admin Audit Logs Table (`admin_audit_logs`)
- **What it stores**: Immutable history of authenticated CMS record changes generated automatically by database triggers.
- **Important fields**: `id`, `actor_user_id`, `actor_display_name`, `actor_role`, `action` (create, update, or delete), `entity_type`, `entity_id`, `details`, `occurred_at`.
- **Who can view it**: Only the active Owner.
- **Who can add, edit, archive, or permanently delete it**: Browser clients cannot add, edit, or delete audit rows. Database triggers append the rows automatically.

## 13. Student Cohort Invites Table (`student_cohort_invites`)
- **What it stores**: Cohort registration invite metadata generated by the Owner so MCU student monks in each batch (`cohort_year` 40–69) can self-register into `role = 'student'` without exposing plaintext codes in the database.
- **Important fields**: `id`, `cohort_year`, `label`, `invite_code_hash` (SHA-256 hex digest), `code_hint`, `is_active`, `max_uses`, `used_count`, `expires_at`, `created_by`, `created_at`.
- **Who can view it**: Only the active Owner (browser `SELECT` RLS checks `private.get_user_role() = 'owner'`). Plaintext invite codes are shown once on creation via the `student-cohorts` Edge Function.
- **Who can claim or manage it**: Claims execute atomically through `public.claim_student_cohort_invite(p_code_hash, p_cohort_year)` (`SECURITY DEFINER`, executable strictly by `service_role` inside `student-register`), and mutations execute only through `student-cohorts` (`verify_jwt = true`, active `'owner'`, `student_security_version() = 2`). Changes are logged to `admin_audit_logs`.

## 14. Student Practice Progress Table (`student_practice_progress`)
- **What it stores**: Per-student completion records for `/nisit` training drills (`vocab_lesson`, `qa_flashcard`, `audio_track`). Visitor notes and thank-you cards never write to this table.
- **Important fields**: `id`, `student_id`, `module_type`, `item_key`, `completed_at` (unique on `student_id, module_type, item_key`).
- **Who can view it**: The student (`auth.uid() = student_id`) and the active Owner (`private.get_user_role() = 'owner'`).
- **Who can add or delete it**: Only the authenticated student for their own `student_id` (`auth.uid() = student_id AND private.get_user_role() = 'student'`).

## 15. Authenticated Read Access on Published Storage Media
- Migration `20261110170000_student_cohorts_and_practice.sql` adds `SELECT` policies `TO authenticated` for `meditation-audio` (published tracks), `meditation-subtitles` (published tracks), and `bio-link-images`, ensuring signed-in `'student'` accounts continue to load published audio/subtitles without granting CMS upload/modify access.
