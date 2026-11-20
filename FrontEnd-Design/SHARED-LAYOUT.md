# Shared page layout

All pages use shared-layout.js as the single source for the navbar and footer. Edit the header and footer markup there to update every page.

For a new page:

- Include style.css using the correct relative path.
- Load shared-layout.js with defer before script.js and any page script.
- Add <div data-site-header></div> before the page content.
- Add <div data-site-footer></div> after the page content.
- Keep page content inside <main id="main-content">.
- Include the existing shared dialogs if the page needs login or cookie controls.

Links resolve relative to the website root, including pages in subfolders. Navigation automatically marks the current page.

## Design sizing preference

Use compact sizing for all upcoming pages, sections, and screens. Keep section heights, headings, buttons, cards, and spacing restrained; avoid oversized layouts. Follow the compact header, hero, and announcement strip established on the homepage, while keeping text readable and controls usable on mobile.

## Sample content preference

Use realistic sample content and numbers wherever data is needed in future pages, sections, and screens. Do not leave counts as dashes or empty placeholders. Keep sample labels, preview disclaimers, and implementation instructions out of the rendered page. The user will replace sample content with official content later. Statistics sample values are initialized in script.js and also rendered in index.html.

Do not display badges such as "Sample data" or "Demo figures", or notes about updating sample numbers, on current or upcoming pages/screens. Keep development notes in code or documentation only.

## Section flow preference

For every upcoming section and module, connect section backgrounds directly like the homepage. Do not add external gaps, outer margins, or rounded panel borders between full-width sections. Keep appropriate internal padding for readable content.

## Shared newsroom strip

shared-layout.js automatically appends the Latest Update strip to every page with a main element. Include shared-layout.js before script.js. The strip stays at the screen bottom until its reserved slot above the footer is reached. Headlines and design are maintained centrally in the newsroom layout; do not copy its markup into individual modules.
