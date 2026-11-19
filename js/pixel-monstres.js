/* Moteur pixel art : monstres (PX.monster, PX.monFrames). Suite de pixel.js. */
(()=>{const{cache,rgb,mix,INK,Spr,SPR,framesOf}=PX._;
  /* ---------- Monstres (40×40, tournés vers le héros à gauche) ---------- */
  /* Chaque monstre garde sa forme (shape), son attribut (ft) et sa couleur ; MLOOK ajoute une variante de dessin (k)
     pour que la bête ressemble à son nom : mouton, renard, crapaud, scarabée, hibou, abeille, cactus, tortue, etc.
     Les volumes sont ombrés par Spr.vol() (lumière en haut à gauche), les détails posés par-dessus. */
  const MLOOK={pompon:"wool",boss_0:"wool",renardine:"fox",fennecil:"fox",taupineur:"mole",glandouille:"nut",crapoteux:"frog",grenouflon:"frog",dendrobulle:"frog",boss_2:"frog",
    lucioleux:"bug",scaraboule:"bug",boss_4:"bug",etincelot:"fire",braisillon:"fire",baudrillon:"maw",limaconne:"snail",phoquin:"seal",magmoule:"lava",
    hiboulet:"owl",pingouflet:"penguin",coquelor:"rooster",perroflor:"parrot",blizzaron:"fly",albatrombe:"fly",mirageon:"fly",
    cactoche:"cactus",anemonix:"anemone",trefloche:"clover",bourdonnet:"bee",libellune:"dragonfly",grimoireau:"book",boss_6:"eagle",
    tigrelin:"tiger",dromadou:"camel",loupivre:"wolf",macaquin:"monkey",mulotin:"mouse",gargouillon:"wings",sphinxou:"wings",chevrock:"goat",
    ecorcin:"treant",boss_1:"treant",vasard:"mud",rouillard:"robot",boss_3:"robot",sablin:"sand",bambouin:"bamboo",hippocampin:"seahorse",
    herissoc:"hedgehog",oursinet:"urchin",tortecaille:"turtle",scorillon:"magma",boss_9:"magma",charbonnet:"magma",obsidien:"magma",
    nuageon:"cloud",brumelin:"cloud",fumerol:"cloud",grisouille:"cloud",tourbillard:"whirl",feuxfollet:"wisp",
    sangsuel:"worm",vrillon:"worm",salamandrin:"lizard",murenard:"eel",scorpiaf:"scorpion",videgueule:"maw",
    poulpinet:"octopus",ombrelin:"dark",abyssal:"dark",boss_11:"dark",lanternix:"lantern"};
  /* couleur plus franche et un peu plus sombre que la couleur de base du monstre */
  const rich=c=>{const[r,g,b]=rgb(c),y=.3*r+.59*g+.11*b;return[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round((y+(v-y)*1.3)*.94))))};
  /* MP : marge autour du repère 40×40 des monstres, pour que queues, ailes, crêtes et contours ne soient jamais coupés
     (l'image fait 46×46 ; affichée avec scale:1.15 pour garder la même taille de pixel, voir .mpx et framesOf) */
  const MP=3;
  function monster(m){
    const k="m:"+m.id+m.c+(m.crown?1:0);if(cache[k])return cache[k];
    const s=new Spr(40+2*MP,40+2*MP,MP,MP),K=MLOOK[m.id]||"",c=rich(m.c),ink=mix(c,INK,.86),F={flat:1},TAU=Math.PI*2;
    const V=(col,fn,o)=>s.vol(col,fn,o),P=(col,fn,o)=>s.part(col,fn,o),px=(x,y,col)=>s.set(Math.round(x),Math.round(y),col);
    const d1=mix(c,"#2b1842",.3),d2=mix(c,"#1a0c2e",.58),l1=mix(c,"#fff0c0",.42),bel=mix(c,"#fff4dc",.55),W="#ffffff",B="#1c1020",BONE="#f1e4bf",MAW="#2a0c1c",OR="#f2a02c";
    const E={feu:"#ffb22e",eau:"#8feaff",terre:"#ffe14a",air:"#f4f4ff"}[m.el]||"#ffe14a";      /* lueur des yeux selon l'élément */
    let top=14,hx=20,ft=m.ft;                                                                 /* sommet et centre de la tête : attributs et couronne s'y accrochent */
    s.shadow(20+MP,37+MP,12,2);
    /* yeux : 0 = œil blanc à pupille et sourcil froncé (d = côté où le sourcil descend), 1 = lueur dans une orbite sombre, 2 = simple lueur */
    const eye=(x,y,t=0,d=1)=>{
      if(t===0){P(W,q=>q.rect(x,y,3,3),F);px(x,y+1,B);px(x+1,y+1,B);px(x,y+2,B);px(x+1,y+2,B);for(let i=0;i<3;i++)px(x+i,y-1,ink);px(d>0?x+2:x,y,ink)}
      else if(t===1){P(B,q=>q.rect(x,y,4,3),F);px(x+1,y+1,W);px(x+2,y+1,E);px(x+1,y+2,E);px(x+2,y+2,E)}
      else{px(x,y,W);px(x+1,y,E);px(x,y+1,E);px(x+1,y+1,E)}};
    /* gueule sombre garnie de dents */
    const maw=(x,y,w,h=3)=>{P(MAW,q=>q.rect(x,y,w,h),F);for(let i=1;i<w-1;i+=2)px(x+i,y,W);if(h>2)for(let i=2;i<w-1;i+=2)px(x+i,y+h-1,W)};
    /* teinte (rayures, taches) posée sur ce qui est déjà dessiné, limitée à une forme */
    const tint=(col,a,fa,fb)=>{const A=s.msk(fa),C=fb?s.msk(fb):null;for(let i=0;i<A.length;i++)if(A[i]&&(!C||C[i])&&s.p[i])s.p[i]=mix(s.p[i],col,a)};
    const mir=pts=>pts.map(([x,y])=>[40-x,y]);
    const fire=(c1,c2)=>{V(c1,q=>{q.poly([[8,30],[10,20],[13,24],[15,12],[19,18],[21,5],[25,16],[28,11],[30,22],[32,18],[33,30]]);q.ell(20.5,29,12.5,7)},{r:6});
      V(c2,q=>{q.poly([[13,31],[15,22],[18,25],[21,14],[24,24],[27,21],[28,31]]);q.ell(20.5,31,7.5,4.5)},{r:4,sp:0});P("#fff6c8",q=>q.ell(20.5,32.5,4.5,2.5),F);
      P(B,q=>{q.rect(14,26,3,3);q.rect(23,26,3,3);q.rect(18,31,5,2)},F);px(16,26,c2);px(23,26,c2);px(14,27,E);px(23,27,E)};
    /* attributs : oreilles, cornes, antennes, flamme, cristaux (derrière le corps) ; feuilles (devant) */
    const back=()=>{const T0=top;
      if(ft==="ears"){top=Math.max(T0,7);V(c,q=>{q.poly([[hx-9,top+6],[hx-8,top-6],[hx-2,top+2]]);q.poly([[hx+9,top+6],[hx+8,top-6],[hx+2,top+2]])},{r:3});P("#f08a8a",q=>{q.poly([[hx-7,top+3],[hx-7,top-2],[hx-4,top+2]]);q.poly([[hx+7,top+3],[hx+7,top-2],[hx+4,top+2]])},F)}
      if(ft==="horns"){top=Math.max(T0,9);V(BONE,q=>{q.poly([[hx-8,top+5],[hx-12,top-1],[hx-11,top-8],[hx-8,top-3],[hx-3,top+2]]);q.poly([[hx+8,top+5],[hx+12,top-1],[hx+11,top-8],[hx+8,top-3],[hx+3,top+2]])},{r:2})}
      if(ft==="antenna"){top=Math.max(T0,9);P(d2,q=>{q.line(hx-3,top+2,hx-7,top-5);q.line(hx+3,top+2,hx+7,top-5)},F);V("#fff39a",q=>{q.ell(hx-7.5,top-6.5,1.7,1.7);q.ell(hx+7.5,top-6.5,1.7,1.7)},{r:2})}
      if(ft==="flame"){top=Math.max(T0,10);V("#ff6a1c",q=>q.poly([[hx-5,top+4],[hx-4,top-3],[hx-1,top],[hx+1,top-9],[hx+4,top-1],[hx+5,top+4]]),{r:3});P("#ffd84a",q=>q.poly([[hx-2,top+4],[hx,top-3],[hx+2,top+4]]),F)}
      if(ft==="crystal"){top=Math.max(T0,12);V(mix(c,"#d8f6ff",.6),q=>{q.poly([[hx-8,top+4],[hx-6,top-8],[hx-2,top+4]]);q.poly([[hx-1,top+3],[hx+3,top-11],[hx+7,top+3]])},{r:1.6})}top=T0};
    const front=()=>{if(ft==="leaf"){top=Math.max(top,8);P("#3f7d33",q=>q.line(hx,top+1,hx,top-3),F);V("#74c95c",q=>{q.ell(hx-4,top-5,4,2);q.ell(hx+4,top-6,4,2)},{r:2})}};

    if(m.shape==="blob"){
      if(K==="frog"){top=16;ft=ft==="horns"?"":ft;
        V(d1,q=>{q.ell(8,31,4.5,5);q.ell(32,31,4.5,5)});V(c,q=>{q.ell(20,28,13,8.5);q.ell(13,19,4.2,4.2);q.ell(27,19,4.2,4.2)},{r:7});
        V(bel,q=>q.ell(20,32.5,9,3.6),{r:3,sp:0});P(d2,q=>{q.line(9,28,31,28);q.px(8,27);q.px(32,27)},F);
        V(c,q=>{q.ell(9,35.5,4,1.7);q.ell(31,35.5,4,1.7)},{r:2});[6,9,12,28,31,34].forEach(x=>px(x,36,d2));
        if(m.id!=="crapoteux")[[16,24],[23,23],[20,21],[28,25],[11,25]].forEach(([x,y])=>P(m.id==="dendrobulle"?"#1c1020":d2,q=>q.ell(x,y,1.2,.9),F));
        eye(12,18,0,1);eye(26,18,0,-1);if(m.crown)V(BONE,q=>{q.poly([[7,20],[4,12],[9,17]]);q.poly([[33,20],[36,12],[31,17]])},{r:2})}
      else if(K==="bug"){top=15;hx=23;ft=ft==="horns"?"":ft;
        P(d2,q=>{[[14,31,9,36],[20,33,18,37],[27,33,30,37],[32,30,36,36]].forEach(a=>q.line(a[0],a[1],a[2],a[3],2))},F);
        if(m.id==="lucioleux")V("#fff07a",q=>q.ell(32,28,5,5.5),{r:4});
        V(c,q=>{q.ell(23,26,12,10);q.clear(0,34,40,6)},{r:9});P(d2,q=>q.line(22,16,24,33),F);P(mix(c,W,.7),q=>{q.ell(16,20,2.4,1.4);q.px(28,19)},F);
        V(d2,q=>q.ell(10,29,5,4.5),{r:4});V(m.id==="lucioleux"?d2:BONE,q=>q.poly([[8,26],[2,17],[5,16],[11,25]]),{r:2});P(BONE,q=>{q.line(6,31,2,32);q.line(6,33,3,35)},F);eye(8,28,2)}
      else if(K==="fire"){top=8;ft="";fire(c,"#ffd84a")}
      else if(K==="maw"){top=15;hx=23;
        V(d1,q=>{q.poly([[30,24],[38,17],[37,26],[38,34],[30,30]]);q.poly([[18,18],[23,9],[29,18]])},{r:3});back();ft="";V(c,q=>q.ell(20,26,13,10.5),{r:9});V(bel,q=>q.ell(22,33,8,3),{r:2,sp:0});
        V(d1,q=>q.ell(27,29,3.5,2.2),{r:2});maw(5,26,16,5);[6,10,14,18].forEach(x=>px(x,27,W));eye(10,19,1)}
      else if(K==="wool"){top=11;
        P(d2,q=>{q.rect(13,32,3,5);q.rect(24,32,3,5)},F);back();ft="";
        [[20,25,10],[12,19,5],[20,15,5.5],[28,18,5],[32,25,4.5],[28,31,5],[20,32,5],[10,26,4.5]].forEach(([x,y,r],i)=>V(c,q=>q.ell(x,y,r,i?r*.9:8),{r:i?3:6}));
        V("#54424e",q=>{q.ell(13,28,5.5,4.5);q.ell(7,24,2.2,1.4);q.ell(19,23.5,2.2,1.4)},{r:4});px(9,29,"#f0a0a8");px(10,29,"#f0a0a8");eye(10,25,2);eye(15,25,2)}
      else if(K==="fox"){top=13;hx=16;
        V(c,q=>q.poly([[28,33],[35,19],[39,23],[38,33],[32,37]]),{r:4});V("#fff4e0",q=>q.poly([[34,20],[36,17],[39,22],[37,25]]),{r:2});
        V(c,q=>q.ell(23,29,9,7.5),{r:6});V("#fff4e0",q=>q.ell(18,31,4.5,4.5),{r:3,sp:0});V(d2,q=>{q.ell(15,35.5,3.2,1.7);q.ell(25,35.5,3.2,1.7)},{r:2});
        if(m.id==="fennecil"){V(c,q=>{q.poly([[7,19],[3,2],[13,12]]);q.poly([[25,19],[30,2],[19,12]])},{r:3});P("#f08a8a",q=>{q.poly([[7,15],[5,6],[11,13]]);q.poly([[25,15],[28,6],[21,13]])},F);ft=""}
        back();ft="";V(c,q=>{q.ell(16,20,8,6.5);q.poly([[10,19],[3,24],[10,26]])},{r:5});V("#fff4e0",q=>q.poly([[9,23],[3,24.5],[9,27],[15,26]]),{r:2,sp:0});
        px(3,24,B);px(4,24,B);eye(10,17,0,1);eye(17,17,0,-1)}
      else if(K==="mole"){top=17;
        back();ft="";V(c,q=>q.ell(22,27,12.5,9.5),{r:8});V(bel,q=>q.ell(19,32,6,3.5),{r:2,sp:0});V("#f0a0a8",q=>q.poly([[11,23],[3,27],[11,31]]),{r:2});px(3,27,"#c8607a");px(4,27,"#c8607a");
        P(BONE,q=>{[[9,32],[12,33],[15,34],[29,34],[32,33]].forEach(([x,y])=>q.line(x,y,x-2,y+3))},F);P(W,q=>{q.line(8,25,4,23);q.line(8,29,4,31)},F);eye(12,21,2);eye(18,20,2)}
      else if(K==="nut"){top=9;
        V(d1,q=>{q.ell(15,36,3.5,1.5);q.ell(25,36,3.5,1.5)});V(c,q=>{q.ell(20,26,10,10);q.poly([[14,33],[20,37],[26,33]])},{r:8});
        V(mix(c,"#3a2416",.55),q=>{q.ell(20,17,12,7.5);q.clear(0,20,40,20);q.rect(8,19,25,2)},{r:5});P(d2,q=>q.rect(19,6,2,4),F);
        [[12,15],[16,13],[20,12],[24,13],[28,15],[14,17],[18,16],[22,16],[26,17]].forEach(([x,y])=>px(x,y,l1));ft="";eye(13,23,0,1);eye(23,23,0,-1);maw(15,29,10,3)}
      else{top=13;
        V(d1,q=>{q.ell(13,35.5,4.2,1.8);q.ell(27,35.5,4.2,1.8)});back();
        V(c,q=>{q.ell(20,26,12.5,10.5);q.poly([[9,20],[6,14],[13,17]]);q.poly([[14,17],[15,10],[19,15]]);q.poly([[21,15],[25,10],[26,16]]);q.poly([[27,17],[33,13],[31,20]]);q.poly([[8,25],[3,28],[8,30]]);q.poly([[32,25],[37,28],[32,30]])},{r:9});
        V(bel,q=>q.ell(20,32,6.5,3.6),{r:3,sp:0});V(c,q=>{q.ell(6,31,3,3.5);q.ell(34,31,3,3.5)},{r:2});[[4,34],[6,35],[34,35],[36,34]].forEach(([x,y])=>px(x,y,BONE));
        eye(12,21,0,1);eye(22,21,0,-1);maw(13,27,11,3)}}
    else if(m.shape==="slime"){
      if(K==="snail"){top=19;hx=9;const sh=mix(c,"#9a4a2a",.55);
        V(sh,q=>q.ell(25,21,10,10),{r:8});for(let a=0;a<TAU*2.2;a+=.22){const r=8.5-a*.56;px(25+Math.cos(a)*r,21+Math.sin(a)*r,mix(sh,INK,.6))}
        V(c,q=>{q.poly([[3,36],[5,31],[10,28],[34,31],[38,36]]);q.ell(9,25,3.6,6)},{r:4});px(7,28,B);px(8,29,B);px(9,29,B);P(mix(c,W,.6),q=>q.rect(14,33,16,1),F)}
      else if(K==="seal"){top=15;hx=10;ft="";
        V(d1,q=>{q.poly([[31,30],[39,25],[38,31],[39,36],[32,34]])},{r:2});V(c,q=>q.poly([[5,35],[3,24],[7,17],[14,16],[18,21],[28,26],[35,29],[34,35],[12,37]]),{r:7});
        V(bel,q=>q.ell(10,31,5,4),{r:3,sp:0});V(d1,q=>q.poly([[17,30],[25,36],[16,36]]),{r:2});px(4,22,B);px(5,22,B);P(W,q=>{q.line(6,24,2,25);q.line(6,25,3,28)},F);eye(8,19,0,1)}
      else{top=15;back();
        V(c,q=>{q.ell(20,27,14,9.5);q.rect(7,30,27,5);q.rect(9,35,3,2);q.rect(15,35,2,1);q.rect(22,35,4,2);q.rect(30,35,2,1)},{r:9});
        P(mix(c,W,.78),q=>{q.ell(12.5,22,2.8,1.6);q.px(17,19);q.px(18,19);q.px(27,21)},F);P(d1,q=>{q.ell(27,31,2,1.4);q.ell(14,32,1.4,1)},F);
        if(K==="lava"){P("#3a2030",q=>{q.ell(25,23,5,2.4);q.ell(13,28,3,1.6);q.ell(29,30,3,1.8)},F);P("#ffe27a",q=>{q.line(9,31,13,33);q.line(13,33,18,31);q.line(22,33,27,34);q.line(19,24,21,27)},F)}
        P(B,q=>{q.rect(13,25,3,3);q.rect(22,25,3,3)},F);px(13,25,W);px(22,25,W);px(15,24,ink);px(22,24,ink);P(d2,q=>{q.rect(16,31,7,1);q.px(15,30);q.px(23,30)},F)}}
    else if(m.shape==="bird"){
      if(K==="owl"){top=9;
        P(OR,q=>{q.rect(14,35,5,2);q.rect(22,35,5,2)},F);V(d1,q=>{q.ell(9,25,4,9);q.ell(31,25,4,9)},{r:3});back();V(c,q=>q.ell(20,25,10.5,11),{r:8});
        V(bel,q=>q.ell(20,29,6.5,6.5),{r:4,sp:0});[[17,27],[23,27],[20,30],[16,32],[24,32]].forEach(([x,y])=>{px(x,y,d1);px(x+1,y+1,d1);px(x-1,y+1,d1)});
        V(c,q=>q.ell(20,15,10,7.5),{r:6});V(l1,q=>{q.ell(15,15,4.2,4.2);q.ell(25,15,4.2,4.2)},{r:3,sp:0});
        [13,23].forEach(x=>{P(E,q=>q.rect(x+1,14,3,3),F);px(x+2,15,B);px(x+2,16,B);px(x+1,14,W)});P(d2,q=>{q.line(11,11,18,13);q.line(29,11,22,13)},F);V(OR,q=>q.poly([[19,17],[22,17],[20.5,21]]),{r:2})}
      else if(K==="penguin"){top=7;hx=19;
        P(OR,q=>{q.rect(13,35,6,2);q.rect(21,35,6,2)},F);V(d1,q=>{q.poly([[10,18],[4,29],[8,31],[12,24]]);q.poly([[30,18],[36,29],[32,31],[28,24]])},{r:2});
        V(c,q=>{q.ell(20,24,10,12.5);q.ell(19,13,7.5,6.5)},{r:8});V("#f4f6fa",q=>q.ell(19,26,6.5,9),{r:5,sp:0});V("#f4f6fa",q=>q.ell(16,14,4.2,3.2),{r:3,sp:0});
        V(OR,q=>q.poly([[13,14],[6,16.5],[13,19]]),{r:2});px(15,12,B);px(16,12,B);px(15,13,B);px(14,11,ink);px(15,11,ink);px(16,11,ink);px(17,12,ink)}
      else{top=10;hx=13;const fly=K==="fly",roo=K==="rooster",par=K==="parrot";
        if(fly){V(d2,q=>q.poly([[15,19],[18,4],[25,8],[22,21]]),{r:2});V(d1,q=>q.poly([[20,21],[29,5],[38,9],[34,14],[38,17],[32,20],[34,24],[25,26]]),{r:3});P(d2,q=>{q.line(24,19,31,9);q.line(27,21,35,13)},F)}
        if(roo)[[30,27,37,9],[31,27,39,15],[31,28,39,23]].forEach(([a,b,x,y],i)=>V(i%2?d1:mix(c,"#2a4a3a",.6),q=>{q.line(a,b,(a+x)/2+2,(b+y)/2-3,3);q.line((a+x)/2+2,(b+y)/2-3,x,y,2)},{r:2}));
        else V(d1,q=>q.poly(par?[[29,25],[39,27],[39,36],[34,35],[30,31]]:[[29,24],[38,19],[39,24],[37,28],[30,31]]),{r:3});
        P(OR,q=>{q.rect(18,33,2,3);q.rect(24,33,2,3);q.rect(16,36,5,1);q.rect(22,36,5,1)},F);
        V(c,q=>q.ell(22,26,10,8.5),{r:7});V(bel,q=>q.ell(18,30,5.5,4),{r:3,sp:0});back();V(c,q=>q.ell(13,17,6.5,6.5),{r:5});
        if(!fly){V(d1,q=>q.poly([[19,22],[30,21],[34,27],[27,31],[20,29]]),{r:3});P(d2,q=>{q.line(22,25,31,25);q.line(22,27,29,28)},F)}
        if(par)V("#f2c84a",q=>q.poly([[9,14],[3,15],[1,20],[4,23],[9,21]]),{r:2});else V(OR,q=>q.poly([[8,15],[1,18.5],[8,21]]),{r:2});
        if(roo){V("#e83a3a",q=>{q.ell(10,10,2,2.6);q.ell(13.5,8.5,2.2,3.2);q.ell(17,10,2,2.6)},{r:2});V("#e83a3a",q=>q.ell(9,24,1.7,2.6),{r:1.5})}
        if(par||fly)V(K==="fly"?l1:"#f2c84a",q=>{q.poly([[12,11],[14,4],[17,11]]);q.poly([[15,12],[20,6],[19,13]])},{r:2});
        eye(9,14,0,1)}}
    else if(m.shape==="cap"){top=5;const st="#eadfc6";
      V(mix(st,"#2b1842",.25),q=>{q.ell(15,36,3.5,1.5);q.ell(25,36,3.5,1.5)});V(st,q=>{q.ell(8,28,2.6,3.6);q.ell(32,28,2.6,3.6)},{r:2});
      V(st,q=>q.poly([[14,20],[26,20],[29,32],[26,36],[14,36],[11,32]]),{r:7});P(mix(c,"#1a0c2e",.62),q=>q.rect(5,21,31,2),F);for(let x=6;x<35;x+=3)px(x,22,mix(c,W,.25));
      V(c,q=>{q.ell(20,17,17,12);q.clear(0,21,40,20)},{r:10});V("#fff1d8",q=>{q.ell(11,14,2.7,2);q.ell(21,9,3.1,2.3);q.ell(29,15,2.5,1.8);q.ell(16,18.5,1.5,1)},{r:2,sp:0});
      eye(13,25,0,1);eye(23,25,0,-1);maw(16,31,8,3)}
    else if(m.shape==="plant"){const G="#3f8f3a",G2="#5fb548";
      if(K==="cactus"){top=7;
        V(c,q=>{q.rect(5,18,6,4);q.rect(5,10,4,10);q.ell(7,10,2,2);q.rect(29,21,6,4);q.rect(31,13,4,10);q.ell(33,13,2,2)},{r:2.2});
        V(c,q=>{q.rect(13,12,14,25);q.ell(20,12,7,5)},{r:6});P(d1,q=>{q.line(17,10,17,36);q.line(23,10,23,36)},F);
        [[12,15],[12,22],[12,30],[27,17],[27,25],[27,33],[4,13],[9,12],[30,15],[35,16],[20,13],[20,21],[20,34]].forEach(([x,y])=>px(x,y,W));
        V("#ff7aa8",q=>q.ell(20,6,3.6,2.6),{r:2});px(20,6,"#ffe14a");eye(14,17,0,1);eye(22,17,0,-1);maw(15,24,10,3)}
      else if(K==="anemone"){top=5;
        for(let i=0;i<7;i++){const x0=10+i*3.3,x1=x0+Math.sin(i*1.9)*3+(i-3)*1.3,y1=6+(i%2)*3;V(i%2?c:l1,q=>{q.line(x0,24,(x0+x1)/2+(i%2?1.5:-1.5),15,3);q.line((x0+x1)/2+(i%2?1.5:-1.5),15,x1,y1,3)},{r:2});P(W,q=>q.ell(x1+1,y1+.5,1.2,1.2),F)}
        V(mix(c,"#2b1842",.28),q=>q.poly([[11,23],[29,23],[32,36],[8,36]]),{r:7});eye(14,27,0,1);eye(23,27,0,-1);maw(15,32,10,3)}
      else{top=4;hx=17;const clo=K==="clover",pc=clo?c:mix(c,"#fff0f4",.38);
        V(G2,q=>{q.poly([[20,35],[8,28],[2,31],[9,36]]);q.poly([[21,35],[33,28],[38,31],[32,36]])},{r:3});
        P(G,q=>{q.line(15,34,8,26);q.line(8,26,5,21);q.line(5,21,7,18);q.line(26,33,33,24);q.line(33,24,36,19);q.line(36,19,34,16)},F);[[6,24],[9,29],[35,22],[31,28]].forEach(([x,y])=>px(x,y,G2));
        V(G,q=>{q.line(20,36,21,29,3);q.line(21,29,18,22,3)},{r:2});
        if(clo)V(c,q=>{q.ell(9,12,6.5,6.5);q.ell(25,12,6.5,6.5);q.ell(17,5,6,4.5);q.ell(17,20,6.5,5)},{r:5});
        else{[[6,8],[17,2.5],[28,8],[29,18],[23,24],[7,20]].forEach(([x,y],i)=>V(i%2?pc:mix(pc,"#2b1842",.18),q=>q.ell(x,y,4.6,4),{r:3}));V(c,q=>q.ell(17,14,10,9),{r:8})}
        if(clo){V(mix(c,"#2b1842",.25),q=>q.ell(17,13,5.5,5),{r:4});eye(12,10,0,1);eye(19,10,0,-1);maw(13,15,9,3);ft=""}
        else{P(MAW,q=>q.poly([[4,13],[20,11],[23,16],[20,21],[5,20]]),F);[6,9,12,15,18].forEach(x=>{px(x,12.6,W);px(x,13.6,W)});[7,10,13,16,19].forEach(x=>{px(x,19.4,W);px(x,18.4,W)});P("#e8506a",q=>q.ell(14,16.5,4,1.2),F);eye(11,6,2);eye(19,5,2)}}}
    else if(m.shape==="bat"){
      if(K==="bee"){top=19;hx=8;
        V("#dff4ff",q=>{q.ell(19,12,6,4.6);q.ell(27,11.5,6.5,5)},{r:3,sp:0});P("#9ac8e0",q=>{q.line(15,13,23,11);q.line(23,13,32,10)},F);P(d2,q=>q.poly([[33,26],[39,29],[33,31]]),F);
        P(d2,q=>{q.line(13,27,11,33);q.line(17,28,17,34);q.line(22,31,24,35)},F);V(c,q=>q.ell(26,26,9,7),{r:6});tint(B,.85,q=>{q.rect(21,18,2,16);q.rect(26,18,2,16);q.rect(31,18,2,16)},q=>q.ell(26,26,9,7));
        V(mix(c,"#3a2a1a",.5),q=>q.ell(15,23,6,5.5),{r:4});back();ft="";V("#2a1c24",q=>q.ell(8.5,25,4.6,4.6),{r:4});eye(6,23,2);px(5,27,BONE);px(4,28,BONE)}
      else if(K==="dragonfly"){top=17;hx=9;
        V("#dff4ff",q=>{q.poly([[15,19],[20,3],[26,4],[21,20]]);q.poly([[19,20],[31,6],[37,9],[25,21]]);q.poly([[18,24],[30,31],[35,29],[23,22]])},{r:2,sp:0});P("#9ac8e0",q=>{q.line(18,17,22,6);q.line(22,19,33,9);q.line(21,24,32,29)},F);
        V(c,q=>q.line(18,22,37,27,3),{r:2});tint(B,.6,q=>{for(let x=22;x<38;x+=4)q.rect(x,20,1,10)});P(d2,q=>{q.line(13,24,10,30);q.line(16,25,16,31)},F);
        V(c,q=>q.ell(15,21.5,5,4.6),{r:4});back();ft="";V(d1,q=>q.ell(8.5,21.5,4.6,4.6),{r:4});V(E,q=>q.ell(6.5,19.5,2.6,2.6),{r:2});px(6,20,B)}
      else if(K==="book"){top=9;
        V(d1,q=>{q.poly([[9,17],[1,9],[2,20],[5,19],[8,24]]);q.poly(mir([[9,17],[1,9],[2,20],[5,19],[8,24]]))},{r:2});back();ft="";
        V(c,q=>q.poly([[8,13],[32,11],[33,32],[9,35]]),{r:3});P("#f4ead0",q=>q.poly([[10,30],[32,28],[33,32],[9,35]]),F);P("#b8a880",q=>{q.line(10,32,32,30);q.line(10,33,32,31)},F);
        P("#f2c14e",q=>{q.poly([[8,13],[13,13],[8,18]]);q.poly([[32,11],[27,11],[32,16]]);q.rect(19,12,2,17)},F);
        V("#f6f0e6",q=>q.ell(20,19,5,4),{r:3,sp:0});P(E,q=>q.ell(20,19,2.2,2.6),F);P(B,q=>q.rect(20,17,1,5),F);P(ink,q=>q.line(14,15,26,14),F);maw(12,25,17,3)}
      else{top=12;const eag=K==="eagle",wg=[[15,20],[8,9],[1,7],[2,15],[1,24],[5,21],[8,28],[11,24],[14,29]];
        V(eag?c:d1,q=>{q.poly(wg);q.poly(mir(wg))},{r:eag?4:3});
        if(eag){tint("#1a0c2e",.45,q=>{[[2,12,7,26],[5,10,10,27],[9,11,13,27]].forEach(a=>{q.line(a[0],a[1],a[2],a[3]);q.line(40-a[0],a[1],40-a[2],a[3])})});P(BONE,q=>{[[1,24],[5,21],[8,28],[11,24]].forEach(([x,y])=>{q.px(x,y);q.px(40-x,y)})},F)}
        else P(c,q=>{[[15,20,8,9],[8,9,1,7],[9,10,5,21],[10,12,11,24]].forEach(a=>{q.line(a[0],a[1],a[2],a[3]);q.line(40-a[0],a[1],40-a[2],a[3])})},F);
        if(ft!=="antenna"&&ft!=="horns"){V(c,q=>{q.poly([[14,17],[12,6],[18,13]]);q.poly([[26,17],[28,6],[22,13]])},{r:2});P("#f08a8a",q=>{q.poly([[14,14],[13,9],[16,13]]);q.poly([[26,14],[27,9],[24,13]])},F)}
        if(ft==="ears")ft="";back();
        V(c,q=>{q.ell(20,26,6.5,7.5);q.ell(20,18,7,6.5)},{r:6});V(mix(c,W,.25),q=>q.ell(20,27,3.5,4),{r:2,sp:0});P(eag?OR:d2,q=>{q.rect(16,33,3,3);q.rect(22,33,3,3)},F);
        eye(15,15,0,1);eye(22,15,0,-1);if(eag)V(OR,q=>q.poly([[18,19],[23,19],[20.5,24]]),{r:2});else{P(MAW,q=>q.rect(17,21,7,2),F);px(18,22,W);px(22,22,W);px(20,20,ink)}}}
    else if(m.shape==="quad"){top=11;hx=11;const pred=K==="wolf"||K==="tiger";
      if(K==="mouse")P("#e8a0a8",q=>{q.line(33,27,38,23);q.line(38,23,37,17);q.line(37,17,34,15)},F);
      else if(K==="monkey"||K==="tiger")V(c,q=>{q.line(33,24,37,18,2);q.line(37,18,36,11,2);if(K==="monkey")q.line(36,11,32,12,2)},{r:2});
      else if(K==="camel"||K==="goat")V(c,q=>q.line(33,23,36,27,2),{r:2});
      else V(c,q=>q.poly([[32,23],[38,14],[39,20],[36,27]]),{r:3});
      V(d2,q=>{q.rect(17,29,3,8);q.rect(29,29,3,8)},{r:2});
      if(K==="wings"){V(d1,q=>q.poly([[21,20],[19,5],[26,9],[30,4],[33,12],[37,10],[33,22]]),{r:3});P(c,q=>{q.line(21,20,19,5);q.line(22,19,30,4);q.line(24,19,37,10)},F)}
      if(K==="camel")V(c,q=>q.ell(25,18,5.5,5),{r:4});
      V(c,q=>q.ell(23,25,11,6.5),{r:6});V(bel,q=>q.ell(22,29.5,7,2),{r:2,sp:0});
      V(c,q=>{q.rect(13,28,4,9);q.rect(27,28,4,9)},{r:2});P(d2,q=>{q.rect(13,35,4,2);q.rect(27,35,4,2)},F);if(pred)[12,14,16,26,28,30].forEach(x=>px(x,36,BONE));
      if(K==="wolf")V(d1,q=>{q.poly([[15,20],[17,13],[20,19]]);q.poly([[20,20],[23,14],[26,20]]);q.poly([[26,20],[30,15],[31,21]])},{r:2});
      back();V(c,q=>{q.ell(11,18,6.5,6);q.poly([[6,16],[1,19.5],[2,23],[9,24]])},{r:5});
      if(K==="tiger"){tint(B,.8,q=>{[[17,19,16,30],[21,18,20,31],[25,18,25,31],[29,19,30,30],[35,19,38,17],[36,14,38,14]].forEach(a=>q.line(a[0],a[1],a[2],a[3]));q.line(10,12,12,15);q.line(14,12,14,15)});V("#fff4e0",q=>q.poly([[5,21],[2,23],[9,24]]),{r:1.5,sp:0})}
      if(K==="monkey")V(bel,q=>q.ell(8,19.5,4.2,4),{r:3,sp:0});
      if(K==="goat")P(BONE,q=>q.poly([[4,23],[5,29],[8,24]]),F);
      px(1,19,B);px(2,19,B);px(1,20,B);P(d2,q=>q.line(3,22,8,23),F);if(pred){px(4,23,W);px(6,24,W)}
      eye(K==="monkey"?7:8,15,0,1)}
    else if(m.shape==="tall"){
      if(K==="seahorse"){top=5;hx=18;
        V(c,q=>{q.line(22,27,24,32,4);q.ell(20,33,4.6,3.6);q.clear(19,32,3,2)},{r:2});V(mix(c,W,.4),q=>q.poly([[26,15],[34,18],[33,25],[26,27]]),{r:2});P(d1,q=>{q.line(27,18,33,20);q.line(27,22,33,23)},F);
        V(c,q=>q.ell(21,21,6.5,8.5),{r:5});V(bel,q=>q.ell(18.5,22,3,6.5),{r:2,sp:0});[17,20,23,26].forEach(y=>P(d1,q=>q.rect(16,y,5,1),F));
        back();V(c,q=>{q.ell(18,10,5.6,5.2);q.poly([[14,8.5],[4,12],[4,14.5],[14,13.5]])},{r:4});px(4,13,d2);eye(14,8,0,1)}
      else if(K==="robot"){top=4;hx=18;const me="#5a5468";
        V(d1,q=>{q.rect(12,30,6,7);q.rect(22,30,6,7)},{r:2});V(me,q=>{q.rect(11,35,8,2);q.rect(21,35,8,2)},{r:1.5});V(d1,q=>{q.rect(29,17,5,11);q.rect(30,28,4,5)},{r:2});
        V(c,q=>{q.rect(10,16,19,15);q.clear(10,16,1,1);q.clear(28,16,1,1)},{r:4});V(me,q=>q.rect(13,20,9,7),{r:2});px(15,22,E);px(16,22,E);px(19,22,"#e8483c");P(d2,q=>{q.line(14,25,20,25)},F);
        back();V(c,q=>{q.rect(11,5,14,10);q.clear(11,5,1,1);q.clear(24,5,1,1)},{r:3});P(B,q=>q.rect(12,8,11,3),F);px(14,9,E);px(15,9,E);px(14,8,W);px(19,9,E);px(20,9,E);P(me,q=>{q.rect(14,13,7,1);q.rect(17,2,1,3)},F);px(17,1,"#e8483c");
        V(c,q=>{q.rect(4,17,6,10)},{r:2.5});V(me,q=>{q.rect(5,27,4,4);q.poly([[3,31],[6,31],[4,36]]);q.poly([[7,31],[10,31],[9,36]])},{r:1.5});
        [[11,17],[27,17],[11,29],[27,29],[5,18],[23,6]].forEach(([x,y])=>px(x,y,l1));tint("#7a3a1a",.5,q=>{q.ell(25,27,3,2.5);q.ell(13,14,2,1.5);q.ell(7,24,2,2)})}
      else if(K==="bamboo"){top=5;
        P("#5fb548",q=>{q.line(13,20,5,14);q.line(27,24,35,18)},F);V("#74c95c",q=>{q.ell(4,13,3.2,1.6);q.ell(7,17,2.6,1.4);q.ell(36,17,3.2,1.6);q.ell(33,21,2.6,1.4)},{r:1.5});
        V(mix(c,"#2b1842",.3),q=>{q.rect(11,34,8,3);q.rect(21,34,8,3)},{r:1.5});V(c,q=>{q.rect(13,7,14,29);q.clear(13,7,1,1);q.clear(26,7,1,1)},{r:6});
        [15,24,31].forEach(y=>{P(d2,q=>q.rect(13,y,14,1),F);P(l1,q=>q.rect(14,y-1,12,1),F)});eye(15,17,0,1);eye(22,17,0,-1);maw(15,27,10,3)}
      else if(K==="mud"||K==="sand"){top=7;hx=19;const mu=K==="mud";
        V(d1,q=>q.ell(31,24,3.6,7.5),{r:3});back();
        V(c,q=>q.poly(mu?[[3,37],[6,31],[10,27],[11,14],[14,8],[19,5],[24,8],[27,14],[29,27],[33,31],[37,37]]:[[11,25],[11,14],[14,8],[19,5],[24,8],[27,14],[28,25],[25,30],[28,33],[21,37],[16,34],[19,30]]),{r:8});
        V(c,q=>q.ell(8,24,3.8,7.5),{r:3});if(mu){[[6,32],[8,34],[10,31],[30,33],[32,31]].forEach(([x,y])=>{px(x,y,d2)});P(mix(c,W,.5),q=>{q.ell(13,11,2,1.2);q.px(8,19)},F)}
        else{tint(d2,.4,q=>{q.line(12,27,26,25);q.line(18,31,26,31);q.line(17,35,22,35)});[[4,30],[33,29],[8,35],[31,35],[36,33]].forEach(([x,y])=>px(x,y,l1))}
        eye(12,12,1);eye(20,12,1);P(MAW,q=>{q.rect(14,18,9,mu?4:2);q.px(13,17);q.px(23,17)},F);if(mu){px(15,22,d2);px(19,22,d2);px(19,23,d2)}}
      else{top=6;hx=18;const tr=K==="treant";
        if(tr)V(d1,q=>{q.poly([[13,30],[7,37],[13,37],[18,32]]);q.poly([[26,30],[33,37],[26,37],[21,32]]);q.rect(17,31,6,6)},{r:2});
        else{V(d1,q=>{q.rect(13,30,5,7);q.rect(22,30,5,7)},{r:2});V(d2,q=>{q.ell(14,36,4,1.5);q.ell(24,36,4,1.5)},{r:1.5})}
        V(d1,q=>{q.ell(30,23,3.6,8)},{r:3});if(tr)P(d1,q=>{q.line(32,29,36,33);q.line(32,29,34,35);q.line(31,17,36,11)},F);
        V(c,q=>q.ell(20,23,9.5,9.5),{r:7});back();V(c,q=>q.ell(18,12,7,6.5),{r:5});
        V(c,q=>{q.ell(9,23,3.8,8.5);q.ell(8,32,3.6,3)},{r:3});if(tr)P(c,q=>{q.line(6,33,2,36);q.line(8,34,7,37);q.line(7,16,3,10);q.line(5,13,1,13)},F);else[5,7,9].forEach(x=>px(x,35,BONE));
        if(tr){tint(d2,.55,q=>{[[15,18,15,24],[19,20,19,28],[23,17,24,23],[25,26,25,30],[13,27,14,31],[9,20,9,27]].forEach(a=>q.line(a[0],a[1],a[2],a[3]))});eye(12,10,1);eye(19,10,1);P(MAW,q=>{q.poly([[13,15],[23,15],[20,18],[17,16],[15,18]])},F);
          if(m.crown)V("#4f9a3c",q=>{q.ell(11,6,4,3);q.ell(18,3,4.5,3);q.ell(25,6,4,3)},{r:2})}
        else{V(l1,q=>q.ell(19,25,5,5.5),{r:3,sp:0});eye(12,10,0,1);eye(20,10,0,-1);maw(13,15,10,3)}}}
    else if(m.shape==="spiky"){
      if(K==="hedgehog"){top=22;hx=13;ft="";
        V(d1,q=>{for(let i=0;i<11;i++){const a=-Math.PI*(.98-i*.1);q.poly([[23+Math.cos(a-.2)*9,27+Math.sin(a-.2)*7],[23+Math.cos(a)*16,27+Math.sin(a)*14],[23+Math.cos(a+.2)*9,27+Math.sin(a+.2)*7]])}},{r:2});
        V(d1,q=>q.ell(23,27,11,8),{r:6});for(let i=0;i<9;i++){const a=-Math.PI*(.9-i*.1);px(23+Math.cos(a)*14.5,27+Math.sin(a)*12.5,BONE);px(23+Math.cos(a+.15)*7,27+Math.sin(a+.15)*5,BONE)}
        V(bel,q=>{q.ell(12,29,6,5.2);q.poly([[8,27],[2,30.5],[8,33]])},{r:4});V(bel,q=>q.ell(14,23,2,2.2),{r:1.5});px(2,30,B);px(3,30,B);V(d2,q=>{q.ell(13,36,3,1.3);q.ell(27,36,3,1.3)},{r:1.5});eye(8,26,0,1)}
      else if(K==="urchin"){top=12;
        P(d1,q=>{for(let i=0;i<18;i++){const a=TAU*i/18+.1,y=26+Math.sin(a)*15;q.line(20,26,20+Math.cos(a)*17,Math.min(36,y))}},F);for(let i=0;i<18;i++){const a=TAU*i/18+.1,y=26+Math.sin(a)*15;if(y<36)px(20+Math.cos(a)*17,y,l1)}
        V(c,q=>q.ell(20,27,8.5,8),{r:7});eye(14,24,2);eye(22,24,2);P(MAW,q=>q.rect(17,30,6,2),F);px(18,30,W);px(21,30,W)}
      else{top=11;const cry=ft==="crystal",sc=cry?mix(c,"#e4faff",.6):mix(c,"#fff0c0",.3);
        for(let i=0;i<11;i++){const an=-Math.PI*1.12+i*Math.PI*1.24/10;V(i%2?sc:mix(sc,"#2b1842",.2),q=>q.poly([[20+Math.cos(an-.27)*8,26+Math.sin(an-.27)*8],[20+Math.cos(an)*(i%2?17:14.5),26+Math.sin(an)*(i%2?15:12.5)],[20+Math.cos(an+.27)*8,26+Math.sin(an+.27)*8]]),{r:cry?1.4:2})}
        if(cry)ft="";back();V(d1,q=>{q.ell(13,35.5,3.5,1.6);q.ell(27,35.5,3.5,1.6)});V(c,q=>q.ell(20,27,10.5,9.5),{r:8});
        if(ft==="leaf")V("#4f9a3c",q=>q.ell(20,35,15,2.2),{r:1.5});eye(13,23,0,1);eye(23,23,0,-1);maw(14,29,11,3)}}
    else if(m.shape==="golem"){
      if(K==="turtle"){top=13;hx=20;ft="";const sk=mix(c,"#e0e8a0",.5);
        V(mix(sk,"#2b1842",.25),q=>{q.rect(11,31,6,6);q.rect(26,31,6,6)},{r:2});P(sk,q=>q.poly([[34,28],[39,31],[34,32]]),F);
        V(sk,q=>q.ell(7,27,5.2,4.6),{r:4});V(c,q=>{q.ell(22,24,13.5,10.5);q.clear(0,30,40,10)},{r:9});V(mix(c,BONE,.55),q=>q.rect(9,29,27,3),{r:1.5});
        tint(d2,.6,q=>{q.line(15,17,15,28);q.line(22,14,22,28);q.line(29,17,29,28);q.line(11,22,34,22)});eye(4,24,0,1);P(d2,q=>q.line(2,29,6,30),F)}
      else{top=6;hx=18;const mg=K==="magma",gl=mg?(m.id==="charbonnet"?"#ff7a2c":m.id==="obsidien"?"#b48aff":"#ffc23a"):d2;
        V(d1,q=>{q.rect(12,29,7,8);q.rect(22,29,7,8)},{r:2.5});V(d1,q=>{q.ell(33,22,4,7);q.ell(34,31,4.5,4)},{r:3});back();
        V(c,q=>q.poly([[9,14],[14,10],[27,10],[32,15],[30,30],[11,30]]),{r:6});V(mix(c,W,.14),q=>q.poly([[13,5],[23,4],[26,9],[24,14],[14,14],[11,9]]),{r:3});
        V(c,q=>q.ell(6.5,21,4.2,7.5),{r:3.5});V(c,q=>q.poly([[2,27],[10,26],[12,33],[8,36],[2,35]]),{r:3});
        P(gl,q=>{q.line(14,17,17,20);q.line(17,20,16,24);q.line(16,24,19,27);q.line(24,15,26,19);q.line(26,19,24,22);q.line(22,27,25,29);q.line(5,18,7,22);q.line(4,30,8,32)},F);
        if(mg){P(m.id==="obsidien"?"#e9dcff":"#fff2a0",q=>{q.px(17,20);q.px(26,19);q.px(16,24)},F);P(gl,q=>{q.line(14,33,16,35);q.line(24,32,26,35)},F)}
        P(B,q=>q.rect(13,8,11,3),F);px(15,9,E);px(16,9,E);px(15,8,W);px(20,9,E);px(21,9,E);P(MAW,q=>q.rect(15,12,7,1),F)}}
    else if(m.shape==="ghost"){
      if(K==="wisp"){top=8;ft="";fire(c,mix(c,W,.6))}
      else if(K==="cloud"){top=11;back();
        if(m.id==="nuageon")P("#ffe14a",q=>q.poly([[21,31],[17,35],[20,35],[18,39],[24,33],[21,33],[23,31]]),F);else[[12,34],[18,36],[25,35],[30,33]].forEach(([x,y])=>{px(x,y,l1);px(x,y+1,l1)});
        [[11,25,6],[18,19,7.5],[27,21,6.5],[32,27,5],[13,29,5],[22,28,8.5]].forEach(([x,y,r])=>V(c,q=>q.ell(x,y,r,r*.85),{r:r*.8}));eye(13,22,0,1);eye(22,22,0,-1);maw(15,27,9,3)}
      else if(K==="whirl"){top=5;back();
        [[20,9,14,3.6],[21,14,12,3.6],[19,19,9.5,3.4],[21,24,7.5,3.2],[19,28,5.2,2.8],[21,32,3.3,2.3],[20,35.3,1.7,1.5]].forEach(([x,y,a,b],i)=>V(i%2?l1:c,q=>q.ell(x,y,a,b),{r:3}));
        [[4,22],[35,17],[32,30],[7,31],[37,25]].forEach(([x,y])=>px(x,y,d1));eye(13,11,1);eye(21,11,1);P(MAW,q=>q.rect(16,16,6,2),F)}
      else{top=5;hx=18;
        V(d1,q=>q.poly([[26,19],[36,13],[39,16],[30,25]]),{r:2});[[36,12],[38,13],[39,15]].forEach(([x,y])=>px(x,y,BONE));back();
        V(c,q=>q.poly([[9,15],[11,9],[18,5],[25,8],[28,15],[30,25],[37,31],[31,31],[33,36],[26,32],[23,37],[19,31],[14,36],[13,29],[8,31],[10,23]]),{r:8});
        V(c,q=>q.poly([[11,19],[2,16],[1,20],[9,26]]),{r:2.5});[[1,15],[0,18],[1,21]].forEach(([x,y])=>px(x,y,BONE));
        P(mix(c,"#12081e",.82),q=>q.ell(16,14,6.2,5.6),F);eye(12,12,2);eye(18,12,2);px(13,17,E);px(15,18,E);px(17,17,E);px(19,18,E)}}
    else if(m.shape==="snake"){
      if(K==="worm"){top=7;hx=12;const dr=ft==="crystal";
        [[33,33,4.5],[28,30,5],[23,26,5.5],[18,21,5.5],[14,16,5.6]].forEach(([x,y,r])=>V(c,q=>q.ell(x,y,r,r),{r:4}));V(c,q=>q.ell(11,13,6,6),{r:5});
        if(dr){V("#c9ced6",q=>q.poly([[7,9],[0,13],[7,18]]),{r:2});P("#8790a4",q=>{q.line(2,12,6,15);q.line(4,10,7,13)},F);eye(10,8,2);ft=""}
        else{P(MAW,q=>q.ell(8,13.5,3.6,4),F);[[6,10],[9,10],[5,13],[6,17],[9,17],[11,13]].forEach(([x,y])=>px(x,y,W));P("#e83a4a",q=>q.rect(7,13,2,2),F)}
        V(bel,q=>q.ell(21,25,2,1.6),{r:1.5,sp:0})}
      else if(K==="lizard"){top=17;hx=22;
        V(c,q=>{q.line(31,29,37,25,3);q.line(37,25,36,17,2);q.line(36,17,32,15,2)},{r:2});V(d1,q=>{q.rect(15,31,3,5);q.rect(28,31,3,5)},{r:1.5});back();
        V(c,q=>q.ell(22,28,11.5,5.5),{r:5});V(bel,q=>q.ell(21,31.5,8,1.6),{r:1.5,sp:0});V(c,q=>{q.rect(11,31,4,5);q.rect(24,31,4,5)},{r:2});[10,12,14,23,25,27].forEach(x=>px(x,36,BONE));
        V(c,q=>{q.ell(9,25,6,4.8);q.poly([[5,23],[0,26],[5,28]])},{r:4});[[18,25],[23,24],[28,26],[21,28]].forEach(([x,y])=>P("#ffe14a",q=>q.ell(x,y,1.3,1),F));eye(7,22,0,1);P(d2,q=>q.line(1,27,6,28),F)}
      else{top=4;hx=12;
        V(c,q=>q.poly([[31,31],[38,25],[39,28],[34,36]]),{r:2});V(d1,q=>q.ell(22,28,10.5,4.6),{r:4});V(c,q=>q.ell(21,32.5,13,4.5),{r:4});
        if(K==="eel")V(mix(c,W,.35),q=>q.poly([[22,27],[26,13],[21,6],[17,9],[21,16]]),{r:2});
        V(c,q=>q.poly([[15,29],[25,28],[23,18],[18,10],[10,10],[13,18]]),{r:5});P(bel,q=>{[[11,13],[12,16],[13,19],[14,22],[15,25]].forEach(([x,y])=>q.rect(x,y,4,1))},F);
        back();V(c,q=>{q.ell(12,9,6.5,5.2);q.poly([[7,7],[1,10.5],[7,13]])},{r:4});
        P(d2,q=>{[[13,32],[20,33],[27,32]].forEach(([x,y])=>q.poly([[x-2,y],[x,y-1.5],[x+2,y],[x,y+1.5]]))},F);if(K==="eel")[[19,20],[21,24],[17,14]].forEach(([x,y])=>P("#ffe14a",q=>q.ell(x,y,1.2,1),F));
        P(E,q=>q.rect(9,6,3,2),F);px(10,6,B);px(10,7,B);px(9,5,ink);px(10,5,ink);px(11,5,ink);px(12,6,ink);P("#e83a4a",q=>{q.line(2,12,0,14);q.px(0,12)},F);px(4,12,W);px(6,13,W)}}
    else if(m.shape==="crab"){top=17;const sco=K==="scorpion";
      V(d1,q=>{[[10,30,4,33],[4,33,3,37],[11,32,7,35],[7,35,7,37]].forEach(a=>{q.line(a[0],a[1],a[2],a[3],2);q.line(39-a[0],a[1],39-a[2],a[3],2)})},{r:1.5});
      if(sco){[[31,24,3.2],[35,19,3.2],[35,13,3.1],[31,8,2.9],[26,6,2.6]].forEach(([x,y,r])=>V(c,q=>q.ell(x,y,r,r),{r:2.5}));V(BONE,q=>q.poly([[25,5],[20,8],[19,13],[23,9]]),{r:1.5});ft=ft==="horns"?"":ft}
      V(c,q=>{q.line(10,26,6,21,3);q.line(30,26,34,21,3)},{r:2});
      [[6,15],[34,15]].forEach(([x,y],i)=>{V(c,q=>q.ell(x,y,5,5.6),{r:4});P(ink,q=>q.poly(i?[[35,10],[33,16],[34,10]]:[[5,10],[7,16],[6,10]]),F);px(i?34:6,10,BONE)});
      back();V(c,q=>q.ell(20,28,12.5,7.5),{r:6});[[14,25],[20,23],[26,25],[17,29],[24,30]].forEach(([x,y])=>px(x,y,l1));
      P(c,q=>{q.rect(15,19,2,4);q.rect(23,19,2,4)},F);[14,22].forEach(x=>{P(W,q=>q.rect(x,17,3,3),F);px(x,18,B);px(x+1,18,B);px(x,19,B);px(x+1,19,B)});
      if(K==="maw"){maw(11,28,18,4);[13,17,21,25].forEach(x=>px(x,29,W))}else{P(MAW,q=>q.rect(17,30,6,2),F);px(18,31,BONE);px(21,31,BONE);px(11,29,mix(c,"#ff9aa8",.6));px(28,29,mix(c,"#ff9aa8",.6))}}
    else if(m.shape==="jelly"){
      if(K==="octopus"){top=4;
        [[[12,23],[6,28],[3,34],[7,36]],[[15,25],[11,31],[13,36]],[[19,26],[18,32],[21,36]]].forEach((p,i)=>{[p,mir(p).map(([x,y])=>[x+1,y])].forEach(t=>V(i%2?d1:c,q=>{for(let j=0;j+1<t.length;j++)q.line(t[j][0],t[j][1],t[j+1][0],t[j+1][1],3)},{r:2}))});
        [[5,31],[4,34],[12,32],[35,31],[36,34],[28,32],[19,33],[22,33]].forEach(([x,y])=>px(x,y,bel));back();V(c,q=>q.ell(20,15,11.5,11),{r:9});
        [[13,8],[25,7],[28,13],[11,13]].forEach(([x,y])=>P(l1,q=>q.ell(x,y,1.4,1),F));[13,22].forEach((x,i)=>{P(E,q=>q.rect(x,17,4,3),F);P(B,q=>q.rect(x,18,4,1),F);for(let j=0;j<4;j++)px(x+j,16,ink);px(i?x:x+3,17,ink)});P(d2,q=>q.rect(17,23,5,1),F)}
      else{top=5;const dk=K==="dark";
        [9,13,17,22,26,30].forEach((x,i)=>V(i%2?c:d1,q=>{const n=i%2?1:-1;q.line(x,22,x+n,27,2);q.line(x+n,27,x-n,31,2);q.line(x-n,31,x,33+(i%3)*(dk?2:1),2)},{r:1.5}));
        V(l1,q=>{q.line(17,22,16,30,2);q.line(23,22,24,31,2)},{r:1.5});back();
        V(c,q=>{q.ell(20,16,13,11);q.clear(0,23,40,17);[8,13,18,23,28,33].forEach(x=>q.ell(x-.5,22.5,2.6,2))},{r:9});
        P(mix(c,W,.7),q=>{q.ell(13,10,3,1.6);q.px(18,7);q.px(19,7)},F);V(l1,q=>q.ell(20,18,5.5,2.6),{r:2,sp:0});
        if(dk){eye(11,14,1);eye(24,14,1);[[18,11],[20,20],[15,20],[27,19]].forEach(([x,y])=>{px(x,y,E);px(x+1,y,W)})}else{eye(13,14,0,1);eye(23,14,0,-1);P(d2,q=>q.rect(18,19,4,1),F)}}}
    else if(m.shape==="eye"){
      if(K==="lantern"){top=6;const me="#5a5468";ft="";
        P(me,q=>{q.rect(18,2,5,1);q.rect(18,3,1,3);q.rect(22,3,1,3)},F);V(mix(c,W,.3),q=>q.rect(12,11,17,21),{r:5,sp:0});
        V("#ff8a1c",q=>q.poly([[15,30],[16,21],[19,24],[21,14],[24,23],[26,30]]),{r:3});P("#ffe27a",q=>q.poly([[18,30],[20.5,21],[23,30]]),F);P(B,q=>q.rect(19,25,3,3),F);px(19,25,W);
        P(me,q=>{q.rect(12,11,1,21);q.rect(28,11,1,21)},F);V(me,q=>q.poly([[11,11],[15,6],[25,6],[29,11]]),{r:2});V(me,q=>q.poly([[11,31],[29,31],[31,35],[9,35]]),{r:2})}
      else{top=8;
        V(d1,q=>{[13,18,23,27].forEach((x,i)=>q.line(x,31,x+(i%2?1:-1),35+(i%2),2))},{r:1.5});
        if(ft==="none"||!ft){P(d1,q=>{q.line(12,12,8,5);q.line(20,9,20,2);q.line(28,12,32,5)},F);[[8,4],[20,1.5],[32,4]].forEach(([x,y])=>{V("#f6f0e6",q=>q.ell(x,y,2,2),{r:2,sp:0});px(x-1,y,B)})}
        back();V(c,q=>q.ell(20,21,12.5,12),{r:10});V("#f6f0e6",q=>q.ell(18,21.5,8,7),{r:6,sp:0});[[23,18],[24,19],[25,24],[12,26],[13,27]].forEach(([x,y])=>px(x,y,"#e8607a"));
        V(mix(E,c,.25),q=>q.ell(15.5,22,4.2,4.4),{r:3});P(B,q=>q.ell(15,22,1.1,3.2),F);px(17,19,W);px(17,20,W);
        tint(d2,.75,q=>q.poly([[6,10],[34,10],[34,15],[20,17],[8,19]]),q=>q.ell(20,21,12.5,12));P(ink,q=>q.line(9,18,26,15),F)}}
    front();
    if(m.crown){top=Math.max(top,8);V("#f7c948",q=>{q.rect(hx-6,top-3,13,3);q.rect(hx-6,top-6,2,3);q.rect(hx-1,top-7,3,4);q.rect(hx+5,top-6,2,3)},{r:2});px(hx,top-2,"#e8483c");px(hx-4,top-2,"#5ad0e0");px(hx+4,top-2,"#5ad0e0")}
    s.outline(ink);s.pad=MP;SPR[k]=s;return cache[k]=s.url()}

  function monFrames(m,anim){const k="m:"+m.id+m.c+(m.crown?1:0);if(!SPR[k])monster(m);return framesOf(k,SPR[k],anim,false)}
  Object.assign(PX,{monster,monFrames})})();
