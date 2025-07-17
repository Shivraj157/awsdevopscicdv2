document.addEventListener('DOMContentLoaded', function() {
    // Initialize data structure
    let fitnessData = {
        user: {
            name: "User",
            goal: "Stay Active"
        },
        dailyLogs: {},
        lastUpdated: null
    };

    // DOM Elements
    const currentDateEl = document.getElementById('current-date');
    const waterCountEl = document.getElementById('water-count');
    const plusWaterBtn = document.getElementById('plus-water');
    const minusWaterBtn = document.getElementById('minus-water');
    const workoutListEl = document.getElementById('workout-list');
    const addWorkoutBtn = document.getElementById('add-workout');
    const exerciseInput = document.getElementById('exercise-input');
    const durationInput = document.getElementById('duration-input');
    const totalWorkoutsEl = document.getElementById('total-workouts');
    const totalMinutesEl = document.getElementById('total-minutes');
    const caloriesBurnedEl = document.getElementById('calories-burned');
    const exportBtn = document.getElementById('export-data');

    // Current date setup
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    currentDateEl.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Load saved data
    function loadData() {
        const savedData = localStorage.getItem('fitnessData');
        if (savedData) {
            fitnessData = JSON.parse(savedData);
            
            // Load today's data if exists
            if (fitnessData.dailyLogs[today]) {
                const todayData = fitnessData.dailyLogs[today];
                
                // Load workouts
                if (todayData.workouts) {
                    todayData.workouts.forEach(workout => {
                        addWorkoutToDOM(workout);
                    });
                    updateWorkoutStats();
                }
                
                // Load water intake
                if (todayData.waterIntake !== undefined) {
                    waterCountEl.textContent = todayData.waterIntake;
                }
            }
        }
    }

    // Save data to localStorage
    function saveData() {
        fitnessData.lastUpdated = new Date().toISOString();
        localStorage.setItem('fitnessData', JSON.stringify(fitnessData));
    }

    // Water intake functions
    function updateWaterIntake(change) {
        // Initialize today's log if doesn't exist
        if (!fitnessData.dailyLogs[today]) {
            fitnessData.dailyLogs[today] = {};
        }
        
        const current = fitnessData.dailyLogs[today].waterIntake || 0;
        const newValue = Math.max(0, current + change);
        
        fitnessData.dailyLogs[today].waterIntake = newValue;
        waterCountEl.textContent = newValue;
        saveData();
    }

    plusWaterBtn.addEventListener('click', () => updateWaterIntake(1));
    minusWaterBtn.addEventListener('click', () => updateWaterIntake(-1));

    // Workout functions
    function addWorkoutToDOM(workout) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="exercise">${workout.exercise}</span>
            <span class="duration">${workout.duration} min</span>
            <span class="delete">×</span>
        `;
        workoutListEl.appendChild(li);
        
        li.querySelector('.delete').addEventListener('click', function() {
            const duration = workout.duration;
            li.remove();
            
            // Remove from data
            const index = fitnessData.dailyLogs[today].workouts.findIndex(
                w => w.exercise === workout.exercise && w.duration === workout.duration
            );
            if (index > -1) {
                fitnessData.dailyLogs[today].workouts.splice(index, 1);
                saveData();
                updateWorkoutStats();
            }
        });
    }

    function updateWorkoutStats() {
        if (!fitnessData.dailyLogs[today] || !fitnessData.dailyLogs[today].workouts) {
            totalWorkoutsEl.textContent = 0;
            totalMinutesEl.textContent = 0;
            caloriesBurnedEl.textContent = 0;
            return;
        }
        
        const workouts = fitnessData.dailyLogs[today].workouts;
        const totalMinutes = workouts.reduce((sum, workout) => sum + workout.duration, 0);
        
        totalWorkoutsEl.textContent = workouts.length;
        totalMinutesEl.textContent = totalMinutes;
        caloriesBurnedEl.textContent = Math.round(totalMinutes * 5); // 5 cal/min estimate
    }

    addWorkoutBtn.addEventListener('click', () => {
        const exercise = exerciseInput.value.trim();
        const duration = parseInt(durationInput.value);

        if (exercise && duration) {
            const workout = { exercise, duration };
            
            // Initialize today's log if doesn't exist
            if (!fitnessData.dailyLogs[today]) {
                fitnessData.dailyLogs[today] = { workouts: [] };
            }
            
            // Initialize workouts array if doesn't exist
            if (!fitnessData.dailyLogs[today].workouts) {
                fitnessData.dailyLogs[today].workouts = [];
            }
            
            // Add workout
            fitnessData.dailyLogs[today].workouts.push(workout);
            addWorkoutToDOM(workout);
            updateWorkoutStats();
            saveData();
            
            // Clear inputs
            exerciseInput.value = '';
            durationInput.value = '';
        }
    });

    const sendData = async () => {
 const data = {
   userId: "shivraj123",
   date: "2025-07-17",
   workouts: [
     { exercise: "Push Ups", minutes: 15 },
     { exercise: "Running", minutes: 30 }
   ],
   waterIntake: 5,
   totalCalories: 400
 };
 const response = await fetch("https://your-api-id.execute-api.region.amazonaws.com/prod/store", {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify(data)
 });
 const result = await response.json();
 console.log(result);
};
    // Export data
    exportBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(fitnessData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitness-data-${today}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Initialize
    loadData();
});