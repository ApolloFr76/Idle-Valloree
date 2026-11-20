/* Données du jeu (2/4) : registres (RES, ITEMS, MON), poissons, butins, panoplies, boss et clés, compagnons, boutique, apparence des armures. */
/* ================= Registres dérivés ================= */
const RES={}, ITEMS={}, MON={};
Object.entries(PROFS).forEach(([pid,p])=>p.res.forEach(([id,name],t)=>RES[id]={id,name,kind:"g",prof:pid,tier:t,price:1+t*3}));
/* ---------- Poissons : communs (récolte du Pêcheur), rares et légendaires (seulement au mini-jeu de pêche) ----------
   Chaque poisson se mange pour un boost temporaire (S.buffs). Le Poissonnédia compte les espèces attrapées (+1 % d'XP chacune). */
const FISH_RARE=[["pr_brochet","Brochet clochette"],["pr_saumon","Saumon de mousse"],["pr_esturgeon","Esturgeon glouglou"],["pr_lampe","Poisson-lampe cuivré"],["pr_merou","Mérou des mirages"],["pr_omble","Omble polaire"],["pr_raie","Raie-tonnerre"],["pr_arapaima","Arapaïma lianeux"],["pr_lune","Poisson-lune corail"],["pr_dragon","Poisson-dragon de lave"],["pr_koi","Koï astrale"],["pr_baudroie","Baudroie du néant"]];
const FISH_LEG=[[2,"pl_roi","Roi Glouglou"],[5,"pl_leviathan","Léviathan de givre"],[8,"pl_kraken","Kraken de corail"],[11,"pl_coela","Cœlacanthe du néant"]];
const FISH_COL=["#c8b08a","#8fb06a","#6fa35a","#b0643a","#e2b66a","#8fc7e0","#f2d94a","#5fae4a","#e8684a","#f0622c","#a8e8e0","#5a4fa8"];
const FISH_K=[["xp","d'XP"],["pros","de prospection"],["dmg","de dégâts"],["spd","de vitesse d'attaque"],["crit","de critique"],["def","de dégâts subis"]];
const FISH_V={xp:[.1,.25,.6],pros:[.15,.35,.8],dmg:[.1,.25,.5],spd:[.08,.18,.35],crit:[5,12,25],def:[.1,.2,.4]};
const FISH=[];
PROFS.pecheur.res.forEach(([id],t)=>FISH.push({id,t,rk:0}));
FISH_RARE.forEach(([id,name],t)=>{RES[id]={id,name,kind:"g",prof:"pecheur",tier:t,price:6+t*12,rare:1};FISH.push({id,t,rk:1})});
FISH_LEG.forEach(([t,id,name])=>{RES[id]={id,name,kind:"g",prof:"pecheur",tier:t,price:60+t*60,rare:2};FISH.push({id,t,rk:2})});
/* Poisson mythique : 1 seule espèce, ultra rare (≈ 0,3 % des prises au mini-jeu), donne TOUS les boosts à la fois */
RES.pm_prisma={id:"pm_prisma",name:"Prismaride, l'Arc-en-ciel",kind:"g",prof:"pecheur",tier:11,price:5000,rare:3};
FISH.forEach((f,i)=>{if(f.rk===3)return;const r=RES[f.id],[k,lbl]=FISH_K[(f.t+f.rk*2)%6],b=FISH_V[k][f.rk]*(1+f.t/11),d=[120,300,600][f.rk];
  f.k=k;f.d=d;f.v=k==="crit"?Math.round(b):k==="def"?+(1-Math.min(.6,b)).toFixed(2):+(1+b).toFixed(2);f.col=FISH_COL[f.t];f.cm=[18,40,120][f.rk]*(1+f.t/8);
  f.txt=k==="crit"?`+${f.v} % ${lbl}`:k==="def"?`−${Math.round((1-f.v)*100)} % ${lbl}`:`+${Math.round((f.v-1)*100)} % ${lbl}`;
  r.fish=f;Object.defineProperty(r,"img",{get(){return PX.fish(f.col,f.rk,f.t)},configurable:true})});
{const f={id:"pm_prisma",t:11,rk:3,col:"#ff8ab0",cm:300,d:900,all:FISH_K.map(([k])=>{const b=FISH_V[k][2]*1.5;return{k,v:k==="crit"?Math.round(b):k==="def"?+(1-Math.min(.7,b)).toFixed(2):+(1+b).toFixed(2)}})};
  f.k="all";f.txt="TOUS les boosts à la fois (+90 % d'XP, +120 % de prospection, +75 % de dégâts, +53 % de vitesse, +38 % de critique, −60 % de dégâts subis)";
  FISH.push(f);RES.pm_prisma.fish=f;Object.defineProperty(RES.pm_prisma,"img",{get(){return PX.fish(f.col,3,11)},configurable:true})}
const FISHBY={};FISH.forEach(f=>FISHBY[f.id]=f);
const fdex=()=>S.fdex||(S.fdex={});
const fishN=()=>Object.keys(fdex()).length;
ZONES.forEach((z,zi)=>{z.i=zi;z.mons.forEach(m=>{m.zone=zi;MON[m.id]=m;RES[m.drop[0]]={id:m.drop[0],name:m.drop[1],kind:"d",zone:zi,price:3+zi*5}});});
/* Tables de butin : [ressource secondaire, chance], [ressource rare, chance] — le butin principal tombe à 70 % */
const LOOT_MAIN=.7;
const LOOT_X={
  pompon:[["pompon_doux","Pompon doux",.35],["coeur_nuage","Cœur de nuage",.05]],
  picoreau:[["bec_picoreau","Bec de Picoreau",.3],["oeuf_dore","Œuf doré",.03]],
  champignard:[["chapeau_tache","Chapeau tacheté",.4],["truffe_lum","Truffe lumineuse",.05]],
  ecorcin:[["seve_ambree","Sève ambrée",.3],["gland_ancien","Gland ancien",.05]],
  lucioleux:[["aile_transl","Aile translucide",.25],["lanterne_viv","Lanterne vivante",.02]],
  renardine:[["croc_renard","Croc de renardine",.35],["pelage_flamme","Pelage de flamme",.05]],
  crapoteux:[["langue_coll","Langue collante",.4],["perle_marais","Perle de marais",.03]],
  vasard:[["corne_vase","Corne de vase",.3],["fossile_visq","Fossile visqueux",.05]],
  nenuphage:[["racine_eau","Racine d'eau",.25],["fleur_lune","Fleur de lune",.02]],
  taupineur:[["museau_rose","Museau rose",.35],["pepite_brute","Pépite brute",.05]],
  geodin:[["poudre_crist","Poudre de cristal",.3],["geode_parf","Géode parfaite",.01]],
  rouillard:[["boulon_tordu","Boulon tordu",.4],["rouage_ant","Rouage antique",.04]],
  scaraboule:[["antenne_iris","Antenne irisée",.3],["scarabee_or","Scarabée d'or",.02]],
  sablin:[["grain_chant","Grain chantant",.35],["sablier_fige","Sablier figé",.05]],
  mirageon:[["reflet_capt","Reflet captif",.25],["plume_illus","Plume d'illusion",.03]],
  yetinou:[["griffe_glac","Griffe glacée",.35],["cristal_aval","Cristal d'avalanche",.04]],
  stalagor:[["pointe_glace","Pointe de glace",.3],["coeur_polaire","Cœur polaire",.02]],
  blizzaron:[["plume_givree","Plume givrée",.25],["oeil_tempete","Œil de tempête",.01]]};
const LOOT={};
ZONES.forEach((z,zi)=>z.mons.forEach(m=>{const x=LOOT_X[m.id]||[];LOOT[m.id]=[{id:m.drop[0],n:m.drop[1],p:LOOT_MAIN}];
  x.forEach(([id,n,pr],j)=>{RES[id]={id,name:n,kind:"d",zone:zi,price:j?40*(zi+1):6+zi*8,rare:j===1};LOOT[m.id].push({id,n,p:pr})});
  LOOT[m.id].push({id:"tr_"+m.id,n:"Trophée : "+m.name,p:.01,item:true})}));
const rareLbl=p=>p>=.6?"Commun":p>=.2?"Peu commun":p>=.05?"Rare":"Très rare";
const seen=id=>!!(S&&S.seen&&S.seen[id]);
function lootChance(monId,p){const st=stats();return p*st.pros*(1+.1*bestTier(monId))*(evOn("brume")?2:1)}
function lootHTML(monId){const L=LOOT[monId];if(!L){const d=MON[monId];if(!d||!d.boss)return"";
    return`<div class="tt">Butin du boss :</div><div class="lrow"><span>${seen(d.drop[0])?d.drop[1]:"???"}</span><b>100 %</b></div><div class="lrow"><span>${seen(d.bres[0])?d.bres[1]:"???"}</span><b>100 %</b></div><div class="lrow"><span>${seen("tb_"+d.zone)?ITEMS["tb_"+d.zone].name:"???"}</span><b>25 %</b></div>`}
  return`<div class="tt">Butin (avec votre prospection) :</div>`+L.map(l=>{const c=Math.min(100,lootChance(monId,l.p)*100),k=seen(l.id);return`<div class="lrow${l.p<.06?" lr":""}"><span>${k?l.n:"???"} <i class="tt">${rareLbl(l.p)}</i></span><b class="num">${c>=10?Math.round(c):c.toFixed(1).replace(".",",")} %</b></div>`}).join("")}
const budget=z=>10+z*z*7+z*14;
/* Puissance d'un objet selon son niveau : plus le niveau requis est haut, plus les statistiques montent (accélère au-delà du niveau 20) */
const lvlBudget=l=>Math.round(6+l*2.6+Math.pow(l,1.75)*.12);
const lvlCrit=l=>1+Math.floor(l/12);
/* Bonus de panoplie :
   - Panoplies de classe (8 pièces) : paliers à 2, 4, 6 et 8 pièces + un bonus signature de classe à 4 pièces actif uniquement pour cette classe.
   - Panoplies de boss (4 pièces : cape, ceinture, amulette, anneau) : rentables pour toutes les classes ; combinées à 4 pièces de classe, elles forment le meilleur équipement de chaque zone. */
const CLS_KEYS=["guerrier","archer","mage","gardien","peste","chrono","berserk","invoc"];
const VIS_SLOTS=["coiffe","cape","arme","bouclier","ceinture","bottes"];
const BOSS_SLOTS=["cape","ceinture","amulette","anneau"];
const ZONE_STYLE=[
  {pri:"#76a852",sec:"#e8d8b2",met:"#9a8a78",acc:"#f2c94e",tier:0,motif:"leaf"},
  {pri:"#3e7256",sec:"#8c6a44",met:"#b8925a",acc:"#c6f068",tier:0,motif:"vine"},
  {pri:"#3b7d6e",sec:"#53604a",met:"#708a7e",acc:"#9ef55a",tier:1,motif:"fang"},
  {pri:"#b46438",sec:"#4f4868",met:"#d49b66",acc:"#c8a0ff",tier:1,motif:"rivet"},
  {pri:"#d49b3c",sec:"#6b4426",met:"#f5d272",acc:"#ff5e7e",tier:2,motif:"sun"},
  {pri:"#5a9ec8",sec:"#e8f4fa",met:"#b6dcf4",acc:"#7cf6ff",tier:2,motif:"frost"},
  {pri:"#4c638c",sec:"#c9d6e8",met:"#88a2c8",acc:"#ffe44a",tier:3,motif:"storm",aura:["#6ea8ff","#ffe85c"]},
  {pri:"#27884a",sec:"#7a3b2a",met:"#c99a3c",acc:"#58ff8a",tier:3,motif:"jungle",aura:["#2ad468","#c8ff5a"]},
  {pri:"#258ca8",sec:"#e86058",met:"#f0d8ea",acc:"#52f5ff",tier:3,motif:"coral",aura:["#3ae8ff","#ff7ca8"]},
  {pri:"#362226",sec:"#c93418",met:"#5a4448",acc:"#ff9a2e",tier:4,motif:"magma",aura:["#ff4818","#ffd04a"]},
  {pri:"#4b427a",sec:"#d8e4ff",met:"#f0c258",acc:"#7cf7ea",tier:4,motif:"astral",aura:["#8f7cff","#9cfaf0"]},
  {pri:"#241840",sec:"#6f2ab8",met:"#3e2c64",acc:"#d84aff",tier:4,motif:"void",aura:["#8b2cf5","#e02860"]},
];
const CLS_GEAR={
  guerrier:{set:"du Champion",el:"terre",names:{coiffe:"Heaume",cape:"Manteau de guerre",amulette:"Médaillon",anneau:"Chevalière",bottes:"Solerets",arme:"Épée",ceinture:"Ceinturon",bouclier:"Écu"},
    st:{coiffe:{vit:.7,terre:.35},cape:{vit:.5,puissance:.45},amulette:{terre:.6,vit:.4},anneau:{puissance:.65,crit:1},bottes:{vit:.5,agi:.45},arme:{dmg:.32,terre:.55},ceinture:{vit:.6,puissance:.4},bouclier:{vit:.75,terre:.3}},
    clsBonus:z=>({pctDmg:Math.round(16*(1+z/4)),pctDef:Math.min(20,6+z)})},
  archer:{set:"du Traqueur",el:"air",names:{coiffe:"Capuche de chasse",cape:"Cape sylvestre",amulette:"Pendentif d'aigle",anneau:"Bague de visée",bottes:"Bottes agiles",arme:"Arc",ceinture:"Carquois-ceinture",bouclier:"Brassard"},
    st:{coiffe:{agi:.65,air:.35},cape:{agi:.6,prospection:.4},amulette:{air:.55,agi:.45},anneau:{agi:.5,crit:1.35},bottes:{agi:.75,prospection:.35},arme:{dmg:.27,air:.55,agi:.25},ceinture:{agi:.55,puissance:.35},bouclier:{agi:.65,vit:.35}},
    clsBonus:z=>({pctSpd:Math.round(14*(1+z/4)),crit:5+Math.floor(z*1.1)})},
  mage:{set:"de l'Arcaniste",el:"feu",names:{coiffe:"Chapeau arcanique",cape:"Robe étoilée",amulette:"Amulette runique",anneau:"Anneau astral",bottes:"Chausses arcaniques",arme:"Bâton",ceinture:"Écharpe runique",bouclier:"Orbe arcanique"},
    st:{coiffe:{sagesse:.65,feu:.4},cape:{sagesse:.55,vit:.4},amulette:{feu:.65,sagesse:.45},anneau:{feu:.6,crit:1.1},bottes:{sagesse:.55,agi:.4},arme:{dmg:.28,feu:.65},ceinture:{sagesse:.5,puissance:.45},bouclier:{sagesse:.6,feu:.45}},
    clsBonus:z=>({pctSpell:Math.round(25*(1+z/4)),pctCdr:Math.min(22,8+z)})},
  gardien:{set:"du Bastion",el:"eau",names:{coiffe:"Grand heaume",cape:"Manteau sacré",amulette:"Reliquaire",anneau:"Sceau protecteur",bottes:"Grèves lourdes",arme:"Marteau",ceinture:"Ceinture de plaque",bouclier:"Pavois"},
    st:{coiffe:{vit:.85,sagesse:.3},cape:{vit:.7,eau:.35},amulette:{vit:.6,eau:.5},anneau:{vit:.55,puissance:.45,crit:.8},bottes:{vit:.75,prospection:.3},arme:{dmg:.26,eau:.5,vit:.35},ceinture:{vit:.8,puissance:.3},bouclier:{vit:1.05,eau:.35}},
    clsBonus:z=>({pctHp:Math.round(20*(1+z/4)),pctDef:Math.min(28,10+z)})},
  peste:{set:"du Druide",el:"air",names:{coiffe:"Couronne de ramures",cape:"Cape de ronces",amulette:"Talisman toxique",anneau:"Anneau de venin",bottes:"Bottes de mousse",arme:"Sceptre vénéneux",ceinture:"Lien de lianes",bouclier:"Fiole-totem"},
    st:{coiffe:{sagesse:.55,poison:.5},cape:{vit:.45,poison:.55},amulette:{air:.5,poison:.6},anneau:{puissance:.5,poison:.55,crit:.9},bottes:{agi:.5,poison:.45},arme:{dmg:.22,air:.5,poison:.75},ceinture:{vit:.45,sagesse:.45,poison:.4},bouclier:{sagesse:.5,vit:.45,poison:.5}},
    clsBonus:z=>({pctDot:Math.round(28*(1+z/4)),poison:Math.round(18*(budget(z)/budget(0)))})},
  chrono:{set:"du Chronomancien",el:"eau",names:{coiffe:"Diadème du temps",cape:"Manteau temporel",amulette:"Sablier pendu",anneau:"Anneau cadran",bottes:"Bottes de hâte",arme:"Sceptre-horloge",ceinture:"Ceinture astrolabe",bouclier:"Cadran céleste"},
    st:{coiffe:{sagesse:.7,eau:.35},cape:{sagesse:.6,agi:.45},amulette:{eau:.55,sagesse:.6},anneau:{sagesse:.5,agi:.45,crit:1},bottes:{agi:.65,sagesse:.45},arme:{dmg:.26,eau:.55,sagesse:.35},ceinture:{sagesse:.6,puissance:.35},bouclier:{sagesse:.65,eau:.4}},
    clsBonus:z=>({pctCdr:Math.min(26,10+z),pctSpd:Math.round(12*(1+z/4))})},
  berserk:{set:"du Berserker",el:"terre",names:{coiffe:"Casque à cornes",cape:"Fourrure de bête",amulette:"Collier de crocs",anneau:"Anneau de fureur",bottes:"Bottes de guerre",arme:"Hache viking",ceinture:"Ceinture à crâne",bouclier:"Targe cloutée"},
    st:{coiffe:{vit:.75,saignement:.4},cape:{vit:.65,puissance:.45},amulette:{terre:.6,vit:.45},anneau:{puissance:.7,crit:1.15},bottes:{vit:.55,agi:.5},arme:{dmg:.34,terre:.55,saignement:.45},ceinture:{vit:.65,puissance:.45},bouclier:{vit:.6,puissance:.45,saignement:.35}},
    clsBonus:z=>({pctDmg:Math.round(18*(1+z/4)),pctLeech:Math.min(6,+(1.5+z*.3).toFixed(1))})},
  invoc:{set:"de l'Invocateur",el:"feu",names:{coiffe:"Capuche rituelle",cape:"Robe d'ombre",amulette:"Sceau d'esprit",anneau:"Anneau de pacte",bottes:"Chaussons spectraux",arme:"Bâton d'âme",ceinture:"Cordon rituel",bouclier:"Grimoire lié"},
    st:{coiffe:{sagesse:.65,vit:.4},cape:{sagesse:.6,puissance:.4},amulette:{sagesse:.6,feu:.45},anneau:{sagesse:.55,puissance:.5,crit:.9},bottes:{sagesse:.55,prospection:.45},arme:{dmg:.22,sagesse:.65,feu:.45},ceinture:{sagesse:.6,vit:.45},bouclier:{sagesse:.7,puissance:.45}},
    clsBonus:z=>({pctAlly:Math.round(35*(1+z/4)),sagesse:Math.round(10*(budget(z)/budget(0)))})},
};
const BOSS_GEAR={
  names:{cape:"Cape souveraine",ceinture:"Ceinture souveraine",amulette:"Amulette souveraine",anneau:"Anneau souverain"},
  st:{cape:{puissance:.65,vit:.6,agi:.45},ceinture:{puissance:.65,vit:.6,sagesse:.45},amulette:{puissance:.75,sagesse:.55,prospection:.45},anneau:{puissance:.75,agi:.45,crit:1.4}},
};
const SETS={};
const SETB_C={},SETB=key=>SETB_C[key]||(SETB_C[key]=SETB0(key));
function SETB0(key){
  const t=SETS[key],z=t.z,f=budget(z)/budget(0),p=1+z/4,rd=o=>{const r={};for(const k in o)r[k]=k==="pctLeech"?+o[k].toFixed(1):Math.round(o[k]);return r};
  if(t.boss)return{
    2:rd({puissance:10*f,vit:10*f,pctXp:8*p}),
    3:rd({puissance:12*f,crit:3+z,prospection:12*f,pctEcus:12*p}),
    4:rd({puissance:18*f,vit:16*f,crit:3+z,pctDmg:20*p,pctSpd:8*p,pctSpell:15*p,pctDot:15*p,pctAlly:20*p})
  };
  return{
    2:rd({vit:7*f,puissance:4*f}),
    4:rd({puissance:8*f,crit:2+Math.floor(z*.8),pctDmg:10*p}),
    6:rd({vit:8*f,sagesse:6*f,pctXp:6*p}),
    8:rd({puissance:10*f,vit:10*f,pctDmg:8*p,pctEcus:10*p})
  };
}
const setSteps=key=>SETS[key].steps||(SETS[key].steps=Object.keys(SETB(key)).map(Number));
const setClsBonus=key=>{const t=SETS[key];if(!t||t.boss||!t.cls||!CLS_GEAR[t.cls])return null;return t._cb||(t._cb=CLS_GEAR[t.cls].clsBonus(t.z))};
const setClsActive=(key,cls)=>{const t=SETS[key];return!!(t&&t.cls&&(cls||(typeof S!=="undefined"&&S&&S.cls))===t.cls)};
function setTotal(key,n,cls){
  const b=SETB(key),o={},add=src=>{for(const x in src)o[x]=(o[x]||0)+src[x]};
  setSteps(key).filter(k=>k<=n).forEach(k=>add(b[k]));
  if(n>=4&&setClsActive(key,cls)){const cb=setClsBonus(key);if(cb)add(cb)}
  return o;
}
function setAllyPct(){
  if(typeof setCounts!=="function"||!S||!S.cls)return 0;
  const sc=setCounts();let p=0;
  for(const k in sc){const tot=setTotal(k,sc[k],S.cls);if(tot.pctAlly)p+=tot.pctAlly}
  return p;
}
function setBox(key,n,compact){
  const T=SETS[key],b=SETB(key),N=T.n,ST=setSteps(key),c=Math.min(N,n||0),nx=ST.find(k=>k>c),cb=setClsBonus(key),act=setClsActive(key);
  const tag=T.boss?`<span class="bosstag">Boss · toutes classes</span>`:`<span class="clstag${act?" on":""}">${CLASSES[T.cls].name}</span>`;
  const cbRow=cb?`<div class="small clsb ${c>=4&&act?"on":act?"":"off"}">${c>=4&&act?"★":"☆"} Bonus ${CLASSES[T.cls].name} (4 pièces) : <b>${statsTxt(cb)}</b>${act?"":` <i>(actif uniquement en ${CLASSES[T.cls].name})</i>`}</div>`:"";
  return`<div class="setb"><div class="seth"><b>Panoplie ${T.name}</b> ${tag} · <span class="num">${c}/${N}</span> pièce${c>1?"s":""}</div><div class="setpips">${Array.from({length:N},(_,i)=>i+1).map(i=>`<i class="${i<=c?"on":""}${ST.includes(i)?" t":""}"></i>`).join("")}</div>
  <div>Total actif : <b style="color:var(--xp)">${statsTxt(setTotal(key,c))||"aucun"}</b></div>${cbRow}${nx?`<div class="small">Prochain palier (${nx} pièces) : <b>${statsTxt(b[nx])}</b></div>`:`<div class="small"><b style="color:var(--gold)">Panoplie complète !</b></div>`}
  ${compact?"":`<div class="small" style="margin-top:4px">${ST.map(k=>`<span class="${c>=k?"":"off"}">${c>=k?"✓":"·"} ${k} pièces : ${statsTxt(b[k])}</span>`).join("<br>")}</div>`}</div>`}

/* Boss de zone et donjons */
/* Boss : [nom, monstre de base, couleur, [id, nom] de la ressource de boss] */
const BOSSES=[["Roi Pompon",0,"#fff1c8",["b_laine","Laine royale"]],["Vieux Grogne-Écorce",0,"#6d5236",["b_seve","Sève ancienne"]],["Reine Crapaude",0,"#4f8a3c",["b_perle","Perle de la Reine"]],["Golem de Cuivre",2,"#c27a3a",["b_rouage","Rouage de cuivre"]],["Scarabée-Soleil",0,"#e0a83a",["b_carapace","Carapace solaire"]],["Yéti Ancien",0,"#f4fbff",["b_croc","Croc de givre"]],
  ["Aigle-Tonnerre",0,"#ffe98a",["b_plume","Plume-tonnerre"]],["Grande Dévoreuse",2,"#b93fd0",["b_dent","Dent de la Dévoreuse"]],["Crabe-Roi Nacré",0,"#f4d9e8",["b_nacre","Nacre royale"]],["Titan des Braises",2,"#d8481c",["b_braise","Cœur de braise"]],["Gardien Stellaire",2,"#8ad0ff",["b_astre","Éclat stellaire"]],["Seigneur du Néant",0,"#2e2450",["b_vide","Fragment du vide"]]];
const DUNGEONS=["Terrier des Clochettes","Cœur de Mousselune","Grotte Glouglou","Forge oubliée","Tombeau ambré","Citadelle de givre","Nid des Tempêtes","Temple englouti","Abysses chantantes","Cratère ardent","Observatoire brisé","Trône du vide"];
const BOSS_KILLS=10,BOSS_TIME=30,TOWER_TIME=25,DG_WAVES=5;
ZONES.forEach((z,zi)=>{const [bn,bi,bc,br]=BOSSES[zi],base=z.mons[bi];
  MON["boss_"+zi]={...base,id:"boss_"+zi,name:bn,c:bc,el:z.el,ft:base.ft==="none"?"horns":base.ft,crown:true,boss:true,zone:zi,drop:["cle_"+zi,"Clé : "+DUNGEONS[zi]],bres:br};
  RES["cle_"+zi]={id:"cle_"+zi,name:"Clé : "+DUNGEONS[zi],kind:"k",zone:zi,price:30*(zi+1)};
  RES[br[0]]={id:br[0],name:br[1],kind:"d",zone:zi,boss:true,price:25+zi*20};});
/* Clés de boss : pour défier le boss d'une zone il faut 10 victoires ET une clé de boss (utilisée au début du combat).
   La clé se fabrique (butins des 3 monstres de base de la zone + métal du mineur) ou tombe très rarement (0,001 %) sur n'importe quel monstre de la zone. */
const BKEY_DROP=1e-5;
ZONES.forEach((z,zi)=>{const b=MON["boss_"+zi],dr=z.mons.filter(m=>!m.extra).slice(0,3).map(m=>m.drop[0]);
  RES["bkey_"+zi]={id:"bkey_"+zi,name:"Clé de boss : "+b.name,kind:"k",bk:true,zone:zi,col:b.c,price:50*(zi+1),recipe:[...dr.map(d=>[d,5+3*zi]),[PROFS.mineur.res[zi][0],10+5*zi]]}});
const bkeyN=zi=>S.res["bkey_"+zi]||0,bossReady=zi=>(S.zk[zi]||0)>=BOSS_KILLS&&bkeyN(zi)>0,bkeyCan=zi=>RES["bkey_"+zi].recipe.every(([x,q])=>(S.res[x]||0)>=q);
function craftBkey(zi){const r=RES["bkey_"+zi];if(!r)return;if(!bkeyCan(zi)){toast("Il manque des ressources pour fabriquer cette clé",1);return}
  r.recipe.forEach(([x,q])=>S.res[x]-=q);S.res[r.id]=(S.res[r.id]||0)+1;S.seen[r.id]=1;sfx("coin");log(`Vous fabriquez : ${r.name}.`,"g");toast(`${r.name} fabriquée`,1);dirty=true}
/* Fenêtre de fabrication d'une clé de boss : ingrédients, stock et bouton Fabriquer */
let bkeyPop=null;
function bkeyDraw(){const zi=bkeyPop;if(zi==null)return;const r=RES["bkey_"+zi],ok=bkeyCan(zi),o=$("ov");o.hidden=false;
  o.innerHTML=`<div class="ovc bkpop"><div class="row" style="justify-content:space-between;align-items:center"><h2>${resIcon(r)} Fabriquer la clé</h2><button class="btn" data-a="bkeyClose" aria-label="Fermer">✕</button></div>
  <p class="muted" style="margin:0">${r.name} · en stock : <b class="num">${bkeyN(zi)}</b></p>
  <div class="bklist">${r.recipe.map(([x,q])=>{const h=S.res[x]||0;return`<div class="bkrow ${h>=q?"ok":"ko"}" data-tip="r:${x}">${resIcon(RES[x])}<span>${RES[x].name}</span><b class="num">${fmt(h)} / ${fmt(q)}</b></div>`}).join("")}</div>
  <p class="small muted" style="margin:0">Butins sur les monstres de ${ZONES[zi].name}, métal avec le métier Mineur. La clé peut aussi tomber (0,001 %) sur n'importe quel monstre de la zone.</p>
  <div class="row" style="justify-content:flex-end;gap:8px"><button class="btn" data-a="bkeyClose">Fermer</button><button class="btn pri" data-a="craftBkey" data-z="${zi}" ${ok?"":"disabled"}>Fabriquer</button></div></div>`}
/* Article devant le nom du boss pour nommer sa panoplie (« du » par défaut) */
const ART={boss_2:"de la ",boss_6:"de l'",boss_7:"de la "};
/* Génération des 108 panoplies : dans chaque zone, 8 panoplies de classe (8 pièces chacune) + 1 panoplie de boss (4 pièces universelles).
   Recettes hybrides : chaque classe utilise 1 monstre principal de la zone + 1 matériau secondaire de la zone en petite quantité + ressource de métier. */
ZONES.forEach((z,zi)=>{
  const span=z.lvl[1]-z.lvl[0],cLvl=z.lvl[0]+Math.round(span*.15),bLvl=z.lvl[0]+Math.round(span*.78);
  const drops=z.mons.slice(0,3).map(m=>m.drop[0]);
  CLS_KEYS.forEach((cls,ci)=>{
    const cg=CLS_GEAR[cls],mMain=z.mons[ci%z.mons.length],key=`c_${zi}_${cls}`;
    const T=SETS[key]={key,name:`${cg.set} ${z.set}`,z:zi,n:8,lvl:cLvl,el:cg.el,cls,boss:false,mon:mMain.id,ids:{}};
    SLOTS.forEach((sl,si)=>{
      const id=`c_${zi}_${cls}_${sl.id}`,stats={},wmap=cg.st[sl.id]||sl.st,mult=1.05;
      Object.entries(wmap).forEach(([k0,w])=>{
        const k=k0==="EL"?cg.el:k0;
        stats[k]=k==="crit"?Math.max(1,Math.round(lvlCrit(cLvl)*w*mult)):Math.max(1,Math.round(lvlBudget(cLvl)*w*mult));
      });
      if(EL_DOT[cg.el]&&!stats[EL_DOT[cg.el]]&&cls!=="invoc")stats[EL_DOT[cg.el]]=Math.max(1,Math.round(lvlBudget(cLvl)*.2*mult));
      const mSec=z.mons[(ci+1+(si%2))%z.mons.length];
      const recipe=[[mMain.drop[0],4+3*zi],[mSec.drop[0],Math.max(1,1+zi)],[PROFS[sl.g].res[zi][0],4+3*zi]];
      T.ids[sl.id]=id;
      ITEMS[id]={id,z:zi,set:key,cls,slot:sl.id,name:`${cg.names[sl.id]} ${z.set}`,stats,recipe,lvl:cLvl,price:Math.round(12*Math.pow(1+cLvl/8,2)*mult)};
    });
  });
  const bm=MON["boss_"+zi],bKey="boss_"+zi,bMult=1.42;
  const TB=SETS[bKey]={key:bKey,name:(ART[bKey]||"du ")+bm.name,z:zi,n:4,lvl:bLvl,el:bm.el,cls:null,boss:true,mon:bKey,ids:{}};
  SLOTS.filter(sl=>BOSS_SLOTS.includes(sl.id)).forEach((sl,si)=>{
    const id=`s_boss_${zi}_${sl.id}`,stats={},wmap=BOSS_GEAR.st[sl.id]||sl.st;
    Object.entries(wmap).forEach(([k,w])=>{
      stats[k]=k==="crit"?Math.max(1,Math.round(lvlCrit(bLvl)*w*bMult)):Math.max(1,Math.round(lvlBudget(bLvl)*w*bMult));
    });
    const recipe=[[bm.bres[0],2],[drops[si%drops.length],3+2*zi],[PROFS[sl.g].res[zi][0],5+3*zi]];
    TB.ids[sl.id]=id;
    ITEMS[id]={id,z:zi,set:bKey,cls:null,boss:true,slot:sl.id,name:`${BOSS_GEAR.names[sl.id]} ${TB.name}`,stats,recipe,lvl:bLvl,price:Math.round(12*Math.pow(1+bLvl/8,2)*bMult)};
  });
});
/* Conversion des anciens identifiants d'objets (sauvegardes antérieures) vers les nouvelles panoplies de classe / boss */
function migrateItemId(id,cls){
  if(!id||ITEMS[id])return id;
  const c=CLASSES[cls]?cls:"guerrier";
  let m=id.match(/^s_boss_(\d+)_([a-z]+)$/);
  if(m){const zi=+m[1],sl=m[2];if(ITEMS[`s_boss_${zi}_${sl}`])return`s_boss_${zi}_${sl}`;if(ITEMS[`c_${zi}_${c}_${sl}`])return`c_${zi}_${c}_${sl}`}
  m=id.match(/^z(\d+)_([a-z]+)$/);
  if(m){const zi=+m[1],sl=m[2];if(ITEMS[`c_${zi}_${c}_${sl}`])return`c_${zi}_${c}_${sl}`}
  m=id.match(/^s_([a-z0-9]+)_([a-z]+)$/);
  if(m){const mon=MON[m[1]],sl=m[2],zi=mon?mon.zone:0;if(ITEMS[`c_${zi}_${c}_${sl}`])return`c_${zi}_${c}_${sl}`}
  return id;
}
/* Compagnons : [id, nom, dégâts/s par niveau, coût de base, couleur] */
const ALLIES=[["ecuyer","Écuyer Bertin",2,50,"#d9a46a"],["chasseuse","Chasseuse Lina",9,400,"#8fd16a"],["rat","Rat pestilent",20,1500,"#8a8478"],["moine","Moine Tao",40,3000,"#f0c35a"],["sorciere","Sorcière Mirabelle",180,25000,"#a99ee0"],
  ["apothicaire","Apothicaire Mortimer",420,8e4,"#4f7a4a"],["golem","Golem de pierre",850,2e5,"#aab6c4"],["dragonnet","Dragonnet Ambre",4000,1.6e6,"#ef7d4a"],["serpent","Serpent d'émeraude",9000,5e6,"#3fae5a"],["phenix","Phénix d'aube",2e4,1.5e7,"#ff8ab0"]];
/* Compagnons qui posent des DoT : [type, charges par seconde] (en plus de leurs dégâts) */
const ALLY_DOT={rat:["poison",1],apothicaire:["poison",2],serpent:["poison",3],sorciere:["gelure",.5],golem:["saignement",.5],dragonnet:["brulure",.5],phenix:["brulure",1]};
/* Boutique d'améliorations */
const UPGS=[
  ["gants1","Gants renforcés","Dégâts de clic ×2",300],["auto1","Clic automatique","2 clics par seconde",3000],["sac1","Sac agrandi","+2 000 s de farm AFK",1500],
  ["outils1","Outils affûtés","Récolte 20 % plus rapide",2000],["aimant","Aimant à trésors","Objets cliquables 30 % plus fréquents",8000],["bourse","Bourse de marchand","Ventes +25 %",12000],
  ["allie1","Entraînement","Compagnons ×1,5",20000],["sablier","Sablier","+10 s contre les boss et dans la tour",15000],["gants2","Gants de maître","Dégâts de clic ×3",25000],
  ["rythme","Rythme","Combo maximum 150 au lieu de 100",30000],["sac2","Grand sac","+8 000 s de farm AFK",40000],["outils2","Outils de maître","Récolte 20 % plus rapide",60000],
  ["auto2","Clic automatique II","+4 clics par seconde",80000],["allie2","Tactique de groupe","Compagnons ×1,5",5e5],["allie3","Bannière de guerre","Compagnons ×2",2e7],
  ["sp1","Sort automatique I","Votre 1er sort peut se lancer tout seul (case Auto)",5000],["sp2","Sort automatique II","Votre 2e sort peut se lancer tout seul (case Auto)",60000],["sp3","Sort automatique III","Votre 3e sort peut se lancer tout seul (case Auto)",6e5],
  ["potauto","Potions automatiques","Boit une potion de soin tout seul sous le seuil de PV, et enchaîne les potions à effet cochées « Auto » (sagesse, force…) dès que l'effet se termine",10000],["cdr1","Concentration","Sorts 10 % plus rapides",25000],["cdr2","Maîtrise des arcanes","Sorts encore 10 % plus rapides",3e5],
  ["bossauto","Défi automatique","Défie le boss tout seul dès que les 10 victoires sont faites",40000],
  ["dgauto","Explorateur","Entre tout seul dans le donjon de la zone dès que vous avez sa clé (case Donjon auto)",80000],
  ["vendeur","Colporteur","Vend automatiquement le surplus de ressources au-dessus du seuil gardé (case dans Options)",15000],["qauto","Messager","Récupère tout seul la récompense des quêtes terminées (case dans Options)",30000],
  ["fortauto","Flasque de fortune","Boit une potion de fortune au début de chaque donjon (case dans Options)",45000],["forgex","Forge express","Forge sans mini-jeu : rareté au moins Rare (option Mini-jeu de forge désactivée)",50000],
  ["zoneauto","Éclaireur","Passe au monde suivant dès que son boss est battu et que vous avez le niveau (case dans Options)",60000],["tourauto","Grimpeur","Relance la tour tant que vous gagnez ; une défaite ou un abandon coupe l'automatisme (case dans Options)",100000],
  ["coffre","Coffre garni","+1 objet de la zone dans le coffre final des donjons",120000],["kmag","Aimant à clés","Chance doublée de trouver une clé de boss sur les monstres",150000],
  ["allyel","Compagnons d'élite","Vos compagnons posent chaque seconde un état de votre élément (poison, brûlure, gelure, saignement)",200000],["sacx","Sac sans fond","Stockage AFK doublé",250000]];
/* Apparence dynamique du héros (6 emplacements visibles + transmogrification + auras de haut niveau).
   Chaque pièce embarque sa classe (ou boss), sa zone, son palier de menace (0..4) et sa palette de zone. */
const armPiece=it=>{const th=ZONE_STYLE[it.z]||ZONE_STYLE[0];return{id:it.id,cls:it.cls||"boss",z:it.z,boss:!!it.boss,tier:th.tier,th}};
let armSig=null,armObj=null;
function heroArm(){
  if(!S||!S.cls||(S.opt&&S.opt.showArmor===false))return null;
  let sig="",aura=null,auraZ=-1,bossAura=false;const P={};
  VIS_SLOTS.forEach(sl=>{
    let it=null;
    const tm=S.transmog&&S.transmog[sl];
    if(tm&&S.skins&&S.skins[tm]&&ITEMS[tm]&&ITEMS[tm].slot===sl)it=ITEMS[tm];
    else{const u=S.equip&&S.equip[sl],inst=u&&S.items.find(x=>x.u===u);if(inst&&ITEMS[inst.id]&&ITEMS[inst.id].set)it=ITEMS[inst.id]}
    if(it&&it.set&&SETS[it.set]){
      P[sl]=it;sig+=sl+":"+it.id+"|";
      const th=ZONE_STYLE[it.z];
      if(th&&th.aura&&it.z>auraZ){auraZ=it.z;aura={c1:th.aura[0],c2:th.aura[1],z:it.z,tier:th.tier,motif:th.motif}}
      if(it.boss&&it.z>=6)bossAura=true;
    }
  });
  if(!sig)return null;
  if(sig!==armSig){
    armSig=sig;
    armObj={k:sig,aura,bossAura,toString(){return this.k}};
    for(const sl in P)armObj[sl]=armPiece(P[sl]);
  }
  return armObj;
}

