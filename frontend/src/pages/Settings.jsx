
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Bell,
  ShieldCheck,
  Info,
  Check,
  Plug,
  Mail,
  Lock,
  Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSalesforce } from '../hooks/useSalesforce';

const DEFAULT_SETTINGS = {
  notifications: true,
  emailUpdates: false,
  compactView: false
};

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck }
];

export default function Settings() {
  const location = useLocation();
  const { connected, userInfo, loading } = useSalesforce();

  const [activeSection, setActiveSection] = useState(
    location.state?.section || 'profile'
  );

  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('leadflow-settings');
      return saved
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
        : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    if (location.state?.section) {
      setActiveSection(location.state.section);
    }
  }, [location.state]);

  const updatePreference = (key, value) => {
    setPreferences(previous => ({
      ...previous,
      [key]: value
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        'leadflow-settings',
        JSON.stringify(preferences)
      );
      toast.success('Preferences saved successfully!');
    } catch {
      toast.error('Unable to save preferences.');
    }
  };

  const displayName =
    userInfo?.display_name || userInfo?.name || 'Salesforce User';

  const displayEmail = userInfo?.email || 'Not available';

  const Toggle = ({ label, description, checked, onChange }) => (
    <label className="flex items-center justify-between gap-4 py-3 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-brand-text">{label}</p>
        <p className="text-xs text-brand-secondary mt-1">{description}</p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        className="h-5 w-5 accent-blue-600 cursor-pointer"
      />
    </label>
  );

  const SectionButton = ({ section }) => {
    const Icon = section.icon;
    const active = activeSection === section.id;

    return (
      <button
        type="button"
        onClick={() => setActiveSection(section.id)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition ${
          active
            ? 'bg-blue-50 text-brand-blue font-semibold'
            : 'text-brand-secondary hover:bg-gray-50 hover:text-brand-text'
        }`}
      >
        <Icon size={18} />
        {section.label}
      </button>
    );
  };

  return (
    <div className={preferences.compactView ? 'space-y-4' : 'space-y-6'}>
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Settings</h1>
        <p className="text-sm text-brand-secondary mt-1">
          Manage your LeadFlow profile and application preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="bg-white border border-brand-border rounded-2xl p-4 shadow-sm h-fit">
          <h2 className="text-sm font-semibold text-brand-navy px-3 py-2">
            Preferences
          </h2>

          <div className="space-y-1">
            {SECTIONS.map(section => (
              <SectionButton key={section.id} section={section} />
            ))}
          </div>
        </aside>

        <motion.section
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white border border-brand-border rounded-2xl shadow-sm overflow-hidden"
        >
          {activeSection === 'profile' && (
            <>
              <div className="p-6 border-b border-brand-border">
                <div className="flex items-center gap-3">
                  <User className="text-brand-blue" size={22} />
                  <div>
                    <h2 className="font-semibold text-brand-navy">My Profile</h2>
                    <p className="text-xs text-brand-secondary mt-1">
                      Information from your connected Salesforce account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-brand-blue flex items-center justify-center text-white text-2xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-brand-navy">
                      {loading ? 'Loading profile...' : displayName}
                    </h3>
                    <p className="text-sm text-brand-secondary">
                      {displayEmail}
                    </p>
                    <span className={`inline-flex mt-2 text-xs px-2.5 py-1 rounded-full ${
                      connected
                        ? 'bg-green-50 text-green-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {loading ? 'Checking connection' : connected ? 'Salesforce connected' : 'Salesforce not connected'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-brand-border pt-5 space-y-4">
                  <div>
                    <p className="text-xs text-brand-secondary mb-1">Full name</p>
                    <p className="text-sm font-medium text-brand-text">{displayName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-secondary mb-1">Email address</p>
                    <p className="text-sm font-medium text-brand-text">{displayEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-secondary mb-1">Salesforce username</p>
                    <p className="text-sm font-medium text-brand-text break-all">
                      {userInfo?.username || 'Not available'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-brand-secondary bg-blue-50 rounded-xl p-3">
                  These details are provided by Salesforce. Profile changes must be made in your Salesforce account.
                </p>
              </div>
            </>
          )}

          {activeSection === 'notifications' && (
            <>
              <div className="p-6 border-b border-brand-border">
                <div className="flex items-center gap-3">
                  <Bell className="text-brand-blue" size={22} />
                  <div>
                    <h2 className="font-semibold text-brand-navy">Notifications</h2>
                    <p className="text-xs text-brand-secondary mt-1">
                      Manage your saved notification preferences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <Toggle
                  label="In-app notifications"
                  description="Set your preference for notifications inside LeadFlow."
                  checked={preferences.notifications}
                  onChange={value => updatePreference('notifications', value)}
                />
                <div className="border-t border-brand-border" />
                <Toggle
                  label="Email updates"
                  description="Save your preference for email updates."
                  checked={preferences.emailUpdates}
                  onChange={value => updatePreference('emailUpdates', value)}
                />
                <p className="text-xs text-brand-secondary bg-blue-50 rounded-xl p-3 mt-4">
                  These preferences are stored locally in this browser. Actual email delivery and push notifications are not configured yet.
                </p>
              </div>
            </>
          )}

          {activeSection === 'appearance' && (
            <>
              <div className="p-6 border-b border-brand-border">
                <div className="flex items-center gap-3">
                  <Palette className="text-brand-blue" size={22} />
                  <div>
                    <h2 className="font-semibold text-brand-navy">Appearance</h2>
                    <p className="text-xs text-brand-secondary mt-1">
                      Adjust your layout preferences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Monitor size={20} className="text-brand-blue" />
                  <div>
                    <p className="text-sm font-medium text-brand-text">Layout density</p>
                    <p className="text-xs text-brand-secondary">
                      Choose how compact the Settings page should appear.
                    </p>
                  </div>
                </div>

                <Toggle
                  label="Compact view"
                  description="Reduce vertical spacing on this Settings page."
                  checked={preferences.compactView}
                  onChange={value => updatePreference('compactView', value)}
                />

                <p className="text-xs text-brand-secondary bg-blue-50 rounded-xl p-3 mt-4">
                  The current application theme remains light. A full application-wide theme switch can be added separately.
                </p>
              </div>
            </>
          )}

          {activeSection === 'privacy' && (
            <>
              <div className="p-6 border-b border-brand-border">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-brand-blue" size={22} />
                  <div>
                    <h2 className="font-semibold text-brand-navy">Privacy & Security</h2>
                    <p className="text-xs text-brand-secondary mt-1">
                      Review your current connection information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <Plug size={20} className="text-brand-blue mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-brand-text">Salesforce connection</p>
                    <p className="text-xs text-brand-secondary mt-1">
                      {loading ? 'Checking connection...' : connected ? 'Your Salesforce account is connected.' : 'No active Salesforce connection is reported.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={20} className="text-brand-blue mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-brand-text">Connected account</p>
                    <p className="text-xs text-brand-secondary mt-1 break-all">
                      {displayEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Lock size={20} className="text-brand-blue mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-brand-text">Account security</p>
                    <p className="text-xs text-brand-secondary mt-1">
                      Authentication is handled through your Salesforce OAuth integration.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-brand-secondary bg-blue-50 rounded-xl p-3">
                  Password management, session controls and data deletion are not currently available in this application.
                </p>
              </div>
            </>
          )}

          <div className="flex justify-end p-5 border-t border-brand-border">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              <Check size={16} />
              Save Preferences
            </button>
          </div>
        </motion.section>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
        <Info size={19} className="text-brand-blue shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-brand-navy">About LeadFlow</p>
          <p className="text-xs text-brand-secondary mt-1">
            LeadFlow is a Salesforce-integrated CRM platform for lead management,
            account tracking and sales analytics.
          </p>
          <p className="text-xs text-brand-secondary mt-2">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
