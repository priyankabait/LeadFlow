
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, User, Settings, ChevronDown, Plug, UserRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSalesforce } from '../../hooks/useSalesforce';

const ROUTE_LABELS = {
  '/dashboard':              { title: 'Dashboard',             breadcrumb: 'Overview' },
  '/leads':                  { title: 'Leads',                 breadcrumb: 'Records' },
  '/accounts':               { title: 'Accounts',              breadcrumb: 'Records' },
  '/contacts':               { title: 'Contacts',              breadcrumb: 'Records' },
  '/opportunities':          { title: 'Opportunities',         breadcrumb: 'Records' },
  '/analytics':              { title: 'Analytics',             breadcrumb: 'Reports' },
  '/salesforce-integration': { title: 'Salesforce Integration',breadcrumb: 'Settings' },
  '/settings':               { title: 'Settings',              breadcrumb: 'Configuration' },
};

export default function TopNav() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { connected, userInfo, loading } = useSalesforce();

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const route = ROUTE_LABELS[location.pathname] || { title: 'LeadFlow', breadcrumb: 'App' };

  const displayName  = userInfo?.name  || 'Salesforce User';
  const displayEmail = userInfo?.email || 'Account details unavailable';
  const initial      = displayName.charAt(0).toUpperCase();

  // Close on outside click / Escape
  useEffect(() => {
    const onOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false);
    };
    const onEsc = e => { if (e.key === 'Escape') setProfileOpen(false); };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('mousedown', onOutside); document.removeEventListener('keydown', onEsc); };
  }, []);

  // Close on route change
  useEffect(() => { setProfileOpen(false); }, [location.pathname]);

  const openSettings = section => {
    setProfileOpen(false);
    navigate('/settings', { state: { section } });
  };

  return (
    <header className="relative z-30 bg-white border-b border-brand-border h-16 flex items-center px-5 gap-4 shrink-0"
      style={{ boxShadow: '0 1px 0 #E5EAF0, 0 2px 8px rgba(3,45,96,0.04)' }}
    >
      {/* Page title */}
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-brand-secondary font-medium uppercase tracking-wider leading-none">
          {route.breadcrumb}
        </span>
        <h1 className="text-[15px] font-semibold text-brand-text leading-tight mt-0.5">
          {route.title}
        </h1>
      </div>

      <div className="flex-1" />

      {/* SF connection badge */}
      {!loading && (
        <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          connected
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
          {connected ? 'Connected' : 'Not Connected'}
        </span>
      )}

      {/* Notifications */}
      <button
        type="button"
        onClick={() => openSettings('notifications')}
        title="Notification preferences"
        aria-label="Open notification preferences"
        className="relative p-2 rounded-lg text-brand-secondary hover:bg-gray-100 hover:text-brand-text transition-colors duration-150"
      >
        <Bell size={19} />
      </button>

      {/* Profile dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setProfileOpen(p => !p)}
          aria-expanded={profileOpen}
          aria-label="Open user profile menu"
          className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 transition-colors duration-150"
        >
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #032D60 0%, #0176D3 100%)' }}
          >
            {userInfo ? initial : <User size={17} />}
          </span>
          <ChevronDown
            size={14}
            className={`text-brand-secondary transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-72 bg-white border border-brand-border rounded-2xl shadow-card-lg overflow-hidden z-50"
            >
              {/* User header */}
              <div className="p-4 border-b border-brand-border"
                style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EAF5FE 100%)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: 'linear-gradient(135deg, #032D60 0%, #0176D3 100%)' }}
                  >
                    {userInfo ? initial : <User size={19} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-navy truncate">{displayName}</p>
                    <p className="text-xs text-brand-secondary truncate">{displayEmail}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    connected ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    {loading ? 'Checking connection…' : connected ? 'Salesforce Connected' : 'Salesforce Not Connected'}
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-2 space-y-0.5">
                <DropdownItem icon={UserRound} label="My Profile"            onClick={() => openSettings('profile')} />
                <DropdownItem icon={Settings}  label="Settings"              onClick={() => openSettings('profile')} />
                <DropdownItem icon={Plug}      label="Salesforce Connection" onClick={() => { setProfileOpen(false); navigate('/salesforce-integration'); }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function DropdownItem({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-brand-text hover:bg-blue-50 hover:text-brand-blue transition-colors duration-100"
    >
      <Icon size={16} className="text-brand-secondary" />
      {label}
    </button>
  );
}
