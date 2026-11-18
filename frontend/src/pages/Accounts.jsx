
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Search,
  RefreshCw,
  Globe,
  Phone,
  Users
} from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';

export default function Accounts() {
  const { accounts, loading, error, fetchAccounts } = useAccounts();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (fetchAccounts) fetchAccounts();
  }, [fetchAccounts]);

  const filteredAccounts = (accounts || []).filter((account) =>
    [
      account.Name,
      account.Industry,
      account.Type,
      account.BillingCity
    ].some(value =>
      (value || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Accounts</h1>
          <p className="text-sm text-brand-secondary mt-1">
            Manage your Salesforce business accounts.
          </p>
        </div>

        <button
          onClick={() => fetchAccounts && fetchAccounts()}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-brand-blue rounded-xl">
              <Building2 size={22} />
            </div>
            <div>
              <p className="text-sm text-brand-secondary">Total Accounts</p>
              <h2 className="text-2xl font-bold text-brand-navy">
                {accounts?.length || 0}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Users size={22} />
            </div>
            <div>
              <p className="text-sm text-brand-secondary">Industries</p>
              <h2 className="text-2xl font-bold text-brand-navy">
                {new Set(accounts?.map(a => a.Industry).filter(Boolean)).size}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white border border-brand-border rounded-2xl shadow-sm overflow-hidden">

        <div className="p-5 border-b border-brand-border flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="font-semibold text-brand-navy">All Accounts</h2>
            <p className="text-xs text-brand-secondary mt-1">
              Salesforce account records
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
              placeholder="Search accounts..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-border rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-brand-blue"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-brand-secondary">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
            Loading Salesforce accounts...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-600">{error}</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 size={35} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-semibold text-brand-navy">No accounts found</h3>
            <p className="text-sm text-brand-secondary mt-1">
              {search
                ? 'Try a different search term.'
                : 'Connect Salesforce or check your Salesforce account records.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-brand-secondary">
                <tr>
                  <th className="px-5 py-4 font-semibold">Account Name</th>
                  <th className="px-5 py-4 font-semibold">Industry</th>
                  <th className="px-5 py-4 font-semibold">Type</th>
                  <th className="px-5 py-4 font-semibold">Phone</th>
                  <th className="px-5 py-4 font-semibold">Website</th>
                  <th className="px-5 py-4 font-semibold">Location</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-brand-border">
                {filteredAccounts.map((account, index) => (
                  <motion.tr
                    key={account.Id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-brand-navy">
                        {account.Name || 'Unnamed Account'}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {account.Industry || '—'}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {account.Type || '—'}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {account.Phone ? (
                        <span className="flex items-center gap-2">
                          <Phone size={14} />
                          {account.Phone}
                        </span>
                      ) : '—'}
                    </td>

                    <td className="px-5 py-4 text-sm text-brand-blue">
                      {account.Website ? (
                        <a
                          href={account.Website.startsWith('http') ? account.Website : `https://${account.Website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 hover:underline"
                        >
                          <Globe size={14} />
                          Visit
                        </a>
                      ) : '—'}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {account.BillingCity || '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-4 border-t border-brand-border text-xs text-brand-secondary">
          Showing {filteredAccounts.length} of {accounts?.length || 0} accounts
        </div>
      </div>
    </div>
  );
}
