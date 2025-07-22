// src/views/verify_account/verify_account.js

export function init(status) {
    const linkBtn = document.getElementById('link-account-btn');
    if (linkBtn) {
        linkBtn.addEventListener('click', handleLinkAccount);
    }

    const logoutBtn = document.getElementById('logout-btn-verify');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

async function handleLinkAccount() {
    const linkBtn = document.getElementById('link-account-btn');
    const messageBox = document.getElementById('verify-message-box');

    if (!window.location.href.includes('/member/')) {
        messageBox.textContent = "Error: Please navigate to your Vinted profile page first.";
        messageBox.className = 'feedback error';
        messageBox.style.display = 'block';
        return;
    }

    const urlParts = window.location.pathname.split('/');
    const vintedUsername = urlParts.pop() || urlParts.pop();

    if (!vintedUsername) {
        messageBox.textContent = "Error: Could not find Vinted username in the URL.";
        messageBox.className = 'feedback error';
        messageBox.style.display = 'block';
        return;
    }

    linkBtn.disabled = true;
    linkBtn.textContent = 'Linking...';
    messageBox.style.display = 'none';

    const response = await chrome.runtime.sendMessage({
        type: 'LINK_VINTED_ACCOUNT',
        payload: { vintedUsername }
    });

    if (response.success) {
        messageBox.textContent = "Account linked successfully! Refreshing...";
        messageBox.className = 'feedback success';
        messageBox.style.display = 'block';
        // --- UPDATED: Dispatch event with new status for an instant UI update ---
        const event = new CustomEvent('auth-state-update', { detail: response.status });
        document.dispatchEvent(event);

    } else {
        messageBox.textContent = `Error: ${response.error}`;
        messageBox.className = 'feedback error';
        messageBox.style.display = 'block';
        linkBtn.disabled = false;
        linkBtn.textContent = 'Link My Vinted Account';
    }
}

async function handleLogout() {
    const logoutBtn = document.getElementById('logout-btn-verify');
    if (logoutBtn) logoutBtn.disabled = true;

    const response = await chrome.runtime.sendMessage({ type: 'LOGOUT' });

    if (response.success) {
        const event = new CustomEvent('auth-state-update', { detail: response.status });
        document.dispatchEvent(event);
    }
}
