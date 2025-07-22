// src/views/start_trial/start_trial.js

export function init(status) {
    const welcomeEl = document.getElementById('welcome-message-trial');
    if (welcomeEl && status.user) {
        welcomeEl.textContent = `Welcome, ${status.user.email}!`;
    }

    const startBtn = document.getElementById('start-trial-btn');
    if (startBtn) {
        startBtn.addEventListener('click', handleStartTrial);
    }

    const logoutBtn = document.getElementById('logout-btn-trial');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

async function handleStartTrial() {
    const startBtn = document.getElementById('start-trial-btn');
    const messageBox = document.getElementById('trial-message-box');

    startBtn.disabled = true;
    startBtn.textContent = 'Starting...';
    messageBox.style.display = 'none';

    const response = await chrome.runtime.sendMessage({ type: 'START_FREE_TRIAL' });

    if (response.success) {
        messageBox.textContent = "Trial started! Taking you to the next step...";
        messageBox.className = 'feedback success';
        messageBox.style.display = 'block';
        
        // --- UPDATED: Dispatch event with new status to trigger UI router instantly ---
        const event = new CustomEvent('auth-state-update', { detail: response.status });
        document.dispatchEvent(event);

    } else {
        messageBox.textContent = `Error: ${response.error}`;
        messageBox.className = 'feedback error';
        messageBox.style.display = 'block';
        startBtn.disabled = false;
        startBtn.textContent = 'Start 7-Day Free Trial';
    }
}

async function handleLogout() {
    const logoutBtn = document.getElementById('logout-btn-trial');
    if (logoutBtn) logoutBtn.disabled = true;

    const response = await chrome.runtime.sendMessage({ type: 'LOGOUT' });

    if (response.success) {
        const event = new CustomEvent('auth-state-update', { detail: response.status });
        document.dispatchEvent(event);
    }
}
