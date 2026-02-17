'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { X } from 'lucide-react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, type: Toast['type']) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: Toast['type'] = 'info') => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-6 right-6 z-[9999] space-y-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-xl shadow-lg animate-in slide-in-from-right duration-300 ${toast.type === 'success'
                                ? 'bg-green-500 text-white'
                                : toast.type === 'error'
                                    ? 'bg-red-500 text-white'
                                    : toast.type === 'warning'
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-blue-500 text-white'
                            }`}
                    >
                        <span className="font-medium">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="hover:bg-white/20 rounded-full p-1 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
