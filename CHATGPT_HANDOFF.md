# MonkChat Guide — approved release, 28 November 2026

Owner approved publishing the complete verified Codex preview to GitHub and production. This release restores the approved eight-chapter branching story game and mobile navigation that stale c874461 had replaced, and includes the latest student UI changes.

- Student module order: vocabulary, games, phrases/tools, videos/resources, thank-you cards.
- Student mobile header account icon opens the existing sign-in/register form in a themed card; anonymous users may practise immediately. Existing profile, validation, approval and role isolation stay in place.
- Soft one-hue-per-page palette; compact illustrated banners and larger headings.
- Eight new chapter MENU covers match the cute banner style. All seated cover figures use chairs. In-game artwork and route outcomes stay unchanged.
- Visitor statistics ribbon, location/map order, outdoor participation wording, two meditation pages and fullscreen crystal timer summary are retained.
- No new runtime AI API, paid service, database schema, auth policy or package changes.

Verification: types, lint, 233 tests / 39 files (including existing GitHub tests), production build, diff check. Relevant UI checked at 360,390,768,1024,1440px. Public and team/account isolation tests pass. No production account was created for this release.

Single editor only. Before further edits, fetch/pull current main; do not restore c874461 or an older local checkout over this release. Keep CURRENT_SCOPE and owner instructions authoritative. Source is the verified snapshot from Codex preview at 127.0.0.1:4193. Cloudflare should deploy the same reviewed Git commit. No secrets, env files, node_modules, local logs or temporary credentials are committed.
