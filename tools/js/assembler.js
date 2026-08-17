(function(){
'use strict';
var $=function(s){return document.querySelector(s)};

var TEMPLATES={
  header:{src:'../assets/header.jpg',name:'HSBC Premier Header'},
  footer:{src:'../assets/footer.jpg',name:'Standard Footer'},
  'footer-mobile':{src:'../assets/footer-with-mobile.jpg',name:'Footer + Mobile App'}
};

var templateCache={};
var layoutDataUrl='';
var layoutFileName='';
var finalCanvas=null;

function status(text){
  var el=$('#as-status');
  if(el)el.textContent=text;
}

function loadImage(src){
  return new Promise(function(resolve){
    var img=new Image();
    img.onload=function(){resolve(img)};
    img.onerror=function(){resolve(null)};
    img.src=src;
  });
}

function loadTemplateImage(key){
  if(templateCache[key]&&templateCache[key]!==''){return Promise.resolve(templateCache[key])}
  return loadImage(TEMPLATES[key].src).then(function(img){
    if(!img){templateCache[key]='';return ''}
    var c=document.createElement('canvas');
    c.width=img.naturalWidth;c.height=img.naturalHeight;
    c.getContext('2d').drawImage(img,0,0);
    var d=c.toDataURL('image/jpeg',0.92);
    templateCache[key]=d;
    return d;
  });
}

function loadLayoutImage(){
  return loadImage(layoutDataUrl).then(function(img){return img});
}

function buildImage(headerImg,layoutImg,footerImg,width){
  var scale=width/750;
  var hH=headerImg?Math.round(headerImg.naturalHeight*scale):0;
  var lW=layoutImg?width:0;
  var lH=layoutImg?Math.round((layoutImg.naturalHeight/layoutImg.naturalWidth)*width):0;
  var fW=footerImg?width:0;
  var fH=footerImg?Math.round((footerImg.naturalHeight/footerImg.naturalWidth)*width):0;

  var totalH=hH+lH+fH;
  var canvas=document.createElement('canvas');
  canvas.width=width;canvas.height=totalH;
  var ctx=canvas.getContext('2d');

  ctx.fillStyle='#ffffff';
  ctx.fillRect(0,0,width,totalH);

  var y=0;
  if(headerImg){ctx.drawImage(headerImg,0,0,width,hH);y+=hH}
  if(layoutImg){ctx.drawImage(layoutImg,0,y,lW,lH);y+=lH}
  if(footerImg){ctx.drawImage(footerImg,0,y,fW,fH)}

  finalCanvas=canvas;
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

  var jobs=[];
  if(headerKey!=='none')jobs.push(loadTemplateImage(headerKey).then(function(){return headerKey}));
  else jobs.push(Promise.resolve(''));
  if(footerKey!=='none')jobs.push(loadTemplateImage(footerKey).then(function(){return footerKey}));
  else jobs.push(Promise.resolve(''));
  jobs.push(loadLayoutImage());

  var results=await Promise.all(jobs);
  var hk=results[0], fk=results[1], layoutImg=results[2];

  if(!layoutImg){status('Failed to load layout image.');return}

  var headerImg=hk&&templateCache[hk]?await loadImage(templateCache[hk]):null;
  var footerImg=fk&&templateCache[fk]?await loadImage(templateCache[fk]):null;

  buildImage(headerImg,layoutImg,footerImg,width);

  var frame=$('#preview-frame');
  frame.srcdoc='<!doctype html><html><body style="margin:0;display:flex;justify-content:center;background:#e8e8e8;"><img src="'+finalCanvas.toDataURL('image/png')+'" style="max-width:100%;"></body></html>';

  status('Combined! Click Download to save as image.');
  $('#download-btn').disabled=false;
}

function download(){
  if(!finalCanvas){
    status('Nothing to download. Combine first.');
    return;
  }
  var stem=layoutFileName?layoutFileName.replace(/\.[^.]+$/,''):'email-assembled';
  var fmt=$('#format-select').value;
  var mime=fmt==='jpg'?'image/jpeg':'image/png';
  var ext=fmt==='jpg'?'.jpg':'.png';
  finalCanvas.toBlob(function(blob){
    var link=document.createElement('a');
    link.download=stem+ext;
    link.href=URL.createObjectURL(blob);
    link.click();
    setTimeout(function(){URL.revokeObjectURL(link.href)},1000);
    status('Image downloaded!');
  },mime,0.95);
}

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

$('#combine-btn').addEventListener('click',combine);
$('#download-btn').addEventListener('click',download);
})();
