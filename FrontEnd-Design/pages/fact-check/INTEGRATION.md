# Fact Check and FAQs

## Official requirement comparison
Read Section5.15 of workspace PNP_Website_Requirement_Specification.docx on24 Nov2026 (read-only OOXML extraction; source document unchanged).
Required P1: myth-versus-fact entries with claim, verdict, evidence links and date; dated/sourced answer pages in every website language; FAQ structured data. Suggested questions in the specification are not approved answers. Report misinformation form creating an IT Cell ticket is P2, not a mandatory frontend form for this section. The proposed five standalone screens are a recommended UI structure, not five independently mandated pages. This change implements only the requested landing section and its search/category behaviour. Remaining page files stay unchanged and are not declared complete.

## Implementation
fact-check.html/css/js provides the reference navy/civic hero, yellow accent/checklist, gold magnifier/books illustration, rounded light search panel and three native SVG category cards. Shared header/footer/newsroom strip and support dialogs reused. Global footer FAQ now opens this public information landing page; no top-level menu added. Scrolling stays native.

Cards/search reveal inline published results rather than navigating to unfinished page files. Empty category states are honest; no fictional claims, evidence, verdicts, FAQs or official corrections supplied. FAQ uses semantic details/summary. Facts/clarifications navigate canonical URLs where supplied, otherwise show approved evidence/source/date/correction content in a native dialog. Load-more bounds initial results to12. Language filters use approved content language IDs and localised dates; no invented translations. FAQPage JSON-LD is emitted only for currently visible approved FAQ answers.

## CMS contract
Optional window.PNPFactCheck={factChecks:[],faqs:[],clarifications:[],endpoint:'same-origin URL'}. Endpoint returns those three arrays; HTTPS or local same-origin access, no credentials in URLs. Each public record needs id,approved:true,publication_status:'published',publication_date or updated_at,language(defaulten),sources:[{title,url,publisher,publication_date}]. Fact-check fields: headline/title,claim_text,claim_source_url,finding_label,finding_explanation,evidence_sections:[{heading,text}],summary,canonical_url,corrections:[{approved:true,date,summary}]. Claim and finding explanation required before a fact-check record is rendered. FAQ fields:question,answer,related_url. Clarifications:title,summary,evidence_sections,corrections,canonical_url; reuse Newsroom canonical correction records. No private editorial data or drafts rendered; textContent and safe links used throughout.

## Artwork
Built-in image_gen; saved assets/hero/fact-check-hero-art.png, visually inspected. Prompt: photographic background only, wide2:1, deep navy negative space left/top-left; softly blurred Vidhana Soudha with small Indian flag right background; foreground bottom-right scholarly navy/cream books, indistinct printed papers and gold-rimmed magnifying glass lying diagonally; realistic editorial photo, navy-to-skyblue transition, warm gold, no writing/badges/icons/logos/UI. Decorative artwork is not evidence for any published fact check.

## Validation
Syntax and mock DOM checks passed for approval/source/date gates, required claim/finding, category search, empty results, semantic FAQ output, visible-only structured data, article modal, unique IDs and assets. Layout breakpoints1600/1100/760/430; visible focus and reduced motion. Browser screenshot comparison was not available.

## Fact Checks directory
fact-checks.html/css/js adds the compact reference sidebar, preview notice, filters and article table. Landing Fact Checks card opens this directory. Four fictional example rows demonstrate the design; counts reflect actual visible records. Keyword/topic/year/sort, reset, pagination and article dialogs work locally. Explicit factChecks arrays (including empty arrays) or same-origin directoryEndpoint/endpoint replace examples with approved, published, dated, sourced records requiring claim and finding text. directoryPreview:false disables examples. No official verdicts or evidence are fabricated. Shared header/footer/support dialogs reused.

## Illustrative article detail
fact-check-detail.html/css/js implements the reference split civic hero, claim/finding cards, five interactive evidence panels, source/correction sidebar, share controls and three related previews. All claim, finding, editorial metadata and references are explicitly illustrative; source placeholders are not fabricated official links. Evidence/related buttons show explanatory dialogs. Sharing labels identify the preview. Directory sample rows open this page; approved real records retain their canonical URL or sourced inline dialog. Directory height increased to475px desktop/535px large/445px compact. Syntax, structural and local asset checks passed; screenshot comparison was not available.
