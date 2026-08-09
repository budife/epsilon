(function () {
  'use strict';
  const U = window.EpsilonUtils;
  const referenceOrder = ['USD', 'AUD', 'GBP', 'HKD', 'EUR', 'JPY', 'SGD', 'CHF', 'CAD', 'NZD', 'CNY'];
  const bankFooter = 'PT Bank HSBC Indonesia berizin dan diawasi oleh Otoritas Jasa Keuangan (OJK), Bank Indonesia (BI) dan merupakan peserta penjaminan Lembaga Penjamin Simpanan (LPS).';

  function displayRates(rates) {
    const map = new Map(rates.map((rate) => [rate.code, rate]));
    return referenceOrder.map((code) => map.get(code)).filter(Boolean).map((rate) => ({ ...rate, name: rate.code === 'CNY' ? 'Renminbi Chinese Yuan' : rate.name, code: rate.code === 'CNY' ? 'RMB' : rate.code }));
  }

  function row(rate) {
    return `<tr><td>${rate.name} <span>(${rate.code})</span></td><td>${U.formatRate(rate.chqBuy)}</td><td>${U.formatRate(rate.chqSell)}</td><td>${U.formatRate(rate.noteBuy)}</td><td>${U.formatRate(rate.noteSell)}</td></tr>`;
  }

  function render(element, report) {
    const rates = displayRates(report.rates);
    element.className = 'slide reference-slide';
    element.innerHTML = `<header class="reference-header"><img class="hsbc-logo" src="../assets/HSBC%20Logo_2026.svg" alt="HSBC"><div class="reference-title"><p>Nilai tukar mata uang asing</p><em>Foreign exchange rates</em><time>${report.displayDate}</time></div></header><table class="reference-table"><thead><tr><th>Currency</th><th>CHQ Buys</th><th>CHQ Sells</th><th>Note Buys</th><th>Note Sells</th></tr></thead><tbody>${rates.map(row).join('')}</tbody></table><footer class="reference-footer"><p>Tabel di atas menunjukkan beragam kurs valuta asing yang berlaku untuk transfer dan uang kertas. Ketentuan ini tidak berlaku untuk transaksi menggunakan kartu kredit. Kurs yang digunakan untuk transaksi kartu kredit mengikuti Visa, Mastercard® atau prinsipal lainnya. Kurs yang ditampilkan adalah kurs terhadap Rupiah dan diperbarui setiap hari, namun bisa berubah sewaktu-waktu tanpa pemberitahuan.</p><p class="english"><em>The above tables show various foreign exchange rates that apply to transfers and banknotes. They don't apply to transactions using a credit card. The foreign exchange rate used for credit card transactions follows Visa, Mastercard® or other principal rates.</em></p><p class="english"><em>The rates are shown against IDR. They are updated on a daily basis but may be subject to change without notice.</em></p><strong>${bankFooter}</strong></footer></div>`;
    U.updateScale(document.querySelector('#preview-stage'), element, document.querySelector('#zoom-label'));
  }

  function renderEmpty(element) {
    element.className = 'slide empty-slide';
    element.innerHTML = '<div class="empty-content"><div class="empty-symbol">↗</div><h3>Your slide will appear here</h3><p>Upload a structured currency-rate Excel workbook to generate a 1920 × 1080 presentation preview.</p></div>';
    U.updateScale(document.querySelector('#preview-stage'), element, document.querySelector('#zoom-label'));
  }
  window.EpsilonRenderer = { render, renderEmpty };
}());
