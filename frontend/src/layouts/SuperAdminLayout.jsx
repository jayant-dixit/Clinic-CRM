import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  Sliders,
  Users,
  CreditCard,
  LifeBuoy,
  LogOut,
  Shield,
  ArrowRight,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SuperAdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Platform Overview', path: '/superadmin', exact: true, icon: LayoutDashboard },
    { name: 'Clinics & Owners', path: '/superadmin/clinics', icon: Building2 },
    { name: 'Doctors & Staff', path: '/superadmin/doctors', icon: Stethoscope },
    { name: 'Feature Gating & Plans', path: '/superadmin/features', icon: Sliders },
    { name: 'Global Patients Network', path: '/superadmin/patients', icon: Users },
    { name: 'SaaS Revenue & Billing', path: '/superadmin/payments', icon: CreditCard },
    { name: 'Support & Complaints', path: '/superadmin/support', icon: LifeBuoy },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCurrentActive = (item) => {
    if (item.exact) {
      return location.pathname === '/superadmin' || location.pathname === '/superadmin/';
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="h-screen w-full bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 h-screen max-h-screen bg-slate-950 border-r border-slate-800/80 flex-shrink-0 z-30 sticky top-0 self-start">
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950/80 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold text-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white tracking-tight">CareFlow</span>
                <span className="text-[10px] uppercase font-bold text-purple-300 bg-purple-950/90 px-1.5 py-0.5 rounded border border-purple-700/60">
                  SUPER
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">SaaS Master Controller</p>
            </div>
          </div>
        </div>

        {/* SuperAdmin Authority Banner */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-gradient-to-r from-purple-950/60 to-indigo-950/50 border border-purple-800/40 text-xs">
          <div className="flex items-center gap-2 text-purple-300 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Root Administrator</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Full platform provisioning, feature gating, billing & global directories.
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto min-h-0 px-3 space-y-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Switch to Clinic Dashboard Portal */}
        <div className="p-3 m-3 bg-slate-900/80 border border-slate-800 rounded-xl flex-shrink-0">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300">Clinic Portal View</span>
            <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Demo</span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <span>Open Clinic View</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* User profile footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-purple-900/80 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-200 uppercase">
              {user?.name?.slice(0, 2) || 'SA'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Super Admin'}</p>
              <span className="text-[10px] text-purple-400 font-mono">SUPER_ADMIN</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-900">
        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 flex-shrink-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-white">SuperAdmin Control</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg"
            >
              Clinic View
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-14 bg-slate-950/95 z-40 p-4 flex flex-col space-y-2 border-b border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrentActive(item);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                    active ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Log out
              </button>
            </div>
          </div>
        )}

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
