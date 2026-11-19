/* Moteur pixel art : objets, ressources, butins, familiers, plantes, poissons, accessoires et décors de zone (TH). Suite de pixel.js. */
(()=>{const{cache,rgb,mix,rng,LIGHT,DARK,INK,Spr,SPR,framesOf}=PX._;
  /* ---------- Objets à ramasser (16×16) ---------- */
  function pickup(id){
    const k="p:"+id;if(cache[k])return cache[k];const s=new Spr(16,16);
    if(id==="coffre"){s.part("#9a5f2e",q=>q.rect(2,7,12,7));s.part("#c07e40",q=>{q.rect(2,4,12,3);q.rect(3,3,10,1)});s.part("#f7c948",q=>{q.rect(2,7,12,1);q.rect(7,7,2,3)},{flat:1});s.set(7,9,"#6b432a");s.set(8,9,"#6b432a")}
    if(id==="etoile"){s.part("#ffe27a",q=>{q.poly([[8,1],[10,6],[14,6],[11,9],[13,14],[8,11],[3,14],[5,9],[1,6],[6,6]])});s.set(6,7,"#6b4a10");s.set(9,7,"#6b4a10");s.set(7,9,"#6b4a10");s.set(8,9,"#6b4a10")}
    if(id==="trefle"){s.part("#3f7d33",q=>q.line(8,9,11,14),{flat:1});s.part("#74d05e",q=>{q.ell(4.5,4.5,2.2,2.2);q.ell(10.5,4.5,2.2,2.2);q.ell(4.5,10.5,2.2,2.2);q.ell(10.5,10.5,2.2,2.2);q.rect(6,6,3,3)});s.set(7,7,"#d6ffc2");s.set(4,4,"#d6ffc2");s.set(10,4,"#d6ffc2");s.set(4,10,"#d6ffc2");s.set(10,10,"#d6ffc2")}
    if(id==="orbe"){s.part("#ff7a3c",q=>q.ell(8,9,5,5),{dk:.5});s.part("#ffd27a",q=>{q.rect(6,6,2,2);q.px(8,2);q.rect(7,3,2,1);q.px(9,1)},{flat:1})}
    if(id==="baluchon"){s.part("#e0c68e",q=>{q.ell(8,10,6,4.5);q.rect(4,5,8,4)});s.part("#c9483a",q=>{q.rect(5,4,6,1);q.px(4,3);q.px(11,3);q.px(3,2);q.px(12,2)},{flat:1});s.part("#b89a5a",q=>q.rect(6,1,4,3))}
    if(id==="parchemin"){s.part("#f6e7c2",q=>q.rect(3,3,10,10));s.part("#d8bf88",q=>{q.rect(2,1,12,2);q.rect(2,13,12,2)});s.part("#8a6fd0",q=>{q.rect(5,5,6,1);q.rect(5,7,6,1);q.rect(5,9,4,1)},{flat:1})}
    if(id==="oeuf"){s.part("#ffd45a",q=>{q.ell(8,8,5,6);q.ell(8,5,3.6,4)});s.part("#ff8ab0",q=>q.rect(5,6,2,2),{flat:1});s.part("#5ab4e8",q=>q.rect(9,9,2,2),{flat:1});s.part("#7fd35e",q=>q.rect(9,4,1,2),{flat:1});s.part("#ef7d4a",q=>q.rect(6,11,2,1),{flat:1})}
    s.outline();return cache[k]=s.url()}

  /* ---------- Équipement (16×16), teinté à la couleur du monstre ---------- */
  function item(slot,col){
    const k="i:"+slot+col;if(cache[k])return cache[k];const s=new Spr(16,16),G="#f7c948",M="#dfe5ec",dk=mix(col,DARK,.4);
    if(slot==="coiffe"){s.part(col,q=>{q.ell(8,8,5,5);q.clear(0,10,16,6)});s.part(dk,q=>q.rect(2,10,12,2));s.part(G,q=>q.rect(7,5,2,3),{flat:1});s.set(8,2,"#e8483c");s.set(8,1,"#e8483c")}
    if(slot==="cape"){s.part(col,q=>q.poly([[5,2],[10,2],[13,14],[2,14]]));s.part(dk,q=>{q.line(6,5,5,13);q.line(9,5,10,13)},{flat:1});s.part(G,q=>q.rect(5,2,6,1),{flat:1})}
    if(slot==="amulette"){s.part("#c9962a",q=>{q.px(3,1);q.px(4,3);q.px(5,5);q.px(6,7);q.px(12,1);q.px(11,3);q.px(10,5);q.px(9,7);q.px(3,2);q.px(12,2);q.px(4,4);q.px(11,4);q.px(5,6);q.px(10,6)},{flat:1});s.part(G,q=>q.ell(7.5,11,3.4,3.4));s.part(col,q=>q.rect(6,10,3,3))}
    if(slot==="anneau"){s.part(G,q=>{q.ell(7.5,10,4.4,4.4);q.clear(6,8,4,4)});s.part(col,q=>{q.rect(6,2,4,4);q.clear(6,2,1,1);q.clear(9,2,1,1)},{lt:.6})}
    if(slot==="bottes"){s.part(col,q=>{q.rect(4,3,5,9);q.rect(4,10,9,3);q.clear(12,10,1,1)});s.part(mix(col,LIGHT,.5),q=>q.rect(4,2,5,2),{flat:1});s.part("#4a342c",q=>q.rect(4,13,10,1),{flat:1})}
    if(slot==="arme"){s.part(M,q=>q.line(12,2,6,8,2));s.part(col,q=>q.line(3,6,8,11,2));s.part("#7a4e2e",q=>q.line(4,10,2,12,2),{flat:1});s.set(2,14,G);s.set(1,14,G);s.set(2,13,G)}
    if(slot==="ceinture"){s.part(col,q=>q.rect(1,6,14,4));s.part(G,q=>{q.rect(6,5,4,6);q.clear(7,7,2,2)});s.set(2,8,dk);s.set(12,8,dk)}
    if(slot==="bouclier"){s.part(col,q=>q.poly([[3,2],[12,2],[12,8],[7.5,14],[3,8]]));s.part(G,q=>{q.rect(7,4,2,7);q.rect(5,6,6,2)},{flat:1})}
    s.outline();return cache[k]=s.url()}

  /* ---------- Ressources de métier (16×16), une teinte par palier ---------- */
  const RC={pecheur:["#c8b08a","#8fb06a","#6fa35a","#b0643a","#e2b66a","#8fc7e0","#f2d94a","#5fae4a","#e8684a","#f0622c","#a8e8e0","#5a4fa8"],bucheron:["#c9a36a","#a8743e","#8a5a34","#b8864a","#d0703a","#7a8a4a","#e8dcc0","#b8503a","#9a7a5a","#c8b08a","#4a3a3a","#a84a2e"],
    mineur:["#b8bcc6","#e08a4a","#d0d6dc","#eef2f6","#ffd24a","#3f6fd0","#9ab0b8","#b06a8a","#d87a5a","#e8f0ff","#7ae0d0","#5a3f8a"],
    paysan:["#f0d060","#e0c070","#f0e0a0","#b8d060","#c8a060","#a0b8e0","#ffd24a","#e8c890","#fff4e0","#b08a6a","#d8b070","#f0a0a0"],
    herboriste:["#5fae4a","#8ab89a","#4fd08a","#a8e06a","#f4f8ff","#b06ad0","#b08af0","#7fc04e","#7a4fb0","#e0c080","#ff8ad0","#ff9ac8"]};
  function res(prof,t){
    const k="r:"+prof+t;if(cache[k])return cache[k];const s=new Spr(16,16),c=(RC[prof]||RC.bucheron)[t%12];
    if(prof==="bucheron"){s.part(c,q=>{q.rect(2,6,11,6);q.clear(2,6,1,1);q.clear(2,11,1,1)});s.part(mix(c,LIGHT,.55),q=>q.ell(12.5,8.5,1.6,2.6),{flat:1});s.set(12,8,mix(c,DARK,.3));s.set(13,9,mix(c,DARK,.3));
      const d=mix(c,DARK,.4);[[4,8],[5,8],[8,9],[9,9],[6,10]].forEach(([x,y])=>s.set(x,y,d));s.part("#5fae4a",q=>{q.px(5,4);q.px(6,5);q.px(4,5)},{flat:1})}
    if(prof==="mineur"){s.part("#8a8494",q=>q.poly([[2,13],[3,7],[7,3],[12,5],[14,10],[12,13]]));s.part(c,q=>{q.rect(4,6,4,4);q.rect(9,7,4,4);q.rect(6,10,3,2)},{lt:.6});s.set(4,6,"#ffffff");s.set(9,7,"#ffffff")}
    if(prof==="paysan"){s.part("#b8904a",q=>{q.line(8,15,8,7);q.line(8,13,5,9);q.line(8,13,11,9)},{flat:1});s.part(c,q=>{[[8,2],[7,4],[9,4],[7,6],[9,6],[4,6],[5,8],[12,6],[11,8]].forEach(([x,y])=>q.rect(x,y,2,2))});s.part("#c8483a",q=>q.rect(7,12,3,1),{flat:1})}
    if(prof==="pecheur")return cache[k]=fish(c,0,t);
    if(prof==="herboriste"){s.part("#3f8a3a",q=>q.line(8,15,8,6),{flat:1});s.part("#5fb04a",q=>{q.ell(5,11,2.6,1.6);q.ell(11,9,2.6,1.6)});s.part(c,q=>{q.ell(8,4.5,3.4,3.4)},{lt:.5});s.set(8,4,"#fff2a8");s.set(8,5,"#fff2a8")}
    s.outline();return cache[k]=s.url()}

  /* ---------- Butins, clés, potions, familiers (16×16) ---------- */
  function drop(kind,col,rare){
    const k="d:"+kind+col+(rare?1:0);if(cache[k])return cache[k];const s=new Spr(16,16),lt=mix(col,"#ffffff",.6),dk=mix(col,DARK,.45);
    if(kind==="feather"){s.part(col,q=>q.poly([[12,1],[14,4],[8,12],[4,12],[4,8]]));s.part("#f6ecd6",q=>q.line(3,14,12,3),{flat:1})}
    else if(kind==="fluff")s.part(col,q=>{q.ell(5.5,9,3.2,3.2);q.ell(10.5,9,3.2,3.2);q.ell(8,5.5,3.4,3.2);q.ell(8,11,3.4,2.8)},{lt:.5});
    else if(kind==="fang"){s.part(lt,q=>q.poly([[4,3],[10,3],[11,7],[9,11],[6,14],[7,9],[5,6]]));s.part(col,q=>q.rect(4,2,7,2))}
    else if(kind==="leaf"){s.part(col,q=>q.poly([[8,1],[12,5],[12,10],[8,14],[4,10],[4,5]]));s.part(dk,q=>{q.line(8,4,8,13);q.px(6,7);q.px(10,7);q.px(6,10);q.px(10,10)},{flat:1})}
    else if(kind==="dust"){s.part(col,q=>q.poly([[2,13],[5,9],[8,7],[11,9],[14,13]]));s.set(5,5,lt);s.set(10,4,lt);s.set(8,2,lt);s.set(12,7,lt);s.set(3,8,lt)}
    else if(kind==="drop"){s.part(col,q=>{q.poly([[8,2],[11,8],[5,8]]);q.ell(8,10,4,3.6)},{lt:.5});s.set(6,9,"#ffffff");s.set(6,10,"#ffffff")}
    else if(kind==="egg"){s.part(col,q=>{q.ell(8,9.5,4.4,5);q.ell(8,6,3,3.4)},{lt:.5});s.set(6,8,dk);s.set(10,10,dk);s.set(8,12,dk)}
    else{s.part(col,q=>q.poly([[3,6],[6,2],[10,2],[13,6],[8,14]]),{lt:.6});s.part(lt,q=>{q.rect(6,3,4,1);q.line(4,6,12,6)},{flat:1})}
    if(rare){["#ffffff","#fff2a8"].forEach((c,i)=>{const x=i?13:2,y=i?12:2;s.set(x,y,c);s.set(x-1,y,c);s.set(x+1,y,c);s.set(x,y-1,c);s.set(x,y+1,c)})}
    s.outline(rare?"#8a4a08":INK);return cache[k]=s.url()}
  /* clé de boss : anneau doré couronné serti d'une gemme à la couleur du boss, tige et panneton en fer sombre */
  function bkey(col){const k="bkey"+col;if(cache[k])return cache[k];const s=new Spr(16,16),G="#f2c14e",IR="#5c6078";
    s.part(IR,q=>{q.line(7,8,12,13,2);q.rect(11,10,3,1);q.rect(12,11,1,1);q.rect(9,12,1,2);q.rect(8,13,2,1)});
    s.part(G,q=>{q.ell(5,6,3.8,3.8);q.clear(4,5,3,3);q.px(2,1);q.px(5,0);q.px(8,1);q.rect(2,2,7,1)},{lt:.35});
    s.part(col,q=>q.ell(5,6,1.5,1.5),{lt:.5});s.outline();return cache[k]=s.url()}
  function key(){if(cache.key)return cache.key;const s=new Spr(16,16),G="#f7c948";s.part(G,q=>{q.ell(5,5,3.4,3.4);q.clear(4,4,2,2);q.line(7,7,12,12,2);q.rect(11,10,3,1);q.rect(9,12,1,2)});s.outline();return cache.key=s.url()}
  function potion(col){const k="po:"+col;if(cache[k])return cache[k];const s=new Spr(16,16);s.part("#dfeef5",q=>{q.rect(7,3,3,4);q.ell(8.5,10,4.6,4.4)},{lt:.6});s.part(col,q=>{q.ell(8.5,10.5,3.6,3.4);q.clear(0,0,16,9)});s.part(col,q=>q.rect(5,9,7,1),{flat:1});s.part("#8a5a34",q=>q.rect(6,1,5,2));s.set(6,8,"#ffffff");s.set(6,9,"#ffffff");s.outline();return cache[k]=s.url()}
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
  function plant(i){const k="pl:"+i;if(cache[k])return cache[k];const s=new Spr(16,16),G="#3f8a3a",L="#5fb04a";
    const stem=()=>{s.part(G,q=>q.line(8,15,8,8),{flat:1});s.part(L,q=>{q.ell(5,12,2.6,1.4);q.ell(11,11,2.6,1.4)})};
    if(i===0){stem();s.part("#e8323c",q=>{[[8,3],[5,5],[11,5],[6,8],[10,8]].forEach(([x,y])=>q.ell(x,y,2.2,2.2))});s.part("#ffe04a",q=>q.ell(8,6,1.4,1.4),{flat:1})}          /* coquelicot rouge, 5 pétales */
    if(i===1){stem();s.part("#2f6ae0",q=>q.poly([[4,2],[8,6],[12,2],[12,8],[8,10],[4,8]]))}                                                                                   /* tulipe bleue */
    if(i===2){stem();s.part("#ffd21e",q=>{for(let a=0;a<8;a++){const r=a*Math.PI/4;q.ell(8+Math.cos(r)*4,6+Math.sin(r)*4,1.4,1.4)}});s.part("#8a4a1a",q=>q.ell(8,6,2,2),{flat:1})} /* tournesol jaune */
    if(i===3){stem();s.part("#a040e0",q=>{for(let y=1;y<9;y+=2)q.ell(8,y+1,2.4-y*.15,1.2)})}                                                                                    /* lavande violette en épi */
    if(i===4){s.part("#f4f4f4",q=>{q.ell(8,6,6,3.6);q.rect(6,6,4,8)});s.part("#e04848",q=>{q.px(5,5);q.px(10,4);q.px(8,7);q.px(11,7)},{flat:1})}                          /* champignon blanc à points rouges */
    if(i===5){s.part("#2a9a3a",q=>{q.poly([[8,1],[13,6],[11,12],[8,15],[5,12],[3,6]])});s.part("#a8f08a",q=>q.line(8,3,8,14),{flat:1})}                                    /* feuille vert vif */
    s.outline();return cache[k]=s.url()}
  /* Poisson vu de côté (16×16). rk : 0 commun, 1 rare (rayures, éclat), 2 légendaire (plus grand, contour doré) */
  function fish(col,rk=0,t=0){const k="fi:"+col+rk+t;if(cache[k])return cache[k];const s=new Spr(16,16),dk=mix(col,DARK,.35),lt=mix(col,"#ffffff",.55),big=rk===2;
    const tl=t%3;/* trois silhouettes selon le palier */
    s.part(dk,q=>q.poly(tl===1?[[1,4],[4,8],[1,12]]:[[1,5],[4,8],[1,11],[2,8]]));
    s.part(col,q=>{if(tl===2){q.ell(8,8,6,2.6)}else q.ell(8.5,8,big?6:5.5,big?4:3.4)});
    s.part(dk,q=>{q.poly([[6,big?4:5],[9,big?1:2],[11,big?4:5]]);q.poly([[7,big?11:10],[9,big?14:13],[10,big?11:10]])});
    s.part(lt,q=>q.ell(9,10,3,1),{flat:1});
    if(rk>=1)s.part(mix(col,DARK,.5),q=>{q.line(6,6,6,10);q.line(9,5,9,11)},{flat:1});
    s.outline(rk===2?"#8a5a08":INK);s.set(12,7,"#ffffff");s.set(12,8,"#1c1020");
    if(rk>=1){const g=rk===2?"#ffd84a":"#ffffff";s.set(14,2,g);s.set(13,2,g);s.set(15,2,g);s.set(14,1,g);s.set(14,3,g)}
    if(rk===2)["#ffd84a","#fff2a8","#ffd84a"].forEach((c,i)=>s.set(6+i*2,0,c));
    if(rk===3){/* mythique : écailles arc-en-ciel, nageoires dorées, étincelles */const RB=["#ff5a5a","#ffa04a","#ffe04a","#6ad86a","#5ab0ff","#a87aff"];
      for(let y=0;y<16;y++)for(let x=0;x<16;x++){const c=s.p[y*16+x];if(c&&x>=3&&x<=13&&y>=4&&y<=12&&!(x===12&&(y===7||y===8)))s.p[y*16+x]=rgb(RB[Math.min(5,Math.max(0,Math.floor((x-3)/1.9)))])}
      s.outline("#8a3a6a");s.set(12,7,"#ffffff");s.set(12,8,"#1c1020");[[1,1],[14,1],[15,13],[0,14],[8,0]].forEach(([x,y])=>s.set(x,y,"#fff8e6"))}
    return cache[k]=s.url()}

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
