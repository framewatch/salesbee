// src/views/login/login.js

export function init(status) {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
}

async function handleLogin() {
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const errorEl = document.getElementById('error-message');
    const loginBtn = document.getElementById('login-btn');
    
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
        errorEl.textContent = "Please enter email and password.";
        errorEl.style.display = 'block';
        return;
    }
    
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    errorEl.style.display = 'none';

    const response = await chrome.runtime.sendMessage({ type: 'LOGIN', payload: { email, password } });

    if (response.success) {
        // RESTORED: Directly dispatch the event with the status from the response.
        const event = new CustomEvent('auth-state-update', { detail: response.status });
        document.dispatchEvent(event);
    } else {
        errorEl.textContent = response.error;
        errorEl.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
}
