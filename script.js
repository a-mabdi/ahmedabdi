/* The Somaliland Age - site renderer, routing, login, instant saving. The dashboard lives in admin.js (loaded only after login). Code version 2.0.2 */
(()=>{
const CODE_VERSION='2.0.8';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

/* ---- web addresses ----
   Online / local server:   /world/the-headline-words      (category / headline)
   Double-click index.html: index.html#/world/the-headline-words   (same address, kept after the #)
   Old links such as #/a/some-slug, #/c/World, #/p/about are still understood and upgraded automatically. */
const FILEMODE=location.protocol==='file:';
const dec=s=>{try{return decodeURIComponent(s)}catch(e){return s}};
const hash32=s=>[...String(s||'')].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7).toString(36);
const aslug=s=>{let t=slug(s);if(t.length>90){t=t.slice(0,90);const i=t.lastIndexOf('-');if(i>40)t=t.slice(0,i)}return t};
const artSlug=a=>String(a.slug||aslug(a.title)||'story-'+hash32(a.title)).toLowerCase();
const catSlug=s=>slug(s)||'news';
const findArt=s=>{s=String(s||'').toLowerCase();return D.articles.find(a=>artSlug(a)===s)||D.articles.find(a=>(a.aliases||[]).some(x=>String(x).toLowerCase()===s))};
const find=findArt;
const allCats=()=>{const out=[],seen={};(D.menu||[]).filter(m=>m.label!=='Home').map(m=>m.label).concat(D.articles.map(a=>a.category)).forEach(c=>{const k=catSlug(c);if(c&&!seen[k]){seen[k]=1;out.push(c)}});return out};
const catBySlug=s=>allCats().find(c=>catSlug(c)===String(s||'').toLowerCase());
const pageBySlug=(s,par)=>{s=String(s||'').toLowerCase();return (D.pages||[]).find(p=>p.slug===s&&(par===undefined||(p.parent||'')===par))};
const artPath=a=>'/'+catSlug(a.category)+'/'+artSlug(a);
const pagePath=p=>'/'+(p.parent?p.parent+'/':'')+p.slug;
const url=p=>FILEMODE?'#'+p.replace('#~','~'):p;
function internal(h){h=String(h==null?'':h).trim();if(!h||h==='#')return null;let m;
 if(h==='#/'||h==='/')return '/';
 if(m=h.match(/^#\/a\/([^~]+)(?:~(.+))?$/)){const s=dec(m[1]),a=findArt(s);return a?artPath(a)+(m[2]?'#~'+m[2]:''):'/search/'+encodeURIComponent(s.replace(/-/g,' '))}
 if(m=h.match(/^#\/c\/([^~]+)$/))return '/'+catSlug(dec(m[1]));
 if(m=h.match(/^#\/p\/([^~]+)(?:~(.+))?$/)){const p=pageBySlug(dec(m[1]));return (p?pagePath(p):'/'+slug(dec(m[1])))+(m[2]?'#~'+m[2]:'')}
 if(m=h.match(/^#\/s\/(.+)$/))return '/search/'+m[1];
 if(/^#\/[^/]/.test(h))return h.slice(1).replace('~','#~');
 if(/^\/(?!\/)/.test(h)){if(/^\/(images|videos|fonts|data|api)\//.test(h)||/\.[a-z0-9]{2,5}([?#].*)?$/i.test(h))return null;return h}
 return null}
function fixLinks(root){root.querySelectorAll('a[href]').forEach(a=>{const h=a.getAttribute('href');if(!h||/^#~/.test(h))return;const p=internal(h);if(p!==null)a.setAttribute('href',url(p))})}
function curPath(){let p,an='';
 if(FILEMODE){const h=location.hash.replace(/^#/,'');p=h.charAt(0)==='/'?h:'/';const i=p.indexOf('~');if(i>=0){an=dec(p.slice(i+1));p=p.slice(0,i)}}
 else{p=location.pathname;if(/^#~/.test(location.hash))an=dec(location.hash.slice(2))}
 return {segs:p.split('/').filter(Boolean).map(dec),an,q:FILEMODE?'':(new URLSearchParams(location.search).get('q')||'')}}
function nav(p,rep){p=String(p||'/');
 if(FILEMODE){const t='#'+p.replace('#~','~');if(rep){history.replaceState(null,'',location.pathname+location.search+t);return}if(location.hash===t){route();scrollTo(0,0)}else location.hash=t;return}
 if(rep){history.replaceState(null,'',p);return}
 if(p!==location.pathname+location.search+location.hash)history.pushState(null,'',p);route();scrollTo(0,0)}
function resolve(segs,cp){if(!segs.length)return {k:'home'};const s0=segs[0],s1=segs[1];
 if(s0==='search')return {k:'search',q:segs.slice(1).join(' ')||(cp&&cp.q)||''};
 if(s0==='login'&&segs.length===1)return {k:'login'};
 if(segs.length===1){const c=catBySlug(s0);if(c)return {k:'cat',c};const p=pageBySlug(s0);if(p)return {k:'page',p};const a=findArt(s0);if(a)return {k:'art',a};return {k:'nf',q:s0}}
 if(segs.length===2){if(catBySlug(s0)){const a=findArt(s1);if(a)return {k:'art',a}}const p=pageBySlug(s1,s0);if(p)return {k:'page',p};const a=findArt(s1);if(a)return {k:'art',a};return {k:'nf',q:s1}}
 return {k:'nf',q:segs[segs.length-1]}}
function upgradeLegacy(){const h=location.hash;if(!/^#\/./.test(h))return;if(FILEMODE&&!/^#\/(a|c|p|s)\//.test(h))return;const p=internal(h);if(p===null)return;
 if(FILEMODE)history.replaceState(null,'',location.pathname+location.search+'#'+p.replace('#~','~'));else history.replaceState(null,'',p)}
/* clicking an internal link changes the page without reloading it */
document.addEventListener('click',e=>{if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 const a=e.target.closest&&e.target.closest('a[href]');if(!a||a.target==='_blank'||a.hasAttribute('download')||a.closest('#admin,#bed,#ld,.rte,.rted,.rtbub'))return;
 const h=a.getAttribute('href');if(h==='#'){e.preventDefault();return}if(/^#~/.test(h))return;
 if(a.classList.contains('lg')&&logged())return;
 const p=internal(h);if(p===null)return;e.preventDefault();nav(p)});
/* ---- safe rich text ---- */
const OK=new Set('P BR B I U STRONG EM A BLOCKQUOTE H2 H3 UL OL LI SPAN DIV FONT'.split(' ')),DROP=new Set('SCRIPT STYLE IFRAME OBJECT EMBED LINK META SVG FORM INPUT'.split(' '));
const CSSOK=['color','font-family','font-weight','font-style','text-decoration','background-color','text-shadow','-webkit-text-stroke','paint-order'];
function clean(h){const t=document.createElement('template');t.innerHTML=h||'';
 (function w(n){[...n.childNodes].forEach(c=>{if(c.nodeType===3)return;if(c.nodeType!==1){c.remove();return}
  if(DROP.has(c.tagName)){c.remove();return}
  if(c.tagName==='DIV'&&c.classList.contains('vid')){const d=c.dataset,k=d.k,ok=(k==='yt'||k==='vm')?/^[A-Za-z0-9_-]{5,20}$/.test(d.id||''):(k==='file'&&/^(videos\/[A-Za-z0-9_\-.]+|data:video\/(mp4|webm|ogg|quicktime);base64,[A-Za-z0-9+\/=]+)$/.test(d.src||''));
   if(!ok){c.remove();return}
   const keep={k,id:k==='file'?'':d.id,src:k==='file'?d.src:'',w:Math.min(100,Math.max(10,+d.w||100)),a:['left','center','right'].includes(d.a)?d.a:'center',r:['16:9','4:3','3:2','1:1','21:9','9:16'].includes(d.r)?d.r:'16:9',c:d.c==='0'?0:1,ap:d.ap==='1'?1:0,lp:d.lp==='1'?1:0};
   [...c.attributes].forEach(a=>c.removeAttribute(a.name));c.className='vid';c.textContent='';Object.entries(keep).forEach(([x,y])=>{if(y!==''&&y!=null)c.setAttribute('data-'+x,y)});return}
  w(c);
  if(!OK.has(c.tagName)){c.replaceWith(...[...c.childNodes]);return}
  const st=[];CSSOK.forEach(p=>{const v=c.style.getPropertyValue(p);if(v&&!/url\(|expression/i.test(v))st.push(p+':'+v)});
  const href=c.tagName==='A'?c.getAttribute('href')||'':'',id=c.getAttribute('id')||'',tg=c.getAttribute('target')||'',cls=c.getAttribute('class')||'';
  [...c.attributes].forEach(a=>c.removeAttribute(a.name));
  if(st.length)c.setAttribute('style',st.join(';'));
  if(/^anc-[a-z0-9_-]{1,60}$/.test(id))c.setAttribute('id',id);
  if(c.tagName==='SPAN'&&cls==='anchor')c.setAttribute('class','anchor');
  if(c.tagName==='A'&&/^(https?:|mailto:|tel:|#|\/(?!\/))/i.test(href)){c.setAttribute('href',href);if(tg==='_blank'||(/^https?:/i.test(href)&&tg!=='_self')){c.target='_blank';c.rel='noopener'}}})})(t.content);
 return t.innerHTML}
/* ---- device-only mode: with no server, login and saving still work (stored in this browser) ---- */
function sha256(s){s=unescape(encodeURIComponent(s));
 const rr=(v,a)=>(v>>>a)|(v<<(32-a)),mp=Math.pow,mw=mp(2,32);let i,j,res='',words=[],bl=s.length*8,hash=[],k=[],pc=0,ic={};
 for(let c=2;pc<64;c++)if(!ic[c]){for(i=0;i<313;i+=c)ic[i]=c;hash[pc]=(mp(c,.5)*mw)|0;k[pc++]=(mp(c,1/3)*mw)|0}
 s+='\x80';while(s.length%64-56)s+='\x00';
 for(i=0;i<s.length;i++){j=s.charCodeAt(i);words[i>>2]|=j<<((3-i)%4)*8}
 words[words.length]=(bl/mw)|0;words[words.length]=bl;
 for(j=0;j<words.length;){const w=words.slice(j,j+=16),old=hash;hash=hash.slice(0,8);
  for(i=0;i<64;i++){const w15=w[i-15],w2=w[i-2],a=hash[0],e=hash[4];
   const t1=hash[7]+(rr(e,6)^rr(e,11)^rr(e,25))+((e&hash[5])^(~e&hash[6]))+k[i]+(w[i]=i<16?w[i]:(w[i-16]+(rr(w15,7)^rr(w15,18)^(w15>>>3))+w[i-7]+(rr(w2,17)^rr(w2,19)^(w2>>>10)))|0);
   const t2=(rr(a,2)^rr(a,13)^rr(a,22))+((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));
   hash=[(t1+t2)|0].concat(hash);hash[4]=(hash[4]+t1)|0}
  for(i=0;i<8;i++)hash[i]=(hash[i]+old[i])|0}
 for(i=0;i<8;i++)for(j=3;j+1;j--){const b=(hash[i]>>(j*8))&255;res+=(b<16?0:'')+b.toString(16)}
 return res}
const LA='ahmedabdi-local-auth',rs=()=>Math.random().toString(36).slice(2)+Date.now();
function localAuth(){let a=null;try{a=JSON.parse(localStorage.getItem(LA)||'null')}catch(e){}
 if(!a){const salt=rs();a={user:'admin',salt,hash:sha256(salt+'admin123'),isDefault:true};localStorage.setItem(LA,JSON.stringify(a))}return a}
const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open('ahmedabdi-local',1);r.onupgradeneeded=()=>r.result.createObjectStore('k');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function ldbGet(){try{localStorage.removeItem('ama-draft');const d=await idb();return await new Promise(ok=>{const q=d.transaction('k').objectStore('k').get('draft');q.onsuccess=()=>ok(q.result||null);q.onerror=()=>ok(null)})}catch(e){try{return JSON.parse(localStorage.getItem('ama-draft')||'null')}catch(e2){return null}}}
async function ldbSet(v){try{const d=await idb();await new Promise((ok,no)=>{const t=d.transaction('k','readwrite');t.objectStore('k').put(v,'draft');t.oncomplete=ok;t.onerror=()=>no(t.error)});return true}catch(e){try{localStorage.setItem('ama-draft',JSON.stringify(v));return true}catch(e2){return false}}}
/* ---- save straight into the site folder (Chrome / Edge): no extra program needed ---- */
const FS={h:null,ok:false,bk:false,supported:()=>!!window.showDirectoryPicker,
 async load(){try{const d=await idb();FS.h=await new Promise(ok=>{const q=d.transaction('k').objectStore('k').get('dir');q.onsuccess=()=>ok(q.result||null);q.onerror=()=>ok(null)})}catch(e){FS.h=null}return FS.h},
 async keep(h){try{const d=await idb();await new Promise((ok,no)=>{const t=d.transaction('k','readwrite');t.objectStore('k').put(h,'dir');t.oncomplete=ok;t.onerror=()=>no(t.error)})}catch(e){}},
 async perm(ask){if(!FS.h)return false;const o={mode:'readwrite'};try{if(await FS.h.queryPermission(o)==='granted')return true;if(ask&&await FS.h.requestPermission(o)==='granted')return true}catch(e){}return false},
 async sub(d,n){try{return await d.getDirectoryHandle(n)}catch(e){return null}},
 async has(d,n){try{await d.getFileHandle(n);return true}catch(e){return false}},
 async site(h){const ok=async d=>d&&await FS.has(d,'index.html')&&await FS.sub(d,'data')&&await FS.has(await FS.sub(d,'data'),'content.js');
  if(await ok(h))return h;for(const n of ['public','the-somaliland-age']){const s=await FS.sub(h,n);if(await ok(s))return s}return null},
 async connect(){let h;try{h=await window.showDirectoryPicker({id:'ahmedabdi-site',mode:'readwrite'})}catch(e){return {cancel:1}}
  const r=await FS.site(h);if(!r)return {error:'That is not the website folder. Choose the folder that contains index.html and the "data" folder (it is called "public" in the GitHub version).'};FS.h=r;await FS.keep(r);FS.ok=true;return {ok:true}},
 async write(rel,data){const p=rel.split('/'),name=p.pop();let d=FS.h;for(const x of p)d=await d.getDirectoryHandle(x,{create:true});const f=await d.getFileHandle(name,{create:true}),w=await f.createWritable();await w.write(data);await w.close()},
 async text(rel){try{const p=rel.split('/'),name=p.pop();let d=FS.h;for(const x of p)d=await d.getDirectoryHandle(x);return await (await (await d.getFileHandle(name)).getFile()).text()}catch(e){return null}}};
const fsLabel=()=>!FS.supported()?'📁 Auto-save needs Chrome or Edge':FS.ok?'📁 Saving into content.js ✓':FS.h?'📁 Click to reconnect saving':'📁 Connect site folder (one-time)';
function updateFsb(){const b=document.getElementById('fsb');if(b){b.textContent=fsLabel();b.classList.toggle('on',!!FS.ok)}}
async function fsClick(change){
 if(!FS.supported()){alert('Saving straight into content.js works in Google Chrome or Microsoft Edge on a computer. Open the site in one of them, or use Account > Download backup (content.js) to save your changes by hand.');return}
 if(FS.h&&!change&&await FS.perm(true)){FS.ok=true;updateFsb();AMA.ch();return}
 const r=await FS.connect();
 if(r.ok){updateFsb();AMA.ch();alert('Connected. Everything you edit is now saved straight into data/content.js in that folder (and uploaded pictures into its images folder).\n\nYour changes so far have just been written there too.')}
 else if(r.error)alert(r.error);
 else alert('The folder was not connected. If Chrome said it cannot open the folder, move the website folder somewhere else (not directly inside Downloads, Desktop or Documents) and try again.');
 updateFsb()}
async function localApi(path,b){const a=localAuth();
 if(path==='api/login'){if(b.user===a.user&&sha256(a.salt+(b.password||''))===a.hash)return {token:'local'};await new Promise(r=>setTimeout(r,600));return {error:'Wrong username or password'}}
 if(path==='api/me')return {ok:true,isDefault:!!a.isDefault};
 if(path==='api/content'){const kept=await ldbSet({base:window.SITE_DATA.rev,data:D});
  if(FS.h&&await FS.perm(false)){try{const rev=Date.now(),out=Object.assign({},D,{rev});
    if(!FS.bk){const old=await FS.text('data/content.js');if(old)await FS.write('data/content.previous.js',old);FS.bk=true}
    await FS.write('data/content.js','window.SITE_DATA='+JSON.stringify(out,null,1)+';\n');FS.ok=true;updateFsb();return {ok:true,local:true,file:true,rev}}catch(e){FS.ok=false;updateFsb()}}
  else if(FS.h){FS.ok=false;updateFsb()}
  return kept?{ok:true,local:true}:{error:'This browser could not store your changes (storage is full or blocked).'}}
 if(path==='api/upload'){const ext=((b.name||'').split('.').pop()||'').toLowerCase(),M={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',mp4:'video/mp4',m4v:'video/mp4',webm:'video/webm',mov:'video/quicktime',ogg:'video/ogg',woff2:'font/woff2',woff:'font/woff',ttf:'font/ttf',otf:'font/otf'};
  const kind=b.kind||'image';if(!M[ext]||(kind==='video'&&!/^video/.test(M[ext]))||(kind==='font'&&!/^font/.test(M[ext]))||(kind==='image'&&!/^image/.test(M[ext])))return {error:'That file type is not supported here.'};
  if(kind==='video'&&(b.data||'').length>16e6)return {error:'Offline mode can store videos up to about 12 MB. For bigger videos use a YouTube link, or the server version.'};
  if(FS.h&&await FS.perm(false)){try{const dir={image:'images',video:'videos',font:'fonts'}[kind]||'images',base=(b.name||'file').replace(/\.[^.]*$/,'').replace(/[^a-z0-9_-]/gi,'').slice(0,40)||'file',name=Date.now()+'-'+base+'.'+ext,bin=atob(b.data),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);await FS.write(dir+'/'+name,u);return {url:dir+'/'+name}}catch(e){}}
  return {url:'data:'+(kind==='video'&&ext==='mov'?'video/mp4':M[ext])+';base64,'+b.data}}
 if(path==='api/account'){if(sha256(a.salt+(b.current||''))!==a.hash)return {error:'Your current password is not correct.'};
  const user=String(b.user||'').trim()||a.user;if(user.length>60)return {error:'Username is too long.'};if(b.password&&String(b.password).length<8)return {error:'Use at least 8 characters for the new password.'};
  a.user=user;if(b.password){a.salt=rs();a.hash=sha256(a.salt+b.password)}a.isDefault=false;localStorage.setItem(LA,JSON.stringify(a));return {ok:true,token:'local'}}
 return {error:'Not available'}}
/* ---- state ---- */
const app=document.getElementById('app'),TK='ama-token';
let D=null,BACKEND=false,saving=false,again=false,pt;
const PREVIEW=window.name==='ama-preview';if(PREVIEW){document.body.classList.add('pvframe');document.documentElement.classList.add('pvframe')}
const tok=()=>PREVIEW?'':(localStorage.getItem(TK)||'');
const logged=()=>!!tok();
const isLocal=()=>location.protocol==='file:'||/^(localhost|127\.|\[::1\]|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)|\.local$|\.localhost$/.test(location.hostname);
let lastSt='Ready';
const status=(t,bad)=>{lastSt=t;if(AMA.onStatus)AMA.onStatus(t,bad);const el=document.getElementById('sv');if(el){el.textContent=t;el.className=bad?'bad':''}};
async function api(path,body){if(!BACKEND)return localApi(path,body);let r;try{r=await fetch(path,{method:'POST',headers:{Authorization:'Bearer '+tok()},body:JSON.stringify(body)})}catch(e){return {error:'Cannot reach the server.',network:1}}
 if(r.status===401&&path!=='api/login'){localStorage.removeItem(TK);status('Session expired - please log in again',true);if(window.Admin)Admin.close(true);render();loginModal('Your session expired. Please log in again.')}
 return r.json().catch(()=>({error:'Unexpected reply from the server.'}))}
async function push(){if(saving){again=true;return}saving=true;
 const r=await api('api/content',D);
 if(r&&r.ok){if(r.rev)D.rev=r.rev;status(r.file?'Saved into content.js ✓':r.local?'Saved in this browser only - not in content.js yet (click the 📁 button)':'All changes saved ✓')}else if(r&&r.network){status('Could not save - retrying…',true);setTimeout(push,3000)}else if(r&&!r.expired)status(r.error||'Could not save',true);
 saving=false;if(again){again=false;push()}}
const AMA=window.AMA={openPreview:()=>openPreview(),E,slug,clean,render,api,tok,logged,removeBlock,version:CODE_VERSION,aslug,artSlug,catSlug,artPath,pagePath,findArt,internal,nav,url,cats:allCats,catBySlug,pageBySlug,resolvePath:p=>resolve(String(p).split('#')[0].split('/').filter(Boolean).map(x=>dec(x).toLowerCase()),{q:''}),
 D:()=>D,backend:()=>BACKEND,fs:{supported:()=>FS.supported(),label:()=>fsLabel(),click:()=>fsClick(),change:()=>fsClick(true)},
 ch(){status('Saving…');clearTimeout(pt);pt=setTimeout(push,450)},
 logout(){localStorage.removeItem(TK);if(window.Admin)Admin.close(true);render()}};
window.addEventListener('beforeunload',e=>{if(saving||pt&&again){e.preventDefault();e.returnValue=''}});
function normalize(){const S=D.site;const dflt={headerTitle:S.name||'',headerTagline:'',headerShowText:true,headerTitleColor:'#ffffff',headerTaglineColor:'#9db4d6',headerTitleSize:5.4,headerTaglineSize:1.25,headerTextLeft:16.5,headerTextAlign:'center',logoOffset:8,headerStyle:'banner',headerFont:"'Chomsky'",headerFontFile:'',headerTitleWeight:'Regular',headerTitleItalic:'Normal',headerTitleUnderline:'None',headerTitleCase:'As typed',headerTitleSpacing:1,showSocial:true,social:[{network:'TikTok',url:''},{network:'YouTube',url:''},{network:'Facebook',url:''},{network:'X',url:''},{network:'Instagram',url:''}]};for(const k in dflt)if(S[k]===undefined)S[k]=dflt[k];['titleFx','taglineFx'].forEach(k=>{S[k]=Object.assign({shadow:'None',shadowColor:'#000000',outline:'None',outlineColor:'#000000',glow:'None',glowColor:'#ffd166',background:''},S[k]||{})});if(!D.tagV){if(!S.headerTagline)S.headerTagline='Independent news, broadcasting & analysis.';D.tagV=1}if((D.fontsV||0)<3){if(!S.headerFontFile&&(!S.headerFont||/SiteMasthead|Chomsky/.test(S.headerFont)))S.headerFont="'Chomsky'";D.fontsV=3}D.home.blocks=(D.home.blocks||[]).map(b=>({type:'bento',anchor:'',...b}));if(S.logo===undefined)S.logo='images/logo.png';if(!S.logoPosition)S.logoPosition='left';if(S.logoSize===undefined)S.logoSize=70;D.pages=(D.pages||[]).map(p=>({parent:'',inMenu:false,...p}))}
let migratedPending=false;
/* v5: footer name uses the site-name font; room for contact details under the name */
function migrate5(){const cs=D.footer&&D.footer.columns,c0=cs&&cs[0];
 if(!c0||(c0.nameFont!==undefined&&c0.email!==undefined&&c0.phone!==undefined&&c0.address!==undefined&&c0.contact!==undefined))return false;
 D.v=Math.max(+D.v||0,5);migratedPending=true;
 const n={title:c0.title,nameFont:c0.nameFont===undefined?'same as site name':c0.nameFont,nameSize:c0.nameSize===undefined?30:c0.nameSize,text:c0.text||'',email:c0.email||'',phone:c0.phone||'',address:c0.address||'',contact:c0.contact||''};
 for(const k in c0)if(!(k in n))n[k]=c0[k];if(!n.links)n.links=[];cs[0]=n;return true}
function migrate(){const a=migrate3(),b=migrate4(),c=migrate5();return a||b||c}
function migrate3(){if(D.v>=3)return false;D.v=3;migratedPending=true;
 const OLD=/ahmedabdi\.uk|AMA Studio/g;
 (function rep(o){for(const k in o){const v=o[k];if(k==='slug'||k==='url'||/image|logo|^file$|^src$|font/i.test(k))continue;if(typeof v==='string'){if(!v.startsWith('data:'))o[k]=v.replace(OLD,'The Somaliland Age')}else if(v&&typeof v==='object')rep(v)}})(D);
 Object.assign(D.site,{headerStyle:'banner',headerTextAlign:'center',headerTitleColor:'#ffffff',headerTaglineColor:'#9db4d6',headerTitleSize:6,headerTaglineSize:1.4,headerShowText:true});
 const B={'Trending Now':{enabled:true,count:6,columns:6,style:'tiles'},"Editors' Picks":{enabled:true,count:4,columns:4,style:'tiles'},'More Headlines':{enabled:true,count:9,columns:3,style:'list'}};
 D.home.blocks.forEach(b=>{if(B[b.title]&&(b.type||'bento')==='bento')Object.assign(b,B[b.title])});return true}
/* v4: compact header proportions, social icons always present */
function migrate4(){if(D.v>=4)return false;D.v=4;migratedPending=true;const S=D.site;
 if(+S.headerTitleSize===6)S.headerTitleSize=5.4;if(+S.headerTaglineSize===1.4)S.headerTaglineSize=1.25;
 if(!Array.isArray(S.social)||!S.social.some(x=>x&&x.network))S.social=['TikTok','YouTube','Facebook','X','Instagram'].map(n=>({network:n,url:''}));
 if(S.showSocial===false)S.showSocial=true;
 return true}
async function load(){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),3500);const r=await fetch('api/content',{cache:'no-store',signal:c.signal});clearTimeout(t);
  if(r.ok&&/json/.test(r.headers.get('content-type')||'')){D=await r.json();BACKEND=true;normalize();if(migrate()&&logged())setTimeout(()=>AMA.ch(),600);return}}catch(e){}
 D=JSON.parse(JSON.stringify(window.SITE_DATA));BACKEND=false;const dr=await ldbGet();if(dr&&dr.base===D.rev&&dr.data)D=dr.data;normalize();if(migrate()&&logged())setTimeout(()=>AMA.ch(),600)}
/* ---- helpers ---- */
const href=a=>{const u=String(a.url||'').trim();return E(u&&!/^(#|#\/|\/)$/.test(u)?u:artPath(a))};
const bg=a=>a.image?`style="background-image:url('${E(a.image)}')"`:'';
const lk=x=>`<a href="${E(x.url||(x.label==='Home'?'/':'/'+catSlug(x.label)))}">${E(x.label)}</a>`;
const F=f=>D.articles.filter(a=>a.flags&&a.flags[f]);
const card=a=>`<a class="c" href="${href(a)}"><div class="im" ${bg(a)}></div><div class="b"><div class="tg">${E(a.category)}</div><div class="t">${E(a.title)}</div><small>${E(a.summary)}</small></div></a>`;
const tile=a=>`<a class="c" href="${href(a)}"><div class="im" ${bg(a)}></div><div class="b"><div class="tg">${E(a.category)}</div><div class="t" style="font-size:14px">${E(a.title)}</div></div></a>`;
const paras=t=>(t||'').split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${E(p)}</p>`).join('');
/* ---- content blocks (text, image, columns, button, video, divider, spacer, anchor, bento) ---- */
const visual=()=>logged()&&localStorage.getItem('ama-vis')!=='0';
let CUR={t:'',arg:''},pendingAnchor='';
const lists=o=>{if(o==='home')return D.home.blocks;const t=o.slice(0,1),s=o.slice(2);
 if(t==='p'){const p=(D.pages||[]).find(x=>x.slug===s);return p?(p.blocks=p.blocks||[]):null}
 if(t==='a'){const a=find(s);return a?(a.blocks=a.blocks||[]):null}return null};
const ownerNow=()=>CUR.t==='a'?'a:'+CUR.arg:CUR.t==='p'?'p:'+CUR.arg:(!CUR.t?'home':null);
function parseVid(u){u=String(u||'');let m;if((m=u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{6,15})/)))return {k:'yt',id:m[1]};if((m=u.match(/vimeo\.com\/(?:video\/)?(\d{5,12})/)))return {k:'vm',id:m[1]};return null}
function hydrate(root){root.querySelectorAll('.vid').forEach(v=>{if(v.firstChild)return;const d=v.dataset,[rw,rh]=(d.r||'16:9').split(':').map(Number);
 v.style.width=(+d.w||100)+'%';v.style.marginLeft=d.a==='left'?'0':'auto';v.style.marginRight=d.a==='right'?'0':'auto';
 const box=document.createElement('div');box.className='vbox';box.style.paddingTop=(rh/rw*100)+'%';
 if(d.k==='file'){if(!/^(videos\/|data:video\/)/.test(d.src||''))return;const el=document.createElement('video');el.src=d.src;el.preload='metadata';el.playsInline=true;if(d.c!=='0')el.controls=true;if(d.ap==='1'){el.autoplay=true;el.muted=true}if(d.lp==='1')el.loop=true;box.append(el)}
 else{const f=document.createElement('iframe'),id=d.id,q=[];if(d.k==='yt'){q.push('rel=0');if(d.c==='0')q.push('controls=0');if(d.ap==='1')q.push('autoplay=1','mute=1');if(d.lp==='1')q.push('loop=1','playlist='+id);f.src='https://www.youtube-nocookie.com/embed/'+id+'?'+q.join('&')}
  else{if(d.ap==='1')q.push('autoplay=1','muted=1');if(d.lp==='1')q.push('loop=1');f.src='https://player.vimeo.com/video/'+id+(q.length?'?'+q.join('&'):'')}f.loading='lazy';f.allowFullscreen=true;f.title='Video';f.setAttribute('allow','autoplay; picture-in-picture; fullscreen');box.append(f)}
 v.append(box)})}
function bento(b){let L=b.flag?F(b.flag):D.articles;if(b.category)L=L.filter(a=>a.category.toLowerCase()===b.category.toLowerCase());L=L.slice(0,+b.count||99);if(!L.length)return '';
 const inner=b.style==='list'?`<div class="hl" style="--cols:${+b.columns||2}">${L.map((a,i)=>`<a href="${href(a)}"><span>${String(i+1).padStart(2,'0')}</span><div><div class="tg">${E(a.category)}</div><b>${E(a.title)}</b></div></a>`).join('')}</div>`:`<div class="gr" style="--cols:${+b.columns||3}">${L.map(b.style==='cards'?card:tile).join('')}</div>`;
 return `<section class="bx"><h2><span>${E(b.title)}</span>${b.badge?`<span class="bd">${E(b.badge)}</span>`:''}</h2>${inner}</section>`}
const tgt=n=>n?' target="_blank" rel="noopener"':'';
function blockHTML(b,owner,i){const ty=b.type||'bento',v=visual();let h='';
 const ph=t=>v?`<div class="ph">${t}</div>`:'';
 if(ty==='bento')h=b.enabled===false?(v?`<div class="ph">Hidden section: ${E(b.title)} (turned off)</div>`:''):bento(b);
 else if(ty==='text')h=`<div class="cb-text" style="${b.background?'background:'+E(b.background):''}">${b.title?`<h2 class="bt">${E(b.title)}</h2>`:''}<div class="body">${clean(b.html)}</div></div>`;
 else if(ty==='image'){const im=b.image?`<img src="${E(b.image)}" alt="${E(b.alt||'')}" style="width:${+b.width||100}%">`:ph('🖼 Choose an image');
  h=`<figure class="cb-img" style="text-align:${E(b.align||'center')}">${b.link&&b.image?`<a href="${E(b.link)}"${tgt(b.newTab)}>${im}</a>`:im}${b.caption?`<figcaption>${E(b.caption)}</figcaption>`:''}</figure>`}
 else if(ty==='columns'){const cs=b.columns||[];h=`${b.title?`<h2 class="bt">${E(b.title)}</h2>`:''}<div class="cb-cols" style="grid-template-columns:repeat(${Math.max(cs.length,1)},minmax(0,1fr))">${cs.map(c=>{const im=c.image?`<img src="${E(c.image)}" alt="">`:'';return `<div>${c.title?`<h3>${E(c.title)}</h3>`:''}${c.link&&c.image?`<a href="${E(c.link)}">${im}</a>`:im}<div class="body">${clean(c.html)}</div></div>`}).join('')}</div>`}
 else if(ty==='button')h=`<div class="cb-btn ${E(b.variant||'primary')}" style="text-align:${E(b.align||'left')}"><a href="${E(b.url||'#')}"${tgt(b.newTab)}>${E(b.label||'Button')}</a></div>`;
 else if(ty==='video'){const pv=b.file?{k:'file'}:parseVid(b.youtube);h=(pv?`<div class="vid" data-k="${pv.k}"${pv.k==='file'?` data-src="${E(b.file)}"`:` data-id="${pv.id}"`} data-w="${+b.width||100}" data-a="${E(b.align||'center')}" data-r="${E(b.ratio||'16:9')}" data-c="${b.controls===false?0:1}" data-ap="${b.autoplay?1:0}" data-lp="${b.loop?1:0}"></div>`:ph('▶ Add a YouTube link or upload a video'))+(b.caption?`<p class="cap" style="text-align:${E(b.align||'center')}">${E(b.caption)}</p>`:'')}
 else if(ty==='divider')h='<div class="cb-div"><hr></div>';
 else if(ty==='spacer')h=`<div style="height:${+b.height||40}px"></div>`;
 else if(ty==='anchor')h=ph('⚓ Anchor point: '+E(b.name));
 if(!h&&!v)return '';
 const an=ty==='anchor'?b.name:b.anchor;
 return `<div class="blk" data-owner="${E(owner)}" data-bi="${i}"${an?` id="anc-${E(slug(an))}"`:''}>${h}</div>`}
function renderBlocks(L,owner){L=L||[];const z=i=>visual()?`<div class="addz" data-owner="${E(owner)}" data-at="${i}">＋ Add here</div>`:'';
 return L.map((b,i)=>z(i)+blockHTML(b,owner,i)).join('')+z(L.length)}
function mkBlock(type,n){return {
 text:{type:'text',title:'',html:'<p>Write your text here…</p>',background:'',anchor:''},
 image:{type:'image',image:'',alt:'',caption:'',link:'',newTab:false,width:100,align:'center',anchor:''},
 columns:{type:'columns',title:'',columns:Array.from({length:n||2},(_,i)=>({title:'Column '+(i+1),html:'<p>Write here…</p>',image:'',link:''})),anchor:''},
 button:{type:'button',label:'Click here',url:'',newTab:false,variant:'primary',align:'left',anchor:''},
 video:{type:'video',youtube:'',file:'',width:100,align:'center',ratio:'16:9',controls:true,autoplay:false,loop:false,caption:'',anchor:''},divider:{type:'divider'},spacer:{type:'spacer',height:40},anchor:{type:'anchor',name:'my-anchor'},
 bento:{type:'bento',enabled:true,title:'New section',badge:'',flag:'trending',category:'',count:4,columns:4,style:'tiles',anchor:''}}[type]}
function ownerOf(b){const o=['home'];(D.pages||[]).forEach(p=>o.push('p:'+p.slug));D.articles.forEach(a=>o.push('a:'+artSlug(a)));return o.find(x=>{const L=lists(x);return L&&L.includes(b)})}
function removeBlock(b){const o=ownerOf(b);if(!o)return;const L=lists(o);L.splice(L.indexOf(b),1);AMA.ch();render()}
const goAnchor=n=>{const el=document.getElementById('anc-'+slug(n));if(el)el.scrollIntoView({behavior:'smooth',block:'start'})};
function editBlock(b){loadAdmin().then(()=>Admin.editBlock(b)).catch(e=>alert(e.message))}
function blockAction(a,el){const owner=el.dataset.owner,i=+el.dataset.bi,L=lists(owner);if(!L)return;const b=L[i];
 if(a==='edit')return editBlock(b);
 if(a==='up'||a==='down'){const j=i+(a==='up'?-1:1);if(j<0||j>=L.length)return;[L[i],L[j]]=[L[j],L[i]]}
 else if(a==='dup'){const c=JSON.parse(JSON.stringify(b));delete c.anchor;L.splice(i+1,0,c)}
 else if(a==='del'){if(!confirm('Delete this block?'))return;L.splice(i,1)}
 AMA.ch();render()}
function closePop(){const p=document.getElementById('blkpop');if(p)p.remove()}
function showPop(x,y,owner,at){closePop();const p=document.createElement('div');p.id='blkpop';
 const L=owner?lists(owner):null,prev=L&&L[at-1];
 const add=(type,n)=>()=>{const b=mkBlock(type,n);L.splice(at,0,b);AMA.ch();render();editBlock(b)};
 const rows=!L?[['ℹ️','Blocks can be added on the home page, articles and pages.',()=>{location.hash='#/'}]]:[
  ['📝','Text',add('text')],['🖼','Image',add('image')],['▥','2 columns',add('columns',2)],['▥','3 columns',add('columns',3)],['▥','4 columns',add('columns',4)],
  ...(prev&&prev.type==='columns'?[['➕','Add a column to the block above',()=>{prev.columns.push({title:'Column '+(prev.columns.length+1),html:'<p>Write here…</p>',image:'',link:''});AMA.ch();render();editBlock(prev)}]]:[]),
  ['🧱','Bento (article section)',add('bento')],['🔘','Button',add('button')],['▶','Video',add('video')],['➖','Divider',add('divider')],['↕','Spacer',add('spacer')],['⚓','Anchor point',add('anchor')]];
 rows.push(['📰','New article…',()=>loadAdmin().then(()=>Admin.open('editor'))],['📄','New page…',()=>loadAdmin().then(()=>Admin.open('pageeditor'))],['⚙','Open dashboard',()=>openAdmin('articles')]);
 p.innerHTML='<div class="pt">Add to this spot</div>';
 rows.forEach(([ic,l,f])=>{const b=document.createElement('button');b.innerHTML=`<span>${ic}</span> ${l}`;b.onclick=e=>{e.stopPropagation();closePop();f()};p.append(b)});
 document.body.append(p);p.style.left=Math.max(8,Math.min(x,innerWidth-p.offsetWidth-8))+'px';p.style.top=Math.max(8,Math.min(y,innerHeight-p.offsetHeight-8))+'px'}
function decorate(){const v=visual();document.body.classList.toggle('editing',v);if(!v)return;
 document.querySelectorAll('.blk').forEach(el=>{const b=document.createElement('div');b.className='btb';b.innerHTML='<button data-a="edit">✎ Edit</button><button data-a="up" title="Move up">↑</button><button data-a="down" title="Move down">↓</button><button data-a="dup" title="Duplicate">⧉</button><button data-a="del" title="Delete">🗑</button>';el.append(b)});}
const emptySpot=t=>t===document.documentElement||t===document.body||t.id==='app'||t.id==='main'||['g','mid','below'].some(c=>t.classList&&t.classList.contains(c));
document.addEventListener('click',e=>{const t=e.target;
 if(t.closest('img.hlogo')&&!(logged()&&visual())){e.preventDefault();nav('/');return}
 const an=t.closest('a[href^="#~"]');if(an){e.preventDefault();goAnchor(an.getAttribute('href').slice(2));return}
 if(!logged())return;
 const tg=t.closest('#vt');if(tg){localStorage.setItem('ama-vis',visual()?'0':'1');render();return}
 const fb=t.closest('#fsb');if(fb){fsClick();return}
 const pb=t.closest('#pvb');if(pb){openPreview();return}
 const fph=t.closest('.fph');if(fph){e.preventDefault();openAdmin('footer');return}
 const hb=t.closest('#hdtb button');if(hb){e.preventDefault();e.stopPropagation();closeHdTb();if(hb.dataset.a==='e')loadAdmin().then(()=>Admin.editHeader()).catch(er=>alert(er.message));else openAdmin('site');return}
 if(!t.closest('#hdtb'))closeHdTb();
 if(visual()&&t.closest('#hd')){e.preventDefault();const tx=t.closest('.ht1,.ht2');if(tx)showHdTb(tx);return}
 const bt=t.closest('.btb button');if(bt){e.preventDefault();e.stopPropagation();blockAction(bt.dataset.a,bt.closest('.blk'));return}
 if(!visual()||t.closest('#blkpop'))return;closePop();
 let owner=ownerNow(),at=null;const z=t.closest('.addz');
 if(z){owner=z.dataset.owner;at=+z.dataset.at}
 else if(emptySpot(t)){const L=owner?lists(owner):[];at=L.length;for(const el of document.querySelectorAll('.blk')){if(el.getBoundingClientRect().top>e.clientY){at=+el.dataset.bi;break}}}
 else return;
 showPop(e.clientX,e.clientY,owner,at)});
function closeHdTb(){const x=document.getElementById('hdtb');if(x)x.remove()}
function showHdTb(el){closeHdTb();closePop();const r=el.getBoundingClientRect(),d=document.createElement('div');d.id='hdtb';d.innerHTML='<button data-a="e">✎ Edit title &amp; tagline</button><button data-a="s">⚙ Header settings</button>';
 d.style.left=Math.max(8,Math.min(r.left+scrollX,innerWidth-300))+'px';d.style.top=(r.top<56?r.bottom+scrollY+8:r.top+scrollY-46)+'px';document.body.append(d)}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePop();closeHdTb()}});
/* ---- page views ---- */
function home(){const hero=F('hero'),M=D.home;
 return {mid:`${hero.length?`<div class="sl">${hero.map(a=>`<a class="sd" href="${href(a)}" ${bg(a)}><div class="tg">${E(a.category)}</div><h2>${E(a.title)}</h2><p>${E(a.summary)}</p></a>`).join('')}<button class="ar" style="left:12px" data-d="-1" aria-label="Previous">‹</button><button class="ar" style="right:12px" data-d="1" aria-label="Next">›</button><div class="dots">${hero.map(()=>'<b></b>').join('')}</div></div>`:''}
 ${D.promo.enabled?`<div class="pr"><div><b>${E(D.promo.title)}</b><small>${E(D.promo.text)}</small></div><a class="btn" href="${E(D.promo.url)}">${E(D.promo.button)}</a></div>`:''}
 ${M.showHeroCards?`<div class="cs" style="--cols:${+M.heroCardColumns||3}">${F('card').map(card).join('')}</div>`:''}`,below:`<div class="below">${renderBlocks(M.blocks,'home')}</div>`}}
function article(a){
 const rel=D.articles.filter(x=>x!==a&&x.category===a.category).slice(0,4);
 return {title:a.title,mid:`<article class="art"><div class="tg">${E(a.category)}</div><h1>${E(a.title)}</h1><p class="dk">${E(a.summary)}</p>${a.image?`<img class="aimg" src="${E(a.image)}" alt="${E(a.title)}">`:''}<div class="body">${clean(a.body)}</div>${logged()?`<p><button class="ea" data-edit="${E(artSlug(a))}">✏️ Edit this article</button></p>`:''}</article>${renderBlocks(a.blocks,'a:'+artSlug(a))}${rel.length?`<section class="bx"><h2><span>More in ${E(a.category)}</span></h2><div class="gr">${rel.map(tile).join('')}</div></section>`:''}`}}
function section(c){const L=D.articles.filter(a=>a.category.toLowerCase()===c.toLowerCase());
 return {title:c,mid:`<section class="bx"><h2><span>${E(c)}</span></h2>${L.length?`<div class="cs">${L.map(card).join('')}</div>`:'<p>No articles in this section yet.</p>'}</section>`}}
function notFound(q){const words=String(q||'').split(/[-\s]+/).filter(w=>w.length>3).map(w=>w.toLowerCase()),hit=D.articles.filter(a=>words.some(w=>(a.title+' '+artSlug(a)).toLowerCase().includes(w))).slice(0,6),L=hit.length?hit:D.articles.slice(0,6);
 return {title:'Page not found',mid:`<article class="art"><h1>We can't find that page</h1><p class="dk">The link may be old or mistyped, or the story has been moved or removed.</p><p><a href="/">← Back to the home page</a></p></article>${L.length?`<section class="bx"><h2><span>${hit.length?'Did you mean one of these?':'Latest stories'}</span></h2><div class="cs">${L.map(card).join('')}</div></section>`:''}`}}
function search(q){const t=q.toLowerCase(),L=D.articles.filter(a=>[a.title,a.summary,a.category,(a.body||'').replace(/<[^>]*>/g,' ')].join(' ').toLowerCase().includes(t));
 return {title:'Search',mid:`<section class="bx"><h2><span>Search: ${E(q)}</span></h2>${L.length?`<div class="cs">${L.map(card).join('')}</div>`:'<p>No articles found.</p>'}</section>`}}
function pg(p){const P=D.pages||[];
 const par=p.parent?P.find(x=>x.slug===p.parent):null,ks=P.filter(k=>k.parent===p.slug);
 const html=/<[a-z][\s\S]*>/i.test(p.body||'')?clean(p.body):paras(p.body);
 return {title:p.title,mid:`<article class="art">${par?`<div class="crumb"><a href="${E(pagePath(par))}">${E(par.title)}</a> ›</div>`:''}<h1>${E(p.title)}</h1><div class="body">${html}</div>${ks.length?`<h3>In this section</h3><ul class="sub">${ks.map(k=>`<li><a href="${E(pagePath(k))}">${E(k.title)}</a></li>`).join('')}</ul>`:''}</article>${renderBlocks(p.blocks,'p:'+p.slug)}`}}
function view(){const cp=curPath(),segs=cp.segs.map(x=>x.toLowerCase()),R=resolve(segs,cp);pendingAnchor=cp.an;CUR={t:'',arg:''};let v,canon='';
 if(R.k==='art'){CUR={t:'a',arg:artSlug(R.a)};v=article(R.a);canon=artPath(R.a)}
 else if(R.k==='cat'){CUR={t:'c',arg:R.c};v=section(R.c);canon='/'+catSlug(R.c)}
 else if(R.k==='page'){CUR={t:'p',arg:R.p.slug};v=pg(R.p);canon=pagePath(R.p)}
 else if(R.k==='search'){CUR={t:'s',arg:R.q};v=search(R.q)}
 else if(R.k==='nf'){CUR={t:'x',arg:''};v=notFound(R.q)}
 else v=home();
 if(canon&&'/'+cp.segs.join('/')!==canon)nav(canon+(cp.an?'#~'+cp.an:''),true);
 return v}
/* ---- site name (header title) style: only affects the title ---- */
function titleCss(S){const W={Light:300,Regular:400,Medium:500,'Semi-bold':600,Bold:700,'Extra-bold':800},U={Underline:'underline',Overline:'overline',Strikethrough:'line-through'},C={UPPERCASE:'uppercase',lowercase:'lowercase',Capitalize:'capitalize'};
 return 'font-weight:'+(W[S.headerTitleWeight]||400)+';font-style:'+(S.headerTitleItalic==='Italic'?'italic':'normal')+';text-decoration:'+(U[S.headerTitleUnderline]||'none')+';text-transform:'+(C[S.headerTitleCase]||'none')+';letter-spacing:'+((+S.headerTitleSpacing||0)/100)+'em'}
function fxCss(f,ctr){f=f||{};const r=n=>+n.toFixed(3),col=(c,d)=>/^#[0-9a-f]{3,8}$/i.test(c||'')?c:d,L={Soft:1,Medium:2,Strong:3},sh=L[f.shadow],gl=L[f.glow],ol={Thin:1,Medium:2,Thick:3}[f.outline],s=[];
 if(sh)s.push(r(sh*.035)+'em '+r(sh*.045)+'em '+r(sh*.05)+'em '+col(f.shadowColor,'#000000'));
 if(gl){const c=col(f.glowColor,'#ffd166');s.push('0 0 '+r(gl*.12)+'em '+c,'0 0 '+r(gl*.3)+'em '+c)}
 let o='text-shadow:'+(s.join(',')||'none')+';'+(ol?'-webkit-text-stroke:'+r(ol*.02)+'em '+col(f.outlineColor,'#000000')+';paint-order:stroke fill':'-webkit-text-stroke:0');
 const bg=col(f.background,'');if(bg)o+=';background:'+bg+';padding:.08em .35em;border-radius:.12em;display:block;width:fit-content;margin-left:'+(ctr?'auto':'0')+';margin-right:'+(ctr?'auto':'0');return o}
/* ---- device preview (shows the site at phone / tablet / laptop sizes while editing) ---- */
function closePreview(){const o=document.getElementById('pvo');if(o){o.remove();window.removeEventListener('resize',window.__pvfit)}}
function openPreview(){closePreview();
 const SZ=[['📱 Phone',390,844],['📱 Small phone',360,740],['Tablet',768,1024],['Laptop',1280,800],['Desktop',1600,900]];
 let cur=0,rot=false;try{cur=Math.min(SZ.length-1,Math.max(0,+localStorage.getItem('ama-pv')||0))}catch(e){}
 const o=document.createElement('div');o.id='pvo';
 o.innerHTML='<div class="pvt"><b>Preview</b>'+SZ.map((z,i)=>'<button data-i="'+i+'">'+z[0]+'</button>').join('')+'<button data-a="rot">⟲ Rotate</button><button data-a="re">↻ Refresh</button><span class="pvi"></span><button data-a="x" class="pvx">✕ Close preview</button></div><div class="pvs"><div class="pvw"><iframe name="ama-preview" title="Preview"></iframe></div></div>';
 document.body.append(o);
 const fr=o.querySelector('iframe'),wr=o.querySelector('.pvw'),st=o.querySelector('.pvs'),inf=o.querySelector('.pvi');
 const base=()=>FILEMODE?location.href.split('#')[0]:location.origin+'/';
 const load=()=>{fr.src=(FILEMODE?base()+(location.hash||''):location.origin+location.pathname+location.search);};
 const fit=()=>{let [,w,h]=SZ[cur];if(rot){[w,h]=[h,w]}
  const sw=st.clientWidth-24,sh=st.clientHeight-24,k=Math.min(1,sw/w,sh/h);
  fr.style.width=w+'px';fr.style.height=h+'px';fr.style.transform='scale('+k+')';wr.style.width=Math.round(w*k)+'px';wr.style.height=Math.round(h*k)+'px';
  inf.textContent=w+' × '+h+' px'+(k<1?' (shown at '+Math.round(k*100)+'%)':'');
  o.querySelectorAll('.pvt button[data-i]').forEach(b=>b.classList.toggle('on',+b.dataset.i===cur))};
 window.__pvfit=fit;window.addEventListener('resize',fit);
 o.onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.i!==undefined){cur=+b.dataset.i;rot=false;try{localStorage.setItem('ama-pv',cur)}catch(x){}fit()}
  else if(b.dataset.a==='rot'){rot=!rot;fit()}else if(b.dataset.a==='re'){load()}else if(b.dataset.a==='x'){closePreview()}};
 document.addEventListener('keydown',function k(e){if(!document.getElementById('pvo')){document.removeEventListener('keydown',k);return}if(e.key==='Escape')closePreview()});
 fit();
 // wait for a save that is still running, then show the saved version
 let n=0;const t=setInterval(()=>{if(!saving||++n>30){clearInterval(t);load()}},100)}
/* ---- footer contact lines: emails, phone numbers and web addresses become clickable ---- */
function cblock(c){const L=[],em=String(c.email||'').trim(),ph=String(c.phone||'').trim(),ad=String(c.address||'').trim();
 if(em)L.push('<div><span class="cl">Email</span> <a href="mailto:'+E(em)+'">'+E(em)+'</a></div>');
 if(ph)L.push('<div><span class="cl">Phone</span> <a href="tel:'+E(ph.replace(/[^\d+]/g,''))+'">'+E(ph)+'</a></div>');
 if(ad)L.push('<div><span class="cl">Address</span> '+E(ad)+'</div>');
 if(c.contact)L.push(contactHTML(c.contact));
 if(L.length)return '<div class="fct">'+L.join('')+'</div>';
 return c.nameFont!==undefined&&logged()&&visual()?'<div class="fct fph">＋ Email, phone and address go here - click to add them</div>':''}
function contactHTML(t){return String(t||'').split(/\r?\n/).map(l=>l.trim()).filter(Boolean).map(l=>'<div>'+E(l).replace(/(https?:\/\/[^\s<]+|www\.[^\s<]+)|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|(\+?\d[\d\s().-]{6,}\d)/gi,(m,u,e,p)=>{if(u)return '<a href="'+(/^www/i.test(u)?'https://'+u:u)+'" target="_blank" rel="noopener">'+u+'</a>';if(e)return '<a href="mailto:'+e+'">'+e+'</a>';return '<a href="tel:'+p.replace(/[^\d+]/g,'')+'">'+p+'</a>'})+'</div>').join('')}
/* ---- social icons ---- */
const SOC={tiktok:{n:'TikTok',h:'https://www.tiktok.com',i:'<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>'},
 youtube:{n:'YouTube',h:'https://www.youtube.com',i:'<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>'},
 facebook:{n:'Facebook',h:'https://www.facebook.com',i:'<path transform="translate(12 12) scale(1.22) translate(-12.25 -12.6)" d="M13.6 22v-8.6h2.9l.5-3.4h-3.4V7.8c0-1 .4-1.7 1.8-1.7H17V3.2c-.3 0-1.3-.2-2.5-.2-2.6 0-4.2 1.5-4.2 4.3V10H7.5v3.4h2.8V22z"/>'},
 x:{n:'X',h:'https://x.com',i:'<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>'},
 instagram:{n:'Instagram',h:'https://www.instagram.com',i:'<rect x="4.5" y="4.5" width="15" height="15" rx="4.4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="16.6" cy="7.4" r="1.05"/>'}};
function socHTML(S){if(S.showSocial===false)return '';return (S.social||[]).map(x=>{const k=String(x.network||'').toLowerCase().replace(/[^a-z]/g,''),o=SOC[k];if(!o)return '';const u=/^(https?:|mailto:|tel:|\/|#)/i.test((x.url||'').trim())?x.url.trim():o.h;return `<a class="si-${k}" href="${E(u)}" target="_blank" rel="noopener" aria-label="${o.n}" title="${o.n}"><img src="images/${k}.png?v=${CODE_VERSION}" alt="" width="64" height="64" draggable="false"></a>`}).join('')}
/* ---- render ---- */
function render(){if(!D)return;
 const S=D.site,Fo=D.footer,R=document.documentElement.style;
 R.setProperty('--p',S.colors.primary);R.setProperty('--a',S.colors.accent);R.setProperty('--m',S.colors.menu);R.setProperty('--f',S.font||'Arial, Helvetica, sans-serif');
 const v=view();document.title=(v.title?v.title+' | ':'')+S.name;
 const date=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase();
 const n=(Fo.columns||[]).length||1,al=Fo.align||'left',bgc=E(Fo.backgroundColor);
 const wave=Fo.showWave?`<svg viewBox="0 0 1440 80" preserveAspectRatio="none" style="display:block;width:100%;height:${+Fo.waveHeight||60}px;margin-bottom:-1px;fill:${bgc}"><path d="M0,45 C220,90 460,0 720,35 C980,70 1200,75 1440,15 L1440,80 L0,80Z"/></svg>`:'';
 const cols=(Fo.columns||[]).map(c=>`<div>${c.title?(c.nameFont!==undefined?`<h4 class="fname" style="font-family:${E(!c.nameFont||/^same/i.test(c.nameFont)?'var(--hf)':c.nameFont+',serif')};--ns:${+c.nameSize||30}px">${E(c.title)}</h4>`:`<h4>${E(c.title)}</h4>`):''}${c.text?`<div class="fm">${E(c.text)}</div>`:''}${cblock(c)}${(c.links||[]).length?`<div class="fls">${(c.links||[]).map(lk).join('')}</div>`:''}</div>`).join('');
 const foot=`<footer class="ft" style="margin-top:50px;color:${E(Fo.textColor)};--fl:${E(Fo.linkColor)};--fm:${E(Fo.mutedColor)}">${wave}<div class="fb" style="background:${bgc};text-align:${al}"><div class="fg" style="grid-template-columns:${al==='left'?'1.6fr '+'1fr '.repeat(n-1):'repeat('+n+',1fr)'}">${cols}</div><div class="cp"><span>${E(Fo.copyright)}</span>${Fo.note?`<small>${E(Fo.note)}</small>`:''}</div></div></footer>`;
 const M=D.home||{},lc=M.showAllArticles,rc=M.showInDepth;
 const left=lc?`<aside class="pn"><h3>${E(D.labels.allArticles)}</h3><div class="al">${D.articles.map(a=>`<a class="it" href="${href(a)}"><div class="tg">${E(a.category)}</div><span>${E(a.title)}</span></a>`).join('')}</div></aside>`:'';
 const right=rc?`<aside class="pn"><h3>${E(D.labels.inDepth)}</h3>${F('inDepth').map(a=>`<a class="dp" href="${href(a)}"><div class="im" ${bg(a)}></div><div><div class="tg">${E(a.category)}</div><div class="t">${E(a.title)}</div></div></a>`).join('')}</aside>`:'';
 const body=`<div class="g" style="grid-template-columns:${lc?'240px ':''}minmax(0,1fr)${rc?' 300px':''}">${left}<main class="mid">${v.mid}</main>${right}</div>${v.below||''}`;
 const mast=S.headerStyle!=='banner',hf=(S.headerFontFile?"'SiteMastheadCustom',":'')+(S.headerFont||"'SiteMasthead'")+',serif';
 R.setProperty('--hf',hf);let fs=document.getElementById('hfstyle');if(!fs){fs=document.createElement('style');fs.id='hfstyle';document.head.append(fs)}fs.textContent=S.headerFontFile?`@font-face{font-family:'SiteMastheadCustom';src:url('${S.headerFontFile.replace(/'/g,'')}');font-display:swap}`:'';
 const soc=socHTML(S),wd=new Date(),mdate=wd.toLocaleDateString('en-GB',{weekday:'short'})+', '+wd.getDate()+' '+wd.toLocaleDateString('en-GB',{month:'short'}).toUpperCase()+' '+wd.getFullYear();
 const mode=S.loginButton||'auto',showLogin=logged()||mode==='show'||(mode==='auto'&&isLocal());
 const PG=D.pages||[],navPages=PG.filter(p=>!p.parent&&p.inMenu).map(p=>{const ks=PG.filter(k=>k.parent===p.slug&&k.inMenu);const a=`<a href="${E(pagePath(p))}">${E(p.title)}</a>`;return ks.length?`<div class="dd">${a}<button class="ddb" aria-label="Show sub-pages">▾</button><div class="ddm">${ks.map(k=>`<a href="${E(pagePath(k))}">${E(k.title)}</a>`).join('')}</div></div>`:a}).join('');
 const tk=D.ticker.map(x=>`<i>${E(x.tag)}</i>${x.url?`<a href="${E(x.url)}">${E(x.text)}</a>`:`<span>${E(x.text)}</span>`}`).join('');
 app.innerHTML=`<div class="top"><span>${date}</span><span class="tr2">${S.liveLabel?`<span style="color:#ff4d5e">●</span> <span>${E(S.liveLabel)}</span>`:''}${D.topLinks.map(x=>`<a href="${E(x.url)}">${E(x.label)}</a>`).join('')}<input id="q" type="search" placeholder="Search articles…" aria-label="Search"></span></div>
 <div class="stk"><div class="hwrap ${mast?'mast':'bnr'}"><div id="hd" class="${mast?'mast':'bnr'}" data-img="site.headerImage">${mast?'':`<img src="${E(S.headerImage)}" alt="${E(S.headerAlt)}">`}${S.logo&&S.logoPosition!=='hidden'?`<img class="hlogo ${E(S.logoPosition)}" src="${E(S.logo)}" style="height:${+S.logoSize||70}%;${S.logoPosition==='right'?'right':'left'}:${S.logoPosition==='center'?50:+S.logoOffset}%" alt="">`:''}${S.headerShowText?`<div class="htxt"${mast?'':(S.headerTextAlign==='left'?` style="left:${+S.headerTextLeft}%"`:' style="left:50%;transform:translate(-50%,-50%);text-align:center"')}><div class="ht1" style="color:${mast&&/^#fff(fff)?$/i.test(S.headerTitleColor)?'#000000':E(S.headerTitleColor)};font-size:${+S.headerTitleSize}vw;font-size:${+S.headerTitleSize}cqw;${titleCss(S)};${fxCss(S.titleFx,mast||S.headerTextAlign!=='left')}">${E(S.headerTitle)}</div>${S.headerTagline||visual()?`<div class="ht2" data-ph="Click to add a tagline" style="color:${mast&&/^#9db4d6$/i.test(S.headerTaglineColor)?'#444444':E(S.headerTaglineColor)};font-size:${+S.headerTaglineSize}vw;font-size:${+S.headerTaglineSize}cqw;${fxCss(S.taglineFx,mast||S.headerTextAlign!=='left')}">${E(S.headerTagline)}</div>`:''}</div>`:''}</div>${soc?`<div class="soc soc-d">${soc}</div>`:''}<span class="mdate">${mdate}</span></div>

 <nav><div class="nrow"><button class="hb" aria-label="Menu" aria-expanded="false"><span>☰</span> Menu</button><div class="soc soc-m">${soc}</div><div class="sbox"><input id="q2" type="search" placeholder="Search articles…" aria-label="Search"><button class="sbtn" type="button" aria-label="Search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.2" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 15l5.6 5.6" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/></svg></button></div></div><div class="nl">${D.menu.map(lk).join('')}${navPages}<span class="tlm">${S.liveLabel?`<span><i style="color:#ff4d5e;font-style:normal">●</i> ${E(S.liveLabel)}</span>`:''}${D.topLinks.map(x=>`<a href="${E(x.url)}">${E(x.label)}</a>`).join('')}</span></div></nav>
 <div class="tick"><b>${E(D.ticker[0]?.tag||'')}</b><div class="tw"><div class="tr">${tk}${tk}</div></div></div></div>
 ${body}${foot}${logged()?`<div id="sv">${E(lastSt)}</div><button class="lg2" id="vt">✏️ Visual editing: ${visual()?'ON':'OFF'}</button><button class="lg2" id="pvb">📱 Preview sizes</button>${BACKEND?'':'<button class="lg2" id="fsb"></button>'}`:''}${showLogin?`<a class="lg" href="/login">${logged()?'Dashboard':E(S.loginLabel)}</a>`:''}`;
 fixLinks(app);hydrate(app);decorate();updateFsb();
 const sl=[...document.querySelectorAll('.sd')],dt=[...document.querySelectorAll('.dots b')];let i=0;
 const go=k=>{if(!sl.length)return;i=(k+sl.length)%sl.length;sl.forEach((s,j)=>s.classList.toggle('on',j===i));dt.forEach((d,j)=>d.classList.toggle('on',j===i))};
 document.querySelectorAll('.ar').forEach(b=>b.onclick=e=>{e.preventDefault();go(i+ +b.dataset.d)});dt.forEach((d,k)=>d.onclick=()=>go(k));
 clearInterval(window.__si);go(0);if(sl.length>1)window.__si=setInterval(()=>go(i+1),5500);
 const nv=document.querySelector('nav'),hb=nv.querySelector('.hb');hb.onclick=()=>{const o=nv.classList.toggle('open');nv.parentElement.classList.toggle('open',o);hb.setAttribute('aria-expanded',o);hb.firstChild.textContent=o?'✕':'☰'};
 document.querySelectorAll('.ddb').forEach(b=>b.onclick=e=>{e.preventDefault();b.parentElement.classList.toggle('open')});
 if(S.logo){let ic=document.querySelector('link[rel=icon]');if(!ic){ic=document.createElement('link');ic.rel='icon';document.head.append(ic)}ic.href='images/favicon.png?v='+CODE_VERSION}
 const q=document.getElementById('q');q.onkeydown=e=>{if(e.key==='Enter'&&q.value.trim())nav('/search/'+encodeURIComponent(q.value.trim()))};
 {const sb=document.querySelector('.sbox'),q2=document.getElementById('q2'),sbt=document.querySelector('.sbtn'),run=()=>{if(q2.value.trim()){nav('/search/'+encodeURIComponent(q2.value.trim()));sb.classList.remove('open');q2.blur()}else{sb.classList.remove('open')}};
  sbt.onclick=()=>{if(!sb.classList.contains('open')){sb.classList.add('open');setTimeout(()=>q2.focus(),60)}else run()};
  q2.onkeydown=e=>{if(e.key==='Enter')run();if(e.key==='Escape'){sb.classList.remove('open');q2.blur()}}}
 const cp=document.querySelector('.cp span');if(cp){let n=0,t0=0;cp.onclick=()=>{const now=Date.now();n=now-t0>2000?1:n+1;t0=now;if(n>=5){n=0;nav('/login')}}}
 const ea=document.querySelector('.ea');if(ea)ea.onclick=()=>openAdmin('editor',ea.dataset.edit);
}
/* ---- login + dashboard loader ---- */
function loadAdmin(){return window.Admin?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='admin.js?v='+CODE_VERSION;s.onload=ok;s.onerror=()=>no(new Error('admin.js not found'));document.head.append(s)})}
function openAdmin(tab,arg){loadAdmin().then(()=>Admin.open(tab,arg)).catch(e=>alert(e.message))}
function loginModal(msg){if(document.getElementById('lm'))return;const m=document.createElement('div');m.id='lm';
 m.innerHTML=`<form class="lgc"><h1>Log in</h1><label>Username</label><input name="u" autocomplete="username" required><label>Password</label><input name="p" type="password" autocomplete="current-password" required><button>Log in</button><button type="button" class="cl">Cancel</button><div id="lerr"></div></form>`;
 document.body.append(m);const f=m.firstChild,err=document.getElementById('lerr');err.textContent=msg||'';f.u.focus();
 if(!BACKEND){f.insertAdjacentHTML('beforeend','<p class="offl">Offline mode: no server needed. Your changes are saved in this browser. <a href="#" id="rst">Forgot your login? Reset to admin / admin123</a></p>');document.getElementById('rst').onclick=e=>{e.preventDefault();if(confirm('Reset the offline login to admin / admin123?')){localStorage.removeItem(LA);err.textContent='Reset. Log in with admin / admin123.'}}}
 else f.insertAdjacentHTML('beforeend','<p class="offl">Forgot your login? See "Reset your login" in the README.</p>');
 m.querySelector('.cl').onclick=()=>m.remove();
 f.onsubmit=async e=>{e.preventDefault();err.textContent='';
  const r=await api('api/login',{user:f.u.value,password:f.p.value});
  if(r.token){localStorage.setItem(TK,r.token);if(migratedPending){migratedPending=false;setTimeout(()=>AMA.ch(),300)}m.remove();render();openAdmin('articles')}else err.textContent=r.error||'Login failed'}}
function route(){if(!D)return;closePop();upgradeLegacy();
 const cp=curPath();if(cp.segs.length===1&&cp.segs[0].toLowerCase()==='login'){nav('/',true);if(logged())openAdmin('articles');else loginModal()}
 render();if(pendingAnchor)setTimeout(()=>goAnchor(pendingAnchor),80)}
window.addEventListener('hashchange',()=>{route();scrollTo(0,0)});window.addEventListener('popstate',()=>{route();scrollTo(0,0)});
document.addEventListener('click',e=>{const a=e.target.closest('a.lg');if(a&&logged()){e.preventDefault();openAdmin('articles')}});
load().then(route).then(()=>{if(!BACKEND)FS.load().then(async()=>{FS.ok=await FS.perm(false);updateFsb()})});
})();
