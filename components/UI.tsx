import React, { useState } from 'react';
import { ALGORITHMS, CATALOG, COST_PER_KW, COST_PER_THERMAL_UNIT, EMPLOYEE_SALARY } from '../constants';
import { AlgorithmType, GameState, ItemType, Location, ToolMode, Contract } from '../types';
import { Zap, Cpu, Thermometer, DollarSign, Server, Wind, Lock, Check, MapPin, Activity, AlertTriangle, MousePointer2, Move, Trash2, Briefcase, TrendingUp, Users, PenLine, Building2 } from 'lucide-react';

// Utility for large numbers
const formatNumber = (num: number, suffix = '', decimals = 1) => {
    if (num >= 1e12) return (num / 1e12).toFixed(decimals) + 'T' + suffix; // Trillion / Tera
    if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'G' + suffix; // Billion / Giga
    if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M' + suffix; // Million / Mega
    if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'k' + suffix; // Thousand / Kilo
    return num.toFixed(decimals) + suffix;
};

// Specific for FLOPS
const formatFlops = (flops: number) => {
    if (flops >= 1e9) return (flops / 1e9).toFixed(2) + ' Zetta';
    if (flops >= 1e6) return (flops / 1e6).toFixed(2) + ' Exa';
    if (flops >= 1e3) return (flops / 1e3).toFixed(2) + ' Peta';
    return flops.toFixed(1) + ' Tera';
};

// --- Stats Header ---
export const Header: React.FC<{ 
    money: number; 
    energyUsage: number; 
    energyMax: number; 
    heat: number; 
    cooling: number; 
    compute: number; 
    income: number;
    expenses: number;
    companyName: string;
    valuation: number;
}> = ({ money, energyUsage, energyMax, heat, cooling, compute, income, expenses, companyName, valuation }) => {
    
    // Calculate percentages
    const energyPct = Math.min((energyUsage / Math.max(energyMax, 1)) * 100, 100);
    const heatPct = Math.min((heat / Math.max(cooling, 1)) * 100, 100);
    const isOverheating = heat > cooling;
    const isPowerOutage = energyUsage > energyMax;

    return (
        <div className="bg-slate-900/95 backdrop-blur-md p-2 border-b border-slate-700">
            <div className="flex justify-between items-start px-2 mb-2">
                 <div className="flex items-center gap-3">
                     <div className="bg-green-600 p-2 rounded-lg shadow-lg shadow-green-900/20">
                        <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-2xl font-mono text-white font-bold">${formatNumber(money)}</p>
                        <div className="flex text-xs font-mono gap-2">
                            <span className="text-green-400">+{formatNumber(income)}/s</span>
                            <span className="text-red-400">-{formatNumber(expenses)}/s</span>
                        </div>
                    </div>
                </div>

                <div className="text-right hidden md:block">
                     <h1 className="text-lg font-bold text-slate-100 flex items-center justify-end gap-2">
                         <Building2 className="w-4 h-4 text-blue-400" /> {companyName}
                     </h1>
                     <p className="text-xs text-slate-400">Valuation: <span className="text-blue-300 font-mono">${formatNumber(valuation)}</span></p>
                </div>

                <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
                     <Activity className="w-5 h-5 text-purple-400" />
                     <div>
                         <div className="text-xs text-slate-400 uppercase font-bold">Processamento</div>
                         <div className="text-lg font-mono text-purple-300">{formatFlops(compute)}FLOPS</div>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 px-2">
                {/* Energy Bar */}
                <div className="relative">
                    <div className="flex justify-between text-xs mb-1">
                        <span className={`flex items-center gap-1 ${isPowerOutage ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                            <Zap className="w-3 h-3" /> {formatNumber(energyUsage, 'kW')}
                        </span>
                        <span className="text-slate-500">{formatNumber(energyMax, 'kW')} Max</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div className={`h-full transition-all duration-500 ${isPowerOutage ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${energyPct}%` }}></div>
                    </div>
                </div>

                {/* Heat Bar */}
                <div className="relative">
                    <div className="flex justify-between text-xs mb-1">
                        <span className={`flex items-center gap-1 ${isOverheating ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                            <Thermometer className="w-3 h-3" /> {formatNumber(heat, 'TU')}
                        </span>
                        <span className="text-slate-500">{formatNumber(cooling, 'TU')} Cool</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div className={`h-full transition-all duration-500 ${isOverheating ? 'bg-red-500' : 'bg-blue-400'}`} style={{ width: `${heatPct}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Shop Sidebar ---
export const Shop: React.FC<{ 
    money: number; 
    onSelectItem: (item: ItemType | null) => void;
    activeItem: ItemType | null;
}> = ({ money, onSelectItem, activeItem }) => {
    
    const categories = [
        { title: 'Hardware IA', type: 'COMPUTE', icon: Server },
        { title: 'Resfriamento', type: 'COOLING', icon: Wind },
        { title: 'Gerar Energia', type: 'POWER', icon: Zap },
    ];

    return (
        <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col h-full overflow-hidden z-10">
            <div className="p-4 border-b border-slate-700 bg-slate-900">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-500" /> Mercado
                </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-6">
                {categories.map((cat) => (
                    <div key={cat.title}>
                        <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 px-2 flex items-center gap-2 sticky top-0 bg-slate-900 py-1 z-10">
                            <cat.icon className="w-3 h-3" /> {cat.title}
                        </h3>
                        <div className="space-y-2">
                            {/* Sorted by Cost Ascending */}
                            {Object.values(CATALOG)
                                .filter(i => i.type === cat.type)
                                .sort((a, b) => a.cost - b.cost)
                                .map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => onSelectItem(activeItem === item.id ? null : item.id)}
                                    disabled={money < item.cost}
                                    className={`w-full text-left p-2 rounded-lg border transition-all relative overflow-hidden group ${
                                        activeItem === item.id 
                                            ? 'bg-blue-900/50 border-blue-400' 
                                            : money < item.cost
                                                ? 'bg-slate-800/50 border-slate-800 opacity-60 grayscale'
                                                : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1 relative z-10">
                                        <span className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">{item.name}</span>
                                        <span className={`text-xs font-mono font-bold ${money < item.cost ? 'text-red-400' : 'text-green-400'}`}>${formatNumber(item.cost)}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight mb-2 relative z-10">{item.description}</p>
                                    
                                    {/* Detailed Stats */}
                                    <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[9px] text-slate-300 relative z-10 bg-slate-900/30 p-1 rounded">
                                        {item.compute && <span className="text-purple-300 font-mono">+{formatNumber(item.compute)} TF</span>}
                                        {item.cooling && <span className="text-blue-300 font-mono">+{formatNumber(item.cooling)} TU</span>}
                                        {item.energyProv && <span className="text-yellow-300 font-mono">+{formatNumber(item.energyProv)} kW</span>}
                                        
                                        {item.energyCons && <span className="text-orange-400 font-mono">-{item.energyCons} kW</span>}
                                        {item.heatGen && <span className="text-red-400 font-mono">+{item.heatGen} Heat</span>}
                                        {item.maintenance && <span className="text-slate-400 font-mono">-${item.maintenance}/t</span>}
                                    </div>
                                    
                                    {/* Background glow based on color */}
                                    <div 
                                        className="absolute top-0 right-0 w-16 h-16 blur-2xl opacity-10 rounded-full -mr-8 -mt-8"
                                        style={{ backgroundColor: item.color }}
                                    ></div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="p-3 bg-slate-800 text-[10px] text-slate-400 border-t border-slate-700">
                <div className="flex justify-between items-center">
                    <span>Custo Energia: <span className="text-white">${COST_PER_KW.toFixed(2)}/kW</span></span>
                    <span>Custo Térmico: <span className="text-white">${COST_PER_THERMAL_UNIT.toFixed(2)}/TU</span></span>
                </div>
            </div>
        </div>
    );
};

// --- Toolbar ---
export const Toolbar: React.FC<{
    currentMode: ToolMode;
    setMode: (mode: ToolMode) => void;
}> = ({ currentMode, setMode }) => {
    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 rounded-full p-2 flex gap-2 shadow-2xl z-30">
             <button
                onClick={() => setMode(ToolMode.BUILD)}
                className={`p-3 rounded-full transition-all flex items-center gap-2 ${currentMode === ToolMode.BUILD ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                title="Modo Construção"
             >
                 <MousePointer2 className="w-5 h-5" />
                 <span className="text-xs font-bold hidden md:block">Construir</span>
             </button>
             <button
                onClick={() => setMode(ToolMode.MOVE)}
                className={`p-3 rounded-full transition-all flex items-center gap-2 ${currentMode === ToolMode.MOVE ? 'bg-yellow-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                title="Mover Items"
             >
                 <Move className="w-5 h-5" />
                 <span className="text-xs font-bold hidden md:block">Mover</span>
             </button>
             <button
                onClick={() => setMode(ToolMode.SELL)}
                className={`p-3 rounded-full transition-all flex items-center gap-2 ${currentMode === ToolMode.SELL ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                title="Vender Items"
             >
                 <Trash2 className="w-5 h-5" />
                 <span className="text-xs font-bold hidden md:block">Vender</span>
             </button>
        </div>
    )
}

// --- Control Panel ---
export const ControlPanel: React.FC<{
    state: GameState;
    locations: Location[];
    onUnlockAlgo: (id: AlgorithmType) => void;
    onSetAlgo: (id: AlgorithmType) => void;
    onSwitchLoc: (id: string) => void;
    onBuyLoc: (id: string) => void;
    onHire: () => void;
    onRename: (name: string) => void;
    onIPO: () => void;
    onSignContract: (id: string) => void;
    computeTotal: number;
}> = ({ state, locations, onUnlockAlgo, onSetAlgo, onSwitchLoc, onBuyLoc, onHire, onRename, onIPO, onSignContract, computeTotal }) => {
    const [tab, setTab] = React.useState<'ALGO' | 'MAP' | 'COMPANY'>('COMPANY');
    const [editingName, setEditingName] = useState(false);
    const [tempName, setTempName] = useState(state.company.name);

    return (
        <div className="absolute top-24 right-4 w-80 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-140px)] z-10">
            <div className="flex border-b border-slate-700">
                <button 
                    className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${tab === 'COMPANY' ? 'bg-slate-800 text-white border-b-2 border-blue-500' : 'text-slate-400 hover:bg-slate-800/50'}`}
                    onClick={() => setTab('COMPANY')}
                >
                    <Briefcase className="w-4 h-4" /> Empresa
                </button>
                <button 
                    className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${tab === 'ALGO' ? 'bg-slate-800 text-white border-b-2 border-blue-500' : 'text-slate-400 hover:bg-slate-800/50'}`}
                    onClick={() => setTab('ALGO')}
                >
                    <Cpu className="w-4 h-4" /> Algoritmos
                </button>
                <button 
                    className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${tab === 'MAP' ? 'bg-slate-800 text-white border-b-2 border-blue-500' : 'text-slate-400 hover:bg-slate-800/50'}`}
                    onClick={() => setTab('MAP')}
                >
                    <MapPin className="w-4 h-4" /> Expansão
                </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-700">
                {/* --- COMPANY TAB --- */}
                {tab === 'COMPANY' && (
                    <div className="space-y-6">
                        {/* Company Header */}
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                {editingName ? (
                                    <div className="flex gap-2 w-full">
                                        <input 
                                            type="text" 
                                            value={tempName} 
                                            onChange={(e) => setTempName(e.target.value)}
                                            className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs w-full text-white"
                                        />
                                        <button onClick={() => { onRename(tempName); setEditingName(false); }} className="text-green-400"><Check className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="font-bold text-white text-lg">{state.company.name}</h3>
                                        <button onClick={() => setEditingName(true)} className="text-slate-500 hover:text-white"><PenLine className="w-4 h-4" /></button>
                                    </>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-slate-900 p-2 rounded">
                                    <p className="text-slate-400">Valuation</p>
                                    <p className="font-mono text-blue-300 font-bold">${formatNumber(state.company.valuation)}</p>
                                </div>
                                <div className="bg-slate-900 p-2 rounded">
                                    <p className="text-slate-400">Ações</p>
                                    <p className="font-mono text-white font-bold">{state.company.isPublic ? `$${state.company.stockPrice.toFixed(2)}` : 'Privado'}</p>
                                </div>
                            </div>

                            {!state.company.isPublic && (
                                <button 
                                    onClick={onIPO}
                                    disabled={state.company.valuation < 10000000}
                                    className="w-full mt-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-1.5 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Realizar IPO (Req: $10M Val)
                                </button>
                            )}
                        </div>

                        {/* HR Section */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Users className="w-3 h-3" /> Time ({state.company.employees})</h4>
                            <div className="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700">
                                <div className="text-xs">
                                    <p className="text-slate-300">Engenheiros de IA</p>
                                    <p className="text-slate-500">-${EMPLOYEE_SALARY}/tick por pessoa</p>
                                </div>
                                <button 
                                    onClick={onHire}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold"
                                >
                                    Contratar
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Funcionários são necessários para gerenciar e aceitar contratos complexos.</p>
                        </div>

                        {/* Contracts Section */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Briefcase className="w-3 h-3" /> Contratos B2B</h4>
                            
                            {/* Active Contracts */}
                            {state.company.activeContracts.length > 0 && (
                                <div className="mb-4 space-y-2">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Em Progresso</p>
                                    {state.company.activeContracts.map(c => (
                                        <div key={c.id} className="bg-green-900/20 border border-green-800/50 p-2 rounded relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-xs text-white">{c.clientName}</span>
                                                <div className="text-right">
                                                    <span className="block text-[10px] text-green-300 font-mono font-bold">Total: ${formatNumber(c.totalValue)}</span>
                                                    <span className="block text-[9px] text-slate-400">Na entrega</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-300 mb-1">{c.description}</p>
                                            <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                                <span className={`${computeTotal < c.requiredFlops ? 'text-red-400 animate-pulse font-bold' : ''}`}>Req: {formatFlops(c.requiredFlops)}</span>
                                                <span>{c.durationTicks}s restantes</span>
                                            </div>
                                            {/* Progress bar simulation based on duration */}
                                            <div className="absolute bottom-0 left-0 h-0.5 bg-green-500 w-full animate-pulse"></div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Available Contracts */}
                            <div className="space-y-2">
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Disponíveis</p>
                                {state.company.availableContracts.length === 0 && <p className="text-xs text-slate-600 italic">Nenhum contrato no momento...</p>}
                                {state.company.availableContracts.map(c => {
                                    const canAcceptCompute = computeTotal >= c.requiredFlops;
                                    const hasStaff = state.company.employees >= c.requiredEmployees;
                                    const hasCapacity = state.company.activeContracts.length < (1 + state.company.employees);

                                    return (
                                        <div key={c.id} className="bg-slate-800 border border-slate-700 p-2 rounded hover:bg-slate-750 transition-colors">
                                             <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-xs text-blue-200">{c.clientName}</span>
                                                <span className="text-xs text-green-400 font-bold font-mono">${formatNumber(c.totalValue)}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mb-2">{c.description}</p>
                                            
                                            <div className="flex flex-col gap-1 bg-slate-900 p-1.5 rounded mb-2">
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-[10px] font-mono ${canAcceptCompute ? 'text-slate-300' : 'text-red-400'}`}>Req: {formatFlops(c.requiredFlops)}</span>
                                                    <span className="text-[10px] font-mono text-slate-300">{c.durationTicks}s Duração</span>
                                                </div>
                                                <div className="flex justify-between items-center border-t border-slate-800 pt-1 mt-1">
                                                     <span className={`text-[10px] font-mono flex items-center gap-1 ${hasStaff ? 'text-slate-300' : 'text-red-400'}`}>
                                                        <Users className="w-3 h-3" /> Req: {c.requiredEmployees} Equipe
                                                     </span>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => onSignContract(c.id)}
                                                disabled={!canAcceptCompute || !hasCapacity || !hasStaff}
                                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold py-1 rounded transition-colors"
                                            >
                                                {!canAcceptCompute ? 'Faltam FLOPS' : !hasStaff ? 'Falta Equipe' : !hasCapacity ? 'Capacidade Cheia' : 'Assinar Contrato'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'ALGO' && (
                    <div className="space-y-4">
                        <div className="bg-blue-900/20 border border-blue-800/50 p-2 rounded text-[10px] text-blue-200">
                            Algoritmos determinam como seus FLOPS são monetizados. Alguns consomem mais energia ou geram mais calor.
                        </div>
                        {Object.values(ALGORITHMS).map(algo => {
                            const isUnlocked = state.unlockedAlgorithms.includes(algo.id);
                            const isActive = state.activeAlgorithm === algo.id;

                            return (
                                <div key={algo.id} className={`p-3 rounded-lg border transition-all ${isActive ? 'border-green-500 bg-green-900/20' : 'border-slate-700 bg-slate-800'}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-sm text-white">{algo.name}</span>
                                        {isActive && <Check className="w-4 h-4 text-green-500" />}
                                        {!isUnlocked && <Lock className="w-3 h-3 text-slate-500" />}
                                    </div>
                                    <p className="text-xs text-slate-400 mb-2">{algo.description}</p>
                                    
                                    <div className="grid grid-cols-3 gap-1 mb-2 text-[10px] text-slate-300">
                                        <div className="bg-slate-900 px-1 py-0.5 rounded text-center border border-slate-700">
                                            ${algo.revenuePerFlops.toFixed(2)}/TF
                                        </div>
                                        <div className="bg-slate-900 px-1 py-0.5 rounded text-center border border-slate-700">
                                            {algo.energyPenalty}x PWR
                                        </div>
                                        <div className="bg-slate-900 px-1 py-0.5 rounded text-center border border-slate-700">
                                            {algo.heatPenalty}x HEAT
                                        </div>
                                    </div>

                                    {isUnlocked ? (
                                        <button 
                                            onClick={() => onSetAlgo(algo.id)}
                                            disabled={isActive}
                                            className={`w-full py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all ${isActive ? 'bg-green-600/50 text-green-200 cursor-default' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50'}`}
                                        >
                                            {isActive ? 'Ativo' : 'Ativar Contrato'}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => onUnlockAlgo(algo.id)}
                                            disabled={state.money < algo.unlockCost}
                                            className="w-full py-1.5 rounded text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
                                        >
                                            Pesquisar (${formatNumber(algo.unlockCost)})
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {tab === 'MAP' && (
                    <div className="space-y-4">
                        {locations.map(loc => {
                            const isCurrent = state.currentLocationId === loc.id;
                            
                            return (
                                <div key={loc.id} className={`p-3 rounded-lg border ${isCurrent ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800'}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-sm text-white">{loc.name}</span>
                                        {isCurrent && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full">HQ</span>}
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                                        <span>Grid: {loc.gridSize}x{loc.gridSize}</span>
                                        <span>Items: {loc.items.length}</span>
                                    </div>
                                    
                                    {loc.unlocked ? (
                                        <button 
                                            onClick={() => onSwitchLoc(loc.id)}
                                            disabled={isCurrent}
                                            className="w-full py-1 rounded text-xs font-bold bg-slate-600 hover:bg-slate-500 text-white disabled:opacity-50"
                                        >
                                            {isCurrent ? 'Visualizando' : 'Gerenciar'}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => onBuyLoc(loc.id)}
                                            disabled={state.money < loc.cost}
                                            className="w-full py-1 rounded text-xs font-bold bg-yellow-600 hover:bg-yellow-500 text-white disabled:opacity-50"
                                        >
                                            Comprar Terreno (${formatNumber(loc.cost)})
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};