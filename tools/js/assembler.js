(function(){
'use strict';

var $=function(s){return document.querySelector(s)};

var TEMPLATES={
  'header':{src:'../assets/header.jpg'},
  'header-premier':{src:'../assets/header-premier.jpg'},
  'footer':{src:'../assets/footer.jpg'},
  'footer-mobile':{src:'../assets/footer-with-mobile.jpg'}
};

var imageCache={};
var layoutDataUrl='';
var layoutFileName='';
var finalCanvas=null;

function status(text){
  $('#as-status').textContent=text;
}

function loadImage(src){
  return new Promise(function(resolve){
    var img=new Image();
    img.onload=function(){resolve(img)};
    img.onerror=function(){resolve(null)};
    img.src=src;
  });
}

function loadTemplate(key){
  if(imageCache[key])return Promise.resolve(imageCache[key]);
  return loadImage(TEMPLATES[key].src).then(function(img){
    imageCache[key]=img;
    return img;
  });
}

function scaledHeight(img,width){
  return Math.round(img.naturalHeight/img.naturalWidth*width);
}

function buildImage(headerImg,layoutImg,footerImg,width){
  var parts=[headerImg,layoutImg,footerImg];
  var heights=parts.map(function(img){return img?scaledHeight(img,width):0});
  var totalH=heights[0]+heights[1]+heights[2];

  var canvas=document.createElement('canvas');
  canvas.width=width;
  canvas.height=totalH;
  var ctx=canvas.getContext('2d');
  ctx.fillStyle='#ffffff';
  ctx.fillRect(0,0,width,totalH);

  var y=0;
  parts.forEach(function(img,i){
    if(!img)return;
    ctx.drawImage(img,0,y,width,heights[i]);
    y+=heights[i];
  });

  return canvas;
}

async function combine(){
  if(!layoutDataUrl){
    status('Please drop or choose a layout image first.');
    return;
  }

  var headerKey=$('#header-select').value;
  var footerKey=$('#footer-select').value;
  var width=Number($('#width-select').value);

  status('Loading images...');
  $('#download-btn').disabled=true;

  var results=await Promise.all([
    headerKey!=='none'?loadTemplate(headerKey):Promise.resolve(null),
    loadImage(layoutDataUrl),
    footerKey!=='none'?loadTemplate(footerKey):Promise.resolve(null)
  ]);
  var headerImg=results[0],layoutImg=results[1],footerImg=results[2];

  if(!layoutImg){
    status('Failed to load layout image.');
    return;
  }

  finalCanvas=buildImage(headerImg,layoutImg,footerImg,width);

  $('#preview-frame').srcdoc='<!doctype html><html><body style="margin:0;display:flex;justify-content:center;background:#e8e8e8;">'
    +'<img src="'+finalCanvas.toDataURL('image/png')+'" style="max-width:100%;"></body></html>';

  status('Combined! Click Download Image to save.');
  $('#download-btn').disabled=false;
}

function download(){
  if(!finalCanvas){
    status('Nothing to download. Combine first.');
    return;
  }
  var stem=layoutFileName?layoutFileName.replace(/\.[^.]+$/,''):'email-assembled';
  var fmt=$('#format-select').value;
  finalCanvas.toBlob(function(blob){
    var link=document.createElement('a');
    link.download=stem+'.'+fmt;
    link.href=URL.createObjectURL(blob);
    link.click();
    setTimeout(function(){URL.revokeObjectURL(link.href)},1000);
    status('Image downloaded!');
  },fmt==='jpg'?'image/jpeg':'image/png',0.95);
}

function readFile(file){
  if(!/^image\/(png|jpeg)$/.test(file.type)){
    status('Only PNG or JPG images are supported.');
    return;
  }
  var reader=new FileReader();
  reader.onload=function(){
    layoutDataUrl=reader.result;
    layoutFileName=file.name;
    $('#file-name').textContent=file.name;
    status('Layout loaded: '+file.name+' — click Combine & Preview.');
  };
  reader.readAsDataURL(file);
}

function init(){
  var fileInput=$('#file-input');
  var zone=$('#drop-zone');

  fileInput.addEventListener('change',function(){
    if(fileInput.files[0])readFile(fileInput.files[0]);
  });

  ['dragenter','dragover'].forEach(function(ev){
    zone.addEventListener(ev,function(e){
      e.preventDefault();
      zone.classList.add('dragging');
    });
  });
  ['dragleave','drop'].forEach(function(ev){
    zone.addEventListener(ev,function(e){
      e.preventDefault();
      zone.classList.remove('dragging');
    });
  });
  zone.addEventListener('drop',function(e){
    if(e.dataTransfer.files[0])readFile(e.dataTransfer.files[0]);
  });

  $('#combine-btn').addEventListener('click',combine);
  $('#download-btn').addEventListener('click',download);
}

init();
})();
