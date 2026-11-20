/* Données du jeu (3/4) : métiers, automatismes, Oméga, succès, bestiaire, potions, quêtes, marché, réglages par défaut (OPT_DEF). */
/* Métiers au niveau max : chacun donne +10 % d'XP et +5 000 s de stockage AFK */
const profMaxN=()=>S&&S.jobs?Object.keys(PROFS).filter(k=>S.jobs[k]&&S.jobs[k].lvl>=PROF_MAX).length:0;
/* Amélioration active : achetée dans cette vie, ou rendue permanente avec des éclats Oméga (gardée après chaque renaissance) */
const up=id=>!!(S.up&&S.up[id]||typeof arbKeep==="function"&&arbKeep(id));  /* achats de boutique : de cette vie ou gardés par l'arbre Oméga */
/* Vente automatique : réglage par ressource (on : vendue automatiquement, oui par défaut ; keep : quantité toujours gardée) */
/* « Garder toujours » : 100 par défaut pour chaque ressource (0 si le joueur le choisit) */
const SELL_KEEP_DEF=100;
const sellCfg=k=>(S.sellCfg&&S.sellCfg[k])||{},sellKeep=k=>Math.max(0,sellCfg(k).keep??SELL_KEEP_DEF),sellAuto=k=>sellCfg(k).on!==false;
/* Modes automatiques : [option, amélioration(s) qui le débloquent, nom court]. Chacun a son bouton ON / OFF au-dessus du combat dès qu'il est débloqué. */
const AUTOS=[["autoClick",["auto1","auto2"],"Clic"],["autoFightBoss","bossauto","Boss"],["autoDungeon","dgauto","Donjon"],["autoTower","tourauto","Tour"],["autoZone","zoneauto","Monde"],["autoQuest","qauto","Quêtes"],["autoSellFull","vendeur","Vente"],["autoFortune","fortauto","Fortune"]];
const autoOwned=a=>[].concat(a[1]).some(up);
const allyCost=(i,l)=>Math.round(ALLIES[i][3]*Math.pow(1.1,l)*(CLASSES[S.cls]?.allyCost||1));
const allyMult=()=>(up("allie1")?1.5:1)*(up("allie2")?1.5:1)*(up("allie3")?2:1)*arbAllyMult()*(CLASSES[S.cls]?.allyBonus||1)*(1+(typeof setAllyPct==="function"?setAllyPct():0)/100)*S.buffs.filter(b=>b.k==="ally").reduce((a,b)=>a*b.v,1);
/* Compagnons : dégâts ×2 tous les 25 niveaux, et ×3 aux multiples de 100 (100, 200, 300…) */
const allyDpsOf=(i,l,m=allyMult())=>{if(l<=0)return 0;const p25=Math.floor(l/25),p100=Math.floor(l/100);return ALLIES[i][2]*.4*l*Math.pow(2,p25-p100)*Math.pow(3,p100)*m};
const allyDps=()=>{const m=allyMult();return ALLIES.reduce((a,x,i)=>a+allyDpsOf(i,S.allies[x[0]]||0,m),0)};
const clickMult=()=>(up("gants1")?2:1)*(up("gants2")?3:1);
const comboMax=()=>up("rythme")?150:100;
const inc=(k,n=1)=>{S.st[k]=(S.st[k]||0)+n};
const mx=(k,v)=>{if(v>(S.st[k]||0))S.st[k]=v};
const sellMult=()=>(up("bourse")?1.25:1)*arbSellMult();
const mkOf=k=>(S.mk&&S.mk[k])||1;
const priceOf=k=>Math.max(1,Math.round(RES[k].price*sellMult()*(RES[k].kind==="k"?1:mkOf(k))));
function gainEcus(n){n=Math.round(n*(1+talV("t_avar")/100)*arbEcusMult()*(1+.01*achN()));S.ecus+=n;inc("ecus",n);return n}

/* Renaissance Oméga */
const PREST_LVL=100;
/* Bonus Oméga : chaque passage Oméga donne +10 % d'XP et +10 % d'écus.
   Le niveau du personnage est illimité. */
const omegaN=()=>(S&&S.prest)||0;
const lvlMax=()=>Infinity;
/* Éclats gagnés depuis le début (dépensés ou non) : +12,5 % de dégâts chaque fois que ce total est multipliés par 10.
   Dépenser ne fait donc rien perdre, et le bonus reste raisonnable même avec des milliers de milliards d'éclats. */
const SOUL_PCT=12.5;
const soulBonus=()=>typeof arb==="function"&&arb("coeur")?SOUL_PCT*Math.log10(1+((S&&S.soulsTotal)||0)):0;  /* actif avec le Cœur d'Oméga */
const dimR=r=>r<=10?r:10+Math.log(1+.08*(r-10))/.08;
/* Éclats d'un passage Oméga : 5 × 1,008^(niveau − 30), plus la valeur de chaque boss de zone vaincu dans cette vie (une seule fois chacun).
   La courbe du niveau reste ancrée au niveau 30 même si la renaissance n'ouvre qu'au niveau PREST_LVL.
   Boss : 10 éclats pour le premier, puis ×1,5 par boss jusqu'au 4e ; à partir du 5e, l'écart de niveau entre zones se creuse,
   donc le multiplicateur gagne 0,1 à chaque boss (×1,6, ×1,7… ×2,3 pour le dernier). */
const BOSS_SOULS=(()=>{const a=[];let v=10;for(let i=0;i<BOSSES.length;i++){if(i)v*=i<4?1.5:1.5+.1*(i-3);a.push(Math.round(v))}return a})();
const bossSouls=()=>{let n=0;for(const i in S.bossLife||{})n+=BOSS_SOULS[i]||0;return n};
const OMEGA_GROWTH=1.008;
const soulsGain=()=>S.lvl<PREST_LVL?0:Math.floor((5*Math.pow(OMEGA_GROWTH,S.lvl-30)+bossSouls())*(arb("m11")?1.1:1));
/* Succès : chaque succès donne +1 % de dégâts et +1 % d'écus */
const ROM=["I","II","III","IV","V","VI","VII","VIII","IX","X"];
/* Icônes des succès : une par série (12×12 pixels) */
const AICO={"kill":"M3 0h6v1h-6zM2 1h8v1h-8zM1 2h10v1h-10zM1 3h2v1h-2zM5 3h2v1h-2zM9 3h2v1h-2zM1 4h2v1h-2zM5 4h2v1h-2zM9 4h2v1h-2zM1 5h10v1h-10zM2 6h3v1h-3zM7 6h3v1h-3zM3 7h6v1h-6zM3 8h1v1h-1zM5 8h2v1h-2zM8 8h1v1h-1zM3 9h6v1h-6zM4 10h4v1h-4z","lvl":"M5 0h2v1h-2zM4 1h4v1h-4zM3 2h6v1h-6zM2 3h8v1h-8zM1 4h4v1h-4zM7 4h4v1h-4zM4 5h4v1h-4zM4 6h4v1h-4zM4 7h4v1h-4zM4 8h4v1h-4zM2 9h8v1h-8zM2 10h8v1h-8z","ecu":"M3 1h6v1h-6zM2 2h1v1h-1zM9 2h1v1h-1zM2 3h8v1h-8zM3 4h6v1h-6zM2 5h1v1h-1zM9 5h1v1h-1zM2 6h8v1h-8zM3 7h6v1h-6zM2 8h1v1h-1zM9 8h1v1h-1zM2 9h8v1h-8zM3 10h6v1h-6z","boss":"M0 1h1v1h-1zM5 1h2v1h-2zM11 1h1v1h-1zM0 2h2v1h-2zM4 2h4v1h-4zM10 2h2v1h-2zM0 3h3v1h-3zM4 3h4v1h-4zM9 3h3v1h-3zM0 4h12v1h-12zM0 5h12v1h-12zM0 6h2v1h-2zM3 6h2v1h-2zM7 6h2v1h-2zM10 6h2v1h-2zM0 7h12v1h-12zM0 8h12v1h-12zM1 9h10v1h-10z","dg":"M4 0h4v1h-4zM2 1h8v1h-8zM1 2h3v1h-3zM8 2h3v1h-3zM1 3h2v1h-2zM9 3h2v1h-2zM0 4h2v1h-2zM10 4h2v1h-2zM0 5h2v1h-2zM4 5h4v1h-4zM10 5h2v1h-2zM0 6h2v1h-2zM4 6h1v1h-1zM7 6h1v1h-1zM10 6h2v1h-2zM0 7h2v1h-2zM4 7h1v1h-1zM7 7h1v1h-1zM10 7h2v1h-2zM0 8h2v1h-2zM4 8h1v1h-1zM7 8h1v1h-1zM10 8h2v1h-2zM0 9h2v1h-2zM4 9h4v1h-4zM10 9h2v1h-2zM0 10h12v1h-12zM0 11h12v1h-12z","tour":"M0 0h1v1h-1zM2 0h1v1h-1zM4 0h1v1h-1zM7 0h1v1h-1zM9 0h1v1h-1zM11 0h1v1h-1zM0 1h10v1h-10zM0 2h12v1h-12zM1 3h10v1h-10zM1 4h3v1h-3zM5 4h2v1h-2zM8 4h3v1h-3zM1 5h10v1h-10zM1 6h4v1h-4zM7 6h4v1h-4zM1 7h10v1h-10zM1 8h3v1h-3zM5 8h2v1h-2zM8 8h3v1h-3zM1 9h4v1h-4zM7 9h4v1h-4zM1 10h4v1h-4zM7 10h4v1h-4zM0 11h12v1h-12z","pk":"M5 0h1v1h-1zM5 1h1v1h-1zM4 2h3v1h-3zM0 3h11v1h-11zM1 4h9v1h-9zM2 5h7v1h-7zM2 6h7v1h-7zM1 7h4v1h-4zM6 7h4v1h-4zM1 8h3v1h-3zM7 8h3v1h-3zM1 9h1v1h-1zM9 9h1v1h-1zM10 11h1v1h-1z","craft":"M1 0h7v1h-7zM0 1h9v1h-9zM0 2h9v1h-9zM1 3h7v1h-7zM4 4h2v1h-2zM4 5h2v1h-2zM4 6h2v1h-2zM4 7h2v1h-2zM4 8h2v1h-2zM4 9h2v1h-2zM4 10h2v1h-2zM4 11h2v1h-2z","ench":"M5 0h1v1h-1zM4 1h3v1h-3zM3 2h5v1h-5zM2 3h7v1h-7zM1 4h9v1h-9zM0 5h11v1h-11zM1 6h9v1h-9zM2 7h7v1h-7zM3 8h5v1h-5zM4 9h3v1h-3zM5 10h1v1h-1z","combo":"M6 0h4v1h-4zM5 1h4v1h-4zM4 2h4v1h-4zM3 3h4v1h-4zM2 4h7v1h-7zM1 5h7v1h-7zM4 6h4v1h-4zM3 7h4v1h-4zM2 8h4v1h-4zM1 9h3v1h-3zM1 10h1v1h-1z","click":"M0 0h1v1h-1zM0 1h2v1h-2zM0 2h3v1h-3zM0 3h4v1h-4zM0 4h5v1h-5zM0 5h6v1h-6zM0 6h7v1h-7zM0 7h8v1h-8zM0 8h5v1h-5zM0 9h2v1h-2zM3 9h3v1h-3zM0 10h1v1h-1zM4 10h3v1h-3zM5 11h2v1h-2z","ally":"M0 0h2v1h-2zM0 1h10v1h-10zM0 2h12v1h-12zM0 3h12v1h-12zM0 4h10v1h-10zM0 5h12v1h-12zM0 6h10v1h-10zM0 7h2v1h-2zM0 8h2v1h-2zM0 9h2v1h-2zM0 10h2v1h-2zM0 11h4v1h-4z","job":"M2 0h6v1h-6zM1 1h8v1h-8zM0 2h2v1h-2zM7 2h3v1h-3zM7 3h4v1h-4zM7 4h1v1h-1zM9 4h2v1h-2zM6 5h2v1h-2zM10 5h2v1h-2zM5 6h2v1h-2zM4 7h2v1h-2zM3 8h2v1h-2zM2 9h2v1h-2zM1 10h2v1h-2zM0 11h2v1h-2z","quest":"M1 0h10v1h-10zM0 1h12v1h-12zM0 2h2v1h-2zM10 2h2v1h-2zM1 3h1v1h-1zM3 3h6v1h-6zM10 3h1v1h-1zM1 4h1v1h-1zM10 4h1v1h-1zM1 5h1v1h-1zM3 5h6v1h-6zM10 5h1v1h-1zM1 6h1v1h-1zM10 6h1v1h-1zM1 7h1v1h-1zM3 7h4v1h-4zM10 7h1v1h-1zM1 8h1v1h-1zM10 8h1v1h-1zM0 9h12v1h-12zM1 10h10v1h-10z","pot":"M4 0h4v1h-4zM4 1h4v1h-4zM5 2h2v1h-2zM4 3h1v1h-1zM7 3h1v1h-1zM3 4h1v1h-1zM8 4h1v1h-1zM2 5h1v1h-1zM9 5h1v1h-1zM1 6h10v1h-10zM1 7h10v1h-10zM1 8h10v1h-10zM1 9h10v1h-10zM2 10h8v1h-8z","rar":"M0 1h12v1h-12zM0 2h12v1h-12zM1 3h10v1h-10zM2 4h8v1h-8zM4 5h4v1h-4zM4 6h4v1h-4zM4 7h4v1h-4zM3 8h6v1h-6zM2 9h8v1h-8zM1 10h10v1h-10z","prest":"M3 0h6v1h-6zM1 1h10v1h-10zM0 2h3v1h-3zM9 2h3v1h-3zM0 3h2v1h-2zM10 3h2v1h-2zM0 4h2v1h-2zM10 4h2v1h-2zM0 5h2v1h-2zM10 5h2v1h-2zM0 6h3v1h-3zM9 6h3v1h-3zM1 7h3v1h-3zM8 7h3v1h-3zM2 8h2v1h-2zM8 8h2v1h-2zM2 9h2v1h-2zM8 9h2v1h-2zM0 10h4v1h-4zM8 10h4v1h-4zM0 11h4v1h-4zM8 11h4v1h-4z","best":"M4 0h1v1h-1zM7 0h1v1h-1zM3 1h2v1h-2zM7 1h2v1h-2zM3 2h2v1h-2zM7 2h2v1h-2zM0 3h1v1h-1zM11 3h1v1h-1zM0 4h2v1h-2zM9 4h3v1h-3zM0 5h2v1h-2zM4 5h4v1h-4zM10 5h2v1h-2zM3 6h6v1h-6zM2 7h8v1h-8zM2 8h8v1h-8zM2 9h8v1h-8zM3 10h6v1h-6z"};
const achIcon=k=>`<svg viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" shape-rendering="crispEdges" d="${AICO[k]||AICO.kill}"/></svg>`;
const achKey=a=>a.id.replace(/\d+$/,"");
const ACH=[];
const achSet=(key,name,unit,list,get)=>list.forEach((v,i)=>ACH.push({id:key+i,n:`${name} ${ROM[i]}`,unit,v,get,get txt(){return this.unit(this.v)}}));
achSet("kill","Chasseur",v=>`Vaincre ${fmt(v)} monstres`,[10,100,1e3,1e4,1e5],()=>S.kills);
achSet("lvl","Aventurier",v=>`Atteindre le niveau ${v}`,[10,25,50,75,100,150,200,300,500,1000],()=>Math.max(S.lvl,S.st.maxLvl||0));
achSet("ecu","Fortuné",v=>`Gagner ${fmt(v)} écus au total`,[1e3,1e5,1e6,1e8,1e10],()=>S.st.ecus||0);
achSet("boss","Tueur de boss",v=>`Vaincre ${v} boss`,[1,10,100],()=>S.st.bosses||0);
achSet("dg","Explorateur",v=>`Terminer ${v} donjon${v>1?"s":""}`,[1,10,50],()=>S.st.dungeons||0);
achSet("tour","Grimpeur",v=>`Atteindre l'étage ${v} de la tour`,[10,25,50,100],()=>Math.max(S.tower.best,S.st.tower||0));
achSet("pk","Attrape-tout",v=>`Attraper ${v} objet${v>1?"s":""} cliquable${v>1?"s":""}`,[1,25,100,500],()=>S.pkN||0);
achSet("craft","Artisan",v=>`Fabriquer ${v} objet${v>1?"s":""}`,[1,10,50],()=>S.st.crafts||0);
achSet("ench","Enchanteur",v=>`Enchanter un objet à +${v}`,[3,6,10],()=>S.st.enchMax||0);
achSet("combo","Virtuose",v=>`Faire un combo de ${v}`,[25,50,100,150],()=>S.st.maxCombo||0);
achSet("click","Cliqueur",v=>`Cliquer ${fmt(v)} fois`,[100,1e3,1e4],()=>S.st.clicks||0);
achSet("ally","Meneur",v=>`Cumuler ${v} niveaux de compagnons`,[10,100,500,1000],()=>Object.values(S.allies).reduce((a,b)=>a+b,0));
achSet("job","Travailleur",v=>`Monter un métier au niveau ${v}`,[10,30,60],()=>Math.max(...Object.values(S.jobs).map(j=>j.lvl)));
achSet("quest","Serviable",v=>`Terminer ${v} quête${v>1?"s":""}`,[1,10,50,200],()=>S.st.quests||0);
achSet("pot","Alchimiste",v=>`Préparer ${v} potion${v>1?"s":""}`,[1,25,100],()=>S.st.brews||0);
achSet("rar","Maître forgeron",v=>`Forger un objet ${RAR[v].n.toLowerCase()}`,[1,2,3],()=>S.st.bestRar||0);
achSet("peche","Poissonnédia",v=>`Découvrir ${v} espèce${v>1?"s":""} de poissons`,[1,5,12,20,28],()=>fishN());
achSet("prest","Phénix",v=>`Atteindre le niveau Oméga ${v}`,[1,3,10,25,50],()=>S.prest||0);
achSet("best","Naturaliste",v=>`Atteindre le palier 2 du bestiaire pour ${v} créatures`,[6,18],()=>Object.keys(MON).filter(id=>bestTier(id)>=2).length);
const achN=()=>S.ach?Object.keys(S.ach).length:0;
/* Bestiaire : paliers de victoires par créature (+5 % de dégâts et +10 % de butin contre elle par palier) */
const BEST_T=[10,100,1000,10000];
const bestTier=id=>BEST_T.filter(t=>(S.best[id]||0)>=t).length;

/* Potions (Atelier › Alchimie) : [id, nom, effet, recette, effet technique, couleur] — l'herbe la plus rare fixe le niveau d'Herboriste requis */
const POTIONS=[
  ["p_soin","Potion de soin","Rend 50 % des PV",[["ortie",3],["spore",2]],{heal:.5},"#e8675a"],
  ["p_force","Élixir de force","Dégâts ×1,5 pendant 60 s",[["sauge",3],["plume",2]],{k:"dmg",v:1.5,d:60},"#f0a35a"],
  ["p_celer","Élixir de célérité","Vitesse ×1,5 pendant 60 s",[["menthe",3],["queue",2]],{k:"spd",v:1.5,d:60},"#8fd6b4"],
  ["p_sagesse","Potion de sagesse","XP ×1,5 pendant 120 s",[["melisse",3],["petale",2]],{k:"xp",v:1.5,d:120},"#a99ee0"],
  ["p_fortune","Potion de fortune","Prospection ×2 pendant 120 s",[["edelweiss",3],["geode",2]],{k:"pros",v:2,d:120},"#6bb8e8"],
  ["p_gsoin","Grande potion de soin","Rend tous les PV",[["mandragore",2],["givre",1]],{heal:1},"#ff8ab0"],
];
POTIONS.forEach(([id,name,txt,recipe,fx,col],i)=>RES[id]={id,name,kind:"p",txt,recipe,fx,col,tier:i,price:8+i*10,plvl:UNLOCK[i]});
/* Quêtes du jour */
const Q_TYPES=["kill","killEl","gather","boss","pickup","craft","sell"];
/* Marché : chaque prix varie entre ×0,5 et ×2 toutes les 60 s ; vendre en masse fait baisser le cours */
const MK_MIN=.5,MK_MAX=2,MK_STEP=60,MK_SELL=.002;

/* Réglages par défaut (onglet Options) */
/* Réglages : complète et répare les valeurs absentes ou invalides (ex. NaN) */
function fixOpts(o){o=Object.assign({},OPT_DEF,o||{});for(const k in OPT_DEF){const d=OPT_DEF[k];if(typeof d==="number"){const v=o[k]==null||o[k]===""?NaN:+o[k];o[k]=Number.isFinite(v)?v:d}else if(typeof d==="boolean"&&typeof o[k]!=="boolean")o[k]=d;else if(typeof d==="string"&&typeof o[k]!=="string")o[k]=d}return o}
const OPT_DEF={
  sfx:true,music:false,vol:.5,volSfx:.8,volMusic:.5,hitSfx:true,
  textSize:100,reduceMotion:false,dmgNums:"all",weatherFx:true,shake:true,logLines:8,numFmt:"short",showHint:true,
  potThreshold:30,autoSellFull:false,koRetreat:false,autoFightBoss:true,autoDungeon:true,autoTower:false,autoQuest:true,autoZone:true,autoFortune:true,autoClick:true,pauseHidden:false,confirmPrest:true,forgeQte:true,tips:true,goals:true,goalsOpen:true,goalsN:4,forgeSpeed:1,
  toasts:"all",logKills:true,logLoot:true,logQuests:true,
  keys:true,saveEvery:10,offline:true,showArmor:true,theme:"parchemin",fps:60};
