(function () {
  'use strict';
  async function download(node, fileName) {
    if (!window.htmlToImage) throw new Error('The image exporter library is unavailable.');
    const originalStyle = node.getAttribute('style');
    const mode = window.EpsilonRenderer.getMode();
    const width = mode === 'vertical' ? 1080 : 1920;
    const height = mode === 'vertical' ? 1920 : 1080;
    try {
      node.style.setProperty('position', 'absolute');
      node.style.setProperty('left', '0px');
      node.style.setProperty('top', '0px');
      node.style.setProperty('transform', 'none');
      node.style.setProperty('transform-origin', 'top left');
      const dataUrl = await htmlToImage.toPng(node, { width:width, height:height, pixelRatio:1, backgroundColor:'#ffffff', cacheBust:true });
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      if (originalStyle === null) node.removeAttribute('style');
      else node.setAttribute('style', originalStyle);
    }
  }
  window.EpsilonExporter = { download };
}());
