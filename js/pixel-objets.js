/* Moteur pixel art : objets, ressources, butins, familiers, plantes, poissons, accessoires et décors de zone (TH). Suite de pixel.js. */
(()=>{const{cache,rgb,mix,rng,LIGHT,DARK,INK,Spr,SPR,framesOf}=PX._;
  /* ---------- Objets à ramasser (16×16) ---------- */
  function pickup(id){
    const k="p:"+id;if(cache[k])return cache[k];const s=new Spr(22,22,3,3);
    if(id==="coffre"){s.part("#9a5f2e",q=>q.rect(2,7,12,7));s.part("#c07e40",q=>{q.rect(2,4,12,3);q.rect(3,3,10,1)});s.part("#f7c948",q=>{q.rect(2,7,12,1);q.rect(7,7,2,3)},{flat:1});s.set(7,9,"#6b432a");s.set(8,9,"#6b432a")}
    if(id==="etoile"){s.part("#ffe27a",q=>{q.poly([[8,1],[10,6],[14,6],[11,9],[13,14],[8,11],[3,14],[5,9],[1,6],[6,6]])});s.set(6,7,"#6b4a10");s.set(9,7,"#6b4a10");s.set(7,9,"#6b4a10");s.set(8,9,"#6b4a10")}
    if(id==="trefle"){s.part("#3f7d33",q=>q.line(8,9,11,14),{flat:1});s.part("#74d05e",q=>{q.ell(4.5,4.5,2.2,2.2);q.ell(10.5,4.5,2.2,2.2);q.ell(4.5,10.5,2.2,2.2);q.ell(10.5,10.5,2.2,2.2);q.rect(6,6,3,3)});s.set(7,7,"#d6ffc2");s.set(4,4,"#d6ffc2");s.set(10,4,"#d6ffc2");s.set(4,10,"#d6ffc2");s.set(10,10,"#d6ffc2")}
    if(id==="orbe"){s.part("#ff7a3c",q=>q.ell(8,9,5,5),{dk:.5});s.part("#ffd27a",q=>{q.rect(6,6,2,2);q.px(8,2);q.rect(7,3,2,1);q.px(9,1)},{flat:1})}
    if(id==="baluchon"){s.part("#e0c68e",q=>{q.ell(8,10,6,4.5);q.rect(4,5,8,4)});s.part("#c9483a",q=>{q.rect(5,4,6,1);q.px(4,3);q.px(11,3);q.px(3,2);q.px(12,2)},{flat:1});s.part("#b89a5a",q=>q.rect(6,1,4,3))}
    if(id==="parchemin"){s.part("#f6e7c2",q=>q.rect(3,3,10,10));s.part("#d8bf88",q=>{q.rect(2,1,12,2);q.rect(2,13,12,2)});s.part("#8a6fd0",q=>{q.rect(5,5,6,1);q.rect(5,7,6,1);q.rect(5,9,4,1)},{flat:1})}
    if(id==="oeuf"){s.part("#ffd45a",q=>{q.ell(8,8,5,6);q.ell(8,5,3.6,4)});s.part("#ff8ab0",q=>q.rect(5,6,2,2),{flat:1});s.part("#5ab4e8",q=>q.rect(9,9,2,2),{flat:1});s.part("#7fd35e",q=>q.rect(9,4,1,2),{flat:1});s.part("#ef7d4a",q=>q.rect(6,11,2,1),{flat:1})}
    s.outline();return cache[k]=s.fit(16).url()}

  /* ---------- Équipement (16×16) : silhouette propre à chaque classe (+ Boss), palette et menace évolutives par zone ---------- */
  function item(slot,col,it){
    const k="i:"+(it&&it.id?it.id:slot+col);if(cache[k])return cache[k];
    const s=new Spr(22,22,3,3),cls=(it&&it.cls)||(it&&it.boss?"boss":"guerrier"),boss=!!(it&&it.boss);
    const th=(it&&typeof ZONE_STYLE!=="undefined"&&ZONE_STYLE[it.z])||{pri:col,sec:mix(col,LIGHT,.35),met:"#dfe5ec",acc:"#f7c948",tier:1,motif:"leaf"};
    const P1=th.pri,P2=th.sec,MT=th.met,AC=th.acc,t=th.tier||0,z=it?it.z:0;
    const DK=mix(P1,DARK,.45),LT=mix(P1,LIGHT,.45),GO=boss?"#ffd84a":(t>=3?AC:"#f2c14e"),W="#ffffff",F={flat:1};
    const spark=(x,y,c=AC)=>{s.set(x,y,c);if(t>=4){s.set(x+1,y,W);s.set(x,y-1,c)}};

    if(slot==="arme"){
      if(cls==="berserk"){
        /* Hache viking : manche diagonal + large fer courbé (double lame dès le palier 2, runes et aura au palier 3-4) */
        s.part("#7a4e2e",q=>q.line(2,14,12,4,2),F);s.set(2,14,GO);
        s.part(MT,q=>q.poly([[7,2],[13,2],[14,6],[11,10],[8,7]]),{lt:.45});
        if(t>=2)s.part(MT,q=>q.poly([[4,6],[8,9],[5,12],[2,9]]),{lt:.35});
        s.part(P1,q=>q.line(12,3,13,7),F);
        if(t>=1)s.set(10,5,AC);
        if(t>=3){s.set(13,2,AC);s.set(14,6,AC);s.set(11,9,AC)}
        if(t>=4){s.set(13,4,W);s.set(9,4,AC);s.set(4,9,AC)}
      }else if(cls==="guerrier"){
        /* Épée / grande lame de champion */
        s.part(MT,q=>{q.line(13,2,6,9,2);q.px(14,1)},{lt:.5});
        if(t>=2)s.part(W,q=>q.line(13,2,8,7),F);
        if(t>=3){s.set(11,2,AC);s.set(13,4,AC);s.set(9,6,AC)}
        s.part(P1,q=>q.line(4,7,9,12,2));
        if(t>=3){s.set(3,6,GO);s.set(10,13,GO)}
        s.part("#6a4228",q=>q.line(5,10,2,13,2),F);s.set(2,14,GO);s.set(1,14,GO);s.set(6,9,AC);
      }else if(cls==="archer"){
        /* Arc recourbé + corde + flèche à pointe luisante */
        s.part(P1,q=>{q.line(4,2,8,2);q.line(8,2,12,6);q.line(12,6,12,10);q.line(12,10,8,14);q.line(8,14,4,14)});
        s.part(P2,q=>q.line(4,3,4,13),F);
        s.part(MT,q=>q.line(3,8,13,8),F);s.part(AC,q=>{q.px(13,7);q.px(14,8);q.px(13,9);q.px(3,7);q.px(3,9)},F);
        if(t>=2){s.set(11,4,MT);s.set(11,12,MT)}
        if(t>=3){s.set(5,1,AC);s.set(5,15,AC);s.set(14,8,W)}
      }else if(cls==="mage"){
        /* Bâton arcanique couronné d'un orbe */
        s.part("#7a4e2e",q=>q.line(3,14,10,7,2),F);
        s.part(GO,q=>{q.rect(9,3,5,5);q.clear(10,4,3,3)},F);
        s.part(AC,q=>q.ell(11.5,5.5,2.2,2.2),{lt:.7});s.set(11,4,W);
        if(t>=2){s.set(8,3,MT);s.set(14,3,MT);s.set(14,8,MT)}
        if(t>=3){s.set(11,1,AC);s.set(15,5,AC)}
      }else if(cls==="gardien"){
        /* Marteau de guerre massif */
        s.part("#6a4a30",q=>q.line(3,14,10,7,2),F);s.set(2,14,GO);
        s.part(MT,q=>q.poly([[6,4],[10,1],[15,6],[11,9]]),{lt:.45});
        s.part(P1,q=>q.line(8,3,13,8),F);s.set(10,5,AC);
        if(t>=2){s.set(14,2,GO);s.set(15,5,GO)}
        if(t>=3){s.set(10,5,W);s.set(11,4,AC);s.set(9,6,AC)}
      }else if(cls==="peste"){
        /* Sceptre vénéneux noueux à fiole/gemme toxique */
        s.part("#644428",q=>{q.line(3,14,10,7,2);q.line(10,7,8,3);q.line(8,3,12,2);q.line(12,2,14,5)},F);
        s.part(AC,q=>q.ell(11,5.5,2,2),{lt:.6});s.set(10,5,W);
        s.part(P1,q=>{q.px(6,10);q.px(8,11);q.px(7,4)},F);
        if(t>=3){s.set(11,9,AC);s.set(14,6,AC)}
      }else if(cls==="chrono"){
        /* Sceptre-horloge / astrolabe */
        s.part(MT,q=>q.line(3,14,9,8,2),F);
        s.part(GO,q=>{q.ell(11,5,3.6,3.6);q.clear(10,4,3,3)});
        s.part(P1,q=>q.rect(10,4,3,3),F);s.set(11,5,W);s.set(11,4,AC);s.set(12,5,AC);
        if(t>=2){s.set(11,1,AC);s.set(15,5,AC)}
      }else{
        /* Invocateur : bâton d'âme cornu + flamme spectrale */
        s.part(DK,q=>{q.line(3,14,10,7,2);q.line(8,5,7,2);q.line(12,8,15,7)},F);
        s.part(P1,q=>{q.line(8,6,11,9)},F);
        s.part(AC,q=>{q.ell(11.5,4.5,2.2,2.4);q.px(12,1)},{lt:.65});s.set(11,4,W);
        if(t>=2){s.set(7,1,MT);s.set(15,6,MT)}
        if(t>=3){s.set(13,2,AC);s.set(9,2,AC)}
      }
    }else if(slot==="coiffe"){
      if(cls==="invoc"){
        /* Capuche rituelle profonde + yeux lumineux */
        s.part(P1,q=>{q.poly([[8,1],[13,5],[14,13],[2,13],[3,5]])});
        if(t>=2)s.part(MT,q=>{q.poly([[4,5],[2,1],[6,3]]);q.poly([[12,5],[14,1],[10,3]])});
        s.part("#170c24",q=>q.ell(8,8.5,3.5,3.5),F);
        s.set(6,8,AC);s.set(10,8,AC);if(t>=3){s.set(8,4,AC);s.set(6,8,W);s.set(10,8,W)}
      }else if(cls==="berserk"){
        /* Casque viking à grandes cornes */
        s.part(MT,q=>{q.ell(8,9,4.6,4.2);q.clear(0,11,16,5)});
        s.part(P1,q=>q.rect(3,9,10,2));s.part(MT,q=>q.rect(7,9,2,4),F);
        const hCol=t>=4?AC:P2;
        s.part(hCol,q=>{q.poly([[4,8],[1,5],[1,2],[3,4],[5,7]]);q.poly([[12,8],[15,5],[15,2],[13,4],[11,7]])});
        if(t>=3){s.set(8,6,AC);s.set(1,2,W);s.set(15,2,W)}
      }else if(cls==="mage"){
        /* Chapeau pointu d'arcaniste */
        s.part(P1,q=>{q.poly([[8,1],[5,3],[4,10],[12,10],[11,5]]);q.ell(8,11,6.8,1.8)});
        s.part(GO,q=>q.rect(4,9,8,1),F);s.set(8,6,AC);s.set(7,6,AC);
        if(t>=2){s.set(8,5,W);s.set(10,8,AC)}
        if(t>=3){s.set(4,2,AC);s.set(12,4,AC)}
      }else if(cls==="archer"){
        /* Capuche de traqueur + plume */
        s.part(P1,q=>{q.poly([[8,2],[13,6],[13,12],[3,12],[3,6]])});
        s.part(DK,q=>q.rect(4,10,8,2),F);
        s.part(AC,q=>q.poly([[11,5],[15,1],[13,6]]),F);
        if(t>=2)s.set(8,5,MT);
        if(t>=3)s.set(15,1,W);
      }else if(cls==="gardien"){
        /* Grand heaume de bastion + couronne */
        s.part(MT,q=>{q.rect(3,3,10,10);q.clear(3,3,1,1);q.clear(12,3,1,1)});
        s.part(P1,q=>q.rect(7,4,2,8),F);s.part("#1a1024",q=>{q.rect(4,7,8,1);q.rect(7,8,2,3)},F);
        s.part(GO,q=>{q.rect(3,3,10,1);if(t>=1){q.px(4,2);q.px(8,1);q.px(12,2)}},F);
        if(t>=3){s.set(6,7,AC);s.set(9,7,AC)}
      }else if(cls==="peste"){
        /* Couronne de ramures et spores */
        s.part(P2,q=>{q.line(5,9,2,4);q.line(2,4,2,1);q.line(4,6,1,5);q.line(11,9,14,4);q.line(14,4,14,1);q.line(12,6,15,5)},F);
        s.part(P1,q=>q.rect(3,9,10,3));s.part(AC,q=>{q.px(5,9);q.px(8,8);q.px(11,9);if(t>=2){q.px(2,1);q.px(14,1)}},F);
      }else if(cls==="chrono"){
        /* Diadème / capuche temporelle à rayons */
        s.part(P1,q=>{q.ell(8,9,5,4);q.clear(0,11,16,5)});
        s.part(GO,q=>{q.rect(3,9,10,2);q.px(4,5);q.px(8,2);q.px(12,5);q.line(8,3,8,8)},F);
        s.part(AC,q=>q.rect(7,6,2,2),F);if(t>=3)s.set(8,2,W);
      }else{
        /* Guerrier : heaume de champion à cimier */
        s.part(MT,q=>{q.ell(8,8.5,5,4.8);q.clear(0,12,16,4)});
        s.part("#1c1020",q=>q.rect(4,9,8,1),F);
        s.part(P1,q=>q.poly([[7,1],[11,1],[10,5],[6,5]]));
        s.part(AC,q=>{q.px(8,2);q.px(9,2);if(t>=2){q.px(3,7);q.px(13,7)}},F);
        if(t>=3){s.set(3,6,MT);s.set(13,6,MT)}
      }
    }else if(slot==="cape"){
      if(boss){
        /* Cape souveraine du Boss : larges épaulières dorées + manteau majestueux */
        s.part(P1,q=>q.poly([[3,3],[12,3],[15,14],[1,14]]));
        s.part(P2,q=>q.poly([[6,4],[9,4],[11,14],[4,14]]),{dk:.2});
        s.part(GO,q=>{q.rect(2,2,12,2);q.rect(6,4,4,2);q.px(2,1);q.px(8,1);q.px(13,1)},F);
        s.part(AC,q=>{q.rect(7,4,2,2);if(t>=2)q.rect(2,13,12,1)},F);
      }else if(cls==="invoc"||cls==="mage"){
        /* Robe longue rituelle / étoilée avec manches */
        s.part(P1,q=>{q.poly([[5,2],[10,2],[13,14],[2,14]]);q.rect(2,4,3,4);q.rect(11,4,3,4)});
        s.part(DK,q=>q.rect(6,3,4,11),F);
        s.part(AC,q=>{q.rect(7,4,2,8);q.rect(3,13,10,1)},F);
        if(t>=3){s.set(7,5,W);s.set(8,9,W)}
      }else if(cls==="berserk"){
        /* Fourrure de bête sauvage */
        s.part(P1,q=>q.poly([[4,3],[11,3],[14,13],[11,14],[8,12],[5,14],[2,13]]));
        s.part(P2,q=>{q.rect(3,2,10,3);q.px(4,5);q.px(11,5)});
        s.part(t>=3?AC:"#f1e4bf",q=>{q.px(6,4);q.px(9,4)},F);
      }else{
        /* Manteau de classe structuré */
        s.part(P1,q=>q.poly([[4,2],[11,2],[14,14],[2,14]]));
        s.part(DK,q=>{q.line(6,5,5,13);q.line(10,5,11,13)},F);
        s.part(MT,q=>q.rect(4,2,8,2),F);s.set(7,3,AC);s.set(8,3,AC);
        if(t>=2)s.part(AC,q=>q.rect(3,13,10,1),F);
      }
    }else if(slot==="bouclier"){
      if(cls==="invoc"){
        /* Grimoire occulte lié */
        s.part(P1,q=>q.rect(3,2,10,12));s.part(DK,q=>q.rect(3,2,2,12),F);
        s.part(MT,q=>{q.px(12,2);q.px(12,13);q.px(3,2);q.px(3,13)},F);
        s.part(AC,q=>{q.ell(8.5,8,2.2,2.2)},{lt:.6});s.set(8,8,W);
      }else if(cls==="mage"){
        /* Orbe arcanique flottant */
        s.part(AC,q=>q.ell(8,8,4.2,4.2),{lt:.7});s.set(6,6,W);s.set(7,6,W);
        s.part(GO,q=>{q.line(2,10,14,6);q.px(8,2);q.px(8,14)},F);
      }else if(cls==="chrono"){
        /* Cadran céleste */
        s.part(GO,q=>{q.ell(8,8,5.4,5.4);q.clear(5,5,6,6)});
        s.part(P1,q=>q.ell(8,8,3.6,3.6));
        s.part(AC,q=>{q.line(8,8,8,5);q.line(8,8,11,8)},F);s.set(8,8,W);
      }else if(cls==="peste"){
        /* Fiole-totem toxique */
        s.part(MT,q=>q.rect(6,2,4,3));s.part("#d8eef5",q=>q.ell(8,9.5,4.4,4.2),{lt:.5});
        s.part(AC,q=>{q.ell(8,10.5,3.2,3);q.clear(0,0,16,8)});s.set(6,9,W);
        s.part(P1,q=>{q.line(4,7,12,12)},F);
      }else if(cls==="berserk"){
        /* Targe viking ronde cloutée */
        s.part(P1,q=>q.ell(8,8,5.5,5.5));s.part(MT,q=>{q.ell(8,8,2.2,2.2);q.px(8,3);q.px(8,13);q.px(3,8);q.px(13,8)},F);
        s.set(8,8,t>=2?AC:W);
      }else if(cls==="archer"){
        /* Brassard de tireur */
        s.part(P1,q=>q.poly([[4,3],[11,3],[12,13],[5,13]]));
        s.part(MT,q=>{q.rect(4,4,8,1);q.rect(5,11,7,1)},F);s.part(AC,q=>q.rect(7,6,2,4),F);
      }else if(cls==="gardien"){
        /* Pavois massif */
        s.part(MT,q=>q.poly([[2,1],[13,1],[13,10],[7.5,15],[2,10]]));
        s.part(P1,q=>q.poly([[4,3],[11,3],[11,9],[7.5,13],[4,9]]));
        s.part(GO,q=>{q.rect(7,4,2,8);q.rect(5,6,6,2)},F);s.set(7,6,AC);
      }else{
        /* Guerrier : écu de champion */
        s.part(P1,q=>q.poly([[3,2],[12,2],[12,8],[7.5,14],[3,8]]));
        s.part(MT,q=>q.line(4,3,11,10,2),F);s.part(AC,q=>q.rect(7,6,2,3),F);
      }
    }else if(slot==="bottes"){
      const heavy=cls==="guerrier"||cls==="gardien";
      s.part(heavy?MT:P1,q=>{q.rect(4,3,5,9);q.rect(4,10,9,3);q.clear(12,10,1,1)});
      s.part(cls==="berserk"?P2:heavy?P1:LT,q=>q.rect(4,2,5,2),F);
      s.part("#3a2824",q=>q.rect(4,13,10,1),F);
      if(t>=1)s.set(7,11,AC);
      if(t>=3){s.set(4,5,AC);s.set(12,11,AC)}
    }else if(slot==="ceinture"){
      s.part(P1,q=>q.rect(1,6,14,4));
      s.part(boss?GO:MT,q=>{q.rect(5,5,6,6);q.clear(7,7,2,2)});
      s.part(AC,q=>q.rect(7,7,2,2),F);
      if(boss){s.set(6,4,GO);s.set(9,4,GO);s.set(7,4,W)}
      else if(cls==="berserk"){s.set(7,6,"#f1e4bf");s.set(8,6,"#f1e4bf")}
      else if(t>=2){s.set(3,7,MT);s.set(12,7,MT)}
    }else if(slot==="amulette"){
      s.part(boss?GO:MT,q=>{q.px(3,1);q.px(4,3);q.px(5,5);q.px(6,7);q.px(12,1);q.px(11,3);q.px(10,5);q.px(9,7);q.px(3,2);q.px(12,2);q.px(4,4);q.px(11,4);q.px(5,6);q.px(10,6)},F);
      s.part(boss?GO:MT,q=>q.ell(7.5,10.5,3.8,3.8));
      s.part(P1,q=>q.ell(7.5,10.5,2.4,2.4));s.set(7,10,AC);s.set(8,10,AC);
      if(boss||t>=3){s.set(7,9,W);s.set(7,6,AC)}
    }else if(slot==="anneau"){
      s.part(boss?GO:MT,q=>{q.ell(7.5,10,4.5,4.5);q.clear(6,8,4,4)});
      s.part(P1,q=>{q.rect(5,2,6,4);q.clear(5,2,1,1);q.clear(10,2,1,1)},{lt:.5});
      s.part(AC,q=>q.rect(7,3,2,2),F);if(boss||t>=3)s.set(7,3,W);
    }

    /* Aura & étincelles pour les zones de fin de jeu (palier 3-4) et les objets de Boss */
    if(t>=4){
      const a1=th.aura?th.aura[0]:AC,a2=th.aura?th.aura[1]:W;
      s.set(1,1,a1);s.set(14,1,a2);s.set(1,14,a2);s.set(14,14,a1);
      if(z===11){s.set(2,1,a2);s.set(14,2,a1)}
    }else if(t===3||boss){spark(14,1,boss?"#ffd84a":AC)}
    const outCol=z===11?"#3b125c":z===9?"#4a1408":z===10?"#241c4a":boss?"#523008":INK;
    s.outline(outCol);return cache[k]=s.fit(16).url()}

  /* ---------- Ressources de métier (16×16) : 12 formes et silhouettes distinctes par métier ---------- */
  const RC={pecheur:["#c8b08a","#8fb06a","#6fa35a","#b0643a","#e2b66a","#8fc7e0","#f2d94a","#5fae4a","#e8684a","#f0622c","#a8e8e0","#5a4fa8"],
    bucheron:["#c9a36a","#a8743e","#7a5232","#9c6f42","#d65c32","#6c7c42","#ebe4d2","#c85a48","#8a7254","#58443c","#2f2a38","#8e3c5a"],
    mineur:["#a8b0be","#e08642","#ccd4dc","#eaf2fa","#ffd24a","#3a6ee0","#8ca8b8","#b86892","#d46a46","#eef6ff","#66e8dc","#6a38a8"],
    paysan:["#f2cf54","#e0c268","#e8d898","#76b848","#c89648","#78b4f0","#ffd43a","#e2ba74","#f6f4ea","#d46262","#d8ae64","#e04c88"],
    herboriste:["#4fa642","#8ab298","#3fd08c","#a8de54","#f6f8ff","#b868d8","#9a74f0","#6fb84a","#68349a","#e2b860","#ff78c8","#ff92c8"]};
  function res(prof,t){
    const k="r:"+prof+t;if(cache[k])return cache[k];
    const s=new Spr(22,22,3,3),idx=((t|0)%12+12)%12,c=(RC[prof]||RC.bucheron)[idx];
    const lt=mix(c,LIGHT,.5),dk=mix(c,DARK,.45),W="#ffffff",F={flat:1};
    let outCol=INK;

    if(prof==="pecheur")return cache[k]=fish(c,0,idx);

    if(prof==="bucheron"){
      if(idx===0){
        /* 0 Frêne : bûche claire fendue à la hache + petite feuille */
        s.part(c,q=>{q.rect(2,6,11,6);q.clear(2,6,1,1);q.clear(2,11,1,1)});
        s.part(lt,q=>q.ell(12.5,8.5,1.6,2.6),F);s.set(12,8,dk);s.set(13,9,dk);
        s.part(dk,q=>{q.rect(4,8,3,1);q.rect(8,10,3,1)},F);
        s.part("#5fae4a",q=>{q.rect(4,4,3,2);q.px(5,3)},F);
      }else if(idx===1){
        /* 1 Châtaignier : rondin trapu nervuré + châtaigne ronde */
        s.part(c,q=>q.poly([[2,5],[12,4],[13,11],[3,12]]));
        s.part(lt,q=>q.ell(12,7.5,1.8,3.2),F);s.set(12,7,dk);
        s.part(dk,q=>{q.line(4,7,9,6);q.line(5,10,10,9)},F);
        s.part("#7a3a1e",q=>q.ell(4.5,11.5,2.4,2.2));s.set(4,10,"#e8c28a");
      }else if(idx===2){
        /* 2 Noyer : tronc noueux courbé + mousse des marais */
        s.part(c,q=>{q.line(2,11,8,8,4);q.line(7,8,13,9,4);q.rect(6,5,3,3)});
        s.part(lt,q=>q.ell(13.5,10,1.4,2),F);
        s.part("#5a8c44",q=>{q.rect(5,5,4,2);q.px(9,6);q.px(4,8)},F);
      }else if(idx===3){
        /* 3 Chêne : pile triangulaire de 3 grosses bûches */
        s.part(c,q=>{q.ell(5,11,3.2,2.6);q.ell(11,11,3.2,2.6);q.ell(8,6,3.2,2.6)});
        s.part(lt,q=>{q.ell(5,11,1.6,1.4);q.ell(11,11,1.6,1.4);q.ell(8,6,1.6,1.4)},F);
        s.set(5,11,dk);s.set(11,11,dk);s.set(8,6,dk);
      }else if(idx===4){
        /* 4 Érable : bûche ambrée + grande feuille d'érable rouge */
        s.part("#b46e3c",q=>q.rect(2,9,12,5));s.part("#ecc290",q=>q.ell(13,11.5,1.4,2.2),F);
        s.part(c,q=>q.poly([[8,1],[10,4],[13,4],[11,7],[12,9],[8,8],[4,9],[5,7],[3,4],[6,4]]),{lt:.45});
        s.set(8,4,"#ffd27a");
      }else if(idx===5){
        /* 5 If : branche fourchue enneigée + aiguilles sombres + baies rouges */
        s.part("#5a422e",q=>{q.line(3,14,9,8,2);q.line(9,8,13,3,2);q.line(8,9,4,4,2)});
        s.part("#2f5a38",q=>{q.ell(12,4,2.8,2);q.ell(4,5,2.6,1.8);q.ell(9,9,2.2,1.6)});
        s.part("#eef8ff",q=>{q.px(11,2);q.px(13,2);q.px(3,3)},F);
        s.set(11,5,"#e83838");s.set(5,6,"#e83838");
      }else if(idx===6){
        /* 6 Bouleau : double rondin blanc strié de noir */
        s.part(c,q=>{q.rect(2,4,10,4);q.rect(4,9,10,4)});
        s.part("#d8c29a",q=>{q.rect(11,4,2,4);q.rect(13,9,2,4)},F);
        s.part("#2b2430",q=>{q.rect(4,5,2,1);q.rect(8,6,2,1);q.rect(6,10,2,1);q.rect(10,11,2,1)},F);
      }else if(idx===7){
        /* 7 Merisier : branche rouge-cerise + fleurs roses */
        s.part(c,q=>{q.line(2,13,12,5,3);q.line(7,9,13,11,2)});
        s.part("#ffb4d2",q=>{q.ell(5,6,2.4,2.2);q.ell(12,4,2.2,2);q.ell(12,11,2,1.8)},{lt:.5});
        s.set(5,6,"#ffe27a");s.set(12,4,"#ffe27a");
      }else if(idx===8){
        /* 8 Orme : gros billot vertical biseauté à racines */
        s.part(c,q=>{q.rect(4,4,8,9);q.poly([[2,14],[5,11],[11,11],[14,14]])});
        s.part(lt,q=>q.ell(8,4,4,2),F);s.part(dk,q=>{q.ell(8,4,2,1);q.line(6,7,6,11);q.line(10,8,10,12)},F);
      }else if(idx===9){
        /* 9 Charme : fagot lié + éclats de braise */
        s.part(c,q=>{q.line(2,11,13,4,2);q.line(2,8,13,11,2);q.line(3,5,13,8,2)});
        s.part("#f2b444",q=>q.rect(7,5,2,7),F);
        s.set(4,6,"#ff7828");s.set(12,4,"#ffd04a");s.set(12,10,"#ff5a22");
      }else if(idx===10){
        /* 10 Ébène : poutre taillée noir-violet aux reflets lunaires */
        s.part(c,q=>q.poly([[2,10],[6,3],[14,5],[10,13]]));
        s.part("#98c8ff",q=>{q.line(6,4,13,6);q.px(8,8);q.px(9,9)},F);
        s.set(6,4,W);outCol="#241c4a";
      }else{
        /* 11 Séquoia : tranche géante de séquoia aux anneaux + veine du néant */
        s.part(c,q=>q.ell(8,8,6.4,5.8));
        s.part(lt,q=>q.ell(8,8,4.6,4.1),F);
        s.part(dk,q=>{q.ell(8,8,3,2.6);q.clear(7,7,2,2)},F);
        s.part("#d85aff",q=>{q.px(8,8);q.line(8,8,12,6);q.px(5,10)},F);
        s.set(8,8,W);outCol="#3b125c";
      }
    }else if(prof==="mineur"){
      if(idx===0){
        /* 0 Fer : bloc de minerai anguleux gris-acier */
        s.part("#6d6878",q=>q.poly([[2,13],[3,6],[8,2],[13,5],[14,12],[10,14]]));
        s.part(c,q=>{q.poly([[5,5],[9,4],[11,8],[7,10]]);q.rect(9,10,3,2)},{lt:.55});
        s.set(6,5,W);s.set(10,10,W);
      }else if(idx===1){
        /* 1 Cuivre : amas orangé + vert-de-gris */
        s.part("#6a5850",q=>q.poly([[2,12],[4,6],[10,4],[14,9],[12,13]]));
        s.part(c,q=>{q.ell(6,9,2.8,2.6);q.ell(10.5,8,2.6,2.4);q.ell(8,5.5,2,1.8)},{lt:.5});
        s.part("#4fb89c",q=>{q.rect(5,11,3,2);q.px(11,5)},F);s.set(6,8,W);
      }else if(idx===2){
        /* 2 Étain : roche stratifiée à veines argentées horizontales */
        s.part("#5c686e",q=>q.poly([[2,12],[3,4],[13,4],[14,12]]));
        s.part(c,q=>{q.rect(3,5,10,2);q.rect(4,9,9,2)},{lt:.55});
        s.set(4,5,W);s.set(9,9,W);
      }else if(idx===3){
        /* 3 Argent : barre/lingot brut biseauté étincelant */
        s.part(c,q=>q.poly([[2,11],[5,5],[12,4],[14,9],[11,13],[3,13]]),{lt:.6});
        s.part(W,q=>{q.line(5,6,11,5);q.px(13,2);q.px(13,4);q.px(12,3);q.px(14,3)},F);
      }else if(idx===4){
        /* 4 Or : grosse pépite d'or bosselée */
        s.part(c,q=>{q.ell(6,9,4,3.6);q.ell(10.5,7.5,3.6,3.4);q.ell(8.5,11,3.2,2.4)},{lt:.65});
        s.set(5,7,W);s.set(10,5,W);s.set(11,6,"#fff6c8");
      }else if(idx===5){
        /* 5 Cobalt : grappe de 3 cristaux pointus bleu roi sur roche */
        s.part("#5a6c82",q=>q.poly([[3,14],[5,10],[12,10],[13,14]]));
        s.part(c,q=>{q.poly([[4,11],[3,5],[6,3],[7,11]]);q.poly([[7,11],[8,1],[11,4],[10,11]]);q.poly([[10,11],[13,4],[14,8],[12,11]])},{lt:.65});
        s.set(8,3,W);s.set(5,5,W);
      }else if(idx===6){
        /* 6 Zinc : géode entrouverte à cœur cristallin */
        s.part("#586270",q=>q.ell(8,8,6.2,5.6));
        s.part(dk,q=>q.ell(8,8,4.2,3.6),F);
        s.part(c,q=>{q.poly([[6,9],[7,5],[9,6],[8,10]]);q.poly([[9,9],[11,6],[11,10]])},{lt:.7});
        s.set(7,6,W);
      }else if(idx===7){
        /* 7 Manganèse : nodule rond strié de bandes rose-violet */
        s.part("#4a3848",q=>q.ell(8,8,5.8,5.4));
        s.part(c,q=>{q.line(4,6,11,4,2);q.line(3,9,12,7,2);q.line(5,12,11,10,2)},{lt:.55});
        s.set(5,5,W);s.set(10,7,W);
      }else if(idx===8){
        /* 8 Bauxite : agglomérat terracotta oolithique */
        s.part("#8e4430",q=>q.poly([[2,12],[4,4],[11,3],[14,9],[11,14],[4,14]]));
        s.part(c,q=>{q.ell(6,6,2,2);q.ell(10.5,6.5,2.2,2);q.ell(6.5,11,2.2,2);q.ell(10.5,10.5,1.8,1.8)},{lt:.5});
        s.set(5,5,"#ffd8b0");s.set(10,6,"#ffd8b0");
      }else if(idx===9){
        /* 9 Platine : octaèdre / diamant brut glacé étincelant */
        s.part(c,q=>q.poly([[8,1],[14,7],[8,14],[2,7]]),{lt:.7});
        s.part("#98c8f0",q=>q.poly([[8,1],[14,7],[8,8]]),F);
        s.part(W,q=>{q.line(8,2,4,7);q.px(8,5);q.px(13,2)},F);
      }else if(idx===10){
        /* 10 Mithril : prisme hexagonal élancé luisant cyan */
        s.part(c,q=>q.poly([[8,1],[12,4],[12,11],[8,14],[4,11],[4,4]]),{lt:.65});
        s.part(W,q=>{q.line(6,4,6,10);q.px(8,2);q.px(2,3);q.px(14,12)},F);
        outCol="#243a5c";
      }else{
        /* 11 Obsidienne : éclat tranchant de verre volcanique + aura violette */
        s.part("#261a36",q=>q.poly([[4,14],[2,8],[8,1],[13,6],[11,14]]));
        s.part(c,q=>{q.line(8,2,4,9,2);q.line(8,2,12,7)},F);
        s.part("#ff68d8",q=>{q.px(8,2);q.px(13,6);q.px(3,8);q.px(8,8)},F);
        s.set(8,2,W);outCol="#3b125c";
      }
    }else if(prof==="paysan"){
      if(idx===0){
        /* 0 Blé : gerbe de 3 épis dorés + ruban rouge */
        s.part("#a87a38",q=>{q.line(8,15,8,7);q.line(8,13,5,9);q.line(8,13,11,9)},F);
        s.part(c,q=>{[[7,2],[7,5],[4,6],[10,6],[6,7],[9,7]].forEach(([x,y])=>q.rect(x,y,2,2))});
        s.part("#d04034",q=>q.rect(6,12,5,1),F);
      }else if(idx===1){
        /* 1 Orge : long épi barbu incliné avec arêtes */
        s.part("#b08a42",q=>q.line(3,14,12,4),F);
        s.part(c,q=>{q.line(5,11,11,5,3)});
        s.part(lt,q=>{q.line(11,4,14,1);q.line(9,4,11,1);q.line(12,6,15,4);q.line(7,6,8,3)},F);
      }else if(idx===2){
        /* 2 Avoine : tige souple à clochettes tombantes */
        s.part("#9c844a",q=>{q.line(6,15,6,4);q.line(6,5,11,4);q.line(6,8,12,8);q.line(6,9,3,8)},F);
        s.part(c,q=>{q.rect(10,5,2,3);q.rect(11,9,2,3);q.rect(2,9,2,3);q.rect(8,2,2,2)});
      }else if(idx===3){
        /* 3 Houblon : grappe de 3 cônes feuillus verts sur tige */
        s.part("#3a6e2e",q=>{q.line(3,2,12,5);q.line(8,4,8,8)},F);
        s.part(c,q=>{q.ell(5,9,2.8,3.2);q.ell(11,9,2.8,3.2);q.ell(8,12,2.6,2.8)},{lt:.45});
        s.part("#c2f078",q=>{q.px(4,8);q.px(10,8);q.px(8,11)},F);
      }else if(idx===4){
        /* 4 Seigle : botte haute effilée ambrée */
        s.part("#8a5c28",q=>{q.rect(6,9,4,6);q.rect(5,11,6,1)},F);
        s.part(c,q=>{q.poly([[5,9],[6,2],[8,5],[10,2],[11,9]])},{lt:.4});
        s.set(6,3,lt);s.set(10,3,lt);
      }else if(idx===5){
        /* 5 Lin : tiges vert-bleu + 3 fleurs bleu ciel à 5 pétales */
        s.part("#4c8a62",q=>{q.line(8,15,8,6);q.line(8,12,4,8);q.line(8,12,12,8)},F);
        s.part(c,q=>{q.ell(8,4,2.6,2.6);q.ell(4,7,2.2,2.2);q.ell(12,7,2.2,2.2)},{lt:.55});
        s.set(8,4,"#fff2a0");s.set(4,7,"#fff2a0");s.set(12,7,"#fff2a0");
      }else if(idx===6){
        /* 6 Maïs : gros épi de maïs jaune dans ses feuilles vertes */
        s.part(c,q=>q.ell(8,7,3.4,5.4),{lt:.5});
        s.part("#d68e18",q=>{q.px(7,4);q.px(9,5);q.px(7,7);q.px(9,8);q.px(7,10)},F);
        s.part("#4ca040",q=>{q.poly([[4,14],[3,8],[6,11],[8,14]]);q.poly([[12,14],[13,8],[10,11],[8,14]])});
      }else if(idx===7){
        /* 7 Millet : gros plumeau rond et duveteux sur tige */
        s.part("#6a9442",q=>{q.line(8,15,8,9);q.line(8,13,5,11);q.line(8,12,11,10)},F);
        s.part(c,q=>{q.ell(8,5.5,3.8,4.2);q.px(5,3);q.px(11,3);q.px(8,1)},{lt:.45});
        s.part(dk,q=>{q.px(7,4);q.px(9,6);q.px(7,7)},F);
      }else if(idx===8){
        /* 8 Riz : tiges courbées en arc chargées de grains blancs */
        s.part("#6ca848",q=>{q.line(4,15,6,6);q.line(6,6,11,4);q.line(6,15,9,8)},F);
        s.part(c,q=>{q.ell(11,5,2,1.3);q.ell(12,8,2,1.3);q.ell(9,9,1.8,1.3);q.ell(12,11,1.6,1.2)},{lt:.6});
      }else if(idx===9){
        /* 9 Sarrasin : tige rougeâtre + bouquet blanc et graines sombres */
        s.part(c,q=>{q.line(8,15,8,7);q.line(8,11,4,7);q.line(8,11,12,7)},F);
        s.part("#fff4ea",q=>{q.ell(8,4,2.6,2.2);q.ell(4,6,2,1.8);q.ell(12,6,2,1.8)},F);
        s.part("#684638",q=>{q.px(6,10);q.px(10,10);q.px(8,8)},F);
      }else if(idx===10){
        /* 10 Épeautre : double épi dense cuivré-lunaire */
        s.part("#a88048",q=>{q.line(6,15,6,9);q.line(10,15,10,9)},F);
        s.part(c,q=>{q.ell(6,6,2.4,4.2);q.ell(10,6.5,2.4,4.2)},{lt:.55});
        s.part("#a8e4ff",q=>{q.px(5,4);q.px(10,5);q.px(6,8)},F);
      }else{
        /* 11 Quinoa : panache luxuriant pourpre-magenta du néant */
        s.part("#6a3a64",q=>q.line(8,15,8,9),F);
        s.part(c,q=>{q.ell(8,4,2.8,2.6);q.ell(5.5,7,2.6,2.6);q.ell(10.5,7,2.6,2.6);q.ell(8,9,2.8,2.2)},{lt:.5});
        s.part("#ffd8ff",q=>{q.px(8,3);q.px(5,6);q.px(11,7)},F);outCol="#3b125c";
      }
    }else if(prof==="herboriste"){
      if(idx===0){
        /* 0 Ortie : feuilles dentelées vert vif en pointe */
        s.part("#2f7a2c",q=>q.line(8,15,8,6),F);
        s.part(c,q=>{q.poly([[8,1],[11,5],[10,9],[8,11],[6,9],[5,5]]);q.poly([[2,8],[6,9],[6,13],[3,12]]);q.poly([[14,8],[10,9],[10,13],[13,12]])});
        s.part("#a8f278",q=>{q.line(8,3,8,10);q.px(4,10);q.px(12,10)},F);
      }else if(idx===1){
        /* 1 Sauge : touffe de feuilles allongées gris-vert + bourgeon lilas */
        s.part(c,q=>{q.ell(5,10,2.2,4.2);q.ell(11,10,2.2,4.2);q.ell(8,8,2.4,4.6)},{lt:.45});
        s.part("#b892e8",q=>{q.rect(7,2,2,3);q.px(8,1)},F);
      }else if(idx===2){
        /* 2 Menthe : feuilles rondes gaufrées symétriques vert menthe */
        s.part("#2a7e56",q=>q.line(8,15,8,4),F);
        s.part(c,q=>{q.ell(4.5,11,2.8,2.2);q.ell(11.5,11,2.8,2.2);q.ell(5,6.5,2.6,2);q.ell(11,6.5,2.6,2);q.ell(8,3,2,2)},{lt:.5});
        s.set(5,6,W);s.set(11,10,W);
      }else if(idx===3){
        /* 3 Mélisse : feuilles en cœur + fleurettes citron */
        s.part("#4c8c32",q=>q.line(8,15,8,6),F);
        s.part(c,q=>{q.ell(5,10,3,2.6);q.ell(11,10,3,2.6);q.ell(8,6,3,2.6)});
        s.part("#fff278",q=>{q.rect(6,3,2,2);q.rect(10,5,2,2);q.rect(4,7,2,2)},F);
      }else if(idx===4){
        /* 4 Edelweiss : étoile blanche duveteuse à 6 pointes */
        s.part("#4c8252",q=>q.line(8,15,8,9),F);
        s.part(c,q=>{q.poly([[8,1],[10,5],[14,4],[11,8],[13,12],[8,10],[3,12],[5,8],[2,4],[6,5]])},{lt:.4});
        s.part("#ffd24a",q=>q.ell(8,7,2,2),F);s.set(8,7,W);
      }else if(idx===5){
        /* 5 Mandragore : racine humanoïde potelée + panache de feuilles pourpres */
        s.part("#c49664",q=>{q.ell(8,10,3.6,3.4);q.line(6,12,4,15,2);q.line(10,12,12,15,2);q.line(5,9,2,8);q.line(11,9,14,8)});
        s.set(7,9,"#3a2218");s.set(9,9,"#3a2218");
        s.part(c,q=>{q.poly([[8,7],[4,2],[7,4],[8,1],[9,4],[12,2]])},{lt:.5});
      }else if(idx===6){
        /* 6 Lavande : 3 longs épis fuselés bleu-violet */
        s.part("#4a7c4a",q=>{q.line(8,15,8,8);q.line(8,14,4,9);q.line(8,14,12,9)},F);
        s.part(c,q=>{q.rect(7,2,2,7);q.rect(3,4,2,6);q.rect(11,4,2,6)},{lt:.55});
        s.set(7,2,W);s.set(3,4,W);s.set(11,4,W);
      }else if(idx===7){
        /* 7 Thym : petit buisson ligneux couvert de feuilles et fleurettes */
        s.part("#7a5436",q=>{q.line(8,15,8,9);q.line(8,12,4,8);q.line(8,12,12,8);q.line(8,10,5,5);q.line(8,10,11,5)},F);
        s.part(c,q=>{[[4,7],[6,4],[8,6],[10,4],[12,7],[5,10],[11,10]].forEach(([x,y])=>q.rect(x,y,2,2))});
        s.set(6,4,"#ffe898");s.set(10,4,"#ffe898");s.set(8,3,"#ffe898");
      }else if(idx===8){
        /* 8 Belladone : branche sombre + 3 baies noires-violettes luisantes */
        s.part("#3a5a3a",q=>{q.line(3,4,13,6);q.line(6,5,5,9);q.line(10,6,11,10);q.line(8,6,8,12)},F);
        s.part(c,q=>{q.ell(5,10,2.4,2.4);q.ell(11,10.5,2.4,2.4);q.ell(8,13,2.2,2.2)},{lt:.55});
        s.set(4,9,W);s.set(10,9,W);s.set(7,12,W);
      }else if(idx===9){
        /* 9 Ginseng : racine fourchue dorée + grappe de baies rouges */
        s.part(c,q=>{q.ell(8,10,2.8,3.6);q.line(6,12,4,15,2);q.line(10,12,12,15,2);q.line(6,9,3,10);q.line(10,9,13,10)});
        s.part("#4c8c3a",q=>q.line(8,7,8,4),F);
        s.part("#e83a3a",q=>{q.ell(8,3,2.2,2);q.px(6,4);q.px(10,4)},{lt:.5});s.set(8,2,W);
      }else if(idx===10){
        /* 10 Orchidée : grande fleur exotique ailée rose-fushia */
        s.part("#3f8a52",q=>q.line(8,15,8,10),F);
        s.part(c,q=>{q.ell(4,7,3,2.2);q.ell(12,7,3,2.2);q.ell(8,3.5,2.4,2.8);q.ell(6,10,2,2);q.ell(10,10,2,2)},{lt:.55});
        s.part("#ffe268",q=>q.ell(8,7.5,2,1.8),F);s.set(8,7,W);
      }else{
        /* 11 Lotus : fleur de lotus épanouie sur feuille flottante */
        s.part("#2c6e68",q=>q.ell(8,12.5,6.2,2.2));
        s.part(c,q=>{q.poly([[8,2],[10,7],[6,7]]);q.poly([[3,6],[7,9],[5,11],[2,9]]);q.poly([[13,6],[9,9],[11,11],[14,9]]);q.ell(8,9,3.8,2.4)},{lt:.55});
        s.set(8,6,"#fff2a8");s.set(8,3,W);outCol="#3b125c";
      }
    }
    s.outline(outCol);return cache[k]=s.fit(16).url()}

  /* ---------- Butins, clés, potions, familiers (16×16) ---------- */
  function drop(kind,col,rare,id){
    const d=id||"";
    const k="d:"+kind+col+(rare?1:0)+d;if(cache[k])return cache[k];
    const s=new Spr(22,22,3,3),W="#ffffff",F={flat:1},lt=mix(col,W,.58),dk=mix(col,DARK,.45),sh=mix(col,INK,.62);
    let outCol=rare?"#8a4a08":INK;
    if(kind==="gear"){
      if(d==="b_rouage"){
        s.part(col,q=>{q.ell(8,8,5.2,5.2);q.rect(7,1,2,14);q.rect(1,7,14,2);q.rect(3,3,2,2);q.rect(11,3,2,2);q.rect(3,11,2,2);q.rect(11,11,2,2);q.clear(6,6,4,4)},{lt:.5});
        s.part(lt,q=>{q.ell(8,8,2.2,2.2);q.clear(7,7,2,2)},F);s.set(8,8,"#ffe89a");s.set(7,2,W);
      }else{
        s.part(col,q=>{q.ell(8,8,4.8,4.8);q.rect(7,2,2,12);q.rect(2,7,12,2);q.px(3,4);q.px(12,4);q.px(3,11);q.px(12,11);q.clear(6,6,4,4)});
        s.part(dk,q=>{q.rect(6,6,4,1);q.rect(6,9,4,1)},F);s.set(4,4,"#6ca074");s.set(11,11,"#6ca074");s.set(7,3,lt);
      }
    }else if(kind==="bolt"){
      if(d==="x_vrillon"){
        s.part(col,q=>{q.poly([[5,2],[11,2],[10,6],[9,10],[8,14],[7,10],[6,6]])},{lt:.5});
        s.part(dk,q=>{q.line(5,4,10,5);q.line(6,7,10,8);q.line(7,10,9,11)},F);
        s.part(lt,q=>{q.rect(6,2,4,1);q.px(7,6);q.px(7,9)},F);s.set(8,14,W);
      }else{
        s.part(col,q=>{q.poly([[4,3],[9,2],[11,4],[10,7],[5,7],[3,5]]);q.line(7,7,9,10,2);q.line(9,10,12,13,2)},{lt:.45});
        s.part(dk,q=>{q.px(7,9);q.px(9,11);q.px(11,12)},F);s.set(6,3,W);s.set(8,3,lt);
      }
    }else if(kind==="hourglass"){
      s.part("#d8a642",q=>{q.rect(3,2,10,2);q.rect(3,12,10,2);q.line(4,4,4,12);q.line(11,4,11,12)},{lt:.5});
      s.part("#cde8f8",q=>{q.poly([[5,4],[11,4],[8,8]]);q.poly([[8,8],[5,12],[11,12]])},{lt:.55});
      s.part(col,q=>{q.poly([[6,5],[10,5],[8,7]]);q.poly([[8,10],[6,12],[10,12]]);q.px(8,8);q.px(8,9)},{lt:.45});
      s.set(6,4,W);s.set(5,2,"#fff3b0");
    }else if(kind==="lantern"){
      if(d==="x_baudrillon"){
        s.part(dk,q=>{q.line(3,14,4,8);q.line(4,8,7,4);q.line(7,4,11,4);q.line(11,4,11,7)},F);
        s.part(col,q=>q.ell(10.5,9.5,3.2,3.4),{lt:.65});
        s.part(W,q=>q.ell(10,9,1.4,1.6),F);s.set(9,13,lt);s.set(12,13,lt);s.set(11,14,col);outCol="#182a4c";
      }else{
        s.part("#5a4a42",q=>{q.rect(6,1,4,2);q.rect(4,3,8,2);q.rect(4,12,8,2);q.line(4,5,4,12);q.line(11,5,11,12)});
        s.part(col,q=>q.rect(5,5,6,7),{lt:.6});
        s.part("#fff3a0",q=>{q.poly([[8,6],[10,9],[8,11],[6,9]])},F);s.set(8,8,W);
      }
    }else if(kind==="clover"){
      s.part(dk,q=>{q.line(8,10,7,14);q.px(6,14)},F);
      s.part(col,q=>{q.ell(6,5.5,2.4,2.4);q.ell(10,5.5,2.4,2.4);q.ell(5.5,9.5,2.4,2.4);q.ell(10.5,9.5,2.4,2.4)},{lt:.5});
      s.set(8,7.5,"#fff088");s.set(5,4.5,lt);s.set(10,4.5,lt);s.set(12,3,"#fff5b8");
    }else if(kind==="acorn"){
      const capCol=d==="gland_ancien"?"#5c4a32":"#7d532c";
      s.part(col,q=>{q.ell(8,9.5,4,4.2);q.poly([[5,11],[11,11],[8,14]])},{lt:.55});
      s.part(capCol,q=>{q.ell(8,5.5,4.8,2.6);q.rect(7,2,2,2)},{lt:.35});
      s.set(5,5,dk);s.set(8,5,dk);s.set(11,5,dk);s.set(6,9,W);
      if(d==="gland_ancien"){s.set(9,9,"#7ef0a0");s.set(8,11,"#7ef0a0");s.set(5,4,"#4ea050")}
      else{s.set(6,8,"#fff6b8");s.set(7,9,W)}
    }else if(kind==="mushroom"){
      if(d==="truffe_lum"){
        s.part(col,q=>{q.ell(8,9,5.2,4.4);q.ell(5.5,7.5,3,2.8);q.ell(11,8.5,2.8,3)},{lt:.4});
        s.part("#b8fff0",q=>{q.line(5,8,8,10);q.line(8,10,11,7);q.px(7,12)},F);s.set(4,4,"#d8fff8");s.set(12,4,"#d8fff8");
      }else if(d==="x_mousseron"){
        s.part("#e6dac0",q=>{q.rect(5,8,2,6);q.rect(10,9,2,5);q.line(6,13,11,13)});
        s.part(col,q=>{q.ell(6,7,3.4,2.5);q.ell(11,8.5,2.8,2)},{lt:.5});
        s.set(5,6,lt);s.set(10,7.5,lt);
      }else{
        s.part("#ede2cc",q=>{q.rect(6,8,4,6);q.rect(5,13,6,1)});
        s.part(col,q=>{q.ell(8,6.5,5.6,3.8);q.clear(2,8,12,3)},{lt:.5});
        s.set(5,5,W);s.set(6,5,W);s.set(10,4,W);s.set(11,6,W);s.set(8,6,W);
      }
    }else if(kind==="egg"){
      s.part(col,q=>{q.ell(8,9.5,4.4,4.8);q.ell(8,6,3.1,3.2)},{lt:.55});
      s.part("#fff4b0",q=>{q.line(5,9,11,9);q.px(8,7);q.px(8,11)},F);
      s.set(6,6,W);s.set(6,7,W);s.set(10,11,dk);
    }else if(kind==="shell"){
      if(d==="b_nacre"){
        s.part(col,q=>{q.poly([[8,13],[2,7],[4,3],[8,2],[12,3],[14,7]]);q.rect(6,12,4,2)},{lt:.6});
        s.part(W,q=>{q.line(8,12,5,4);q.line(8,12,8,3);q.line(8,12,11,4)},F);
        s.set(6,6,"#ffd6f0");s.set(10,6,"#c8f4ff");
      }else{
        s.part(col,q=>{q.ell(8.5,8.5,5.2,4.8);q.poly([[3,10],[5,13],[9,13]])},{lt:.5});
        s.part(dk,q=>{q.line(6,6,10,6);q.line(10,6,11,9);q.line(11,9,7,11);q.line(7,11,6,8);q.px(8,8)},F);
        s.set(6,5,lt);s.set(9,5,W);
      }
    }else if(kind==="pearl"){
      if(d==="b_perle"){
        s.part(dk,q=>{q.poly([[2,10],[5,14],[11,14],[14,10],[12,8],[4,8]])});
        s.part(col,q=>q.ell(8,7.5,4.2,4.2),{lt:.65});
        s.set(6,5.5,W);s.set(7,5.5,W);s.set(6,6.5,W);s.set(10,9,"#ffd8f4");
      }else{
        s.part("#3d6e4c",q=>{q.line(4,13,6,9);q.line(12,13,10,9);q.rect(5,12,6,2)});
        s.part(col,q=>q.ell(8,7.5,4,4),{lt:.6});
        s.set(6,6,W);s.set(7,5.5,W);s.set(10,9,lt);
      }
    }else if(kind==="scarab"){
      if(d==="elytre"){
        s.part(col,q=>{q.poly([[11,2],[13,5],[10,12],[5,14],[3,11],[6,4]])},{lt:.6});
        s.part("#8cf5ff",q=>q.line(9,4,6,11),F);s.part("#ff9ae6",q=>q.line(11,5,8,12),F);s.set(10,3,W);
      }else if(d==="b_carapace"){
        s.part(col,q=>{q.ell(8,8.5,5.8,5);q.px(2,8);q.px(14,8);q.px(4,4);q.px(12,4);q.px(8,2)},{lt:.55});
        s.part("#fff09a",q=>{q.ell(8,8,2.2,2.2);q.line(8,4,8,12);q.line(4,8,12,8)},F);s.set(7,7,W);
      }else{
        s.part(col,q=>{q.ell(8,9,4.2,4.6);q.ell(8,4.5,2.6,2);q.line(6,3,5,1);q.line(10,3,11,1);q.line(3,7,5,7);q.line(11,7,13,7);q.line(3,11,5,10);q.line(11,10,13,11)},{lt:.6});
        s.part(dk,q=>{q.line(8,6,8,13);q.line(5,6,11,6)},F);s.set(6,8,W);s.set(10,8,"#fff2a6");
      }
    }else if(kind==="pincer"){
      s.part(col,q=>{q.ell(6,11,3.2,3);q.poly([[4,9],[3,5],[6,2],[10,3],[8,6],[7,9]]);q.poly([[8,11],[12,10],[14,6],[11,5],[10,8]])},{lt:.55});
      s.set(8,5,W);s.set(10,7,W);s.set(5,4,lt);s.set(6,10,"#ffe2f0");
    }else if(kind==="jaw"){
      s.part(col,q=>{q.poly([[2,5],[6,3],[13,4],[13,6],[6,6],[4,9],[6,11],[13,10],[13,12],[6,13],[2,11]])},{lt:.4});
      s.part("#eef4ff",q=>{q.px(6,6);q.px(8,6);q.px(10,6);q.px(12,6);q.px(6,10);q.px(9,10);q.px(11,10)},F);
      s.set(8,7,"#e088ff");s.set(10,9,"#e088ff");outCol="#2a0d40";
    }else if(kind==="beak"){
      s.part(col,q=>{q.poly([[3,6],[9,4],[14,8],[12,11],[7,10],[3,11]])},{lt:.55});
      s.part(dk,q=>{q.line(4,9,11,9);q.px(6,6)},F);s.set(7,5,W);s.set(10,6,lt);
    }else if(kind==="crest"){
      s.part(col,q=>{q.ell(4.5,8,2.2,3);q.ell(7,5.5,2.2,3.4);q.ell(10,6.5,2.2,3.2);q.ell(12.5,9,2,2.6);q.rect(4,9,9,4)},{lt:.5});
      s.set(7,3.5,lt);s.set(10,4.5,lt);s.set(4.5,6,W);
    }else if(kind==="ear"){
      s.part(col,q=>{q.poly([[4,14],[3,8],[6,2],[10,2],[13,9],[11,14]])},{lt:.45});
      s.part("#f4a6b4",q=>{q.poly([[6,12],[5,8],[8,4],[10,9],[9,12]])},{lt:.3});
      s.set(8,12,"#fff0dc");s.set(7,13,"#fff0dc");s.set(7,4,lt);
    }else if(kind==="snout"){
      s.part(col,q=>q.ell(8,8.5,5.5,4.2),{lt:.5});
      s.part(sh,q=>{q.rect(5,7,2,3);q.rect(9,7,2,3)},F);
      s.set(6,5.5,W);s.set(7,5.5,W);s.set(10,6,lt);
    }else if(kind==="whisker"){
      if(d==="x_phoquin"){
        s.part(col,q=>{q.ell(5.5,7.5,3,2.4);q.ell(10.5,7.5,3,2.4);q.poly([[3,8],[2,13],[5,12],[7,9]]);q.poly([[13,8],[14,13],[11,12],[9,9]])},{lt:.5});
        s.part(dk,q=>{q.line(4,9,3,12);q.line(6,9,5,11);q.line(12,9,13,12);q.line(10,9,11,11)},F);s.set(8,6,"#2a2434");
      }else{
        s.part(col,q=>{q.line(4,8,13,4);q.line(4,8,14,8);q.line(4,8,13,12)},F);
        s.part(lt,q=>{q.line(5,7,12,4);q.line(5,9,12,11)},F);
        s.part("#f29cb0",q=>q.ell(3.5,8,2,2),{lt:.4});s.set(3,7,W);
      }
    }else if(kind==="tongue"){
      s.part(col,q=>{q.line(3,12,7,8,2);q.line(7,8,11,5,2);q.ell(11,7,2.8,2.8);q.clear(10,6,2,2)},{lt:.5});
      s.set(6,7,W);s.set(11,5,W);s.set(9,11,"#9ef0ff");s.set(9,13,"#9ef0ff");
    }else if(kind==="antenna"){
      s.part(col,q=>{q.line(7,14,5,8);q.line(5,8,3,4);q.line(9,14,11,8);q.line(11,8,13,4)},F);
      s.part("#9ef5ff",q=>q.ell(3.5,3.5,2,2),{lt:.5});
      s.part("#ffa6f0",q=>q.ell(12.5,3.5,2,2),{lt:.5});
      s.set(3,3,W);s.set(12,3,W);
    }else if(kind==="sucker"){
      if(d==="x_grenouflon"){
        s.part(col,q=>q.ell(8,8.5,5.2,4.8),{lt:.55});
        s.set(6,6,W);s.set(7,6,W);s.set(6,7,W);
        s.part(lt,q=>{q.line(2,5,2,11);q.line(14,5,14,11)},F);
      }else{
        s.part(col,q=>{q.ell(8,8,5.2,4.4);q.rect(7,12,2,2)},{lt:.45});
        s.part(dk,q=>q.ell(8,8,3,2.4),F);s.part(lt,q=>q.ell(8,8,1.5,1.2),F);s.set(5,5.5,W);
      }
    }else if(kind==="tentacle"){
      if(d==="filament"){
        s.part(col,q=>{q.line(11,2,6,5,2);q.line(6,5,10,9,2);q.line(10,9,5,13,2)},{lt:.6});
        s.set(11,2,W);s.set(6,5,"#b8ffff");s.set(10,9,W);s.set(5,13,"#b8ffff");
      }else{
        s.part(col,q=>{q.line(5,14,4,6,2);q.line(8,14,8,4,2);q.line(11,14,12,7,2);q.rect(4,12,8,2)},{lt:.5});
        s.set(4,5,"#fff0a8");s.set(8,3,W);s.set(12,6,"#fff0a8");
      }
    }else if(kind==="horn"){
      if(d==="x_chevrock"){
        s.part(col,q=>{q.poly([[4,13],[3,8],[6,3],[11,2],[13,5],[10,7],[8,6],[7,10],[8,13]])},{lt:.45});
        s.part(dk,q=>{q.line(4,10,7,10);q.line(4,7,7,7);q.line(7,4,9,5)},F);s.set(10,3,lt);
      }else{
        s.part(col,q=>{q.poly([[3,12],[5,7],[9,3],[13,2],[12,6],[9,10],[6,13]])},{lt:.45});
        s.part("#5c7a38",q=>{q.px(4,11);q.px(5,12);q.px(6,10)},F);s.set(11,3,lt);s.set(12,2,W);
      }
    }else if(kind==="claw"){
      if(d==="griffe_glac"){
        s.part(col,q=>{q.poly([[4,3],[10,2],[13,5],[11,10],[7,14],[9,9],[6,6]])},{lt:.65});
        s.part(W,q=>{q.line(7,3,11,5);q.line(11,5,8,12)},F);s.set(4,11,"#b8f4ff");s.set(13,11,"#b8f4ff");
      }else{
        s.part(col,q=>{q.poly([[4,4],[9,3],[12,7],[10,11],[6,14],[8,9],[6,7]])},{lt:.4});
        s.part(dk,q=>{q.rect(4,3,5,2);q.px(10,8)},F);s.set(8,5,lt);
      }
    }else if(kind==="sting"){
      if(d==="x_scorpiaf"){
        s.part(col,q=>{q.ell(6.5,10,3.8,3.6);q.poly([[7,7],[10,3],[13,2],[11,6],[9,8]])},{lt:.55});
        s.set(5,9,W);s.set(13,2,"#d8ff66");
      }else if(d==="x_herissoc"){
        s.part(col,q=>{q.line(3,13,6,2,2);q.line(7,13,9,3,2);q.line(11,13,13,5,2)},{lt:.45});
        s.part("#f5ead0",q=>{q.px(5,5);q.px(6,5);q.px(8,6);q.px(9,6);q.px(12,7);q.px(4,9);q.px(8,10)},F);
      }else if(d==="piquant"){
        s.part(col,q=>{q.ell(8,10,3.2,2.8);q.line(8,9,8,2);q.line(8,9,3,4);q.line(8,9,13,4);q.line(8,10,2,9);q.line(8,10,14,9)},{lt:.45});
        s.set(8,2,lt);s.set(3,4,lt);s.set(13,4,lt);
      }else{
        s.part("#3d9448",q=>{q.ell(8,8.5,3.8,5.4)},{lt:.45});
        s.part("#ffe894",q=>{q.line(4,6,2,5);q.line(4,10,2,10);q.line(12,6,14,5);q.line(12,10,14,10);q.line(8,3,8,1)},F);
        s.set(7,6,"#78d67a");
      }
    }else if(kind==="fang"){
      if(d==="b_dent"){
        s.part(lt,q=>{q.poly([[3,3],[13,3],[11,9],[8,14],[5,9]])},{lt:.55});
        s.part(dk,q=>{q.rect(3,2,10,2);q.px(4,7);q.px(11,7);q.px(6,11);q.px(10,11)},F);
        s.set(7,5,W);s.set(7,7,W);
      }else if(d==="b_croc"){
        s.part(lt,q=>{q.poly([[4,3],[11,3],[12,8],[9,12],[6,14],[7,9],[4,7]])},{lt:.65});
        s.part("#f0c24b",q=>q.rect(4,2,8,2));s.set(6,5,W);s.set(9,6,"#a8f0ff");s.set(5,12,"#a8f0ff");
      }else if(d==="x_loupivre"){
        s.part("#dff6ff",q=>{q.poly([[4,3],[10,3],[11,7],[8,12],[6,14],[7,9],[5,6]])},{lt:.5});
        s.part(col,q=>{q.rect(4,2,7,2);q.px(9,9);q.px(10,10)},F);s.set(6,5,W);
      }else if(d==="x_murenard"){
        s.part("#e2f8ec",q=>{q.poly([[5,2],[9,2],[10,7],[8,13],[6,14],[7,8],[5,5]])},{lt:.4});
        s.part(col,q=>{q.px(8,12);q.px(9,13);q.rect(5,2,4,2)},F);s.set(7,5,W);
      }else{
        s.part("#f8f0e2",q=>{q.poly([[4,3],[10,3],[11,7],[9,11],[6,14],[7,9],[5,6]])},{lt:.4});
        s.part(col,q=>q.rect(4,2,7,2));s.set(6,5,W);
      }
    }else if(kind==="wing"){
      if(d==="x_libellune"){
        s.part(col,q=>{q.poly([[2,10],[5,6],[11,3],[14,4],[13,8],[7,11],[3,11]])},{lt:.65});
        s.part(W,q=>{q.line(3,10,13,5);q.line(7,8,9,5);q.line(9,7,11,7)},F);
      }else if(d==="x_chauvefer"){
        s.part(col,q=>{q.poly([[2,12],[3,4],[9,2],[14,5],[12,10],[10,8],[8,11],[6,9],[4,12]])},{lt:.3});
        s.part(lt,q=>{q.line(3,5,9,3);q.line(3,5,11,6);q.line(3,5,8,9)},F);
      }else if(d==="eclair"){
        s.part(col,q=>{q.poly([[2,11],[5,4],[12,2],[14,5],[10,8],[13,10],[7,12],[4,12]])},{lt:.55});
        s.part("#fff36e",q=>{q.line(6,5,11,4);q.line(11,4,8,8);q.line(8,8,12,9)},F);s.set(12,3,W);
      }else{
        s.part(col,q=>{q.ell(8,7,5.2,3.6);q.ell(6,10.5,3.4,2.6)},{lt:.65});
        s.part(W,q=>{q.line(4,8,11,6);q.line(5,10,9,10)},F);s.set(11,5,"#ffe8ff");
      }
    }else if(kind==="feather"){
      if(d==="b_plume"){
        s.part(col,q=>{q.poly([[11,1],[14,4],[12,9],[7,13],[4,11],[5,6]])},{lt:.55});
        s.part("#ffd85a",q=>q.ell(10,5,2.4,2.4),F);s.part("#3a2068",q=>q.ell(10,5,1.2,1.2),F);
        s.part("#fff3d0",q=>q.line(3,14,10,6),F);s.set(10,4,W);
      }else if(d==="x_hiboulet"){
        s.part(col,q=>{q.ell(8.5,7.5,4.2,5.6)},{lt:.45});
        s.part(dk,q=>{q.line(6,5,11,5);q.line(5,8,12,8);q.line(6,11,11,11)},F);
        s.part("#f4ebd4",q=>q.line(8,3,8,14),F);
      }else if(d==="x_pingouflet"){
        s.part("#263042",q=>{q.poly([[11,2],[13,4],[9,12],[5,12],[5,8]])},{lt:.35});
        s.part("#f2f6ff",q=>{q.poly([[9,5],[11,6],[8,11],[6,11]])},F);s.set(4,13,"#cfd8e8");
      }else if(d==="x_perroflor"){
        s.part("#38b85c",q=>q.poly([[12,1],[14,4],[11,8],[7,7],[8,3]]),{lt:.45});
        s.part("#f6c938",q=>q.poly([[11,7],[9,10],[5,10],[6,7]]),{lt:.45});
        s.part("#f04e58",q=>q.poly([[9,9],[7,12],[4,12],[5,9]]),{lt:.45});
        s.part("#fff4d8",q=>q.line(3,14,12,3),F);
      }else if(d==="plume_givree"){
        s.part(col,q=>{q.poly([[12,1],[14,4],[8,12],[4,12],[4,8]])},{lt:.65});
        s.part(W,q=>{q.line(3,14,12,3);q.px(7,4);q.px(11,8);q.px(5,7)},F);
      }else if(d==="plume_illus"){
        s.part(col,q=>{q.poly([[12,1],[14,4],[9,11],[5,11],[6,6]]);q.line(5,11,3,13);q.line(7,11,6,14)},{lt:.6});
        s.set(4,4,"#f5b8ff");s.set(13,9,"#b8f0ff");s.set(11,3,W);
      }else if(d==="mirage"){
        s.part(col,q=>{q.poly([[12,1],[14,4],[10,8],[11,10],[6,13],[4,10],[6,6]])},{lt:.6});
        s.part("#d28eff",q=>q.line(9,4,6,10),F);s.part("#fff2a6",q=>q.line(3,14,12,3),F);
      }else if(d==="x_albatrombe"){
        s.part(col,q=>{q.poly([[13,2],[14,5],[9,10],[4,13],[3,11],[7,6]])},{lt:.6});
        s.part(W,q=>{q.line(3,13,13,3);q.line(2,7,5,5);q.line(10,12,13,10)},F);
      }else{
        s.part(col,q=>q.poly([[12,1],[14,4],[8,12],[4,12],[4,8]]),{lt:.5});
        s.part("#f6ecd6",q=>q.line(3,14,12,3),F);s.set(10,4,W);
      }
    }else if(kind==="tail"){
      if(d==="x_salamandrin"){
        s.part(col,q=>{q.line(3,13,7,11,2);q.line(7,11,10,8,2);q.line(10,8,11,6)},{lt:.45});
        s.part("#ff6a24",q=>q.poly([[11,2],[14,5],[12,8],[9,6]]),{lt:.5});s.set(11,4,"#fff288");
      }else{
        s.part(col,q=>{q.ell(6,11,3.2,2.8);q.ell(8,7.5,4,3.4);q.ell(10.5,4.5,3.2,2.8)},{lt:.5});
        s.part("#fff4e4",q=>q.ell(11,4,2.2,2),F);s.set(11,3.5,W);
      }
    }else if(kind==="wool"){
      if(d==="pompon_doux"){
        s.part(col,q=>{q.ell(8,8,4.6,4.6);q.px(3,5);q.px(13,5);q.px(3,11);q.px(13,11);q.px(8,2);q.px(8,14)},{lt:.6});
        s.set(6,6,W);s.set(7,6,W);s.set(10,10,lt);
      }else if(d==="b_laine"){
        s.part(col,q=>{q.ell(5.5,8.5,3.4,3.4);q.ell(10.5,8.5,3.4,3.4);q.ell(8,5.5,3.6,3);q.ell(8,11,3.6,2.8)},{lt:.55});
        s.part("#f2c248",q=>{q.rect(7,4,2,9);q.rect(5,8,6,1)},F);s.set(8,8,W);
      }else{
        s.part(col,q=>{q.ell(5.5,9,3.2,3.2);q.ell(10.5,9,3.2,3.2);q.ell(8,5.5,3.4,3.2);q.ell(8,11,3.4,2.8)},{lt:.5});
        s.set(6,5,W);s.set(10,8,lt);
      }
    }else if(kind==="fur"){
      if(d==="x_tigrelin"){
        s.part(col,q=>{q.rect(3,3,10,10);q.px(2,3);q.px(13,3);q.px(2,12);q.px(13,12)},{lt:.45});
        s.part("#221818",q=>{q.line(3,5,8,6);q.line(7,8,12,8);q.line(4,11,10,10)},F);s.set(5,4,lt);
      }else if(d==="pelage_flamme"){
        s.part(col,q=>{q.poly([[3,13],[4,6],[7,2],[9,6],[11,3],[13,8],[12,13]])},{lt:.5});
        s.part("#ffe868",q=>{q.px(7,3);q.px(11,4);q.line(6,10,10,10)},F);
      }else if(d==="poilroux"){
        s.part(col,q=>{q.poly([[4,12],[3,6],[6,2],[8,6],[10,2],[13,6],[12,12]])},{lt:.5});
        s.part("#7a4a2a",q=>q.rect(5,10,6,2),F);s.set(6,4,lt);s.set(10,4,lt);
      }else if(d==="x_dromadou"){
        s.part(col,q=>{q.ell(6,9,3.4,3.4);q.ell(10,8,3.6,3.8);q.ell(8,5,2.8,2.4)},{lt:.45});
        s.part(dk,q=>{q.line(5,9,9,10);q.line(8,6,11,7)},F);s.set(7,4,lt);
      }else{
        s.part(col,q=>{q.poly([[3,3],[6,5],[10,5],[13,3],[11,8],[13,13],[10,11],[6,11],[3,13],[5,8]])},{lt:.45});
        s.part(lt,q=>q.ell(8,8,2.2,2.4),F);
      }
    }else if(kind==="bark"){
      s.part(col,q=>{q.poly([[4,2],[10,2],[12,7],[11,14],[5,14],[3,8]])},{lt:.35});
      s.part(dk,q=>{q.line(6,4,6,12);q.line(9,5,9,13)},F);
      s.part("#48c058",q=>{q.poly([[10,5],[14,3],[13,7],[10,7]])},{lt:.4});s.set(12,4,"#b8ff9a");
    }else if(kind==="vine"){
      if(d==="x_bambouin"){
        s.part(col,q=>{q.rect(6,2,4,12)},{lt:.5});
        s.part("#dff2b0",q=>{q.rect(5,5,6,1);q.rect(5,10,6,1)},F);
        s.part("#3a8e42",q=>{q.poly([[10,5],[14,3],[13,6]]);q.poly([[6,9],[2,7],[3,10]])},F);
      }else if(d==="x_roseline"){
        s.part("#4e9444",q=>{q.line(8,14,8,6);q.line(8,13,4,8);q.line(8,13,12,9)},F);
        s.part("#7c4a26",q=>q.rect(7,2,3,6),{lt:.35});s.set(8,3,"#b87c4a");
      }else if(d==="racine_eau"){
        s.part(col,q=>{q.line(8,2,8,7,2);q.line(8,7,4,12);q.line(8,7,8,13);q.line(8,7,12,12)},{lt:.4});
        s.set(5,13,"#78e4ff");s.set(11,13,"#78e4ff");s.set(8,4,lt);
      }else{
        s.part(col,q=>{q.ell(8,8,5,4.6);q.clear(5,5,6,6)},{lt:.45});
        s.part("#76df68",q=>{q.poly([[10,3],[14,2],[13,5]]);q.poly([[2,10],[5,11],[3,13]])},F);
      }
    }else if(kind==="petal"){
      if(d==="petalecarn"){
        s.part(col,q=>{q.poly([[8,2],[13,6],[11,13],[5,13],[3,6]])},{lt:.5});
        s.part("#fff2d6",q=>{q.px(3,6);q.px(4,9);q.px(13,6);q.px(12,9)},F);
        s.set(8,7,"#ffe066");s.set(7,9,"#ffe066");
      }else if(d==="fleur_lune"){
        s.part(col,q=>{q.ell(8,4,2.2,2.8);q.ell(4.5,7,2.6,2.2);q.ell(11.5,7,2.6,2.2);q.ell(5.5,11,2.4,2.4);q.ell(10.5,11,2.4,2.4)},{lt:.65});
        s.part("#e8f8ff",q=>q.ell(8,8,2,2),F);s.set(8,7,W);
      }else{
        s.part(col,q=>{q.poly([[8,2],[12,6],[12,10],[8,13],[4,10],[4,6]])},{lt:.55});
        s.part("#8ee6ff",q=>{q.line(4,14,12,14);q.px(7,6)},F);s.set(7,5,W);
      }
    }else if(kind==="scale"){
      if(d==="x_anacondor"){
        s.part(col,q=>{q.line(3,12,7,9,2);q.line(7,9,5,5,2);q.line(5,5,11,3,2);q.line(11,3,13,7,2)},{lt:.5});
        s.part(dk,q=>{q.px(5,10);q.px(6,6);q.px(10,4);q.px(12,6)},F);
      }else if(d==="neant"){
        s.part(col,q=>{q.poly([[8,1],[13,5],[12,11],[8,14],[4,11],[3,5]])},{lt:.4});
        s.part("#f066ff",q=>{q.line(8,3,8,11);q.line(6,7,10,7)},F);s.set(8,6,W);outCol="#2a0c46";
      }else if(d==="x_tortecaille"){
        s.part(col,q=>{q.poly([[5,3],[11,3],[14,8],[11,13],[5,13],[2,8]])},{lt:.45});
        s.part(dk,q=>{q.poly([[6,5],[10,5],[11,8],[10,11],[6,11],[5,8]])},F);
        s.part(lt,q=>q.rect(7,6,2,4),F);
      }else if(d==="x_hippocampin"){
        s.part(col,q=>{q.poly([[6,2],[11,4],[12,9],[9,14],[5,12],[4,7]])},{lt:.6});
        s.part("#b6fff4",q=>{q.line(6,5,10,6);q.line(6,8,10,9);q.line(6,11,9,12)},F);s.set(8,3,W);
      }else{
        s.part(col,q=>{q.poly([[4,3],[12,3],[13,9],[8,14],[3,9]])},{lt:.45});
        s.part("#c45420",q=>{q.rect(5,5,3,3);q.rect(9,8,2,3)},F);s.set(10,4,lt);
      }
    }else if(kind==="vial"){
      s.part("#8a5c34",q=>q.rect(6,1,4,2));
      if(d==="x_poulpinet"){
        s.part("#d8e4f0",q=>{q.rect(6,3,4,2);q.rect(4,5,8,9)},{lt:.5});
        s.part(col,q=>q.rect(5,7,6,6),{lt:.3});s.set(6,6,W);s.set(11,5,col);
      }else if(d==="x_dendrobulle"){
        s.part("#daf0f8",q=>{q.rect(7,3,2,3);q.poly([[7,6],[9,6],[13,13],[3,13]])},{lt:.55});
        s.part(col,q=>q.poly([[6,9],[10,9],[12,13],[4,13]]),{lt:.55});
        s.set(7,11,"#b8ffff");s.set(9,10,W);s.set(6,7,W);
      }else{
        s.part("#e2f0f8",q=>{q.rect(6,3,4,3);q.ell(8,10,4.5,4.2)},{lt:.6});
        s.part(col,q=>{q.ell(8,10.2,3.4,3);q.line(6,9,10,11)},{lt:.65});
        s.set(6,8,W);s.set(7,7,W);
      }
    }else if(kind==="bubble"){
      s.part(col,q=>q.ell(8,8.5,5,5),{lt:.65});
      s.part(lt,q=>{q.ell(7.5,8,3.6,3.6);q.clear(6,7,4,4)},F);
      s.set(5,6,W);s.set(6,5,W);s.set(5,7,W);
      s.part(lt,q=>q.ell(13,4,1.5,1.5),F);s.set(13,3.5,W);
    }else if(kind==="heart"){
      if(d==="b_braise"){
        s.part("#48201e",q=>{q.ell(5.5,6,3.2,3.2);q.ell(10.5,6,3.2,3.2);q.poly([[2.5,7],[13.5,7],[8,14]])},{lt:.3});
        s.part(col,q=>{q.line(8,5,7,9);q.line(7,9,9,12);q.line(5,7,11,7)},F);s.set(8,8,"#fff388");s.set(7,6,W);outCol="#6a1608";
      }else if(d==="givre"){
        s.part(col,q=>{q.poly([[5,3],[8,6],[11,3],[14,6],[8,14],[2,6]])},{lt:.65});
        s.part(W,q=>{q.line(5,5,8,11);q.px(10,5)},F);
      }else if(d==="coeur_polaire"){
        s.part(col,q=>{q.ell(5.5,6,3,3);q.ell(10.5,6,3,3);q.poly([[2.8,7],[13.2,7],[8,14]])},{lt:.6});
        s.part("#a6ffea",q=>q.line(5,7,11,5),F);s.part("#d296ff",q=>q.line(6,10,10,8),F);s.set(5,5,W);
      }else{
        s.part(col,q=>{q.ell(5.5,6,3,3);q.ell(10.5,6,3,3);q.poly([[2.8,7],[13.2,7],[8,13.5]])},{lt:.55});
        s.part(W,q=>{q.ell(4,10.5,2,1.6);q.ell(12,10.5,2,1.6);q.px(5,5)},F);
      }
    }else if(kind==="eye"){
      if(d==="reflet_capt"){
        s.part("#b8c4d8",q=>{q.ell(8,7,5,5.2);q.rect(7,12,2,3)},{lt:.55});
        s.part(col,q=>q.ell(8,7,3.5,3.7),{lt:.6});
        s.part(W,q=>{q.line(6,5,10,9);q.px(6,7)},F);
      }else{
        s.part("#d8e8f8",q=>{q.poly([[2,8],[5,4],[11,4],[14,8],[11,12],[5,12]])},{lt:.55});
        s.part(col,q=>q.ell(8,8,3,3),{lt:.55});
        s.part("#18142a",q=>q.ell(8,8,1.3,1.8),F);s.set(7,7,W);s.set(3,5,lt);s.set(13,11,lt);
      }
    }else if(kind==="rune"){
      if(d==="x_sphinxou"){
        s.part("#d8b878",q=>{q.rect(3,2,10,12)},{lt:.4});
        s.part(col,q=>{q.ell(8,5.5,1.8,1.8);q.clear(7,5,2,1);q.line(8,7,8,12);q.line(6,9,10,9)},F);
        s.set(5,3,"#fff2b8");
      }else{
        s.part("#3a3444",q=>{q.poly([[4,2],[11,2],[13,5],[12,13],[4,14],[3,6]])},{lt:.35});
        s.part(col,q=>{q.line(8,4,8,12);q.line(8,4,11,7);q.line(8,7,5,9);q.line(8,9,11,11)},F);
        s.set(8,6,"#fff090");s.set(8,4,W);
      }
    }else if(kind==="scroll"){
      s.part("#f0dfb4",q=>{q.poly([[3,2],[11,2],[13,4],[13,14],[3,14]])},{lt:.4});
      s.part("#c4a874",q=>{q.poly([[11,2],[13,4],[11,4]]);q.line(5,5,9,5);q.line(5,7,11,7);q.line(5,9,10,9)},F);
      s.part(col,q=>q.ell(10,11.5,1.8,1.8),{lt:.4});s.set(9.5,11,W);
    }else if(kind==="lightning"){
      if(d==="x_etincelot"){
        s.part(col,q=>{q.poly([[8,1],[9,6],[14,8],[9,10],[8,15],[7,10],[2,8],[7,6]])},{lt:.65});
        s.part(W,q=>q.ell(8,8,1.8,1.8),F);s.set(4,4,"#fff488");s.set(12,12,"#fff488");
      }else{
        s.part("#4c566e",q=>{q.ell(6,4.5,3,2.2);q.ell(10,4.5,3,2.2);q.rect(4,4,8,2)});
        s.part(col,q=>{q.poly([[9,5],[5,9],[8,9],[6,14],[12,8],[9,8]])},{lt:.65});s.set(8,7,W);
      }
    }else if(kind==="flame"){
      if(d==="x_lanternix"){
        s.part("#7a6042",q=>{q.line(5,14,7,10,2);q.line(7,10,8,8)});
        s.part(col,q=>{q.poly([[8,2],[11,6],[10,10],[6,10],[5,6]])},{lt:.6});
        s.part("#fff4a0",q=>q.poly([[8,4],[9,7],[8,9],[7,7]]),F);s.set(8,6,W);
      }else if(d==="x_feuxfollet"){
        s.part(col,q=>{q.poly([[8,1],[11,6],[12,10],[8,13],[4,10],[5,6]])},{lt:.65});
        s.part("#d8ffff",q=>q.ell(8,9,2.2,2.4),F);s.set(8,8,W);s.set(4,4,lt);s.set(12,5,lt);
      }else{
        s.part("#3a2a28",q=>{q.poly([[3,13],[5,9],[11,9],[13,13]])});
        s.part(col,q=>{q.poly([[5,10],[6,5],[8,8],[10,3],[12,10]])},{lt:.55});
        s.part("#fff288",q=>{q.rect(6,10,4,2);q.px(10,6)},F);
      }
    }else if(kind==="swirl"){
      if(d==="nuee"){
        s.part(col,q=>{q.line(8,2,8,14);q.line(2,8,14,8);q.line(4,4,12,12);q.line(12,4,4,12)},F);
        s.part(W,q=>{q.px(8,8);q.px(8,3);q.px(8,13);q.px(3,8);q.px(13,8)},F);
      }else if(d==="x_tourbillard"){
        s.part(col,q=>{q.rect(3,3,10,2);q.rect(4,6,8,2);q.rect(5,9,6,2);q.rect(7,12,3,2)},{lt:.5});
        s.set(2,5,lt);s.set(13,8,lt);s.set(5,3,W);
      }else if(d==="voile"){
        s.part(col,q=>{q.poly([[4,2],[12,3],[13,12],[10,10],[8,14],[6,11],[3,13]])},{lt:.6});
        s.part(W,q=>{q.line(6,4,6,10);q.line(10,5,10,9)},F);
      }else if(d==="x_spectrombre"){
        s.part(col,q=>{q.ell(8,8,5.4,5.4);q.clear(4,4,8,8);q.ell(8,8,3,3);q.clear(6,6,4,4)},{lt:.5});
        s.part("#f2b6ff",q=>q.ell(8,8,1.5,1.5),F);outCol="#220c38";
      }else if(d==="x_fumerol"){
        s.part(col,q=>{q.ell(6,12,2.6,2);q.ell(9,9,3.2,2.6);q.ell(7,5.5,3.4,2.8);q.ell(10,3.5,2.4,2)},{lt:.45});
        s.set(6,4.5,lt);s.set(9,8,lt);
      }else if(d==="x_vapeurin"){
        s.part(col,q=>{q.line(5,13,4,9,2);q.line(4,9,6,5,2);q.line(11,13,12,9,2);q.line(12,9,10,4,2)},{lt:.55});
        s.set(8,7,"#f4ff88");s.set(8,3,"#f4ff88");s.set(5,6,W);
      }else if(d==="souffle"){
        s.part(col,q=>{q.line(2,8,11,8,2);q.line(11,8,13,5);q.line(13,5,10,4);q.line(4,11,12,11);q.line(12,11,13,13)},{lt:.65});
        s.set(6,5,W);s.set(10,5,W);s.set(3,6,"#d6f8ff");
      }else{
        s.part(col,q=>{q.ell(6,9.5,3.8,2.6);q.ell(10,6.5,3.8,2.6);q.line(4,7,11,9)},{lt:.6});
        s.set(4,4,"#6ce068");s.set(12,11,"#6ce068");s.set(9,6,W);
      }
    }else if(kind==="drop"){
      if(d==="x_bourdonnet"){
        s.part("#e0a020",q=>{q.poly([[4,2],[8,2],[10,4],[8,6],[4,6],[2,4]])},{lt:.4});
        s.part(col,q=>{q.poly([[9,6],[12,10],[6,10]]);q.ell(9,11,3.2,3)},{lt:.55});s.set(7.5,10,W);
      }else if(d==="vase"){
        s.part(col,q=>{q.ell(8,10,5.4,3.6);q.ell(6.5,7.5,3.2,2.4);q.ell(10,8,2.8,2.2)},{lt:.35});
        s.part("#5c8c42",q=>{q.line(9,6,11,3);q.line(7,6,6,4)},F);s.set(6,8,lt);
      }else if(d==="bave"){
        s.part(col,q=>{q.ell(8,9.5,4.8,3.8);q.rect(5,5,2,4);q.rect(10,4,2,5);q.ell(6,4,1.2,1.2)},{lt:.55});
        s.set(6,9,W);s.set(7,9,W);s.set(11,5,W);
      }else if(d==="magma"){
        s.part("#6a1e12",q=>{q.poly([[8,2],[12,8],[4,8]]);q.ell(8,10,4.4,3.8)});
        s.part(col,q=>{q.poly([[8,4],[11,9],[5,9]]);q.ell(8,10.2,3.4,2.8)},{lt:.55});
        s.set(8,9,"#fff698");s.set(7,10,W);outCol="#5a1208";
      }else if(d==="ombre"){
        s.part(col,q=>{q.poly([[8,2],[11,8],[5,8]]);q.ell(8,10,4,3.6);q.line(3,6,5,8);q.line(13,6,11,8)},{lt:.35});
        s.set(7,9,"#d28aff");s.set(4,4,"#9858d8");outCol="#1c0830";
      }else if(d==="larme"){
        s.part(col,q=>{q.poly([[8,1],[12,8],[8,14],[4,8]])},{lt:.55});
        s.set(6,7,W);s.set(6,8,W);s.set(8,4,lt);
      }else if(d==="b_seve"){
        s.part("#4ca848",q=>{q.line(4,5,6,7);q.line(12,5,10,7);q.px(3,4);q.px(13,4)},F);
        s.part(col,q=>{q.poly([[8,2],[11,8],[5,8]]);q.ell(8,10,4.2,3.8)},{lt:.6});
        s.set(6,9,W);s.set(8,11,"#fff5a8");
      }else{
        s.part(col,q=>{q.poly([[8,2],[11,8],[5,8]]);q.ell(8,10,4,3.6)},{lt:.55});
        s.set(6,9,W);s.set(6,10,W);s.set(9,11,"#ffe29a");
      }
    }else if(kind==="dust"){
      if(d==="lueur"){
        s.part(col,q=>q.ell(8,8,4.2,4.2),{lt:.65});
        s.part(W,q=>q.ell(8,8,2,2),F);s.set(3,4,lt);s.set(13,5,lt);s.set(4,12,lt);s.set(12,13,lt);
      }else if(d==="x_astrolin"){
        s.part(col,q=>{q.line(2,12,7,8,2);q.line(7,8,13,4,2)},{lt:.6});
        s.part(W,q=>{q.px(11,4);q.px(11,3);q.px(11,5);q.px(10,4);q.px(12,4);q.px(5,11);q.px(6,6)},F);
      }else if(d==="x_aurorin"){
        s.part("#50f0c8",q=>{q.line(3,12,6,6,2);q.line(6,6,9,10,2)},{lt:.5});
        s.part("#a878ff",q=>{q.line(7,10,10,4,2);q.line(10,4,13,8,2)},{lt:.5});
        s.set(6,5,W);s.set(10,4,W);
      }else if(d==="x_abyssal"){
        s.part("#18325e",q=>q.ell(8,8,4.8,4.8));
        s.part(col,q=>q.ell(8,8,2.8,2.8),{lt:.65});
        s.set(8,8,W);s.set(3,3,"#78f0ff");s.set(13,12,"#78f0ff");outCol="#0c1836";
      }else if(d==="spore"){
        s.part(col,q=>{q.ell(5,6,2.2,2.2);q.ell(11,5,2,2);q.ell(8,10.5,2.4,2.4)},{lt:.65});
        s.set(5,5.5,W);s.set(11,4.5,W);s.set(8,10,W);s.set(3,11,lt);s.set(13,10,lt);
      }else if(d==="cendre"){
        s.part(col,q=>q.poly([[2,13],[5,8],[8,6],[11,8],[14,13]]),{lt:.4});
        s.set(8,10,"#ff6622");s.set(9,10,"#ffcf55");s.set(5,5,lt);s.set(11,5,lt);
      }else if(d==="poudre_crist"){
        s.part(col,q=>q.poly([[2,13],[6,7],[10,7],[14,13]]),{lt:.65});
        s.set(7,9,W);s.set(10,11,W);s.set(5,4,"#d8ffff");s.set(11,4,W);s.set(8,3,lt);
      }else if(d==="grain_chant"){
        s.part(col,q=>{q.ell(6,11,2.2,2.2);q.ell(10,11,2.2,2.2);q.ell(8,8.5,2,2)},{lt:.6});
        s.part("#fff2a0",q=>{q.line(6,4,10,3);q.line(6,4,6,7);q.line(10,3,10,6)},F);
      }else{
        s.part(col,q=>q.poly([[2,13],[5,9],[8,7],[11,9],[14,13]]),{lt:.5});
        s.set(5,11,lt);s.set(8,10,W);s.set(11,11,dk);s.set(6,5,lt);s.set(10,5,lt);
      }
    }else if(kind==="fossil"){
      s.part("#8e867a",q=>{q.poly([[3,4],[7,2],[13,4],[14,10],[10,14],[4,13],[2,9]])},{lt:.35});
      s.part(col,q=>{q.ell(8,8,3.6,3.6);q.clear(6,6,4,4);q.rect(7,7,2,2)},F);
      s.set(5,12,"#68d468");s.set(11,11,"#68d468");
    }else if(kind==="statue"){
      s.part(col,q=>{q.poly([[4,14],[5,6],[4,3],[11,2],[12,6],[10,9],[12,14]])},{lt:.5});
      s.part(dk,q=>{q.line(6,5,9,5);q.line(7,8,10,9);q.rect(5,12,6,1)},F);s.set(6,3,W);
    }else if(kind==="icicle"){
      if(d==="x_glaconnet"){
        s.part(col,q=>q.rect(3,3,10,10),{lt:.65});
        s.part(W,q=>{q.line(4,4,9,4);q.line(4,4,4,9);q.line(6,10,10,6)},F);
      }else{
        s.part(col,q=>{q.poly([[3,2],[7,2],[5,11]]);q.poly([[6,2],[11,2],[8,14]]);q.poly([[10,2],[13,2],[11,9]])},{lt:.65});
        s.set(8,4,W);s.set(8,7,W);s.set(5,4,W);
      }
    }else if(kind==="geode"){
      if(d==="geode_parf"){
        s.part("#6a6470",q=>q.ell(8,8,5.6,5.2));
        s.part("#d6dce8",q=>q.ell(8,8,4.2,3.8),F);
        s.part(col,q=>q.ell(8,8,2.8,2.6),{lt:.6});
        s.set(7,7,W);s.set(9,9,lt);
      }else{
        s.part("#6a6470",q=>{q.poly([[2,11],[4,4],[10,3],[13,10],[8,14]])});
        s.part(col,q=>{q.poly([[5,5],[10,4],[12,9],[8,11]])},{lt:.6});
        s.set(8,6,W);s.set(10,7,lt);
      }
    }else if(kind==="rock"){
      if(d==="x_charbonnet"){
        s.part("#2b2832",q=>{q.poly([[3,9],[5,4],[10,3],[13,7],[12,12],[6,13]])},{lt:.35});
        s.part("#5a566a",q=>{q.line(5,5,9,5);q.line(5,5,4,8)},F);s.set(6,5,"#8a869c");
      }else if(d==="galet"){
        s.part(col,q=>q.ell(8,8.5,5.4,4.2),{lt:.45});
        s.part("#8cf4ff",q=>{q.line(5,6,8,8);q.line(8,8,7,10);q.line(7,10,11,11)},F);s.set(8,8,W);
      }else if(d==="scorie"){
        s.part("#443436",q=>{q.poly([[3,10],[4,5],[9,3],[13,6],[12,12],[6,13]])},{lt:.3});
        s.part("#ff6a22",q=>{q.px(6,7);q.px(9,6);q.px(10,9);q.px(7,10)},F);s.set(9,6,"#ffe870");
      }else if(d==="pepite_brute"){
        s.part(col,q=>{q.poly([[3,11],[4,6],[7,4],[11,5],[13,9],[10,12],[5,13]])},{lt:.6});
        s.set(6,6,W);s.set(7,6,W);s.set(10,7,"#fff6b0");
      }else{
        s.part(col,q=>q.ell(8,8,4.8,5.2),{lt:.65});
        s.part(W,q=>{q.line(6,5,6,9);q.px(7,4);q.px(7,10)},F);s.set(10,9,"#c8dcff");
      }
    }else if(kind==="star"){
      if(d==="x_lunaril"){
        s.part(col,q=>{q.ell(8,8,5.2,5.2);q.clear(7,3,7,9)},{lt:.65});
        s.set(5,5,W);s.set(11,5,"#e8f6ff");s.set(12,9,"#e8f6ff");
      }else{
        s.part(col,q=>{q.poly([[8,1],[9,6],[14,8],[9,10],[8,15],[7,10],[2,8],[7,6]]);q.line(4,4,12,12);q.line(12,4,4,12)},{lt:.65});
        s.part(W,q=>q.ell(8,8,1.8,1.8),F);
      }
    }else if(kind==="void"){
      outCol="#22083a";
      if(d==="x_obsidien"){
        s.part("#261c36",q=>{q.poly([[8,1],[12,6],[11,13],[6,14],[4,8]])},{lt:.4});
        s.part("#b474ff",q=>{q.line(8,2,10,11);q.px(6,6)},F);s.set(8,3,W);
      }else if(d==="x_cauchemire"){
        s.part("#34144a",q=>{q.poly([[8,2],[11,5],[14,4],[11,9],[13,13],[8,11],[4,14],[5,9],[2,6],[6,6]])},{lt:.4});
        s.part("#ff4c88",q=>q.ell(8,8,2,2),F);s.set(8,7,W);
      }else{
        s.part("#30104e",q=>{q.poly([[8,1],[13,5],[11,13],[5,14],[3,6]])},{lt:.45});
        s.part("#e066ff",q=>{q.poly([[8,4],[10,8],[8,11],[6,8]])},F);s.set(8,7,W);s.set(2,3,"#b866ff");s.set(13,11,"#b866ff");
      }
    }else{
      s.part(col,q=>{q.poly([[7,1],[10,5],[9,13],[5,13],[4,6]]);q.poly([[11,4],[14,7],[12,13],[9,13]])},{lt:.65});
      s.part(W,q=>{q.line(7,3,6,9);q.px(11,6);q.rect(4,12,9,1)},F);
    }
    if(rare){["#ffffff","#fff2a8"].forEach((c,i)=>{const x=i?13:2,y=i?12:2;s.set(x,y,c);s.set(x-1,y,c);s.set(x+1,y,c);s.set(x,y-1,c);s.set(x,y+1,c)})}
    s.outline(outCol);return cache[k]=s.fit(16).url()}
  /* clé de boss : anneau doré couronné serti d'une gemme à la couleur du boss, tige et panneton en fer sombre */
  function bkey(col){const k="bkey"+col;if(cache[k])return cache[k];const s=new Spr(22,22,3,3),G="#f2c14e",IR="#5c6078";
    s.part(IR,q=>{q.line(7,8,12,13,2);q.rect(11,10,3,1);q.rect(12,11,1,1);q.rect(9,12,1,2);q.rect(8,13,2,1)});
    s.part(G,q=>{q.ell(5,6,3.8,3.8);q.clear(4,5,3,3);q.px(2,1);q.px(5,0);q.px(8,1);q.rect(2,2,7,1)},{lt:.35});
    s.part(col,q=>q.ell(5,6,1.5,1.5),{lt:.5});s.outline();return cache[k]=s.fit(16).url()}
  function key(){if(cache.key)return cache.key;const s=new Spr(22,22,3,3),G="#f7c948";s.part(G,q=>{q.ell(5,5,3.4,3.4);q.clear(4,4,2,2);q.line(7,7,12,12,2);q.rect(11,10,3,1);q.rect(9,12,1,2)});s.outline();return cache.key=s.fit(16).url()}
  function potion(col){const k="po:"+col;if(cache[k])return cache[k];const s=new Spr(22,22,3,3);s.part("#dfeef5",q=>{q.rect(7,3,3,4);q.ell(8.5,10,4.6,4.4)},{lt:.6});s.part(col,q=>{q.ell(8.5,10.5,3.6,3.4);q.clear(0,0,16,9)});s.part(col,q=>q.rect(5,9,7,1),{flat:1});s.part("#8a5a34",q=>q.rect(6,1,5,2));s.set(6,8,"#ffffff");s.set(6,9,"#ffffff");s.outline();return cache[k]=s.fit(16).url()}
  function pet(col){const k="pe:"+col;if(cache[k])return cache[k];const s=new Spr(16,16);s.part(col,q=>{q.poly([[3,7],[4,2],[7,5]]);q.poly([[13,7],[12,2],[9,5]])});s.part(col,q=>{q.ell(8,9,5.4,4.6);q.rect(4,11,9,3)},{lt:.5});s.set(6,8,"#1c1020");s.set(10,8,"#1c1020");s.set(6,9,"#1c1020");s.set(10,9,"#1c1020");s.set(8,11,"#1c1020");s.set(4,11,"#ff8a9a");s.set(12,11,"#ff8a9a");s.outline();SPR[k]=s;return cache[k]=s.url()}

  /* ---------- Familiers et montures (dessin 24×24 dans un cadre 28×28, tournés vers la droite) : apparence décrite dans ITEMS[id].look ---------- */
  function fam(id,look){const k="fa:"+id;if(cache[k])return cache[k];const L=look||(ITEMS[id]&&ITEMS[id].look)||{t:"quad",c:"#f08aa8"},s=new Spr(28,28,2,2),c=L.c,c2=L.c2||mix(c,"#ffffff",.5),ink=mix(c,INK,.78),B="#1c1020",dk=mix(c,DARK,.3);
    const eye=(x,y)=>{s.set(x,y,B);s.set(x,y-1,B)};
    if(!L.vol)s.shadow(14,24,8,1.4);
    if(L.t==="quad"){const low=L.x==="bas",by=low?16:15,m=L.m;
      /* queue */
      if(L.q==="touffe")s.part(c,q=>{q.ell(4,by-3,3,2.6);q.ell(3,by-6,2,2)},{lt:.5});
      if(L.q==="fine")s.part(dk,q=>{q.line(5,by,2,by-4,2);q.line(2,by-4,3,by-8)},{flat:1});
      if(L.q==="flamme"){s.part("#ff7a2c",q=>q.poly([[6,by],[1,by-6],[3,by-2],[0,by-9],[5,by-3]]));s.part("#ffd84a",q=>q.poly([[5,by-1],[2,by-5],[4,by-3]]),{flat:1})}
      /* ailes repliées (arrière) */
      if(L.x==="ailes")s.part(mix(c2,DARK,.15),q=>q.poly([[9,by-1],[4,by-9],[7,by-10],[14,by-3]]));
      /* pattes */
      const lh=low?2:4;s.part(dk,q=>{[6,9,14,17].forEach(x=>q.rect(x,by+3,2,lh))});
      /* corps */
      s.part(c,q=>{q.ell(11.5,by,m?8:7,low?3:4.5)});
      if(L.x==="laine")s.part(c,q=>{for(let i=0;i<5;i++)q.ell(6+i*2.6,by-3+(i%2),2.4,2.2)},{lt:.6});
      if(L.x==="taches")[[8,by-1],[12,by+1],[15,by-2],[10,by+2]].forEach(([x,y])=>s.set(x,y,c2));
      if(L.x==="carapace"){s.part(c2,q=>q.ell(11,by-2,7,4.5));s.part(mix(c2,DARK,.35),q=>{q.line(8,by-5,8,by);q.line(13,by-6,13,by);q.line(5,by-2,17,by-2)},{flat:1})}
      /* tête */
      const hx=low?19:18,hy=low?by-2:by-5;s.part(c,q=>{q.ell(hx,hy,4,3.4);q.rect(hx+2,hy,3,2)});
      s.part(c2,q=>q.ell(hx+3,hy+2,1.6,1),{flat:1});
      /* oreilles / cornes */
      if(L.o==="longue")s.part(c,q=>{q.rect(hx-2,hy-9,2,7);q.rect(hx+1,hy-10,2,8)});
      if(L.o==="pointe")s.part(c,q=>{q.poly([[hx-3,hy-2],[hx-2,hy-7],[hx,hy-3]]);q.poly([[hx,hy-3],[hx+2,hy-8],[hx+3,hy-2]])});
      if(L.o==="rond")s.part(c,q=>{q.ell(hx-2,hy-3,1.6,1.6);q.ell(hx+2,hy-4,1.6,1.6)});
      if(L.o==="cornes")s.part(c2,q=>{q.ell(hx-2,hy-3,2.4,2.2);q.line(hx-4,hy-1,hx-5,hy+1,2)});
      if(L.o==="longue"||L.o==="pointe")s.part(c2,q=>{q.line(hx+2,hy-6,hx+2,hy-3)},{flat:1});
      if(L.x==="griffes")s.part("#f4ead8",q=>{q.px(hx+5,hy+3);q.px(20,by+6);q.px(17,by+6)},{flat:1});
      if(L.x==="ailes")s.part(c2,q=>q.poly([[10,by-2],[6,by-11],[9,by-12],[11,by-8],[15,by-4]]));
      s.outline(ink);eye(hx+1,hy);s.set(hx+5,hy+1,B)}
    else if(L.t==="crapaud"){s.part(c,q=>{q.ell(12,15,9,5.5);q.ell(8,10,3,2.6);q.ell(16,10,3,2.6)});s.part(c2,q=>q.ell(13,17,6,2.5),{flat:1});
      s.part(dk,q=>{q.rect(3,18,4,3);q.rect(17,18,4,3)});s.outline(ink);eye(9,10);eye(17,10);s.part(ink,q=>q.line(9,14,17,14),{flat:1})}
    else if(L.t==="scarabee"){s.part(dk,q=>{[5,10,15].forEach(x=>{q.line(x,17,x-2,21);q.line(x+3,17,x+5,21)})},{flat:1});
      s.part(c,q=>q.ell(11,13,9,6));s.part(mix(c,DARK,.45),q=>q.line(11,7,11,18),{flat:1});s.part(c2,q=>q.ell(20,14,3,2.6));
      s.part(mix(c,"#ffffff",.5),q=>{q.px(7,10);q.px(14,10);q.px(8,11)},{flat:1});s.part(ink,q=>{q.line(21,11,23,8)},{flat:1});s.outline(ink);eye(21,13)}
    else if(L.t==="insecte"){s.part(mix(c2,"#ffffff",.6),q=>{q.ell(9,8,4,3);q.ell(13,7,3.4,2.6)},{lt:.7});s.part(c,q=>{q.ell(11,13,4.5,3.2);q.ell(16,12,2.8,2.6)});
      s.part(c2,q=>q.ell(6,14,3.2,3),{lt:.7});s.outline(ink);s.part(ink,q=>{q.line(17,10,19,6);q.line(18,10,21,8)},{flat:1});eye(17,12)}
    else if(L.t==="oiseau"){s.part(dk,q=>q.poly([[6,14],[1,18],[3,19],[8,16]]));s.part(c,q=>{q.ell(11,13,5.5,5);q.ell(15,8,4,3.6)});
      s.part(c2,q=>q.ell(12,15,3,3),{lt:.6});s.part(c2,q=>q.poly([[18,8],[21,9],[18,10]]),{flat:1});
      s.part(mix(c,DARK,.2),q=>q.poly([[8,10],[4,16],[11,17],[13,12]]));s.part("#f0a33c",q=>{q.rect(10,18,1,3);q.rect(13,18,1,3)},{flat:1});
      s.outline(ink);s.part("#fff6c8",q=>{q.ell(14,7,1.6,1.4);q.ell(17,7,1.6,1.4)},{flat:1});s.set(14,7,B);s.set(17,7,B)}
    else if(L.t==="hippocampe"){s.part(c,q=>{q.ell(13,6,3,2.6);q.rect(15,6,4,2);q.ell(12,12,3.4,4.6);q.ell(10,18,2.6,2.4)});s.part(dk,q=>q.ell(11,18,1,1),{flat:1});
      s.part(c2,q=>{q.poly([[9,8],[6,10],[9,13]])},{lt:.6});s.part(c2,q=>q.ell(13,13,1.6,3),{flat:1});s.outline(ink);eye(13,6)}
    else if(L.t==="raie"){s.part(c,q=>q.poly([[2,12],[12,5],[22,12],[12,17]]));s.part(c2,q=>q.ell(12,12,3,2.2),{lt:.6});s.part(dk,q=>q.line(2,12,0,18),{flat:1});
      s.outline(ink);eye(15,10);eye(9,10)}
    else if(L.t==="follet"){s.part(c,q=>q.poly([[12,2],[17,9],[18,14],[15,19],[9,19],[6,14],[7,9],[10,10]]),{lt:.6});s.part(c2,q=>q.ell(12,14,3.4,3.6),{flat:1});
      s.outline(mix(c,INK,.5));eye(11,13);eye(14,13)}
    else if(L.t==="golem"){s.part(dk,q=>{q.rect(5,17,4,4);q.rect(15,17,4,4)});s.part(c,q=>{q.rect(4,7,16,11);q.rect(13,2,7,6)});s.part(mix(c,DARK,.4),q=>{q.rect(2,9,3,7);q.rect(19,9,3,7)});
      s.part(c2,q=>{q.line(8,10,11,13);q.line(11,13,8,15);q.px(14,11)},{flat:1});s.outline(ink);s.set(17,4,c2);s.set(18,4,c2)}
    return cache[k]=s.url(),SPR[k]=s,cache[k]}
  function famFrames(id,anim,look){const k="fa:"+id;if(!SPR[k])fam(id,look);return framesOf(k,SPR[k],anim,true)}

  /* Plantes du mini-jeu de mémoire : 6 formes ET 6 couleurs bien différentes pour ne pas les confondre */
  function plant(i){const k="pl:"+i;if(cache[k])return cache[k];const s=new Spr(22,22,3,3),G="#3f8a3a",L="#5fb04a";
    const stem=()=>{s.part(G,q=>q.line(8,15,8,8),{flat:1});s.part(L,q=>{q.ell(5,12,2.6,1.4);q.ell(11,11,2.6,1.4)})};
    if(i===0){stem();s.part("#e8323c",q=>{[[8,3],[5,5],[11,5],[6,8],[10,8]].forEach(([x,y])=>q.ell(x,y,2.2,2.2))});s.part("#ffe04a",q=>q.ell(8,6,1.4,1.4),{flat:1})}          /* coquelicot rouge, 5 pétales */
    if(i===1){stem();s.part("#2f6ae0",q=>q.poly([[4,2],[8,6],[12,2],[12,8],[8,10],[4,8]]))}                                                                                   /* tulipe bleue */
    if(i===2){stem();s.part("#ffd21e",q=>{for(let a=0;a<8;a++){const r=a*Math.PI/4;q.ell(8+Math.cos(r)*4,6+Math.sin(r)*4,1.4,1.4)}});s.part("#8a4a1a",q=>q.ell(8,6,2,2),{flat:1})} /* tournesol jaune */
    if(i===3){stem();s.part("#a040e0",q=>{for(let y=1;y<9;y+=2)q.ell(8,y+1,2.4-y*.15,1.2)})}                                                                                    /* lavande violette en épi */
    if(i===4){s.part("#f4f4f4",q=>{q.ell(8,6,6,3.6);q.rect(6,6,4,8)});s.part("#e04848",q=>{q.px(5,5);q.px(10,4);q.px(8,7);q.px(11,7)},{flat:1})}                          /* champignon blanc à points rouges */
    if(i===5){s.part("#2a9a3a",q=>{q.poly([[8,1],[13,6],[11,12],[8,15],[5,12],[3,6]])});s.part("#a8f08a",q=>q.line(8,3,8,14),{flat:1})}                                    /* feuille vert vif */
    s.outline();return cache[k]=s.fit(16).url()}
  /* Poisson vu de côté (16×16) : 12 silhouettes distinctes (une par palier/zone).
     rk : 0 commun, 1 rare (rayures, éclat), 2 légendaire (contour doré, couronne), 3 mythique (arc-en-ciel). */
  function fish(col,rk=0,t=0){const k="fi:"+col+rk+t;if(cache[k])return cache[k];
    const s=new Spr(22,22,3,3),idx=((t|0)%12+12)%12,dk=mix(col,DARK,.38),lt=mix(col,"#ffffff",.55),big=rk===2,F={flat:1};
    let ex=12,ey=7;
    if(idx===0){
      /* 0 Goujon : petit poisson rond de rivière */
      s.part(dk,q=>q.poly([[1,5],[4,8],[1,11],[2,8]]));
      s.part(col,q=>q.ell(8.5,8,big?5.6:5,big?3.6:3));
      s.part(dk,q=>{q.poly([[7,5],[9,3],[10,5]]);q.px(8,11)});
      s.part(lt,q=>q.ell(9,9.5,2.8,1),F);
    }else if(idx===1){
      /* 1 Ablette : silhouette très fine et élancée */
      s.part(dk,q=>q.poly([[1,5],[4,8],[1,11]]));
      s.part(col,q=>q.ell(9,8,6,2.2));
      s.part(dk,q=>q.poly([[7,6],[9,4],[11,6]]));
      s.part(lt,q=>q.line(5,9,12,9),F);
    }else if(idx===2){
      /* 2 Perche : corps haut à crête dorsale épineuse */
      s.part(dk,q=>{q.poly([[1,5],[4,8],[1,11]]);q.poly([[5,5],[7,2],[9,5],[11,2],[12,5]])});
      s.part(col,q=>q.ell(8.5,8.5,5.5,4));
      s.part(dk,q=>{q.line(7,6,7,10);q.line(10,6,10,10)},F);
      s.part(lt,q=>q.ell(9,11,2.6,1),F);
    }else if(idx===3){
      /* 3 Chabot : poisson de fond à grosse tête et larges nageoires */
      s.part(dk,q=>{q.poly([[1,6],[4,8],[1,10]]);q.poly([[8,10],[6,14],[11,12]])});
      s.part(col,q=>{q.ell(10.5,8,4.2,3.6);q.ell(6.5,8.5,3.2,2.2)});
      s.part(lt,q=>q.ell(10,10,2.5,1),F);ex=13;ey=7;
    }else if(idx===4){
      /* 4 Carpe ambrée : corps dodu + grande queue éventail + barbillons */
      s.part(dk,q=>q.poly([[0,4],[4,8],[0,12],[2,8]]));
      s.part(col,q=>q.ell(8.5,8,5.6,4.2));
      s.part(dk,q=>{q.poly([[6,4],[10,2],[12,5]]);q.poly([[7,12],[9,14],[10,12]])});
      s.part(lt,q=>{q.ell(9,10,3,1.2);q.px(14,10);q.px(14,11)},F);
    }else if(idx===5){
      /* 5 Truite de givre : profilée tachetée + nageoires cristallines */
      s.part("#d4f4ff",q=>{q.poly([[1,4],[4,8],[1,12]]);q.poly([[7,4],[9,2],[11,5]])});
      s.part(col,q=>q.ell(8.8,8,5.8,3));
      s.part("#ffffff",q=>{q.px(6,7);q.px(8,6);q.px(10,7);q.px(7,9)},F);
    }else if(idx===6){
      /* 6 Vairon d'orage : flèche vive à nageoires en éclair */
      s.part("#fff278",q=>{q.poly([[1,3],[4,8],[1,13],[3,8]]);q.poly([[6,5],[9,1],[11,5]]);q.poly([[7,11],[9,14],[11,11]])});
      s.part(col,q=>q.poly([[3,8],[8,5],[14,8],[8,11]]));
      s.part("#ffffff",q=>q.line(6,8,10,8),F);
    }else if(idx===7){
      /* 7 Piranha émeraude : losange trapu + mâchoire saillante */
      s.part(dk,q=>{q.poly([[1,5],[4,8],[1,11]]);q.poly([[6,4],[8,2],[10,4]])});
      s.part(col,q=>q.poly([[4,8],[8,4],[14,7],[13,11],[8,12]]));
      s.part("#e84848",q=>q.rect(7,10,5,2),F);
      s.set(13,9,"#ffffff");s.set(12,10,"#ffffff");ex=11;ey=6;
    }else if(idx===8){
      /* 8 Poisson-clown corail : rond à rayures blanches contrastées */
      s.part(dk,q=>q.poly([[1,5],[4,8],[1,11]]));
      s.part(col,q=>{q.ell(8.5,8,5.2,3.8);q.ell(7,4.5,2.4,1.2)});
      s.part("#ffffff",q=>{q.rect(6,5,2,6);q.rect(10,5,1,6)},F);
    }else if(idx===9){
      /* 9 Anguille de braise : corps serpentin en S + crête de flammes */
      s.part("#ffd24a",q=>{q.px(4,5);q.px(7,4);q.px(10,5)},F);
      s.part(col,q=>{q.line(2,10,5,7,3);q.line(5,7,9,10,3);q.line(9,10,13,7,3)});
      s.part("#ffd24a",q=>{q.px(3,9);q.px(9,9);q.px(13,6)},F);ex=13;ey=7;
    }else if(idx===10){
      /* 10 Silure astral : allongé à longues moustaches lumineuses */
      s.part(dk,q=>q.poly([[1,6],[4,8],[1,10]]));
      s.part(col,q=>{q.ell(8.5,8,5.6,2.8);q.ell(11.5,8,2.8,3.2)});
      s.part("#fff4b8",q=>{q.line(13,9,15,12);q.line(13,7,15,5);q.px(6,7);q.px(9,8)},F);ex=12;ey=7;
    }else{
      /* 11 Lanterne abyssale : globuleux + antenne lumineuse pendante */
      s.part(dk,q=>q.poly([[1,6],[4,9],[1,12]]));
      s.part(col,q=>q.ell(8,9,5,4.4));
      s.part("#d878ff",q=>{q.line(9,5,12,2);q.line(12,2,14,4)},F);
      s.part("#fff278",q=>q.rect(13,4,2,2),F);s.set(14,4,"#ffffff");
      s.set(12,11,"#ffffff");s.set(10,11,"#ffffff");ex=10;ey=8;
    }
    if(rk>=1)s.part(mix(col,DARK,.5),q=>{q.line(6,6,6,10);q.line(9,5,9,11)},F);
    s.outline(rk===2?"#8a5a08":idx===11?"#3b125c":INK);s.set(ex,ey,"#ffffff");s.set(ex,ey+1,"#1c1020");
    if(rk>=1){const g=rk===2?"#ffd84a":"#ffffff";s.set(14,2,g);s.set(13,2,g);s.set(15,2,g);s.set(14,1,g);s.set(14,3,g)}
    if(rk===2)["#ffd84a","#fff2a8","#ffd84a"].forEach((c,i)=>s.set(6+i*2,0,c));
    if(rk===3){/* mythique : écailles arc-en-ciel, nageoires dorées, étincelles */const RB=["#ff5a5a","#ffa04a","#ffe04a","#6ad86a","#5ab0ff","#a87aff"];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const c=s.p[(y+3)*22+x+3];if(c&&x>=3&&x<=13&&y>=4&&y<=12&&!(x===ex&&(y===ey||y===ey+1)))s.p[(y+3)*22+x+3]=rgb(RB[Math.min(5,Math.max(0,Math.floor((x-3)/1.9)))])}
      s.outline("#8a3a6a");s.set(ex,ey,"#ffffff");s.set(ex,ey+1,"#1c1020");[[1,1],[14,1],[15,13],[0,14],[8,0]].forEach(([x,y])=>s.set(x,y,"#fff8e6"))}
    return cache[k]=s.fit(16).url()}

  /* ---------- Accessoires de décor ---------- */
  const prop={
    tree(r,cc,tc){const s=new Spr(34,40);s.part(tc,q=>{q.rect(14,24,6,15);q.rect(12,37,10,2);q.px(11,38)});
      s.part(cc,q=>{q.ell(17,15,13,10);q.ell(8,19,6,6);q.ell(26,19,6,6);q.ell(17,8,8,6)},{lt:.3,dk:.42});
      const l=mix(cc,LIGHT,.45),d=mix(cc,DARK,.5);for(let i=0;i<46;i++){const x=4+(r()*26|0),y=3+(r()*22|0);if(s.get(x,y)&&s.get(x+1,y)&&s.get(x,y+2)){const c=r()<.5+(12-y)*.04?l:d;s.set(x,y,c);s.set(x+1,y,c)}}
      return s.outline(mix(cc,INK,.8))},
    pine(r,cc,tc,snow){const s=new Spr(22,34);s.part(tc,q=>q.rect(9,27,4,6));s.part(cc,q=>{q.poly([[11,1],[4,11],[18,11]]);q.poly([[11,7],[2,19],[20,19]]);q.poly([[11,14],[0,28],[22,28]])},{dk:.45});
      if(snow)s.part("#f4fbff",q=>{q.poly([[11,1],[8,5],[14,5]]);q.rect(5,10,4,1);q.rect(13,10,5,1);q.rect(3,18,5,1);q.rect(13,18,6,1);q.rect(2,27,6,1);q.rect(14,27,6,1)},{flat:1});return s.outline(mix(cc,INK,.8))},
    rock(r,c){const w=8+(r()*6|0),s=new Spr(w+2,10);s.part(c,q=>{q.ell(w/2+.5,6,w/2,3.4);q.rect(2,6,w-2,3)});return s.outline(mix(c,INK,.7))},
    bush(r,c){const s=new Spr(14,10);s.part(c,q=>{q.ell(4,6,3,3);q.ell(9,6,3,3);q.ell(7,4,3,3)},{dk:.42});return s.outline(mix(c,INK,.78))},
    mushroom(r,c){const s=new Spr(9,9);s.part("#f6ecd6",q=>q.rect(3,5,3,3));s.part(c,q=>{q.rect(1,3,7,2);q.rect(2,2,5,1)});s.set(3,3,"#fff");s.set(6,4,"#fff");return s.outline()},
    crystal(r,c){const s=new Spr(12,14);s.part(c,q=>{q.poly([[2,12],[4,3],[6,12]]);q.poly([[5,12],[8,0],[10,12]])},{lt:.6});return s.outline(mix(c,INK,.7))},
    cactus(r,c){const s=new Spr(12,16);s.part(c,q=>{q.rect(5,2,3,13);q.rect(1,6,2,4);q.rect(1,9,4,2);q.rect(9,4,2,5);q.rect(8,8,3,2)});s.set(6,1,"#ff8ab0");return s.outline(mix(c,INK,.75))},
    reed(r,c){const s=new Spr(9,14);s.part(c,q=>{q.rect(2,4,1,9);q.rect(5,2,1,11);q.rect(7,6,1,7)},{flat:1});s.part("#7a4a2a",q=>{q.rect(2,2,1,3);q.rect(5,0,1,3)},{flat:1});return s.outline(mix(c,INK,.75))},
    bone(r){const s=new Spr(10,6);s.part("#efe6cf",q=>{q.rect(2,2,6,1);q.rect(1,1,2,3);q.rect(7,1,2,3)},{flat:1});return s.outline("#5a4630")},
    lantern(r){const s=new Spr(7,18);s.part("#5a4030",q=>q.rect(3,6,1,11),{flat:1});s.part("#ffd86a",q=>q.rect(2,2,3,4),{flat:1});s.part("#3a2a22",q=>{q.rect(1,1,5,1);q.rect(1,6,5,1)},{flat:1});return s.outline()},
    coral(r,c){const s=new Spr(13,13);s.part(c,q=>{q.rect(6,4,2,8);q.rect(2,6,2,5);q.rect(2,9,5,2);q.rect(10,3,2,6);q.rect(7,7,4,2);q.px(6,3);q.px(2,5);q.px(10,2)});return s.outline(mix(c,INK,.7))},
    pillar(r,c){const h=12+(r()*8|0),s=new Spr(11,h+2);s.part(c,q=>{q.rect(3,2,5,h-2);q.rect(1,h-1,9,2);q.rect(2,1,7,2)});s.part(mix(c,DARK,.3),q=>q.rect(5,4,1,h-6),{flat:1});return s.outline(mix(c,INK,.7))},
    stump(r,c){const s=new Spr(10,8);s.part(c,q=>q.rect(1,2,7,5));s.part(mix(c,LIGHT,.5),q=>q.rect(2,1,5,2),{flat:1});return s.outline(mix(c,INK,.75))},
  };

  /* ---------- Décors de zone (240×130) ---------- */
  const TH={
    prairie:{g:["#6aa84a","#7cbc54","#5a9442","#4c8040"],path:"#b79a62",wall:"stone",wc:"#8f86a6",water:"#5a86d8",
      props:[["tree",3,"#3f8a44","#7a5232"],["bush",4,"#4f9a48"],["rock",3,"#9a92ae"]],fl:["#ffd84a","#ffe98a","#fff"]},
    bois:{g:["#3f7a52","#4a8a5a","#33684a","#2a5840"],path:"#7a6a4a",wall:"trees",wc:"#24503c",water:null,
      props:[["tree",5,"#2f7050","#5a4030"],["mushroom",5,"#d9574f"],["bush",4,"#2f7a4a"],["stump",2,"#7a5a3a"]],fl:["#c6e86b","#b9a6ff"]},
    marais:{g:["#587a48","#66884e","#4a6a40","#3c5a3a"],path:"#6e6a48",wall:"reeds",wc:"#3a5a4a",water:"#3f7a78",
      props:[["reed",9,"#7fa24e"],["tree",2,"#4a6e3e","#4a3a2c"],["rock",3,"#6f7a6a"],["mushroom",2,"#8a6fd0"]],fl:["#f0a8c8","#e8f0a0"]},
    mines:{g:["#5a5368","#665e76","#4c465a","#403a4e"],path:"#7a6a5a",wall:"rock",wc:"#3a3446",water:null,
      props:[["crystal",5,"#9b8ee0"],["rock",7,"#6e667e"],["lantern",3],["crystal",2,"#f0a35a"]],fl:["#c9b8ff","#ffd86a"]},
    dunes:{g:["#e0b46a","#ecc47a","#d2a25c","#c08e4e"],path:"#f2d494",wall:"cliff",wc:"#c0763e",water:null,
      props:[["cactus",5,"#5a9a4e"],["rock",5,"#c08a5a"],["bone",3]],fl:["#fff0b8","#f08a5a"]},
    falaises:{g:["#7f9a8a","#8faa98","#6e8a7c","#5c786c"],path:"#a89a84",wall:"cliff",wc:"#6a7088",water:"#5f8fd0",
      props:[["rock",8,"#8a8fa6"],["pine",4,"#4a7a6a","#5a4030"],["crystal",3,"#ffe27a"],["bush",3,"#6a9a7a"]],fl:["#fff7b0","#ffffff"]},
    jungle:{g:["#3f9a4a","#4fb058","#33843e","#286e34"],path:"#8a7a4a",wall:"trees",wc:"#1f5a34",water:"#3fa8a0",
      props:[["tree",6,"#2f9a4a","#6a4a2c"],["bush",6,"#3fae52"],["mushroom",3,"#f0a03c"],["reed",4,"#6fc04e"]],fl:["#ff6fa8","#ffd84a","#ff9a3c"]},
    recifs:{g:["#f0dca0","#f8e8b8","#e2c888","#d0b474"],path:"#fff0c8",wall:"reeds",wc:"#2f8ab0",water:"#3fb8d8",
      props:[["coral",7,"#ff7a8a"],["coral",4,"#b98aff"],["rock",5,"#b0a890"],["reed",3,"#3fa880"]],fl:["#ffffff","#ffb0c8","#8ae0f0"]},
    volcan:{nw:1,g:["#4a3a3e","#584448","#3e3034","#32262a"],path:"#6a5248",wall:"rock",wc:"#3a2a2c",water:"#ff7a2c",
      props:[["rock",8,"#5a4a4e"],["crystal",5,"#ff9a3c"],["stump",2,"#2e2224"],["bone",2]],fl:["#ff9a3c","#ffd84a","#ff5a2c"]},
    ruines:{g:["#b0a8c8","#beb6d6","#9e96b8","#8c84a6"],path:"#d0c8e0",wall:"stone",wc:"#7a72a0",water:null,
      props:[["pillar",6,"#d8d2e8"],["crystal",4,"#8ad0ff"],["rock",4,"#9a92b4"],["bush",3,"#6a9a8a"]],fl:["#ffffff","#ffe27a","#8ad0ff"]},
    abime:{nw:1,g:["#3a2e5a","#463868","#30264c","#261e40"],path:"#55467a",wall:"ice",wc:"#5a3f96",water:"#b83ad0",
      props:[["crystal",7,"#c06aff"],["crystal",3,"#ff6ab0"],["rock",5,"#4a3f6a"],["bone",3]],fl:["#c9b8ff","#ff8ad0","#8ad0ff"]},
    givre:{nw:1,g:["#dfeef8","#f2f9ff","#c6ddef","#aecbe4"],path:"#c2d8ea",wall:"ice",wc:"#8fb8dc",water:"#7ab4e8",
      props:[["pine",5,"#3f7a6a","#5a4030",1],["crystal",5,"#a6dcff"],["rock",4,"#9ab0c8"]],fl:["#ffffff","#bfe3ff"]},
  };
  function petFrames(col,anim){pet(col);const k="pe:"+col;return framesOf(k,SPR[k],anim,true)}
  /* outils de dessin pour le monde en bandeau (js/monde.js) */
  PX.kit={Spr,prop,rng,rgb,mix,TH,LIGHT,DARK,INK};
  Object.assign(PX,{plant,fish,bkey,fam,famFrames,pickup,item,res,drop,key,potion,pet,petFrames,ground:id=>(TH[id]||TH.prairie).g[0]})})();
