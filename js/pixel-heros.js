/* Moteur pixel art : héros des 8 classes (heroSpr, PX.hero, PX.heroF, PX.heroFrames) et compagnons-créatures (PX.beastF). Suite de pixel.js. */
(()=>{const{cache,rgb,mix,DARK,INK,Spr}=PX._;
  /* Héros et compagnons humains : bras et arme dessinés selon un angle, 32×32 pour laisser la place à l'arme.
     Tables : angle du bras droit (degrés, 0 = vers l'avant, 90 = vers le bas), arme, décalage du corps. */
  const HA={
    idle:{arm:[88,86,84,84,86,88,90,92,92,90],dx:[0,0,0,0,0,0,0,0,0,0],dy:[0,0,0,1,1,1,1,0,0,0],w:[-88,-87,-86,-86,-87,-88,-89,-90,-90,-89]},
    atk:{arm:[90,150,205,230,280,330,10,25,55,80],dx:[0,-1,-1,-1,0,1,2,2,1,0],dy:[0,0,1,1,0,0,0,0,0,0],w:[-80,-100,-135,-155,-115,-50,0,15,-30,-70]},
    bash:{arm:[90,115,135,125,45,0,-5,10,50,80],dx:[0,-1,-2,-2,0,2,3,2,1,0],dy:[0,0,1,1,0,0,0,0,0,0],w:[0,0,0,0,0,0,0,0,0,0]},
    shoot:{arm:[85,60,30,10,0,0,0,0,30,70],dx:[0,0,-1,-1,-1,-1,0,0,0,0],dy:[0,0,0,0,0,0,0,0,0,0],pull:[0,1,2,3,4,4,0,0,0,0],w:[0,0,0,0,0,0,0,0,0,0]},
    staff:{arm:[90,120,150,130,60,10,-10,0,40,80],dx:[0,-1,-1,-1,0,1,2,1,0,0],dy:[0,0,1,1,0,0,0,0,0,0],w:[-95,-110,-125,-115,-70,-30,-15,-25,-60,-90]},
    cast:{arm:[90,50,10,-30,-60,-80,-88,-90,-90,-90],dx:[0,0,0,0,0,0,0,0,0,0],dy:[0,0,1,0,-1,-1,-1,-1,-1,-1],w:[-90,-70,-60,-75,-85,-90,-90,-90,-90,-90],left:1}};
  /* animation d'attaque propre à chaque classe */
  const ATK={guerrier:"atk",gardien:"bash",archer:"shoot",mage:"staff",peste:"staff",chrono:"staff",invoc:"staff",berserk:"atk"};
  /* ================= Héros : 8 classes, chacune avec sa silhouette, sa tenue et son arme =================
     Dessin dans un repère de 32 px de large (centre du corps x = 15,5 ; sol y = 30), la tête monte jusqu'à y = -12.
     Rendu dans un cadre de 64 px (marge HP de 16 px) : l'arme et le chapeau ne sortent jamais du cadre.
     Le personnage est monté en calques (arrière-plan, corps, tête, bras avant et arme), chacun cerné d'un trait
     sombre : les contours intérieurs détachent le bras du buste, le menton du col, l'arme du corps.
     col = couleur d'étoffe (classe, compagnon, ouvrier) ; métal, cuir et cheveux sont propres à la classe.
     tight = cadre 32 px resserré sur le buste (portraits des compagnons). */
  const HP=16;
  const HAIRS=["#6b3a22","#e8c25a","#b5532c","#3a2a3c","#ece6d6","#9a5a2e","#d98a4a","#54406e"];
  const HCLS={guerrier:0,archer:1,mage:4,gardien:5,peste:5,chrono:4,berserk:2,invoc:3};
  function heroSpr(cls,col,anim,f,blink,arm){
    const T=HA[anim]||HA.idle,s=new Spr(32+2*HP,32+2*HP,HP,HP),F={flat:1},SK={dk:.17,lt:.3},ink=mix(col,INK,.84);
    let g=s;const P=(c,fn,o)=>g.part(c,fn,o),px=(x,y,c)=>g.set(Math.round(x),Math.round(y),c);
    const own=typeof CLASSES!=="undefined"&&CLASSES[cls]&&CLASSES[cls].col===col;let hh=0;for(let i=0;i<col.length;i++)hh=(hh*31+col.charCodeAt(i))>>>0;
    const hair=HAIRS[own?HCLS[cls]||0:hh%HAIRS.length];
    const cc=rgb(col),EM=Math.abs(cc[0]-242)+Math.abs(cc[1]-193)+Math.abs(cc[2]-78)<110?"#fff8e0":"#f2c14e",dk=mix(col,DARK,.42),lt=mix(col,"#ffffff",.45),skin="#f6cfa6",skD="#d99a7a",B="#1c1020",W="#ffffff";
    const ST="#c3cad6",STD="#8790a4",GO="#f2c14e",LE="#8a5a34",LED="#5c3a22",BONE="#f1e4bf",FUR="#8a6a45",RUNE="#d9c6ff",RED="#e8483c";
    /* Teintes « pouilleux / débutant » quand aucun équipement n'est porté sur l'emplacement */
    const RAG=mix(col,"#8a7a68",.55),RAGD=mix(RAG,DARK,.34),RAGP=mix(RAG,"#c6b292",.48),ROPE="#9a8258",ROPED="#6a5436";
    const WOOD="#7e5a38",WOODD="#543a24",STONE="#7a7882",STONEL="#a8a6b0",RUST="#856852",RUSTL="#a2988e",OLDRAG="#5e4337",OLDLD="#3e2a22",SAND="#6a5440",SANDD="#483628";
    /* Équipement dynamique (6 emplacements visibles + transmogrification + auras de haut niveau) */
    const AR=arm||{},AH=AR.coiffe,AC=AR.cape,AW=AR.arme,AS=AR.bouclier,AB=AR.ceinture,AF=AR.bottes,AURA=AR.aura;
    const bodyTheme=(AC&&AC.th)||null;
    const robe=cls==="mage"||cls==="chrono"||(cls==="invoc"&&!!AC)||(AC&&(AC.cls==="mage"||AC.cls==="invoc")),caster=cls==="mage"||cls==="chrono"||cls==="invoc"||cls==="peste";
    const bodyCol=bodyTheme?bodyTheme.pri:col,bodyDk=mix(bodyCol,DARK,.45),bodyLt=mix(bodyCol,"#ffffff",.4),bodyMet=bodyTheme?bodyTheme.met:ST,bodyAcc=bodyTheme?bodyTheme.acc:GO;
    const u=Math.max(0,T.dy[f]),up=()=>{g.oy=HP+u},dn=()=>{g.oy=HP};                 /* le buste respire, les pieds restent au sol */
    /* un calque : dessiné à part, cerné, puis posé sur le personnage */
    const lay=(fn,oc=ink)=>{g=new Spr(s.w,s.h,HP,HP);fn();g.outline(oc);const p=g.p;for(let i=0;i<p.length;i++)if(p[i])s.p[i]=p[i];g=s};
    const sw=anim==="idle"?[0,0,0,1,1,1,1,0,0,0][f]:T.dx[f]>0?1:0;                   /* étoffes et cheveux qui suivent le mouvement */
    const ph=f*Math.PI/5,bobF=Math.round(Math.sin(ph)*1.4);
    const R=Math.PI/180,idle=anim==="idle",rest=idle?(caster?44:cls==="gardien"?36:cls==="archer"?30:22):0;
    const aa=(T.arm[f]-rest)*R,sx=21.5,sy=14,AL=6,hx=sx+Math.cos(aa)*AL,hy=sy+Math.sin(aa)*AL;
    const wa=((T.w[f]??-90)+(idle&&(cls==="guerrier"||cls==="berserk")?13:0))*R,ux=Math.cos(wa),uy=Math.sin(wa),vx=-uy,vy=ux;
    const la=T.left?(180-T.arm[f])*R:(102+(T.arm[f]-90)*-.15)*R,lsx=9.5,lsy=14,lhx=lsx+Math.cos(la)*AL,lhy=lsy+Math.sin(la)*AL;
    const SL=bodyTheme
      ?({guerrier:bodyMet,archer:bodyCol,mage:bodyCol,gardien:bodyMet,peste:bodyTheme.sec,chrono:bodyCol,berserk:skin,invoc:bodyCol}[cls]||bodyCol)
      :({guerrier:skin,archer:skin,gardien:RAG,mage:RAG,peste:"#8c7656",chrono:RAG,berserk:skin,invoc:OLDRAG}[cls]||skin);
    const GL=bodyTheme?({guerrier:bodyMet,gardien:bodyMet,archer:LE,berserk:LE}[cls]||skin):skin;
    const pull=cls==="archer"?((T.pull||[])[f]||0)*1.5:0;
    const hand=(x,y,c)=>{x=Math.round(x);y=Math.round(y);P(c,q=>q.rect(x-1,y-1,2,2),F);px(x,y,mix(c,DARK,.22))};
    const W2=(a,b)=>[hx+ux*a+vx*b,hy+uy*a+vy*b],ln=(q,p0,p1,t)=>q.line(p0[0],p0[1],p1[0],p1[1],t);
    const lim=L=>ux>.15?Math.min(L,(45.5-T.dx[f]-hx)/ux):L;
    const grip=idle?0:[2,5,8,8,8,8,8,8,anim==="cast"?8:5,anim==="cast"?8:2][f];

    /* ----- calque 0 : aura arrière animée (zones 6 à 11 : orage, magma, astral, néant violet/écarlate au niv. 1000) ----- */
    if(AURA){
      const a1=AURA.c1,a2=AURA.c2,aDk=mix(a1,DARK,.55),t4=AURA.tier>=4;
      const pulse=Math.sin(ph);
      if(t4){
        /* Halo d'énergie menaçant qui pulse et monte autour du héros */
        const pts=AURA.motif==="void"
          ?[[3,26],[28,26],[2,17],[29,17],[5,8],[26,8],[10,-4],[21,-4]]
          :[[4,27],[27,27],[3,18],[28,18],[6,9],[25,9],[11,-3],[20,-3]];
        pts.forEach(([x,y],i)=>{
          const dy=((f*2+i*3)%10)-4,dx=Math.round(Math.sin(ph+i)*1.3);
          const ry=y-dy,rx=x+dx;
          s.set(rx,ry,i%2?a2:a1);s.set(rx,ry+1,a1);
          if(AURA.motif==="void"||AURA.motif==="magma"){s.set(rx,ry+2,aDk);if((f+i)%3===0)s.set(rx,ry-1,W)}
        });
        /* Flammes / volutes d'aura derrière les épaules et les pieds */
        const fh=Math.round(4+pulse*1.5);
        for(let i=0;i<5;i++){
          const fx=5+i*5,fy=28-((f+i*2)%4);
          s.set(fx,fy,a1);s.set(fx,fy-1,i%2?a2:a1);
          if(AURA.motif==="void"){s.set(fx+1,fy-2,aDk);s.set(4,12-fh+(i%3),a1);s.set(27,12-fh+((i+1)%3),a2)}
          if(AURA.motif==="astral"){const ang=ph+i*1.25;s.set(Math.round(15.5+Math.cos(ang)*13),Math.round(11+Math.sin(ang)*11),i%2?a2:W)}
        }
      }else{
        /* Palier 3 : étincelles élémentaires ascendantes */
        for(let i=0;i<5;i++){
          const rx=4+((i*7+f)%24),ry=26-((f*2+i*5)%26);
          s.set(rx,ry,i%2?a2:a1);if((f+i)%2===0)s.set(rx,ry+1,aDk);
        }
      }
    }
    if(AR.bossAura){px(15.5+Math.round(Math.sin(ph)*4),-10,GO);px(15.5-Math.round(Math.cos(ph)*5),-8,W)}

    /* ----- rendu d'arme dynamique : arme abîmée/primitive sans équipement, ou arme forgée selon la classe + zone ----- */
    const drawWeapon=(wCls,wObj)=>{
      if(!wObj){
        /* Armes de départ abîmées / primitives (hache en pierre, épée rouillée ébréchée, gourdin en bois, branches…) */
        if(wCls==="guerrier"){
          /* Épée courte rouillée et ébréchée */
          P(WOODD,q=>ln(q,W2(-3,0),W2(1,0),2),F);px(...W2(-1,0),ROPE);
          P(RUST,q=>ln(q,W2(2,-3),W2(2,3),2),F);
          const e=lim(14.5);
          P(RUSTL,q=>q.poly([W2(3,-1.5),W2(e-2.5,-1.4),W2(e,0),W2(e-2.5,1.4),W2(3,1.5)]),{dk:.4});
          px(...W2(7,-1),RUST);px(...W2(10,1),RUST);px(...W2(11,-1),RUST);
        }else if(wCls==="berserk"){
          /* Hache en pierre grossièrement ligotée sur une branche */
          const e=lim(16)-16;
          P(WOOD,q=>ln(q,W2(-4,0),W2(14.5+e,0)),F);
          P(STONE,q=>q.poly([W2(9.5+e,0),W2(7.5+e,4),W2(10+e,6.5),W2(14.5+e,6),W2(15.5+e,3),W2(13.5+e,0)]),{dk:.38});
          P(STONEL,q=>ln(q,W2(10+e,5.8),W2(14+e,5.3)),F);
          P(STONE,q=>q.poly([W2(10+e,0),W2(11.5+e,-2.5),W2(13+e,0)]),F);
          P(ROPE,q=>{ln(q,W2(10.5+e,-1),W2(12.5+e,2));ln(q,W2(12.5+e,-1),W2(10.5+e,2))},F);
        }else if(wCls==="gardien"){
          /* Gourdin / maillet en bois abîmé avec un cerclage rouillé */
          const e=lim(14)-14;
          P(WOOD,q=>ln(q,W2(-3,0),W2(10+e,0)),F);
          P(WOODD,q=>q.poly([W2(8.5+e,-3.2),W2(13.5+e,-3.2),W2(13.5+e,3.2),W2(8.5+e,3.2)]),{dk:.35});
          P(RUST,q=>ln(q,W2(11+e,-3),W2(11+e,3)),F);
        }else if(wCls==="archer"){
          /* Arc rudimentaire en branche tordue + corde effilochée */
          const ba=(idle?-70:-90)*R,ax=Math.cos(ba),ay=Math.sin(ba),bx=-ay,by=ax,Bw=(a,b)=>[hx+ax*a+bx*b,hy+ay*a+by*b];
          P(WOOD,q=>{ln(q,Bw(8.5,-2.5),Bw(5,0));ln(q,Bw(5,0),Bw(0,1));ln(q,Bw(0,1),Bw(-5,0));ln(q,Bw(-5,0),Bw(-8.5,-2.5))},F);
          P(ROPE,q=>{ln(q,Bw(8.5,-2.5),Bw(0,-2.5-pull));ln(q,Bw(0,-2.5-pull),Bw(-8.5,-2.5))},F);
          if(pull>0){P(WOODD,q=>ln(q,Bw(0,-2.5-pull),Bw(0,6)),F);px(...Bw(0,7),STONE);px(...Bw(1,-2.5-pull),ROPE)}
        }else{
          /* Bâtons de fortune (branche nue, brindille sèche, tige rouillée, os fissuré) */
          const n=Math.min(16-grip,lim(24)-8),L=(a,b)=>W2(n+a,b);
          P(wCls==="invoc"?WOODD:WOOD,q=>ln(q,L(-25,0),L(0,0)),F);
          if(wCls==="mage"){
            P(WOOD,q=>{ln(q,L(-1,0),L(2.5,-2));ln(q,L(-1,0),L(2.5,2))},F);
            px(...L(2.5,0),mix(col,W,.45));
          }else if(wCls==="peste"){
            P(WOODD,q=>{ln(q,L(0,0),L(3,-1.5));ln(q,L(1,0),L(2.5,2))},F);
            px(...L(3,-2),"#6c8a50");px(...L(3,2),"#5c7844");
          }else if(wCls==="chrono"){
            P(RUST,q=>{ln(q,L(0,-1.5),L(3,-1.5));ln(q,L(3,-1.5),L(3,1.5));ln(q,L(3,1.5),L(0,1.5))},F);
            px(...L(1.5,0),ROPE);
          }else{
            /* Invocateur : vieux bâton ligoté à un os fêlé */
            P(ROPE,q=>ln(q,L(-2,-1),L(0,1)),F);
            P("#cfc5b0",q=>{ln(q,L(0,-2),L(2.5,-2.5));ln(q,L(0,2),L(2.5,2.5));q.px(...L(1,0))},F);
            if(f%3===0)px(...L(3,0),"#b8a0d8");
          }
        }
        return;
      }
      const th=wObj.th,t=wObj.tier;
      const wp=th.pri,ws=th.sec,wm=th.met,wa2=th.acc;
      if(wCls==="guerrier"){
        P(mix(wp,DARK,.45),q=>ln(q,W2(-3,0),W2(1,0),2),F);px(...W2(-4,0),wa2);
        const e=lim(19.5+(t>=3?1.5:0));
        P(wm,q=>q.poly([W2(3,-2-(t>=3?.4:0)),W2(e-3.5,-2),W2(e,0),W2(e-3.5,2),W2(3,2+(t>=3?.4:0))]),{dk:.32});
        P(t>=3?wa2:W,q=>ln(q,W2(5,-.5),W2(e-4,-.5)),F);
        P(wp,q=>ln(q,W2(2.5,-4-(t>=2?1:0)),W2(2.5,4+(t>=2?1:0)),2));
        if(t>=4){px(...W2(e-1,0),W);px(...W2(e-4,1),wa2);if(f%2===0)px(...W2(e+1,0),wa2)}
      }else if(wCls==="berserk"){
        const e=lim(19.5)-19.5;
        P(mix(ws,DARK,.4),q=>ln(q,W2(-5,0),W2(17.5+e,0)),F);
        P(wm,q=>q.poly([W2(11+e,0),W2(6.5+e,5),W2(9+e,8.5+(t>=3?1:0)),W2(17+e,8.5+(t>=3?1:0)),W2(19.5+e,5),W2(15+e,0)]),{dk:.32});
        P(t>=3?wa2:W,q=>ln(q,W2(10+e,7.8),W2(16+e,7.8)),F);
        if(t>=2){
          /* Double lame de berserker dès le palier 2 */
          P(wm,q=>q.poly([W2(11.5+e,0),W2(8.5+e,-5),W2(15.5+e,-5),W2(14.5+e,0)]),{dk:.38});
          if(t>=3)P(wa2,q=>ln(q,W2(9.5+e,-4.5),W2(14.5+e,-4.5)),F);
        }else P(STD,q=>q.poly([W2(11.5+e,0),W2(13+e,-4),W2(14.5+e,0)]));
        if(t>=4&&f%2===0){px(...W2(13+e,9.5),W);px(...W2(12+e,-5.5),wa2)}
      }else if(wCls==="gardien"){
        const e=lim(17)-17;
        P(mix(ws,DARK,.35),q=>ln(q,W2(-4,0),W2(13+e,0)),F);
        P(wm,q=>q.poly([W2(10+e,-4.5),W2(16+e,-4.5),W2(16+e,4.5),W2(10+e,4.5)]),{dk:.3});
        P(wp,q=>ln(q,W2(13+e,-4),W2(13+e,4),2),F);
        px(...W2(13+e,0),wa2);
        if(t>=3){px(...W2(16.5+e,-4),wa2);px(...W2(16.5+e,4),wa2);px(...W2(17+e,0),W)}
      }else if(wCls==="archer"){
        const ba=(idle?-70:-90)*R,ax=Math.cos(ba),ay=Math.sin(ba),bx=-ay,by=ax,Bw=(a,b)=>[hx+ax*a+bx*b,hy+ay*a+by*b];
        P(wp,q=>{ln(q,Bw(10,-3),Bw(7,0));ln(q,Bw(7,0),Bw(3,1));ln(q,Bw(3,1),Bw(-3,1));ln(q,Bw(-3,1),Bw(-7,0));ln(q,Bw(-7,0),Bw(-10,-3));ln(q,Bw(2,2),Bw(-2,2))},F);
        P(t>=3?wa2:BONE,q=>{ln(q,Bw(10,-3),Bw(0,-3-pull));ln(q,Bw(0,-3-pull),Bw(-10,-3))},F);
        if(t>=2){px(...Bw(10,-3),wm);px(...Bw(-10,-3),wm)}
        if(pull>0){P("#e8dcc0",q=>ln(q,Bw(0,-3-pull),Bw(0,7)),F);px(...Bw(0,8),t>=2?wa2:ST);px(...Bw(0,9),t>=3?W:ST);px(...Bw(1,-3-pull),t>=2?wa2:RED);px(...Bw(-1,-3-pull),t>=2?wa2:RED)}
      }else{
        /* Bâtons / Sceptres (mage, peste, chrono, invoc) */
        const wood=mix(wp,DARK,.3);
        const n=Math.min(19-grip,lim(27)-8),L=(a,b)=>W2(n+a,b),o=L(3.5,0);
        P(wood,q=>ln(q,L(-28,0),L(0,0)),F);
        if(wCls==="mage"){
          P(wm,q=>{ln(q,L(0,-2),L(0,2));ln(q,L(0,-3),L(2,-3));ln(q,L(0,3),L(2,3))},F);
          P(wa2,q=>q.ell(o[0],o[1],2.6+(t>=3?.4:0),2.6+(t>=3?.4:0)),{lt:.75});px(o[0]-1,o[1]-1,W);
          if(t>=3&&f%2===0)px(...L(7,0),wa2);
        }else if(wCls==="peste"){
          P(wood,q=>{ln(q,L(0,0),L(3,-2));ln(q,L(3,-2),L(6,0));ln(q,L(6,0),L(6,3));ln(q,L(6,3),L(4,4));ln(q,L(4,4),L(2,3))},F);
          const e=L(3.5,1.5);P(wa2,q=>q.ell(e[0],e[1],1.7,1.7),{lt:.75});px(e[0],e[1]-1,W);
          P(wp,q=>[L(-2,2),L(-4,-2),L(-3,2)].forEach(a=>q.px(a[0],a[1])),F);
        }else if(wCls==="chrono"){
          const e=L(4,0),cx=Math.round(e[0]),cy=Math.round(e[1]);
          P(wm,q=>{q.ell(cx,cy,3.5,3.5);q.clear(cx-1,cy-1,3,3)});
          px(cx,cy,wa2);px(cx+Math.round(Math.cos(ph)),cy+Math.round(Math.sin(ph)),W);px(cx,cy-1,wa2);
        }else{
          /* Invocateur : sceptre/faux rituelle cornue + flamme d'âme animée */
          P(wm,q=>{ln(q,L(0,-3),L(0,3));ln(q,L(0,-3),L(4+(t>=3?1:0),-4.5));ln(q,L(0,3),L(4+(t>=3?1:0),4.5))},F);
          P(wa2,q=>{q.ell(o[0],o[1],2.1+(t>=3?.4:0),2.1);[L(6.5,bobF*.3),L(7.5,.8)].forEach(a=>q.px(a[0],a[1]))},{lt:.75});px(o[0],o[1],W);
        }
      }
    };
    const effWCls=AW?AW.cls:cls,wIsStaff=effWCls==="mage"||effWCls==="peste"||effWCls==="chrono"||effWCls==="invoc";

    /* ----- calque arrière : cape équipée (aucune cape gratuite sans objet), carquois, cheveux, bâton au repos, relique flottante ----- */
    lay(()=>{up();
      if(AC){
        const c1=AC.th.pri,c2=AC.th.sec,cm=AC.th.met,ca=AC.th.acc,ct=AC.tier;
        if(AC.boss){
          /* Cape souveraine du Boss : large, majestueuse, épaulière dorée et liseré lumineux */
          P(c1,q=>q.poly([[6,10],[16,10],[14,27],[2-sw,28],[4,16]]));
          P(c2,q=>q.poly([[8,12],[14,12],[12,26],[5-sw,26]]),{dk:.15});
          P(GO,q=>q.rect(6,10,10,2),F);
          if(ct>=2)P(ca,q=>q.line(3-sw,27,13,26),F);
        }else if(AC.cls==="berserk"){
          /* Fourrure de bête sauvage */
          P(c1,q=>{q.poly([[7,10],[16,10],[13,24],[4-sw,25],[5,16]]);q.clear(6-sw,25,1,1);q.clear(9-sw,24,1,1)});
          P(c2,q=>q.rect(6,9,11,3));
        }else if(AC.cls==="invoc"||AC.cls==="mage"){
          /* Manteau / robe mystique longue + ourlet runique */
          P(mix(c1,DARK,.35),q=>{q.poly([[7,10],[16,10],[13,27],[3-sw,28],[5,16]]);q.clear(5-sw,28,1,1);q.clear(9-sw,27,1,1)});
          if(ct>=1)P(ca,q=>{q.px(5-sw,25);q.px(8-sw,26);q.px(11,25)},F);
        }else{
          P(c1,q=>{q.poly([[7,10],[15,10],[13,25],[4-sw,26+sw],[5,16]]);if(ct>=3)q.clear(7-sw,26+sw,1,1)});
          P(cm,q=>q.rect(7,10,8,2),F);
          if(ct>=2)P(ca,q=>q.line(5-sw,25,12,24),F);
        }
      }
      if(cls==="archer"){P(hair,q=>q.poly([[8,4],[11,5],[9,13],[5-sw,15],[6-sw,11]]));P(AC?LE:WOODD,q=>q.poly([[5,11],[8,10],[11,19],[8,20]]));
        if(AC){P(BONE,q=>{q.line(5,10,4,7);q.line(7,9,7,6)},F);px(4,6,RED);px(3,7,RED);px(7,5,RED);px(8,6,RED)}else{P(WOOD,q=>q.line(6,10,5,7),F);px(5,6,ROPE)}}
      if(cls==="mage"&&!AH)P(hair,q=>q.poly([[8,2],[12,2],[11,14],[5-sw,16],[6,8]]));
      if(cls==="berserk")P(hair,q=>q.poly([[8,0],[12,0],[12,13],[8-sw,15],[4-sw,16],[5-sw,11],[5,7]]));
      if(wIsStaff&&anim!=="staff"&&anim!=="cast")drawWeapon(effWCls,AW);
      /* Esprit de l'invocateur ou relique flottante (orbe, grimoire, cadran, fiole) animée image par image */
      if(AS&&(AS.cls==="mage"||AS.cls==="invoc"||AS.cls==="chrono"||AS.cls==="peste")){
        dn();const ox=2,oy=7+bobF,a1=AS.th.pri,a2=AS.th.acc,am2=AS.th.met;
        if(AS.cls==="mage"){P(a2,q=>q.ell(ox,oy,2.6,2.6),{lt:.7});px(ox-1,oy-1,W);if(AS.tier>=2)P(am2,q=>{q.px(ox-3,oy+1);q.px(ox+3,oy-1)},F)}
        if(AS.cls==="invoc"){P(a1,q=>q.rect(ox-2,oy-2,5,6));P(am2,q=>q.rect(ox-2,oy-2,1,6),F);px(ox,oy,a2);px(ox+1,oy+1,W)}
        if(AS.cls==="chrono"){P(am2,q=>{q.ell(ox,oy,3,3);q.clear(ox-1,oy-1,3,3)});px(ox,oy,a2);px(ox+Math.round(Math.cos(ph)),oy+Math.round(Math.sin(ph)),W)}
        if(AS.cls==="peste"){P("#d8eef5",q=>q.ell(ox,oy,2.4,2.6),{lt:.5});P(a2,q=>q.rect(ox-1,oy,3,2),F);px(ox,oy-3,am2)}
      }else if(cls==="invoc"){const wb=idle?[0,0,-1,-1,-1,0,0,1,1,1][f]:-1;dn();
        if(bodyTheme){P(bodyAcc,q=>{q.ell(1.5,5+wb,2,2);q.px(0,8+wb);q.px(1,9+wb)},{lt:.6});px(1,5+wb,B);px(3,5+wb,B)}
        else{px(2,7+wb,"#b8a4d8");if(f%2===0)px(3,6+wb,"#dfd4f2")}}});

    /* ----- calque du corps : bras arrière, jambes et bottes, buste (pouilleux sans cape/robe, armure/robe avec), ceinture ----- */
    lay(()=>{up();
      if(!(pull>0)){P(SL===skin?skD:mix(SL,DARK,.2),q=>q.line(lsx-.5,lsy,lhx-.5,lhy,2),SL===skin?F:undefined);hand(lhx,lhy+.5,GL===skin?skin:mix(GL,DARK,.2))}
      /* Bouclier / brassard porté au bras arrière pour les non-Gardiens */
      if(AS&&cls!=="gardien"&&(AS.cls==="guerrier"||AS.cls==="gardien"||AS.cls==="berserk"||AS.cls==="archer")){
        const bx=Math.round(lhx-1),by=Math.round(lhy);
        if(AS.cls==="archer"){P(AS.th.pri,q=>q.rect(bx-1,by-2,3,4));px(bx,by-1,AS.th.acc)}
        else if(AS.cls==="berserk"){P(AS.th.pri,q=>q.ell(bx,by,3.4,3.4));P(AS.th.met,q=>q.ell(bx,by,1.4,1.4),F);if(AS.tier>=2)px(bx,by,AS.th.acc)}
        else{P(AS.th.met,q=>q.poly([[bx-3,by-4],[bx+3,by-4],[bx+3,by+1],[bx,by+5],[bx-3,by+1]]));P(AS.th.pri,q=>q.poly([[bx-2,by-3],[bx+2,by-3],[bx+2,by],[bx,by+3.5],[bx-2,by]]));px(bx,by-1,AS.th.acc)}
      }
      dn();const step=anim==="atk"||anim==="bash"?(f>=4&&f<=7?1:0):0;
      if(robe){
        if(bodyTheme){
          P(bodyCol,q=>{q.poly([[9,18],[21,18],[23,28],[7,28]]);if(cls==="invoc"){q.clear(8,28,1,1);q.clear(12,28,2,1);q.clear(18,28,1,1);q.clear(22,28,1,1)}});
          if(cls==="mage"){P(bodyAcc,q=>q.rect(7,27,17,1),F);P(bodyLt,q=>q.rect(15,20,1,7),F)}
          if(cls==="chrono"){P(bodyMet,q=>q.rect(7,27,17,1),F);P(bodyDk,q=>q.rect(8,25,15,1),F)}
          if(cls==="invoc")[9,13,17,21].forEach((x,i)=>px(x,25+i%2,bodyAcc));
        }else{
          /* Robe d'apprenti effilochée et rapiécée (sans cape/robe équipée) */
          P(RAG,q=>{q.poly([[9,18],[21,18],[22,27],[8,27]]);q.clear(9,27,2,1);q.clear(14,27,1,1);q.clear(19,27,2,1)});
          P(RAGP,q=>q.rect(11,22,3,3),F);px(11,22,RAGD);px(13,24,RAGD);
        }
        P(AF?AF.th.pri:SAND,q=>{q.rect(10+step,29,4,1);q.rect(17+step,29,4,1)},F);
        if(AF&&AF.tier>=2){px(11+step,29,AF.th.acc);px(18+step,29,AF.th.acc)}
      }else{
        const LG={guerrier:"#6a5a52",archer:"#785d44",gardien:bodyTheme?STD:"#6b6058",peste:"#6e563c",berserk:skin,invoc:"#483d46"}[cls]||"#6a5a52";
        P(LG,q=>{q.rect(10,21,5,5);q.rect(16+step,21,5,5)},LG===skin?SK:undefined);
        if(AF){
          const BT2=AF.cls==="guerrier"||AF.cls==="gardien"?AF.th.met:AF.th.pri;
          P(BT2,q=>{q.rect(9,26,6,4);q.rect(16+step,26,6,4);q.px(22+step,28);q.px(22+step,29)});
          const cTrim=AF.cls==="berserk"?AF.th.sec:AF.th.pri;
          P(cTrim,q=>{q.rect(9,26,6,1);q.rect(16+step,26,6,1)},F);
          if(AF.tier>=2){px(11,27,AF.th.acc);px(18+step,27,AF.th.acc)}
          if(AF.tier>=3){px(14,26,AF.th.met);px(21+step,26,AF.th.met)}
        }else{
          /* Sandales / bandes de toile usées (sans bottes équipées) */
          P(SAND,q=>{q.rect(10,27,5,3);q.rect(16+step,27,5,3);q.px(21+step,29)});
          P(SANDD,q=>{q.rect(10,29,5,1);q.rect(16+step,29,6,1);q.px(12,27);q.px(18+step,27)},F);
        }
      }
      up();
      const chest=c=>P(c,q=>{q.rect(9,11,13,9);q.clear(9,11,1,1);q.clear(21,11,1,1)},c===skin?SK:undefined);
      const belt=c=>{
        const bc=AB?AB.th.pri:(bodyTheme?c:ROPE);P(bc,q=>q.rect(9,19,13,1),F);
        if(AB){const bk=AB.boss?GO:AB.th.met;px(15,19,bk);px(16,19,bk);if(AB.boss||AB.tier>=2){px(15,18,AB.th.acc);px(16,18,AB.th.acc)}}
        else if(!bodyTheme){px(15,19,ROPED);px(15,20,ROPE)}
      };
      const skirt=(c,h,cut)=>P(c,q=>{q.rect(9,20,13,h);cut.forEach(x=>q.clear(x,19+h,1,1))});
      if(bodyTheme){
        /* Tenue complète de classe quand une cape/robe/armure est équipée */
        if(cls==="guerrier"){chest(bodyMet);P(mix(bodyMet,DARK,.3),q=>{q.rect(10,16,11,1);q.rect(15,12,1,4)},F);skirt(bodyCol,3,[15]);belt(LED);if(!AB){px(15,19,GO);px(16,19,GO)}P(bodyCol,q=>q.rect(11,11,9,3),{dk:.2});P(bodyMet,q=>q.ell(9.5,12.5,2.4,2.2));px(9,12,bodyAcc)}
        if(cls==="archer"){chest(bodyCol);P(LE,q=>q.line(10,12,20,18),F);skirt(bodyCol,3,[9,12,15,18,21]);belt(LED);if(!AB)px(14,19,GO);P(bodyDk,q=>q.poly([[8,10],[23,10],[22,13],[9,13]]));px(15,11,bodyAcc);px(16,11,bodyAcc)}
        if(cls==="mage"){chest(bodyCol);P(bodyLt,q=>q.rect(15,13,1,6),F);belt(GO);P(bodyDk,q=>q.poly([[7,10],[24,10],[22,14],[9,14]]));px(15,12,bodyAcc);px(16,12,bodyAcc)}
        if(cls==="gardien"){chest(bodyMet);P(bodyCol,q=>q.rect(13,12,5,11));P(bodyAcc,q=>{q.rect(15,13,1,5);q.rect(14,14,3,1)},F);P(bodyMet,q=>{q.rect(9,20,4,3);q.rect(18,20,4,3)});belt(LED);P(bodyMet,q=>q.ell(9,12.5,2.8,2.6))}
        if(cls==="peste"){chest(bodyTheme.sec);skirt(bodyCol,3,[10,13,16,19]);belt("#4a7a3a");if(!AB){px(12,19,"#c94a5a");px(18,19,"#c94a5a")}P(bodyCol,q=>q.poly([[7,10],[24,10],[23,13],[21,15],[18.5,13],[15.5,16],[12.5,13],[10,15],[8,13]]))}
        if(cls==="chrono"){chest(bodyCol);belt(bodyDk);P(bodyMet,q=>q.poly([[8,10],[23,10],[15.5,15]]),F);P(bodyCol,q=>q.poly([[10,10],[21,10],[15.5,13]]),F);P(bodyAcc,q=>q.ell(15.5,16.5,1.6,1.6));px(15,16,B);px(16,17,B)}
        if(cls==="berserk"){chest(skin);[[15,12],[15,13],[15,14],[11,15],[12,15],[13,15],[14,15],[16,15],[17,15],[18,15],[19,15],[15,17]].forEach(([x,y])=>px(x,y,skD));[[10,13],[11,14],[12,13]].forEach(([x,y])=>px(x,y,"#c8302a"));
          P(bodyTheme.sec,q=>q.line(10,11,20,18),F);skirt(bodyCol,4,[9,15,21]);belt(LED);if(!AB){px(15,19,BONE);px(16,19,BONE)}}
        if(cls==="invoc"){chest(bodyCol);belt(BONE);P(mix(bodyCol,DARK,.5),q=>q.poly([[7,10],[24,10],[23,14],[15.5,17],[8,14]]));[[15,12],[16,13],[15,14],[14,13]].forEach(([x,y])=>px(x,y,bodyAcc))}
      }else{
        /* Tenue de départ « pouilleux » : t-shirt/tunique abîmée, toile rapiécée, cuir craquelé pour l'Invocateur */
        if(cls==="guerrier"){
          chest(RAG);P(RAGP,q=>q.rect(11,13,3,3),F);px(18,16,RAGD);px(19,15,RAGD);
          skirt(RAG,2,[10,14,15,20]);belt(ROPE);
        }
        if(cls==="archer"){
          chest(RAG);P(ROPE,q=>q.line(10,12,20,18),F);P(RAGP,q=>q.rect(16,12,3,2),F);
          skirt(RAG,2,[9,12,16,19,21]);belt(ROPE);
        }
        if(cls==="mage"){
          chest(RAG);P(RAGD,q=>q.rect(14,11,3,2),F);P(RAGP,q=>q.rect(17,14,3,3),F);px(12,16,RAGD);belt(ROPE);
        }
        if(cls==="gardien"){
          chest(RAG);P(RAGP,q=>q.rect(11,12,4,4),F);P(RAGD,q=>{q.rect(16,13,3,1);q.rect(17,12,1,3)},F);
          skirt(RAGD,2,[12,18]);belt(ROPE);
        }
        if(cls==="peste"){
          chest("#8c7656");P(RAGP,q=>q.rect(10,13,4,3),F);P(RAG,q=>q.rect(16,15,3,3),F);
          skirt("#7a6448",2,[10,13,17,20]);belt(ROPE);
        }
        if(cls==="chrono"){
          chest(RAG);P(RAGD,q=>q.line(11,11,19,18),F);P(RAGP,q=>q.rect(11,15,3,2),F);belt(ROPE);
        }
        if(cls==="berserk"){
          chest(skin);[[15,12],[15,13],[15,14],[11,15],[12,15],[13,15],[14,15],[16,15],[17,15],[18,15],[19,15],[15,17]].forEach(([x,y])=>px(x,y,skD));
          [[10,13],[11,14],[12,13]].forEach(([x,y])=>px(x,y,"#a8322c"));
          skirt(RAGD,3,[9,12,15,18,21]);P(RAGP,q=>q.rect(12,20,3,2),F);belt(ROPE);
        }
        if(cls==="invoc"){
          /* Cuir abîmé et rapiécé (au lieu d'une grande robe de départ) */
          chest(OLDRAG);P(OLDLD,q=>{q.line(11,12,14,15);q.line(18,13,16,17)},F);
          P("#7a5c4a",q=>q.rect(11,15,3,3),F);px(12,15,ROPE);px(18,12,ROPE);px(17,16,ROPE);
          skirt(OLDLD,3,[9,11,15,19,21]);belt(ROPE);
        }
      }
      if(pull>0){const n=W2(0,-3-pull);P(bodyTheme?bodyCol:skin,q=>q.line(10,14,n[0]-1,n[1],2));hand(n[0],n[1],GL)}});

    /* ----- calque du bras avant et de l'arme (et bouclier du Gardien) ----- */
    const am=((T.arm[f]%360)+360)%360,behind=am>150&&am<300;
    const frontArm=()=>lay(()=>{up();
      if(cls==="gardien"){
        /* Gardien : arme derrière le bouclier + pavois équipé (ou planches fendues sans bouclier) */
        if(AW||!AS)drawWeapon(effWCls,AW);
        P(SL,q=>q.line(sx-.5,sy,hx-.5,hy,2));
        const cx=hx+3,cy=hy+1;
        if(AS){
          const sm=AS.th.met,sp=AS.th.pri,sa=AS.th.acc,st2=AS.tier;
          if(AS.cls==="berserk"){
            P(sp,q=>q.ell(cx,cy,5.8,5.8));P(sm,q=>q.ell(cx,cy,2.2,2.2),F);if(st2>=2)px(cx,cy,sa);
          }else{
            P(sm,q=>q.poly([[cx-5,cy-8],[cx+5,cy-8],[cx+5,cy+2],[cx,cy+9],[cx-5,cy+2]]));
            P(sp,q=>q.poly([[cx-3.5,cy-6.5],[cx+3.5,cy-6.5],[cx+3.5,cy+1.5],[cx,cy+7],[cx-3.5,cy+1.5]]));
            P(sa,q=>{q.rect(cx-.5,cy-5,1,8);q.rect(cx-2.5,cy-3,5,1)},F);
            if(st2>=3){px(cx-5,cy-8,sa);px(cx+5,cy-8,sa);px(cx,cy+9,W)}
          }
        }else{
          /* Bouclier de départ en planches de bois fendues et clouées */
          P(WOOD,q=>{q.rect(cx-3,cy-5,7,10);q.clear(cx+3,cy-5,1,2);q.clear(cx-3,cy+4,1,1)});
          P(WOODD,q=>{q.line(cx-1,cy-5,cx-1,cy+4);q.line(cx+1,cy-4,cx+1,cy+4);q.rect(cx-3,cy-1,6,1)},F);
          px(cx-2,cy-3,RUST);px(cx+2,cy-3,RUST);px(cx-2,cy+2,RUST);px(cx+2,cy+2,RUST);
        }
        if(bodyTheme){P(bodyMet,q=>q.ell(sx+.5,sy-1.5,3,2.6));px(sx,sy-2,bodyAcc)}
      }else{
        if(!wIsStaff||anim==="staff"||anim==="cast")drawWeapon(effWCls,AW);
        P(SL,q=>q.line(sx-.5,sy,hx-.5,hy,2),SL===skin?SK:undefined);
        hand(hx,hy,GL);
        if(bodyTheme&&cls==="guerrier"){P(bodyMet,q=>q.ell(sx,sy-1.5,2.5,2.3));px(sx+1,sy-2,bodyAcc)}
        if(bodyTheme&&cls==="berserk"){P(bodyTheme.sec,q=>q.ell(sx,sy-2,2.5,1.7),{lt:.5});px(sx+1,sy-4,bodyTheme.tier>=3?bodyAcc:BONE)}
      }
    });
    if(behind)frontArm();

    /* ----- calque de la tête : visage + coiffe dynamique selon l'objet équipé (ou tête nue / ébouriffée par défaut) ----- */
    lay(()=>{up();
      const face=(c=skin,cx=15.5,cy=4.5,rx=6.6,ry=5.6)=>P(c,q=>q.ell(cx,cy,rx,ry),SK);
      const cap=(c,ry=4.8)=>P(c,q=>{q.ell(15.5,1.2,7.3,ry);q.clear(11,3,12,9);q.rect(8,3,3,5)});
      let mouth=1,blush=1,EY=B;
      if(AH){
        /* Coiffe équipée / transmogrifiée : adopte la silhouette de la classe de l'objet + palette et menace de la zone */
        const hc=AH.th.pri,h2=AH.th.sec,hm=AH.th.met,ha=AH.th.acc,ht=AH.tier,hCls=AH.cls;
        if(hCls==="invoc"){
          P(mix(hc,DARK,.45),q=>{q.ell(15.5,2.5,8.4,8);q.poly([[10,-3],[6,-10-(ht>=3?2:0)],[13,-5]]);q.poly([[21,-3],[25,-10-(ht>=3?2:0)],[18,-5]])});
          P(hc,q=>q.ell(16,5.3,5.9,5.3),F);P("#1c0e2e",q=>q.ell(16,5.5,5,4.4),F);
          px(15,-2,ha);px(16,-3,ha);px(8,4,ha);px(23,4,ha);
          if(ht>=3){px(7,-10,ha);px(24,-10,ha)}
          mouth=0;blush=0;EY=ha;
        }else if(hCls==="berserk"){
          face();
          if(cls==="berserk")P(hair,q=>{q.rect(11,8,10,2);q.rect(12,10,8,1);q.clear(15,8,3,1)});
          P(hm,q=>{q.ell(15.5,.8,7.6,4.8);q.clear(8,3,16,9)});P(hc,q=>q.rect(8,1,15,2));
          px(15,1,ha);px(16,1,ha);
          const hornC=ht>=4?ha:h2;
          P(hornC,q=>{q.poly([[10,0],[5,-2],[3,-9-(ht>=3?2:0)],[6,-9],[8,-4],[12,-2]]);q.poly([[21,0],[26,-2],[28,-9-(ht>=3?2:0)],[25,-9],[23,-4],[19,-2]])});
          if(ht>=3){px(4,-10,W);px(27,-10,W)}
          if(cls==="berserk"){blush=0;mouth=0}
        }else if(hCls==="guerrier"){
          face();
          P(hm,q=>{q.ell(15.5,1.2,7.6,5.4);q.clear(11,3,11,9);q.rect(8,3,3,6);q.rect(21,3,2,5)});
          P(hc,q=>q.rect(8,1,15,2));
          P(ha,q=>q.poly([[11,-4],[15,-10-(ht>=3?2:0)],[20,-7],[15,-4],[9-sw,-2],[6-sw,3],[4-sw,0],[7-sw,-4]]));
          if(ht>=3){px(8,2,ha);px(22,2,ha)}
        }else if(hCls==="gardien"){
          face();
          P(hm,q=>{q.ell(15.5,1.2,7.8,5.6);q.clear(11,3,10,8);q.rect(8,3,3,7);q.rect(21,2,2,7)});
          P(hc,q=>q.rect(8,2,15,1),F);P(hm,q=>q.rect(15,2,2,4),F);
          P(ht>=2?ha:GO,q=>{q.rect(9,-2,13,2);q.px(10,-4);q.px(15,-5-(ht>=3?2:0));q.px(16,-5-(ht>=3?2:0));q.px(21,-4)},F);
        }else if(hCls==="mage"){
          face();P(hair,q=>{q.rect(8,3,3,7);q.rect(21,3,2,6)});
          P(hc,q=>{q.poly([[9,0],[11,-6],[7,-12-(ht>=3?1:0)],[14,-9],[19,-5],[22,0]]);q.ell(15.5,1,10.8,1.5)});
          P(hm,q=>q.rect(10,-1,12,1),F);px(15,-4,ha);px(14,-3,ha);px(16,-3,ha);px(15,-3,W);
          if(ht>=3)px(7,-12,ha);
        }else if(hCls==="archer"){
          face();cap(hair,4.2);
          P(hc,q=>{q.poly([[8,0],[10,-6],[17,-7],[22,-1]]);q.poly([[6,2],[8,-1],[23,-1],[27,2],[23,2]])});
          P(mix(hc,DARK,.35),q=>q.rect(9,0,14,1),F);
          P(ha,q=>q.poly([[11,-5],[5,-11-(ht>=3?1:0)],[9,-11],[14,-6]]));
          if(ht>=3)px(6,-11,W);
        }else if(hCls==="peste"){
          face();cap(hair,4.5);P(hair,q=>{q.rect(8,3,3,8);q.rect(21,3,2,7)});
          P(h2,q=>{q.line(11,-2,7,-8);q.line(7,-8,7,-11);q.line(9,-5,4,-8);q.line(20,-2,24,-8);q.line(24,-8,24,-11);q.line(22,-5,27,-8)},F);
          P(hc,q=>{q.ell(9.5,.5,1.8,1.4);q.ell(15.5,-.5,1.9,1.7);q.ell(21.5,.5,1.8,1.4)});
          px(15,0,ha);if(ht>=2){px(7,-11,ha);px(24,-11,ha)}
        }else{
          /* Chronomancien */
          P(hc,q=>q.ell(15.5,2.5,8,7.6));P(hm,q=>q.ell(16,5.3,5.9,5.3),F);face(skin,16,5.5,5,4.4);
          P(ha,q=>{q.rect(14,-4,3,1);q.rect(15,-3,1,1);q.rect(14,-2,3,1);if(ht>=2){q.px(10,-4);q.px(15,-7);q.px(21,-4)}},F);
          if(cls==="chrono"){P("#ece6d6",q=>{q.rect(12,8,8,2);q.rect(13,10,6,2);q.rect(15,12,2,1)});mouth=0}
        }
        if(ht>=4&&hCls!=="invoc"){EY=ha}
      }else{
        /* Sans coiffe équipée : tête nue et cheveux ébouriffés de débutant (pas de chapeau, casque ni capuche gratuite) */
        if(cls==="guerrier"){face();P(hair,q=>{q.ell(15.5,1.2,7.3,4.8);q.clear(11,3,12,9);q.rect(8,3,3,5);q.poly([[8,2],[5,-2],[10,-2]]);q.poly([[10,-1],[9,-6],[14,-3]]);q.poly([[14,-3],[16,-6],[19,-3]]);q.poly([[18,-3],[21,-5],[22,-1]]);q.px(12,3);q.px(16,3);q.px(21,3)});
          P(RAGD,q=>q.rect(9,1,14,1),F);px(7-sw,3,RAGD)}
        if(cls==="archer"){face();cap(hair,4.5);P(hair,q=>{q.px(11,3);q.px(12,3);q.px(13,3);q.px(17,3);q.px(21,3);q.px(22,3);q.px(22,4);q.poly([[11,-2],[13,-5],[16,-3]])},F)}
        if(cls==="mage"){face();cap(hair,4.8);P(hair,q=>{q.rect(8,2,3,9);q.rect(21,3,2,7);q.px(11,3);q.px(12,3);q.px(20,3);q.poly([[13,-3],[15,-6],[17,-3]])})}
        if(cls==="gardien"){face();cap(hair,4.6);P(hair,q=>{q.rect(8,3,3,6);q.rect(21,3,2,5);q.px(12,3);q.px(19,3);q.px(14,-3);q.px(17,-3)})}
        if(cls==="peste"){face();cap(hair,4.7);P(hair,q=>{q.rect(8,3,3,9);q.rect(21,3,2,8);q.px(11,3);q.px(12,3);q.px(20,3)});
          P(WOOD,q=>q.line(19,-2,23,-5),F);px(23,-6,"#6c8a50");px(22,-4,"#6c8a50")}
        if(cls==="chrono"){face();cap(hair,4.6);P(hair,q=>{q.rect(8,3,3,7);q.rect(21,3,2,6);q.rect(12,8,8,2);q.rect(13,10,6,2);q.rect(15,12,2,1)});px(15,8,skin);px(16,8,skin);mouth=0}
        if(cls==="berserk"){face();cap(hair,4.8);P(hair,q=>{q.rect(8,3,3,7);q.rect(21,3,2,6);q.rect(11,8,10,2);q.rect(12,10,8,1);q.px(13,11);q.px(16,11);q.px(18,11);q.clear(15,8,3,1);q.poly([[10,-2],[12,-6],[15,-3]]);q.poly([[16,-3],[19,-6],[21,-2]])});
          [[12,3],[13,3],[14,4],[20,3],[19,3],[18,4]].forEach(([x,y])=>px(x,y,B));[[11,7],[12,8],[21,7],[20,8]].forEach(([x,y])=>px(x,y,"#a8322c"));blush=0;mouth=0}
        if(cls==="invoc"){face();cap(hair,4.9);P(hair,q=>{q.rect(8,2,3,8);q.rect(21,3,2,7);q.px(11,3);q.px(12,3);q.px(15,3);q.px(20,3);q.px(21,3)});blush=0}
      }
      [13,18].forEach(x=>{if(blink){px(x,6,EY);px(x+1,6,EY)}else{for(let y=4;y<7;y++){px(x,y,EY);px(x+1,y,EY)}px(x,4,W)}});
      if(blush){px(11,7,"#f29a8e");px(12,7,"#f29a8e");px(20,7,"#f29a8e");px(21,7,"#f29a8e")}
      if(mouth){px(16,8,"#c07a62");px(17,8,"#c07a62")}});
    if(!behind)frontArm();

    /* ----- calque avant : étincelles d'aura flottantes (zones 6 à 11) ----- */
    if(AURA&&AURA.tier>=3){
      const nSp=AURA.tier>=4?5:2;
      for(let i=0;i<nSp;i++){
        const x=Math.round(6+((i*9+f*3)%20)),y=Math.round(28-((f*3+i*6)%30));
        s.set(x,y,i%2===0?AURA.c2:AURA.c1);
        if(AURA.tier>=4&&(f+i)%3===0)s.set(x,y-1,W);
      }
    }
    return s}
  /* image fixe du héros (40×44) : création du personnage, inventaire, visiteurs. pose : "" ou "blink" ("atk" et "up" renvoient une image d'animation) */
  function hero(cls,col,pose="",arm){
    const k="h:"+cls+col+pose+(arm?arm.k:"");if(cache[k])return cache[k];
    if(pose==="atk"||pose==="up")return cache[k]=heroF(cls,col,pose==="up"?"cast":"atk",pose==="up"?7:6,0,0,arm);   /* poses d'action : cadre large de 64 px */
    const s=heroSpr(cls,col,"idle",0,pose==="blink",arm);
    /* cadre de 40 px centré sur le corps, légèrement décalé si une arme dépasse à droite */
    const W=s.w;let x0=W,x1=-1;for(let y=0;y<W;y++)for(let x=0;x<W;x++)if(s.p[y*W+x]){if(x<x0)x0=x;if(x>x1)x1=x}
    const sh=Math.max(0,Math.min(6,Math.min(x1-(HP-4+39),x0-(HP-4)))),o=new Spr(40,44);o.shadow(19.5-sh,42,9,1.7);for(let y=0;y<44;y++)for(let x=0;x<40;x++){const c=s.p[(y+HP-12)*W+x+HP-4+sh];if(c)o.p[y*40+x]=c}
    return cache[k]=o.url()}
  function heroF(cls,col,anim,f,blink,tight,arm){
    if(anim==="atk")anim=ATK[cls]||"atk";
    const k="hf:"+cls+col+anim+f+(blink?"b":"")+(tight?"t":"")+(arm?arm.k:"");if(cache[k])return cache[k];const T=HA[anim]||HA.idle,s=heroSpr(cls,col,anim,f,blink,arm);
    /* décalage du corps ; en portrait, on descend le cadre sur le buste */
    const W=s.w,P=tight?0:HP,N=32+2*P,o=new Spr(N,N),ox=T.dx[f]-HP+P,oy=tight?Math.max(Math.min(0,T.dy[f])-HP+11,-(s.p.findIndex(c=>c)/W|0)):Math.min(0,T.dy[f])-HP+P;if(!tight)o.shadow(15.5+P,30+P,9,1.7);
    for(let y=0;y<W;y++)for(let x=0;x<W;x++){const c=s.p[y*W+x];if(c){const X=x+ox,Y=y+oy;if(X>=0&&Y>=0&&X<N&&Y<N)o.p[Y*N+X]=c}}
    return cache[k]=o.url()}
  const heroFrames=(cls,col,anim,blink,arm)=>{const k="hfs:"+cls+col+anim+(blink?1:0)+(arm?arm.k:"");return cache[k]||(cache[k]=Array.from({length:10},(_,f)=>heroF(cls,col,anim,f,blink&&f===5,0,arm)),cache[k].sc=((32+2*HP)/32).toFixed(3),cache[k])};

  /* ---------- Compagnons-créatures : golem, dragonnet, phénix (24×24, 10 images par mouvement) ---------- */
  const BA={
    /* idle : battement d'ailes + petit vol de haut en bas (phénix, dragonnet), balancement lourd (golem) */
    idle:Array.from({length:10},(_,f)=>({w:Math.sin(2*Math.PI*f/10),bob:Math.round(-Math.sin(2*Math.PI*f/10+Math.PI)*1.8),fx:0,arm:Math.sin(2*Math.PI*f/10),open:0})),
    /* atk : élan en arrière puis coup vers l'avant (piqué, souffle, coup de poing) */
    atk:[{w:-.2,bob:0,fx:0,arm:0,open:0},{w:-.6,bob:-1,fx:-1,arm:-.5,open:0},{w:-1,bob:-2,fx:-2,arm:-1,open:0},{w:-1,bob:-2,fx:-2,arm:-1,open:0},{w:.3,bob:0,fx:1,arm:.2,open:1},{w:1,bob:1,fx:3,arm:1,open:1},{w:1,bob:1,fx:3,arm:1,open:1},{w:.6,bob:0,fx:2,arm:.6,open:1},{w:.1,bob:0,fx:1,arm:.2,open:0},{w:0,bob:0,fx:0,arm:0,open:0}]};
  /* pad : image 32×32 avec marge (ailes et crête du phénix, souffle du dragonnet) ; sans pad, image 24×24 pour les portraits */
  function beastF(id,col,anim,f,pad){const k="bf:"+id+col+anim+f+(pad?"p":"");if(cache[k])return cache[k];const P=(BA[anim]||BA.idle)[f],s=pad?new Spr(32,32,4,7):new Spr(24,24),B="#1c1020";
    if(id==="phenix"){const y=P.bob,x=P.fx,fl=["#ffd36a","#ff8a3c","#ff5a3c"];
      /* queue de flammes qui ondule */
      s.part(fl[1],q=>q.poly([[7+x,14+y],[1+x,17+y+Math.round(P.w)],[3+x,20+y],[8+x,17+y]]));s.part(fl[0],q=>q.poly([[7+x,15+y],[2+x,22+y-Math.round(P.w)],[6+x,21+y],[9+x,17+y]]),{flat:1});
      /* aile arrière */
      const wy=Math.round(P.w*6);s.part(mix(col,DARK,.25),q=>q.poly([[10+x,12+y],[4+x,10+y-wy],[7+x,14+y]]));
      s.part(col,q=>{q.ell(11+x,14+y,5,4);q.ell(16+x,9+y,3.2,3.2)});                                  /* corps et tête */
      s.part("#fff2c2",q=>q.ell(12+x,16+y,3,2),{flat:1});
      s.part(fl[0],q=>{q.poly([[15+x,6+y],[14+x,2+y],[17+x,5+y]]);q.poly([[17+x,6+y],[18+x,2+y],[19+x,6+y]])});   /* crête */
      s.part("#ffd36a",q=>q.poly([[19+x,9+y],[22+x,10+y],[19+x,11+y]]),{flat:1});                          /* bec */
      s.set(17+x,8+y,B);
      /* aile avant : monte et descend */
      const ty=Math.round(P.w*8);s.part(mix(col,"#ffffff",.25),q=>q.poly([[10+x,12+y],[2+x,5+y-ty],[5+x,9+y-Math.round(ty/2)],[8+x,12+y-Math.round(ty/3)],[14+x,14+y]]));
      s.part(fl[0],q=>{q.line(2+x,5+y-ty,5+x,8+y-Math.round(ty/2))},{flat:1});s.part(fl[1],q=>q.px(3+x,6+y-ty),{flat:1});
      s.part("#ffd36a",q=>{q.rect(10+x,19+y,1,2);q.rect(13+x,19+y,1,2)},{flat:1})}
    else if(id==="dragonnet"){const y=P.bob>0?1:0,x=P.fx,dk=mix(col,DARK,.35),bl="#ffe3b0";
      s.part(col,q=>{q.poly([[6+x,16+y],[2+x,14+y-Math.round(P.w)],[1+x,10+y-Math.round(P.w*2)],[3+x,12+y],[7+x,14+y]])});   /* queue */
      const wy=Math.round(P.w*4);s.part(dk,q=>q.poly([[10+x,11+y],[5+x,5+y-wy],[8+x,10+y],[12+x,12+y]]));                       /* aile */
      s.part(col,q=>{q.ell(11+x,15+y,5,4.5);q.ell(16+x,9+y,3.6,3.2);q.rect(17+x,9+y,4+(P.open?1:0),2)});                          /* corps, tête, museau */
      s.part(bl,q=>q.ell(11+x,17+y,3,2.2),{flat:1});
      s.part("#f7e4b8",q=>{q.poly([[14+x,6+y],[13+x,3+y],[15+x,5+y]]);q.poly([[17+x,6+y],[18+x,3+y],[18+x,6+y]])});                 /* cornes */
      s.set(17+x,8+y,B);if(P.open){s.set(21+x,11+y,"#e8483c");s.set(20+x,11+y,"#e8483c")}
      s.part(dk,q=>{q.rect(8+x,19+y,2,3);q.rect(13+x,19+y,2,3)});
      s.part(mix(col,"#ffffff",.25),q=>q.poly([[11+x,12+y],[7+x,6+y-wy],[10+x,11+y]]))}
    else{/* golem */const y=P.bob>0?1:0,x=P.fx,dk=mix(col,DARK,.35),gl="#7ae0ff",a=Math.round(P.arm*3);
      s.part(dk,q=>{q.rect(4,13+y+a,3,7);q.rect(17+x,12+y-a,3,7+(P.open?1:0))});                     /* bras */
      s.part(col,q=>{q.rect(7,9+y,10,10);q.clear(7,9+y,1,1);q.clear(16,9+y,1,1)});                  /* corps */
      s.part(col,q=>{q.rect(8,3+y,8,6)});                                                            /* tête */
      s.part(dk,q=>{q.rect(8,19+y,3,3);q.rect(13,19+y,3,3)});                                        /* jambes */
      s.part(mix(col,DARK,.5),q=>{q.line(9,12+y,12,15+y);q.line(14,10+y,13,13+y)},{flat:1});         /* fissures */
      s.set(10,6+y,gl);s.set(11,6+y,gl);s.set(13,6+y,gl);s.set(14,6+y,gl);
      if(P.open)s.part(gl,q=>q.px(18+x,20+y-a),{flat:1})}
    s.outline();s.shadow(pad?16:12,pad?29:22,6,1.2);return cache[k]=s.url()}
  const beastFrames=(id,col,anim)=>{const k="bfs:"+id+col+anim;return cache[k]||(cache[k]=Array.from({length:10},(_,f)=>beastF(id,col,anim,f,1)),cache[k].sc="1.333",cache[k])};

  /* ---------- Outils de métier (5 métiers × 12 paliers de ressources) & 10 designs de PNJ ouvriers ---------- */
  /* Palette par métier et palier 0..11 : [lame/tête, bord/ornement, manche, éclat/gemme] */
  const TOOL_PAL={
    bucheron:[
      ["#9aa2b0","#cfd6e2","#a68052","#d8e2ee"], /* 0 Frêne */
      ["#b08862","#e2b482","#845430","#f0c898"], /* 1 Châtaignier */
      ["#7e8a74","#b4c498","#5c4028","#d8ecaa"], /* 2 Noyer */
      ["#b8c2d0","#ffd468","#7a5432","#fff0a8"], /* 3 Chêne */
      ["#d85830","#ffa242","#945630","#ffe488"], /* 4 Érable */
      ["#48866e","#8cd8b8","#4c3424","#ff5c5c"], /* 5 If */
      ["#dce4ec","#ffffff","#e6dfd0","#92e0b4"], /* 6 Bouleau */
      ["#d66488","#ffb8d4","#8e4234","#ffe6f4"], /* 7 Merisier */
      ["#5ca072","#96e4ac","#745e46","#d8ffe0"], /* 8 Orme */
      ["#e45824","#ffc444","#3a2c2c","#fff49c"], /* 9 Charme / Volcan */
      ["#6c86b8","#c8e4ff","#282436","#ffffff"], /* 10 Ébène */
      ["#9e3cd4","#ff78e8","#54203c","#ffe0ff"]  /* 11 Séquoia */
    ],
    mineur:[
      ["#a8b2c0","#e0e6f0","#86603c","#ffffff"], /* 0 Fer */
      ["#de7e38","#ffb878","#7a5234","#56d8b4"], /* 1 Cuivre */
      ["#c2ccd6","#f0f6fc","#6c5a48","#ffffff"], /* 2 Étain */
      ["#e4eef8","#ffffff","#624e42","#a8dcff"], /* 3 Argent */
      ["#f2be34","#fff098","#7a4a24","#ffffff"], /* 4 Or */
      ["#3872e8","#98d4ff","#485474","#e4f8ff"], /* 5 Cobalt */
      ["#8eb0c4","#dcf4ff","#586472","#ffffff"], /* 6 Zinc */
      ["#c85c94","#ffb6dc","#503a4c","#ffe6f4"], /* 7 Manganèse */
      ["#dc6c3e","#ffc294","#6e3c28","#fff0c8"], /* 8 Bauxite */
      ["#eef6ff","#ff9c3c","#3c2c34","#fff4a8"], /* 9 Platine */
      ["#5cece0","#ffffff","#465272","#b8ffff"], /* 10 Mithril */
      ["#6e30c8","#ff68e0","#26183a","#ffe0ff"]  /* 11 Obsidienne */
    ],
    paysan:[
      ["#aeb6c2","#f2ce50","#9e7a3c","#fff2a8"], /* 0 Blé */
      ["#c4ae72","#f0dc8c","#8e763e","#fff8cc"], /* 1 Orge */
      ["#c2c09a","#f2e8b4","#7a7242","#ffffff"], /* 2 Avoine */
      ["#72b84a","#c0f47c","#5a422c","#e6ffaa"], /* 3 Houblon */
      ["#d49242","#ffe090","#8e6232","#fff6c8"], /* 4 Seigle */
      ["#64b0f4","#c2e8ff","#487e58","#fff4a4"], /* 5 Lin */
      ["#f6cc36","#fff088","#4a8e38","#ff9e2c"], /* 6 Maïs */
      ["#e0b468","#fff0b4","#5e843c","#ffffff"], /* 7 Millet */
      ["#dceef4","#9ef0f8","#5a9446","#ffffff"], /* 8 Riz */
      ["#d84e3c","#ffac48","#7a2e2c","#fff4a8"], /* 9 Sarrasin */
      ["#d4b472","#a8e4ff","#6a5c46","#ffffff"], /* 10 Épeautre */
      ["#e04892","#ffc2ff","#4c225a","#ffffff"]  /* 11 Quinoa */
    ],
    herboriste:[
      ["#58b448","#a8f078","#6c5234","#d8ffaa"], /* 0 Ortie */
      ["#8cb8a0","#c4a0f4","#5c685e","#ece0ff"], /* 1 Sauge */
      ["#42d48e","#b8ffe0","#3c6a52","#ffffff"], /* 2 Menthe */
      ["#9ee054","#fff478","#5c7436","#ffffff"], /* 3 Mélisse */
      ["#e6f0ff","#ffd44a","#507458","#ffffff"], /* 4 Edelweiss */
      ["#b460d8","#ecc0ff","#8c643c","#fff0ff"], /* 5 Mandragore */
      ["#8e66f0","#e0ccff","#4a6c4c","#ffffff"], /* 6 Lavande */
      ["#68b448","#ffe898","#745034","#fff8cc"], /* 7 Thym */
      ["#643298","#d49aff","#364c38","#f4d8ff"], /* 8 Belladone */
      ["#e64438","#ffd468","#b88a3c","#fff4a8"], /* 9 Ginseng */
      ["#ff6ec4","#ffe878","#3a7a4c","#ffffff"], /* 10 Orchidée */
      ["#f078c8","#fff2a8","#2a6060","#d8ffff"]  /* 11 Lotus */
    ],
    pecheur:[
      ["#c49862","#8cd0ff","#8a623a","#ffffff"], /* 0 Prairie */
      ["#72a878","#b8f098","#5c442c","#d6ff78"], /* 1 Bois */
      ["#649a80","#a8e0b8","#4c4832","#d8f8cc"], /* 2 Marais */
      ["#949eb8","#ffd86a","#5a483c","#fff4b0"], /* 3 Mines */
      ["#e6a844","#7cf0f8","#a46c36","#fff4b8"], /* 4 Dunes */
      ["#9ed8fc","#ffffff","#5888b8","#d8ffff"], /* 5 Givre */
      ["#7898c0","#ffe870","#485468","#ffffff"], /* 6 Falaises */
      ["#3cc484","#d2ff7a","#6a5232","#a8ffe0"], /* 7 Jungle */
      ["#ff7c94","#8ef4ff","#d2aa6a","#ffffff"], /* 8 Récifs */
      ["#ff6822","#ffe05a","#3c282a","#fff6b0"], /* 9 Volcan */
      ["#8ca8f0","#e8f4ff","#504878","#ffd888"], /* 10 Ruines */
      ["#b84cf0","#68f4ff","#2e1848","#ffb0ff"]  /* 11 Abîme */
    ]
  };

  /* 10 designs de PNJ ouvriers uniques (coiffure, couvre-chef, peau, vêtements, accessoires) */
  const WORKER_LOOKS=[
    {skin:"#f6cfa6",hair:"#6a3a22",hat:"beanie",hc:"#c84438",top:"#b84238",top2:"#7c2a24",bot:"#58483c",acc:"#8a5a34",beard:"full"},       /* 0 Gaston : bonnet rouge & flanelle */
    {skin:"#f8d6b2",hair:"#e8c25a",hat:"straw",hc:"#e6c468",top:"#8a74b8",top2:"#f2ead8",bot:"#6a5488",acc:"#4888d4",hairSty:"braid"},     /* 1 Margot : chapeau de paille & tablier */
    {skin:"#ecc098",hair:"#3c2824",hat:"goggles",hc:"#3e7c4c",top:"#c88e46",top2:"#6e4428",bot:"#4a3c34",acc:"#f2c14e",hairSty:"spiky"},   /* 2 Baptiste : bandana & lunettes de mineur */
    {skin:"#fae0c4",hair:"#c4542c",hat:"wreath",hc:"#52a848",top:"#649468",top2:"#8c623c",bot:"#684c38",acc:"#ffd268",hairSty:"bun"},      /* 3 Lison : couronne de feuilles & chignon */
    {skin:"#f2c8a2",hair:"#e8e4dc",hat:"beret",hc:"#486284",top:"#8c3648",top2:"#ece2ce",bot:"#404658",acc:"#f2c14e",beard:"stache"},      /* 4 Firmin : béret & moustache blanche */
    {skin:"#d89e72",hair:"#3a2420",hat:"scarf",hc:"#e86858",top:"#ebe4d0",top2:"#446ea8",bot:"#365688",acc:"#f2c14e",hairSty:"twins"},     /* 5 Rosalie : foulard noué & salopette */
    {skin:"#f0c49c",hair:"#b85228",hat:"ushanka",hc:"#b89c74",top:"#5a7248",top2:"#d8c4a0",bot:"#4c3e30",acc:"#9a7a4c",beard:"short"},     /* 6 Anselme : toque fourrée & barbe rousse */
    {skin:"#f6d2ae",hair:"#262230",hat:"bucket",hc:"#e8b434",top:"#2e5484",top2:"#e8b434",bot:"#243e62",acc:"#e8b434",hairSty:"bob"},       /* 7 Perrine : bob jaune & ciré marin */
    {skin:"#c88a60",hair:"#282028",hat:"flatcap",hc:"#4e5462",top:"#ede8dc",top2:"#6e4c36",bot:"#3e3c46",acc:"#e8ba48",beard:"goatee"},    /* 8 Hector : casquette plate & gilet */
    {skin:"#f4d4be",hair:"#cfd6e6",hat:"hood",hc:"#6c3e78",top:"#d6c4a4",top2:"#6c3e78",bot:"#4c3456",acc:"#7cd898",hairSty:"side"}         /* 9 Jeanne : capuche prune & besace */
  ];

  /* Icône 16×16 d'un outil de métier selon la dernière ressource débloquée (palier 0..11) */
  function tool(pid,tier){
    const t=Math.max(0,Math.min(11,tier|0)),k="tl:"+pid+":"+t;
    if(cache[k])return cache[k];
    const pal=(TOOL_PAL[pid]||TOOL_PAL.bucheron)[t],hd=pal[0],tr=pal[1],ha=pal[2],gl=pal[3];
    const s=new Spr(16,16),W="#ffffff",F={flat:1};
    let outCol=t>=11?"#341054":t>=9?"#5a1c0a":INK;
    if(pid==="bucheron"){
      s.part(ha,q=>q.line(3,13,11,5,2));
      if(t>=3)s.part(tr,q=>{q.px(4,12);q.px(8,8)},F);
      s.part(hd,q=>{q.poly([[8,3],[12,2],[14,6],[11,10],[8,7]]);if(t>=6)q.poly([[7,6],[4,3],[8,2]])},{lt:.55});
      s.part(tr,q=>{q.line(12,2,14,6);q.line(14,6,11,10)},F);
      if(t>=5)s.set(10,5,gl);if(t>=9){s.set(13,3,W);s.set(3,4,gl);s.set(13,11,gl)}
    }else if(pid==="mineur"){
      s.part(ha,q=>q.line(3,13,11,5,2));
      if(t>=3)s.part(tr,q=>{q.px(5,11);q.px(7,9)},F);
      s.part(hd,q=>{q.poly([[4,3],[9,3],[13,7],[13,12],[10,9],[8,6],[5,5]]);if(t>=6)q.rect(9,4,3,3)},{lt:.55});
      s.part(tr,q=>{q.px(4,3);q.px(13,12);q.line(8,4,12,8)},F);
      if(t>=5)s.set(10,5,gl);if(t>=9){s.set(10,5,W);s.set(4,2,gl);s.set(14,11,gl)}
    }else if(pid==="paysan"){
      s.part(ha,q=>{q.line(3,14,10,4,2);q.px(5,9);q.px(4,8)});
      s.part(hd,q=>{q.poly([[9,3],[3,3],[2,6],[6,5],[10,6]]);if(t>=6)q.poly([[9,3],[13,5],[11,7]])},{lt:.55});
      s.part(tr,q=>{q.line(3,3,9,3);q.px(2,5)},F);
      if(t>=5)s.set(9,4,gl);if(t>=9){s.set(3,3,W);s.set(13,4,gl);s.set(2,8,gl)}
    }else if(pid==="herboriste"){
      s.part(ha,q=>q.line(3,13,7,9,2));
      s.part(hd,q=>{q.poly([[6,9],[5,5],[8,2],[13,3],[13,7],[11,5],[8,5],[8,8]]);if(t>=6)q.px(13,8)},{lt:.55});
      s.part(tr,q=>{q.line(8,2,13,3);q.px(5,5)},F);
      if(t>=4)s.set(6,10,gl);if(t>=9){s.set(11,3,W);s.set(13,10,gl);s.set(4,3,gl)}
    }else{
      /* Canne à pêche : tige flexible + moulinet + fil + flotteur/leurre */
      s.part(ha,q=>{q.line(2,13,8,6,2);q.line(8,6,12,2)});
      s.part(hd,q=>{q.ell(5.5,11,1.8,1.8);if(t>=4)q.px(10,4)},{lt:.5});
      s.part(W,q=>q.line(12,3,12,9),F);
      s.part(tr,q=>q.ell(12,11,2.2,2.4),{lt:.55});
      s.set(12,10,gl);if(t>=6)s.set(11,10,W);if(t>=9){s.set(14,8,gl);s.set(10,13,gl)}
    }
    if(t>=10){s.set(2,2,gl);s.set(14,13,gl)}
    s.outline(outCol);return cache[k]=s.url()}

  /* Sprite animé d'un PNJ ouvrier (64×64 avec marge HP=16, exactement aligné sur heroSpr) */
  function workerSpr(look,pid,tier,anim,f){
    const L=WORKER_LOOKS[((look|0)%WORKER_LOOKS.length+WORKER_LOOKS.length)%WORKER_LOOKS.length];
    const t=Math.max(0,Math.min(11,tier|0));
    const prof=pid&&TOOL_PAL[pid]?pid:null;
    const useAnim=anim==="atk"?(prof==="pecheur"||prof==="herboriste"?"staff":"atk"):"idle";
    const T=HA[useAnim]||HA.idle,s=new Spr(32+2*HP,32+2*HP,HP,HP),F={flat:1},SK={dk:.17,lt:.3};
    const ink=mix(L.top,INK,.84),skin=L.skin,skD=mix(skin,DARK,.24),B="#1c1020",W="#ffffff";
    let g=s;const P=(c,fn,o)=>g.part(c,fn,o),px=(x,y,c)=>g.set(Math.round(x),Math.round(y),c);
    const u=Math.max(0,T.dy[f]),up=()=>{g.oy=HP+u},dn=()=>{g.oy=HP};
    const lay=(fn,oc=ink)=>{g=new Spr(s.w,s.h,HP,HP);fn();g.outline(oc);const p=g.p;for(let i=0;i<p.length;i++)if(p[i])s.p[i]=p[i];g=s};
    const sw=useAnim==="idle"?[0,0,0,1,1,1,1,0,0,0][f]:T.dx[f]>0?1:0;
    const ph=f*Math.PI/5,R=Math.PI/180,idle=useAnim==="idle",rest=idle?(prof==="pecheur"?36:24):0;
    const aa=(T.arm[f]-rest)*R,sx=21.5,sy=14,AL=6,hx=sx+Math.cos(aa)*AL,hy=sy+Math.sin(aa)*AL;
    const wa=((T.w[f]??-90)+(idle?12:0))*R,ux=Math.cos(wa),uy=Math.sin(wa),vx=-uy,vy=ux;
    const la=(104+(T.arm[f]-90)*-.18)*R,lsx=9.5,lsy=14,lhx=lsx+Math.cos(la)*AL,lhy=lsy+Math.sin(la)*AL;
    const hand=(x,y,c)=>{x=Math.round(x);y=Math.round(y);P(c,q=>q.rect(x-1,y-1,2,2),F);px(x,y,mix(c,DARK,.22))};
    const W2=(a,b)=>[hx+ux*a+vx*b,hy+uy*a+vy*b],ln=(q,p0,p1,w)=>q.line(p0[0],p0[1],p1[0],p1[1],w);
    const lim=len=>ux>.15?Math.min(len,(45.5-T.dx[f]-hx)/ux):len;

    /* Dessin de l'outil du métier attribué, adapté au palier de la dernière ressource débloquée (0..11) */
    const drawTool=()=>{
      if(!prof)return;
      const pal=TOOL_PAL[prof][t],hd=pal[0],tr=pal[1],ha=pal[2],gl=pal[3];
      if(prof==="bucheron"){
        const e=lim(17)-17;
        P(ha,q=>ln(q,W2(-4,0),W2(14.5+e,0)),F);
        if(t>=3)P(tr,q=>{ln(q,W2(-3,0),W2(-1,0),2);ln(q,W2(5,0),W2(6,0),2)},F);
        P(hd,q=>q.poly([W2(9.5+e,0),W2(8+e,4.2),W2(11+e,6.8),W2(15.5+e,6.2),W2(16+e,3),W2(14+e,0)]),{dk:.35});
        P(tr,q=>ln(q,W2(11+e,6.2),W2(15.2+e,5.6)),F);
        if(t>=6){
          /* Hache à double tranchant aux paliers avancés */
          P(hd,q=>q.poly([W2(10+e,0),W2(9+e,-3.8),W2(13.5+e,-4.2),W2(14.5+e,0)]),{dk:.35});
          P(tr,q=>ln(q,W2(9.5+e,-3.6),W2(13.2+e,-3.8)),F);
        }else{
          P(hd,q=>q.poly([W2(10.5+e,0),W2(12+e,-2.4),W2(13.5+e,0)]),{dk:.35});
        }
        if(t>=5)px(...W2(12+e,2.5),gl);
        if(t>=9){px(...W2(14.5+e,4.5),W);px(...W2(13+e,7.2+Math.sin(ph)),gl)}
      }else if(prof==="mineur"){
        const e=lim(16)-16;
        P(ha,q=>ln(q,W2(-4,0),W2(14+e,0)),F);
        if(t>=3)P(tr,q=>ln(q,W2(11+e,-1.5),W2(11+e,1.5),2),F);
        /* Double pointe courbée de pioche */
        P(hd,q=>q.poly([W2(12.5+e,-1),W2(11.5+e,-6.5),W2(8.5+e,-7.5),W2(10+e,-3),W2(10+e,3),W2(8.5+e,7.5),W2(11.5+e,6.5),W2(12.5+e,1)]),{dk:.35});
        P(tr,q=>{ln(q,W2(11.5+e,-6.2),W2(8.8+e,-7.2));ln(q,W2(11.5+e,6.2),W2(8.8+e,7.2))},F);
        if(t>=6)P(gl,q=>q.ell(...W2(12+e,0),1.5,1.5),F);
        if(t>=9){px(...W2(9+e,-7),W);px(...W2(9+e,7),gl)}
      }else if(prof==="paysan"){
        const e=lim(18.5)-18.5;
        P(ha,q=>{ln(q,W2(-5,0),W2(16+e,0));ln(q,W2(4,0),W2(5,2.8))},F);
        /* Grande lame courbe de faux */
        P(hd,q=>q.poly([W2(15.5+e,0),W2(14.5+e,4.5),W2(11+e,8.5),W2(6.5+e,10),W2(9.5+e,6.5),W2(12.5+e,2.5),W2(13+e,0)]),{dk:.35});
        P(tr,q=>{ln(q,W2(14.8+e,4.2),W2(11+e,8.2));ln(q,W2(11+e,8.2),W2(6.8+e,9.6))},F);
        if(t>=6)P(tr,q=>q.poly([W2(15+e,0),W2(17.5+e,-2),W2(15.5+e,-2.5)]),F);
        if(t>=5)px(...W2(13.5+e,2),gl);
        if(t>=9){px(...W2(8+e,9),W);px(...W2(12+e,8+Math.cos(ph)),gl)}
      }else if(prof==="herboriste"){
        const e=lim(13.5)-13.5;
        P(ha,q=>ln(q,W2(-3,0),W2(5+e,0),2),F);
        /* Faucille en croissant fin */
        P(hd,q=>q.poly([W2(5+e,0),W2(7+e,-3.5),W2(11+e,-4),W2(13+e,0),W2(11.5+e,4.5),W2(8+e,5.5),W2(9.5+e,2.5),W2(10.5+e,-1),W2(7.5+e,-1.5)]),{dk:.32});
        P(tr,q=>{ln(q,W2(11+e,-3.8),W2(13+e,0));ln(q,W2(13+e,0),W2(11.2+e,4.2))},F);
        if(t>=4)P(gl,q=>q.ell(...W2(4+e,0),1.4,1.4),F);
        if(t>=9){px(...W2(12.5+e,0),W);px(...W2(9+e,5.5),gl)}
      }else{
        /* Canne à pêche + moulinet + fil souple + flotteur qui oscille */
        const e=lim(19.5)-19.5;
        P(ha,q=>{ln(q,W2(-4,0),W2(11+e,0),2);ln(q,W2(11+e,0),W2(18.5+e,1))},F);
        P(hd,q=>q.ell(...W2(2.5,1.8),1.7,1.7),{lt:.45});
        if(t>=4){px(...W2(8+e,0),tr);px(...W2(14+e,.5),tr)}
        const tip=W2(18.5+e,1),sway=Math.round(Math.sin(ph)*1.5)+(useAnim==="staff"?2:0);
        const bx=Math.min(44,Math.round(tip[0]+sway)),by=Math.min(28,Math.round(tip[1]+8));
        P(W,q=>q.line(tip[0],tip[1],bx,by),F);
        P(tr,q=>q.ell(bx,by+1,1.8,2),{lt:.5});
        px(bx,by,gl);if(t>=9){px(bx+1,by+2,W);px(bx-1,by-1,gl)}
      }
    };

    /* Calque arrière : cheveux longs / tresse / capelette / capuche */
    lay(()=>{up();
      if(L.hairSty==="braid"){P(L.hair,q=>{q.poly([[8,4],[11,5],[9,15],[6-sw,17],[7-sw,11]])});px(7-sw,16,L.acc)}
      if(L.hairSty==="twins"){P(L.hair,q=>{q.ell(7-sw,7,2.4,3.4);q.ell(24+sw,7,2.4,3.4)});px(9,5,L.hc);px(22,5,L.hc)}
      if(L.hairSty==="side"){P(L.hair,q=>q.poly([[8,3],[11,4],[9,14],[6-sw,15]]));px(7-sw,13,L.acc)}
      if(L.hat==="wreath"){P(L.top,q=>q.poly([[6,10],[16,10],[13,20],[4-sw,20]]));P(L.acc,q=>q.line(5-sw,19,12,19),F)}
      if(L.hat==="hood"){P(L.hc,q=>q.poly([[6,10],[16,10],[13,22],[4-sw,23]]));P(L.acc,q=>q.px(6-sw,21),F)}
    });

    /* Calque corps : bras arrière, jambes, chaussures, tenue propre au PNJ */
    lay(()=>{up();
      const slCol=L.hat==="bucket"?L.top:L.hat==="flatcap"?L.top:L.hat==="scarf"?L.top:L.top;
      P(mix(slCol,DARK,.18),q=>q.line(lsx-.5,lsy,lhx-.5,lhy,2));hand(lhx,lhy+.5,skin);
      dn();const step=useAnim==="atk"&&(f>=4&&f<=7)?1:0;
      if(L.hat==="straw"){
        /* Robe + tablier de fermière */
        P(L.top,q=>q.poly([[9,18],[21,18],[23,28],[7,28]]));
        P(L.top2,q=>q.rect(12,18,7,9));
        P(L.bot,q=>{q.rect(10+step,28,4,2);q.rect(17+step,28,4,2)},F);
      }else{
        P(L.bot,q=>{q.rect(10,21,5,5);q.rect(16+step,21,5,5)});
        const bootC=L.hat==="bucket"?L.acc:mix(L.bot,DARK,.45);
        P(bootC,q=>{q.rect(9,26,6,4);q.rect(16+step,26,6,4);q.px(22+step,28);q.px(22+step,29)});
      }
      up();
      P(L.top,q=>{q.rect(10,10,11,11);q.rect(9,11,13,9)});
      if(L.hat==="beanie"){
        /* Chemise à carreaux + bretelles */
        P(L.top2,q=>{q.rect(10,13,11,1);q.rect(10,17,11,1);q.rect(15,10,1,10)},F);
        P(L.acc,q=>{q.rect(12,10,2,10);q.rect(18,10,2,10)},F);
      }else if(L.hat==="goggles"){
        /* Tablier de cuir épais */
        P(L.top2,q=>{q.rect(11,13,9,9);q.line(12,10,12,13);q.line(18,10,18,13)});
        px(15,15,L.acc);
      }else if(L.hat==="scarf"){
        /* Salopette denim + t-shirt rayé */
        P("#d4c8b4",q=>{q.rect(10,12,11,1);q.rect(10,15,11,1)},F);
        P(L.top2,q=>{q.rect(11,14,9,8);q.rect(12,10,2,4);q.rect(18,10,2,4)});
        px(12,14,L.acc);px(18,14,L.acc);
      }else if(L.hat==="beret"||L.hat==="flatcap"){
        /* Gilet boutonné sur chemise */
        P(L.top2,q=>{q.rect(10,11,4,9);q.rect(17,11,4,9)});
        px(14,13,L.acc);px(14,16,L.acc);px(14,19,L.acc);
      }else if(L.hat==="ushanka"){
        /* Manteau fourré */
        P(L.top2,q=>{q.rect(10,10,11,2);q.rect(10,19,11,2)},F);
        P(L.acc,q=>q.rect(10,16,11,2),F);
      }else if(L.hat==="bucket"){
        /* Ciré marin à boutons jaunes */
        P(L.top2,q=>{q.rect(10,10,11,2);q.px(15,13);q.px(15,16);q.px(15,19)},F);
      }else if(L.hat==="wreath"||L.hat==="hood"){
        /* Bandoulière et sacoche d'artisan */
        P(L.top2,q=>q.line(11,10,20,20,2),F);
        P(L.acc,q=>q.rect(18,18,3,3));
      }else{
        P(L.top2,q=>q.rect(12,14,7,7));
      }
      P(mix(L.bot,DARK,.35),q=>q.rect(10,19,11,2),F);px(15,19,L.acc);px(16,19,L.acc);
    });

    /* Calque tête : visage, yeux, coiffure/barbe, couvre-chef unique */
    lay(()=>{up();
      P(skin,q=>{q.ell(15.5,5,6.8,5.6);q.rect(10,6,11,4)},SK);
      P(L.hair,q=>{q.ell(15.5,1.2,7.2,4.4);q.clear(10,3,12,8);q.rect(8,3,3,5);q.rect(20,3,3,5)});
      if(L.hairSty==="spiky")P(L.hair,q=>{q.poly([[11,-1],[13,-5],[15,-1]]);q.poly([[15,-1],[17,-5],[19,-1]])});
      if(L.hairSty==="bun")P(L.hair,q=>q.ell(15.5,-3,3,2.5));
      if(L.hairSty==="bob")P(L.hair,q=>{q.rect(8,3,3,8);q.rect(20,3,3,8)});

      /* Couvre-chef propre à chaque PNJ */
      if(L.hat==="beanie"){
        P(L.hc,q=>{q.ell(15.5,0,7.2,4.6);q.clear(8,2,16,4);q.rect(8,1,15,2)});
        P(mix(L.hc,W,.35),q=>q.ell(15.5,-4.2,2.2,2));
      }else if(L.hat==="straw"){
        P(L.hc,q=>{q.rect(5,1,21,2);q.ell(15.5,-1,5.6,3.2);q.clear(9,1,13,3)});
        P(L.acc,q=>q.rect(10,0,11,1),F);
      }else if(L.hat==="goggles"){
        P(L.hc,q=>q.rect(8,0,15,3));
        P(L.acc,q=>{q.rect(11,-1,4,3);q.rect(16,-1,4,3)});
        P("#9ee8ff",q=>{q.rect(12,0,2,1);q.rect(17,0,2,1)},F);
      }else if(L.hat==="wreath"){
        P(L.hc,q=>{q.rect(9,0,13,2);q.px(10,-1);q.px(15,-1);q.px(20,-1)});
        px(12,0,L.acc);px(18,0,"#ff8ea8");
      }else if(L.hat==="beret"){
        P(L.hc,q=>{q.ell(14,-1,8.2,3.4);q.px(14,-5)});
      }else if(L.hat==="scarf"){
        P(L.hc,q=>{q.ell(15.5,0,7.2,3.8);q.clear(9,2,14,4);q.poly([[20,0],[24,-2],[23,2]])});
      }else if(L.hat==="ushanka"){
        P(L.hc,q=>{q.rect(8,-3,15,5);q.rect(7,2,3,5);q.rect(21,2,3,5)});
        P(L.top2,q=>q.rect(10,-1,11,3));
      }else if(L.hat==="bucket"){
        P(L.hc,q=>{q.rect(7,1,17,2);q.rect(9,-2,13,3)});
        P(L.top,q=>q.rect(9,0,13,1),F);
      }else if(L.hat==="flatcap"){
        P(L.hc,q=>{q.ell(14.5,-1,7.5,3);q.rect(14,1,10,2)});
      }else if(L.hat==="hood"){
        P(L.hc,q=>{q.ell(15.5,2,8,7);q.clear(10,2,12,8)});
        P(L.acc,q=>{q.px(15,-4);q.px(9,3);q.px(22,3)},F);
      }

      /* Yeux + expressions + barbes/moustaches */
      [13,18].forEach(x=>{for(let y=4;y<7;y++){px(x,y,B);px(x+1,y,B)}px(x,4,W)});
      if(L.beard==="full"){
        P(L.hair,q=>{q.rect(11,8,10,3);q.rect(12,11,8,2);q.rect(14,13,4,1)});
      }else if(L.beard==="short"){
        P(L.hair,q=>{q.rect(11,8,10,2);q.rect(13,10,6,1)});
      }else if(L.beard==="stache"){
        P(L.hair,q=>{q.rect(12,7,8,2);q.px(11,8);q.px(20,8)});
      }else if(L.beard==="goatee"){
        P(L.hair,q=>{q.rect(14,9,4,2);q.rect(15,11,2,1)});
      }else{
        px(11,7,"#f0988c");px(20,7,"#f0988c");px(16,8,"#b8745e");px(17,8,"#b8745e");
      }
    });

    /* Calque bras avant + outil de métier */
    lay(()=>{up();
      drawTool();
      P(L.top,q=>q.line(sx,sy,hx,hy,2));hand(hx,hy,skin);
    });

    /* Particules lumineuses autour de l'outil aux très hauts paliers (9..11) */
    if(prof&&t>=9){
      const gl=TOOL_PAL[prof][t][3];
      for(let i=0;i<3;i++){
        const rx=Math.round(hx+ux*(8+i*3)+Math.sin(ph+i)*2),ry=Math.round(hy+uy*(8+i*3)-((f+i*3)%4));
        if(rx>=0&&ry>=0&&rx<s.w&&ry<s.h)s.set(rx,ry,i%2?W:gl);
      }
    }
    return s}

  function workerF(look,pid,tier,anim,f){
    const Lidx=((look|0)%WORKER_LOOKS.length+WORKER_LOOKS.length)%WORKER_LOOKS.length;
    const t=Math.max(0,Math.min(11,tier|0)),p=pid||"none";
    const useAnim=anim==="atk"?(p==="pecheur"||p==="herboriste"?"staff":"atk"):"idle";
    const k="wf:"+Lidx+":"+p+":"+t+":"+useAnim+":"+f;if(cache[k])return cache[k];
    const T=HA[useAnim]||HA.idle,s=workerSpr(Lidx,pid,t,anim,f);
    const W=s.w,N=32+2*HP,o=new Spr(N,N),ox=T.dx[f],oy=Math.min(0,T.dy[f]);
    o.shadow(15.5+HP,30+HP,9,1.7);
    for(let y=0;y<W;y++)for(let x=0;x<W;x++){const c=s.p[y*W+x];if(c){const X=x+ox,Y=y+oy;if(X>=0&&Y>=0&&X<N&&Y<N)o.p[Y*N+X]=c}}
    return cache[k]=o.url()}

  const workerFrames=(look,pid,tier,anim)=>{
    const Lidx=((look|0)%WORKER_LOOKS.length+WORKER_LOOKS.length)%WORKER_LOOKS.length;
    const t=Math.max(0,Math.min(11,tier|0)),p=pid||"none";
    const k="wfs:"+Lidx+":"+p+":"+t+":"+anim;
    return cache[k]||(cache[k]=Array.from({length:10},(_,f)=>workerF(Lidx,pid,t,anim,f)),cache[k].sc=((32+2*HP)/32).toFixed(3),cache[k])};

  const workerPortrait=(look,pid,tier)=>workerF(look,pid,tier,"idle",0);

  Object.assign(PX,{hero,heroF,heroFrames,beastF,beastFrames,tool,workerF,workerFrames,workerPortrait,WORKERS_N:WORKER_LOOKS.length})})();
