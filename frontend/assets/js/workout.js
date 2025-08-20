let wChart = null;

function barChart(ctx, labels, values){
  return new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Calories Burned', data: values }]},
    options: { plugins: { legend: { display: true }}, scales: { y: { beginAtZero: true } } }
  });
}

function renderList(arr){
  const c = document.getElementById('w_list');
  c.innerHTML = '';
  arr.forEach(item=>{
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `<strong>${item.date}</strong> — ${item.activity} — ${item.duration_min} min — <em>${item.calories} kcal</em>`;
    c.appendChild(div);
  });
}

async function loadWorkouts(){
  const me = await requireAuthOrRedirect(); if(!me) return;
  document.getElementById('logout_btn').onclick = async ()=>{
    try{ await API.request('/api/auth/logout','POST',null,getToken()); }catch(e){}
    clearToken(); window.location.href = '/';
  };

  const res = await API.request('/api/workouts','GET',null,getToken());
  renderList(res.workouts);
  document.getElementById('w_total').textContent = res.total_calories;

  const labels = res.workouts.map(w=>w.date);
  const vals = res.workouts.map(w=>w.calories);
  if(wChart){ wChart.destroy(); }
  wChart = barChart(document.getElementById('w_chart'), labels, vals);

  document.getElementById('w_date').valueAsDate = new Date();

  document.getElementById('w_add').onclick = async ()=>{
    const date = document.getElementById('w_date').value;
    const activity = document.getElementById('w_activity').value;
    const duration = parseFloat(document.getElementById('w_duration').value || '0');
    const met = parseFloat(document.getElementById('w_met').value || '0');
    if(!date || duration <= 0){ alert('Pick a date and enter duration'); return; }
    const payload = {date, activity, duration_min: duration};
    if(activity === 'custom' && met > 0){ payload.met = met; }
    await API.request('/api/workouts','POST',payload,getToken());
    const updated = await API.request('/api/workouts','GET',null,getToken());
    renderList(updated.workouts);
    document.getElementById('w_total').textContent = updated.total_calories;
    const labels = updated.workouts.map(w=>w.date);
    const vals = updated.workouts.map(w=>w.calories);
    if(wChart){ wChart.destroy(); }
    wChart = barChart(document.getElementById('w_chart'), labels, vals);
    document.getElementById('w_duration').value = '';
    document.getElementById('w_met').value = '';
  };
}

loadWorkouts();
