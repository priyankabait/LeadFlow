
import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Building2, UserCircle, TrendingUp, DollarSign,
  RefreshCw, BarChart3, AlertCircle, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/ui/StatCard';
import { StatCardSkeleton } from '../components/ui/LoadingSkeleton';
import { useSalesforce } from '../hooks/useSalesforce';

const QUICK_ACTIONS = [
  { title: 'Leads',         description: 'View and manage Salesforce leads.',       icon: Users,      to: '/leads',          color: 'blue' },
  { title: 'Accounts',      description: 'Explore your business accounts.',          icon: Building2,  to: '/accounts',       color: 'purple' },
  { title: 'Opportunities', description: 'Track your active sales pipeline.',        icon: TrendingUp, to: '/opportunities',   color: 'green' },
  { title: 'Analytics',     description: 'Deep-dive into CRM performance data.',     icon: BarChart3,  to: '/analytics',      color: 'orange' },
];

const ACTION_COLOR = {
  blue:   { bg: 'bg-blue-50',   text: 'text-brand-blue',   hover: 'group-hover:bg-brand-blue group-hover:text-white' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600',   hover: 'group-hover:bg-purple-600 group-hover:text-white' },
  green:  { bg: 'bg-green-50',  text: 'text-green-600',    hover: 'group-hover:bg-green-600  group-hover:text-white' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600',   hover: 'group-hover:bg-orange-600 group-hover:text-white' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { connected, loading: connectionLoading } = useSalesforce();

  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const fetchStats = useCallback(async () => {
    if (!connected) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const response = await dashboardService.getStats();
      const data = response.data?.data;
      if (!data) throw new Error('Dashboard data was not returned.');
      setStats(data);
    } catch (err) {
      setStats(null);
      setError(err.response?.data?.error || err.message || 'Unable to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  }, [connected]);

  useEffect(() => {
    if (connectionLoading) return;
    if (connected) { fetchStats(); } else { setStats(null); setLoading(false); }
  }, [connected, connectionLoading, fetchStats]);

  const STAT_CARDS = [
    { title: 'Total Leads',         value: stats?.totalLeads         ?? 0, icon: Users,      color: 'blue'   },
    { title: 'Total Accounts',      value: stats?.totalAccounts      ?? 0, icon: Building2,  color: 'purple' },
    { title: 'Total Contacts',      value: stats?.totalContacts      ?? 0, icon: UserCircle, color: 'green'  },
    { title: 'Open Opportunities',  value: stats?.openOpportunities  ?? 0, icon: TrendingUp, color: 'orange' },
    { title: 'Pipeline Value',      value: stats?.pipelineValue      ?? 0, icon: DollarSign, color: 'indigo', format: 'currency' },
  ];

  const isBusy = loading || connectionLoading;

  return (
    <div className="space-y-8">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-secondary">
            LeadFlow CRM
          </p>
          <h1 className="text-2xl font-bold text-brand-navy mt-1 leading-tight">
            Overview
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Your Salesforce CRM workspace at a glance.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          disabled={!connected || isBusy}
          className="btn-secondary"
        >
          <RefreshCw size={15} className={isBusy ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Banners ──────────────────────────────────────────── */}
      {!connectionLoading && !connected && (
        <div className="alert-warning flex items-center justify-between flex-wrap gap-3">
          <span>Salesforce is not connected. Connect your account to view live CRM data.</span>
          <button
            type="button"
            onClick={() => navigate('/salesforce-integration')}
            className="text-sm font-semibold underline underline-offset-2"
          >
            Connect Salesforce →
          </button>
        </div>
      )}

      {error && (
        <div className="alert-error">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* ── CRM Summary cards ────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-brand-navy">CRM Summary</h2>
            <p className="text-xs text-brand-secondary mt-0.5">Live totals from your Salesforce account.</p>
          </div>
          {connected && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live data
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {STAT_CARDS.map((card, i) =>
            isBusy ? (
              <motion.div key={card.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <StatCardSkeleton />
              </motion.div>
            ) : (
              <motion.div key={card.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <StatCard title={card.title} value={card.value} icon={card.icon} color={card.color} format={card.format} />
              </motion.div>
            )
          )}
        </div>
      </section>

      {/* ── Quick Access ─────────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="font-semibold text-brand-navy">Quick Access</h2>
          <p className="text-xs text-brand-secondary mt-0.5">Jump directly to the CRM sections you use most.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((item, i) => {
            const Icon = item.icon;
            const c = ACTION_COLOR[item.color];
            return (
              <motion.button
                type="button"
                key={item.title}
                onClick={() => navigate(item.to)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                className="text-left bg-white border border-brand-border rounded-2xl p-5 group transition-all duration-200 hover:border-blue-200"
                style={{ boxShadow: '0 1px 3px rgba(3,45,96,0.06)' }}
              >
                <div className={`icon-circle ${c.bg} ${c.text} mb-4 transition-all duration-200 ${c.hover}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-brand-navy">{item.title}</h3>
                <p className="text-xs text-brand-secondary mt-1.5 leading-relaxed">{item.description}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue mt-4 group-hover:gap-2 transition-all duration-150">
                  Open section <ArrowRight size={12} />
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ── Analytics CTA ────────────────────────────────────── */}
      <section
        className="rounded-2xl border border-brand-border bg-white p-5 flex items-center gap-4"
        style={{ boxShadow: '0 1px 3px rgba(3,45,96,0.06)' }}
      >
        <div className="icon-circle bg-brand-blue text-white shrink-0"
          style={{ background: 'linear-gradient(135deg,#032D60,#0176D3)' }}
        >
          <BarChart3 size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-brand-navy text-sm">Explore CRM Performance</h3>
          <p className="text-xs text-brand-secondary mt-0.5">
            Visit Analytics for lead distribution, sales stages and pipeline insights.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/analytics')}
          className="btn-primary shrink-0 text-xs"
        >
          View Analytics <ArrowRight size={13} />
        </button>
      </section>

    </div>
  );
}
