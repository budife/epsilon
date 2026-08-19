(function(){
'use strict';
var $=function(s){return document.querySelector(s)};
var lastImage='';
var html2canvasPromise=null;
var imageCache=new Map();
var latestPreviewHtml='';
var latestPreviewSourceUrl='';

function loadHtml2Canvas(){
  if(window.html2canvas)return Promise.resolve(window.html2canvas);
  if(html2canvasPromise)return html2canvasPromise;
  html2canvasPromise=new Promise(function(resolve,reject){
    var script=document.createElement('script');
    script.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.async=true;
    script.onload=function(){resolve(window.html2canvas)};
    script.onerror=function(){reject(new Error('Unable to load screenshot library'))};
    document.head.appendChild(script);
  });
  return html2canvasPromise;
}

function getFullUrl(url){
  if(!/^https?:\/\//i.test(url))return'https://'+url;
  return url;
}

function getPreviewBaseHref(url){
  if(!url)return'';
  try{
    var parsed=new URL(url);
    return parsed.origin+parsed.pathname.replace(/\/[^\/]*$/,'/');
  }catch(e){
    return'';
  }
}

function preparePreviewHtml(html,sourceUrl){
  if(!html)return'';
  var baseHref=getPreviewBaseHref(sourceUrl);
  var baseTag=baseHref?'<base href="'+baseHref+'">':'';
  if(/<head[^>]*>/i.test(html)){
    return html.replace(/<head([^>]*)>/i,'<head$1>'+baseTag);
  }
  return baseTag+html;
}

function updateProgress(text){
  var status=$('#ss-status');
  if(status)status.textContent=text;
}

function showProgressBar(){
  var container=$('#ss-progress');
  if(container)container.style.display='block';
}

function hideProgressBar(){
  var container=$('#ss-progress');
  if(container)container.style.display='none';
}

function setProgressPercent(percent){
  var bar=$('#ss-progress-bar');
  if(bar)bar.style.width=percent+'%';
}

function cropWhiteSpace(canvas){
  var ctx=canvas.getContext('2d');
  var w=canvas.width;
  var h=canvas.height;
  var imageData=ctx.getImageData(0,0,w,h);
  var data=imageData.data;
  
  // Sample corner pixels to detect background color (the gray/white outer area)
  var bgR=0,bgG=0,bgB=0;
  var corners=[[0,0],[w-1,0],[0,h-1],[w-1,h-1],[Math.floor(w/2),0],[Math.floor(w/2),h-1]];
  for(var i=0;i<corners.length;i++){
    var idx=(corners[i][1]*w+corners[i][0])*4;
    bgR+=data[idx];
    bgG+=data[idx+1];
    bgB+=data[idx+2];
  }
  bgR=Math.round(bgR/corners.length);
  bgG=Math.round(bgG/corners.length);
  bgB=Math.round(bgB/corners.length);
  
  // Pixels within this tolerance of the background are treated as background
  var tolerance=8;
  
  var minX=w,minY=h,maxX=0,maxY=0;
  
  for(var y=0;y<h;y++){
    for(var x=0;x<w;x++){
      var idx=(y*w+x)*4;
      var a=data[idx+3];
      if(a===0)continue;
      var r=data[idx];
      var g=data[idx+1];
      var b=data[idx+2];
      // Skip if pixel matches background color
      if(Math.abs(r-bgR)<=tolerance&&Math.abs(g-bgG)<=tolerance&&Math.abs(b-bgB)<=tolerance)continue;
      if(x<minX)minX=x;
      if(x>maxX)maxX=x;
      if(y<minY)minY=y;
      if(y>maxY)maxY=y;
    }
  }
  
  if(maxX<=minX||maxY<=minY)return canvas;
  
  // Keep the top intact, crop only left/right/bottom
  minY=0;
  
  var cropW=maxX-minX+1;
  var cropH=maxY-minY+1;
  var cropCanvas=document.createElement('canvas');
  cropCanvas.width=cropW;
  cropCanvas.height=cropH;
  var cropCtx=cropCanvas.getContext('2d');
  cropCtx.drawImage(canvas,minX,minY,cropW,cropH,0,0,cropW,cropH);
  
  return cropCanvas;
}

function readBlobAsDataUrl(blob){
  return new Promise(function(resolve,reject){
    var reader=new FileReader();
    reader.onload=function(){resolve(reader.result)};
    reader.onerror=function(){reject(reader.error||new Error('Unable to read image'))};
    reader.readAsDataURL(blob);
  });
}

function resolvePreviewAssetUrl(url,documentRef){
  if(!url||/^(data:|blob:|about:|#)/i.test(url))return'';
  try{
    return new URL(url,latestPreviewSourceUrl||documentRef?.baseURI||window.location.href).href;
  }catch(e){
    return'';
  }
}

function getImageFetchAttempts(url){
  return[
    {url:url,via:'direct'},
    {url:'https://images.weserv.nl/?url='+encodeURIComponent(url.replace(/^https?:\/\//,'')),via:'Weserv Image'},
    {url:'https://api.allorigins.win/raw?url='+encodeURIComponent(url),via:'AllOrigins Raw'},
    {url:'https://corsproxy.io/?'+encodeURIComponent(url),via:'CorsProxy'},
    {url:'https://api.codetabs.com/v1/proxy?quest='+encodeURIComponent(url),via:'CodeTabs'}
  ];
}

async function fetchImageAsDataUrl(url){
  if(!url)return'';
  if(imageCache.has(url))return imageCache.get(url);
  
  var attempts=getImageFetchAttempts(url);
  var controllers=[];
  
  for(var i=0;i<attempts.length;i++){
    var attempt=attempts[i];
    var controller=new AbortController();
    controllers.push(controller);
    var timeoutId=setTimeout(function(){controller.abort()},7000);
    try{
      var response=await fetch(attempt.url,{
        signal:controller.signal,
        mode:'cors',
        credentials:'omit',
        headers:{'Accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'}
      });
      clearTimeout(timeoutId);
      if(!response.ok)continue;
      var blob=await response.blob();
      if(!blob||!blob.size)continue;
      var dataUrl=await readBlobAsDataUrl(blob);
      imageCache.set(url,dataUrl);
      controllers.forEach(function(c){c.abort()});
      return dataUrl;
    }catch(e){
      clearTimeout(timeoutId);
      continue;
    }
  }
  controllers.forEach(function(c){c.abort()});
  imageCache.set(url,'');
  return'';
}

function collectScreenshotImageTasks(documentRef){
  var tasks=[];
  var addTask=function(element,attribute,rawUrl){
    var url=resolvePreviewAssetUrl(rawUrl,documentRef);
    if(!url)return;
    tasks.push({element:element,attribute:attribute,rawUrl:rawUrl,url:url});
  };

  Array.from(documentRef.images||[]).forEach(function(image){
    addTask(image,'src',image.getAttribute('src')||image.currentSrc||image.src);
  });

  Array.from(documentRef.querySelectorAll('[background]')).forEach(function(element){
    addTask(element,'background',element.getAttribute('background'));
  });

  Array.from(documentRef.querySelectorAll('[style*="url("]')).forEach(function(element){
    var styleValue=element.getAttribute('style')||'';
    var matches=styleValue.matchAll(/url\((['"]?)(.*?)\1\)/gi);
    for(var match of matches){
      addTask(element,'style',match[2]);
    }
  });

  return tasks;
}

async function runLimited(items,limit,worker){
  var queue=items.slice();
  var workers=Array.from({length:Math.min(limit,queue.length)},async function(){
    while(queue.length){
      var item=queue.shift();
      await worker(item);
    }
  });
  await Promise.all(workers);
}

async function preparePreviewImagesForScreenshot(documentRef){
  var tasks=collectScreenshotImageTasks(documentRef);
  if(!tasks.length)return{total:0,converted:0};

  var completed=0;
  var converted=0;
  var styleDataUrls=new Map();

  await runLimited(tasks,6,async function(task){
    var dataUrl=await fetchImageAsDataUrl(task.url);
    completed+=1;
    updateProgress('Preparing screenshot images '+completed+'/'+tasks.length);
    if(!dataUrl)return;
    converted+=1;

    if(task.attribute==='src'){
      task.element.removeAttribute('srcset');
      task.element.removeAttribute('sizes');
      task.element.crossOrigin='anonymous';
      task.element.src=dataUrl;
      return;
    }

    if(task.attribute==='background'){
      task.element.setAttribute('background',dataUrl);
      return;
    }

    if(!styleDataUrls.has(task.element))styleDataUrls.set(task.element,[]);
    styleDataUrls.get(task.element).push([task.rawUrl,dataUrl]);
  });

  styleDataUrls.forEach(function(replacements,element){
    var styleValue=element.getAttribute('style')||'';
    replacements.forEach(function(pair){
      var rawUrl=pair[0];
      var dataUrl=pair[1];
      var escaped=rawUrl.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      styleValue=styleValue.replace(new RegExp(escaped,'g'),dataUrl);
    });
    element.setAttribute('style',styleValue);
  });

  return{total:tasks.length,converted:converted};
}

function waitForDocumentImages(documentRef,timeoutMs){
  timeoutMs=timeoutMs||5000;
  var images=Array.from(documentRef?.images||[]);
  if(!images.length)return Promise.resolve();

  return new Promise(function(resolve){
    var settled=false;
    var remaining=images.filter(function(image){return !image.complete}).length;
    var finish=function(){
      if(settled)return;
      settled=true;
      resolve();
    };
    var done=function(){
      remaining-=1;
      if(remaining<=0)finish();
    };

    if(!remaining){
      finish();
      return;
    }

    images.forEach(function(image){
      if(image.complete)return;
      image.addEventListener('load',done,{once:true});
      image.addEventListener('error',done,{once:true});
    });
    window.setTimeout(finish,timeoutMs);
  });
}

async function fetchHtml(url){
  var proxies=[
    {url:'https://corsproxy.io/?'+encodeURIComponent(url),name:'CorsProxy'},
    {url:'https://api.allorigins.win/raw?url='+encodeURIComponent(url),name:'AllOrigins'},
    {url:'https://api.codetabs.com/v1/proxy?quest='+encodeURIComponent(url),name:'CodeTabs'},
    {url:'https://r.jina.ai/http/'+url.replace(/^https?:\/\//,''),name:'Jina HTTP'},
    {url:'https://r.jina.ai/https/'+url.replace(/^https?:\/\//,''),name:'Jina HTTPS'}
  ];
  
  for(var i=0;i<proxies.length;i++){
    try{
      updateProgress('Trying '+proxies[i].name+'...');
      var controller=new AbortController();
      var timeoutId=setTimeout(function(){controller.abort()},5000);
      var response=await fetch(proxies[i].url,{
        signal:controller.signal,
        headers:{'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'}
      });
      clearTimeout(timeoutId);
      if(!response.ok)continue;
      var html=await response.text();
      if(html&&html.length>100&&/<html|<!doctype|<body/i.test(html)){
        return html;
      }
    }catch(e){
      continue;
    }
  }
  throw new Error('All fetch attempts failed');
}

async function capture(){
  var raw=$('#url-input').value.trim();
  if(!raw){
    updateProgress('Please enter a URL.');
    return;
  }
  
  var url=getFullUrl(raw);
  var widthOption=$('#ss-width').value;
  var fullpage=$('#ss-fullpage').value==='true';
  
  latestPreviewSourceUrl=url;
  $('#ss-preview').innerHTML='';
  $('#download-btn').disabled=true;
  showProgressBar();
  setProgressPercent(10);
  updateProgress('Loading website...');
  
  var iframe=document.createElement('iframe');
  iframe.style.width=widthOption==='auto'?'1450px':widthOption+'px';
  iframe.style.height='800px';
  iframe.style.border='none';
  iframe.style.position='absolute';
  iframe.style.left='-9999px';
  iframe.style.top='0';
  iframe.sandbox='allow-same-origin allow-popups';
  document.body.appendChild(iframe);
  
  try{
    setProgressPercent(20);
    updateProgress('Fetching website...');
    var html=await fetchHtml(url);
    latestPreviewHtml=html;
    
    setProgressPercent(30);
    updateProgress('Rendering page...');
    var preparedHtml=preparePreviewHtml(html,url);
    iframe.srcdoc=preparedHtml;
    await new Promise(function(resolve){
      iframe.onload=resolve;
      setTimeout(resolve,8000);
    });
    
    setProgressPercent(40);
    updateProgress('Waiting for images...');
    var doc=iframe.contentDocument;
    if(doc){
      await waitForDocumentImages(doc,5000);
    }
    
    setProgressPercent(50);
    updateProgress('Preparing images for screenshot...');
    if(doc){
      var result=await preparePreviewImagesForScreenshot(doc);
      updateProgress('Images: '+result.converted+'/'+result.total+' embedded');
    }
    
    setProgressPercent(60);
    await new Promise(function(r){setTimeout(r,500)});
    
    setProgressPercent(70);
    updateProgress('Capturing screenshot...');
    var html2canvas=await loadHtml2Canvas();
    
    var target=doc.body||doc.documentElement;
    if(!target)throw new Error('Unable to access page content');
    
    var contentWidth=1450;
    var contentHeight=800;
    
    if(widthOption==='auto'){
      contentWidth=1450;
      contentHeight=Math.max(target.scrollHeight,target.offsetHeight,800);
    }else{
      contentWidth=Number(widthOption);
      if(fullpage){
        contentHeight=Math.max(target.scrollHeight,target.offsetHeight,doc.documentElement.scrollHeight,800);
      }else{
        contentHeight=800;
      }
    }
    
    var captureWidth=contentWidth;
    var captureHeight=contentHeight;
    
    iframe.style.width=captureWidth+'px';
    iframe.style.height=captureHeight+'px';
    await new Promise(function(r){setTimeout(r,300)});
    
    setProgressPercent(80);
    var canvas=await html2canvas(target,{
      backgroundColor:'#ffffff',
      scale:1,
      useCORS:true,
      allowTaint:false,
      logging:false,
      imageTimeout:12000,
      windowWidth:captureWidth,
      windowHeight:captureHeight
    });
    
    setProgressPercent(85);
    updateProgress('Cropping...');
    var cropCanvas=cropWhiteSpace(canvas);
    canvas=cropCanvas;
    
    setProgressPercent(90);
    updateProgress('Preparing download...');
    
    canvas.toBlob(function(blob){
      if(!blob){
        updateProgress('Screenshot could not be created.');
        hideProgressBar();
        return;
      }
      var imgUrl=URL.createObjectURL(blob);
      var img=new Image();
      img.src=imgUrl;
      img.alt='Screenshot of '+url;
      img.onload=function(){
        $('#ss-preview').innerHTML='';
        $('#ss-preview').appendChild(img);
        lastImage=imgUrl;
        setProgressPercent(100);
        updateProgress('Screenshot captured: '+url);
        $('#download-btn').disabled=false;
        hideProgressBar();
      };
    },'image/png');
    
  }catch(error){
    console.error('Screenshot error:',error);
    updateProgress('Failed: '+error.message+'. Try again.');
    hideProgressBar();
  }finally{
    document.body.removeChild(iframe);
  }
}

async function download(){
  if(!lastImage)return;
  var format=$('#ss-format').value;
  var raw=$('#url-input').value.trim().replace(/^https?:\/\//i,'').split(/[?#]/)[0].replace(/\/+$/,'');
  var parts=raw.split('/').filter(Boolean);
  var stem='';
  if(parts.length>1)stem=parts[parts.length-1].replace(/\.[a-z0-9]+$/i,'');
  if(!stem&&parts.length)stem=parts[0].replace(/^www\./i,'');
  stem=stem.replace(/[^\w\-.]+/g,'-').replace(/-{2,}/g,'-').replace(/^[-.]+|[-.]+$/g,'');
  if(!stem)stem='screenshot';
  var fileName=stem;
  
  if(format==='pdf'){
    if(!window.PDFLib){
      alert('PDF library not loaded.');
      return;
    }
    try{
      updateProgress('Generating PDF...');
      var response=await fetch(lastImage);
      var blob=await response.blob();
      var reader=new FileReader();
      reader.onload=async function(){
        var imgBytes=new Uint8Array(reader.result);
        var doc=await PDFLib.PDFDocument.create();
        var image=await doc.embedPng(imgBytes);
        var page=doc.addPage([image.width,image.height]);
        page.drawImage(image,{x:0,y:0,width:image.width,height:image.height});
        var pdfBytes=await doc.save();
        var pdfBlob=new Blob([pdfBytes],{type:'application/pdf'});
        saveBlob(pdfBlob,fileName+'.pdf');
        updateProgress('PDF downloaded!');
      };
      reader.readAsArrayBuffer(blob);
    }catch(e){
      alert('Failed to generate PDF. Try downloading as PNG or JPG.');
    }
  }else{
    var canvas=document.createElement('canvas');
    var img=$('#ss-preview').querySelector('img');
    if(!img)return;
    canvas.width=img.naturalWidth;
    canvas.height=img.naturalHeight;
    var ctx=canvas.getContext('2d');
    ctx.drawImage(img,0,0);
    var mimeType=format==='jpg'?'image/jpeg':'image/png';
    canvas.toBlob(function(blob){
      saveBlob(blob,fileName+'.'+format);
      updateProgress(format.toUpperCase()+' downloaded!');
    },mimeType,0.95);
  }
}

function saveBlob(blob,name){
  var link=document.createElement('a');
  link.download=name;
  link.href=URL.createObjectURL(blob);
  link.click();
  setTimeout(function(){URL.revokeObjectURL(link.href)},1000);
}

$('#capture').addEventListener('click',capture);
$('#url-input').addEventListener('keydown',function(e){
  if(e.key==='Enter')capture();
});
$('#download-btn').addEventListener('click',download);
})();
