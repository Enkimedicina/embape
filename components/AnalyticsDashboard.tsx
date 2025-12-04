import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, ReferenceLine 
} from 'recharts';
import { TradeHistoryItem } from '../types';
import { CHART_COLORS } from '../constants';

interface AnalyticsDashboardProps {
  history: TradeHistoryItem[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ history }) => {
  // --- Data Preparation ---
  
  // Equity Curve Data
  const equityData = useMemo(() => {
    let accumulated = 0;
    // Sort by timestamp just in case
    const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
    return sorted.map(item => {
      accumulated += item.profitMXN;
      return {
        name: item.date.split(' ')[0], // Short date
        equity: accumulated,
        trade: item.profitMXN
      };
    });
  }, [history]);

  // Monthly Data
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    history.forEach(item => {
      // Assuming date format YYYY-MM-DD HH:mm or similar, let's parse safely
      const date = new Date(item.timestamp);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      months[key] = (months[key] || 0) + item.profitMXN;
    });
    return Object.entries(months)
      .map(([key, value]) => ({ month: key, profit: value }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [history]);

  // KPI calculations
  const totalProfit = history.reduce((acc, curr) => acc + curr.profitMXN, 0);
  const totalVolume = history.reduce((acc, curr) => acc + curr.amountSold, 0);
  const avgRoi = history.length > 0 ? history.reduce((acc, curr) => acc + curr.roi, 0) / history.length : 0;

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-5 rounded-xl">
          <h4 className="text-slate-400 text-xs font-medium uppercase mb-1">Ganancia Total</h4>
          <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${totalProfit.toLocaleString('es-MX')}
          </p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-5 rounded-xl">
          <h4 className="text-slate-400 text-xs font-medium uppercase mb-1">Volumen Vendido</h4>
          <p className="text-2xl font-bold text-slate-100">
            {totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })} <span className="text-sm font-normal text-slate-500">USDT</span>
          </p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-5 rounded-xl">
          <h4 className="text-slate-400 text-xs font-medium uppercase mb-1">ROI Promedio</h4>
          <p className="text-2xl font-bold text-indigo-400">
            {avgRoi.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Equity Curve Chart */}
      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-5 rounded-xl h-[300px]">
        <h3 className="text-slate-200 font-semibold mb-4">Crecimiento de Capital (Equity)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={equityData}>
            <defs>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.equity} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={CHART_COLORS.equity} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} 
              itemStyle={{ color: '#818cf8' }}
            />
            <Area 
              type="monotone" 
              dataKey="equity" 
              stroke={CHART_COLORS.equity} 
              fillOpacity={1} 
              fill="url(#colorEquity)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trade by Trade Profit */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-5 rounded-xl h-[250px]">
          <h3 className="text-slate-200 font-semibold mb-4">PnL por Operación</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={equityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <ReferenceLine y={0} stroke="#475569" />
              <Tooltip 
                cursor={{fill: '#1e293b'}}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} 
              />
              <Bar dataKey="trade">
                {equityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.trade > 0 ? CHART_COLORS.profit : (entry.trade < 0 ? CHART_COLORS.loss : CHART_COLORS.neutral)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Profit */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 p-5 rounded-xl h-[250px]">
          <h3 className="text-slate-200 font-semibold mb-4">Ganancia Mensual</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis dataKey="month" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={60} />
              <Tooltip 
                cursor={{fill: '#1e293b'}}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} 
              />
              <Bar dataKey="profit" fill={CHART_COLORS.equity} radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};