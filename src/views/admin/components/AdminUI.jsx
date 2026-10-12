'use client';
import React, { useEffect } from 'react';
import { X, Loader2, AlertTriangle, ChevronLeft, ChevronRight, Check } from 'lucide-react';

/**
 * Reusable Design System Tokens for the SmoothSelf Admin Panel
 * Theme: Premium Black & White SaaS Design System
 */
export const ADMIN_TOKENS = {
  colors: {
    primary: '#111111',
    primaryHover: '#262626',
    background: '#FFFFFF',
    secondaryBackground: '#F5F5F5',
    border: '#E5E5E5',
    primaryText: '#111111',
    secondaryText: '#6B7280',
  },
  font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

/**
 * Standardized Page Header for Admin Views
 */
export const AdminPageHeader = ({ title, subtitle, badge, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#111111] leading-tight">
            {title}
          </h1>
          {badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F5F5F5] text-[#6B7280] border border-[#E5E5E5]">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[13px] text-[#6B7280] mt-1 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * Standardized Button Component
 * Variants:
 * - 'primary': Black button (#111111) with white text (#FFFFFF)
 * - 'secondary': White button (#FFFFFF) with black border (#111111)
 * - 'outline': White button (#FFFFFF) with soft gray border (#E5E5E5), hover black border
 * - 'ghost': Subtle hover background (#F5F5F5)
 * - 'danger': Functional destructive red button
 * - 'danger-outline': White button with subtle red border/text
 */
export const AdminButton = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  isLoading = false,
  loadingText,
  children,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer active:scale-[0.99]';

  const variantClasses = {
    primary:
      'bg-[#111111] text-white border border-[#111111] hover:bg-[#262626] active:bg-black',
    secondary:
      'bg-white text-[#111111] border border-[#111111] hover:bg-[#F5F5F5] active:bg-[#EBEBEB]',
    outline:
      'bg-white text-[#111111] border border-[#E5E5E5] hover:border-[#111111] hover:bg-[#F5F5F5]',
    ghost:
      'bg-transparent text-[#6B7280] border border-transparent hover:bg-[#F5F5F5] hover:text-[#111111]',
    danger:
      'bg-red-600 text-white border border-red-600 hover:bg-red-700 active:bg-red-800',
    'danger-outline':
      'bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300',
  };

  const sizeClasses = {
    xs: 'min-h-[34px] sm:min-h-[30px] px-2.5 py-1 text-xs rounded-md gap-1.5',
    sm: 'min-h-[40px] sm:min-h-[36px] px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'min-h-[44px] sm:min-h-[40px] px-4 py-2.5 text-[13px] rounded-lg gap-2',
    lg: 'min-h-[48px] sm:min-h-[44px] px-5 py-3 text-sm rounded-lg gap-2',
    icon: 'min-h-[40px] min-w-[40px] sm:min-h-[36px] sm:min-w-[36px] p-2 rounded-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={15} className="animate-spin flex-shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={16} className="flex-shrink-0" />}
          {children && <span>{children}</span>}
        </>
      )}
    </button>
  );
};

/**
 * Standardized Status & Metadata Badge
 */
export const AdminBadge = ({
  variant = 'neutral',
  dot = false,
  children,
  className = '',
}) => {
  const variants = {
    neutral: 'bg-[#F5F5F5] text-[#111111] border-[#E5E5E5]',
    dark: 'bg-[#111111] text-white border-[#111111]',
    outline: 'bg-white text-[#111111] border-[#111111]',
    muted: 'bg-[#F5F5F5] text-[#6B7280] border-[#E5E5E5]',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
  };

  const dotColors = {
    neutral: 'bg-[#111111]',
    dark: 'bg-white',
    outline: 'bg-[#111111]',
    muted: 'bg-[#6B7280]',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border ${
        variants[variant] || variants.neutral
      } ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            dotColors[variant] || dotColors.neutral
          }`}
        />
      )}
      {children}
    </span>
  );
};

/**
 * Minimal SaaS Card Container
 */
export const AdminCard = ({ children, className = '', noPadding = false }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E5E5E5] ${
        noPadding ? '' : 'p-4 sm:p-6'
      } ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * KPI Metric Card for Dashboard & Summaries
 */
export const AdminStatCard = ({
  label,
  value,
  subtext,
  subtextVariant = 'muted',
  icon: Icon,
  iconText,
  alert = false,
}) => {
  const subtextColors = {
    muted: 'text-[#6B7280]',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    danger: 'text-red-600',
    primary: 'text-[#111111]',
  };

  return (
    <div
      className={`p-4 sm:p-5 bg-white rounded-xl border transition-colors ${
        alert ? 'border-red-200' : 'border-[#E5E5E5] hover:border-[#D4D4D4]'
      } flex flex-col justify-between gap-3`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border text-sm font-semibold ${
            alert
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-[#F5F5F5] border-[#E5E5E5] text-[#111111]'
          }`}
        >
          {Icon ? <Icon size={17} /> : iconText}
        </div>
      </div>

      <div>
        <div
          className={`text-2xl sm:text-[26px] font-bold tracking-tight leading-none ${
            alert ? 'text-red-600' : 'text-[#111111]'
          }`}
        >
          {value}
        </div>
        {subtext && (
          <div
            className={`text-xs font-medium mt-2 flex items-center gap-1.5 ${
              subtextColors[subtextVariant] || subtextColors.muted
            }`}
          >
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Standardized Form Input
 */
export const AdminInput = ({
  label,
  required,
  hint,
  error,
  icon: Icon,
  rightElement,
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
          />
        )}
        <input
          required={required}
          className={`w-full min-h-[44px] sm:min-h-[40px] ${
            Icon ? 'pl-10' : 'px-3.5'
          } ${
            rightElement ? 'pr-11' : 'pr-3.5'
          } py-2 bg-white border ${
            error ? 'border-red-500' : 'border-[#E5E5E5]'
          } rounded-lg text-sm sm:text-[13px] text-[#111111] placeholder:text-[#6B7280]/70 transition-colors focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] disabled:bg-[#F5F5F5] disabled:text-[#6B7280] ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {hint && !error && (
        <p className="text-[12px] text-[#6B7280] mt-1 leading-normal">{hint}</p>
      )}
      {error && (
        <p className="text-[12px] text-red-600 font-medium mt-1">{error}</p>
      )}
    </div>
  );
};

/**
 * Standardized Form Select
 */
export const AdminSelect = ({
  label,
  required,
  hint,
  error,
  children,
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <select
        required={required}
        className={`w-full min-h-[44px] sm:min-h-[40px] px-3.5 py-2 bg-white border ${
          error ? 'border-red-500' : 'border-[#E5E5E5]'
        } rounded-lg text-sm sm:text-[13px] font-medium text-[#111111] transition-colors focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] disabled:bg-[#F5F5F5] ${className}`}
        {...props}
      >
        {children}
      </select>
      {hint && !error && (
        <p className="text-[12px] text-[#6B7280] mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-[12px] text-red-600 font-medium mt-1">{error}</p>
      )}
    </div>
  );
};

/**
 * Standardized Form Textarea
 */
export const AdminTextarea = ({
  label,
  required,
  hint,
  error,
  rows = 3,
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        required={required}
        className={`w-full px-3.5 py-2.5 bg-white border ${
          error ? 'border-red-500' : 'border-[#E5E5E5]'
        } rounded-lg text-sm sm:text-[13px] text-[#111111] placeholder:text-[#6B7280]/70 transition-colors focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] leading-relaxed ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="text-[12px] text-[#6B7280] mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-[12px] text-red-600 font-medium mt-1">{error}</p>
      )}
    </div>
  );
};

/**
 * Standardized Accessible Checkbox
 */
export const AdminCheckbox = ({
  label,
  description,
  checked,
  onChange,
  className = '',
}) => {
  return (
    <label
      className={`inline-flex items-start gap-3 cursor-pointer select-none py-1.5 ${className}`}
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <div className="w-5 h-5 rounded-md border border-[#D4D4D4] bg-white peer-checked:bg-[#111111] peer-checked:border-[#111111] peer-focus-visible:ring-2 peer-focus-visible:ring-[#111111] peer-focus-visible:ring-offset-2 transition-all flex items-center justify-center">
          {checked && <Check size={13} strokeWidth={3} className="text-white" />}
        </div>
      </div>
      <div>
        <span className="block text-[13px] font-medium text-[#111111] leading-snug">
          {label}
        </span>
        {description && (
          <span className="block text-xs text-[#6B7280] mt-0.5">
            {description}
          </span>
        )}
      </div>
    </label>
  );
};

/**
 * Standardized Modal Dialog (Mobile-first & Accessible)
 */
export const AdminModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = 'max-w-lg',
  children,
  footer,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className={`relative w-full ${maxWidth} bg-white rounded-t-2xl sm:rounded-xl border border-[#E5E5E5] shadow-2xl z-10 flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-fade-in overflow-hidden`}
        >
          {/* Sticky Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between gap-4 bg-white flex-shrink-0">
            <div className="min-w-0">
              {subtitle && (
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-0.5">
                  {subtitle}
                </span>
              )}
              <h3 className="text-base sm:text-lg font-semibold text-[#111111] truncate">
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-9 h-9 rounded-lg border border-[#E5E5E5] text-[#6B7280] hover:text-[#111111] hover:bg-[#F5F5F5] flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>

          {/* Optional Sticky Footer */}
          {footer && (
            <div className="px-4 sm:px-6 py-3.5 border-t border-[#E5E5E5] bg-[#F5F5F5]/60 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Standardized Confirmation Dialog for Destructive Actions
 */
export const AdminConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  description = 'Are you sure you want to permanently delete this item? This action cannot be undone.',
  itemTitle,
  itemSubtitle,
  confirmLabel = 'Yes, Delete',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose?.()}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <AdminButton
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </AdminButton>
          <AdminButton
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="Deleting..."
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </AdminButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
          <p className="text-[13px] text-[#6B7280] leading-relaxed pt-0.5">
            {description}
          </p>
        </div>

        {(itemTitle || itemSubtitle) && (
          <div className="p-3.5 bg-[#F5F5F5] rounded-lg border border-[#E5E5E5]">
            {itemTitle && (
              <p className="text-[13px] font-semibold text-[#111111] break-words">
                {itemTitle}
              </p>
            )}
            {itemSubtitle && (
              <p className="text-xs text-[#6B7280] mt-0.5 font-mono">
                {itemSubtitle}
              </p>
            )}
          </div>
        )}
      </div>
    </AdminModal>
  );
};

/**
 * Standardized Empty State
 */
export const AdminEmptyState = ({
  icon: Icon,
  title = 'No records found',
  description = 'Try adjusting your search or filter criteria, or create a new entry.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="py-12 px-4 text-center max-w-sm mx-auto">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-[#111111] flex items-center justify-center mx-auto mb-3.5">
          <Icon size={22} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-[#111111]">{title}</h3>
      <p className="text-[13px] text-[#6B7280] mt-1 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <AdminButton variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </AdminButton>
        </div>
      )}
    </div>
  );
};

/**
 * Standardized Loading State
 */
export const AdminLoadingState = ({ message = 'Loading workspace data...' }) => {
  return (
    <div className="py-20 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-medium text-[#6B7280]">{message}</p>
    </div>
  );
};

/**
 * Standardized Pagination Bar
 */
export const AdminPagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  itemLabel = 'items',
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="px-4 sm:px-6 py-3.5 border-t border-[#E5E5E5] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <span className="text-[#6B7280]">
        Showing <strong className="font-semibold text-[#111111]">{startIdx}</strong> to{' '}
        <strong className="font-semibold text-[#111111]">{endIdx}</strong> of{' '}
        <strong className="font-semibold text-[#111111]">{totalItems}</strong> {itemLabel}
      </span>

      <div className="flex items-center gap-1.5">
        <AdminButton
          variant="outline"
          size="xs"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
          <span>Prev</span>
        </AdminButton>

        <div className="flex items-center gap-1 px-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1
            )
            .map((page, index, arr) => {
              const prevPage = arr[index - 1];
              const showEllipsis = prevPage && page - prevPage > 1;
              return (
                <React.Fragment key={page}>
                  {showEllipsis && (
                    <span className="px-1 text-[#6B7280]">…</span>
                  )}
                  <button
                    type="button"
                    onClick={() => onPageChange(page)}
                    className={`min-w-[34px] h-[34px] rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      page === currentPage
                        ? 'bg-[#111111] text-white border border-[#111111]'
                        : 'bg-white text-[#111111] border border-[#E5E5E5] hover:bg-[#F5F5F5]'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        <AdminButton
          variant="outline"
          size="xs"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </AdminButton>
      </div>
    </div>
  );
};
