import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CalendarRange,
  Users,
  UserCheck,
  Stethoscope,
  FileSpreadsheet,
  Globe,
  QrCode,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Building2,
  Shield,
  LifeBuoy,
  Send,
  Sparkles,
  LayoutDashboard,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSupportModal } from '../context/SupportModalContext';

export const DashboardLayout = () => {
  const { user, clinic, logout, isRole } = useAuth();
  const { openSupportModal } = useSupportModal();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/appointments', icon: CalendarDays },
    { name: 'Calendar', path: '/calendar', icon: CalendarRange },
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Doctors', path: '/doctors', icon: UserCheck },
    { name: 'Services', path: '/services', icon: Stethoscope },
    { name: 'Forms', path: '/forms', icon: FileSpreadsheet, featureKey: 'customForms' },
    { name: 'Booking Pages', path: '/booking-pages', icon: Globe, featureKey: 'publicBooking' },
    { name: 'QR Codes', path: '/qr-codes', icon: QrCode, featureKey: 'qrCodeBooking' },
    { name: 'Notifications', path: '/notifications', icon: Bell, featureKey: 'automatedNotifications' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, featureKey: 'analyticsReporting' },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const bookingUrl = clinic?.slug ? `/book/${clinic.slug}/general-appointment` : null;

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 h-screen max-h-screen bg-slate-900 text-slate-300 border-r border-slate-800 flex-shrink-0 z-30 sticky top-0 self-start">
        {/* Brand / Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 bg-slate-950/40 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/30">
              🦷
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight">CareFlow</span>
              <span className="text-[10px] uppercase font-bold text-brand-400 bg-brand-950/80 px-1.5 py-0.5 rounded ml-1.5 border border-brand-800/50">
                SaaS
              </span>
            </div>
          </div>
        </div>

        {/* Clinic info pill */}
        <div className="p-3 mx-3 my-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{clinic?.name || 'Clinic Workspace'}</p>
            <p className="text-[10px] text-slate-400 truncate">/{clinic?.slug || 'clinic'}</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto min-h-0 px-3 space-y-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isLocked = item.featureKey && user?.role !== 'SUPER_ADMIN' && clinic?.features?.[item.featureKey] === false;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white font-semibold shadow-sm shadow-brand-600/30'
                      : isLocked
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 opacity-75'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                {isLocked && (
                  <span
                    title="Locked by SuperAdmin - Click to view unlock options"
                    className="flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/50"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    <span>Locked</span>
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* SuperAdmin Hub Shortcut (Visible for SUPER_ADMIN role) */}
        {user?.role === 'SUPER_ADMIN' && (
          <div className="p-3 mx-3 my-1.5 bg-gradient-to-r from-purple-950 to-indigo-950 border border-purple-800/80 rounded-xl flex-shrink-0 shadow-lg">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>SuperAdmin Console</span>
              </span>
              <span className="text-[9px] bg-purple-900 text-purple-200 px-1 py-0.5 rounded font-mono">ROOT</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2 leading-tight">Master multi-clinic provisioning & gates.</p>
            <button
              onClick={() => navigate('/superadmin')}
              className="w-full py-1.5 px-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
            >
              <span>Open SuperAdmin Hub</span>
            </button>
          </div>
        )}

        {/* Clinic Support & Feedback Button */}
        <div className="px-3 py-1.5 flex-shrink-0">
          <button
            onClick={() => openSupportModal()}
            className="w-full py-2 px-3 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium border border-slate-700/60 transition flex items-center justify-center gap-2"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-purple-400" />
            <span>Support & Feedback</span>
          </button>
        </div>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-white uppercase">
              {user?.name?.slice(0, 2) || 'AD'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
              <span className="text-[10px] text-brand-400 font-mono">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-900 text-white h-14 flex items-center justify-between px-4 border-b border-slate-800 z-40 sticky top-0 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🦷</span>
          <span className="font-extrabold text-sm tracking-tight">CareFlow</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col">
          <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🦷</span>
              <span className="font-bold text-sm">CareFlow Menu</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1 bg-slate-900 text-slate-300 min-h-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isLocked = item.featureKey && user?.role !== 'SUPER_ADMIN' && clinic?.features?.[item.featureKey] === false;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium ${
                      isActive
                        ? 'bg-brand-600 text-white font-semibold'
                        : isLocked
                        ? 'text-slate-400 hover:bg-slate-800 opacity-75'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {isLocked && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800/50">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </NavLink>
              );
            })}
            <div className="pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs flex-shrink-0">
          {/* Quick Search */}
          {/* <div className="relative w-72 hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patients, doctors, appointments..."
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
          </div> */}

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3 ml-auto">
            {bookingUrl && (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200/80 transition-all"
              >
                <span>Patient Booking Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Notification Bell */}
            <NavLink
              to="/notifications"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-brand-600 absolute top-2 right-2 ring-2 ring-white" />
            </NavLink>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  {user?.name?.[0] || 'A'}
                </div>
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-slate-500 truncate text-[11px]">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono uppercase font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                      {user?.role}
                    </span>
                  </div>
                  <NavLink
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    Clinic Settings
                  </NavLink>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Nested Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
