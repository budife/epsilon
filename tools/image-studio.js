(function(){
  'use strict';
  var input=document.getElementById('image-input');
  var preset=document.getElementById('preset');
  var width=document.getElementById('width');
  var height=document.getElementById('height');
  var lock=document.getElementById('lock-ratio');
  var quality=document.getElementById('quality');
  var qualityValue=document.getElementById('quality-value');
  var files=[];
  var results=[];
  var objectUrls=[];
  function parsePreset(value){var parts=value.split('x');return parts.length===2?{width:Number(parts[0]),height:Number(parts[1])}:null;}
  function updateSizeFromPreset(){var size=parsePreset(preset.value);if(size){width.value=size.width;height.value=size.height;}else if(preset.value==='original'&&files[0]){width.value=files[0].image.naturalWidth;height.value=files[0].image.naturalHeight;}width.disabled=preset.value!=='custom'&&preset.value!=='original';height.disabled=width.disabled;}
  function showFiles(){document.getElementById('file-summary').textContent=files.length?files.length+' image'+(files.length===1?'':'s')+' selected':'No images selected';document.getElementById('process').disabled=!files.length;updateSizeFromPreset();}
  function readFiles(selected){files=[];Array.from(selected).forEach(function(file){if(!/^image\/(png|jpeg|webp)$/.test(file.type))return;var url=URL.createObjectURL(file),image=new Image();image.onload=function(){files.push({file:file,image:image});showFiles();};image.src=url;objectUrls.push(url);});}
  function outputName(file,type){var ext=type==='image/png'?'png':type==='image/webp'?'webp':'jpg';var base=file.name.replace(/\.[^.]+$/,'');return document.getElementById('prefix').value+base+document.getElementById('suffix').value+'.'+ext;}
  function processFile(entry){var source=entry.image;var targetW=Number(width.value)||source.naturalWidth;var targetH=Number(height.value)||source.naturalHeight;if(preset.value==='original'){targetW=source.naturalWidth;targetH=source.naturalHeight;}if(lock.checked&&preset.value==='custom'){var ratio=source.naturalWidth/source.naturalHeight;if(document.activeElement===width)targetH=Math.round(targetW/ratio);else targetW=Math.round(targetH*ratio);height.value=targetH;width.value=targetW;}var canvas=document.createElement('canvas');canvas.width=targetW;canvas.height=targetH;var ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,targetW,targetH);ctx.drawImage(source,0,0,targetW,targetH);var type=document.getElementById('format').value;var blobUrl=canvas.toDataURL(type,Number(quality.value)/100);return{name:outputName(entry.file,type),url:blobUrl,original:entry.file.size,width:targetW,height:targetH};}
  function renderResults(){var container=document.getElementById('results');container.innerHTML=results.length?results.map(function(result,index){return '<article class="result-item"><div class="result-preview"><img src="'+result.url+'" alt="'+result.name.replace(/"/g,'&quot;')+'"></div><div class="result-info"><p class="result-name" title="'+result.name.replace(/"/g,'&quot;')+'">'+result.name+'</p><p class="result-meta">'+result.width+' × '+result.height+' px · '+Math.round(result.url.length/1.37/1024)+' KB</p><button class="result-download" data-index="'+index+'">Download</button></div></article>';}).join(''):'<div class="empty-state">Your processed images will appear here.</div>';document.getElementById('download-all').disabled=!results.length;container.querySelectorAll('.result-download').forEach(function(button){button.addEventListener('click',function(){download(results[Number(button.dataset.index)]);});});}
  function download(result){var link=document.createElement('a');link.href=result.url;link.download=result.name;link.click();}
  input.addEventListener('change',function(){readFiles(input.files);});
  preset.addEventListener('change',updateSizeFromPreset);
  quality.addEventListener('input',function(){qualityValue.textContent=quality.value+'%';});
  width.addEventListener('input',function(){if(lock.checked&&preset.value==='custom'&&files[0])height.value=Math.round(Number(width.value)/(files[0].image.naturalWidth/files[0].image.naturalHeight));});
  document.getElementById('process').addEventListener('click',function(){results=files.map(processFile);renderResults();});
  document.getElementById('download-all').addEventListener('click',function(){results.forEach(function(result,index){setTimeout(function(){download(result);},index*150);});});
  document.getElementById('clear').addEventListener('click',function(){files=[];results=[];input.value='';objectUrls.forEach(URL.revokeObjectURL);objectUrls=[];showFiles();renderResults();});
  var requestedPreset=new URLSearchParams(window.location.search).get('preset');
  if(requestedPreset&&preset.querySelector('option[value="'+requestedPreset+'"]'))preset.value=requestedPreset;
  updateSizeFromPreset();
}());
