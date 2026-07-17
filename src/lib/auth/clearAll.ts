// Universal clear all function for complete logout
export function clearAllData(): void {
    if (typeof window === 'undefined') return;

    // Helper to delete a cookie with all possible options
    const deleteCookie = (name: string) => {
        try {
            const expires = "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = `${name}=${expires}; path=/; SameSite=Lax`;
            document.cookie = `${name}=${expires}; path=/; SameSite=Lax; Secure`;
            document.cookie = `${name}=${expires}; path=/; SameSite=Strict`;
            document.cookie = `${name}=${expires}; path=/; SameSite=Strict; Secure`;
            document.cookie = `${name}=${expires}; path=/; SameSite=None; Secure`;
            document.cookie = `${name}=${expires}; path=/`;

            const host = window.location.hostname;
            document.cookie = `${name}=${expires}; path=/; domain=${host}; SameSite=Lax`;
            document.cookie = `${name}=${expires}; path=/; domain=${host}; SameSite=Lax; Secure`;
            document.cookie = `${name}=${expires}; path=/; domain=.${host}; SameSite=Lax`;
            document.cookie = `${name}=${expires}; path=/; domain=.${host}; SameSite=Lax; Secure`;
            document.cookie = `${name}=${expires}; path=/; domain=.${host}; SameSite=None; Secure`;

            const parts = host.split('.');
            if (parts.length >= 2) {
                const parentDomain = '.' + parts.slice(-2).join('.');
                document.cookie = `${name}=${expires}; path=/; domain=${parentDomain}; SameSite=Lax`;
                document.cookie = `${name}=${expires}; path=/; domain=${parentDomain}; SameSite=Lax; Secure`;
                document.cookie = `${name}=${expires}; path=/; domain=${parentDomain}; SameSite=None; Secure`;
            }
        } catch (e) {
            console.error('Error deleting cookie:', name, e);
        }
    };

    // Clear ALL cookies (including HttpOnly tokens via backend calls)
    try {
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (name) {
                deleteCookie(name);
            }
        });
    } catch (e) {
        console.error('Error clearing cookies:', e);
    }

    // Clear localStorage (for persisted Zustand stores & preferences)
    try {
        localStorage.clear();
    } catch (e) {
        console.error('Error clearing localStorage:', e);
    }

    // Clear sessionStorage (for temporary payment flow data)
    try {
        sessionStorage.clear();
    } catch (e) {
        console.error('Error clearing sessionStorage:', e);
    }

    // Clear IndexedDB
    try {
        if (window.indexedDB && typeof indexedDB.databases === 'function') {
            const databases = indexedDB.databases();
            databases.then(dbs => {
                dbs.forEach(db => {
                    if (db.name) indexedDB.deleteDatabase(db.name);
                });
            }).catch(err => console.error('Error listing IndexedDB databases:', err));
        }
    } catch (e) {
        console.error('Error clearing IndexedDB:', e);
    }

    // Clear service workers
    try {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => {
                    registration.unregister();
                });
            }).catch(err => console.error('Error unregistering service workers:', err));
        }
    } catch (e) {
        console.error('Error clearing service workers:', e);
    }

    // Clear cache storage
    try {
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    caches.delete(cacheName);
                });
            }).catch(err => console.error('Error clearing cache storage:', err));
        }
    } catch (e) {
        console.error('Error clearing cache storage:', e);
    }

    // Dispatch events to update UI
    try {
        window.dispatchEvent(new Event('user-auth-change'));
        window.dispatchEvent(new Event('organizer-auth-change'));
    } catch (e) {
        console.error('Error dispatching auth change events:', e);
    }

    // Force reload to clear any in-memory state
    setTimeout(() => {
        window.location.href = '/';
    }, 100);
}

