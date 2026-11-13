/* État de la partie (objet S, sauvegarde) et petits utilitaires ($, fmt, rnd…). */
/* ================= État ================= */
const SAVE_KEY="vallore-save-v1";
let S;
function fresh(){return{v:1,cls:null,name:"Aventurier",lvl:1,xp:0,pts:0,alloc:{vit:0,agi:0,sagesse:0,feu:0,eau:0,terre:0,air:0},ecus:0,hp:60,zone:0,mon:null,spawnT:0,
  res:{},items:[],equip:{},uid:1,jobs:{bucheron:{lvl:1,xp:0},mineur:{lvl:1,xp:0},paysan:{lvl:1,xp:0},herboriste:{lvl:1,xp:0}},job:null,cds:{},auto:{},buffs:[],dots:[],
  kills:0,pkN:0,seen:{},pkNext:20,pk:null,mode:"zone",zk:{},dg:null,timer:0,tower:{best:0,cur:1},allies:{},up:{},combo:0,comboT:0,best:{},st:{},souls:0,soulsTotal:0,prest:0,tal:{},ach:{},q:null,mk:{},mkPrev:{},mkT:0,autoPot:false,potCd:0,ev:null,evNext:90,opt:{},time:0,atkT:0,monT:0,ko:0,log:[],tab:"perso",last:Date.now()}}
/* Trophée en double : fusionne avec celui qu'on a déjà (+1 rang). */
function giveTrophy(id){const own=S.items.filter(x=>x.id===id);if(!own.length){S.items.push({u:S.uid++,id,e:0});return 0}
  const eq=new Set(Object.values(S.equip)),t=own.find(x=>eq.has(x.u))||own[0];t.e=(t.e||0)+1;mx("trophyRank",t.e);dirty=true;log(`${ITEMS[id].name} fusionné : rang ${t.e+1}.`,"g");return t.e}
function fuseTrophies(){const by={};S.items.forEach(x=>{if(ITEMS[x.id]?.slot==="trophee")(by[x.id]=by[x.id]||[]).push(x)});const eq=new Set(Object.values(S.equip)),drop=new Set();
  for(const id in by){const L=by[id];if(L.length<2)continue;const k=L.find(x=>eq.has(x.u))||L[0];L.forEach(x=>{if(x!==k){k.e=(k.e||0)+1+(x.e||0);drop.add(x)}})}
  if(drop.size){S.items=S.items.filter(x=>!drop.has(x));for(const k in S.equip)if([...drop].some(x=>x.u===S.equip[k]))S.equip[k]=null}}
function load(){try{const r=localStorage.getItem(SAVE_KEY);if(r)return Object.assign(fresh(),JSON.parse(r))}catch(e){}return null}
function save(){if(!S)return;S.last=Date.now();try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}

/* ================= Utilitaires ================= */
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const fmt=n=>{n=Math.floor(n);const f=S&&S.opt&&S.opt.numFmt;if(f==="full")return n.toLocaleString("fr-FR");if(f==="sci"&&Math.abs(n)>=1e5)return n.toExponential(2).replace("e+","e");
  return n>=1e15?n.toExponential(2).replace("e+","e"):n>=1e12?(n/1e12).toFixed(2)+" T":n>=1e9?(n/1e9).toFixed(2)+" G":n>=1e7?(n/1e6).toFixed(1)+" M":n>=1e5?(n/1e3).toFixed(1)+" k":n.toLocaleString("fr-FR")};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let dirty=true, fx=true;
function toast(msg,force){const tm=S&&S.opt&&S.opt.toasts;if(!force&&(tm==="none"||tm==="important"&&!/niveau|succès|boss|quête|trophée|éclat|donjon|record|légendaire|épique|braises|averse|tempête|secousses|dorée|étoilée|brume/i.test(msg)))return;const t=$("toast");t.textContent=msg;t.hidden=false;t.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>{t.style.opacity=0;setTimeout(()=>t.hidden=true,300)},2200)}
function log(html,cls="w"){S.log.unshift({h:html,c:cls,t:Date.now()});S.log.length=Math.min(S.log.length,30);renderLog()}
function replayCls(el,cls){el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}
function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const t=a<0?0:255,p=Math.abs(a);r=Math.round(r+(t-r)*p);g=Math.round(g+(t-g)*p);b=Math.round(b+(t-b)*p);return`rgb(${r},${g},${b})`}

