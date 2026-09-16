'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SlotLock {
    id: string;
    lock_key: string;
    type: string;
    reference_id: string;
    date: string;
    slot: string;
    court_name?: string;
    expires_at: string;
}

// BUG FIX #2: Export function to clear lock key (called on logout)
export function clearSlotLockKey(): void {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('ticpin_lock_key');
        console.debug('[SlotLock] Cleared lock key on logout');
    }
}

export function useSlotLock(type: 'play' | 'event' | 'dining') {
    const [lockKey, setLockKey] = useState<string>('');
    const [locks, setLocks] = useState<SlotLock[]>([]);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    // 1. Persistent lock key - BUG FIX #2: Regenerate on new session
    useEffect(() => {
        let key = localStorage.getItem('ticpin_lock_key');
        if (!key) {
            // Generate new lock key for this session
            key = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('ticpin_lock_key', key);
            console.debug('[SlotLock] Generated new lock key:', key);
        } else {
            console.debug('[SlotLock] Using existing lock key:', key);
        }
        setLockKey(key);
    }, []);

    // 2. Fetch locks
    const fetchLocks = useCallback(async () => {
        if (!lockKey) return;
        try {
            const res = await fetch(`/backend/api/booking/lock/status?lock_key=${lockKey}&type=${type}`);
            if (res.ok) {
                const text = await res.text();
                let data: any = {};
                try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
                setLocks(data.locks || []);
            }
        } catch (err) {
            console.error('Failed to fetch locks:', err);
        } finally {
            setLoading(false);
        }
    }, [lockKey, type]);

    useEffect(() => {
        if (lockKey) {
            fetchLocks();
        }
    }, [lockKey, fetchLocks]);

    // 3. Countdown timer
    useEffect(() => {
        if (locks.length === 0) {
            setTimeRemaining(0);
            return;
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            let maxRemaining = 0;
            let countExpired = 0;

            locks.forEach(lock => {
                const expiresAt = new Date(lock.expires_at).getTime();
                const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
                if (remaining > maxRemaining) {
                    maxRemaining = remaining;
                }
                if (remaining === 0) {
                    countExpired++;
                }
            });

            setTimeRemaining(maxRemaining);

            if (countExpired > 0 && maxRemaining === 0) {
                setLocks([]);
                sessionStorage.removeItem('ticpin_cart');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [locks]);

    const lockSlot = async (referenceId: string, date: string, slot: string, courtName?: string) => {
        if (!lockKey) {
            console.warn('[SlotLock] No lock key available');
            return false;
        }
        try {
            const res = await fetch('/backend/api/booking/lock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lock_key: lockKey,
                    type,
                    reference_id: referenceId,
                    date,
                    slot,
                    court_name: courtName || ''
                })
            });
            
            if (res.ok) {
                await fetchLocks();
                return true;
            } else {
                let errorText = 'Failed to lock slot';
                try {
                    const text = await res.text();
                    const trimmed = (text || '').trim();
                    if (trimmed.startsWith('<') || trimmed.includes('<!doctype')) {
                        errorText = `Server error (${res.status})`;
                    } else if (text) {
                        try {
                            const errorData = JSON.parse(text);
                            errorText = errorData?.message || errorData?.error || errorData?.details || text;
                        } catch {
                            errorText = text;
                        }
                    }
                } catch {
                    // ignore parse errors and keep fallback
                }
                console.error('[SlotLock] Lock error:', errorText);
                return false;
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            console.error('[SlotLock] Lock failed:', errorMsg);
            return false;
        }
    };

    const unlockSlot = async (referenceId: string, date: string, slot: string, courtName?: string) => {
        if (!lockKey) {
            console.warn('[SlotLock] No lock key available for unlock');
            return false;
        }
        try {
            const res = await fetch('/backend/api/booking/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lock_key: lockKey,
                    type,
                    reference_id: referenceId,
                    date,
                    slot,
                    court_name: courtName || ''
                })
            });
            if (res.ok) {
                await fetchLocks();
                return true;
            }
            const errorText = await res.text().catch(() => 'Unknown error');
            console.error('[SlotLock] Unlock failed:', errorText);
            return false;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            console.error('[SlotLock] Unlock error:', errorMsg);
            return false;
        }
    };

    const unlockAll = async () => {
        if (!lockKey || locks.length === 0) {
            console.warn('[SlotLock] Cannot unlock: no lock key or no active locks');
            return;
        }
        try {
            const res = await fetch('/backend/api/booking/unlock-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lock_key: lockKey, type })
            });
            
            if (res.ok) {
                setLocks([]);
            } else {
                const errorText = await res.text().catch(() => 'Unknown error');
                console.error('[SlotLock] Unlock all failed:', errorText);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            console.error('[SlotLock] Unlock all error:', errorMsg);
        }
    };

    return {
        lockKey,
        locks,
        timeRemaining,
        loading,
        lockSlot,
        unlockSlot,
        unlockAll,
        refreshLocks: fetchLocks
    };
}
