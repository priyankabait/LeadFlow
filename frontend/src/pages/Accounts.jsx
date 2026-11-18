
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, RefreshCw, Globe, Phone, Users, AlertCircle } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { useSalesforce } from '../hooks/useSalesforce';
import { TableRowSkeleton } from '../components/ui/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';

export default function Accounts() {
  const navigate = useNavigate();
  const { connected, loading: connLoading } = useSalesforce();
  const { accounts, loading, error, fetchAccounts } = useAccounts();
  const [search, setSearch] = useState('');

  useEffect(() => { if (fetchAccounts) fetchAccounts(); }, [fetchAccounts]);

  const filtered = (accounts || []).filter(a =>
    [a.Name, a.Industry, a.Type, a.BillingCity].some(v =>
      (v || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const industries = new Set((accounts || []).map(a => a.Industry).filter(Boolean)).size;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1>Accounts</h1>
          <p className="text-sm text-brand-secondary mt-1">Manage your Salesforce business accounts.</p>
        </div>
        <button onClick={() => fetchAccounts && fetchAccounts()} disabled={loading} className="btn-secondary">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {!connLoading && !connected && (
        <div className="alert-warning flex items-center justify-between flex-wrap gap-3">
          <span>Connect Salesforce to load account records.</span>
          <button onClick={() => navigate('/salesforce-integration')} className="text-sm font-semibold underline underline-offset-2">Connect →</button>
        </div>
      )}

      {/* ── Mini stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Total Accounts', value: accounts?.length || 0, color: 'bg-blue-50 text-brand-blue',   icon: Building2 },
          { label: 'Industries',     value: industries,            color: 'bg-purple-50 text-purple-600', icon: Users },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white border border-brand-border rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(3,45,96,0.06)' }}>
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

      {/* ── Accounts table ── */}
      <div className="section-card">
        <div className="section-card-header items-center">
          <div>
            <h2 className="font-semibold text-brand-navy">All Accounts</h2>
            <p className="text-xs text-brand-secondary mt-0.5">Salesforce account records</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search accounts…" className="search-input" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="table-header border-b border-brand-border">
              <tr>
                {['Account Name', 'Industry', 'Type', 'Phone', 'Website', 'Location'].map(h => (
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
                  <Building2 size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-semibold text-brand-navy">No accounts found</p>
                  <p className="text-sm text-brand-secondary mt-1">{search ? 'Try a different search term.' : 'Connect Salesforce or check your account records.'}</p>
                </td></tr>
              ) : filtered.map((a, i) => (
                <motion.tr key={a.Id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }} className="table-row">
                  <td className="table-cell font-medium text-brand-navy">{a.Name || 'Unnamed Account'}</td>
                  <td className="table-cell text-brand-secondary">{a.Industry || '—'}</td>
                  <td className="table-cell text-brand-secondary">{a.Type || '—'}</td>
                  <td className="table-cell text-brand-secondary">
                    {a.Phone ? <span className="flex items-center gap-1.5"><Phone size={13} />{a.Phone}</span> : '—'}
                  </td>
                  <td className="table-cell">
                    {a.Website ? (
                      <a href={a.Website.startsWith('http') ? a.Website : `https://${a.Website}`}
                        target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-brand-blue hover:underline text-sm"
                      >
                        <Globe size={13} />Visit
                      </a>
                    ) : '—'}
                  </td>
                  <td className="table-cell text-brand-secondary">{a.BillingCity || '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-brand-border text-xs text-brand-secondary bg-gray-50/50">
          Showing <strong>{filtered.length}</strong> of <strong>{accounts?.length || 0}</strong> accounts
        </div>
      </div>
    </div>
  );
}
