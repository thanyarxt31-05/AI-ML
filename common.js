
const COLORS = ['#7c9cff','#5eead4','#fb7185','#fbbf24','#c084fc','#60a5fa'];
function randn(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function makeClassification(n=140, spread=.85){
  const pts=[];
  for(let i=0;i<n;i++){const c=i%2, x=(c?1:-1)*1.4+randn()*spread, y=(c?1:-1)*1.2+randn()*spread;pts.push({x,y,c})}
  return pts;
}
function makeRegression(n=80, noise=.55){
  const pts=[];for(let i=0;i<n;i++){let x=-4+8*i/(n-1);pts.push({x,y:1.55*x+0.6+randn()*noise})}return pts;
}
function makeClusters(n=180,k=3,spread=.55){
  const centers=[];for(let i=0;i<k;i++){const a=i*2*Math.PI/k;centers.push({x:2.1*Math.cos(a),y:2.1*Math.sin(a)})}
  return Array.from({length:n},(_,i)=>{const c=i%k;return{x:centers[c].x+randn()*.55,y:centers[c].y+randn()*spread,c}})
}
function fitLine(data){let sx=0,sy=0,sxx=0,sxy=0,n=data.length;for(const p of data){sx+=p.x;sy+=p.y;sxx+=p.x*p.x;sxy+=p.x*p.y}const m=(n*sxy-sx*sy)/(n*sxx-sx*sx||1);return {m,b:(sy-m*sx)/n}}
function logistic(z){return 1/(1+Math.exp(-Math.max(-40,Math.min(40,z))))}
function boundaryScore(name,x,y,p){
  const k=+p.k||5, d=+p.depth||4, c=+p.c||1;
  if(name==='Logistic Regression') return logistic((x*(1.0+c*.08)+y*.75));
  if(name==='kNN') return Math.sin(x*(1+k*.07)+y*.8);
  if(name==='Decision Tree') return Math.sin(x*(d*.65)+y*1.1);
  if(name==='Random Forest') return Math.sin(x*(d*.35)+y*.9)+.35*Math.sin(x*2.7-y*1.4);
  if(name==='SVM') return x*(c*.35)+y*.9;
  if(name==='MLP') return Math.tanh(Math.sin(x*1.3)+Math.cos(y*1.2)+Math.sin((x+y)*.5));
  if(name==='XGBoost') return Math.sin(x*(d*.25)+y)+.5*Math.cos(x*2.1-y);
  return x+y;
}
function gridChart(canvas, data, title, scoreFn){
  if(canvas._chart) canvas._chart.destroy();
  const pts=data.map(p=>({x:p.x,y:p.y}));
  const minX=-4,maxX=4,minY=-4,maxY=4, step=.32, bg=[];
  for(let x=minX;x<=maxX;x+=step)for(let y=minY;y<=maxY;y+=step){const s=scoreFn(x,y);bg.push({x,y, c:s>=0?1:0})}
  canvas._chart=new Chart(canvas,{type:'scatter',data:{datasets:[
    {label:'Class 0',data:data.filter(p=>p.c===0),pointRadius:5,backgroundColor:COLORS[0]},
    {label:'Class 1',data:data.filter(p=>p.c===1),pointRadius:5,backgroundColor:COLORS[1]},
    {label:'Decision surface',data:bg,pointRadius:3,backgroundColor:bg.map(p=>p.c? 'rgba(94,234,212,.07)':'rgba(124,156,255,.07)')}
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{title:{display:true,text:title,color:'#edf2ff'}},scales:{x:{min:minX,max:maxX,grid:{color:'#202b50'},ticks:{color:'#9eabd0'}},y:{min:minY,max:maxY,grid:{color:'#202b50'},ticks:{color:'#9eabd0'}}}}});
}
function lineChart(canvas,data,title,fit){
  if(canvas._chart)canvas._chart.destroy();
  canvas._chart=new Chart(canvas,{type:'scatter',data:{datasets:[
    {label:'Data',data,pointRadius:4,backgroundColor:COLORS[1]},
    {label:'Model',data:[{x:-4,y:fit.m*-4+fit.b},{x:4,y:fit.m*4+fit.b}],showLine:true,pointRadius:0,borderColor:COLORS[0],borderWidth:3}
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{title:{display:true,text:title,color:'#edf2ff'}},scales:{x:{grid:{color:'#202b50'},ticks:{color:'#9eabd0'}},y:{grid:{color:'#202b50'},ticks:{color:'#9eabd0'}}}}});
}
function setText(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
function setupRange(id,out,fn){const el=document.getElementById(id),o=document.getElementById(out);const go=()=>{o.textContent=el.value;fn()};el.addEventListener('input',go);go()}
function seed(){return Math.floor(Math.random()*999999)}
