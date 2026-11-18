
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  UserCircle,
  TrendingUp,
  DollarSign,
  RefreshCw,
  UserPlus,
  PlusCircle,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/ui/StatCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { useSalesforce } from '../hooks/useSalesforce';

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    connected,
    loading: connectionLoading
  } = useSalesforce();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    if (!connected) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await dashboardService.getStats();
      const data = response.data?.data;

      if (!data) {
        throw new Error('Dashboard data was not returned.');
      }

      setStats(data);
    } catch (err) {
      setStats(null);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Unable to load dashboard statistics.'
      );
    } finally {
      setLoading(false);
    }
  }, [connected]);

  useEffect(() => {
    if (connectionLoading) return;

    if (connected) {
      fetchStats();
    } else {
      setStats(null);
      setLoading(false);
    }
  }, [connected, connectionLoading, fetchStats]);

  const cards = [
    {
      title: 'Total Leads',
      value: stats?.totalLeads ?? 0,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Total Accounts',
      value: stats?.totalAccounts ?? 0,
      icon: Building2,
      color: 'purple'
    },
    {
      title: 'Total Contacts',
      value: stats?.totalContacts ?? 0,
      icon: UserCircle,
      color: 'green'
    },
    {
      title: 'Open Opportunities',
      value: stats?.openOpportunities ?? 0,
      icon: TrendingUp,
      color: 'orange'
    },
    {
      title: 'Pipeline Value',
      value: stats?.pipelineValue ?? 0,
      icon: DollarSign,
      color: 'indigo',
      format: 'currency'
    }
  ];

  const quickActions = [
    {
      title: 'View Leads',
      description: 'Manage your Salesforce leads.',
      icon: Users,
      action: () => navigate('/leads')
    },
    {
      title: 'View Accounts',
      description: 'Explore your business accounts.',
      icon: Building2,
      action: () => navigate('/accounts')
    },
    {
      title: 'Opportunities',
      description: 'Track your active sales deals.',
      icon: TrendingUp,
      action: () => navigate('/opportunities')
    },
    {
      title: 'Analytics',
      description: 'Explore detailed CRM insights.',
      icon: BarChart3,
      action: () => navigate('/analytics')
    }
  ];

  return (
    <div className="space-y-7">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-brand-secondary">
            Welcome to LeadFlow
          </p>
          <h1 className="text-2xl font-bold text-brand-navy mt-1">
            Overview
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Your CRM workspace at a glance.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          disabled={!connected || loading || connectionLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-medium text-brand-text hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {!connectionLoading && !connected && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Salesforce is not connected. Connect your account to view live CRM data.
          <button
            type="button"
            onClick={() => navigate('/salesforce-integration')}
            className="ml-2 underline font-semibold"
          >
            Connect Salesforce
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-brand-navy">
              CRM Summary
            </h2>
            <p className="text-xs text-brand-secondary mt-1">
              Live totals from your Salesforce account.
            </p>
          </div>
          {connected && (
            <span className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
              Live CRM data
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              {loading || connectionLoading ? (
                <LoadingSkeleton />
              ) : (
                <StatCard
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                  format={card.format || 'number'}
                />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold text-brand-navy">
            Quick Access
          </h2>
          <p className="text-xs text-brand-secondary mt-1">
            Navigate directly to the CRM sections you use most.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickActions.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.button
                type="button"
                key={item.title}
                onClick={item.action}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="text-left bg-white border border-brand-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-4 group-hover:bg-brand-blue group-hover:text-white transition">
                  <Icon size={20} />
                </div>

                <h3 className="font-semibold text-brand-navy">
                  {item.title}
                </h3>

                <p className="text-xs text-brand-secondary mt-2">
                  {item.description}
                </p>

                <span className="text-xs text-brand-blue font-medium inline-block mt-4">
                  Open section →
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="bg-white border border-brand-border rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
            <BarChart3 size={20} />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-brand-navy">
              Want to explore your CRM performance?
            </h3>
            <p className="text-xs text-brand-secondary mt-1">
              Visit Analytics for lead distribution, sales stages and pipeline insights.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/analytics')}
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            View Analytics →
          </button>
        </div>
      </section>

    </div>
  );
}
