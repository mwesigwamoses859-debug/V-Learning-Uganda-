# V-Learning Uganda

Free-access learning for Ugandan schools, with separate Primary (P1–P7) and Secondary (S1–S6) libraries, videos, PDFs, practice quizzes and events with real photos and recordings.

Contact: **Tr Ojok Mtn · +256 778 441681**.

## Interface

The public interface follows the supplied Stitch “Equatorial Clarity” homepage layout, with the official V-Learning Uganda logo and its magenta (`#BE1373`) and yellow (`#F8D346`) as the main colours. Deep navy (`#24324B`) supports headings and body text, while small teal (`#167D7F`) icons, badges and highlights complement the main magenta and yellow palette. White cards, light pink backgrounds and Plus Jakarta Sans keep the learning pages readable. The uploaded logo is served unchanged from `public/brand/v-learning-uganda-logo.jpg`. The same tokens style the learning libraries, event pages and administrator publishing tools. The application uses its existing live API rather than placeholder content.

## School photographs and YouTube

The homepage uses two credited illustrative school photos taken in Uganda, served locally at lightweight sizes. These are stock photographs, not a claim that the pictured learners attend a particular partner school:

- `public/images/schoolchild-uganda.jpg`: [bill wegener / Unsplash](https://unsplash.com/photos/boy-in-red-crew-neck-t-shirt-smiling-NmVKiFkVdnM).
- `public/images/classroom-uganda.jpg`: [Zach Wear / Unsplash](https://unsplash.com/photos/a-group-of-people-sitting-at-desks-in-a-classroom-wjCYyd_KppE), Iganga, Uganda.

Both source pages identify the images as free to use under the [Unsplash License](https://unsplash.com/license). The source images are unchanged apart from the image host's delivered size/compression; CSS fits them into the layout. Photographer credits and source links appear in the footer.

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

All published content is publicly accessible without learner registration or payment. The server forces free access and zero prices. Future paid access requires learner authentication, a payment provider and entitlement checks. Hosting follows the Cloudflare account's existing usage plan.

Practice quizzes use manually entered, teacher-reviewed questions and server-side marking. Answers are hidden from the public catalog until submission. PDFs can be attached as supporting material. Automatic PDF extraction/OCR, live multiplayer quizzes, learner accounts, saved results and payments remain future work.

## Tests

`npm test` verifies isolated local D1/R2 uploads, private drafts, authentication, CSRF, validation, multipart videos, byte ranges, free access, quiz marking, unpublishing and session invalidation. Test files are never published to production.
