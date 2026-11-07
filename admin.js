/* The Somaliland Age - admin dashboard (loaded after login). Every change is saved to the live site automatically. */
(()=>{
const A=window.AMA,E=A.E;
const $=(t,a={},...k)=>{const e=document.createElement(t);for(const x in a)x in e?e[x]=a[x]:e.setAttribute(x,a[x]);k.flat().forEach(c=>e.append(c));return e};
const LBL={topBarColor:'Top strip colour (date and search bar)',tickerColor:'Breaking news bar colour',tickerTextColor:'Breaking news text colour',menuTextColor:'Menu text colour',headerHeight:'Header picture height (% of normal - 100 = normal)',menuHeight:'Menu bar height (% of normal - 100 = normal)',tickerHeight:'Breaking news bar height (% of normal - 100 = normal)',headerTintColor:'Header colour wash (colour laid over the header picture)',headerTintAmount:'Header colour wash strength (0 = none, 100 = solid)',menuStyle:'Menu bar look (cylinder = rounded, shiny; flat = plain)',waveShape:'Footer top edge shape',spaceAdjust:'Footer height: extra space in pixels (negative = shorter, 0 = normal)',showGreen:'Show the shiny green on the footer',greenStrength:'Shiny green strength (0-100)',youtube:'YouTube or Vimeo link (leave empty if you upload a file)',font:'Website font (changes ALL text on the site - to change only the site name use "Site name font" below)',headerFont:'Site name font (only the title in the header)',nameFont:'Name font ("same as site name" = the same Chomsky lettering as the top of the website)',nameSize:'Name size (pixels)',email:'Email address (shown under the name)',phone:'Phone number (shown under the name)',address:'Address (shown under the name)',contact:'More contact lines (optional, one per line: website, opening hours...)',showSocial:'Show social media icons',social:'Social media icons and links (leave a link empty to use the network home page)',headerTitle:'Site name (header title)',headerTagline:'Tagline (next to the site name)',titleFx:'Site name effects',taglineFx:'Tagline effects',shadow:'Shadow',shadowColor:'Shadow colour',outline:'Outline',outlineColor:'Outline colour',glow:'Glow',glowColor:'Glow colour',headerTitleWeight:'Site name weight (Regular, Bold...)',headerTitleItalic:'Site name italic',headerTitleUnderline:'Site name underline / line',headerTitleCase:'Site name letter case',headerTitleSpacing:'Site name letter spacing (% of font size)',headerTextLeft:'Header text distance from left (%) - banner style only',logoOffset:'Logo distance from the edge (%)',headerTitleSize:'Header title size (% of header width)',headerTaglineSize:'Header tagline size (% of header width)',headerStyle:'Header style (banner = coloured picture header, masthead = white newspaper header)',headerTextAlign:'Header title position (banner style)'};
const nice=k=>LBL[k]||String(k).replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
const TABS=[['articles','Articles'],['editor','Article Editor'],['images','Images'],['site','Header & Site'],['ticker','Breaking News'],['nav','Navigation'],['home','Home Layout'],['footer','Footer'],['pages','Pages'],['account','Account']];
const FLAGS={hero:'Slider',inDepth:'In Depth',card:'Card',trending:'Trending',editors:"Editors' Picks",headline:'Headline'};
const OPT={menuStyle:['cylinder','flat'],waveShape:['wave','soft curve','slant','reverse slant','straight'],align:['left','center','right'],variant:['primary','accent','outline'],ratio:['16:9','4:3','3:2','1:1','21:9','9:16'],headerStyle:['banner','masthead'],headerTextAlign:['center','left'],style:['tiles','cards','list'],flag:Object.keys(FLAGS),loginButton:['auto','show','hide'],network:['TikTok','YouTube','Facebook','X','Instagram'],shadow:['None','Soft','Medium','Strong'],glow:['None','Soft','Medium','Strong'],outline:['None','Thin','Medium','Thick'],headerTitleWeight:['Regular','Bold','Light','Medium','Semi-bold','Extra-bold'],headerTitleItalic:['Normal','Italic'],headerTitleUnderline:['None','Underline','Overline','Strikethrough'],headerTitleCase:['As typed','UPPERCASE','lowercase','Capitalize'],font:['Arial, Helvetica, sans-serif','Georgia, serif','Verdana, sans-serif','Tahoma, sans-serif','Trebuchet MS, sans-serif','Times New Roman, serif','system-ui, sans-serif','Chomsky Custom, serif','Chomsky, serif','Lora, Georgia, serif','Poppins, Arial, sans-serif','Palatino Linotype, Palatino, Book Antiqua, serif','Garamond, Baskerville, Georgia, serif','Baskerville, Baskerville Old Face, Georgia, serif','Didot, Bodoni MT, Georgia, serif','Cambria, Georgia, serif','Century Gothic, Futura, Arial, sans-serif','Gill Sans, Gill Sans MT, Calibri, sans-serif','Lucida Sans, Lucida Grande, Verdana, sans-serif','Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif','Impact, Haettenschweiler, Arial Narrow Bold, sans-serif','Courier New, monospace','Brush Script MT, Segoe Script, cursive','Copperplate, Copperplate Gothic Light, fantasy']};
OPT.nameFont=['same as site name'];OPT.headerFont=["'Chomsky'","'Chomsky Custom'","'SiteMasthead'",...OPT.font.filter(x=>x!=='Chomsky, serif'&&x!=='Chomsky Custom, serif')];OPT.nameFont.push(...OPT.headerFont);
let tab='articles',work=null,root,main,st,isDefault=false;
let live=null;
const D=()=>A.D(),ch=()=>{A.ch();if(live)live()},set=(o,k,v)=>{o[k]=v;ch()};
const btn=(t,f,c='')=>$('button',{type:'button',className:c,textContent:t,onclick:e=>{e.preventDefault();e.stopPropagation();f()}});
const blank=v=>typeof v==='string'?'':typeof v==='boolean'?false:Array.isArray(v)?[]:v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,blank(x)])):v;
const status=(t,bad)=>{if(st){st.textContent=t;st.className='st'+(bad?' bad':'')}};
/* ================= image editor: crop, rotate, resize - aspect ratio is always preserved ================= */
function imageEditor(src,opt={}){return new Promise(resolve=>{
 const img=new Image();img.crossOrigin='anonymous';
 img.onerror=()=>{alert('Could not open that image.');resolve(null)};img.onload=()=>run();img.src=src;
 function run(){
  const NW=img.naturalWidth||1200,NH=img.naturalHeight||800;
  let rot=0,S,crop,ratio=0,ow=0,oh=0,custom=false,scale=1,fmt=(opt.png||(opt.type==='image/png'&&(opt.size||0)<800000)||/^data:image\/png|\.png(\?|$)/i.test(src))?'png':'jpg',q=.92;
  const ov=$('div',{id:'ie'}),box=$('div',{className:'iebox'}),stage=$('div',{className:'iest'}),cv=$('canvas'),sel=$('div',{className:'iesel'});
  ['tl','tr','bl','br'].forEach(c=>{const h=$('div',{className:'ieh '+c});h.dataset.c=c;sel.append(h)});stage.append(cv,sel);
  const info=$('div',{className:'ieinfo'}),wI=$('input',{type:'number',min:16}),hI=$('input',{type:'number',min:16});
  const done=v=>{ov.remove();resolve(v)};
  const fit=()=>{let w=S.width,h=w/ratio;if(h>S.height){h=S.height;w=h*ratio}crop={x:(S.width-w)/2,y:(S.height-h)/2,w,h}};
  const sync=()=>{sel.style.cssText=`left:${crop.x*scale}px;top:${crop.y*scale}px;width:${crop.w*scale}px;height:${crop.h*scale}px`;
   if(!custom)ow=Math.min(Math.round(crop.w),opt.maxWidth||1920);oh=Math.max(1,Math.round(ow*crop.h/crop.w));wI.value=ow;hI.value=oh;
   info.textContent='Output: '+ow+' × '+oh+' px (selected area: '+Math.round(crop.w)+' × '+Math.round(crop.h)+' px)'+(ow>crop.w?' - enlarging beyond the original, it may look soft':'')};
  const build=()=>{const r=rot%2,w=r?NH:NW,h=r?NW:NH;S=document.createElement('canvas');S.width=w;S.height=h;const c=S.getContext('2d');c.translate(w/2,h/2);c.rotate(rot*Math.PI/2);c.drawImage(img,-NW/2,-NH/2,NW,NH);
   scale=Math.min(660/w,420/h,1);cv.width=Math.round(w*scale);cv.height=Math.round(h*scale);cv.getContext('2d').drawImage(S,0,0,cv.width,cv.height);
   crop={x:0,y:0,w,h};if(ratio)fit();custom=false;sync()};
  const pt=e=>{const r=stage.getBoundingClientRect();return [Math.min(Math.max((e.clientX-r.left)/scale,0),S.width),Math.min(Math.max((e.clientY-r.top)/scale,0),S.height)]};
  sel.onpointerdown=e=>{if(e.target!==sel)return;e.preventDefault();sel.setPointerCapture(e.pointerId);const [sx,sy]=pt(e),c0={...crop};
   sel.onpointermove=m=>{const [px,py]=pt(m);crop.x=Math.min(Math.max(c0.x+px-sx,0),S.width-crop.w);crop.y=Math.min(Math.max(c0.y+py-sy,0),S.height-crop.h);sync()};sel.onpointerup=()=>{sel.onpointermove=null}};
  sel.querySelectorAll('.ieh').forEach(h=>h.onpointerdown=e=>{e.preventDefault();e.stopPropagation();h.setPointerCapture(e.pointerId);const c=h.dataset.c,L=c[1]==='l',T=c[0]==='t',ax=L?crop.x+crop.w:crop.x,ay=T?crop.y+crop.h:crop.y;
   h.onpointermove=m=>{const [px,py]=pt(m);let w=Math.abs(px-ax),hh=Math.abs(py-ay);if(ratio){if(w/Math.max(hh,1)>ratio)w=hh*ratio;else hh=w/ratio}w=Math.max(w,24);hh=Math.max(hh,24);
    crop={x:px<ax?ax-w:ax,y:py<ay?ay-hh:ay,w,h:hh};if(crop.x<0)crop.x=0;if(crop.y<0)crop.y=0;if(crop.x+crop.w>S.width)crop.x=S.width-crop.w;if(crop.y+crop.h>S.height)crop.y=S.height-crop.h;sync()};h.onpointerup=()=>{h.onpointermove=null}});
  wI.oninput=()=>{const v=Math.max(16,parseInt(wI.value)||16);custom=true;ow=v;sync()};
  hI.oninput=()=>{const v=Math.max(16,parseInt(hI.value)||16);custom=true;ow=Math.max(16,Math.round(v*crop.w/crop.h));sync()};
  const asp=(opt.aspects||[['Free',0],['Whole image',-1],['16:9',16/9],['4:3',4/3],['3:2',3/2],['1:1',1],['8:1 header',8]]).map(([l,r])=>btn(l,()=>{ratio=r<0?S.width/S.height:r;custom=false;if(r===0)ratio=0;else fit();sync();asp.forEach(b=>b.classList.remove('on'));ev.classList.add('on')},''));
  let ev;asp.forEach(b=>{const o=b.onclick;b.onclick=e=>{ev=b;o(e)}});
  const fm=$('select',{onchange:e=>{fmt=e.target.value;qr.style.display=fmt==='jpg'?'':'none'}},[$('option',{value:'jpg',textContent:'JPG (smaller, photos)',selected:fmt==='jpg'}),$('option',{value:'png',textContent:'PNG (sharp, transparency)',selected:fmt==='png'})]);
  const qr=$('input',{type:'range',min:60,max:100,value:92,oninput:e=>q=e.target.value/100});
  const apply=()=>{const o=document.createElement('canvas');let cur=document.createElement('canvas');cur.width=Math.round(crop.w);cur.height=Math.round(crop.h);cur.getContext('2d').drawImage(S,crop.x,crop.y,crop.w,crop.h,0,0,cur.width,cur.height);
   while(cur.width/2>=ow&&cur.height/2>=oh){const n=document.createElement('canvas');n.width=Math.round(cur.width/2);n.height=Math.round(cur.height/2);const c=n.getContext('2d');c.imageSmoothingQuality='high';c.drawImage(cur,0,0,n.width,n.height);cur=n}
   o.width=ow;o.height=oh;const c=o.getContext('2d');if(fmt==='jpg'){c.fillStyle='#fff';c.fillRect(0,0,ow,oh)}c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.drawImage(cur,0,0,ow,oh);
   const type=fmt==='png'?'image/png':'image/jpeg';o.toBlob(b=>done({blob:b,type}),type,q)};
  box.append($('h2',{textContent:'Edit image'}),$('p',{className:'hint',textContent:'Drag the box to move it, drag a corner to resize it. The shape (aspect ratio) is always kept, so nothing is stretched or squashed.'}),
   $('div',{className:'iest-wrap'},stage),$('div',{className:'row'},$('b',{textContent:'Crop shape:'}),...asp),
   $('div',{className:'row'},btn('⟲ Rotate left',()=>{rot=(rot+3)%4;build()}),btn('⟳ Rotate right',()=>{rot=(rot+1)%4;build()}),btn('Reset',()=>{rot=0;ratio=0;build()})),
   $('div',{className:'row'},$('label',{},'Width (px) ',wI),$('label',{},'Height (px) ',hI),$('label',{},'Format ',fm),$('label',{},'Quality ',qr)),info,
   $('div',{className:'row'},btn('Use this image',apply,'primary'),btn('Cancel',()=>done(null))));
  qr.style.display=fmt==='jpg'?'':'none';
  ov.append(box);document.body.append(ov);build()}})}
async function uploadBlob(blob,name,type){const data=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(blob)});
 const base=String(name||'image').replace(/\.[^.]*$/,'')+(type==='image/png'?'.png':'.jpg');return A.api('api/upload',{name:base,data})}
async function editThen(src,name,cb,opt){const r=await imageEditor(src,opt);if(!r)return;status('Uploading image…');const u=await uploadBlob(r.blob,name,r.type);
 if(u.url){cb(u.url);status('Image saved ✓')}else{status(u.error||'Upload failed',true);alert(u.error||'Upload failed')}}
function chooseImage(cb,opt){const f=$('input',{type:'file',accept:'image/*'});f.onchange=()=>{const file=f.files[0];if(file)editThen(URL.createObjectURL(file),file.name,cb,{...opt,type:file.type,size:file.size})};f.click()}
/* ================= links and anchors ================= */
const cats=()=>A.cats();
const anchorsOf=t=>{const d=D(),[k,s]=[t.slice(0,1),t.slice(2)],it=k==='p'?(d.pages||[]).find(x=>x.slug===s):A.findArt(s);if(!it)return [];
 const out=new Set(),js=JSON.stringify([it.body,it.blocks||[]]);let m;const re=/id=\\"anc-([a-z0-9_-]+)\\"/g;while(m=re.exec(js))out.add(m[1]);(it.blocks||[]).forEach(b=>{if(b.anchor)out.add(A.slug(b.anchor));if(b.type==='anchor'&&b.name)out.add(A.slug(b.name))});return [...out]};
function modal(box){const ov=$('div',{id:'ld'},box);document.body.append(ov);return ov}
function linkDialog(o){return new Promise(res=>{
 const d=D(),parse=h=>{h=h||'';if(!h)return ['web',''];if(h.startsWith('mailto:'))return ['mail',h.slice(7)];if(h.startsWith('tel:'))return ['tel',h.slice(4)];let m;if(m=h.match(/^#~(.+)$/))return ['anchor',m[1]];
  const p=A.internal(h);if(p===null)return ['web',h];const [path,an]=p.split('#~'),R=A.resolvePath(path);
  if(R.k==='home')return ['home',''];
  if(R.k==='art')return an?['pageanchor','a:'+A.artSlug(R.a),an]:['article',A.artSlug(R.a)];
  if(R.k==='page')return an?['pageanchor','p:'+R.p.slug,an]:['page',R.p.slug];
  if(R.k==='cat')return ['cat',R.c];
  return ['web',h]};
 let [type,val,av]=parse(o.href);val=val||'';av=av||'';let newTab=o.newTab!=null?o.newTab:type==='web';
 const TYPES=[['web','🌐 Web address'],['page','📄 A page of this site'],['article','📰 An article'],['cat','🗂 A category / section'],['home','🏠 Home page'],['anchor','⚓ Anchor on this page'],['pageanchor','⚓ Anchor on another page or article'],['mail','✉️ Email address'],['tel','📞 Phone number']];
 const sel=(opts,v,f)=>$('select',{onchange:e=>f(e.target.value)},opts.map(([x,l])=>$('option',{value:x,textContent:l,selected:x===v})));
 const area=$('div',{className:'ldarea'}),txt=$('input',{type:'text',placeholder:'Text to show',value:''});
 const pageOpts=(d.pages||[]).map(p=>[p.slug,(p.parent?'↳ ':'')+p.title]),artOpts=d.articles.map(a=>[A.artSlug(a),a.title]);
 const tgtOpts=[...(d.pages||[]).map(p=>['p:'+p.slug,'Page: '+p.title]),...d.articles.map(a=>['a:'+A.artSlug(a),'Article: '+a.title])];
 if(!val&&type==='page')val=pageOpts[0]?pageOpts[0][0]:'';if(!val&&type==='article')val=artOpts[0]?artOpts[0][0]:'';
 const draw=()=>{area.textContent='';const inp=(ph,v0,f,list)=>{const i=$('input',{type:'text',placeholder:ph,value:v0,oninput:e=>f(e.target.value)});if(list)i.setAttribute('list',list);return i};
  if(type==='web')area.append($('label',{className:'f'},$('span',{textContent:'Web address'}),inp('https://example.com',val,x=>val=x)));
  else if(type==='page'){if(!pageOpts.length)area.append($('p',{className:'hint',textContent:'There are no pages yet. Create one in Pages.'}));else{if(!pageOpts.some(x=>x[0]===val))val=pageOpts[0][0];area.append($('label',{className:'f'},$('span',{textContent:'Page'}),sel(pageOpts,val,x=>val=x)))}}
  else if(type==='article'){if(!artOpts.some(x=>x[0]===val))val=artOpts[0]?artOpts[0][0]:'';area.append($('label',{className:'f'},$('span',{textContent:'Article'}),sel(artOpts,val,x=>val=x)))}
  else if(type==='cat'){const c=cats();if(!c.includes(val))val=c[0]||'';area.append($('label',{className:'f'},$('span',{textContent:'Category'}),sel(c.map(x=>[x,x]),val,x=>val=x)))}
  else if(type==='anchor'){const dl=$('datalist',{id:'ancs'},(o.anchors||[]).map(x=>$('option',{value:x})));area.append($('label',{className:'f'},$('span',{textContent:'Anchor name'+((o.anchors||[]).length?' (pick one found here or type a name)':' (type the name you gave the anchor)')}),inp('e.g. pricing',val,x=>val=x,'ancs'),dl))}
  else if(type==='pageanchor'){if(!tgtOpts.some(x=>x[0]===val))val=tgtOpts[0]?tgtOpts[0][0]:'';const dl=$('datalist',{id:'ancs2'});const fill=()=>{dl.textContent='';anchorsOf(val).forEach(x=>dl.append($('option',{value:x})))};fill();
   area.append($('label',{className:'f'},$('span',{textContent:'Page or article'}),sel(tgtOpts,val,x=>{val=x;fill()})),$('label',{className:'f'},$('span',{textContent:'Anchor name on that page'}),inp('e.g. pricing',av,x=>av=x,'ancs2'),dl))}
  else if(type==='mail')area.append($('label',{className:'f'},$('span',{textContent:'Email address'}),inp('name@example.com',val,x=>val=x)));
  else if(type==='tel')area.append($('label',{className:'f'},$('span',{textContent:'Phone number'}),inp('+44 …',val,x=>val=x)));
  else area.append($('p',{className:'hint',textContent:'Links to the home page.'}))};
 const tb=$('label',{className:'f'},$('span',{textContent:'Link to'}),sel(TYPES,type,x=>{type=x;val='';av='';if(o.newTab==null)newTab=x==='web';nt.checked=newTab;draw()}));
 const nt=$('input',{type:'checkbox',checked:newTab,onchange:e=>newTab=e.target.checked});
 const done=v=>{ov.remove();res(v)};
 const apply=()=>{let h='';const v=String(val).trim();
  if(type==='web'){if(!v)return alert('Type a web address.');h=/^(https?:|mailto:|tel:)/i.test(v)?v:'https://'+v}
  else if(type==='page'){if(!v)return alert('Choose a page.');const pg=(d.pages||[]).find(x=>x.slug===v);h=pg?A.pagePath(pg):'/'+v}
  else if(type==='article'){if(!v)return alert('Choose an article.');const ar=A.findArt(v);h=ar?A.artPath(ar):'/'+v}
  else if(type==='cat'){if(!v)return alert('Choose a category.');h='/'+A.catSlug(v)}
  else if(type==='home')h='/';
  else if(type==='anchor'){if(!A.slug(v))return alert('Type the anchor name.');h='#~'+A.slug(v)}
  else if(type==='pageanchor'){if(!v||!A.slug(av))return alert('Choose a page and type the anchor name.');const kk=v.split(':'),tt=kk[0]==='p'?(d.pages||[]).find(x=>x.slug===kk[1]):A.findArt(kk[1]);h=(tt?(kk[0]==='p'?A.pagePath(tt):A.artPath(tt)):'/')+'#~'+A.slug(av)}
  else if(type==='mail'){if(!v)return alert('Type an email address.');h='mailto:'+v}
  else if(type==='tel'){if(!v)return alert('Type a phone number.');h='tel:'+v.replace(/\s+/g,'')}
  if(o.needText&&!txt.value.trim())return alert('Type the text the link should show.');
  done({href:h,newTab,text:txt.value.trim()})};
 const ov=modal($('div',{className:'ldbox'},$('h2',{textContent:o.hasLink||o.href?'Edit link':'Add link'}),tb,area,...(o.needText?[$('label',{className:'f'},$('span',{textContent:'Text to show'}),txt)]:[]),
  ...(o.noTab?[]:[$('label',{className:'f chk'},nt,' Open in a new tab')]),
  $('div',{className:'row'},btn('Apply link',apply,'primary'),...(o.hasLink||o.href?[btn('Remove link',()=>done({remove:true}),'del')]:[]),btn('Cancel',()=>done(null)))));
 draw()})}
function anchorDialog(o){return new Promise(res=>{const inp=$('input',{type:'text',placeholder:'e.g. pricing'}),done=v=>{ov.remove();res(v)};
 const ov=modal($('div',{className:'ldbox'},$('h2',{textContent:'⚓ Anchor point'}),$('p',{className:'hint',textContent:'An anchor is a named spot on a page. Link to it with Link > "Anchor on this page". '+(o.hasSel?'It will be placed on the text you highlighted.':'It will be placed on the paragraph where your cursor is.')}),
  $('label',{className:'f'},$('span',{textContent:'New anchor name'}),inp),
  ...(o.anchors.length?[$('div',{className:'f'},$('span',{textContent:'Anchors already here'}),...o.anchors.map(a=>$('div',{className:'row'},$('code',{textContent:'#~'+a}),btn('Remove',()=>done({remove:a}),'del'))))]:[]),
  $('div',{className:'row'},btn('Add anchor',()=>{if(!A.slug(inp.value))return alert('Type a name for the anchor.');done({add:inp.value})},'primary'),btn('Cancel',()=>done(null)))));inp.focus()})}
const pickLink=cur=>linkDialog({href:cur,noTab:true,anchors:[]}).then(r=>r&&r.href);
/* ================= videos (YouTube / Vimeo link or upload from device) with size options ================= */
const RATIOS=['16:9','4:3','3:2','1:1','21:9','9:16'];
const parseVid=u=>{u=String(u||'');let m;if((m=u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{6,15})/)))return {k:'yt',id:m[1]};if((m=u.match(/vimeo\.com\/(?:video\/)?(\d{5,12})/)))return {k:'vm',id:m[1]};return null};
async function uploadMedia(file,kind){status('Uploading '+kind+'…');const data=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(file)});
 const r=await A.api('api/upload',{name:file.name,data,kind});status(r.url?'Uploaded ✓':(r.error||'Upload failed'),!r.url);return r}
function videoDialog(init,o={}){return new Promise(res=>{
 const s={k:init?init.k:'yt',id:init?init.id:'',src:init?init.src:'',link:init&&init.k==='yt'?'https://youtu.be/'+init.id:init&&init.k==='vm'?'https://vimeo.com/'+init.id:'',w:init?init.w:100,a:init?init.a:'center',r:init?init.r:'16:9',c:init?init.c:1,ap:init?init.ap:0,lp:init?init.lp:0};
 const area=$('div'),done=v=>{ov.remove();res(v)};
 const src=$('select',{onchange:e=>{s.k=e.target.value==='file'?'file':'yt';draw()}},[$('option',{value:'yt',textContent:'▶ YouTube or Vimeo link',selected:s.k!=='file'}),$('option',{value:'file',textContent:'⬆ Upload a video from my device',selected:s.k==='file'})]);
 const w=$('input',{type:'range',min:10,max:100,value:s.w}),wn=$('input',{type:'number',min:10,max:100,value:s.w});
 const setW=v=>{v=Math.max(10,Math.min(100,parseInt(v)||100));s.w=v;w.value=v;wn.value=v};w.oninput=()=>setW(w.value);wn.oninput=()=>setW(wn.value);
 const draw=()=>{area.textContent='';
  if(s.k!=='file')area.append($('label',{className:'f'},$('span',{textContent:'YouTube or Vimeo address'}),$('input',{type:'text',placeholder:'https://www.youtube.com/watch?v=…',value:s.link,oninput:e=>s.link=e.target.value})));
  else{const lab=$('div',{className:'hint',textContent:s.src?'Uploaded: '+(s.src.startsWith('data:')?'(video stored in this browser)':s.src):'No video chosen yet.'});
   const fi=$('input',{type:'file',accept:'video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.m4v,.ogg'});
   fi.onchange=async()=>{const f=fi.files[0];if(!f)return;lab.textContent='Uploading '+f.name+'…';const r=await uploadMedia(f,'video');if(r.url){s.src=r.url;lab.textContent='Uploaded: '+(r.url.startsWith('data:')?'(video stored in this browser)':r.url)}else{lab.textContent='';alert(r.error||'Upload failed')}};
   area.append($('div',{className:'f'},$('span',{textContent:'Video file (MP4 or WebM works best)'}),fi,lab))}};
 const sel=(opts,v,f)=>$('select',{onchange:e=>f(e.target.value)},opts.map(([x,l])=>$('option',{value:x,textContent:l,selected:x===v})));
 const chk=(l,v,f)=>$('label',{className:'f chk'},$('input',{type:'checkbox',checked:!!v,onchange:e=>f(e.target.checked)}),' '+l);
 const apply=()=>{let out={w:s.w,a:s.a,r:s.r,c:s.c?1:0,ap:s.ap?1:0,lp:s.lp?1:0};
  if(s.k==='file'){if(!s.src)return alert('Upload a video first.');out={...out,k:'file',src:s.src}}
  else{const p=parseVid(s.link);if(!p)return alert('That does not look like a YouTube or Vimeo address.');out={...out,k:p.k,id:p.id}}
  done(out)};
 const ov=modal($('div',{className:'ldbox'},$('h2',{textContent:init?'Edit video':'Add video'}),$('label',{className:'f'},$('span',{textContent:'Video source'}),src),area,
  $('div',{className:'f'},$('span',{textContent:'Size (width on the page)'}),$('div',{className:'row'},w,wn,'%',...[['Small',33],['Medium',50],['Large',75],['Full',100]].map(([l,v])=>btn(l,()=>setW(v))))),
  $('div',{className:'row'},$('label',{className:'f'},$('span',{textContent:'Align'}),sel([['left','Left'],['center','Centre'],['right','Right']],s.a,v=>s.a=v)),$('label',{className:'f'},$('span',{textContent:'Shape (width : height)'}),sel(RATIOS.map(x=>[x,x]),s.r,v=>s.r=v))),
  $('div',{className:'row'},chk('Show controls',s.c,v=>s.c=v),chk('Autoplay (muted)',s.ap,v=>s.ap=v),chk('Loop',s.lp,v=>s.lp=v)),
  $('div',{className:'row'},btn(init?'Apply changes':'Insert video',apply,'primary'),...(init?[btn('Remove video',()=>done({remove:true}),'del')]:[]),btn('Cancel',()=>done(null)))));
 draw()})}
const vidAttrs=v=>Object.entries({k:v.k,id:v.id,src:v.src,w:v.w,a:v.a,r:v.r,c:v.c,ap:v.ap,lp:v.lp}).filter(([,y])=>y!==undefined&&y!==''&&y!==null).map(([x,y])=>`data-${x}="${E(String(y))}"`).join(' ');
const readVid=el=>({k:el.dataset.k,id:el.dataset.id||'',src:el.dataset.src||'',w:+el.dataset.w||100,a:el.dataset.a||'center',r:el.dataset.r||'16:9',c:el.dataset.c==='0'?0:1,ap:+el.dataset.ap||0,lp:+el.dataset.lp||0});
function videoFileField(o,k){const lab=$('div',{className:'hint',textContent:o[k]?(o[k].startsWith('data:')?'(video stored in this browser)':o[k]):'No file uploaded.'});
 const pick=()=>{const fi=$('input',{type:'file',accept:'video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.m4v,.ogg'});fi.onchange=async()=>{const f=fi.files[0];if(!f)return;lab.textContent='Uploading…';const r=await uploadMedia(f,'video');if(r.url){set(o,k,r.url);lab.textContent=r.url.startsWith('data:')?'(video stored in this browser)':r.url}else{lab.textContent='No file uploaded.';alert(r.error||'Upload failed')}};fi.click()};
 return $('div',{className:'f'},$('span',{textContent:'Video file from your device (used instead of the link)'}),$('div',{className:'row'},btn(o[k]?'Replace video file…':'Upload video from device…',pick),btn('Remove',()=>{set(o,k,'');lab.textContent='No file uploaded.'})),lab)}
function fontFileField(o,k){const lab=$('div',{className:'hint',textContent:o[k]?(o[k].startsWith('data:')?'(font stored in this browser)':o[k]):'Using the built-in blackletter font.'});
 return $('div',{className:'f'},$('span',{textContent:'Header font file (optional: .woff2, .woff, .ttf or .otf)'}),$('div',{className:'row'},btn('Upload font…',()=>{const fi=$('input',{type:'file',accept:'.woff2,.woff,.ttf,.otf'});fi.onchange=async()=>{const f=fi.files[0];if(!f)return;const r=await uploadMedia(f,'font');if(r.url){set(o,k,r.url);lab.textContent=r.url.startsWith('data:')?'(font stored in this browser)':r.url;A.render()}else alert(r.error||'Upload failed')};fi.click()}),btn('Use built-in font',()=>{set(o,k,'');lab.textContent='Using the built-in blackletter font.';A.render()})),lab)}
/* ================= generic editor for any part of the content ================= */
function list(o,k){const a=o[k],box=$('fieldset',{},$('legend',{textContent:nice(k)}));
 const add=btn('+ Add',()=>{a.push(blank(a[a.length-1]??''));ch();draw()},'add');box.append(add);
 const mv=(i,d)=>{const j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];ch();draw()};
 function draw(){box.querySelectorAll('.it').forEach(e=>e.remove());a.forEach((it,i)=>{const obj=it&&typeof it==='object';
  const t=obj?(it.title||it.label||it.text||it.tag||it.name||(it.type?it.type+' block':'Item '+(i+1))):(it||'(empty)');
  box.insertBefore($('details',{className:'it'},$('summary',{},$('span',{textContent:(i+1)+'. '+t}),$('span',{className:'row'},btn('↑',()=>mv(i,-1)),btn('↓',()=>mv(i,1)),btn('✕',()=>{if(confirm('Delete this item?')){a.splice(i,1);ch();draw()}}))),obj?Object.keys(it).map(x=>field(it,x)):field(a,i)),add)})}
 draw();return box}
function imgField(o,k,label){const v=o[k],pv=$('img',{className:'pv'}),w=$('div',{className:'f'},$('span',{textContent:label||nice(k)}));
 const show=()=>{if(o[k])pv.src=o[k];else pv.removeAttribute('src');pv.style.display=o[k]?'':'none'};
 const hdr=k==='headerImage'?{aspects:[['Free',0],['Whole image',-1],['8:1 header',8],['4:1',4],['16:9',16/9]],maxWidth:2400}:k==='logo'?{png:true,aspects:[['Free',0],['Whole image',-1],['1:1',1],['3:1',3],['2:1',2]],maxWidth:800}:{};
 w.append($('div',{className:'row'},btn(o[k]?'Replace image':'Upload image',()=>chooseImage(u=>{set(o,k,u);show()},hdr)),
  btn('Edit / resize',()=>{if(o[k])editThen(o[k],o[k].split('/').pop(),u=>{set(o,k,u);show()},hdr);else alert('Upload an image first.')}),btn('Remove',()=>{set(o,k,'');show()})),pv);show();return w}
function field(o,k){const v=o[k];
 if(Array.isArray(v))return list(o,k);
 if(v&&typeof v==='object')return $('fieldset',{},$('legend',{textContent:nice(k)}),Object.keys(v).map(x=>field(v,x)));
 if(typeof v==='boolean')return $('label',{className:'f chk'},$('input',{type:'checkbox',checked:v,onchange:e=>set(o,k,e.target.checked)}),' '+nice(k));
 if(typeof v==='number')return $('label',{className:'f'},$('span',{textContent:nice(k)}),$('input',{type:'number',value:v,oninput:e=>set(o,k,parseFloat(e.target.value)||0)}));
 if(k==='type')return $('div',{className:'hint',textContent:'Block type: '+v});
 if(k==='html')return htmlField(o,k);
 if(k==='file')return videoFileField(o,k);
 if(k==='headerFontFile')return fontFileField(o,k);
 if(k==='background')return $('label',{className:'f'},$('span',{textContent:'Background colour'}),$('div',{className:'row'},$('input',{type:'color',value:v||'#ffffff',oninput:e=>set(o,k,e.target.value)}),btn('None',()=>{set(o,k,'')})));
 if(/^(url|link)$/i.test(k)&&typeof v==='string'){const i=$('input',{type:'text',value:v,oninput:e=>set(o,k,e.target.value)});return $('label',{className:'f'},$('span',{textContent:nice(k)}),$('div',{className:'row'},i,btn('Choose link…',async()=>{const h=await pickLink(o[k]);if(h!=null){i.value=h;set(o,k,h)}})))}
 if(OPT[k]){const op=OPT[k].includes(v)?OPT[k]:[v,...OPT[k]];return $('label',{className:'f'},$('span',{textContent:nice(k)}),$('select',{onchange:e=>set(o,k,e.target.value)},op.map(x=>$('option',{value:x,textContent:x.split(',')[0].replace(/'/g,''),selected:x===v}))))}
 if(/image|logo/i.test(k))return imgField(o,k);
 const isCol=/color|menu|primary|accent/i.test(k)&&/^#/.test(v),long=typeof v==='string'&&(v.length>70||/summary|text|footer|body|contact/i.test(k));
 const inp=isCol?$('input',{type:'color',value:v,oninput:e=>set(o,k,e.target.value)}):$(long?'textarea':'input',{type:'text',value:v,oninput:e=>set(o,k,e.target.value)});
 return $('label',{className:'f'},$('span',{textContent:nice(k)}),inp)}
function htmlField(o,k){const r=rte(o[k],()=>{o[k]=r.get();ch()});return $('div',{className:'f'},$('span',{textContent:'Text'}),r.el)}
const panel=(title,...c)=>{main.textContent='';if(!A.backend())main.append($('div',{className:'info',innerHTML:'<b>Offline mode.</b> No server is needed: your edits save instantly in this browser. They are not on the live website until the site is served by the Cloudflare or local server (see README).'}));if(isDefault)main.append($('div',{className:'warn',innerHTML:'You are still using the <b>default password</b>. Open <b>Account</b> and change it now.'}));main.append($('h1',{textContent:title}),...c)};
/* ================= rich text ================= */
function rte(html,onChange){const wrap=$('div',{className:'rte'}),bar=$('div',{className:'rtb'}),ed=$('div',{className:'rted body',contentEditable:'true'});
 ed.innerHTML=A.clean(html||'<p></p>');ed.querySelectorAll('.vid').forEach(v=>v.contentEditable='false');
 let rg;const bub=$('div',{className:'rtbub'});bub.style.display='none';document.body.append(bub);
 const saveSel=()=>{const s=getSelection();if(s.rangeCount&&ed.contains(s.anchorNode)){rg=s.getRangeAt(0).cloneRange();return s}return null};
 const restore=()=>{ed.focus();if(rg){const s=getSelection();s.removeAllRanges();s.addRange(rg)}};
 const cmd=(c,v)=>{restore();document.execCommand('styleWithCSS',false,true);document.execCommand(c,false,v);onChange();saveSel()};
 const onSel=()=>{if(!document.contains(ed)){document.removeEventListener('selectionchange',onSel);bub.remove();return}
  const s=saveSel();if(!s||s.isCollapsed){bub.style.display='none';return}
  const r=s.getRangeAt(0).getBoundingClientRect();bub.style.display='flex';
  bub.style.left=Math.max(8,Math.min(innerWidth-bub.offsetWidth-8,r.left+r.width/2-bub.offsetWidth/2))+'px';bub.style.top=Math.max(8,r.top-bub.offsetHeight-8)+'px'};
 document.addEventListener('selectionchange',onSel);
 const anchorsHere=()=>[...ed.querySelectorAll('[id^="anc-"]')].map(x=>x.id.slice(4));
 const blockOf=n=>{n=n&&n.nodeType===3?n.parentElement:n;return n?n.closest('p,h2,h3,li,blockquote,div'):null};
 async function doLink(){restore();const r=rg,collapsed=!r||r.collapsed;let n=r?r.commonAncestorContainer:ed;n=n.nodeType===3?n.parentElement:n;const ael=n.closest('a[href]');
  const res=await linkDialog({href:ael?ael.getAttribute('href'):'',newTab:ael?ael.target==='_blank':null,anchors:anchorsHere(),needText:collapsed&&!ael,hasLink:!!ael});
  if(!res)return;restore();
  if(res.remove){if(ael){const rr=document.createRange();rr.selectNodeContents(ael);const sl=getSelection();sl.removeAllRanges();sl.addRange(rr)}document.execCommand('unlink');onChange();return}
  if(res.text&&collapsed&&!ael){document.execCommand('insertHTML',false,`<a href="${E(res.href)}"${res.newTab?' target="_blank"':''}>${E(res.text)}</a>`);onChange();return}
  if(ael){ael.setAttribute('href',res.href);if(res.newTab)ael.setAttribute('target','_blank');else ael.removeAttribute('target');onChange();return}
  document.execCommand('createLink',false,'#__tmp__');ed.querySelectorAll('a[href="#__tmp__"]').forEach(a=>{a.setAttribute('href',res.href);if(res.newTab)a.setAttribute('target','_blank');else a.removeAttribute('target')});onChange()}
 async function doAnchor(){restore();const r=rg,collapsed=!r||r.collapsed;
  const res=await anchorDialog({anchors:anchorsHere(),hasSel:!collapsed});if(!res)return;restore();
  if(res.remove){const el=ed.querySelector('[id="anc-'+res.remove+'"]');if(el){el.removeAttribute('id');if(el.tagName==='SPAN'&&el.classList.contains('anchor'))el.replaceWith(...[...el.childNodes]);else el.classList.remove('anchor')}onChange();return}
  let name=A.slug(res.add)||'anchor',n=2;const b0=name;while(ed.querySelector('[id="anc-'+name+'"]'))name=b0+'-'+n++;
  if(!collapsed){const d=document.createElement('div');d.append(r.cloneContents());document.execCommand('insertHTML',false,`<span id="anc-${name}" class="anchor">${d.innerHTML}</span>`)}
  else{const blk=blockOf(r?r.startContainer:ed);if(blk&&blk!==ed)blk.id='anc-'+name;else document.execCommand('insertHTML',false,`<span id="anc-${name}" class="anchor">&#8203;</span>`)}
  onChange()}
 async function doVideo(){saveSel();const at=rg?rg.endContainer:null;const r=await videoDialog(null);if(!r)return;const blk=blockOf(at),html=`<div class="vid" ${vidAttrs(r)} contenteditable="false"></div><p><br></p>`;if(blk&&blk!==ed&&ed.contains(blk))blk.insertAdjacentHTML('afterend',html);else ed.insertAdjacentHTML('beforeend',html);ed.querySelectorAll('.vid').forEach(v=>v.contentEditable='false');onChange()}
 const b=(t,title,f)=>$('button',{type:'button',title,innerHTML:t,onmousedown:e=>e.preventDefault(),onclick:f});
 bub.append(b('<b>B</b>','Bold',()=>cmd('bold')),b('<i>I</i>','Italic',()=>cmd('italic')),b('<u>U</u>','Underline',()=>cmd('underline')),b('🔗 Link','Add or edit a link',doLink),b('⚓ Anchor','Add an anchor point',doAnchor),b('✖','Remove link',()=>cmd('unlink')));
const fxColor=$('input',{type:'color',title:'Effect colour (used by Shadow, Outline and Glow)',value:'#000000'});
 const doFx=kind=>{restore();const s=getSelection();if(!s.rangeCount||s.isCollapsed||!ed.contains(s.anchorNode))return;const c=fxColor.value,d=document.createElement('div');d.append(s.getRangeAt(0).cloneContents());
  if(kind==='Remove effects'){d.querySelectorAll('[style]').forEach(n=>{['text-shadow','-webkit-text-stroke','paint-order','background-color'].forEach(p=>n.style.removeProperty(p))});document.execCommand('insertHTML',false,d.innerHTML)}
  else{const css={Shadow:'text-shadow:.05em .06em .08em '+c,Glow:'text-shadow:0 0 .15em '+c+',0 0 .35em '+c,Outline:'-webkit-text-stroke:.03em '+c+';paint-order:stroke fill'}[kind];document.execCommand('insertHTML',false,'<span style="'+css+'">'+d.innerHTML+'</span>')}
  onChange();saveSel()};
 bar.append(b('<b>B</b>','Bold',()=>cmd('bold')),b('<i>I</i>','Italic',()=>cmd('italic')),b('<u>U</u>','Underline',()=>cmd('underline')),
  $('select',{title:'Font for selected text',onchange:e=>{if(e.target.value)cmd('fontName',e.target.value);e.target.value=''}},[$('option',{value:'',textContent:'Font…'}),...['Arial','Georgia','Verdana','Tahoma','Trebuchet MS','Times New Roman','Courier New','Chomsky Custom','Chomsky','Lora','Poppins','Palatino Linotype','Garamond','Baskerville','Didot','Cambria','Century Gothic','Gill Sans','Lucida Sans','Segoe UI','Impact','Brush Script MT','Copperplate'].map(f=>$('option',{value:f,textContent:f}))]),
  $('input',{type:'color',title:'Colour for selected text',value:'#c8102e',onchange:e=>cmd('foreColor',e.target.value)}),
  $('input',{type:'color',title:'Highlight (background) colour for selected text',value:'#ffe066',onchange:e=>cmd('hiliteColor',e.target.value)}),
  fxColor,$('select',{title:'Effect for selected text (uses the effect colour)',onchange:e=>{if(e.target.value)doFx(e.target.value);e.target.value=''}},[$('option',{value:'',textContent:'Effect…'}),...['Shadow','Outline','Glow','Remove effects'].map(f=>$('option',{value:f,textContent:f}))]),
  b('🔗 Link','Add or edit a link (web, page, article, anchor, email, phone)',doLink),b('⚓ Anchor','Add or remove an anchor point',doAnchor),b('Unlink','Remove the link',()=>cmd('unlink')),b('▶ Video','Add a YouTube video or upload a video',doVideo),
  b('Quote','Quote',()=>cmd('formatBlock','blockquote')),b('H2','Heading',()=>cmd('formatBlock','h2')),b('Text','Normal paragraph',()=>cmd('formatBlock','p')),
  b('• List','Bullet list',()=>cmd('insertUnorderedList')),b('Clear','Remove formatting',()=>cmd('removeFormat')));
 ed.addEventListener('input',onChange);
 ed.addEventListener('click',async e=>{const v=e.target.closest('.vid');if(!v)return;e.preventDefault();const r=await videoDialog(readVid(v));if(!r)return;if(r.remove)v.remove();else{['k','id','src','w','a','r','c','ap','lp'].forEach(x=>v.removeAttribute('data-'+x));const t=document.createElement('div');t.innerHTML=`<div ${vidAttrs(r)}></div>`;[...t.firstChild.attributes].forEach(a=>v.setAttribute(a.name,a.value))}onChange()});
 ed.addEventListener('paste',e=>{e.preventDefault();document.execCommand('insertText',false,(e.clipboardData||window.clipboardData).getData('text'))});
 wrap.append(bar,ed);return {el:wrap,get:()=>A.clean(ed.innerHTML)}}
/* ================= tabs ================= */
const newArt=()=>({category:(D().menu[1]||{}).label||'',title:'',summary:'',image:'',url:'',slug:'',body:'<p></p>',flags:Object.fromEntries(Object.keys(FLAGS).map(k=>[k,false]))});
function articles(){const d=D(),tb=$('table',{className:'tbl'},$('tr',{},...['Title','Category','Web address','Shown in','Actions'].map(h=>$('th',{textContent:h}))));
 const mv=(i,x)=>{const j=i+x;if(j<0||j>=d.articles.length)return;[d.articles[i],d.articles[j]]=[d.articles[j],d.articles[i]];ch();articles()};
 d.articles.forEach((a,i)=>tb.append($('tr',{},$('td',{textContent:a.title}),$('td',{textContent:a.category}),$('td',{textContent:A.artPath(a)}),$('td',{textContent:Object.keys(FLAGS).filter(k=>a.flags&&a.flags[k]).map(k=>FLAGS[k]).join(', ')||'-'}),
  $('td',{className:'act'},btn('Edit',()=>{work={i,art:a};go('editor')}),btn('↑',()=>mv(i,-1)),btn('↓',()=>mv(i,1)),btn('Delete',()=>{if(confirm('Delete "'+a.title+'"?')){d.articles.splice(i,1);ch();articles()}},'del')))));
 panel('Articles',btn('+ New article',()=>{work={i:-1,art:newArt()};go('editor')},'primary'),tb)}
function editor(){const d=D();if(!work)work={i:-1,art:newArt()};const a=work.art;a.flags=a.flags||{};
 const startSlug=a.slug||'';let auto=!a.slug||a.slug===A.aslug(a.title);   /* the web address follows the headline until you type your own */
 const taken=(s,self)=>d.articles.some(x=>x!==self&&(A.artSlug(x)===s||(x.aliases||[]).includes(s)));
 const uniq=(b,self)=>{b=b||'story';let s=b,n=2;while(taken(s,self))s=b+'-'+n++;return s};
 let r,showAddr=()=>{};
 const setSlug=s=>{a.slug=s;a.aliases=(a.aliases||[]).filter(x=>x!==s);if(startSlug&&startSlug!==s&&!a.aliases.includes(startSlug))a.aliases.push(startSlug);if(!a.aliases.length)delete a.aliases;showAddr()};
 const commit=()=>{if(!a.title.trim())return;if(work.i<0){a.slug=uniq(A.aslug(a.title));d.articles.unshift(a);work.i=0;auto=true}else if(auto){const s=uniq(A.aslug(a.title),a);if(s!==a.slug)setSlug(s)}if(!a.slug)setSlug(uniq(A.aslug(a.title),a));if(r)a.body=r.get();showAddr();ch()};
 const dl=$('datalist',{id:'cats'},[...new Set(d.menu.slice(1).map(m=>m.label).concat(d.articles.map(x=>x.category)))].map(c=>$('option',{value:c})));
 const t=$('label',{className:'f'},$('span',{textContent:'Title (the article is published as soon as it has a title)'}),$('input',{type:'text',value:a.title,oninput:e=>{a.title=e.target.value;commit()}}));
 const c=$('label',{className:'f'},$('span',{textContent:'Category (pick one or type a new one)'}),$('input',{type:'text',value:a.category,oninput:e=>{a.category=e.target.value;commit()}}));c.lastChild.setAttribute('list','cats');
 const s=$('label',{className:'f'},$('span',{textContent:'Summary (shown on cards and under the headline)'}),$('textarea',{value:a.summary,oninput:e=>{a.summary=e.target.value;commit()}}));
 const im=imgField(a,'image','Image');

 const origin=/^https?:/.test(location.protocol)?location.origin:'https://yourwebsite.com';
 const addrBox=$('div',{className:'hint'}),addrIn=$('input',{type:'text',placeholder:'web-address-of-this-story',oninput:e=>{auto=false;const v=e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/-{2,}/g,'-');if(v!==e.target.value)e.target.value=v;const f=v.replace(/^-+|-+$/g,'');if(!f||work.i<0)return;if(taken(f,a)){addrBox.textContent='That address is already used by another story.';return}setSlug(f);ch()},onblur:e=>{e.target.value=a.slug||''}});
 showAddr=()=>{addrIn.disabled=work.i<0;if(document.activeElement!==addrIn)addrIn.value=a.slug||'';addrBox.textContent=work.i<0?'The web address is created from the headline as soon as you type it.':'Full address: '+origin+A.artPath(a)+((a.aliases||[]).length?'   (old addresses that still work: '+a.aliases.map(x=>'/'+x).join(', ')+')':'')};
 const ad=$('div',{className:'f'},$('span',{textContent:'Web address of this story (made from the headline automatically - the category goes in front of it)'}),addrIn,addrBox,
  $('div',{className:'row'},btn('Copy address',async()=>{const full=origin+A.artPath(a);try{await navigator.clipboard.writeText(full);status('Address copied ✓')}catch(e){prompt('Copy this address:',full)}}),btn('Make it match the headline again',()=>{if(work.i<0||!a.title.trim())return;auto=true;setSlug(uniq(A.aslug(a.title),a));ch()})));
 showAddr();
 const ur=$('label',{className:'f'},$('span',{textContent:'Open a different website instead (leave EMPTY for normal stories - only for a story that lives on another website)'}),$('input',{type:'text',value:a.url||'',oninput:e=>{a.url=e.target.value;commit()}}));
 const fl=$('fieldset',{},$('legend',{textContent:'Show this article in'}),Object.keys(FLAGS).map(k=>$('label',{className:'f chk'},$('input',{type:'checkbox',checked:!!a.flags[k],onchange:e=>{a.flags[k]=e.target.checked;commit()}}),' '+FLAGS[k])));
 r=rte(a.body,commit);
 panel(work.i<0?'New article':'Edit article',dl,t,c,ad,s,im,ur,fl,$('div',{className:'f'},$('span',{textContent:'Article text'}),r.el),
  $('div',{className:'row'},btn('← Back to articles',()=>{commit();work=null;go('articles')},'primary'),btn('Delete article',()=>{if(work.i>=0&&confirm('Delete this article?')){d.articles.splice(work.i,1);ch()}work=null;go('articles')},'del')))}
function images(){const found=[];(function walk(o,trail){for(const k in o){const v=o[k];if(typeof v==='string'&&/image|logo/i.test(k)&&/^(images\/|data:image|https?:)/.test(v))found.push({o,k,label:o.title||o.name||(trail+k)});else if(v&&typeof v==='object')walk(v,k+' › ')}})(D(),'');
 const grid=$('div',{className:'igrid'});found.forEach(f=>{const im=$('img',{src:f.o[f.k]});const c=$('div',{className:'icard'},im,$('div',{className:'cap',textContent:f.label}),$('div',{className:'row'},
  btn('Edit / resize',()=>editThen(f.o[f.k],f.o[f.k].split('/').pop(),u=>{set(f.o,f.k,u);im.src=u})),btn('Replace',()=>chooseImage(u=>{set(f.o,f.k,u);im.src=u}))));grid.append(c)});
 panel('Images',$('p',{className:'hint',textContent:'Every picture used on the site. Edit / resize crops, rotates and resizes while keeping the shape, then saves it to the site instantly.'}),grid)}
function account(){const d=D(),msg=$('div',{className:'msg'});
 const cur=$('input',{type:'password',autocomplete:'current-password',placeholder:'Current password'}),u=$('input',{type:'text',autocomplete:'username',placeholder:'New username (leave empty to keep it)'}),p1=$('input',{type:'password',autocomplete:'new-password',placeholder:'New password (at least 8 characters)'}),p2=$('input',{type:'password',autocomplete:'new-password',placeholder:'Repeat new password'});
 const show=(t,bad)=>{msg.textContent=t;msg.className='msg '+(bad?'bad':'ok')};
 panel('Account',$('p',{className:'hint',textContent:'Change your username and/or password. Your current password is needed to confirm it is you.'}),
  $('label',{className:'f'},$('span',{textContent:'Current password'}),cur),$('label',{className:'f'},$('span',{textContent:'New username'}),u),$('label',{className:'f'},$('span',{textContent:'New password'}),p1),$('label',{className:'f'},$('span',{textContent:'Repeat new password'}),p2),
  btn('Update login details',async()=>{show('');
   if(!cur.value)return show('Enter your current password.',true);
   if(!u.value.trim()&&!p1.value)return show('Type a new username or a new password.',true);
   if(p1.value||p2.value){if(p1.value!==p2.value)return show('The new passwords do not match.',true);if(p1.value.length<8)return show('Use at least 8 characters for the new password.',true)}
   show('Updating…');const r=await A.api('api/account',{current:cur.value,user:u.value.trim(),password:p1.value});
   if(r.ok){if(r.token)localStorage.setItem('ama-token',r.token);isDefault=false;const wn=main.querySelector('.warn');if(wn)wn.remove();show('Done. Your login details are updated.');cur.value=u.value=p1.value=p2.value=''}else show(r.error||'Could not update.',true)},'primary'),msg,
  $('h3',{textContent:'Session'}),btn('Log out',()=>A.logout()),$('h3',{textContent:'About this site'}),$('p',{className:'hint',textContent:'Site code version '+A.version+'. (You can also see it at the top of yourwebsite.com/script.js - handy for checking that an upload really went live.)'}),...(A.backend()?[$('h3',{textContent:'Content & GitHub'}),$('p',{className:'hint',textContent:'Edits you make here are saved on Cloudflare. If you change data/content.js in GitHub, the website switches to that version automatically (the previous online version is kept as a backup). You can also move content between the two yourself:'}),
  btn('Download online content as content.js (to upload to GitHub)',()=>{const x=$('a',{href:URL.createObjectURL(new Blob(['window.SITE_DATA='+JSON.stringify(D(),null,1)+';\n'],{type:'text/javascript'})),download:'content.js'});x.click()}),
  btn('Replace online content with the version in GitHub',async()=>{if(!confirm('This replaces everything edited online with the content.js from GitHub. The current online version is kept as a backup you can restore. Continue?'))return;const r=await A.api('api/reset-content',{});if(r.ok)location.reload();else alert(r.error||'Could not do that.')}),
  btn('Restore the previous online version',async()=>{if(!confirm('Go back to the earlier online version that was replaced?'))return;const r=await A.api('api/restore-content',{});if(r.ok)location.reload();else alert(r.error||'Could not do that.')})]:[$('h3',{textContent:'Save into content.js automatically'}),$('p',{className:'hint',textContent:'Works in Google Chrome or Microsoft Edge. Connect your website folder once and every edit (and uploaded picture) is written straight into data/content.js and the images folder - no extra program needed.'}),
  (()=>{const st=$('p',{className:'hint',textContent:'Status: '+A.fs.label().replace('📁 ','')});return $('div',{},st,btn('Connect / reconnect site folder',async()=>{await A.fs.click();st.textContent='Status: '+A.fs.label().replace('📁 ','')},'primary'),btn('Choose a different folder',async()=>{await A.fs.change();st.textContent='Status: '+A.fs.label().replace('📁 ','')}))})(),
  $('h3',{textContent:'Backup'}),$('p',{className:'hint',textContent:'Offline edits live in this browser. This downloads them as content.js (it replaces data/content.js in the site folder).'}),btn('Download backup (content.js)',()=>{const d=D();const x=$('a',{href:URL.createObjectURL(new Blob(['window.SITE_DATA='+JSON.stringify(d,null,1)+';\n'],{type:'text/javascript'})),download:'content.js'});x.click()})]))}
/* ---- pages and sub-pages ---- */
let pwork=null;
const newPage=parent=>({slug:'',title:'',parent:parent||'',inMenu:false,body:'<p></p>'});
function pagesView(){const d=D();d.pages=d.pages||[];const P=d.pages;
 const tops=P.filter(p=>!p.parent),order=[];tops.forEach(t=>{order.push(t);P.filter(c=>c.parent===t.slug).forEach(c=>order.push(c))});P.filter(p=>p.parent&&!tops.some(t=>t.slug===p.parent)).forEach(o=>order.push(o));
 const mv=(p,dir)=>{const sib=P.filter(x=>x.parent===p.parent),k=sib.indexOf(p)+dir;if(k<0||k>=sib.length)return;const i1=P.indexOf(p),i2=P.indexOf(sib[k]);[P[i1],P[i2]]=[P[i2],P[i1]];ch();pagesView()};
 const tb=$('table',{className:'tbl'},$('tr',{},...['Page','Address','In menu','Actions'].map(h=>$('th',{textContent:h}))));
 order.forEach(p=>tb.append($('tr',{},$('td',{textContent:(p.parent?'↳ ':'')+p.title,style:p.parent?'padding-left:30px':''}),$('td',{textContent:A.pagePath(p)}),$('td',{textContent:p.inMenu?'Yes':'-'}),
  $('td',{className:'act'},btn('Edit',()=>{pwork={i:P.indexOf(p),page:p};go('pageeditor')}),btn('↑',()=>mv(p,-1)),btn('↓',()=>mv(p,1)),
   btn('+ Sub-page',()=>{if(p.parent){alert('Sub-pages go under a main page. Choose a main page.');return}pwork={i:-1,page:newPage(p.slug)};go('pageeditor')}),
   btn('Delete',()=>{const n=P.filter(c=>c.parent===p.slug).length;if(confirm('Delete "'+p.title+'"'+(n?' and its '+n+' sub-page'+(n>1?'s':''):'')+'?')){d.pages=P.filter(c=>c!==p&&c.parent!==p.slug);ch();pagesView()}},'del')))));
 panel('Pages',$('p',{className:'hint',textContent:'Create pages and sub-pages. Turn on "Show in menu" to put a page in the main menu; its sub-pages (also set to show in menu) appear in a dropdown under it.'}),
  $('div',{className:'row'},btn('+ New page',()=>{pwork={i:-1,page:newPage('')};go('pageeditor')},'primary')),tb)}
function pageEditor(){const d=D();d.pages=d.pages||[];if(!pwork)pwork={i:-1,page:newPage('')};const p=pwork.page;let r;
 const commit=()=>{if(!p.title.trim())return;if(pwork.i<0){let s=A.slug(p.title)||'page',n=2;if(A.catBySlug(s)||['admin','api','images','videos','fonts','data','search','login'].includes(s))s+='-page';const b=s;while(d.pages.some(x=>x.slug===s))s=b+'-'+n++;p.slug=s;d.pages.push(p);pwork.i=d.pages.length-1}if(!p.slug)p.slug=A.slug(p.title);if(r)p.body=r.get();ch();addr.textContent='Address: '+(p.slug?A.pagePath(p):'(created when you type a title)')};
 const addr=$('div',{className:'hint',textContent:'Address: '+(p.slug?A.pagePath(p):'(created when you type a title)')});
 const t=$('label',{className:'f'},$('span',{textContent:'Page title (the page is published as soon as it has a title)'}),$('input',{type:'text',value:p.title,oninput:e=>{p.title=e.target.value;commit()}}));
 const hasKids=d.pages.some(c=>c.parent===p.slug&&p.slug);
 const opts=[['','None - this is a main page'],...d.pages.filter(x=>!x.parent&&x!==p).map(x=>[x.slug,x.title])];
 const par=$('label',{className:'f'},$('span',{textContent:'Parent page'+(hasKids?' (this page has sub-pages, so it stays a main page)':'')}),$('select',{disabled:hasKids,onchange:e=>{p.parent=e.target.value;commit()}},opts.map(([v,l])=>$('option',{value:v,textContent:l,selected:v===p.parent}))));
 const mn=$('label',{className:'f chk'},$('input',{type:'checkbox',checked:!!p.inMenu,onchange:e=>{p.inMenu=e.target.checked;commit()}}),' Show in the main menu');
 r=rte(/<[a-z][\s\S]*>/i.test(p.body||'')?p.body:('<p>'+E(p.body||'').replace(/\n\s*\n/g,'</p><p>')+'</p>'),commit);
 panel(pwork.i<0?'New page':'Edit page',t,addr,par,mn,$('div',{className:'f'},$('span',{textContent:'Page text'}),r.el),
  $('div',{className:'row'},btn('← Back to pages',()=>{commit();pwork=null;go('pages')},'primary'),btn('Delete page',()=>{if(pwork.i>=0&&confirm('Delete this page'+(hasKids?' and its sub-pages':'')+'?')){d.pages=d.pages.filter(c=>c!==p&&c.parent!==p.slug);ch()}pwork=null;go('pages')},'del')))}
const TAB={articles,editor,images,account,
 site:()=>panel('Header & Site',$('p',{className:'hint',textContent:'Header Image is the picture above the menu; it scales down on small screens so it stays fully visible. "Login Button": auto = shown on your computer, hidden on the live website (you can still log in at /#/login).'}),field(D(),'site'),field(D(),'topLinks')),
 ticker:()=>panel('Breaking News',field(D(),'ticker')),
 nav:()=>panel('Navigation',$('p',{className:'hint',textContent:'These are the category links. Leave Url empty to open the category page. Pages you mark "Show in the main menu" (Pages tab) are added after these, with dropdowns for sub-pages. On phones and tablets the menu becomes a hamburger button.'}),field(D(),'menu')),
 home:()=>panel('Home Layout',$('p',{className:'hint',textContent:'Under Blocks press "+ Add" to create another section. Choose what it shows with Flag or Category, and set its Columns.'}),field(D(),'home'),field(D(),'promo'),field(D(),'labels')),
 footer:()=>panel('Footer',field(D(),'footer')),

 pages:()=>pagesView(),pageeditor:()=>pageEditor()};
/* ================= block editor (side drawer, live preview on the page) ================= */
function closeBlock(quiet){const d=document.getElementById('bed');if(d)d.remove();live=null;if(!quiet)A.render()}
function editBlock(b){closeBlock(true);const NAMES={text:'Text block',image:'Image block',columns:'Columns block',button:'Button',video:'Video',divider:'Divider',spacer:'Spacer',anchor:'Anchor point',bento:'Bento (article section)'};
 const hint={video:'Paste a YouTube or Vimeo link, or upload a video from your device. Width, shape and alignment resize it.',image:'Choose an image, then use Width and Align to resize and place it. Add a link to make it clickable.',columns:'Each column has its own title, text and optional image. Use "+ Add" below to add more columns.',anchor:'An anchor is an invisible named spot. Link to it from anywhere with Link > Anchor.'}[b.type];
 const dr=$('div',{id:'bed'},$('div',{className:'bedh'},$('h2',{textContent:NAMES[b.type||'bento']}),btn('Done',()=>closeBlock(),'primary')),...(hint?[$('p',{className:'hint',textContent:hint})]:[]),...Object.keys(b).filter(k=>k!=='type').map(k=>field(b,k)),
  $('div',{className:'row'},btn('Delete block',()=>{if(confirm('Delete this block?')){A.removeBlock(b);closeBlock(true)}},'del')));
 let t;live=()=>{clearTimeout(t);t=setTimeout(()=>A.render(),250)};document.body.append(dr)}
function editHeader(){closeBlock(true);const S=D().site,fs=(t,keys)=>$('fieldset',{},$('legend',{textContent:t}),...keys.map(k=>field(S,k)));
 const dr=$('div',{id:'bed'},$('div',{className:'bedh'},$('h2',{textContent:'Site name & tagline'}),btn('Done',()=>closeBlock(),'primary')),
  $('p',{className:'hint',textContent:'Changes show live on the page and save automatically. Each setting only changes the item it belongs to.'}),
  fs('Site name',['headerTitle','headerFont','headerTitleWeight','headerTitleItalic','headerTitleUnderline','headerTitleCase','headerTitleSpacing','headerTitleSize','headerTitleColor']),
  field(S,'titleFx'),
  fs('Tagline',['headerTagline','headerTaglineColor','headerTaglineSize']),
  field(S,'taglineFx'),
  $('div',{className:'row'},btn('All header settings…',()=>{closeBlock(true);open('site')})));
 let t;live=()=>{clearTimeout(t);t=setTimeout(()=>A.render(),250)};document.body.append(dr)}
/* ================= shell ================= */
function go(t){tab=t;const tn=t==='pageeditor'?'pages':t;[...root.querySelectorAll('.sb .tb')].forEach(b=>b.classList.toggle('on',b.dataset.t===tn));TAB[t]();main.scrollTop=0}
async function open(t,arg){if(root)close(true);
 if(t==='editor'&&arg){const a=A.findArt(arg);if(a)work={i:D().articles.indexOf(a),art:a}}
 st=$('div',{className:'st',textContent:'All changes saved ✓'});A.onStatus=status;main=$('div',{className:'mn'});
 root=$('div',{id:'admin'},$('div',{className:'sb'},$('div',{className:'brand',innerHTML:E(D().site.name)+'<small>Admin</small>'}),
  ...TABS.map(([k,l])=>{const b=$('button',{className:'tb',type:'button',textContent:l,onclick:()=>{if(k==='editor'&&tab!=='editor')work=null;go(k)}});b.dataset.t=k;return b}),
  $('div',{className:'sp'}),st,btn('📱 Preview sizes',()=>A.openPreview()),btn('← Back to site',()=>close()),btn('Log out',()=>A.logout())),main);
 document.body.append(root);document.body.style.overflow='hidden';
 const me=await A.api('api/me',{});isDefault=!!me.isDefault;if(root)go(t||'articles')}
function close(quiet){closeBlock(true);if(root){root.remove();root=null}document.body.style.overflow='';A.onStatus=null;work=null;pwork=null;if(!quiet)A.render()}
window.Admin={open,close,editBlock,editHeader};
})();
