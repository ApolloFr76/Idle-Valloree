/* Données du jeu : éléments, classes, zones, monstres, objets, panoplies, boutique, talents, succès, réglages par défaut. */
/* ================= DONNÉES DU JEU (modifiables) ================= */
/* Éléments : Eau > Feu > Air > Terre > Eau */
const ELEMS={feu:{n:"Feu",c:"#ef7d4a"},eau:{n:"Eau",c:"#4fa8e0"},terre:{n:"Terre",c:"#c49a5a"},air:{n:"Air",c:"#8fd6b4"},neutre:{n:"Neutre",c:"#9fb0c3"}};
const BEATS={eau:"feu",feu:"air",air:"terre",terre:"eau"};            /* A bat B */
const RES_WEAK=-50,RES_SELF=40,RES_STRONG=20;                       /* résistances des monstres en % */
const CLASSES = {
  guerrier:{name:"Guerrier",col:"#d9824a",desc:"Frappe fort et encaisse bien.",base:{vit:20},critMult:1.8,def:.9,regen:.012,hpMult:1.15,dodgeMult:1,dmgMult:1.1,spellMult:1,cdMult:1,
    spells:[{id:"g1",name:"Coup puissant",lvl:1,cd:6,txt:"Frappe à 300 %",fx:[{t:"hit",m:3}]},
            {id:"g2",name:"Cri de guerre",lvl:10,cd:20,txt:"Dégâts ×1,6 pendant 10 s",fx:[{t:"buff",k:"dmg",v:1.6,d:10}]},
            {id:"g3",name:"Tourbillon",lvl:25,cd:30,txt:"Frappe à 700 %",fx:[{t:"hit",m:7}]}]},
  archer:{name:"Archer",col:"#8fd6b4",desc:"Tire vite, esquive et place des critiques.",base:{agi:30},critMult:2,def:1,regen:.01,hpMult:1,dodgeMult:1.5,dmgMult:1,spellMult:1,cdMult:1,
    spells:[{id:"a1",name:"Tir précis",lvl:1,cd:4,txt:"Frappe à 200 %",fx:[{t:"hit",m:2}]},
            {id:"a2",name:"Tir rapide",lvl:10,cd:16,txt:"Vitesse ×2 pendant 8 s",fx:[{t:"buff",k:"spd",v:2,d:8}]},
            {id:"a3",name:"Œil de lynx",lvl:25,cd:40,txt:"+50 % critique pendant 8 s",fx:[{t:"buff",k:"crit",v:50,d:8}]}]},
  mage:{name:"Mage",col:"#a99ee0",desc:"Sorts 40 % plus forts et 20 % plus rapides à recharger.",base:{sagesse:10},critMult:1.8,def:1,regen:.01,hpMult:.95,dodgeMult:1,dmgMult:1,spellMult:1.4,cdMult:.8,
    spells:[{id:"s1",name:"Projectile",lvl:1,cd:5,txt:"Frappe à 250 %",fx:[{t:"hit",m:2.5}]},
            {id:"s2",name:"Malédiction",lvl:10,cd:15,txt:"80 %/s pendant 6 s",fx:[{t:"dot",m:.8,d:6}]},
            {id:"s3",name:"Déferlement",lvl:25,cd:35,txt:"Frappe à 800 %",fx:[{t:"hit",m:8}]}]},
  gardien:{name:"Gardien",col:"#6bb8e8",desc:"Se soigne et résiste à tout.",base:{vit:30},critMult:1.8,def:.8,regen:.03,hpMult:1.1,dodgeMult:1,dmgMult:.95,spellMult:1,cdMult:1,
    spells:[{id:"d1",name:"Coup de bouclier",lvl:1,cd:6,txt:"Frappe à 220 %",fx:[{t:"hit",m:2.2}]},
            {id:"d2",name:"Soin",lvl:10,cd:18,txt:"Rend 40 % des PV",fx:[{t:"heal",p:.4}]},
            {id:"d3",name:"Rempart",lvl:25,cd:30,txt:"Dégâts subis ÷2 10 s, soigne 15 %",fx:[{t:"buff",k:"def",v:.5,d:10},{t:"heal",p:.15}]}]},
};
const OLD_CLS={brasier:"mage",maree:"gardien",roc:"guerrier",bourrasque:"archer"};
const ZONES = [
  {id:"prairie",el:"terre",name:"Prairie des Clochettes",lvl:[1,10],set:"de la Prairie",zt:"#3d5f3a",zb:"#243a25",mons:[
    {id:"pompon",el:"terre",name:"Pompon laineux",c:"#efe2c4",shape:"blob",ft:"ears",drop:["laine","Touffe de laine"]},
    {id:"picoreau",el:"air",name:"Picoreau",c:"#f2c14e",shape:"bird",ft:"none",drop:["plume","Plume de Picoreau"]},
    {id:"champignard",el:"feu",name:"Champignard",c:"#d9574f",shape:"cap",ft:"none",drop:["spore","Spore luisante"]}]},
  {id:"bois",el:"air",name:"Bois de Mousselune",lvl:[8,20],set:"du Bois",zt:"#2f4f45",zb:"#1b302a",mons:[
    {id:"ecorcin",el:"terre",name:"Écorcin",c:"#8a6a45",shape:"tall",ft:"leaf",drop:["ecorce","Écorce vivante"]},
    {id:"lucioleux",el:"feu",name:"Lucioleux",c:"#c6e86b",shape:"blob",ft:"antenna",drop:["lueur","Poussière de lueur"]},
    {id:"renardine",el:"air",name:"Renardine",c:"#e07b39",shape:"blob",ft:"ears",drop:["queue","Queue touffue"]}]},
  {id:"marais",el:"eau",name:"Marais Glouglou",lvl:[18,32],set:"du Marais",zt:"#38503f",zb:"#22302a",mons:[
    {id:"crapoteux",el:"eau",name:"Crapoteux",c:"#6fa35a",shape:"blob",ft:"none",drop:["bave","Bave visqueuse"]},
    {id:"vasard",el:"terre",name:"Vasard",c:"#7a6a50",shape:"tall",ft:"horns",drop:["vase","Motte de vase"]},
    {id:"nenuphage",el:"air",name:"Nénuphage",c:"#4fb3a0",shape:"spiky",ft:"leaf",drop:["petale","Pétale d'eau"]}]},
  {id:"mines",el:"feu",name:"Mines de Cuivrecœur",lvl:[30,45],set:"des Mines",zt:"#3d3a4c",zb:"#24222e",mons:[
    {id:"taupineur",el:"terre",name:"Taupineur",c:"#7b6a8f",shape:"blob",ft:"ears",drop:["griffe","Griffe usée"]},
    {id:"geodin",el:"air",name:"Géodin",c:"#9b8ec9",shape:"spiky",ft:"crystal",drop:["geode","Éclat de géode"]},
    {id:"rouillard",el:"feu",name:"Rouillard",c:"#b0643a",shape:"tall",ft:"horns",drop:["rouille","Écaille rouillée"]}]},
  {id:"dunes",el:"feu",name:"Dunes Ambrées",lvl:[43,60],set:"des Dunes",zt:"#6b5030",zb:"#3e2e1c",mons:[
    {id:"scaraboule",el:"terre",name:"Scaraboule",c:"#3e8f8a",shape:"blob",ft:"horns",drop:["elytre","Élytre irisé"]},
    {id:"sablin",el:"air",name:"Sablin",c:"#e2b66a",shape:"tall",ft:"none",drop:["sable","Sable chantant"]},
    {id:"mirageon",el:"feu",name:"Mirageon",c:"#f08aa8",shape:"bird",ft:"antenna",drop:["mirage","Plume de mirage"]}]},
  {id:"givre",el:"eau",name:"Pics de Givrecrin",lvl:[58,80],set:"du Givre",zt:"#3e5870",zb:"#22324a",mons:[
    {id:"yetinou",el:"eau",name:"Yétinou",c:"#e8f1f5",shape:"blob",ft:"horns",drop:["fourrure","Fourrure de neige"]},
    {id:"stalagor",el:"terre",name:"Stalagor",c:"#8fc7e0",shape:"spiky",ft:"crystal",drop:["givre","Cœur de givre"]},
    {id:"blizzaron",el:"air",name:"Blizzaron",c:"#b9d4f0",shape:"bird",ft:"none",drop:["souffle","Souffle glacé"]}]},
  {id:"falaises",el:"air",name:"Falaises d'Orageline",lvl:[78,100],set:"des Falaises",zt:"#4a5a70",zb:"#2a3446",mons:[
    {id:"foudrillon",el:"air",name:"Foudrillon",c:"#f2d94a",shape:"bat",ft:"none",drop:["eclair","Aile électrique"]},
    {id:"rocailleux",el:"terre",name:"Rocailleux",c:"#8f8a9c",shape:"golem",ft:"crystal",drop:["galet","Galet d'orage"]},
    {id:"nuageon",el:"eau",name:"Nuageon",c:"#cfe3f5",shape:"ghost",ft:"none",drop:["nuee","Flocon de nuée"]}]},
  {id:"jungle",el:"terre",name:"Jungle d'Émeraude-Lys",lvl:[98,120],set:"de la Jungle",zt:"#2f6a3a",zb:"#1a3e22",mons:[
    {id:"lianard",el:"terre",name:"Lianard",c:"#5fae4a",shape:"snake",ft:"leaf",drop:["liane","Liane souple"]},
    {id:"macaquin",el:"feu",name:"Macaquin",c:"#b9773f",shape:"quad",ft:"none",drop:["poilroux","Poil roussi"]},
    {id:"carnifleur",el:"eau",name:"Carnifleur",c:"#e0508a",shape:"plant",ft:"none",drop:["petalecarn","Pétale carnivore"]}]},
  {id:"recifs",el:"eau",name:"Récifs de Corail-Chant",lvl:[118,140],set:"des Récifs",zt:"#2f7a8a",zb:"#1a4652",mons:[
    {id:"crabouille",el:"eau",name:"Crabouille",c:"#e8684a",shape:"crab",ft:"none",drop:["pince","Pince nacrée"]},
    {id:"meduline",el:"air",name:"Méduline",c:"#c08af0",shape:"jelly",ft:"none",drop:["filament","Filament luisant"]},
    {id:"oursinet",el:"terre",name:"Oursinet",c:"#4f5fa0",shape:"spiky",ft:"none",drop:["piquant","Piquant d'oursin"]}]},
  {id:"volcan",el:"feu",name:"Volcan de Brasemont",lvl:[138,160],set:"du Volcan",zt:"#5a2e24",zb:"#301814",mons:[
    {id:"magmoule",el:"feu",name:"Magmoule",c:"#f0622c",shape:"slime",ft:"flame",drop:["magma","Goutte de magma"]},
    {id:"cendrillard",el:"air",name:"Cendrillard",c:"#6a5a62",shape:"bat",ft:"none",drop:["cendre","Cendre volante"]},
    {id:"scorillon",el:"terre",name:"Scorillon",c:"#8a4a3c",shape:"golem",ft:"horns",drop:["scorie","Scorie brûlante"]}]},
  {id:"ruines",el:"air",name:"Ruines d'Astrelune",lvl:[158,180],set:"des Ruines",zt:"#5a5478",zb:"#34304a",mons:[
    {id:"spectrelin",el:"air",name:"Spectrelin",c:"#a8e8e0",shape:"ghost",ft:"antenna",drop:["voile","Voile spectral"]},
    {id:"gargouillon",el:"terre",name:"Gargouillon",c:"#8a8a9e",shape:"quad",ft:"none",drop:["pierrelune","Pierre de lune"]},
    {id:"runelin",el:"feu",name:"Runelin",c:"#f0a03c",shape:"eye",ft:"horns",drop:["rune","Rune ardente"]}]},
  {id:"abime",el:"eau",name:"Abîme de Nuitombre",lvl:[178,200],set:"de l'Abîme",zt:"#2e2450",zb:"#18122e",mons:[
    {id:"ombrelin",el:"eau",name:"Ombrelin",c:"#5a4fa8",shape:"jelly",ft:"none",drop:["ombre","Essence d'ombre"]},
    {id:"devoreil",el:"feu",name:"Dévoreil",c:"#c83a5a",shape:"eye",ft:"none",drop:["larme","Larme écarlate"]},
    {id:"neantille",el:"air",name:"Néantille",c:"#7a6a9a",shape:"snake",ft:"crystal",drop:["neant","Écaille du néant"]}]},
];
const PROFS = {
  bucheron:{name:"Bûcheron",verb:"Couper",res:[["frene","Frêne"],["chataignier","Châtaignier"],["noyer","Noyer"],["chene","Chêne"],["erable","Érable"],["if","If"],["bouleau","Bouleau"],["merisier","Merisier"],["orme","Orme"],["charme","Charme"],["ebene","Ébène"],["sequoia","Séquoia"]]},
  mineur:{name:"Mineur",verb:"Miner",res:[["fer","Fer"],["cuivre","Cuivre"],["etain","Étain"],["argent","Argent"],["or","Or"],["cobalt","Cobalt"],["zinc","Zinc"],["manganese","Manganèse"],["bauxite","Bauxite"],["platine","Platine"],["mithril","Mithril"],["obsidienne","Obsidienne"]]},
  paysan:{name:"Paysan",verb:"Faucher",res:[["ble","Blé"],["orge","Orge"],["avoine","Avoine"],["houblon","Houblon"],["seigle","Seigle"],["lin","Lin"],["mais","Maïs"],["millet","Millet"],["riz","Riz"],["sarrasin","Sarrasin"],["epeautre","Épeautre"],["quinoa","Quinoa"]]},
  herboriste:{name:"Herboriste",verb:"Cueillir",res:[["ortie","Ortie"],["sauge","Sauge"],["menthe","Menthe"],["melisse","Mélisse"],["edelweiss","Edelweiss"],["mandragore","Mandragore"],["lavande","Lavande"],["thym","Thym"],["belladone","Belladone"],["ginseng","Ginseng"],["orchidee","Orchidée"],["lotus","Lotus"]]},
  pecheur:{name:"Pêcheur",verb:"Pêcher",res:[["p_goujon","Goujon des prés"],["p_ablette","Ablette moussue"],["p_perche","Perche des marais"],["p_chabot","Chabot des galeries"],["p_carpe","Carpe ambrée"],["p_truite","Truite de givre"],["p_vairon","Vairon d'orage"],["p_piranha","Piranha émeraude"],["p_clown","Poisson-clown corail"],["p_anguille","Anguille de braise"],["p_silure","Silure astral"],["p_lanterne","Lanterne abyssale"]]},
};
const UNLOCK=[1,10,20,30,40,50,60,70,80,90,100,110], PROF_MAX=120, LVL_MAX=200, PTS_PER_LVL=5;
const SLOTS=[
  {id:"coiffe",name:"Coiffe",st:{vit:.6,sagesse:.4},g:"paysan"},
  {id:"cape",name:"Cape",st:{vit:.5,agi:.5},g:"paysan"},
  {id:"amulette",name:"Amulette",st:{EL:.5,sagesse:.5},g:"mineur"},
  {id:"anneau",name:"Anneau",st:{puissance:.6,crit:1},g:"mineur"},
  {id:"bottes",name:"Bottes",st:{agi:.6,prospection:.4},g:"bucheron"},
  {id:"arme",name:"Arme",st:{dmg:.25,EL:.5},g:"bucheron"},
  {id:"ceinture",name:"Ceinture",st:{vit:.5,puissance:.3},g:"mineur"},
  {id:"bouclier",name:"Bouclier",st:{vit:.7,agi:.2},g:"bucheron"},
];
const STAT_LBL={feu:"Feu",eau:"Eau",terre:"Terre",air:"Air",vit:"Vitalité",puissance:"Puissance (tous éléments)",agi:"Agilité",sagesse:"Sagesse",crit:"% Critique",prospection:"Prospection",dmg:"Dégâts",pctXp:"% d'XP",pctEcus:"% d'écus",pctDmg:"% de dégâts"};
const ALLOC=["vit","sagesse","agi","feu","eau","terre","air"];

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
/* Bonus de panoplie progressifs : chaque pièce portée à partir de 2 ajoute un palier (cumulatif) */
/* Bonus de panoplie : les caractéristiques suivent la même courbe que les objets de la zone (budget),
   les bonus en % augmentent plus doucement (×1 en zone 1, ×3,75 dans la dernière zone). */
const SET_BONUS=z=>{const f=budget(z)/budget(0),p=1+z/4;return{2:{vit:6*f},3:{sagesse:4*f},4:{puissance:5*f,pctXp:5*p},5:{prospection:8*f,vit:6*f},6:{crit:2+z,pctEcus:10*p},7:{puissance:8*f,agi:5*f},8:{puissance:12*f,vit:14*f,crit:2+z,pctDmg:15*p}}};
/* Panoplies : une par monstre (8, 4 ou 2 pièces) et une par boss (4 pièces). SETS[clé] = {name,z,n,lvl,el,boss,ids,mon} */
const SETS={};
/* Paliers d'une panoplie : les petites panoplies reprennent les paliers forts du tableau */
const SET_MAP={8:{2:2,3:3,4:4,5:5,6:6,7:7,8:8},4:{2:2,3:4,4:6},2:{2:4}},SET_MAP_BOSS={2:3,3:6,4:8};
const SETB_C={},SETB=key=>SETB_C[key]||(SETB_C[key]=SETB0(key)),SETB0=key=>{const t=SETS[key],b=SET_BONUS(t.z+(t.boss?.5:0)),mp=t.boss?SET_MAP_BOSS:SET_MAP[t.n],o={};for(const k in mp){o[k]={};for(const x in b[mp[k]])o[k][x]=Math.round(b[mp[k]][x])}return o};
const setSteps=key=>SETS[key].steps||(SETS[key].steps=Object.keys(SETB(key)).map(Number));
function setBox(z,n,compact){const T=SETS[z],b=SETB(z),N=T.n,ST=setSteps(z),c=Math.min(N,n||0),nx=ST.find(k=>k>c);
  return`<div class="setb"><b>Panoplie ${T.name}</b> · <span class="num">${c}/${N}</span> pièce${c>1?"s":""} portée${c>1?"s":""}<div class="setpips">${Array.from({length:N},(_,i)=>i+1).map(i=>`<i class="${i<=c?"on":""}${ST.includes(i)?" t":""}"></i>`).join("")}</div>
  <div>Total actif : <b style="color:var(--xp)">${statsTxt(setTotal(z,c))||"aucun"}</b></div>${nx?`<div class="small">Prochain palier (${nx} pièces) : <b>${statsTxt(b[nx])}</b></div>`:`<div class="small"><b style="color:var(--gold)">Panoplie complète !</b></div>`}
  ${compact?"":`<div class="small" style="margin-top:4px">${ST.map(k=>`<span class="${c>=k?"":"off"}">${c>=k?"✓":"·"} ${k} pièces : ${statsTxt(b[k])}</span>`).join("<br>")}</div>`}</div>`}
const setTotal=(z,n)=>{const b=SETB(z),o={};setSteps(z).filter(k=>k<=n).forEach(k=>{for(const x in b[k])o[x]=(o[x]||0)+b[k][x]});return o};
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
/* Article devant le nom du monstre pour nommer sa panoplie (« du » par défaut) */
const ART={ecorcin:"de l'",renardine:"de la ",crabouille:"de la ",meduline:"de la ",oursinet:"de l'",magmoule:"de la ",ombrelin:"de l'",neantille:"de la ",boss_2:"de la ",boss_6:"de l'",boss_7:"de la "};
const SET_SLOTS={8:SLOTS.map(s=>s.id),4:["coiffe","cape","bottes","ceinture"],2:["amulette","anneau"],boss:["arme","bouclier","amulette","anneau"]};
ZONES.forEach((z,zi)=>{
  const drops=z.mons.map(m=>m.drop[0]),span=z.lvl[1]-z.lvl[0],main=z.mons.find(m=>m.el===z.el)||z.mons[0];let o=0;
  const mk=(key,m,n,lvl,mult,boss)=>{
    const T=SETS[key]={key,name:(ART[key]||"du ")+m.name,z:zi,n,lvl,el:m.el,boss:!!boss,mon:key,ids:{}};
    SLOTS.filter(sl=>SET_SLOTS[boss?"boss":n].includes(sl.id)).forEach(sl=>{const si=SLOTS.indexOf(sl),stats={};
      const id=key===main.id?`z${zi}_${sl.id}`:`s_${key}_${sl.id}`;
      Object.entries(sl.st).forEach(([k0,w])=>{const k=k0==="EL"?m.el:k0;stats[k]=k==="crit"?Math.round(lvlCrit(lvl)*mult):Math.max(1,Math.round(lvlBudget(lvl)*w*mult))});
      const recipe=boss?[[m.bres[0],2],[drops[si%3],3+2*zi],[PROFS[sl.g].res[zi][0],5+3*zi]]:[[m.drop[0],4+3*zi],[PROFS[sl.g].res[zi][0],4+3*zi]];
      T.ids[sl.id]=id;ITEMS[id]={id,z:zi,set:key,slot:sl.id,name:`${sl.name} ${T.name}`,stats,recipe,lvl,price:Math.round(12*Math.pow(1+lvl/8,2)*mult)};
    })};
  z.mons.forEach(m=>{if(m===main)mk(m.id,m,8,z.lvl[0],1);else{o++;mk(m.id,m,o===1?4:2,z.lvl[0]+Math.round(span*(o===1?.3:.55)),o===1?1.12:1.2)}});
  mk("boss_"+zi,MON["boss_"+zi],4,z.lvl[0]+Math.round(span*.8),1.35,true);
});
/* Compagnons : [id, nom, dégâts/s par niveau, coût de base, couleur] */
const ALLIES=[["ecuyer","Écuyer Bertin",2,50,"#d9a46a"],["chasseuse","Chasseuse Lina",9,400,"#8fd16a"],["moine","Moine Tao",40,3000,"#f0c35a"],["sorciere","Sorcière Mirabelle",180,25000,"#a99ee0"],
  ["golem","Golem de pierre",850,2e5,"#aab6c4"],["dragonnet","Dragonnet Ambre",4000,1.6e6,"#ef7d4a"],["phenix","Phénix d'aube",2e4,1.5e7,"#ff8ab0"]];
/* Boutique d'améliorations */
const UPGS=[
  ["gants1","Gants renforcés","Dégâts de clic ×2",300],["auto1","Clic automatique","2 clics par seconde",3000],["sac1","Sac agrandi","+2 000 de poids",1500],
  ["outils1","Outils affûtés","Récolte 20 % plus rapide",2000],["aimant","Aimant à trésors","Objets cliquables 30 % plus fréquents",8000],["bourse","Bourse de marchand","Ventes +25 %",12000],
  ["allie1","Entraînement","Compagnons ×1,5",20000],["sablier","Sablier","+10 s contre les boss et dans la tour",15000],["gants2","Gants de maître","Dégâts de clic ×3",25000],
  ["rythme","Rythme","Combo maximum 150 au lieu de 100",30000],["sac2","Grand sac","+8 000 de poids",40000],["outils2","Outils de maître","Récolte 20 % plus rapide",60000],
  ["auto2","Clic automatique II","+4 clics par seconde",80000],["allie2","Tactique de groupe","Compagnons ×1,5",5e5],["allie3","Bannière de guerre","Compagnons ×2",2e7]];
const up=id=>!!(S.up&&S.up[id]);
const allyCost=(i,l)=>Math.round(ALLIES[i][3]*Math.pow(1.15,l));
const allyMult=()=>(up("allie1")?1.5:1)*(up("allie2")?1.5:1)*(up("allie3")?2:1)*(1+talV("t_cmd")/100);
const allyDpsOf=(i,l,m=allyMult())=>l<=0?0:ALLIES[i][2]*.4*l*Math.pow(1.5,Math.floor(l/25))*m;
const allyDps=()=>{const m=allyMult();return ALLIES.reduce((a,x,i)=>a+allyDpsOf(i,S.allies[x[0]]||0,m),0)};
const clickMult=()=>(up("gants1")?2:1)*(up("gants2")?3:1)*(1+talV("t_doigts")/100);
const comboMax=()=>up("rythme")?150:100;
const inc=(k,n=1)=>{S.st[k]=(S.st[k]||0)+n};
const mx=(k,v)=>{if(v>(S.st[k]||0))S.st[k]=v};
const sellMult=()=>up("bourse")?1.25:1;
const mkOf=k=>(S.mk&&S.mk[k])||1;
const priceOf=k=>Math.max(1,Math.round(RES[k].price*sellMult()*(RES[k].kind==="k"?1:mkOf(k))));
function gainEcus(n){n=Math.round(n*(1+talV("t_avar")/100)*(1+.01*achN()));S.ecus+=n;inc("ecus",n);return n}

/* Renaissance et talents : [id, nom, effet, rangs max, coût de base en éclats] */
const PREST_LVL=30;
/* Bonus Oméga : chaque passage Oméga donne +10 % d'XP et +10 % d'écus, et relève le niveau maximum
   de 50 niveaux jusqu'au niveau 500, puis de 100 niveaux par passage. */
const omegaN=()=>(S&&S.prest)||0;
const lvlMax=()=>{const p=omegaN(),a=Math.min(p,6);return LVL_MAX+50*a+100*Math.max(0,p-6)};
/* Éclats non dépensés : +0,5 % de dégâts chacun, seulement quand tous les talents sont au moins au rang 5
   (sinon garder ses éclats rapportait plus que d'acheter des talents). */
const SOUL_PCT=.5,SOUL_MIN_RANK=5;
const talAll5=()=>Object.keys(TAL).every(id=>tal(id)>=SOUL_MIN_RANK);
const soulBonus=()=>talAll5()?SOUL_PCT*(S.souls||0):0;
const TALENTS={
  "Combat":[["t_force","Force brute","+10 % de dégâts",1],["t_prec","Précision","+2 % de critique",1],["t_vie","Vitalité ancestrale","+10 % de PV",2],["t_elem","Maîtrise élémentaire","Les faiblesses font +10 % de dégâts en plus",3]],
  "Récolte":[["t_mains","Mains agiles","Récolte 8 % plus rapide",1],["t_double","Double récolte","Chance de récolte double",1],["t_sac","Poches sans fond","+1 500 de poids",2],["t_metier","Héritage des métiers","Les métiers repartent plus haut",3]],
  "Fortune":[["t_avar","Avarice","+10 % d'écus",1],["t_pros","Prospecteur","+15 Prospection",1],["t_trefle","Chanceux","Objets cliquables 10 % plus fréquents",2],["t_depart","Bourse de départ","Recommencer avec des écus",2]],
  "Clic":[["t_doigts","Doigts de fer","+25 % de dégâts de clic",1],["t_combo","Combo durable","Le combo baisse 30 % moins vite",1],["t_dore","Frappe dorée","Chance qu'un clic fasse ×10",2],["t_cmd","Commandant","+20 % de dégâts des compagnons",2]],
};
const TAL={};Object.entries(TALENTS).forEach(([br,l])=>l.forEach((t,i)=>TAL[t[0]]={id:t[0],n:t[1],txt:t[2],cost:t[3],br,i,prev:i?l[i-1][0]:null}));
const tal=id=>(S.tal&&S.tal[id])||0;
/* Rangs illimités : [valeur du 1er rang, plafond (0 = sans plafond), format]. Sans plafond : 10 rangs pleins puis rendement décroissant. Avec plafond : chaque rang rapproche du plafond. */
const TALV={t_force:[10,0,"+# % de dégâts"],t_prec:[2,30,"+# % de critique"],t_vie:[10,0,"+# % de PV"],t_elem:[10,50,"+# % sur les faiblesses"],
  t_mains:[8,60,"Récolte # % plus rapide"],t_double:[6,50,"+# % de récolte double"],t_sac:[1500,0,"+# de poids"],t_metier:[5,60,"Métiers au niveau #"],
  t_avar:[10,0,"+# % d'écus"],t_pros:[15,0,"+# Prospection"],t_trefle:[10,60,"Objets cliquables # % plus fréquents"],t_depart:[1000,0,"# écus au départ"],
  t_doigts:[25,0,"+# % de dégâts de clic"],t_combo:[30,90,"Combo baisse # % moins vite"],t_dore:[2,25,"# % de frappe dorée ×10"],t_cmd:[20,0,"+# % de dégâts des compagnons"]};
const dimR=r=>r<=10?r:10+Math.log(1+.08*(r-10))/.08;
const talAt=(id,r)=>{const[v,cap]=TALV[id];return r<=0?0:cap?cap*(1-Math.pow(1-v/cap,r)):v*dimR(r)};
const talV=id=>talAt(id,tal(id));
const talTxt=(id,r)=>{const x=talAt(id,r),f=TALV[id][2];return f.replace("#",x>=100?fmt(Math.round(x)):(Math.round(x*10)/10).toString().replace(".",","))};
const talCostAt=(id,r)=>Math.ceil(TAL[id].cost*(r+1)*Math.pow(1.04,r));
const talCost=id=>talCostAt(id,tal(id));
const talSpent=id=>{let n=0;for(let k=0;k<tal(id);k++)n+=talCostAt(id,k);return n};
const soulsGain=()=>S.lvl<PREST_LVL?0:Math.floor(Math.pow(S.lvl-20,1.3)/3)+Math.floor((S.st.bossesLife||0)/5);
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
  textSize:100,ambiance:true,reduceMotion:false,dmgNums:"all",weatherFx:true,shake:true,logLines:8,numFmt:"short",showHint:true,
  potThreshold:30,autoSellFull:false,koRetreat:false,pauseHidden:false,confirmPrest:true,forgeQte:true,tips:true,goals:true,goalsOpen:true,goalsN:4,forgeSpeed:1,
  toasts:"all",logKills:true,logLoot:true,logQuests:true,
  keys:true,saveEvery:10,offline:true};
/* Rareté des objets fabriqués */
const RAR=[{n:"Commun",c:"#5a4a3a",m:1},{n:"Rare",c:"#1f6fb8",m:1.15},{n:"Épique",c:"#7a3fc0",m:1.35},{n:"Légendaire",c:"#c2560a",m:1.6}];
/* Chances de rareté (%) selon le score de forge (0 à 6 points), et sans mini-jeu */
const FORGE_W=[[90,10,0,0],[80,17,3,0],[70,24,6,0],[55,32,11,2],[40,37,18,5],[25,38,27,10],[10,32,38,20]],FORGE_SKIP=[75,20,5,0];
const rarOf=i=>RAR[(i&&i.r)||0];
/* Bonus secondaires des caractéristiques : un palier tous les 5 points (équipement compris) */
const SEC_STEP=5;
const PRIM_OK={};const lockA=(k,st)=>!!(SEC[k]?.cap&&!PRIM_OK[k]&&secMax(k,st[k]));
const secMax=(k,v)=>SEC[k]&&SEC[k].cap&&secN(k,v)>=SEC[k].cap;
const SEC={vit:{f:n=>`+${n} % de PV max`},sagesse:{cap:30,f:n=>`-${n} % de recharge des sorts`},agi:{cap:40,f:n=>`${n} % de chance d'attaquer deux fois`},
  feu:{f:n=>`+${2*n} % de dégâts critiques`},eau:{f:n=>`+${2*n} Prospection`},terre:{cap:40,f:n=>`-${n} % de dégâts subis`},air:{f:n=>`+${(n/2).toString().replace(".",",")} % de critique`}};
const secN=(k,v)=>{const n=Math.floor(Math.max(0,v||0)/SEC_STEP);return SEC[k].cap?Math.min(SEC[k].cap,n):n};
const secTxt=(k,v)=>SEC[k]?SEC[k].f(secN(k,v))+(SEC[k].cap&&secN(k,v)>=SEC[k].cap?" (max)":""):"";
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
Object.values(MON).filter(m=>!m.boss).forEach((m,i)=>{const z=m.zone,k=TR_ST[i%6];ITEMS["tr_"+m.id]={id:"tr_"+m.id,z,slot:"trophee",kind:"Trophée",name:"Trophée : "+m.name,stats:{[k]:k==="crit"?1+Math.floor(z/2):Math.max(2,Math.round(budget(z)*(k==="prospection"?.5:.3)))},recipe:[],lvl:1,price:40*(z+1)**2,noSet:true,noEnch:true}});
/* Emplacements d'équipement */
const EQ={coiffe:{n:"Coiffe",t:"coiffe"},cape:{n:"Cape",t:"cape"},arme:{n:"Bâton",t:"arme"},bottes:{n:"Bottes",t:"bottes"},
  amulette:{n:"Amulette",t:"amulette"},anneau:{n:"Anneau",t:"anneau"},anneau2:{n:"Anneau",t:"anneau"},ceinture:{n:"Ceinture",t:"ceinture"},bouclier:{n:"Bouclier",t:"bouclier"},familier:{n:"Monture",t:"familier"}};
for(let i=0;i<6;i++)EQ["trophee"+i]={n:"Trophée",t:"trophee"};
const DOLL_L=["amulette","anneau","anneau2","ceinture","bottes"],DOLL_R=["coiffe","arme","bouclier","cape","familier"],DOLL_B=[0,1,2,3,4,5].map(i=>"trophee"+i);
const ZCOL=["#a6d46f","#6fc3a0","#4fb3a0","#a99ee0","#e2b66a","#8fc7e0","#b8c8e8","#5fd07a","#5fd0e0","#ff8a5a","#c8b8f0","#9a7af0"],PCOL={bucheron:"#c49a5a",mineur:"#aab6c4",paysan:"#e8d26a",herboriste:"#8fd16a"};
/* Icônes en pixels 16×16 (tracés générés) */
const G={herboriste:'<path fill="currentColor" stroke="none" shape-rendering="crispEdges" transform="scale(1.5)" d="M9 2h5v1h-5zM7 3h7v1h-7zM6 4h3v1h-3zM12 4h2v1h-2zM5 5h3v1h-3zM12 5h2v1h-2zM4 6h2v1h-2zM8 6h1v1h-1zM12 6h1v1h-1zM3 7h3v1h-3zM7 7h3v1h-3zM11 7h2v1h-2zM3 8h2v1h-2zM6 8h3v1h-3zM11 8h2v1h-2zM3 9h5v1h-5zM10 9h2v1h-2zM3 10h4v1h-4zM8 10h3v1h-3zM2 11h8v1h-8zM2 12h7v1h-7zM3 13h2v1h-2z"/>',
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
const itIcon=it=>it.img?`<img src="${it.img}" alt="">`:it.set&&MON[it.set]?`<img class="px" src="${PX.item(it.slot,MON[it.set].c)}" alt="">`:it.slot==="trophee"&&trMon(it)?`<img class="px" src="${PX.monster(trMon(it))}" alt="">`:it.slot==="familier"?`<img class="px" src="${it.look?PX.fam(it.id):PX.pet(ZCOL[it.z]||"#f08aa8")}" alt="">`:glyph(it.slot);
const itCol=it=>it.slot==="familier"?"#f08aa8":it.slot==="trophee"?"#f0c35a":ZCOL[it.z];
const resIcon=r=>r.img?`<img src="${r.img}" alt="">`:r.kind==="g"?`<img class="px" src="${PX.res(r.prof,r.tier)}" width="16" height="16" alt="">`:r.kind==="d"?`<img class="px" src="${PX.drop(dropKind(r.name),dropCol(r),r.rare||r.boss)}" width="16" height="16" alt="">`:r.kind==="k"?`<img class="px" src="${PX.key()}" width="16" height="16" alt="">`:r.kind==="p"?`<img class="px" src="${PX.potion(r.col)}" width="16" height="16" alt="">`:glyph(r.kind==="d"?"drop":r.kind==="k"?"cle":r.kind==="p"?"potion":r.prof);
const kindLabel=r=>r.kind==="d"?"Butin de monstre":r.kind==="k"?"Clé de donjon":r.kind==="p"?"Potion":"Ressource · "+PROFS[r.prof].name;
const resCol=r=>r.kind==="d"?ZCOL[r.zone]:r.kind==="k"?"#f0c35a":r.kind==="p"?r.col:PCOL[r.prof];
const xpNeed=l=>Math.floor(40*Math.pow(l,1.75)+60*l);
const pxNeed=l=>Math.floor(6*Math.pow(l,1.5)+5*l);


/* ---------- Codes cadeaux (Options > Sauvegarde > Code cadeau) ----------
   Ajouter un code : "NOM":{txt:"ce que fait le code", once:true si utilisable une seule fois, go:()=>{ ... }}
   Le nom se tape sans tenir compte des majuscules ni des espaces. go() peut renvoyer un texte affiché au joueur. */
const CODES={
  "ECUS":{txt:"+1 000 000 écus (test)",go:()=>{gainEcus(1e6)}},
  "NIVEAU":{txt:"+10 niveaux (test)",go:()=>{for(let i=0;i<10&&S.lvl<lvlMax();i++)gainXp(xpNeed(S.lvl)-S.xp)}},
  "ECLATS":{txt:"+100 éclats Oméga (test)",go:()=>{S.souls+=100;S.soulsTotal=(S.soulsTotal||0)+100}},
  "METIERS":{txt:"+10 niveaux dans chaque métier (test)",go:()=>{for(const p in S.jobs){S.jobs[p].lvl=Math.min(PROF_MAX,S.jobs[p].lvl+10);S.jobs[p].xp=0}}},
  "SOIN":{txt:"PV au maximum",go:()=>{S.hp=stats().maxHp}},
  "GM2TAMRSGM2DA":{txt:"niveau maximum",go:()=>{let g=0;while(S.lvl<lvlMax()&&g++<5000)gainXp(xpNeed(S.lvl)-S.xp+1);S.hp=stats().maxHp;return`niveau ${S.lvl} (maximum)`}},
};
function useCode(raw){const k=String(raw||"").toUpperCase().replace(/\s+/g,""),c=CODES[k];if(!k)return;
  if(!c){toast("Code inconnu",1);return}S.codes=S.codes||{};if(c.once&&S.codes[k]){toast("Code déjà utilisé",1);return}
  const r=c.go();S.codes[k]=(S.codes[k]||0)+1;log(`Code ${k} : ${r||c.txt}.`,"g");toast(`Code ${k} : ${r||c.txt}`,1);dirty=true;save()}
