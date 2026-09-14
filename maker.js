function openMakerModal(){
  window.location.href='the-maker.html';
}
function closeMakerModal(){
  document.getElementById('maker-modal').classList.remove('active');
}
function makerTab(name){
  var tabs=document.querySelectorAll('.maker-tab');
  for(var i=0;i<tabs.length;i++){
    tabs[i].classList.toggle('active',tabs[i].dataset.tab===name);
  }
  var panels=document.querySelectorAll('.maker-panel');
  for(var j=0;j<panels.length;j++){
    panels[j].style.display=panels[j].id==='tab-'+name?'block':'none';
  }
}
document.addEventListener('click',function(e){
  var modal=document.getElementById('maker-modal');
  if(modal&&e.target===modal)closeMakerModal();
});
document.querySelectorAll('.maker-tab').forEach(function(btn){
  btn.addEventListener('click',function(){
    makerTab(btn.getAttribute('data-tab'));
  });
});

document.querySelectorAll('.creator-link').forEach(function(link){
  link.removeAttribute('onclick');
  link.setAttribute('role','link');
  link.addEventListener('click',function(){
    window.location.href=link.getAttribute('href')||'the-maker.html';
  });
});

(function initHomeCategories(){
  var toolsWrap=document.querySelector('.tools-wrap');
  var grid=toolsWrap&&toolsWrap.querySelector('.tool-grid');
  if(!toolsWrap||!grid)return;

  // Keep the home focused on one scannable grid; workflow labels stay on each card.
  var oldHeading=toolsWrap.querySelector(':scope > h2');
  if(oldHeading)oldHeading.textContent='Tools';
  grid.querySelectorAll('.tool-card').forEach(function(card){var href=card.getAttribute('href')||'',workflow=href.includes('daily-currency')||href.includes('qrcode')||href.includes('converttext')||href.includes('screenshot.html')||href.includes('assembler')?'Existing':'Prepare';card.insertAdjacentHTML('afterbegin','<span class="tool-workflow">'+workflow+'</span>');});
  grid.insertAdjacentHTML('beforeend','<a class="tool-card tool-card-new" data-workflow="Create" href="tools/presentation-board.html"><span class="tool-workflow">Create</span><div class="tool-icon">▤</div><h3>Presentation Board</h3><p>Arrange visuals into a clean board for review, presentation, or delivery.</p><span class="tool-arrow">Open tool →</span></a><a class="tool-card tool-card-new" data-workflow="Prepare" href="tools/pdf-tools.html"><span class="tool-workflow">Prepare</span><div class="tool-icon">▤</div><h3>PDF Tools</h3><p>Merge and optimize PDF files without rasterizing their pages.</p><span class="tool-arrow">Open tool →</span></a><a class="tool-card tool-card-new" data-workflow="Prepare" href="tools/typography-helper.html"><span class="tool-workflow">Prepare</span><div class="tool-icon">Tt</div><h3>Typography Helper</h3><p>Build a practical type scale, preview hierarchy, and copy CSS.</p><span class="tool-arrow">Open tool →</span></a><a class="tool-card tool-card-new" data-workflow="Prepare" href="tools/social-canvas.html"><span class="tool-workflow">Prepare</span><div class="tool-icon">▣</div><h3>Social Size Guide</h3><p>Find social and messaging sizes before you design.</p><span class="tool-arrow">Open tool →</span></a><a class="tool-card tool-card-new" data-workflow="Check" href="tools/color-studio.html"><span class="tool-workflow">Check</span><div class="tool-icon">◉</div><h3>Color Studio</h3><p>Explore color values, build palettes, and generate shades and tints.</p><span class="tool-arrow">Open tool →</span></a><a class="tool-card tool-card-new" data-workflow="Check" href="tools/design-qa.html"><span class="tool-workflow">Check</span><div class="tool-icon">✓</div><h3>Design QA</h3><p>Check dimensions, ratios, formats, file sizes, and filenames before delivery.</p><span class="tool-arrow">Open tool →</span></a><a class="tool-card tool-card-new" data-workflow="Check" href="tools/screenshot-reference-board.html"><span class="tool-workflow">Check</span><div class="tool-icon">▤</div><h3>Reference Board</h3><p>Collect screenshots, add source notes, and build a visual reference board.</p><span class="tool-arrow">Open tool →</span></a>');
  var cardOrder=['tools/presentation-board.html','tools/pdf-tools.html','tools/typography-helper.html','tools/social-canvas.html','tools/color-studio.html','tools/design-qa.html','tools/screenshot-reference-board.html','tools/daily-currency.html','tools/qrcode.html','tools/converttext.html','tools/screenshot.html','tools/assembler.html'];
  Array.from(grid.querySelectorAll('.tool-card')).sort(function(a,b){return cardOrder.indexOf(a.getAttribute('href'))-cardOrder.indexOf(b.getAttribute('href'));}).forEach(function(card){grid.appendChild(card);});
  var homeStyle=document.createElement('style');homeStyle.textContent='.home{height:100vh;min-height:0;display:flex;flex-direction:column;overflow:hidden}.home-header{flex-shrink:0;padding-top:24px;padding-bottom:18px}.home-logo{width:58px;height:58px}.home-header h1{font-size:34px}.tools-wrap{width:100%;flex:1;min-height:0;overflow-y:auto}.home-footer{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-top:auto;padding:15px max(7vw,36px);border-top:1px solid #dce3e8;background:#fff;color:#8a959d;font-size:11px;text-align:left;flex-shrink:0}.home-footer p{margin:0}.home-footer .creator-link{position:relative;cursor:pointer;color:#53606b;font-weight:700;text-decoration:none}.home-footer .creator-link:hover{color:#db0011}.home-footer .creator-tooltip{position:absolute;bottom:calc(100% + 8px);left:0;transform:none;padding:6px 10px;border-radius:4px;background:#17212b;color:#fff;font-size:10px;font-weight:400;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s ease}.home-footer .creator-link:hover .creator-tooltip{opacity:1}.home-footer .social-links{display:flex;align-items:center;gap:8px}.home-footer .social-links a{display:grid;place-items:center;width:30px;height:30px;border:0;border-radius:8px;background:#f3f6f8;color:#71808c;transition:color .15s ease,background .15s ease,transform .15s ease}.home-footer .social-links a:hover{background:#fff0f1;color:#db0011;transform:translateY(-2px)}.tool-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.tool-card{position:relative;overflow:hidden;min-height:135px;padding:15px;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}.tool-card:hover{transform:translateY(-3px);border-color:#db0011;box-shadow:0 11px 22px rgba(31,48,62,.13)}.tool-card:hover .tool-icon{transform:scale(1.06);background:#ffe8ea}.tool-icon{width:34px;height:34px;margin-bottom:10px;font-size:19px;transition:transform .2s ease,background .2s ease}.tool-card h3{font-size:15px}.tool-card p{font-size:11px;line-height:1.35}.tool-arrow{padding-top:10px;font-size:11px}.tool-workflow{position:absolute;top:10px;right:12px;color:#9aa5af;font-size:8px;font-weight:700;letter-spacing:.8px;text-transform:uppercase}.tool-card:hover .tool-workflow{color:#db0011}@media(max-width:1100px){.tool-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:820px){.tool-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){.home-footer{display:block;padding:12px 20px;text-align:center}.home-footer .social-links{justify-content:center;margin-top:9px}.tool-grid{grid-template-columns:1fr}}';document.head.appendChild(homeStyle);
  document.querySelectorAll('.tool-tabs,.tool-panel:not([data-category-panel="existing"])').forEach(function(element){element.remove();});
  return;

  var style=document.createElement('style');
  style.textContent='.tools-heading{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:14px}.tools-heading h2{margin:0;font-size:26px;letter-spacing:-.5px}.tools-heading-note{margin:0;color:#71808c;font-size:12px}.tool-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:16px}.tool-tab{display:flex;flex-direction:column;align-items:flex-start;min-height:70px;padding:12px 14px;border:1px solid #dce3e8;background:#fff;color:#71808c;font:inherit;text-align:left;cursor:pointer;transition:.15s ease}.tool-tab:hover{border-color:#db0011;color:#17212b;transform:translateY(-2px)}.tool-tab.active{border-color:#db0011;background:#db0011;color:#fff;box-shadow:0 6px 14px rgba(219,0,17,.18)}.tool-tab small{margin-bottom:7px;font-size:10px;font-weight:700;letter-spacing:1px;opacity:.7}.tool-tab strong{font-size:17px;letter-spacing:-.2px}.tool-panel{display:none}.tool-panel.active{display:block}.tool-empty{min-height:160px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border:1px dashed #cfd9df;background:rgba(255,255,255,.45);color:#53606b;text-align:center}.tool-empty strong{font-size:14px}.tool-empty span{color:#71808c;font-size:12px}.tool-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.tool-card{min-height:155px;padding:18px}.tool-icon{width:40px;height:40px;margin-bottom:12px;font-size:21px}.tool-card h3{font-size:17px;margin-bottom:6px}.tool-card p{font-size:12px;line-height:1.4}.tool-arrow{padding-top:12px;font-size:12px}.home{height:100vh;min-height:0;display:flex;flex-direction:column;overflow:hidden}.home-header{padding:26px max(7vw,36px) 22px}.home-logo{width:62px;height:62px}.home-header h1{font-size:34px}.home-header p{font-size:14px;margin-top:7px}.tools-wrap{width:100%;flex:1;min-height:0;overflow-y:auto;padding:28px 32px}.home-footer{flex-shrink:0;padding:18px max(7vw,36px)}@media(max-width:980px){.tool-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}.tool-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){.tools-heading{display:block}.tools-heading-note{margin-top:6px}.tool-tabs{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.tool-tab{min-height:62px;padding:10px}.tool-tab strong{font-size:14px}.tool-grid{grid-template-columns:1fr}.tools-wrap{padding:24px 20px}.home-header{padding:22px 20px 18px}.home-brand{gap:16px}.home-header h1{font-size:28px}.home-logo{width:54px;height:54px}}';
  document.head.appendChild(style);

  var heading=document.createElement('div');
  heading.className='tools-heading';
  heading.innerHTML='<div><p class="eyebrow">EPSILON TOOLKIT</p><h2>Tools</h2></div><p class="tools-heading-note">Choose a category to get started.</p>';
  var oldHeading=toolsWrap.querySelector(':scope > h2');
  if(oldHeading)oldHeading.replaceWith(heading);

  var tabs=document.createElement('nav');
  tabs.className='tool-tabs';
  tabs.setAttribute('aria-label','Tool categories');
  var categories=[
    ['create','Create','No Create tools yet.','Social Canvas and Presentation Board will live here.'],
    ['prepare','Prepare','No Prepare tools yet.','Image Studio will live here.'],
    ['check','Check','No Check tools yet.','Color Studio and Design QA will live here.'],
    ['existing','Existing','','']
  ];
  categories.forEach(function(category){
    var tab=document.createElement('button');
    tab.className='tool-tab'+(category[0]==='existing'?' active':'');
    tab.dataset.category=category[0];
    tab.type='button';
    tab.innerHTML='<small>0'+(categories.indexOf(category)+1)+'</small><strong>'+category[1]+'</strong>';
    tabs.appendChild(tab);
  });
  toolsWrap.insertBefore(tabs,grid);

  var panels={};
  categories.forEach(function(category){
    var panel=document.createElement('div');
    panel.className='tool-panel'+(category[0]==='existing'?' active':'');
    panel.dataset.categoryPanel=category[0];
    if(category[0]==='existing')panel.appendChild(grid);
    else if(category[0]==='create')panel.innerHTML='<div class="tool-grid"><a class="tool-card" href="tools/presentation-board.html"><div class="tool-icon">▤</div><h3>Presentation Board</h3><p>Arrange visuals into a clean board for review, presentation, or delivery.</p><span class="tool-arrow">Open tool →</span></a></div>';
    else if(category[0]==='prepare')panel.innerHTML='<div class="tool-grid"><a class="tool-card" href="tools/pdf-tools.html"><div class="tool-icon">▤</div><h3>PDF Tools</h3><p>Merge and optimize PDF files without rasterizing their pages.</p><span class="tool-arrow">Open tool →</span></a><a class="tool-card" href="tools/typography-helper.html"><div class="tool-icon">Tt</div><h3>Typography Helper</h3><p>Build a practical type scale, preview hierarchy, and copy CSS.</p><span class="tool-arrow">Open tool →</span></a><a class="tool-card" href="tools/social-canvas.html"><div class="tool-icon">▣</div><h3>Social Size Guide</h3><p>Find social and messaging sizes before you design.</p><span class="tool-arrow">Open tool →</span></a></div>';
    else if(category[0]==='check')panel.innerHTML='<div class="tool-grid"><a class="tool-card" href="tools/color-studio.html"><div class="tool-icon">◉</div><h3>Color Studio</h3><p>Explore color values, build palettes, and generate shades and tints.</p><span class="tool-arrow">Open tool →</span></a><a class="tool-card" href="tools/design-qa.html"><div class="tool-icon">✓</div><h3>Design QA</h3><p>Check dimensions, ratios, formats, file sizes, and filenames before delivery.</p><span class="tool-arrow">Open tool →</span></a><a class="tool-card" href="tools/screenshot-reference-board.html"><div class="tool-icon">▤</div><h3>Reference Board</h3><p>Collect screenshots, add source notes, and build a visual reference board.</p><span class="tool-arrow">Open tool →</span></a></div>';
    else panel.innerHTML='<div class="tool-empty"><strong>'+category[2]+'</strong><span>'+category[3]+'</span></div>';
    toolsWrap.appendChild(panel);
    panels[category[0]]=panel;
  });

  tabs.querySelectorAll('.tool-tab').forEach(function(tab){
    tab.addEventListener('click',function(){
      var category=tab.dataset.category;
      tabs.querySelectorAll('.tool-tab').forEach(function(item){item.classList.toggle('active',item===tab);});
      Object.keys(panels).forEach(function(key){panels[key].classList.toggle('active',key===category);});
    });
  });
}());
