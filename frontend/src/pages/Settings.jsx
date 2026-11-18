
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Palette, Bell, ShieldCheck, Info, Check,
  Plug, Mail, Lock, Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSalesforce } from '../hooks/useSalesforce';

const DEFAULT_SETTINGS = { notifications: true, emailUpdates: false, compactView: false };

const SECTIONS = [
  { id: 'profile',       label: 'Profile',           icon: User },
  { id: 'notifications', label: 'Notifications',      icon: Bell },
  { id: 'appearance',    label: 'Appearance',          icon: Palette },
  { id: 'privacy',       label: 'Privacy & Security',  icon: ShieldCheck },
];

export default function Settings() {
  const location = useLocation();
  const { connected, userInfo, loading } = useSalesforce();

  const [activeSection, setActiveSection] = useState(location.state?.section || 'profile');
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('leadflow-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });

  useEffect(() => {
    if (location.state?.section) setActiveSection(location.state.section);
  }, [location.state]);

  const updatePreference = (key, value) =>
    setPreferences(p => ({ ...p, [key]: value }));

  const handleSave = () => {
    try {
      localStorage.setItem('leadflow-settings', JSON.stringify(preferences));
      toast.success('Preferences saved successfully!');
    } catch { toast.error('Unable to save preferences.'); }
  };

  const displayName  = userInfo?.name  || 'Salesforce User';
  const displayEmail = userInfo?.email || 'Not available';

  return (
    <div className={preferences.compactView ? 'space-y-4' : 'space-y-6'}>

      {/* ── Page header ── */}
      <div>
        <h1>Settings</h1>
        <p className="text-sm text-brand-secondary mt-1">
          Manage your LeadFlow profile and application preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Sidebar nav ── */}
        <aside className="bg-white border border-brand-border rounded-2xl p-3 h-fit"
          style={{ boxShadow: '0 1px 3px rgba(3,45,96,0.06)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-secondary px-3 py-2">Preferences</p>
          <div className="space-y-0.5 mt-1">
            {SECTIONS.map(section => {
              const Icon = section.icon;
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-100 ${
                    active
                      ? 'bg-brand-blue text-white font-semibold'
                      : 'text-brand-secondary hover:bg-gray-50 hover:text-brand-text'
                  }`}
                >
                  <Icon size={16} />
                  {section.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Content panel ── */}
        <motion.section
          key={activeSection}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className="lg:col-span-3 bg-white border border-brand-border rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 1px 3px rgba(3,45,96,0.06)' }}
        >
          {/* ── Profile ── */}
          {activeSection === 'profile' && (
            <>
              <SectionHeader icon={User} title="My Profile" subtitle="Information from your connected Salesforce account." />
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg,#032D60,#0176D3)' }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-brand-navy">
                      {loading ? 'Loading…' : displayName}
                    </h3>
                    <p className="text-sm text-brand-secondary">{displayEmail}</p>
                    <span className={`inline-flex mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${
                      connected ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {loading ? 'Checking…' : connected ? '● Salesforce connected' : '● Salesforce not connected'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-brand-border pt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <ProfileField label="Full name"            value={displayName} />
                  <ProfileField label="Email address"        value={displayEmail} />
                  <ProfileField label="Salesforce username"  value={userInfo?.username || 'Not available'} />
                </div>

                <div className="alert-info text-xs">
                  These details are provided by Salesforce. Profile changes must be made in your Salesforce account.
                </div>
              </div>
            </>
          )}

          {/* ── Notifications ── */}
          {activeSection === 'notifications' && (
            <>
              <SectionHeader icon={Bell} title="Notifications" subtitle="Manage your saved notification preferences." />
              <div className="p-6 divide-y divide-brand-border">
                <Toggle label="In-app notifications" description="Set your preference for notifications inside LeadFlow."
                  checked={preferences.notifications} onChange={v => updatePreference('notifications', v)} />
                <Toggle label="Email updates" description="Save your preference for email updates."
                  checked={preferences.emailUpdates} onChange={v => updatePreference('emailUpdates', v)} />
                <div className="pt-4">
                  <p className="alert-info text-xs mt-2">
                    Preferences are stored locally in this browser. Actual email delivery and push notifications are not configured yet.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ── Appearance ── */}
          {activeSection === 'appearance' && (
            <>
              <SectionHeader icon={Palette} title="Appearance" subtitle="Adjust your layout preferences." />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Monitor size={20} className="text-brand-blue" />
                  <div>
                    <p className="text-sm font-medium text-brand-text">Layout density</p>
                    <p className="text-xs text-brand-secondary">Choose how compact the Settings page should appear.</p>
                  </div>
                </div>
                <Toggle label="Compact view" description="Reduce vertical spacing on this Settings page."
                  checked={preferences.compactView} onChange={v => updatePreference('compactView', v)} />
                <p className="alert-info text-xs mt-4">
                  The current application theme is light. A full application-wide dark mode can be added separately.
                </p>
              </div>
            </>
          )}

          {/* ── Privacy ── */}
          {activeSection === 'privacy' && (
            <>
              <SectionHeader icon={ShieldCheck} title="Privacy & Security" subtitle="Review your connection and security information." />
              <div className="p-6 space-y-5">
                <PrivacyItem icon={Plug}  title="Salesforce connection"
                  value={loading ? 'Checking connection…' : connected ? 'Your Salesforce account is connected.' : 'No active Salesforce connection.'} />
                <PrivacyItem icon={Mail}  title="Connected account"      value={displayEmail} />
                <PrivacyItem icon={Lock}  title="Account security"
                  value="Authentication is handled through your Salesforce OAuth 2.0 integration with PKCE." />
                <div className="alert-info text-xs">
                  Tokens are stored server-side only and never exposed to the browser.
                  Password management and session controls are handled by Salesforce.
                </div>
              </div>
            </>
          )}

          {/* ── Save button ── */}
          {activeSection !== 'profile' && activeSection !== 'privacy' && (
            <div className="flex justify-end px-6 py-4 border-t border-brand-border bg-gray-50/50">
              <button type="button" onClick={handleSave} className="btn-primary">
                <Check size={15} />
                Save Preferences
              </button>
            </div>
          )}
        </motion.section>
      </div>

      {/* ── About ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <Info size={18} className="text-brand-blue shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-brand-navy">About LeadFlow</p>
          <p className="text-xs text-brand-secondary mt-1 leading-relaxed">
            LeadFlow is a Salesforce-integrated CRM platform for lead management, account tracking and sales analytics.
          </p>
          <p className="text-xs text-brand-secondary mt-1.5 font-medium">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="p-6 border-b border-brand-border flex items-center gap-3">
      <div className="icon-circle bg-blue-50 text-brand-blue"><Icon size={19} /></div>
      <div>
        <h2 className="font-semibold text-brand-navy">{title}</h2>
        <p className="text-xs text-brand-secondary mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 py-4 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-brand-text">{label}</p>
        <p className="text-xs text-brand-secondary mt-0.5">{description}</p>
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${
          checked ? 'bg-brand-blue' : 'bg-gray-200'
        }`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </div>
    </label>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-brand-secondary font-medium mb-1">{label}</p>
      <p className="text-sm font-medium text-brand-text break-all">{value}</p>
    </div>
  );
}

function PrivacyItem({ icon: Icon, title, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="icon-circle bg-blue-50 text-brand-blue mt-0.5 shrink-0"><Icon size={16} /></div>
      <div>
        <p className="text-sm font-medium text-brand-text">{title}</p>
        <p className="text-xs text-brand-secondary mt-1 leading-relaxed break-all">{value}</p>
      </div>
    </div>
  );
}
