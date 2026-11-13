/* Animations des attaques de base et des 12 sorts (3 par classe) : mouvements du héros,
   poses (atk = bras tendu, up = bras levés), projectiles, impacts. Tout passe par l'objet ANIM.
   Les dégâts des sorts sont appliqués au moment de l'impact (voir ANIM.delay et cast()). */
const ANIM=(()=>{
  const A=()=>$("arena"),H=()=>$("ahero"),M=()=>$("monBtn");
  const calm=()=>S&&S.opt&&S.opt.reduceMotion;
  const R=(a,b)=>a+Math.random()*(b-a);
  const box=el=>{const a=A().getBoundingClientRect(),r=el.getBoundingClientRect();return{x:r.left-a.left,y:r.top-a.top,w:r.width,h:r.height,cx:r.left-a.left+r.width/2,cy:r.top-a.top+r.height/2}};
  const add=(cls,x,y,ms,html)=>{const e=document.createElement("div");e.className="an "+cls;e.style.left=x+"px";e.style.top=y+"px";if(html)e.innerHTML=html;A().appendChild(e);if(ms)setTimeout(()=>e.remove(),ms);return e};
  const parts=(x,y,n,cols,spread=60,ms=550,sz=4,up=0)=>{if(calm())n=Math.ceil(n/3);for(let i=0;i<n;i++){const e=add("ap",x,y,ms),a=Math.random()*Math.PI*2,d=spread*R(.4,1),s=sz+(Math.random()*3|0);
    e.style.width=e.style.height=s+"px";e.style.background=cols[i%cols.length];
    e.animate([{transform:"translate(-50%,-50%)",opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d-up}px))`,opacity:0}],{duration:ms*R(.7,1),easing:"cubic-bezier(.2,.7,.4,1)",fill:"forwards"})}};
  const shake=big=>{if(!S.opt.shake||calm())return;replayCls(A(),big?"shake2":"shake")};
  const col=()=>CLASSES[S.cls].col;
  /* pose du héros pendant ms millisecondes */
  function pose(p,ms){SCENE.hero(p==="up"?"cast":"atk",p==="up"?ms:0)}   /* 10 images par mouvement, voir js/scene.js */
  /* déplacement du héros (Web Animations, prend le pas sur l'animation de repos) */
  function move(frames,ms,ease="ease-in-out"){const h=H();if(!h||calm())return;h.getAnimations().forEach(a=>{if(a instanceof CSSAnimation)return;a.cancel()});h.animate(frames,{duration:ms,easing:ease})}
  const gap=()=>{const h=H(),m=M();if(!h||!m)return 60;const a=h.getBoundingClientRect(),b=m.getBoundingClientRect();return Math.max(20,b.left-a.right+30)};
  function knock(px=14,ms=260){const i=M()&&M().querySelector("img");if(!i||calm())return;i.animate([{transform:"translateX(0)"},{transform:`translateX(${px}px) rotate(${px/3}deg)`,offset:.3},{transform:"translateX(0)"}],{duration:ms,easing:"ease-out"})}
  function banner(txt,cls){const a=A();a.querySelectorAll(".fx.banner").forEach(x=>x.remove());const e=document.createElement("div");e.className="fx banner sbanner "+cls;e.innerHTML=`<b>${txt}</b>`;e.style.setProperty("--d","1200ms");a.appendChild(e);setTimeout(()=>e.remove(),1200)}
  /* projectile d'un point à un autre, avec courbe et traînée */
  function shoot(cls,x0,y0,x1,y1,ms,arc=0,trail=null,done){const p=add(cls,x0,y0,0);const ang=Math.atan2(y1-y0,x1-x0)*180/Math.PI;
    const an=p.animate([{transform:`translate(0,0) rotate(${ang-arc/3}deg)`},{transform:`translate(${(x1-x0)/2}px,${(y1-y0)/2-arc}px) rotate(${ang}deg)`},{transform:`translate(${x1-x0}px,${y1-y0}px) rotate(${ang+arc/3}deg)`}],{duration:ms,easing:"linear"});
    let tr=null;if(trail&&!calm())tr=setInterval(()=>{const r=p.getBoundingClientRect(),a=A().getBoundingClientRect();const t=add("ap trail",r.left-a.left+r.width/2,r.top-a.top+r.height/2,300);t.style.background=trail},35);
    an.onfinish=()=>{clearInterval(tr);p.remove();done&&done()}}
  const ELC={feu:["#ff8a3c","#ffd36a"],eau:["#4fa8ff","#bfe3ff"],air:["#e8fff6","#9fe8d0"],terre:["#b07a3e","#e0c080"],neutre:["#9fd8ff","#ffffff"]};
  const elc=()=>ELC[stats().el]||ELC.neutre;

  /* ---------- État des sorts de durée ---------- */
  let hasteUntil=0,lynxUntil=0,wallUntil=0,flip=false;
  const now=()=>performance.now();

  /* ---------- Attaques de base ---------- */
  function basic(){const h=H(),m=M();if(!h||h.hidden||!m)return;const hb=box(h),mb=box(m);
    if(S.cls==="guerrier"){pose("atk",170);move([{transform:"translateX(0)"},{transform:"translateX(18px)",offset:.4},{transform:"translateX(0)"}],200);flip=!flip;
      setTimeout(()=>{add("slash3"+(flip?" rev":""),mb.x+mb.w*.3,mb.y+mb.h*.2,280);parts(mb.x+mb.w*.4,mb.cy,5,["#fff","#ffe27a","#c9ced6"],34,300,3)},70)}
    else if(S.cls==="gardien"){pose("atk",190);move([{transform:"translateX(0)"},{transform:"translateX(24px)",offset:.35},{transform:"translateX(0)"}],220);
      setTimeout(()=>{add("shieldhit",mb.x+mb.w*.3,mb.cy,300);add("shockline",mb.x+mb.w*.25,mb.cy,300);knock(8,200)},80)}
    else if(S.cls==="archer"){const n=now()<hasteUntil?2:1;for(let k=0;k<n;k++)setTimeout(()=>{pose("atk",110);move([{transform:"translateX(0)"},{transform:"translateX(-5px)",offset:.3},{transform:"translateX(0)"}],160);
        setTimeout(()=>shoot("arw",hb.x+hb.w*.85,hb.y+hb.h*.45+k*6,mb.x+mb.w*.4,mb.cy+R(-8,8),190,12,"rgba(255,255,255,.5)",()=>{const st=add("arw stuck",mb.x+mb.w*.38,mb.cy+R(-10,10),600);st.style.transform=`rotate(${R(-15,15)}deg)`}),90)},k*120)}
    else if(S.cls==="peste"){pose("atk",200);const tip={x:hb.x+hb.w*.92,y:hb.y+hb.h*.12},G=["#7ad04a","#b8f08a","#3f7a2a"];
      setTimeout(()=>shoot("flask",tip.x,tip.y,mb.x+mb.w*.42,mb.cy,260,26,"",()=>{const b=add("burst2",mb.x+mb.w*.42,mb.cy,320);b.style.setProperty("--c",G[0]);parts(mb.x+mb.w*.42,mb.cy,6,G,40,380,3);
        for(let k=0;k<3;k++){const e=add("toxbub",mb.x+mb.w*R(.3,.7),mb.y+mb.h*R(.45,.8),900);e.style.animationDelay=(k*80)+"ms"}}),110)}
    else{pose("atk",200);const c=elc(),tip={x:hb.x+hb.w*.92,y:hb.y+hb.h*.12};const rune=add("rune",tip.x,tip.y,320);rune.style.setProperty("--c",c[0]);
      setTimeout(()=>shoot("orb2",tip.x,tip.y,mb.x+mb.w*.42,mb.cy,240,8,c[1],()=>{const b=add("burst2",mb.x+mb.w*.42,mb.cy,320);b.style.setProperty("--c",c[0]);parts(mb.x+mb.w*.42,mb.cy,6,c,40,350,3)}),110)}}

  /* ---------- Sorts ---------- */
  /* délai avant l'impact (ms) : les dégâts du sort sont appliqués à ce moment-là */
  const DELAY={g1:420,g3:520,a1:330,s1:330,s3:820,d1:300,p1:380,p3:620};
  const SP={
    /* Guerrier */
    g1(){const g=gap(),mb=box(M());pose("up",260);const h=H();replayCls(h,"charge");
      setTimeout(()=>{pose("atk",260);move([{transform:"translate(0,0)"},{transform:`translate(${g*.55}px,-46px)`,offset:.45},{transform:`translate(${g*.7}px,0)`,offset:.7},{transform:`translate(${g*.7}px,0)`,offset:.85},{transform:"translate(0,0)"}],520,"ease-out")},200);
      setTimeout(()=>{add("vslash",mb.x+mb.w*.45,mb.y,320);parts(mb.x+mb.w*.45,mb.y+mb.h*.95,14,["#a8743e","#d9b47a","#7a4e2e"],70,600,4,30);knock(18,300);shake(true)},420)},
    g2(){pose("up",500);const hb=box(H());for(let i=0;i<3;i++)setTimeout(()=>add("ringwave",hb.cx,hb.cy,700),i*140);VIE.say(H(),"HAAA !","bang",1100);shake(false);
      const els=[H(),...document.querySelectorAll("#pals .pal")];els.forEach(e=>e&&e.classList.add("aura-red"));setTimeout(()=>els.forEach(e=>e&&e.classList.remove("aura-red")),10000)},
    g3(){const g=gap(),mb=box(M());banner("Tourbillon !","war");pose("atk",900);
      move([{transform:"translateX(0) scaleX(1)"},{transform:`translateX(${g*.8}px) scaleX(-1)`,offset:.25},{transform:`translateX(${g*.85}px) scaleX(1)`,offset:.4},{transform:`translateX(${g*.85}px) scaleX(-1)`,offset:.55},{transform:`translateX(${g*.8}px) scaleX(1)`,offset:.7},{transform:"translateX(-6px) scaleX(1)",offset:.92},{transform:"translateX(0)"}],950);
      for(let i=0;i<5;i++)setTimeout(()=>{const t=add("wind",box(H()).x,box(H()).cy+R(-20,20),400)},i*60);
      [0,1,2].forEach(i=>setTimeout(()=>{add("spin",mb.cx,mb.cy,360);parts(mb.cx,mb.cy,6,["#fff","#ffe27a"],50,350,3);knock(10,200)},380+i*120));
      setTimeout(()=>{const hb=box(H());add("puff2",hb.cx,hb.y+hb.h*.95,450)},870)},
    /* Archer */
    a1(){const hb=box(H()),mb=box(M());banner("Tir précis !","arc");const c=add("aim",mb.cx,mb.cy,450);pose("atk",330);move([{transform:"translateX(0)"},{transform:"translateX(-8px)"},{transform:"translateX(-8px)",offset:.8},{transform:"translateX(0)"}],400);
      setTimeout(()=>shoot("arw fast",hb.x+hb.w*.85,hb.y+hb.h*.45,mb.x+mb.w*.4,mb.cy,90,0,"rgba(255,255,255,.8)",()=>{add("flashw",mb.cx,mb.cy,220);knock(14,240)}),240)},
    a2(){hasteUntil=now()+8000;const h=H();h.classList.add("haste");setTimeout(()=>h.classList.remove("haste"),8000);VIE.say(h,"Vite !","",1000);pose("up",300)},
    a3(){lynxUntil=now()+8000;const hb=box(H());add("lynx",hb.cx,hb.y-6,1600);pose("up",300)},
    /* Mage */
    s1(){const hb=box(H()),mb=box(M()),c=elc(),tip={x:hb.x+hb.w*.92,y:hb.y+hb.h*.12};pose("up",250);add("rune big",tip.x,tip.y,400).style.setProperty("--c",c[0]);
      [-22,0,22].forEach((dy,i)=>setTimeout(()=>shoot("orb2",tip.x,tip.y+dy,mb.x+mb.w*.42,mb.cy,200,dy,c[1]),120+i*40));
      setTimeout(()=>{const b=add("burst2 big",mb.x+mb.w*.42,mb.cy,420);b.style.setProperty("--c",c[0]);parts(mb.x+mb.w*.42,mb.cy,14,c,70,500,4);knock(10,220)},330)},
    s2(){const mb=box(M());pose("up",350);add("skull",mb.cx,mb.y+mb.h*.1,900,'<svg viewBox="0 0 12 12"><path fill="currentColor" d="M3 1h6v1h1v1h1v4h-1v1h-1v2h-1v1h-4v-1h-1v-2h-1v-1h-1v-4h1v-1h1z"/><path fill="#1c1020" d="M3 4h2v2h-2zM7 4h2v2h-2zM5 7h2v1h-2zM4 9h1v1h-1zM7 9h1v1h-1z"/></svg>');
      const m=$("mon");m.classList.add("cursed");setTimeout(()=>m.classList.remove("cursed"),6000);
      for(let i=1;i<=6;i++)setTimeout(()=>{const b=box(M());for(let k=0;k<3;k++){const e=add("darkbub",b.x+b.w*R(.25,.75),b.y+b.h*R(.4,.8),900);e.style.animationDelay=(k*90)+"ms"}},i*1000)},
    s3(){const mb=box(M());banner("Déferlement !","mag");pose("up",820);A().classList.add("dim");setTimeout(()=>A().classList.remove("dim"),900);
      add("mcircle",mb.cx,mb.y+mb.h*.92,1000);setTimeout(()=>add("column",mb.cx,0,600),380);
      setTimeout(()=>{add("flashw big",mb.cx,mb.cy,300);parts(mb.cx,mb.cy,26,["#fff","#c9a8ff","#8fd8ff","#ffe27a"],120,800,5);knock(20,320);shake(true)},800)},
    /* Médecin de la peste */
    p1(){const hb=box(H()),mb=box(M()),tip={x:hb.x+hb.w*.92,y:hb.y+hb.h*.12},G=["#7ad04a","#b8f08a","#3f7a2a"];pose("up",300);banner("Fiole toxique !","tox");
      setTimeout(()=>shoot("flask big",tip.x,tip.y,mb.x+mb.w*.42,mb.cy,280,40,"",()=>{const b=add("burst2 big",mb.x+mb.w*.42,mb.cy,450);b.style.setProperty("--c",G[0]);parts(mb.x+mb.w*.42,mb.cy,16,G,70,600,4);
        add("toxcloud",mb.cx,mb.cy,1400);knock(8,200)}),100)},
    p2(){pose("up",450);const A0=A();A0.classList.add("miasma");setTimeout(()=>A0.classList.remove("miasma"),8000);const hb=box(H());VIE.say(H(),"Respirez…","",1100);
      for(let i=0;i<8;i++)setTimeout(()=>{const mb=box(M());if(!mb)return;add("toxcloud",mb.x+mb.w*R(.2,.8),mb.y+mb.h*R(.3,.8),1300)},i*900)},
    p3(){const mb=box(M());banner("Purge !","tox");pose("up",620);A().classList.add("dim");setTimeout(()=>A().classList.remove("dim"),700);
      for(let i=0;i<10;i++){const e=add("toxbub",mb.x+mb.w*R(.2,.8),mb.y+mb.h*R(.3,.9),700);e.style.animationDelay=(i*40)+"ms"}
      setTimeout(()=>{add("flashw big",mb.cx,mb.cy,300);const b=add("burst2 big",mb.cx,mb.cy,500);b.style.setProperty("--c","#7ad04a");parts(mb.cx,mb.cy,30,["#7ad04a","#ff7a2c","#8fd6ff","#e04848","#fff"],130,800,5);knock(22,320);shake(true)},600)},
    /* Gardien */
    d1(){const g=gap(),mb=box(M());pose("atk",380);move([{transform:"translateX(0)"},{transform:"translateX(-10px)",offset:.2},{transform:`translateX(${g*.75}px)`,offset:.65},{transform:`translateX(${g*.75}px)`,offset:.75},{transform:"translateX(0)"}],520,"ease-in");
      setTimeout(()=>{add("shieldhit big",mb.x+mb.w*.25,mb.cy,360);add("shockline",mb.x+mb.w*.2,mb.cy,360);knock(30,420);shake(false);add("stun",mb.cx,mb.y+mb.h*.05,1500)},300)},
    d2(){const hb=box(H());pose("up",500);add("healcol",hb.cx,0,900);for(let i=0;i<12;i++){const e=add(i%3?"an healorb":"an healstar",hb.x+hb.w*R(.1,.9),hb.y+hb.h*R(.3,.95),1300);e.className=i%3?"an healorb":"an healstar";e.style.animationDelay=(i*60)+"ms"}
      const bar=$("pHpBar");if(bar)replayCls(bar.parentElement,"hpglow")},
    d3(){wallUntil=now()+10000;pose("up",400);const hb=box(H());const w=add("rampart",hb.x+hb.w+4,hb.y+hb.h*.1,10000);w.style.height=(hb.h*.85)+"px";
      add("healcol",hb.cx,0,700)}};

  return{
    basic(){if(!fx)return;basic()},
    spell(id){if(!fx)return;const b=$("sp-"+id);if(b)replayCls(b,"castflash");const f=SP[id];if(f)f()},
    delay(id){return fx&&!calm()?DELAY[id]||0:0},
    lynx(){return now()<lynxUntil},
    wall(){return now()<wallUntil},
    /* coup encaissé derrière le Rempart : « ting » bleu */
    ting(){const hb=box(H());const e=add("ting",hb.x+hb.w+10,hb.cy-10,400);parts(hb.x+hb.w+10,hb.cy,6,["#bfe3ff","#fff"],30,300,3)}
  };
})();
