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
              ? 'bg-white text-[#111111] border-red-200'
              : 'bg-[#111111] text-white border-[#262626]'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 size={17} className="text-emerald-400 flex-shrink-0" />
          ) : isError ? (
            <AlertCircle size={17} className="text-red-600 flex-shrink-0" />
          ) : (
            <Info size={17} className="text-[#9CA3AF] flex-shrink-0" />
          )}
          <span className="flex-1 leading-snug">{toastMessage.message}</span>
        </div>
      </div>
    );
  }

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
