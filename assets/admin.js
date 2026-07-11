/* AT CYBERSPORT — admin.js: логика админ-панели */
(function(){
'use strict';
var AT=window.AT, S=AT.Store, esc=AT.esc, money=AT.money;

var ADMIN_DEFAULT_PASS='atadmin';
function adminPass(){ var s=S.settings(); return s.adminPass || ADMIN_DEFAULT_PASS; }

function $(id){ return document.getElementById(id); }
function el(tag,cls,html){ var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }
function uid(pre){ return (pre||'id')+'_'+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-3); }
function slugify(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9а-яё]+/gi,'_').replace(/^_+|_+$/g,'')||uid('cat'); }

function fileToDataUrl(file, maxDim, cb){
  var reader=new FileReader();
  reader.onload=function(){
    var img=new Image();
    img.onload=function(){
      var scale=Math.min(1, maxDim/Math.max(img.width,img.height));
      var w=Math.round(img.width*scale), h=Math.round(img.height*scale);
      var c=document.createElement('canvas'); c.width=w; c.height=h;
      var ctx=c.getContext('2d'); ctx.drawImage(img,0,0,w,h);
      var out;
      try{ out=c.toDataURL('image/webp',0.85); if(out.indexOf('image/webp')<0) out=c.toDataURL('image/jpeg',0.85); }
      catch(e){ out=c.toDataURL('image/jpeg',0.85); }
      cb(out);
    };
    img.onerror=function(){ cb(null); };
    img.src=reader.result;
  };
  reader.onerror=function(){ cb(null); };
  reader.readAsDataURL(file);
}
function storageUsage(){
  var total=0;
  try{ for(var k in localStorage){ if(localStorage.hasOwnProperty(k)) total+=(localStorage[k].length+k.length); } }catch(e){}
  return total;
}

function initLogin(){
  $('loginBtn').onclick=function(){
    var pass=$('loginPass').value;
    if(pass===adminPass()){ sessionStorage.setItem('at_admin_ok','1'); showPanel(); }
    else{ $('loginErr').style.display='block'; }
  };
  $('loginPass').addEventListener('keydown',function(e){ if(e.key==='Enter') $('loginBtn').click(); });
}
function showPanel(){
  $('loginScreen').style.display='none';
  $('adminPanel').style.display='block';
  buildTabs();
  renderProducts();
}

function buildTabs(){
  var tabs=[['products','Товары'],['categories','Категории'],['drivers','Драйвера'],['orders','Заказы'],['settings','Настройки']];
  var nav=$('tabNav');
  nav.innerHTML=tabs.map(function(t,i){ return '<button class="tab'+(i===0?' on':'')+'" data-tab="'+t[0]+'">'+t[1]+'</button>'; }).join('');
  nav.querySelectorAll('[data-tab]').forEach(function(b){
    b.onclick=function(){
      nav.querySelectorAll('.tab').forEach(function(x){x.classList.remove('on');});
      b.classList.add('on');
      var tab=b.getAttribute('data-tab');
      document.querySelectorAll('.tab-panel').forEach(function(p){p.style.display='none';});
      $('panel-'+tab).style.display='block';
      if(tab==='products') renderProducts();
      if(tab==='categories') renderCategories();
      if(tab==='drivers') renderDrivers();
      if(tab==='orders') renderOrders();
      if(tab==='settings') renderSettings();
    };
  });
}

function renderProducts(){
  var products=S.products(), cats=S.categories();
  var list=$('productsList');
  if(!products.length){ list.innerHTML='<div class="a-empty">Товаров нет. Нажмите «Добавить товар».</div>'; return; }
  list.innerHTML=products.map(function(p){
    var cat=cats.filter(function(c){return c.id===p.category;})[0];
    var img=AT.firstImg(p);
    return '<div class="a-row">'+
      '<div class="a-thumb">'+(img?'<img src="'+esc(img)+'">':'<span>—</span>')+'</div>'+
      '<div class="a-info"><div class="a-name">'+esc(p.name)+(p.badge?' <em>'+esc(p.badge)+'</em>':'')+'</div>'+
        '<div class="a-sub">'+esc(cat?AT.catName(cat):'—')+' · '+money(p.price)+(p.oldPrice?' <s>'+money(p.oldPrice)+'</s>':'')+'</div></div>'+
      '<div class="a-actions"><button class="a-btn" data-edit="'+esc(p.id)+'">Изменить</button><button class="a-btn danger" data-del="'+esc(p.id)+'">Удалить</button></div>'+
    '</div>';
  }).join('');
  list.querySelectorAll('[data-edit]').forEach(function(b){ b.onclick=function(){ openProductEditor(b.getAttribute('data-edit')); }; });
  list.querySelectorAll('[data-del]').forEach(function(b){ b.onclick=function(){
    if(!confirm('Удалить товар?')) return;
    var arr=S.products().filter(function(x){return x.id!==b.getAttribute('data-del');});
    S.saveProducts(arr); renderProducts();
  }; });
}

var editing=null;

function openProductEditor(id){
  var cats=S.categories();
  if(id){ editing=JSON.parse(JSON.stringify(S.products().filter(function(x){return x.id===id;})[0])); }
  else{ editing={ id:uid('p'), name:'', category:cats[0]?cats[0].id:'', price:0, oldPrice:0, badge:'', ref:'', inStock:true, spec:'', description:'', colors:[], quick:[], specs:[], inBox:[], images:[] }; }

  var catOpts=cats.map(function(c){ return '<option value="'+esc(c.id)+'"'+(c.id===editing.category?' selected':'')+'>'+esc(AT.catName(c))+'</option>'; }).join('');

  $('editorTitle').textContent=id?'Изменить товар':'Новый товар';
  $('editorBody').innerHTML=
    fieldText('Название','ed_name',editing.name)+
    '<div class="a-grid2">'+
      '<div class="a-field"><label>Категория</label><select id="ed_category">'+catOpts+'</select></div>'+
      fieldText('Артикул (REF)','ed_ref',editing.ref)+
    '</div>'+
    '<div class="a-grid2">'+
      fieldNum('Цена ('+S.settings().currency+')','ed_price',editing.price)+
      fieldNum('Старая цена (0 если нет)','ed_oldPrice',editing.oldPrice)+
    '</div>'+
    '<div class="a-grid2">'+
      fieldText('Бейдж (NEW / флагман / пусто)','ed_badge',editing.badge)+
      fieldText('Короткая строка характеристик','ed_spec',editing.spec)+
    '</div>'+
    '<div class="a-field"><label><input type="checkbox" id="ed_inStock" '+(editing.inStock?'checked':'')+'> В наличии</label></div>'+
    '<div class="a-field"><label>Описание</label><textarea id="ed_description" rows="3">'+esc(editing.description)+'</textarea></div>'+

    '<div class="a-sep">Фотографии</div>'+
    '<div class="a-hint">Первая фотография — главная. Можно загрузить несколько (до 4 показываются как миниатюры).</div>'+
    '<div id="ed_images" class="a-images"></div>'+
    '<label class="a-upload">+ Загрузить фото<input type="file" id="ed_imgInput" accept="image/*" multiple hidden></label>'+

    '<div class="a-sep">Цвета</div>'+
    '<div id="ed_colors"></div>'+
    '<button class="a-btn" id="ed_addColor">+ Цвет</button>'+

    '<div class="a-sep">Быстрые характеристики (плитки 2×2, до 4)</div>'+
    '<div class="a-hint">Значение + подпись. Например: «54 г» / «вес».</div>'+
    '<div id="ed_quick"></div>'+
    '<button class="a-btn" id="ed_addQuick">+ Плитка</button>'+

    '<div class="a-sep">Полная спецификация</div>'+
    '<div class="a-hint">Параметр + значение. Например: «Сенсор» / «AT-VISION 42K».</div>'+
    '<div id="ed_specs"></div>'+
    '<button class="a-btn" id="ed_addSpec">+ Строка</button>'+

    '<div class="a-sep">В коробке</div>'+
    '<div id="ed_inbox"></div>'+
    '<button class="a-btn" id="ed_addBox">+ Позиция</button>';

  renderColors(); renderQuick(); renderSpecs(); renderInbox(); renderEditorImages();

  $('ed_addColor').onclick=function(){ editing.colors.push({name:'',hex:'#141417'}); renderColors(); };
  $('ed_addQuick').onclick=function(){ if(editing.quick.length<4){ editing.quick.push(['','']); renderQuick(); } };
  $('ed_addSpec').onclick=function(){ editing.specs.push(['','']); renderSpecs(); };
  $('ed_addBox').onclick=function(){ editing.inBox.push(''); renderInbox(); };
  $('ed_imgInput').onchange=function(e){
    var files=Array.prototype.slice.call(e.target.files);
    var i=0;
    (function next(){
      if(i>=files.length){ e.target.value=''; return; }
      fileToDataUrl(files[i],1000,function(url){ if(url) editing.images.push(url); i++; renderEditorImages(); next(); });
    })();
  };
  $('editorModal').classList.add('open');
}

function fieldText(label,id,val){ return '<div class="a-field"><label>'+label+'</label><input type="text" id="'+id+'" value="'+esc(val||'')+'"></div>'; }
function fieldNum(label,id,val){ return '<div class="a-field"><label>'+label+'</label><input type="number" id="'+id+'" value="'+(val||0)+'"></div>'; }

function renderEditorImages(){
  var box=$('ed_images'); if(!box) return;
  box.innerHTML=editing.images.map(function(src,i){
    return '<div class="a-img"><img src="'+esc(src)+'">'+(i===0?'<span class="main">гл.</span>':'')+
      '<div class="a-img-actions">'+(i>0?'<button data-imgup="'+i+'">↑</button>':'')+'<button data-imgdel="'+i+'">✕</button></div></div>';
  }).join('')||'<div class="a-hint">Фото пока нет.</div>';
  box.querySelectorAll('[data-imgdel]').forEach(function(b){ b.onclick=function(){ editing.images.splice(+b.getAttribute('data-imgdel'),1); renderEditorImages(); }; });
  box.querySelectorAll('[data-imgup]').forEach(function(b){ b.onclick=function(){ var i=+b.getAttribute('data-imgup'); var tmp=editing.images[i-1]; editing.images[i-1]=editing.images[i]; editing.images[i]=tmp; renderEditorImages(); }; });
}
function renderColors(){
  var box=$('ed_colors');
  box.innerHTML=editing.colors.map(function(c,i){
    return '<div class="a-repeat"><input type="color" data-cx="'+i+'" value="'+esc(c.hex||'#141417')+'"><input type="text" placeholder="название цвета" data-cn="'+i+'" value="'+esc(c.name)+'"><button data-crm="'+i+'">✕</button></div>';
  }).join('');
  box.querySelectorAll('[data-cn]').forEach(function(inp){ inp.oninput=function(){ editing.colors[+inp.getAttribute('data-cn')].name=inp.value; }; });
  box.querySelectorAll('[data-cx]').forEach(function(inp){ inp.oninput=function(){ editing.colors[+inp.getAttribute('data-cx')].hex=inp.value; }; });
  box.querySelectorAll('[data-crm]').forEach(function(b){ b.onclick=function(){ editing.colors.splice(+b.getAttribute('data-crm'),1); renderColors(); }; });
}
function renderQuick(){
  var box=$('ed_quick');
  box.innerHTML=editing.quick.map(function(q,i){
    return '<div class="a-repeat"><input type="text" placeholder="значение" data-qv="'+i+'" value="'+esc(q[0])+'"><input type="text" placeholder="подпись" data-ql="'+i+'" value="'+esc(q[1])+'"><button data-qrm="'+i+'">✕</button></div>';
  }).join('');
  box.querySelectorAll('[data-qv]').forEach(function(inp){ inp.oninput=function(){ editing.quick[+inp.getAttribute('data-qv')][0]=inp.value; }; });
  box.querySelectorAll('[data-ql]').forEach(function(inp){ inp.oninput=function(){ editing.quick[+inp.getAttribute('data-ql')][1]=inp.value; }; });
  box.querySelectorAll('[data-qrm]').forEach(function(b){ b.onclick=function(){ editing.quick.splice(+b.getAttribute('data-qrm'),1); renderQuick(); }; });
}
function renderSpecs(){
  var box=$('ed_specs');
  box.innerHTML=editing.specs.map(function(s,i){
    return '<div class="a-repeat"><input type="text" placeholder="параметр" data-sk="'+i+'" value="'+esc(s[0])+'"><input type="text" placeholder="значение" data-sv="'+i+'" value="'+esc(s[1])+'"><button data-srm="'+i+'">✕</button></div>';
  }).join('');
  box.querySelectorAll('[data-sk]').forEach(function(inp){ inp.oninput=function(){ editing.specs[+inp.getAttribute('data-sk')][0]=inp.value; }; });
  box.querySelectorAll('[data-sv]').forEach(function(inp){ inp.oninput=function(){ editing.specs[+inp.getAttribute('data-sv')][1]=inp.value; }; });
  box.querySelectorAll('[data-srm]').forEach(function(b){ b.onclick=function(){ editing.specs.splice(+b.getAttribute('data-srm'),1); renderSpecs(); }; });
}
function renderInbox(){
  var box=$('ed_inbox');
  box.innerHTML=editing.inBox.map(function(x,i){
    return '<div class="a-repeat"><input type="text" placeholder="позиция комплектации" data-bx="'+i+'" value="'+esc(x)+'"><button data-brm="'+i+'">✕</button></div>';
  }).join('');
  box.querySelectorAll('[data-bx]').forEach(function(inp){ inp.oninput=function(){ editing.inBox[+inp.getAttribute('data-bx')]=inp.value; }; });
  box.querySelectorAll('[data-brm]').forEach(function(b){ b.onclick=function(){ editing.inBox.splice(+b.getAttribute('data-brm'),1); renderInbox(); }; });
}

function saveProduct(){
  editing.name=$('ed_name').value.trim();
  if(!editing.name){ alert('Введите название товара'); return; }
  editing.category=$('ed_category').value;
  editing.ref=$('ed_ref').value.trim();
  editing.price=Math.max(0,+$('ed_price').value||0);
  editing.oldPrice=Math.max(0,+$('ed_oldPrice').value||0);
  editing.badge=$('ed_badge').value.trim();
  editing.spec=$('ed_spec').value.trim();
  editing.inStock=$('ed_inStock').checked;
  editing.description=$('ed_description').value.trim();

  editing.colors=editing.colors.filter(function(c){return c.name;});
  editing.quick=editing.quick.filter(function(q){return q[0]||q[1];});
  editing.specs=editing.specs.filter(function(s){return s[0]||s[1];});
  editing.inBox=editing.inBox.filter(function(x){return x;});

  var products=S.products();
  var idx=-1; products.forEach(function(p,i){ if(p.id===editing.id) idx=i; });
  if(idx>=0) products[idx]=editing; else products.push(editing);
  try{
    S.saveProducts(products);
  }catch(e){ alert('Не удалось сохранить — возможно, переполнено хранилище браузера из-за больших фото. Уменьшите количество/размер изображений.'); return; }
  closeEditor(); renderProducts();
}
function closeEditor(){ $('editorModal').classList.remove('open'); editing=null; }

function renderCategories(){
  var cats=S.categories();
  var list=$('categoriesList');
  list.innerHTML=cats.map(function(c){
    return '<div class="a-row">'+
      '<div class="a-info"><div class="a-name">'+esc(c.name.ru)+' <em>/ '+esc(c.code||'')+' /</em></div>'+
      '<div class="a-sub">id: '+esc(c.id)+' · tk: '+esc(c.name.tk||'—')+' · en: '+esc(c.name.en||'—')+'</div></div>'+
      '<div class="a-actions"><button class="a-btn" data-cedit="'+esc(c.id)+'">Изменить</button><button class="a-btn danger" data-cdel="'+esc(c.id)+'">Удалить</button></div>'+
    '</div>';
  }).join('')||'<div class="a-empty">Категорий нет.</div>';
  list.querySelectorAll('[data-cedit]').forEach(function(b){ b.onclick=function(){ openCatEditor(b.getAttribute('data-cedit')); }; });
  list.querySelectorAll('[data-cdel]').forEach(function(b){ b.onclick=function(){
    var id=b.getAttribute('data-cdel');
    var used=S.products().some(function(p){return p.category===id;});
    if(used && !confirm('В этой категории есть товары. Они останутся без категории. Удалить?')) return;
    else if(!used && !confirm('Удалить категорию?')) return;
    S.saveCategories(S.categories().filter(function(c){return c.id!==id;})); renderCategories();
  }; });
}
var editingCat=null;
function openCatEditor(id){
  if(id) editingCat=JSON.parse(JSON.stringify(S.categories().filter(function(c){return c.id===id;})[0]));
  else editingCat={ id:'', code:'', name:{ru:'',tk:'',en:''} };
  $('catEditorTitle').textContent=id?'Изменить категорию':'Новая категория';
  $('catEditorBody').innerHTML=
    fieldText('Название (русский)','ced_ru',editingCat.name.ru)+
    fieldText('Название (türkmençe)','ced_tk',editingCat.name.tk)+
    fieldText('Название (english)','ced_en',editingCat.name.en)+
    fieldText('Код (напр. 0-05)','ced_code',editingCat.code)+
    (id?'':'<div class="a-hint">ID создастся автоматически из русского названия.</div>');
  $('catEditorModal').classList.add('open');
}
function saveCat(){
  var ru=$('ced_ru').value.trim();
  if(!ru){ alert('Введите название'); return; }
  editingCat.name={ru:ru, tk:$('ced_tk').value.trim()||ru, en:$('ced_en').value.trim()||ru};
  editingCat.code=$('ced_code').value.trim();
  if(!editingCat.id) editingCat.id=slugify(ru);
  var cats=S.categories();
  var idx=-1; cats.forEach(function(c,i){ if(c.id===editingCat.id) idx=i; });
  if(idx>=0) cats[idx]=editingCat; else cats.push(editingCat);
  S.saveCategories(cats);
  $('catEditorModal').classList.remove('open'); editingCat=null; renderCategories();
}

function renderDrivers(){
  var list=$('driversList');
  var drivers=S.drivers();
  if(!drivers.length){ list.innerHTML='<div class="a-empty">Драйверов нет. Нажмите «Добавить драйвер».</div>'; return; }
  list.innerHTML=drivers.map(function(d){
    var has = d.url ? 'ссылка' : (d.file ? 'файл в базе' : '<span style="color:#ff6b6b">нет файла</span>');
    return '<div class="a-row">'+
      '<div class="a-info"><div class="a-name">'+esc(d.name)+' <em>v'+esc(d.version||'—')+'</em></div>'+
        '<div class="a-sub">'+esc(d.device||'—')+' · '+esc(d.os||'—')+(d.size?' · '+esc(d.size):'')+' · '+has+'</div></div>'+
      '<div class="a-actions"><button class="a-btn" data-dedit="'+esc(d.id)+'">Изменить</button><button class="a-btn danger" data-ddel="'+esc(d.id)+'">Удалить</button></div>'+
    '</div>';
  }).join('');
  list.querySelectorAll('[data-dedit]').forEach(function(b){ b.onclick=function(){ openDriverEditor(b.getAttribute('data-dedit')); }; });
  list.querySelectorAll('[data-ddel]').forEach(function(b){ b.onclick=function(){
    if(!confirm('Удалить драйвер?')) return;
    S.saveDrivers(S.drivers().filter(function(x){return x.id!==b.getAttribute('data-ddel');})); renderDrivers();
  }; });
}
var editingDrv=null;
function openDriverEditor(id){
  if(id) editingDrv=JSON.parse(JSON.stringify(S.drivers().filter(function(x){return x.id===id;})[0]));
  else editingDrv={ id:uid('d'), name:'', device:'', version:'', os:'Windows 10/11', size:'', url:'', file:'', fileName:'', updated:new Date().toISOString().slice(0,10), note:'' };
  $('drvEditorTitle').textContent=id?'Изменить драйвер':'Новый драйвер';
  $('drvEditorBody').innerHTML=
    fieldText('Название','drv_name',editingDrv.name)+
    '<div class="a-grid2">'+
      fieldText('Для устройства','drv_device',editingDrv.device)+
      fieldText('Версия','drv_version',editingDrv.version)+
    '</div>'+
    '<div class="a-grid2">'+
      fieldText('Система (ОС)','drv_os',editingDrv.os)+
      fieldText('Размер (напр. 48 МБ)','drv_size',editingDrv.size)+
    '</div>'+
    fieldText('Дата обновления','drv_updated',editingDrv.updated)+
    '<div class="a-field"><label>Примечание</label><textarea id="drv_note" rows="2">'+esc(editingDrv.note||'')+'</textarea></div>'+
    '<div class="a-sep">Файл драйвера</div>'+
    '<div class="a-hint">Рекомендуется: залейте файл на хостинг/облако и вставьте <b>прямую ссылку</b> на скачивание (не переполняет базу). Либо загрузите небольшой файл прямо сюда (до ~4 МБ — из-за лимита браузера).</div>'+
    fieldText('Ссылка на скачивание (URL)','drv_url',editingDrv.url)+
    '<div id="drv_fileState" class="a-hint"></div>'+
    '<label class="a-upload">Загрузить файл в базу<input type="file" id="drv_fileInput" hidden></label> '+
    '<button class="a-btn" id="drv_fileClear">Убрать загруженный файл</button>';
  updateDrvFileState();
  $('drv_fileInput').onchange=function(e){
    var f=e.target.files[0]; if(!f) return;
    if(f.size>4*1024*1024){ alert('Файл больше 4 МБ — используйте ссылку на скачивание вместо загрузки в базу.'); e.target.value=''; return; }
    var r=new FileReader();
    r.onload=function(){ editingDrv.file=r.result; editingDrv.fileName=f.name; if(!editingDrv.size) editingDrv.size=Math.round(f.size/1024/1024*10)/10+' МБ'; updateDrvFileState(); };
    r.readAsDataURL(f); e.target.value='';
  };
  $('drv_fileClear').onclick=function(){ editingDrv.file=''; editingDrv.fileName=''; updateDrvFileState(); };
  $('drvEditorModal').classList.add('open');
}
function updateDrvFileState(){
  var el=$('drv_fileState'); if(!el) return;
  el.innerHTML = editingDrv.file ? ('Загружен файл в базу: <b>'+esc(editingDrv.fileName||'файл')+'</b>') : 'Файл в базу не загружен.';
}
function saveDriver(){
  editingDrv.name=$('drv_name').value.trim();
  if(!editingDrv.name){ alert('Введите название драйвера'); return; }
  editingDrv.device=$('drv_device').value.trim();
  editingDrv.version=$('drv_version').value.trim();
  editingDrv.os=$('drv_os').value.trim();
  editingDrv.size=$('drv_size').value.trim();
  editingDrv.updated=$('drv_updated').value.trim();
  editingDrv.note=$('drv_note').value.trim();
  editingDrv.url=$('drv_url').value.trim();
  var drivers=S.drivers();
  var idx=-1; drivers.forEach(function(d,i){ if(d.id===editingDrv.id) idx=i; });
  if(idx>=0) drivers[idx]=editingDrv; else drivers.push(editingDrv);
  try{ S.saveDrivers(drivers); }
  catch(e){ alert('Не удалось сохранить — возможно, файл слишком большой для базы браузера. Используйте ссылку на скачивание.'); return; }
  $('drvEditorModal').classList.remove('open'); editingDrv=null; renderDrivers();
}

function renderOrders(){
  var orders=S.orders();
  var list=$('ordersList');
  if(!orders.length){ list.innerHTML='<div class="a-empty">Заказов пока нет. Они появляются здесь, когда клиент оформляет заказ на сайте.</div>'; return; }
  list.innerHTML=orders.map(function(o){
    var items=o.items.map(function(i){return esc(i.name)+(i.color?' ('+esc(i.color)+')':'')+' ×'+i.qty;}).join(', ');
    var d=new Date(o.date);
    var dstr=d.toLocaleString('ru-RU');
    return '<div class="a-order'+(o.status==='done'?' done':'')+'">'+
      '<div class="a-order-head"><b>'+esc(o.name)+'</b> · <a href="tel:'+esc(o.phone.replace(/\s/g,''))+'">'+esc(o.phone)+'</a>'+
        '<span class="a-order-total">'+money(o.total)+'</span></div>'+
      '<div class="a-order-sub">'+dstr+(o.email?' · '+esc(o.email):'')+(o.status==='done'?' · выполнен':'')+'</div>'+
      '<div class="a-order-items">'+items+'</div>'+
      (o.comment?'<div class="a-order-comment">💬 '+esc(o.comment)+'</div>':'')+
      '<div class="a-actions">'+
        '<button class="a-btn" data-odone="'+esc(o.id)+'">'+(o.status==='done'?'Вернуть в новые':'Отметить выполненным')+'</button>'+
        '<button class="a-btn danger" data-odel="'+esc(o.id)+'">Удалить</button></div>'+
    '</div>';
  }).join('');
  list.querySelectorAll('[data-odone]').forEach(function(b){ b.onclick=function(){
    var arr=S.orders().map(function(o){ if(o.id===b.getAttribute('data-odone')) o.status=(o.status==='done'?'new':'done'); return o; });
    S.saveOrders(arr); renderOrders();
  }; });
  list.querySelectorAll('[data-odel]').forEach(function(b){ b.onclick=function(){
    if(!confirm('Удалить заказ?')) return;
    S.saveOrders(S.orders().filter(function(o){return o.id!==b.getAttribute('data-odel');})); renderOrders();
  }; });
}

function renderSettings(){
  var s=S.settings();
  $('panel-settings').querySelector('.settings-form').innerHTML=
    '<div class="a-sep">Контакты и магазин</div>'+
    '<div class="a-grid2">'+
      fieldText('Валюта (напр. TMT)','set_currency',s.currency)+
      fieldText('Город','set_city',s.city)+
    '</div>'+
    fieldText('Телефон (виден на сайте)','set_phone',s.phone)+
    '<div class="a-grid2">'+
      fieldText('WhatsApp (номер, напр. 99365000000)','set_whatsapp',s.whatsapp)+
      fieldText('Telegram (username без @ или номер)','set_telegram',s.telegram)+
    '</div>'+
    '<div class="a-hint">Заказы из формы уходят вам в WhatsApp/Telegram по этим контактам. Заполните хотя бы один.</div>'+
    fieldNum('Порог бесплатной доставки','set_freeShipping',s.freeShipping)+

    '<div class="a-sep">Баннер (первый экран)</div>'+
    '<div class="a-hint">Отдельное фото для большого баннера на главной (независимо от фото товаров). Если не загружать — баннер покажет первое фото товара p1. Лучше широкая картинка, тёмная слева под текст.</div>'+
    '<div id="set_heroPreview" class="a-logo-preview" style="width:200px;height:100px"></div>'+
    '<label class="a-upload">Загрузить фото баннера<input type="file" id="set_heroInput" accept="image/*" hidden></label> '+
    '<button class="a-btn" id="set_heroReset">Убрать фото баннера</button>'+
    fieldText('Большой заголовок','set_heroTitle',s.heroTitle)+
    fieldText('Подзаголовок (строка с разрядкой)','set_heroTagline',s.heroTagline)+
    fieldText('Мелкий текст (можно оставить пустым)','set_heroDesc',s.heroDesc)+

    '<div class="a-sep">Логотип</div>'+
    '<div class="a-hint">По умолчанию — конь AT. Можно загрузить свой (PNG с прозрачным фоном, белый вариант).</div>'+
    '<div id="set_logoPreview" class="a-logo-preview"></div>'+
    '<label class="a-upload">Загрузить логотип<input type="file" id="set_logoInput" accept="image/*" hidden></label> '+
    '<button class="a-btn" id="set_logoReset">Сбросить логотип</button>'+

    '<div class="a-sep">Пароль админ-панели</div>'+
    fieldText('Пароль','set_adminPass',adminPass())+
    '<div class="a-hint">Обязательно смените пароль по умолчанию.</div>'+

    '<div class="a-sep">Публикация каталога</div>'+
    '<div class="a-hint">Изменения товаров видны только в вашем браузере, пока вы их не <b>опубликуете</b>. Нажмите «Опубликовать» — скачается файл <b>catalog.json</b>. Загрузите его на хостинг в папку <b>data/</b> (заменив старый) — и обновления увидят все покупатели. «Импорт» восстанавливает каталог из такого файла на другом устройстве.</div>'+
    '<div class="a-btnrow">'+
      '<button class="a-btn primary" id="set_export">Опубликовать каталог (catalog.json)</button>'+
      '<label class="a-btn" style="cursor:pointer">Импорт из файла<input type="file" id="set_import" accept="application/json,.json" hidden></label>'+
      '<button class="a-btn danger" id="set_reset">Сбросить к демо-данным</button>'+
    '</div>'+
    '<div class="a-hint" id="set_usage"></div>'+

    '<div class="a-btnrow" style="margin-top:20px"><button class="a-btn primary" id="set_save">Сохранить настройки</button><span id="set_saved" class="a-saved">Сохранено ✓</span></div>';

  renderLogoPreview();
  renderHeroPreview();
  var usedKB=Math.round(storageUsage()/1024);
  $('set_usage').textContent='Занято в браузере: ~'+usedKB+' КБ из ~5000 КБ. Если приближается к лимиту — уменьшайте размер фото.';

  $('set_logoInput').onchange=function(e){
    var f=e.target.files[0]; if(!f) return;
    fileToDataUrl(f,300,function(url){ if(url){ var st=S.settings(); st.logo=url; S.saveSettings(st); renderLogoPreview(); } e.target.value=''; });
  };
  $('set_logoReset').onclick=function(){ var st=S.settings(); st.logo=''; S.saveSettings(st); renderLogoPreview(); };
  $('set_heroInput').onchange=function(e){
    var f=e.target.files[0]; if(!f) return;
    fileToDataUrl(f,1600,function(url){ if(url){ var st=S.settings(); st.heroImage=url; S.saveSettings(st); renderHeroPreview(); } e.target.value=''; });
  };
  $('set_heroReset').onclick=function(){ var st=S.settings(); st.heroImage=''; S.saveSettings(st); renderHeroPreview(); };
  $('set_export').onclick=exportData;
  $('set_import').onchange=importData;
  
  $('set_reset').onclick=function(){ if(confirm('Сбросить все товары, категории и настройки к демонстрационным? Действие необратимо.')){ S.reset(); alert('Сброшено. Страница перезагрузится.'); location.reload(); } };
  $('set_save').onclick=saveSettings;
}
function renderLogoPreview(){
  var s=S.settings(); var box=$('set_logoPreview'); if(!box) return;
  box.innerHTML='<img src="'+esc(s.logo||'assets/logo.png')+'" alt="logo">';
}
function renderHeroPreview(){
  var s=S.settings(); var box=$('set_heroPreview'); if(!box) return;
  box.innerHTML = s.heroImage ? '<img src="'+esc(s.heroImage)+'" alt="banner">' : '<span style="font-family:var(--mono);font-size:10px;color:var(--dim)">нет фото</span>';
}
function saveSettings(){
  var s=S.settings();
  s.currency=$('set_currency').value.trim()||'TMT';
  s.city=$('set_city').value.trim();
  s.phone=$('set_phone').value.trim();
  s.whatsapp=$('set_whatsapp').value.trim();
  s.telegram=$('set_telegram').value.trim();
  s.freeShipping=+$('set_freeShipping').value||0;
  s.heroTitle=$('set_heroTitle').value;
  s.heroTagline=$('set_heroTagline').value;
  s.heroDesc=$('set_heroDesc').value;
  s.adminPass=$('set_adminPass').value||s.adminPass;
  S.saveSettings(s);
  var saved=$('set_saved'); saved.style.opacity='1'; setTimeout(function(){ saved.style.opacity='0'; },1600);
}
function exportData(){
  var s=Object.assign({}, S.settings()); delete s.adminPass;
  var data={ __at:'AT_CYBERSPORT_CATALOG', version:1, publishedAt:new Date().toISOString(),
    products:S.products(), categories:S.categories(), drivers:S.drivers(), settings:s };
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='catalog.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
function importData(e){
  var f=e.target.files[0]; if(!f) return;
  var r=new FileReader();
  r.onload=function(){
    try{
      var d=JSON.parse(r.result);
      var okTag = d.__at==='AT_CYBERSPORT_CATALOG' || d.__at==='AT_CYBERSPORT_BACKUP';
      if(!okTag && !confirm('Файл не похож на каталог AT Cybersport. Всё равно импортировать?')) { e.target.value=''; return; }
      if(d.products) S.saveProducts(d.products);
      if(d.categories) S.saveCategories(d.categories);
      if(d.drivers) S.saveDrivers(d.drivers);
      if(d.settings){ var cur=S.settings(); var ns=Object.assign({}, cur, d.settings); ns.adminPass=cur.adminPass; S.saveSettings(ns); }
      alert('Импортировано. Страница перезагрузится.');
      location.reload();
    }catch(err){ alert('Не удалось прочитать файл: '+err.message); }
    e.target.value='';
  };
  r.readAsText(f);
}

function init(){
  AT.ready(function(){
    if(sessionStorage.getItem('at_admin_ok')==='1'){ showPanel(); }
    else{ initLogin(); }
  });

  $('editorSave').onclick=saveProduct;
  $('editorCancel').onclick=closeEditor;
  $('editorModal').addEventListener('click',function(e){ if(e.target.id==='editorModal') closeEditor(); });
  $('addProductBtn').onclick=function(){ openProductEditor(null); };
  $('addDriverBtn').onclick=function(){ openDriverEditor(null); };
  $('drvSave').onclick=saveDriver;
  $('drvCancel').onclick=function(){ $('drvEditorModal').classList.remove('open'); editingDrv=null; };
  $('drvEditorModal').addEventListener('click',function(e){ if(e.target.id==='drvEditorModal'){ $('drvEditorModal').classList.remove('open'); editingDrv=null; } });
  $('catSave').onclick=saveCat;
  $('catCancel').onclick=function(){ $('catEditorModal').classList.remove('open'); editingCat=null; };
  $('addCatBtn').onclick=function(){ openCatEditor(null); };
  $('catEditorModal').addEventListener('click',function(e){ if(e.target.id==='catEditorModal'){ $('catEditorModal').classList.remove('open'); editingCat=null; } });
  $('logoutBtn').onclick=function(){ sessionStorage.removeItem('at_admin_ok'); location.reload(); };
}
if(document.readyState!=='loading') init();
else document.addEventListener('DOMContentLoaded', init);

})();