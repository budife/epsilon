# Changelog

All notable user-visible changes are recorded here. The newest entry must match the first item in `maker-data.js` under `changes`.

## v1.8.6 — 13 Sep 2026

- Fixed Shades & tints HEX labels by positioning them inside each swatch so they are not clipped.

## v1.8.5 — 13 Sep 2026

- Increased the Shades & tints area height so swatches and HEX labels are fully visible.

## v1.8.4 — 13 Sep 2026

- Fixed Color Picker panel overflow so `Shades & tints` stays visible or scrolls inside the panel instead of being clipped.

## v1.8.3 — 13 Sep 2026

- Improved palette clustering so small but distinct colors, such as red text, remain represented.
- Displayed usage below 0.1% as `<0.1%` instead of hiding it as `0%`.

## v1.8.2 — 13 Sep 2026

- Widened Image Palette grouping so visually similar colors merge into a more compact result.

## v1.8.1 — 13 Sep 2026

- Widened Image Palette color grouping again so visually similar colors merge into a more compact result.

## v1.8.0 — 13 Sep 2026

- Merged nearby colors in Image Palette extraction using wider RGB grouping while keeping average original pixel colors as representatives.

## v1.7.9 — 13 Sep 2026

- Hid colors with a rounded `0%` usage from the extracted image palette.

## v1.7.8 — 13 Sep 2026

- Removed the 10-color limit from Image Palette extraction.
- Added finer color grouping and an internal scroll area so all detected color groups can be reviewed with percentages.

## v1.7.7 — 13 Sep 2026

- Improved Image Palette precision by sampling more pixels and using average colors from the original pixels in each color group.
- Added approximate percentage usage for each extracted color.

## v1.7.6 — 13 Sep 2026

- Made extracted palette cards more compact so up to 10 colors fit more comfortably in the panel.

## v1.7.5 — 13 Sep 2026

- Increased Image Palette extraction from 6 to up to 10 dominant colors.
- Fixed extracted color swatches so their color blocks are visible.

## v1.7.4 — 13 Sep 2026

- Made palette image copying generic by writing the visible palette screenshot as `image/png` to the clipboard.
- Kept PNG download as a fallback when browser clipboard access is unavailable.

## v1.7.3 — 13 Sep 2026

- Changed `Copy as image` to capture the visible `Your palette` element directly as a PNG screenshot for Photoshop pasting.

## v1.7.2 — 13 Sep 2026

- Improved `Copy as image` clipboard payload with PNG, HTML image, and plain-text formats for better Photoshop compatibility.

## v1.7.1 — 13 Sep 2026

- Added Image Palette extraction to Color Studio.
- Added local dominant color analysis with HEX/RGB/HSL values and add-all-to-palette support.

## v1.7.0 — 13 Sep 2026

- Added Screenshot Reference Board MVP under the Check category.
- Added multi-image reference collection, source URL and note metadata, grid controls, and local PNG/PDF export.

## v1.6.0 — 13 Sep 2026

- Added Typography Helper MVP under the Prepare category.
- Added type scale, live hierarchy preview, line-height, letter-spacing, PX/PT/MM converter, and CSS copy.

## v1.5.0 — 13 Sep 2026

- Added Presentation Board MVP under the Create category.
- Added multi-image grid layouts, title, subtitle, captions, background, spacing controls, and local PNG/PDF export.

## v1.4.0 — 13 Sep 2026

- Added Social Canvas MVP under the Create category.
- Added social presets, image fit, zoom, positioning, background, text overlay, and local PNG/JPG export.

## v1.3.0 — 13 Sep 2026

- Added Design QA MVP under the Check category.
- Added batch checks for dimensions, aspect ratio, format, file size, filename, PASS/WARNING/FAIL status, and CSV export.

## v1.2.0 — 13 Sep 2026

- Added Color Studio MVP under the Check category.
- Added local color picker, HEX/RGB/HSL values, manual palette, and shades/tints generator.

## v1.1.0 — 13 Sep 2026

- Added Image Studio MVP under the Prepare category.
- Added local image resize, PNG/JPG/WebP conversion, quality control, preview, and filename prefix/suffix export.

## v1.0.9 — 12 Sep 2026

- Made The Maker fit the viewport with scrolling limited to the Recent changes list.
- Added `View more changes` pagination in batches of 10 items.

## v1.0.8 — 12 Sep 2026

- Applied viewport-first layout behavior to The Maker page and documented the rule for future pages: only inner content areas may scroll when needed.

## v1.0.7 — 12 Sep 2026

- Changed maker identity links across the toolkit to open `/the-maker` directly instead of opening the maker modal.

## v1.0.6 — 12 Sep 2026

- Added `the-maker.html` and `/the-maker/` with maker profile, social links, GitHub link, and recent changes.
- Added `maker-data.js` as the shared source for maker profile and recent changes.
- Added project documentation: `README.md`, `MEMORY.md`, and this changelog.
- Added a rule in `AGENTS.md` to keep future commits and maker recent changes synchronized.

## v1.0.5 — 12 Sep 2026

- Screenshot progress now shows individual stages, per-stage duration, total time, and expandable completed logs.
- Added Google Apps Script connection status and a `Test Connection` control for the GAS fetcher.

## v1.0.4 — 19 Aug 2026

- Upgraded Website Screenshot with adjacent Download action, automatic file naming, two-column layout, and HSBC email-blast crop fixes.

## v1.0.3 — 19 Aug 2026

- Added Template Assembler with header, layout, footer, preview, and PNG/JPG download.

## v1.0.2 — 19 Aug 2026

- Renamed EGA to FX Rate Daily Currency Report and unified maker presentation across pages.

## v1.0.1 — 18 Aug 2026

- Added QR Code Generator, Website Screenshot, and Convert Text tools.

## v1.0.0 — 14 Aug 2026

- Initial Epsilon toolkit release with FX rate reporting from Counter Rate workbooks.
