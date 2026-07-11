/* AT CYBERSPORT — ui.js: рендер карточек (общий для всех страниц) */
(function(){
'use strict';
function ready(fn){ if(window.AT) fn(); else document.addEventListener('DOMContentLoaded',fn); }

var AT = window.AT;
var esc = AT.esc, money = AT.money, t = AT.t, catById = AT.catById, catName = AT.catName, firstImg = AT.firstImg;

function imgOrPh(src, phText){
  return src ? '<img src="'+esc(src)+'" alt="">' : '<div class="ph">'+esc(phText||'ФОТО')+'</div>';
}

function popularCell(p, delay){
  var href='product.html?id='+encodeURIComponent(p.id);
  return '<a href="'+href+'" class="prod-cell" data-reveal '+(delay?'data-delay="'+delay+'"':'')+'>'+
    '<div class="pname">'+esc(p.name)+'</div>'+
    '<div class="pimg">'+imgOrPh(firstImg(p),'ФОТО')+'</div>'+
    '<div class="pfoot"><span class="price">'+money(p.price)+'</span><span class="more">'+t('more')+'</span></div>'+
  '</a>';
}

function catalogCard(p){
  var href='product.html?id='+encodeURIComponent(p.id);
  var badge = p.badge ? '<span class="badge">'+esc(p.badge)+'</span>' : '';
  return '<a href="'+href+'" class="card" data-reveal data-cat="'+esc(p.category)+'">'+
    badge+
    '<div class="cname">'+esc(p.name)+'</div>'+
    '<div class="cimg">'+imgOrPh(firstImg(p),'ФОТО')+'</div>'+
    '<div class="cfoot"><span class="cprice">'+money(p.price)+'</span><span class="cadd" data-add="'+esc(p.id)+'">'+t('addCart')+'</span></div>'+
  '</a>';
}

function relatedCard(p){
  var href='product.html?id='+encodeURIComponent(p.id);
  return '<a href="'+href+'" class="card">'+
    '<div class="cname">'+esc(p.name)+'</div>'+
    '<div class="cimg">'+imgOrPh(firstImg(p),'ФОТО')+'</div>'+
    '<div class="cfoot"><span class="cprice">'+money(p.price)+'</span></div>'+
  '</a>';
}

function categoryCell(cat, delay, sampleImg){
  return '<a href="catalog.html?cat='+encodeURIComponent(cat.id)+'" class="cat-cell" data-reveal '+(delay?'data-delay="'+delay+'"':'')+'>'+
    '<div class="code">/ '+esc(cat.code||'0-00')+' / <b>'+esc(catName(cat))+'</b></div>'+
    '<div class="cimg">'+(sampleImg?'<img src="'+esc(sampleImg)+'" alt="">':'')+'</div>'+
    '<div class="arrow">'+t('toSection')+'</div>'+
  '</a>';
}

function wireCatalogAdd(root){
  (root||document).querySelectorAll('[data-add]').forEach(function(el){
    el.addEventListener('click',function(e){
      e.preventDefault(); e.stopPropagation();
      var id=el.getAttribute('data-add');
      var p=AT.Store.products().filter(function(x){return x.id===id;})[0];
      if(p) AT.addToCart(p,1,(p.colors&&p.colors[0]&&p.colors[0].name)||'');
    });
  });
}

AT.ui = {
  popularCell:popularCell, catalogCard:catalogCard, relatedCard:relatedCard,
  categoryCell:categoryCell, wireCatalogAdd:wireCatalogAdd, imgOrPh:imgOrPh
};
})();