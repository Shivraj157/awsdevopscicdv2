const API = {
  base: window.location.origin, // change to "http://127.0.0.1:8000" if serving frontend elsewhere
  async request(path, method="GET", body=null, token=null) {
    const headers = {"Content-Type":"application/json"};
    if(token){ headers["Authorization"] = "Bearer " + token; }
    const res = await fetch(`${this.base}${path}`, {
      method, headers, body: body ? JSON.stringify(body) : null
    });
    if(!res.ok){
      let msg="Request failed";
      try{ const err = await res.json(); msg = err.detail || JSON.stringify(err); } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  }
};

function saveToken(t){ localStorage.setItem("token", t); }
function getToken(){ return localStorage.getItem("token"); }
function clearToken(){ localStorage.removeItem("token"); }

async function requireAuthOrRedirect(){
  const t = getToken();
  if(!t){ window.location.href = "/"; return null; }
  try{
    const me = await API.request("/api/profile", "GET", null, t);
    return me.profile;
  }catch(e){
    clearToken();
    window.location.href = "/";
    return null;
  }
}

function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.textContent = value;
}
