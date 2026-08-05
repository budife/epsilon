# Epsilon — Excel Report Studio

Open `index.html` directly in a modern desktop browser. No installation, web server, npm package, or build step is required.

Epsilon reads the first worksheet, locates the `CURRENCY` header, reads its four rate columns and three-letter currency codes below it, then uses the first workbook-header date as the report date. It exports the resulting presentation at 1920 × 1080 PNG.

`libs/` contains SheetJS and html-to-image, so the application works offline after the project is copied.
