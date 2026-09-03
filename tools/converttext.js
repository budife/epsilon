(function () {
  'use strict';

  var input = document.getElementById('text-input');
  var output = document.getElementById('text-output');
  var inputStats = document.getElementById('input-stats');
  var copyBtn = document.getElementById('copy-btn');
  var downloadBtn = document.getElementById('download-btn');
  var clearBtn = document.getElementById('clear-btn');

  function updateStats() {
    var text = input.value;
    var chars = text.length;
    var words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    var lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;
    inputStats.textContent = chars + ' character' + (chars !== 1 ? 's' : '') + ' \u00b7 ' + words + ' word' + (words !== 1 ? 's' : '') + ' \u00b7 ' + lines + ' line' + (lines !== 1 ? 's' : '');
  }

  function sentenceCase(text) {
    return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, function (match) { return match.toUpperCase(); });
  }

  function lowerCase(text) {
    return text.toLowerCase();
  }

  function upperCase(text) {
    return text.toUpperCase();
  }

  function capitalizedCase(text) {
    return text.toLowerCase().replace(/\b\w/g, function (char) { return char.toUpperCase(); });
  }

  function alternatingCase(text) {
    var upper = false;
    return text.split('').map(function (char) {
      if (/[a-zA-Z]/.test(char)) {
        upper = !upper;
        return upper ? char.toUpperCase() : char.toLowerCase();
      }
      return char;
    }).join('');
  }

  function titleCase(text) {
    var smallWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'in', 'of', 'with', 'as']);
    return text.toLowerCase().replace(/\b\w+[\w']*\b/g, function (word, offset, str) {
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
    return text.split('').map(function (char) {
      if (char === char.toUpperCase() && char !== char.toLowerCase()) {
        return char.toLowerCase();
      }
      if (char === char.toLowerCase() && char !== char.toUpperCase()) {
        return char.toUpperCase();
      }
      return char;
    }).join('');
  }

  function trimSpaces(text) {
    return text.replace(/  +/g, ' ').trim();
  }

  var converters = {
    sentence: sentenceCase,
    lower: lowerCase,
    upper: upperCase,
    capitalized: capitalizedCase,
    alternating: alternatingCase,
    title: titleCase,
    inverse: inverseCase,
    trimspaces: trimSpaces
  };

  document.querySelectorAll('.case-btn').forEach(function (button) {
    button.addEventListener('click', function () {
      var caseType = button.dataset.case;
      var converter = converters[caseType];
      if (converter && input.value) {
        output.value = converter(input.value);
      }
    });
  });

  input.addEventListener('input', function () {
    updateStats();
    if (input.value) {
      output.value = input.value;
    } else {
      output.value = '';
    }
  });

  copyBtn.addEventListener('click', async function () {
    if (!output.value) return;
    try {
      await navigator.clipboard.writeText(output.value);
      var original = copyBtn.innerHTML;
      copyBtn.innerHTML = '<span class="action-icon">\u2713</span> Copied!';
      setTimeout(function () { copyBtn.innerHTML = original; }, 1500);
    } catch (e) {
      output.select();
      document.execCommand('copy');
    }
  });

  downloadBtn.addEventListener('click', function () {
    if (!output.value) return;
    var blob = new Blob([output.value], { type: 'text/plain' });
    var link = document.createElement('a');
    link.download = 'converted-text.txt';
    link.href = URL.createObjectURL(blob);
    link.click();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
  });

  clearBtn.addEventListener('click', function () {
    input.value = '';
    output.value = '';
    updateStats();
  });

  updateStats();
}());
