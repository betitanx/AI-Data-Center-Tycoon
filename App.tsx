import React, { useState, useEffect, useMemo } from 'react';
import { GameScene } from './components/GameScene';
import { Header, Shop, ControlPanel, Toolbar } from './components/UI';
import { 
    GameState, 
    ItemType, 
    AlgorithmType,
    GridItem,
    ToolMode,
    Contract
} from './types';
import { 
    INITIAL_LOCATIONS, 
    CATALOG, 
    ALGORITHMS, 
    TICK_RATE_MS,
    COST_PER_KW,
    COST_PER_THERMAL_UNIT,
    EMPLOYEE_SALARY,
    CLIENT_NAMES,
    CONTRACT_TASKS,
    CONTRACT_GEN_CHANCE
} from './constants';

// Fix for missing JSX elements in TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: any;
      span: any;
      p: any;
      h1: any;
      h2: any;
      h3: any;
      h4: any;
      button: any;
      input: any;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        div: any;
        span: any;
        p: any;
        h1: any;
        h2: any;
        h3: any;
        h4: any;
        button: any;
        input: any;
      }
    }
  }
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  // --- STATE ---
  const [gameState, setGameState] = useState<GameState>({
    money: 5000, 
    locations: INITIAL_LOCATIONS,
    currentLocationId: INITIAL_LOCATIONS[0].id,
    unlockedAlgorithms: [AlgorithmType.BASIC_INFERENCE],
    activeAlgorithm: AlgorithmType.BASIC_INFERENCE,
    lastTick: Date.now(),
    company: {
        name: "Escolha um nome da empresa",
        isPublic: false,
        stockPrice: 10.0,
        sharesOutstanding: 1000000,
        valuation: 5000,
        employees: 0,
        reputation: 10,
        activeContracts: [],
        availableContracts: []
    }
  });

  // Derived state for UI consumption
  const [lastIncome, setLastIncome] = useState(0);
  const [lastExpense, setLastExpense] = useState(0);

  // Interaction State
  const [activeShopItem, setActiveShopItem] = useState<ItemType | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>(ToolMode.BUILD);
  const [isMovingExistingItem, setIsMovingExistingItem] = useState(false);

  // --- DERIVED STATS (Global) ---
  const stats = useMemo(() => {
    let totalCompute = 0;
    let totalEnergyMax = 0;
    let totalCooling = 0;
    let baseEnergyCons = 0;
    let baseHeatGen = 0;
    let totalMaintenance = 0;
    
    gameState.locations.filter(l => l.unlocked).forEach(loc => {
        loc.items.forEach(item => {
            const def = CATALOG[item.type];
            if (def.compute) totalCompute += def.compute;
            if (def.energyProv) totalEnergyMax += def.energyProv;
            if (def.cooling) totalCooling += def.cooling;
            if (def.energyCons) baseEnergyCons += def.energyCons;
            if (def.heatGen) baseHeatGen += def.heatGen;
            if (def.maintenance) totalMaintenance += def.maintenance;
        });
    });

    // Apply Algorithm Multipliers
    const algo = ALGORITHMS[gameState.activeAlgorithm];
    const actualEnergyCons = baseEnergyCons * algo.energyPenalty;
    const actualHeatGen = baseHeatGen * algo.heatPenalty;

    // Ambient modifiers
    totalEnergyMax += 50; 
    totalCooling += 10;

    return {
        totalCompute,
        totalEnergyMax,
        totalCooling,
        actualEnergyCons,
        actualHeatGen,
        totalMaintenance,
        algo
    };
  }, [gameState.locations, gameState.activeAlgorithm]);

  // --- HELPER: GENERATE CONTRACT ---
  const generateNewContract = (currentCompute: number, reputation: number): Contract => {
      const difficulty = Math.random(); // 0 to 1
      const client = CLIENT_NAMES[Math.floor(Math.random() * CLIENT_NAMES.length)];
      const task = CONTRACT_TASKS[Math.floor(Math.random() * CONTRACT_TASKS.length)];
      
      // Target FLOPS: Scales drastically to force expansion.
      const baseReq = Math.max(300, currentCompute * (1.5 + difficulty * 2.0)); 
      const reqFlops = Math.round(baseReq);
      
      const duration = 60 + Math.floor(Math.random() * 240); // 1 minute to 5 minutes duration
      
      // Value calculation:
      // PREVIOUS: 10 + random * 5 (Avg ~12.5 per flop/sec) -> 300 * 100 * 12.5 = 375,000 (Too high)
      // NEW: 0.40 + random * 0.40 (Avg ~0.60 per flop/sec) -> 300 * 100 * 0.60 = 18,000 (Balanced vs 28k hardware cost)
      const valuePerFlopSec = 0.40 + (Math.random() * 0.40);
      
      const rawValue = reqFlops * duration * valuePerFlopSec * (1 + reputation/100);
      
      // Calculate Employee Requirement
      const employeesNeeded = Math.max(1, Math.floor(reqFlops / 250) + Math.floor(difficulty * 2));
      
      return {
          id: generateId(),
          clientName: client,
          description: task,
          requiredFlops: reqFlops,
          requiredEmployees: employeesNeeded,
          durationTicks: duration,
          totalValue: Math.round(rawValue),
          penalty: Math.round(rawValue * 0.15),
          type: 'TRAINING_RUN'
      };
  };

  // --- GAME LOOP ---
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const algo = ALGORITHMS[prev.activeAlgorithm];
        
        // --- 1. PHYSICAL SIMULATION ---
        let compute = 0;
        let energyMax = 50;
        let cooling = 10;
        let baseEnergyCons = 0;
        let baseHeatGen = 0;
        let maintenanceCost = 0;
        let assetsValue = 0; // For valuation

        prev.locations.filter(l => l.unlocked).forEach(loc => {
            loc.items.forEach(item => {
                const def = CATALOG[item.type];
                assetsValue += def.cost * 0.8; // Depreciated asset value
                if (def.compute) compute += def.compute;
                if (def.energyProv) energyMax += def.energyProv;
                if (def.cooling) cooling += def.cooling;
                if (def.energyCons) baseEnergyCons += def.energyCons;
                if (def.heatGen) baseHeatGen += def.heatGen;
                if (def.maintenance) maintenanceCost += def.maintenance;
            });
        });

        const energyCons = baseEnergyCons * algo.energyPenalty;
        const heatGen = baseHeatGen * algo.heatPenalty;

        // Throttling Logic
        let efficiency = 1.0;
        
        // Power Throttling: Proportional instead of Binary 0.1 penalty
        if (energyCons > energyMax) {
             const ratio = energyMax / Math.max(energyCons, 1);
             efficiency *= ratio;
        }

        // Thermal Throttling
        if (heatGen > cooling) {
            const ratio = cooling / Math.max(heatGen, 1);
            efficiency *= ratio; 
        }

        const effectiveCompute = compute * efficiency;

        // --- 2. ECONOMICS ---
        
        // Core Revenue
        let revenue = effectiveCompute * algo.revenuePerFlops;

        // Contract Revenue & Logic
        let contractRevenue = 0;
        
        const updatedActiveContracts = prev.company.activeContracts.map(c => {
            // REVISED PLAN: Pay 100% on successful completion.
            return { ...c, durationTicks: c.durationTicks - 1 };
        }).filter(c => {
            const finished = c.durationTicks <= 0;
            if (finished) {
                // Contract Success check
                if (effectiveCompute >= c.requiredFlops) {
                    contractRevenue += c.totalValue; // Lump sum!
                    // Reputation boost
                    prev.company.reputation = Math.min(100, prev.company.reputation + 1);
                } else {
                    // Penalty
                    contractRevenue -= c.penalty;
                     prev.company.reputation = Math.max(0, prev.company.reputation - 2);
                }
            }
            return !finished;
        });

        // Revenue Update
        revenue += contractRevenue;

        // Expenses
        const energyCost = energyCons * COST_PER_KW;
        const thermalCost = heatGen * COST_PER_THERMAL_UNIT; 
        const itemUpkeep = maintenanceCost;
        const wageCost = prev.company.employees * EMPLOYEE_SALARY;

        const totalExpenses = energyCost + thermalCost + itemUpkeep + wageCost;
        const netProfit = revenue - totalExpenses;

        // Update trackers
        setLastIncome(revenue);
        setLastExpense(totalExpenses);

        // --- 3. COMPANY MANAGEMENT ---
        
        // Contract Generation
        let availableContracts = [...prev.company.availableContracts];
        // Expire old available contracts randomly
        // REDUCED CHANCE: 0.05 -> 0.005 (0.5% chance per tick to delete)
        if (Math.random() < 0.005 && availableContracts.length > 0) {
            availableContracts.shift();
        }
        // Generate new one
        if (Math.random() < CONTRACT_GEN_CHANCE && availableContracts.length < 5) {
            availableContracts.push(generateNewContract(compute, prev.company.reputation));
        }

        // Valuation Update (Simple model: Cash + Assets + 10x Annualized Profit)
        const profitRunRate = Math.max(0, netProfit) * 60; // Approximate minute profit
        const newValuation = prev.money + assetsValue + (profitRunRate * 20); // Higher multiple
        
        // Stock Price Logic
        let newStockPrice = newValuation / prev.company.sharesOutstanding;
        
        if (prev.company.isPublic && prev.company.ipoPrice) {
            const ipoP = prev.company.ipoPrice;
            const fundamentalPrice = newValuation / prev.company.sharesOutstanding;
            
            // Constrain price fluctuation as requested: [IPO - 5, IPO + 100]
            // We blend the fundamental value into this range
            const minAllowed = Math.max(0, ipoP - 5);
            const maxAllowed = ipoP + 100;
            
            const targetPrice = Math.min(Math.max(fundamentalPrice, minAllowed), maxAllowed);
            
            // Apply smoothing (Lerp) so it doesn't jump instantly
            // 5% movement per tick towards target
            newStockPrice = prev.company.stockPrice + (targetPrice - prev.company.stockPrice) * 0.05;
        }

        return {
            ...prev,
            money: prev.money + netProfit,
            lastTick: Date.now(),
            company: {
                ...prev.company,
                activeContracts: updatedActiveContracts,
                availableContracts: availableContracts,
                valuation: newValuation,
                stockPrice: newStockPrice
            }
        };
      });
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---

  const handlePlaceItem = (x: number, y: number) => {
    if (!activeShopItem) return;
    const itemDef = CATALOG[activeShopItem];
    const cost = isMovingExistingItem ? 0 : itemDef.cost;
    
    if (gameState.money < cost) return;

    setGameState(prev => {
        const newLocations = prev.locations.map(loc => {
            if (loc.id === prev.currentLocationId) {
                if (loc.items.some(i => Math.abs(i.x - x) < 0.1 && Math.abs(i.y - y) < 0.1)) return loc;
                return {
                    ...loc,
                    items: [...loc.items, {
                        id: generateId(),
                        type: activeShopItem,
                        x,
                        y,
                        rotation: Math.floor(Math.random() * 4) * (Math.PI / 2)
                    }]
                };
            }
            return loc;
        });

        return {
            ...prev,
            money: prev.money - cost,
            locations: newLocations
        };
    });

    if (isMovingExistingItem) {
        setIsMovingExistingItem(false);
        setActiveShopItem(null); 
    }
  };

  const handleRemoveItem = (id: string, isMoveOperation = false) => {
      setGameState(prev => {
          let refund = 0;
          const newLocations = prev.locations.map(loc => {
              if (loc.id === prev.currentLocationId) {
                  const item = loc.items.find(i => i.id === id);
                  if (item) {
                      refund = isMoveOperation ? 0 : CATALOG[item.type].cost * 0.5;
                      return {
                          ...loc,
                          items: loc.items.filter(i => i.id !== id)
                      };
                  }
              }
              return loc;
          });
          return {
              ...prev,
              money: prev.money + refund,
              locations: newLocations
          };
      });
  };

  const handleItemClick = (item: GridItem) => {
      if (toolMode === ToolMode.SELL) {
          handleRemoveItem(item.id);
      } else if (toolMode === ToolMode.MOVE) {
          handleRemoveItem(item.id, true);
          setActiveShopItem(item.type);
          setIsMovingExistingItem(true);
      }
  };

  const handleShopSelect = (item: ItemType | null) => {
      setActiveShopItem(item);
      setIsMovingExistingItem(false);
      if (item) setToolMode(ToolMode.BUILD);
  };

  const handleSetToolMode = (mode: ToolMode) => {
      setToolMode(mode);
      if (mode !== ToolMode.BUILD) {
          setActiveShopItem(null);
          setIsMovingExistingItem(false);
      }
  };

  // --- NEW COMPANY ACTIONS ---

  const handleHireEmployee = () => {
      setGameState(prev => ({
          ...prev,
          company: {
              ...prev.company,
              employees: prev.company.employees + 1
          }
      }));
  };

  const handleRenameCompany = (name: string) => {
      setGameState(prev => ({
          ...prev,
          company: {
              ...prev.company,
              name
          }
      }));
  };

  const handleIPO = () => {
      setGameState(prev => {
          if (prev.company.valuation < 10000000) return prev; // Safety check $10M
          
          // IPO raises 20% of valuation in cash immediately
          const capitalRaised = prev.company.valuation * 0.2;
          const initialStockPrice = prev.company.valuation / prev.company.sharesOutstanding;

          return {
              ...prev,
              money: prev.money + capitalRaised,
              company: {
                  ...prev.company,
                  isPublic: true,
                  ipoPrice: initialStockPrice,
                  stockPrice: initialStockPrice
              }
          }
      });
  };

  const handleSignContract = (contractId: string) => {
      setGameState(prev => {
          const contract = prev.company.availableContracts.find(c => c.id === contractId);
          if (!contract) return prev;

          // Check management capacity (1 employee = +1 active contract slot base 1)
          const capacity = 1 + prev.company.employees;
          if (prev.company.activeContracts.length >= capacity) return prev;

          // Check employee requirement for specific contract
          if (prev.company.employees < contract.requiredEmployees) return prev;

          return {
              ...prev,
              company: {
                  ...prev.company,
                  activeContracts: [...prev.company.activeContracts, contract],
                  availableContracts: prev.company.availableContracts.filter(c => c.id !== contractId)
              }
          };
      });
  };

  // --- EXISTING ACTIONS ---
  const handleUnlockAlgo = (id: AlgorithmType) => {
      const algo = ALGORITHMS[id];
      if (gameState.money >= algo.unlockCost) {
          setGameState(prev => ({
              ...prev,
              money: prev.money - algo.unlockCost,
              unlockedAlgorithms: [...prev.unlockedAlgorithms, id]
          }));
      }
  };

  const handleSetAlgo = (id: AlgorithmType) => {
      setGameState(prev => ({ ...prev, activeAlgorithm: id }));
  };

  const handleBuyLocation = (id: string) => {
      const loc = gameState.locations.find(l => l.id === id);
      if (loc && gameState.money >= loc.cost) {
          setGameState(prev => ({
              ...prev,
              money: prev.money - loc.cost,
              locations: prev.locations.map(l => l.id === id ? { ...l, unlocked: true } : l),
              currentLocationId: id
          }));
      }
  };

  const currentLocation = gameState.locations.find(l => l.id === gameState.currentLocationId)!;

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white overflow-hidden font-sans">
        {/* Top Bar Stats */}
        <Header 
            money={gameState.money}
            energyUsage={stats.actualEnergyCons}
            energyMax={stats.totalEnergyMax}
            heat={stats.actualHeatGen}
            cooling={stats.totalCooling}
            compute={stats.totalCompute}
            income={lastIncome}
            expenses={lastExpense}
            companyName={gameState.company.name}
            valuation={gameState.company.valuation}
        />

        <div className="flex flex-1 overflow-hidden relative">
            {/* Shop Sidebar */}
            <Shop 
                money={gameState.money} 
                activeItem={activeShopItem} 
                onSelectItem={handleShopSelect} 
            />

            {/* Main 3D View */}
            <div className="flex-1 relative">
                <GameScene 
                    gridSize={currentLocation.gridSize}
                    items={currentLocation.items}
                    placementMode={activeShopItem}
                    toolMode={toolMode}
                    onPlaceItem={handlePlaceItem}
                    onItemClick={handleItemClick}
                />
                
                {/* Floating Location Header */}
                <div className="absolute top-4 left-6 pointer-events-none">
                     <h1 className="text-3xl font-bold text-white drop-shadow-md">{currentLocation.name}</h1>
                     <p className="text-slate-300 drop-shadow-sm text-sm">
                        Capacidade: {currentLocation.items.length} / {currentLocation.gridSize * currentLocation.gridSize} slots
                     </p>
                </div>

                {/* Toolbar */}
                <Toolbar currentMode={toolMode} setMode={handleSetToolMode} />

                {/* Right Side Control Panel */}
                <ControlPanel 
                    state={gameState}
                    locations={gameState.locations}
                    onUnlockAlgo={handleUnlockAlgo}
                    onSetAlgo={handleSetAlgo}
                    onSwitchLoc={(id) => setGameState(p => ({ ...p, currentLocationId: id }))}
                    onBuyLoc={handleBuyLocation}
                    onHire={handleHireEmployee}
                    onRename={handleRenameCompany}
                    onIPO={handleIPO}
                    onSignContract={handleSignContract}
                    computeTotal={stats.totalCompute}
                />

                {/* Tutorial / CTA */}
                {currentLocation.items.length === 0 && (
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-blue-600/90 backdrop-blur text-white px-8 py-4 rounded-xl shadow-xl animate-pulse pointer-events-none z-20 text-center">
                        <p className="font-bold text-lg">Bem-vindo CEO!</p>
                        <p className="text-sm">Construa sua infraestrutura e feche contratos na aba <span className="font-bold">Empresa</span>.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default App;