import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const toastStyles = {
    success: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: 'text-emerald-600',
        iconBg: 'bg-emerald-100'
    },
    error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-600',
        iconBg: 'bg-red-100'
    },
    info: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        icon: 'text-indigo-600',
        iconBg: 'bg-indigo-100'
    },
    warning: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'text-amber-600',
        iconBg: 'bg-amber-100'
    }
};

const toastIcons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle
};

const Toast = ({ toast, onClose }) => {
    const style = toastStyles[toast.type] || toastStyles.info;
    const Icon = toastIcons[toast.type] || Info;

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-xl border ${style.bg} ${style.border} shadow-lg animate-slide-in`}
        >
            <div className={`p-1.5 rounded-lg ${style.iconBg}`}>
                <Icon className={`w-4 h-4 ${style.icon}`} />
            </div>
            <p className="flex-1 text-sm font-medium text-slate-700">{toast.message}</p>
            <button
                onClick={() => onClose(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
};

const ToastContainer = ({ toasts, onClose }) => {
    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
};

export default ToastContainer;