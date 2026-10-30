# V-Learning Uganda

Free-access learning for Ugandan schools, with separate Primary (P1–P7) and Secondary (S1–S6) libraries, videos, PDFs, practice quizzes and events with real photos and recordings.

Contact: **Tr Ojok Mtn · +256 778 441681**.

## Deployment

Use Node.js 22 or later, run `npm ci`, then `npm run build`. Cloudflare Pages deploys `dist` from `main`. The build copies the API into `dist/_worker.js`; only `/api/*` invokes it.

Production Pages bindings:

- D1 **DB** → `v-learning-uganda`.
- Private R2 **MEDIA** → `v-learning-uganda-media`.
- Production secret **ADMIN_PASSWORD**, chosen by the owner (16–256 characters). Store it in Cloudflare, never in GitHub or a frontend environment variable. Redeploy after changing it. Changing the password invalidates existing sessions.

The API creates its empty database schema automatically. No example content is seeded. R2 stays private; files are served only when attached to published content or requested by an authenticated administrator.

## Local development

Run `npm ci`, then `npm run dev`. This starts Vite with an isolated, empty Miniflare D1/R2 API. It never connects to the production database or bucket. Set `LOCAL_ADMIN_PASSWORD` to choose a development password; the default is the non-production fixture shown in `scripts/dev-server.mjs`. Local data is discarded when the server stops. Production secrets and Cloudflare bindings are only used by the deployed worker.

## Administrator workflow

Open `/admin` to enter the School Office. Use the sidebar to manage videos, PDFs, quizzes, events or private drafts. The Overview shows actual published counts, recently updated items and publishing shortcuts. Search and filter a content section by school level or publication status. Create a video lesson, PDF resource, practice quiz or event. Choose Primary or Secondary, select the class and enter a subject/topic. Upload actual files and save a private draft or publish for free. To unpublish, edit the item and choose **Save draft**. Stored content persists beyond the browser session. There is no permanent-delete control in this release.

Videos: MP4, WebM or MOV up to 1 GB. PDFs: up to 25 MB. Photos: JPG, PNG or WebP up to 10 MB each, with up to 24 photos per event. Videos above 8 MB use multipart chunks within an upload session; interrupted page sessions must restart. Native playback supports byte ranges. Compressed MP4 is recommended for mobile data; adaptive transcoding is not included.

All published content is publicly accessible without learner registration or payment. The server forces free access and zero prices. Future paid access requires learner authentication, a payment provider and entitlement checks. Hosting follows the Cloudflare account's existing usage plan.

Practice quizzes use manually entered, teacher-reviewed questions and server-side marking. Answers are hidden from the public catalog until submission. PDFs can be attached as supporting material. Automatic PDF extraction/OCR, live multiplayer quizzes, learner accounts, saved results and payments remain future work.

## Tests

`npm test` verifies isolated local D1/R2 uploads, private drafts, authentication, CSRF, validation, multipart videos, byte ranges, free access, quiz marking, unpublishing and session invalidation. Test files are never published to production.
