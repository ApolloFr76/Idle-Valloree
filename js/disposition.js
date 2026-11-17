/* Disposition de l'écran : le monde occupe tout l'écran, les onglets sont une barre à droite
   (en bas sur téléphone) et le contenu de l'onglet s'ouvre dans un tiroir posé sur le monde.
   Le journal et les objectifs se replient en haut à gauche du monde ; ils se replient d'eux-mêmes
   quand le tiroir est ouvert pour laisser le combat visible, et reviennent à sa fermeture. */
const PHONE=matchMedia("(max-width:700px)");
const UI={o:false,last:null,sidePref:true,stale:false,
  /* tiroir plein écran (téléphone) : le monde est entièrement caché, inutile de le dessiner */
  covered(){return this.o&&PHONE.matches},
  /* ouvre ou ferme le tiroir */
  open(v){this.o=!!v;document.body.classList.toggle("drawer-open",this.o);const a=$("app");if(a){a.inert=!this.o;a.setAttribute("aria-hidden",this.o?"false":"true")}
    this.showSide(!this.o&&this.sidePref);if(this.o&&this.stale)renderPanel(true);
    try{localStorage.setItem("vallore-tiroir",this.o?"1":"0")}catch(e){}
    if(typeof tutoI!=="undefined"&&tutoI>=0)setTimeout(()=>{if(tutoI>=0)tutoDraw()},280)},
  /* appelé après chaque rendu du panneau : un changement d'onglet ouvre le tiroir */
  sync(){if(this.last!==null&&S.tab!==this.last&&!this.o)this.open(true);this.last=S.tab;
    const t=$("dTitle");if(t){const n=tabName(S.tab);if(t.textContent!==n)t.textContent=n}},
  showSide(v){document.body.classList.toggle("side-closed",!v);const b=$("sideTog");if(b)b.setAttribute("aria-expanded",v?"true":"false")},
  /* bouton « Journal » : tiroir fermé, c'est un réglage mémorisé ; tiroir ouvert, un simple coup d'œil */
  toggleSide(){const v=document.body.classList.contains("side-closed");this.showSide(v);
    if(!this.o){this.sidePref=v;try{localStorage.setItem("vallore-journal",v?"1":"0")}catch(e){}}}
};
(()=>{let o=false;try{o=localStorage.getItem("vallore-tiroir")==="1";const j=localStorage.getItem("vallore-journal");UI.sidePref=j===null?innerHeight>=820&&innerWidth>700:j!=="0"}catch(e){}
  UI.open(o);
  /* hauteur réelle de l'en-tête : le tiroir s'ouvre juste en dessous */
  const hd=document.querySelector("header.top"),setH=()=>document.documentElement.style.setProperty("--hh",(hd?Math.round(hd.getBoundingClientRect().height):56)+"px");
  if(hd&&window.ResizeObserver)new ResizeObserver(setH).observe(hd);addEventListener("resize",setH);setH()})();
