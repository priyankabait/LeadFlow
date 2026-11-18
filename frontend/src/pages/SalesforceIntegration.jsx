
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Link2,
  ShieldCheck,
  Database,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSalesforce } from '../hooks/useSalesforce';
import { authService } from '../services/authService';

export default function SalesforceIntegration() {
  const {
    connected,
    userInfo,
    loading,
    error,
    checkConnection
  } = useSalesforce();

  useEffect(() => {
    if (checkConnection) checkConnection();
  }, [checkConnection]);

  const handleConnect = () => {
    authService.connect();
  };

  const handleDisconnect = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to disconnect Salesforce?'
    );

    if (!confirmed) return;

    try {
      await authService.disconnect();
      toast.success('Salesforce disconnected.');
      if (checkConnection) await checkConnection();
    } catch (err) {
      toast.error(
        err.response?.data?.error || 'Unable to disconnect Salesforce.'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">
          Salesforce Integration
        </h1>
        <p className="text-sm text-brand-secondary mt-1">
          Connect LeadFlow with your Salesforce CRM account.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Cloud size={30} className="text-brand-blue" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-brand-navy">
                  Salesforce CRM
                </h2>
                <p className="text-sm text-brand-secondary">
                  Official CRM connection
                </p>
              </div>
            </div>

            <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
              connected
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {connected
                ? <CheckCircle2 size={16} />
                : <XCircle size={16} />}
              {loading ? 'Checking...' : connected ? 'Connected' : 'Not Connected'}
            </span>
          </div>

          <div className="border-t border-brand-border my-6" />

          {loading ? (
            <div className="py-8 text-center text-brand-secondary">
              <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
              Checking Salesforce connection...
            </div>
          ) : connected ? (
            <div className="space-y-5">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-700 font-medium">
                  <CheckCircle2 size={19} />
                  Salesforce is successfully connected.
                </div>
                <p className="text-sm text-green-700 mt-1">
                  LeadFlow can now request CRM records using your authorized connection.
                </p>
              </div>

              {userInfo && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-brand-secondary mb-1">
                    Connected Salesforce user
                  </p>
                  <p className="font-semibold text-brand-navy">
                    {userInfo.display_name || userInfo.name || 'Salesforce User'}
                  </p>
                  {userInfo.username && (
                    <p className="text-sm text-brand-secondary mt-1">
                      {userInfo.username}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleDisconnect}
                className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition"
              >
                Disconnect Salesforce
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-brand-secondary leading-6">
                Authorize LeadFlow to access your Salesforce CRM data. After
                authorization, your leads, accounts, contacts and opportunities
                can be displayed in the application.
              </p>
                <button
                onClick={handleConnect}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0176D3] text-white font-semibold text-sm hover:bg-[#014486] transition-all shadow-md cursor-pointer"
                >
                <Link2 size={17} />
                Connect Salesforce
                <ExternalLink size={15} />
                </button>
            </div>
          )}

          {error && (
            <div className="mt-5 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
          <ShieldCheck size={24} className="text-brand-blue mb-3" />
          <h3 className="font-semibold text-brand-navy">Secure Authorization</h3>
          <p className="text-sm text-brand-secondary mt-2 leading-6">
            Salesforce authorization is handled through its OAuth 2.0 flow.
            Your application requests only the access permitted by the
            authorization settings.
          </p>
        </div>

        <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
          <Database size={24} className="text-brand-blue mb-3" />
          <h3 className="font-semibold text-brand-navy">CRM Data Access</h3>
          <p className="text-sm text-brand-secondary mt-2 leading-6">
            LeadFlow retrieves CRM records from Salesforce through its REST API.
            Salesforce remains the source of truth for those records.
          </p>
        </div>
      </div>
    </div>
  );
}
