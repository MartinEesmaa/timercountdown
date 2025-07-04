// This file contains the JavaScript functionality for the countdown timer application.

// Update variable and function usage to match your HTML

let totalTimer;
let breakTimer;
let isBreak = false;

// Helper to format time as MM:SS
function formatTime(totalSeconds) {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let parts = [];
    if (days > 0) parts.push(days + "d");
    if (hours > 0 || days > 0) parts.push(String(hours).padStart(2, '0') + "h");
    parts.push(String(minutes).padStart(2, '0') + "m");
    parts.push(String(seconds).padStart(2, '0') + "s");

    return parts.join(" ");
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

// Helper to show a fullscreen message for 3 seconds, then callback
function showFullscreenMessage(message, callback) {
    const overlay = document.getElementById('fullscreen-timer-overlay');
    const content = document.getElementById('fullscreen-timer-content');
    content.innerHTML = `<div id="fullscreen-message" style="font-size:7vw;text-align:center;color:#33ff33;font-family:'Share Tech Mono',monospace;text-shadow:0 0 40px #33ff33,0 0 80px #33ff33;">${message}</div>`;
    overlay.style.display = 'flex';
    setTimeout(() => {
        content.innerHTML = `<div id="fullscreen-main-timer">00:00</div>`;
        if (callback) callback();
    }, 3000);
}

function startTotalTimer(duration, breakDuration) {
    let timer = duration;
    const mainTimer = document.getElementById("main-timer");
    isBreak = false;

    clearInterval(totalTimer);
    clearInterval(breakTimer);

    // Make timer text big
    mainTimer.classList.add("timer-big");

    // Go fullscreen on timer start
    goFullscreenOnTimer();

    // Show COMPETITION STARTS message for 3 seconds, then start timer
    showFullscreenMessage("COMPETITION STARTS", () => {
        speak("Competition starts");
        updateMainTimer(formatTime(timer), "Total Countdown:");
        updateFullscreenTimer(formatTime(timer));

        // Now start the timer interval AFTER the message
        totalTimer = setInterval(() => {
            const formatted = formatTime(timer);
            updateMainTimer(formatted, "Total Countdown:");
            updateFullscreenTimer(formatted);
            if (--timer < 0) {
                clearInterval(totalTimer);
                if (breakDuration > 0) {
                    speak("Competition is suspended! Break started!");
                    showFullscreenMessage("BREAK TIME", () => {
                        startBreakTimer(breakDuration);
                    });
                } else {
                    endCompetition();
                }
            }
        }, 1000);
    });
}

function endCompetition() {
    // Show END OF COMPETITION message for 3 seconds, then exit fullscreen
    showFullscreenMessage("END OF COMPETITION", () => {
        speak("End of competition");
        setTimeout(() => {
            if (document.fullscreenElement) document.exitFullscreen();
        }, 3000);
    });
}

function startBreakTimer(duration) {
    let timer = duration;
    const mainTimer = document.getElementById("main-timer");
    isBreak = true;

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
            endCompetition();
        }
    }, 1000);
}

document.getElementById("start-timer").addEventListener("click", function () {
    // Get duration from new fields
    const days = parseInt(document.getElementById("duration-days").value, 10) || 0;
    const hours = parseInt(document.getElementById("duration-hours").value, 10) || 0;
    const minutes = parseInt(document.getElementById("duration-minutes").value, 10) || 0;
    const seconds = parseInt(document.getElementById("duration-seconds").value, 10) || 0;
    const breakInput = document.getElementById("breaks").value;
    const startTimeInput = document.getElementById("start-time").value;
    const endTimeInput = document.getElementById("end-time").value;

    // Calculate total duration in seconds
    let duration = days * 86400 + hours * 3600 + minutes * 60 + seconds;
    let breakDuration = parseInt(breakInput, 10) || 0;

    // If start and end time are set, calculate duration (overrides manual duration)
    if (startTimeInput && endTimeInput) {
        const [startH, startM] = startTimeInput.split(":").map(Number);
        const [endH, endM] = endTimeInput.split(":").map(Number);
        let start = startH * 60 + startM;
        let end = endH * 60 + endM;
        if (end < start) end += 24 * 60; // handle overnight
        duration = (end - start) * 60; // convert minutes to seconds

        // Wait logic as before...
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        let waitMinutes = start - nowMinutes;
        if (waitMinutes < 0) waitMinutes += 24 * 60;
        if (waitMinutes > 0) {
            speak(`Timer will start at ${startTimeInput}. Waiting to begin.`);
            alert(`Timer will start at ${startTimeInput}.`);
            setTimeout(() => {
                startTotalTimer(duration, breakDuration * 60);
            }, waitMinutes * 60 * 1000);
            return;
        }
    }

    if (duration <= 0) {
        alert("Please set a valid duration or start/end time.");
        return;
    }

    startTotalTimer(duration, breakDuration * 60);
});

const durationInputs = [
    document.getElementById("duration-days"),
    document.getElementById("duration-hours"),
    document.getElementById("duration-minutes"),
    document.getElementById("duration-seconds")
];
const startTimeInput = document.getElementById("start-time");
const endTimeInput = document.getElementById("end-time");

function anyDurationValue() {
    return durationInputs.some(input => input.value && parseInt(input.value, 10) > 0);
}

function updateInputStates() {
    if (anyDurationValue()) {
        startTimeInput.disabled = true;
        endTimeInput.disabled = true;
    } else {
        startTimeInput.disabled = false;
        endTimeInput.disabled = false;
    }

    if (startTimeInput.value && endTimeInput.value) {
        durationInputs.forEach(input => input.disabled = true);
    } else {
        durationInputs.forEach(input => input.disabled = false);
    }
}

durationInputs.forEach(input => input.addEventListener("input", updateInputStates));
startTimeInput.addEventListener("input", updateInputStates);
endTimeInput.addEventListener("input", updateInputStates);

// Initialize state on page load
updateInputStates();