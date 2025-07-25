// --- Elements ---
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

// --- Backend API URL ---
// This now correctly points to your running EC2 server
const API_URL = 'http://3.238.56.164:3001/api';

// --- State (will be populated from the backend) ---
let workoutHistory = [];
let waterCount = 0;

// --- Display current date (No changes) ---
function displayCurrentDate() {
    const options = {
        weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short'
    };
    currentDate.textContent = new Date().toLocaleString('en-IN', options);
}
displayCurrentDate();

// --- Motivational Quotes (No changes) ---
const quotes = [ "Your body can stand almost anything. It’s your mind you have to convince.", "Push yourself because no one else is going to do it for you.", "It’s not about being the best. It’s about being better than you were yesterday.", "No pain, no gain. Shut up and train.", "Don’t wish for a good body, work for it.", "Sweat is just fat crying.", "You don’t find willpower, you create it.", "A little progress each day adds up to big results.", ];
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    motivationalQuoteElem.textContent = `"${quotes[randomIndex]}"`;
}
refreshQuoteBtn.addEventListener('click', showRandomQuote);
showRandomQuote();

// --- MODIFIED: Add workout by sending data to the backend ---
async function addWorkout(exercise, duration) {
    try {
        const response = await fetch(`${API_URL}/workouts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exercise, duration }),
        });

        if (!response.ok) throw new Error('Failed to save workout.');

        const newWorkout = await response.json();
        workoutHistory.push(newWorkout); // Add new workout to our local state
        
        // Re-render the UI
        renderWorkoutList();
        updateStats();
        updateChart();
    } catch (error) {
        console.error('Error adding workout:', error);
        alert(error.message);
    }
}

// Handle add workout form submission
document.querySelector('.workout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const exercise = exerciseInput.value.trim();
    const duration = parseInt(durationInput.value.trim());
    if (!exercise || isNaN(duration) || duration <= 0) return;
    addWorkout(exercise, duration);
    exerciseInput.value = '';
    durationInput.value = '';
});

// --- MODIFIED: Water Intake Tracker ---
async function updateWaterCount(newCount) {
    waterCount = newCount;
    waterCountElem.textContent = waterCount; // Update UI immediately for responsiveness
    
    try {
        await fetch(`${API_URL}/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ waterCount: newCount }),
        });
    } catch (error) {
        console.error('Error updating water count:', error);
        alert('Could not save water count to the server.');
    }
}

plusWaterBtn.onclick = () => {
    updateWaterCount(waterCount + 1);
};

minusWaterBtn.onclick = () => {
    if (waterCount > 0) {
        updateWaterCount(waterCount - 1);
    }
};

// --- MODIFIED: User Profile and Preferences ---
async function savePreferences() {
    const preferences = {
        distanceUnit: unitSelect.value,
        timeUnit: timeUnitSelect.value,
    };
    
    try {
        await fetch(`${API_URL}/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preferences }),
        });
        alert('Preferences saved!');
    } catch (error) {
        console.error('Error saving preferences:', error);
        alert('Failed to save preferences.');
    }
}

userProfileForm.addEventListener('submit', e => {
    e.preventDefault();
    savePreferences();
});

// --- UI Rendering Functions (No changes) ---
function renderWorkoutList() {
    workoutList.innerHTML = '';
    workoutHistory.forEach(workout => {
        const li = document.createElement('li');
        li.textContent = `${workout.exercise} — ${workout.duration} min`;
        workoutList.appendChild(li);
    });
}
function updateStats() {
    totalWorkouts = workoutHistory.length;
    totalMinutes = workoutHistory.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = workoutHistory.reduce((sum, w) => sum + w.calories, 0);
    totalWorkoutsElem.textContent = totalWorkouts;
    totalMinutesElem.textContent = totalMinutes;
    caloriesBurnedElem.textContent = totalCalories;
}

// --- Weekly Progress Chart (No changes) ---
const chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weeklyData = [0, 0, 0, 0, 0, 0, 0];
const weeklyChart = new Chart(ctx, { type: 'bar', data: { labels: chartLabels, datasets: [{ label: 'Workout Minutes', data: weeklyData, backgroundColor: '#43b97f', }] }, options: { responsive: true, scales: { y: { beginAtZero: true, suggestedMax: 60, title: { display: true, text: 'Minutes' } } } } });
function updateChart() {
    for (let i = 0; i < 7; i++) weeklyData[i] = 0;
    workoutHistory.forEach(w => {
        const wDate = new Date(w.date);
        let day = wDate.getDay();
        day = day === 0 ? 6 : day - 1;
        weeklyData[day] += w.duration;
    });
    weeklyChart.data.datasets[0].data = weeklyData;
    weeklyChart.update();
}

// --- NEW: Initialize the application by fetching data from the backend ---
async function initializeApp() {
    try {
        const response = await fetch(`${API_URL}/data`);
        if (!response.ok) throw new Error('Could not fetch data from server. Please ensure the server is running and accessible.');

        const data = await response.json();
        
        // Populate state from the backend
        workoutHistory = data.workouts || [];
        waterCount = data.waterCount || 0;
        
        // Populate UI with fetched data
        unitSelect.value = data.preferences.distanceUnit || 'km';
        timeUnitSelect.value = data.preferences.timeUnit || 'min';
        waterCountElem.textContent = waterCount;
        
        // Render everything
        renderWorkoutList();
        updateStats();
        updateChart();
        
    } catch (error) {
        console.error('Initialization Error:', error);
        alert(error.message);
    }
}

// --- Start the app ---
initializeApp();
