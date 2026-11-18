
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  User,
  Settings,
  ChevronDown,
  Plug,
  UserRound
} from 'lucide-react';

import SearchInput from '../ui/SearchInput';
import { useSalesforce } from '../../hooks/useSalesforce';

const ROUTE_LABELS = {
  '/dashboard': { title: 'Dashboard', breadcrumb: 'Overview' },
  '/leads': { title: 'Leads', breadcrumb: 'Records' },
  '/accounts': { title: 'Accounts', breadcrumb: 'Records' },
  '/contacts': { title: 'Contacts', breadcrumb: 'Records' },
  '/opportunities': { title: 'Opportunities', breadcrumb: 'Records' },
  '/analytics': { title: 'Analytics', breadcrumb: 'Reports' },
  '/salesforce-integration': {
    title: 'Salesforce Integration',
    breadcrumb: 'Settings'
  },
  '/settings': { title: 'Settings', breadcrumb: 'Configuration' }
};

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const { connected, userInfo, loading } = useSalesforce();

  const [search, setSearch] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const dropdownRef = useRef(null);

  const route = ROUTE_LABELS[location.pathname] || {
    title: 'LeadFlow',
    breadcrumb: 'App'
  };

  const displayName =
    userInfo?.display_name || userInfo?.name || 'Salesforce User';

  const displayEmail = userInfo?.email || 'Account details unavailable';

  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleOutsideClick = event => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = event => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  const openSettings = section => {
    setProfileOpen(false);
    navigate('/settings', { state: { section } });
  };

  return (
    <header className="relative z-30 bg-white border-b border-brand-border h-16 flex items-center px-6 gap-4 shrink-0">

      <div className="flex flex-col min-w-0">
        <span className="text-xs text-brand-secondary">
          {route.breadcrumb}
        </span>
        <h1 className="text-base font-semibold text-brand-text leading-tight">
          {route.title}
        </h1>
      </div>

      <div className="flex-1 max-w-md mx-auto">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search records..."
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">

        {!loading && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              connected
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            />
            {connected ? 'Connected' : 'Not Connected'}
          </span>
        )}

        <button
          type="button"
          onClick={() => openSettings('notifications')}
          title="Notification preferences"
          aria-label="Open notification preferences"
          className="relative p-2 rounded-lg hover:bg-gray-100 text-brand-secondary transition"
        >
          <Bell size={20} />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(previous => !previous)}
            aria-expanded={profileOpen}
            aria-label="Open user profile menu"
            className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 transition"
          >
            <span className="w-9 h-9 rounded-full bg-sf-navy flex items-center justify-center text-white text-sm font-bold">
              {userInfo ? initial : <User size={17} />}
            </span>
            <ChevronDown
              size={15}
              className={`text-brand-secondary transition-transform ${
                profileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-72 bg-white border border-brand-border rounded-2xl shadow-xl overflow-hidden">

              <div className="p-4 bg-gray-50 border-b border-brand-border">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-sf-navy text-white flex items-center justify-center font-bold">
                    {userInfo ? initial : <User size={19} />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-navy truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-brand-secondary truncate">
                      {displayEmail}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs ${
                    connected ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      connected ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    {loading ? 'Checking connection...' : connected ? 'Salesforce Connected' : 'Salesforce Not Connected'}
                  </span>
                </div>
              </div>

              <div className="p-2">
                <button
                  type="button"
                  onClick={() => openSettings('profile')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-text hover:bg-blue-50 transition"
                >
                  <UserRound size={17} />
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={() => openSettings('profile')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-text hover:bg-blue-50 transition"
                >
                  <Settings size={17} />
                  Settings
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/salesforce-integration');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-brand-text hover:bg-blue-50 transition"
                >
                  <Plug size={17} />
                  Salesforce Connection
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}
