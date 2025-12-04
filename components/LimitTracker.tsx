import React, { useState } from 'react';
import { Settings, Info, AlertTriangle } from 'lucide-react';
import { MonthlyLimitState } from '../types';

interface LimitTrackerProps {
  limitState: MonthlyLimitState;
  onUpdateSettings: (newLimit: number, newRate: number) => void;
}

export const LimitTracker: React.FC<LimitTrackerProps> = ({ limitState, onUpdateSettings }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempLimit, setTempLimit] = useState(limitState.limitUSD.toString());
  const [tempRate, setTempRate] = useState(limitState.exchangeRate.toString());

  const percentage = Math.min((limitState.usedUSD / limitState.limitUSD) * 100, 100);
  const remainingUSD = Math.max(limitState.limitUSD - limitState.usedUSD, 0);
  const remainingMXN = remainingUSD * limitState.exchangeRate;

  const isCritical = percentage >= 90;
  const isWarning = percentage >= 75 && percentage < 90;

  const handleSave = () => {
    onUpdateSettings(Number(tempLimit), Number(tempRate));
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-5 mb-6 shadow-lg animate-fade-in relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-slate-100 font-semibold flex items-center gap-2">
            Binance Limit Tracker
            {isCritical && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
          </h3>
          <p className="text-slate-400 text-xs mt-1">Límite mensual rotativo</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-slate-500 hover:text-indigo-400 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Límite (USD)</label>
            <input 
              type="number" 
              value={tempLimit} 
              onChange={(e) => setTempLimit(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Tasa Ref. (MXN)</label>
            <input 
              type="number" 
              value={tempRate} 
              onChange={(e) => setTempRate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
            />
          </div>
          <button 
            onClick={handleSave}
            className="col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-1.5 rounded transition-colors"
          >
            Actualizar Configuración
          </button>
        </div>
      ) : null}

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-3 mb-2 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-xs font-mono">
        <span className="text-slate-300">
          Usado: <span className="text-white font-bold">${limitState.usedUSD.toLocaleString()}</span>
        </span>
        <span className="text-slate-300">
          Restante: <span className={`${isCritical ? 'text-red-400' : 'text-emerald-400'} font-bold`}>
            ${remainingUSD.toLocaleString()} USD
          </span>
        </span>
      </div>
      
      <div className="mt-2 text-right text-[10px] text-slate-500">
        ≈ ${remainingMXN.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN disponibles
      </div>
    </div>
  );
};