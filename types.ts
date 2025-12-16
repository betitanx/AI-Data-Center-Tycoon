export enum ItemType {
  // --- COMPUTE ---
  GPU_A100 = 'GPU_A100', // Entry level
  GPU_H100 = 'GPU_H100', // High end standard
  GPU_B200 = 'GPU_B200', // Blackwell architecture
  RACK_HGX_H200 = 'RACK_HGX_H200', // Dense Rack
  RACK_GB200_NVL72 = 'RACK_GB200_NVL72', // The "Superchip" rack
  TPU_V5P = 'TPU_V5P', // Specialized Google chip
  TPU_V6_TRILIUM = 'TPU_V6_TRILIUM', // Future tech

  // --- COOLING ---
  COOLING_CRAC_STD = 'COOLING_CRAC_STD',
  COOLING_IN_ROW = 'COOLING_IN_ROW',
  COOLING_IMMERSION_TANK = 'COOLING_IMMERSION_TANK',
  COOLING_CRYOGENIC = 'COOLING_CRYOGENIC',

  // --- POWER ---
  POWER_DIESEL_GEN = 'POWER_DIESEL_GEN',
  POWER_TESLA_PACK = 'POWER_TESLA_PACK',
  POWER_SOLAR_ARRAY = 'POWER_SOLAR_ARRAY',
  POWER_WIND_TURBINE = 'POWER_WIND_TURBINE',
  POWER_HYDRO_STATION = 'POWER_HYDRO_STATION',
  POWER_SMR_NUCLEAR = 'POWER_SMR_NUCLEAR' // Small Modular Reactor
}

export enum ToolMode {
  BUILD = 'BUILD',
  MOVE = 'MOVE',
  SELL = 'SELL'
}

export interface ItemStats {
  id: ItemType;
  name: string;
  description: string;
  cost: number;
  type: 'COMPUTE' | 'COOLING' | 'POWER';
  
  // Stats
  compute?: number; // TFLOPS
  heatGen?: number; // Thermal Units generated per tick
  energyCons?: number; // kW consumed
  
  cooling?: number; // Thermal Units removed
  
  energyProv?: number; // kW provided
  
  maintenance?: number; // Cost per tick to operate
  
  color: string;
  height: number;
  modelType?: 'BOX' | 'RACK' | 'SOLAR' | 'WIND' | 'TANK' | 'REACTOR';
}

export interface GridItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  rotation: number;
}

export interface Location {
  id: string;
  name: string;
  gridSize: number;
  items: GridItem[];
  unlocked: boolean;
  cost: number;
}

export enum AlgorithmType {
  BASIC_INFERENCE = 'BASIC_INFERENCE',
  TRAINING_LLM = 'TRAINING_LLM',
  CRYPTO_MINING = 'CRYPTO_MINING',
  SCIENTIFIC_SIM = 'SCIENTIFIC_SIM',
  AGI_RESEARCH = 'AGI_RESEARCH'
}

export interface Algorithm {
  id: AlgorithmType;
  name: string;
  description: string;
  revenuePerFlops: number; // Base $ per TFLOP
  energyPenalty: number; // Energy usage multiplier
  heatPenalty: number; // Heat generation multiplier
  unlockCost: number;
}

export interface Contract {
  id: string;
  clientName: string;
  description: string;
  requiredFlops: number;
  requiredEmployees: number; // New Requirement
  durationTicks: number; // How long the contract lasts
  totalValue: number; // Total payout (paid upfront or over time)
  penalty: number; // Fine if FLOPs drop below requirement
  type: 'RETENTION' | 'TRAINING_RUN';
}

export interface CompanyState {
  name: string;
  isPublic: boolean; // IPO status
  stockPrice: number;
  ipoPrice?: number; // Stores the initial price at IPO for fluctuation logic
  sharesOutstanding: number;
  valuation: number;
  employees: number;
  reputation: number; // 0-100, affects contract offers
  activeContracts: Contract[];
  availableContracts: Contract[];
}

export interface GameState {
  money: number;
  locations: Location[];
  currentLocationId: string;
  unlockedAlgorithms: AlgorithmType[];
  activeAlgorithm: AlgorithmType;
  lastTick: number;
  company: CompanyState;
}