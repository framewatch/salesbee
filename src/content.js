// src/content.js

(async () => {
    // --- 1. INJECT APP CONTAINER ---
    const appContainer = document.createElement('div');
    appContainer.id = 'my-auth-extension-container';
    document.body.appendChild(appContainer);

    // --- 2. DYNAMIC VIEW LOADER ---
    const loadView = async (viewName, status) => {
        try {
            appContainer.innerHTML = ''; 
            const viewHtmlUrl = chrome.runtime.getURL(`src/views/${viewName}/${viewName}.html`);
            const response = await fetch(viewHtmlUrl);
            if (!response.ok) throw new Error(`Failed to fetch ${viewName}.html: ${response.statusText}`);
            appContainer.innerHTML = await response.text();
            const viewJsUrl = chrome.runtime.getURL(`src/views/${viewName}/${viewName}.js`);
            const viewModule = await import(viewJsUrl);
            if (viewModule && typeof viewModule.init === 'function') {
                viewModule.init(status);
            }
        } catch (error) {
            console.error(`Error loading view ${viewName}:`, error);
            appContainer.innerHTML = `<div id="auth-app-content"><p class="error">Error loading view. Please refresh.</p></div>`;
        }
    };

    // --- 3. UI ROUTER (REVISED LOGIC) ---
    const updateUserInterface = (status) => {
        console.log("%c--- ROUTER TRIGGERED ---", "color: blue; font-weight: bold;");
        
        if (!status || !status.user) {
            console.log("%c[ROUTER] No user found. Loading 'login'.", "color: red;");
            loadView('login', status);
            return;
        }

        // Log the critical properties for this decision
        console.log(`%c[ROUTER] Checking status:`, "color: green;", {
            isEmailVerified: status.isEmailVerified,
            isSubscribed: status.isSubscribed,
            hasHadTrial: status.hasHadTrial,
            isVintedVerified: status.isVintedVerified
        });

        // The logic is now a flat "if/else if" chain to make it unambiguous.
        if (status.isEmailVerified === false) {
            console.log("%c[ROUTER] Decision: Email NOT verified. -> 'verify_email'", "color: orange;");
            loadView('verify_email', status);
        } else if (status.isSubscribed === false && status.hasHadTrial === false) {
            console.log("%c[ROUTER] Decision: NOT subscribed, HAS NOT had trial. -> 'start_trial'", "color: orange;");
            loadView('start_trial', status);
        } else if (status.isSubscribed === false && status.hasHadTrial === true) {
            console.log("%c[ROUTER] Decision: NOT subscribed, HAS had trial. -> 'no_subscription'", "color: orange;");
            loadView('no_subscription', status);
        } else if (status.isVintedVerified === false) {
            console.log("%c[ROUTER] Decision: Subscribed, Vinted NOT verified. -> 'verify_account'", "color: orange;");
            loadView('verify_account', status);
        } else {
            console.log("%c[ROUTER] Decision: All checks passed. -> 'dashboard'", "color: green;");
            loadView('dashboard', status);
        }
    };
  
    // --- 4. LISTENERS & INITIALIZATION ---
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'USER_STATUS_CHANGED') {
            console.log("%c[LISTENER] Received 'USER_STATUS_CHANGED' from background.", "color: purple;");
            updateUserInterface(message.payload);
        }
    });

    // --- ADDED: Listen for the custom event from view modules ---
    document.addEventListener('auth-state-update', (e) => {
        console.log("%c[LISTENER] Received 'auth-state-update' from a view.", "color: purple;");
        updateUserInterface(e.detail);
    });

    try {
        console.log("%c[INIT] Requesting initial status from background script.", "color: purple;");
        const initialStatus = await chrome.runtime.sendMessage({ type: 'GET_USER_STATUS' });
        updateUserInterface(initialStatus);
    } catch (error) {
        // This error is common if the background script is not yet active.
        // The onMessage listener will catch the update once it is.
        console.warn("Could not get initial status. This is often normal on first load.", error.message);
    }

})();
