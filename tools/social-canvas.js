(function(){
  'use strict';
  var sizes=[
    {platform:'Instagram',format:'Post Square',usage:'Feed',width:1080,height:1080,aliases:['square','post','feed']},
    {platform:'Instagram',format:'Post Portrait',usage:'Feed',width:1080,height:1350,aliases:['portrait','post','feed']},
    {platform:'Instagram',format:'Post Landscape',usage:'Feed',width:1080,height:566,aliases:['landscape','post','feed']},
    {platform:'Instagram',format:'Story / Reel',usage:'Story and video',width:1080,height:1920,maxHeight:1920,aliases:['story','reels','vertical']},
    {platform:'Instagram',format:'Profile Photo',usage:'Avatar',width:320,height:320,aliases:['profile','avatar']},
    {platform:'Instagram',format:'Highlight Cover',usage:'Highlight',width:1080,height:1920,aliases:['highlight','story']},
    {platform:'WhatsApp',format:'WA Status',usage:'Status',width:1080,height:1920,maxHeight:1920,aliases:['status','vertical']},
    {platform:'WhatsApp',format:'WA Blast',usage:'Image message',width:1080,height:1080,maxHeight:1080,aliases:['blast','message','square']},
    {platform:'WhatsApp',format:'WA Blast Portrait',usage:'Image message',width:1080,height:1350,maxHeight:1350,aliases:['blast','message','portrait']},
    {platform:'WhatsApp',format:'WA Blast Landscape',usage:'Image message',width:1280,height:720,maxHeight:720,aliases:['blast','message','landscape']},
    {platform:'WhatsApp',format:'WA Profile Photo',usage:'Avatar',width:500,height:500,aliases:['profile','avatar']},
    {platform:'WhatsApp',format:'WA Catalog',usage:'Product image',width:800,height:800,aliases:['catalog','product']},
    {platform:'TikTok',format:'Video',usage:'Video',width:1080,height:1920,maxHeight:1920,aliases:['video','vertical']},
    {platform:'TikTok',format:'Profile Photo',usage:'Avatar',width:200,height:200,aliases:['profile','avatar']},
    {platform:'LinkedIn',format:'Post Landscape',usage:'Feed',width:1200,height:627,aliases:['landscape','post','feed']},
    {platform:'LinkedIn',format:'Post Square',usage:'Feed',width:1200,height:1200,aliases:['square','post','feed']},
    {platform:'LinkedIn',format:'Post Portrait',usage:'Feed',width:1080,height:1350,aliases:['portrait','post','feed']},
    {platform:'LinkedIn',format:'Profile Banner',usage:'Personal profile',width:1584,height:396,aliases:['banner','profile']},
    {platform:'LinkedIn',format:'Company Cover',usage:'Company page',width:1128,height:191,aliases:['cover','company']},
    {platform:'YouTube',format:'Thumbnail',usage:'Video cover',width:1280,height:720,aliases:['thumbnail','landscape']},
    {platform:'YouTube',format:'Channel Banner',usage:'Channel art',width:2560,height:1440,aliases:['banner','channel']},
    {platform:'YouTube',format:'Shorts',usage:'Short video',width:1080,height:1920,maxHeight:1920,aliases:['shorts','vertical']},
    {platform:'Facebook',format:'Post Landscape',usage:'Feed',width:1200,height:630,aliases:['landscape','post','feed']},
    {platform:'Facebook',format:'Post Square',usage:'Feed',width:1200,height:1200,aliases:['square','post','feed']},
    {platform:'Facebook',format:'Story',usage:'Story',width:1080,height:1920,maxHeight:1920,aliases:['story','vertical']},
    {platform:'Facebook',format:'Page Cover',usage:'Cover',width:1640,height:856,aliases:['cover','page']},
    {platform:'X / Twitter',format:'Post Landscape',usage:'Feed',width:1600,height:900,aliases:['twitter','landscape','post']},
    {platform:'X / Twitter',format:'Header Banner',usage:'Profile',width:1500,height:500,aliases:['twitter','banner','profile']},
  ];
  var activePlatform='all';
  function ratio(w,h){var a=w,b=h;while(b){var t=a%b;a=b;b=t;}return(w/a)+':'+(h/a);}
  function copy(value){if(navigator.clipboard)navigator.clipboard.writeText(value);}
  function render(){var query=document.getElementById('size-search').value.toLowerCase(),grid=document.getElementById('size-grid');var filtered=sizes.filter(function(item){return(activePlatform==='all'||item.platform===activePlatform)&&(!query||(item.platform+' '+item.format+' '+item.usage+' '+(item.aliases||[]).join(' ')).toLowerCase().includes(query));});grid.innerHTML=filtered.length?filtered.map(function(item){return'<article class="size-card"><div class="size-card-top"><span class="platform-label">'+item.platform+'</span><span class="usage-label">'+item.usage+'</span></div><h2>'+item.format+'</h2><div class="size-number" title="Click a number to copy"><button class="size-part" data-value="'+item.width+' px">'+item.width+'</button><span>×</span><button class="size-part" data-value="'+item.height+' px">'+item.height+'</button><small>px</small></div><div class="size-meta"><span>Ratio '+ratio(item.width,item.height)+'</span>'+(item.maxHeight?'<span class="max-height">Max height '+item.maxHeight+' px</span>':'')+'</div><div class="size-actions"><button class="copy-size" data-value="'+item.width+' × '+item.height+' px">Copy size</button><a href="image-studio.html?preset='+item.width+'x'+item.height+'">Use in Image Studio</a></div></article>';}).join(''):'<div class="no-results">No matching sizes.</div>';grid.querySelectorAll('.copy-size,.size-part').forEach(function(button){button.addEventListener('click',function(){copy(button.dataset.value);var original=button.textContent;button.textContent='Copied';setTimeout(function(){button.textContent=original;},1200);});});}
  document.querySelectorAll('.filter-button').forEach(function(button){button.addEventListener('click',function(){activePlatform=button.dataset.platform;document.querySelectorAll('.filter-button').forEach(function(item){item.classList.toggle('active',item===button);});render();});});
  document.getElementById('size-search').addEventListener('input',render);
  function updateCustom(){var w=Number(document.getElementById('custom-width').value)||1,h=Number(document.getElementById('custom-height').value)||1;document.getElementById('custom-ratio').textContent='Ratio '+ratio(w,h);}
  document.getElementById('custom-width').addEventListener('input',updateCustom);document.getElementById('custom-height').addEventListener('input',updateCustom);document.getElementById('copy-custom').addEventListener('click',function(){var w=document.getElementById('custom-width').value,h=document.getElementById('custom-height').value;copy(w+' × '+h+' px');this.textContent='Copied';setTimeout(function(){document.getElementById('copy-custom').textContent='Copy size';},1200);});
  render();
}());
