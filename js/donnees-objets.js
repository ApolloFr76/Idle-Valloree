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
/* Bonus de panoplie progressifs : chaque pièce portée à partir de 2 ajoute un palier (cumulatif) */
/* Bonus de panoplie : les caractéristiques suivent la même courbe que les objets de la zone (budget),
   les bonus en % augmentent plus doucement (×1 en zone 1, ×3,75 dans la dernière zone). */
const SET_BONUS=z=>{const f=budget(z)/budget(0),p=1+z/4;return{2:{vit:6*f},3:{sagesse:4*f},4:{puissance:5*f,pctXp:5*p},5:{prospection:8*f,vit:6*f},6:{crit:2+z,pctEcus:10*p},7:{puissance:8*f,agi:5*f},8:{puissance:12*f,vit:14*f,crit:2+z,pctDmg:15*p}}};
/* Panoplies : une par monstre (8, 4 ou 2 pièces) et une par boss (4 pièces). SETS[clé] = {name,z,n,lvl,el,boss,ids,mon} */
const SETS={};
/* Paliers d'une panoplie : les petites panoplies reprennent les paliers forts du tableau */
const SET_MAP={8:{2:2,3:3,4:4,5:5,6:6,7:7,8:8},6:{2:2,3:3,4:4,5:6,6:7},5:{2:2,3:4,4:5,5:7},4:{2:2,3:4,4:6},3:{2:3,3:5},2:{2:4}},SET_MAP_BOSS={2:3,3:6,4:8};
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
/* Article devant le nom du monstre pour nommer sa panoplie (« du » par défaut) */
const ART={ecorcin:"de l'",renardine:"de la ",crabouille:"de la ",meduline:"de la ",oursinet:"de l'",magmoule:"de la ",ombrelin:"de l'",neantille:"de la ",boss_2:"de la ",boss_6:"de l'",boss_7:"de la ",limaconne:"de la ",glandouille:"de la ",roseline:"de la ",libellune:"de la ",grisouille:"de la ",cactoche:"de la ",tortecaille:"de la ",cauchemire:"de la ",hiboulet:"de l'",herissoc:"de l'",anacondor:"de l'",albatrombe:"de l'",aurorin:"de l'",etincelot:"de l'",obsidien:"de l'",hippocampin:"de l'",anemonix:"de l'",astrolin:"de l'",abyssal:"de l'"};
const SET_SLOTS={8:SLOTS.map(s=>s.id),6:["coiffe","cape","amulette","anneau","bottes","ceinture"],5:["coiffe","cape","amulette","bottes","ceinture"],4:["coiffe","cape","bottes","ceinture"],3:["coiffe","amulette","bottes"],2:["amulette","anneau"],boss:["arme","bouclier","amulette","anneau"]};
ZONES.forEach((z,zi)=>{
  const drops=z.mons.filter(m=>!m.extra).map(m=>m.drop[0]),span=z.lvl[1]-z.lvl[0],main=z.mons.find(m=>m.el===z.el)||z.mons[0];let o=0;
  const mk=(key,m,n,lvl,mult,boss)=>{
    const T=SETS[key]={key,name:(ART[key]||"du ")+m.name,z:zi,n,lvl,el:m.el,boss:!!boss,mon:key,ids:{}};
    SLOTS.filter(sl=>SET_SLOTS[boss?"boss":n].includes(sl.id)).forEach(sl=>{const si=SLOTS.indexOf(sl),stats={};
      const id=key===main.id?`z${zi}_${sl.id}`:`s_${key}_${sl.id}`;
      Object.entries(sl.st).forEach(([k0,w])=>{const k=k0==="EL"?m.el:k0;stats[k]=k==="crit"?Math.round(lvlCrit(lvl)*mult):Math.max(1,Math.round(lvlBudget(lvl)*w*mult))});
      if(EL_DOT[m.el])stats[EL_DOT[m.el]]=Math.max(1,Math.round(lvlBudget(lvl)*.25*mult));   /* DoT de l'élément de la panoplie */
      const recipe=boss?[[m.bres[0],2],[drops[si%3],3+2*zi],[PROFS[sl.g].res[zi][0],5+3*zi]]:[[m.drop[0],4+3*zi],[PROFS[sl.g].res[zi][0],4+3*zi]];
      T.ids[sl.id]=id;ITEMS[id]={id,z:zi,set:key,slot:sl.id,name:`${sl.name} ${T.name}`,stats,recipe,lvl,price:Math.round(12*Math.pow(1+lvl/8,2)*mult)};
    })};
  z.mons.forEach(m=>{if(m.extra){mk(m.id,m,m.setN,z.lvl[0]+Math.round(span*m.setL),1.1);return}if(m===main)mk(m.id,m,8,z.lvl[0],1);else{o++;mk(m.id,m,o===1?4:2,z.lvl[0]+Math.round(span*(o===1?.3:.55)),o===1?1.12:1.2)}});
  mk("boss_"+zi,MON["boss_"+zi],4,z.lvl[0]+Math.round(span*.8),1.35,true);
});
/* Armes lourde / légère : dans chaque monde, l'arme de la grande panoplie frappe fort mais lentement, celle du boss
   vite mais moins fort. Même élément, panoplies différentes : il faut choisir. fx = bonus fixes, non multipliés par l'amélioration. */
ZONES.forEach((z,zi)=>{const h=ITEMS[`z${zi}_arme`],l=ITEMS[`s_boss_${zi}_arme`];if(h&&l){h.lvl=l.lvl;h.price=l.price;h.stats={...l.stats,dmg:Math.round(l.stats.dmg*1.5)};h.fx={pctDmg:25,pctSpd:-25};h.wkind="lourde";l.fx={pctDmg:-10,pctSpd:15};l.wkind="légère"}});
/* Pièces partagées : dans chaque monde, les panoplies d'un même élément sont reliées deux à deux par un emplacement commun ;
   la pièce de cet emplacement compte pour les deux panoplies (also = autres panoplies comptées). */
const SHARE_SLOTS=["amulette","coiffe","bottes","cape","ceinture"];
ZONES.forEach((z,zi)=>{const L=Object.values(SETS).filter(t=>t.z===zi&&!t.boss);["feu","eau","terre","air"].forEach(el=>{const G=L.filter(t=>t.el===el);
  for(let i=0;i+1<G.length;i++){const A=G[i],B=G[i+1],sl=SHARE_SLOTS.find(s=>A.ids[s]&&B.ids[s]);if(!sl)continue;
    [[A,B],[B,A]].forEach(([X,Y])=>{const it=ITEMS[X.ids[sl]];(it.also=it.also||[]).push(Y.key);(X.shared=X.shared||[]).push([sl,Y.key])})}})});
/* Compagnons : [id, nom, dégâts/s par niveau, coût de base, couleur] */
const ALLIES=[["ecuyer","Écuyer Bertin",2,50,"#d9a46a"],["chasseuse","Chasseuse Lina",9,400,"#8fd16a"],["rat","Rat pestilent",20,1500,"#8a8478"],["moine","Moine Tao",40,3000,"#f0c35a"],["sorciere","Sorcière Mirabelle",180,25000,"#a99ee0"],
  ["apothicaire","Apothicaire Mortimer",420,8e4,"#4f7a4a"],["golem","Golem de pierre",850,2e5,"#aab6c4"],["dragonnet","Dragonnet Ambre",4000,1.6e6,"#ef7d4a"],["serpent","Serpent d'émeraude",9000,5e6,"#3fae5a"],["phenix","Phénix d'aube",2e4,1.5e7,"#ff8ab0"]];
/* Compagnons qui posent des DoT : [type, charges par seconde] (en plus de leurs dégâts) */
const ALLY_DOT={rat:["poison",1],apothicaire:["poison",2],serpent:["poison",3],sorciere:["gelure",.5],golem:["saignement",.5],dragonnet:["brulure",.5],phenix:["brulure",1]};
/* Boutique d'améliorations */
const UPGS=[
  ["gants1","Gants renforcés","Dégâts de clic ×2",300],["auto1","Clic automatique","2 clics par seconde",3000],["sac1","Sac agrandi","+2 000 de poids",1500],
  ["outils1","Outils affûtés","Récolte 20 % plus rapide",2000],["aimant","Aimant à trésors","Objets cliquables 30 % plus fréquents",8000],["bourse","Bourse de marchand","Ventes +25 %",12000],
  ["allie1","Entraînement","Compagnons ×1,5",20000],["sablier","Sablier","+10 s contre les boss et dans la tour",15000],["gants2","Gants de maître","Dégâts de clic ×3",25000],
  ["rythme","Rythme","Combo maximum 150 au lieu de 100",30000],["sac2","Grand sac","+8 000 de poids",40000],["outils2","Outils de maître","Récolte 20 % plus rapide",60000],
  ["auto2","Clic automatique II","+4 clics par seconde",80000],["allie2","Tactique de groupe","Compagnons ×1,5",5e5],["allie3","Bannière de guerre","Compagnons ×2",2e7],
  ["sp1","Sort automatique I","Votre 1er sort peut se lancer tout seul (case Auto)",5000],["sp2","Sort automatique II","Votre 2e sort peut se lancer tout seul (case Auto)",60000],["sp3","Sort automatique III","Votre 3e sort peut se lancer tout seul (case Auto)",6e5],
  ["potauto","Potions automatiques","Boit une potion de soin tout seul sous le seuil de PV, et enchaîne les potions à effet cochées « Auto » (sagesse, force…) dès que l'effet se termine",10000],["cdr1","Concentration","Sorts 10 % plus rapides",25000],["cdr2","Maîtrise des arcanes","Sorts encore 10 % plus rapides",3e5],
  ["bossauto","Défi automatique","Défie le boss tout seul dès que les 10 victoires sont faites",40000],
  ["dgauto","Explorateur","Entre tout seul dans le donjon de la zone dès que vous avez sa clé (case Donjon auto)",80000],
  ["vendeur","Colporteur","Vend la plus grosse pile de ressources quand le sac est plein (case dans Options)",15000],["qauto","Messager","Récupère tout seul la récompense des quêtes terminées (case dans Options)",30000],
  ["fortauto","Flasque de fortune","Boit une potion de fortune au début de chaque donjon (case dans Options)",45000],["forgex","Forge express","Forge sans mini-jeu : rareté au moins Rare (option Mini-jeu de forge désactivée)",50000],
  ["zoneauto","Éclaireur","Passe au monde suivant dès que son boss est battu et que vous avez le niveau (case dans Options)",60000],["tourauto","Grimpeur","Relance la tour quand elle se termine, depuis 80 % du record (case dans Options)",100000],
  ["coffre","Coffre garni","+1 objet de la zone dans le coffre final des donjons",120000],["kmag","Aimant à clés","Chance doublée de trouver une clé de boss sur les monstres",150000],
  ["allyel","Compagnons d'élite","Vos compagnons posent chaque seconde un état de votre élément (poison, brûlure, gelure, saignement)",200000],["sacx","Sac sans fond","Capacité du sac doublée",250000]];
/* Apparence de l'armure : chaque panoplie a un style (fin de jeu : cristal ; grandes panoplies et boss : plaques ; sinon selon le monstre)
   et la couleur de son élément teintée par celle de son monstre. heroArm() décrit les pièces visibles portées par le héros. */
const ARM_STYLES=["cuir","robe","ecailles","fourrure"];
const armStyle=t=>t.z>=9?"cristal":t.boss||t.n===8?"plaques":ARM_STYLES[[...t.key].reduce((a,ch)=>a+ch.charCodeAt(0),0)%ARM_STYLES.length];
const armCol=t=>{const a=ELEMS[t.el].c,b=(MON[t.mon]&&MON[t.mon].c)||a,h=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16)),A=h(a),B=h(b);return"#"+A.map((v,i)=>Math.round(v*.7+B[i]*.3).toString(16).padStart(2,"0")).join("")};
let armSig=null,armObj=null;
function heroArm(){if(!S||!S.cls||(S.opt&&S.opt.showArmor===false))return null;let sig="";const P={};
  ["coiffe","cape","bottes","ceinture"].forEach(sl=>{const u=S.equip[sl],i=u&&S.items.find(x=>x.u===u),it=i&&ITEMS[i.id];if(it&&it.set&&SETS[it.set]){P[sl]=SETS[it.set];sig+=sl+":"+it.set+"|"}});
  if(!sig)return null;if(sig!==armSig){armSig=sig;armObj={k:sig};for(const sl in P)armObj[sl]={s:armStyle(P[sl]),c:armCol(P[sl])}}return armObj}
