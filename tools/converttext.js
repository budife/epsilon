(function () {
  'use strict';

  const input = document.getElementById('text-input');
  const charCount = document.getElementById('char-count');
  const wordCount = document.getElementById('word-count');
  const lineCount = document.getElementById('line-count');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const clearBtn = document.getElementById('clear-btn');

  function updateStats() {
    const text = input.value;
    const chars = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
    charCount.textContent = `${chars} character${chars !== 1 ? 's' : ''}`;
    wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    lineCount.textContent = `${lines} line${lines !== 1 ? 's' : ''}`;
  }

  function sentenceCase(text) {
    return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
  }

  function lowerCase(text) {
    return text.toLowerCase();
  }

  function upperCase(text) {
    return text.toUpperCase();
  }

  function capitalizedCase(text) {
    return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function alternatingCase(text) {
    let upper = false;
    return text.split('').map((char) => {
      if (/[a-zA-Z]/.test(char)) {
        upper = !upper;
        return upper ? char.toUpperCase() : char.toLowerCase();
      }
      return char;
    }).join('');
  }

  function titleCase(text) {
    const smallWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'in', 'of', 'with', 'as']);
    return text.toLowerCase().replace(/\b\w+[\w']*\b/g, (word, offset, str) => {
      if (offset === 0 || str[offset - 2] === '.' || str[offset - 2] === '!' || str[offset - 2] === '?') {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      if (smallWords.has(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
  }

  function inverseCase(text) {
    return text.split('').map((char) => {
      if (char === char.toUpperCase() && char !== char.toLowerCase()) {
        return char.toLowerCase();
      }
      if (char === char.toLowerCase() && char !== char.toUpperCase()) {
        return char.toUpperCase();
      }
      return char;
    }).join('');
  }

  const converters = {
    sentence: sentenceCase,
    lower: lowerCase,
    upper: upperCase,
    capitalized: capitalizedCase,
    alternating: alternatingCase,
    title: titleCase,
    inverse: inverseCase
  };

  document.querySelectorAll('.case-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const caseType = button.dataset.case;
      const converter = converters[caseType];
      if (converter && input.value) {
        input.value = converter(input.value);
        updateStats();
      }
    });
  });

  copyBtn.addEventListener('click', async () => {
    if (!input.value) return;
    try {
      await navigator.clipboard.writeText(input.value);
      const original = copyBtn.innerHTML;
      copyBtn.innerHTML = '<span class="action-icon">✓</span> Copied!';
      setTimeout(() => { copyBtn.innerHTML = original; }, 1500);
    } catch (e) {
      input.select();
      document.execCommand('copy');
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!input.value) return;
    const blob = new Blob([input.value], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = 'converted-text.txt';
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    updateStats();
  });

  input.addEventListener('input', updateStats);
  updateStats();
}());
