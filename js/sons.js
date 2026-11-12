/* Sons et musique synthétisés (aucun fichier audio). */
/* ================= Sons et musique (synthétisés, aucun fichier) ================= */
let AC=null,master=null,musicGain=null,sfxGain=null,lastHitSfx=0,musicTimer=null,mStep=0;
function audioInit(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.connect(AC.destination);musicGain=AC.createGain();musicGain.connect(master);sfxGain=AC.createGain();sfxGain.connect(master);setVol()}catch(e){AC=null}}
function setVol(){if(!AC)return;const O=S.opt||OPT_DEF;master.gain.value=O.vol*.6;sfxGain.gain.value=O.volSfx;musicGain.gain.value=O.music?.7*O.volMusic:0}
function tone(f,t0,d,type="sine",g=.2,dest){const o=AC.createOscillator(),a=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t0);a.gain.setValueAtTime(0,t0);a.gain.linearRampToValueAtTime(g,t0+.01);a.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(a);a.connect(dest||sfxGain||master);o.start(t0);o.stop(t0+d+.05)}
function sfx(k){if(!AC||!S.opt?.sfx||document.hidden)return;const t=AC.currentTime;
  if(k==="hit"){if(!S.opt.hitSfx||t-lastHitSfx<.07)return;lastHitSfx=t;tone(180+Math.random()*40,t,.08,"square",.05);tone(90,t,.06,"triangle",.08)}
  if(k==="crit"){tone(520,t,.12,"square",.06);tone(780,t+.05,.15,"triangle",.08)}
  if(k==="kill"){[392,523,659].forEach((f,i)=>tone(f,t+i*.06,.16,"triangle",.09))}
  if(k==="coin"){tone(988,t,.08,"square",.04);tone(1319,t+.07,.18,"square",.04)}
  if(k==="pickup"){[784,988,1175,1568].forEach((f,i)=>tone(f,t+i*.05,.2,"sine",.08))}
  if(k==="level"){[523,659,784,1047].forEach((f,i)=>tone(f,t+i*.1,.3,"triangle",.1))}
  if(k==="boss"){[262,330,392,523,659].forEach((f,i)=>tone(f,t+i*.08,.35,"sawtooth",.04))}
  if(k==="fail"){[392,330,262].forEach((f,i)=>tone(f,t+i*.12,.25,"triangle",.08))}
  if(k==="anvil"){tone(1400,t,.12,"square",.05);tone(700,t,.2,"triangle",.1)}
  if(k==="anvilBad"){tone(160,t,.2,"sawtooth",.05)}
  if(k==="event"){tone(440,t,.5,"sine",.07);tone(660,t+.15,.6,"sine",.06)}
}
const SCALE=[0,2,4,7,9],ROOTS=[220,196,174.6,196];
function musicTick(){if(!AC||!S.opt?.music||document.hidden)return;const t=AC.currentTime+.05,bar=Math.floor(mStep/8)%4,root=ROOTS[bar]*Math.pow(2,(ZKEY[S.zone]||0)/12);
  if(mStep%8===0){tone(root/2,t,2.2,"sine",.12,musicGain);tone(root*1.5/2,t,2.2,"sine",.06,musicGain)}
  if(Math.random()<.7){const n=SCALE[rnd(0,4)]+(Math.random()<.3?12:0);tone(root*Math.pow(2,n/12),t,.6,"triangle",.05,musicGain)}
  mStep++}
function musicSync(){setVol();if(S.opt?.music&&AC){if(!musicTimer)musicTimer=setInterval(musicTick,300)}else if(musicTimer){clearInterval(musicTimer);musicTimer=null}}
document.addEventListener("pointerdown",()=>{if(!AC){audioInit();musicSync()}else if(AC.state==="suspended")AC.resume()},{capture:true});

