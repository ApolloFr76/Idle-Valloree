/* Contrôle du chargement (chargé en premier) : si un script utilise au chargement une fonction ou une constante
   définie dans un fichier chargé plus tard, la console le dit clairement au lieu d'une simple « ReferenceError ».
   Signale aussi un même nom déclaré dans deux fichiers. Voir « Ordre des scripts » dans CLAUDE.md. */
const CHARGE={fini:false,err:[]};
addEventListener("error",e=>{if(CHARGE.fini||!e||!e.error)return;const x=e.error,f=(e.filename||"").replace(/^.*\/(js\/)/,"$1").replace(/^.*\//,"").replace(/\?.*$/,"");
  /* même nom déclaré dans deux fichiers (const, let, function) : le second fichier ne se charge pas du tout */
  if(x instanceof SyntaxError&&/already been declared|redeclar/i.test(x.message)){CHARGE.err.push(f+" : "+x.message);
    console.error(`[Scripts] ${f} : ${x.message}. Ce nom existe déjà dans un autre fichier (tous partagent la même portée) : le renommer. Tout ${f} est ignoré.`);return}
  if(!(x instanceof ReferenceError||x instanceof TypeError))return;CHARGE.err.push(f+" : "+x.message);
  console.error(`[Ordre des scripts] ${f}, ligne ${e.lineno} : ${x.message}. Ce nom est sans doute défini dans un fichier chargé après ${f} : vérifier l'ordre des <script> dans index.html.`)});
addEventListener("DOMContentLoaded",()=>{CHARGE.fini=true});
