import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { CalculationResult } from '../types';

interface ResultsDisplayProps {
  results: CalculationResult;
  isProfitable: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isProfitable }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {/* Profit Card */}
      <div className={`p-4 rounded-xl border ${isProfitable ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg ${isProfitable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            <DollarSign className="w-4 h-4" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase">Ganancia Neta</span>
        </div>
        <div className={`text-2xl font-bold font-mono tracking-tight ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
          ${results.profitMXN.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* ROI Card */}
      <div className="p-4 rounded-xl border bg-slate-800/50 border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Percent className="w-4 h-4" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase">Retorno (ROI)</span>
        </div>
        <div className="text-2xl font-bold font-mono tracking-tight text-indigo-400">
          {results.roi.toFixed(2)}%
        </div>
      </div>

      {/* Spread Card */}
      <div className="p-4 rounded-xl border bg-slate-800/50 border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
            {results.spread >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase">Spread</span>
        </div>
        <div className="text-2xl font-bold font-mono tracking-tight text-blue-400">
          {results.spread.toFixed(2)}
        </div>
      </div>

      {/* Revenue Card (Total MXN) */}
      <div className="p-4 rounded-xl border bg-slate-800/50 border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase">Retorno Total</span>
        </div>
        <div className="text-lg font-bold font-mono tracking-tight text-slate-200 truncate">
          ${results.totalRevenueMXN.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          Inventario restante: {results.remainingInventory.toFixed(2)} USDT
        </div>
      </div>
    </div>
  );
};