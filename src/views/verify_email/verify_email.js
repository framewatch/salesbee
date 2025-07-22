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

async function handleCheckVerification() {
    const checkBtn = document.getElementById('check-verification-btn');
    const messageBox = document.getElementById('email-message-box');

    checkBtn.disabled = true;
    checkBtn.textContent = 'Checking...';
    messageBox.style.display = 'none';

    // Ask the background script to get the latest user status from the server.
    // The background script will then broadcast this new status, and the
    // content.js router will load the correct view if verification is successful.
    chrome.runtime.sendMessage({ type: 'GET_USER_STATUS', forceRefresh: true });

    // This timer will only run if the view has NOT changed after 3 seconds,
    // which means the verification was not successful.
    setTimeout(() => {
        // First, check if the button still exists in the DOM. If it doesn't,
        // it means the view has successfully changed and we should do nothing.
        const stillHereBtn = document.getElementById('check-verification-btn');
        if (stillHereBtn) {
            // If the button is still here, it means verification failed.
            // Re-enable the button and show an error message.
            stillHereBtn.disabled = false;
            stillHereBtn.textContent = "I've Verified My Email";
            
            const stillHereMsgBox = document.getElementById('email-message-box');
            if (stillHereMsgBox) {
                stillHereMsgBox.textContent = "Email not verified yet. Please check your inbox and try again.";
                stillHereMsgBox.className = 'feedback error';
                stillHereMsgBox.style.display = 'block';
            }
        }
    }, 3000); // Using a slightly longer timeout for reliability
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
    // Directly trigger the UI update, just like in login.js
    if (response.success) {
        const event = new CustomEvent('auth-state-update', { detail: response.status });
        document.dispatchEvent(event);
    }
}
