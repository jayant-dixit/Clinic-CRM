import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Sparkles, Building2, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const Login = () => {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await login(email, password);
      if (res?.user?.role === 'SUPER_ADMIN') {
        navigate('/superadmin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    try {
      setLoading(true);
      const res = await demoLogin(role);
      if (res?.user?.role === 'SUPER_ADMIN' || role === 'SUPER_ADMIN') {
        navigate('/superadmin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-lg shadow-brand-500/30 mb-3">
            🦷
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to CareFlow</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your clinic schedule, dynamic forms & patients</p>
        </div>

        {/* 1-Click Demo Buttons Box */}
        <div className="bg-brand-50/60 p-4 rounded-3xl border border-brand-200/80 mb-6 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Instant 1-Click Demo Logins</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick('CLINIC_ADMIN')}
              className="p-2.5 bg-white hover:bg-brand-50 rounded-xl border border-brand-200 text-xs font-semibold text-brand-800 shadow-2xs transition-all text-center flex flex-col items-center gap-1"
            >
              <Building2 className="w-4 h-4 text-brand-600" />
              <span>Clinic Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('STAFF')}
              className="p-2.5 bg-white hover:bg-amber-50 rounded-xl border border-amber-200 text-xs font-semibold text-amber-900 shadow-2xs transition-all text-center flex flex-col items-center gap-1"
            >
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>Receptionist</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('SUPER_ADMIN')}
              className="p-2.5 bg-white hover:bg-purple-50 rounded-xl border border-purple-200 text-xs font-semibold text-purple-900 shadow-2xs transition-all text-center flex flex-col items-center gap-1"
            >
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Super Admin</span>
            </button>
          </div>
        </div>

        {/* Main Login Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="clinic@smilecare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              variant="primary"
              size="lg"
              className="w-full mt-2"
              iconRight={ArrowRight}
            >
              Sign In to Dashboard
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Want to register a new clinic?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
