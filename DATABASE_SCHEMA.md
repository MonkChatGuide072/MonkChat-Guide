# ✅ APPROVED: MonkChat Guide Database Schema

This revised database structure is approved for Supabase Free. It is designed to be language-scalable, separating core records from their translations to allow any number of languages to be added in the future without altering the schema.

The overall architecture is **APPROVED** by the project owner. Individual implementation details may remain as proposals until they are implemented.
- **Thai** is confirmed as the default language.
- **Additional languages** can be added later without schema changes.

## Security Rules
- Public users can read only published content.
- Team Members can manage content but cannot manage roles.
- Only the Owner can manage team profiles and roles.
- Only the Owner can verify Q&A.
- Team Members cannot promote themselves to Owner.
- Permissions must be enforced using Supabase Row Level Security (RLS), not only by hiding interface buttons.
- Service-role keys must never be exposed in browser code.
- Foreign-key relationships and unique constraints should prevent duplicate translations for the same language.
- Archive content before permanent deletion.
- Only the Owner may permanently delete archived content.

---

## 1. Profiles Table (`profiles`)
- **What it stores**: Information about registered team members and their roles. It does not duplicate authentication passwords (authentication remains in Supabase Auth).
- **Important fields**: `id`, `display_name`, `role` (owner or team_member), `is_active`, `created_at`.
- **Who can view it**: Owners can view all profiles; Team Members can view their own profile.
- **Who can add, edit, archive, or permanently delete it**: Only the Owner can add, edit, archive, or permanently delete profiles.

## 2. Languages Table (`languages`)
- **What it stores**: The list of supported languages. Thai is the default application language. The system must allow more language records to be added later.
- **Important fields**: `code` (e.g., th or en), `native_name`, `is_active`.
- **Who can view it**: Public users, Team Members, and Owners.
- **Who can add, edit, archive, or permanently delete it**: Owners can add, edit, and archive languages. Only the Owner can permanently delete them.

## 3. Meditation Tracks Table (`meditation_tracks`)
- **What it stores**: Core metadata and file references for meditation audio, independent of any language.
- **Important fields**: `id`, `audio_storage_path`, `source_language_code`, `speaker_name`, `duration_seconds`, `is_published`, `archived_at`, `created_by`, `updated_by`, `created_at`, `updated_at`.
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
- **What it stores**: Simple, anonymous usage statistics to track interactions. It does not store names, email addresses, IP addresses, or public user IDs.
- **Important fields**: `id`, `event_type` (audio_play, audio_complete, or bio_link_click), `resource_type`, `resource_id`, `created_at`.
- **Who can view it**: Owners and Team Members can view statistics.
- **Who can add, edit, archive, or permanently delete it**: The system appends data automatically; manual editing is not allowed. Only the Owner can permanently delete data.
