'use client';

import { useState, useCallback } from 'react';

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

let toastId = 0;

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    }, []);

    return { toasts, addToast };
}

export function ToastContainer({ toasts }: { toasts: { id: number; message: string; type: string }[] }) {
    return (
        <div className="toast-container">
            {toasts.map(t => (
                <div key={t.id} className={`toast ${t.type}`}>
                    {t.type === 'success' ? '✅' : '❌'} {t.message}
                </div>
            ))}
        </div>
    );
}
