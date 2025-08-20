// Elements
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


const motivationalQuoteElem = document.getElementById('motivational-quote');
const refreshQuoteBtn = document.getElementById('refresh-quote');


const unitSelect = document.getElementById('unit-select');
const timeUnitSelect = document.getElementById('time-unit-select');
const userProfileForm = document.getElementById('user-profile-form');


const ctx = document.getElementById('weekly-chart').getContext('2d');


// Initial state
let workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];
let waterCount = parseInt(localStorage.getItem('waterCount')) || 0;
let totalMinutes = 0;
let totalWorkouts = 0;


// --- Display current date ---
function displayCurrentDate() {
  const options = { 
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', 
    hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short' 
  };
  currentDate.textContent = new Date().toLocaleString('en-IN', options);
}
displayCurrentDate();


// --- Motivational Quotes ---
const quotes = [
  "Your body can stand almost anything. It’s your mind you have to convince.",
  "Push yourself because no one else is going to do it for you.",
  "It’s not about being the best. It’s about being better than you were yesterday.",
  "No pain, no gain. Shut up and train.",
  "Don’t wish for a good body, work for it.",
  "Sweat is just fat crying.",
  "You don’t find willpower, you create it.",
  "A little progress each day adds up to big results.",
];


function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  motivationalQuoteElem.textContent = `"${quotes[randomIndex]}"`;
}


refreshQuoteBtn.addEventListener('click', showRandomQuote);
showRandomQuote();


// --- Add workout to list and update stats ---
function addWorkout(exercise, duration) {
  const calories = duration * 5;
  workoutHistory.push({
    date: new Date().toDateString(),
    exercise,
    duration,
    calories,
  });
  localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
  renderWorkoutList();
  updateStats();
  updateChart();
}


// Render workout history list
function renderWorkoutList() {
  workoutList.innerHTML = '';
  workoutHistory.forEach(workout => {
    const li = document.createElement('li');
    li.textContent = `${workout.exercise} — ${workout.duration} min`;
    workoutList.appendChild(li);
  });
}


// Update stats from workout history
function updateStats() {
  totalWorkouts = workoutHistory.length;
  totalMinutes = workoutHistory.reduce((sum, w) => sum + w.duration, 0);
  totalWorkoutsElem.textContent = totalWorkouts;
  totalMinutesElem.textContent = totalMinutes;
  caloriesBurnedElem.textContent = totalMinutes * 5;
}


// Handle add workout button click
addWorkoutBtn.onclick = () => {
  const exercise = exerciseInput.value.trim();
  const duration = parseInt(durationInput.value.trim());
  if (!exercise || isNaN(duration) || duration <= 0) return;
  addWorkout(exercise, duration);
  exerciseInput.value = '';
  durationInput.value = '';
};


// --- Water Intake Tracker ---
function updateWaterDisplay() {
  waterCountElem.textContent = waterCount;
  localStorage.setItem('waterCount', waterCount);
}


plusWaterBtn.onclick = () => {
  waterCount++;
  updateWaterDisplay();
};


minusWaterBtn.onclick = () => {
  if (waterCount > 0) waterCount--;
  updateWaterDisplay();
};


updateWaterDisplay();


// --- User Profile and Preferences ---
function savePreferences() {
  localStorage.setItem('distanceUnit', unitSelect.value);
  localStorage.setItem('timeUnit', timeUnitSelect.value);
  alert('Preferences saved!');
}


function loadPreferences() {
  const distanceUnit = localStorage.getItem('distanceUnit') || 'km';
  const timeUnit = localStorage.getItem('timeUnit') || 'min';
  unitSelect.value = distanceUnit;
  timeUnitSelect.value = timeUnit;
}
userProfileForm.addEventListener('submit', e => {
  e.preventDefault();
  savePreferences();
});
loadPreferences();


// --- Weekly Progress Chart ---
const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


// Initialize chart with zeros
const weeklyData = [0, 0, 0, 0, 0, 0, 0];


const weeklyChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: chartLabels,
    datasets: [{
      label: 'Workout Minutes',
      data: weeklyData,
      backgroundColor: '#43b97f',
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 60,
        title: { display: true, text: 'Minutes' }
      }
    }
  }
});


// Update chart with current week's data from workoutHistory
function updateChart() {
  // Reset weeklyData
  for (let i = 0; i < 7; i++) weeklyData[i] = 0;


  // Aggregate durations by weekday index (Mon=0 ... Sun=6)
  workoutHistory.forEach(w => {
    const wDate = new Date(w.date);
    let day = wDate.getDay(); // Sun=0 .. Sat=6
    day = day === 0 ? 6 : day - 1; // Remap Sunday to 6, Mon=0
    weeklyData[day] += w.duration;
  });


  weeklyChart.data.datasets[0].data = weeklyData;
  weeklyChart.update();
}


// Initialize
renderWorkoutList();
updateStats();
updateChart();
