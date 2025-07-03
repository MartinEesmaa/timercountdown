// This file contains the JavaScript functionality for the countdown timer application.

// Update variable and function usage to match your HTML

let totalTimer;
let breakTimer;
let isBreak = false;

// Helper to format time as MM:SS
function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function speak(text) {
    if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utter);
    }
}

function goFullscreenOnTimer() {
    const timerDisplay = document.querySelector('.timer-display');
    if (timerDisplay.requestFullscreen) {
        timerDisplay.requestFullscreen();
    } else if (timerDisplay.webkitRequestFullscreen) { // Safari
        timerDisplay.webkitRequestFullscreen();
    } else if (timerDisplay.msRequestFullscreen) { // IE11
        timerDisplay.msRequestFullscreen();
    }
}

function showFullscreenOverlay() {
    document.getElementById('fullscreen-timer-overlay').style.display = 'flex';
    document.querySelector('.container').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
}

function hideFullscreenOverlay() {
    document.getElementById('fullscreen-timer-overlay').style.display = 'none';
    document.querySelector('.container').style.display = '';
    document.querySelector('footer').style.display = '';
}

// Listen for fullscreen change to show/hide overlay
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        showFullscreenOverlay();
    } else {
        hideFullscreenOverlay();
    }
});

// Helper to update overlay timer value
function updateFullscreenTimer(value) {
    document.getElementById('fullscreen-main-timer').textContent = value;
}

// Helper to update main timer value and label
function updateMainTimer(value, label) {
    document.getElementById('main-timer').textContent = value;
    document.getElementById('main-timer-label').textContent = label;
}

function startTotalTimer(duration, breakDuration) {
    let timer = duration;
    const mainTimer = document.getElementById("main-timer");
    const mainLabel = document.getElementById("main-timer-label");
    isBreak = false;

    clearInterval(totalTimer);
    clearInterval(breakTimer);

    // Make timer text big
    mainTimer.classList.add("timer-big");

    // Go fullscreen on timer start
    goFullscreenOnTimer();

    speak("Countdown started!");

    updateMainTimer(formatTime(timer), "Total Countdown:");
    updateFullscreenTimer(formatTime(timer));

    totalTimer = setInterval(() => {
        const formatted = formatTime(timer);
        updateMainTimer(formatted, "Total Countdown:");
        updateFullscreenTimer(formatted);
        if (--timer < 0) {
            clearInterval(totalTimer);
            if (breakDuration > 0) {
                speak("Break started!");
                startBreakTimer(breakDuration);
            } else {
                speak("Countdown finished! Well done.");
                mainTimer.classList.remove("timer-big");
                if (document.fullscreenElement) document.exitFullscreen();
            }
        }
    }, 1000);
}

function startBreakTimer(duration) {
    let timer = duration;
    const mainTimer = document.getElementById("main-timer");
    const mainLabel = document.getElementById("main-timer-label");
    isBreak = true;

    // Make timer text big
    mainTimer.classList.add("timer-big");

    updateMainTimer(formatTime(timer), "Break Time:");
    updateFullscreenTimer(formatTime(timer));

    breakTimer = setInterval(() => {
        const formatted = formatTime(timer);
        updateMainTimer(formatted, "Break Time:");
        updateFullscreenTimer(formatted);
        if (--timer < 0) {
            clearInterval(breakTimer);
            isBreak = false;
            speak("Break is over! Timer finished.");
            mainTimer.classList.remove("timer-big");
            if (document.fullscreenElement) document.exitFullscreen();
        }
    }, 1000);
}

document.getElementById("start-timer").addEventListener("click", function () {
    const durationInput = document.getElementById("duration").value;
    const breakInput = document.getElementById("breaks").value;
    const startTimeInput = document.getElementById("start-time").value;
    const endTimeInput = document.getElementById("end-time").value;

    let duration = parseInt(durationInput, 10) || 0;
    let breakDuration = parseInt(breakInput, 10) || 0;

    // If start and end time are set, calculate duration
    if (startTimeInput && endTimeInput) {
        const [startH, startM] = startTimeInput.split(":").map(Number);
        const [endH, endM] = endTimeInput.split(":").map(Number);
        let start = startH * 60 + startM;
        let end = endH * 60 + endM;
        if (end < start) end += 24 * 60; // handle overnight
        duration = end - start;

        // Get current time in minutes
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        // If start time is in the future, wait until then
        let waitMinutes = start - nowMinutes;
        if (waitMinutes < 0) waitMinutes += 24 * 60; // handle overnight

        if (waitMinutes > 0) {
            speak(`Timer will start at ${startTimeInput}. Waiting to begin.`);
            alert(`Timer will start at ${startTimeInput}.`);
            setTimeout(() => {
                startTotalTimer(duration * 60, breakDuration * 60);
            }, waitMinutes * 60 * 1000);
            return;
        }
        // If start time is now or in the past, start immediately
    }

    if (duration <= 0) {
        alert("Please set a valid duration or start/end time.");
        return;
    }

    startTotalTimer(duration * 60, breakDuration * 60);
});

// Disable/enable fields based on input
const durationInput = document.getElementById("duration");
const startTimeInput = document.getElementById("start-time");
const endTimeInput = document.getElementById("end-time");

function updateInputStates() {
    if (durationInput.value) {
        startTimeInput.disabled = true;
        endTimeInput.disabled = true;
    } else {
        startTimeInput.disabled = false;
        endTimeInput.disabled = false;
    }

    if (startTimeInput.value && endTimeInput.value) {
        durationInput.disabled = true;
    } else {
        durationInput.disabled = false;
    }
}

durationInput.addEventListener("input", updateInputStates);
startTimeInput.addEventListener("input", updateInputStates);
endTimeInput.addEventListener("input", updateInputStates);

// Initialize state on page load
updateInputStates();