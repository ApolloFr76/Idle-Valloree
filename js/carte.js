/* Carte du monde (objet CARTE) : les 12 mondes reliés par un chemin, toujours visible au-dessus du menu des mondes.
   Cliquer un monde ouvert y emmène le héros ; à chaque changement de monde (carte ou menu), le pion du héros marche
   d'étape en étape sur la carte (saut direct si « Réduire les animations »). Dessinée en SVG, redessinée par drawZones(). */
const CARTE=(()=>{
  const W=240,H=84,N=()=>ZONES.length,P=i=>({x:14+i*(W-28)/(N()-1),y:Math.round(44+16*Math.sin(i*1.15))});
  /* décor de chaque monde : sol et petits dessins en pixels (une lettre = une couleur, « . » = vide) */
  const SPR={
    arbre:[["..ggg..",".ggGgg.","gGgggGg","ggggGgg",".gGggg.","...t...","...t..."],{g:"#3f8a3a",G:"#6cc04a",t:"#6a4424"}],
    fleurs:[["y.p.y","gyg.g",".g.g."],{y:"#ffd84a",p:"#f07aa0",g:"#3f8a3a"}],
    maison:[["..r..",".rrr.","rrrrr","wwdww","wwdww"],{r:"#c8502c",w:"#f8ead0",d:"#6a4424"}],
    roseaux:[["c.c..","c.c.c","ccc.c",".ccc."],{c:"#5d6e24"}],
    mine:[["..kkkkk..",".kkkkkkk.","kkknnnkkk","kknnnnnkk","kknnnnnkk"],{k:"#8a7a66",n:"#2a1a14"}],
    rails:[["r.r.r.r","rrrrrrr"],{r:"#5a4a3a"}],
    cactus:[["..c..","c.c..","ccc.c","..ccc","..c.."],{c:"#3f8a3a"}],
    pic:[["....w....","...www...","..wwbww..",".bbwbbbb.","bbbbbbbbb"],{w:"#ffffff",b:"#8aa0c0"}],
    sapin:[["..s..",".sss.","sssss","..t.."],{s:"#2f6a4a",t:"#6a4424"}],
    falaise:[["gg.....","ggg....","gggg...","ggggg..","gggggg.","ggggggg"],{g:"#7a8090"}],
    nuage:[["..ccc..",".ccccc.","ccccccc",".y.....","y......"],{c:"#d8dce8",y:"#ffd84a"}],
    palmier:[["g.g.g",".ggg.","ggtgg","..t..","..t..","..t.."],{g:"#2f9a4a",t:"#8a5a2a"}],
    corail:[["p.p.p","ppp.p",".ppp.","..p.."],{p:"#f07a7a"}],
    vagues:[[".w...w.","w.w.w.w"],{w:"#e8f6ff"}],
    volcan:[["....l....","...rlr...","..rrrrr..",".rrrrrrr.","rrrrrrrrr"],{r:"#4a2418",l:"#ff7a2a"}],
    fumee:[[".s.","s.s",".s."],{s:"#9a8a8a"}],
    ruine:[["c...c","c.c.c","c.c.c","ccccc"],{c:"#efe6d4"}],
    lune:[[".mm","m..","m..",".mm"],{m:"#fff2a8"}],
    gouffre:[["..k..",".kpk.","kpppk",".kpk."],{k:"#140c24",p:"#8a5ad0"}],
    yeux:[["y.y"],{y:"#ffd84a"}]};
  const SOL={prairie:"#a6d46f",bois:"#5f9e4a",marais:"#7d8f4a",mines:"#9a8a72",dunes:"#ecc77e",givre:"#e2eef6",falaises:"#a9aec0",jungle:"#3f9a4a",recifs:"#5fb8d8",volcan:"#7a3a2a",ruines:"#bcaed0",abime:"#3a2f5a"};
  const DEC={prairie:[["maison",0,0,2],["fleurs",-7,8,1],["fleurs",7,9,1]],bois:[["arbre",-4,0,2],["arbre",7,2,1]],marais:[["etang",0,4],["roseaux",-6,0,2],["roseaux",7,1,1]],
    mines:[["mine",0,0,2],["rails",0,6,1]],dunes:[["dune",0,4],["cactus",4,0,2]],givre:[["pic",-1,2,2],["sapin",8,3,1]],falaises:[["falaise",-3,2,2],["nuage",6,-12,1]],
    jungle:[["palmier",-4,1,2],["palmier",6,2,1]],recifs:[["vagues",-6,4,1],["vagues",6,-8,1],["corail",1,1,2]],volcan:[["volcan",0,1,2],["fumee",1,-10,1.5]],
    ruines:[["ruine",-3,1,2],["lune",7,-9,1.5]],abime:[["gouffre",0,1,2],["yeux",8,-6,1],["yeux",-8,-2,1]]};
  function spr(n,x,y,sc=1){const s=SPR[n];if(!s)return"";const [R,C]=s,w=R[0].length,h=R.length,x0=x-w*sc/2,y0=y-h*sc;let o="";
    R.forEach((row,j)=>{let i=0;while(i<w){const c=row[i];if(c==="."){i++;continue}let k=i;while(k<w&&row[k]===c)k++;o+=`<rect x="${(x0+i*sc).toFixed(1)}" y="${(y0+j*sc).toFixed(1)}" width="${(k-i)*sc}" height="${sc}" fill="${C[c]}"></rect>`;i=k}});return o}
  function deco(id,x,y){return(DEC[id]||[]).map(([n,dx,dy,sc])=>n==="etang"?`<ellipse cx="${x+dx}" cy="${y+dy}" rx="7" ry="2.5" fill="#4a90b0"></ellipse>`:n==="dune"?`<ellipse cx="${x+dx}" cy="${y+dy}" rx="9" ry="3.5" fill="#d9a85a"></ellipse>`:spr(n,x+dx,y+dy,sc)).join("")}
  let cur=null,pos=null,raf=0,heroK="";
  const open=i=>{const b=S.zoneBosses||{};return S.lvl>=ZONES[i].lvl[0]&&(i===0||!!b[i-1])},hidden=i=>i>1&&S.lvl<ZONES[i].lvl[0];
  function el(){let m=$("wmap");if(!m){const z=$("zones");if(!z)return null;m=document.createElement("div");m.id="wmap";m.className="wmap";z.parentNode.insertBefore(m,z)}return m}
  function nodes(){let last=0;for(let i=0;i<N();i++)if(open(i))last=i;
    const pts=ZONES.map((z,i)=>P(i)),line=(a,b)=>pts.slice(a,b+1).map(p=>p.x+","+p.y).join(" ");
    let h=`<rect x="1" y="1" width="${W-2}" height="${H-2}" class="wbg"></rect>`;
    ZONES.forEach((z,i)=>{const x0=i?(pts[i-1].x+pts[i].x)/2:2,x1=i<N()-1?(pts[i].x+pts[i+1].x)/2:W-2,hd=hidden(i);
      h+=`<rect x="${x0.toFixed(1)}" y="2" width="${(x1-x0).toFixed(1)}" height="${H-4}" fill="${hd?"#d8c69c":SOL[z.id]||"#a6d46f"}" class="wsol"></rect>`});
    ZONES.forEach((z,i)=>{const p=pts[i],up=p.y>=44&&i>0,dy=up?-16:30;h+=`<g class="wdec${hidden(i)?" fog":""}">${deco(z.id,p.x,p.y+dy)}</g>`});
    h+=`<polyline points="${line(0,N()-1)}" class="wpath off"></polyline>${last>0?`<polyline points="${line(0,last)}" class="wpath"></polyline>`:""}`;
    ZONES.forEach((z,i)=>{const p=pts[i],o=open(i),hd=hidden(i),beat=(S.zoneBosses||{})[i];
      h+=`<g class="wnode${o?" ok":" lock"}${i===S.zone?" here":""}" ${o?`data-a="wmGo" data-i="${i}"`:""} data-tip="z:${i}" role="${o?"button":"img"}" aria-label="${hd?"Monde inconnu":esc(z.name)}${o?"":" (verrouillé)"}">
        <rect x="${p.x-9}" y="${p.y-9}" width="18" height="18" fill="transparent"></rect><rect x="${p.x-5}" y="${p.y-5}" width="10" height="10" class="wsq" style="fill:${o?ZBG[i]:"#a8977e"}"></rect>
        ${hd?`<text x="${p.x}" y="${p.y+3}" class="wq">?</text>`:""}${beat?`<rect x="${p.x+4}" y="${p.y-13}" width="1.5" height="9" class="wpole"></rect><path d="M${p.x+5.5} ${p.y-13}h5l-2 2 2 2h-5z" class="wflag"></path>`:""}</g>`});
    return h}
  function place(){const t=$("wmTok");if(!t||!pos)return;t.setAttribute("transform",`translate(${pos.x.toFixed(1)} ${(pos.y+pos.b).toFixed(1)})`)}
  function walk(a,b){cancelAnimationFrame(raf);const rm=S.opt&&S.opt.reduceMotion,dir=b>a?1:-1;
    if(rm||a==null||a===b){cur=b;const p=P(b);pos={x:p.x,y:p.y,b:0};place();return}
    let i=a,t0=performance.now();const STEP=Math.max(120,Math.min(260,1400/Math.abs(b-a)));
    const f=now=>{const k=Math.min(1,(now-t0)/STEP),p0=P(i),p1=P(i+dir);pos={x:p0.x+(p1.x-p0.x)*k,y:p0.y+(p1.y-p0.y)*k,b:-Math.abs(Math.sin(k*Math.PI*2))*2.5};place();
      if(k>=1){i+=dir;t0=now;if(i===b){cur=b;pos.b=0;place();return}}raf=requestAnimationFrame(f)};
    raf=requestAnimationFrame(f)}
  function draw(){const m=el();if(!m||!S||!S.cls)return;const k=S.cls+"|"+(typeof heroArm==="function"?heroArm():"");
    if(!m.firstChild||heroK!==k){heroK=k;const src=PX.hero(S.cls,CLASSES[S.cls].col,"",typeof heroArm==="function"?heroArm():undefined);
      m.innerHTML=`<svg viewBox="0 0 ${W} ${H}" class="wsvg" aria-label="Carte du monde"><g id="wmNodes"></g><g id="wmTok" class="wtok"><ellipse cx="0" cy="1" rx="5" ry="1.6"></ellipse><image href="${src}" x="-8" y="-20" width="16" height="18"></image></g></svg>`}
    $("wmNodes").innerHTML=nodes();
    if(cur==null||cur>=N()){cur=S.zone;const p=P(cur);pos={x:p.x,y:p.y,b:0};place()}else if(cur!==S.zone)walk(cur,S.zone);else place()}
  return{draw,reset(){cur=null;heroK=""}};
})();
