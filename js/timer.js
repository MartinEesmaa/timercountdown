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

function startTotalTimer(duration, breakDuration) {
    let timer = duration;
    const totalDisplay = document.getElementById("total-timer");
    const breakDisplay = document.getElementById("break-timer");
    breakDisplay.textContent = "00:00";
    isBreak = false;

    clearInterval(totalTimer);
    clearInterval(breakTimer);

    // Make timer text big
    totalDisplay.classList.add("timer-big");
    breakDisplay.classList.remove("timer-big");

    // Go fullscreen on timer start
    goFullscreenOnTimer();

    speak("Countdown started!");

    totalTimer = setInterval(() => {
        totalDisplay.textContent = formatTime(timer);
        if (--timer < 0) {
            clearInterval(totalTimer);
            if (breakDuration > 0) {
                speak("Break started!");
                startBreakTimer(breakDuration);
            } else {
                speak("Countdown finished! Well done.");
                totalDisplay.classList.remove("timer-big");
                // Exit fullscreen when finished
                if (document.fullscreenElement) document.exitFullscreen();
            }
        }
    }, 1000);
}

function startBreakTimer(duration) {
    let timer = duration;
    const breakDisplay = document.getElementById("break-timer");
    breakDisplay.textContent = formatTime(timer);
    isBreak = true;

    // Make break timer text big
    breakDisplay.classList.add("timer-big");
    document.getElementById("total-timer").classList.remove("timer-big");

    totalDisplay = document.getElementById("total-timer");

    breakTimer = setInterval(() => {
        breakDisplay.textContent = formatTime(timer);
        if (--timer < 0) {
            clearInterval(breakTimer);
            isBreak = false;
            speak("Break is over! Timer finished.");
            breakDisplay.classList.remove("timer-big");
            // Exit fullscreen when finished
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