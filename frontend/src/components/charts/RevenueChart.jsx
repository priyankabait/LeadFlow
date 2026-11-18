import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data = [] }) {
  if (!data.length) return <div className="flex items-center justify-center h-48 text-brand-secondary text-sm">No revenue data</div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0176D3" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0176D3" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5EAF0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#526581' }} />
        <YAxis tick={{ fontSize: 11, fill: '#526581' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #E5EAF0', fontSize: 12 }}
          formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']}
        />
        <Area type="monotone" dataKey="value" stroke="#0176D3" strokeWidth={2} fill="url(#revenueGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
