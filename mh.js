let selectedMood = '';
let moodCounts = { "Happy": 0, "Calm": 0, "Anxious": 0, "Sad": 0, "Stressed": 0 };
const reminderSound = new Audio('https://www.soundjay.com/button/beep-07.wav');

let moodChart;

window.onload = function () {
    const ctx = document.getElementById('moodChart').getContext('2d');
    moodChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Happy", "Calm", "Anxious", "Sad", "Stressed"],
            datasets: [{
                label: 'Mood Frequency',
                data: [0, 0, 0, 0, 0],
                backgroundColor: ['#4CAF50', '#00BCD4', '#FF9800', '#F44336', '#9C27B0'],
                borderRadius: 10,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    loadJournalEntries();
    setInterval(changeQuote, 5000);
};

const moodQuotes = {
    Happy: "Happiness is not something ready made. It comes from your own actions. – Dalai Lama",
    Calm: "Calm mind brings inner strength and self-confidence. – Dalai Lama",
    Anxious: "You don't have to control your thoughts. You just have to stop letting them control you. – Dan Millman",
    Sad: "Tears come from the heart and not from the brain. – Leonardo da Vinci",
    Stressed: "Almost everything will work again if you unplug it for a few minutes… including you. – Anne Lamott"
};

const moodMessages = {
    Happy: "We're glad you're feeling great today! Keep smiling!",
    Calm: "It's wonderful to feel calm. Enjoy the serenity.",
    Anxious: "It's okay to feel anxious. Take a deep breath and be kind to yourself.",
    Sad: "We're here for you. Remember, it's okay to have off days.",
    Stressed: "Stress can be overwhelming. Take a moment to pause and recharge."
};

const quotes = [
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "It always seems impossible until it's done. - Nelson Mandela",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
    "You are never too old to set another goal or to dream a new dream. - C.S. Lewis"
];
let quoteIndex = 0;

function updateMood(mood) {
    selectedMood = mood;
    document.getElementById('inspirational-quote').textContent = moodQuotes[mood];
    document.getElementById('mood-message').textContent = moodMessages[mood];
}

function saveMood() {
    if (selectedMood === '') {
        alert('Please select a mood before saving.');
        return;
    }

    const moodList = document.getElementById('mood-list');
    const today = new Date().toLocaleDateString();
    let moodGroup = document.querySelector(`[data-date='${today}']`);

    if (!moodGroup) {
        moodGroup = document.createElement('li');
        moodGroup.setAttribute('data-date', today);
        moodGroup.innerHTML = `<strong>${today}</strong><ul class="mood-sublist"></ul>`;
        moodList.appendChild(moodGroup);
    }

    const sublist = moodGroup.querySelector('.mood-sublist');
    const moodItem = document.createElement('li');
    moodItem.textContent = selectedMood;
    moodItem.classList.add('fade-in'); // Add animation class
    sublist.appendChild(moodItem);

    moodCounts[selectedMood]++;
    moodChart.data.datasets[0].data = Object.values(moodCounts);
    moodChart.update();

    selectedMood = '';
    document.querySelector('input[name="mood"]:checked').checked = false;
}

function saveJournalEntry() {
    const entry = document.getElementById('journalEntry').value.trim();
    if (entry === '') {
        alert('Please write something before saving.');
        return;
    }

    let entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    const timestamp = new Date().toLocaleString();
    entries.unshift({ text: entry, time: timestamp });
    localStorage.setItem('journalEntries', JSON.stringify(entries));

    document.getElementById('journalEntry').value = '';
    loadJournalEntries();
}

function clearJournalEntries() {
    if (confirm("Are you sure you want to reset all journal entries?")) {
        localStorage.removeItem('journalEntries');
        loadJournalEntries();
    }
}

function loadJournalEntries() {
    const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];
    const journalList = document.getElementById('journalList');
    journalList.innerHTML = '';
    entries.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${entry.time}</strong><br>${entry.text}<hr>`;
        journalList.appendChild(li);
    });
}

function changeQuote() {
    const quoteElement = document.getElementById('inspirational-quote');
    if (!selectedMood) {
        quoteElement.textContent = quotes[quoteIndex];
        quoteIndex = (quoteIndex + 1) % quotes.length;
    }
}

function showBreakReminder() {
    const notification = document.getElementById('breakNotification');
    notification.classList.add('show');
    reminderSound.play();
    setTimeout(() => {
        notification.classList.remove('show');
    }, 10000);
}

setInterval(showBreakReminder, 3600000);
