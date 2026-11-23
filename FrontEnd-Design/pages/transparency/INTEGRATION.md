# Transparency Portal — opening overview

This delivery implements the reference-led opening overview in `transparency.html/.css/.js`. It includes shared header/footer/dialogs/sticky actions, the centralised newsroom strip, the PNP brand, Karnataka photo silhouette, decorative magnifier, four financial-summary cards and five record categories. Donation Disclosures is also implemented as donations.html/.css/.js and opens from its overview category button. Other empty module files remain reserved for the next requested designs; their category buttons open accessible published-records dialogs rather than empty draft pages.

Access through **More → Transparency**, including module-aware selected navigation. The homepage transparency CTA and shared footer now point to this route.

## Data integrity

There are no supplied approved financial records. Accordingly the opening cards use the unavailable values shown in the reference, not invented totals or official zeroes. Reporting period/source metadata is retained below the overview. The shield/check illustrations are decorative concepts, not certificates, audit claims or actual filing confirmations.

Optionally define `window.PNPTransparency` before the page script:

```js
window.PNPTransparency = {
  overviewEndpoint: '/api/public/transparency/overview',
  // Or use a server-approved public `overview` object and `documents` array.
  messages: { /* Reviewed translations keyed by the five website languages. */ }
};
```

Expected public overview structure, with actual approved values replacing schema descriptions:

```text
approved: true
publication_status: "published"
reporting_period: actual published reporting period
currency: "INR"
source: {title: actual source document title, url: actual secure published URL}
metrics: {
  total_donations: actual aggregate rupees,
  total_expenditure: actual aggregate rupees,
  reports_published: actual integer count,
  statutory_filings: actual integer count
}
documents: [approved published document records]
```

No default official numbers are included. The interface ignores unapproved, draft, superseded or otherwise unpublished summaries/documents. Every displayed summary amount requires the reporting period and a secure source URL; rupee amounts additionally require explicit INR currency. Missing/invalid individual metrics retain unavailable values. Invalid/newly withdrawn data clears previously displayed values. Service failure clears the data and offers retry.

Each published document supports `title`, `description`, `category` (`donations`, `expenditure`, `reports`, `disclosures`), `reporting_period`, `publication_date`, `file_type`, `file_size`, `file_url`, `approved: true`, `publication_status: "published"`. Only approved metadata is rendered using textContent. All categories and the complete library open from the five buttons. Missing files show an unavailable message instead of fake downloads. Actual download requests validate HTTP success and show a useful error; cross-origin publications need appropriate CORS or a controlled backend download proxy. Document View opens the approved URL safely in a new tab. No private donor/transaction fields are rendered or stored.

The frontend is not financial approval, auditing, statutory filing or access control. The publishing backend must enforce the real authorisation/approval process and provide only public records. The browser must not receive drafts or private financial data in the first place.

## Artwork

- `assets/hero/transparency-magnifier.png`: generated with the built-in imagegen tool. Prompt: transparent 3D cutout matching the supplied lower-left document stack, dark chrome magnifying glass and generic green shield/check, no text, actual figures, government seal or certification. It is decorative, not evidence of approval.
- `assets/hero/karnataka-silhouette.svg`: the existing project's actual boundary path reused as a filled mask; geographic source metadata is preserved. No generated approximate state boundary is used.
- The map photo reuses `our-vision-reference.png`. The upper-right building reuses `footer-vidhana.png`; national flag and all card/navigation icons are native SVG.
- Desktop proportions scale from the supplied wide reference. Mobile rearranges the metrics into two columns and the record categories into a touch-friendly grid.

## Verification

Check the shared Transparency navigation/More selection, all five record dialogs, empty state, published/draft separation, reporting-period/source requirements, currency formatting and unavailable values. Test safe source/file URLs, escaped CMS content, actual download errors and service retry. Check 1440/1024/768/390/360px, keyboard focus, dialog Escape, regional language/date formatting and sticky actions before publishing.


## Donation Disclosures screen

`donations.html/.css/.js` follows the supplied pale-blue reference: heading/building artwork, reporting-year pills, four pastel summary cards, native SVG magenta trend, published-report table, document controls and privacy/source notes. The building uses the existing navbar-vidhana.png; all icons and charts are native SVG. No chart/UI library has been introduced.

With no live transparency endpoint configured, this screen explicitly shows an illustrative design preview. Default sample annual contributions are INR 12.40 Cr for FY 2025-26 and INR 9.80 Cr for FY 2024-25. Four illustrative records per period are paginated three at a time. Initial chart scope is Apr-Sep; Quarterly groups the twelve fixture months into four totals, while Annual displays all twelve monthly values. All fixture monthly values sum to their displayed annual total. Period changes reset the initial view. Sample source status says Illustrative Preview, never official approval. These fixtures are not published financial records.

View buttons open clearly labelled metadata previews. No actual PDF files were provided: sample downloads and Download Statement are disabled and describe the unavailable state. No PDF or official document is fabricated. Real file downloads require approved published URLs and validate HTTP success, with error feedback.

For production set `window.PNPTransparency.donationPreview = false` and provide `donationDisclosuresEndpoint` as a same-origin HTTPS public API, or server-supplied `donationPeriods`. If the main live overview endpoint is configured, default donation preview is disabled. The donation API response is `{periods: [...]}`. Each period requires id, approved:true, publication_status:published, reporting_period, currency:INR, numeric total_contributions (rupees), integer statement_count, source:{title,url}. Optional series monthly/quarterly use `{label, amount}` (rupees); optional reports use title, reporting_period, publication_date, file_type, kind (annual/quarterly), file_url, approved:true and publication_status:published. Optional statement_url is the approved primary statement download. Series and categories not published remain unavailable rather than being invented. Only approved periods appear in the filters.

No private donor records, PAN, email, phone or transaction details are rendered or stored. Actual chart values use a zero baseline, explicit crore units, keyboard/focus tooltips, scoped period labels and a complete screen-reader data table. Reporting periods and source links accompany published aggregates. Backend approval, legal disclosure, authentication for unpublished data and CMS publication remain server responsibilities.

Verified locally with DOM fixtures: preview labels and exact fixture totals, chart and report view filters, pagination, sample document preview, disabled sample downloads, approved-only filtering, empty states, source/currency guards, shared IDs and CSS structure. Perform browser QA at 1440/1024/768/390/360px and test real API/file/network failures before publication.


## Expenditure Reports
Added expenditure.html/css/js, linked from the overview Expenditure Reports tile. Uses the shared header, footer and compact pale-blue reporting styles. The native SVG donut displays the reference sample breakdown (40/25/20/10/5) and INR 10.80 Cr illustrative total. Financial year, annual/quarterly controls, category filtering and report metadata dialogs work locally. Sample downloads remain disabled until official files exist.

For published data set PNPTransparency.expenditurePreview=false and supply expenditurePeriods or a same-origin expenditureEndpoint returning {periods:[...]}. Each period requires approved:true, publication_status:published, currency:INR, reporting_period, total_expenditure, source:{title,url}, categories:[{id,label,amount}], reports:[{approved:true,publication_status:published,title,reporting_period,publication_date,kind,categories,document_url,download_url}], with optional download_all_url. Category amounts must reconcile with the total; otherwise no donut is drawn. No compliance approval is inferred. Native chart and icons reuse navbar-vidhana.png; no new generated artwork.

Validation: node syntax checks; mock DOM checks for totals, category shares, annual/quarterly filters, category selection, year switching and disabled sample downloads; unique element IDs and section asset checks. Browser visual review unavailable in this session. Shared support markup retains existing policy-page links from the donation screen.


## Annual Financial Reports
reports.html/css/js matches the shared pale-blue reporting layout, civic header artwork, pastel metrics, native fund-utilisation donut and report table. Linked from the overview Annual Reports tile. Sample reference total INR12.40Cr and shares48/24/18/7/3 are explicitly illustrative; no audit assertion or working sample download is fabricated. Year selection filters records; All Years restores historical records, with the chart explicitly labelled as the latest sample annual summary. Table has pagination and metadata previews.
Configuration: annualReportsPreview:false and annualReportsPeriods or annualReportsEndpoint (same origin). Uses the expenditure record contract with total_funds in place of total_expenditure. Published/approved flags, INR currency and source URL required; reports independently require publication approval. Only supplied document/archive URLs enable downloads. Validation: node syntax and mock DOM tests for sample totals, five categories, fiscal year filtering, All Years, disabled sample downloads, empty live mode and unique HTML IDs.


## Statutory Disclosures
disclosures.html/css/js adds the reference light-blue filing dashboard, native PNP wordmark and civic artwork, four metric cards, six-category native SVG bar chart and disclosures table. Overview Statutory Disclosures opens this screen. Explicit sample fixtures contain24/18/13 filings for three years. Preview category rows represent document types; no compliance certification or official filing/download is fabricated. Period buttons, native dropdown, All Disclosures and metadata dialogs work locally. Live configuration: disclosuresPreview:false with disclosuresRecords or same-origin disclosuresEndpoint returning {records:[...]}. Each record requires approved:true, publication_status:published,title,category,reporting_period,source.url; optional publication_date,document_url,download_url. Live rows retain every published record. Counts derive from supplied records and compliance remains source-dependent. Checked JS syntax, mock DOM period/count/dialog/download/publication gating and unique IDs.
