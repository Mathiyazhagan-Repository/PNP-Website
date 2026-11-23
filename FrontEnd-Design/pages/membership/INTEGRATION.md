# Online membership — registration and OTP screens

Open `join.html` through Live Server. Homepage and shared Join Now / Join PNP links point here. Global layout, login, cookie preferences, newsroom strip and mobile actions follow the established site implementation.

## Scope

Implemented screens: `join.html`, `join.css`, `join.js` and `verify-otp.html`, `verify-otp.css`, `verify-otp.js`. The confirmation screen is implemented as membership-success.html/.css/.js. The card and Already a Member screens are also implemented as membership-card.html/.css/.js and already-member.html/.css/.js. Do not enable real registration until the backend and approved privacy documents are implemented.

The rendered form validates name, mobile, district, language and explicit consent. As requested, a clearly labelled local preview is now enabled by default. It sends no requests and stores only the masked mobile plus test-session controls in this tab's sessionStorage. Names, full mobiles and entered codes are not stored. No real membership, official ID or SMS delivery is claimed.

## Local preview

`Join Now → enter details and consent → Continue to OTP Verification` opens the OTP page locally. Use the public test fixture `123456`. The code is deliberately visible, is not a secret and provides no authentication. Incorrect entries, five-attempt limits, five-minute expiry and a thirty-second resend delay can be tried locally. A successful local test opens membership-success.html, clearly labelled as a local design preview. It does not create an official membership record. Opening the OTP page directly also works with a labelled sample masked number. `membership-local.js` owns this temporary fixture, and it is separate from the real API logic.

The tab session is temporary. The normal Edit Mobile link clears it; a new registration replaces it. No data is sent to an SMS, WhatsApp or membership service.

The card shown in the background is generic illustration, not an issued ID. Background asset: `../../assets/hero/membership-join-background.png`. Generated using the built-in imagegen tool from the supplied reference. Prompt: wide navy membership background with cyan landmark line art, generic glowing PNP membership card on the right, green/yellow/magenta lower ribbons, and empty spaces for real HTML headings and form; no member credentials, form or phone numbers.

## Data and configuration

District names use the [Government of India district directory](https://igod.gov.in/sg/KA/E042/organizations), checked November 2026. Slugs are frontend geographic values, not official district IDs or party-unit assignments. Supply approved `{id, name}` records before API integration. Preferred languages follow the five languages currently configured on this website; availability does not imply professionally approved content translations.

Load a trusted configuration before `join.js`:

```js
window.PNPMembership = {
  localPreview: false, // Required when switching from the local UI preview to real integration.
  registrationEndpoint: '/api/membership/registrations',
  consentVersion: 'SERVER_APPROVED_VERSION',
  privacyApproved: true,
  verificationPageReady: true,
  districts: [/* Approved {id, name} records from the backend */],
  messages: { /* Reviewed translations keyed by en, kn, hi, ta, te. See english in join.js. */ }
};
```

Set these only after publishing the approved privacy documents, connecting the real OTP provider and implementing `verify-otp.html`. Update the privacy/terms notice content or link to the approved documents. The frontend deliberately rejects cross-origin registration endpoints and requires HTTPS outside localhost. Provide Laravel CSRF via `<meta name="csrf-token" content="...">` as appropriate for the backend's session model.

POST body:

```json
{
  "full_name": "submitted name",
  "mobile": "+91...",
  "district_id": "approved district ID",
  "preferred_language": "en",
  "consent": {
    "accepted": true,
    "version": "approved policy version",
    "purpose": "membership_registration",
    "client_timestamp": "ISO timestamp"
  },
  "communications_consent": false
}
```

The server must validate again, record the authoritative consent timestamp/version, establish a short-lived HttpOnly session and send an actual OTP. Only `{status: "otp_pending", session_established: true}` from a successful response advances to verification. Do not treat the client timestamp as authoritative. No pending personal data or secrets are put in redirect URLs. OTP verification and member creation must be server-side.

Handle 422 validation responses through an `errors` map keyed by submitted field names; handle 429 rate limiting and other errors without revealing whether the phone is registered. The server enforces attempt limits, expiry, bot protection where needed, duplicate protection, and request idempotency. Confirmation and membership IDs must never be issued by this client page.

## Checks

- Required fields, Unicode names, Indian mobile validation and invalid option rejection.
- Mandatory consent unchecked by default; communications consent separate and optional.
- Invalid submit focuses first invalid field; error text associated with its field.
- Valid default submit makes no network request and does not navigate or claim OTP delivery.
- Privacy and terms dialogs support close, Escape and keyboard focus.
- Login button delegates to the existing shared login.
- Four-column desktop fields, two-column tablet fields, one-column small-mobile fields.
- Verify at 1440, 1024, 768, 390 and 360px in a browser; check ticker/sticky action overlap.
- Test real backend success, validation, timeout, session, CSRF and rate-limit handling before enabling registration.

## OTP verification screen

Open `verify-otp.html` through Live Server to inspect the dark secure-tech layout. It includes a single accessible six-digit input with six visual cells, paste and Unicode digit normalization, explicit consent, masked mobile display, resend, edit-mobile navigation and shared layout/dialogs. The default local mode is clearly identified, uses a public test code and only claims local completion. In API mode, masked mobile, sent OTP confirmation and resend policy must come from real server responses.

Artwork: `../../assets/hero/membership-otp-background.png`, created with the built-in imagegen tool. Prompt: dark navy secure-tech background matching the supplied reference, glowing cyan shield and lock on a platform, cyan building line art and coloured bottom ribbons; leave the title and live form areas empty; no phone numbers, form or issued credentials. The shield's OTP lettering is decorative.

Additional trusted configuration:

```js
Object.assign(window.PNPMembership, {
  otpSessionEndpoint: '/api/membership/otp-session',
  verifyOtpEndpoint: '/api/membership/verify-otp',
  resendOtpEndpoint: '/api/membership/resend-otp',
  successPageReady: false, // Set true only when the confirmed-membership API is connected.
  otpMessages: { /* Professionally reviewed message keys from verify-otp.js. */ }
});
```

GET the session endpoint using same-origin HttpOnly cookies. It must return only necessary masked session information, never the raw OTP or full mobile number:

```json
{
  "status": "otp_pending",
  "session_established": true,
  "otp_sent": true,
  "masked_mobile": "+91 ******4321",
  "server_time": "ISO timestamp",
  "expires_at": "ISO timestamp",
  "resend_available_at": "ISO timestamp",
  "attempts_remaining": 3,
  "registration_consent": {"accepted": true, "version": "approved version"}
}
```

The example trailing digits and attempt count above are documentation examples only, never client defaults. Resend eligibility and expiry are calculated from actual server timestamps, accounting for `server_time` when available. Absent resend timing keeps the resend button disabled. User clocks and timers do not enforce security; the backend must enforce all policies.

POST verification submits only the entered `otp` and reconfirmed consent version/purpose/client timestamp. It does not create a member locally. Navigation to `membership-success.html` requires all of: configured integration, approved privacy documents, the success page marked ready, an actual successful response with `status: "member_created"` and `member_confirmed: true`. A `mobile_verified` result alone must not be shown as completed membership. The authenticated success page must retrieve and revalidate membership from the server itself rather than trust client navigation.

POST resend returns the same session schema; show sent confirmation only for `otp_sent: true`. Support `OTP_INVALID`, `OTP_EXPIRED`, `TOO_MANY_ATTEMPTS`, `SESSION_EXPIRED`, `CONSENT_VERSION_CHANGED`, HTTP 429 and `Retry-After`, network errors and unavailable-provider errors. Duplicate responses remain generic. Reconfirm consent against the exact previously accepted server version, and record the authoritative server timestamp when membership is created. Never cache or log OTPs, put personal information in URLs, or store these values in localStorage/sessionStorage.

Verify these additional cases before enabling production:

- Local mode: public code works, incorrect codes fail, resend observes the local wait, no network request or real member/ID claim.
- With `localPreview: false` and no API configuration: no request, fake mobile, countdown or successful OTP acceptance.
- Full six-digit paste, native Indic digit entry, correction with Backspace and keyboard navigation.
- Short code / missing consent: validation errors and focus on the invalid control.
- Active session: privacy-conscious masking, real resend deadline and real expiry.
- Invalid or expired code: no advancement, clear sensitive input, show the correct retry state.
- Rate limit / exhausted attempts / expired session: restricted actions, safe error feedback.
- A response that only verifies the mobile never displays completed registration.
- No session or consent-version mismatch cannot be used to create membership.
- Resend uses a real provider response and resets eligibility from the new server deadline.
- Mobile layouts: six cells fit at 360px; form buttons stay clear of shared sticky controls.

## Membership confirmation screen

`membership-success.html`, `.css` and `.js` implement the supplied sunset flag / navy confirmation design. Complete the local registration and enter `123456` to reach it. For visual review without completing the flow, open `membership-success.html?preview=1`; the preview parameter works only while local mode is enabled and is never authentication.

In local mode, the screen explicitly says local design preview and labels `PNP0004587` as a sample number. View opens the dedicated membership-card.html screen; Download creates a vector SVG marked NOT VALID FOR IDENTIFICATION; Share opens native sharing or copies a public preview description. These actions do not issue an ID, create a membership or expose entered personal information. No verification QR or credentials are fabricated.

For real integration set `localPreview: false` and provide `membershipEndpoint` pointing to a same-origin HTTPS authenticated endpoint. It must return `{status: "confirmed", member: {membership_number, full_name}, card: {view_url, download_url, share_url}}`. The server must independently authenticate the request. Never trust the preceding navigation or local storage as proof of membership. Only that response produces the real "You Are Now a PNP Member" heading. Buttons require safe, same-origin URLs supplied by the backend. `share_url` must be a deliberately approved public sharing URL, never a private member-record/download URL or personal information.

The background is `../../assets/hero/membership-success-background.png`, generated with the built-in imagegen tool. Prompt: match the reference's warm sunset crowd and Karnataka flag on the left, blend to empty navy on the right for live HTML confirmation content, add a small golden lower-right ribbon, no text, member numbers or QR.

Test pending/missing sessions, real-mode rejection of `?preview=1`, safe URL handling, native share cancellation, sample SVG labelling and responsive layouts before release. No SMS/WhatsApp sent status is claimed by this screen.

## Digital membership card screen

`membership-card.html/.css/.js` implements the clipped-paper ID-card reference using the existing sunset flag background, native SVG/CSS brand graphics, card details, sample portrait, landmark artwork and three yellow action icons. `View Member ID` on the local confirmation now opens this screen. The local sample uses the reference's fictional name Rahul Sharma, sample number PNP0004587 and illustrative date 20 Nov 2026. These are not records from a membership service and are explicitly marked as design previews, including on downloaded/printed cards.

The generated portrait is `../../assets/hero/membership-sample-portrait.png`. Built-in imagegen prompt: square passport-style headshot of a fictional Indian man in his thirties with short black hair, trimmed beard, light-blue collared shirt and plain pale-grey background; no text, logos or badges. It is used only in local preview mode. Actual member photographs are displayed only from an approved backend photo reference; otherwise the real card shows a neutral silhouette.

Local Download creates a self-contained high-resolution SVG with embedded artwork and a NOT VALID MEMBERSHIP label. Share uses the browser's native sharing UI, with safe text/clipboard fallback. The print stylesheet isolates the card and retains the preview disclaimer. The local QR is a valid QR encoding only the public string `PNP DESIGN PREVIEW - NOT A VALID MEMBERSHIP OR IDENTIFICATION CARD`. It is not a verification URL, token or credential.

QR encoding runs entirely in the browser using the locally bundled [qrcode-generator by Kazuhiko Arase](https://github.com/kazuhikoarase/qrcode-generator). Source: `js/dist/qrcode.js`, downloaded 23 Nov 2026 to `../../assets/vendor/qrcode.js`. MIT copyright and licence are retained in the source header and `qrcode-LICENSE.txt`. No card data is sent to a third-party QR service.

In real mode, the authenticated membership endpoint must return confirmed `member` fields `full_name`, `membership_number`, `district_name`, `status` and `registered_at`, plus approved `card.approved_photo_url`, `card.download_url`, `card.share_url` and secure `card.verification_url` as applicable. Optional missing dates/photos are omitted or shown with a neutral silhouette. Real card download/share remain disabled unless the required same-origin approved URLs are supplied. The actual QR is generated only from a backend-issued verification URL, with no client-generated credentials or personal fields added. Missing membership hides the card and offers registration; a client preview parameter never bypasses real-mode authentication.

Check the full local route Join → OTP 123456 → confirmation → View Member ID. Check QR rendering, explicit sample notice, portrait embedding in SVG export, native share/cancellation, print and responsive sizes. In real mode verify missing/unauthorised sessions and rejection of cross-origin or non-HTTP(S) asset/action URLs.


### Card reference alignment update

The desktop card banner now scales positions, typography and card proportions from the supplied 964 ? 292 reference using container-relative CSS units. It uses the dedicated `membership-card-background.png`, generated with the built-in imagegen tool: small far-left Karnataka flag and sunset crowd, clear blue heading space, dark navy middle/right, lower-right yellow/magenta ribbons, with no text or card baked into the image. The smaller flag no longer sits behind the heading. The metal clip, compact card details, QR block, landmark and right action column have been repositioned. Mobile and print layouts remain separate.


## Already a Member screen

`already-member.html/.css/.js` follows the supplied navy sunset/flag reference with a person/check icon, white/yellow heading, light login panel, mobile and password inputs, visibility toggle, magenta CTA and footer links. It reuses the existing card background; no new raster artwork is required. The registration page?s Already a member? Login button opens this screen. The shared global login remains unchanged.

As explicitly requested, local preview works with public test mobile `9876543210` and password `PNP12345`. These fixtures do not authenticate a real account. Passwords and full mobiles are never stored. Correct fixture input opens the sample card, while wrong input shows a local-preview error. The password is cleared after any login attempt and when leaving the page. Forgot Password opens preview help and does not claim to send a reset message. The page never publicly asserts that an entered phone belongs to an existing member.

For real account integration set `localPreview: false`, supply a same-origin HTTPS `loginEndpoint` using HttpOnly session cookies and CSRF protection, and optionally `passwordResetUrl`. A successful login requires an actual `{status: "authenticated", authenticated: true}` response, followed by independent authenticated membership/card retrieval. Generic credential/rate-limit errors avoid exposing account existence. A separate approved password policy, secure password hashing, backend throttling and real recovery flow are required; this form is not an authentication implementation. The API config automatically disables default preview mode when any membership/login endpoint is present unless preview is explicitly requested.

Test blank and invalid inputs, Unicode phone digits, correct/incorrect fixtures, password visibility and clearing, missing real configuration, rejected/unconfirmed backend login, network/rate-limit states, password help, Join Now navigation, shared layout and narrow-screen controls.


### Already a Member reference alignment

The login composition now scales from the supplied 556 ? 180 reference: left PNP brand and flag, central outlined-person/check icon and white/yellow italic heading, and the compact light panel at the right with yellow filled-lock badge. Local credentials are displayed in a separate small strip so they do not change the form layout. A dedicated `already-member-background.png` replaces the reused card background. Built-in imagegen prompt: match the reference?s large far-left Karnataka flag and sunset crowd, clean blue space for the central heading/icon and dark navy behind the right form, faint lower-right architecture; no text, forms or icons baked into the background. The icon, input, password visibility and login behaviours remain native HTML/SVG/JavaScript.

## Referral screen (P2 local UI)

`referral.html/.css/.js` adds the supplied flag-draped crowd / invitation heading / light referral-panel design. Open it from **Invite & Refer** below the membership card. The shared header, footer, newsroom strip, dialogs and mobile actions are reused.

The artwork `../../assets/hero/membership-referral-background.png` was generated using the built-in imagegen tool. Prompt: match the reference's rear-view man draped in a yellow/red Karnataka flag, raised fist and warm sunset crowd at left, clean blue heading space in the middle, empty navy right for a live HTML panel, narrow magenta/yellow upper-right ribbons; no text, panel or icons baked into the artwork. All group, megaphone, link, copy, social and statistic icons are native SVG.

Local mode shows the reference's sample counts 12 and 8, with Local preview visible. They are static design fixtures: copying/sharing never increments them or claims a real successful referral. The local link points to this project's join.html?ref=PREVIEW4587 using the current origin rather than inventing an official public domain. Copy uses the browser clipboard, with manual-select fallback; Share uses native sharing or copy. WhatsApp, Telegram, Facebook and X links open their public sharing interfaces only after user clicks. The page does not automatically post, message, reward users or track contacts.

Real mode requires an authenticated same-origin HTTPS `referralEndpoint`. Expected response: `{status: "ready", referral_url: "approved same-origin public invitation URL", statistics: {people_referred: 12, successful_joins: 8}}`. Example counts are not client fallbacks. Missing or invalid counts hide the metrics instead of fabricating values. No session or invalid referral URLs leave sharing disabled. Do not put private membership or contact data into a public referral URL.

The registration adapter accepts a bounded alphanumeric/underscore/hyphen ref query only after registration consent is given and sends it as referral_source to the configured registration backend. PREVIEW-prefixed codes are excluded from real submissions. The server must validate approved codes, attribute genuine registrations, reject duplicates/fraud and provide approved member-only statistics. Nothing is stored or tracked from the URL before consent.

Checks: local link uses the project route; clipboard and share carry exactly that URL; static metrics do not change on copy/share; sharing is disabled without authorised real data; invalid counts remain hidden; missing/rejected services have safe states; real mode cannot be enabled by an arbitrary URL parameter; the form and social row fit narrow screens.
