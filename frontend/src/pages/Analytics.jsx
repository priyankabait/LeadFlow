
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

import {
  BarChart3,
  PieChart as PieIcon,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList
} from 'recharts';

import { dashboardService } from '../services/dashboardService';
import { useSalesforce } from '../hooks/useSalesforce';

const COLORS = [
  '#0176D3',
  '#7C3AED',
  '#0891B2',
  '#16A34A',
  '#F59E0B',
  '#64748B'
];

export default function Analytics() {
  const {
    connected,
    loading: connectionLoading
  } = useSalesforce();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
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
        throw new Error('Analytics data was not returned.');
      }

      setStats(data);
    } catch (err) {
      setStats(null);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Unable to load analytics.'
      );
    } finally {
      setLoading(false);
    }
  }, [connected]);

  useEffect(() => {
    if (connectionLoading) return;

    if (connected) {
      fetchAnalytics();
    } else {
      setStats(null);
      setLoading(false);
    }
  }, [connected, connectionLoading, fetchAnalytics]);

  const leadsData = Array.isArray(stats?.leadsByStatus)
    ? stats.leadsByStatus.map(item => ({
        name: item.Status || 'Unknown',
        value: Number(item.statusCount) || 0
      }))
    : [];

  const opportunitiesData = Array.isArray(stats?.opportunitiesByStage)
    ? stats.opportunitiesByStage.map(item => ({
        name: item.StageName || 'Unknown',
        amount: Number(item.stageAmount) || 0,
        count: Number(item.stageCount) || 0
      }))
    : [];

  if (connectionLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-64 text-brand-secondary gap-3">
        <RefreshCw className="animate-spin" size={20} />
        Loading analytics...
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="bg-white border border-brand-border rounded-2xl p-10 text-center">
        <BarChart3 size={42} className="mx-auto text-brand-blue mb-4" />
        <h2 className="text-lg font-semibold text-brand-navy">
          Connect Salesforce
        </h2>
        <p className="text-sm text-brand-secondary mt-2">
          Connect Salesforce to view your CRM analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-brand-secondary">Reports & Insights</p>
          <h1 className="text-2xl font-bold text-brand-navy mt-1">
            Analytics
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Explore your Salesforce sales and lead performance.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-sm font-medium text-brand-text hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {!error && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Leads by Status */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                  <PieIcon size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-brand-navy">
                    Leads by Status
                  </h2>
                  <p className="text-xs text-brand-secondary">
                    Distribution of your Salesforce leads
                  </p>
                </div>
              </div>

              {leadsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={leadsData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      outerRadius={105}
                      paddingAngle={3}
                      label={({ value }) => value}
                      labelLine
                    >
                      {leadsData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-brand-secondary text-center py-16">
                  No lead status data available.
                </p>
              )}
            </motion.section>

            {/* Opportunities by Stage */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-brand-navy">
                    Opportunities by Stage
                  </h2>
                  <p className="text-xs text-brand-secondary">
                    Pipeline value across sales stages
                  </p>
                </div>
              </div>

              {opportunitiesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={opportunitiesData}
                    margin={{ top: 25, right: 15, left: 5, bottom: 45 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      angle={-15}
                      textAnchor="end"
                      interval={0}
                    />

                    <YAxis
                      tickFormatter={value =>
                        `₹${Number(value).toLocaleString('en-IN')}`
                      }
                      tick={{ fontSize: 11 }}
                    />

                    <Bar
                      dataKey="amount"
                      fill="#0176D3"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={75}
                    >
                      <LabelList
                        dataKey="amount"
                        position="top"
                        formatter={value =>
                          `₹${Number(value).toLocaleString('en-IN')}`
                        }
                        style={{ fontSize: 11, fill: '#032D60' }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-brand-secondary text-center py-16">
                  No opportunity stage data available.
                </p>
              )}
            </motion.section>

          </div>

          {/* Opportunity breakdown */}
          <section className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <BarChart3 size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-brand-navy">
                  Opportunity Breakdown
                </h2>
                <p className="text-xs text-brand-secondary">
                  Deal count and value for each sales stage
                </p>
              </div>
            </div>

            {opportunitiesData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-brand-border text-brand-secondary">
                      <th className="py-3 font-medium">Sales Stage</th>
                      <th className="py-3 font-medium text-center">Deals</th>
                      <th className="py-3 font-medium text-right">Pipeline Value</th>
                    </tr>
                  </thead>

                  <tbody>
                    {opportunitiesData.map(item => (
                      <tr
                        key={item.name}
                        className="border-b border-brand-border last:border-0"
                      >
                        <td className="py-4 font-medium text-brand-navy">
                          {item.name}
                        </td>

                        <td className="py-4 text-center text-brand-text">
                          {item.count}
                        </td>

                        <td className="py-4 text-right font-semibold text-brand-navy">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-brand-secondary py-8 text-center">
                No opportunity breakdown available.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
