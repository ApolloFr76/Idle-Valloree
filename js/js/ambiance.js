/* Ambiance animée par biome et tonalité de la musique. */
/* ================= Ambiance animée par biome (particules pixel derrière l'interface) ================= */
const AMB={prairie:{n:26,c:["#ffe98a","#ffffff","#ff9ab8"],k:"float"},bois:{n:30,c:["#c6e86b","#8fd16a","#d9a46a"],k:"leaf"},marais:{n:28,c:["#e8f0a0","#c6e86b"],k:"fly"},
  mines:{n:30,c:["#c9b8ff","#9b8ee0","#ffd86a"],k:"dust"},dunes:{n:46,c:["#fff0b8","#ecc47a"],k:"sand"},givre:{n:60,c:["#ffffff","#dfefff"],k:"snow"},
  falaises:{n:30,c:["#ffffff","#dfe8f0"],k:"wind"},jungle:{n:34,c:["#6fc04e","#ff6fa8","#ffd84a"],k:"leaf"},recifs:{n:34,c:["#bfefff","#ffffff"],k:"bubble"},
  volcan:{n:46,c:["#ffb03c","#ff6a2c","#ffe08a"],k:"ember"},ruines:{n:34,c:["#e8dcff","#b9a6ff","#ffffff"],k:"mote"},abime:{n:40,c:["#c58aff","#7a4ad0","#ff8ae0"],k:"mote"}};
let ambP=[],ambT=0,ambOn=false;
function ambReset(){ambP=[];const cv=$("amb");if(!cv)return;const A=AMB[biomeId]||AMB.prairie;for(let i=0;i<A.n;i++)ambP.push(ambNew(A,true))}
function ambNew(A,any){const W=innerWidth,H=innerHeight,k=A.k,up=k==="bubble"||k==="ember"||k==="mote"||k==="fly";
  return{x:Math.random()*W,y:any?Math.random()*H:(up?H+10:-10),c:A.c[Math.random()*A.c.length|0],s:k==="snow"||k==="ember"?2+(Math.random()*2|0):k==="wind"?1:2+(Math.random()*2|0),
    vx:k==="wind"?160+Math.random()*120:k==="sand"?70+Math.random()*60:k==="leaf"?10+Math.random()*25:(Math.random()-.5)*14,
    vy:k==="snow"?18+Math.random()*24:k==="leaf"?22+Math.random()*20:k==="bubble"?-(18+Math.random()*18):k==="ember"?-(24+Math.random()*30):k==="float"||k==="fly"||k==="mote"?-(4+Math.random()*8):k==="sand"?4+Math.random()*6:k==="dust"?3:0,
    ph:Math.random()*6.28,a:.35+Math.random()*.5}}
function ambLoop(t){requestAnimationFrame(ambLoop);const cv=$("amb");if(!cv)return;const on=S&&S.opt&&S.opt.ambiance&&!S.opt.reduceMotion&&!document.hidden;
  if(!on){if(ambOn){cv.getContext("2d").clearRect(0,0,cv.width,cv.height);ambOn=false}ambT=t;return}ambOn=true;
  const dt=Math.min(.05,(t-ambT)/1000||0);ambT=t;if(cv.width!==innerWidth||cv.height!==innerHeight){cv.width=innerWidth;cv.height=innerHeight}
  const g=cv.getContext("2d"),A=AMB[biomeId]||AMB.prairie,W=cv.width,H=cv.height;g.clearRect(0,0,W,H);
  ambP.forEach((p,i)=>{p.ph+=dt*2;p.x+=(p.vx+(A.k==="leaf"||A.k==="snow"||A.k==="float"||A.k==="mote"||A.k==="fly"?Math.sin(p.ph)*12:0))*dt;p.y+=p.vy*dt;
    if(p.x>W+20||p.x<-20||p.y>H+20||p.y<-20)ambP[i]=ambNew(A,false);
    const fl=A.k==="fly"||A.k==="mote"?(.5+.5*Math.sin(p.ph*2)):1;g.globalAlpha=p.a*fl;g.fillStyle=p.c;
    if(A.k==="wind")g.fillRect(p.x|0,p.y|0,18,1);else if(A.k==="leaf"){g.fillRect(p.x|0,p.y|0,3,2);g.fillRect((p.x|0)+1,(p.y|0)-1,2,1)}
    else if(A.k==="bubble"){g.strokeStyle=p.c;g.lineWidth=1;g.strokeRect((p.x|0)+.5,(p.y|0)+.5,p.s+1,p.s+1)}else g.fillRect(p.x|0,p.y|0,p.s,p.s)});g.globalAlpha=1}
requestAnimationFrame(ambLoop);
/* Musique : la tonalité change selon la zone */
const ZKEY=[0,-2,-5,-3,2,-7,4,1,-4,-1,3,-6];

