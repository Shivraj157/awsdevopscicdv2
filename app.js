// 1. Display the current date
document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

// 2. Motivational Quotes Feature
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
const quoteElement = document.getElementById("motivational-quote");
const refreshQuoteBtn = document.getElementById("refresh-quote");

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  quoteElement.textContent = `"${quotes[randomIndex]}"`;
}
refreshQuoteBtn.addEventListener("click", showRandomQuote);
showRandomQuote(); // Initial load

// 3. Workout Form Handling
const exerciseInput = document.getElementById('exercise-input');
const durationInput = document.getElementById('duration-input');
const workoutList = document.getElementById('workout-list');

let workouts = [];
let totalMinutes = 0;

document.querySelector('.workout-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const exercise = exerciseInput.value.trim();
  const duration = parseInt(durationInput.value.trim());

  if (exercise && duration > 0) {
    workouts.push({ exercise, duration });

    const li = document.createElement('li');
    li.textContent = `${exercise} - ${duration} min`;
    workoutList.appendChild(li);

    updateStats();
    updateChart();

    exerciseInput.value = '';
    durationInput.value = '';
  }
});

// 4. Update Stats
function updateStats() {
  document.getElementById('total-workouts').textContent = workouts.length;

  totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
  document.getElementById('total-minutes').textContent = totalMinutes;

  // Assume 5 calories burned per minute
  const calories = totalMinutes * 5;
  document.getElementById('calories-burned').textContent = calories;
}

// 5. Water Intake Tracker
let waterCount = 0;
const waterCountEl = document.getElementById('water-count');
document.getElementById('plus-water').addEventListener('click', () => {
  waterCount++;
  updateWaterDisplay();
});
document.getElementById('minus-water').addEventListener('click', () => {
  if (waterCount > 0) waterCount--;
  updateWaterDisplay();
});
function updateWaterDisplay() {
  waterCountEl.textContent = `${waterCount}`;
}

// 6. User Preferences (Units)
const unitSelect = document.getElementById('unit-select');
const timeUnitSelect = document.getElementById('time-unit-select');

document.getElementById('user-profile-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const distanceUnit = unitSelect.value;
  const timeUnit = timeUnitSelect.value;

  localStorage.setItem('distanceUnit', distanceUnit);
  localStorage.setItem('timeUnit', timeUnit);

  alert('Preferences saved!');
});

function loadPreferences() {
  const savedDistance = localStorage.getItem('distanceUnit');
  const savedTime = localStorage.getItem('timeUnit');

  if (savedDistance) unitSelect.value = savedDistance;
  if (savedTime) timeUnitSelect.value = savedTime;
}
loadPreferences();

// 7. Weekly Progress Chart (Demo simulated values)
const ctx = document.getElementById('weekly-chart').getContext('2d');
const weeklyChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Workout Minutes',
      data: [10, 20, 15, 25, 30, 0, 10],
      backgroundColor: '#43b97f'
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10
        },
        title: {
          display: true,
          text: 'Minutes'
        }
      }
    }
  }
});

// Function to update chart with current week's data
function updateChart() {
  const today = new Date().getDay(); // 0 (Sun) to 6 (Sat)
  const index = today === 0 ? 6 : today - 1; // Map Sun to index 6
  weeklyChart.data.datasets[0].data[index] = totalMinutes;
  weeklyChart.update();
}

// 8. Initialize defaults
updateStats();
updateWaterDisplay();
