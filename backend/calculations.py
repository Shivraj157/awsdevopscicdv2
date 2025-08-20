from typing import Literal, Dict

ActivityLevel = Literal["sedentary", "light", "moderate", "active", "very_active"]
Goal = Literal["lose", "maintain", "gain"]

ACTIVITY_FACTOR: Dict[ActivityLevel, float] = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}

# Simple MET values for common workouts
MET_TABLE = {
    "walking": 3.5,
    "running": 9.8,
    "cycling": 7.5,
    "swimming": 6.0,
    "yoga": 2.5,
    "strength_training": 6.0,
    "hiit": 8.0,
    "sports_other": 5.0,
}

def bmi(weight_kg: float, height_cm: float) -> float:
    h_m = height_cm / 100.0
    return round(weight_kg / (h_m * h_m), 2) if h_m > 0 else 0.0

def bmi_category(bmi_val: float) -> str:
    if bmi_val < 18.5:
        return "Underweight"
    if bmi_val < 25:
        return "Normal"
    if bmi_val < 30:
        return "Overweight"
    return "Obese"

def bmr_mifflin_st_jeor(sex: str, weight_kg: float, height_cm: float, age: int) -> float:
    base = 10 * weight_kg + 6.25 * height_cm - 5 * age
    if sex.lower() in ("male", "m"):
        return base + 5
    return base - 161

def tdee(bmr: float, activity: ActivityLevel) -> float:
    return bmr * ACTIVITY_FACTOR.get(activity, 1.2)

def goal_calories(tdee_val: float, goal: Goal) -> float:
    if goal == "lose":
        return max(1200.0, tdee_val - 500.0)
    if goal == "gain":
        return tdee_val + 300.0
    return tdee_val

def macros_grams(calories: float, weight_kg: float):
    # protein ~1.8g/kg
    protein_g = round(1.8 * weight_kg, 1)
    # fat ~30% calories (9 kcal/g)
    fat_g = round((calories * 0.30) / 9.0, 1)
    # carbs remainder (4 kcal/g)
    carbs_kcal = calories - (protein_g * 4 + fat_g * 9)
    carbs_g = round(max(0.0, carbs_kcal / 4.0), 1)
    return {
        "protein_g": protein_g,
        "fat_g": fat_g,
        "carbs_g": carbs_g,
    }

def calories_burned(activity: str, weight_kg: float, duration_min: float, met_override: float|None=None) -> float:
    met = met_override if met_override else MET_TABLE.get(activity, 5.0)
    hours = duration_min / 60.0
    return round(met * weight_kg * hours, 1)
