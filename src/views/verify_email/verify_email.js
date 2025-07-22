// src/views/verify_email/verify_email.js

export function init(status) {
    const emailDisplay = document.getElementById('user-email-display');
    if (emailDisplay && status.user) {
        emailDisplay.textContent = status.user.email;
    }

    const checkBtn = document.getElementById('check-verification-btn');
    if (checkBtn) {
        checkBtn.addEventListener('click', handleCheckVerification);
    }

    const resendLink = document.getElementById('resend-email-link');
    if(resendLink) {
        resendLink.addEventListener('click', handleResendEmail);
    }

    const logoutBtn = document.getElementById('logout-btn-email');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// --- UPDATED: Rewritten for robust, immediate feedback ---
async function handleCheckVerification() {
    const checkBtn = document.getElementById('check-verification-btn');
    const messageBox = document.getElementById('email-message-box');

    checkBtn.disabled = true;
    checkBtn.textContent = 'Checking...';
    messageBox.style.display = 'none';

    // Ask the background script for the latest user status from the server.
    const latestStatus = await chrome.runtime.sendMessage({ type: 'GET_USER_STATUS', forceRefresh: true });

    // Dispatch an event with the absolute latest status.
    // The router in content.js will see this and switch the view if verification is complete.
    const event = new CustomEvent('auth-state-update', { detail: latestStatus });
    document.dispatchEvent(event);

    // If verification is still not complete, the view won't change.
    // In that case, we should show a message and re-enable the button.
    if (!latestStatus.isEmailVerified) {
        messageBox.textContent = "Email not verified yet. Please check your inbox and try again.";
        messageBox.className = 'feedback error';
        messageBox.style.display = 'block';
        checkBtn.disabled = false;
        checkBtn.textContent = "I've Verified My Email";
    }
}

async function handleResendEmail(e) {
    e.preventDefault();
    const messageBox = document.getElementById('email-message-box');
    messageBox.textContent = 'Sending new link...';
    messageBox.className = 'feedback success';
    messageBox.style.display = 'block';

    const response = await chrome.runtime.sendMessage({ type: 'SEND_VERIFICATION_EMAIL' });

    if (response.success) {
        messageBox.textContent = 'New verification email sent!';
    } else {
        messageBox.textContent = `Error: ${response.error}`;
        messageBox.className = 'feedback error';
    }
}

async function handleLogout() {
    const logoutBtn = document.getElementById('logout-btn-email');
    if (logoutBtn) logoutBtn.disabled = true;
    const response = await chrome.runtime.sendMessage({ type: 'LOGOUT' });
    if (response.success) {
        const event = new CustomEvent('auth-state-update', { detail: response.status });
        document.dispatchEvent(event);
    }
}
