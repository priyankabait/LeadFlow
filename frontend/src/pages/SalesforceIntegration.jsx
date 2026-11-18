
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Cloud, CheckCircle2, XCircle, RefreshCw, Link2,
  ShieldCheck, Database, ExternalLink, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSalesforce } from '../hooks/useSalesforce';
import { authService } from '../services/authService';

export default function SalesforceIntegration() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { connected, userInfo, loading, error, checkConnection } = useSalesforce();

  // Handle OAuth callback query params
  useEffect(() => {
    const connectedParam = searchParams.get('connected');
    const errorParam     = searchParams.get('error');

    if (connectedParam === 'true') {
      toast.success('Salesforce connected successfully!');
      setSearchParams({}, { replace: true });
      checkConnection();
    } else if (errorParam) {
      toast.error('Salesforce connection failed. Please try again.');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, checkConnection, setSearchParams]);

  useEffect(() => {
    if (checkConnection) checkConnection();
  }, [checkConnection]);

  const handleConnect = () => authService.connect();

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Salesforce?')) return;
    try {
      await authService.disconnect();
      toast.success('Salesforce disconnected.');
      await checkConnection();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to disconnect Salesforce.');
    }
  };

  const displayName = userInfo?.name || 'Salesforce User';

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div>
        <h1>Salesforce Integration</h1>
        <p className="text-sm text-brand-secondary mt-1">Connect LeadFlow with your Salesforce CRM account.</p>
      </div>

      {/* ── Connection card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-brand-border rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(3,45,96,0.06), 0 4px 16px rgba(3,45,96,0.06)' }}
      >
        {/* Card top gradient bar */}
        <div className="h-1 w-full" style={{ background: connected ? 'linear-gradient(90deg,#16A34A,#4ADE80)' : 'linear-gradient(90deg,#0176D3,#1B96FF)' }} />

        <div className="p-6 sm:p-8">
          {/* Connection status header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0"
                style={{ boxShadow: '0 2px 8px rgba(1,118,211,0.15)' }}
              >
                <Cloud size={28} className="text-brand-blue" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-brand-navy">Salesforce CRM</h2>
                <p className="text-sm text-brand-secondary">Official CRM connection via OAuth 2.0 + PKCE</p>
              </div>
            </div>

            <span className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold ${
              connected ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}>
              {connected ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {loading ? 'Checking…' : connected ? 'Connected' : 'Not Connected'}
            </span>
          </div>

          <div className="border-t border-brand-border my-6" />

          {/* Body */}
          {loading ? (
            <div className="py-10 text-center text-brand-secondary flex flex-col items-center gap-3">
              <RefreshCw size={24} className="animate-spin" />
              <p className="text-sm">Checking Salesforce connection…</p>
            </div>
          ) : connected ? (
            <div className="space-y-5">
              <div className="alert-success flex items-start gap-3">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Salesforce is successfully connected.</p>
                  <p className="text-xs mt-0.5">LeadFlow can now retrieve CRM records using your authorized connection.</p>
                </div>
              </div>

              {userInfo && (
                <div className="flex items-center gap-4 bg-gray-50 border border-brand-border rounded-xl p-4">
                  <div className="w-11 h-11 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg,#032D60,#0176D3)' }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-navy text-sm">{displayName}</p>
                    {userInfo.email    && <p className="text-xs text-brand-secondary mt-0.5">{userInfo.email}</p>}
                    {userInfo.username && <p className="text-xs text-brand-secondary">{userInfo.username}</p>}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button onClick={handleDisconnect} className="btn-danger">
                  <XCircle size={15} />
                  Disconnect Salesforce
                </button>
                <button onClick={() => checkConnection()} className="btn-secondary">
                  <RefreshCw size={14} />
                  Refresh Status
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-brand-secondary leading-relaxed">
                Authorize LeadFlow to access your Salesforce CRM data via secure OAuth 2.0 with PKCE.
                After authorization, your leads, accounts, contacts and opportunities will be available in the app.
              </p>

              {error && (
                <div className="alert-error">
                  <XCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <button onClick={handleConnect} className="btn-primary">
                <Link2 size={16} />
                Connect Salesforce
                <ExternalLink size={13} className="opacity-70" />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InfoCard
          icon={ShieldCheck}
          title="Secure Authorization"
          description="Authentication is handled via Salesforce OAuth 2.0 with PKCE (Proof Key for Code Exchange). Tokens are stored server-side only and never exposed to the browser."
        />
        <InfoCard
          icon={Database}
          title="CRM Data Access"
          description="LeadFlow reads leads, accounts, contacts and opportunities from Salesforce through the REST API. Salesforce remains the single source of truth for all CRM records."
        />
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white border border-brand-border rounded-2xl p-6"
      style={{ boxShadow: '0 1px 3px rgba(3,45,96,0.06)' }}
    >
      <div className="icon-circle bg-blue-50 text-brand-blue mb-4">
        <Icon size={20} />
      </div>
      <h3 className="font-semibold text-brand-navy">{title}</h3>
      <p className="text-sm text-brand-secondary mt-2 leading-relaxed">{description}</p>
    </div>
  );
}
