from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict
from pathlib import Path

from .auth import register_user, login_user, get_user_by_token, logout_token
from .storage import read_json, write_json
from .calculations import bmi, bmi_category, bmr_mifflin_st_jeor, tdee, goal_calories, macros_grams, calories_burned

app = FastAPI(title="Fitness Tracker API (v2 full)")

# Allow local static hosting and optional cross-port usage
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"],
)

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

# Serve static assets under /static
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

# Explicit routes for HTML pages
@app.get("/", include_in_schema=False)
def home():
    return FileResponse(FRONTEND_DIR / "index.html")

@app.get("/dashboard.html", include_in_schema=False)
def dash():
    return FileResponse(FRONTEND_DIR / "dashboard.html")

@app.get("/workout.html", include_in_schema=False)
def workout():
    return FileResponse(FRONTEND_DIR / "workout.html")

@app.get("/personal.html", include_in_schema=False)
def personal():
    return FileResponse(FRONTEND_DIR / "personal.html")


# -------- Models --------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str
    sex: str
    age: int
    height_cm: float
    weight_kg: float
    goal: str  # lose/maintain/gain
    activity_level: str  # sedentary/light/moderate/active/very_active

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class MetricIn(BaseModel):
    date: str  # ISO YYYY-MM-DD
    weight_kg: float
    height_cm: Optional[float] = None  # allow updating height too

class WorkoutIn(BaseModel):
    date: str
    activity: str  # walking/running/cycling/... or custom
    duration_min: float
    met: Optional[float] = None

class NoteIn(BaseModel):
    date: str
    text: str

class WaterIn(BaseModel):
    date: str
    goal_ml: int
    consumed_ml: int

def auth_user(authorization: Optional[str] = Header(None)) -> Dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid/expired token")
    return user

# -------- Auth --------
@app.post("/api/auth/register")
def api_register(payload: RegisterIn):
    try:
        user = register_user(payload.email, payload.password, payload.name, payload.sex, payload.age,
                             payload.height_cm, payload.weight_kg, payload.goal, payload.activity_level)
        return {"ok": True, "user": user}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login")
def api_login(payload: LoginIn):
    try:
        token = login_user(payload.email, payload.password)
        return {"ok": True, "token": token}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/api/auth/logout")
def api_logout(user=Depends(auth_user), authorization: Optional[str] = Header(None)):
    token = authorization.split(" ", 1)[1]
    logout_token(token)
    return {"ok": True}

# -------- Profile / Nutrition --------
@app.get("/api/profile")
def get_profile(user=Depends(auth_user)):
    safe = {k:v for k,v in user.items() if k != "password"}
    return {"ok": True, "profile": safe}

@app.get("/api/nutrition/targets")
def nutrition_targets(user=Depends(auth_user)):
    sex = user.get("sex", "male")
    age = int(user.get("age", 25))
    height_cm = float(user.get("height_cm", 170.0))
    weight_kg = float(user.get("weight_kg", 70.0))
    goal = user.get("goal", "maintain")
    activity = user.get("activity_level", "light")

    bmr = bmr_mifflin_st_jeor(sex, weight_kg, height_cm, age)
    tdee_val = tdee(bmr, activity)
    goal_cals = goal_calories(tdee_val, goal)
    macros = macros_grams(goal_cals, weight_kg)
    return {
        "ok": True,
        "bmr": round(bmr, 1),
        "tdee": round(tdee_val, 1),
        "goal_calories": round(goal_cals, 1),
        "macros": macros
    }

# -------- Metrics --------
@app.post("/api/metrics")
def add_metric(payload: MetricIn, user=Depends(auth_user)):
    data = read_json("metrics.json")
    uid = user["id"]
    arr = data.get(uid, [])
    entry = payload.dict()
    arr.append(entry)
    data[uid] = arr
    write_json("metrics.json", data)
    return {"ok": True}

@app.get("/api/metrics")
def list_metrics(user=Depends(auth_user)):
    data = read_json("metrics.json")
    uid = user["id"]
    arr = data.get(uid, [])
    bmi_series = []
    for row in arr:
        w = row["weight_kg"]
        h = row.get("height_cm", user.get("height_cm", 170.0))
        bmi_val = bmi(w, h)
        bmi_series.append({"date": row["date"], "bmi": bmi_val})
    current_bmi = bmi(user.get("weight_kg", 70.0), user.get("height_cm", 170.0))
    return {"ok": True, "metrics": arr, "bmi_series": bmi_series, "current_bmi": current_bmi, "bmi_category": bmi_category(current_bmi)}

# -------- Workouts --------
@app.post("/api/workouts")
def add_workout(payload: WorkoutIn, user=Depends(auth_user)):
    data = read_json("workouts.json")
    uid = user["id"]
    arr = data.get(uid, [])
    weight = user.get("weight_kg", 70.0)
    cals = calories_burned(payload.activity, float(weight), payload.duration_min, payload.met)
    entry = payload.dict()
    entry["calories"] = cals
    arr.append(entry)
    data[uid] = arr
    write_json("workouts.json", data)
    return {"ok": True, "calories": cals}

@app.get("/api/workouts")
def list_workouts(user=Depends(auth_user)):
    data = read_json("workouts.json")
    uid = user["id"]
    arr = data.get(uid, [])
    total_cals = sum(x.get("calories", 0) for x in arr)
    return {"ok": True, "workouts": arr, "total_calories": round(total_cals, 1)}

# -------- Notes --------
@app.post("/api/notes")
def add_note(payload: NoteIn, user=Depends(auth_user)):
    data = read_json("notes.json")
    uid = user["id"]
    arr = data.get(uid, [])
    arr.append(payload.dict())
    data[uid] = arr
    write_json("notes.json", data)
    return {"ok": True}

@app.get("/api/notes")
def list_notes(user=Depends(auth_user)):
    data = read_json("notes.json")
    uid = user["id"]
    return {"ok": True, "notes": data.get(uid, [])}

# -------- Water --------
@app.post("/api/water")
def upsert_water(payload: WaterIn, user=Depends(auth_user)):
    data = read_json("water.json")
    uid = user["id"]
    items = data.get(uid, {})
    items[payload.date] = payload.dict()
    data[uid] = items
    write_json("water.json", data)
    return {"ok": True}

@app.get("/api/water")
def get_water(user=Depends(auth_user)):
    data = read_json("water.json")
    uid = user["id"]
    return {"ok": True, "days": data.get(uid, {})}
