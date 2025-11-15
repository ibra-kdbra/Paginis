// Application State Management
// Centralized state management to replace global variables

class AppState {
    constructor() {
        this.state = {
            isRTL: false,
            currentPdf: 'https://7uzx5yn03h.ufs.sh/f/aLxFAGHMpUDrHJi2MUlQmdfILsR4SYX9vh5tGa0AxUy31OwF',
            currentPdfType: 'url',
            currentPdfName: '',
            lastPage: 1,
            theme: 'default',
            mediaVolume: 50,
            panelOpen: false
        };

        this.listeners = {};
        this.loadFromStorage();
    }

    // Get current state
    getState() {
        return { ...this.state };
    }

    // Get specific state value
    get(key) {
        return this.state[key];
    }

    // Update state and notify listeners
    set(updates) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...updates };
        this.persistToStorage();
        this.notifyListeners(prevState);
    }

    // Subscribe to state changes
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);

        // Return unsubscribe function
        return () => {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        };
    }

    // Notify listeners of state changes
    notifyListeners(prevState) {
        Object.keys(this.listeners).forEach(event => {
            if (prevState[event] !== this.state[event]) {
                this.listeners[event].forEach(callback => {
                    callback(this.state[event], prevState[event]);
                });
            }
        });
    }

    // Load state from localStorage
    loadFromStorage() {
        try {
            const stored = {
                isRTL: localStorage.getItem('isRTL'),
                currentPdf: localStorage.getItem('lastOpenedPDF'),
                currentPdfType: localStorage.getItem('lastOpenedPDFType'),
                theme: localStorage.getItem('theme'),
                mediaVolume: localStorage.getItem('mediaVolume'),
                panelOpen: localStorage.getItem('panelOpen')
            };

            // Only update state with valid stored values
            Object.keys(stored).forEach(key => {
                if (stored[key] !== null) {
                    if (key === 'isRTL' || key === 'panelOpen') {
                        this.state[key] = stored[key] === 'true';
                    } else if (key === 'mediaVolume') {
                        this.state[key] = parseInt(stored[key], 10) || 50;
                    } else {
                        this.state[key] = stored[key];
                    }
                }
            });
        } catch (error) {
            console.warn('Failed to load state from localStorage:', error);
        }
    }

    // Persist state to localStorage
    persistToStorage() {
        try {
            localStorage.setItem('isRTL', this.state.isRTL);
            localStorage.setItem('theme', this.state.theme);
            localStorage.setItem('mediaVolume', this.state.mediaVolume);
            localStorage.setItem('panelOpen', this.state.panelOpen);

            // Don't persist currentPdf here - it's handled separately in load.js
        } catch (error) {
            console.warn('Failed to persist state to localStorage:', error);
        }
    }

    // Update PDF context
    updatePdfContext(pdfUrl, pdfType, pdfName) {
        this.set({
            currentPdf: pdfUrl,
            currentPdfType: pdfType,
            currentPdfName: pdfName || ''
        });
    }

    // Toggle RTL mode
    toggleRTL() {
        this.set({ isRTL: !this.state.isRTL });
        return this.state.isRTL;
    }

    // Update last page
    setLastPage(page) {
        this.set({ lastPage: page });
    }

    // Update theme
    setTheme(theme) {
        this.set({ theme });
    }

    // Update media volume
    setMediaVolume(volume) {
        this.set({ mediaVolume: volume });
    }

    // Toggle panel state
    setPanelOpen(isOpen) {
        this.set({ panelOpen: isOpen });
    }
}

// Create global instance
const appState = new AppState();

// Make available globally for backward compatibility
window.appState = appState;

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppState;
}
