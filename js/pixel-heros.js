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
    const robe=cls==="mage"||cls==="chrono"||cls==="invoc",caster=robe||cls==="peste";
    /* armure portée (coiffe, cape, bottes, ceinture) : chaque pièce a un style et une couleur, dessinés dans la forme de la classe */
    const AR=arm||{},AH=AR.coiffe,AC=AR.cape,AF=AR.bottes,AB=AR.ceinture,aDk=o=>mix(o.c,DARK,.4),aLt=o=>mix(o.c,"#ffffff",.42);
    const u=Math.max(0,T.dy[f]),up=()=>{g.oy=HP+u},dn=()=>{g.oy=HP};                 /* le buste respire, les pieds restent au sol */
    /* un calque : dessiné à part, cerné, puis posé sur le personnage */
    const lay=fn=>{g=new Spr(s.w,s.h,HP,HP);fn();g.outline(ink);const p=g.p;for(let i=0;i<p.length;i++)if(p[i])s.p[i]=p[i];g=s};
    const sw=anim==="idle"?[0,0,0,1,1,1,1,0,0,0][f]:T.dx[f]>0?1:0;                   /* étoffes et cheveux qui suivent le mouvement */
    const R=Math.PI/180,idle=anim==="idle",rest=idle?(caster?44:cls==="gardien"?36:cls==="archer"?30:22):0;
    const aa=(T.arm[f]-rest)*R,sx=21.5,sy=14,AL=6,hx=sx+Math.cos(aa)*AL,hy=sy+Math.sin(aa)*AL;
    const wa=((T.w[f]??-90)+(idle&&(cls==="guerrier"||cls==="berserk")?13:0))*R,ux=Math.cos(wa),uy=Math.sin(wa),vx=-uy,vy=ux;
    const la=T.left?(180-T.arm[f])*R:(102+(T.arm[f]-90)*-.15)*R,lsx=9.5,lsy=14,lhx=lsx+Math.cos(la)*AL,lhy=lsy+Math.sin(la)*AL;
    const SL={guerrier:STD,archer:col,mage:col,gardien:ST,peste:"#9a7448",chrono:col,berserk:skin,invoc:col}[cls]||col;
    const GL={guerrier:STD,gardien:STD,archer:LE,berserk:LE}[cls]||skin;
    const pull=cls==="archer"?((T.pull||[])[f]||0)*1.5:0;
    const hand=(x,y,c)=>{x=Math.round(x);y=Math.round(y);P(c,q=>q.rect(x-1,y-1,2,2),F);px(x,y,mix(c,DARK,.22))};
    const W2=(a,b)=>[hx+ux*a+vx*b,hy+uy*a+vy*b],ln=(q,p0,p1,t)=>q.line(p0[0],p0[1],p1[0],p1[1],t);   /* repère de l'arme : a le long, b en travers */
    const lim=L=>ux>.15?Math.min(L,(45.5-T.dx[f]-hx)/ux):L;                          /* portée de l'arme : raccourcie quand elle pointe droit devant, pour rester dans le cadre */
    /* bâtons des lanceurs de sorts : hampe + tête propre à la classe. Au repos la main tient le bas du bâton, en action le milieu. */
    const grip=idle?0:[2,5,8,8,8,8,8,8,anim==="cast"?8:5,anim==="cast"?8:2][f];
    const staff=()=>{const wood={mage:"#9a6a3c",peste:"#7a5232",chrono:"#5a6ab0",invoc:"#8a7ab8"}[cls],n=Math.min(19-grip,lim(27)-8),L=(a,b)=>W2(n+a,b),o=L(3.5,0);
      P(wood,q=>ln(q,L(-28,0),L(0,0)),F);
      if(cls==="mage"){P(GO,q=>{ln(q,L(0,-2),L(0,2));ln(q,L(0,-3),L(2,-3));ln(q,L(0,3),L(2,3))},F);P(lt,q=>q.ell(o[0],o[1],2.7,2.7),{lt:.75});px(o[0]-1,o[1]-1,W)}
      if(cls==="peste"){P(wood,q=>{ln(q,L(0,0),L(3,-2));ln(q,L(3,-2),L(6,0));ln(q,L(6,0),L(6,3));ln(q,L(6,3),L(4,4));ln(q,L(4,4),L(2,3))},F);const e=L(3.5,1.5);
        P("#8fe05a",q=>q.ell(e[0],e[1],1.5,1.5),{lt:.75});px(e[0],e[1]-1,W);P("#5fae4a",q=>[L(-2,2),L(-4,-2),L(-3,2)].forEach(a=>q.px(a[0],a[1])),F)}
      if(cls==="chrono"){const e=L(4,0),cx=Math.round(e[0]),cy=Math.round(e[1]);P(GO,q=>{q.ell(cx,cy,3.4,3.4);q.clear(cx-1,cy-1,3,3)});px(cx,cy,GO);px(cx,cy-1,W);px(cx+1,cy,W)}
      if(cls==="invoc"){P(wood,q=>{ln(q,L(0,-3),L(0,3));ln(q,L(0,-3),L(4,-4));ln(q,L(0,3),L(4,4))},F);
        P("#b48aff",q=>{q.ell(o[0],o[1],2,2);[L(6.5,0),L(7.5,.8)].forEach(a=>q.px(a[0],a[1]))},{lt:.75});px(o[0],o[1],W)}};

    /* ----- calque arrière : capes, carquois, crinières, bâton au repos, esprit de l'invocateur ----- */
    lay(()=>{up();
      /* cape de l'armure : la cape de la classe prend sa couleur ; les classes sans cape en reçoivent une, dont la longueur dépend du style */
      const cc=AC?AC.c:null,cs=AC?AC.s:"";
      if(AC&&!["gardien","guerrier","peste","invoc"].includes(cls)){const L=cs==="cuir"?19:cs==="robe"?26:23;P(cc,q=>{q.poly([[8,11],[15,11],[13,L-2],[4-sw,L+sw],[5,16]]);if(cs==="ecailles"){q.clear(6-sw,L-1+sw,1,1);q.clear(9-sw,L-2+sw,1,1)}})}
      if(cls==="gardien")P(cc||col,q=>q.poly([[8,11],[15,11],[13,26],[4-sw,27],[5,17]]));
      if(cls==="guerrier")P(cc||col,q=>{q.poly([[8,11],[15,11],[13,22],[4-sw,24+sw],[5,16]]);q.clear(6-sw,24+sw,1,1);q.clear(9-sw,23+sw,1,1)});
      if(cls==="peste")P(cc?aDk(AC):dk,q=>{q.poly([[7,10],[15,10],[13,24],[5-sw,25],[5,16]]);q.clear(7-sw,25,1,1);q.clear(10-sw,25,1,1)});
      if(cls==="invoc")P(cc?aDk(AC):mix(col,DARK,.6),q=>{q.poly([[7,10],[15,10],[13,26],[3-sw,27],[5,16]]);q.clear(5-sw,27,1,1);q.clear(8-sw,27,2,1)});
      if(AC&&cs==="fourrure")P(aLt(AC),q=>q.rect(7,10,9,2));
      if(cls==="archer"){P(hair,q=>q.poly([[8,4],[11,5],[9,13],[5-sw,15],[6-sw,11]]));P(LE,q=>q.poly([[5,11],[8,10],[11,19],[8,20]]));P(BONE,q=>{q.line(5,10,4,7);q.line(7,9,7,6)},F);px(4,6,RED);px(3,7,RED);px(7,5,RED);px(8,6,RED)}
      if(cls==="mage")P(hair,q=>q.poly([[8,2],[12,2],[11,14],[5-sw,16],[6,8]]));
      if(cls==="berserk")P(hair,q=>q.poly([[8,0],[12,0],[12,13],[8-sw,15],[4-sw,16],[5-sw,11],[5,7]]));
      if(cls==="chrono")P(dk,q=>q.poly([[9,-3],[12,0],[9,10],[4-sw,13],[6,5]]));
      if(caster&&anim!=="staff"&&anim!=="cast")staff();
      if(cls==="invoc"){const wb=idle?[0,0,-1,-1,-1,0,0,1,1,1][f]:-1;dn();P("#c9a8ff",q=>{q.ell(1.5,5+wb,2,2);q.px(0,8+wb);q.px(1,9+wb)},{lt:.6});px(1,5+wb,B);px(3,5+wb,B)}});

    /* ----- calque du corps : bras arrière, jambes et bottes (ou bas de robe), buste ----- */
    lay(()=>{up();
      if(!(pull>0)){P(SL===skin?skD:mix(SL,DARK,.2),q=>q.line(lsx-.5,lsy,lhx-.5,lhy,2),SL===skin?F:undefined);hand(lhx,lhy+.5,GL===skin?skin:mix(GL,DARK,.2))}
      dn();const step=anim==="atk"||anim==="bash"?(f>=4&&f<=7?1:0):0;
      if(robe){P(col,q=>{q.poly([[9,18],[21,18],[23,28],[7,28]]);if(cls==="invoc"){q.clear(8,28,1,1);q.clear(12,28,2,1);q.clear(18,28,1,1);q.clear(22,28,1,1)}});
        if(cls==="mage"){P(GO,q=>q.rect(7,27,17,1),F);P(lt,q=>q.rect(15,20,1,7),F)}
        if(cls==="chrono"){P(GO,q=>q.rect(7,27,17,1),F);P(dk,q=>q.rect(8,25,15,1),F)}
        if(cls==="invoc")[9,13,17,21].forEach((x,i)=>px(x,25+i%2,RUNE));
        P(AF?AF.c:cls==="chrono"?GO:"#4a3550",q=>{q.rect(10+step,29,4,1);q.rect(17+step,29,4,1)},F)}
      else{const LG={guerrier:"#6a5a52",archer:"#8a6442",gardien:STD,peste:"#7a5636",berserk:skin}[cls]||"#6a5a52",BT={guerrier:ST,archer:LED,gardien:ST,peste:"#5c4028",berserk:FUR}[cls]||LED;
        P(LG,q=>{q.rect(10,21,5,5);q.rect(16+step,21,5,5)},LG===skin?SK:undefined);
        const BT2=AF?(AF.s==="plaques"?ST:AF.s==="fourrure"||AF.s==="cuir"?aDk(AF):AF.c):BT;
        P(BT2,q=>{q.rect(9,26,6,4);q.rect(16+step,26,6,4);q.px(22+step,28);q.px(22+step,29)});
        if(cls==="archer")P(LE,q=>{q.rect(9,25,6,1);q.rect(16+step,25,6,1)},F);
        if(cls==="guerrier"||cls==="gardien")P(col,q=>{q.rect(10,25,5,1);q.rect(16+step,25,5,1)},F);
        if(cls==="berserk"&&!AF)P(BONE,q=>{q.rect(9,26,6,1);q.rect(16+step,26,6,1)},F);
        /* détail des bottes selon le style */
        if(AF){const s=AF.s;if(s==="plaques"||s==="cuir")P(AF.c,q=>{q.rect(9,26,6,1);q.rect(16+step,26,6,1)},F);if(s==="fourrure")P(aLt(AF),q=>{q.rect(9,26,6,2);q.rect(16+step,26,6,2)},F);
          if(s==="ecailles")P(aDk(AF),q=>{q.px(11,28);q.px(13,28);q.px(18+step,28);q.px(20+step,28)},F);if(s==="cristal"){px(11,27,aLt(AF));px(18+step,27,aLt(AF))}}}
      up();const chest=c=>P(c,q=>{q.rect(9,11,13,9);q.clear(9,11,1,1);q.clear(21,11,1,1)},c===skin?SK:undefined),belt=c=>{P(AB?AB.c:c,q=>q.rect(9,19,13,1),F);if(AB){const bk=AB.s==="plaques"?ST:AB.s==="cristal"?aLt(AB):AB.s==="robe"?GO:aDk(AB);px(15,19,bk);px(16,19,bk)}},skirt=(c,h,cut)=>P(c,q=>{q.rect(9,20,13,h);cut.forEach(x=>q.clear(x,19+h,1,1))});
      if(cls==="guerrier"){chest(ST);P(STD,q=>{q.rect(10,16,11,1);q.rect(15,12,1,4)},F);skirt(col,3,[15]);belt(LED);px(15,19,GO);px(16,19,GO);P(col,q=>q.rect(11,11,9,3),{dk:.2});P(ST,q=>q.ell(9.5,12.5,2.3,2.1));px(9,12,GO)}
      if(cls==="archer"){chest(col);P(LE,q=>q.line(10,12,20,18),F);skirt(col,3,[9,12,15,18,21]);belt(LED);px(14,19,GO);P(dk,q=>q.poly([[8,10],[23,10],[22,13],[9,13]]));px(15,11,GO);px(16,11,GO)}
      if(cls==="mage"){chest(col);P(lt,q=>q.rect(15,13,1,6),F);belt(GO);P(dk,q=>q.poly([[7,10],[24,10],[22,14],[9,14]]));px(15,12,GO);px(16,12,GO)}
      if(cls==="gardien"){chest(ST);P(col,q=>q.rect(13,12,5,11));P(EM,q=>{q.rect(15,13,1,5);q.rect(14,14,3,1)},F);P(ST,q=>{q.rect(9,20,4,3);q.rect(18,20,4,3)});P(LED,q=>{q.rect(9,19,4,1);q.rect(18,19,4,1)},F);P(ST,q=>q.ell(9,12.5,2.7,2.5))}
      if(cls==="peste"){chest("#9a7448");skirt(col,3,[10,13,16,19]);belt("#4a7a3a");px(12,19,"#c94a5a");px(18,19,"#c94a5a");P(col,q=>q.poly([[7,10],[24,10],[23,13],[21,15],[18.5,13],[15.5,16],[12.5,13],[10,15],[8,13]]))}
      if(cls==="chrono"){chest(col);belt(dk);P(GO,q=>q.poly([[8,10],[23,10],[15.5,15]]),F);P(col,q=>q.poly([[10,10],[21,10],[15.5,13]]),F);P(GO,q=>q.ell(15.5,16.5,1.6,1.6));px(15,16,B);px(16,17,B)}
      if(cls==="berserk"){chest(skin);[[15,12],[15,13],[15,14],[11,15],[12,15],[13,15],[14,15],[16,15],[17,15],[18,15],[19,15],[15,17]].forEach(([x,y])=>px(x,y,skD));[[10,13],[11,14],[12,13]].forEach(([x,y])=>px(x,y,"#c8302a"));
        P(LE,q=>q.line(10,11,20,18),F);skirt(col,4,[9,15,21]);belt(LED);px(15,19,BONE);px(16,19,BONE)}
      if(cls==="invoc"){chest(col);belt(BONE);P(mix(col,DARK,.5),q=>q.poly([[7,10],[24,10],[23,14],[15.5,17],[8,14]]));[[15,12],[16,13],[15,14],[14,13]].forEach(([x,y])=>px(x,y,RUNE))}
      /* archer : la main arrière tire la corde */
      if(pull>0){const n=W2(0,-3-pull);P(col,q=>q.line(10,14,n[0]-1,n[1],2));hand(n[0],n[1],GL)}});

    /* ----- calque du bras avant et de l'arme (posé derrière la tête quand le bras part en arrière) ----- */
    const am=((T.arm[f]%360)+360)%360,behind=am>150&&am<300;
    const frontArm=()=>lay(()=>{up();
      if(cls==="guerrier"){P(LED,q=>ln(q,W2(-3,0),W2(1,0),2),F);px(...W2(-4,0),GO);
        const e=lim(19.5);P("#e4e9f0",q=>q.poly([W2(3,-2),W2(e-3.5,-2),W2(e,0),W2(e-3.5,2),W2(3,2)]),{dk:.32});P(W,q=>ln(q,W2(5,-.6),W2(e-4.5,-.6)),F);P(GO,q=>ln(q,W2(2.5,-4),W2(2.5,4),2))}
      if(cls==="berserk"){const e=lim(19.5)-19.5;P("#7a4e2e",q=>ln(q,W2(-5,0),W2(17+e,0)),F);
        P("#d5dae2",q=>q.poly([W2(11+e,0),W2(6.5+e,5),W2(9+e,8.5),W2(17+e,8.5),W2(19.5+e,5),W2(15+e,0)]),{dk:.32});P(W,q=>ln(q,W2(10+e,7.6),W2(16+e,7.6)),F);P(STD,q=>q.poly([W2(11.5+e,0),W2(13+e,-4),W2(14.5+e,0)]))}
      if(caster&&(anim==="staff"||anim==="cast"))staff();
      if(cls==="archer"){   /* arc : au repos il penche vers l'avant, pour tirer il est vertical */
        const ba=(idle?-70:-90)*R,ax=Math.cos(ba),ay=Math.sin(ba),bx=-ay,by=ax,Bw=(a,b)=>[hx+ax*a+bx*b,hy+ay*a+by*b];
        P("#9a6a3c",q=>{ln(q,Bw(10,-3),Bw(7,0));ln(q,Bw(7,0),Bw(3,1));ln(q,Bw(3,1),Bw(-3,1));ln(q,Bw(-3,1),Bw(-7,0));ln(q,Bw(-7,0),Bw(-10,-3));ln(q,Bw(2,2),Bw(-2,2))},F);
        P(BONE,q=>{ln(q,Bw(10,-3),Bw(0,-3-pull));ln(q,Bw(0,-3-pull),Bw(-10,-3))},F);
        if(pull>0){P("#e8dcc0",q=>ln(q,Bw(0,-3-pull),Bw(0,7)),F);px(...Bw(0,8),ST);px(...Bw(0,9),ST);px(...Bw(1,-3-pull),RED);px(...Bw(-1,-3-pull),RED)}}
      P(SL,q=>q.line(sx-.5,sy,hx-.5,hy,2),SL===skin?SK:undefined);
      if(cls==="gardien"){const cx=hx+3,cy=hy+1;P(ST,q=>q.poly([[cx-5,cy-8],[cx+5,cy-8],[cx+5,cy+2],[cx,cy+9],[cx-5,cy+2]]));P(col,q=>q.poly([[cx-3.5,cy-6.5],[cx+3.5,cy-6.5],[cx+3.5,cy+1.5],[cx,cy+7],[cx-3.5,cy+1.5]]));
        P(EM,q=>{q.rect(cx-.5,cy-5,1,8);q.rect(cx-2.5,cy-3,5,1)},F);P(ST,q=>q.ell(sx+.5,sy-1.5,3,2.6));px(sx,sy-2,GO)}
      else hand(hx,hy,GL);
      if(cls==="guerrier"){P(ST,q=>q.ell(sx,sy-1.5,2.5,2.3));px(sx+1,sy-2,GO)}
      if(cls==="berserk"){P(FUR,q=>q.ell(sx,sy-2,2.4,1.6),{lt:.5});px(sx+1,sy-4,BONE)}});
    if(behind)frontArm();

    /* ----- calque de la tête : visage, coiffure ou couvre-chef ----- */
    lay(()=>{up();
      const face=(c=skin,cx=15.5,cy=4.5,rx=6.6,ry=5.6)=>P(c,q=>q.ell(cx,cy,rx,ry),SK);
      const cap=(c,ry=4.8)=>P(c,q=>{q.ell(15.5,1.2,7.3,ry);q.clear(11,3,12,9);q.rect(8,3,3,5)});
      let mouth=1,blush=1,EY=B;const hc=AH?AH.c:col;
      if(cls==="guerrier"){face();P(hair,q=>{q.ell(15.5,1.2,7.3,4.8);q.clear(11,3,12,9);q.rect(8,3,3,5);q.poly([[8,2],[4,-3],[10,-2]]);q.poly([[9,-1],[8,-8],[14,-3]]);q.poly([[13,-3],[15,-8],[18,-3]]);q.poly([[17,-3],[21,-6],[22,-1]]);q.poly([[20,-1],[25,1],[22,3]]);q.px(12,3);q.px(16,3);q.px(17,3);q.px(21,3);q.px(22,3)});
        P(hc,q=>q.rect(9,1,14,2));P(hc,q=>q.poly([[9,1],[9,3],[5-sw,6+sw],[4-sw,4+sw]]))}
      if(cls==="archer"){face();cap(hair,4.4);P(hair,q=>{q.px(11,3);q.px(12,3);q.px(13,3);q.px(21,3);q.px(22,3);q.px(22,4)},F);
        P(hc,q=>{q.poly([[8,0],[10,-6],[17,-7],[22,-1]]);q.poly([[6,2],[8,-1],[23,-1],[27,2],[23,2]])});P(AH?aDk(AH):dk,q=>q.rect(9,0,14,1),F);P(RED,q=>q.poly([[11,-5],[6,-11],[9,-11],[14,-6]]))}
      if(cls==="mage"){face();P(hair,q=>{q.rect(8,2,3,9);q.rect(21,3,2,7);q.px(11,3);q.px(12,3);q.px(20,3)});
        P(hc,q=>{q.poly([[9,0],[11,-6],[8,-11],[14,-9],[19,-5],[22,0]]);q.ell(15.5,1,10.5,1.4)});P(GO,q=>q.rect(10,-1,12,1),F);px(15,-4,GO);px(14,-3,GO);px(16,-3,GO);px(15,-3,W);px(15,-2,GO)}
      if(cls==="gardien"){face();P(ST,q=>{q.ell(15.5,1.2,7.6,5.4);q.clear(11,3,11,9);q.rect(8,3,3,6);q.rect(21,2,2,6)});P(GO,q=>q.rect(8,2,15,1),F);P(STD,q=>q.rect(16,3,1,3),F);
        P(hc,q=>q.poly([[11,-4],[15,-9],[20,-7],[15,-4],[9-sw,-2],[6-sw,3],[4-sw,0],[7-sw,-4]]))}
      if(cls==="peste"){face();cap(hair,4.6);P(hair,q=>{q.rect(8,3,3,9);q.rect(21,3,2,8);q.px(11,3);q.px(12,3);q.px(20,3)});px(21,10,"#8fe05a");px(22,10,"#8fe05a");
        P(BONE,q=>{q.line(11,-2,8,-7);q.line(8,-7,8,-10);q.line(9,-5,5,-8);q.line(20,-2,23,-7);q.line(23,-7,23,-10);q.line(22,-5,26,-8)},F);
        P("#6fbf4a",q=>{q.ell(9.5,.5,1.6,1.3);q.ell(15.5,-.5,1.7,1.6);q.ell(21.5,.5,1.6,1.3)});P("#b8e86a",q=>{q.ell(12.5,0,1.4,1.2);q.ell(18.5,0,1.4,1.2)});px(15,1,"#c94a5a")}
      if(cls==="chrono"){P(hc,q=>q.ell(15.5,2.5,8,7.6));P(GO,q=>q.ell(16,5.3,5.9,5.3),F);face(skin,16,5.5,5,4.4);
        P("#ece6d6",q=>{q.rect(12,8,8,2);q.rect(13,10,6,2);q.rect(15,12,2,1)});px(15,8,skin);px(16,8,skin);mouth=0;P(GO,q=>{q.rect(14,-4,3,1);q.rect(15,-3,1,1);q.rect(14,-2,3,1)},F)}
      if(cls==="berserk"){face();P(hair,q=>{q.rect(8,3,3,7);q.rect(21,3,2,6);q.rect(11,8,10,2);q.rect(12,10,8,1);q.px(13,11);q.px(16,11);q.px(18,11);q.clear(15,8,3,1)});
        P(STD,q=>{q.ell(15.5,.8,7.4,4.6);q.clear(8,3,16,9)});P(AH?hc:LE,q=>q.rect(8,1,15,2));px(15,1,BONE);px(16,1,BONE);
        P(BONE,q=>{q.poly([[10,0],[6,-2],[4,-9],[6,-9],[8,-4],[12,-2]]);q.poly([[21,0],[25,-2],[27,-9],[25,-9],[23,-4],[19,-2]])});
        [[12,3],[13,3],[14,4],[20,3],[19,3],[18,4]].forEach(([x,y])=>px(x,y,B));[[11,7],[12,8],[21,7],[20,8]].forEach(([x,y])=>px(x,y,"#c8302a"));blush=0;mouth=0}
      if(cls==="invoc"){P(mix(hc,DARK,.5),q=>{q.ell(15.5,2.5,8.2,7.8);q.poly([[10,-3],[7,-10],[13,-5]]);q.poly([[21,-3],[24,-10],[18,-5]])});P(col,q=>q.ell(16,5.3,5.9,5.3),F);P("#2a1a3e",q=>q.ell(16,5.5,5,4.4),F);
        px(15,-2,RUNE);px(16,-3,RUNE);px(8,4,RUNE);px(23,4,RUNE);mouth=0;blush=0;EY=RUNE}
      /* détail de la coiffe selon le style, posé sur le bandeau ou le couvre-chef de la classe */
      if(AH){const by={guerrier:1,archer:0,mage:-1,gardien:2,peste:0,chrono:-3,berserk:1,invoc:-2}[cls]??0,s=AH.s,c1=AH.c,c2=aLt(AH);
        if(s==="plaques")P(ST,q=>{q.px(10,by);q.px(14,by);q.px(17,by);q.px(21,by)},F);
        if(s==="cuir")P(aDk(AH),q=>{q.px(23,by+1);q.px(24,by+2);q.px(23,by+3)},F);
        if(s==="robe")P(GO,q=>{q.px(12,by);q.px(19,by)},F);
        if(s==="ecailles")P(c2,q=>q.poly([[13.5,by],[17.5,by],[15.5,by-3]]));
        if(s==="fourrure")P(c1,q=>{q.poly([[9,by],[11,by-4],[13,by]]);q.poly([[18,by],[20,by-4],[22,by]])});
        if(s==="cristal")P(c2,q=>{q.poly([[11,by],[13,by],[12,by-2]]);q.poly([[14.5,by],[16.5,by],[15.5,by-3]]);q.poly([[18,by],[20,by],[19,by-2]])},{lt:.4})}
      [13,18].forEach(x=>{if(blink){px(x,6,EY);px(x+1,6,EY)}else{for(let y=4;y<7;y++){px(x,y,EY);px(x+1,y,EY)}px(x,4,W)}});
      if(blush){px(11,7,"#f29a8e");px(12,7,"#f29a8e");px(20,7,"#f29a8e");px(21,7,"#f29a8e")}
      if(mouth){px(16,8,"#c07a62");px(17,8,"#c07a62")}});
    if(!behind)frontArm();
    return s}
  /* image fixe du héros (40×44) : création du personnage, inventaire, visiteurs. pose : "" ou "blink" ("atk" et "up" renvoient une image d'animation) */
  function hero(cls,col,pose="",arm){
    const k="h:"+cls+col+pose+(arm?arm.k:"");if(cache[k])return cache[k];
    if(pose==="atk"||pose==="up")return cache[k]=heroF(cls,col,pose==="up"?"cast":"atk",pose==="up"?7:6,0,0,arm);   /* poses d'action : cadre large de 64 px */
    const s=heroSpr(cls,col,"idle",0,pose==="blink",arm);
    /* cadre de 40 px : décalé vers la droite si l'arme dépasse (hache du Berserker), sans couper le corps à gauche */
    const W=s.w;let x0=W,x1=-1;for(let y=0;y<W;y++)for(let x=0;x<W;x++)if(s.p[y*W+x]){if(x<x0)x0=x;if(x>x1)x1=x}
    const sh=Math.max(0,Math.min(x1-(HP-4+39),x0-(HP-4))),o=new Spr(40,44);o.shadow(19.5-sh,42,9,1.7);for(let y=0;y<44;y++)for(let x=0;x<40;x++){const c=s.p[(y+HP-12)*W+x+HP-4+sh];if(c)o.p[y*40+x]=c}
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
  Object.assign(PX,{hero,heroF,heroFrames,beastF,beastFrames})})();
