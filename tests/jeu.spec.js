/* Test de fumée : le jeu se charge sans erreur, on crée un personnage, il combat tout seul, la partie se sauvegarde.
   Plus quelques vérifications de la sauvegarde (migrations, import abîmé). Supabase est coupé : le jeu doit marcher sans lui. */
const{test,expect}=require("@playwright/test");
const path=require("path"),{pathToFileURL}=require("url");
const PAGE=pathToFileURL(path.join(__dirname,"..",process.env.JEU_PAGE||"index.html")).href;

/* ouvre le jeu, Supabase coupé, et relève toutes les erreurs de la page */
async function ouvrir(page,avant){
  const err=[];page.on("pageerror",e=>err.push("pageerror : "+e.message));
  page.on("console",m=>{if(m.type()==="error"&&!/supabase|Failed to load resource|net::ERR/i.test(m.text()))err.push("console : "+m.text())});
  await page.route(/supabase\.co/,r=>r.abort());
  if(avant)await page.addInitScript(avant);
  await page.goto(PAGE);await page.waitForFunction(()=>typeof ACCUEIL!=="undefined");
  return err}
/* quitte l'écran d'accueil (et crée un héros s'il n'y en a pas) */
async function jouer(page,classe="guerrier"){
  await page.locator('[data-a="accGo"]:visible').first().click();
  if(await page.locator('[data-a="start"]').count()){await page.locator(`[data-a="pick"][data-k="${classe}"]`).click();await page.locator('[data-a="start"]').click()}
  await page.waitForFunction(()=>S&&S.cls&&started);
  await page.evaluate(()=>{if(tutoI>=0)tutoEnd();if(paused)setPause(false)})}   /* la visite guidée met le jeu en pause */

test("le jeu démarre, combat seul et sauvegarde, sans erreur",async({page})=>{
  const err=await ouvrir(page);await jouer(page);
  await page.waitForFunction(()=>{if(tutoI>=0)tutoEnd();return S.kills>=1&&S.time>5},null,{timeout:45e3,polling:250});   /* les visites « nouveauté » mettent le jeu en pause : on les ferme */
  const r=await page.evaluate(()=>{save();const d=JSON.parse(localStorage.getItem(SAVE_KEY));return{v:d.v,V:SAVE_V,cls:d.cls,born:d.born,charge:CHARGE.err}});
  expect(r.cls).toBe("guerrier");expect(r.v).toBe(r.V);expect(r.born).toBeGreaterThan(0);expect(r.charge).toEqual([]);
  /* chaque onglet ouvert s'affiche sans erreur */
  const tabs=await page.evaluate(()=>TABS.map(t=>t[0]).filter(tabOpen));
  for(const t of tabs){await page.evaluate(k=>{S.tab=k;UI.open(true);renderPanel(true)},t);await expect(page.locator("#panel")).not.toBeEmpty()}
  expect(err).toEqual([])});

test("toutes les classes se dessinent",async({page})=>{
  const err=await ouvrir(page);
  const n=await page.evaluate(()=>Object.keys(CLASSES).map(k=>PX.hero(k,CLASSES[k].col)).filter(u=>/^(data|blob):/.test(u)).length);
  expect(n).toBe(await page.evaluate(()=>Object.keys(CLASSES).length));
  const m=await page.evaluate(()=>Object.values(MON).slice(0,40).every(x=>/^(data|blob):/.test(PX.monster(x))));expect(m).toBe(true);
  expect(err).toEqual([])});

test("une ancienne sauvegarde (version 1) est migrée",async({page})=>{
  const err=await ouvrir(page,()=>{if(sessionStorage.getItem("fait"))return;sessionStorage.setItem("fait",1);
    localStorage.setItem("vallore-save-v1",JSON.stringify({v:1,rz:2,cls:"mage",name:"Ancien",lvl:12,xp:0,ecus:500,zone:0,items:[],equip:{},res:{},jobs:{},st:{time:3600},opt:{autoSellFull:true},last:Date.now()-60e3}))});
  const r=await page.evaluate(()=>({v:S.v,V:SAVE_V,vendeur:!!(S.up&&S.up.vendeur),forge:S.opt.forgeQte,born:S.born,lvl:S.lvl}));
  expect(r.v).toBe(r.V);expect(r.vendeur).toBe(true);expect(r.forge).toBe(true);expect(r.lvl).toBe(12);expect(r.born).toBeLessThan(Date.now()-3600e3+5e3);
  await jouer(page);expect(err).toEqual([])});

test("un import abîmé est refusé, un bon import est réparé",async({page})=>{
  const err=await ouvrir(page);await jouer(page);
  const r=await page.evaluate(()=>{const ok={cls:"archer",lvl:5,ecus:10,items:[{u:1,id:"inconnu"}],equip:{arme:1},res:{bois:NaN}};
    return{faux:saveErr({cls:"archer",lvl:"beaucoup"}),classe:saveErr({cls:"pirate",lvl:3}),liste:saveErr({cls:"archer",lvl:3,items:{}}),
      bon:saveErr(ok),objets:ok.items.length,equip:ok.equip.arme,res:ok.res.bois}});
  expect(r.faux).not.toBe("");expect(r.classe).not.toBe("");expect(r.liste).not.toBe("");
  expect(r.bon).toBe("");expect(r.objets).toBe(0);expect(r.equip).toBeNull();expect(r.res).toBe(0);
  expect(err).toEqual([])});

test("affichage téléphone : onglets en bas, sans erreur",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const err=await ouvrir(page);await jouer(page);
  await page.waitForTimeout(1500);
  const b=await page.locator("#tabs").boundingBox();expect(b.y+b.height).toBeGreaterThan(800);
  expect(err).toEqual([])});

test("retour après 10 min : récapitulatif de la session, statistiques à vie",async({page})=>{
  const err=await ouvrir(page);await jouer(page);
  const r=await page.evaluate(()=>{S.sess=Object.assign(sessSnap(),{play:(S.st.time||0)-900,kills:S.kills-25,lvl:Math.max(1,S.lvl-2),xp:0,maxHit:1});S.st.maxHit=999;
    S.afkSince=Date.now()-10*60e3;const s=settleAfk();if(comeShow(s))showOffline(s);return{rec:!!(s&&s.rec),nouvelle:S.sess.play===S.st.time}});
  expect(r.rec).toBe(true);expect(r.nouvelle).toBe(true);
  await expect(page.locator("#ov")).toContainText("Votre dernière session");await expect(page.locator("#ov")).toContainText("Nouveaux records");
  await page.keyboard.press("Escape");await expect(page.locator("#ov")).toBeHidden();   /* Échap ferme la fenêtre */
  await page.evaluate(()=>{ptab="stats";S.tab="perso";UI.open(true);renderPanel(true)});
  await expect(page.locator("#panel")).toContainText("Commencée le");await expect(page.locator("#panel")).toContainText("Poissons pêchés");
  expect(err).toEqual([])});

test("clavier : flèches dans la barre d'onglets",async({page})=>{
  const err=await ouvrir(page);await jouer(page);
  await page.evaluate(()=>{S.tab="perso";renderPanel(true)});
  await page.locator("#tab-perso").focus();await page.keyboard.press("ArrowDown");
  expect(await page.evaluate(()=>document.activeElement.dataset.t)).not.toBe("perso");
  expect(await page.locator("#tab-perso").getAttribute("aria-selected")).toBe("true");
  expect(err).toEqual([])});

test("compte en ligne : le voyant de synchronisation suit les envois (Supabase simulé)",async({page})=>{
  let panne=false;const err=[];page.on("pageerror",e=>err.push(e.message));
  await page.addInitScript(()=>localStorage.setItem("vallore-compte-v1",JSON.stringify({pseudo:"testeur",uid:"u1",at:"jeton",rt:"r",exp:Date.now()+36e5,syncAt:null})));
  await page.route(/supabase\.co/,r=>{const u=r.request().url(),m=r.request().method();
    if(panne)return r.fulfill({status:500,contentType:"application/json",body:'{"message":"panne"}'});
    if(/health/.test(u))return r.fulfill({status:200,body:"{}"});
    if(/\/saves/.test(u))return r.fulfill({status:200,contentType:"application/json",body:m==="GET"?"[]":JSON.stringify([{updated_at:new Date().toISOString()}])});
    return r.fulfill({status:200,contentType:"application/json",body:"[]"})});
  await page.goto(PAGE);await page.waitForFunction(()=>typeof ACCUEIL!=="undefined");await jouer(page);
  await expect(page.locator("#syncBtn")).toHaveClass(/s-ok/,{timeout:15e3});
  panne=true;await page.evaluate(()=>COMPTE.act("accPush")).catch(()=>{});
  await expect(page.locator("#syncBtn")).toHaveClass(/s-err/);
  expect(err).toEqual([])});

test("compte en ligne : jeton expiré plus tôt que prévu → renouvelé, puis l'envoi réussit",async({page})=>{
  const err=[],vu={refresh:0,refus:0};page.on("pageerror",e=>err.push(e.message));
  await page.addInitScript(()=>localStorage.setItem("vallore-compte-v1",JSON.stringify({pseudo:"testeur",uid:"u1",at:"vieux",rt:"r1",exp:Date.now()+36e5,syncAt:null})));
  await page.route(/supabase\.co/,r=>{const q=r.request(),u=q.url(),auth=q.headers()["authorization"]||"";
    if(/grant_type=refresh_token/.test(u)){vu.refresh++;return r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({access_token:"neuf",refresh_token:"r2",expires_in:3600,user:{id:"u1"}})})}
    if(/\/rest\//.test(u)&&auth==="Bearer vieux"){vu.refus++;return r.fulfill({status:401,contentType:"application/json",body:'{"code":"PGRST303","message":"JWT expired"}'})}
    if(/\/saves/.test(u))return r.fulfill({status:200,contentType:"application/json",body:q.method()==="GET"?"[]":JSON.stringify([{updated_at:new Date().toISOString()}])});
    return r.fulfill({status:200,contentType:"application/json",body:"[]"})});
  await page.goto(PAGE);await page.waitForFunction(()=>typeof ACCUEIL!=="undefined");await jouer(page);
  await expect(page.locator("#syncBtn")).toHaveClass(/s-ok/,{timeout:15e3});
  expect(vu.refus).toBeGreaterThan(0);expect(vu.refresh).toBe(1);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem("vallore-compte-v1")).at)).toBe("neuf");
  expect(err).toEqual([])});
