# Fitness Tracker — FastAPI + JSON (v2, full)

A lightweight **Fitness & Nutrition Tracker** built with **FastAPI** and vanilla **HTML/CSS/JS**.

This v2 build mounts static assets at `/static` and returns HTML via **explicit routes** to avoid
`405 Method Not Allowed` when `/api/*` routes get overshadowed.

> ⚠️ Authentication & storage here are **demo-only**. Data is saved in local JSON files.
> For production, use a database and proper password hashing & JWTs.

---

## 1) Project Layout

```
fitness_fastapi_app_v2_full/
  backend/
    main.py
    storage.py
    auth.py
    calculations.py
  data/
    users.json
    sessions.json
    metrics.json
    workouts.json
    notes.json
    water.json
  frontend/
    index.html
    dashboard.html
    workout.html
    personal.html
    assets/
      css/styles.css
      js/common.js
      js/api.js
      js/dashboard.js
      js/workout.js
      js/personal.js
  requirements.txt
  README.md
```

---

## 2) Quick Start (Local Run)

### A) Create & activate a virtual environment (recommended)

**Windows (PowerShell):**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**macOS / Linux (bash/zsh):**
```bash
python -m venv .venv
source .venv/bin/activate
```

### B) Install dependencies
```bash
pip install -r requirements.txt
```

### C) Start the FastAPI server
```bash
uvicorn backend.main:app --reload
```

### D) Open the app
- Home (Login/Register): **http://127.0.0.1:8000/**
- Dashboard: **http://127.0.0.1:8000/dashboard.html**
- Workouts: **http://127.0.0.1:8000/workout.html**
- Personal: **http://127.0.0.1:8000/personal.html**

> ✅ One server serves both the frontend and API. No separate HTTP server needed.

---

## 3) How to Use

1. Go to **http://127.0.0.1:8000/**
2. Click **Register**, fill out the form, and click **Create account**.
3. You’ll be signed in automatically and redirected to the **Dashboard**.
4. Add **weight/height** entries and view the **progress line chart** + **BMI gauge**.
5. Open **Workouts** to log activities (walking/running/cycling etc.). Calories are auto-calculated using METs (custom MET supported).
6. Open **Personal** to save **notes** and track **water intake**.

---

## 4) Optional: Frontend on another port (not required)

If you want `frontend/` on port 8080:

1. Run:
   ```bash
   cd frontend
   python -m http.server 8080
   # visit http://127.0.0.1:8080/
   ```

2. Edit `frontend/assets/js/common.js` and set:
   ```js
   base: "http://127.0.0.1:8000"
   ```

3. Keep FastAPI running on 8000. CORS is already permissive for local dev.

---

## 5) Troubleshooting

### 405 Method Not Allowed on Register/Login
- Don’t open API URLs directly in the browser. Use the pages and buttons.
- In v2, static is under `/static` and HTML routes are explicit, so `/api/*` is safe.

### "Request failed" popup
- Open DevTools → Network → check the request to `/api/...` is **POST** (for register/login) and points to `http://127.0.0.1:8000`.

### Data not saving
- Ensure files in `data/` are writable. Each user’s data is stored under their `user.id` key.

---

## 6) Tech Notes

- Static files: `/static/assets/...`
- HTML routes: `/`, `/dashboard.html`, `/workout.html`, `/personal.html`
- Calories burned uses a small MET table in `backend/calculations.py`.
- Macro targets: protein per kg, 30% fats, remainder carbs.

---

## 7) Roadmap
- Move to proper DB (SQLite/Postgres), password hashing, JWT.
- Add validations, reports, CSV export, reminders.
