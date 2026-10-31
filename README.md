# V-Learning Uganda

Free-access learning for Ugandan schools, with separate Primary (P1–P7) and Secondary (S1–S6) libraries, videos, PDFs, practice quizzes and events with real photos and recordings.

Contact: **Tr Ojok Mtn · +256 778 441681**.

## Interface

The public interface follows the supplied Stitch “Equatorial Clarity” homepage layout, with the official V-Learning Uganda logo and its magenta (`#BE1373`) and yellow (`#F8D346`) as the main colours. Deep navy (`#24324B`) supports headings and body text, while small teal (`#167D7F`) icons, badges and highlights complement the main magenta and yellow palette. White cards, light pink backgrounds and Plus Jakarta Sans keep the learning pages readable. The uploaded logo is served unchanged from `public/brand/v-learning-uganda-logo.jpg`. The same tokens style the learning libraries, event pages and administrator publishing tools. The application uses its existing live API rather than placeholder content.

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

Open `/admin`. Create a video lesson, PDF resource, practice quiz or event. Choose Primary or Secondary, select the class and enter a subject/topic. Upload actual files and save a private draft or publish for free. To unpublish, edit the item and choose **Save draft**. Stored content persists beyond the browser session. There is no permanent-delete control in this release.

Videos: MP4, WebM or MOV up to 1 GB. PDFs: up to 25 MB. Photos: JPG, PNG or WebP up to 10 MB each, with up to 24 photos per event. Videos above 8 MB use multipart chunks within an upload session; interrupted page sessions must restart. Native playback supports byte ranges. Compressed MP4 is recommended for mobile data; adaptive transcoding is not included.

All published content is publicly accessible without learner registration or payment. The server forces free access and zero prices. Learner accounts are optional; future paid access still requires a payment provider and entitlement checks. Hosting follows the Cloudflare account's existing usage plan.

Practice quizzes use manually entered, teacher-reviewed questions and server-side marking. Answers are hidden from the public catalog until submission. PDFs can be attached as supporting material. Automatic PDF extraction/OCR, live multiplayer quizzes and payments remain future work.

## Learner accounts

Learners can create an account at `/signup`, log in at `/login` and manage their profile at `/account`. Accounts use a unique, case-insensitive username, a first name or nickname, a password and an optional class. No email address, date of birth or payment details are required. Published learning remains free and accessible without an account. Student accounts cannot read private drafts, upload files or access administrator tools.

Signup shows a private 128-bit recovery code once. The learner must save it before continuing. `/recover` accepts that code and the username to reset a forgotten password; using it rotates the code and revokes all previous sessions. No email delivery service is configured. Losing both the password and recovery code currently means the learner cannot recover that account through the website.

The existing D1 binding creates separate `learners`, `learner_sessions` and `learner_attempts` tables automatically, without changing content or administrator data. Passwords are salted and derived with native PBKDF2-HMAC-SHA256 at 100,000 iterations, the current Cloudflare production Web Crypto per-call ceiling ([runtime discussion](https://github.com/cloudflare/workerd/issues/1346)). This platform ceiling is below OWASP's 600,000-iteration recommendation; review a managed identity provider or a stronger compatible KDF before adding paid accounts. The stored format includes the algorithm and cost for future migration. Passwords require 12–128 characters and reject a small set of common patterns. Recovery codes and random 256-bit session tokens are stored only as SHA-256 hashes. Sessions use a separate HttpOnly, Secure, SameSite=Strict cookie, expire after seven days and are invalidated by logout, password changes or recovery. Password changes require the current password and revoke all devices. All account writes require the same origin. Login/recovery throttling applies to both the network address and username; signup is limited per network address. Rate-limit keys are hashed and expire automatically. No credentials or recovery codes are stored in browser storage or logged.

Learner accounts now save bookmarks, synchronize video positions and keep private quiz results. No email delivery service is configured. No production learner accounts or example learning materials are seeded.

## My Learning and quiz progress

`/learning` contains saved lessons/PDFs/quizzes, videos to continue, completed videos, quiz history and school registrations. Bookmarks and positions are stored per learner in D1; the player saves about every 15 seconds and on pause/end. Completion means reaching at least 90% of the video, not a verified academic assessment. Replacing the standard video invalidates the previous resume position. Anonymous visitors retain only a browser-local position. Switching video quality keeps the same timeline and account progress. The dashboard refreshes after saved changes.

Quizzes are marked on the server. Signed-in attempts store a private snapshot of the questions, choices, answers and explanations so later edits do not change an old result. Submission IDs prevent retries from adding duplicate scores. The latest 100 attempts appear in history; summaries load separately from each detailed review. Topics below 70% on the latest attempt at each quiz in that recent history are suggested for revision. These are practice suggestions, not grades, rankings or predictions. Students can access only their own records.

## Exam revision and smaller videos

`/revision` separates PLE (P7), UCE (S4) and UACE (S6), with subject/year/resource filters. In the content editor, optionally classify a real resource as an exam paper, answer guide or revision material. Papers and answer guides require an actual PDF. No exam papers or answer guides are imported or generated automatically.

For lessons or event recordings, the administrator can upload a smaller compressed version of the same complete video. It must be a separate file smaller than the standard upload and should keep the same duration/timing. Learners choose Standard or Data saving, and the browser remembers that preference. Actual stored file sizes appear before playback/download, including PDFs. Videos use `preload="none"` and do not autoplay. Automatic transcoding and adaptive streaming are not included; no paid encoding service is connected.

## Student management, announcements and attendance

The admin dashboard has **Content & revision**, **Students**, **Announcements**, and **Registration & attendance** sections. The student list searches names/usernames, filters classes and pages 50 learners at a time. It shows only profile/class, joining date and last recorded login; hashes, recovery codes and session tokens are never returned. Existing accounts acquire a last-login record on their next login.

Announcements can be drafted, published/unpublished, pinned, addressed to all learners/a level/a class, and optionally expire at the end of a Uganda date. Public active announcements appear on the homepage, while the student dashboard selects those matching the learner's class. There are no emails, SMS messages or push notifications.

For confirmed events, enable free registration and optionally set a participant capacity and deadline. A signed-in learner can register one school group of 1–50 participants per event, with a school name, quiz team name where applicable, teacher/organiser contact and optional school phone. One reservation consumes the number of participant places; the capacity check and write are atomic. Registration closes at the event start, at the end of the selected Uganda deadline date, or when disabled by the administrator. A learner can cancel their own reservation and reserve again if space remains. Unpublishing an event blocks new registrations, while existing registrants can still see the original event details and cancel.

School contact details and attendance are visible only to the registrant and administrator. Admins see the attendance list, can mark the whole registered group present and download the filtered list as CSV. CSV values are quoted and formula-like cells escaped. No payment or email provider is required.

## Tests

`npm test` verifies isolated local D1/R2 uploads, private drafts, authentication, CSRF, validation, multipart videos, byte ranges, free access, quiz marking, unpublishing and session invalidation. The learner tests cover signup validation, database persistence, password hashing against Node crypto, session rotation and expiry, profile isolation, administrator separation, logout, password changes, one-time recovery and account/network rate limits. Expansion tests also cover bookmarks and cross-device positions, replaced/unpublished media, private result snapshots and replay protection, exam classifications, actual media sizes, smaller-video validation, admin student privacy, announcement expiry and atomic booking capacity/ownership. Tests use isolated databases; no test accounts or test materials are created on the live website.
