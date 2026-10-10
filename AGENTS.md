# SamanRent — Agent Handbook

> Read this first. It encodes the repo's architecture, hard rules, and every
> environment gotcha discovered through real device E2E. Follow it exactly.

## 1. What this is

SamanRent V1 MVP: event-services marketplace (DJs, tents, luxury cars).
Monorepo at `C:\Saman_Rent`:

| Path | What |
|---|---|
| `app/` | expo-router routes. `(tabs)/` = customer tabs, `(vendor)/` = vendor section, `/review`, `/details`, `/booking`, `/category`, `/login`, … are stack screens |
| `screens/` | One screen component per route file. Route files are thin wrappers |
| `components/` | Shared UI: `ScreenHeader`, `SectionHeader`, `VendorCard`, `LoadingState`, `ErrorState`, `EmptyState`, `SaveHeart` |
| `api/` | Typed client wrappers (`api.get/post/patch/del` in `api/client.js`) |
| `hooks/` | React Query hooks per domain (`useBookings`, `useVendor`, `useServices`, …) |
| `lib/` | `env`, `tokenStore`, `vendorTokenStore`, `session`, `theme`, `format`, `cloudinary`, `serviceImage`, `bookingStatus` |
| `server/` | Express + TypeScript + Prisma + Neon Postgres. Routes → controllers → services. Zod validation in controllers |
| `server/prisma/` | `schema.prisma`, `migrations/`, `seed.ts`, `seed-vendor-creds.ts` |
| `SamanRent_V1_MVP_Development_Plan.md` | The V1 spec + phase definitions. Source of truth for scope |

Stack: Expo SDK 57 / RN 0.86 / React 19 / plain JS frontend, NativeWind v4,
TanStack Query, Express TS API, Prisma ORM, Neon PG, Cloudinary images.

## 2. Runtime topology (do not change)

- API: `http://127.0.0.1:3001` (`/api/health`, `/api/v1/…`), Metro: `127.0.0.1:8081`
- Both run as **detached Windows processes**, not shell jobs (jobs die with the
  tool session). Start with:
  `Start-Process -FilePath "$env:ComSpec" -ArgumentList "/c npm run dev > api.log 2>&1" -WorkingDirectory "C:\Saman_Rent\server" -WindowStyle Hidden`
  (same pattern for `npx expo start --port 8081` in root). Logs: `server/api.log`, `expo.log`.
- Frontend `.env` (gitignored): `EXPO_PUBLIC_API_URL=http://127.0.0.1:3001/api/v1`
- `server/.env` (gitignored) pins **`NODE_ENV=test`** — required for the OTP
  backdoor. Do NOT "fix" this to `development` without asking.
- Device: moto g34 5G (`ZA222JZHPD`, Android 15, 720×1600) over USB.
  After EVERY reconnect/flap, re-apply: `adb reverse tcp:3001 tcp:3001` and
  `adb reverse tcp:8081 tcp:8081`. If the app says "could not reach server",
  check these FIRST — it is almost always the forwards, not the code.
- App entry on device: deep link `exp://127.0.0.1:8081` via
  `host.exp.exponent/.LauncherActivity`.

## 3. API conventions (mirror them, don't invent)

- Envelope: success `{ success: true, data }`, errors `{ success: false,
  error: { code, message } }`. Client unwraps `payload?.data ?? payload`.
- Customer auth: OTP (dev code returned in non-prod; **`000000` backdoor works
  only when `NODE_ENV=test`**). Vendor auth: email+password (bcrypt),
  `requireVendor` middleware, `NOT_A_VENDOR` code keeps roles isolated.
- Dead-token codes (`TOKEN_INVALID/USER_GONE/VENDOR_GONE/VENDOR_DISABLED`)
  trigger the global `SessionExpiryWatcher` → wipes tokens → logged-out state.
- Totals are ALWAYS computed server-side. Booking flow: PENDING → CONFIRMED /
  REJECTED → COMPLETED. Cancel: owner + PENDING only.
- Reviews: one per booking, owner only, COMPLETED only. Creating one
  recomputes service `rating`/`reviewsCount` in-transaction. Public list is
  newest-first with **masked phones** (`+91 98******10`) — never expose full
  numbers.
- Catalog visibility: `status ACTIVE` **AND vendor `APPROVED`** (Phase 10 gating:
  `catalogService` home/list/detail + `bookingService.createBooking` all filter
  `vendor: { status: 'APPROVED' }`). Home "Popular" rail = `tag:
  'Popular'`, take 4. Category screens always filter by their category.
  Search tab searches ALL categories (debounced 400ms).
- Images: signed Cloudinary uploads. Secret stays server-side
  (`POST /uploads/signature`); client uploads direct to Cloudinary.

## 4. Frontend rules (learned from real crashes)

1. **Hooks order is the #1 crash source.** All `useState/useEffect/useQuery`
   calls go ABOVE every early `return`. Audit with: list `use*(` vs
   `if (…) return` line numbers per component (watch out for child components
   in the same file — false positives).
2. **Custom hooks must never early-return before `useQuery`.** Always pass
   `enabled:` through to `useQuery` instead.
3. **Route transitions reuse fibers.** `service-new` ↔ `service/[id]` render
   the SAME component — always key route wrappers distinctly
   (`key="service-new"`, `key={\`service-edit-${id}\`}`), or stale field
   state leaks across modes and hook counts churn → RedBox.
4. **Create-mode forms must never seed from cache/shared queries.** Look up
   `existing` and run seed effects ONLY when `isEdit`. Belt-and-suspenders:
   reset create fields in `useFocusEffect`.
5. **expo-router auto-tabs every route file.** Stack-only screens need
   `<Tabs.Screen name="…" options={{ href: null }} />` or they show up as
   bottom tabs (`service-new`, `service/[id]` did).
6. **StatusBar is forced `style="dark"`** — the UI is always white, so `auto`
   renders invisible white-on-white icons in phone dark mode.
7. **Uploads must use `expo-file-system/legacy` `uploadAsync` MULTIPART.**
   `fetch` + FormData with plain `{ uri, name, type }` parts throws
   `Unsupported FormDataPart implementation`. (Also: use `mediaTypes:
   ['images']` — `MediaTypeOptions` is deprecated.)
8. **New screens go through `ScreenHeader` / `SectionHeader`.** Tab screens
   use `p-3.5`, stack/form screens `p-5`. Don't invent new header variants.
9. Keep `testID`s stable on interactive elements (back buttons, submit
   buttons) — E2E depends on screen text + testIDs.

## 5. Device E2E workflow (moto g34)

- Drive UI with `adb shell input tap x y` / `swipe`, read state with
  `adb shell uiautomator dump /sdcard/<n>.xml` + `adb pull`, parse bounds
  with Python (`xml.etree`). Screenshots: `adb exec-out screencap -p`.
  Work files live in `C:\Users\ARNAVR~1\AppData\Local\Temp\opencode\`.
- Find tap targets by exact text; for icon-only rows walk up to the
  `clickable=true` ancestor. Icon glyphs (Ionicons) expose no text —
  use screenshots to see them, dumps to locate them.
- `adb shell input text` **splits on spaces** — encode spaces as `%s`
  ("Final%sCheck%sRig"), otherwise only the first word registers.
- OTP login on device: Profile → login icon → any 10-digit number → Send OTP
  → enter `000000` on the 6-box screen (tap box 1, type digits with ~2–3s
  gaps for auto-advance). Don't spam Send OTP (rate limiter).
- Vendor login (seeded): `royal-dj-sound@vendor.samanrent.test` / `vendor1234`.
- Transient RedBox right after saving files = Fast Refresh settling, NOT a
  bug. Re-dump after ~10s before diagnosing. A stuck "Something went wrong"
  needs the error-log tap + Metro `expo.log` code frame.
- The notification shade / launcher ambushes dumps: if a dump shows system
  UI, press Back and re-dump. Force-stop + cold-start is the clean reset.

## 6. Backend workflow

- `npx prisma migrate dev --name <x>` LOCKS if the API is running (tsx holds
  the engine DLL). Kill node/tsx processes first, migrate, `npx prisma
  generate`, restart API. Migration needs `DIRECT_URL`.
- Tests: `npx vitest run` in `server/` (supertest, backdoor OTP, NO send-otp
  calls so the limiter never trips). Config forces `singleFork`.
- Test phones are `Date.now`+counter unique per file. Full-suite collisions =
  leftover rows from device E2E or a prior failed run, NOT flaky tests.
  Residue phone format is `+91…` — delete with the prefix.
- Seed data (6 vendors/services, royal creds via `seed-vendor-creds.ts`,
  `4.8/120` ratings) is load-bearing for tests and demos. Never mass-delete.
- Typecheck: `npx tsc --noEmit`. Must be clean before commit.

## 7. Safety rules (violations break prod data or leak secrets)

- **NEVER commit `server/.env`, root `.env`, `*.log`, or temp scripts.**
  Check `git status` + `git diff` before every commit. Cloudinary/DB secrets
  live ONLY in gitignored `.env` — if one ever appears in chat, rotate it.
- **Clean up your E2E residue** (test users/bookings/reviews/services via
  Prisma scripts in TEMP, run from `server/` so `@prisma/client` resolves;
  delete the temp file after). Restore anything you mutated (e.g. seed
  ratings) to its prior values.
- Never change catalog visibility, pricing math, auth, or rating
  recomputation without saying so — these are money/trust paths.
- Never run `prisma migrate reset`, mass `deleteMany` without a `where` on
  real tables, or `taskkill` processes you didn't start (check `wmic`
  command lines; many node processes are the user's IDE/MCP tooling).
- Windows shell notes: no heredocs in PowerShell (use the edit tool to
  append); quote paths with spaces; `cmd /c "set FOO=bar && …"` bakes a
  TRAILING SPACE into the value — prefer editing `.env` over `set`.
- `node -e` quoting is fragile across PowerShell/cmd layers — prefer small
  TEMP `.js` files for Prisma one-offs.
- Commit style: `feat:`, `fix:`, `ui:` prefixes, one logical change per
  commit, tree must be clean (`git status --short` empty) afterwards, plus
  the relevant test suite green.

## 8. Current state (Oct 2026)

Done through Phase 11 + extras + **Phase 10 admin**: marketplace E2E, vendor panel, pull-to-refresh
everywhere, session-expiry handling, ownership isolation, debounced all-category search, shared headers,
customer ratings with recomputed averages. Phase 10: email+password admin auth
(`User.role ADMIN`, `POST /admin/auth/login`, `requireAdmin`), admin
vendors/services/bookings APIs (`/api/v1/admin/*`), catalog gating
(ACTIVE + vendor APPROVED), Vite React dashboard in `admin/` (`:5173`,
Tailwind + react-query). Address book (`Address` model, `/api/v1/addresses`,
`expo-location` auto-fill, booking prefill) + Instagram-style optimistic
wishlist toggle (instant flip, 350ms trailing sync, `wishlistMutationLimiter`
60/min). Suite: **28/28 green** (`admin.test.ts` 5/5, `address.test.ts` 4/4,
`firebase-auth.test.ts` 5/5, Firebase mocked).
Test runner note: `vitest.config.ts` uses `maxWorkers: 1` (serial) —
`poolOptions.forks.singleFork` is ignored on Vitest 5+, and parallel runs
race on the shared dev DB (P2002 phones, phantom orphans).
Admin bootstrap: `npm run db:seed:admin` (reads `ADMIN_EMAIL`/`ADMIN_PASSWORD`
from gitignored `server/.env`).
