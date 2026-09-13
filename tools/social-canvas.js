(function(){
  'use strict';
  var sizes=[
    {platform:'Instagram',format:'Post Square',usage:'Feed',width:1080,height:1080},
    {platform:'Instagram',format:'Post Portrait',usage:'Feed',width:1080,height:1350},
    {platform:'Instagram',format:'Story / Reel',usage:'Story and video',width:1080,height:1920},
    {platform:'Instagram',format:'Profile Photo',usage:'Avatar',width:320,height:320},
    {platform:'WhatsApp',format:'WA Status',usage:'Status',width:1080,height:1920},
    {platform:'WhatsApp',format:'WA Blast',usage:'Image message',width:1080,height:1080,maxHeight:1080},
    {platform:'WhatsApp',format:'WA Blast Portrait',usage:'Image message',width:1080,height:1350,maxHeight:1350},
    {platform:'LinkedIn',format:'Post Landscape',usage:'Feed',width:1200,height:627},
    {platform:'LinkedIn',format:'Post Square',usage:'Feed',width:1200,height:1200},
    {platform:'LinkedIn',format:'Profile Banner',usage:'Personal profile',width:1584,height:396},
    {platform:'YouTube',format:'Thumbnail',usage:'Video cover',width:1280,height:720},
    {platform:'YouTube',format:'Channel Banner',usage:'Channel art',width:2560,height:1440},
    {platform:'Facebook',format:'Post Landscape',usage:'Feed',width:1200,height:630},
    {platform:'Facebook',format:'Post Square',usage:'Feed',width:1200,height:1200},
    {platform:'Facebook',format:'Story',usage:'Story',width:1080,height:1920}
  ];
  var activePlatform='all';
  function ratio(w,h){var a=w,b=h;while(b){var t=a%b;a=b;b=t;}return(w/a)+':'+(h/a);}
  function copy(value){if(navigator.clipboard)navigator.clipboard.writeText(value);}
  function render(){var query=document.getElementById('size-search').value.toLowerCase(),grid=document.getElementById('size-grid');var filtered=sizes.filter(function(item){return(activePlatform==='all'||item.platform===activePlatform)&&(!query||(item.platform+' '+item.format+' '+item.usage).toLowerCase().includes(query));});grid.innerHTML=filtered.length?filtered.map(function(item){return'<article class="size-card"><div class="size-card-top"><span class="platform-label">'+item.platform+'</span><span class="usage-label">'+item.usage+'</span></div><h2>'+item.format+'</h2><button class="size-number" data-value="'+item.width+' × '+item.height+' px" title="Copy pixel size">'+item.width+' × '+item.height+' <small>px</small></button><div class="size-meta"><span>Ratio '+ratio(item.width,item.height)+'</span>'+(item.maxHeight?'<span class="max-height">Max height '+item.maxHeight+' px</span>':'')+'</div><div class="size-actions"><button class="copy-size" data-value="'+item.width+' × '+item.height+' px">Copy size</button><a href="image-studio.html?preset='+item.width+'x'+item.height+'">Use in Image Studio</a></div></article>';}).join(''):'<div class="no-results">No matching sizes.</div>';grid.querySelectorAll('.copy-size,.size-number').forEach(function(button){button.addEventListener('click',function(){copy(button.dataset.value);var original=button.textContent;button.textContent=button.classList.contains('size-number')?'Copied':'Copied';setTimeout(function(){button.textContent=original;},1200);});});}
  document.querySelectorAll('.filter-button').forEach(function(button){button.addEventListener('click',function(){activePlatform=button.dataset.platform;document.querySelectorAll('.filter-button').forEach(function(item){item.classList.toggle('active',item===button);});render();});});
  document.getElementById('size-search').addEventListener('input',render);
  function updateCustom(){var w=Number(document.getElementById('custom-width').value)||1,h=Number(document.getElementById('custom-height').value)||1;document.getElementById('custom-ratio').textContent='Ratio '+ratio(w,h);}
  document.getElementById('custom-width').addEventListener('input',updateCustom);document.getElementById('custom-height').addEventListener('input',updateCustom);document.getElementById('copy-custom').addEventListener('click',function(){var w=document.getElementById('custom-width').value,h=document.getElementById('custom-height').value;copy(w+' × '+h+' px');this.textContent='Copied';setTimeout(function(){document.getElementById('copy-custom').textContent='Copy size';},1200);});
  render();
}());
