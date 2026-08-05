(function () {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  let activeType = 'URL';
  let lastDataUrl = '';
  const typeCopy = {
    URL:['URL','Paste a website link, beginning with https:// or http://'],
    Text:['Text','Enter any text to encode in the QR code'],
    WhatsApp:['WhatsApp','Enter a phone number or WhatsApp link'],
    Phone:['Phone','Enter a phone number'],
    Mail:['Mail','Enter an email address'],
    'Wi-Fi':['Wi-Fi','Enter Wi-Fi details or a network link']
  };
  function setType(type) {
    activeType = type;
    document.querySelectorAll('.type-tab').forEach((button) => button.classList.toggle('active', button.dataset.type === type));
    $('#input-label').textContent = typeCopy[type][0];
    $('#input-help').textContent = typeCopy[type][1];
    $('#qr-input').placeholder = type === 'URL' ? 'https://example.com' : 'Type or paste your content here';
  }
  function generate() {
    const text = $('#qr-input').value.trim();
    if (!text) { $('#qr-status').textContent = 'Enter content to generate a QR code.'; return; }
    try {
      const qr = qrcode(0, $('#error-level').value);
      qr.addData(text);
      qr.make();
      lastDataUrl = qr.createDataURL(8, 4);
      const image = new Image();
      image.alt = 'Generated QR code';
      image.src = lastDataUrl;
      image.onload = () => { $('#qr-output').replaceChildren(image); };
      $('#download-png').disabled = false;
      $('#qr-status').textContent = `Ready · ${activeType} QR code generated.`;
    } catch (error) {
      $('#qr-status').textContent = 'This content is too long for the selected QR format.';
    }
  }
  function download() {
    if (!lastDataUrl) return;
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = lastDataUrl;
    link.click();
  }
  document.querySelectorAll('.type-tab').forEach((button) => button.addEventListener('click', () => setType(button.dataset.type)));
  $('#generate').addEventListener('click', generate);
  $('#download-png').addEventListener('click', download);
  $('#qr-input').addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') generate(); });
  setType('URL');
}());
