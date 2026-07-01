/* ============================================================
   AT CYBERSPORT — core app (store + i18n + cart + order + fx)
   Без сервера: данные в localStorage, управляются из admin.html
   ============================================================ */
(function(){
'use strict';

/* -------------------- КЛЮЧИ ХРАНИЛИЩА -------------------- */
var K = {
  products:'at_products', categories:'at_categories', settings:'at_settings',
  orders:'at_orders', cart:'at_cart', lang:'at_lang'
};

/* -------------------- ДАННЫЕ ПО УМОЛЧАНИЮ -------------------- */
var DEFAULT_CATEGORIES = [
  { id:'mice',      slug:'мыши',       code:'0-01', name:{ru:'мыши',       tk:'syçanlar',    en:'mice'} },
  { id:'keyboards', slug:'клавиатуры', code:'0-02', name:{ru:'клавиатуры', tk:'klawiaturalar',en:'keyboards'} },
  { id:'headsets',  slug:'гарнитуры',  code:'0-03', name:{ru:'гарнитуры',  tk:'nauşnikler',  en:'headsets'} },
  { id:'pads',      slug:'коврики',    code:'0-04', name:{ru:'коврики',    tk:'halyçalar',   en:'pads'} }
];

function P(o){ return o; } // хелпер читаемости
var DEFAULT_PRODUCTS = [
  { id:'p1', name:'AT Stallion Pro', category:'mice', price:12990, oldPrice:15990, badge:'флагман',
    ref:'AT-MS-01', inStock:true,
    spec:'54 г · 8000 Гц · 42K DPI',
    description:'Беспроводная мышь весом 54 грамма. Магниевый монокок, сенсор AT-VISION 42K и отклик 8 000 Гц — снаряжение для игроков, которые живут на грани реакции.',
    colors:[{name:'чёрный',hex:'#141417'},{name:'белый',hex:'#ededed'}],
    quick:[['54 г','вес'],['8000 Гц','опрос'],['42K','dpi сенсор'],['95 ч','автономность']],
    specs:[['Тип','Беспроводная игровая мышь'],['Сенсор','AT-VISION 42K · 42 000 DPI · 750 IPS'],['Частота опроса','8 000 Гц (радиоканал AT-LINK)'],['Переключатели','Оптические · ресурс 90 млн нажатий'],['Корпус','Магниевый монокок · 54 г'],['Автономность','до 95 часов · USB-C быстрая зарядка'],['Подключение','2.4 ГГц AT-LINK · USB-C проводной'],['Размеры','122 × 63 × 38 мм'],['Скольжение','100% PTFE ножки']],
    inBox:['Мышь AT Stallion Pro','Ресивер AT-LINK 8K','Кабель USB-C (paracord)','Запасной комплект ножек','Тканевый чехол'],
    images:[] },
  { id:'p2', name:'AT Mustang Air', category:'mice', price:8490, oldPrice:0, badge:'',
    ref:'AT-MS-02', inStock:true, spec:'47 г · 4000 Гц · 30K DPI',
    description:'Сверхлёгкая мышь 47 г для быстрой игры. Сотовый корпус, сенсор 30K и отклик 4 000 Гц.',
    colors:[{name:'чёрный',hex:'#141417'},{name:'белый',hex:'#ededed'}],
    quick:[['47 г','вес'],['4000 Гц','опрос'],['30K','dpi сенсор'],['80 ч','автономность']],
    specs:[['Тип','Беспроводная игровая мышь'],['Сенсор','AT-VISION 30K · 30 000 DPI'],['Частота опроса','4 000 Гц'],['Корпус','Сотовый · 47 г'],['Автономность','до 80 часов']],
    inBox:['Мышь AT Mustang Air','Ресивер AT-LINK','Кабель USB-C'], images:[] },
  { id:'p3', name:'AT Cavalry TKL', category:'keyboards', price:15490, oldPrice:0, badge:'NEW',
    ref:'AT-KB-01', inStock:true, spec:'Hall Effect · 8000 Гц · rapid trigger',
    description:'Магнитная клавиатура TKL на датчиках Холла с настраиваемым rapid trigger и опросом 8 000 Гц.',
    colors:[{name:'чёрный',hex:'#141417'},{name:'белый',hex:'#ededed'}],
    quick:[['TKL','формат'],['8000 Гц','опрос'],['0.1 мм','точка срабат.'],['PBT','колпачки']],
    specs:[['Тип','Магнитная механическая клавиатура'],['Переключатели','Hall Effect (магнитные)'],['Формат','TKL (87 клавиш)'],['Rapid trigger','Да, настраиваемый'],['Опрос','8 000 Гц'],['Колпачки','PBT double-shot']],
    inBox:['Клавиатура AT Cavalry TKL','Кабель USB-C','Съёмник колпачков'], images:[] },
  { id:'p4', name:'AT Charger 75', category:'keyboards', price:11990, oldPrice:0, badge:'',
    ref:'AT-KB-02', inStock:true, spec:'75% · газлит-плата · PBT',
    description:'Клавиатура формата 75% с газлит-конструкцией, поролоновой шумоизоляцией и колпачками PBT.',
    colors:[{name:'чёрный',hex:'#141417'}],
    quick:[['75%','формат'],['gasket','крепление'],['PBT','колпачки'],['hot-swap','плата']],
    specs:[['Тип','Механическая клавиатура'],['Формат','75%'],['Крепление','Gasket mount'],['Плата','Hot-swap'],['Колпачки','PBT']],
    inBox:['Клавиатура AT Charger 75','Кабель USB-C'], images:[] },
  { id:'p5', name:'AT Gallop', category:'headsets', price:9990, oldPrice:0, badge:'',
    ref:'AT-HS-01', inStock:true, spec:'50 мм драйверы · -42 дБ шумоподавление',
    description:'Проводная игровая гарнитура с драйверами 50 мм и активным шумоподавлением -42 дБ.',
    colors:[{name:'чёрный',hex:'#141417'}],
    quick:[['50 мм','драйверы'],['-42 дБ','шумоподав.'],['20-40к','гц'],['USB','подключение']],
    specs:[['Тип','Игровая гарнитура'],['Драйверы','50 мм'],['Шумоподавление','-42 дБ'],['Диапазон','20 Гц – 40 кГц'],['Подключение','USB / 3.5 мм']],
    inBox:['Гарнитура AT Gallop','USB-адаптер','Съёмный микрофон'], images:[] },
  { id:'p6', name:'AT Bridle Wireless', category:'headsets', price:13490, oldPrice:0, badge:'',
    ref:'AT-HS-02', inStock:true, spec:'2.4G + BT · 70 ч · LE Audio',
    description:'Беспроводная гарнитура с двойным подключением 2.4G + Bluetooth, автономностью 70 часов и LE Audio.',
    colors:[{name:'чёрный',hex:'#141417'},{name:'белый',hex:'#ededed'}],
    quick:[['70 ч','автономность'],['2.4G+BT','связь'],['LE','audio'],['50 мм','драйверы']],
    specs:[['Тип','Беспроводная гарнитура'],['Подключение','2.4 ГГц + Bluetooth'],['Автономность','до 70 часов'],['Аудио','LE Audio'],['Драйверы','50 мм']],
    inBox:['Гарнитура AT Bridle','Ресивер 2.4G','Кабель USB-C'], images:[] },
  { id:'p7', name:'AT Arena XL', category:'pads', price:2490, oldPrice:0, badge:'',
    ref:'AT-PD-01', inStock:true, spec:'900×400 · control · прошитый край',
    description:'Большой коврик 900×400 с поверхностью control и прошитым краем.',
    colors:[{name:'чёрный',hex:'#141417'}],
    quick:[['900×400','размер'],['control','поверхность'],['4 мм','толщина'],['шитый','край']],
    specs:[['Тип','Коврик для мыши'],['Размер','900 × 400 мм'],['Поверхность','Control'],['Толщина','4 мм'],['Край','Прошитый']],
    inBox:['Коврик AT Arena XL'], images:[] },
  { id:'p8', name:'AT Turf Speed', category:'pads', price:1990, oldPrice:0, badge:'',
    ref:'AT-PD-02', inStock:true, spec:'360×300 · speed · влагозащита',
    description:'Компактный коврик 360×300 с быстрой поверхностью speed и влагозащитой.',
    colors:[{name:'чёрный',hex:'#141417'}],
    quick:[['360×300','размер'],['speed','поверхность'],['3 мм','толщина'],['да','влагозащита']],
    specs:[['Тип','Коврик для мыши'],['Размер','360 × 300 мм'],['Поверхность','Speed'],['Толщина','3 мм'],['Влагозащита','Да']],
    inBox:['Коврик AT Turf Speed'], images:[] }
];

var DEFAULT_SETTINGS = {
  currency:'TMT',
  city:'Ашхабад, Туркменистан',
  phone:'+993 6X XX XX XX',
  whatsapp:'',            // номер для WhatsApp в межд. формате без + (напр. 99365000000)
  telegram:'',            // username без @ или номер
  freeShipping:5000,
  adminPass:'atadmin',    // пароль админ-панели (смените!)
  logo:''                 // data:URL если админ загрузил свой логотип
};

/* -------------------- ПЕРЕВОДЫ -------------------- */
var I18N = {
  ru:{
    'nav.catalog':'каталог','nav.tech':'технологии','nav.about':'команда','nav.support':'поддержка',
    'nav.cart':'корзина','nav.shop':'магазин',
    'hero.kicker':'AT CYBERSPORT','hero.sub':'/ 54 г · 8000 Гц','hero.desc':'Теперь в титановом корпусе.','hero.cta':'подробнее',
    'marq.mice':'мыши','marq.keyboards':'клавиатуры','marq.headsets':'гарнитуры','marq.pads':'коврики',
    'sec.popular':'популярные товары','sec.categories':'категории','sec.tech':'технологии','sec.about':'о нас',
    'more':'подробнее →','toSection':'в раздел →','toCatalog':'в каталог','addCart':'в корзину','added':'добавлено',
    'about.lead':'AT Cybersport проектирует девайсы на одном принципе — убрать всё лишнее между намерением игрока и действием в игре. Собираем и тестируем в одной лаборатории.',
    'about.m1':'категории','about.m2':'свой R&D','about.m3':'гарантия',
    'tech.1t':'сенсор 42K','tech.1d':'42 000 DPI · 750 IPS · нулевое сглаживание.',
    'tech.2t':'отклик 8000 Гц','tech.2d':'позиция каждые 0,125 мс по каналу AT-LINK.',
    'tech.3t':'магниевый сплав','tech.3d':'жёсткость корпуса при минимальном весе — 54 г.',
    'tech.4t':'95 часов','tech.4d':'почти пять турнирных дней без подзарядки.',
    'foot.tagline':'девайсы для тех, кто играет на победу.','foot.catalog':'каталог','foot.company':'компания','foot.contact':'связь',
    'foot.support':'поддержка','foot.copyright':'сделано для победы',
    'catalog.eyebrow':'каталог','catalog.positions':'позиций','catalog.title':'снаряжение',
    'catalog.desc':'Полная линейка девайсов AT Cybersport. Карточки обновляются администратором магазина.',
    'filter.all':'всё','empty':'в этой категории пока пусто',
    'crumb.home':'главная','p.flagship':'флагман','p.color':'цвет','p.specs':'характеристики','p.fullspec':'полная спецификация',
    'p.inbox':'в коробке','p.related':'с этим берут','p.allcatalog':'весь каталог →',
    'p.instock':'В наличии','p.outstock':'Нет в наличии','p.delivery':'Доставка 1–3 дня','p.warranty':'Гарантия 2 года',
    'cart.title':'корзина','cart.empty':'корзина пуста','cart.total':'итого','cart.checkout':'оформить заказ','cart.shipnote':'доставка рассчитывается менеджером',
    'order.title':'оформление','order.sub':'Оставьте контакты — менеджер свяжется с вами и подтвердит заказ.',
    'order.name':'Имя','order.phone':'Телефон','order.email':'Email','order.comment':'Комментарий',
    'order.optional':'не обязательно','order.total':'к оплате','order.send':'Отправить заказ',
    'order.wa':'Отправить в WhatsApp','order.tg':'Отправить в Telegram','order.copy':'Скопировать заказ',
    'order.err.name':'Введите имя','order.err.phone':'Введите номер телефона',
    'order.done':'Заказ оформлен','order.doneSub':'Отправьте его менеджеру удобным способом ниже — он свяжется с вами.',
    'order.copied':'Скопировано','order.close':'Закрыть'
  },
  tk:{
    'nav.catalog':'katalog','nav.tech':'tehnologiýalar','nav.about':'topar','nav.support':'goldaw',
    'nav.cart':'sebet','nav.shop':'dükan',
    'hero.kicker':'AT CYBERSPORT','hero.sub':'/ 54 g · 8000 Gs','hero.desc':'Indi titan korpusda.','hero.cta':'giňişleýin',
    'marq.mice':'syçanlar','marq.keyboards':'klawiaturalar','marq.headsets':'nauşnikler','marq.pads':'halyçalar',
    'sec.popular':'meşhur harytlar','sec.categories':'kategoriýalar','sec.tech':'tehnologiýalar','sec.about':'biz barada',
    'more':'giňişleýin →','toSection':'bölüme →','toCatalog':'kataloga','addCart':'sebede','added':'goşuldy',
    'about.lead':'AT Cybersport enjamlary bir ýörelgede taýýarlaýar — oýunçynyň niýeti bilen hereketiniň arasyndaky ähli artykmaçlygy aýyrmak. Bir barlaghanada ýygnaýarys we synaýarys.',
    'about.m1':'kategoriýa','about.m2':'öz R&D','about.m3':'kepillik',
    'tech.1t':'42K datçik','tech.1d':'42 000 DPI · 750 IPS · nol tekizleme.',
    'tech.2t':'8000 Gs jogap','tech.2d':'her 0,125 ms AT-LINK arkaly.',
    'tech.3t':'magniý garyndysy','tech.3d':'iň az agramda korpusyň berkligi — 54 g.',
    'tech.4t':'95 sagat','tech.4d':'zarýadsyz bäş ýaryş güni.',
    'foot.tagline':'ýeňiş üçin oýnaýanlar üçin enjamlar.','foot.catalog':'katalog','foot.company':'kompaniýa','foot.contact':'aragatnaşyk',
    'foot.support':'goldaw','foot.copyright':'ýeňiş üçin ýasaldy',
    'catalog.eyebrow':'katalog','catalog.positions':'haryt','catalog.title':'enjamlar',
    'catalog.desc':'AT Cybersport enjamlarynyň doly hatary. Kartlar dükanyň administratory tarapyndan täzelenýär.',
    'filter.all':'hemmesi','empty':'bu kategoriýada haryt ýok',
    'crumb.home':'baş sahypa','p.flagship':'flagman','p.color':'reňk','p.specs':'aýratynlyklar','p.fullspec':'doly aýratynlyklar',
    'p.inbox':'gutuda','p.related':'şular bilen alýarlar','p.allcatalog':'ähli katalog →',
    'p.instock':'Bar','p.outstock':'Ýok','p.delivery':'Eltip berme 1–3 gün','p.warranty':'Kepillik 2 ýyl',
    'cart.title':'sebet','cart.empty':'sebet boş','cart.total':'jemi','cart.checkout':'sargyt bermek','cart.shipnote':'eltip berme menejer tarapyndan hasaplanýar',
    'order.title':'sargyt','order.sub':'Aragatnaşyk galdyryň — menejer siziň bilen habarlaşar we sargydy tassyklar.',
    'order.name':'At','order.phone':'Telefon','order.email':'Email','order.comment':'Bellik',
    'order.optional':'hökman däl','order.total':'töleg','order.send':'Sargyt ibermek',
    'order.wa':'WhatsApp arkaly','order.tg':'Telegram arkaly','order.copy':'Sargydy göçürmek',
    'order.err.name':'Adyňyzy giriziň','order.err.phone':'Telefon belgiňizi giriziň',
    'order.done':'Sargyt kabul edildi','order.doneSub':'Aşakdaky amatly usul bilen menejere iberiň — ol siziň bilen habarlaşar.',
    'order.copied':'Göçürildi','order.close':'Ýapmak'
  },
  en:{
    'nav.catalog':'catalog','nav.tech':'technology','nav.about':'team','nav.support':'support',
    'nav.cart':'cart','nav.shop':'shop',
    'hero.kicker':'AT CYBERSPORT','hero.sub':'/ 54 g · 8000 Hz','hero.desc':'Now in a titanium shell.','hero.cta':'details',
    'marq.mice':'mice','marq.keyboards':'keyboards','marq.headsets':'headsets','marq.pads':'pads',
    'sec.popular':'popular gear','sec.categories':'categories','sec.tech':'technology','sec.about':'about us',
    'more':'details →','toSection':'open →','toCatalog':'to catalog','addCart':'add to cart','added':'added',
    'about.lead':'AT Cybersport designs devices on one principle — remove everything between the player\'s intent and the in-game action. Built and tested in one lab.',
    'about.m1':'categories','about.m2':'in-house R&D','about.m3':'warranty',
    'tech.1t':'42K sensor','tech.1d':'42,000 DPI · 750 IPS · zero smoothing.',
    'tech.2t':'8000 Hz polling','tech.2d':'position every 0.125 ms over AT-LINK.',
    'tech.3t':'magnesium alloy','tech.3d':'shell rigidity at minimal weight — 54 g.',
    'tech.4t':'95 hours','tech.4d':'almost five tournament days on a charge.',
    'foot.tagline':'gear for those who play to win.','foot.catalog':'catalog','foot.company':'company','foot.contact':'contact',
    'foot.support':'support','foot.copyright':'built to win',
    'catalog.eyebrow':'catalog','catalog.positions':'items','catalog.title':'gear',
    'catalog.desc':'The full AT Cybersport lineup. Cards are updated by the store administrator.',
    'filter.all':'all','empty':'nothing in this category yet',
    'crumb.home':'home','p.flagship':'flagship','p.color':'color','p.specs':'specs','p.fullspec':'full specification',
    'p.inbox':'in the box','p.related':'frequently bought','p.allcatalog':'full catalog →',
    'p.instock':'In stock','p.outstock':'Out of stock','p.delivery':'Delivery 1–3 days','p.warranty':'2-year warranty',
    'cart.title':'cart','cart.empty':'your cart is empty','cart.total':'total','cart.checkout':'checkout','cart.shipnote':'shipping is calculated by the manager',
    'order.title':'checkout','order.sub':'Leave your contacts — a manager will reach out and confirm the order.',
    'order.name':'Name','order.phone':'Phone','order.email':'Email','order.comment':'Comment',
    'order.optional':'optional','order.total':'to pay','order.send':'Send order',
    'order.wa':'Send via WhatsApp','order.tg':'Send via Telegram','order.copy':'Copy order',
    'order.err.name':'Enter your name','order.err.phone':'Enter your phone number',
    'order.done':'Order placed','order.doneSub':'Send it to a manager using any option below — they will contact you.',
    'order.copied':'Copied','order.close':'Close'
  }
};

/* -------------------- STORE -------------------- */
function read(key, fallback){
  try{ var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch(e){ return fallback; }
}
function write(key, val){
  try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){}
}
/* Опубликованный каталог (data/catalog.json) — источник для покупателей.
   Приоритет данных: localStorage (черновик админа на этом устройстве)
   → FETCHED (опубликованный файл) → встроенные дефолты. */
var FETCHED = null;
function loadCatalog(cb){
  try{
    fetch('data/catalog.json?ts='+Date.now())
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){ if(j && j.__at==='AT_CYBERSPORT_CATALOG') FETCHED=j; cb(); })
      .catch(function(){ cb(); });
  }catch(e){ cb(); }
}
var Store = {
  products:function(){ return read(K.products, null) || (FETCHED&&FETCHED.products) || DEFAULT_PRODUCTS.slice(); },
  saveProducts:function(p){ write(K.products, p); },
  categories:function(){ return read(K.categories, null) || (FETCHED&&FETCHED.categories) || DEFAULT_CATEGORIES.slice(); },
  saveCategories:function(c){ write(K.categories, c); },
  settings:function(){ return Object.assign({}, DEFAULT_SETTINGS, (FETCHED&&FETCHED.settings)||{}, read(K.settings, {})); },
  saveSettings:function(s){ write(K.settings, s); },
  orders:function(){ return read(K.orders, []); },
  saveOrders:function(o){ write(K.orders, o); },
  cart:function(){ return read(K.cart, []); },
  saveCart:function(c){ write(K.cart, c); },
  lang:function(){ return read(K.lang, 'ru'); },
  saveLang:function(l){ write(K.lang, l); },
  reset:function(){ [K.products,K.categories,K.settings,K.orders].forEach(function(k){ localStorage.removeItem(k); }); }
};

/* -------------------- ХЕЛПЕРЫ -------------------- */
var lang = Store.lang();
function t(key){ var d = I18N[lang] || I18N.ru; return d[key] != null ? d[key] : (I18N.ru[key] != null ? I18N.ru[key] : key); }
function catName(cat){ if(!cat) return ''; return (cat.name && cat.name[lang]) || (cat.name && cat.name.ru) || cat.slug || ''; }
function catById(id){ return Store.categories().filter(function(c){return c.id===id;})[0]; }
function money(n){ var s = Store.settings(); return (Number(n)||0).toLocaleString('ru-RU') + ' ' + s.currency; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
function logoSrc(){ var s = Store.settings(); return s.logo || 'assets/logo.svg'; }
function firstImg(prod){ return (prod.images && prod.images[0]) || ''; }

/* -------------------- КОРЗИНА -------------------- */
function cartCount(){ return Store.cart().reduce(function(a,i){return a+i.qty;},0); }
function cartTotal(){ return Store.cart().reduce(function(a,i){return a+i.price*i.qty;},0); }
function addToCart(prod, qty, color){
  qty = qty||1;
  var cart = Store.cart();
  var key = prod.id + '|' + (color||'');
  var found = cart.filter(function(i){return i.key===key;})[0];
  if(found){ found.qty += qty; }
  else{ cart.push({ key:key, id:prod.id, name:prod.name, price:prod.price, qty:qty, color:color||'', img:firstImg(prod) }); }
  Store.saveCart(cart);
  updateCartBadges();
  renderCart();
  openCart();
}
function setCartQty(key, qty){
  var cart = Store.cart();
  cart = cart.map(function(i){ if(i.key===key) i.qty=Math.max(1,qty); return i; });
  Store.saveCart(cart); updateCartBadges(); renderCart();
}
function removeCart(key){
  var cart = Store.cart().filter(function(i){return i.key!==key;});
  Store.saveCart(cart); updateCartBadges(); renderCart();
}
function updateCartBadges(){
  var n = cartCount();
  document.querySelectorAll('[data-cart-count]').forEach(function(el){ el.textContent = n; });
}

/* -------------------- РЕНДЕР КОРЗИНЫ + ЗАКАЗ -------------------- */
function renderCart(){
  var body = document.getElementById('cartBody');
  var foot = document.getElementById('cartFoot');
  if(!body) return;
  var cart = Store.cart();
  if(!cart.length){
    body.innerHTML = '<div class="cart-empty">'+t('cart.empty')+'</div>';
    if(foot) foot.style.display='none';
    return;
  }
  if(foot) foot.style.display='block';
  body.innerHTML = cart.map(function(i){
    var img = i.img ? '<img src="'+esc(i.img)+'" alt="">' : '';
    return '<div class="cart-item">'+
      '<div class="ci-img">'+img+'</div>'+
      '<div class="ci-main">'+
        '<div class="ci-name">'+esc(i.name)+'</div>'+
        (i.color?'<div class="ci-meta">'+esc(i.color)+'</div>':'')+
        '<div class="ci-row">'+
          '<div class="ci-qty"><button data-dec="'+esc(i.key)+'">−</button><span>'+i.qty+'</span><button data-inc="'+esc(i.key)+'">+</button></div>'+
          '<div class="ci-price">'+money(i.price*i.qty)+'</div>'+
        '</div>'+
        '<button class="ci-del" data-del="'+esc(i.key)+'">удалить</button>'+
      '</div>'+
    '</div>';
  }).join('');
  var totalEl = document.getElementById('cartTotal');
  if(totalEl) totalEl.textContent = money(cartTotal());
  body.querySelectorAll('[data-inc]').forEach(function(b){ b.onclick=function(){ var k=b.getAttribute('data-inc'); var it=Store.cart().filter(function(x){return x.key===k;})[0]; if(it) setCartQty(k,it.qty+1); }; });
  body.querySelectorAll('[data-dec]').forEach(function(b){ b.onclick=function(){ var k=b.getAttribute('data-dec'); var it=Store.cart().filter(function(x){return x.key===k;})[0]; if(it) setCartQty(k,it.qty-1); }; });
  body.querySelectorAll('[data-del]').forEach(function(b){ b.onclick=function(){ removeCart(b.getAttribute('data-del')); }; });
}

function openCart(){ var o=document.getElementById('overlay'),d=document.getElementById('cartDrawer'); if(o)o.classList.add('open'); if(d)d.classList.add('open'); }
function closeCart(){ var o=document.getElementById('overlay'),d=document.getElementById('cartDrawer'); if(o)o.classList.remove('open'); if(d)d.classList.remove('open'); }

/* -------------------- ORDER MODAL -------------------- */
function buildOrderText(o){
  var s = Store.settings();
  var lines = [];
  lines.push('🐎 AT CYBERSPORT — новый заказ');
  lines.push('');
  lines.push('Имя: '+o.name);
  lines.push('Телефон: '+o.phone);
  if(o.email) lines.push('Email: '+o.email);
  if(o.comment) lines.push('Комментарий: '+o.comment);
  lines.push('');
  lines.push('Заказ:');
  o.items.forEach(function(i){
    lines.push('• '+i.name+(i.color?' ('+i.color+')':'')+' × '+i.qty+' — '+money(i.price*i.qty));
  });
  lines.push('');
  lines.push('Итого: '+money(o.total));
  lines.push('Город: '+s.city);
  return lines.join('\n');
}
function openOrderModal(){
  var cart = Store.cart();
  if(!cart.length) return;
  var m = document.getElementById('orderModal');
  if(!m) return;
  document.getElementById('orderTotal').textContent = money(cartTotal());
  document.getElementById('orderForm').style.display='block';
  document.getElementById('orderSuccess').style.display='none';
  m.classList.add('open');
}
function closeOrderModal(){ var m=document.getElementById('orderModal'); if(m)m.classList.remove('open'); }

function submitOrder(){
  var nameEl=document.getElementById('ordName'), phoneEl=document.getElementById('ordPhone');
  var name=(nameEl.value||'').trim(), phone=(phoneEl.value||'').trim();
  var ok=true;
  var fName=nameEl.closest('.field'), fPhone=phoneEl.closest('.field');
  fName.classList.remove('invalid'); fPhone.classList.remove('invalid');
  if(!name){ fName.classList.add('invalid'); ok=false; }
  if(!phone || phone.replace(/\D/g,'').length<6){ fPhone.classList.add('invalid'); ok=false; }
  if(!ok) return;
  var order={
    id:'ord_'+Date.now(), date:new Date().toISOString(),
    name:name, phone:phone,
    email:(document.getElementById('ordEmail').value||'').trim(),
    comment:(document.getElementById('ordComment').value||'').trim(),
    items:Store.cart().slice(), total:cartTotal(), status:'new'
  };
  var orders=Store.orders(); orders.unshift(order); Store.saveOrders(orders);
  var text=buildOrderText(order);
  window.__orderText=text;
  // показать экран отправки
  document.getElementById('orderForm').style.display='none';
  var suc=document.getElementById('orderSuccess'); suc.style.display='block';
  var s=Store.settings();
  var wa=document.getElementById('sendWA'), tg=document.getElementById('sendTG');
  var waNum=(s.whatsapp||'').replace(/\D/g,'');
  if(waNum){ wa.style.display='flex'; wa.onclick=function(){ window.open('https://wa.me/'+waNum+'?text='+encodeURIComponent(text),'_blank'); }; }
  else wa.style.display='none';
  var tgUser=(s.telegram||'').replace(/^@/,'').trim();
  if(tgUser){
    tg.style.display='flex';
    tg.onclick=function(){
      copyText(text);
      var url = /^\d+$/.test(tgUser) ? 'https://t.me/+'+tgUser : 'https://t.me/'+tgUser;
      window.open(url,'_blank');
    };
  } else tg.style.display='none';
  // очистить корзину после оформления
  Store.saveCart([]); updateCartBadges(); renderCart(); closeCart();
}
function copyText(txt){
  if(navigator.clipboard){ navigator.clipboard.writeText(txt).catch(function(){}); }
  else{ var ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');}catch(e){} document.body.removeChild(ta); }
}

/* -------------------- ИНЪЕКЦИЯ ОБЩЕГО UI (drawer + modal) -------------------- */
function injectSharedUI(){
  if(document.getElementById('cartDrawer')) return;
  var html =
  '<div class="overlay" id="overlay"></div>'+
  '<aside class="drawer" id="cartDrawer" aria-label="Корзина">'+
    '<div class="drawer-head"><h3>'+t('cart.title')+'</h3><button class="x" id="cartClose" aria-label="Закрыть">×</button></div>'+
    '<div class="drawer-body" id="cartBody"></div>'+
    '<div class="drawer-foot" id="cartFoot" style="display:none">'+
      '<div class="sum"><span>'+t('cart.total')+'</span><b id="cartTotal">0</b></div>'+
      '<button class="checkout" id="cartCheckout">'+t('cart.checkout')+'</button>'+
    '</div>'+
  '</aside>'+
  '<div class="modal" id="orderModal">'+
    '<div class="modal-box" style="position:relative">'+
      '<button class="modal-close" id="orderClose" aria-label="Закрыть">×</button>'+
      '<div id="orderForm">'+
        '<h3>'+t('order.title')+'</h3>'+
        '<p class="sub">'+t('order.sub')+'</p>'+
        '<div class="field"><label>'+t('order.name')+' <span class="req">*</span></label><input id="ordName" type="text" autocomplete="name"><div class="err">'+t('order.err.name')+'</div></div>'+
        '<div class="field"><label>'+t('order.phone')+' <span class="req">*</span></label><input id="ordPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+993 …"><div class="err">'+t('order.err.phone')+'</div></div>'+
        '<div class="field"><label>'+t('order.email')+' · '+t('order.optional')+'</label><input id="ordEmail" type="email" autocomplete="email"></div>'+
        '<div class="field"><label>'+t('order.comment')+' · '+t('order.optional')+'</label><textarea id="ordComment"></textarea></div>'+
        '<div class="modal-total"><span>'+t('order.total')+'</span><b id="orderTotal">0</b></div>'+
        '<button class="send-btn" style="background:var(--invert-bg);color:var(--invert-text)" id="orderSubmit">'+t('order.send')+'</button>'+
      '</div>'+
      '<div id="orderSuccess" style="display:none;text-align:center">'+
        '<div class="success-check">✓</div>'+
        '<h3 style="text-align:center">'+t('order.done')+'</h3>'+
        '<p class="sub" style="text-align:center">'+t('order.doneSub')+'</p>'+
        '<div class="send-options">'+
          '<button class="send-btn send-wa" id="sendWA">'+t('order.wa')+'</button>'+
          '<button class="send-btn send-tg" id="sendTG">'+t('order.tg')+'</button>'+
          '<button class="send-btn send-copy" id="sendCopy">'+t('order.copy')+'</button>'+
        '</div>'+
        '<button class="send-btn send-copy" style="margin-top:14px" id="orderDone2">'+t('order.close')+'</button>'+
      '</div>'+
    '</div>'+
  '</div>';
  var div=document.createElement('div'); div.innerHTML=html; document.body.appendChild(div);
  document.getElementById('overlay').onclick=closeCart;
  document.getElementById('cartClose').onclick=closeCart;
  document.getElementById('cartCheckout').onclick=function(){ closeCart(); openOrderModal(); };
  document.getElementById('orderClose').onclick=closeOrderModal;
  document.getElementById('orderDone2').onclick=closeOrderModal;
  document.getElementById('orderSubmit').onclick=submitOrder;
  document.getElementById('sendCopy').onclick=function(){ copyText(window.__orderText||''); var b=document.getElementById('sendCopy'); var o=b.textContent; b.textContent=t('order.copied'); setTimeout(function(){b.textContent=o;},1500); };
  document.getElementById('orderModal').addEventListener('click',function(e){ if(e.target.id==='orderModal') closeOrderModal(); });
}

/* -------------------- ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА + i18n DOM -------------------- */
function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(function(el){ el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-html]').forEach(function(el){ el.innerHTML = t(el.getAttribute('data-i18n-html')); });
  document.documentElement.lang = lang;
}
function buildLangSwitch(container, mobile){
  var langs=['ru','tk','en'];
  container.innerHTML = langs.map(function(l,i){
    return (i?'<span>·</span>':'')+'<button data-lang="'+l+'" class="'+(l===lang?'on':'')+'">'+l+'</button>';
  }).join('');
  container.querySelectorAll('[data-lang]').forEach(function(b){
    b.onclick=function(){ var l=b.getAttribute('data-lang'); if(l===lang) return; Store.saveLang(l); location.reload(); };
  });
}

/* -------------------- НАВИГАЦИЯ (общая) -------------------- */
function wireNav(){
  var nav=document.querySelector('.nav');
  if(nav){
    var onScroll=function(){ if(window.scrollY>30) nav.classList.add('scrolled'); else nav.classList.remove('scrolled'); };
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  }
  var burger=document.getElementById('burger'), menu=document.getElementById('mobileMenu');
  if(burger&&menu){
    burger.onclick=function(){ var open=menu.classList.toggle('open'); burger.classList.toggle('open',open); document.body.style.overflow=open?'hidden':''; };
    menu.querySelectorAll('a').forEach(function(a){ a.onclick=function(){ menu.classList.remove('open'); burger.classList.remove('open'); document.body.style.overflow=''; }; });
  }
  document.querySelectorAll('[data-open-cart]').forEach(function(b){ b.onclick=function(e){ e.preventDefault(); renderCart(); openCart(); }; });
  document.querySelectorAll('.lang[data-langswitch]').forEach(function(c){ buildLangSwitch(c); });
}

/* -------------------- REVEAL + АНИМАЦИИ -------------------- */
function wireReveal(){
  var els=document.querySelectorAll('[data-reveal]');
  if(!els.length) return;
  if(!('IntersectionObserver' in window)){ els.forEach(function(e){e.classList.add('in');}); return; }
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ var d=e.target.getAttribute('data-delay')||0; setTimeout(function(){e.target.classList.add('in');}, +d); io.unobserve(e.target); } }); },{threshold:0.12,rootMargin:'0px 0px -6% 0px'});
  els.forEach(function(e){ io.observe(e); });
}
function wireMagnetic(){
  document.querySelectorAll('[data-magnetic]').forEach(function(el){
    var s=parseFloat(el.getAttribute('data-magnetic'))||0.3;
    el.style.transition='transform .4s var(--ease)';
    el.addEventListener('pointermove',function(ev){ var r=el.getBoundingClientRect(); el.style.transform='translate('+((ev.clientX-(r.left+r.width/2))*s)+'px,'+((ev.clientY-(r.top+r.height/2))*s)+'px)'; });
    el.addEventListener('pointerleave',function(){ el.style.transform='translate(0,0)'; });
  });
}
function wireTilt(){
  document.querySelectorAll('[data-stage]').forEach(function(stage){
    var tilt=stage.querySelector('[data-tilt]'); if(!tilt) return;
    stage.addEventListener('pointermove',function(e){ var r=stage.getBoundingClientRect(); var px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5; tilt.style.transform='rotateY('+(px*10)+'deg) rotateX('+(-py*10)+'deg)'; });
    stage.addEventListener('pointerleave',function(){ tilt.style.transform='rotateY(0) rotateX(0)'; });
  });
}

/* -------------------- ЭКСПОРТ В ГЛОБАЛ -------------------- */
window.AT = {
  Store:Store, I18N:I18N, DEFAULT_CATEGORIES:DEFAULT_CATEGORIES, DEFAULT_PRODUCTS:DEFAULT_PRODUCTS, DEFAULT_SETTINGS:DEFAULT_SETTINGS,
  t:t, lang:function(){return lang;}, catName:catName, catById:catById, money:money, esc:esc, logoSrc:logoSrc, firstImg:firstImg,
  addToCart:addToCart, openCart:openCart, closeCart:closeCart, renderCart:renderCart, updateCartBadges:updateCartBadges,
  applyI18n:applyI18n, init:init
};

/* -------------------- INIT -------------------- */
var _ready=false, _readyCbs=[];
function ready(cb){ if(_ready) cb(); else _readyCbs.push(cb); }
function init(){
  loadCatalog(function(){
    injectSharedUI();
    applyI18n();
    wireNav();
    updateCartBadges();
    renderCart();
    _ready=true;
    _readyCbs.forEach(function(fn){ try{fn();}catch(e){console.error(e);} });
    // анимации навешиваем после того, как страницы отрисовали динамику
    setTimeout(function(){ wireReveal(); wireMagnetic(); wireTilt(); }, 0);
  });
}
window.AT.ready = ready;
if(document.readyState!=='loading') init();
else document.addEventListener('DOMContentLoaded', init);

})();
