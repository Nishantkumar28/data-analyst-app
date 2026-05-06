'use client';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];

const tooltipStyle = {
  contentStyle: {
    background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', fontSize: '12px', color: '#f1f1f7',
  },
};

export default function ChartRenderer({ chart }) {
  if (!chart || !chart.data) return null;
  const { type, title, data, config = {} } = chart;

  const Wrapper = ({ children }) => (
    <div className="glass-card p-5">
      <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h4>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </div>
  );

  if (type === 'bar') {
    const chartData = data.labels?.map((l, i) => ({ name: l, value: data.values[i] })) || [];
    return (
      <Wrapper>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="value" fill={config.color || '#6366f1'} radius={[4, 4, 0, 0]} />
        </BarChart>
      </Wrapper>
    );
  }

  if (type === 'line') {
    const chartData = data.x?.map((x, i) => ({ name: String(x).slice(0, 10), value: data.y[i] })) || [];
    return (
      <Wrapper>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} />
          <Tooltip {...tooltipStyle} />
          <Line type="monotone" dataKey="value" stroke={config.color || '#6366f1'}
            strokeWidth={2} dot={false} />
        </LineChart>
      </Wrapper>
    );
  }

  if (type === 'area') {
    const chartData = data.x?.map((x, i) => ({ name: x, value: data.y[i] })) || [];
    return (
      <Wrapper>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} />
          <Tooltip {...tooltipStyle} />
          <Area type="monotone" dataKey="value" stroke={config.color || '#8b5cf6'}
            fill={config.color || '#8b5cf6'} fillOpacity={0.15} strokeWidth={2} />
        </AreaChart>
      </Wrapper>
    );
  }

  if (type === 'pie') {
    const chartData = data.labels?.map((l, i) => ({ name: l, value: data.values[i] })) || [];
    return (
      <Wrapper>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90}
            dataKey="value" paddingAngle={3} stroke="none">
            {chartData.map((_, i) => (
              <Cell key={i} fill={(config.colors || COLORS)[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
        </PieChart>
      </Wrapper>
    );
  }

  if (type === 'scatter') {
    const chartData = data.x?.map((x, i) => ({ x, y: data.y[i] })) || [];
    return (
      <Wrapper>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false}
            name={config.xLabel} />
          <YAxis dataKey="y" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false}
            name={config.yLabel} />
          <Tooltip {...tooltipStyle} />
          <Scatter data={chartData} fill={config.color || '#f59e0b'} opacity={0.7} />
        </ScatterChart>
      </Wrapper>
    );
  }

  if (type === 'histogram') {
    const vals = data.values || [];
    const bins = 20;
    const min = Math.min(...vals), max = Math.max(...vals);
    const step = (max - min) / bins || 1;
    const histogram = Array.from({ length: bins }, (_, i) => {
      const lo = min + i * step, hi = lo + step;
      return { range: `${lo.toFixed(1)}`, count: vals.filter(v => v >= lo && v < hi).length };
    });
    return (
      <Wrapper>
        <BarChart data={histogram}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="count" fill={config.color || '#6366f1'} radius={[2, 2, 0, 0]} />
        </BarChart>
      </Wrapper>
    );
  }

  if (type === 'heatmap') {
    const keys = Object.keys(data || {});
    if (keys.length === 0) return null;
    return (
      <div className="glass-card p-5">
        <h4 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h4>
        <div className="overflow-auto">
          <table className="text-xs w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th className="p-2" />
                {keys.map(k => <th key={k} className="p-2 font-medium" style={{ color: 'var(--text-muted)' }}>{k.slice(0, 8)}</th>)}
              </tr>
            </thead>
            <tbody>
              {keys.map(row => (
                <tr key={row}>
                  <td className="p-2 font-medium" style={{ color: 'var(--text-muted)' }}>{row.slice(0, 8)}</td>
                  {keys.map(col => {
                    const val = data[row]?.[col] ?? 0;
                    const abs = Math.abs(val);
                    const bg = val > 0
                      ? `rgba(99,102,241,${abs * 0.8})`
                      : val < 0 ? `rgba(239,68,68,${abs * 0.8})` : 'transparent';
                    return (
                      <td key={col} className="p-2 text-center" style={{ background: bg, color: '#f1f1f7', borderRadius: '4px' }}>
                        {val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h4>
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Chart type "{type}" — rendering not available</p>
    </div>
  );
}
