# Team management deployment

Migration `20260923020015_cms_account_access.sql` and function version 1 were deployed to the existing project on 2026-09-23. See the latest HANDOFF.md entry for frontend and live-account verification status.

## Behavior

- Only an authenticated, active Owner can list accounts, create a Team Member, or update a Team Member's name/active status.
- An account is created with an initial password of at least 12 characters. No invitation email is sent. The Owner must hand over credentials privately.
- The service-role client is server-only and used only for Auth account creation after authorization. Profile writes use the Owner JWT so RLS and audit attribution remain effective.
- Role transfer, Owner suspension, and profile deletion are intentionally unavailable.
- If Auth creation succeeds but profile creation fails, the response is `partialCreate`. The Auth account has no CMS profile or CMS privileges. An administrator must reconcile it before retrying; the function never deletes accounts in recovery.
- Suspension removes CMS permissions through database checks. It does not delete the Auth account or revoke access to public content.

## Release order

After the project owner's release instruction:

1. Review pending migration history against the linked project. Migration `20260923020015_cms_account_access.sql` must be installed before enabling this function. Do not replay it on the hosted project where it is already applied.
2. Keep `verify_jwt = true` in `supabase/config.toml`. The handler also verifies the bearer with `auth.getUser()` and checks the current database profile. Confirm a real signed-in Owner JWT passes the deployed gateway before releasing the UI.
3. Use the Supabase-managed server environment variables `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Never copy the service-role key into `VITE_*`, source files, or browser settings.
4. Set `CMS_ALLOWED_ORIGINS` to a comma-separated allowlist of exact production/approved preview origins. Default: `https://monkchat-guide.pages.dev`. Do not use a wildcard.
5. Deploy `team-management` to the existing Supabase project, then release the frontend through the established Cloudflare Pages flow. No new paid service is needed.
6. In an approved test environment, verify public/team/inactive-owner denial; Owner list/create/update; audit attribution; member login; suspension denying subsequent content writes; and language CRUD. Then verify mobile/desktop layouts at 360, 390, 768, 1024, and 1440 pixels. Do not create dummy production accounts without an explicit test-account plan.

The UI disables account creation until the function responds successfully. The function refuses all management actions until `cms_security_version()` reports the required migration.

## Local checks

`npm test`, `npm run lint`, `npm run build` validate the frontend and platform-independent handler. Use Deno to type-check the server entry:

```sh
deno check --config supabase/functions/team-management/deno.json supabase/functions/team-management/index.ts
```

The SQL regression harness uses an isolated in-memory PostgreSQL engine, existing application migrations, and a minimal Supabase Auth shim. It never connects to the hosted database. Install `@electric-sql/pglite` in a temporary directory, then set `PGLITE_MODULE` to its absolute `dist/index.js` and run `node scripts/check-cms-security.mjs`. This does not replace full Supabase gateway/Storage or browser end-to-end checks.
