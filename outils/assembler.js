/* Assemble le jeu pour la publication : tous les scripts de index.html en un seul fichier jeu.js, toutes les feuilles de style
   en un seul jeu.css, dans le dossier _site/ (moins de requêtes au chargement, surtout sur téléphone).
   Le jeu reste développé tel quel (index.html + js/ + style/, ouvert en file://) : cet outil ne sert qu'au moment de publier.
   Utilisation : node outils/assembler.js        (Node 18 ou plus, aucune dépendance)
   Publication automatique : .github/workflows/publier.yml le lance à chaque envoi sur main. */
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const RACINE=path.join(__dirname,".."),SORTIE=path.join(RACINE,"_site");
const lire=f=>fs.readFileSync(path.join(RACINE,f),"utf8");
const html=lire("index.html");
const scripts=[...html.matchAll(/<script src="([^"]+)"><\/script>\n?/g)];
const styles=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)">\n?/g)];
if(!scripts.length||!styles.length){console.error("index.html : aucun script ou aucune feuille de style trouvé");process.exit(1)}
/* chaque fichier garde son nom en commentaire ; « ; » entre deux fichiers au cas où l'un finirait sans point-virgule */
const js=scripts.map(m=>`/* ===== ${m[1]} ===== */\n${lire(m[1])}\n;`).join("\n");
const css=styles.map(m=>`/* ===== ${m[1]} ===== */\n${lire(m[1])}`).join("\n");
const empreinte=t=>crypto.createHash("sha1").update(t).digest("hex").slice(0,10);   /* change à chaque version : le navigateur ne garde pas l'ancienne */
let page=html;
page=page.replace(styles[0][0],`<link rel="stylesheet" href="jeu.css?v=${empreinte(css)}">\n`);for(const m of styles.slice(1))page=page.replace(m[0],"");
page=page.replace(scripts[0][0],`<script src="jeu.js?v=${empreinte(js)}"></script>\n`);for(const m of scripts.slice(1))page=page.replace(m[0],"");
fs.rmSync(SORTIE,{recursive:true,force:true});fs.mkdirSync(SORTIE,{recursive:true});
fs.writeFileSync(path.join(SORTIE,"index.html"),page);fs.writeFileSync(path.join(SORTIE,"jeu.js"),js);fs.writeFileSync(path.join(SORTIE,"jeu.css"),css);
fs.writeFileSync(path.join(SORTIE,".nojekyll"),"");
const ko=n=>(n/1024).toFixed(0)+" Ko";
console.log(`_site/ prêt : ${scripts.length} scripts → jeu.js (${ko(js.length)}), ${styles.length} feuilles de style → jeu.css (${ko(css.length)})`);
