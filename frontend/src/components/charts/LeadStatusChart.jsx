import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  'Open - Not Contacted': '#94a3b8',
  'Working - Contacted': '#0176D3',
  'Closed - Converted': '#22c55e',
  'Closed - Not Converted': '#ef4444',
  'New': '#6366f1',
};

const DEFAULT_COLORS = ['#0176D3', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#94a3b8'];

export default function LeadStatusChart({ data = [] }) {
  if (!data.length) return <div className="flex items-center justify-center h-48 text-brand-secondary text-sm">No lead data</div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
          {data.map((entry, i) => (
            <Cell key={i} fill={STATUS_COLORS[entry.status] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5EAF0', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
