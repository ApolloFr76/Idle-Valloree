/* État de la partie (objet S, sauvegarde) et petits utilitaires ($, fmt, rnd…). */
/* ================= État ================= */
const SAVE_KEY="vallore-save-v1";
let S;
function fresh(){return{v:1,cls:null,name:"Aventurier",lvl:1,xp:0,pts:0,alloc:{vit:0,agi:0,sagesse:0,feu:0,eau:0,terre:0,air:0},ecus:0,hp:60,zone:0,mon:null,spawnT:0,
  res:{},items:[],equip:{},uid:1,jobs:{bucheron:{lvl:1,xp:0},mineur:{lvl:1,xp:0},paysan:{lvl:1,xp:0},herboriste:{lvl:1,xp:0},pecheur:{lvl:1,xp:0}},job:null,fdex:{},mgCd:{},cds:{},auto:{},buffs:[],dots:[],
  kills:0,pkN:0,seen:{},pkNext:20,pk:null,mode:"zone",zoneBosses:{},bossLife:{},zk:{},dg:null,timer:0,tower:{best:0,cur:1},allies:{},up:{},combo:0,comboT:0,best:{},st:{},souls:0,soulsTotal:0,prest:0,tal:{},ach:{},q:null,mk:{},mkPrev:{},mkT:0,autoPot:false,autoBuff:{},arb:{own:{},voies:[],pacte:0,echo:0},rz:2,potCd:0,ev:null,evNext:90,opt:{},time:0,atkT:0,monT:0,ko:0,log:[],workers:[],tab:"perso",last:Date.now(),afkSince:0,afkWeight:0,hist:[],outfits:[]}}
/* Trophée en double : fusionne avec celui qu'on a déjà (+1 rang). */
function giveTrophy(id){const own=S.items.filter(x=>x.id===id);if(!own.length){S.items.push({u:S.uid++,id,e:0});return 0}
  const eq=new Set(Object.values(S.equip)),t=own.find(x=>eq.has(x.u))||own[0];t.e=(t.e||0)+1;mx("trophyRank",t.e);dirty=true;log(`${ITEMS[id].name} fusionné : rang ${t.e+1}.`,"g");return t.e}
function fuseTrophies(){const by={};S.items.forEach(x=>{if(ITEMS[x.id]?.slot==="trophee")(by[x.id]=by[x.id]||[]).push(x)});const eq=new Set(Object.values(S.equip)),drop=new Set();
  for(const id in by){const L=by[id];if(L.length<2)continue;const k=L.find(x=>eq.has(x.u))||L[0];L.forEach(x=>{if(x!==k){k.e=(k.e||0)+1+(x.e||0);drop.add(x)}})}
  if(drop.size){S.items=S.items.filter(x=>!drop.has(x));for(const k in S.equip)if([...drop].some(x=>x.u===S.equip[k]))S.equip[k]=null}}
function load(){try{const r=localStorage.getItem(SAVE_KEY);if(r)return Object.assign(fresh(),JSON.parse(r))}catch(e){}return null}
function save(){if(!S)return;S.last=Date.now();try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}if(S.cls&&Date.now()-bkLast()>BK_EVERY)backup("auto")}
/* Sauvegardes de secours : les 3 dernières copies de la partie (une toutes les 15 min, et avant un import, une restauration ou une remise à zéro). */
const BK_KEY="vallore-secours",BK_MAX=3,BK_EVERY=15*60e3;
function bkList(){try{const L=JSON.parse(localStorage.getItem(BK_KEY)||"[]");return Array.isArray(L)?L:[]}catch(e){return[]}}
function bkLast(){if(bkLast.t==null){const L=bkList();bkLast.t=L.length?L[0].t:0}return bkLast.t}
function backup(why){if(!S||!S.cls)return;const L=bkList();L.unshift({t:Date.now(),why,lvl:S.lvl,cls:S.cls,name:S.name,prest:S.prest||0,d:JSON.stringify(S)});L.length=Math.min(L.length,BK_MAX);bkLast.t=Date.now();
  while(L.length){try{localStorage.setItem(BK_KEY,JSON.stringify(L));return}catch(e){L.pop()}}}
function bkLoad(i){const b=bkList()[i];if(!b)return false;let d;try{d=JSON.parse(b.d)}catch(e){return false}if(!d||!d.cls)return false;backup("restore");S=Object.assign(fresh(),d);save();return true}

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

