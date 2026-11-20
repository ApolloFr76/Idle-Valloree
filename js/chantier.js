/* ---------- Zones de métiers & chantiers (onglet Métiers) ----------
   60 zones pixel art uniques (5 métiers × 12 ressources), chacune ancrée dans le biome associé
   à son palier (Prairie, Bois, Marais, Mines, Dunes, Givre, Falaises, Jungle, Récifs, Volcan,
   Ruines, Abîme), avec ciel dégradé, horizon en profondeur, nœuds de récolte propres à chaque
   matériau, atmosphère animée, héros actif et ouvriers (js/ouvriers.js). */
const SITE=(()=>{
  const{Spr,prop,rng,rgb,mix,LIGHT,DARK,INK}=PX.kit;
  const W=320,H=112,HOR=42,FEET=92;
  const cache={};
  let previewRid=null;

  /* 12 biomes (indexés par palier 0..11 = ZONES[0..11]) : ciel, horizon, sol, chemin, eau, atmosphère */
  const BIO=[
    {id:"prairie",sky:["#4898e8","#86cdfa","#d8f2ff"],hill:["#7ca6cf","#58886a"],g:["#66a846","#78bc52","#54923c","#447a34"],path:"#c4a268",water:"#4286d8",w2:"#8cd0ff",atm:"cloud",ac:"#ffffff"},
    {id:"bois",sky:["#1a3846","#2e5e60","#6ea686"],hill:["#244c44","#1c3e36"],g:["#386c48","#467e54","#2e5c3e","#224832"],path:"#786244",water:"#2f6c64",w2:"#84d4b0",atm:"firefly",ac:"#d6ff78"},
    {id:"marais",sky:["#2e4648","#54746a","#8ba684"],hill:["#3a564c","#2d463c"],g:["#4e6e42","#5e7e4a","#425e38","#324a2e"],path:"#686042",water:"#346c68",w2:"#7eb898",atm:"mist",ac:"#c8e8b8"},
    {id:"mines",sky:["#1e1a28","#2e283c","#443c54"],hill:["#362f46","#282236"],g:["#544c62","#625872","#463f54","#383244"],path:"#786452",water:"#385a88",w2:"#88c8ff",atm:"spark",ac:"#ffd86a",cave:1},
    {id:"dunes",sky:["#c85a2c","#f09848","#ffe098"],hill:["#d68448","#c46c36"],g:["#e0b264","#ecc274","#cf9c52","#b68440"],path:"#f4d89a",water:"#2aa4b8",w2:"#9cf0f8",atm:"sand",ac:"#fff0b8"},
    {id:"givre",sky:["#264878","#5c8ec4","#c4e4f8"],hill:["#7aa4cc","#a6cce8"],g:["#d8ebf8","#edf6ff","#bed8ec","#9ec0dc"],path:"#b4cfe4",water:"#4a92d0",w2:"#dff6ff",atm:"snow",ac:"#ffffff"},
    {id:"falaises",sky:["#222c44","#40506e","#788ca4"],hill:["#4a5870","#384458"],g:["#6c8678","#7e9888","#5c7468","#4a6056"],path:"#9a8e7a",water:"#386898",w2:"#b8dcf4",atm:"rain",ac:"#cfe4ff"},
    {id:"jungle",sky:["#206c64","#4ca888","#a8e2a0"],hill:["#246646","#1c5236"],g:["#348e42","#44a44e","#2a7836","#20602c"],path:"#867248",water:"#269688",w2:"#8cf0d4",atm:"spore",ac:"#d2ff7a"},
    {id:"recifs",sky:["#2296d8","#68ccf0","#d8f8ff"],hill:["#2ca8c8","#2288a8"],g:["#ecd69a","#f6e4b2","#dcc282","#c8aa68"],path:"#fff2cc",water:"#24b4d8",w2:"#aef8ff",atm:"bubble",ac:"#e8ffff"},
    {id:"volcan",sky:["#281014","#6c2218","#c84e22"],hill:["#461c1a","#321618"],g:["#443438","#523e42","#382a2e","#2a2024"],path:"#6a483c",water:"#ff621c",w2:"#ffe05a",atm:"ember",ac:"#ffaa38"},
    {id:"ruines",sky:["#161838","#2e2e62","#5e5896"],hill:["#464272","#36325a"],g:["#9a92b4","#aba2c6","#8880a2","#726a8c"],path:"#cbc2de",water:"#4864b8",w2:"#b6f0ff",atm:"star",ac:"#c8e8ff"},
    {id:"abime",sky:["#120822","#281248","#542080"],hill:["#361858","#241040"],g:["#342652","#423064","#2a1e44","#201636"],path:"#584280",water:"#9a2cc4",w2:"#ff78e8",atm:"void",ac:"#e878ff"}
  ];

  /* Palettes des 12 matériaux par métier (harmonisées avec PX.res) */
  const WOOD_PAL=[
    {tr:"#a68052",lv:"#54a446",ac:"#84d464",sty:"ash"},
    {tr:"#845430",lv:"#3a7e44",ac:"#c87c42",sty:"chestnut"},
    {tr:"#5c4028",lv:"#4a703c",ac:"#7aa454",sty:"swamp"},
    {tr:"#7a5432",lv:"#4e7a4c",ac:"#ffd468",sty:"oak"},
    {tr:"#945630",lv:"#d84c28",ac:"#ff9a3c",sty:"maple"},
    {tr:"#4c3424",lv:"#2c5c48",ac:"#e83c3c",sty:"yew"},
    {tr:"#e6dfd0",lv:"#5a9a58",ac:"#2c2430",sty:"birch"},
    {tr:"#8e4234",lv:"#f28eb6",ac:"#ffd8e8",sty:"cherry"},
    {tr:"#745e46",lv:"#468c58",ac:"#78c890",sty:"elm"},
    {tr:"#3a2c2c",lv:"#c84624",ac:"#ffb83c",sty:"ember"},
    {tr:"#282436",lv:"#7898c8",ac:"#d2ecff",sty:"ebony"},
    {tr:"#6a2c44",lv:"#8a38b8",ac:"#ff78e8",sty:"sequoia"}
  ];
  const ORE_PAL=[
    {rk:"#767084",v:"#c4ccd8",hi:"#ffffff",sty:"chunk"},
    {rk:"#6c5c54",v:"#e4843e",hi:"#56c8a8",sty:"copper"},
    {rk:"#58666e",v:"#d4dce4",hi:"#ffffff",sty:"strata"},
    {rk:"#524c64",v:"#eef4fc",hi:"#ffffff",sty:"silver"},
    {rk:"#b4703c",v:"#ffd244",hi:"#fff8c2",sty:"gold"},
    {rk:"#7ea8cc",v:"#3268e8",hi:"#98d0ff",sty:"crystal"},
    {rk:"#647082",v:"#98b8c8",hi:"#e6f8ff",sty:"geode"},
    {rk:"#524454",v:"#c86898",hi:"#ffbae0",sty:"nodule"},
    {rk:"#a4583c",v:"#e07244",hi:"#ffd2a8",sty:"bauxite"},
    {rk:"#3c2e34",v:"#f2f8ff",hi:"#ff9838",sty:"platinum"},
    {rk:"#76729a",v:"#68f0e4",hi:"#ffffff",sty:"mithril"},
    {rk:"#2a1c42",v:"#7a38c8",hi:"#ff68e0",sty:"obsidian"}
  ];
  const CROP_PAL=[
    {st:"#9e7a3c",hd:"#f2ce50",ac:"#fff0a0",sty:"wheat"},
    {st:"#8e763e",hd:"#dec068",ac:"#fff4c2",sty:"barley"},
    {st:"#7a7242",hd:"#e8d896",ac:"#fff6d0",sty:"oat"},
    {st:"#5a422c",hd:"#6ab444",ac:"#b8f074",sty:"hop"},
    {st:"#8e6232",hd:"#cf9844",ac:"#ffe098",sty:"rye"},
    {st:"#488a60",hd:"#6cb4f8",ac:"#fff2a0",sty:"flax"},
    {st:"#4a9238",hd:"#ffd438",ac:"#ffaa28",sty:"corn"},
    {st:"#5e8c3e",hd:"#e4b86e",ac:"#fff0b8",sty:"millet"},
    {st:"#5a9c46",hd:"#f8f4e8",ac:"#9ef0f8",sty:"rice"},
    {st:"#a83e3e",hd:"#fff2e8",ac:"#ff9a3c",sty:"buckwheat"},
    {st:"#8c7656",hd:"#dcb064",ac:"#a8e4ff",sty:"spelt"},
    {st:"#5c2c66",hd:"#e84890",ac:"#ffc8ff",sty:"quinoa"}
  ];
  const HERB_PAL=[
    {st:"#2e782c",fl:"#56b446",ac:"#a8f078",sty:"nettle"},
    {st:"#6a8e7a",fl:"#98bea8",ac:"#c098f0",sty:"sage"},
    {st:"#2c7a56",fl:"#42d48e",ac:"#b8ffe0",sty:"mint"},
    {st:"#4c8a36",fl:"#9ee054",ac:"#fff478",sty:"balm"},
    {st:"#4c7e50",fl:"#f6f8ff",ac:"#ffd44a",sty:"edelweiss"},
    {st:"#b88856",fl:"#b664d8",ac:"#e8b8ff",sty:"mandrake"},
    {st:"#487c4a",fl:"#926af0",ac:"#dcc8ff",sty:"lavender"},
    {st:"#745034",fl:"#68b448",ac:"#ffe898",sty:"thyme"},
    {st:"#385838",fl:"#5c2a8e",ac:"#d098ff",sty:"belladonna"},
    {st:"#d8aa54",fl:"#e83c3c",ac:"#ffd268",sty:"ginseng"},
    {st:"#3a824e",fl:"#ff72c8",ac:"#ffe878",sty:"orchid"},
    {st:"#2a6864",fl:"#ff88cc",ac:"#fff2a8",sty:"lotus"}
  ];
  const PIER_PAL=["#9a6a3c","#6a4a2c","#584c36","#7c5a3c","#c49254","#b8dcf0","#687284","#8a6c3c","#e0c48a","#3e2e36","#b8b0cc","#4c2e76"];

  function ellipseFill(s,cx,cy,rx,ry,fn){
    for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){
      const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<1)fn(x,y,d);
    }
  }

  /* Fond de biome (ciel dégradé, astres, reliefs, décor d'arrière-plan, sol texturé) */
  function drawBiomeBase(s,b,r,t){
    const G=b.g.map(rgb),sk0=rgb(b.sky[0]),sk1=rgb(b.sky[1]),sk2=rgb(b.sky[2]);
    /* Ciel dégradé avec léger tramage pixel art */
    for(let y=0;y<HOR;y++){
      const p=y/(HOR-1),c=p<.55?mix(sk0,sk1,p/.55):mix(sk1,sk2,(p-.55)/.45);
      for(let x=0;x<W;x++){
        const d=((x+y)&1)&&y>1&&y<HOR-1?mix(c,p<.55?sk1:sk2,.08):c;
        s.p[y*W+x]=d;
      }
    }

    /* Éléments célestes / voûte selon le biome */
    if(b.id==="prairie"){
      ellipseFill(s,266,14,10,10,(x,y,d)=>s.set(x,y,d<.55?"#fff8c8":"#ffd860"));
    }else if(b.id==="bois"){
      ellipseFill(s,258,13,8,8,(x,y)=>s.set(x,y,"#f4f2cc"));
      ellipseFill(s,262,11,7,7,(x,y)=>s.set(x,y,sk0));
      for(let i=0;i<16;i++)s.set(r()*W|0,2+(r()*18|0),"#d8f0c8");
    }else if(b.id==="marais"){
      ellipseFill(s,244,15,9,9,(x,y,d)=>s.set(x,y,d<.6?"#e8f4d0":"#9ab898"));
    }else if(b.id==="mines"){
      /* Voûte rocheuse + stalactites + poutres de mine */
      for(let x=0;x<W;x++){
        const d=6+Math.round(5*Math.abs(Math.sin(x*.09))+4*Math.sin(x*.23+1));
        for(let y=0;y<d;y++)s.set(x,y,y>d-2?"#3e364e":"#262034");
      }
      for(let x=36;x<W;x+=88){
        for(let y=0;y<HOR+4;y++){s.set(x,y,"#5c3e26");s.set(x+1,y,"#745032");s.set(x+2,y,"#442c1a")}
        s.blit(prop.lantern(r),x-2,10);
      }
    }else if(b.id==="dunes"){
      ellipseFill(s,250,18,14,14,(x,y,d)=>s.set(x,y,d<.45?"#fff6cc":d<.78?"#ffd25a":"#ff9a3c"));
    }else if(b.id==="givre"){
      /* Aurore boréale ondulante */
      for(let x=20;x<W-20;x++){
        const y0=Math.round(12+4*Math.sin(x*.045)+2*Math.cos(x*.11));
        for(let k=0;k<6;k++)if((x+k)%2===0)s.set(x,y0+k,k<2?"#84ffd8":k<4?"#78c8ff":"#a48aff");
      }
    }else if(b.id==="falaises"){
      /* Nuages d'orage lourds + lueur d'éclair lointaine */
      for(let i=0;i<7;i++){
        const cx=20+i*48,cy=10+(i%2)*5;
        ellipseFill(s,cx,cy,22,7,(x,y,d)=>s.set(x,y,d<.5?"#36425a":"#52627e"));
      }
      s.part("#fff498",q=>{q.line(238,14,234,24);q.line(234,24,239,24);q.line(239,24,233,36)},{flat:1});
    }else if(b.id==="jungle"){
      /* Cascade lointaine et brume tropicale */
      for(let y=18;y<HOR;y++){s.set(248,y,"#a8f4ff");s.set(249,y,"#ffffff");s.set(250,y,"#78e4e8");s.set(251,y,"#d8fcff")}
    }else if(b.id==="recifs"){
      ellipseFill(s,62,13,9,9,(x,y,d)=>s.set(x,y,d<.6?"#fff8d0":"#ffe07a"));
      /* Mer turquoise à l'horizon */
      for(let y=HOR-8;y<HOR;y++)for(let x=0;x<W;x++)s.set(x,y,(x+y*3)%11===0?"#aef8ff":"#26b0d8");
    }else if(b.id==="volcan"){
      /* Grand cône volcanique fumant + coulées de lave */
      s.part("#34181a",q=>q.poly([[186,HOR],[224,8],[242,8],[280,HOR]]),{flat:1});
      s.part("#ff681c",q=>{q.rect(225,8,16,3);q.line(232,11,222,HOR);q.line(235,11,246,HOR)},{flat:1});
      s.part("#ffe05a",q=>{q.rect(228,8,10,2);q.line(233,10,224,HOR-6)},{flat:1});
    }else if(b.id==="ruines"){
      /* Nuit étoilée + double lune + colonnes antiques */
      for(let i=0;i<36;i++)s.set(r()*W|0,2+(r()*(HOR-10)|0),i%3?"#e4ecff":"#ffe89a");
      ellipseFill(s,256,14,9,9,(x,y,d)=>s.set(x,y,d<.65?"#f6f8ff":"#b6d0ff"));
      ellipseFill(s,234,19,4,4,(x,y)=>s.set(x,y,"#ffd898"));
    }else if(b.id==="abime"){
      /* Faille cosmique violet-magenta + îlots flottants */
      for(let i=0;i<40;i++)s.set(r()*W|0,2+(r()*(HOR-8)|0),i%2?"#e88aff":"#84d4ff");
      for(let x=110;x<220;x++){
        const dy=Math.round(16+5*Math.sin((x-110)*.055));
        for(let k=-2;k<=2;k++)s.set(x,dy+k,Math.abs(k)<1?"#ffd8ff":Math.abs(k)===1?"#d848ff":"#6c20a8");
      }
      s.part("#261442",q=>q.poly([[52,20],[68,17],[62,28]]));
      s.part("#261442",q=>q.poly([[260,16],[278,13],[270,25]]));
    }

    /* 2 plans d'horizon en parallaxe */
    if(!b.cave){
      const h0=rgb(b.hill[0]),h1=rgb(b.hill[1]);
      for(let x=0;x<W;x++){
        let a=8+6*Math.sin(x*.026+t)+3*Math.cos(x*.065);
        let c=5+4*Math.sin(x*.042+t*2+1.2);
        if(b.id==="dunes"){a=7+6*Math.sin(x*.022+1);c=4+5*Math.sin(x*.033+2.8)}
        if(b.id==="givre"||b.id==="falaises"||b.id==="volcan"){a=12+10*Math.abs(Math.sin(x*.032+t));c=7+6*Math.abs(Math.cos(x*.05+1))}
        if(b.id==="recifs"){a=3+2*Math.sin(x*.04);c=2+Math.sin(x*.07)}
        for(let y=Math.max(2,HOR-Math.round(a));y<HOR;y++)s.set(x,y,h0);
        for(let y=Math.max(4,HOR-Math.round(c));y<HOR;y++)s.set(x,y,h1);
      }
      if(b.id==="givre"){
        for(let x=0;x<W;x++){
          const pk=HOR-Math.round(12+10*Math.abs(Math.sin(x*.032+t)));
          for(let y=Math.max(2,pk);y<Math.min(HOR,pk+5);y++)s.set(x,y,"#f2faff");
        }
      }
      if(b.id==="ruines"){
        for(let i=0;i<5;i++)s.blit(prop.pillar(r,"#bfb6d8"),18+i*66,HOR-14-(i%2)*4);
      }
      if(b.id==="prairie"){
        /* Petit moulin lointain sur la colline */
        s.part("#8e6c54",q=>q.poly([[42,HOR-4],[45,HOR-14],[49,HOR-14],[52,HOR-4]]),{flat:1});
        s.part("#f2e4c4",q=>{q.line(40,HOR-18,54,HOR-8);q.line(54,HOR-18,40,HOR-8)},{flat:1});
      }
    }

    /* Sol principal texturé avec dégradé de profondeur */
    for(let y=HOR;y<H;y++){
      const p=(y-HOR)/(H-HOR),base=p<.4?G[0]:p<.78?G[2]:G[3];
      for(let x=0;x<W;x++)s.p[y*W+x]=base;
    }
    for(let x=0;x<W;x++)s.set(x,HOR,mix(G[3],DARK,.35));
    /* Motifs de sol spécifiques (ondulations de sable, fissures de lave, cristaux, herbes) */
    if(b.id==="dunes"){
      for(let y=HOR+6;y<H-8;y+=9)for(let x=0;x<W;x++){
        const yy=y+Math.round(2*Math.sin(x*.05+y));
        if(yy>HOR&&yy<H){s.set(x,yy,G[1]);s.set(x,yy+1,G[3])}
      }
    }else if(b.id==="volcan"){
      for(let i=0;i<5;i++){
        let cx=22+i*66,cy=HOR+12+(i%2)*14;
        for(let k=0;k<20;k++){s.set(cx+k,cy+Math.round(Math.sin(k*.4)*2),k%3?"#ff5e1a":"#ffd04a")}
      }
    }else if(b.id==="abime"){
      for(let i=0;i<6;i++){
        let cx=16+i*54,cy=HOR+14+(i%2)*18;
        for(let k=0;k<16;k++)s.set(cx+k,cy+Math.round(Math.cos(k*.5)*2),k%2?"#9834e8":"#ff70e8");
      }
    }else{
      for(let i=0;i<420;i++){
        const x=r()*W|0,y=HOR+2+(r()*(H-HOR-4)|0),c=G[1+(i%3)];
        s.set(x,y,c);if(i%2)s.set(x+1,y,c);
      }
    }
    /* Petits accessoires d'ambiance en fond (cactus, coraux, cristaux, champignons, os) */
    for(let i=0;i<4;i++){
      const x=14+i*78+(r()*22|0),y=HOR+4+(r()*8|0);
      if(b.id==="dunes")s.blit(prop.cactus(r,"#4c9648"),x,y-8);
      else if(b.id==="givre")s.blit(prop.crystal(r,"#a6e2ff"),x,y-6);
      else if(b.id==="recifs")s.blit(prop.coral(r,i%2?"#ff7a92":"#b888ff"),x,y-5);
      else if(b.id==="marais")s.blit(prop.reed(r,"#6a9442"),x,y-8);
      else if(b.id==="bois")s.blit(prop.mushroom(r,"#d8544c"),x,y);
      else if(b.id==="mines")s.blit(prop.crystal(r,i%2?"#9a8ae8":"#f2a854"),x,y-6);
      else if(b.id==="abime")s.blit(prop.crystal(r,i%2?"#c464ff":"#ff68b8"),x,y-6);
      else if(b.id==="volcan")s.blit(prop.rock(r,"#4e3c42"),x,y);
    }
  }

  /* Arbre sur mesure selon l'essence (12 espèces distinctes pour le Bûcheron) */
  function customTree(r,p){
    const s=new Spr(38,48),tr=p.tr,lv=p.lv,ac=p.ac,sty=p.sty;
    if(sty==="yew"||sty==="ebony"){
      /* Conifère / cyprès élancé (enneigé pour l'If, lunaire pour l'Ébène) */
      s.part(tr,q=>q.rect(16,33,6,13));
      s.part(lv,q=>{q.poly([[19,2],[10,16],[28,16]]);q.poly([[19,10],[7,26],[31,26]]);q.poly([[19,19],[5,36],[33,36]])},{dk:.42});
      if(sty==="yew"){
        s.part("#eef8ff",q=>{q.poly([[19,2],[14,9],[24,9]]);q.rect(9,24,6,2);q.rect(23,24,6,2);q.rect(7,34,7,2);q.rect(24,34,7,2)},{flat:1});
        for(let i=0;i<6;i++)s.set(12+(r()*14|0),14+(r()*18|0),ac);
      }else{
        for(let i=0;i<8;i++)s.set(11+(r()*16|0),10+(r()*22|0),ac);
      }
    }else if(sty==="birch"){
      /* Bouleau blanc élancé à écorce striée de noir */
      s.part(tr,q=>{q.rect(16,20,5,26);q.line(18,24,11,16,2);q.line(19,22,26,15,2)});
      for(let y=23;y<44;y+=4)s.part(ac,q=>q.rect(16+(y%2),y,3,1),{flat:1});
      s.part(lv,q=>{q.ell(19,12,12,8);q.ell(10,16,6,5);q.ell(28,15,6,5)},{lt:.35,dk:.38});
    }else if(sty==="sequoia"){
      /* Tronc colossal de séquoia abyssal avec veines lumineuses */
      s.part(tr,q=>{q.rect(12,16,14,30);q.poly([[8,46],[12,38],[26,38],[30,46]])});
      s.part(ac,q=>{q.line(18,18,16,44);q.line(21,22,22,42)},{flat:1});
      s.part(lv,q=>{q.ell(19,12,16,9);q.ell(9,16,7,6);q.ell(29,16,7,6)},{lt:.3,dk:.45});
      for(let i=0;i<10;i++)s.set(6+(r()*26|0),6+(r()*14|0),ac);
    }else if(sty==="swamp"||sty==="elm"){
      /* Arbre large et noueux à branches tombantes / lianes */
      s.part(tr,q=>{q.rect(15,26,8,20);q.poly([[11,46],[15,40],[23,40],[27,46]])});
      s.part(lv,q=>{q.ell(19,17,15,9);q.ell(9,21,7,5);q.ell(29,21,7,5)},{dk:.42});
      for(let x=8;x<=30;x+=5)s.part(ac,q=>q.rect(x,24,1,6+(r()*5|0)),{flat:1});
    }else{
      /* Feuillu généreux (Frêne, Châtaignier, Chêne, Érable rouge, Merisier rose, Charme ardent) */
      s.part(tr,q=>{q.rect(15,27,7,19);q.rect(13,44,11,2)});
      s.part(lv,q=>{q.ell(19,17,14,10);q.ell(9,21,7,6);q.ell(29,21,7,6);q.ell(19,9,9,6)},{lt:.35,dk:.4});
      for(let i=0;i<22;i++){
        const x=7+(r()*24|0),y=6+(r()*20|0);
        if(s.get(x,y))s.set(x,y,i%3?ac:mix(lv,LIGHT,.45));
      }
    }
    return s.outline(mix(lv,INK,.8));
  }

  /* Gisement sur mesure selon le minerai (12 formations distinctes pour le Mineur) */
  function drawOreNode(s,x,y,p,r){
    const F={flat:1};
    if(p.sty==="crystal"||p.sty==="mithril"||p.sty==="obsidian"){
      /* Socle + grandes pointes cristallines / lames d'obsidienne */
      s.part(p.rk,q=>q.poly([[x-18,y+4],[x-14,y-8],[x+14,y-8],[x+18,y+4]]));
      s.part(p.v,q=>{
        q.poly([[x-12,y-2],[x-15,y-18],[x-6,y-22],[x-3,y-2]]);
        q.poly([[x-2,y-2],[x+1,y-28],[x+8,y-20],[x+6,y-2]]);
        q.poly([[x+7,y-2],[x+14,y-19],[x+17,y-10],[x+12,y-2]]);
      },{lt:.6});
      s.part(p.hi,q=>{q.line(x+1,y-26,x+1,y-10);q.line(x-12,y-17,x-9,y-8);q.px(x+14,y-18)},F);
    }else if(p.sty==="geode"||p.sty==="nodule"){
      /* Gros bloc rond fendu révélant un cœur cristallin ou rubané */
      s.part(p.rk,q=>q.ell(x,y-8,18,13));
      s.part(mix(p.rk,DARK,.5),q=>q.ell(x,y-8,11,8),F);
      s.part(p.v,q=>{q.ell(x-3,y-9,5,4);q.ell(x+4,y-7,5,4);q.rect(x-6,y-11,12,2)},{lt:.6});
      s.set(x-3,y-11,p.hi);s.set(x+4,y-9,p.hi);
    }else if(p.sty==="strata"){
      /* Rocher en strates horizontales d'étain */
      s.part(p.rk,q=>q.poly([[x-19,y+3],[x-16,y-15],[x+16,y-17],[x+19,y+3]]));
      s.part(p.v,q=>{q.rect(x-14,y-13,28,3);q.rect(x-15,y-6,30,3)},{lt:.5});
      s.part(p.hi,q=>{q.rect(x-11,y-13,6,1);q.rect(x+2,y-6,8,1)},F);
    }else{
      /* Massif rocheux naturel constellé de filons / pépites */
      s.part(p.rk,q=>q.poly([[x-20,y+4],[x-16,y-14],[x-4,y-21],[x+11,y-18],[x+20,y-5],[x+18,y+4]]));
      for(let k=0;k<7;k++){
        const vx=x-12+(r()*24|0),vy=y-15+(r()*13|0);
        s.part(p.v,q=>q.rect(vx,vy,4,3),{lt:.55});
        s.set(vx,vy,p.hi);
      }
      if(p.sty==="copper")s.part(p.hi,q=>{q.rect(x-10,y-4,5,2);q.rect(x+6,y-12,4,2)},F);
      if(p.sty==="platinum")s.part("#ff641c",q=>{q.line(x-12,y+2,x+10,y+2)},F);
    }
  }

  /* Champ / plantation sur mesure selon la culture (12 cultures distinctes pour le Paysan) */
  function drawCropField(s,b,p,r){
    const F={flat:1};
    /* Rizières inondées pour le Riz (Récifs) */
    if(p.sty==="rice"){
      for(let row=0;row<3;row++){
        const y0=HOR+12+row*14;
        for(let y=y0;y<y0+10;y++)for(let x=10;x<W-10;x++)s.set(x,y,(x+y)%13===0?"#aef8ff":"#36b6d4");
        for(let x=10;x<W-10;x++)s.set(x,y0-1,"#c8b07a");
      }
    }else if(p.sty==="rye"){
      /* Canaux d'irrigation d'oasis dans le sable */
      for(let y=HOR+24;y<HOR+29;y++)for(let x=0;x<W;x++)s.set(x,y,(x+y)%9===0?"#9cf0f8":"#2ea4b8");
    }
    /* Sillons + plants */
    for(let row=0;row<4;row++){
      const y=HOR+14+row*11;
      for(let x=12;x<W-12;x+=p.sty==="hop"?16:p.sty==="corn"?10:7){
        const j=(r()*3|0)-1,px=x+j,py=y+(r()*2|0);
        if(p.sty==="hop"){
          /* Treillis de houblon */
          s.part(p.st,q=>q.rect(px,py-16,2,18),F);
          s.part(p.hd,q=>{q.ell(px+1,py-13,4,4);q.ell(px-2,py-8,3,3);q.ell(px+4,py-7,3,3)});
          s.set(px,py-14,p.ac);
        }else if(p.sty==="corn"){
          /* Hautes tiges de maïs avec épis dorés */
          s.part(p.st,q=>{q.rect(px,py-13,2,14);q.line(px-3,py-8,px+4,py-5)},F);
          s.part(p.hd,q=>q.rect(px+1,py-10,2,5),F);
          s.set(px,py-14,p.ac);
        }else if(p.sty==="flax"||p.sty==="buckwheat"){
          /* Tiges fleuries (lin bleu / sarrasin blanc) */
          s.part(p.st,q=>q.line(px,py,px,py-7),F);
          s.part(p.hd,q=>q.rect(px-1,py-9,3,3),F);
          s.set(px,py-8,p.ac);
        }else if(p.sty==="quinoa"){
          /* Panaches touffus pourpre-magenta */
          s.part(p.st,q=>q.rect(px,py-5,1,6),F);
          s.part(p.hd,q=>{q.ell(px,py-8,2.6,3.2)},{lt:.45});
          s.set(px,py-10,p.ac);
        }else{
          /* Céréales variées (blé, orge, avoine, seigle, millet, riz, épeautre) */
          const h=p.sty==="rye"?10:p.sty==="millet"?9:7;
          s.part(p.st,q=>q.line(px,py,px+(p.sty==="oat"||p.sty==="rice"?2:0),py-h),F);
          s.part(p.hd,q=>q.rect(px-(p.sty==="millet"?1:0),py-h-2,p.sty==="millet"?3:2,3),F);
          s.set(px,py-h-2,p.ac);
        }
      }
    }
    /* Petit épouvantail ou clôture en Prairie */
    if(b.id==="prairie"){
      s.part("#8a5c32",q=>{q.rect(28,HOR+4,2,16);q.rect(21,HOR+8,16,2)},F);
      s.part("#e8c860",q=>q.ell(29,HOR+4,3,3));
    }
  }

  /* Massifs de plantes sur mesure selon l'herbe (12 espèces distinctes pour l'Herboriste) */
  function drawHerbGrove(s,b,p,r){
    const F={flat:1};
    const spots=[];
    for(let i=0;i<4;i++){
      const bx=22+i*74,by=FEET-14;
      /* Parcelle / lit de terre ou bassin adapté au biome */
      if(p.sty==="lotus"){
        ellipseFill(s,bx+24,by+6,30,13,(x,y,d)=>s.set(x,y,d>.85?"#2a1844":(x+y)%11===0?"#ff78e8":"#6a2298"));
      }else{
        const bed=b.id==="givre"?"#b8d4ec":b.id==="dunes"?"#c48e4c":b.id==="volcan"?"#38282c":b.id==="ruines"?"#7a7298":"#6c4a2e";
        ellipseFill(s,bx+24,by+8,28,11,(x,y,d)=>s.set(x,y,d>.82?mix(bed,DARK,.3):bed));
      }
      for(let k=0;k<9;k++){
        const px=bx+6+(k%5)*9+(r()*3|0),py=by+1+(k>4?9:0);
        if(p.sty==="mandrake"||p.sty==="ginseng"){
          s.part(p.st,q=>q.ell(px,py+2,2.5,2.5));
          s.part(p.fl,q=>{q.poly([[px,py],[px-3,py-5],[px,py-4],[px+3,py-5]])},F);
          s.set(px,py-4,p.ac);
        }else if(p.sty==="lavender"){
          s.part(p.st,q=>{q.line(px,py+4,px,py-2);q.line(px+3,py+4,px+3,py-1)},F);
          s.part(p.fl,q=>{q.rect(px-1,py-8,2,6);q.rect(px+2,py-6,2,5)},F);
          s.set(px,py-8,p.ac);
        }else if(p.sty==="edelweiss"||p.sty==="orchid"||p.sty==="lotus"){
          if(p.sty==="lotus")s.part(p.st,q=>q.ell(px,py+3,4,1.6),F);
          else s.part(p.st,q=>q.line(px,py+4,px,py-1),F);
          s.part(p.fl,q=>{q.ell(px,py-2,3,2.2);q.px(px,py-5)},F);
          s.set(px,py-2,p.ac);
        }else if(p.sty==="belladonna"){
          s.part(p.st,q=>{q.line(px,py+4,px,py-4);q.line(px-3,py-2,px+3,py-2)},F);
          s.part(p.fl,q=>{q.ell(px-2,py,1.8,1.8);q.ell(px+2,py,1.8,1.8)},F);
          s.set(px-2,py-1,p.ac);
        }else{
          /* Feuillages touffus (Ortie, Sauge, Menthe, Mélisse, Thym) */
          s.part(p.st,q=>{q.ell(px-2,py+2,2.6,2);q.ell(px+2,py+2,2.6,2)},F);
          s.part(p.fl,q=>{q.ell(px,py-1,3,2.4)},F);
          s.set(px,py-2,p.ac);
        }
      }
      spots.push(bx+24);
    }
    return spots;
  }

  /* Plan d'eau & ponton sur mesure selon le biome (12 spots de pêche distincts) */
  function drawFishingSpot(s,b,tier,r){
    const wc=rgb(b.water),w2=rgb(b.w2),pier=PIER_PAL[tier],pDk=mix(pier,DARK,.4);
    if(b.id==="givre"){
      /* Lac gelé blanc-bleuté + 4 trous de pêche dans la glace */
      ellipseFill(s,W/2,FEET-16,W*.46,24,(x,y,d)=>s.set(x,y,d>.9?"#8eb8dc":(x+y)%17===0?"#ffffff":"#c4e6fa"));
      const spots=[];
      for(let i=0;i<4;i++){
        const hx=56+i*68;
        ellipseFill(s,hx,FEET-14,15,7,(x,y,d)=>s.set(x,y,d>.8?"#e8f8ff":(x*3+y)%11===0?w2:wc));
        spots.push(hx);
      }
      return spots;
    }
    /* Bassin / lagon / rivière de lave / fosse abyssale */
    ellipseFill(s,W/2,FEET-18,W*.47,26,(x,y,d)=>{
      const rim=d>.88?mix(rgb(b.g[3]),DARK,.3):(x*5+y*3)%19===0?w2:d<.35?mix(wc,w2,.22):wc;
      s.set(x,y,rim);
    });
    /* Nénuphars, coraux immergés ou rochers de lave selon le biome */
    if(b.id==="prairie"||b.id==="bois"||b.id==="marais"||b.id==="jungle"){
      for(let i=0;i<5;i++){const lx=44+i*56+(r()*14|0),ly=FEET-26+(i%2)*10;ellipseFill(s,lx,ly,6,2.5,(x,y)=>s.set(x,y,"#469848"));if(i%2)s.set(lx,ly-1,"#ff98c8")}
    }else if(b.id==="recifs"){
      for(let i=0;i<6;i++)s.blit(prop.coral(r,i%2?"#ff7a8a":"#c488ff"),32+i*48,FEET-36+(i%2)*6);
    }else if(b.id==="volcan"){
      for(let i=0;i<5;i++){const lx=46+i*58;ellipseFill(s,lx,FEET-24+(i%2)*8,7,3,(x,y)=>s.set(x,y,"#342228"))}
    }else if(b.id==="dunes"){
      /* Palmiers autour de l'oasis */
      for(const px of [24,W-28]){
        s.part("#8a5a32",q=>q.line(px,FEET-8,px+(px<W/2?5:-5),FEET-36,3));
        s.part("#449844",q=>{q.ell(px+(px<W/2?5:-5),FEET-37,11,4);q.ell(px+(px<W/2?10:-10),FEET-34,7,3)});
      }
    }
    /* Ponton de pêche adapté au matériau de la zone */
    for(let x=42;x<W-42;x++){
      for(let y=FEET-4;y<FEET+2;y++)s.set(x,y,(x%7===0)?pDk:y===FEET-4?mix(pier,LIGHT,.3):pier);
    }
    for(let x=52;x<W-48;x+=56)for(let y=FEET-6;y<FEET+4;y++){s.set(x,y,pDk);s.set(x+1,y,pDk)}
    return[68,128,192,252];
  }

  /* Génère et met en cache la scène unique (pid, tier 0..11) */
  function scene(pid,tier){
    const t=((tier|0)%12+12)%12,key=pid+":"+t;
    if(cache[key])return cache[key];
    const b=BIO[t]||BIO[0],r=rng((pid.charCodeAt(0)*31+pid.length)*131+t*997+17),s=new Spr(W,H);
    drawBiomeBase(s,b,r,t);

    let spots=[56,124,196,264];
    if(pid==="bucheron"){
      const p=WOOD_PAL[t];
      /* Arrière-plan forestier de la même essence */
      for(let x=-8;x<W;x+=28+(r()*14|0))s.blit(customTree(r,p),x,HOR-14-(r()*8|0));
      /* 4 postes d'abattage + souches */
      spots=[];
      for(let i=0;i<4;i++){
        const tx=26+i*74;
        s.blit(customTree(r,p),tx-4,FEET-44);
        s.blit(prop.stump(r,p.tr),tx+28,FEET-4);
        spots.push(tx+20);
      }
    }else if(pid==="mineur"){
      const p=ORE_PAL[t];
      spots=[];
      for(let i=0;i<4;i++){
        const mx=48+i*74;
        drawOreNode(s,mx,FEET-8,p,r);
        spots.push(mx+16);
      }
    }else if(pid==="paysan"){
      drawCropField(s,b,CROP_PAL[t],r);
      spots=[54,122,194,262];
    }else if(pid==="herboriste"){
      spots=drawHerbGrove(s,b,HERB_PAL[t],r);
    }else{
      spots=drawFishingSpot(s,b,t,r);
    }

    /* Chemin de service au premier plan */
    const P=rgb(b.path),Pdk=mix(P,DARK,.25);
    for(let x=0;x<W;x++){
      const c=FEET+6+Math.round(Math.sin(x/26)*1.6);
      for(let y=c;y<c+6;y++)s.set(x,y,y===c||y===c+5?Pdk:P);
    }
    return cache[key]={cv:s.cvs(),spots,bio:b,tier:t};
  }

  /* Atmosphère animée propre à chaque biome (neige, braises, sable, lucioles, pluie, bulles, étoiles, néant…) */
  function drawAtm(g,b,pid,t){
    const a=b.atm;
    if(a==="cloud"){
      g.fillStyle="rgba(255,255,255,.82)";
      for(let i=0;i<4;i++){const x=((t*.004*(1+i*.25)+i*88)%(W+60))-30;g.fillRect(Math.round(W-x),6+i*5,16+i*4,3);g.fillRect(Math.round(W-x)+4,4+i*5,9,2)}
    }else if(a==="snow"){
      g.fillStyle="rgba(255,255,255,.9)";
      for(let i=0;i<28;i++){const x=(i*37+Math.sin(t*.002+i)*8+t*.012)%W,y=(i*19+t*.026*(1+(i%3)*.3))%H;g.fillRect(Math.round(x),Math.round(y),i%4?1:2,i%4?1:2)}
    }else if(a==="ember"){
      for(let i=0;i<22;i++){const x=(i*41+Math.sin(t*.004+i)*6+W)%W,y=H-((i*23+t*.03*(1+(i%3)*.35))%H);g.fillStyle=i%2?"#ffd44a":"#ff621c";g.fillRect(Math.round(x),Math.round(y),2,2)}
    }else if(a==="sand"){
      g.fillStyle="rgba(255,238,176,.65)";
      for(let i=0;i<16;i++){const x=(i*47+t*.09*(1+(i%3)*.25))%W,y=24+(i*17%(H-30));g.fillRect(Math.round(x),Math.round(y),6+(i%4)*3,1)}
    }else if(a==="rain"){
      g.fillStyle="rgba(204,230,255,.55)";
      for(let i=0;i<30;i++){const x=(i*29-t*.06+W*10)%W,y=(i*19+t*.14)%H;g.fillRect(Math.round(x),Math.round(y),1,4)}
    }else if(a==="firefly"||a==="spore"||a==="star"||a==="void"){
      for(let i=0;i<18;i++){
        const pulse=.45+.55*Math.sin(t*.005+i*1.7);
        const x=(i*43+Math.sin(t*.0015+i)*12+W)%W,y=14+(i*19%(H-26))+Math.cos(t*.002+i)*4;
        g.fillStyle=a==="void"?(i%2?`rgba(232,120,255,${pulse})`:`rgba(130,220,255,${pulse})`):a==="star"?`rgba(216,240,255,${pulse})`:`rgba(214,255,120,${pulse})`;
        g.fillRect(Math.round(x),Math.round(y),2,2);
      }
    }else if(a==="mist"){
      g.fillStyle="rgba(208,236,196,.22)";
      for(let i=0;i<4;i++){const x=((t*.008+i*95)%(W+80))-40;g.fillRect(Math.round(x),HOR-4+(i%2)*14,42,4)}
    }else if(a==="bubble"){
      g.fillStyle="rgba(240,255,255,.75)";
      for(let i=0;i<14;i++){const x=24+(i*21+Math.sin(t*.003+i)*4)%(W-48),y=FEET-4-((i*11+t*.015)%36);g.fillRect(Math.round(x),Math.round(y),2,2)}
    }else if(a==="spark"){
      for(let i=0;i<12;i++){const p=.35+.65*Math.abs(Math.sin(t*.006+i*2.1));g.fillStyle=`rgba(255,224,112,${p})`;g.fillRect(20+i*26,18+(i*13%56),2,2)}
    }
    /* Petits clapotis sur les zones de pêche */
    if(pid==="pecheur"){
      g.fillStyle="rgba(255,255,255,.45)";
      for(let i=0;i<6;i++){const x=48+i*44+Math.round(Math.sin(t*.003+i)*6),y=FEET-28+(i%3)*7;g.fillRect(x,y,5,1)}
    }
  }

  const imgs={};function img(u){let i=imgs[u];if(!i){i=new Image();i.src=u;imgs[u]=i}return i}
  let pops=[],lastCap="";

  function resolveRid(c,pid){
    if(previewRid&&RES[previewRid]&&RES[previewRid].prof===pid)return previewRid;
    const dr=c.dataset.r;
    if(dr&&RES[dr]&&RES[dr].prof===pid)return dr;
    if(S&&S.job&&RES[S.job.r]&&RES[S.job.r].prof===pid)return S.job.r;
    return PROFS[pid].res[0][0];
  }

  return{
    W,H,scene,
    preview(rid){previewRid=rid||null},
    pop(wi,txt){pops.push({wi,txt})},
    draw(t,dt){
      const c=$("siteCv");if(!c||c.offsetParent===null)return;
      const pid=c.dataset.p;if(!PROFS[pid])return;
      const rid=resolveRid(c,pid),rObj=RES[rid],tier=rObj?rObj.tier:0;
      const g=c.getContext("2d"),sc=scene(pid,tier);
      g.imageSmoothingEnabled=false;
      g.drawImage(sc.cv,0,0);
      drawAtm(g,sc.bio,pid,t);

      /* Mise à jour légère du bandeau (nom de la ressource + zone associée) lors du survol */
      const cap=$("siteCap"),zName=(ZONES[tier]&&ZONES[tier].name)||"",list=OUV.at(pid);
      const heroHere=!!(S&&S.cls&&S.job&&RES[S.job.r]&&RES[S.job.r].prof===pid);
      const capSig=rid+"|"+list.length+"|"+(heroHere?1:0)+"|"+(previewRid===rid?1:0);
      if(cap&&capSig!==lastCap){
        lastCap=capSig;
        cap.innerHTML=`<b>${rObj?rObj.name:PROFS[pid].name}</b><span class="sitez">${zName}</span><span class="num">${heroHere?"Vous + ":""}${list.length} ouvrier${list.length>1?"s":""}</span>`;
      }

      /* Héros actif sur place lorsqu'il récolte ce métier */
      let slotOffset=0;
      if(heroHere){
        const gt=gatherTime(pid,RES[S.job.r].tier),p=Math.min(1,(S.job.t||0)/Math.max(.1,gt));
        const anim=p>=.72?"atk":"idle",fi=anim==="atk"?Math.min(9,Math.floor((p-.72)/.28*10)):Math.floor(t/160)%10;
        const hf=PX.heroFrames(S.cls,CLASSES[S.cls].col,anim,0,typeof heroArm==="function"?heroArm():null)[fi],im=img(hf);
        const hx=sc.spots[0];
        if(im.complete&&im.width)g.drawImage(im,Math.round(hx-im.width/2),FEET-Math.round(im.height*.74));
        slotOffset=1;
      }

      /* Ouvriers embauchés dans ce métier */
      list.forEach((w,k)=>{
        const idx=k+slotOffset,x=sc.spots[idx%sc.spots.length]+(idx>=sc.spots.length?14:0),f=OUV.frame(w,t),im=img(f);
        if(im.complete&&im.width)g.drawImage(im,Math.round(x-im.width/2),FEET-Math.round(im.height*.74));
      });

      if(pops.length){
        const box=c.parentElement;
        pops.forEach(p=>{
          const k=list.indexOf(OUV.list()[p.wi]);if(k<0||!box)return;
          const idx=k+slotOffset,x=sc.spots[idx%sc.spots.length]+(idx>=sc.spots.length?14:0),e=document.createElement("b");
          e.className="sitepop";e.textContent=p.txt;e.style.left=(x/W*100)+"%";e.style.top=((FEET-36)/H*100)+"%";
          box.appendChild(e);setTimeout(()=>e.remove(),1100);
        });
        pops=[];
      }
    }
  };
})();
