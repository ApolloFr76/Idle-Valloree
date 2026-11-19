/* Disposition de l'écran : le monde occupe tout l'écran, les onglets sont une barre à droite
   (en bas sur téléphone) et le contenu de l'onglet s'ouvre dans un tiroir posé sur le monde.
   Le journal et les objectifs se replient en haut à gauche du monde ; ils se replient d'eux-mêmes
   quand le tiroir est ouvert pour laisser le combat visible, et reviennent à sa fermeture. */
const PHONE=matchMedia("(max-width:700px)");
const UI={o:false,last:null,sidePref:true,stale:false,
  /* tiroir plein écran (téléphone) : le monde est entièrement caché, inutile de le dessiner */
  covered(){return this.o&&PHONE.matches},
  /* ouvre ou ferme le tiroir */
  open(v){if(!v){const a=$("app"),t=document.querySelector("#tabs .tab.on");if(a&&t&&a.contains(document.activeElement))t.focus({preventScroll:true})}   /* le focus revient à l'onglet */
    this.o=!!v;document.body.classList.toggle("drawer-open",this.o);const a=$("app");if(a){a.inert=!this.o;a.setAttribute("aria-hidden",this.o?"false":"true")}
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

/* Accessibilité au clavier et aux lecteurs d'écran :
   - barre d'onglets : flèches, Début et Fin pour passer d'un onglet à l'autre (Entrée ou Espace pour l'ouvrir) ;
   - fenêtres (#ov) : le focus y entre à l'ouverture, Tab y reste, Échap ferme quand il y a un bouton de fermeture,
     et le focus revient où il était à la fermeture. */
const A11Y=(()=>{
  const FOC='button:not([disabled]),[href],input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const focusables=root=>[...root.querySelectorAll(FOC)].filter(e=>e.offsetParent!==null);
  const ov=$("ov"),tabs=$("tabs");let back=null,last=null;
  const key=e=>e&&e.dataset?[e.dataset.a,e.dataset.k||e.dataset.t||e.dataset.i||""].join("|"):"";
  ov.addEventListener("focusin",e=>{last=key(e.target)});
  function sync(){
    if(!ov.hidden){if(!back)back=document.activeElement;
      const h=ov.querySelector("h2");if(h){h.id=h.id||"ovTitle";ov.setAttribute("aria-labelledby",h.id)}else ov.removeAttribute("aria-labelledby");
      if(!ov.contains(document.activeElement)){const L=focusables(ov),f=L.find(x=>last&&key(x)===last)||ov.querySelector(".pri:not([disabled])")||L[0];if(f)f.focus({preventScroll:true})}}
    else{last=null;if(back){const b=back;back=null;if(b.isConnected&&b.offsetParent!==null&&b!==document.body)b.focus({preventScroll:true})}}}
  new MutationObserver(()=>queueMicrotask(sync)).observe(ov,{attributes:true,attributeFilter:["hidden"],childList:true});
  document.addEventListener("keydown",e=>{
    if(!ov.hidden){
      if(e.key==="Tab"){const L=focusables(ov);if(!L.length)return;const i=L.indexOf(document.activeElement);
        if(i<0||e.shiftKey&&i===0||!e.shiftKey&&i===L.length-1){e.preventDefault();L[i<0||!e.shiftKey?0:L.length-1].focus()}return}
      if(e.key==="Escape"&&(typeof forge==="undefined"||!forge)&&(typeof mg==="undefined"||!mg)){const c=ov.querySelector('[data-a="closeOv"]');if(c){e.preventDefault();e.stopImmediatePropagation();c.click()}}
      return}
    if(!tabs.contains(e.target))return;
    const L=[...tabs.querySelectorAll('.tab:not([aria-disabled="true"])')],i=L.indexOf(e.target);if(i<0)return;
    const j={ArrowDown:i+1,ArrowRight:i+1,ArrowUp:i-1,ArrowLeft:i-1,Home:0,End:L.length-1}[e.key];if(j==null)return;
    e.preventDefault();L[(j+L.length)%L.length].focus()});
  /* téléphone : la barre d'onglets est horizontale */
  const ori=()=>tabs.setAttribute("aria-orientation",PHONE.matches?"horizontal":"vertical");ori();PHONE.addEventListener?PHONE.addEventListener("change",ori):PHONE.addListener(ori);
  return{focusables}})();
