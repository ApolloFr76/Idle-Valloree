/* Monde en bandeau : le combat se joue dans un paysage qui défile, sans cadre autour.
   Le décor est peint en pixels logiques sur un <canvas> (×4, ×3 sur petit écran), en plans qui
   défilent à des vitesses différentes : ciel, montagnes, collines et village, lisière et muret,
   prairie avec le chemin où l'on se bat, herbes du premier plan. Sous le bandeau, la prairie continue derrière les menus
   (second <canvas> en fond de page) et défile avec lui. Les acteurs (héros, monstre,
   compagnons) restent des <img> posées par-dessus (js/scene.js).
   Aussi : vie du décor (nuages et leurs ombres, papillons, oiseaux, moulins, fumées, lucioles la
   nuit, reflets sur l'eau), butin au sol ramassé en marchant, mise en scène des boss, et les
   chantiers des ouvriers (onglet Métiers, js/ouvriers.js). Objet MONDE. */
const MONDE=(()=>{
  const{Spr,prop,rng,rgb,mix,TH,DARK,LIGHT,INK}=PX.kit;
  /* outils communs et décors des mondes : js/biomes/outils.js et js/biomes/*.js */
  const{calm,R,TAU,css,wave,wset,wblit,wget,ellipse,deco,FARH,MIDH,WALLH,TM,GH,PY,mkClouds,BIOME,tumbleF,REC,AST}=MK;
  function makeLayers(zid){return(BIOME[zid]||BIOME.prairie)(zid)}

  /* ---------- État ---------- */
  let cv=null,ctx=null,wc=null,wx=null,P=4,W=0,H=0,FY=0,GT=0,CT=0,zid=null,L=null,ro=null,lastT=0,skyKey="",skyCv=null;
  let cam=0,camFrom=0,camTo=0,walkT0=0,walkMs=0;
  let birds=[],flies=[],shadows=[],puffs=[],tumbles=[],gusts=[],flakes=[],gulls=[],bolt=null,schools=[],jellies=[],plume=[],bombs=[],erupt=4,debris=[],bossOn=false,lbT=0;
  const drops=[];

  function resize(){const a=$("arena");if(!a||!cv)return;const w=a.clientWidth,h=a.clientHeight;if(!w||!h)return;
    P=w<640?3:4;W=Math.ceil(w/P);H=Math.ceil(h/P);cv.width=W;cv.height=H;cv.style.width=W*P+"px";cv.style.height=H*P+"px";wc.width=W;wc.height=H;
    /* grand écran : le décor (ciel compris) garde au plus ~540 px au-dessus des pieds, le reste est du sol */
    const feet=P===4?Math.max(Math.min(104,Math.round(h*.21)),h-540):Math.max(78,h-440);FY=H-Math.round(feet/P);GT=FY-(PY-TM);a.style.setProperty("--feet",(H-FY)*P+"px");a.style.setProperty("--px",P);skyKey="";
    /* CT : bas de l'en-tête quand il recouvre le bandeau (la voûte du bois commence juste dessous) */
    const hd=document.querySelector("header.top");CT=hd?Math.max(0,Math.round((hd.getBoundingClientRect().bottom-a.getBoundingClientRect().top)/P)):0}

  /* ---------- Ciel selon l'heure réelle  ---------- */
  const SKY={day:["#5aa8ec","#cfeefc"],dawn:["#6a78c8","#ffc9a0"],dusk:["#3c3a88","#ff9e78"],night:["#0b0f2e","#283070"],cave:["#100e18","#2a2538"]};
  const TINT={day:null,dawn:"rgba(255,150,90,.14)",dusk:"rgba(120,50,100,.24)",night:"rgba(16,22,70,.52)",cave:null};
  function phase(){const d=new Date(),h=d.getHours()+d.getMinutes()/60;return h>=21||h<5.5?"night":h<8?"dawn":h>=18?"dusk":"day"}
  function skyCanvas(ph){const k=ph+W+"x"+H+(bossOn?"b":"")+(L&&L.storm?"s":"")+(L&&L.under?"u":"")+(L&&L.sky?"v":"");if(k===skyKey)return skyCv;skyKey=k;const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
    let[t,b]=SKY[ph];if(L&&L.sky&&L.sky[ph])[t,b]=L.sky[ph];if(L&&L.under){[t,b]=ph==="night"?["#0c3456","#061a30"]:ph==="day"?["#6ad0ee","#1a5a98"]:["#4a9ac8","#123e6e"]}if(L&&L.storm){t=mix(t,"#4a5268",.55);b=mix(b,"#9aa6b8",.5)}if(bossOn){t=mix(t,"#3a0a28",.55);b=mix(b,"#8a3048",.5)}const n=14,hz=Math.max(8,GT-8);
    for(let i=0;i<n;i++){const y0=Math.round(hz*i/n),y1=Math.round(hz*(i+1)/n),c0=css(mix(t,b,i/(n-1))),c1=css(mix(t,b,Math.min(1,(i+1)/(n-1))));x.fillStyle=c0;x.fillRect(0,y0,W,y1-y0);
      x.fillStyle=c1;for(let xx=0;xx<W;xx+=2)x.fillRect(xx+(y1%2),y1-1,1,1)}
    x.fillStyle=css(b);x.fillRect(0,hz,W,H-hz);return skyCv=c}

  /* ---------- Plans qui défilent ---------- */
  function band(g,img,f,y){if(!img)return;const w=img.width,o=((Math.round(cam*f)%w)+w)%w;for(let x=-o;x<W;x+=w)g.drawImage(img,x,y)}
  /* plan qui tremble dans la chaleur : chaque ligne décalée d'un pixel au plus */
  function heatBand(g,img,f,y,t){const w=img.width,h=img.height,o=((Math.round(cam*f)%w)+w)%w;for(let j=0;j<h;j++){const dx=Math.round(Math.sin(t/260+j*.9)*Math.sin(t/1700+j*.15)*1.2);for(let x=-o-w;x<W+w;x+=w)g.drawImage(img,0,j,w,1,x+dx,y+j,w,1)}}
  function px(g,x,y,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),1,1)}

  /* ---------- Vie du décor ---------- */
  function spawnBird(x){const bc=L&&L.birdC;birds.push({x,y:FY-R(10,30),st:"sol",t:R(0,3000),vx:0,vy:0,c:bc?bc[Math.random()*bc.length|0]:Math.random()<.5?"#7a5a40":"#5a6a7a"})}
  function updLife(dt,t,ph){
    /* oiseaux posés devant ; ils s'envolent quand l'équipe approche */
    const stageR=(W*P/2+80)/P;while(!L.cave&&!L.under&&!L.volcano&&!L.astral&&!L.abyss&&birds.filter(b=>b.st==="sol").length<3)spawnBird(cam+W+R(20,260));
    birds.forEach(b=>{const sx=b.x-cam;if(b.st==="sol"&&(sx<stageR||bossOn)){b.st="vol";b.vx=R(-14,30);b.vy=R(-34,-22)}if(b.st==="vol"){b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy-=6*dt}});
    birds=birds.filter(b=>b.y>-10&&b.x-cam>-20);
    /* papillons le jour, lucioles la nuit */
    const want=ph==="night"?(L&&L.nightFlies!=null?L.nightFlies:12):bossOn?0:(L&&L.dayFlies!=null?L.dayFlies:5);while(flies.length<want)flies.push({x:R(0,W),y:R(GT+2,FY+14),vx:R(-6,6),vy:R(-3,3),t:R(0,9),c:ph==="night"?"#e8ff8a":(L&&L.flyC||["#ffd36a","#ff9ac8","#bfe3ff","#fff6d8"])[Math.random()*(L&&L.flyC?L.flyC.length:4)|0],n:ph==="night"});
    if(flies.length>want)flies.length=want;flies.forEach(f=>{if(f.n!==(ph==="night")){f.n=ph==="night";f.c=f.n?"#e8ff8a":(L&&L.flyC?L.flyC[0]:"#ffd36a")}f.t+=dt;f.vx+=R(-14,14)*dt;f.vy+=R(-10,10)*dt;f.vx=Math.max(-9,Math.min(9,f.vx));f.vy=Math.max(-6,Math.min(6,f.vy));
      f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.y<GT-6)f.vy+=4*dt;if(f.y>FY+16)f.vy-=4*dt;if(f.x<-4)f.x+=W+8;if(f.x>W+4)f.x-=W+8});
    /* ombres des nuages sur la prairie */
    while(shadows.length<3)shadows.push({x:R(0,1000),y:R(GT+10,H-10),rx:R(26,46),ry:R(4,6),v:R(2,4)});
    shadows.forEach(s=>s.x-=s.v*dt);
    /* fumée des cheminées du village */
    if(L&&Math.random()<dt*1.4){const h=L.meta.houses[Math.random()*L.meta.houses.length|0];if(h)puffs.push({h,t:0})}
    puffs.forEach(p=>p.t+=dt);puffs=puffs.filter(p=>p.t<2.6);
    /* boules d'herbe sèche poussées par le vent (posées sur le sol : elles défilent avec lui) */
    if(L&&L.tumble){if(tumbles.length<2&&Math.random()<dt*.25){const front=Math.random()<.5;tumbles.push({x:cam-14,y:front?PY+16+R(0,14):PY-12-R(0,10),vx:R(22,38),d:0})}
      tumbles.forEach(b=>{b.x+=b.vx*dt;b.d+=b.vx*dt});tumbles=tumbles.filter(b=>b.x-cam<W+20)}
    /* flocons sur deux profondeurs (k : vitesse de défilement et de chute) */
    if(L&&L.snow){while(flakes.length<70){const k=Math.random()<.6?.45:1;flakes.push({x:R(0,W+40),y:flakes.length<70&&!flakes.ready?R(-10,H):-4,k,ph:R(0,TAU),v:R(8,13)*k})}flakes.ready=1;
      flakes.forEach(f=>{f.y+=f.v*dt;f.ph+=dt*1.3;if(f.y>FY+24){f.y=-4;f.x=R(0,W+40)}})}
    /* mouettes qui planent contre le vent */
    if(L&&L.gulls){if(gulls.length<3&&Math.random()<dt*.3)gulls.push({x:W+10,y:R(CT+10,Math.max(CT+14,GT-22)),v:R(9,16),ph:R(0,TAU)});gulls.forEach(b=>{b.x-=b.v*dt;b.ph+=dt});gulls=gulls.filter(b=>b.x>-12)}
    /* éclairs au loin */
    if(L&&L.storm){if(!bolt&&Math.random()<dt/9){const x0=R(W*.1,W*.9),pts=[[x0,CT+4]];let x=x0,y=CT+4;const yb=GT-L.mid.height+2+L.mid.height-16;while(y<yb){y+=R(3,7);x+=R(-5,5);pts.push([x,Math.min(y,yb)])}bolt={t:0,pts,br:pts.length>4?[pts[2|0],R(-1,1)]:null}}
      if(bolt){bolt.t+=dt;if(bolt.t>.5)bolt=null}}
    /* bancs de poissons et méduses (pleine eau, défilement 0,6) */
    if(L&&L.fish){if(schools.length<3&&Math.random()<dt*.35){const d=Math.random()<.5?1:-1,n=4+(Math.random()*7|0),pal=[["#ffd84a","#f0a020"],["#ff8a5a","#ffffff"],["#8ae0ff","#3a8ab8"],["#ff8ac8","#b84a8a"]][Math.random()*4|0];
        schools.push({x:cam*.6+(d>0?-30:W+30),y:R(CT+14,GT+10),d,v:R(10,20),n,pal,ph:R(0,TAU),f:Array.from({length:n},()=>[R(-10,10),R(-5,5)])})}
      schools.forEach(s=>{s.x+=s.d*s.v*dt;s.ph+=dt});schools=schools.filter(s=>{const sx=s.x-cam*.6;return sx>-60&&sx<W+60});
      if(jellies.length<2&&Math.random()<dt*.08)jellies.push({x:cam*.6+R(0,W),y:FY+10,v:R(3,6),ph:R(0,TAU),c:Math.random()<.5?"255,170,220":"190,170,255"});jellies.forEach(j=>{j.ph+=dt;j.y-=j.v*dt*(.5+.5*Math.max(0,Math.sin(j.ph*2)))});jellies=jellies.filter(j=>j.y>CT-10)}
    /* panache du volcan et éruptions (coordonnées du plan lointain) */
    if(L&&L.volcano&&L.meta.crater){if(Math.random()<dt*6)plume.push({dx:R(-2,2),dy:0,vx:R(.5,2.5),vy:-R(3,6),t:0,life:R(6,10)});plume.forEach(p=>{p.t+=dt;p.dx+=p.vx*dt;p.dy+=p.vy*dt;p.vy*=.995});plume=plume.filter(p=>p.t<p.life);
      erupt-=dt;if(erupt<=0){erupt=R(9,15);for(let i=0;i<14;i++)bombs.push({dx:0,dy:0,vx:R(-14,14),vy:-R(16,30),t:0});for(let i=0;i<10;i++)plume.push({dx:R(-3,3),dy:0,vx:R(-1,3),vy:-R(8,14),t:0,life:R(4,7),big:1})}
      bombs.forEach(b=>{b.t+=dt;b.dx+=b.vx*dt;b.dy+=b.vy*dt;b.vy+=22*dt});bombs=bombs.filter(b=>b.dy<20)}
    /* débris de roche qui remontent vers la faille */
    if(L&&L.abyss){if(debris.length<6&&Math.random()<dt*.6)debris.push({x:cam*.6+R(0,W),y:FY+20,v:R(3,8),ph:R(0,TAU),s:Math.random()<.4?2:1});debris.forEach(d=>{d.y-=d.v*dt;d.ph+=dt});debris=debris.filter(d=>d.y>CT-6)}
    /* rafales : traînées de sable au ras du sol */
    if(L&&L.wind){if(gusts.length<(L.storm?9:6)&&Math.random()<dt*2)gusts.push({x:R(-40,W),y:L.storm&&Math.random()<.5?R(CT+8,GT-10):R(GT+4,FY+16),l:R(6,18),v:R(60,110),t:0});gusts.forEach(s=>{s.x+=s.v*dt;s.t+=dt});gusts=gusts.filter(s=>s.t<1.4&&s.x<W+30)}}
  function drawLife(g,t,ph){
    /* ombres des nuages : sur le sol, elles suivent le défilement */
    if(ph!=="night"&&!L.dark)shadows.forEach(s=>{const o=((s.x-cam)%1000+1000)%1000-120;g.fillStyle="rgba(20,40,30,.13)";for(let y=-s.ry;y<=s.ry;y++){const w=Math.round(s.rx*Math.sqrt(1-(y/s.ry)**2));g.fillRect(Math.round(o-w),Math.round(s.y+y),w*2,1)}});
    /* reflets sur les mares */
    const gy=GT-TM;L.meta.ponds.forEach(p=>{const w=L.gW,o=((Math.round(cam)%w)+w)%w;for(let k=-1;k<=Math.ceil(W/w);k++){const cx=p.x+k*w-o;if(cx<-40||cx>W+40)continue;
      for(let i=0;i<4;i++){const s=Math.floor(t/520)+i*13,a=Math.sin(s*12.9898+p.x)*43758.5,fr=a-Math.floor(a),b=Math.sin(s*78.233+p.y)*12345.6,fy=b-Math.floor(b);
        g.fillStyle="rgba(230,245,255,.8)";g.fillRect(Math.round(cx+(fr-.5)*p.rx*1.3),Math.round(gy+p.y+(fy-.5)*p.ry*1.1),2+(i%2),1)}}});
    /* bulles qui montent et éclatent à la surface (glouglou) */
    if(L.bubbles)L.meta.ponds.forEach((p,i)=>{const w=L.gW,o=((Math.round(cam)%w)+w)%w,per=1700+(i%5)*430,cy=Math.floor(t/per),k=(t%per)/per;if(k>.42)return;
      const a=Math.sin(cy*12.9898+i*7.1)*43758.5,fr=a-Math.floor(a),b=Math.sin(cy*78.233+i*3.3)*12345.6,fy=b-Math.floor(b);
      for(let m=-1;m<=Math.ceil(W/w);m++){const x=Math.round(p.x+m*w-o+(fr-.5)*p.rx*1.2),y=Math.round(gy+p.y+(fy-.5)*p.ry);if(x<-4||x>W+4)continue;
        g.fillStyle="rgba(220,245,235,.85)";if(k<.3){const s=k<.1?1:2;g.fillRect(x,y-s+1,s,s);if(s>1){g.fillStyle="rgba(255,255,255,.9)";g.fillRect(x,y-1,1,1)}}else{g.fillRect(x-2,y,1,1);g.fillRect(x+2,y,1,1);g.fillRect(x,y-1,1,1);g.fillRect(x,y+1,1,1)}}});
    /* boules d'herbe qui roulent et rebondissent */
    if(L.tumble){const F=tumbleF();tumbles.forEach(b=>{const x=Math.round(b.x-cam)-5,y=Math.round(gy+b.y-10-Math.abs(Math.sin(b.d/7))*4);g.fillStyle="rgba(120,80,30,.22)";g.fillRect(x+2,Math.round(gy+b.y-1),7,1);g.drawImage(F[Math.floor(b.d/3)%4],x,y)})}
    if(L.wind)gusts.forEach(s=>{const a=Math.sin(s.t/1.4*Math.PI)*.55;g.fillStyle=`rgba(${L.windC||"255,240,200"},${a.toFixed(3)})`;g.fillRect(Math.round(s.x),Math.round(s.y),Math.round(s.l),1);g.fillRect(Math.round(s.x+s.l*.6),Math.round(s.y)-1,Math.round(s.l*.4),1)});
    /* oiseaux */
    birds.forEach(b=>{const x=Math.round(b.x-cam),y=Math.round(b.y);if(b.st==="sol"){const peck=Math.floor((t+b.t)/420)%5===0;g.fillStyle=b.c;g.fillRect(x,y,3,2);g.fillRect(x+(peck?3:2),y-(peck?0:1),2,peck?1:2);g.fillStyle="#f0a03c";g.fillRect(x+(peck?5:4),y+(peck?1:0),1,1);g.fillStyle="#1c1020";g.fillRect(x+3,y-1+(peck?1:0),1,1)}
      else{const up=Math.floor(t/90)%2;g.fillStyle=b.c;g.fillRect(x,y,3,2);g.fillRect(x-1,y-(up?2:0),2,1);g.fillRect(x+2,y-(up?2:0),2,1)}});
    /* papillons et lucioles */
    flies.forEach(f=>{const x=Math.round(f.x),y=Math.round(f.y);if(f.n){const a=.4+.6*Math.abs(Math.sin(f.t*2.2)),nc=L.nightC||"232,255,138";g.fillStyle=`rgba(${nc},${a*.35})`;g.fillRect(x-1,y-1,3,3);g.fillStyle=`rgba(${L.nightC||"250,255,200"},${a})`;g.fillRect(x,y,1,1)}
      else if(L.drag){const fl=Math.floor(f.t*14)%2;g.fillStyle=f.c;g.fillRect(x-2,y,4,1);g.fillStyle="#1c3040";g.fillRect(x+2,y,1,1);g.fillStyle=`rgba(230,245,255,${fl?.75:.4})`;g.fillRect(x-1,y-1-fl,1,1);g.fillRect(x+1,y-1-fl,1,1);g.fillRect(x-1,y+1+fl,1,1);g.fillRect(x+1,y+1+fl,1,1)}
      else if(L.motes){const a=.35+.45*Math.abs(Math.sin(f.t*1.3));g.fillStyle=`rgba(255,250,210,${a*.3})`;g.fillRect(x-1,y,3,1);g.fillRect(x,y-1,1,3);g.fillStyle=f.c;g.globalAlpha=a;g.fillRect(x,y,1,1);g.globalAlpha=1}
      else{const open=Math.floor(f.t*7)%2;g.fillStyle=f.c;if(open){g.fillRect(x-2,y-1,2,2);g.fillRect(x+1,y-1,2,2)}else{g.fillRect(x-1,y-1,1,2);g.fillRect(x+1,y-1,1,2)}g.fillStyle="#3a2a22";g.fillRect(x,y-1,1,2)}})}

  /* aurore boréale : rideaux verts et violets qui ondulent, colonne par colonne */
  function aurora(g,t,moving){const tt=moving?t:0,top=Math.max(CT+14,GT-60);for(let x=0;x<W;x+=1){const u=(x+cam*.03)/W;
      const y0=top-8+Math.round(9*Math.sin(u*7+tt/2600)+5*Math.sin(u*17-tt/1900)),len=18+Math.round(10*Math.sin(u*5+tt/3100)),a=.24+.12*Math.sin(u*23+tt/700);if(a<=0)continue;
      for(let j=0;j<len;j++){const f=j/len,c=f<.35?"150,120,255":"110,255,170";g.fillStyle=`rgba(${c},${(a*(f<.15?f/.15:1-f*.8)).toFixed(3)})`;g.fillRect(x,y0+j,1,1)}}}
  /* éclair : ligne brisée jaune et blanche, du haut du ciel jusqu'à l'horizon */
  function drawBolt(g){const p=bolt.pts;for(let i=1;i<p.length;i++){const[a,b]=[p[i-1],p[i]],n=Math.max(1,Math.round(Math.abs(b[1]-a[1])));for(let k=0;k<=n;k++){const x=Math.round(a[0]+(b[0]-a[0])*k/n),y=Math.round(a[1]+(b[1]-a[1])*k/n);g.fillStyle="rgba(255,226,122,.45)";g.fillRect(x-1,y,3,1);g.fillStyle="#fffbe8";g.fillRect(x,y,1,1)}}}
  /* faisceau du phare : il balaie la mer la nuit et par temps sombre */
  function beam(g,t,ph,MY){const w=L.mid.width,o=((Math.round(cam*.22)%w)+w)%w,a0=ph==="night"?.22:ph==="day"?.06:.14,ang=(calm()?0:t/1400)%TAU,c=Math.cos(ang),side=c>0?1:-1,len=Math.round(70*Math.abs(c))+6;
    for(let k=-1;k<=Math.ceil(W/w);k++){const x=L.meta.lh.x+k*w-o,y=MY+L.meta.lh.y;if(x<-90||x>W+90)continue;g.fillStyle="rgba(255,240,170,.9)";g.fillRect(x-1,y-1,3,2);
      for(let i=2;i<len;i++){const hw=Math.round(i*.12),a=a0*(1-i/len);g.fillStyle=`rgba(255,240,170,${a.toFixed(3)})`;g.fillRect(x+side*i,y-hw,1,hw*2+1)}}}
  /* cascade : traits clairs qui descendent, écume au pied (attachée au plan moyen) */
  function falls(g,t,MY){const w=L.mid.width,o=((Math.round(cam*.22)%w)+w)%w,tt=calm()?0:t;L.meta.falls.forEach(f=>{for(let k=-1;k<=Math.ceil(W/w);k++){const x0=f.x+k*w-o;if(x0<-20||x0>W+20)continue;
      for(let i=0;i<f.w;i++){const sp=.045+(i%3)*.012,off=Math.floor(tt*sp+i*7)%9;for(let y=off;y<f.h;y+=9){g.fillStyle="rgba(240,255,250,.75)";g.fillRect(x0+i,MY+f.y+y,1,3)}}
      for(let i=-4;i<f.w+4;i++){const b=Math.sin(tt/180+i*1.7)>.2;if(b){g.fillStyle="rgba(255,255,255,.7)";g.fillRect(x0+i,MY+f.y+f.h+1-(i%2),1,1)}}}})}
  /* surface vue d'en dessous : deux lignes de lumière qui ondulent */
  function surface(g,t,ph,moving){const tt=moving?t:0,y0=CT+1,a=ph==="night"?.25:.55;for(let x=0;x<W;x++){const u=x+cam*.7,y1=y0+Math.round(Math.sin(u/9+tt/600)*1.4+Math.sin(u/23-tt/900)),y2=y0+4+Math.round(Math.sin(u/13-tt/700)*1.2);
      g.fillStyle=`rgba(220,250,255,${a})`;g.fillRect(x,y1,1,1);if((x+Math.floor(tt/200))%3)g.fillRect(x,y2,1,1);if(Math.sin(u/5+tt/400)>.85){g.fillStyle=`rgba(255,255,255,${a})`;g.fillRect(x,y1-1,1,1)}}}
  /* varech : longues lanières ancrées sur les rochers du premier rang, qui ondulent */
  function kelp(g,t,moving){const w=L.wall.width,o=((Math.round(cam*.5)%w)+w)%w,y0=GT-L.wall.height+3,tt=moving?t:0;L.meta.kelp.forEach(k=>{for(let m=-1;m<=Math.ceil(W/w);m++){const bx=k.x+m*w-o;if(bx<-20||bx>W+20)continue;
      for(let j=0;j<k.h;j++){const x=Math.round(bx+Math.sin(tt/900+j*.12+k.ph)*j*.09),y=y0+k.y-j;g.fillStyle=j%7===3?REC.kelpL:REC.kelp;g.fillRect(x,y,2,1);if(j%6===2){g.fillStyle=REC.kelpL;g.fillRect(x+2,y,2,1);g.fillRect(x+3,y-1,1,1)}if(j%6===5){g.fillStyle=REC.kelp;g.fillRect(x-2,y,2,1)}}}})}
  /* vie marine : bulles des sources, bancs de poissons, méduses */
  function seaLife(g,t,moving){const gw=L.gW,o=((Math.round(cam)%gw)+gw)%gw,gy=GT-TM,tt=moving?t:0;
    L.meta.vents.forEach(v=>{for(let m=-1;m<=Math.ceil(W/gw);m++){const vx=v.x+m*gw-o;if(vx<-6||vx>W+6)continue;for(let k=0;k<6;k++){const p=((tt/2600+k/6+v.ph)%1+1)%1,y=Math.round(gy+v.y-p*(gy+v.y-CT-6)),x=Math.round(vx+Math.sin(p*14+k)*2),s=p>.6?2:1;
        g.fillStyle="rgba(220,250,255,.7)";g.fillRect(x,y,s,s);if(s>1){g.fillStyle="rgba(255,255,255,.9)";g.fillRect(x,y,1,1)}}}});
    schools.forEach(s=>{const sx=s.x-cam*.6;s.f.forEach(([fx,fy],i)=>{const x=Math.round(sx+fx),y=Math.round(s.y+fy+Math.sin(s.ph*2+i)*1.2);g.fillStyle=s.pal[0];g.fillRect(x,y,3,2);g.fillStyle=s.pal[1];g.fillRect(x-s.d,y+(Math.floor(s.ph*8+i)%2),1,1);g.fillStyle="#1c1020";g.fillRect(x+(s.d>0?2:0),y,1,1)})});
    jellies.forEach(j=>{const x=Math.round(j.x-cam*.6),y=Math.round(j.y),p=Math.sin(j.ph*2)>0?1:0;g.fillStyle=`rgba(${j.c},.75)`;g.fillRect(x-2-p,y,5+p*2,2);g.fillRect(x-1,y-1,3,1);g.fillStyle=`rgba(${j.c},.45)`;for(let k=-2;k<=2;k+=2)for(let q=0;q<4+p;q++)g.fillRect(x+k+((q+Math.floor(j.ph*3))%2),y+2+q,1,1)})}
  /* panache de fumée et bombes de lave au-dessus du cratère */
  function volcano(g,t){const w=L.far.width,o=((Math.round(cam*.08)%w)+w)%w,c=L.meta.crater,y0=GT-L.far.height-4+c.y;for(let k=-1;k<=Math.ceil(W/w);k++){const x0=c.x+k*w-o;if(x0<-80||x0>W+80)continue;
      plume.forEach(p=>{const f=p.t/p.life,rr=Math.round(1+f*(p.big?7:5)),a=(1-f)*(p.big?.5:.35),x=Math.round(x0+p.dx),y=Math.round(y0+p.dy),gr=Math.round(70+f*60);g.fillStyle=`rgba(${gr},${gr-10},${gr-12},${a.toFixed(3)})`;
        for(let dy=-rr;dy<=rr;dy++){const hw=Math.round(Math.sqrt(rr*rr-dy*dy));g.fillRect(x-hw,y+dy,hw*2+1,1)}});
      bombs.forEach(b=>{const x=Math.round(x0+b.dx),y=Math.round(y0+b.dy);g.fillStyle="#ffd84a";g.fillRect(x,y,1,1);g.fillStyle="rgba(255,122,44,.8)";g.fillRect(x-1,y,1,1);g.fillRect(x,y+1,1,1)})}}
  /* lave vivante : fissures qui pulsent, bulles qui crèvent dans les mares, fumée des fumerolles */
  function lavaLife(g,t,moving){const gw=L.gW,o=((Math.round(cam)%gw)+gw)%gw,gy=GT-TM,tt=moving?t:0;
    for(let i=0;i<L.cracks.length;i+=2){const[cx,cy]=L.cracks[i],a=.25+.25*Math.sin(tt/500+cx*.05);for(let m=-1;m<=Math.ceil(W/gw);m++){const x=cx+m*gw-o;if(x<-2||x>W+2)continue;g.fillStyle=`rgba(255,180,60,${a.toFixed(3)})`;g.fillRect(x,gy+cy,1,1)}}
    L.meta.lava.forEach((p,i)=>{const per=900+(i%3)*300,cy=Math.floor(tt/per),k=(tt%per)/per,a=Math.sin(cy*12.9898+i*7.1)*43758.5,fr=a-Math.floor(a),b=Math.sin(cy*78.233+i)*12345.6,fy=b-Math.floor(b);
      for(let m=-1;m<=Math.ceil(W/gw);m++){const x=Math.round(p.x+m*gw-o+(fr-.5)*p.rx*1.2),y=Math.round(gy+p.y+(fy-.5)*p.ry);if(x<-4||x>W+4)continue;if(k<.5){const s=k<.2?1:2;g.fillStyle="#ffe88a";g.fillRect(x,y-s+1,s,s)}else if(k<.65){g.fillStyle="rgba(255,200,80,.8)";g.fillRect(x-2,y,1,1);g.fillRect(x+2,y,1,1);g.fillRect(x,y-2,1,1)}}});
    L.meta.fum.forEach(f=>{for(let m=-1;m<=Math.ceil(W/gw);m++){const fx=f.x+m*gw-o;if(fx<-10||fx>W+10)continue;for(let k=0;k<5;k++){const p=((tt/3000+k/5+f.ph)%1+1)%1,y=Math.round(gy+f.y-2-p*26),x=Math.round(fx+Math.sin(p*6+k)*2+p*4),rr=1+Math.round(p*2);g.fillStyle=`rgba(200,190,180,${(.4*(1-p)).toFixed(3)})`;g.fillRect(x-rr,y,rr*2+1,rr)}}})}
  /* ciel astral : étoiles visibles même le jour, croissant de lune, constellations la nuit, étoiles filantes */
  const CONST=[[[.12,.3],[.16,.22],[.21,.26],[.25,.18],[.3,.24]],[[.55,.15],[.6,.28],[.66,.2],[.62,.1],[.55,.15]],[[.78,.35],[.84,.25],[.9,.3],[.86,.42]]];
  function starsky(g,t,ph,moving){const top=CT+2,hz=Math.max(top+10,GT-24),a0=ph==="night"?1:ph==="day"?.35:.65,rs=rng(11);
    for(let i=0;i<70;i++){const x=rs()*W|0,y=top+(rs()*(hz-top)|0),tw=.5+.5*Math.sin(t/(500+i*13)+i);g.fillStyle=`rgba(255,250,240,${(a0*(.3+.6*tw)).toFixed(3)})`;g.fillRect(x,y,1,1)}
    if(ph!=="day")CONST.forEach((c,k)=>{const pts=c.map(([u,v])=>[Math.round(u*W),Math.round(top+v*(hz-top))]),pulse=.25+.2*Math.sin(t/1500+k);for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]],n=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));for(let j=0;j<=n;j+=2){g.fillStyle=`rgba(200,190,255,${(pulse*a0).toFixed(3)})`;g.fillRect(Math.round(a[0]+(b[0]-a[0])*j/n),Math.round(a[1]+(b[1]-a[1])*j/n),1,1)}}
      pts.forEach(([x,y])=>{g.fillStyle=`rgba(255,240,200,${a0})`;g.fillRect(x,y,1,1);g.fillStyle=`rgba(255,240,200,${(a0*.4).toFixed(3)})`;g.fillRect(x-1,y,3,1);g.fillRect(x,y-1,1,3)})});
    /* croissant de lune */
    const mx=Math.round(W*.82),my=top+16,R2=9;for(let dy=-R2;dy<=R2;dy++)for(let dx=-R2;dx<=R2;dx++){const d1=dx*dx+dy*dy,d2=(dx-4)**2+(dy+2)**2;if(d1<=R2*R2&&d2>(R2-1)**2){g.fillStyle=d1>(R2-1.5)**2?"#e8dcb8":"#fff6d8";g.fillRect(mx+dx,my+dy,1,1)}}
    g.fillStyle="rgba(255,246,216,.12)";g.fillRect(mx-12,my-10,16,21);
    /* étoile filante */
    if(moving){const per=7000,k=(t%per)/per;if(k<.08){const s0=Math.floor(t/per),u=(Math.sin(s0*12.9)*.5+.5),x=Math.round(W*(.2+u*.6)-k*900),y=Math.round(top+8+k*300);for(let j=0;j<10;j++){g.fillStyle=`rgba(255,255,255,${(.9-j*.09).toFixed(2)})`;g.fillRect(x+j,y-Math.round(j/3),1,1)}}}}
  /* îles flottantes qui tanguent doucement */
  function isles(g,t,moving){const per=900,top=CT+8,bot=Math.max(top+12,GT-34);L.isles.forEach(i=>{const x=((Math.round(i.x-cam*.12)%per)+per)%per-60,y=Math.round(top+i.yf*(bot-top)+(moving?Math.sin(t/2200+i.ph)*2:0));if(x>-i.w&&x<W+10)g.drawImage(i.cv,x,y)})}
  /* éclats de cristal en suspens au-dessus des ruines du premier rang */
  function shards(g,t,moving){const w=L.wall.width,o=((Math.round(cam*.5)%w)+w)%w,y0=GT-L.wall.height+3;L.meta.shards.forEach(s=>{for(let m=-1;m<=Math.ceil(W/w);m++){const x=s.x+m*w-o;if(x<-6||x>W+6)continue;const y=y0+s.y+Math.round(moving?Math.sin(t/900+s.ph)*2:0);
      g.fillStyle=AST.cry;g.fillRect(x,y-2,1,5);g.fillRect(x-1,y-1,3,3);g.fillStyle=AST.cryL;g.fillRect(x,y-1,1,2);if(s.s>1){g.fillStyle=AST.cry;g.fillRect(x+3,y+2,1,3);g.fillStyle=AST.cryL;g.fillRect(x+3,y+2,1,1)}}})}
  /* ciel de néant : nébuleuse en transparence, étoiles rares, faille lumineuse qui pulse */
  function voidsky(g,t,moving){const tt=moving?t:0,top=CT+2,hz=Math.max(top+10,GT-20),rs=rng(17);
    const nw=L.neb.width,o=((Math.round(cam*.03+tt*.002)%nw)+nw)%nw;g.globalAlpha=.42;for(let x=-o;x<W;x+=nw)g.drawImage(L.neb,x,top+4);g.globalAlpha=1;
    for(let i=0;i<40;i++){const x=rs()*W|0,y=top+(rs()*(hz-top)|0),a=.25+.35*Math.max(0,Math.sin(tt/(700+i*17)+i));g.fillStyle=`rgba(230,210,255,${a.toFixed(3)})`;g.fillRect(x,y,1,1)}
    /* la faille : ligne brisée verticale, cœur clair, halo magenta, particules aspirées */
    const fx=Math.round(W*.34-cam*.02%W),pr=rng(23),pts=[],yEnd=Math.max(top+16,hz-6);let x=fx,y=top+4;while(y<yEnd){pts.push([x,y]);y+=3+(pr()*4|0);x+=Math.round((pr()-.5)*5)}pts.push([x,yEnd]);
    const pu=.6+.4*Math.sin(tt/700);for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]],n=Math.max(1,b[1]-a[1]),wd=Math.round(1+2*Math.sin(Math.PI*i/pts.length));for(let k=0;k<n;k++){const xx=Math.round(a[0]+(b[0]-a[0])*k/n),yy=a[1]+k;
      g.fillStyle=`rgba(184,58,208,${(.18*pu).toFixed(3)})`;g.fillRect(xx-wd-3,yy,wd*2+7,1);g.fillStyle=`rgba(255,154,240,${(.7*pu).toFixed(3)})`;g.fillRect(xx-wd,yy,wd*2+1,1);g.fillStyle="#fff0ff";g.fillRect(xx,yy,1,1)}}
    for(let k=0;k<10;k++){const p=((tt/3000+k/10)%1+1)%1,pi=pts[(k*3)%pts.length],ang=k*2.4,d=(1-p)*26;g.fillStyle=`rgba(255,180,250,${(.8*p).toFixed(3)})`;g.fillRect(Math.round(pi[0]+Math.cos(ang)*d),Math.round(pi[1]+Math.sin(ang)*d*.6),1,1)}}
  /* vie de l'abîme : veines et runes qui pulsent, bulles du néant, yeux qui clignent, débris qui montent */
  function voidLife(g,t,moving){const gw=L.gW,o=((Math.round(cam)%gw)+gw)%gw,gy=GT-TM,tt=moving?t:0;
    for(let i=0;i<L.cracks.length;i+=2){const[cx,cy]=L.cracks[i],a=.2+.25*Math.sin(tt/650+cx*.05);for(let m=-1;m<=Math.ceil(W/gw);m++){const x=cx+m*gw-o;if(x<-2||x>W+2)continue;g.fillStyle=`rgba(255,140,240,${a.toFixed(3)})`;g.fillRect(x,gy+cy,1,1)}}
    L.runes.forEach(([rx,ry],i)=>{const a=.3+.3*Math.sin(tt/900+(rx>>3));for(let m=-1;m<=Math.ceil(W/gw);m++){const x=rx+m*gw-o;if(x<-2||x>W+2)continue;g.fillStyle=`rgba(255,170,250,${a.toFixed(3)})`;g.fillRect(x,gy+ry,1,1)}});
    L.meta.lava.forEach((p,i)=>{const per=1300+(i%3)*400,cy=Math.floor(tt/per),k=(tt%per)/per,a=Math.sin(cy*12.9898+i*7.1)*43758.5,fr=a-Math.floor(a),b=Math.sin(cy*78.233+i)*12345.6,fy=b-Math.floor(b);
      for(let m=-1;m<=Math.ceil(W/gw);m++){const x=Math.round(p.x+m*gw-o+(fr-.5)*p.rx*1.2),y=Math.round(gy+p.y+(fy-.5)*p.ry);if(x<-4||x>W+4)continue;if(k<.45){const s=k<.2?1:2;g.fillStyle="#ffd0ff";g.fillRect(x,y-s+1,s,s)}else if(k<.6){g.fillStyle="rgba(255,160,250,.8)";g.fillRect(x-2,y,1,1);g.fillRect(x+2,y,1,1);g.fillRect(x,y-2,1,1)}}});
    /* yeux dans les creux du premier rang */
    const ww=L.wall.width,ow=((Math.round(cam*.5)%ww)+ww)%ww,wy=GT-L.wall.height+3;L.meta.eyes.forEach(e=>{const p=((tt/1000/e.per+e.ph)%1+1)%1;if(p>.35)return;const lid=p<.03||p>.32||(p>.17&&p<.19);
      for(let m=-1;m<=Math.ceil(W/ww);m++){const x=e.x+m*ww-ow;if(x<-6||x>W+6)continue;const y=wy+e.y;g.fillStyle=`rgba(${e.c},.25)`;g.fillRect(x-2,y-1,10,3);g.fillStyle=`rgba(${e.c},1)`;if(lid){g.fillRect(x,y,2,1);g.fillRect(x+4,y,2,1)}else{g.fillRect(x,y-1,2,2);g.fillRect(x+4,y-1,2,2);g.fillStyle="#1c0c20";g.fillRect(x+1,y-1,1,2);g.fillRect(x+5,y-1,1,2)}}});
    debris.forEach(d=>{const x=Math.round(d.x-cam*.6+Math.sin(d.ph)*2),y=Math.round(d.y);g.fillStyle="#2a2040";g.fillRect(x,y,2+d.s,1+d.s);g.fillStyle="#9a6aff";g.fillRect(x,y,2+d.s,1)})}
  /* brume du marais : bandes douces au ras de l'eau, qui dérivent lentement (pas de flou : des lignes de pixels) */
  const MIST=[[0,.55,.2,40],[1,.8,.15,30],[2,1,.12,44],[3,1.1,.1,34]];
  function mist(g,t,ph,moving){const col=L.mistC?L.mistC:ph==="night"?"170,190,230":ph==="day"?"235,245,240":"240,220,215",dr=moving?t*.004:0;
    MIST.forEach(([i,f,a0,len])=>{const y=Math.round(GT-6+i*9+(i>1?(FY-GT-24)*(i-1)*.5:0)),per=260+i*70,off=((cam*f+dr*(1+i*.3))%per+per)%per;
      for(let x0=-off;x0<W;x0+=per)for(let b=0;b<3;b++){const bx=Math.round(x0+b*per/3+i*31),bl=len*W/320+b*10;for(let j=-3;j<=3;j++){const wv=Math.round(bl*(1-Math.abs(j)*.2)),a=a0*(1-Math.abs(j)*.25);g.fillStyle=`rgba(${col},${a.toFixed(3)})`;g.fillRect(bx-wv,y+j,wv*2,1)}}})}
  /* rayons de lumière entre les arbres : ils défilent avec le premier rang (vitesse 0,5) */
  function rays(g,t,ph,moving){const w=L.wall.width,o=((Math.round(cam*.5)%w)+w)%w,y0=GT-L.wall.height+20,y1=FY+18,col=L.rayC||(ph==="day"?"255,244,190":"255,190,130"),k0=ph==="day"?1:.8;
    L.meta.rays.forEach(rv=>{for(let k=-1;k<=Math.ceil(W/w)+1;k++){const x0=rv.x+k*w-o;if(x0<-80||x0>W+20)continue;const a=k0*(.075+.03*Math.sin(t/2600+rv.ph)*(moving?1:0));
      for(let y=Math.max(0,y0);y<y1;y++){const f=(y-y0)/(y1-y0),x=Math.round(x0+(y-y0)*.42),ww=Math.round(rv.w*(.7+f*.9)),fade=f<.12?f/.12:f>.85?(1-f)/.15:1;g.fillStyle=`rgba(${col},${(a*fade).toFixed(3)})`;g.fillRect(x,y,ww,1);g.fillStyle=`rgba(${col},${(a*fade*.6).toFixed(3)})`;g.fillRect(x+2,y,ww-4,1)}}})}

  /* champignons de lune : halo qui respire, par-dessus la teinte de l'heure pour luire la nuit */
  function glow(g,t,ph){const k0=ph==="night"?1.6:ph==="cave"?1.1:ph==="day"?.25:.7;L.meta.glow.forEach(m=>{const f=m.f||1,img=f===1?L.ground:f===.5?L.wall:f===.08?L.far:L.mid,w=f===1?L.gW:img.width,o=((Math.round(cam*f)%w)+w)%w,gy=f===1?GT-TM:f===.5?GT-L.wall.height+3:f===.08?GT-L.far.height-4:GT-L.mid.height+2,sz=m.s||1;
    for(let k=-1;k<=Math.ceil(W/w);k++){const x=Math.round(m.x+k*w-o),y=gy+m.y;if(x<-12||x>W+12)continue;
      const a=k0*(m.fl?.8+.2*Math.sin(t/90+m.ph)*Math.sin(t/37+m.ph*2):.55+.45*Math.sin(t/900+m.ph));if(!m.cs)m.cs=css(m.c,1).replace(",1)","");
      if(sz>1)for(const[rr,al]of[[9*sz,.07],[6*sz,.09]]){g.fillStyle=m.cs+","+(a*al).toFixed(3)+")";const R2=Math.round(rr);for(let dy=-R2;dy<=R2;dy++){const hw=Math.round(Math.sqrt(R2*R2-dy*dy));g.fillRect(x-hw,y+dy,hw*2+1,1)}}
      g.fillStyle=m.cs+","+(a*.16).toFixed(3)+")";g.fillRect(x-4,y-2,9,5);g.fillRect(x-3,y-3,7,7);g.fillStyle=m.cs+","+(a*.28).toFixed(3)+")";g.fillRect(x-2,y-1,5,3)}})}

  /* ---------- Image ---------- */
  function draw(t,dt){if(!ctx||!L||!W)return;const ph=L.cave?"cave":phase(),moving=!calm();
    if(moving&&walkMs){const k=Math.min(1,(t-walkT0)/walkMs),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;cam=camFrom+(camTo-camFrom)*e;if(k>=1){walkMs=0;$("arena").classList.remove("walking")}}
    if(moving)updLife(dt,t,ph);
    ctx.drawImage(skyCanvas(ph),0,0);
    /* soleil ou lune et étoiles (rien sous terre) */
    if(L.cave){}
    else if(L.under)surface(ctx,t,ph,moving);
    else if(L.volcano){}
    else if(L.astral)starsky(ctx,t,ph,moving);
    else if(L.abyss)voidsky(ctx,t,moving);
    else if(ph==="night"){const r=rng(5);for(let i=0;i<46;i++){const x=r()*W|0,y=r()*Math.max(10,GT-30)|0,tw=Math.sin(t/600+i*1.7)>.6;ctx.fillStyle=tw?"#ffffff":"rgba(210,225,255,.7)";ctx.fillRect(x,y,1,1)}
      const mx=Math.round(W*.8),my=24;ctx.fillStyle="#f6f0d6";ctx.fillRect(mx-3,my-4,7,9);ctx.fillRect(mx-4,my-3,9,7);ctx.fillStyle="#d8d0b0";ctx.fillRect(mx-1,my-1,2,2);ctx.fillRect(mx+2,my+1,1,1)}
    else{const sx=Math.round(W*(ph==="dawn"?.14:ph==="dusk"?.86:.8)),sy=ph==="day"?24:Math.max(24,GT-44);ctx.fillStyle="rgba(255,240,170,.25)";ctx.fillRect(sx-7,sy-5,15,11);ctx.fillRect(sx-5,sy-7,11,15);
      ctx.fillStyle=ph==="day"?"#fff4b0":"#ffcf8a";ctx.fillRect(sx-4,sy-3,9,7);ctx.fillRect(sx-3,sy-4,7,9)}
    if(L.aurora&&ph==="night")aurora(ctx,t,moving);
    /* nuages */
    ctx.globalAlpha=ph==="night"?.35:bossOn?.6:.95;L.clouds.forEach((c,i)=>{const per=W+140,x=(((i*per/4+t*(.0016+i*.0005)*(moving?1:0)+cam*.05)%per)+per)%per;ctx.drawImage(c,Math.round(W+40-x),18+((i*11)%Math.max(8,GT-70)))});ctx.globalAlpha=1;
    /* le paysage, teinté selon l'heure */
    const g=wx;g.clearRect(0,0,W,H);
    const MY=GT-L.mid.height+2;const ZAP=L.storm&&bolt&&!calm()&&(bolt.t<.08||(bolt.t>.16&&bolt.t<.24));if(L.heat&&ph==="day"&&moving)heatBand(g,L.far,.08,GT-L.far.height-4,t);else band(g,L.far,.08,GT-L.far.height-4);if(ZAP)drawBolt(g);if(L.volcano)volcano(g,t);if(L.isles)isles(g,t,moving);band(g,L.mid,.22,MY);if(L.meta.lh)beam(g,t,ph,MY);if(L.meta.falls)falls(g,t,MY);
    /* ailes des moulins */
    {const w=L.mid.width,o=((Math.round(cam*.22)%w)+w)%w,a=t*.0012*(moving?1:0);L.meta.mills.forEach(m=>{for(let k=-1;k<=Math.ceil(W/w);k++){const x=m.x+k*w-o,y=MY+m.y;if(x<-10||x>W+10)continue;
      for(let b=0;b<4;b++){const an=a+b*TAU/4;for(let r=1;r<=6;r++)px(g,x+Math.cos(an)*r,y+Math.sin(an)*r,r>2?"#f4ecd8":"#8a6a48")}}})}
    /* fumées */
    {const w=L.mid.width,o=((Math.round(cam*.22)%w)+w)%w;puffs.forEach(p=>{const x=p.h.x-o+(p.h.x-o<-10?w:0)+p.t*1.5,y=MY+p.h.y-p.t*4;if(x<0||x>W)return;g.fillStyle=`rgba(235,235,240,${.55*(1-p.t/2.6)})`;g.fillRect(Math.round(x),Math.round(y),1+(p.t>1?1:0),1+(p.t>1.4?1:0))})}
    if(L.gulls)gulls.forEach(b=>{const x=Math.round(b.x),y=Math.round(b.y+Math.sin(b.ph*1.6)*2),up=Math.sin(b.ph*5)>0;g.fillStyle="#f4f6fa";g.fillRect(x,y,1,1);g.fillRect(x-2,y-(up?1:0),2,1);g.fillRect(x+1,y-(up?1:0),2,1);g.fillStyle="#8a94a8";g.fillRect(x-3,y-(up?2:-1),1,1);g.fillRect(x+3,y-(up?2:-1),1,1)});
    band(g,L.wall,.5,GT-L.wall.height+3);if(L.meta.kelp)kelp(g,t,moving);if(L.meta.shards)shards(g,t,moving);
    band(g,L.ground,1,GT-TM);
    /* monde plein écran : sous la bande du sol, la prairie du dessous continue jusqu'en bas */
    if(L.low){const y0=GT-TM+L.ground.height,ox=((Math.round(cam)%L.gW)+L.gW)%L.gW;for(let y=y0;y<H;y+=L.low.height)for(let x=-ox;x<W;x+=L.gW)g.drawImage(L.low,x,y)}
    drawLife(g,t,ph);
    /* hautes herbes qui ondulent : elles défilent exactement avec le sol où elles sont plantées */
    {const gw=L.gW,off=((Math.round(cam)%gw)+gw)%gw,y0=GT-TM,base=tf=>y0+tf.y;L.tufts.forEach(tf=>{const b=base(tf);if(b>H-1)return;   /* entière dans le bandeau, jamais coupée par son bord */if(!tf.cs){tf.cs=css(tf.c);tf.ct=css(mix(tf.c,"#fff2c2",.25))}
      /* le pied reste fixe, seul le haut se balance */
      for(let x=tf.x-off;x<W+4;x+=gw){if(x<-4)continue;for(let j=0;j<tf.h;j++){const sw=moving?Math.round((Math.sin(t/700+tf.ph)*1.6+(L.lean?L.lean*(1+.6*Math.sin(t/1300+tf.ph*.3)):0))*j/tf.h):0;g.fillStyle=j===tf.h-1?tf.ct:tf.cs;g.fillRect(Math.round(x+sw),b-j,tf.w,1)}
        if(tf.f){const sw=moving?Math.round(Math.sin(t/700+tf.ph)*1.6+(L.lean?L.lean*(1+.6*Math.sin(t/1300+tf.ph*.3)):0)):0;g.fillStyle=tf.f;g.fillRect(Math.round(x+sw),b-tf.h,2,1)}}})}
    if(L.meta.rays.length&&ph!=="night")rays(g,t,ph,moving);
    if(L.mist)mist(g,t,ph,moving);
    if(L.fish)seaLife(g,t,moving);
    if(L.sparks)L.sparks.forEach(s=>{const v=Math.sin(t/700*s.sp+s.ph);if(v<.86)return;const w=L.gW,o=((Math.round(cam)%w)+w)%w,y=GT-TM+s.y;for(let x=s.x-o;x<W+2;x+=w){if(x<-2)continue;g.fillStyle="#ffffff";g.fillRect(x,y,1,1);if(v>.96){g.fillStyle="rgba(255,255,255,.7)";g.fillRect(x-1,y,3,1);g.fillRect(x,y-1,1,3)}}});
    if(L.snow)flakes.forEach(f=>{const per=W+40,x=((Math.round(f.x+Math.sin(f.ph)*2-cam*f.k*.6)%per)+per)%per-20,y=Math.round(f.y);g.fillStyle=L.flakeC?L.flakeC[f.k<1?0:1]:f.k<1?"rgba(240,248,255,.75)":"#ffffff";g.fillRect(x,y,1,1);if(f.k===1&&(Math.round(f.ph)%3===0))g.fillRect(x+1,y,1,1)});
    if(L.canopy)band(g,L.canopy,.7,CT-9);
    const TN=L.tint&&L.tint[ph]!==undefined?L.tint[ph]:TINT[ph];if(TN||bossOn||L.under){g.globalCompositeOperation="source-atop";if(L.under){g.fillStyle="rgba(30,110,180,.2)";g.fillRect(0,0,W,H)}if(TN){g.fillStyle=TN;g.fillRect(0,0,W,H)}if(bossOn){g.fillStyle="rgba(70,0,30,.28)";g.fillRect(0,0,W,H)}g.globalCompositeOperation="source-over"}
    if(L.meta.glow.length)glow(g,t,ph);
    if(L.volcano)lavaLife(g,t,moving);
    if(L.abyss)voidLife(g,t,moving);
    ctx.drawImage(wc,0,0);
    if(ZAP){ctx.fillStyle="rgba(235,240,255,.16)";ctx.fillRect(0,0,W,H)}
    if(ph==="night")flies.forEach(f=>{if(!f.n)return;const a=.4+.6*Math.abs(Math.sin(f.t*2.2));ctx.fillStyle=`rgba(${L.nightC||"250,255,200"},${a})`;ctx.fillRect(Math.round(f.x),Math.round(f.y),1,1)})}

  /* ---------- Butin au sol ---------- */
  const A=()=>$("arena");
  function dropBox(){let b=$("gdrops");if(!b){b=document.createElement("div");b.id="gdrops";b.className="gdrops";A().insertBefore(b,$("mon"))}return b}
  function addDrop(html,kind,rare){if(!fx||calm()||!cv||!W)return false;const m=$("monBtn"),a=A();if(!m||!a)return false;const ar=a.getBoundingClientRect(),mr=m.getBoundingClientRect();
    if(drops.length>40)collect(drops[0]);
    const sx=(mr.left-ar.left+mr.width*R(.3,.7))/P,sy=(mr.top-ar.top+mr.height*R(.3,.6))/P,x=cam+sx+R(-10,24),y=FY+R(-3,5);
    const e=document.createElement("div");e.className="gdrop "+kind+(rare?" rare":"");e.innerHTML=kind==="coin"?'<span class="coin"></span>':html;dropBox().appendChild(e);
    const d={e,x,y,kind,t0:performance.now(),up:false};drops.push(d);place(d);
    const dx=(sx+cam-x)*P,dy=(sy-y)*P;e.firstElementChild&&e.firstElementChild.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:`translate(${dx*.45}px,${dy-40-(rare?30:0)}px)`,offset:.45},{transform:"translate(0,0)",offset:.8},{transform:"translate(0,-6px)",offset:.9},{transform:"translate(0,0)"}],{duration:rare?760:560,easing:"ease-out"});
    return true}
  function place(d){d.e.style.left=Math.round((d.x-cam)*P)+"px";d.e.style.top=Math.round(d.y*P)+"px"}
  function collect(d){const i=drops.indexOf(d);if(i<0)return;drops.splice(i,1);const tgt=d.kind==="coin"?$("ecusTxt"):(document.querySelector('[data-a="tab"][data-t="inv"]')||$("ecusTxt"));
    const r=(d.e.firstElementChild||d.e).getBoundingClientRect(),b=tgt&&tgt.getBoundingClientRect();if(!b||!r.width){d.e.remove();return}
    const f=document.createElement("div");f.className="gdrop fly "+d.e.className.replace("gdrop","");f.innerHTML=d.e.innerHTML;f.style.left=r.left+"px";f.style.top=r.top+"px";document.body.appendChild(f);d.e.remove();
    const dx=b.left+b.width/2-r.left-r.width/2,dy=b.top+b.height/2-r.top-r.height/2;
    f.animate([{transform:"translate(0,0) scale(1)"},{transform:`translate(${dx*.3}px,${dy*.3-50}px) scale(1.15)`,offset:.35},{transform:`translate(${dx}px,${dy}px) scale(.55)`,opacity:.7}],{duration:620,easing:"ease-in"}).onfinish=()=>{f.remove();const p=d.kind==="coin"?tgt.parentElement:tgt;if(p)replayCls(p,"bump")}}
  /* la position du héros ne change qu'au redimensionnement : relue 4 fois par seconde, pas à chaque image */
  let limT=-1e9,lim=0;
  function updDrops(now){if(!drops.length)return;if(now-limT>250){limT=now;const h=$("ahero"),a=A();const hr=h&&!h.hidden?h.getBoundingClientRect():null,ar=a.getBoundingClientRect();lim=hr?(hr.right-ar.left)/P+4:W*.4}
    [...drops].forEach(d=>{place(d);const age=now-d.t0;if(age>700&&(d.x-cam<lim||age>6000))collect(d)})}

  /* ---------- Boss : mise en scène ---------- */
  function bossCheck(){const b=!!(S&&S.mon&&MON[S.mon.id]&&MON[S.mon.id].boss);const a=A();if(!a)return;
    if(b!==bossOn){bossOn=b;skyKey="";a.classList.toggle("bossmode",b);$("bossBar").hidden=!b;
      if(b){$("bbName").textContent=MON[S.mon.id].name;if(fx&&!calm()){const l=$("letterbox");l.classList.remove("on");void l.offsetWidth;l.classList.add("on");clearTimeout(lbT);lbT=setTimeout(()=>l.classList.remove("on"),2600)}birds.forEach(x=>{if(x.st==="sol"){x.st="vol";x.vx=R(-20,30);x.vy=R(-40,-26)}})}}
    if(b){const p=Math.max(0,S.mon.hp/S.mon.max*100);$("bbFill").style.width=p+"%";SCENE.lag("bbLag",p);$("bbTxt").textContent=`${fmt(Math.max(0,S.mon.hp))} / ${fmt(S.mon.max)}`;$("bbName").textContent=(S.mon.shiny?"✦ ":"")+MON[S.mon.id].name}}

  /* ---------- Boucle ---------- */
  function loop(t){if(!S||!S.cls)return;const dt=Math.min(.1,(t-(lastT||t))/1000);lastT=t;
    if(UI.covered()){SITE.draw(t,dt);return}if(cv&&(cv.width!==W||!W))resize();draw(t,dt);updDrops(t);bossCheck();SITE.draw(t,dt)}

  return{
    init(){cv=$("wcv");if(!cv)return;ctx=cv.getContext("2d");wc=document.createElement("canvas");wx=wc.getContext("2d");
      if(window.ResizeObserver){ro=new ResizeObserver(resize);ro.observe($("arena"))}addEventListener("resize",resize);resize();FRAME.add(loop)},
    /* changement de zone : nouveaux plans ; la couleur du sol sert de fond de page */
    zone(id){if(id===zid&&L)return;zid=id;L=makeLayers(id);birds=[];shadows=[];puffs=[];tumbles=[];gusts=[];flies=[];flakes=[];gulls=[];bolt=null;schools=[];jellies=[];plume=[];bombs=[];erupt=4;debris=[];drops.splice(0).forEach(d=>d.e.remove());
      const c=css(L.G[0]);document.body.style.backgroundImage="none";document.body.style.backgroundColor=c;document.documentElement.style.backgroundColor=c},
    /* l'équipe avance jusqu'à l'endroit où se tenait le monstre */
    walk(){const h=$("ahero"),m=$("monBtn");let step=60;if(h&&m&&!h.hidden){const a=h.getBoundingClientRect(),b=m.getBoundingClientRect();if(a.width&&b.width)step=Math.max(30,(b.left+b.width/2-a.left-a.width/2)/P)}
      if(calm()){cam+=step;return}camFrom=cam;camTo=(walkMs?camTo:cam)+step;walkT0=performance.now();walkMs=750;$("arena").classList.add("walking")},
    coins(n){let ok=false;for(let i=0;i<n;i++)ok=addDrop("","coin",false)||ok;return ok},
    drop(icon,rare){return addDrop(`<span>${icon}</span>`,"item",rare)},
    get scale(){return P}};
})();
