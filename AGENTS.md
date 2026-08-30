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
├── index.html          # Home — grid 5 tools
├── home.css            # Style home
├── maker.css / maker.js # Modal "meet the maker" (dipakai semua page)
├── assets/             # epsilon-logo.png dkk
├── libs/               # Vendor offline (jangan hapus)
│   ├── xlsx.full.min.js       # Daily Currency
│   ├── qrcode-generator.js    # QR Code
│   ├── html-to-image.min.js   # Screenshot / Assembler
│   └── pdf-lib.min.js         # Screenshot PDF export
└── tools/
    ├── daily-currency.html / style.css / script.js  # juga pakai .tmp-ppt/ untuk template
    ├── qrcode.html / qr.css / qr-overrides.css / qr.js
    ├── converttext.html / converttext.css / converttext.js
    ├── screenshot.html / screenshot.css / js/        # pakai Cloudflare Worker untuk proxy
    └── assembler.html / assembler.css / js/assembler.js / footer.css
```

> `README.md` saat ini outdated (hanya list 2 tools). Jika tambah tool, update `README.md` dan `index.html` bersamaan.

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

Home grid ada di `index.html:1` — tiap tambah tool wajib tambah `tool-card` di sana.

## 5. Konvensi Code

- **JS:** vanilla, `var`/`function` style existing (jangan refactor massal ke ES module jika file lain masih IIFE). Jaga `maker.js:1` (modal logic) tetap global.
- **CSS:** pakai custom properties di `:root` (`home.css:1`). Satu tool = satu `*.css` + `footer.css` + `../maker.css`. Jangan duplikasi style maker.
- **HTML:** tiap tool page wajib include `maker.css` + modal markup + `maker.js` di akhir body (lihat `tools/assembler.html:8`).
- **Bahasa:** UI mix EN/ID, tapi code comment pakai EN. Changelog di modal pakai ID (lihat `maker.js`).
- **Aset:** jangan commit file besar/binary ke git. `.tmp-ppt/` adalah cache lokal.

## 6. Cara Menjalankan & Test

```powershell
# Paling sederhana — buka langsung
start index.html

# Atau via VS Code Live Server (port 5501)
# Right-click index.html -> Open with Live Server
```

Tidak ada unit test / build. Verifikasi manual:
1. Buka `index.html` → cek 5 card muncul.
2. Buka tiap `tools/*.html` → cek upload/preview/download jalan.
3. Cek modal maker (klik `budd` di footer) → tab Profile/Updates switch.

## 7. Guideline untuk Agent

- **Baca dulu file yang akan diubah** (`Read` sebelum `Edit`).
- **Edit minimal:** prefer `Edit` file existing daripada `Write` baru. Jangan bikin `*.md` baru kecuali diminta.
- **Cek dampak ke `index.html` + `README.md`** tiap ubah/tambah tool.
- **Jangan ubah `libs/`** tanpa alasan kuat + verifikasi offline tetap jalan.
- **Screenshot Worker:** jika ubah flow `tools/screenshot.html` / `js/*`, pastikan `sandbox="allow-same-origin"` dan lifecycle `srcdoc` tetap benar (lihat git log `127ff7f`, `615d2a2`).
- **Verifikasi via browser** setelah perubahan (bukan cuma `git diff`).

## 8. Yang Tidak Boleh Dilakukan

- Menambah build step / `node_modules` di repo root.
- Menghapus/mengganti lib offline dengan CDN-only.
- Mengubah ukuran export Daily Currency tanpa persetujuan.
- Commit secret / API key Worker ke repo.
- Membuat file dokumentasi baru yang duplikat (`AGENT.md` vs `AGENTS.md` — pakai `AGENTS.md` ini saja).

## 9. Git

- Branch utama `main`. Commit message singkat, pakai prefix `Tool:` mis. `Screenshot: fix image proxy`.
- Selalu `git status` + `git diff` sebelum commit. Jangan `force-push`.

---
*Last updated: 2026-08-31 — sinkron dengan 5 tools di `index.html`.*
