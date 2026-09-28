# AGENTS.md — Epsilon Toolkit

> Panduan untuk AI agent / contributor yang bekerja di repo ini.

## 1. Project Overview

Epsilon adalah **Excel Report Studio & Toolkit** — kumpulan utilitas kecil berbasis browser tanpa build step, tanpa server, dan tanpa instalasi npm.

- Buka `index.html` langsung di browser desktop modern.
- Semua logic jalan client-side. Lib di-bundle offline di `libs/`.
- Live Server (VS Code) pakai port `5501` — lihat `.vscode/settings.json:1`.

Branding: Epsilon, warna utama `--red: #db0011`, `--ink: #17212b`, font `Univers 45 Light` fallback `Arial`. Logo di `assets/epsilon-logo.png`.

## 2. Struktur Proyek

```
epsilon/
├── index.html          # Home — unified tool grid (13 kartu)
├── home.css            # Style home
├── maker.js            # Home grid builder (inject + urutkan kartu tool)
├── maker-data.js        # Shared maker profile and recent changes data
├── the-maker.html       # Maker profile and changelog page
├── the-maker.css        # Maker page styles
├── assets/             # epsilon-logo.png dkk
├── libs/               # Vendor offline (jangan hapus)
│   ├── xlsx.full.min.js       # Daily Currency
│   ├── qrcode-generator.js    # QR Code
│   ├── html-to-image.min.js   # Screenshot / Assembler
│   └── pdf-lib.min.js         # Screenshot PDF export
└── tools/              # 13 halaman tool — lihat tabel di §4 (tiap tool: *.html + *.css + *.js)
    ├── daily-currency.html / style.css / script.js  # juga pakai .tmp-ppt/ untuk template
    ├── qrcode.html / qr.css / qr-overrides.css / qr.js
    ├── converttext.html / converttext.css / converttext.js
    ├── screenshot.html / screenshot.css / js/        # pakai Cloudflare Worker untuk proxy
    ├── assembler.html / assembler.css / js/assembler.js
    └── footer.css       # style header/footer bareng (creator-link) — dipakai semua tool page
```

> `README.md` harus selalu list semua tools. Jika tambah/hapus tool, update `README.md`, kartu grid di `maker.js` (`cardOrder`), dan tabel `AGENTS.md` §4 bersamaan.

## 3. Tech Stack & Constraints

- **Vanilla HTML/CSS/JS only.** Jangan menambahkan `package.json`, `npm install`, bundler (vite/webpack), atau framework.
- **Offline-first:** semua dependency harus tetap di `libs/`. Jangan ganti dengan CDN kecuali ada fallback offline.
- **No server required:** semua tool harus tetap bisa dibuka via `file://` atau Live Server. Pengecualian: `screenshot` butuh Worker untuk bypass CORS — jangan dihapus tanpa pengganti.
- **Export size:** Daily Currency PNG harus `1920x1080` (horizontal) / `1080x1920` (vertical). Jangan ubah tanpa konfirmasi.
- **Browser target:** Chrome/Edge desktop modern.

## 4. Daftar Tools

| Tool | Entry | Deskripsi |
|------|-------|-----------|
| FX Rate Daily Currency Report | `tools/daily-currency.html` | Convert workbook Counter Rate (Excel) jadi PNG presentasi |
| QR Code Generator | `tools/qrcode.html` | URL/text/WA/phone/email/WiFi → QR downloadable |
| Convert Text | `tools/converttext.html` | Upper/lower/title/sentence case |
| Website Screenshot | `tools/screenshot.html` | Capture URL jadi PNG/JPG/PDF via Worker + html2canvas |
| Template Assembler | `tools/assembler.html` | Gabung header + layout image + footer jadi email HTML/Image |
| PDF Tools | `tools/pdf-tools.html` | Merge + optimasi banyak PDF tanpa rasterisasi |
| Image Studio | `tools/image-studio.html` | Resize/convert/compress/rename gambar lokal; kompres PDF (re-encode gambar di dalamnya, teks/vektor tetap) |
| Color Studio | `tools/color-studio.html` | Eksplorasi warna, palettes, shades/tints |
| Design QA | `tools/design-qa.html` | Cek dimensi/rasio/format/ukuran/nama file sebelum delivery |
| Social Size Guide | `tools/social-canvas.html` | Kumpulan size social/messaging + kalkulator ukuran |
| Presentation Board | `tools/presentation-board.html` | Susun banyak gambar jadi board, export PNG/PDF |
| Typography Helper | `tools/typography-helper.html` | Type scale, preview hierarchy, konversi unit, copy CSS |
| Screenshot Reference Board | `tools/screenshot-reference-board.html` | Kumpulkan screenshot + catatan sumber jadi reference board |

Home grid ada di `index.html:1` (5 kartu hardcoded) — kartu lain di-inject dan diurutkan oleh `maker.js`. Tiap tambah tool wajib tambah kartu di `maker.js` (`cardOrder` + markup inject), baris di tabel §4, dan baris di `README.md`.

## 5. Konvensi Code

- **JS:** vanilla, `var`/`function` style existing (jangan refactor massal ke ES module jika file lain masih IIFE). Jaga `maker.js` (home grid builder) tetap global.
- **CSS:** pakai custom properties di `:root` (`home.css:1`). Satu tool = satu `*.css` + `footer.css`. Jangan duplikasi style maker.
- **HTML:** tiap tool page wajib include `footer.css` + entry maker (`creator-link` → `../the-maker.html`, lihat `tools/footer.css`) + `../maker.js` di akhir body. Modal maker sudah dihapus; halaman maker ada di `the-maker.html`.
- **Bahasa:** UI mix EN/ID, tapi code comment pakai EN. Changelog/recent changes di `the-maker.html` (data dari `maker-data.js`) pakai ID.
- **Aset:** jangan commit file besar/binary ke git. `.tmp-ppt/` adalah cache lokal.

## 6. Cara Menjalankan & Test

```powershell
# Paling sederhana — buka langsung
start index.html

# Atau via VS Code Live Server (port 5501)
# Right-click index.html -> Open with Live Server
```

Tidak ada unit test / build. Verifikasi manual:
1. Buka `index.html` → cek 13 card muncul (5 hardcoded + 8 inject `maker.js`).
2. Buka tiap `tools/*.html` → cek upload/preview/download jalan + link `budd` di header ada.
3. Klik `budd` → buka `the-maker.html` → tab Profile/Updates switch.

## 7. Changelog And Recent Changes

- Every user-visible change that will be committed must add or update the newest entry in `CHANGELOG.md`.
- The newest `CHANGELOG.md` entry must match the first item in `maker-data.js` under `changes`.
- Keep the version, date, title, and description synchronized between both files.
- Do not wait for a separate request to update recent changes; include it in the same change set and commit.
- `MEMORY.md` stores durable project context and should only change when project conventions or stable preferences change.

## 8. Guideline untuk Agent

- **Baca dulu file yang akan diubah** (`Read` sebelum `Edit`).
- **Edit minimal:** prefer `Edit` file existing daripada `Write` baru. Jangan bikin `*.md` baru kecuali diminta.
- **Cek dampak ke `index.html` + `README.md`** tiap ubah/tambah tool.
- **Jangan ubah `libs/`** tanpa alasan kuat + verifikasi offline tetap jalan.
- **Screenshot Worker:** jika ubah flow `tools/screenshot.html` / `js/*`, pastikan `sandbox="allow-same-origin"` dan lifecycle `srcdoc` tetap benar (lihat git log `127ff7f`, `615d2a2`).
- **Verifikasi via browser** setelah perubahan (bukan cuma `git diff`).
- **Layout viewport-first:** halaman harus menyesuaikan tinggi viewport; jangan membuat seluruh body/page scroll. Jika konten terlalu panjang, batasi overflow ke area konten internal yang relevan.

## 9. Yang Tidak Boleh Dilakukan

- Menambah build step / `node_modules` di repo root.
- Menghapus/mengganti lib offline dengan CDN-only.
- Mengubah ukuran export Daily Currency tanpa persetujuan.
- Commit secret / API key Worker ke repo.
- Membuat file dokumentasi baru yang duplikat (`AGENT.md` vs `AGENTS.md` — pakai `AGENTS.md` ini saja).

## 10. Git

- Branch utama `main`. Commit message singkat, pakai prefix `Tool:` mis. `Screenshot: fix image proxy`.
- Selalu `git status` + `git diff` sebelum commit. Jangan `force-push`.

---
*Last updated: 2026-09-25 — hapus modal maker (entry pindah ke `the-maker.html`), Image Studio kembali masuk grid, sinkronkan daftar tools.*
