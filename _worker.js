// The Somaliland Age - Cloudflare Pages backend: login, instant saving of content, image uploads (stored in KV)
const enc=new TextEncoder();
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const rnd=n=>hex(crypto.getRandomValues(new Uint8Array(n)));
async function hmac(secret,msg){const k=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',k,enc.encode(msg)))}
async function pbk(pw,salt){const k=await crypto.subtle.importKey('raw',enc.encode(String(pw)),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:100000},k,256))}
const same=(a,b)=>{a=String(a);b=String(b);if(a.length!==b.length)return false;let r=0;for(let i=0;i<a.length;i++)r|=a.charCodeAt(i)^b.charCodeAt(i);return r===0};
const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const types={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp'};
const KINDS={image:{ext:types,pre:'img:',dir:'images',max:14e6,msg:'Use a JPG, PNG, GIF or WebP image.'},
 video:{ext:{mp4:'video/mp4',m4v:'video/mp4',webm:'video/webm',mov:'video/quicktime',ogg:'video/ogg'},pre:'vid:',dir:'videos',max:33e6,msg:'Use an MP4, WebM, MOV or OGG video (up to about 24 MB on Cloudflare; for longer videos use a YouTube link).'},
 font:{ext:{woff2:'font/woff2',woff:'font/woff',ttf:'font/ttf',otf:'font/otf'},pre:'fnt:',dir:'fonts',max:8e6,msg:'Use a .woff2, .woff, .ttf or .otf font file.'}};
const strip=t=>t.replace(/^\s*window\.SITE_DATA\s*=\s*/,'').replace(/;\s*$/,'');
const sha=async t=>hex(await crypto.subtle.digest('SHA-256',enc.encode(t))).slice(0,32);
async function repoContent(env,url){return strip(await (await env.ASSETS.fetch(new Request(new URL('/data/content.js',url)))).text())}
const JS=s=>new Response(s,{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const valid=c=>c&&typeof c==='object'&&c.site&&Array.isArray(c.menu)&&Array.isArray(c.articles)&&c.footer&&c.home;
async function secret(env){let s=await env.SITE_KV.get('secret');if(!s){s=rnd(32);await env.SITE_KV.put('secret',s)}return s}
async function token(env,a){const e=Date.now()+30*864e5;return e+'.'+await hmac(await secret(env),e+'.'+a.hash.slice(0,16))}
async function authed(req,env){const a=await env.SITE_KV.get('auth','json');if(!a)return false;const [e,s]=(req.headers.get('Authorization')||'').replace('Bearer ','').split('.');
 return !!(e&&s&&+e>Date.now()&&same(s,await hmac(await secret(env),e+'.'+a.hash.slice(0,16))))}

// what visitors see: edits made online (KV) unless content.js in GitHub changed since the last sync (then GitHub wins, old online copy is backed up)
async function liveContent(env,url){
 const rc=await repoContent(env,url);
 if(!env.SITE_KV)return rc;
 const kc=await env.SITE_KV.get('content');
 if(!kc)return rc;                                          // nothing edited online yet: use content.js from GitHub
 const h=await sha(rc),base=await env.SITE_KV.get('base');
 if(!base){await env.SITE_KV.put('base',h);return kc}        // sites edited before this update: keep the live content
 if(base===h)return kc;                                     // content.js unchanged since last sync: live edits stay
 try{const c=JSON.parse(rc);if(!valid(c))throw 0;c.rev=Date.now();const out=JSON.stringify(c);await env.SITE_KV.put('content-backup',kc);await env.SITE_KV.put('content',out);await env.SITE_KV.put('base',h);return out}catch(e){return kc}
}
// ---- clean web addresses: /world/the-headline-words  -> the same index.html (the site draws the right page), with share-preview tags for stories ----
const X=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sl=t=>String(t||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const h32=t=>[...String(t||'')].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7).toString(36);
const aslug=t=>{let s=sl(t);if(s.length>90){s=s.slice(0,90);const i=s.lastIndexOf('-');if(i>40)s=s.slice(0,i)}return s};
const artSlug=a=>String(a.slug||aslug(a.title)||'story-'+h32(a.title)).toLowerCase();
const isPage=p=>!/^\/(images|videos|fonts|data|api)(\/|$)/.test(p)&&(p==='/'||!/\.[a-z0-9]{2,8}$/i.test(p));
async function withMeta(env,url,html){
 const segs=decodeURIComponent(url.pathname).split('/').filter(Boolean).map(x=>x.toLowerCase());
 if(segs.length<1||segs.length>2||segs[0]==='search'||segs[0]==='login')return html;
 const D=JSON.parse(await liveContent(env,url)),last=segs[segs.length-1];
 const a=(D.articles||[]).find(x=>artSlug(x)===last)||(D.articles||[]).find(x=>(x.aliases||[]).some(y=>String(y).toLowerCase()===last));
 if(!a)return html;
 const canon=url.origin+'/'+(sl(a.category)||'news')+'/'+artSlug(a),site=X(D.site&&D.site.name||''),t=X(a.title),d=X(String(a.summary||'').slice(0,300));
 const img=a.image&&!/^data:/i.test(a.image)?(/^https?:/i.test(a.image)?a.image:url.origin+'/'+String(a.image).replace(/^\/+/,'')):'';
 const meta='<meta name="description" content="'+d+'"><link rel="canonical" href="'+X(canon)+'"><meta property="og:type" content="article"><meta property="og:site_name" content="'+site+'"><meta property="og:title" content="'+t+'"><meta property="og:description" content="'+d+'"><meta property="og:url" content="'+X(canon)+'">'+(img?'<meta property="og:image" content="'+X(img)+'"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="'+X(img)+'">':'<meta name="twitter:card" content="summary">');
 return html.replace(/<title>[\s\S]*?<\/title>/,()=>'<title>'+t+(site?' | '+site:'')+'</title>').replace('</head>',()=>meta+'</head>')}
async function shell(env,req,url){
 const r=await env.ASSETS.fetch(new Request(new URL('/',url)));
 if(!r.ok)return env.ASSETS.fetch(req);
 let html=await r.text();try{html=await withMeta(env,url,html)}catch(e){}
 return new Response(req.method==='HEAD'?null:html,{status:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}})}
export default{async fetch(req,env){
 const url=new URL(req.url),p=url.pathname;
 try{
  if(p==='/admin'||p==='/admin/')return Response.redirect(url.origin+'/login',302);
  if(p==='/api/content'&&req.method==='GET')return JS(await liveContent(env,url));
  if(p.startsWith('/api/')&&req.method==='POST'){
   if(!env.SITE_KV)return J({error:'Setup incomplete: connect the SITE_KV storage to this project in Cloudflare (see README), then upload the folder again.'},500);
   const b=await req.json().catch(()=>({}));
   if(p==='/api/login'){
    let a=await env.SITE_KV.get('auth','json');
    if(!a){
     const u0=env.ADMIN_USER||'admin',p0=env.ADMIN_PASSWORD||'admin123';
     if(same(b.user||'',u0)&&same(b.password||'',p0)){const salt=rnd(16);a={user:u0,salt,hash:await pbk(b.password,salt),isDefault:!env.ADMIN_PASSWORD};await env.SITE_KV.put('auth',JSON.stringify(a));return J({token:await token(env,a)})}
    }else{
     const h=await pbk(b.password||'',a.salt);
     if(same(b.user||'',a.user)&&same(h,a.hash))return J({token:await token(env,a)});
    }
    await new Promise(r=>setTimeout(r,800));return J({error:'Wrong username or password'},401);
   }
   if(!await authed(req,env))return J({error:'Not logged in'},401);
   if(p==='/api/me'){const a=await env.SITE_KV.get('auth','json');return J({ok:true,isDefault:!!(a&&a.isDefault)})}
   if(p==='/api/content'){if(!valid(b))return J({error:'Invalid content'},400);b.rev=Date.now();const s=JSON.stringify(b);if(s.length>3e6)return J({error:'Content is too large'},400);await env.SITE_KV.put('content',s);if(!await env.SITE_KV.get('base'))await env.SITE_KV.put('base',await sha(await repoContent(env,url)));return J({ok:true,rev:b.rev})}
   if(p==='/api/reset-content'){const rc=await repoContent(env,url),c=JSON.parse(rc);if(!valid(c))return J({error:'content.js in GitHub is not valid'},400);const old=await env.SITE_KV.get('content');if(old)await env.SITE_KV.put('content-backup',old);c.rev=Date.now();await env.SITE_KV.put('content',JSON.stringify(c));await env.SITE_KV.put('base',await sha(rc));return J({ok:true})}
   if(p==='/api/restore-content'){const old=await env.SITE_KV.get('content-backup');if(!old)return J({error:'There is no earlier version to restore.'},400);const cur=await env.SITE_KV.get('content');if(cur)await env.SITE_KV.put('content-backup',cur);const c=JSON.parse(old);c.rev=Date.now();await env.SITE_KV.put('content',JSON.stringify(c));await env.SITE_KV.put('base',await sha(await repoContent(env,url)));return J({ok:true})}
   if(p==='/api/upload'){
    const K=KINDS[b.kind||'image'];if(!K)return J({error:'Unknown upload type'},400);
    const ext=((b.name||'').split('.').pop()||'').toLowerCase().replace(/[^a-z0-9]/g,'');
    if(!K.ext[ext])return J({error:K.msg},400);
    if(!b.data||b.data.length>K.max)return J({error:'That file is too large. '+K.msg},400);
    const base=(b.name||'file').replace(/\.[^.]*$/,'').replace(/[^a-z0-9_-]/gi,'').slice(0,40)||'file';
    const name=Date.now()+'-'+base+'.'+ext;
    await env.SITE_KV.put(K.pre+name,Uint8Array.from(atob(b.data),c=>c.charCodeAt(0)),{metadata:{type:K.ext[ext]}});
    return J({url:K.dir+'/'+name});
   }
   if(p==='/api/account'){
    const a=await env.SITE_KV.get('auth','json');if(!a)return J({error:'Not set up'},400);
    if(!same(await pbk(b.current||'',a.salt),a.hash))return J({error:'Your current password is not correct.'},403);
    const user=String(b.user||'').trim()||a.user;if(user.length>60)return J({error:'Username is too long.'},400);
    if(b.password&&String(b.password).length<8)return J({error:'Use at least 8 characters for the new password.'},400);
    a.user=user;if(b.password){a.salt=rnd(16);a.hash=await pbk(b.password,a.salt)}a.isDefault=false;
    await env.SITE_KV.put('auth',JSON.stringify(a));return J({ok:true,token:await token(env,a)});
   }
   return J({error:'Not found'},404);
  }
  const KD=Object.values(KINDS).find(K=>p.startsWith('/'+K.dir+'/'));
  if(KD&&env.SITE_KV){
   const r=await env.SITE_KV.getWithMetadata(KD.pre+decodeURIComponent(p.slice(KD.dir.length+2)),'arrayBuffer');
   if(r.value){const buf=r.value,size=buf.byteLength,type=(r.metadata&&r.metadata.type)||'application/octet-stream',rg=req.headers.get('Range');
    const h={'Content-Type':type,'Cache-Control':'public, max-age=300','Accept-Ranges':'bytes'};
    if(rg){const m=rg.match(/bytes=(\d*)-(\d*)/);if(m){let s=m[1]?+m[1]:0,e=m[2]?+m[2]:size-1;if(!m[1]&&m[2]){s=Math.max(0,size-(+m[2]));e=size-1}e=Math.min(e,size-1);
     if(s>e||s>=size)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
     return new Response(buf.slice(s,e+1),{status:206,headers:{...h,'Content-Range':`bytes ${s}-${e}/${size}`,'Content-Length':String(e-s+1)}})}}
    return new Response(buf,{headers:{...h,'Content-Length':String(size)}})}
  }
 if((req.method==='GET'||req.method==='HEAD')&&isPage(p))return await shell(env,req,url);
 }catch(e){return J({error:String(e.message||e)},500)}
 return env.ASSETS.fetch(req);
}};
