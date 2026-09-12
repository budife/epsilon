(function(){
  'use strict';
  var picker=document.getElementById('color-picker');
  var hexInput=document.getElementById('hex-input');
  var palette=[];
  function clamp(value){return Math.max(0,Math.min(255,Math.round(value)));}
  function hexToRgb(hex){var value=hex.replace('#','');if(value.length===3)value=value.split('').map(function(c){return c+c;}).join('');var number=parseInt(value,16);return{r:number>>16&255,g:number>>8&255,b:number&255};}
  function rgbToHex(rgb){return '#'+[rgb.r,rgb.g,rgb.b].map(function(v){return clamp(v).toString(16).padStart(2,'0');}).join('').toUpperCase();}
  function rgbToHsl(rgb){var r=rgb.r/255,g=rgb.g/255,b=rgb.b/255,max=Math.max(r,g,b),min=Math.min(r,g,b),h=0,s=0,l=(max+min)/2,d=max-min;if(d){s=l>.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}h/=6;}return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};}
  function hslToRgb(h,s,l){h/=360;s/=100;l/=100;if(!s)return{r:l*255,g:l*255,b:l*255};var q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,convert=function(t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};return{r:convert(h+1/3)*255,g:convert(h)*255,b:convert(h-1/3)*255};}
  function setColor(hex){if(!/^#[0-9a-f]{6}$/i.test(hex))return;var rgb=hexToRgb(hex),hsl=rgbToHsl(rgb);picker.value=hex.toLowerCase();hexInput.value=hex.toUpperCase();document.getElementById('rgb-value').textContent=rgb.r+', '+rgb.g+', '+rgb.b;document.getElementById('hsl-value').textContent=hsl.h+'°, '+hsl.s+'%, '+hsl.l+'%';document.getElementById('base-label').textContent=hex.toUpperCase();renderShades(rgb);}
  function renderShades(rgb){var list=document.getElementById('shade-list'),items=[];for(var i=0;i<=10;i+=1){var lightness=i*10;var color=rgbToHex(hslToRgb(rgbToHsl(rgb).h,rgbToHsl(rgb).s,lightness));items.push('<button class="shade-swatch" style="background:'+color+'" data-color="'+color+'"><span>'+color+'</span></button>');}list.innerHTML=items.join('');list.querySelectorAll('[data-color]').forEach(function(button){button.addEventListener('click',function(){copyValue(button.dataset.color);});});}
  function renderPalette(){var container=document.getElementById('palette');container.innerHTML=palette.length?palette.map(function(color){return '<button class="palette-chip" style="background:'+color+'" data-color="'+color+'"><span>'+color+'</span></button>';}).join(''):'<div class="palette-empty">Add colors from the picker.</div>';container.querySelectorAll('[data-color]').forEach(function(button){button.addEventListener('click',function(){copyValue(button.dataset.color);});});}
  function copyValue(value){navigator.clipboard&&navigator.clipboard.writeText(value);document.getElementById('copy-status').textContent=value+' copied to clipboard.';}
  picker.addEventListener('input',function(){setColor(picker.value);});
  hexInput.addEventListener('change',function(){setColor(hexInput.value.trim());});
  document.getElementById('add-color').addEventListener('click',function(){if(!palette.includes(picker.value.toUpperCase()))palette.push(picker.value.toUpperCase());renderPalette();});
  document.querySelectorAll('[data-copy]').forEach(function(button){button.addEventListener('click',function(){copyValue(button.textContent);});});
  document.getElementById('copy-css').addEventListener('click',function(){var css=palette.map(function(color,index){return'--color-'+(index+1)+': '+color+';';}).join('\n');copyValue(css||'Add colors first.');});
  setColor(picker.value);
}());
