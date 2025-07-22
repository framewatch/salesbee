// src/views/dashboard/dashboard.js

export function init(status) {
    const welcomeEl = document.getElementById('welcome-message');
    if (welcomeEl && status.user) {
        welcomeEl.textContent = `Welcome, ${status.user.email}!`;
    }

    document.querySelectorAll('.use-feature-btn').forEach(button => {
        button.addEventListener('click', () => handleFeatureUsage(button));
    });
    
    document.getElementById('logout-btn-dashboard')?.addEventListener('click', handleLogout);
}

async function handleLogout() {
    const logoutBtn = document.getElementById('logout-btn-dashboard');
    if(logoutBtn) logoutBtn.disabled = true;
    
    const response = await chrome.runtime.sendMessage({ type: 'LOGOUT' });
    
    if (response.success) {
        const event = new CustomEvent('auth-state-update', { detail: response.status });
        document.dispatchEvent(event);
    }
}
  
async function handleFeatureUsage(button) {
    const featureName = button.dataset.feature;
    const messageBox = document.getElementById('message-box');
    
    button.disabled = true;
    button.textContent = '...';

    const response = await chrome.runtime.sendMessage({ type: 'USE_FEATURE', payload: { featureName } });

    if (response.success) {
        messageBox.textContent = response.data.message || `Used ${featureName}!`;
        messageBox.className = 'feedback success';
    } else {
        messageBox.textContent = `Error: ${response.error}`;
        messageBox.className = 'feedback error';
    }
    
    messageBox.style.display = 'block';
    setTimeout(() => { 
        if(messageBox) messageBox.style.display = 'none'; 
    }, 5000);

    button.disabled = false;
    const originalText = featureName === 'refreshes' ? 'Use Refresh' : 'Use AI Description';
    button.textContent = originalText;
}
