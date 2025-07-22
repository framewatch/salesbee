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

    // Simple check to see if the user is on a Vinted member page
    if (!window.location.href.includes('/member/')) {
        messageBox.textContent = "Error: Please navigate to your Vinted profile page first.";
        messageBox.className = 'feedback error';
        messageBox.style.display = 'block';
        return;
    }

    // Extract username from URL (e.g., "https://www.vinted.com/member/12345-jsmith")
    const urlParts = window.location.pathname.split('/');
    const vintedUsername = urlParts.pop() || urlParts.pop(); // Handles trailing slash

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
        // Dispatch an event to trigger a state refresh in background.js
        // and reload the UI.
        setTimeout(() => {
             chrome.runtime.sendMessage({ type: 'GET_USER_STATUS', forceRefresh: true });
        }, 2000);

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
        // This event will be caught by content.js to reload the view
        const event = new CustomEvent('auth-state-update', { detail: response.status });
        document.dispatchEvent(event);
    }
}
