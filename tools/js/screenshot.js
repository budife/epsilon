(function(){
'use strict';
var $=function(s){return document.querySelector(s)};
var lastImage='';
var html2canvasPromise=null;
var imageCache=new Map();
var latestPreviewHtml='';
var latestPreviewSourceUrl='';

// ── Fetcher providers — mirror eDM Helper js/pages-layout-checker.js:14,18 ──
var GOOGLE_APPS_SCRIPT_URL='https://script.google.com/macros/s/AKfycbw29ldtoG5eq2I0bmeF055VWaZ_Ejk59E1wMrhY2pSdWuEHTDRL3saPCR2BoAC6-nmP/exec';
var FETCHER_PROVIDER_KEY='epsilon:screenshot:fetcher-provider';
var FETCHER_PROVIDERS={
  'google-apps-script':{
    label:'Google Apps Script',
    buildUrl:function(targetUrl){ return GOOGLE_APPS_SCRIPT_URL+'?url='+encodeURIComponent(targetUrl); }
  },
  'worker':{
    label:'Cloudflare Worker (legacy)',
    buildUrl:function(targetUrl){ return 'https://html-fetcher.budi-indra94.workers.dev/?url='+encodeURIComponent(targetUrl); }
  }
};

function getFetcherProviderKey(){
  try{
    var v=localStorage.getItem(FETCHER_PROVIDER_KEY);
    if(v&&FETCHER_PROVIDERS[v])return v;
  }catch(e){}
  var sel=document.getElementById('ss-fetcher');
  if(sel&&FETCHER_PROVIDERS[sel.value])return sel.value;
  return 'google-apps-script';
}
function setFetcherProviderKey(key){
  try{ localStorage.setItem(FETCHER_PROVIDER_KEY,key); }catch(e){}
  var sel=document.getElementById('ss-fetcher');
  if(sel)sel.value=key;
}

function loadHtml2Canvas(){
  if(window.html2canvas)return Promise.resolve(window.html2canvas);
  if(html2canvasPromise)return html2canvasPromise;
  html2canvasPromise=new Promise(function(resolve,reject){
    var script=document.createElement('script');
    script.src='../libs/html2canvas.min.js';
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

var progressSteps=[];

function ensureProgressStyles(){
  if(document.getElementById('ss-progress-log-styles'))return;
  var style=document.createElement('style');
  style.id='ss-progress-log-styles';
  style.textContent='.ss-progress-log{display:flex;flex-direction:column;gap:7px;text-align:left}.ss-progress-step{display:flex;align-items:flex-start;gap:8px;font-size:12px;line-height:1.4;color:#71808c}.ss-progress-step::before{content:"...";flex:0 0 22px;color:#db0011;font-weight:700}.ss-progress-step.done{color:#53606b}.ss-progress-step.done::before{content:"✓";color:#27834a}.ss-progress-step.current{color:#17212b;font-weight:600}.ss-progress-log.collapsed .ss-progress-step:not(:last-child){display:none}';
  document.head.appendChild(style);
}

function renderProgressLog(){
  var status=$('#ss-status');
  if(!status)return;
  ensureProgressStyles();
  status.innerHTML='';
  var log=document.createElement('div');
  log.className='ss-progress-log'+(progressSteps.length&&progressSteps.every(function(step){return step.done;})?' collapsed':'');
  progressSteps.forEach(function(step){
    var row=document.createElement('div');
    row.className='ss-progress-step '+(step.done?'done':'current');
    row.textContent=step.text+(step.done?' — Done':'');
    log.appendChild(row);
  });
  status.appendChild(log);
}

function resetProgressLog(){
  progressSteps=[];
  renderProgressLog();
}

function updateProgress(text,completed){
  var last=progressSteps[progressSteps.length-1];
  if(last&&!last.done&&last.text===text){
    last.done=Boolean(completed);
  }else{
    if(last&&!last.done)last.done=true;
    progressSteps.push({text:text,done:Boolean(completed)});
  }
  renderProgressLog();
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
  if(!url)return Promise.resolve('');
  if(imageCache.has(url))return Promise.resolve(imageCache.get(url));

  var attempts=getImageFetchAttempts(url);
  for(var i=0;i<attempts.length;i++){
    var proxyUrl=attempts[i].url;
    // direct attempt uses no proxy — skip custom headers
    var isDirect=attempts[i].via==='direct';
    var controller=new AbortController();
    var timeoutId=setTimeout(function(){controller.abort()},15000);
    try{
      var response=await fetch(proxyUrl,{
        signal:controller.signal,
        mode:'cors',
        credentials:'omit',
        headers: isDirect ? {} : {'Accept':'image/*'}
      });
      clearTimeout(timeoutId);
      if(!response.ok)throw new Error('HTTP '+response.status);
      var blob=await response.blob();
      if(!blob||!blob.size)throw new Error('Empty blob');
      var dataUrl=await new Promise(function(resolve,reject){
        var reader=new FileReader();
        reader.onload=function(){resolve(reader.result)};
        reader.onerror=function(){reject('Read error')};
        reader.readAsDataURL(blob);
      });
      imageCache.set(url,dataUrl);
      return dataUrl;
    }catch(e){
      clearTimeout(timeoutId);
      // try next proxy
    }
  }
  imageCache.set(url,'');
  return '';
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

// ── fetchRemoteHtmlFast — mirror eDM Helper js/pages-layout-checker.js:1008 ──
function getAllowedTargetHost(){
  // Screenshot allows any host; return '' = no restriction
  // If you need allowlist, return e.g. 'mail.hsbc.com.hk' and it will be enforced
  return '';
}
function validateTargetUrl(url){
  var parsed;
  try{ parsed=new URL(url); }catch(e){ throw new Error('Invalid URL'); }
  if(!/^https?:$/i.test(parsed.protocol))throw new Error('Only http/https allowed');
  var allowedHost=getAllowedTargetHost();
  if(allowedHost){
    var host=parsed.hostname.toLowerCase();
    if(host!==allowedHost)throw new Error('Host not allowed: '+host+' (only '+allowedHost+')');
  }
  return parsed.href;
}

async function fetchRemoteHtmlFast(url){
  var targetUrl=validateTargetUrl(url);
  var providerKey=getFetcherProviderKey();
  var provider=FETCHER_PROVIDERS[providerKey]||FETCHER_PROVIDERS['google-apps-script'];
  var fetchUrl=provider.buildUrl(targetUrl);
  var isGas=providerKey==='google-apps-script';
   var maxRetries=isGas?2:0;
  var lastError=null;

  for(var attempt=0;attempt<=maxRetries;attempt++){
    if(attempt>0){
      updateProgress('Retrying ('+attempt+'/'+maxRetries+') via '+provider.label+'...');
       await new Promise(function(r){ setTimeout(r,2000); });
    }else{
      updateProgress('Fetching via '+provider.label+'...');
    }

    var controller=new AbortController();
     var timeoutMs=isGas?15000:20000;
    var timeoutId=setTimeout(function(){controller.abort()},timeoutMs);
    try{
      var response=await fetch(fetchUrl,{
        signal:controller.signal,
        headers:{'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'}
      });
      clearTimeout(timeoutId);
      if(!response.ok)throw new Error('HTTP '+response.status);
      var html=await response.text();
      var looksLikeHtml=/<\s*(?:!doctype|html|head|title|body|main|section|div|table)\b/i.test(html||'');
      if(!html||html.length<100||!looksLikeHtml){
        // GAS may return JSON error when host blocked
        if(html&&/<"error"/i.test(html))throw new Error(html.slice(0,400));
        throw new Error('Invalid or empty HTML response ('+html.length+' bytes)');
      }
      return html;
    }catch(e){
      clearTimeout(timeoutId);
      lastError=e;
      var isAbort=(e&&e.name==='AbortError')||/aborted/i.test(e.message||'');
      if(isAbort)lastError=new Error('Timeout after '+(timeoutMs/1000)+'s');
      if(attempt>=maxRetries)break;
    }
  }
  throw new Error('Fetch failed: '+(lastError&&(lastError.message||lastError)||'unknown'));
}

// Legacy alias used by capture()
async function fetchHtml(url){ return fetchRemoteHtmlFast(url); }

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
   resetProgressLog();
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
  iframe.sandbox='allow-same-origin allow-popups allow-scripts';
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
    updateProgress('Waiting for page to load...');

    setProgressPercent(50);
    updateProgress('Preparing images for screenshot...');
    var doc=iframe.contentDocument;
    if(doc){
      await waitForDocumentImages(doc,5000);
      var result=await preparePreviewImagesForScreenshot(doc);
      updateProgress('Images: '+result.converted+'/'+result.total+' embedded');
    }

    setProgressPercent(60);
    await new Promise(function(r){setTimeout(r,100)});

    setProgressPercent(70);
    updateProgress('Capturing screenshot...');
    await new Promise(function(r){setTimeout(r,200)});

    if(!doc)throw new Error('Cannot read document - srcdoc blocked');

    await new Promise(function(r){
      if(doc.body&&doc.body.children.length>0){r();return}
      var poll=setInterval(function(){
        if(doc.body&&doc.body.children.length>0){clearInterval(poll);r()}
      },100);
      setTimeout(function(){clearInterval(poll);r()},10000);
    });

    var target=doc.body||doc.documentElement;
    
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
    var html2canvas=await loadHtml2Canvas();
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
         updateProgress('Screenshot captured: '+url,true);
        $('#download-btn').disabled=false;
        hideProgressBar();
      };
    },'image/png');
    
  }catch(error){
    console.error('Screenshot error:',error);
    showFetchErrorOverlay(error);
    hideProgressBar();
  }finally{
    var leftover=document.body.querySelectorAll('iframe[style*="-9999px"]');
    leftover.forEach(function(el){ try{el.remove()}catch(e){} });
  }
}

// ── Error overlay + Retry — mirror eDM Helper js/pages-layout-checker.js:460-482 ──
function showFetchErrorOverlay(error){
  var msg=(error&&error.message)||String(error||'Unknown error');
  var isHostError=/Host not allowed/i.test(msg);
  var isTimeout=/Timeout/i.test(msg);
  var hint=isHostError ? 'Host not allowed. For Screenshot any host is allowed — check GAS deployment.' : isTimeout ? 'GAS cold start? Click Retry (auto-retry 2× with 2s delay is already done).' : 'Try a different URL or switch Fetcher provider.';
  updateProgress('Failed: '+msg);
  var preview=$('#ss-preview');
  if(!preview)return;
  var wrap=document.createElement('div');
  wrap.className='ss-error-overlay';
  wrap.innerHTML='<div class="ss-error-title">Capture failed</div><div class="ss-error-msg"></div><div class="ss-error-hint"></div><div class="ss-error-actions"><button id="ss-retry" class="capture-btn">Retry</button><button id="ss-retry-fallback" class="download-btn" style="display:none">Try Worker fallback</button></div>';
  wrap.querySelector('.ss-error-msg').textContent=msg;
  wrap.querySelector('.ss-error-hint').textContent=hint;
  preview.innerHTML='';
  preview.appendChild(wrap);
  var retryBtn=wrap.querySelector('#ss-retry');
  if(retryBtn)retryBtn.addEventListener('click',function(){ capture(); });
  // offer Worker fallback when GAS fails
  if(getFetcherProviderKey()==='google-apps-script'){
    var fb=wrap.querySelector('#ss-retry-fallback');
    if(fb){
      fb.style.display='inline-block';
      fb.addEventListener('click',function(){
        setFetcherProviderKey('worker');
        capture();
      });
    }
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

// Fetcher selector persistence (mirror eDM Helper FETCHER_PROVIDER_KEY)
(function initFetcherSelect(){
   var sel=document.getElementById('ss-fetcher');
   if(!sel)return;
   var optionsCard=sel.closest('.options-card');
   if(optionsCard&&!optionsCard.querySelector('.ss-tip')){
     var tip=document.createElement('div');
     tip.className='ss-tip';
     tip.innerHTML='<strong>Tip:</strong> Google Apps Script bisa membutuhkan beberapa detik lebih lama saat pertama kali dipakai karena cold start. Ini normal, terutama untuk halaman HSBC atau halaman dengan banyak gambar.';
     tip.style.cssText='margin:0 0 16px;padding:10px 12px;border:1px solid #f0d394;border-radius:6px;background:#fff8e8;color:#8a5a00;font-size:12px;line-height:1.5';
     optionsCard.insertBefore(tip,optionsCard.firstChild);
   }
   var saved=getFetcherProviderKey();
  sel.value=saved;
  sel.addEventListener('change',function(){ setFetcherProviderKey(sel.value); });
})();
})();
