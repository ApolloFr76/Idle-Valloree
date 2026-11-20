/* Données du jeu (4/4) : rareté et forge, caractéristiques secondaires, événements météo, familiers, trophées, emplacements, icônes, codes cadeaux. */
/* Rareté des objets fabriqués */
const RAR=[{n:"Commun",c:"#5a4a3a",m:1},{n:"Rare",c:"#1f6fb8",m:1.15},{n:"Épique",c:"#7a3fc0",m:1.35},{n:"Légendaire",c:"#c2560a",m:1.6}];
/* Chances de rareté (%) selon le score de forge (0 à 6 points), et sans mini-jeu */
const FORGE_W=[[90,10,0,0],[80,17,3,0],[70,24,6,0],[55,32,11,2],[40,37,18,5],[25,38,27,10],[10,32,38,20]],FORGE_SKIP=[75,20,5,0],FORGE_FAST=[0,70,25,5];
const rarOf=i=>RAR[(i&&i.r)||0];
/* Bonus secondaires des caractéristiques : un palier tous les 5 points (équipement compris).
   Sagesse, Agilité et Terre suivent une courbe à rendement décroissant asymptotique vers 90 % :
   les premiers points donnent le plus (+1 % par palier au départ), 60 % reste long (8 000 points), et 90 % n'est jamais dépassé. */
const SEC_STEP=5,SEC_ASYMP=90;
const secPct=n=>n<=0?0:SEC_ASYMP*(1-Math.pow(1+n/20,-.25));
const fmtPct=x=>x.toFixed(1).replace(/\.0$/,"").replace(".",",");
const SEC={vit:{f:n=>`+${n} % de PV max`},sagesse:{asymp:1,f:n=>`-${fmtPct(n)} % de recharge des sorts`},agi:{asymp:1,f:n=>`${fmtPct(n)} % de chance d'attaquer deux fois`},
  feu:{f:n=>`+${2*n} % de dégâts critiques`},eau:{f:n=>`+${2*n} Prospection`},terre:{asymp:1,f:n=>`-${fmtPct(n)} % de dégâts subis`},air:{f:n=>`+${(n/2).toString().replace(".",",")} % de critique`}};
const secN=(k,v)=>{const n=Math.floor(Math.max(0,v||0)/SEC_STEP);return SEC[k]&&SEC[k].asymp?secPct(n):n};
const secTxt=(k,v)=>SEC[k]?SEC[k].f(secN(k,v)):"";
/* Événements et météo */
const EVENTS=[
  {id:"braises",n:"Pluie de braises",txt:"Les attaques de Feu font +30 % de dégâts",el:"feu",c:"#ff8a4a"},
  {id:"averse",n:"Averse",txt:"Les attaques d'Eau font +30 % de dégâts",el:"eau",c:"#6bb8e8"},
  {id:"tempete",n:"Tempête",txt:"Les attaques d'Air font +30 % de dégâts",el:"air",c:"#bfeedd"},
  {id:"seisme",n:"Secousses",txt:"Les attaques de Terre font +30 % de dégâts",el:"terre",c:"#d9b47a"},
  {id:"heure",n:"Heure dorée",txt:"Écus des monstres ×2",c:"#f0c35a"},
  {id:"nuit",n:"Nuit étoilée",txt:"XP ×1,5 et objets cliquables deux fois plus fréquents",c:"#a9b8ff"},
  {id:"brume",n:"Brume mystérieuse",txt:"Butin des monstres ×2",c:"#c9d3dc"},
];
const EV_DUR=120,EV_MIN=240,EV_MAX=480;
const evOn=id=>S.ev&&S.ev.id===id;

/* Familiers et montures (fabriqués dans l'Atelier). Ils s'affichent à côté du héros dans la zone de combat.
   [id, nom, type, niveau, stats, recette, zone, apparence]. Apparence (dessinée par PX.fam) :
   t = forme (quad, oiseau, insecte, scarabee, crapaud, hippocampe, raie, follet, golem), c/c2 = couleurs,
   o = oreilles (longue, pointe, rond, cornes), q = queue (touffe, fine, flamme), x = détail (carapace, criniere, ailes, taches),
   vol = vole au-dessus du sol. */
const famSt=(z,w)=>{const b=budget(z),o={};for(const k in w)o[k]=k==="crit"?Math.round(w[k]):Math.round(b*w[k]);return o};
const FAMS=[
  ["fam_lapin","Lapinou des prés","Familier",5,{prospection:20,sagesse:5},[["laine",10],["plume",10],["ble",15]],0,{t:"quad",c:"#f4ead8",c2:"#f4a6a0",o:"longue",q:"touffe"}],
  ["fam_luciole","Luciole apprivoisée","Familier",15,{sagesse:25,vit:20},[["lueur",15],["spore",10],["chataignier",15]],1,{t:"insecte",c:"#6a5a8a",c2:"#fff27a",vol:1}],
  ["mont_crapaud","Crapaud de selle","Monture",25,{vit:80,agi:30},[["bave",20],["vase",15],["avoine",20]],2,{t:"crapaud",c:"#6fa35a",c2:"#e8d48a"}],
  ["fam_taupe","Taupinette des galeries","Familier",35,famSt(3,{prospection:.45,agi:.35}),[["geode",20],["griffe",15],["chene",25]],3,{t:"quad",c:"#6a5a62",c2:"#f4a6a0",o:"rond",x:"griffes"}],
  ["mont_belier","Bélier des galeries","Monture",38,famSt(3,{vit:.9,puissance:.45}),[["rouille",25],["argent",15],["houblon",25]],3,{t:"quad",c:"#e8dcc4",c2:"#9a7a5a",o:"cornes",x:"laine",m:1}],
  ["mont_scarabee","Scarabée porteur","Monture",45,{vit:150,puissance:60,prospection:30},[["elytre",25],["geode",15],["or",20]],4,{t:"scarabee",c:"#3e8f8a",c2:"#c6e86b",m:1}],
  ["fam_fennec","Fennec des dunes","Familier",50,famSt(4,{agi:.45,prospection:.4,crit:4}),[["sable",25],["mirage",20],["seigle",30]],4,{t:"quad",c:"#e8b86a",c2:"#fff2d8",o:"pointe",q:"touffe"}],
  ["fam_givre","Renardeau de givre","Familier",60,{puissance:120,crit:5,prospection:40},[["fourrure",30],["givre",20],["lin",30]],5,{t:"quad",c:"#e8f1f5",c2:"#8fc7e0",o:"pointe",q:"touffe"}],
  ["mont_ours","Ours des neiges","Monture",70,famSt(5,{vit:1,puissance:.5}),[["fourrure",35],["souffle",25],["cobalt",30]],5,{t:"quad",c:"#f4f8fa",c2:"#b9d4f0",o:"rond",m:1}],
  ["fam_hibou","Hibou d'orage","Familier",82,famSt(6,{sagesse:.6,air:.5,crit:5}),[["eclair",30],["nuee",25],["bouleau",35]],6,{t:"oiseau",c:"#8f8a9c",c2:"#f2d94a",vol:1}],
  ["mont_griffon","Griffon des falaises","Monture",90,famSt(6,{vit:1,agi:.5,puissance:.4}),[["galet",35],["eclair",30],["zinc",35]],6,{t:"quad",c:"#e2b66a",c2:"#f4f8fa",o:"pointe",q:"fine",x:"ailes",m:1}],
  ["fam_ouistiti","Ouistiti des lianes","Familier",102,famSt(7,{agi:.6,prospection:.6,crit:6}),[["liane",35],["poilroux",30],["merisier",40]],7,{t:"quad",c:"#b9773f",c2:"#f4d8b0",o:"rond",q:"fine"}],
  ["mont_panthere","Panthère d'émeraude","Monture",110,famSt(7,{puissance:.7,agi:.5,vit:.7}),[["poilroux",40],["petalecarn",35],["manganese",40]],7,{t:"quad",c:"#2f6a3a",c2:"#7ad08a",o:"pointe",q:"fine",x:"taches",m:1}],
  ["fam_hippocampe","Hippocampe nacré","Familier",122,famSt(8,{sagesse:.7,prospection:.6}),[["pince",40],["filament",35],["riz",45]],8,{t:"hippocampe",c:"#c08af0",c2:"#f4e8ff",vol:1}],
  ["mont_tortue","Tortue de corail","Monture",130,famSt(8,{vit:1.5,puissance:.4}),[["piquant",45],["pince",35],["bauxite",45]],8,{t:"quad",c:"#6fa35a",c2:"#e8684a",x:"carapace",m:1}],
  ["fam_salamandre","Salamandre de braise","Familier",142,famSt(9,{puissance:.9,crit:8}),[["magma",45],["cendre",35],["charme",50]],9,{t:"quad",c:"#f0622c",c2:"#ffd36a",q:"flamme",x:"bas"}],
  ["mont_draco","Draco de lave","Monture",150,famSt(9,{vit:1.1,puissance:.8,agi:.3}),[["scorie",50],["magma",40],["platine",50]],9,{t:"quad",c:"#8a4a3c",c2:"#ff8a3c",o:"cornes",q:"flamme",x:"ailes",m:1}],
  ["fam_follet","Feu follet","Familier",162,famSt(10,{sagesse:.6,puissance:.7,prospection:.4}),[["voile",50],["pierrelune",40],["ebene",55]],10,{t:"follet",c:"#a8e8e0",c2:"#f4fffd",vol:1}],
  ["mont_golem","Golem runique","Monture",170,famSt(10,{vit:1.4,puissance:.9}),[["rune",55],["pierrelune",45],["mithril",55]],10,{t:"golem",c:"#8a8a9e",c2:"#f0a03c",m:1}],
  ["fam_chatombre","Chat d'ombre","Familier",182,famSt(11,{puissance:1,agi:.4,crit:10}),[["ombre",55],["neant",45],["sequoia",60]],11,{t:"quad",c:"#3a3060",c2:"#c83a5a",o:"pointe",q:"fine"}],
  ["mont_raie","Raie du néant","Monture",192,famSt(11,{vit:1.4,puissance:1.1,agi:.4}),[["larme",60],["neant",50],["obsidienne",60]],11,{t:"raie",c:"#5a4fa8",c2:"#c83a5a",vol:1,m:1}],
];
FAMS.forEach(([id,name,kind,lvl,stats,recipe,z,look])=>ITEMS[id]={id,z,slot:"familier",kind,name,stats,recipe,lvl,price:60*(z+1)**2,noSet:true,look});
/* Trophées : butin rare (1 % × prospection), un par type de monstre */
const TR_ST=["vit","puissance","agi","sagesse","prospection","crit"];
ZONES.forEach((z,zi)=>{const a=TR_ST[zi%6],b=TR_ST[(zi+2)%6],v=k=>k==="crit"?2+zi:Math.round(budget(zi)*.5);ITEMS["tb_"+zi]={id:"tb_"+zi,z:zi,slot:"trophee",kind:"Trophée de boss",name:"Trophée : "+BOSSES[zi][0],stats:{[a]:v(a),[b]:v(b)},recipe:[],lvl:1,price:150*(zi+1)**2,noSet:true,noEnch:true}});
Object.values(MON).filter(m=>!m.boss).forEach((m,i,A)=>{const z=m.zone,k=TR_ST[(m.extra?A.filter(o=>!o.extra).length+A.filter(o=>o.extra).indexOf(m):A.filter(o=>!o.extra).indexOf(m))%6];ITEMS["tr_"+m.id]={id:"tr_"+m.id,z,slot:"trophee",kind:"Trophée",name:"Trophée : "+m.name,stats:{[k]:k==="crit"?1+Math.floor(z/2):Math.max(2,Math.round(budget(z)*(k==="prospection"?.5:.3)))},recipe:[],lvl:1,price:40*(z+1)**2,noSet:true,noEnch:true}});
/* Emplacements d'équipement */
const EQ={coiffe:{n:"Coiffe",t:"coiffe"},cape:{n:"Cape",t:"cape"},arme:{n:"Arme",t:"arme"},bottes:{n:"Bottes",t:"bottes"},
  amulette:{n:"Amulette",t:"amulette"},anneau:{n:"Anneau",t:"anneau"},anneau2:{n:"Anneau",t:"anneau"},ceinture:{n:"Ceinture",t:"ceinture"},bouclier:{n:"Bouclier",t:"bouclier"},familier:{n:"Monture",t:"familier"}};
for(let i=0;i<6;i++)EQ["trophee"+i]={n:"Trophée",t:"trophee"};
const DOLL_L=["amulette","anneau","anneau2","ceinture","bottes"],DOLL_R=["coiffe","arme","bouclier","cape","familier"],DOLL_B=[0,1,2,3,4,5].map(i=>"trophee"+i);
const ZCOL=["#a6d46f","#6fc3a0","#4fb3a0","#a99ee0","#e2b66a","#8fc7e0","#b8c8e8","#5fd07a","#5fd0e0","#ff8a5a","#c8b8f0","#9a7af0"],PCOL={bucheron:"#c49a5a",mineur:"#aab6c4",paysan:"#e8d26a",herboriste:"#8fd16a"};
/* Icônes en pixels 16×16 (tracés générés) */
const G={parchemin:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M1 1h13v1h-13zM0 2h2v2h-2zM13 2h2v2h-2zM1 4h13v1h-13zM3 5h1v7h-1zM11 5h1v7h-1zM5 6h5v1h-5zM5 8h5v1h-5zM5 10h3v1h-3zM1 12h13v1h-13zM0 13h2v1h-2zM13 13h2v1h-2zM1 14h13v1h-13z"/>',herboriste:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M9 2h5v1h-5zM7 3h7v1h-7zM6 4h3v1h-3zM12 4h2v1h-2zM5 5h3v1h-3zM12 5h2v1h-2zM4 6h2v1h-2zM8 6h1v1h-1zM12 6h1v1h-1zM3 7h3v1h-3zM7 7h3v1h-3zM11 7h2v1h-2zM3 8h2v1h-2zM6 8h3v1h-3zM11 8h2v1h-2zM3 9h5v1h-5zM10 9h2v1h-2zM3 10h4v1h-4zM8 10h3v1h-3zM2 11h8v1h-8zM2 12h7v1h-7zM3 13h2v1h-2z"/>',
  potion:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M5 1h6v1h-6zM5 2h6v1h-6zM6 3h4v1h-4zM6 4h4v1h-4zM6 5h4v1h-4zM5 6h2v1h-2zM9 6h2v1h-2zM5 7h2v1h-2zM9 7h2v1h-2zM4 8h8v1h-8zM4 9h8v1h-8zM3 10h2v1h-2zM11 10h2v1h-2zM3 11h2v1h-2zM11 11h2v1h-2zM2 12h2v1h-2zM12 12h2v1h-2zM2 13h12v1h-12zM3 14h10v1h-10z"/>',
  quete:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M3 1h8v1h-8zM3 2h9v1h-9zM3 3h2v1h-2zM11 3h2v1h-2zM3 4h2v1h-2zM12 4h2v1h-2zM3 5h11v1h-11zM3 6h11v1h-11zM3 7h2v1h-2zM12 7h2v1h-2zM3 8h11v1h-11zM3 9h2v1h-2zM6 9h5v1h-5zM12 9h2v1h-2zM3 10h2v1h-2zM6 10h3v1h-3zM12 10h2v1h-2zM3 11h7v1h-7zM12 11h2v1h-2zM3 12h2v1h-2zM12 12h2v1h-2zM3 13h11v1h-11zM3 14h10v1h-10z"/>',
  cle:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M5 4h1v1h-1zM3 5h5v1h-5zM2 6h3v1h-3zM6 6h3v1h-3zM2 7h2v1h-2zM7 7h8v1h-8zM2 8h2v1h-2zM7 8h8v1h-8zM2 9h3v1h-3zM6 9h3v1h-3zM11 9h4v1h-4zM3 10h5v1h-5zM11 10h2v1h-2zM5 11h1v1h-1z"/>',
  ceinture:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M7 4h2v1h-2zM2 5h12v1h-12zM1 6h14v1h-14zM1 7h2v1h-2zM6 7h4v1h-4zM13 7h2v1h-2zM1 8h2v1h-2zM6 8h4v1h-4zM13 8h2v1h-2zM1 9h14v1h-14zM2 10h12v1h-12zM7 11h2v1h-2z"/>',
  bouclier:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M7 1h2v1h-2zM4 2h8v1h-8zM2 3h5v1h-5zM9 3h5v1h-5zM2 4h2v1h-2zM12 4h2v1h-2zM2 5h2v1h-2zM12 5h2v1h-2zM2 6h2v1h-2zM12 6h2v1h-2zM2 7h2v1h-2zM12 7h2v1h-2zM2 8h2v1h-2zM12 8h2v1h-2zM2 9h2v1h-2zM12 9h2v1h-2zM2 10h2v1h-2zM12 10h2v1h-2zM3 11h2v1h-2zM11 11h2v1h-2zM4 12h3v1h-3zM9 12h3v1h-3zM5 13h6v1h-6zM6 14h3v1h-3z"/>',
  coiffe:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M6 3h4v1h-4zM5 4h6v1h-6zM4 5h3v1h-3zM9 5h3v1h-3zM4 6h2v1h-2zM10 6h2v1h-2zM4 7h2v1h-2zM10 7h2v1h-2zM3 8h2v1h-2zM11 8h2v1h-2zM3 9h2v1h-2zM11 9h2v1h-2zM2 10h12v1h-12zM1 11h14v1h-14z"/>',
  cape:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M5 1h6v1h-6zM4 2h8v1h-8zM4 3h8v1h-8zM4 4h2v1h-2zM7 4h2v1h-2zM10 4h2v1h-2zM4 5h2v1h-2zM10 5h2v1h-2zM3 6h2v1h-2zM11 6h2v1h-2zM3 7h2v1h-2zM11 7h2v1h-2zM3 8h2v1h-2zM11 8h2v1h-2zM3 9h2v1h-2zM11 9h2v1h-2zM2 10h2v1h-2zM12 10h2v1h-2zM2 11h2v1h-2zM12 11h2v1h-2zM2 12h2v1h-2zM12 12h2v1h-2zM2 13h12v1h-12zM2 14h12v1h-12z"/>',
  arme:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M11 1h2v1h-2zM8 2h2v1h-2zM11 2h3v1h-3zM9 3h6v1h-6zM10 4h5v1h-5zM9 5h4v1h-4zM8 6h3v1h-3zM12 6h2v1h-2zM7 7h3v1h-3zM13 7h1v1h-1zM6 8h3v1h-3zM5 9h3v1h-3zM4 10h3v1h-3zM3 11h3v1h-3zM2 12h3v1h-3zM2 13h2v1h-2z"/>',
  bottes:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M4 1h5v1h-5zM4 2h5v1h-5zM4 3h2v1h-2zM7 3h2v1h-2zM4 4h2v1h-2zM7 4h2v1h-2zM4 5h2v1h-2zM7 5h2v1h-2zM4 6h2v1h-2zM7 6h2v1h-2zM4 7h2v1h-2zM7 7h2v1h-2zM4 8h2v1h-2zM7 8h3v1h-3zM4 9h2v1h-2zM8 9h4v1h-4zM4 10h2v1h-2zM10 10h4v1h-4zM4 11h2v1h-2zM12 11h2v1h-2zM4 12h10v1h-10zM4 13h10v1h-10z"/>',
  amulette:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M3 1h1v1h-1zM12 1h1v1h-1zM3 2h2v1h-2zM11 2h2v1h-2zM3 3h3v1h-3zM10 3h3v1h-3zM4 4h2v1h-2zM10 4h2v1h-2zM5 5h2v1h-2zM9 5h2v1h-2zM6 6h4v1h-4zM6 7h4v1h-4zM5 8h6v1h-6zM5 9h2v1h-2zM9 9h2v1h-2zM4 10h2v1h-2zM10 10h2v1h-2zM5 11h2v1h-2zM9 11h2v1h-2zM5 12h6v1h-6zM6 13h4v1h-4z"/>',
  anneau:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M6 2h4v1h-4zM6 3h4v1h-4zM6 4h4v1h-4zM5 5h6v1h-6zM4 6h3v1h-3zM9 6h3v1h-3zM3 7h3v1h-3zM10 7h3v1h-3zM3 8h2v1h-2zM11 8h2v1h-2zM3 9h2v1h-2zM11 9h2v1h-2zM3 10h2v1h-2zM11 10h2v1h-2zM4 11h2v1h-2zM10 11h2v1h-2zM4 12h8v1h-8zM5 13h6v1h-6z"/>',
  familier:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M7 2h2v1h-2zM6 3h4v1h-4zM4 4h1v1h-1zM6 4h4v1h-4zM11 4h1v1h-1zM2 5h12v1h-12zM2 6h12v1h-12zM2 7h12v1h-12zM3 8h10v1h-10zM5 9h2v1h-2zM9 9h2v1h-2zM4 10h2v1h-2zM10 10h2v1h-2zM4 11h2v1h-2zM10 11h2v1h-2zM5 12h6v1h-6zM5 13h6v1h-6z"/>',
  trophee:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M4 2h8v1h-8zM2 3h12v1h-12zM2 4h4v1h-4zM10 4h4v1h-4zM2 5h4v1h-4zM10 5h4v1h-4zM2 6h4v1h-4zM10 6h4v1h-4zM4 7h3v1h-3zM9 7h3v1h-3zM5 8h6v1h-6zM7 9h2v1h-2zM7 10h2v1h-2zM7 11h2v1h-2zM5 12h6v1h-6zM4 13h8v1h-8z"/>',
  drop:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M6 1h4v1h-4zM6 2h4v1h-4zM6 3h4v1h-4zM4 4h8v1h-8zM4 5h8v1h-8zM3 6h3v1h-3zM10 6h3v1h-3zM3 7h2v1h-2zM11 7h2v1h-2zM2 8h2v1h-2zM12 8h2v1h-2zM2 9h2v1h-2zM12 9h2v1h-2zM2 10h2v1h-2zM12 10h2v1h-2zM2 11h2v1h-2zM12 11h2v1h-2zM2 12h3v1h-3zM11 12h3v1h-3zM3 13h10v1h-10zM5 14h6v1h-6z"/>',
  all:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M2 2h12v1h-12zM2 3h12v1h-12zM2 4h2v1h-2zM6 4h4v1h-4zM12 4h2v1h-2zM2 5h2v1h-2zM6 5h4v1h-4zM12 5h2v1h-2zM2 6h12v1h-12zM2 7h12v1h-12zM2 8h12v1h-12zM2 9h12v1h-12zM2 10h2v1h-2zM6 10h4v1h-4zM12 10h2v1h-2zM2 11h2v1h-2zM6 11h4v1h-4zM12 11h2v1h-2zM2 12h12v1h-12zM2 13h12v1h-12z"/>',
  bucheron:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M3 4h10v1h-10zM2 5h12v1h-12zM2 6h2v1h-2zM5 6h2v1h-2zM12 6h2v1h-2zM2 7h2v1h-2zM6 7h2v1h-2zM12 7h2v1h-2zM2 8h2v1h-2zM6 8h2v1h-2zM12 8h2v1h-2zM2 9h2v1h-2zM5 9h2v1h-2zM12 9h2v1h-2zM2 10h12v1h-12zM3 11h10v1h-10z"/>',
  mineur:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M7 1h2v1h-2zM6 2h4v1h-4zM5 3h6v1h-6zM4 4h3v1h-3zM9 4h3v1h-3zM3 5h3v1h-3zM10 5h3v1h-3zM2 6h12v1h-12zM3 7h10v1h-10zM3 8h3v1h-3zM10 8h3v1h-3zM4 9h2v1h-2zM10 9h2v1h-2zM5 10h2v1h-2zM9 10h2v1h-2zM5 11h6v1h-6zM6 12h4v1h-4zM7 13h2v1h-2zM7 14h2v1h-2z"/>',
  paysan:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M5 2h1v1h-1zM10 2h1v1h-1zM4 3h8v1h-8zM5 4h6v1h-6zM5 5h6v1h-6zM4 6h8v1h-8zM4 7h8v1h-8zM5 8h6v1h-6zM6 9h4v1h-4zM7 10h2v1h-2zM7 11h2v1h-2zM7 12h2v1h-2zM7 13h2v1h-2zM7 14h2v1h-2z"/>'};
const glyph=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${G[k]}</svg>`;
/* Pour utiliser une image : ajoutez img:"images/…" à un objet ou une ressource */
/* Images pixel des objets et ressources (générées, aucune image à fournir) */
const dropKind=n=>/plume|aile/i.test(n)?"feather":/laine|touffe|fourrure|poil|pelage|pompon|queue|flocon|voile/i.test(n)?"fluff":/croc|dent|griffe|corne|piquant|pince|bec|antenne|museau|langue/i.test(n)?"fang":/pétale|fleur|spore|racine|liane|écorce|gland|truffe|chapeau|filament/i.test(n)?"leaf":/poussière|poudre|sable|cendre|grain|souffle|lueur/i.test(n)?"dust":/goutte|bave|larme|sève|essence|magma|vase|motte/i.test(n)?"drop":/œuf|oeuf/i.test(n)?"egg":"gem";
let DROPC=null;
const dropCol=r=>{if(!DROPC){DROPC={};Object.values(MON).forEach(m=>{if(m.boss){if(m.bres)DROPC[m.bres[0]]=m.c}else{DROPC[m.drop[0]]=m.c;(typeof LOOT!=="undefined"&&LOOT[m.id]||[]).forEach(l=>{if(!l.item&&!DROPC[l.id])DROPC[l.id]=m.c})}})}return DROPC[r.id]||ZCOL[r.zone]||"#c9a36a"};
const trMon=it=>it.id.startsWith("tr_")?MON[it.id.slice(3)]:it.id.startsWith("tb_")?MON["boss_"+it.id.slice(3)]:null;
const itIcon=it=>it.img?`<img src="${it.img}" alt="">`:it.set&&SETS[it.set]?`<img class="px" src="${PX.item(it.slot,itCol(it),it)}" alt="">`:it.slot==="trophee"&&trMon(it)?`<img class="px" src="${PX.monster(trMon(it))}" alt="">`:it.slot==="familier"?`<img class="px" src="${it.look?PX.fam(it.id):PX.pet(ZCOL[it.z]||"#f08aa8")}" alt="">`:glyph(it.slot);
const itCol=it=>it.slot==="familier"?"#f08aa8":it.slot==="trophee"?"#f0c35a":(ZONE_STYLE[it.z]&&ZONE_STYLE[it.z].pri)||ZCOL[it.z];
const resIcon=r=>r.img?`<img src="${r.img}" alt="">`:r.kind==="g"?`<img class="px" src="${PX.res(r.prof,r.tier)}" width="16" height="16" alt="">`:r.kind==="d"?`<img class="px" src="${PX.drop(dropKind(r.name),dropCol(r),r.rare||r.boss)}" width="16" height="16" alt="">`:r.kind==="k"?`<img class="px" src="${r.bk?PX.bkey(r.col):PX.key()}" width="16" height="16" alt="">`:r.kind==="p"?`<img class="px" src="${PX.potion(r.col)}" width="16" height="16" alt="">`:glyph(r.kind==="d"?"drop":r.kind==="k"?"cle":r.kind==="p"?"potion":r.prof);
const kindLabel=r=>r.kind==="d"?"Butin de monstre":r.kind==="k"?(r.bk?"Clé de boss":"Clé de donjon"):r.kind==="p"?"Potion":"Ressource · "+PROFS[r.prof].name;
const resCol=r=>r.kind==="d"?ZCOL[r.zone]:r.kind==="k"?(r.bk?r.col:"#f0c35a"):r.kind==="p"?r.col:PCOL[r.prof];
const XP_BASE_GROWTH=1.004,XP_ZONE_GROWTH=1.02,XP_ZONE_START=30,XP_ZONE_SPAN=300;
const xpNeed=l=>{const zone=Math.min(XP_ZONE_SPAN,Math.max(0,l-XP_ZONE_START));return Math.floor(40*Math.pow(l,1.75)*Math.pow(XP_BASE_GROWTH,l)*Math.pow(XP_ZONE_GROWTH,zone)+60*l)};
const PROF_TIME_TARGET=[3600,7200,14400,25200,36000,43200,54000,64800,72000,79200,90000,115200];
const profTierAt=l=>{let t=0;UNLOCK.forEach((u,i)=>{if(l>=u)t=i});return t};
const profRelevance=(l,t)=>Math.max(.02,Math.pow(Math.max(0,1-(l-UNLOCK[t])/25),2));
const profGatherXp=(l,t)=>Math.max(1,Math.round(14*Math.pow(t+1,1.6)*profRelevance(l,t)));
const profGatherTime=(l,t)=>(3+t*1.2)*(1-Math.min(.4,Math.max(0,l-UNLOCK[t])*.01));
const pxNeed=l=>{const t=profTierAt(l),target=PROF_TIME_TARGET[Math.min(PROF_TIME_TARGET.length-1,Math.floor((l-1)/10))]/10;
  return Math.max(1,Math.round(target/profGatherTime(l,t)*profGatherXp(l,t)))};


/* ---------- Codes cadeaux (Options > Sauvegarde > Code cadeau) ----------
   Les codes ne sont PAS écrits ici : chaque clé est l'empreinte (codeHash) du code, pour qu'on ne puisse pas les lire dans le code source.
   Ajouter un code : ouvrir le jeu, console du navigateur (F12), taper codeHash("MONCODE") et copier le résultat comme clé :
   "résultat":{txt:"ce que fait le code", once:true si utilisable une seule fois, go:()=>{ ... }}
   once:true = une seule fois par vie (le compteur repart à zéro à chaque Oméga). Majuscules, espaces et tirets ne comptent pas. go() peut renvoyer un texte affiché au joueur. La liste en clair est dans CLAUDE.md (local). */
const codeHash=s=>{s="vallore:"+String(s||"").toUpperCase().replace(/[\s-]+/g,"");let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return(h2>>>0).toString(36)+(h1>>>0).toString(36)};

const CODES={
  /* code de bienvenue : 1 potion de sagesse (XP) + 1 potion de fortune (prospection) */
  "mtgscjd4hf15":{once:true,txt:"1 Potion de sagesse et 1 Potion de fortune",go:()=>{S.res.p_sagesse=(S.res.p_sagesse||0)+1;S.res.p_fortune=(S.res.p_fortune||0)+1;if(typeof drawPots==="function"){potSig="";drawPots()}}},
};
/* Résultat d'un code : bulle + message sous le champ (Options > Sauvegarde), plus visible que la bulle seule. */
let codeRes=null;
function codeMsg(t,ok){toast(t,1);codeRes={t,ok:!!ok,at:Date.now()};const m=$("codeMsg");if(m){m.textContent=t;m.className="codemsg "+(ok?"ok":"ko");m.hidden=false}}
function useCode(raw){if(!String(raw||"").trim())return;const k=codeHash(raw),c=CODES[k];
  if(!c){codeMsg("Code inconnu.");return}S.codes=S.codes||{};if(c.once&&S.codes[k]){codeMsg("Code déjà utilisé : il sera de nouveau disponible après votre prochaine renaissance Oméga.");return}
  const r=c.go();S.codes[k]=(S.codes[k]||0)+1;log(`Code cadeau : ${r||c.txt}.`,"g");codeMsg(`Code cadeau : ${r||c.txt}`,1);dirty=true;save()}
