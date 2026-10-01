import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = () => {
  const { toastMessage, showToast } = useApp();

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';
  const isError = toastMessage.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-sm">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-2xl border text-sm font-medium ${
        isSuccess
          ? 'bg-emerald-900 text-white border-emerald-700'
          : isError
          ? 'bg-rose-900 text-white border-rose-700'
          : 'bg-brand-primary text-white border-brand-hover'
      }`}>
        {isSuccess ? (
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
        ) : isError ? (
          <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />
        ) : (
          <Info size={18} className="text-purple-300 flex-shrink-0" />
        )}
        <span className="flex-1 text-xs sm:text-sm leading-snug">{toastMessage.message}</span>
      </div>
    </div>
  );
};

export default Toast;
