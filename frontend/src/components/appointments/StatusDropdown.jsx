import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  UserCheck,
  Check,
  CalendarDays,
  UserX,
  ChevronDown,
  Loader2,
} from 'lucide-react';

export const STATUS_CONFIG = {
  COMPLETED: {
    label: 'COMPLETED',
    displayName: 'Completed',
    colorName: 'emerald',
    icon: CheckCircle2,
    // Trigger button styles
    btnBg: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border-emerald-300/80',
    dotBg: 'bg-emerald-500',
    // Option styles with color coded blur background
    blurAura: 'bg-emerald-500/40',
    glowShadow: 'shadow-[0_0_16px_rgba(16,185,129,0.35)]',
    optionBg: 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-900 border-emerald-300',
    activeOptionBg: 'bg-emerald-500/30 text-emerald-950 font-bold border-emerald-400 ring-1 ring-emerald-400',
    desc: 'Treatment finished successfully',
  },
  CANCELLED: {
    label: 'CANCELLED',
    displayName: 'Cancelled',
    colorName: 'rose',
    icon: XCircle,
    btnBg: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 border-rose-300/80',
    dotBg: 'bg-rose-500',
    blurAura: 'bg-rose-500/40',
    glowShadow: 'shadow-[0_0_16px_rgba(244,63,94,0.35)]',
    optionBg: 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-900 border-rose-300',
    activeOptionBg: 'bg-rose-500/30 text-rose-950 font-bold border-rose-400 ring-1 ring-rose-400',
    desc: 'Appointment called off or cancelled',
  },
  IN_PROGRESS: {
    label: 'IN_PROGRESS',
    displayName: 'In Progress',
    colorName: 'purple',
    icon: Sparkles,
    btnBg: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 border-purple-300/80',
    dotBg: 'bg-purple-500',
    blurAura: 'bg-purple-500/40',
    glowShadow: 'shadow-[0_0_16px_rgba(168,85,247,0.35)]',
    optionBg: 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-900 border-purple-300',
    activeOptionBg: 'bg-purple-500/30 text-purple-950 font-bold border-purple-400 ring-1 ring-purple-400',
    pulse: true,
    desc: 'Patient is currently in consultation',
  },
  WAITING: {
    label: 'WAITING',
    displayName: 'Waiting',
    colorName: 'amber',
    icon: Clock,
    btnBg: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border-amber-300/80',
    dotBg: 'bg-amber-500',
    blurAura: 'bg-amber-500/40',
    glowShadow: 'shadow-[0_0_16px_rgba(245,158,11,0.35)]',
    optionBg: 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border-amber-300',
    activeOptionBg: 'bg-amber-500/30 text-amber-950 font-bold border-amber-400 ring-1 ring-amber-400',
    pulse: true,
    desc: 'In waiting area ready for doctor',
  },
  ARRIVED: {
    label: 'ARRIVED',
    displayName: 'Arrived',
    colorName: 'teal',
    icon: UserCheck,
    btnBg: 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-800 border-teal-300/80',
    dotBg: 'bg-teal-500',
    blurAura: 'bg-teal-500/40',
    glowShadow: 'shadow-[0_0_16px_rgba(20,184,166,0.35)]',
    optionBg: 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-900 border-teal-300',
    activeOptionBg: 'bg-teal-500/30 text-teal-950 font-bold border-teal-400 ring-1 ring-teal-400',
    desc: 'Checked in at clinic front desk',
  },
  CONFIRMED: {
    label: 'CONFIRMED',
    displayName: 'Confirmed',
    colorName: 'blue',
    icon: Check,
    btnBg: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 border-blue-300/80',
    dotBg: 'bg-blue-500',
    blurAura: 'bg-blue-500/40',
    glowShadow: 'shadow-[0_0_16px_rgba(59,130,246,0.35)]',
    optionBg: 'bg-blue-500/15 hover:bg-blue-500/25 text-blue-900 border-blue-300',
    activeOptionBg: 'bg-blue-500/30 text-blue-950 font-bold border-blue-400 ring-1 ring-blue-400',
    desc: 'Appointment slot verified',
  },
  BOOKED: {
    label: 'BOOKED',
    displayName: 'Booked',
    colorName: 'sky',
    icon: CalendarDays,
    btnBg: 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 border-sky-300/80',
    dotBg: 'bg-sky-500',
    blurAura: 'bg-sky-500/40',
    glowShadow: 'shadow-[0_0_16px_rgba(14,165,233,0.35)]',
    optionBg: 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-900 border-sky-300',
    activeOptionBg: 'bg-sky-500/30 text-sky-950 font-bold border-sky-400 ring-1 ring-sky-400',
    desc: 'Newly scheduled booking',
  },
  NO_SHOW: {
    label: 'NO_SHOW',
    displayName: 'No Show',
    colorName: 'slate',
    icon: UserX,
    btnBg: 'bg-slate-500/10 hover:bg-slate-500/20 text-slate-700 border-slate-300/80',
    dotBg: 'bg-slate-500',
    blurAura: 'bg-slate-500/40',
    glowShadow: 'shadow-[0_0_16px_rgba(100,116,139,0.35)]',
    optionBg: 'bg-slate-500/15 hover:bg-slate-500/25 text-slate-900 border-slate-300',
    activeOptionBg: 'bg-slate-500/30 text-slate-950 font-bold border-slate-400 ring-1 ring-slate-400',
    desc: 'Patient did not attend visit',
  },
};

export const DOCTOR_STATUS_KEYS = ['COMPLETED', 'IN_PROGRESS', 'NO_SHOW', 'CANCELLED'];

export const StatusDropdown = ({
  status,
  onChange,
  disabled = false,
  className = '',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef(null);

  const currentConfig = STATUS_CONFIG[status] || {
    label: status || 'UNKNOWN',
    displayName: status || 'Unknown',
    colorName: 'slate',
    icon: CalendarDays,
    btnBg: 'bg-slate-100 text-slate-700 border-slate-200',
    dotBg: 'bg-slate-400',
  };

  const CurrentIcon = currentConfig.icon;

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = async (newStatus) => {
    if (newStatus === status) {
      setIsOpen(false);
      return;
    }
    setIsOpen(false);
    setIsUpdating(true);
    try {
      await onChange(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || isUpdating}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`group relative flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 shadow-2xs backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
          currentConfig.btnBg
        } ${disabled || isUpdating ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-xs active:scale-[0.98]'}`}
      >
        <span className="flex items-center gap-1.5">
          {isUpdating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                {currentConfig.pulse && (
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentConfig.dotBg} opacity-75`}
                  />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${currentConfig.dotBg}`} />
              </span>
              <CurrentIcon className="w-3.5 h-3.5 flex-shrink-0" />
            </>
          )}
          <span className="tracking-wide uppercase font-semibold text-[11px]">
            {currentConfig.label}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-700' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-2.5 py-1.5 mb-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold tracking-wider uppercase">
            <span>Select Status</span>
            <span className="text-[10px] lowercase text-slate-400 font-normal">click to update</span>
          </div>

          {/* List of Status Choices with Color-Coded Blurred Backgrounds */}
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-0.5 custom-scrollbar">
            {DOCTOR_STATUS_KEYS.map((key) => {
              const cfg = STATUS_CONFIG[key];
              if (!cfg) return null;
              const isSelected = status === key;
              const Icon = cfg.icon;

              return (
                <div key={key} className="relative group">
                  {/* Color Coded Blur Aura Background Layer */}
                  <div
                    className={`absolute -inset-0.5 rounded-xl ${cfg.blurAura} blur-md opacity-35 group-hover:opacity-85 transition-opacity duration-200 pointer-events-none ${
                      isSelected ? 'opacity-90' : ''
                    }`}
                  />

                  {/* Option Button */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelect(key)}
                    className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border backdrop-blur-md transition-all duration-150 shadow-2xs ${
                      isSelected ? cfg.activeOptionBg : cfg.optionBg
                    } hover:scale-[1.01] active:scale-[0.99]`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2 w-2 flex-shrink-0">
                        {cfg.pulse && (
                          <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dotBg} opacity-75`}
                          />
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dotBg}`} />
                      </span>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <div className="flex flex-col text-left">
                        <span className="tracking-wide">{cfg.label}</span>
                        <span className="text-[10px] font-normal opacity-75 leading-tight">
                          {cfg.desc}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="flex-shrink-0 ml-2 p-0.5 rounded-full bg-white/70 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
