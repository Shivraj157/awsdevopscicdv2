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

const goalInput = document.getElementById('goal-input');
const progressBar = document.getElementById('progress-bar');

const toggleThemeBtn = document.getElementById('toggle-theme');
const viewHistoryBtn = document.getElementById('view-history');
const historyList = document.getElementById('history-list');

// Initial state
let totalMinutes = 0;
let totalWorkouts = 0;
let waterCount = 0;
let workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];

// Display current date
currentDate.textContent = new Date().toDateString();

/* 🏋️ Add Workout */
addWorkoutBtn.onclick = () => {
  const exercise = exerciseInput.value.trim();
  const duration = parseInt(durationInput.value.trim());

  if (!exercise || isNaN(duration) || duration <= 0) return;

  totalMinutes += duration;
  totalWorkouts++;
  const calories = Math.floor(duration * 5); // Simple estimate
  const listItem = document.createElement('li');
  listItem.textContent = `${exercise} — ${duration} min`;
  workoutList.appendChild(listItem);

  updateStats();
  updateProgressBar();

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

/* 🌊 Water Intake */
plusWaterBtn.onclick = () => {
  waterCount++;
  waterCountElem.textContent = waterCount;
};

minusWaterBtn.onclick = () => {
  if (waterCount > 0) waterCount--;
  waterCountElem.textContent = waterCount;
};

/* 🌙 Toggle Theme */
toggleThemeBtn.onclick = () => {
  document.body.classList.toggle('dark');
};

/* 📊 Update Stats */
function updateStats() {
  totalWorkoutsElem.textContent = totalWorkouts;
  totalMinutesElem.textContent = totalMinutes;
  caloriesBurnedElem.textContent = totalMinutes * 5;
}

/* 📈 Goal Progress */
function updateProgressBar() {
  const goal = parseInt(goalInput.value) || 60;
  const percent = Math.min(100, Math.floor((totalMinutes / goal) * 100));
  progressBar.style.width = `${percent}%`;
}

/* 🗂️ View History */
viewHistoryBtn.onclick = () => {
  historyList.innerHTML = '';
  const grouped = {};

  workoutHistory.forEach(item => {
    if (!grouped[item.date]) grouped[item.date] = [];
    grouped[item.date].push(item);
  });

  for (let date in grouped) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${date}</strong><ul>` + grouped[date].map(w =>
      `<li>${w.exercise} - ${w.duration} min (${w.calories} cal)</li>`
    ).join('') + '</ul>';
    historyList.appendChild(li);
  }
};
