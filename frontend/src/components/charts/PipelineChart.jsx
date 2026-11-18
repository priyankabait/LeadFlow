import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STAGE_COLORS = {
  Prospecting: '#94a3b8',
  Qualification: '#0176D3',
  Proposal: '#f59e0b',
  Negotiation: '#f97316',
  'Closed Won': '#22c55e',
  'Closed Lost': '#ef4444',
};

export default function PipelineChart({ data = [] }) {
  if (!data.length) return <div className="flex items-center justify-center h-48 text-brand-secondary text-sm">No pipeline data</div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF0" />
        <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#526581' }} />
        <YAxis tick={{ fontSize: 11, fill: '#526581' }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #E5EAF0', fontSize: 12 }}
          formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Value']}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={STAGE_COLORS[entry.stage] || '#0176D3'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
