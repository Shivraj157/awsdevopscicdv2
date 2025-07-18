// Tracker logic
const currentDate = document.getElementById("current-date");
const exerciseInput = document.getElementById("exercise-input");
const durationInput = document.getElementById("duration-input");
const workoutList = document.getElementById("workout-list");
const addWorkoutBtn = document.getElementById("add-workout");

const totalWorkoutsElem = document.getElementById("total-workouts");
const totalMinutesElem = document.getElementById("total-minutes");
const caloriesBurnedElem = document.getElementById("calories-burned");

let workoutHistory = JSON.parse(localStorage.getItem("workoutHistory")) || [];
let totalMinutes = 0;
let totalWorkouts = 0;

currentDate.textContent = new Date().toDateString();

function updateStats() {
  totalWorkoutsElem.textContent = totalWorkouts;
  totalMinutesElem.textContent = totalMinutes;
  caloriesBurnedElem.textContent = totalMinutes * 5;
}

addWorkoutBtn.onclick = () => {
  const ex = exerciseInput.value.trim();
  const dur = parseInt(durationInput.value.trim());

  if (!ex || dur <= 0) return;

  const item = document.createElement("li");
  item.textContent = `${ex} — ${dur} min`;
  workoutList.appendChild(item);

  totalMinutes += dur;
  totalWorkouts++;

  workoutHistory.push({ date: new Date().toDateString(), ex, dur });
  localStorage.setItem("workoutHistory", JSON.stringify(workoutHistory));

  updateStats();

  exerciseInput.value = "";
  durationInput.value = "";
};
