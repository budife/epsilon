(function(){
  'use strict';
  var input=document.getElementById('image-input');
  var preset=document.getElementById('preset');
  var width=document.getElementById('width');
  var height=document.getElementById('height');
  var lock=document.getElementById('lock-ratio');
  var quality=document.getElementById('quality');
  var qualityValue=document.getElementById('quality-value');
  var formatSelect=document.getElementById('format');
  var targetToggle=document.getElementById('target-toggle');
  var targetSize=document.getElementById('target-size');
  var targetUnit=document.getElementById('target-unit');
  var targetNote=document.getElementById('target-note');
  var processButton=document.getElementById('process');
  var batchNote=document.getElementById('batch-note');
  var files=[];
  var results=[];
  var objectUrls=[];
  function isPdfFile(file){return file.type==='application/pdf'||/\.pdf$/i.test(file.name);}
  function isImageFile(file){return /^image\/(png|jpeg|webp)$/.test(file.type);}
  function firstImage(){for(var i=0;i<files.length;i++)if(files[i].kind==='image')return files[i];return null;}
  function pdfCount(){var n=0;for(var i=0;i<files.length;i++)if(files[i].kind==='pdf')n++;return n;}
  function parsePreset(value){var parts=value.split('x');return parts.length===2?{width:Number(parts[0]),height:Number(parts[1])}:null;}
  function updateSizeFromPreset(){var img=firstImage(),size=parsePreset(preset.value);if(size){width.value=size.width;height.value=size.height;}else if(preset.value==='original'&&img){width.value=img.image.naturalWidth;height.value=img.image.naturalHeight;}width.disabled=preset.value!=='custom'&&preset.value!=='original';height.disabled=width.disabled;}
  function showFiles(){var imgs=files.length-pdfCount(),pdfs=pdfCount(),parts=[];if(imgs)parts.push(imgs+' image'+(imgs===1?'':'s'));if(pdfs)parts.push(pdfs+' PDF'+(pdfs===1?'':'s'));document.getElementById('file-summary').textContent=parts.length?parts.join(', ')+' selected':'No files selected';batchNote.hidden=!pdfs;processButton.disabled=!files.length;updateSizeFromPreset();updateTargetState();}
  function readFiles(selected){files=[];Array.from(selected).forEach(function(file){if(isPdfFile(file)){files.push({kind:'pdf',file:file});return;}if(!isImageFile(file.type))return;var url=URL.createObjectURL(file),image=new Image();image.onload=function(){files.push({kind:'image',file:file,image:image});showFiles();};image.src=url;objectUrls.push(url);});showFiles();}
  function outputName(file,type){var ext=type==='application/pdf'?'pdf':type==='image/png'?'png':type==='image/webp'?'webp':'jpg';var base=file.name.replace(/\.[^.]+$/,'');return document.getElementById('prefix').value+base+document.getElementById('suffix').value+'.'+ext;}
  function targetBytes(){return (Number(targetSize.value)||0)*Number(targetUnit.value);}
  function targetActive(kind){if(!targetToggle.checked||targetBytes()<=0)return false;if(kind==='pdf')return true;return formatSelect.value!=='image/png';}
  function updateTargetState(){var on=targetToggle.checked,png=formatSelect.value==='image/png',pdfs=pdfCount()>0;targetSize.disabled=!on||(png&&!pdfs);targetUnit.disabled=targetSize.disabled;targetNote.hidden=!on;targetNote.textContent=pdfs?(png?'PNG images ignore quality \u2014 PDFs still compress':'Quality tuned automatically'):(png?'PNG ignores quality \u2014 pick JPG or WebP':'Quality tuned automatically');}
  function encodeCanvas(canvas,type,q){return new Promise(function(resolve){canvas.toBlob(function(blob){resolve(blob);},type,q);});}
  function fitBest(encoder,maxBytes,ceiling){var best=null,bestQ=ceiling,lo=0.05,hi=ceiling;function step(done){if(hi-lo<0.01){done();return;}var mid=(lo+hi)/2;encoder(mid).then(function(item){if(item&&item.size<=maxBytes){best=item;bestQ=mid;lo=mid;}else{hi=mid;}step(done);});}return new Promise(step).then(function(){if(best){best.q=bestQ;best.reached=true;return best;}return encoder(0.05).then(function(item){if(item){item.q=0.05;item.reached=false;}return item;});});}
  function formatSize(bytes){if(bytes<1024)return bytes+' B';var kb=bytes/1024;if(kb<1024)return(kb<10?kb.toFixed(1):Math.round(kb))+' KB';return (kb/1024).toFixed(1)+' MB';}
  function deltaMarkup(result){var oldSize=result.original||1;var delta=Math.round((1-result.size/oldSize)*100);var cls=result.size<=oldSize?'down':'up';var text=delta>0?'\u2212'+delta+'%':delta<0?'+'+(-delta)+'%':'0%';var miss=result.reached===false?' <span class="delta miss">target not met</span>':'';return '<span class="delta '+cls+'">'+text+'</span>'+miss;}
  function escapeText(value){return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function buildCanvas(entry){var source=entry.image;var targetW=Number(width.value)||source.naturalWidth;var targetH=Number(height.value)||source.naturalHeight;if(preset.value==='original'){targetW=source.naturalWidth;targetH=source.naturalHeight;}if(lock.checked&&preset.value==='custom'){var ratio=source.naturalWidth/source.naturalHeight;if(document.activeElement===width)targetH=Math.round(targetW/ratio);else targetW=Math.round(targetH/ratio);height.value=targetH;width.value=targetW;}var canvas=document.createElement('canvas');canvas.width=targetW;canvas.height=targetH;var ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,targetW,targetH);ctx.drawImage(source,0,0,targetW,targetH);return canvas;}
  function processImage(entry){var canvas=buildCanvas(entry),type=formatSelect.value,ceiling=Number(quality.value)/100,limit=targetActive('image')?targetBytes():0;var encoder=function(q){return encodeCanvas(canvas,type,q).then(function(blob){return blob?{size:blob.size,blob:blob}:null;});};return encoder(ceiling).then(function(item){if(!item)throw new Error('Could not encode image');if(limit&&item.size>limit)return fitBest(encoder,limit,ceiling);item.q=ceiling;item.reached=true;return item;}).then(function(item){return{kind:'image',name:outputName(entry.file,type),url:URL.createObjectURL(item.blob),original:entry.file.size,size:item.size,width:canvas.width,height:canvas.height,reached:item.reached!==false};});}
  function pdfName(value){if(!value)return'';if(typeof value.asString==='function'){var text=value.asString();return text.charAt(0)==='/'?text.slice(1):text;}return String(value);}
  function isPdfArray(value){return !!(window.PDFLib&&PDFLib.PDFArray&&value instanceof PDFLib.PDFArray);}
  function rawContents(stream){try{return stream.getContents?stream.getContents():stream.contents;}catch(e){return null;}}
  function flattenColorSpace(value){
    if(!value)return null;
    if(isPdfArray(value)){
      var kind=pdfName(value.lookup(0));
      if(kind==='ICCBased'){var stream=value.lookup(1);var alt=stream&&stream.dict?stream.dict.lookup(PDFName0('Alternate')):null;kind=pdfName(alt)||'DeviceRGB';}
      if(kind==='Indexed'){var base=flattenColorSpace(value.lookup(1)),hival=value.lookup(2),table=value.lookup(3);if(!base||base.channels!==3||!table||typeof table.asBytes!=='function')return null;var bytes=table.asBytes(),size=(Number(hival&&hival.asNumber?hival.asNumber():hival)+1)*3;if(!bytes||bytes.length<size)return null;return{mode:'indexed',palette:bytes.subarray(0,size)};}
      if(kind==='DeviceRGB'||kind==='CalRGB')return{mode:'rgb'};
      if(kind==='DeviceGray'||kind==='CalGray')return{mode:'gray'};
      if(kind==='DeviceCMYK')return{mode:'cmyk'};
      return null;
    }
    var name=pdfName(value);
    if(name==='DeviceRGB'||name==='CalRGB')return{mode:'rgb'};
    if(name==='DeviceGray'||name==='CalGray')return{mode:'gray'};
    if(name==='DeviceCMYK')return{mode:'cmyk'};
    return null;
  }
  function PDFName0(name){return PDFLib.PDFName.of(name);}
  function normalizeRaw(decoded,width,height,color){
    if(!color)return null;
    var pixels=width*height;
    if(color.mode==='indexed'){
      if(decoded.length!==pixels)return null;
      var out=new Uint8Array(pixels*3);
      for(var i=0;i<pixels;i++){var idx=decoded[i]*3;out[i*3]=color.palette[idx];out[i*3+1]=color.palette[idx+1];out[i*3+2]=color.palette[idx+2];}
      return out;
    }
    var channels=color.mode==='rgb'?3:color.mode==='cmyk'?4:1;
    if(decoded.length!==pixels*channels)return null;
    if(color.mode==='rgb')return decoded;
    var rgb=new Uint8Array(pixels*3);
    for(var p=0;p<pixels;p++){
      var o=p*channels,r,g,b;
      if(color.mode==='gray'){r=g=b=decoded[o];}
      else{var c=decoded[o]/255,m=decoded[o+1]/255,y=decoded[o+2]/255,k=decoded[o+3]/255;r=Math.round(255*(1-c)*(1-k));g=Math.round(255*(1-m)*(1-k));b=Math.round(255*(1-y)*(1-k));}
      rgb[p*3]=r;rgb[p*3+1]=g;rgb[p*3+2]=b;
    }
    return rgb;
  }
  function recompressImage(stream,q,encoder,stats){
    var dict=stream.dict;
    var contents=rawContents(stream);
    if(!contents||contents.length<2048)return Promise.resolve(false);
    var width=dict.lookup(PDFName0('Width')),height=dict.lookup(PDFName0('Height'));
    width=width&&width.asNumber?width.asNumber():0;height=height&&height.asNumber?height.asNumber():0;
    if(!width||!height)return Promise.resolve(false);
    var filter=dict.lookup(PDFName0('Filter'));
    if(isPdfArray(filter))return Promise.resolve(false);
    var filterName=pdfName(filter);
    var mask=dict.get?dict.get(PDFName0('Mask')):null;
    if(mask)return Promise.resolve(false);
    var bpcEntry=dict.lookup(PDFName0('BitsPerComponent'));
    var bpc=bpcEntry&&bpcEntry.asNumber?bpcEntry.asNumber():8;
    var step=null;
    if(filterName==='DCTDecode'){
      if(bpc&&bpc!==8)return Promise.resolve(false);
      step={type:'jpeg',bytes:contents,w:width,h:height};
    }else{
      if(bpc!==8)return Promise.resolve(false);
      var color=flattenColorSpace(dict.lookup(PDFName0('ColorSpace')));
      if(!color)return Promise.resolve(false);
      var decoded;
      try{decoded=PDFLib.decodePDFRawStream(stream).decode();}catch(e){return Promise.resolve(false);}
      var rgb=normalizeRaw(decoded,width,height,color);
      if(!rgb)return Promise.resolve(false);
      step={type:'raw',bytes:rgb,w:width,h:height};
    }
    return Promise.resolve(encoder(step,q)).then(function(jpegBytes){
      if(!jpegBytes||jpegBytes.length>=contents.length)return false;
      stream.contents=jpegBytes;
      dict.set(PDFName0('Filter'),PDFName0('DCTDecode'));
      if(dict.get(PDFName0('DecodeParms')))dict.delete(PDFName0('DecodeParms'));
      dict.set(PDFName0('ColorSpace'),PDFName0('DeviceRGB'));
      dict.set(PDFName0('BitsPerComponent'),PDFLib.PDFNumber?PDFLib.PDFNumber.of(8):dict.lookup(PDFName0('BitsPerComponent')));
      stats.replaced+=1;
      return true;
    }).catch(function(){return false;});
  }
  function scanResources(res,visited,stats,q,encoder){
    if(!res||!res.entries)return Promise.resolve();
    var xobjects=res.lookup(PDFName0('XObject'));
    if(!xobjects||!xobjects.entries)return Promise.resolve();
    var tasks=[];
    xobjects.entries().forEach(function(pair){
      var key=pair[1]&&typeof pair[1].toString==='function'?pair[1].toString():null;
      if(key){if(visited[key])return;visited[key]=true;}
      var stream=null;
      try{stream=xobjects.lookup(pair[0]);}catch(e){return;}
      if(!stream||!stream.dict)return;
      var subtype=pdfName(stream.dict.lookup(PDFName0('Subtype')));
      if(subtype==='Image')tasks.push(recompressImage(stream,q,encoder,stats));
      else if(subtype==='Form')tasks.push(scanResources(stream.dict.lookup(PDFName0('Resources')),visited,stats,q,encoder));
    });
    return Promise.all(tasks).then(function(){});
  }
  function compressPdf(bytes,q,encoder){
    if(!window.PDFLib)return Promise.reject(new Error('pdf-lib failed to load'));
    var doc,stats={replaced:0};
    return PDFLib.PDFDocument.load(bytes,{updateMetadata:false}).then(function(loaded){
      doc=loaded;
      var visited={};
      return Promise.all(doc.getPages().map(function(page){return scanResources(page.node.Resources(),visited,stats,q,encoder);}));
    }).then(function(){return doc.save({useObjectStreams:true});}).then(function(out){return{blob:new Blob([out],{type:'application/pdf'}),size:out.length,replaced:stats.replaced,pages:doc.getPageCount()};});
  }
  function stepToJpeg(step,q){
    var canvas=document.createElement('canvas');
    canvas.width=step.w;canvas.height=step.h;
    var ctx=canvas.getContext('2d');
    var ready;
    if(step.type==='raw'){
      var rgba=new Uint8ClampedArray(step.w*step.h*4);
      for(var i=0,p=0;i<step.bytes.length;i+=3,p+=4){rgba[p]=step.bytes[i];rgba[p+1]=step.bytes[i+1];rgba[p+2]=step.bytes[i+2];rgba[p+3]=255;}
      ctx.putImageData(new ImageData(rgba,step.w,step.h),0,0);
      ready=Promise.resolve();
    }else{
      ready=createImageBitmap(new Blob([step.bytes],{type:'image/jpeg'})).then(function(bitmap){ctx.drawImage(bitmap,0,0,step.w,step.h);if(bitmap.close)bitmap.close();});
    }
    return ready.then(function(){return new Promise(function(resolve){canvas.toBlob(function(blob){if(!blob){resolve(null);return;}blob.arrayBuffer().then(function(buffer){resolve(new Uint8Array(buffer));}).catch(function(){resolve(null);});},'image/jpeg',q);});}).catch(function(){return null;});
  }
  function processPdf(entry){
    return entry.file.arrayBuffer().then(function(buffer){
      var bytes=new Uint8Array(buffer);
      var ceiling=Number(quality.value)/100;
      var limit=targetActive('pdf')?targetBytes():0;
      var encoder=function(q){return compressPdf(bytes,q,stepToJpeg);};
      return encoder(ceiling).then(function(item){
        if(!item)throw new Error('Could not process PDF');
        if(limit&&item.size>limit)return fitBest(encoder,limit,ceiling);
        item.q=ceiling;item.reached=true;return item;
      }).then(function(item){
        if(!item)throw new Error('Could not process PDF');
        return{kind:'pdf',name:outputName(entry.file,'application/pdf'),url:URL.createObjectURL(item.blob),original:entry.file.size,size:item.size,pages:item.pages||0,replaced:item.replaced||0,reached:item.reached!==false};
      });
    });
  }
  function friendlyPdfError(error){
    var message=(error&&error.message)||String(error);
    return /encrypted/i.test(message)?'Encrypted PDF \u2014 unlock it before compressing.':'Could not read this PDF: '+(message||'Unknown error');
  }
  function processEntry(entry){
    var task=entry.kind==='pdf'?processPdf(entry):processImage(entry);
    return task.catch(function(error){
      return{kind:entry.kind,name:outputName(entry.file,entry.kind==='pdf'?'application/pdf':formatSelect.value),url:'',original:entry.file.size,size:entry.file.size,error:entry.kind==='pdf'?friendlyPdfError(error):((error&&error.message)||'Processing failed')};
    });
  }
  function renderResults(){
    var container=document.getElementById('results');
    container.innerHTML=results.length?results.map(function(result,index){
      if(result.error)return '<article class="result-item is-error"><div class="result-preview"><div class="badge-pdf">'+(result.kind==='pdf'?'PDF':'IMG')+'</div></div><div class="result-info"><p class="result-name" title="'+escapeText(result.name)+'">'+escapeText(result.name)+'</p><p class="result-meta result-error">'+escapeText(result.error)+'</p></div></article>';
      var previewInner=result.kind==='pdf'?'<div class="badge-pdf">PDF</div>':'<img src="'+result.url+'" alt="'+escapeText(result.name)+'">';
      var head=result.kind==='pdf'?'PDF \u00b7 '+result.pages+' page'+(result.pages===1?'':'s')+' \u00b7 ':result.width+' \u00d7 '+result.height+' px \u00b7 ';
      var note=result.kind==='pdf'&&result.replaced===0?' <span class="delta info">no embedded images</span>':'';
      var downloadButton=result.error?'':'<button class="result-download" data-index="'+index+'">Download</button>';
      return '<article class="result-item"><div class="result-preview">'+previewInner+'</div><div class="result-info"><p class="result-name" title="'+escapeText(result.name)+'">'+escapeText(result.name)+'</p><p class="result-meta">'+head+formatSize(result.original)+' \u2192 '+formatSize(result.size)+' '+deltaMarkup(result)+note+'</p>'+downloadButton+'</div></article>';
    }).join(''):'<div class="empty-state">Your processed images will appear here.</div>';
    document.getElementById('download-all').disabled=!results.some(function(result){return !result.error&&result.url;});
    container.querySelectorAll('.result-download').forEach(function(button){button.addEventListener('click',function(){download(results[Number(button.dataset.index)]);});});
  }
  function download(result){if(!result||!result.url||result.error)return;var link=document.createElement('a');link.href=result.url;link.download=result.name;link.click();}
  function clearResults(){results.forEach(function(result){if(result.url)URL.revokeObjectURL(result.url);});results=[];}
  input.addEventListener('change',function(){clearResults();renderResults();readFiles(input.files);});
  preset.addEventListener('change',updateSizeFromPreset);
  quality.addEventListener('input',function(){qualityValue.textContent=quality.value+'%';});
  targetToggle.addEventListener('change',updateTargetState);
  targetSize.addEventListener('input',updateTargetState);
  formatSelect.addEventListener('change',updateTargetState);
  width.addEventListener('input',function(){var img=firstImage();if(lock.checked&&preset.value==='custom'&&img)height.value=Math.round(Number(width.value)/(img.image.naturalWidth/img.image.naturalHeight));});
  processButton.addEventListener('click',function(){processButton.disabled=true;processButton.textContent='Processing\u2026';clearResults();Promise.all(files.map(processEntry)).then(function(list){results=list;renderResults();showFiles();processButton.textContent='Process Images';});});
  document.getElementById('download-all').addEventListener('click',function(){results.forEach(function(result,index){if(!result.error&&result.url)setTimeout(function(){download(result);},index*150);});});
  document.getElementById('clear').addEventListener('click',function(){files=[];clearResults();input.value='';objectUrls.forEach(URL.revokeObjectURL);objectUrls=[];showFiles();renderResults();});
  var requestedPreset=new URLSearchParams(window.location.search).get('preset');
  if(requestedPreset&&preset.querySelector('option[value="'+requestedPreset+'"]'))preset.value=requestedPreset;
  updateTargetState();
  updateSizeFromPreset();
}());
