async function loadPersonal(){
  const me = await requireAuthOrRedirect(); if(!me) return;

  document.getElementById('logout_btn').onclick = async ()=>{
    try{ await API.request('/api/auth/logout','POST',null,getToken()); }catch(e){}
    clearToken(); window.location.href = '/';
  };

  async function refreshNotes(){
    const res = await API.request('/api/notes','GET',null,getToken());
    const c = document.getElementById('n_list'); c.innerHTML = '';
    res.notes.slice().reverse().forEach(n=>{
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `<strong>${n.date}</strong> — ${n.text}`;
      c.appendChild(div);
    });
  }
  document.getElementById('n_date').valueAsDate = new Date();
  document.getElementById('n_add').onclick = async ()=>{
    const date = document.getElementById('n_date').value;
    const text = document.getElementById('n_text').value.trim();
    if(!text){ alert('Write a note'); return;}
    await API.request('/api/notes','POST',{date, text}, getToken());
    document.getElementById('n_text').value='';
    refreshNotes();
  };
  refreshNotes();

  async function refreshWater(){
    const res = await API.request('/api/water','GET',null,getToken());
    const c = document.getElementById('water_days'); c.innerHTML = '';
    const days = Object.values(res.days).sort((a,b)=>a.date.localeCompare(b.date));
    days.forEach(d=>{
      const pct = Math.min(100, Math.round((d.consumed_ml / d.goal_ml)*100));
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `<strong>${d.date}</strong> — ${d.consumed_ml}/${d.goal_ml} ml
        <div class="progress"><span style="width:${pct}%"></span></div>`;
      c.appendChild(div);
    });
  }
  document.getElementById('water_date').valueAsDate = new Date();
  document.getElementById('water_save').onclick = async ()=>{
    const date = document.getElementById('water_date').value;
    const goal_ml = parseInt(document.getElementById('water_goal').value || '0',10);
    const consumed_ml = parseInt(document.getElementById('water_consumed').value || '0',10);
    if(!date || !goal_ml){ alert('Pick a date and set a goal'); return; }
    await API.request('/api/water','POST',{date, goal_ml, consumed_ml}, getToken());
    refreshWater();
  };
  refreshWater();
}

loadPersonal();
