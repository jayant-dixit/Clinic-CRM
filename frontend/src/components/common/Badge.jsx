import React from 'react';

export const Badge = ({ children, status, variant = 'default', size = 'md', className = '' }) => {
  // Status to styling mapping
  const statusStyles = {
    BOOKED: 'bg-sky-50 text-sky-700 border-sky-200/80',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200/80',
    ARRIVED: 'bg-amber-50 text-amber-800 border-amber-200',
    WAITING: 'bg-orange-50 text-orange-800 border-orange-200',
    IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    NO_SHOW: 'bg-slate-100 text-slate-700 border-slate-300',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const resolvedClass = status ? statusStyles[status] || variants.default : variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-2xs whitespace-nowrap tracking-wide uppercase ${sizes[size]} ${resolvedClass} ${className}`}
    >
      {status === 'IN_PROGRESS' && (
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse mr-1.5" />
      )}
      {status === 'WAITING' && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-1.5" />
      )}
      {children || status}
    </span>
  );
};
