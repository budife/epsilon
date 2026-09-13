# Epsilon Toolkit

Epsilon is a browser-based collection of small utilities for reporting, communication, and everyday workflow. It uses vanilla HTML, CSS, and JavaScript with no build step, server, or npm installation.

## Run

Open `index.html` directly in Chrome or Edge, or use VS Code Live Server on port `5501`. Most tools work from `file://`; Website Screenshot needs its configured Google Apps Script or Cloudflare Worker fetcher for remote pages.

## Tools

| Tool | Entry | Purpose |
| --- | --- | --- |
| FX Rate Daily Currency Report | `tools/daily-currency.html` | Convert a Counter Rate Excel workbook into horizontal or vertical PNG presentation output. |
| QR Code Generator | `tools/qrcode.html` | Generate URL, text, vCard, mail, Wi-Fi, phone, and other QR codes with PNG, SVG, and PDF export. |
| Convert Text | `tools/converttext.html` | Convert text case and clean repeated spaces with separate input and output panes. |
| Website Screenshot | `tools/screenshot.html` | Fetch and capture remote HTML as PNG, JPG, or PDF with progress reporting. |
| Template Assembler | `tools/assembler.html` | Combine a layout image with selectable header and footer templates. |
| Image Studio | `tools/image-studio.html` | Resize, convert, and rename multiple images locally in the browser. |
| Color Studio | `tools/color-studio.html` | Explore HEX/RGB/HSL values, extract palettes from images, and generate shades and tints. |
| Design QA | `tools/design-qa.html` | Check asset dimensions, aspect ratios, formats, sizes, and filenames before delivery. |
| Social Size Guide | `tools/social-canvas.html` | Find social, messaging, and presentation sizes, then use them in Image Studio. |
| Presentation Board | `tools/presentation-board.html` | Arrange multiple images into a review board and export PNG/PDF locally. |
| Typography Helper | `tools/typography-helper.html` | Build a type scale, preview hierarchy, convert units, and copy CSS locally. |
| Screenshot Reference Board | `tools/screenshot-reference-board.html` | Collect screenshots, add source notes, and export a visual reference board. |

## Project Notes

- Vendor libraries are bundled in `libs/` for offline-first operation.
- Daily Currency exports must remain `1920x1080` horizontal or `1080x1920` vertical.
- The Screenshot tool still needs an external fetcher to bypass remote-site CORS restrictions.
- Maker profile and recent changes live in `maker-data.js` and render on `the-maker.html`.

## Documentation

- `AGENTS.md` contains contributor and AI-agent rules.
- `MEMORY.md` contains durable project context and working preferences.
- `CHANGELOG.md` records user-visible changes and must stay aligned with `maker-data.js`.
