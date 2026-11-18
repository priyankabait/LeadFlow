
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Search, RefreshCw, DollarSign, CalendarDays, Building2, AlertCircle } from 'lucide-react';
import { useOpportunities } from '../hooks/useOpportunities';
import { useSalesforce } from '../hooks/useSalesforce';
import { TableRowSkeleton } from '../components/ui/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';

const fmt = amount => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0
}).format(Number(amount) || 0);

const STAGE_STYLES = {
  'Prospecting':          'badge badge-blue',
  'Qualification':        'badge badge-purple',
  'Needs Analysis':       'badge badge-purple',
  'Value Proposition':    'badge badge-amber',
  'Id. Decision Makers':  'badge badge-amber',
  'Perception Analysis':  'badge badge-amber',
  'Proposal/Price Quote': 'badge badge-amber',
  'Negotiation/Review':   'badge badge-amber',
  'Closed Won':           'badge badge-green',
  'Closed Lost':          'badge badge-red',
};

const getStageClass = s => STAGE_STYLES[s] || 'badge badge-gray';

export default function Opportunities() {
  const navigate = useNavigate();
  const { connected, loading: connLoading } = useSalesforce();
  const { opportunities, loading, error, fetchOpportunities } = useOpportunities();
  const [search, setSearch] = useState('');

  useEffect(() => { if (fetchOpportunities) fetchOpportunities(); }, [fetchOpportunities]);

  const filtered = (opportunities || []).filter(item => {
    const q = search.toLowerCase();
    return (
      (item.Name || '').toLowerCase().includes(q) ||
      (item.StageName || '').toLowerCase().includes(q) ||
      (item.Account?.Name || '').toLowerCase().includes(q)
    );
  });

  const openDeals    = (opportunities || []).filter(i => !['Closed Won', 'Closed Lost'].includes(i.StageName));
  const wonDeals     = (opportunities || []).filter(i => i.StageName === 'Closed Won');
  const pipelineVal  = openDeals.reduce((s, i) => s + (Number(i.Amount) || 0), 0);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1>Opportunities</h1>
          <p className="text-sm text-brand-secondary mt-1">Track deals, revenue and your sales pipeline.</p>
        </div>
        <button onClick={() => fetchOpportunities && fetchOpportunities()} disabled={loading} className="btn-secondary">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {!connLoading && !connected && (
        <div className="alert-warning flex items-center justify-between flex-wrap gap-3">
          <span>Connect Salesforce to load opportunity records.</span>
          <button onClick={() => navigate('/salesforce-integration')} className="text-sm font-semibold underline underline-offset-2">Connect →</button>
        </div>
      )}

      {/* ── Mini stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Open Pipeline',  value: fmt(pipelineVal),    color: 'bg-blue-50   text-brand-blue',  icon: DollarSign, raw: true },
          { label: 'Open Deals',     value: openDeals.length,    color: 'bg-purple-50 text-purple-600', icon: TrendingUp },
          { label: 'Won Deals',      value: wonDeals.length,     color: 'bg-green-50  text-green-600',  icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white border border-brand-border rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(3,45,96,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className={`icon-circle ${color}`}><Icon size={20} /></div>
              <div>
                <p className="text-xs text-brand-secondary font-medium">{label}</p>
                <p className="text-xl font-bold text-brand-navy mt-0.5">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Opportunities table ── */}
      <div className="section-card">
        <div className="section-card-header items-center">
          <div>
            <h2 className="font-semibold text-brand-navy">All Opportunities</h2>
            <p className="text-xs text-brand-secondary mt-0.5">Salesforce opportunity records</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search opportunities…" className="search-input" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="table-header border-b border-brand-border">
              <tr>
                {['Opportunity', 'Account', 'Amount', 'Stage', 'Probability', 'Close Date'].map(h => (
                  <th key={h} className="px-5 py-3.5 font-semibold text-[11px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              ) : error ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-red-600"><AlertCircle size={28} /><p className="text-sm">{error}</p></div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-14 text-center">
                  <TrendingUp size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-semibold text-brand-navy">No opportunities found</p>
                  <p className="text-sm text-brand-secondary mt-1">{search ? 'Try a different search term.' : 'Connect Salesforce or check your opportunity records.'}</p>
                </td></tr>
              ) : filtered.map((item, i) => (
                <motion.tr key={item.Id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }} className="table-row">
                  <td className="table-cell">
                    <p className="font-medium text-brand-navy">{item.Name || 'Unnamed Opportunity'}</p>
                    {item.Type && <p className="text-xs text-brand-secondary mt-0.5">{item.Type}</p>}
                  </td>
                  <td className="table-cell text-brand-secondary">
                    <span className="flex items-center gap-1.5"><Building2 size={13} />{item.Account?.Name || '—'}</span>
                  </td>
                  <td className="table-cell font-semibold text-brand-navy">
                    {item.Amount != null ? fmt(item.Amount) : '—'}
                  </td>
                  <td className="table-cell">
                    <span className={getStageClass(item.StageName)}>{item.StageName || 'Unknown'}</span>
                  </td>
                  <td className="table-cell text-brand-secondary">
                    {item.Probability != null ? `${item.Probability}%` : '—'}
                  </td>
                  <td className="table-cell text-brand-secondary">
                    <span className="flex items-center gap-1.5"><CalendarDays size={13} />{item.CloseDate || '—'}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-brand-border text-xs text-brand-secondary bg-gray-50/50">
          Showing <strong>{filtered.length}</strong> of <strong>{opportunities?.length || 0}</strong> opportunities
        </div>
      </div>
    </div>
  );
}
