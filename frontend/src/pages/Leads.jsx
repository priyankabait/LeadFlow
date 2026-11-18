
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, RefreshCw, Mail, Phone, Building2, AlertCircle } from 'lucide-react';
import { useLeads } from '../hooks/useLeads';
import { useSalesforce } from '../hooks/useSalesforce';
import { TableRowSkeleton } from '../components/ui/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLES = {
  'New':                 'badge badge-blue',
  'Working - Contacted': 'badge badge-amber',
  'Qualified':           'badge badge-green',
  'Unqualified':         'badge badge-red',
  'Nurturing':           'badge badge-purple',
};

const getStatusClass = s => STATUS_STYLES[s] || 'badge badge-gray';

const MINI_STATS = leads => [
  { label: 'Total Leads',    value: leads.length,                                           color: 'bg-blue-50   text-brand-blue',  icon: Users },
  { label: 'Qualified',      value: leads.filter(l => l.Status === 'Qualified').length,     color: 'bg-green-50  text-green-600',   icon: Users },
  { label: 'Companies',      value: new Set(leads.map(l => l.Company).filter(Boolean)).size, color: 'bg-purple-50 text-purple-600', icon: Building2 },
];

export default function Leads() {
  const navigate = useNavigate();
  const { connected, loading: connLoading } = useSalesforce();
  const { leads, loading, error, fetchLeads } = useLeads();
  const [search, setSearch] = useState('');

  useEffect(() => { if (fetchLeads) fetchLeads(); }, [fetchLeads]);

  const filtered = (leads || []).filter(lead => {
    const q = search.toLowerCase();
    return (
      `${lead.FirstName || ''} ${lead.LastName || ''}`.toLowerCase().includes(q) ||
      (lead.Company || '').toLowerCase().includes(q) ||
      (lead.Email   || '').toLowerCase().includes(q)
    );
  });

  const miniStats = MINI_STATS(leads || []);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1>Leads</h1>
          <p className="text-sm text-brand-secondary mt-1">Manage and track your Salesforce leads.</p>
        </div>
        <button onClick={() => fetchLeads && fetchLeads()} disabled={loading} className="btn-secondary">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Not connected banner ── */}
      {!connLoading && !connected && (
        <div className="alert-warning flex items-center justify-between flex-wrap gap-3">
          <span>Connect Salesforce to load lead records.</span>
          <button onClick={() => navigate('/salesforce-integration')} className="text-sm font-semibold underline underline-offset-2">
            Connect →
          </button>
        </div>
      )}

      {/* ── Mini stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {miniStats.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white border border-brand-border rounded-2xl p-5"
            style={{ boxShadow: '0 1px 3px rgba(3,45,96,0.06)' }}
          >
            <div className="flex items-center gap-3">
              <div className={`icon-circle ${color}`}><Icon size={20} /></div>
              <div>
                <p className="text-xs text-brand-secondary font-medium">{label}</p>
                <p className="text-2xl font-bold text-brand-navy mt-0.5">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Leads table ── */}
      <div className="section-card">
        {/* Table toolbar */}
        <div className="section-card-header items-center">
          <div>
            <h2 className="font-semibold text-brand-navy">All Leads</h2>
            <p className="text-xs text-brand-secondary mt-0.5">Salesforce lead records</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search leads…"
              className="search-input"
            />
          </div>
        </div>

        {/* Table body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead className="table-header border-b border-brand-border">
              <tr>
                {['Lead Name', 'Company', 'Email', 'Phone', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3.5 font-semibold text-[11px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
              ) : error ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-red-600">
                    <AlertCircle size={28} />
                    <p className="text-sm">{error}</p>
                  </div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-14 text-center">
                  <Users size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-semibold text-brand-navy">No leads found</p>
                  <p className="text-sm text-brand-secondary mt-1">
                    {search ? 'Try a different search term.' : 'Connect Salesforce or check whether your org has lead records.'}
                  </p>
                </td></tr>
              ) : filtered.map((lead, i) => (
                <motion.tr key={lead.Id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025 }}
                  className="table-row"
                >
                  <td className="table-cell">
                    <p className="font-medium text-brand-navy">
                      {`${lead.FirstName || ''} ${lead.LastName || ''}`.trim() || 'Unnamed'}
                    </p>
                    {lead.Title && <p className="text-xs text-brand-secondary mt-0.5">{lead.Title}</p>}
                  </td>
                  <td className="table-cell text-brand-secondary">{lead.Company || '—'}</td>
                  <td className="table-cell text-brand-secondary">
                    {lead.Email
                      ? <span className="flex items-center gap-1.5"><Mail size={13} />{lead.Email}</span>
                      : '—'}
                  </td>
                  <td className="table-cell text-brand-secondary">
                    {lead.Phone
                      ? <span className="flex items-center gap-1.5"><Phone size={13} />{lead.Phone}</span>
                      : '—'}
                  </td>
                  <td className="table-cell">
                    <span className={getStatusClass(lead.Status)}>{lead.Status || 'Unknown'}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-brand-border text-xs text-brand-secondary bg-gray-50/50">
          Showing <strong>{filtered.length}</strong> of <strong>{leads?.length || 0}</strong> leads
        </div>
      </div>
    </div>
  );
}
