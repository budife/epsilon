function openMakerModal(){
  document.getElementById('maker-modal').classList.add('active');
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
