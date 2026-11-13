/* Vie de l'arène et de l'interface : décor animé par zone, cycle jour/nuit, expressions du héros
   et des monstres, visiteurs, monstres brillants, bulles des compagnons, réactions à la météo,
   chiffres qui défilent, pièces volantes, journal animé. Tout passe par l'objet VIE. */
const VIE=(()=>{
  const A=()=>$("arena"),calm=()=>S&&S.opt&&S.opt.reduceMotion,on=()=>fx&&S&&S.cls;
  const R=(a,b)=>a+Math.random()*(b-a),pick=L=>L[Math.random()*L.length|0];
  const relTo=(el,box)=>{const a=box.getBoundingClientRect(),r=el.getBoundingClientRect();return{x:r.left-a.left,y:r.top-a.top,w:r.width,h:r.height}};

  /* ---------- Décor animé par zone ---------- */
  /* type de particule : [nombre, couleurs] — voir les classes .dp-* dans style.css */
  const DECO={prairie:{bfly:[4,["#ffd36a","#ff9ac8","#bfe3ff","#fff6d8"]]},
    bois:{leaf:[7,["#d98a3a","#c9a23a","#8fbf4a"]],firefly:[3,["#e8ff8a"]]},
    marais:{bubble:[8,["#bfeedd"]],firefly:[2,["#c6e86b"]]},
    mines:{drip:[6,["#8fc7e0"]],mote:[5,["#e8c890"]]},
    dunes:{streak:[6,["#f0d8a0"]],mote:[5,["#f7c948"]]},
    givre:{snow:[14,["#ffffff","#e0f0ff"]]},
    falaises:{streak:[8,["#e8f6ff"]],leaf:[2,["#bfeedd"]]},
    jungle:{leaf:[5,["#5fd07a","#8fbf4a"]],bfly:[3,["#ff8ab0","#5fd0e0","#ffd36a"]],firefly:[3,["#e8ff8a"]]},
    recifs:{bubble:[10,["#bfe3ff","#ffffff"]]},
    volcan:{ember:[11,["#ffb03c","#ff6a2c","#ffd36a"]]},
    ruines:{mote:[8,["#c8b8f0","#9a7af0"]],firefly:[2,["#e6d8ff"]]},
    abime:{mote:[8,["#5a6ad0","#9a7af0"]],firefly:[3,["#7ae0d0"]]}};
  const OUTDOOR=new Set(["prairie","bois","marais","dunes","givre","falaises","jungle"]);
  let decoKey="";
  function deco(zid){const box=$("deco");if(!box)return;const night=isNight(),key=zid+(night?"n":"");if(key===decoKey)return;decoKey=key;
    const conf=Object.assign({},DECO[zid]||DECO.prairie);if(night&&OUTDOOR.has(zid))conf.firefly=[(conf.firefly?conf.firefly[0]:0)+4,["#e8ff8a"]];
    let h="";for(const t in conf){const[n,cols]=conf[t];for(let i=0;i<n;i++)h+=`<i class="dp dp-${t}" style="left:${R(2,96).toFixed(1)}%;top:${R(4,82).toFixed(1)}%;--c:${pick(cols)};--t:${R(4,10).toFixed(1)}s;--d:-${R(0,10).toFixed(1)}s;--s:${R(.7,1.3).toFixed(2)}"></i>`}
    box.innerHTML=h}

  /* ---------- Cycle jour / nuit (heure réelle) ---------- */
  const hour=()=>{const d=new Date();return d.getHours()+d.getMinutes()/60};
  const isNight=()=>{const h=hour();return h>=21||h<6};
  function sky(){const s=$("sky");if(!s)return;const h=hour();let c="";
    if(h>=21||h<5.5)c="night";else if(h<8)c="dawn";else if(h>=18)c="dusk";
    s.className="sky"+(c?" "+c:"");A().classList.toggle("is-night",c==="night");if(S&&S.zone!=null)deco(ZONES[S.zone].id)}

  /* ---------- Bulles de texte au-dessus d'un élément de l'arène ---------- */
  function say(el,txt,cls="",ms=2600){if(!el||!on())return;const a=A(),p=relTo(el,a);const b=document.createElement("div");b.className="say "+cls;b.textContent=txt;
    b.style.left=(p.x+p.w/2)+"px";b.style.top=(p.y-4)+"px";a.appendChild(b);setTimeout(()=>b.remove(),ms)}

  /* ---------- Héros : clignement, sueur quand les PV sont bas, joie ---------- */
  let blinkT=0,sweatT=0;
  function heroBlink(){const h=$("ahero");if(!h||h.hidden||heroAtk.t&&performance.now()-atkT<300)return;const C=CLASSES[S.cls];h.src=PX.hero(S.cls,C.col,"blink");setTimeout(()=>{if(performance.now()-atkT>200)h.src=PX.hero(S.cls,C.col)},140)}
  function cheer(){if(!on())return;const h=$("ahero");if(h)replayCls(h,"cheer");document.querySelectorAll("#pals .pal").forEach((p,i)=>setTimeout(()=>replayCls(p,"patk"),i*90))}
  function sweat(){const h=$("ahero"),a=A();if(!h||h.hidden)return;const p=relTo(h,a);const d=document.createElement("i");d.className="fxsweat";d.style.left=(p.x+p.w*.72)+"px";d.style.top=(p.y+p.h*.2)+"px";a.appendChild(d);setTimeout(()=>d.remove(),900)}

  /* ---------- Monstres : surprise, douleur, attaque élémentaire, brillants ---------- */
  function monSpawn(boss){const b=$("monBtn");if(!b||!on())return;$("mon").classList.toggle("shiny",!!(S.mon&&S.mon.shiny));
    if(S.mon&&S.mon.shiny){FXbanner("Monstre brillant !","XP et écus ×5","shiny");say(b,"✦","bang",1200);return}
    if(!boss&&Math.random()<.45)setTimeout(()=>say(b,pick(["!","?!","!!"]),"bang",900),250)}
  function ouch(){const b=$("monBtn");if(!b||!on())return;SCENE.monHurt()}
  const ELFX={feu:["#ff8a3c","#ffd36a"],eau:["#6bb8e8","#bfe3ff"],air:["#e8fff6","#bfeedd"],terre:["#a8743e","#d9b47a"],neutre:["#ffffff","#c4a878"]};
  function monAtkFx(){if(!on()||!S.mon)return;const h=$("ahero"),a=A();if(!h)return;const p=relTo(h,a),cols=ELFX[MON[S.mon.id].el]||ELFX.neutre;
    for(let i=0;i<5;i++){const e=document.createElement("i");e.className="fx pt";e.style.left=(p.x+p.w*.9)+"px";e.style.top=(p.y+p.h*R(.3,.6))+"px";e.style.width=e.style.height="5px";e.style.background=cols[i%2];a.appendChild(e);
      e.animate([{transform:"translate(30px,0)",opacity:1},{transform:`translate(${R(-30,-10)}px,${R(-14,14)}px)`,opacity:0}],{duration:R(260,420),easing:"ease-out",fill:"forwards"});setTimeout(()=>e.remove(),450)}}

  /* ---------- Pièces qui volent vers le compteur d'écus ---------- */
  let coinT=0;
  function coinFly(){if(!on()||calm())return;const now=performance.now();if(now-coinT<260)return;coinT=now;const m=$("monBtn"),t=$("ecusTxt");if(!m||!t)return;
    const a=m.getBoundingClientRect(),b=t.getBoundingClientRect(),c=document.createElement("i");c.className="coinfly";c.style.left=(a.left+a.width/2)+"px";c.style.top=(a.top+a.height/2)+"px";document.body.appendChild(c);
    const dx=b.left-a.left-a.width/2,dy=b.top-a.top-a.height/2;c.animate([{transform:"translate(0,0) scale(1)"},{transform:`translate(${dx*.4}px,${dy*.4-60}px) scale(1.2)`,offset:.4},{transform:`translate(${dx}px,${dy}px) scale(.6)`,opacity:.6}],{duration:700,easing:"ease-in"}).onfinish=()=>{c.remove();const e=$("ecusTxt").parentElement;if(e)replayCls(e,"bump")}}

  /* ---------- Chiffres qui défilent ---------- */
  let dispE=null;
  function ecus(){const t=S.ecus;if(dispE===null||calm()||Math.abs(t-dispE)<1)dispE=t;else dispE+=(t-dispE)*.3;if(Math.abs(t-dispE)<1)dispE=t;return Math.round(dispE)}

  /* ---------- Visiteurs qui traversent l'arène ---------- */
  const VISITORS=[
    {id:"marchand",n:"Marchand ambulant",img:()=>PX.hero("gardien","#c9a86a"),cls:"",line:"Bonnes affaires !",give(){const g=gainEcus(Math.max(50,farmGold(45)));return`+${fmt(g)} écus`}},
    {id:"oiseau",n:"Oiseau messager",img:()=>PX.pet("#f2c14e"),cls:"bird",line:"Cui !",give(){const x=Math.round(xpNeed(S.lvl)*.06);gainXp(x);return`+${fmt(x)} XP`}},
    {id:"fantome",n:"Petit fantôme",img:()=>PX.pet("#e8eefc"),cls:"ghost",line:"Bouh…",give(){pkBuff("dmg",1.3,30,"Bénédiction du fantôme");return"Dégâts ×1,3 pendant 30 s"}}];
  let visNext=null,visEl=null;
  function visitor(){const a=A();if(!a||visEl||S.ko>0)return;const v=pick(VISITORS),e=document.createElement("img");e.className="px visitor "+v.cls;e.src=v.img();e.alt=v.n;e.title=v.n+" : cliquez !";
    e.style.top=v.cls==="bird"?"22%":v.cls==="ghost"?"30%":"auto";if(!v.cls)e.style.bottom="74px";a.appendChild(e);visEl=e;
    e.addEventListener("pointerdown",ev=>{ev.stopPropagation();ev.preventDefault();if(e.dataset.done)return;e.dataset.done=1;const txt=v.give();sfx("pickup");
      log(`${v.n} : ${txt}.`,"g");toast(`${v.n} · ${txt}`);const p=relTo(e,a);FX.loot(`<b style="font-size:11px;color:#fff6d8">+</b>`,1);e.classList.add("gone");setTimeout(()=>{e.remove();visEl=null},400)});
    setTimeout(()=>say(e,v.line,"",1800),1500);setTimeout(()=>{if(visEl===e){e.remove();visEl=null}},11000)}

  /* ---------- Bulles des compagnons ---------- */
  const LINES={idle:["Encore un !","Joli coup !","J'ai faim…","On fait une pause ?","À l'attaque !","Belle journée pour se battre.","Tu as vu ce papillon ?","Je suis prêt !","Hop hop hop !"],
    low:["Tiens bon !","Attention !","Bois une potion !"],boss:["C'est un gros !","On le tient !","Courage !"],night:["Il fait sombre…","Les lucioles sont jolies.","J'ai sommeil…"],shiny:["Ça brille !","Attrape-le !"]};
  let talkNext=null;
  function palTalk(){const L=[...document.querySelectorAll("#pals .pal")];if(!L.length)return;const st=stats();
    const ctx=S.mon&&S.mon.shiny?"shiny":S.hp<st.maxHp*.3?"low":S.mode==="boss"?"boss":isNight()&&Math.random()<.4?"night":"idle";say(pick(L),pick(LINES[ctx]))}

  /* ---------- Météo : l'arène et les monstres réagissent ---------- */
  function weather(){const a=A();if(!a)return;[...a.classList].filter(c=>c.startsWith("ev-")).forEach(c=>a.classList.remove(c));if(S.ev&&S.opt.weatherFx)a.classList.add("ev-"+S.ev.id)}

  /* ---------- Boucle : appelée par tick() ---------- */
  let skyT=0;
  function tick(dt){if(!S.cls)return;const t=S.time;
    if((skyT-=dt)<=0){skyT=60;sky()}
    /* clignement : géré par les images du héros (js/scene.js) */
    if(S.hp<stats().maxHp*.3&&S.ko<=0&&(sweatT-=dt)<=0){sweatT=1.4;if(on())sweat()}
    if(visNext===null)visNext=t+R(45,90);if(t>=visNext){visNext=t+R(70,150);if(on()&&S.mode==="zone")visitor()}
    if(talkNext===null)talkNext=t+R(12,25);if(t>=talkNext){talkNext=t+R(18,35);if(on())palTalk()}
    if(S.ev&&S.ev.id==="nuit"&&on()&&Math.random()<dt/7&&S.mon)say($("monBtn"),"Zz","zz",1600)}

  /* Bandeau dans l'arène (même style que FX) */
  function FXbanner(txt,sub,cls){const a=A();a.querySelectorAll(".fx.banner").forEach(x=>x.remove());const e=document.createElement("div");e.className="fx banner "+cls;e.innerHTML=`<b>${txt}</b>${sub?`<span>${sub}</span>`:""}`;e.style.setProperty("--d","1700ms");a.appendChild(e);setTimeout(()=>e.remove(),1700)}

  return{deco,sky,say,cheer,ouch,monSpawn,monAtkFx,coinFly,ecus,tick,weather,init(){skyT=0;decoKey="";sky();weather()}};
})();

/* Monstre brillant : environ 1 sur 200 dans les zones, plus résistant mais bien plus généreux */
const SHINY_RATE=1/200;
function makeShiny(){const m=S.mon;if(!m||S.mode!=="zone"||MON[m.id].boss||Math.random()>=SHINY_RATE)return;m.shiny=1;m.hp=m.max=m.max*2;m.xp*=5;m.ecus*=5}

/* Icônes du journal selon le contenu de la ligne */
function logIcon(l){const h=l.h;const k=/Succès/.test(h)?"trophee":/Butin|trophée|Trophée/.test(h)?"drop":/Niveau|niveau \d/.test(h)?"amulette":/quête|Quête/.test(h)?"quete":/K\.O\.|échappé/.test(h)?"bouclier":/potion|Potion/.test(h)?"potion":/vaincu|Victoire|boss/i.test(h)?"arme":/écus/.test(h)?"anneau":null;return k?glyph(k):""}
