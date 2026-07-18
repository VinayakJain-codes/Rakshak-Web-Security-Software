### 7. The cron endpoint has no authentication
`src/app/api/cron/schedules/route.ts` — the code comment literally says *"for now, we will allow it to run directly"*. It uses the Supabase **service-role key** internally, and is reachable by anyone who requests the URL, with no secret/bearer-token check. Anyone who finds this route can spam it repeatedly, generating unlimited fake schedules and notifications for every guard in every tenant. This needs a shared-secret header check (e.g., comparing an `Authorization` header against an environment variable) before it does anything, at minimum.
 
### 8. Guard portal has no navigation/layout at all
- `src/config/navigation.ts` has no entry for the guard role at all — `src/app/(portals)/admin/layout.tsx` and `src/app/(portals)/ops/layout.tsx` exist, but there is **no `src/app/(portals)/guard/layout.tsx`**.
- As a direct result, **`src/app/(portals)/guard/monitor/page.tsx` is not linked from anywhere in the app** — a guard has no in-app way to discover or navigate to it. It's only reachable by typing the URL directly.
- Guards also have no shared shell (topbar/menu) the way Super Admin, Client Owner, and Supervisor do.
### 9. Nav config references pages that don't exist
`src/config/navigation.ts` includes `href: '/org/locations'` and `href: '/org/schedules'` — clicking either from the Client Owner sidebar will 404, since only `billing`, `compliance`, `dashboard`, `reports` exist under `src/app/(portals)/org/`.
 
### 10. `.gitignore` has corrupted entries that silently don't work
The last two lines of `.gitignore` (meant to ignore `bfg.jar` and `passwords.txt`, presumably added while cleaning up the earlier credential leak) are encoded in UTF-16 inside a UTF-8 file — they show up as `b\x00f\x00g\x00.\x00j\x00a\x00r\x00` etc. when read as bytes. Git will not match these patterns, so **those two ignore rules are currently non-functional**. Low severity, but ironic given they were added specifically to prevent re-leaking cleanup tooling/passwords.
 
### 11. Two near-duplicate guard list pages
`src/app/(portals)/ops/guards/page.tsx` and `src/app/(portals)/ops/tracker/page.tsx` are now almost the same screen — both list guards in a table, both have the same "Add Guard" modal, with only minor column differences (one shows "Assigned Site" and an "Alert" button, the other shows a "Manage Guard" link to the detail page). Worth deciding whether these should be merged into one page, or clearly differentiated in purpose (e.g., one is the roster, the other is live-ops actions).
 
### 12. Orphaned/dead UI component
`src/components/ui/rakshak/TelemetryCard.tsx` still exists and expects `guard.telemetry.gpsCoordinates`, `.accelerometerVector`, `.ambientBrightness`, `.rootDetectionStatus` — all fields that only ever had stub/hardcoded values, and it is **not rendered anywhere** in any page under `src/app/`. It's dead code left over from before the map/telemetry approach was scrapped. Related stub telemetry object (still built but now genuinely unused) lives in `src/hooks/useGuardPositions.ts`.
 
### 13. Minor: wrong Supabase query method for a possibly-empty result
`src/app/(portals)/ops/guards/[id]/page.tsx` — the biometrics fetch uses `.single()` on `guard_biometrics`, which throws when a guard has zero biometric rows yet (a very normal, common case — e.g., any guard who hasn't opened the monitor page). It's caught by the surrounding `try/catch` so it fails gracefully into "no biometrics" state, but it should be `.maybeSingle()` instead, which returns `null` without an error for the expected empty case.
 
### 14. No storage bucket RLS policy checked into the repo
The app now assumes `guard-selfies` is a **private** bucket (it uses `createSignedUrl`), which is the right call — but there's no migration file anywhere under `supabase/migrations/` that defines a `storage.objects` policy for this bucket. If this was only set by hand in the Supabase dashboard, it's unversioned and will be lost/forgotten if the project is ever redeployed from migrations alone. Worth adding an explicit `storage.objects` RLS policy migration so bucket privacy is guaranteed by the schema, not by a manual dashboard setting nobody wrote down.
 