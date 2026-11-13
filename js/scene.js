/* Scène de combat animée à 60 images/seconde : animation image par image (10 images par mouvement)
   du héros, des compagnons et des monstres, équipe en formation qui attaque, vagues d'ennemis qui
   arrivent en marchant, décor en couches qui défile, jauges de PV avec retard. Objet SCENE. */
const SCENE=(()=>{
  const calm=()=>S&&S.opt&&S.opt.reduceMotion;
  const A=()=>$("arena");
  const now=()=>performance.now();
  const R=(a,b)=>a+Math.random()*(b-a);

  /* ---------- Acteurs : une image <img> + des séries de 10 images ---------- */
  /* act = {el, sets:{idle,atk,...} (fonctions qui renvoient 10 urls), cur, t0, fd (ms par image), hold, period, off, last} */
  function setSrc(a,u){if(a.last!==u&&a.el){a.el.src=u;a.last=u}}
  function frame(a,t){
    if(a.cur!=="idle"){const i=Math.floor((t-a.t0)/a.fd);const L=a.sets[a.cur]();if(i<10){setSrc(a,L[i]);return}if(a.hold&&t<a.t0+10*a.fd+a.hold){setSrc(a,L[9]);return}a.cur="idle"}
    const cyc=(t+a.off)/a.period,i=Math.floor(cyc*10)%10;const L=a.blink&&Math.floor(cyc)%3===2?a.sets.blink():a.sets.idle();setSrc(a,L[i])}
  function play(a,anim,fd=30,hold=0){if(!a||!a.sets[anim])return;a.cur=anim;a.t0=now();a.fd=fd;a.hold=hold}

  /* Héros */
  const hero={el:null,cur:"idle",period:1700,off:0,blink:1,sets:{
    idle:()=>PX.heroFrames(S.cls,CLASSES[S.cls].col,"idle"),blink:()=>PX.heroFrames(S.cls,CLASSES[S.cls].col,"idle",1),
    atk:()=>PX.heroFrames(S.cls,CLASSES[S.cls].col,"atk"),cast:()=>PX.heroFrames(S.cls,CLASSES[S.cls].col,"cast")}};
  /* Monstre ciblé */
  const mon={el:null,cur:"idle",period:2200,off:0,sets:{
    idle:()=>PX.monFrames(MON[S.mon.id],"idle"),atk:()=>PX.monFrames(MON[S.mon.id],"atk"),hurt:()=>PX.monFrames(MON[S.mon.id],"hurt")}};
  let pals=[],queue=[];

  /* ---------- Équipe en formation ---------- */
  const PAL_LOOK={ecuyer:"guerrier",chasseuse:"archer",moine:"gardien",sorciere:"mage"};
  const BEASTS=new Set(["golem","dragonnet","phenix"]),FLY=new Set(["dragonnet","phenix"]);
  /* projectile de chaque compagnon : [classe CSS, couleur, durée] */
  const PAL_SHOT={ecuyer:["pwave","#fff6d8",260],chasseuse:["arw small","",200],moine:["pki","#bfe3ff",280],sorciere:["orb2","#c9a8ff",280],golem:["prock","#9a92ae",340],dragonnet:["orb2","#ff8a3c",260],phenix:["orb2","#ff8ab0",260]};
  let palSig="";
  function drawPals(){const box=$("pals");if(!box)return;const L=ALLIES.map((a,i)=>({a,i,l:S.allies[a[0]]||0})).filter(x=>x.l>0).sort((x,y)=>y.i-x.i).slice(0,6);
    const sig=L.map(x=>x.a[0]).join();if(sig===palSig)return;palSig=sig;$("mon").classList.toggle("haspals",L.length>0);
    box.innerHTML=L.map((x,n)=>{const[id,name,,,col]=x.a,row=n%2,c=n>>1;return`<img class="px pal${PAL_LOOK[id]?"":" beast"}${FLY.has(id)?" fly":""} row${row}" alt="" title="${name}" style="--x:${c*30+row*16}px;--d:-${((n*.53+x.i*.29)%1.4).toFixed(2)}s;--t:${(.9+((x.i*37+n*13)%7)/10).toFixed(2)}s;--h:-${4+((x.i*5+n*3)%8)}px">`}).join("");
    const imgs=[...box.querySelectorAll(".pal")];
    pals=L.map((x,n)=>{const[id,,,,col]=x.a,cls=PAL_LOOK[id];return{id,el:imgs[n],cur:"idle",period:1500+((x.i*7)%5)*150,off:n*370,next:now()+800+n*420,every:1500+((x.i*11+n*5)%9)*110,
      sets:cls?{idle:()=>PX.heroFrames(cls,col,"idle"),atk:()=>PX.heroFrames(cls,col,"atk")}:BEASTS.has(id)?{idle:()=>PX.beastFrames(id,col,"idle"),atk:()=>PX.beastFrames(id,col,"atk")}:{idle:()=>PX.petFrames(col,"idle"),atk:()=>PX.petFrames(col,"atk")},
      period:FLY.has(id)?700+n*40:1500+((x.i*7)%5)*150}})}
  function rel(el){const a=A().getBoundingClientRect(),r=el.getBoundingClientRect();return{x:r.left-a.left,y:r.top-a.top,w:r.width,h:r.height}}
  function palShot(p){const m=$("monBtn");if(!m||!p.el)return;const pb=rel(p.el),mb=rel(m),[cls,col,ms]=PAL_SHOT[p.id]||PAL_SHOT.ecuyer;
    const x0=pb.x+pb.w*.8,y0=pb.y+pb.h*.45,x1=mb.x+mb.w*.35,y1=mb.y+mb.h*R(.4,.65);const e=document.createElement("div");e.className="an "+cls;e.style.left=x0+"px";e.style.top=y0+"px";if(col)e.style.setProperty("--c",col);A().appendChild(e);
    const ang=Math.atan2(y1-y0,x1-x0)*180/Math.PI,arc=cls.startsWith("arw")?14:cls==="prock"?24:4;
    e.animate([{transform:`translate(0,0) rotate(${ang}deg)`},{transform:`translate(${(x1-x0)/2}px,${(y1-y0)/2-arc}px) rotate(${ang+(cls==="prock"?180:0)}deg)`},{transform:`translate(${x1-x0}px,${y1-y0}px) rotate(${ang+(cls==="prock"?360:0)}deg)`}],{duration:ms,easing:"linear"}).onfinish=()=>{e.remove();
      const b=document.createElement("div");b.className="an burst2 small";b.style.left=x1+"px";b.style.top=y1+"px";b.style.setProperty("--c",col||"#fff");A().appendChild(b);setTimeout(()=>b.remove(),300)}}

  /* ---------- Vagues d'ennemis : 2 monstres attendent derrière ---------- */
  let waveQ=[],waveZone=-1;
  function nextWave(z){if(waveZone!==z.i){waveQ=[];waveZone=z.i}while(waveQ.length<3)waveQ.push(z.mons[rnd(0,2)]);const d=waveQ.shift();waveQ.push(z.mons[rnd(0,2)]);drawQueue();return d}
  function drawQueue(){const q=$("queue");if(!q)return;const show=S.mode==="zone"&&fx;q.hidden=!show;if(!show){queue=[];return}
    q.innerHTML=waveQ.slice(0,2).map((d,i)=>`<img class="px qmon q${i}" alt="">`).join("");const imgs=[...q.querySelectorAll("img")];
    queue=waveQ.slice(0,2).map((d,i)=>({el:imgs[i],cur:"idle",period:2000+i*300,off:i*500,sets:{idle:()=>PX.monFrames(d,"idle")}}))}
  /* le nouveau monstre arrive en marchant depuis la file d'attente */
  function walkIn(){const i=$("monBtn")&&$("monBtn").querySelector("img");if(!i||calm())return;
    i.animate([{transform:"translate(110px,0) scale(.72)",opacity:.6},{transform:"translate(80px,-6px) scale(.8)",offset:.2},{transform:"translate(55px,0) scale(.86)",offset:.4},{transform:"translate(30px,-6px) scale(.92)",offset:.6},{transform:"translate(10px,0) scale(.97)",offset:.8},{transform:"translate(0,0) scale(1)",opacity:1}],{duration:420,easing:"linear"});
    const q=$("queue");if(q)q.animate([{transform:"translateX(40px)"},{transform:"translateX(0)"}],{duration:420,easing:"ease-out"})}

  /* ---------- Décor en couches ---------- */
  let scroll=0;
  function layers(zid){const f=$("layFar"),r=$("layFront");if(f)f.style.backgroundImage=`url(${PX.strip(zid,"far")})`;if(r)r.style.backgroundImage=`url(${PX.strip(zid,"front")})`}
  function advance(){if(calm())return;scroll++;const f=$("layFar"),r=$("layFront");if(f)f.style.backgroundPositionX=(-scroll*18)+"px";if(r)r.style.backgroundPositionX=(-scroll*90)+"px";const a=A();if(a)a.style.setProperty("--scroll",scroll)}

  /* ---------- Jauges : la partie perdue reste un instant en clair puis descend ---------- */
  const lagW={};
  function lag(id,pct){const e=$(id);if(!e)return;const old=lagW[id]??pct;if(pct>=old){e.style.transition="none";e.style.width=pct+"%";void e.offsetWidth;e.style.transition=""}else e.style.width=pct+"%";lagW[id]=pct}

  /* ---------- Boucle à 60 images/seconde ---------- */
  let winded=false;
  function loop(){requestAnimationFrame(loop);if(!S||!S.cls)return;const t=now();
    const h=$("ahero");if(h&&!h.hidden){hero.el=h;frame(hero,t)}
    const mi=S.mon&&$("monBtn")&&$("monBtn").querySelector("img");if(mi){if(mon.el!==mi){mon.el=mi;mon.last=null;mon.cur="idle"}frame(mon,t);
      /* élan du monstre juste avant son coup */
      if(S.monT>1.8&&!winded&&S.ko<=0&&fx){winded=true;play(mon,"atk",32)}else if(S.monT<1)winded=false}
    pals.forEach(p=>{frame(p,t);if(fx&&S.mon&&S.ko<=0&&t>=p.next){p.next=t+p.every*R(.85,1.15);play(p,"atk",34);setTimeout(()=>palShot(p),150)}});
    queue.forEach(q=>frame(q,t))}

  return{
    init(){requestAnimationFrame(loop)},
    hero(anim,hold=0){play(hero,anim,anim==="cast"?26:30,hold)},
    monHurt(){play(mon,"hurt",36)},
    drawPals,nextWave,drawQueue,walkIn,layers,advance,lag};
})();

/* Portrait d'un compagnon (onglet Compagnons) : première image de son animation */
function allyPortrait(id,col){const look={ecuyer:"guerrier",chasseuse:"archer",moine:"gardien",sorciere:"mage"}[id];return look?PX.heroF(look,col,"idle",0):PX.beastF(id,col,"idle",0)}
