import uuid, hashlib, time
from typing import Optional, Dict
from .storage import read_json, write_json

USERS_FILE = "users.json"
SESSIONS_FILE = "sessions.json"

def _hash_pw(pw: str, salt: Optional[str]=None) -> str:
    # Simple demo hash — do NOT use in production
    if salt is None:
        salt = uuid.uuid4().hex
    digest = hashlib.sha256((salt + pw).encode("utf-8")).hexdigest()
    return f"{salt}${digest}"

def _verify_pw(pw: str, salted_hash: str) -> bool:
    salt, digest = salted_hash.split("$", 1)
    return _hash_pw(pw, salt) == salted_hash

def register_user(email: str, password: str, name: str, sex: str, age: int, height_cm: float, weight_kg: float, goal: str, activity_level: str) -> Dict:
    users = read_json(USERS_FILE)
    if email in users:
        raise ValueError("Email already registered.")
    user = {
        "id": uuid.uuid4().hex,
        "email": email,
        "password": _hash_pw(password),
        "name": name,
        "sex": sex,
        "age": age,
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        "goal": goal,
        "activity_level": activity_level,
        "created_at": int(time.time())
    }
    users[email] = user
    write_json(USERS_FILE, users)
    return {k:v for k,v in user.items() if k != "password"}

def login_user(email: str, password: str) -> str:
    users = read_json(USERS_FILE)
    user = users.get(email)
    if not user or not _verify_pw(password, user["password"]):
        raise ValueError("Invalid credentials.")
    token = uuid.uuid4().hex
    sessions = read_json(SESSIONS_FILE)
    sessions[token] = {"email": email, "exp": int(time.time()) + 60*60*24*7}
    write_json(SESSIONS_FILE, sessions)
    return token

def get_user_by_token(token: str):
    sessions = read_json(SESSIONS_FILE)
    s = sessions.get(token)
    now = int(time.time())
    if not s or s["exp"] < now:
        return None
    users = read_json(USERS_FILE)
    return users.get(s["email"])

def logout_token(token: str) -> None:
    sessions = read_json(SESSIONS_FILE)
    if token in sessions:
        del sessions[token]
        write_json(SESSIONS_FILE, sessions)
