import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LayoutDashboard, Calculator, Save, BrainCircuit, RotateCcw } from 'lucide-react';
import { InputGroup } from './components/InputGroup';
import { ResultsDisplay } from './components/ResultsDisplay';
import { HistoryList } from './components/HistoryList';
import { LimitTracker } from './components/LimitTracker';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { analyzeTrade } from './services/geminiService';
import { 
  TradeHistoryItem, 
  MonthlyLimitState, 
  CalculationResult, 
  Tab 
} from './types';
import { 
  DEFAULT_LIMIT_USD, 
  DEFAULT_EXCHANGE_RATE, 
  APP_STORAGE_KEYS 
} from './constants';

const App: React.FC = () => {
  // --- Global UI State ---
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CALCULATOR);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // --- Calculator State ---
  const [investmentMXN, setInvestmentMXN] = useState<string>('');
  const [inventoryUSDT, setInventoryUSDT] = useState<string>('');
  const [buyPrice, setBuyPrice] = useState<string>('');
  
  const [sellPrice, setSellPrice] = useState<string>('');
  const [amountToSell, setAmountToSell] = useState<string>(''); // Sell Amount

  // --- Data Stores ---
  const [history, setHistory] = useState<TradeHistoryItem[]>([]);
  const [limitState, setLimitState] = useState<MonthlyLimitState>({
    limitUSD: DEFAULT_LIMIT_USD,
    usedUSD: 0,
    exchangeRate: DEFAULT_EXCHANGE_RATE,
    lastResetMonth: new Date().getMonth()
  });

  // --- AI State ---
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- Persistence ---
  
  // Load initial data
  useEffect(() => {
    const savedHistory = localStorage.getItem(APP_STORAGE_KEYS.HISTORY);
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedSettings = localStorage.getItem(APP_STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      
      // Check for month reset logic
      const currentMonth = new Date().getMonth();
      if (parsed.lastResetMonth !== currentMonth) {
        setLimitState({
          ...parsed,
          usedUSD: 0, // Reset usage
          lastResetMonth: currentMonth
        });
        showToast("¡Nuevo mes detectado! El límite de Binance se ha reiniciado.");
      } else {
        setLimitState(parsed);
      }
    }
    
    // Attempt to restore persistent inventory from last session if needed, 
    // but for now we keep inventory purely in the inputs as per request "Input editable".
    const savedInventory = localStorage.getItem(APP_STORAGE_KEYS.INVENTORY);
    if (savedInventory) setInventoryUSDT(savedInventory);

  }, []);

  // Save changes
  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.SETTINGS, JSON.stringify(limitState));
  }, [limitState]);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEYS.INVENTORY, inventoryUSDT);
  }, [inventoryUSDT]);


  // --- Logic & Handlers ---

  const showToast = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3000);
  };

  // Bidirectional Inventory Sync
  const handleInvestmentChange = (val: string) => {
    setInvestmentMXN(val);
    const inv = parseFloat(val);
    const buy = parseFloat(buyPrice);
    if (!isNaN(inv) && !isNaN(buy) && buy > 0) {
      setInventoryUSDT((inv / buy).toFixed(2));
    }
  };

  const handleInventoryChange = (val: string) => {
    setInventoryUSDT(val);
    const inventory = parseFloat(val);
    const buy = parseFloat(buyPrice);
    if (!isNaN(inventory) && !isNaN(buy)) {
      setInvestmentMXN((inventory * buy).toFixed(2));
    }
  };

  const handleBuyPriceChange = (val: string) => {
    setBuyPrice(val);
    const buy = parseFloat(val);
    const inv = parseFloat(inventoryUSDT);
    // If we have inventory, update investment value
    if (!isNaN(buy) && !isNaN(inv)) {
      setInvestmentMXN((inv * buy).toFixed(2));
    }
  };

  const handleSellMax = () => {
    setAmountToSell(inventoryUSDT);
  };

  // Calculation Logic
  const calculation: CalculationResult = useMemo(() => {
    const buy = parseFloat(buyPrice) || 0;
    const sell = parseFloat(sellPrice) || 0;
    const amount = parseFloat(amountToSell) || 0;
    const totalInv = parseFloat(inventoryUSDT) || 0;

    const totalRevenueMXN = sell * amount;
    const costBasis = buy * amount;
    const profitMXN = totalRevenueMXN - costBasis;
    
    const roi = costBasis > 0 ? (profitMXN / costBasis) * 100 : 0;
    const spread = buy > 0 ? ((sell - buy) / buy) * 100 : 0;
    const remaining = Math.max(0, totalInv - amount);

    return {
      profitMXN,
      roi,
      spread,
      totalRevenueMXN,
      remainingInventory: remaining
    };
  }, [buyPrice, sellPrice, amountToSell, inventoryUSDT]);

  const handleSaveTransaction = () => {
    const amount = parseFloat(amountToSell);
    if (!amount || amount <= 0) {
      showToast("Ingresa una cantidad válida para vender.");
      return;
    }
    if (amount > parseFloat(inventoryUSDT)) {
      showToast("No tienes suficiente inventario.");
      return;
    }

    const newTrade: TradeHistoryItem = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleString(),
      timestamp: Date.now(),
      buyPrice: parseFloat(buyPrice),
      sellPrice: parseFloat(sellPrice),
      amountSold: amount,
      investmentMXN: parseFloat(buyPrice) * amount,
      revenueMXN: calculation.totalRevenueMXN,
      profitMXN: calculation.profitMXN,
      roi: calculation.roi
    };

    setHistory(prev => [newTrade, ...prev]);
    setLimitState(prev => ({
      ...prev,
      usedUSD: prev.usedUSD + amount
    }));
    
    // Update inventory (deduct sold amount)
    const newInventory = calculation.remainingInventory;
    setInventoryUSDT(newInventory.toFixed(2));
    // Update investment basis
    const buy = parseFloat(buyPrice);
    if(buy) setInvestmentMXN((newInventory * buy).toFixed(2));

    // Reset sales inputs
    setAmountToSell('');
    setAiAdvice(null);
    showToast("Operación guardada exitosamente");
  };

  const handleGetAIAdvice = async () => {
    const amount = parseFloat(amountToSell) || 0;
    if (amount <= 0 || !buyPrice || !sellPrice) {
      showToast("Completa los datos de la operación primero.");
      return;
    }
    setIsAiLoading(true);
    const advice = await analyzeTrade(
      parseFloat(buyPrice),
      parseFloat(sellPrice),
      amount,
      calculation.profitMXN,
      calculation.roi
    );
    setAiAdvice(advice);
    setIsAiLoading(false);
  };

  const handleHistoryAction = {
    delete: (id: string) => {
      setHistory(prev => prev.filter(i => i.id !== id));
      showToast("Registro eliminado");
    },
    restore: (item: TradeHistoryItem) => {
      setBuyPrice(item.buyPrice.toString());
      setSellPrice(item.sellPrice.toString());
      setAmountToSell(item.amountSold.toString());
      // Logic for inventory restoration is tricky, usually we just restore prices/amounts
      // But we can notify the user
      showToast("Datos cargados en la calculadora");
      setActiveTab(Tab.CALCULATOR);
    },
    export: () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "p2p_history_backup.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },
    import: (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (Array.isArray(imported)) {
            // Merge strategy: Filter out duplicates by ID
            const existingIds = new Set(history.map(h => h.id));
            const newItems = imported.filter((i: any) => !existingIds.has(i.id));
            setHistory(prev => [...newItems, ...prev]);
            showToast(`${newItems.length} registros importados.`);
          }
        } catch (err) {
          showToast("Error al leer el archivo JSON");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">P2P Pro <span className="text-indigo-400">Calc</span></span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab(Tab.CALCULATOR)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === Tab.CALCULATOR 
                  ? 'bg-slate-800 text-white shadow-lg shadow-indigo-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  <span className="hidden sm:inline">Calculadora</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab(Tab.DASHBOARD)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === Tab.DASHBOARD 
                  ? 'bg-slate-800 text-white shadow-lg shadow-indigo-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Notification Toast */}
        {showNotification && (
          <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl z-50 animate-slide-up flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {showNotification}
          </div>
        )}

        {/* Global Limit Tracker (Visible in Calculator) */}
        {activeTab === Tab.CALCULATOR && (
          <LimitTracker 
            limitState={limitState} 
            onUpdateSettings={(l, r) => setLimitState(prev => ({ ...prev, limitUSD: l, exchangeRate: r }))}
          />
        )}

        {activeTab === Tab.CALCULATOR ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Calculator Inputs */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card: Acquisition & Inventory */}
              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                 <h2 className="text-lg font-semibold mb-4 text-blue-400 flex items-center gap-2">
                   1. Inventario y Compra
                 </h2>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputGroup 
                      label="Precio Compra (MXN)" 
                      value={buyPrice} 
                      onChange={handleBuyPriceChange} 
                      placeholder="0.00"
                      prefix="$"
                    />
                    <InputGroup 
                      label="Inversión Total (MXN)" 
                      value={investmentMXN} 
                      onChange={handleInvestmentChange} 
                      placeholder="0.00"
                      prefix="$"
                    />
                    <InputGroup 
                      label="Inventario (USDT)" 
                      value={inventoryUSDT} 
                      onChange={handleInventoryChange} 
                      placeholder="0.00"
                      suffix="USDT"
                    />
                 </div>
              </div>

              {/* Card: Sales Execution */}
              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
                    2. Ejecución de Venta
                  </h2>
                  <div className="flex gap-2">
                     <button 
                       onClick={handleGetAIAdvice}
                       disabled={isAiLoading}
                       className="flex items-center gap-1 text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-all"
                     >
                       <BrainCircuit className={`w-3 h-3 ${isAiLoading ? 'animate-pulse' : ''}`} />
                       {isAiLoading ? 'Analizando...' : 'Asesor AI'}
                     </button>
                  </div>
                </div>

                {/* AI Advice Box */}
                {aiAdvice && (
                  <div className="mb-4 p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-lg animate-fade-in">
                    <p className="text-xs text-indigo-200 leading-relaxed italic">
                      <span className="font-bold not-italic mr-1">🤖 Gemini:</span> 
                      "{aiAdvice}"
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <InputGroup 
                      label="Precio Venta (MXN)" 
                      value={sellPrice} 
                      onChange={setSellPrice} 
                      placeholder="0.00"
                      prefix="$"
                    />
                    <div className="flex gap-2 items-end">
                      <InputGroup 
                        label="Cantidad a Vender" 
                        value={amountToSell} 
                        onChange={setAmountToSell} 
                        placeholder="0.00"
                        suffix="USDT"
                        className="flex-1"
                      />
                      <button 
                        onClick={handleSellMax}
                        className="mb-[1px] h-[42px] px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-colors"
                      >
                        MAX
                      </button>
                    </div>
                 </div>

                 <ResultsDisplay 
                   results={calculation} 
                   isProfitable={calculation.profitMXN >= 0} 
                 />

                 <div className="mt-6 flex justify-end">
                   <button 
                     onClick={handleSaveTransaction}
                     className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-6 rounded-lg shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95"
                   >
                     <Save className="w-4 h-4" />
                     Guardar Operación
                   </button>
                 </div>
              </div>
            </div>

            {/* Right Column: History */}
            <div className="lg:h-[calc(100vh-8rem)] min-h-[500px]">
              <HistoryList 
                history={history} 
                onDelete={handleHistoryAction.delete}
                onRestore={handleHistoryAction.restore}
                onExport={handleHistoryAction.export}
                onImport={handleHistoryAction.import}
              />
            </div>

          </div>
        ) : (
          <AnalyticsDashboard history={history} />
        )}
      </main>
    </div>
  );
};

export default App;