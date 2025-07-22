// src/views/no_subscription/no_subscription.js

export function init(status) {
    const logoutBtn = document.getElementById('logout-btn-no-sub');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

async function handleLogout() {
    const logoutBtn = document.getElementById('logout-btn-no-sub');
    if(logoutBtn) logoutBtn.disabled = true;

    const response = await chrome.runtime.sendMessage({ type: 'LOGOUT' });

    if (response.success) {
        const event = new CustomEvent('auth-state-update', { detail: response.status });
        document.dispatchEvent(event);
    }
}
