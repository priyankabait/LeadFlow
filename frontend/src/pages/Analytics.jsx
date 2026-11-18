
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart as PieIcon, RefreshCw, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Legend, Tooltip
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { useSalesforce } from '../hooks/useSalesforce';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#0176D3', '#7C3AED', '#0891B2', '#16A34A', '#F59E0B', '#64748B', '#DC2626', '#D97706'];

const fmtUSD = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(Number(v) || 0);
const fmtFull = v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v) || 0);

function ChartCard({ title, subtitle, icon: Icon, iconBg, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-brand-border rounded-2xl p-6"
      style={{ boxShadow: '0 1px 3px rgba(3,45,96,0.06), 0 4px 12px rgba(3,45,96,0.04)' }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className={`icon-circle ${iconBg}`}><Icon size={19} /></div>
        <div>
          <h2 className="font-semibold text-brand-navy">{title}</h2>
          <p className="text-xs text-brand-secondary mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const { connected, loading: connectionLoading } = useSalesforce();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const fetchAnalytics = useCallback(async () => {
    if (!connected) { setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const response = await dashboardService.getStats();
      const data = response.data?.data;
      if (!data) throw new Error('Analytics data was not returned.');
      setStats(data);
    } catch (err) {
      setStats(null);
      setError(err.response?.data?.error || err.message || 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  }, [connected]);

  useEffect(() => {
    if (connectionLoading) return;
    if (connected) { fetchAnalytics(); } else { setStats(null); setLoading(false); }
  }, [connected, connectionLoading, fetchAnalytics]);

  const leadsData = Array.isArray(stats?.leadsByStatus)
    ? stats.leadsByStatus.map(item => ({ name: item.Status || 'Unknown', value: Number(item.statusCount) || 0 }))
    : [];

  const oppData = Array.isArray(stats?.opportunitiesByStage)
    ? stats.opportunitiesByStage.map(item => ({
        name: item.StageName || 'Unknown',
        amount: Number(item.stageAmount) || 0,
        count: Number(item.stageCount) || 0
      }))
    : [];

  if (connectionLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3 text-brand-secondary">
        <RefreshCw className="animate-spin" size={24} />
        <p className="text-sm">Loading analytics…</p>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="bg-white border border-brand-border rounded-2xl p-12 text-center"
        style={{ boxShadow: '0 1px 3px rgba(3,45,96,0.06)' }}
      >
        <BarChart3 size={44} className="mx-auto text-brand-blue mb-4" />
        <h2 className="text-lg font-semibold text-brand-navy">Connect Salesforce</h2>
        <p className="text-sm text-brand-secondary mt-2 max-w-xs mx-auto">
          Connect your Salesforce account to view live CRM analytics and pipeline insights.
        </p>
        <button onClick={() => navigate('/salesforce-integration')} className="btn-primary mt-5 mx-auto">
          Connect Salesforce
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-secondary">Reports &amp; Insights</p>
          <h1 className="mt-1">Analytics</h1>
          <p className="text-sm text-brand-secondary mt-1">Explore your Salesforce sales and lead performance.</p>
        </div>
        <button type="button" onClick={fetchAnalytics} disabled={loading} className="btn-secondary">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {!error && (
        <>
          {/* ── Charts row ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Leads by Status — Pie */}
            <ChartCard title="Leads by Status" subtitle="Distribution of your Salesforce leads" icon={PieIcon} iconBg="bg-blue-50 text-brand-blue">
              {leadsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadsData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={105}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {leadsData.map((entry, i) => (
                        <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5EAF0', fontSize: 13 }}
                      formatter={(v, n) => [v, n]}
                    />
                    <Legend verticalAlign="bottom" iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-brand-secondary text-center py-16">No lead status data available.</p>
              )}
            </ChartCard>

            {/* Opportunities by Stage — Bar */}
            <ChartCard title="Opportunities by Stage" subtitle="Pipeline value across sales stages" icon={TrendingUp} iconBg="bg-purple-50 text-purple-600">
              {oppData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={oppData} margin={{ top: 10, right: 10, left: 10, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAF0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#526581' }}
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      tickFormatter={v => fmtUSD(v)}
                      tick={{ fontSize: 11, fill: '#526581' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5EAF0', fontSize: 13 }}
                      formatter={v => [fmtFull(v), 'Pipeline Value']}
                    />
                    <Bar dataKey="amount" fill="#0176D3" radius={[6, 6, 0, 0]} maxBarSize={70}>
                      {oppData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-brand-secondary text-center py-16">No opportunity stage data available.</p>
              )}
            </ChartCard>
          </div>

          {/* ── Opportunity breakdown table ── */}
          <ChartCard title="Opportunity Breakdown" subtitle="Deal count and pipeline value per sales stage" icon={DollarSign} iconBg="bg-green-50 text-green-600">
            {oppData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-brand-border text-xs font-semibold uppercase tracking-wide text-brand-secondary">
                      <th className="pb-3">Sales Stage</th>
                      <th className="pb-3 text-center">Deals</th>
                      <th className="pb-3 text-right">Pipeline Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {oppData.map((item, i) => (
                      <tr key={item.name} className="border-b border-brand-border last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 font-medium text-brand-navy flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          {item.name}
                        </td>
                        <td className="py-3.5 text-center text-brand-text">{item.count}</td>
                        <td className="py-3.5 text-right font-semibold text-brand-navy">{fmtFull(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-brand-border">
                      <td className="pt-3.5 font-semibold text-brand-navy">Total</td>
                      <td className="pt-3.5 text-center font-semibold">{oppData.reduce((s, i) => s + i.count, 0)}</td>
                      <td className="pt-3.5 text-right font-bold text-brand-navy">{fmtFull(oppData.reduce((s, i) => s + i.amount, 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-sm text-brand-secondary py-8 text-center">No opportunity breakdown available.</p>
            )}
          </ChartCard>
        </>
      )}
    </div>
  );
}
