/* Arbre Oméga : remplace les talents et la boutique permanente.
   Premier achat (Éveil), tronc commun, 4 voies (Guerrier, Marchand, Artisan, Boutique permanente), Pacte des voies,
   Cœur d'Oméga (bonus des éclats gagnés, demande les 4 voies complètes) puis Écho d'Oméga (rangs infinis).
   État : S.arb = {own:{id:1}, voies:["g",…], pacte:0..3, echo:rangs}. Les effets sont lus par talV(), up(), stats(), etc. */
/* [id, colonne, ligne, couleur, nom, effet, coût, parents, voie, type] */
const ARB=[["eveil",4,0,"tr","Éveil d'Oméga","Premier achat obligatoire. Débloque l'arbre. +10 % de dégâts et d'XP.",1,[],null,"first"],
 ["t5",3,1,"tr","Savoir ancien","+25 % d'XP.",5,["eveil"]],["t6",2,1,"tr","Départ rapide","Chaque nouvelle vie commence au niveau 50.",500,["t5"]],["t7",1,1,"tr","Maître du temps","Le temps hors ligne compte double.",5e4,["t6"]],
 ["t1",5,1,"tr","Vétéran","Les compagnons gardent 10 % de leurs niveaux après un Oméga.",50,["eveil"]],["t2",6,1,"tr","Mémoire de la tour","Après un Oméga, la tour repart à 50 % de votre record.",5e3,["t1"]],["t3",7,1,"tr","Bestiaire vivant","+1 % de dégâts par monstre de votre bestiaire.",5e5,["t2"]]];
const ARB_V={g:{nom:"Guerrier",c:"cb",b:0,e:["Serment du Guerrier","Choisit la voie du Guerrier. +100 % de dégâts."],
  n:[["Peau de pierre","+150 % de PV, -10 % de dégâts subis."],["Commandant","Compagnons ×2."],["Œil du chasseur","+5 % de critique, coups critiques +0,2."],
     ["Fléau des boss","Dégâts ×2 contre les boss et dans les donjons."],["Légion","Compagnons ×1,5."],["Rage contenue","Sorts 20 % plus rapides à recharger."],
     ["Second souffle","Une fois par monstre, un coup fatal vous laisse à 1 PV."],["Meute fidèle","Compagnons ×2."],["Maîtrise élémentaire","Les faiblesses font +25 % de dégâts en plus."],
     ["Berserk éternel","+1 % de dégâts par % de PV manquant."],["Tour de force","Dégâts ×2 dans la tour."]],cap:["Avatar de guerre","Dégâts ×5. Sommet de la voie."]},
 m:{nom:"Marchand",c:"fo",b:3,e:["Serment du Marchand","Choisit la voie du Marchand. +100 % d'écus."],
  n:[["Prospecteur","+50 Prospection."],["Ami des marchands","Boutique 20 % moins chère."],["Trèfle à quatre feuilles","Objets cliquables 2 fois plus fréquents."],
     ["Rareté","À la forge, la rareté est tirée deux fois : la meilleure est gardée."],["Négociant","Toutes les ventes rapportent ×2."],["Coffre au trésor","Les coffres cliquables donnent ×3."],
     ["Collectionneur","+2 % d'écus par trophée différent possédé."],["Bourse de départ","Chaque nouvelle vie commence avec 1 % des écus de la précédente."],["Clés dorées","Clés de boss 2 fois plus fréquentes."],
     ["Intérêts","Hors ligne, vos écus rapportent 1 % par heure (24 h au plus)."],["Éclats dorés","+10 % d'éclats à chaque Oméga."]],cap:["Main de Midas","Écus ×5 et ventes ×2. Sommet de la voie."]},
 r:{nom:"Artisan",c:"rc",b:6,e:["Serment de l'Artisan","Choisit la voie de l'Artisan. Récolte 50 % plus rapide."],
  n:[["Contremaître","+2 ouvriers maximum."],["Poches sans fond","Sac ×2."],["Forge bénie","À la forge, la rareté monte d'un cran."],
     ["Ouvriers infatigables","Hors ligne, les ouvriers travaillent 2 fois plus."],["Double récolte","+50 % de chance de récolte double, ouvriers compris."],["Maître forgeron","Les enchantements réussissent toujours jusqu'à +5."],
     ["Héritage des métiers","Les métiers repartent au niveau 60 après un Oméga."],["Herboriste savant","Les potions durent 2 fois plus longtemps."],["Alchimie","Chaque potion préparée en donne 2."],
     ["Mini-jeux experts","XP de métier des mini-jeux ×3."],["Grand atelier","Fabriquer un objet demande 2 fois moins de ressources."]],cap:["Récolte éternelle","Récolte et ouvriers 3 fois plus rapides. Sommet de la voie."]},
 bp:{nom:"Boutique permanente",c:"bp",b:9,e:["Serment du Comptoir","Choisit la voie de la Boutique permanente. Boutique 10 % moins chère."],
  n:[["Poigne","Gants renforcés, Gants de maître et Rythme gardés à vie."],["Clic automatique","Clic automatique I et II gardés à vie."],["Grimoire","Sorts automatiques I, II et III gardés à vie."],
     ["Sacoches","Sac agrandi, Grand sac et Sac sans fond gardés à vie."],["Arcanes","Concentration et Maîtrise des arcanes gardés à vie."],["Trousse de soins","Potions automatiques et Flasque de fortune gardées à vie."],
     ["Établi","Outils affûtés, Outils de maître et Forge express gardés à vie."],["Chasse aux trésors","Aimant à trésors, Aimant à clés et Coffre garni gardés à vie."],["Comptoir","Bourse de marchand et Colporteur gardés à vie."],
     ["Garde rapprochée","Entraînement, Tactique de groupe, Bannière de guerre et Compagnons d'élite gardés à vie."],["Aventurier autonome","Défi automatique, Explorateur, Éclaireur, Grimpeur, Messager et Sablier gardés à vie."]],cap:["Intendant","Toute la boutique gardée à vie et 50 % moins chère. Sommet de la voie."]}};
/* achats de boutique gardés par chaque nœud de la voie Boutique permanente */
const ARB_KEEP={bp1:["gants1","gants2","rythme"],bp2:["auto1","auto2"],bp3:["sp1","sp2","sp3"],bp4:["sac1","sac2","sacx"],bp5:["cdr1","cdr2"],bp6:["potauto","fortauto"],
  bp7:["outils1","outils2","forgex"],bp8:["aimant","kmag","coffre"],bp9:["bourse","vendeur"],bp10:["allie1","allie2","allie3","allyel"],bp11:["bossauto","dgauto","zoneauto","tourauto","qauto","sablier"]};
(()=>{const SLOT=[[0,4,[-1]],[1,4,[-1]],[2,4,[-1]],[0,5,[0]],[1,5,[1]],[2,5,[2]],[0,6,[3]],[1,6,[4]],[2,6,[5]],[0,7,[6,7]],[2,7,[8,7]]];
  const COST={g:[100,100,100,2e3,2e3,2e3,5e4,5e4,5e4,5e6,5e6],m:[100,100,100,2e3,2e3,2e3,5e4,5e4,5e4,5e6,5e6],r:[100,100,100,2e3,2e3,2e3,5e4,5e4,5e4,5e6,5e6],bp:[10,10,10,100,100,100,1e3,1e3,1e3,1e4,1e4]};
  for(const k in ARB_V){const v=ARB_V[k];ARB.push([k+"0",v.b+1,3,v.c,v.e[0],v.e[1],10,["eveil"],k,"oath"]);
    v.n.forEach(([nm,tx],i)=>{const[c,r,ps]=SLOT[i];ARB.push([k+(i+1),v.b+c,r,v.c,nm,tx,COST[k][i],ps.map(p=>p<0?k+"0":k+(p+1)),k])});
    ARB.push([k+"cap",v.b+1,8,v.c,v.cap[0],v.cap[1],k==="bp"?1e6:5e8,[k+"10",k+"11"],k,"cap"])}
  ARB.push(["pacte",8,1,"tr","Pacte des voies","Permet de suivre une voie de plus. 3 niveaux : 5 M, 50 M puis 500 M éclats. Au niveau 3, les 4 voies sont ouvertes.",5e6,["eveil"],null,"first"]);
  ARB.push(["coeur",4,9,"om","Cœur d'Oméga","Les éclats gagnés depuis le début donnent +12,5 % de dégâts chaque fois que leur total est multiplié par 10. Demande les 4 voies achetées en entier.",1e9,["gcap","mcap","rcap","bpcap"],null,"fin"]);
  ARB.push(["echo",4,10,"om","Écho d'Oméga","Rangs infinis : dégâts, PV, écus et XP ×1,05 par rang. Coût : 1 Md, puis ×10 à chaque rang.",1e9,["coeur"],null,"fin"])})();
const ARB_ID=Object.fromEntries(ARB.map(n=>[n[0],n])),ARB_VK=["g","m","r","bp"];
const arbS=()=>{if(!S.arb||typeof S.arb!=="object")S.arb={own:{},voies:[],pacte:0,echo:0};const a=S.arb;a.own=a.own||{};a.voies=a.voies||[];a.pacte=a.pacte||0;a.echo=a.echo||0;return a};
const arb=id=>!!(S&&S.arb&&S.arb.own&&S.arb.own[id]);
const arbMaxV=()=>1+arbS().pacte,arbFull=k=>ARB.filter(x=>x[8]===k).every(x=>arb(x[0]));
const arbCost=n=>n[0]==="echo"?1e9*Math.pow(10,arbS().echo):n[0]==="pacte"?5e6*Math.pow(10,arbS().pacte):n[6];
function arbState(n){const a=arbS();if(n[0]==="pacte")return!arb("eveil")?"lock":a.pacte>=3?"own":"ok";if(n[0]!=="echo"&&a.own[n[0]])return"own";if(n[0]!=="eveil"&&!arb("eveil"))return"lock";
  if(n[8]&&!a.voies.includes(n[8])&&(n[9]!=="oath"||a.voies.length>=arbMaxV()))return"lock";if(!n[7].length)return"ok";
  if(n[0]==="coeur")return ARB_VK.every(arbFull)?"ok":"lock";return n[7].some(arb)?"ok":"lock"}
function arbBuy(id){const n=ARB_ID[id];if(!n||arbState(n)!=="ok"&&!(id==="echo"&&arb("coeur")))return;const c=arbCost(n);if(S.souls<c)return;const a=arbS();S.souls-=c;
  if(id==="echo"){a.echo++;a.own.echo=1}else if(id==="pacte")a.pacte++;else{a.own[id]=1;if(n[9]==="oath"&&!a.voies.includes(n[8]))a.voies.push(n[8])}
  sfx("level");log(`Arbre Oméga : ${n[4]}${id==="echo"?" rang "+a.echo:id==="pacte"?" niveau "+a.pacte:""}.`,"g");S.hp=Math.min(S.hp,stats().maxHp);potSig="";mbSig="";drawSpells()}
/* quitter une voie : ses nœuds (et le Cœur, l'Écho) sont rendus en éclats */
function arbLeave(k){const a=arbS();let g=0;ARB.filter(x=>x[8]===k&&a.own[x[0]]).forEach(x=>{g+=x[6];delete a.own[x[0]]});
  if(a.own.coeur){g+=1e9;delete a.own.coeur}if(a.echo){for(let i=0;i<a.echo;i++)g+=1e9*Math.pow(10,i);a.echo=0;delete a.own.echo}
  a.voies=a.voies.filter(v=>v!==k);S.souls+=g;log(`Vous quittez la voie ${k==="bp"?"de la Boutique permanente":"du "+ARB_V[k].nom} : ${fmt(g)} éclats rendus.`,"g");toast(`${fmt(g)} éclats rendus`);potSig="";mbSig=""}
/* ---------- effets ---------- */
const arbEcho=()=>Math.pow(1.05,(S&&S.arb&&S.arb.echo)||0);
const arbTrophies=()=>new Set((S.items||[]).filter(i=>ITEMS[i.id]&&ITEMS[i.id].slot==="trophee").map(i=>i.id)).size;
/* compatibilité : les anciens talents sont lus à travers l'arbre */
function talV(id){switch(id){
  case"t_force":return(arb("eveil")?10:0)+(arb("g0")?100:0)+(arb("t3")?Object.keys(S.best||{}).length:0);
  case"t_prec":return arb("g3")?5:0;case"t_vie":return arb("g1")?150:0;case"t_elem":return arb("g9")?25:0;
  case"t_mains":return arb("r0")?50:0;case"t_double":return arb("r5")?50:0;case"t_metier":return arb("r7")?60:1;
  case"t_avar":return(arb("m0")?100:0)+(arb("m7")?2*arbTrophies():0);case"t_pros":return arb("m1")?50:0;case"t_trefle":return arb("m3")?50:0;
  default:return 0}}
/* multiplicateurs appliqués dans stats(), gainEcus(), etc. */
const arbDmgMult=st=>(arb("gcap")?5:1)*((S.mode==="boss"||S.mode==="donjon")&&arb("g4")?2:1)*(S.mode==="tour"&&arb("g11")?2:1)*arbEcho()
  *(arb("g10")&&st&&st.maxHp?1+Math.max(0,1-S.hp/st.maxHp):1);
const arbHpMult=()=>arbEcho(),arbEcusMult=()=>(arb("mcap")?5:1)*arbEcho(),arbXpMult=()=>(1+(arb("eveil")?.1:0)+(arb("t5")?.25:0))*arbEcho();
const arbAllyMult=()=>(arb("g2")?2:1)*(arb("g5")?1.5:1)*(arb("g8")?2:1),arbSellMult=()=>(arb("m5")?2:1)*(arb("mcap")?2:1);
const arbShopMult=()=>(arb("bp0")?.9:1)*(arb("m2")?.8:1)*(arb("bpcap")?.5:1),shopCost=c=>Math.max(1,Math.round(c*arbShopMult()));
const arbKeep=id=>arb("bpcap")||Object.keys(ARB_KEEP).some(k=>arb(k)&&ARB_KEEP[k].includes(id));
const arbGatherDiv=()=>arb("rcap")?3:1,ouvMax=()=>6+(arb("r1")?2:0),craftQ=q=>arb("r11")?Math.ceil(q/2):q;
/* ---------- affichage (onglet Oméga > Arbre) ---------- */
let arbSel="eveil";
const ARB_COL={cb:"#c8402e",fo:"#d99a1e",rc:"#3f8f2e",tr:"#7a4fc0",om:"#ffd27a",bp:"#1f8a9a"};
/* à l'ouverture, centre la vue sur le nœud choisi (le panneau est plus étroit que l'arbre) */
function arbCenter(){const b=document.querySelector(".aboard");if(!b||b._arbInit)return;b._arbInit=1;const n=b.querySelector(`[data-id="${arbSel}"]`);if(n){b.scrollLeft=Math.max(0,n.offsetLeft-b.clientWidth/2+60);b.scrollTop=Math.max(0,n.offsetTop-40)}}
function pArbre(){setTimeout(arbCenter,0);const a=arbS(),CW=132,RH=84,P=16,W=12*CW+P*2-12,H=11*RH+P*2,pos={};ARB.forEach(n=>pos[n[0]]={x:P+n[1]*CW,y:P+n[2]*RH+14});
  let s=`<svg class="alinks" width="${W}" height="${H}" aria-hidden="true">`;
  ARB.forEach(n=>n[7].forEach(p=>{const A=pos[p],B=pos[n[0]];const ax=A.x+60,ay=A.y+28,bx=B.x+60,by=B.y+28,my=n[2]-ARB_ID[p][2]>1?B.y-12:(ay+by)/2,st=arbState(n);
    s+=`<path d="M${ax} ${ay} V${my} H${bx} V${by}" fill="none" stroke="${arb(p)&&st!=="lock"?"#2f6a22":st==="lock"?"#cdbf9f":"#6b5a9a"}" stroke-width="${arb(p)&&st!=="lock"?4:3}" ${n[0]==="coeur"?'stroke-dasharray="7 5"':""}/>`}));
  s+="</svg>";
  const lanes=Object.values(ARB_V).map(v=>`<div class="alane" style="left:${P+v.b*CW}px;top:${P+3*RH-14}px;width:${3*CW-12}px;background:${ARB_COL[v.c]}">${v.c==="bp"?v.nom:"Voie du "+v.nom}</div>`).join("")+`<div class="alane" style="left:${P}px;top:${P+RH+14}px;width:${CW-12}px;background:${ARB_COL.tr};padding:12px 4px">Tronc<br>commun</div>`;
  const nodes=ARB.map(n=>{const st=arbState(n),c=arbCost(n),lbl=st==="own"?(n[0]==="pacte"?"Niveau 3 · max":"Acquis"):(n[0]==="echo"?"Rang "+a.echo+" · ":n[0]==="pacte"?"Niv. "+a.pacte+"/3 · ":"")+fmt(c);
    return`<button class="anode ${st}${n[9]?" "+n[9]:""}${arbSel===n[0]?" on":""}" data-a="arbSel" data-id="${n[0]}" style="left:${pos[n[0]].x}px;top:${pos[n[0]].y}px;--c:${ARB_COL[n[3]]}"><b>${n[4]}</b><span class="act${st!=="own"&&S.souls>=c&&st==="ok"?" can":""}">${lbl}${st==="own"?"":` <span class="soul"></span>`}</span></button>`}).join("");
  const n=ARB_ID[arbSel]||ARB[0],st=arbState(n),c=arbCost(n);
  const need=n[0]==="coeur"?`Demande les 4 voies achetées en entier (${ARB_VK.filter(arbFull).length}/4 terminées)`:n[0]==="pacte"?`Niveau ${a.pacte}/3 · ${arbMaxV()} voie${arbMaxV()>1?"s":""} possible${arbMaxV()>1?"s":""}`:n[7].length?"Demande : "+n[7].map(p=>ARB_ID[p][4]).join(" ou "):"Premier achat de l'arbre";
  let act;if(n[0]==="pacte"&&arb("eveil")&&a.pacte<3)act=`<button class="btn pri" data-a="arbBuy" data-id="pacte" ${S.souls<c?"disabled":""}>Niveau ${a.pacte+1} · ${fmt(c)} <span class="soul"></span></button>`;
  else if(n[0]==="echo"&&arb("coeur"))act=`<button class="btn pri" data-a="arbBuy" data-id="echo" ${S.souls<c?"disabled":""}>Rang ${a.echo+1} · ${fmt(c)} <span class="soul"></span></button>`;
  else if(st==="own")act=n[9]==="oath"?`<button class="btn" data-a="arbLeave" data-k="${n[8]}">Quitter cette voie (rend ses éclats)</button>`:`<span class="tag">Acquis</span>`;
  else if(st==="ok")act=`<button class="btn pri" data-a="arbBuy" data-id="${n[0]}" ${S.souls<c?"disabled":""}>Acheter · ${fmt(c)} <span class="soul"></span></button>`;
  else act=`<span class="small muted">${!arb("eveil")&&n[0]!=="eveil"?"Achetez d'abord l'Éveil d'Oméga":n[8]&&!a.voies.includes(n[8])?`Vous suivez déjà ${arbMaxV()} voie${arbMaxV()>1?"s":""} : achetez un niveau du Pacte des voies ou quittez une voie`:"Pas encore disponible"}</span>`;
  const vn=n[8]?(n[8]==="bp"?"voie de la Boutique permanente":"voie du "+ARB_V[n[8]].nom):"";
  return`<div class="sec"><p class="small muted" style="margin:0 0 6px">Achetez d'abord l'Éveil d'Oméga. Prêtez ensuite un serment parmi 4 voies ; le Pacte des voies en ouvre une de plus à chaque niveau. Le Cœur d'Oméga demande les 4 voies complètes. Quitter une voie rend ses éclats. Voies suivies : <b>${a.voies.length}/${arbMaxV()}</b>.</p>
    <div class="aboard"><div class="ainner" style="width:${W}px;height:${H}px">${s}${lanes}${nodes}</div></div>
    <div class="afiche"><div><b class="nm">${n[4]}</b>${vn?` <span class="small muted">· ${vn}</span>`:""}<div>${n[5]}</div><div class="small muted">${need}</div></div><div>${act}</div></div></div>`}
