let targets = [];
try{ targets = JSON.parse(localStorage.getItem('studyTargets')||'[]'); }catch(e){ targets=[]; }

function save(){
  try{ localStorage.setItem('studyTargets', JSON.stringify(targets)); }catch(e){}
}

function todayStr(){ return new Date().toISOString().slice(0,10); }

document.getElementById('tDate').value = todayStr();

function addTarget(){
  const title = document.getElementById('tTitle').value.trim();
  const date = document.getElementById('tDate').value;
  const time = document.getElementById('tTime').value;
  const points = parseInt(document.getElementById('tPoints').value);
  const subject = document.getElementById('tSubject').value;
  if(!title || !date){ alert('Please enter a target and date.'); return; }
  targets.push({id:Date.now(), title, date, time, points, subject, status:'pending', notified:false});
  document.getElementById('tTitle').value='';
  save(); render();
}

function toggleStatus(id){
  const t = targets.find(x=>x.id===id);
  if(!t) return;
  if(t.status==='pending' || t.status==='missed') t.status='done';
  else t.status='pending';
  save(); render();
}

function checkMissed(){
  const now = new Date();
  targets.forEach(t=>{
    if(t.status==='done') return;
    let deadline = new Date(t.date + 'T' + (t.time || '23:59'));
    if(now > deadline){ t.status='missed'; }
  });
  save();
}

function render(){
  checkMissed();
  const list = document.getElementById('list');
  list.innerHTML='';
  const sorted = [...targets].sort((a,b)=> (a.date+a.time).localeCompare(b.date+b.time));
  if(sorted.length===0){
    list.innerHTML = '<div class="empty">No targets yet — add your first one above 👆</div>';
  }
  sorted.forEach(t=>{
    const div = document.createElement('div');
    div.className='target';
    const icon = t.status==='done' ? '✓' : (t.status==='missed' ? '✕' : '○');
    div.innerHTML = `
      <div class="badge ${t.status}" onclick="toggleStatus(${t.id})">${icon}</div>
      <div class="info">
        <b>${escapeHtml(t.title)}</b>
        <span>${t.date}${t.time? ' · '+t.time:''}</span>
        ${t.subject ? `<span class="tag">${t.subject}</span>` : ''}
      </div>
      <div class="pts">${t.status==='done' ? '+'+t.points : t.points} pts</div>
      <button class="ghost" style="padding:4px 8px;font-size:.7rem" onclick="removeTarget(${t.id})">✕</button>
    `;
    list.appendChild(div);
  });
  updateStats();
  renderCharts();
}

let subjectChartInstance, trendChartInstance;
function renderCharts(){
  if(typeof Chart === 'undefined') return;
  const bySubject = {};
  targets.filter(t=>t.status==='done').forEach(t=>{
    const s = t.subject || 'Other';
    bySubject[s] = (bySubject[s]||0) + t.points;
  });
  const subLabels = Object.keys(bySubject);
  const subData = Object.values(bySubject);
  const ctx1 = document.getElementById('subjectChart');
  if(ctx1){
    if(subjectChartInstance) subjectChartInstance.destroy();
    subjectChartInstance = new Chart(ctx1, {
      type: 'bar',
      data: { labels: subLabels.length?subLabels:['No data yet'], datasets:[{label:'Points', data: subData.length?subData:[0], backgroundColor:'#4f46e5'}] },
      options: { responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
    });
  }
  const days=[], pointsByDay=[];
  for(let i=6;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i);
    const key = d.toISOString().slice(0,10);
    days.push(key.slice(5));
    pointsByDay.push(targets.filter(t=>t.status==='done' && t.date===key).reduce((s,t)=>s+t.points,0));
  }
  const ctx2 = document.getElementById('trendChart');
  if(ctx2){
    if(trendChartInstance) trendChartInstance.destroy();
    trendChartInstance = new Chart(ctx2, {
      type:'line',
      data:{ labels: days, datasets:[{label:'Points earned', data: pointsByDay, borderColor:'#16a34a', backgroundColor:'rgba(22,163,74,.15)', fill:true, tension:.3}] },
      options:{ responsive:true, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
    });
  }
}

function removeTarget(id){
  targets = targets.filter(t=>t.id!==id);
  save(); render();
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function updateStats(){
  const done = targets.filter(t=>t.status==='done');
  const totalPts = done.reduce((s,t)=>s+t.points,0);
  const finished = targets.filter(t=>t.status==='done' || t.status==='missed');
  const pct = finished.length ? Math.round(done.length/finished.length*100) : 0;

  document.getElementById('stPoints').textContent = totalPts;
  document.getElementById('stPct').textContent = pct+'%';
  document.getElementById('progBar').style.width = pct+'%';
  document.getElementById('progText').textContent =
    `${done.length} completed · ${targets.filter(t=>t.status==='missed').length} missed · ${targets.filter(t=>t.status==='pending').length} pending`;

  // streak: consecutive past days (from today backwards) with at least one target and all done
  const byDate = {};
  targets.forEach(t=>{ (byDate[t.date] = byDate[t.date]||[]).push(t); });
  let streak=0, d = new Date();
  while(true){
    const key = d.toISOString().slice(0,10);
    const dayTargets = byDate[key];
    if(!dayTargets || dayTargets.length===0) break;
    if(!dayTargets.every(t=>t.status==='done')) break;
    streak++;
    d.setDate(d.getDate()-1);
  }
  document.getElementById('stStreak').textContent = streak;
}

function enableNotifs(){
  const statusEl = document.getElementById('notifStatus');
  if(!('Notification' in window)){
    statusEl.textContent = 'Notifications not supported in this browser.';
    return;
  }
  Notification.requestPermission().then(p=>{
    statusEl.textContent = p==='granted' ? '✅ Alerts enabled — checking every minute.' : 'Permission denied.';
  });
}

setInterval(()=>{
  const now = new Date();
  targets.forEach(t=>{
    if(t.status!=='pending' || !t.time || t.notified) return;
    const deadline = new Date(t.date+'T'+t.time);
    if(now >= deadline){
      t.notified = true;
      if('Notification' in window && Notification.permission==='granted'){
        try{ new Notification('⏰ Target missed deadline', {body: t.title}); }catch(e){}
      }
    }
  });
  save(); render();
}, 60000);

render();
