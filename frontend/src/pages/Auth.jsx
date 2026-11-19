
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Auth() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);

    try {
      if (isRegister) {
        await register(name, email, password);
        setIsRegister(false);
        setPassword('');
        setSuccess('Account created successfully. Please log in.');
      } else {
        await login(email, password);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl min-h-[620px] bg-white rounded-3xl border border-[#E5EAF0] shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* Left branding panel */}
        <div className="hidden md:flex flex-col justify-between bg-[#032D60] p-12 text-white relative overflow-hidden">
          <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full border border-white/10" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#0176D3] flex items-center justify-center font-bold text-xl">
                L
              </div>
              <span className="text-2xl font-bold tracking-tight">LeadFlow</span>
            </div>

            <div className="mt-24">
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-[0.2em]">
                Customer Relationship Management
              </p>
              <h1 className="text-4xl font-bold text-white leading-tight mt-5">
                Manage relationships.
                <br />
                Grow your business.
              </h1>
              <p className="text-blue-100/75 mt-6 leading-7 max-w-sm">
                Bring your leads, accounts, contacts and opportunities together
                in one organised workspace.
              </p>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/15 pt-6">
            <p className="text-sm text-blue-100/70">
              Your business relationships, all in one place.
            </p>
          </div>
        </div>

        {/* Login / registration form */}
        <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
          <div className="md:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[#0176D3] text-white flex items-center justify-center font-bold text-xl">
              L
            </div>
            <span className="text-2xl font-bold text-[#032D60]">LeadFlow</span>
          </div>

          <div className="mb-8">
            <p className="text-sm font-semibold text-[#0176D3] mb-3">
              {isRegister ? 'GET STARTED' : 'WELCOME BACK'}
            </p>
            <h2 className="text-3xl font-bold text-[#032D60]">
              {isRegister ? 'Create your account' : 'Sign in to LeadFlow'}
            </h2>
            <p className="text-gray-500 mt-3 text-sm">
              {isRegister
                ? 'Create an account to access your CRM workspace.'
                : 'Enter your credentials to access your workspace.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full name
                </label>
                <input
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="input"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  minLength={12}
                  maxLength={72}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#0176D3] hover:text-[#032D60]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {isRegister && (
                <p className="text-xs text-gray-400 mt-2">
                  Use at least 12 characters.
                </p>
              )}
            </div>

            {error && (
              <div className="alert-error">{error}</div>
            )}

            {success && (
              <div className="alert-success">{success}</div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-primary w-full py-3"
            >
              {busy
                ? 'Please wait...'
                : isRegister
                  ? 'Create account'
                  : 'Sign in'}
              {!busy && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            {isRegister
              ? 'Already have an account?'
              : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccess('');
              }}
              className="ml-2 font-semibold text-[#0176D3] hover:text-[#032D60] transition-colors"
            >
              {isRegister ? 'Sign in' : 'Create account'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-12">
            © {new Date().getFullYear()} LeadFlow. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
