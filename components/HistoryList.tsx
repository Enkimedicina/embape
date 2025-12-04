import React from 'react';
import { Trash2, RotateCcw, Download, Upload } from 'lucide-react';
import { TradeHistoryItem } from '../types';

interface HistoryListProps {
  history: TradeHistoryItem[];
  onDelete: (id: string) => void;
  onRestore: (item: TradeHistoryItem) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ 
  history, 
  onDelete, 
  onRestore, 
  onExport, 
  onImport 
}) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg animate-slide-up h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-slate-100 font-semibold text-lg">Historial de Operaciones</h3>
        <div className="flex gap-2">
          <label className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-indigo-400 rounded-lg cursor-pointer transition-colors" title="Importar JSON">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
          <button 
            onClick={onExport}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors"
            title="Exportar JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-auto flex-1 pr-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            <p>No hay operaciones registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div 
                key={item.id} 
                className="group p-4 bg-slate-800/30 border border-slate-800 hover:border-slate-700 rounded-lg transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm font-bold ${item.profitMXN >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.profitMXN >= 0 ? '+' : ''}${item.profitMXN.toLocaleString()} MXN
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                        {item.roi.toFixed(2)}% ROI
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {item.date} • {item.amountSold.toFixed(2)} USDT
                    </div>
                    <div className="text-[10px] text-slate-600 font-mono mt-1">
                      Buy: {item.buyPrice} | Sell: {item.sellPrice}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onRestore(item)}
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400 transition-colors"
                      title="Restaurar datos"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};