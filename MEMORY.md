# Epsilon Memory

## Product

- Epsilon is a small, practical, fast, and tidy browser toolkit made by budd.
- The project is intentionally vanilla and has no npm, build step, framework, or server requirement.
- UI language can mix English and Indonesian; code comments should be in English.

## Visual Language

- Primary red: `#db0011`.
- Ink: `#17212b`.
- Default font: Univers 45 Light with Arial fallback.
- Prefer focused layouts, compact controls, clear status feedback, and responsive mobile behavior.

## Tools

- Keep the five tools visible in `index.html`.
- Keep Daily Currency export dimensions unchanged.
- Keep remote Screenshot fetcher behavior compatible with Google Apps Script and the legacy Worker.
- Keep vendor dependencies local in `libs/` where possible.

## Maker And Changes

- Maker profile data and recent changes are centralized in `maker-data.js`.
- `the-maker.html` renders that shared data.
- `CHANGELOG.md` must contain the same newest recent-change entry as `maker-data.js`.
- Every commit that changes user-visible behavior must update both files.

## Working Preference

- Make the smallest correct change.
- Read files before editing them.
- Verify JavaScript syntax, relevant browser loading, and `git diff --check`.
- Do not commit secrets, generated caches, or unnecessary binaries.
