
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Search, RefreshCw, Mail, Phone, Building2, AlertCircle } from 'lucide-react';
import { useContacts } from '../hooks/useContacts';
import { useSalesforce } from '../hooks/useSalesforce';
import { TableRowSkeleton } from '../components/ui/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';

export default function Contacts() {
  const navigate = useNavigate();
  const { connected, loading: connLoading } = useSalesforce();
  const { contacts, loading, error, fetchContacts } = useContacts();
  const [search, setSearch] = useState('');

  useEffect(() => { if (fetchContacts) fetchContacts(); }, [fetchContacts]);

  const filtered = (contacts || []).filter(c => {
    const q = search.toLowerCase();
    return (
      `${c.FirstName || ''} ${c.LastName || ''}`.toLowerCase().includes(q) ||
      (c.Email || '').toLowerCase().includes(q) ||
      (c.Account?.Name || '').toLowerCase().includes(q) ||
      (c.Title || '').toLowerCase().includes(q)
    );
  });

  const linkedAccounts = new Set((contacts || []).map(c => c.AccountId).filter(Boolean)).size;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1>Contacts</h1>
          <p className="text-sm text-brand-secondary mt-1">Manage your customer and business contacts.</p>
        </div>
        <button onClick={() => fetchContacts && fetchContacts()} disabled={loading} className="btn-secondary">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {!connLoading && !connected && (
        <div className="alert-warning flex items-center justify-between flex-wrap gap-3">
          <span>Connect Salesforce to load contact records.</span>
          <button onClick={() => navigate('/salesforce-integration')} className="text-sm font-semibold underline underline-offset-2">Connect →</button>
        </div>
      )}

      {/* ── Mini stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'Total Contacts', value: contacts?.length || 0, color: 'bg-blue-50 text-brand-blue',   icon: UserCircle },
          { label: 'Linked Accounts', value: linkedAccounts,        color: 'bg-purple-50 text-purple-600', icon: Building2 },
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

      {/* ── Contacts table ── */}
      <div className="section-card">
        <div className="section-card-header items-center">
          <div>
            <h2 className="font-semibold text-brand-navy">All Contacts</h2>
            <p className="text-xs text-brand-secondary mt-0.5">Salesforce contact records</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…" className="search-input" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead className="table-header border-b border-brand-border">
              <tr>
                {['Contact Name', 'Account', 'Title', 'Email', 'Phone'].map(h => (
                  <th key={h} className="px-5 py-3.5 font-semibold text-[11px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
              ) : error ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-red-600"><AlertCircle size={28} /><p className="text-sm">{error}</p></div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-14 text-center">
                  <UserCircle size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-semibold text-brand-navy">No contacts found</p>
                  <p className="text-sm text-brand-secondary mt-1">{search ? 'Try a different search term.' : 'Connect Salesforce or check your contact records.'}</p>
                </td></tr>
              ) : filtered.map((c, i) => (
                <motion.tr key={c.Id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }} className="table-row">
                  <td className="table-cell font-medium text-brand-navy">
                    {`${c.FirstName || ''} ${c.LastName || ''}`.trim() || 'Unnamed'}
                  </td>
                  <td className="table-cell text-brand-secondary">{c.Account?.Name || '—'}</td>
                  <td className="table-cell text-brand-secondary">{c.Title || '—'}</td>
                  <td className="table-cell text-brand-secondary">
                    {c.Email ? <span className="flex items-center gap-1.5"><Mail size={13} />{c.Email}</span> : '—'}
                  </td>
                  <td className="table-cell text-brand-secondary">
                    {c.Phone ? <span className="flex items-center gap-1.5"><Phone size={13} />{c.Phone}</span> : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-brand-border text-xs text-brand-secondary bg-gray-50/50">
          Showing <strong>{filtered.length}</strong> of <strong>{contacts?.length || 0}</strong> contacts
        </div>
      </div>
    </div>
  );
}
