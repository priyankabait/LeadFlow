
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Search,
  RefreshCw,
  DollarSign,
  CalendarDays,
  Building2
} from 'lucide-react';
import { useOpportunities } from '../hooks/useOpportunities';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);

const getStageStyle = (stage) => {
  const styles = {
    'Prospecting': 'bg-blue-50 text-blue-700',
    'Qualification': 'bg-indigo-50 text-indigo-700',
    'Needs Analysis': 'bg-purple-50 text-purple-700',
    'Value Proposition': 'bg-amber-50 text-amber-700',
    'Negotiation/Review': 'bg-orange-50 text-orange-700',
    'Closed Won': 'bg-green-50 text-green-700',
    'Closed Lost': 'bg-red-50 text-red-700'
  };

  return styles[stage] || 'bg-gray-100 text-gray-600';
};

export default function Opportunities() {
  const { opportunities, loading, error, fetchOpportunities } =
    useOpportunities();

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (fetchOpportunities) fetchOpportunities();
  }, [fetchOpportunities]);

  const filteredOpportunities = (opportunities || []).filter((item) => {
    const searchText = search.toLowerCase();

    return (
      (item.Name || '').toLowerCase().includes(searchText) ||
      (item.StageName || '').toLowerCase().includes(searchText) ||
      (item.Account?.Name || '').toLowerCase().includes(searchText)
    );
  });

  const totalPipeline = (opportunities || [])
    .filter(item => !['Closed Won', 'Closed Lost'].includes(item.StageName))
    .reduce((total, item) => total + (Number(item.Amount) || 0), 0);

  const wonDeals = (opportunities || []).filter(
    item => item.StageName === 'Closed Won'
  ).length;

  const openDeals = (opportunities || []).filter(
    item => !['Closed Won', 'Closed Lost'].includes(item.StageName)
  ).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">
            Opportunities
          </h1>
          <p className="text-sm text-brand-secondary mt-1">
            Track deals, revenue and your sales pipeline.
          </p>
        </div>

        <button
          onClick={() => fetchOpportunities && fetchOpportunities()}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-brand-blue rounded-xl">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-sm text-brand-secondary">Open Pipeline</p>
              <h2 className="text-xl font-bold text-brand-navy">
                {formatCurrency(totalPipeline)}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-sm text-brand-secondary">Open Deals</p>
              <h2 className="text-2xl font-bold text-brand-navy">
                {openDeals}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-sm text-brand-secondary">Won Deals</p>
              <h2 className="text-2xl font-bold text-brand-navy">
                {wonDeals}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="bg-white border border-brand-border rounded-2xl shadow-sm overflow-hidden">

        <div className="p-5 border-b border-brand-border flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="font-semibold text-brand-navy">
              All Opportunities
            </h2>
            <p className="text-xs text-brand-secondary mt-1">
              Salesforce opportunity records
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search opportunities..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-brand-blue"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-brand-secondary">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
            Loading Salesforce opportunities...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-600">{error}</div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp size={35} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-semibold text-brand-navy">
              No opportunities found
            </h3>
            <p className="text-sm text-brand-secondary mt-1">
              {search
                ? 'Try a different search term.'
                : 'Connect Salesforce or check your Salesforce opportunity records.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-brand-secondary">
                <tr>
                  <th className="px-5 py-4 font-semibold">Opportunity</th>
                  <th className="px-5 py-4 font-semibold">Account</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Stage</th>
                  <th className="px-5 py-4 font-semibold">Probability</th>
                  <th className="px-5 py-4 font-semibold">Close Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-brand-border">
                {filteredOpportunities.map((item, index) => (
                  <motion.tr
                    key={item.Id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-brand-navy">
                        {item.Name || 'Unnamed Opportunity'}
                      </div>
                      <div className="text-xs text-brand-secondary mt-1">
                        {item.Type || 'No type specified'}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <Building2 size={14} />
                        {item.Account?.Name || '—'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-brand-navy">
                      {item.Amount != null
                        ? formatCurrency(item.Amount)
                        : '—'}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStageStyle(item.StageName)}`}>
                        {item.StageName || 'Unknown'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {item.Probability != null
                        ? `${item.Probability}%`
                        : '—'}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <CalendarDays size={14} />
                        {item.CloseDate || '—'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-4 border-t border-brand-border text-xs text-brand-secondary">
          Showing {filteredOpportunities.length} of {opportunities?.length || 0} opportunities
        </div>
      </div>
    </div>
  );
}
