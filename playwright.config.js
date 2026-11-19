/* Tests du jeu dans un vrai navigateur (Chromium). Lancer : npm test   (après npm install et npx playwright install chromium) */
const{defineConfig}=require("@playwright/test");
module.exports=defineConfig({testDir:"tests",timeout:90e3,workers:2,reporter:"list",
  use:{browserName:"chromium",viewport:{width:1920,height:1080}}});
