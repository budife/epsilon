/**
 * Epsilon Website Screenshot — Google Apps Script HTML Fetcher
 * Mirror dari eDM Helper js/pages-layout-checker.js:14 + doGet
 *
 * Deploy: Extensions > Apps Script > paste Code.gs > Deploy > New deployment
 *   > Web app > Execute as me, Who has access: Anyone > Copy URL
 *   > paste URL ke tools/js/screenshot.js GOOGLE_APPS_SCRIPT_URL
 *
 * Frontend: tools/js/screenshot.js FETCHER_PROVIDERS['google-apps-script']
 *   buildUrl: GOOGLE_APPS_SCRIPT_URL + "?url=" + encodeURIComponent(targetUrl)
 *   fetchRemoteHtmlFast() auto-retry 2x khusus GAS (delay 2s), Abort 15s
 *
 * Verifikasi: https://script.google.com/macros/s/XXXX/exec?url=https://example.com
 *   harus return HTML valid (<html atau <!doctype)
 */

function doGet(e) {
  var target = e.parameter.url;
  if (!target) {
    return ContentService.createTextOutput(JSON.stringify({error: "Missing url parameter"}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Validasi URL harus http/https
  if (!/^https?:\/\//i.test(target)) {
    return ContentService.createTextOutput(JSON.stringify({error: "Only http/https allowed: " + target}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Screenshot = allow ANY host (beda dengan eDM Helper yang lock ke mail.hsbc.com.hk)
  // Jika mau lock ke host tertentu, uncomment blok bawah:
  // var host = target.replace(/^https?:\/\//,"").split("/")[0].toLowerCase().split(":")[0];
  // var ALLOWED = ["example.com"]; // ganti ke host target projectmu
  // if (ALLOWED.indexOf(host) === -1) {
  //   return ContentService.createTextOutput(JSON.stringify({error: "Host not allowed: " + host}))
  //     .setMimeType(ContentService.MimeType.JSON);
  // }

  try {
    var resp = UrlFetchApp.fetch(target, {
      headers: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: true
    });

    var code = resp.getResponseCode();
    if (code < 200 || code >= 300) {
      return ContentService.createTextOutput("Upstream HTTP " + code + " for " + target)
        .setMimeType(ContentService.MimeType.TEXT);
    }

    var contentType = String(resp.getHeaders()['Content-Type'] || resp.getBlob().getContentType() || '').toLowerCase();
    if (/^image\//i.test(contentType)) {
      return ContentService.createTextOutput(JSON.stringify({
        type: 'image',
        mime: contentType.split(';')[0],
        data: Utilities.base64Encode(resp.getBlob().getBytes())
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var html = resp.getContentText();
    // GAS otomatis allow CORS untuk fetch client; deploy sebagai Web App "Anyone" + "Execute as me"
    return ContentService.createTextOutput(html).setMimeType(ContentService.MimeType.HTML);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.message || String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Opsional: handle preflight jika ada yang pakai POST
function doPost(e) { return doGet(e); }
