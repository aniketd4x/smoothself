'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const Toast = () => {
  const { toastMessage } = useApp();
  const pathname = usePathname() || '';
  const isAdminPath = pathname.startsWith('/admin');

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';
  const isError = toastMessage.type === 'error';

  if (isAdminPath) {
    return (
      <div className="fixed bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-[70] animate-fade-in sm:max-w-sm font-admin">
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-lg border text-[13px] font-medium ${
            isError
              ? 'bg-white text-black border-neutral-300'
              : 'bg-black text-white border-neutral-800'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 size={17} className="text-neutral-200 flex-shrink-0" />
          ) : isError ? (
            <AlertCircle size={17} className="text-black flex-shrink-0" />
          ) : (
            <Info size={17} className="text-neutral-400 flex-shrink-0" />
          )}
          <span className="flex-1 leading-snug">{toastMessage.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-sm">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-2xl border text-sm font-medium ${
        isError
          ? 'bg-neutral-900 text-white border-neutral-700'
          : 'bg-black text-white border-neutral-800'
      }`}>
        {isSuccess ? (
          <CheckCircle2 size={18} className="text-white flex-shrink-0" />
        ) : isError ? (
          <AlertCircle size={18} className="text-neutral-300 flex-shrink-0" />
        ) : (
          <Info size={18} className="text-neutral-300 flex-shrink-0" />
        )}
        <span className="flex-1 text-xs sm:text-sm leading-snug">{toastMessage.message}</span>
      </div>
    </div>
  );
};

export default Toast;
