# V-Learning Uganda

Subscription learning for Ugandan schools, with separate Primary (P1–P7) and Secondary (S1–S6) libraries, videos, PDFs, practice quizzes and events with real photos and recordings.

Contact: **Tr Ojok Mtn · +256 778 441681**.

## Interface

The public interface uses the official V-Learning Uganda logo and its magenta (`#BE1373`) and yellow (`#F8D346`) as the main colours. Deep navy (`#24324B`) supports headings and body text, while small teal (`#167D7F`) icons, badges and highlights complement the palette. White cards, light pink backgrounds and Plus Jakarta Sans keep the learning pages readable. The uploaded logo is served unchanged from `public/brand/v-learning-uganda-logo.jpg`. The homepage starts with search and a featured lesson, followed by a Primary/Secondary class chooser, latest videos, notes, exam revision and any published quizzes/events. It uses the existing live API rather than placeholder content.

## School photographs and YouTube

The homepage uses two credited illustrative school photos taken in Uganda, served locally at lightweight sizes. These are stock photographs, not a claim that the pictured learners attend a particular partner school:

- `public/images/schoolchild-uganda.jpg`: [bill wegener / Unsplash](https://unsplash.com/photos/boy-in-red-crew-neck-t-shirt-smiling-NmVKiFkVdnM).
- `public/images/classroom-uganda.jpg`: [Zach Wear / Unsplash](https://unsplash.com/photos/a-group-of-people-sitting-at-desks-in-a-classroom-wjCYyd_KppE), Iganga, Uganda.

Both source pages identify the images as free to use under the [Unsplash License](https://unsplash.com/license). The source images are unchanged apart from the image host's delivered size/compression; CSS fits them into the layout. Photo source and license information is retained in this README for reference.

The homepage and footer link to the owner's public channel, `https://www.youtube.com/@v-learninguganda3246`. No channel videos are downloaded, embedded or imported into the learning library.

## Deployment

Use Node.js 22 or later, run `npm ci`, then `npm run build`. Cloudflare Pages deploys `dist` from `main`. The build copies the API into `dist/_worker.js`; only `/api/*` invokes it.

Production Pages bindings:

- D1 **DB** → `v-learning-uganda`.
- Private R2 **MEDIA** → `v-learning-uganda-media`.
- Production secret **ADMIN_PASSWORD**, chosen by the owner (16–256 characters). Store it in Cloudflare, never in GitHub or a frontend environment variable. Redeploy after changing it. Changing the password invalidates existing sessions.

The API creates its empty database schema automatically. No example content is seeded. R2 stays private; files are served only when attached to published content or requested by an authenticated administrator.

## Administrator workflow

Open `/admin`. Create a video lesson, PDF resource, practice quiz or event. Choose Primary or Secondary, select the class and choose a subject from the curriculum suggestions or enter a custom subject/topic. Upload actual files and save a private draft or publish. To unpublish, edit the item and choose **Save draft**. Stored content persists beyond the browser session. There is no permanent-delete control in this release.

Videos: MP4, WebM or MOV up to 1 GB. PDFs: up to 25 MB. Photos: JPG, PNG or WebP up to 10 MB each, with up to 24 photos per event. Videos above 8 MB use multipart chunks within an upload session; interrupted page sessions must restart. Native playback supports byte ranges. Compressed MP4 is recommended for mobile data; adaptive transcoding is not included.

Uploading a standard video captures an actual frame in the administrator's browser and saves a 960 × 540 JPEG thumbnail in R2. Upload a custom JPG/PNG/WebP or choose **Generate from video** to replace it. Publishing a video requires a valid image attachment; unreadable video formats can use a custom image. Existing videos without saved covers attempt a local frame preview only near the viewport, with a branded fallback if unavailable or data saving is enabled. Videos never autoplay to generate a thumbnail.

Selected lesson videos are public previews. All other published videos, PDFs, quizzes and event materials require an active approved subscription or an administrator session. Per-material prices remain zero because access is sold through time-based subscriptions. Hosting follows the Cloudflare account's existing usage plan.

Practice quizzes use manually entered, teacher-reviewed questions and server-side marking. Answers are hidden from the public catalog until submission. PDFs can be attached as supporting material. Automatic PDF extraction/OCR, live multiplayer quizzes remain future work. Airtel payments are manually verified as described below.

## Public previews and full learner access

The one-time access upgrade marks the most recent existing published video as a preview, retaining one of the two existing videos for visitors. Other existing records are preserved. New lessons require login by default. In **Admin panel → Content & revision → Edit / manage**, enable **Make this a public preview video** to choose additional previews or disable it to revoke a preview immediately. Unpublishing or removing the flag does not automatically expose another lesson.

Public catalog responses contain teaser metadata, cover images and selected preview videos. They omit protected video/PDF references, quiz questions and private galleries. Supporting PDFs still require a subscription even when attached to a public preview lesson. The media API separately checks every GET, HEAD, byte-range and download request; knowing or reusing a file URL does not grant access. Published cover images remain public so locked cards can show thumbnails. All other files require a current session with unexpired paid access, and draft files remain administrator-only. Responses are not publicly cached.

Locked cards explain the plans and link to sign-up/login and `/subscribe`. New accounts do not receive paid access automatically. Once the administrator verifies payment, **Check approval** refreshes the account and protected catalog. New learners first save their recovery code. Logout refreshes the catalog and immediately revokes protected file and quiz access. The original registration and quiz-score synchronization remains active.

## Learner accounts

Learners can create an account at `/signup`, log in at `/login` and manage their profile at `/account`. Accounts use a unique, case-insensitive username, a first name or nickname, a password and an optional class. No email address or date of birth is required to create an account. A payment reference, sender name and payment phone are required when requesting a paid subscription. Visitors can browse catalog titles and short descriptions and watch selected preview videos; an approved subscription opens the full library. Student accounts cannot read private drafts, upload files or access administrator tools.

Signup shows a private 128-bit recovery code once. The learner must save it before continuing. `/recover` accepts that code and the username to reset a forgotten password; using it rotates the code and revokes all previous sessions. No email delivery service is configured. Losing both the password and recovery code currently means the learner cannot recover that account through the website.

The existing D1 binding creates separate `learners`, `learner_sessions` and `learner_attempts` tables automatically, without changing content or administrator data. Passwords are salted and derived with native PBKDF2-HMAC-SHA256 at 100,000 iterations, the current Cloudflare production Web Crypto per-call ceiling ([runtime discussion](https://github.com/cloudflare/workerd/issues/1346)). This platform ceiling is below OWASP's 600,000-iteration recommendation; the stored algorithm/cost permits a future KDF upgrade; a managed identity service can also be adopted. The stored format includes the algorithm and cost for future migration. Passwords require 12–128 characters and reject a small set of common patterns. Recovery codes and random 256-bit session tokens are stored only as SHA-256 hashes. Sessions use a separate HttpOnly, Secure, SameSite=Strict cookie, expire after seven days and are invalidated by logout, password changes or recovery. Password changes require the current password and revoke all devices. All account writes require the same origin. Login/recovery throttling applies to both the network address and username; signup is limited per network address. Rate-limit keys are hashed and expire automatically. No credentials or recovery codes are stored in browser storage or logged.

Learner accounts now save bookmarks, synchronize video positions and keep private quiz results. No email delivery service is configured. No production learner accounts or example learning materials are seeded.

## My Learning and quiz progress

`/learning` contains saved lessons/PDFs/quizzes, videos to continue, completed videos, quiz history and school registrations. Bookmarks and positions are stored per learner in D1; the player saves about every 15 seconds and on pause/end. Completion means reaching at least 90% of the video, not a verified academic assessment. Replacing the standard video invalidates the previous resume position. Anonymous visitors retain only a browser-local position. Switching video quality keeps the same timeline and account progress. The dashboard refreshes after saved changes.

Quizzes are marked on the server. Signed-in attempts store a private snapshot of the questions, choices, answers and explanations so later edits do not change an old result. Submission IDs prevent retries from adding duplicate scores. The latest 100 attempts appear in history; summaries load separately from each detailed review. Topics below 70% on the latest attempt at each quiz in that recent history are suggested for revision. These are practice suggestions, not grades, rankings or predictions. Students can access only their own records.

## Exam revision and smaller videos

`/revision` separates PLE (P7), UCE (S4) and UACE (S6), with subject/year/resource filters. In the content editor, optionally classify a real resource as an exam paper, answer guide or revision material. Papers and answer guides require an actual PDF. No exam papers or answer guides are imported or generated automatically.

For lessons or event recordings, the administrator can upload a smaller compressed version of the same complete video. It must be a separate file smaller than the standard upload and should keep the same duration/timing. Learners choose Standard or Data saving, and the browser remembers that preference. Actual stored file sizes appear before playback/download, including PDFs. Videos use `preload="none"` and do not autoplay. Automatic transcoding and adaptive streaming are not included; no paid encoding service is connected.

## Student management, announcements and attendance

The admin dashboard has **School management**, **Content & revision**, **Payments & subscriptions**, **Students**, **Announcements**, and **Registration & attendance** sections. The student list searches names/usernames, filters classes and pages 50 learners at a time. It shows only profile/class, joining date and last recorded login; hashes, recovery codes and session tokens are never returned. Existing accounts acquire a last-login record on their next login.

Announcements can be drafted, published/unpublished, pinned, addressed to all learners/a level/a class, and optionally expire at the end of a Uganda date. Public active announcements appear on the homepage, while the student dashboard selects those matching the learner's class. There are no emails, SMS messages or push notifications.

For confirmed events, enable free registration and optionally set a participant capacity and deadline. A signed-in learner with active paid access can register one school group of 1–50 participants per event, with a school name, quiz team name where applicable, teacher/organiser contact and optional school phone. One reservation consumes the number of participant places; the capacity check and write are atomic. Registration closes at the event start, at the end of the selected Uganda deadline date, or when disabled by the administrator. A learner can cancel their own reservation and reserve again if space remains. Unpublishing an event blocks new registrations, while existing registrants can still see the original event details and cancel.

School contact details and attendance are visible only to the registrant and administrator. Admins see the attendance list, can mark the whole registered group present and download the filtered list as CSV. CSV values are quoted and formula-like cells escaped. Event registration has no additional ticket charge. Existing reservations remain visible and cancellable after subscription expiry. No email provider is required.

## Subscriptions and Airtel payment approval

`/subscribe` offers **10,000 UGX / 7 days**, **30,000 UGX / one calendar month**, and school bulk access at **20,000 UGX per registered student / one calendar month**. A month is explicitly one calendar month. These are prepaid access periods, with no automatic renewal. All currently published learner content is included; a subject-directory entry does not imply its lessons have been uploaded.

The merchant code and name are runtime settings (`PAYMENT_MERCHANT_CODE`, `PAYMENT_MERCHANT_NAME`), configured directly by the owner during deployment. They are intentionally absent from this public repository. Upload the owner's original QR image unchanged to the existing private R2 bucket at `payments/merchant-qr.jpeg`, then set `PAYMENT_QR_READY=true`. If the original image was uploaded under another filename, set the optional `PAYMENT_QR_OBJECT_KEY` to that exact R2 object key; otherwise the default remains `payments/merchant-qr.jpeg`. `/api/payment-qr` serves only that configured payment image. Existing content-file access remains separate. Do not set the QR flag before the image is uploaded. Without valid merchant settings, the page displays that payments are being activated and the server refuses reference submissions. Visitors must confirm the displayed merchant name in Airtel Money before paying. The app never asks for an Airtel PIN or OTP and does not initiate or automatically confirm a transfer.

1. Register or log in. For a school payment, every student registers first. Supply 1–200 unique registered usernames per payment, a school name, the sender name/phone and the Airtel transaction reference. Include the requester's own username only if that person also needs learning access.
2. The server computes the amount from its own plan and the actual validated roster. Client-supplied prices, seat counts, access states and target learner IDs cannot override it. References are normalized for duplicate detection across all accounts and plans. A new request is **pending** and grants no access.
3. Open **Admin panel → Payments & subscriptions**. Review pending requests, student rosters, sender details and references. Independently check the merchant statement; enter the exact amount received and confirm verification before selecting **Approve & activate access**. Reject with a reason if the payment cannot be verified. The requester sees the status and review note privately.
4. Approval and all associated student grants commit atomically in D1. A request is reviewed once; retries/concurrent clicks cannot grant time twice. Individual access starts at approval. For a learner with remaining paid time, the new period starts after the existing expiry. School approval applies the same rule separately to every listed student; the requester receives no automatic grant.
5. Learners select **Check approval** to refresh. Their account and My Learning show the precise expiry in Uganda time. The server checks expiry on protected catalog, file GET/HEAD/range/download, quiz marking, paid bookmark/progress writes and new event registrations. Existing personal records, payment history and cancellation of old event bookings remain available after expiry. Selected preview videos and published covers stay public.

Billing uses additive `payment_requests`, `payment_beneficiaries` and `subscription_grants` tables in the existing learning D1 database. The standard schema initializer creates them during deployment without deleting, replacing or seeding existing learner/content records. Existing learners need verified payment for full access after this version goes live. There is no live payment test data and no real transfer is made by the tests.

`tests/subscriptions.test.mjs` exercises the actual submission/approval APIs in isolated D1/R2: server prices, unpaid/pending denial, reference deduplication, admin/CSRF checks, explicit amount verification, concurrent review, exact 7/calendar-month periods, renewal, bulk roster targeting, rejected requests, history privacy and expiry of direct file/quiz access. Other content tests use explicit paid fixtures.

## Secondary subjects

The public Secondary directory and content-editor suggestions include the Ugandan NCDC subject menus for S.1–S.4 (O-Level) and S.5–S.6 (A-Level), including languages, practical subjects, General Paper and subsidiary subjects. Core/optional labels depend on the selected class. Optional offerings and A-Level combinations depend on the school. Existing uploads remain intact; the `Sub Mathematics` label is matched to `Subsidiary Mathematics` while filtering.

Sources: [NCDC subject directory](https://ncdc.go.ug/directorates/) and [2025 A-Level syllabi](https://ncdc.go.ug/books/?wbg_category_s=A-LEVEL+CURRICULUM+2025). This directory is not an NCDC endorsement or a claim of complete course coverage. The linked school repository has corresponding class-specific subject menus, with legacy staff subject labels retained.

## Isolated development preview

`npm run dev` serves Vite with an isolated local D1/R2 API, so registration, references and approvals can be reviewed without touching production data. The local administrator password is generated at startup and printed only in that development process, or supplied via `VL_PREVIEW_ADMIN_PASSWORD`. No default production administrator credential is committed. Restart the dev server after backend changes; frontend changes reload normally.

## Tests

`npm test` verifies isolated local D1/R2 uploads, private drafts, authentication, CSRF, validation, multipart videos, byte ranges, subscription access, quiz marking, unpublishing and session invalidation. The member-access tests cover preview selection, safe upgrades, protected catalogs, direct file requests, preview PDFs, downloads/ranges, login/logout, quiz access and administrator separation. The learner tests cover signup validation, database persistence, password hashing against Node crypto, session rotation and expiry, profile isolation, administrator separation, logout, password changes, one-time recovery and account/network rate limits. Expansion tests also cover bookmarks and cross-device positions, replaced/unpublished media, private result snapshots and replay protection, exam classifications, actual media sizes, smaller-video validation, admin student privacy, announcement expiry and atomic booking capacity/ownership. Tests use isolated databases; no test accounts or test materials are created on the live website.

## Connected school management system

The school portal is https://v-learning-school-management-system.mwesigwamoses859.workers.dev/. Its source is in `mwesigwamoses859-debug/v-learning-school-management-system`. The public footer links only to **Admin panel** at `/admin`. School management has no public or learner-dashboard shortcut. After administrator sign-in, the **School management** tab embeds the full school workspace using a 60-second one-use code for a private staff session. The embedded school keeps its opaque token in memory so third-party cookies are optional. Only the production learning origin can frame the school portal.

For direct school sign-in, open **Separate school username & password → Create my school login** in that private tab. It creates `schooladmin` once, displays the random initial password only in the current response and requires changing it at first login. Only its salted PBKDF2 hash is stored. Repeating the request does not reset an existing account. No initial password is present in source control, and the existing learning `ADMIN_PASSWORD` is never read or changed by this feature.

Bind production `SCHOOL_DB` to the existing `v-learning-sms-db` D1 database and redeploy Pages. Keep the original `DB`, `MEDIA` and `ADMIN_PASSWORD` settings. No integration secret is exposed to the frontend. Registrations now store student name, school, class and optional phone/email in D1, rather than browser storage. Profile edits update these same server records. Each original registration/profile update and signed-in graded quiz attempt is committed with a durable outbox event, then copied into the school database. Unavailable school connections leave the event pending; learner-session checks and **Sync saved records** retry them. The latter also backfills existing learners and quiz results in bounded batches.

Records use stable learner IDs. No names are used to merge children. Every quiz attempt remains separate and retry-safe. Server-marked practice scores do not replace school term marks. The school receives no password hashes, recovery codes or session tokens. Unknown personal details remain blank. Learners must be signed in when submitting a quiz for it to be associated with their account. Taking a quiz requires a learner account so its marks can be retained and synchronized. Administrators can also check a quiz without creating a learner score.


## Five free video lessons and registration placement

Register as **Student** or **School account**. A student must choose a class; the server normalises Primary and Senior class labels and synchronises that class into the existing school register (P1 → P.1, S1 → S.1, through S6 → S.6). The class is never guessed from age or a name. Profile updates preserve the account identity and update the same school record. School accounts are stored as school registrations with their contact person, separately from student records, and appear in the school panel's **Registered schools** section. The durable outbox retries if the school connection is unavailable.

Every registered account receives five distinct full video lessons. Use **Use a free video lesson** to open a lesson and consume one place. Rewatching the same lesson, video seeking, HEAD requests and switching video quality do not consume more places. The server commits each claim atomically, prevents a sixth concurrent claim, and authorises media by the signed-in account's claimed lesson. Catalog browsing, thumbnails and unsuccessful requests never consume a place. Trial videos do not unlock paid PDFs, quizzes or other paid features. Public sample previews remain available separately. Chosen free lessons remain replayable after all five places are used; a subscription is required to choose another full lesson.

The allowance is per registered student or school account. It is one time, follows the account across devices and does not reset on login or a profile edit. Active paid accounts do not use free places. School bulk payments still grant only the named registered student accounts, not every account with a matching school name.

Monthly subscriptions last one calendar month in Uganda time, clamping to the last day of shorter months; weekly subscriptions last seven days. Renewals preserve remaining paid time. The existing manual receipt-verification workflow remains required.

Production and preview builds run the isolated backend tests before TypeScript checks and packaging. The new tests cover all six secondary registration classes, school records, five-lesson concurrency, media ranges, replays, account separation and access to paid PDFs.


## Subscription workspaces and lesson checks

- Homepage class cards read `/api/classes`, counting published video lessons, PDF resources, and standalone or attached quizzes. Counts cover the whole catalog, not just the first page; drafts are excluded.
- Student and school accounts have `/notifications` and `/school` workspaces. Payment references create an administrator alert and an owner confirmation in the payment transaction. Approval/rejection creates private learner updates; approved school beneficiaries also receive access notifications. Notifications refresh in the dashboard and can be marked read.
- School coordinators invite existing student usernames. A student must accept in **My school** before their name, username, class and expiry appear in that school's roster. A matching free-text school name grants no access. Only one school connection can be active. Students can disconnect without losing their personal account or subscription. Phone numbers, emails and quiz answers are not shared with coordinators.
- Approved payment owners and administrators can view, print and download an HTML receipt. The browser's Print → Save as PDF produces a PDF. Pending/rejected payments have no receipt; another learner or an individual school beneficiary cannot retrieve the payer's receipt.
- The private **Subscription reports** tab shows date-filtered registrations, school accounts, trial usage, verified payment revenue, plan totals, active access and upcoming expiry, with CSV download. Period boundaries use Africa/Kampala; current access metrics are explicitly labelled as current.
- Video editing includes up to ten short questions with required worked answers. The editor requires a quiz before publishing a video. Server marking hides answer keys until submission, saves results and preserves school score synchronisation. Attached checks are available with the corresponding claimed free lesson, public preview account, or subscription. Standalone quizzes remain subscription features.
- The additive migration fills missing questions for the existing S.1 Physics **Heat Transfer** and P.6 Science **Blood Circulation** video topics. Existing educator questions are never replaced. Review/edit questions alongside their video in Admin.

### Scheduled reminders and optional email

The companion `notifications/worker.mjs` uses the same learning D1 database and has no public HTTP route. Deploy it as **v-learning-notifications** from this repository with:

```text
npx wrangler deploy --config wrangler.notifications.jsonc
```

The configuration schedules a check every five minutes. Reminders are deduplicated by learner, actual latest expiry and three-day/24-hour window. A renewal invalidates an old reminder. In-site notices are the default and work without an email provider. Opening a learner's notification centre also checks their own upcoming expiry.

Optional verified email delivery uses the [Resend email API](https://resend.com/docs/api-reference/emails/send-email). Configure these private runtime settings on both the learning Pages project and the notification Worker:

- `RESEND_API_KEY`: a sending-only key. Never commit it or expose it in frontend variables.
- `NOTIFICATION_FROM`: an address/name on a verified sending domain.
- `NOTIFICATION_ADMIN_EMAIL`: the owner's chosen administrator alert address (optional).

Users add their contact in Account settings, verify an emailed code, then opt into email delivery in Notifications. Until a sender is configured, the site offers in-site delivery and truthfully labels email as unavailable. Profile address changes require verification again. No SMS service or SMS charge is enabled by this release.

Email jobs use transactional outbox records, atomic leases, stable provider idempotency keys, bounded retries and consent/contact rechecks before every send. Jobs more than 24 hours old are not resent; their notices remain available inside the site. Reports show queued/failed/sent delivery counts. Provider acceptance is tracked; it is not a guarantee that an email reaches an inbox. Do not connect a sender until its domain and intended administrator address are verified by the owner.

For an isolated visual fixture, run `npm run dev -- --fixture`. This creates fake local learners, a school, content and payment examples in disposable local D1/R2, with a clearly development-only fixture password. It never opens the production databases, initiates a payment, or sends email. Never use fixture data as live content.
