/* ============================================================
   AT CYBERSPORT — ui.js: рендер карточек (общий для всех страниц)
   ============================================================ */
(function(){
'use strict';
function ready(fn){ if(window.AT) fn(); else document.addEventListener('DOMContentLoaded',fn); }

var AT = window.AT;
var esc = AT.esc, money = AT.money, t = AT.t, catById = AT.catById, catName = AT.catName, firstImg = AT.firstImg;

function imgOrPh(src, phText){
  return src ? '<img src="'+esc(src)+'" alt="">' : '<div class="ph">'+esc(phText||'ФОТО')+'</div>';
}

/* карточка на главной ("популярные товары") */
function popularCell(p, delay){
  var href='product.html?id='+encodeURIComponent(p.id);
  return '<a href="'+href+'" class="prod-cell" data-reveal '+(delay?'data-delay="'+delay+'"':'')+'>'+
    '<div class="pname">'+esc(p.name)+'</div>'+
    '<div class="pimg">'+imgOrPh(firstImg(p),'ФОТО')+'</div>'+
    '<div class="pfoot"><span class="price">'+money(p.price)+'</span><span class="more">'+t('more')+'</span></div>'+
  '</a>';
}

/* карточка каталога */
function catalogCard(p){
  var href='product.html?id='+encodeURIComponent(p.id);
  var cat=catById(p.category);
  var badge = p.badge ? '<span class="badge">'+esc(p.badge)+'</span>' : '';
  return '<a href="'+href+'" class="card" data-reveal data-cat="'+esc(p.category)+'">'+
    '<div class="thumb">'+imgOrPh(firstImg(p),'ФОТО')+
      '<span class="tag">'+esc(cat?catName(cat):'')+'</span>'+badge+
    '</div>'+
    '<div class="body">'+
      '<div class="cname">'+esc(p.name)+'</div>'+
      '<div class="cspec">'+esc(p.spec||'')+'</div>'+
      '<div class="cfoot"><span class="cprice">'+money(p.price)+'</span><span class="cadd" data-add="'+esc(p.id)+'">'+t('addCart')+'</span></div>'+
    '</div>'+
  '</a>';
}

/* карточка "с этим берут" / связанные */
function relatedCard(p){
  var href='product.html?id='+encodeURIComponent(p.id);
  var cat=catById(p.category);
  return '<a href="'+href+'" class="card">'+
    '<div class="thumb" style="aspect-ratio:4/3">'+imgOrPh(firstImg(p),'ФОТО')+
      '<span class="tag">'+esc(cat?catName(cat):'')+'</span>'+
    '</div>'+
    '<div class="body" style="display:flex;justify-content:space-between;align-items:flex-end">'+
      '<div><div class="cname" style="font-size:18px">'+esc(p.name)+'</div><div class="cspec" style="font-size:12px;margin-top:4px">'+esc(p.spec||'')+'</div></div>'+
      '<span class="cprice" style="font-size:16px">'+money(p.price)+'</span>'+
    '</div>'+
  '</a>';
}

/* категория на главной */
function categoryCell(cat, delay, sampleImg){
  return '<a href="catalog.html?cat='+encodeURIComponent(cat.id)+'" class="cat-cell" data-reveal '+(delay?'data-delay="'+delay+'"':'')+'>'+
    '<div class="code">/ '+esc(cat.code||'0-00')+' / <b>'+esc(catName(cat))+'</b></div>'+
    '<div class="cimg">'+(sampleImg?'<img src="'+esc(sampleImg)+'" alt="">':'')+'</div>'+
    '<div class="arrow">'+t('toSection')+'</div>'+
  '</a>';
}

/* быстрый "в корзину" из карточки каталога (клик по пилюле) */
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
