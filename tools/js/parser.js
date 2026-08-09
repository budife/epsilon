(function () {
  'use strict';
  const U = window.EpsilonUtils;
  const normalise = (value) => String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');
  const numberValue = (value) => {
    if (typeof value === 'number') return value;
    const parsed = Number(String(value).replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  };
  function parse(buffer) {
    if (!window.XLSX) throw new Error('The Excel reader library is unavailable.');
    const workbook = XLSX.read(buffer, { type:'array', cellDates:true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new Error('The workbook does not contain a readable worksheet.');
    const rows = XLSX.utils.sheet_to_json(sheet, { header:1, defval:null, raw:true });
    const headerRow = rows.findIndex((row) => row.some((cell) => normalise(cell) === 'CURRENCY'));
    if (headerRow < 0) throw new Error('Could not find a CURRENCY header in the first worksheet.');
    const date = rows.slice(0, headerRow).flat().find((value) => value instanceof Date) || new Date();
    const rates = [];
    for (let index = headerRow + 2; index < rows.length; index += 1) {
      const row = rows[index];
      const code = normalise(row[0]);
      if (!/^[A-Z]{3}$/.test(code)) { if (rates.length) break; continue; }
      const values = row.slice(1, 5).map(numberValue);
      if (values.some((value) => value === null)) continue;
      rates.push({ ...U.currencyMeta(code), chqBuy:values[0], chqSell:values[1], noteBuy:values[2], noteSell:values[3] });
    }
    if (!rates.length) throw new Error('No exchange-rate rows were found beneath the currency headings.');
    const notes = rows.slice(headerRow + 2 + rates.length).flat().filter((value) => typeof value === 'string' && value.trim() && !/^note:/i.test(value));
    const stamp = date instanceof Date ? `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}` : 'report';
    return { rates, date, displayDate:U.formatDate(date), notice:notes[0] || '', fileStem:`Counter rate budd ${stamp}` };
  }
  window.EpsilonParser = { parse };
}());
