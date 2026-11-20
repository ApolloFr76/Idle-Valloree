/* État de la partie (objet S, sauvegarde) et petits utilitaires ($, fmt, rnd…). */
/* ================= État ================= */
const SAVE_KEY="vallore-save-v1";
const OLD_TREE_BACKUP="vallore-save-avant-arbre";
const MIG_RZ2_NOTICE_KEY="vallore-mig-rz2-notice";
let S;
function fresh(){return{v:SAVE_V,born:Date.now(),cls:null,name:"Aventurier",lvl:1,xp:0,pts:0,alloc:{vit:0,agi:0,sagesse:0,feu:0,eau:0,terre:0,air:0},ecus:0,hp:60,zone:0,mon:null,spawnT:0,
  res:{},items:[],equip:{},uid:1,jobs:{bucheron:{lvl:1,xp:0},mineur:{lvl:1,xp:0},paysan:{lvl:1,xp:0},herboriste:{lvl:1,xp:0},pecheur:{lvl:1,xp:0}},job:null,fdex:{},mgCd:{},cds:{},auto:{},buffs:[],dots:[],
  kills:0,pkN:0,seen:{},pkNext:20,pk:null,mode:"zone",zoneBosses:{},bossLife:{},zk:{},dg:null,timer:0,tower:{best:0,cur:1},allies:{},up:{},combo:0,comboT:0,best:{},st:{},souls:0,soulsTotal:0,prest:0,ach:{},q:null,mk:{},mkPrev:{},mkT:0,autoPot:false,autoBuff:{},arb:{own:{},voies:[],pacte:0,echo:0},rz:2,potCd:0,ev:null,evNext:90,opt:{},time:0,atkT:0,monT:0,ko:0,log:[],workers:[],tab:"perso",last:Date.now(),afkSince:0,hist:[],outfits:[],prof:{c:"bois",e:"cls"},sess:null}}
/* Trophée en double : fusionne avec celui qu'on a déjà (+1 rang). */
function giveTrophy(id){const own=S.items.filter(x=>x.id===id);if(!own.length){S.items.push({u:S.uid++,id,e:0});return 0}
  const eq=new Set(Object.values(S.equip)),t=own.find(x=>eq.has(x.u))||own[0];t.e=(t.e||0)+1;mx("trophyRank",t.e);dirty=true;log(`${ITEMS[id].name} fusionné : rang ${t.e+1}.`,"g");return t.e}
function fuseTrophies(){const by={};S.items.forEach(x=>{if(ITEMS[x.id]?.slot==="trophee")(by[x.id]=by[x.id]||[]).push(x)});const eq=new Set(Object.values(S.equip)),drop=new Set();
  for(const id in by){const L=by[id];if(L.length<2)continue;const k=L.find(x=>eq.has(x.u))||L[0];L.forEach(x=>{if(x!==k){k.e=(k.e||0)+1+(x.e||0);drop.add(x)}})}
  if(drop.size){S.items=S.items.filter(x=>!drop.has(x));for(const k in S.equip)if([...drop].some(x=>x.u===S.equip[k]))S.equip[k]=null}}

/* ---------- Sécurité, validation et intégrité des sauvegardes ---------- */
const clampInt=(v,lo,hi=1e300)=>{const n=Math.floor(+v||0);return Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo};
const clampNum=(v,lo,hi=1e300)=>{const n=+v||0;return Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo};
const isPlainObj=o=>!!o&&typeof o==="object"&&!Array.isArray(o);
const safeKeys=o=>isPlainObj(o)?Object.keys(o).filter(k=>k!=="__proto__"&&k!=="constructor"&&k!=="prototype"):[];

/* Nettoie une ligne HTML du journal : n'autorise que <b> et <span class="..."> ou <b style="color:#..."> sûrs */
function sanitizeLogHtml(s){
  const escAll=String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  return escAll
    .replace(/&lt;(\/?b)&gt;/g,"<$1>")
    .replace(/&lt;(\/?span)&gt;/g,"<$1>")
    .replace(/&lt;span class=&quot;([a-z0-9 _-]+)&quot;&gt;/gi,'<span class="$1">')
    .replace(/&lt;(b|span) style=&quot;color:(#[0-9a-f]{3,6}|var\(--[a-z0-9-]+\))&quot;&gt;/gi,'<$1 style="color:$2">');
}

/* Vérifie et nettoie un objet de sauvegarde désérialisé (import, cloud ou localStorage) */
function sanitizeSave(raw){
  if(!isPlainObj(raw))throw new Error("Format de sauvegarde invalide.");
  const f=fresh();
  f.v=clampInt(raw.v??1,1,1000);
  f.born=clampInt(raw.born??0,0,Date.now()+86400e3);
  if(raw.cls!=null){if(typeof raw.cls!=="string"||!Object.prototype.hasOwnProperty.call(CLASSES,raw.cls))throw new Error("Classe inconnue dans la sauvegarde.");f.cls=raw.cls}
  f.name=typeof raw.name==="string"?raw.name.replace(/[\u0000-\u001f<>]/g,"").trim().slice(0,24)||"Aventurier":"Aventurier";
  f.lvl=clampInt(raw.lvl??1,1,1e6);
  f.xp=clampNum(raw.xp,0,1e300);
  f.pts=clampInt(raw.pts,0,1e9);
  f.ecus=clampNum(raw.ecus,0,1e300);
  f.hp=clampNum(raw.hp??60,0,1e300);
  f.zone=clampInt(raw.zone,0,ZONES.length-1);
  f.uid=clampInt(raw.uid??1,1,1e12);
  f.kills=clampInt(raw.kills,0,1e15);
  f.pkN=clampInt(raw.pkN,0,1e12);
  f.pkNext=clampNum(raw.pkNext??20,0,1e12);
  f.mode=["zone","boss","donjon","tour"].includes(raw.mode)?raw.mode:"zone";
  f.timer=clampNum(raw.timer,0,3600);
  f.combo=clampNum(raw.combo,0,1000);
  f.comboT=clampNum(raw.comboT,0,60);
  f.souls=clampInt(raw.souls,0,1e300);
  f.soulsTotal=clampInt(raw.soulsTotal??f.souls,0,1e300);
  f.prest=clampInt(raw.prest,0,1e6);
  f.mkT=clampNum(raw.mkT,0,1e12);
  f.autoPot=!!raw.autoPot;
  f.rz=raw.rz===2?2:(raw.rz??2);
  f.potCd=clampNum(raw.potCd,0,3600);
  f.evNext=clampNum(raw.evNext??90,0,1e12);
  f.time=clampNum(raw.time,0,1e12);
  f.atkT=clampNum(raw.atkT,0,60);
  f.monT=clampNum(raw.monT,0,60);
  f.ko=clampNum(raw.ko,0,60);
  f.tab=typeof raw.tab==="string"?raw.tab.slice(0,16):"perso";
  f.last=clampInt(raw.last??Date.now(),0,Date.now()+86400e3);
  f.afkSince=clampInt(raw.afkSince,0,Date.now()+86400e3);
  for(const k of["migAuto","migSell","optV2"])if(raw[k])f[k]=1;
  for(const k of Object.keys(f.alloc))f.alloc[k]=clampInt(raw.alloc?.[k],0,1e9);
  for(const k of safeKeys(raw.res))if(Object.prototype.hasOwnProperty.call(RES,k))f.res[k]=clampInt(raw.res[k],0,1e300);
  if(Array.isArray(raw.items)){
    const seenU=new Set();
    for(const it of raw.items.slice(0,2000)){
      if(!isPlainObj(it)||typeof it.id!=="string"||!Object.prototype.hasOwnProperty.call(ITEMS,it.id))continue;
      const u=clampInt(it.u,1,1e12);if(seenU.has(u))continue;seenU.add(u);
      const item={u,id:it.id,e:clampInt(it.e,0,1000),r:clampInt(it.r,0,RAR.length-1)};
      if(it.lk)item.lk=1;
      f.items.push(item);
      if(u>=f.uid)f.uid=u+1;
    }
  }
  const validU=new Set(f.items.map(x=>x.u));
  for(const sl of safeKeys(raw.equip))if(Object.prototype.hasOwnProperty.call(EQ,sl)&&validU.has(raw.equip[sl]))f.equip[sl]=raw.equip[sl];
  for(const pid of Object.keys(PROFS)){const j=raw.jobs?.[pid];f.jobs[pid]={lvl:clampInt(j?.lvl??1,1,PROF_MAX),xp:clampNum(j?.xp,0,1e15)}}
  if(isPlainObj(raw.job)&&typeof raw.job.r==="string"&&RES[raw.job.r]?.prof)f.job={r:raw.job.r,t:clampNum(raw.job.t,0,3600)};
  for(const k of safeKeys(raw.fdex))if(FISHBY[k]&&isPlainObj(raw.fdex[k]))f.fdex[k]={n:clampInt(raw.fdex[k].n,0,1e9),cm:clampInt(raw.fdex[k].cm,0,1e6)};
  for(const k of safeKeys(raw.mgCd))if(PROFS[k])f.mgCd[k]=clampNum(raw.mgCd[k],0,1e12);
  for(const k of safeKeys(raw.cds))f.cds[k]=clampNum(raw.cds[k],0,1e12);
  for(const k of safeKeys(raw.auto))f.auto[k]=!!raw.auto[k];
  if(Array.isArray(raw.buffs))for(const b of raw.buffs.slice(0,30))if(isPlainObj(b)&&typeof b.k==="string"&&typeof b.n==="string")f.buffs.push({k:b.k.slice(0,16),v:clampNum(b.v,0,100),until:clampNum(b.until,0,1e12),n:b.n.slice(0,40)});
  for(const k of safeKeys(raw.seen))f.seen[k.slice(0,40)]=1;
  for(const k of safeKeys(raw.zoneBosses))if(+k>=0&&+k<ZONES.length&&raw.zoneBosses[k])f.zoneBosses[+k]=1;
  for(const k of safeKeys(raw.bossLife))if(+k>=0&&+k<ZONES.length&&raw.bossLife[k])f.bossLife[+k]=1;
  for(const k of safeKeys(raw.zk))if(+k>=0&&+k<ZONES.length)f.zk[+k]=clampInt(raw.zk[k],0,1e9);
  if(isPlainObj(raw.dg)&&+raw.dg.z>=0&&+raw.dg.z<ZONES.length)f.dg={z:clampInt(raw.dg.z,0,ZONES.length-1),wave:clampInt(raw.dg.wave??1,1,DG_WAVES)};
  else f.dg=null;
  if(f.mode==="donjon"&&!f.dg)f.mode="zone";
  f.tower={best:clampInt(raw.tower?.best,0,1e6),cur:clampInt(raw.tower?.cur??1,1,1e6)};
  for(const[aid]of ALLIES)if(raw.allies?.[aid])f.allies[aid]=clampInt(raw.allies[aid],0,1e6);
  for(const[uid]of UPGS)if(raw.up?.[uid])f.up[uid]=true;
  for(const k of safeKeys(raw.best))if(Object.prototype.hasOwnProperty.call(MON,k))f.best[k]=clampInt(raw.best[k],0,1e12);
  for(const k of safeKeys(raw.st))f.st[k.slice(0,24)]=clampNum(raw.st[k],0,1e300);
  for(const a of ACH)if(raw.ach?.[a.id])f.ach[a.id]=1;
  if(isPlainObj(raw.q)&&typeof raw.q.day==="string"&&Array.isArray(raw.q.list)){
    f.q={day:raw.q.day.slice(0,16),reroll:clampInt(raw.q.reroll,0,10),bonus:!!raw.q.bonus,
      list:raw.q.list.slice(0,3).filter(isPlainObj).map(q=>({type:Q_TYPES.includes(q.type)?q.type:"kill",key:typeof q.key==="string"?q.key.slice(0,32):undefined,txt:typeof q.txt==="string"?q.txt.replace(/[<>]/g,"").slice(0,80):"Quête",have:clampInt(q.have,0,1e12),need:clampInt(q.need??1,1,1e12),ecus:clampInt(q.ecus,0,1e300),xp:clampInt(q.xp,0,1e300),done:!!q.done,claimed:!!q.claimed}))};
  }
  for(const k of safeKeys(raw.mk))if(Object.prototype.hasOwnProperty.call(RES,k))f.mk[k]=clampNum(raw.mk[k],MK_MIN,MK_MAX);
  for(const k of safeKeys(raw.mkPrev))if(Object.prototype.hasOwnProperty.call(RES,k))f.mkPrev[k]=clampNum(raw.mkPrev[k],MK_MIN,MK_MAX);
  for(const[pid]of POTIONS)if(raw.autoBuff?.[pid])f.autoBuff[pid]=true;
  if(isPlainObj(raw.arb)){
    const own={};for(const k of safeKeys(raw.arb.own))if(ARB_ID[k]&&raw.arb.own[k])own[k]=1;
    const pacte=clampInt(raw.arb.pacte,0,3);
    const voies=Array.isArray(raw.arb.voies)?raw.arb.voies.filter(v=>ARB_VK.includes(v)).slice(0,1+pacte):[];
    f.arb={own,voies,pacte,echo:clampInt(raw.arb.echo,0,1e6)};
  }
  f.opt=fixOpts(isPlainObj(raw.opt)?raw.opt:{});
  if(isPlainObj(raw.sellCfg)){f.sellCfg={};for(const k of safeKeys(raw.sellCfg))if(Object.prototype.hasOwnProperty.call(RES,k)&&isPlainObj(raw.sellCfg[k]))f.sellCfg[k]={on:raw.sellCfg[k].on!==false,keep:clampInt(raw.sellCfg[k].keep??SELL_KEEP_DEF,0,1e9)}}
  if(isPlainObj(raw.codes)){f.codes={};for(const k of safeKeys(raw.codes))if(Object.prototype.hasOwnProperty.call(CODES,k))f.codes[k]=clampInt(raw.codes[k],0,1e6)}
  if(isPlainObj(raw.tips)){f.tips={};for(const k of safeKeys(raw.tips))f.tips[k.slice(0,24)]=1}
  if(isPlainObj(raw.unl)){f.unl={};for(const k of safeKeys(raw.unl))f.unl[k.slice(0,24)]=1}
  if(raw.tutoDone)f.tutoDone=1;
  if(raw.clsSwaps)f.clsSwaps=clampInt(raw.clsSwaps,0,1e6);
  if(raw.bossAutoT)f.bossAutoT=clampNum(raw.bossAutoT,0,1e12);
  if(raw.dgAutoT)f.dgAutoT=clampNum(raw.dgAutoT,0,1e12);
  if(raw.towerAgainT)f.towerAgainT=clampNum(raw.towerAgainT,0,1e12);
  if(Array.isArray(raw.workers)){
    for(const w of raw.workers.slice(0,OUV_MAX+2)){
      if(!isPlainObj(w)||typeof w.r!=="string"||!RES[w.r]?.prof)continue;
      f.workers.push({name:(typeof w.name==="string"?w.name.replace(/[<>]/g,"").trim().slice(0,20):"Ouvrier")||"Ouvrier",look:clampInt(w.look,0,OUV_LOOK.length-1),r:w.r,t:clampNum(w.t,0,3600),n:clampInt(w.n,0,1e15)});
    }
  }
  if(Array.isArray(raw.log)){
    for(const l of raw.log.slice(0,LOG_MAX)){
      if(!isPlainObj(l)||typeof l.h!=="string")continue;
      const c=["w","g","r","x"].includes(l.c)?l.c:"w";
      f.log.push({h:sanitizeLogHtml(l.h),c,t:clampInt(l.t,0,Date.now()+86400e3)});
    }
  }
  if(Array.isArray(raw.hist)){
    for(const h of raw.hist.slice(-168))if(isPlainObj(h))f.hist.push({h:clampInt(h.h,0,1e9),l:clampInt(h.l,1,1e6),d:clampNum(h.d,0,1e300),e:clampNum(h.e,0,1e300),k:clampInt(h.k,0,1e15)});
  }
  if(Array.isArray(raw.outfits)){
    f.outfits=raw.outfits.slice(0,3).map(o=>{if(!isPlainObj(o)||!isPlainObj(o.eq))return null;const eq={};for(const sl of safeKeys(o.eq))if(Object.prototype.hasOwnProperty.call(EQ,sl)&&validU.has(o.eq[sl]))eq[sl]=o.eq[sl];return{n:typeof o.n==="string"?o.n.replace(/[<>]/g,"").slice(0,24):"",eq}});
  }
  if(isPlainObj(raw.prof))f.prof={c:typeof raw.prof.c==="string"?raw.prof.c.slice(0,16):"bois",e:typeof raw.prof.e==="string"?raw.prof.e.slice(0,16):"cls"};
  if(isPlainObj(raw.sess))f.sess={at:clampInt(raw.sess.at,0,Date.now()+86400e3),play:clampNum(raw.sess.play,0,1e12),lvl:clampInt(raw.sess.lvl??1,1,1e6),xp:clampNum(raw.sess.xp,0,1e300),kills:clampInt(raw.sess.kills,0,1e15),ecus:clampNum(raw.sess.ecus,0,1e300),bosses:clampInt(raw.sess.bosses,0,1e12),dungeons:clampInt(raw.sess.dungeons,0,1e12),quests:clampInt(raw.sess.quests,0,1e12),crafts:clampInt(raw.sess.crafts,0,1e12),fish:clampInt(raw.sess.fish,0,1e12),prest:clampInt(raw.sess.prest,0,1e6),souls:clampInt(raw.sess.souls,0,1e300),ach:clampInt(raw.sess.ach,0,1e6),maxHit:clampNum(raw.sess.maxHit,0,1e300),tower:clampInt(raw.sess.tower,0,1e6),bestRar:clampInt(raw.sess.bestRar,0,10)};
  return f;
}

/* Signature d'intégrité (V2.<empreinte>.<base64>) pour l'export/import de sauvegarde */
const SAVE_SALT="vallore-save-v2:7f9c2a";
function saveChecksum(b64){
  const s=SAVE_SALT+"|"+b64;let h1=0x811c9dc5,h2=0x01000193;
  for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,16777619);h2=Math.imul(h2^(c+i),2246822507)}
  return((h1>>>0).toString(36).padStart(7,"0")+(h2>>>0).toString(36).padStart(7,"0"));
}
function encodeSave(obj=S){
  const b64=btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  return"V2."+saveChecksum(b64)+"."+b64;
}
function decodeSave(str){
  const v=String(str||"").trim();if(!v)throw new Error("Code de sauvegarde vide.");
  let b64=v;
  if(v.startsWith("V2.")){
    const parts=v.split(".");if(parts.length!==3)throw new Error("Format de sauvegarde V2 invalide.");
    if(saveChecksum(parts[2])!==parts[1])throw new Error("Sauvegarde modifiée ou corrompue (signature invalide).");
    b64=parts[2];
  }
  let raw;try{raw=JSON.parse(decodeURIComponent(escape(atob(b64))))}catch(e){throw new Error("Sauvegarde illisible.")}
  const err=saveErr(raw);if(err)throw new Error("Sauvegarde invalide : "+err);
  return migrate(sanitizeSave(raw));
}

/* Version de la sauvegarde (S.v) et migrations. MIG[n] fait passer une partie de la version n à la version n+1 ;
   elles s'appliquent dans l'ordre, une seule fois, au chargement, à l'import et à la restauration d'une copie de secours.
   Changer la structure de S = ajouter MIG[SAVE_V] à la fin (SAVE_V suit tout seul) et la valeur par défaut dans fresh(). */
const MIG={
  /* 1 → 2 : anciennes migrations à drapeaux regroupées ici ; date de création de la partie */
  1:s=>{s.up=s.up||{};s.opt=s.opt||{};
    if(!s.migAuto){s.migAuto=1;if(s.cls&&CLASSES[s.cls])CLASSES[s.cls].spells.forEach((sp,i)=>{if(s.auto&&s.auto[sp.id])s.up["sp"+(i+1)]=true});if(s.autoPot)s.up.potauto=true}  /* sorts et potions automatiques devenus payants */
    if(!s.migSell){s.migSell=1;if(s.opt.autoSellFull)s.up.vendeur=true}   /* vente automatique devenue payante (Colporteur) */
    if(!s.optV2){s.optV2=1;s.opt.forgeQte=true}
    if(!s.born)s.born=Math.min(s.last||Date.now(),Date.now()-(s.st&&s.st.time||0)*1000)}
};
const SAVE_V=1+Object.keys(MIG).length;
function migrate(s){let v=Math.max(1,Math.floor(+s.v||1));while(v<SAVE_V){if(MIG[v])MIG[v](s);v++}s.v=Math.max(v,+s.v||1);return s}
/* partie lue (texte JSON déjà décodé) → objet complet ; la version d'origine est gardée pour que migrate() sache quoi faire */
const fromData=d=>Object.assign(fresh(),d,{v:+d.v||1,born:+d.born||0});
/* Vérifie et répare une partie importée ou restaurée. Renvoie le problème trouvé (texte) ou "" si elle est utilisable.
   Erreur bloquante : mauvais type pour une valeur essentielle. Réparé sans bloquer : objets inconnus retirés, quantités invalides remises à 0. */
function saveErr(d){const num=(v,min=0)=>typeof v==="number"&&Number.isFinite(v)&&v>=min,obj=v=>!!v&&typeof v==="object"&&!Array.isArray(v);
  if(!obj(d))return"ce n'est pas une partie";if(!CLASSES[d.cls])return"classe inconnue";if(!num(d.lvl,1))return"niveau invalide";
  for(const k of["xp","ecus","pts","zone","kills","souls","soulsTotal","prest"])if(d[k]!=null&&!num(d[k]))return`valeur « ${k} » invalide`;
  if(d.zone!=null&&!ZONES[d.zone])return"zone inconnue";
  for(const k of["items","workers","log","hist","buffs","dots"])if(d[k]!=null&&!Array.isArray(d[k]))return`liste « ${k} » invalide`;
  for(const k of["res","equip","jobs","alloc","st","opt","allies","up","ach"])if(d[k]!=null&&!obj(d[k]))return`données « ${k} » invalides`;
  if(d.items){d.items=d.items.filter(x=>obj(x)&&ITEMS[x.id]&&num(x.u));const U=new Set(d.items.map(x=>x.u));if(d.equip)for(const k in d.equip)if(d.equip[k]!=null&&!U.has(d.equip[k]))d.equip[k]=null}
  for(const k of["res","st","allies","alloc"])if(d[k])for(const r in d[k])if(typeof d[k][r]!=="number"||!Number.isFinite(d[k][r])||d[k][r]<0)d[k][r]=0;
  return""}
function load(){try{const r=localStorage.getItem(SAVE_KEY);if(r){const raw=JSON.parse(r);raw._rawRz=raw.rz;return sanitizeSave(raw)}}catch(e){}return null}
/* écriture refusée (stockage plein ou bloqué) : on libère les copies de secours puis on prévient le joueur (au plus toutes les 5 min) */
let saveKo=0;
function saveFail(){const t=Date.now();if(t-saveKo<5*60e3)return;saveKo=t;
  toast("Sauvegarde impossible : le stockage du navigateur est plein ou bloqué. Exportez votre partie (Options › Sauvegarde) pour ne rien perdre.",1);
  try{log("La sauvegarde dans ce navigateur a échoué (stockage plein ou bloqué, navigation privée ?). Pensez à exporter votre partie.","r")}catch(e){}}
function save(){if(!S)return;S.last=Date.now();const d=JSON.stringify(S);
  try{localStorage.setItem(SAVE_KEY,d)}catch(e){try{localStorage.removeItem(BK_KEY);bkLast.t=Date.now();localStorage.setItem(SAVE_KEY,d)}catch(e2){saveFail();return}}
  if(S.cls&&Date.now()-bkLast()>BK_EVERY)backup("auto")}
/* Sauvegardes de secours : les 3 dernières copies de la partie (une toutes les 15 min, et avant un import, une restauration ou une remise à zéro). */
const BK_KEY="vallore-secours",BK_MAX=3,BK_EVERY=15*60e3;
function bkList(){try{const L=JSON.parse(localStorage.getItem(BK_KEY)||"[]");return Array.isArray(L)?L:[]}catch(e){return[]}}
function bkLast(){if(bkLast.t==null){const L=bkList();bkLast.t=L.length?L[0].t:0}return bkLast.t}
function backup(why){if(!S||!S.cls)return;const L=bkList();L.unshift({t:Date.now(),why,lvl:S.lvl,cls:S.cls,name:S.name,prest:S.prest||0,d:JSON.stringify(S)});L.length=Math.min(L.length,BK_MAX);bkLast.t=Date.now();
  while(L.length){try{localStorage.setItem(BK_KEY,JSON.stringify(L));return}catch(e){L.pop()}}}
function bkLoad(i){const b=bkList()[i];if(!b)return false;let d;try{d=JSON.parse(b.d)}catch(e){return false}if(!d||saveErr(d))return false;backup("restore");S=migrate(sanitizeSave(d));S.opt=fixOpts(S.opt);save();return true}
/* Réinitialisation unifiée de la partie (écran d'accueil ou Options) */
function resetRun({keepOpts=true,keepName=false,backupKey=null}={}){
  if(S&&S.cls)backup("reset");
  if(backupKey&&S){try{localStorage.setItem(backupKey,JSON.stringify(S))}catch(e){}}
  const opt=keepOpts&&S&&S.opt?{...S.opt}:{},name=keepName&&S&&S.name?S.name:"Aventurier";
  S=fresh();S.opt=fixOpts(opt);S.name=name;save();return S;
}

/* ================= Utilitaires ================= */
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const fmt=n=>{n=Math.floor(n);if(n<0)return"-"+fmt(-n);const f=S&&S.opt&&S.opt.numFmt;if(f==="full")return n.toLocaleString("fr-FR");if(f==="sci"&&Math.abs(n)>=1e5)return n.toExponential(2).replace("e+","e");
  if(n<1e5)return n.toLocaleString("fr-FR");if(n<1e7)return(n/1e3).toFixed(1)+" k";
  const e=Math.floor(Math.log10(n)/3),u=NUM_SUF[e];if(!u)return n.toExponential(2).replace("e+","e");return(n/Math.pow(1000,e)).toFixed(e===2?1:2)+" "+u};
/* Abréviations des grands nombres : k mille, M million, B milliard, T trillion, qu quadrillion, Q quintillion, sx sextillion,
   Sp septillion, Oc octillion, No nonillion, Dc décillion (au-delà : notation scientifique) */
const NUM_SUF=["","k","M","B","T","qu","Q","sx","Sp","Oc","No","Dc"];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let dirty=true, fx=true;
/* Une seule boucle d'images pour tout le jeu (SCENE, MONDE…) : chaque partie s'y inscrit avec FRAME.add(f), f(t) est appelée
   à chaque image. Réglage « Images par seconde » à 30 (S.opt.fps) : une image sur deux est sautée. Une erreur dans une partie
   n'arrête pas les autres. */
const FRAME={L:[],t:0,add(f){this.L.push(f);if(this.L.length===1)requestAnimationFrame(FRAME.run)},
  run(t){requestAnimationFrame(FRAME.run);if(S&&S.opt&&S.opt.fps===30&&t-FRAME.t<1000/30-4)return;FRAME.t=t;
    for(const f of FRAME.L)try{f(t)}catch(e){console.error(e)}}};
/* Place la bulle là où elle ne cache rien : dans le décor libre à gauche du panneau ouvert, au-dessus de la barre de sorts ;
   si le panneau occupe presque tout l'écran (fenêtre étroite, téléphone), en haut de l'écran. */
function placeToast(t){const st=t.style;st.left=st.top=st.bottom=st.maxWidth="";t.classList.remove("ttop");
  const pc=$("panelCard"),bar=document.querySelector(".abar"),W=innerWidth,H=innerHeight;let L=0,R=W;
  const open=pc&&typeof UI!=="undefined"&&UI.o;if(open){const r=pc.getBoundingClientRect();if(r.width&&r.left<W)R=Math.max(0,r.left)}
  if(R-L<260){t.classList.add("ttop");return}
  const bt=bar&&bar.getBoundingClientRect(),y=bt&&bt.height&&bt.top>H/2?H-bt.top+8:18;
  st.left=(L+R)/2+"px";st.bottom=y+"px";st.maxWidth=(R-L-24)+"px"}
function toast(msg,force){const tm=S&&S.opt&&S.opt.toasts;if(!force&&(tm==="none"||tm==="important"&&!/niveau|succès|boss|quête|trophée|éclat|donjon|record|légendaire|épique|braises|averse|tempête|secousses|dorée|étoilée|brume/i.test(msg)))return;const t=$("toast");t.textContent=msg;t.hidden=false;placeToast(t);t.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>{t.style.opacity=0;setTimeout(()=>t.hidden=true,300)},2200)}
const LOG_MAX=60;
function log(html,cls="w"){S.log.unshift({h:html,c:cls,t:Date.now()});S.log.length=Math.min(S.log.length,LOG_MAX);renderLog()}
/* rejoue l'animation CSS d'une classe. La classe est retirée tout de suite et remise à l'image suivante,
   toutes ensemble : un seul recalcul de la page par image, même quand les coups pleuvent. */
const replayQ=[];let replayRaf=0;
function replayCls(el,cls){if(!el)return;for(let i=0;i<replayQ.length;i+=2)if(replayQ[i]===el&&replayQ[i+1]===cls)return;if(!el.classList.contains(cls)){el.classList.add(cls);return}el.classList.remove(cls);replayQ.push(el,cls);
  if(!replayRaf)replayRaf=requestAnimationFrame(()=>{replayRaf=0;void document.body.offsetWidth;const q=replayQ.splice(0);for(let i=0;i<q.length;i+=2)q[i].classList.add(q[i+1])})}
function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const t=a<0?0:255,p=Math.abs(a);r=Math.round(r+(t-r)*p);g=Math.round(g+(t-g)*p);b=Math.round(b+(t-b)*p);return`rgb(${r},${g},${b})`}

