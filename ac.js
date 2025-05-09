// ========== Task Manager ==========
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const progressBar = document.getElementById('progress-bar');
const progressChartCtx = document.getElementById('progress-chart').getContext('2d');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Save tasks
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks
function loadTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => addTaskToList(task));
    updateProgress();
    updatePieChart();
}

// Add task to UI
function addTaskToList(task) {
    const li = document.createElement('li');
    li.textContent = `${task.text} (Due: ${formatDate(task.dueDate)})`;

    const badge = document.createElement('span');
    badge.classList.add('task-badge');
    const daysLeft = getDaysLeft(task.dueDate);

    if (daysLeft <= 3) badge.classList.add('due-soon');
    else if (daysLeft <= 7) badge.classList.add('due-medium');
    else badge.classList.add('due-later');
    badge.textContent = daysLeft <= 0 ? 'Overdue' : `${daysLeft} days left`;

    li.prepend(badge);

    if (task.completed) li.classList.add('task-completed');

    const completeBtn = document.createElement('button');
    completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
    completeBtn.classList.add('complete-btn');
    completeBtn.addEventListener('click', () => {
        task.completed = !task.completed;
        saveTasks();
        loadTasks();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => t !== task);
        saveTasks();
        loadTasks();
    });

    li.appendChild(completeBtn);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
}

function formatDate(date) {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

function getDaysLeft(date) {
    const today = new Date();
    const due = new Date(date);
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
}

// Task form submit
taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = document.getElementById('task-input').value;
    const dueDate = document.getElementById('task-date').value;

    tasks.push({ text, dueDate, completed: false });
    saveTasks();
    loadTasks();

    taskForm.reset();
});

// Progress Bar
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const percentage = total === 0 ? 0 : (completed / total) * 100;
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${Math.round(percentage)}% Complete`;
}

// Chart.js Pie Chart
let progressChart = new Chart(progressChartCtx, {
    type: 'pie',
    data: {
        labels: ['Completed', 'Remaining'],
        datasets: [{
            data: [0, 0],
            backgroundColor: ['#28a745', '#ffc107']
        }]
    },
    options: {
        responsive: false,
        maintainAspectRatio: false
    }
});

function updatePieChart() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    progressChart.data.datasets[0].data = [completed, total - completed];
    progressChart.update();
}

// ========== Study Timer (Pomodoro) ==========
// === Study Timer ===
let studyDuration = 25 * 60; // 25 mins
let shortBreakDuration = 5 * 60; // 5 mins
let longBreakDuration = 15 * 60; // 15 mins
let timeRemaining = studyDuration;
let isRunning = false;
let interval = null;
let currentPhase = "Study"; // "Study", "Short Break", "Long Break"
let completedSessions = 0;

const timerDisplay = document.getElementById('timer-display');
const startButton = document.getElementById('start-pomodoro');
const pauseButton = document.getElementById('pause-pomodoro');
const resetButton = document.getElementById('reset-pomodoro');
const pomodoroPhase = document.getElementById('pomodoro-phase');
const completedSessionsDisplay = document.getElementById('completed-sessions');
const phaseSound = new Audio('https://www.soundjay.com/button/beep-07.wav'); // Sound

// Update timer visually
function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Start countdown
function startPomodoro() {
  if (isRunning) return; // Prevent multiple intervals

  isRunning = true;
  startButton.disabled = true;
  pauseButton.disabled = false;

  interval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      updateTimerDisplay();
    } else {
      clearInterval(interval);
      isRunning = false;
      phaseSound.play();
      switchPhase();
    }
  }, 1000);
}

// Pause countdown
function pausePomodoro() {
  clearInterval(interval);
  isRunning = false;
  startButton.disabled = false;
  pauseButton.disabled = true;
}

// Reset current phase
function resetPomodoro() {
  clearInterval(interval);
  isRunning = false;
  if (currentPhase === "Study") {
    timeRemaining = studyDuration;
  } else if (currentPhase === "Short Break") {
    timeRemaining = shortBreakDuration;
  } else if (currentPhase === "Long Break") {
    timeRemaining = longBreakDuration;
  }
  updateTimerDisplay();
  startButton.disabled = false;
  pauseButton.disabled = true;
}

// Switch phase (after timer finishes)
function switchPhase() {
  if (currentPhase === "Study") {
    completedSessions++;
    completedSessionsDisplay.textContent = `Completed Sessions: ${completedSessions}`;

    if (completedSessions % 4 === 0) {
      currentPhase = "Long Break";
      timeRemaining = longBreakDuration;
    } else {
      currentPhase = "Short Break";
      timeRemaining = shortBreakDuration;
    }
  } else {
    currentPhase = "Study";
    timeRemaining = studyDuration;
  }

  pomodoroPhase.textContent = `Phase: ${currentPhase}`;
  updateTimerDisplay();
  startPomodoro(); // Auto-start next phase!
}

// Button event listeners
startButton.addEventListener('click', startPomodoro);
pauseButton.addEventListener('click', pausePomodoro);
resetButton.addEventListener('click', resetPomodoro);

// Setup initial view
updateTimerDisplay();


// ========== Sticky Notes ==========
const stickyNoteForm = document.getElementById("sticky-note-form");
const stickyNoteInput = document.getElementById("sticky-note-input");
const stickyNotesList = document.getElementById("sticky-notes-list");

function loadStickyNotes() {
    const notes = JSON.parse(localStorage.getItem("stickyNotes")) || [];
    stickyNotesList.innerHTML = "";
    notes.forEach(note => addStickyNoteToDOM(note));
}

function addStickyNoteToDOM(note) {
    const li = document.createElement("li");
    li.textContent = note;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener('click', () => {
        deleteStickyNote(note);
        loadStickyNotes();
    });

    li.appendChild(deleteBtn);
    stickyNotesList.appendChild(li);
}

function saveStickyNote(note) {
    const notes = JSON.parse(localStorage.getItem("stickyNotes")) || [];
    notes.push(note);
    localStorage.setItem("stickyNotes", JSON.stringify(notes));
}

function deleteStickyNote(note) {
    let notes = JSON.parse(localStorage.getItem("stickyNotes")) || [];
    notes = notes.filter(n => n !== note);
    localStorage.setItem("stickyNotes", JSON.stringify(notes));
}

stickyNoteForm.addEventListener('submit', e => {
    e.preventDefault();
    const note = stickyNoteInput.value.trim();
    if (note) {
        saveStickyNote(note);
        addStickyNoteToDOM(note);
        stickyNoteInput.value = "";
    }
});

// ========== Initialize Everything ==========
loadTasks();
loadStickyNotes();
updateProgress();
updatePieChart();
