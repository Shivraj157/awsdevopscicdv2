let profile = null;
let weightChart = null;
let bmiGauge = null;

function filterByRange(data, days){
  if(days === "all") return data;
  const now = new Date();
  const cutoff = new Date(now.getTime() - (parseInt(days,10)*24*60*60*1000));
  return data.filter(d => new Date(d.date) >= cutoff);
}

function gaugeChart(ctx, value){
  const max = 40;
  const v = Math.min(Math.max(value, 0), max);
  const rest = max - v;
  return new Chart(ctx, {
    type: 'doughnut',
    data: { datasets: [{ data: [v, rest] }]},
    options: {
      rotation: -90 * (Math.PI/180),
      circumference: 180 * (Math.PI/180),
      cutout: '70%',
      plugins: { legend: { display: false } }
    }
  });
}

function lineChart(ctx, labels, values){
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{ label: 'Weight (kg)', data: values, tension: 0.3, fill: false }]
    },
    options: { plugins: { legend: { display: true } }, scales: { x: { display: true }, y: { beginAtZero: false }}}
  });
}

function renderMetrics(metrics){
  const range = document.getElementById('range').value;
  const filtered = filterByRange(metrics, range);
  const labels = filtered.map(m=>m.date);
  const values = filtered.map(m=>m.weight_kg);
  if(weightChart){ weightChart.destroy(); }
  weightChart = lineChart(document.getElementById('weightChart'), labels, values);
}

async function loadAll(){
  profile = await requireAuthOrRedirect();
  if(!profile) return;

  document.getElementById('logout_btn').onclick = async ()=>{
    try{ await API.request('/api/auth/logout','POST',null,getToken()); }catch(e){}
    clearToken(); window.location.href = '/';
  }

  const nt = await API.request('/api/nutrition/targets','GET',null,getToken());
  setText('bmr', nt.bmr);
  setText('tdee', nt.tdee);
  setText('goal_cal', nt.goal_calories);
  setText('prot', nt.macros.protein_g + ' g');
  setText('fat', nt.macros.fat_g + ' g');
  setText('carb', nt.macros.carbs_g + ' g');

  const m = await API.request('/api/metrics','GET',null,getToken());
  document.getElementById('m_date').valueAsDate = new Date();
  renderMetrics(m.metrics);
  document.getElementById('range').addEventListener('change', ()=>renderMetrics(m.metrics));

  setText('bmi_now', m.current_bmi);
  setText('bmi_cat', m.bmi_category);
  if(bmiGauge){ bmiGauge.destroy(); }
  bmiGauge = gaugeChart(document.getElementById('bmiGauge'), m.current_bmi);

  document.getElementById('add_metric').onclick = async ()=>{
    const date = document.getElementById('m_date').value;
    const weight = parseFloat(document.getElementById('m_weight').value);
    const height = parseFloat(document.getElementById('m_height').value || '0');
    if(!date || !weight){ alert('Date and weight are required'); return; }
    await API.request('/api/metrics','POST',{date, weight_kg: weight, height_cm: height || null}, getToken());
    const updated = await API.request('/api/metrics','GET',null,getToken());
    renderMetrics(updated.metrics);
    setText('bmi_now', updated.current_bmi);
    setText('bmi_cat', updated.bmi_category);
    if(bmiGauge){ bmiGauge.destroy(); }
    bmiGauge = gaugeChart(document.getElementById('bmiGauge'), updated.current_bmi);
    document.getElementById('m_weight').value = '';
    document.getElementById('m_height').value = '';
  }
}

loadAll();
