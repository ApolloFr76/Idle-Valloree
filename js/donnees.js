/* Données du jeu (1/4) : éléments, classes, dégâts sur la durée (DoT), zones et monstres. Suite : donnees-objets.js, donnees-progression.js, donnees-divers.js. */
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
/* Druide (clé « peste » gardée pour les sauvegardes) : chaque attaque empoisonne. Ses dégâts directs sont faibles, ses dégâts sur la durée (DoT) ×1,6. */
CLASSES.peste={name:"Druide",col:"#4f7a4a",desc:"Empoisonne à chaque coup : faibles coups directs, énormes dégâts sur la durée.",base:{sagesse:10,poison:20},critMult:1.6,def:.95,regen:.012,hpMult:1,dodgeMult:1,dmgMult:.75,spellMult:1,cdMult:1,dotMult:1.6,autoDot:"poison",
  spells:[{id:"p1",name:"Fiole toxique",lvl:1,cd:6,txt:"Frappe à 120 % et ajoute 3 charges de poison",fx:[{t:"hit",m:1.2},{t:"dot",k:"poison",n:3}]},
          {id:"p2",name:"Miasme",lvl:10,cd:18,txt:"Dégâts sur la durée ×2 pendant 8 s",fx:[{t:"buff",k:"dot",v:2,d:8}]},
          {id:"p3",name:"Purge",lvl:25,cd:30,txt:"Fait exploser toutes les charges (poison, brûlure, gelure, saignement) d'un coup",fx:[{t:"purge",m:1.5}]}]};
/* Chronomancien : recharges −30 %, chaque coup pose de la Gelure, sorts autour du temps */
CLASSES.chrono={name:"Chronomancien",col:"#3a5aa8",desc:"Maître du temps : sorts 30 % plus rapides à recharger, chaque coup pose de la Gelure.",base:{sagesse:20,gelure:20},critMult:1.7,def:1,regen:.012,hpMult:.95,dodgeMult:1,dmgMult:.95,spellMult:1.2,cdMult:.7,autoDot:"gelure",
  spells:[{id:"c1",name:"Faille",lvl:1,cd:5,txt:"Frappe à 200 % et ajoute 3 charges de gelure",fx:[{t:"hit",m:2},{t:"dot",k:"gelure",n:3}]},
          {id:"c2",name:"Accélération",lvl:10,cd:20,txt:"Vitesse ×2 et recharges ÷2 pendant 8 s",fx:[{t:"buff",k:"spd",v:2,d:8},{t:"buff",k:"cdr",v:.5,d:8}]},
          {id:"c3",name:"Écho",lvl:25,cd:30,txt:"Rejoue d'un coup tous les dégâts infligés pendant les 5 dernières secondes",fx:[{t:"echo",s:5}]}]};
/* Berserker : plus il perd de PV, plus il frappe fort (jusqu'à ×3), se soigne en frappant, pose du saignement */
CLASSES.berserk={name:"Berserker",col:"#a8442a",desc:"Plus il est blessé, plus il frappe fort (jusqu'à ×3). Se soigne à chaque coup et fait saigner.",base:{vit:25,saignement:60},critMult:1.8,def:1.05,regen:.008,hpMult:1.25,dodgeMult:.8,dmgMult:1.05,spellMult:1,cdMult:1,rage:2,leech:.015,
  spells:[{id:"b1",name:"Entaille",lvl:1,cd:5,txt:"Frappe à 250 % et ajoute 2 charges de saignement",fx:[{t:"hit",m:2.5},{t:"dot",k:"saignement",n:2}]},
          {id:"b2",name:"Rage",lvl:10,cd:20,txt:"Dégâts ×2 mais dégâts subis ×1,5 pendant 10 s",fx:[{t:"buff",k:"dmg",v:2,d:10},{t:"buff",k:"def",v:1.5,d:10}]},
          {id:"b3",name:"Massacre",lvl:25,cd:30,txt:"6 coups à 150 % en 2 secondes",fx:[{t:"multi",n:6,m:1.5,gap:330}]}]};
/* Invocateur : coups faibles, compagnons +50 % et 20 % moins chers, invoque des esprits temporaires */
CLASSES.invoc={name:"Invocateur",col:"#8a4ac8",desc:"Classe des compagnons : ils font +50 % de dégâts et coûtent 20 % moins cher. Invoque des esprits.",base:{sagesse:15},critMult:1.6,def:1,regen:.012,hpMult:.95,dodgeMult:1,dmgMult:.7,spellMult:1,cdMult:1,allyBonus:1.5,allyCost:.8,
  spells:[{id:"i1",name:"Esprit lié",lvl:1,cd:8,txt:"Invoque un esprit qui frappe à 300 %/s pendant 8 s",fx:[{t:"summon",n:1,m:3,d:8}]},
          {id:"i2",name:"Pacte",lvl:10,cd:20,txt:"Compagnons ×2 pendant 10 s",fx:[{t:"buff",k:"ally",v:2,d:10}]},
          {id:"i3",name:"Armée spectrale",lvl:25,cd:35,txt:"Invoque 5 esprits (300 %/s chacun) pendant 12 s",fx:[{t:"summon",n:5,m:3,d:12}]}]};
/* ---------- Dégâts sur la durée (DoT) : un par élément ----------
   Chaque charge fait des dégâts chaque seconde. La stat du même nom (sur l'équipement de l'élément) donne une chance
   d'en poser à chaque coup et augmente leurs dégâts. max = charges max, k = force d'une charge, d = durée (s). */
const DOTS={poison:{n:"Poison",el:"air",c:"#7ad04a",max:10,k:1,d:6,txt:"s'empile jusqu'à 10"},
  brulure:{n:"Brûlure",el:"feu",c:"#ff7a2c",max:5,k:2,d:4,txt:"5 charges max, mais 2× plus fortes"},
  gelure:{n:"Gelure",el:"eau",c:"#8fd6ff",max:10,k:.7,d:6,slow:.04,txt:"ralentit les attaques du monstre de 4 % par charge"},
  saignement:{n:"Saignement",el:"terre",c:"#e04848",max:10,k:1.2,d:5,txt:"un coup critique ajoute une charge de plus"}};
const EL_DOT={air:"poison",feu:"brulure",eau:"gelure",terre:"saignement"};
const OLD_CLS={brasier:"mage",maree:"gardien",roc:"guerrier",bourrasque:"archer"};
const ZONES = [
  {id:"prairie",el:"terre",name:"Prairie des Clochettes",lvl:[1,30],set:"de la Prairie",zt:"#3d5f3a",zb:"#243a25",mons:[
    {id:"pompon",el:"terre",name:"Pompon laineux",c:"#efe2c4",shape:"blob",ft:"ears",drop:["laine","Touffe de laine"]},
    {id:"picoreau",el:"air",name:"Picoreau",c:"#f2c14e",shape:"bird",ft:"none",drop:["plume","Plume de Picoreau"]},
    {id:"champignard",el:"feu",name:"Champignard",c:"#d9574f",shape:"cap",ft:"none",drop:["spore","Spore luisante"]}]},
  {id:"bois",el:"air",name:"Bois de Mousselune",lvl:[20,65],set:"du Bois",zt:"#2f4f45",zb:"#1b302a",mons:[
    {id:"ecorcin",el:"terre",name:"Écorcin",c:"#8a6a45",shape:"tall",ft:"leaf",drop:["ecorce","Écorce vivante"]},
    {id:"lucioleux",el:"feu",name:"Lucioleux",c:"#c6e86b",shape:"blob",ft:"antenna",drop:["lueur","Poussière de lueur"]},
    {id:"renardine",el:"air",name:"Renardine",c:"#e07b39",shape:"blob",ft:"ears",drop:["queue","Queue touffue"]}]},
  {id:"marais",el:"eau",name:"Marais Glouglou",lvl:[45,110],set:"du Marais",zt:"#38503f",zb:"#22302a",mons:[
    {id:"crapoteux",el:"eau",name:"Crapoteux",c:"#6fa35a",shape:"blob",ft:"none",drop:["bave","Bave visqueuse"]},
    {id:"vasard",el:"terre",name:"Vasard",c:"#7a6a50",shape:"tall",ft:"horns",drop:["vase","Motte de vase"]},
    {id:"nenuphage",el:"air",name:"Nénuphage",c:"#4fb3a0",shape:"spiky",ft:"leaf",drop:["petale","Pétale d'eau"]}]},
  {id:"mines",el:"feu",name:"Mines de Cuivrecœur",lvl:[80,180],set:"des Mines",zt:"#3d3a4c",zb:"#24222e",mons:[
    {id:"taupineur",el:"terre",name:"Taupineur",c:"#7b6a8f",shape:"blob",ft:"ears",drop:["griffe","Griffe usée"]},
    {id:"geodin",el:"air",name:"Géodin",c:"#9b8ec9",shape:"spiky",ft:"crystal",drop:["geode","Éclat de géode"]},
    {id:"rouillard",el:"feu",name:"Rouillard",c:"#b0643a",shape:"tall",ft:"horns",drop:["rouille","Écaille rouillée"]}]},
  {id:"dunes",el:"feu",name:"Dunes Ambrées",lvl:[130,270],set:"des Dunes",zt:"#6b5030",zb:"#3e2e1c",mons:[
    {id:"scaraboule",el:"terre",name:"Scaraboule",c:"#3e8f8a",shape:"blob",ft:"horns",drop:["elytre","Élytre irisé"]},
    {id:"sablin",el:"air",name:"Sablin",c:"#e2b66a",shape:"tall",ft:"none",drop:["sable","Sable chantant"]},
    {id:"mirageon",el:"feu",name:"Mirageon",c:"#f08aa8",shape:"bird",ft:"antenna",drop:["mirage","Plume de mirage"]}]},
  {id:"givre",el:"eau",name:"Pics de Givrecrin",lvl:[195,360],set:"du Givre",zt:"#3e5870",zb:"#22324a",mons:[
    {id:"yetinou",el:"eau",name:"Yétinou",c:"#e8f1f5",shape:"blob",ft:"horns",drop:["fourrure","Fourrure de neige"]},
    {id:"stalagor",el:"terre",name:"Stalagor",c:"#8fc7e0",shape:"spiky",ft:"crystal",drop:["givre","Cœur de givre"]},
    {id:"blizzaron",el:"air",name:"Blizzaron",c:"#b9d4f0",shape:"bird",ft:"none",drop:["souffle","Souffle glacé"]}]},
  {id:"falaises",el:"air",name:"Falaises d'Orageline",lvl:[275,470],set:"des Falaises",zt:"#4a5a70",zb:"#2a3446",mons:[
    {id:"foudrillon",el:"air",name:"Foudrillon",c:"#f2d94a",shape:"bat",ft:"none",drop:["eclair","Aile électrique"]},
    {id:"rocailleux",el:"terre",name:"Rocailleux",c:"#8f8a9c",shape:"golem",ft:"crystal",drop:["galet","Galet d'orage"]},
    {id:"nuageon",el:"eau",name:"Nuageon",c:"#cfe3f5",shape:"ghost",ft:"none",drop:["nuee","Flocon de nuée"]}]},
  {id:"jungle",el:"terre",name:"Jungle d'Émeraude-Lys",lvl:[370,590],set:"de la Jungle",zt:"#2f6a3a",zb:"#1a3e22",mons:[
    {id:"lianard",el:"terre",name:"Lianard",c:"#5fae4a",shape:"snake",ft:"leaf",drop:["liane","Liane souple"]},
    {id:"macaquin",el:"feu",name:"Macaquin",c:"#b9773f",shape:"quad",ft:"none",drop:["poilroux","Poil roussi"]},
    {id:"carnifleur",el:"eau",name:"Carnifleur",c:"#e0508a",shape:"plant",ft:"none",drop:["petalecarn","Pétale carnivore"]}]},
  {id:"recifs",el:"eau",name:"Récifs de Corail-Chant",lvl:[485,700],set:"des Récifs",zt:"#2f7a8a",zb:"#1a4652",mons:[
    {id:"crabouille",el:"eau",name:"Crabouille",c:"#e8684a",shape:"crab",ft:"none",drop:["pince","Pince nacrée"]},
    {id:"meduline",el:"air",name:"Méduline",c:"#c08af0",shape:"jelly",ft:"none",drop:["filament","Filament luisant"]},
    {id:"oursinet",el:"terre",name:"Oursinet",c:"#4f5fa0",shape:"spiky",ft:"none",drop:["piquant","Piquant d'oursin"]}]},
  {id:"volcan",el:"feu",name:"Volcan de Brasemont",lvl:[620,820],set:"du Volcan",zt:"#5a2e24",zb:"#301814",mons:[
    {id:"magmoule",el:"feu",name:"Magmoule",c:"#f0622c",shape:"slime",ft:"flame",drop:["magma","Goutte de magma"]},
    {id:"cendrillard",el:"air",name:"Cendrillard",c:"#6a5a62",shape:"bat",ft:"none",drop:["cendre","Cendre volante"]},
    {id:"scorillon",el:"terre",name:"Scorillon",c:"#8a4a3c",shape:"golem",ft:"horns",drop:["scorie","Scorie brûlante"]}]},
  {id:"ruines",el:"air",name:"Ruines d'Astrelune",lvl:[775,930],set:"des Ruines",zt:"#5a5478",zb:"#34304a",mons:[
    {id:"spectrelin",el:"air",name:"Spectrelin",c:"#a8e8e0",shape:"ghost",ft:"antenna",drop:["voile","Voile spectral"]},
    {id:"gargouillon",el:"terre",name:"Gargouillon",c:"#8a8a9e",shape:"quad",ft:"none",drop:["pierrelune","Pierre de lune"]},
    {id:"runelin",el:"feu",name:"Runelin",c:"#f0a03c",shape:"eye",ft:"horns",drop:["rune","Rune ardente"]}]},
  {id:"abime",el:"eau",name:"Abîme de Nuitombre",lvl:[940,1000],set:"de l'Abîme",zt:"#2e2450",zb:"#18122e",mons:[
    {id:"ombrelin",el:"eau",name:"Ombrelin",c:"#5a4fa8",shape:"jelly",ft:"none",drop:["ombre","Essence d'ombre"]},
    {id:"devoreil",el:"feu",name:"Dévoreil",c:"#c83a5a",shape:"eye",ft:"none",drop:["larme","Larme écarlate"]},
    {id:"neantille",el:"air",name:"Néantille",c:"#7a6a9a",shape:"snake",ft:"crystal",drop:["neant","Écaille du néant"]}]},
];
/* Monstres en plus (5 par zone) : ils apparaissent une fois sur deux, donnent ressources, trophées et entrées de bestiaire,
   et une panoplie de 2 à 6 pièces (marqués extra) */
const MONS_X=[
  [{id:"trefloche",el:"terre",name:"Tréfloche",c:"#7cc46a",shape:"plant",ft:"leaf",drop:["x_trefloche","Trèfle porte-bonheur"]},{id:"bourdonnet",el:"air",name:"Bourdonnet",c:"#f2c94e",shape:"bat",ft:"antenna",drop:["x_bourdonnet","Goutte de miel"]},{id:"limaconne",el:"eau",name:"Limaçonne",c:"#c9a87a",shape:"slime",ft:"antenna",drop:["x_limaconne","Coquille spiralée"]},{id:"coquelor",el:"feu",name:"Coquelor",c:"#e85a3a",shape:"bird",ft:"none",drop:["x_coquelor","Crête de Coquelor"]},{id:"mulotin",el:"terre",name:"Mulotin",c:"#a88a6a",shape:"quad",ft:"ears",drop:["x_mulotin","Moustache de mulot"]}],
  [{id:"hiboulet",el:"air",name:"Hiboulet",c:"#8a7a5a",shape:"bird",ft:"ears",drop:["x_hiboulet","Plume de chouette"]},{id:"glandouille",el:"terre",name:"Glandouille",c:"#9a7040",shape:"blob",ft:"leaf",drop:["x_glandouille","Gland doré"]},{id:"mousseron",el:"eau",name:"Mousseron",c:"#c9b8a0",shape:"cap",ft:"none",drop:["x_mousseron","Pied de mousseron"]},{id:"sylvelin",el:"air",name:"Sylvelin",c:"#9fe0b0",shape:"ghost",ft:"leaf",drop:["x_sylvelin","Brume sylvestre"]},{id:"herissoc",el:"terre",name:"Hérissoc",c:"#7a5a40",shape:"spiky",ft:"ears",drop:["x_herissoc","Piquant de hérisson"]}],
  [{id:"libellune",el:"air",name:"Libellune",c:"#6ad0c0",shape:"bat",ft:"antenna",drop:["x_libellune","Aile de libellule"]},{id:"sangsuel",el:"eau",name:"Sangsuel",c:"#5a4a5a",shape:"snake",ft:"none",drop:["x_sangsuel","Ventouse gluante"]},{id:"feuxfollet",el:"feu",name:"Feu-Follet",c:"#b0f080",shape:"ghost",ft:"flame",drop:["x_feuxfollet","Flammèche des marais"]},{id:"grenouflon",el:"eau",name:"Grenouflon",c:"#3f8a5a",shape:"blob",ft:"horns",drop:["x_grenouflon","Goître sonore"]},{id:"roseline",el:"terre",name:"Roseline",c:"#8aa04a",shape:"plant",ft:"leaf",drop:["x_roseline","Tige de roseau"]}],
  [{id:"chauvefer",el:"feu",name:"Chauvefer",c:"#5a4a5a",shape:"bat",ft:"ears",drop:["x_chauvefer","Aile de suie"]},{id:"lanternix",el:"feu",name:"Lanternix",c:"#f0b040",shape:"eye",ft:"flame",drop:["x_lanternix","Mèche ardente"]},{id:"charbonnet",el:"terre",name:"Charbonnet",c:"#3a3a44",shape:"golem",ft:"none",drop:["x_charbonnet","Morceau de charbon"]},{id:"grisouille",el:"air",name:"Grisouille",c:"#a0a890",shape:"ghost",ft:"none",drop:["x_grisouille","Bulle de grisou"]},{id:"vrillon",el:"terre",name:"Vrillon",c:"#b08a5a",shape:"snake",ft:"crystal",drop:["x_vrillon","Pointe de vrille"]}],
  [{id:"scorpiaf",el:"feu",name:"Scorpiaf",c:"#d08a3a",shape:"crab",ft:"horns",drop:["x_scorpiaf","Dard ambré"]},{id:"tourbillard",el:"air",name:"Tourbillard",c:"#e8d0a0",shape:"ghost",ft:"none",drop:["x_tourbillard","Tourbillon de sable"]},{id:"cactoche",el:"eau",name:"Cactoche",c:"#6aa04a",shape:"plant",ft:"none",drop:["x_cactoche","Épine de cactoche"]},{id:"dromadou",el:"terre",name:"Dromadou",c:"#c8a070",shape:"quad",ft:"ears",drop:["x_dromadou","Poil de dromadou"]},{id:"fennecil",el:"feu",name:"Fennecil",c:"#f0c890",shape:"blob",ft:"ears",drop:["x_fennecil","Oreille de fennec"]}],
  [{id:"pingouflet",el:"eau",name:"Pingouflet",c:"#3a4a6a",shape:"bird",ft:"none",drop:["x_pingouflet","Plume de banquise"]},{id:"phoquin",el:"eau",name:"Phoquin",c:"#c8d8e0",shape:"slime",ft:"none",drop:["x_phoquin","Moustache de phoque"]},{id:"glaconnet",el:"eau",name:"Glaçonnet",c:"#a8e0f8",shape:"spiky",ft:"crystal",drop:["x_glaconnet","Glaçon éternel"]},{id:"loupivre",el:"air",name:"Loupivre",c:"#d0e0ec",shape:"quad",ft:"ears",drop:["x_loupivre","Croc de givre"]},{id:"aurorin",el:"air",name:"Aurorin",c:"#8af0c8",shape:"jelly",ft:"antenna",drop:["x_aurorin","Lueur d'aurore"]}],
  [{id:"grondeur",el:"terre",name:"Grondeur",c:"#6a6a7a",shape:"golem",ft:"horns",drop:["x_grondeur","Tonnerre figé"]},{id:"albatrombe",el:"air",name:"Albatrombe",c:"#e8eef5",shape:"bird",ft:"none",drop:["x_albatrombe","Plume d'albatrombe"]},{id:"brumelin",el:"eau",name:"Brumelin",c:"#aac0d8",shape:"ghost",ft:"antenna",drop:["x_brumelin","Fiole de brume"]},{id:"chevrock",el:"terre",name:"Chevrock",c:"#a09080",shape:"quad",ft:"horns",drop:["x_chevrock","Corne de chevrock"]},{id:"etincelot",el:"feu",name:"Étincelot",c:"#ffe060",shape:"blob",ft:"antenna",drop:["x_etincelot","Étincelle captive"]}],
  [{id:"perroflor",el:"air",name:"Perroflor",c:"#3fc06a",shape:"bird",ft:"leaf",drop:["x_perroflor","Plume tropicale"]},{id:"tigrelin",el:"feu",name:"Tigrelin",c:"#e88a2a",shape:"quad",ft:"ears",drop:["x_tigrelin","Rayure de tigrelin"]},{id:"dendrobulle",el:"eau",name:"Dendrobulle",c:"#3ab0e0",shape:"blob",ft:"none",drop:["x_dendrobulle","Venin bleu"]},{id:"bambouin",el:"terre",name:"Bambouin",c:"#8ac04a",shape:"tall",ft:"leaf",drop:["x_bambouin","Pousse de bambou"]},{id:"anacondor",el:"eau",name:"Anacondor",c:"#4a7a3a",shape:"snake",ft:"horns",drop:["x_anacondor","Mue de serpent"]}],
  [{id:"hippocampin",el:"eau",name:"Hippocampin",c:"#f0a060",shape:"tall",ft:"crystal",drop:["x_hippocampin","Écaille d'hippocampe"]},{id:"poulpinet",el:"eau",name:"Poulpinet",c:"#e06a8a",shape:"jelly",ft:"antenna",drop:["x_poulpinet","Encre de poulpe"]},{id:"tortecaille",el:"terre",name:"Tortécaille",c:"#5a9a7a",shape:"golem",ft:"none",drop:["x_tortecaille","Écaille de tortue"]},{id:"anemonix",el:"air",name:"Anémonix",c:"#f080c0",shape:"plant",ft:"none",drop:["x_anemonix","Tentacule d'anémone"]},{id:"murenard",el:"feu",name:"Murénard",c:"#8a7a3a",shape:"snake",ft:"none",drop:["x_murenard","Dent de murène"]}],
  [{id:"salamandrin",el:"feu",name:"Salamandrin",c:"#f05a2a",shape:"snake",ft:"flame",drop:["x_salamandrin","Queue de salamandre"]},{id:"obsidien",el:"terre",name:"Obsidien",c:"#2a2030",shape:"golem",ft:"crystal",drop:["x_obsidien","Éclat d'obsidienne"]},{id:"fumerol",el:"air",name:"Fumerol",c:"#807070",shape:"ghost",ft:"none",drop:["x_fumerol","Panache de fumée"]},{id:"braisillon",el:"feu",name:"Braisillon",c:"#ff8a3a",shape:"blob",ft:"flame",drop:["x_braisillon","Braise vive"]},{id:"vapeurin",el:"eau",name:"Vapeurin",c:"#e0d0d0",shape:"jelly",ft:"none",drop:["x_vapeurin","Vapeur soufrée"]}],
  [{id:"statuel",el:"terre",name:"Statuel",c:"#b0aab8",shape:"golem",ft:"none",drop:["x_statuel","Fragment de statue"]},{id:"grimoireau",el:"air",name:"Grimoireau",c:"#d8c8a0",shape:"bat",ft:"antenna",drop:["x_grimoireau","Page ancienne"]},{id:"astrolin",el:"air",name:"Astrolin",c:"#c0b0ff",shape:"jelly",ft:"crystal",drop:["x_astrolin","Poussière d'étoile"]},{id:"sphinxou",el:"feu",name:"Sphinxou",c:"#d8b060",shape:"quad",ft:"horns",drop:["x_sphinxou","Énigme gravée"]},{id:"lunaril",el:"eau",name:"Lunaril",c:"#9ad0ff",shape:"eye",ft:"none",drop:["x_lunaril","Éclat lunaire"]}],
  [{id:"abyssal",el:"eau",name:"Abyssal",c:"#2a3a8a",shape:"jelly",ft:"antenna",drop:["x_abyssal","Lueur abyssale"]},{id:"videgueule",el:"feu",name:"Videgueule",c:"#6a2a4a",shape:"crab",ft:"none",drop:["x_videgueule","Mâchoire du vide"]},{id:"spectrombre",el:"air",name:"Spectrombre",c:"#4a3a6a",shape:"ghost",ft:"horns",drop:["x_spectrombre","Cri spectral"]},{id:"cauchemire",el:"feu",name:"Cauchemire",c:"#8a2a6a",shape:"spiky",ft:"crystal",drop:["x_cauchemire","Fragment de cauchemar"]},{id:"baudrillon",el:"eau",name:"Baudrillon",c:"#3a2a5a",shape:"blob",ft:"antenna",drop:["x_baudrillon","Leurre abyssal"]}]];
/* Panoplie des monstres en plus : de 2 à 6 pièces, tirées au hasard une fois pour toutes (d'après le nom du monstre) */
const idRnd=(s,k)=>{let h=2166136261^k;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return((h>>>0)%1000)/1000};
ZONES.forEach((z,i)=>(MONS_X[i]||[]).forEach(m=>z.mons.push({...m,extra:1,setN:2+Math.floor(idRnd(m.id,1)*5),setL:.15+idRnd(m.id,2)*.65})));
/* Tirage d'un monstre de zone : les 8 créatures de la zone apparaissent à chances égales (chacune sert de matériau principal à une classe) */
const pickMon=z=>z.mons[Math.floor(Math.random()*z.mons.length)];
const PROFS = {
  bucheron:{name:"Bûcheron",verb:"Couper",res:[["frene","Frêne"],["chataignier","Châtaignier"],["noyer","Noyer"],["chene","Chêne"],["erable","Érable"],["if","If"],["bouleau","Bouleau"],["merisier","Merisier"],["orme","Orme"],["charme","Charme"],["ebene","Ébène"],["sequoia","Séquoia"]]},
  mineur:{name:"Mineur",verb:"Miner",res:[["fer","Fer"],["cuivre","Cuivre"],["etain","Étain"],["argent","Argent"],["or","Or"],["cobalt","Cobalt"],["zinc","Zinc"],["manganese","Manganèse"],["bauxite","Bauxite"],["platine","Platine"],["mithril","Mithril"],["obsidienne","Obsidienne"]]},
  paysan:{name:"Paysan",verb:"Faucher",res:[["ble","Blé"],["orge","Orge"],["avoine","Avoine"],["houblon","Houblon"],["seigle","Seigle"],["lin","Lin"],["mais","Maïs"],["millet","Millet"],["riz","Riz"],["sarrasin","Sarrasin"],["epeautre","Épeautre"],["quinoa","Quinoa"]]},
  herboriste:{name:"Herboriste",verb:"Cueillir",res:[["ortie","Ortie"],["sauge","Sauge"],["menthe","Menthe"],["melisse","Mélisse"],["edelweiss","Edelweiss"],["mandragore","Mandragore"],["lavande","Lavande"],["thym","Thym"],["belladone","Belladone"],["ginseng","Ginseng"],["orchidee","Orchidée"],["lotus","Lotus"]]},
  pecheur:{name:"Pêcheur",verb:"Pêcher",res:[["p_goujon","Goujon des prés"],["p_ablette","Ablette moussue"],["p_perche","Perche des marais"],["p_chabot","Chabot des galeries"],["p_carpe","Carpe ambrée"],["p_truite","Truite de givre"],["p_vairon","Vairon d'orage"],["p_piranha","Piranha émeraude"],["p_clown","Poisson-clown corail"],["p_anguille","Anguille de braise"],["p_silure","Silure astral"],["p_lanterne","Lanterne abyssale"]]},
};
const UNLOCK=[1,10,20,30,40,50,60,70,80,90,100,110], PROF_MAX=120, PTS_PER_LVL=5;
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
const STAT_LBL={feu:"Feu",eau:"Eau",terre:"Terre",air:"Air",vit:"Vitalité",puissance:"Puissance (tous éléments)",agi:"Agilité",sagesse:"Sagesse",crit:"% Critique",poison:"Poison",brulure:"Brûlure",gelure:"Gelure",saignement:"Saignement",prospection:"Prospection",dmg:"Dégâts",pctXp:"% d'XP",pctEcus:"% d'écus",pctDmg:"% de dégâts",pctSpd:"% de vitesse d'attaque",pctSpell:"% de dégâts des sorts",pctDot:"% de dégâts sur la durée",pctAlly:"% de dégâts des compagnons",pctCdr:"% de recharge des sorts",pctDef:"% de dégâts subis en moins",pctLeech:"% de vol de vie",pctHp:"% de PV max"};
const ALLOC=["vit","sagesse","agi","feu","eau","terre","air"];
