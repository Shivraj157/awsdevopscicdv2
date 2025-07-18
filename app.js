// Get elements
const currentDate = document.getElementById('current-date');
const exerciseInput = document.getElementById('exercise-input');
const durationInput = document.getElementById('duration-input');
const workoutList = document.getElementById('workout-list');
const addWorkoutBtn = document.getElementById('add-workout');

const totalWorkoutsElem = document.getElementById('total-workouts');
const totalMinutesElem = document.getElementById('total-minutes');
const caloriesBurnedElem = document.getElementById('calories-burned');

const plusWaterBtn = document.getElementById('plus-water');
const minusWaterBtn = document.getElementById('minus-water');
const waterCountElem = document.getElementById('water-count');

// State
let totalMinutes = 0;
let totalWorkouts = 0;
let waterCount = 0;
let workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];

// Display date
currentDate.textContent = new Date().toDateString();

// Add Workout
addWorkoutBtn.onclick = () => {
  const exercise = exerciseInput.value.trim();
  const duration = parseInt(durationInput.value.trim());

  if (!exercise || isNaN(duration) || duration <= 0) return;

  totalMinutes += duration;
  totalWorkouts++;
  const calories = Math.floor(duration * 5);
  const listItem = document.createElement('li');
  listItem.textContent = `${exercise} — ${duration} min`;
  workoutList.appendChild(listItem);

  updateStats();

  workoutHistory.push({
    date: new Date().toDateString(),
    exercise,
    duration,
    calories
  });

  localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));

  exerciseInput.value = '';
  durationInput.value = '';
};

// Water Intake
plusWaterBtn.onclick = () => {
  waterCount++;
  waterCountElem.textContent = waterCount;
};
minusWaterBtn.onclick = () => {
  if (waterCount > 0) waterCount--;
  waterCountElem.textContent = waterCount;
};

// Update Stats
function updateStats() {
  totalWorkoutsElem.textContent = totalWorkouts;
  totalMinutesElem.textContent = totalMinutes;
  caloriesBurnedElem.textContent = totalMinutes * 5;
}
