import { Algorithm, AlgorithmType, ItemStats, ItemType, Location } from './types';

export const TICK_RATE_MS = 1000;

// Economic Constants
export const COST_PER_KW = 2.00; // $ per kW per tick
export const COST_PER_THERMAL_UNIT = 0.03; 
export const EMPLOYEE_SALARY = 150; // $ per tick per employee
export const CONTRACT_GEN_CHANCE = 0.1; // Chance per tick to generate new contract

export const CATALOG: Record<ItemType, ItemStats> = {
  // --- COMPUTE ---
  [ItemType.GPU_A100]: {
    id: ItemType.GPU_A100,
    name: "Nvidia A100 (80GB)",
    description: "Cavalo de batalha clássico. Bom para começar.",
    cost: 1500, // Increased slightly
    type: 'COMPUTE',
    compute: 22, 
    heatGen: 10,
    energyCons: 0.5,
    color: '#64748b',
    height: 1,
    modelType: 'RACK'
  },
  [ItemType.GPU_H100]: {
    id: ItemType.GPU_H100,
    name: "Nvidia H100 Hopper",
    description: "Padrão da indústria para LLMs modernos.",
    cost: 8500, // Increased from 3200
    type: 'COMPUTE',
    compute: 90, 
    heatGen: 25,
    energyCons: 0.8,
    color: '#7c3aed',
    height: 1.1,
    modelType: 'RACK'
  },
  [ItemType.GPU_B200]: {
    id: ItemType.GPU_B200,
    name: "Nvidia B200 Blackwell",
    description: "A nova geração de densidade de IA.",
    cost: 28500, // Increased from 7500
    type: 'COMPUTE',
    compute: 250, 
    heatGen: 45,
    energyCons: 1.2,
    color: '#000000',
    height: 1.2,
    modelType: 'RACK'
  },
  [ItemType.TPU_V5P]: {
    id: ItemType.TPU_V5P,
    name: "Google TPU v5p Pod",
    description: "Hardware especializado em JAX/TensorFlow.",
    cost: 45000, // Increased from 11000
    type: 'COMPUTE',
    compute: 550,
    heatGen: 70,
    energyCons: 2.0,
    color: '#ea4335',
    height: 1,
    modelType: 'RACK'
  },
  [ItemType.RACK_HGX_H200]: {
    id: ItemType.RACK_HGX_H200,
    name: "HGX H200 Cluster",
    description: "Cluster de alta memória para inferência massiva.",
    cost: 120000, // Increased from 42000
    type: 'COMPUTE',
    compute: 1100,
    heatGen: 100,
    energyCons: 9,
    color: '#2563eb',
    height: 1.3,
    modelType: 'RACK'
  },
  [ItemType.RACK_GB200_NVL72]: {
    id: ItemType.RACK_GB200_NVL72,
    name: "Nvidia GB200 NVL72",
    description: "Um supercomputador em escala de rack.",
    cost: 650000, // Increased from 200000
    type: 'COMPUTE',
    compute: 7000,
    heatGen: 600,
    energyCons: 100,
    color: '#10b981',
    height: 1.8,
    modelType: 'RACK'
  },
  [ItemType.TPU_V6_TRILIUM]: {
    id: ItemType.TPU_V6_TRILIUM,
    name: "TPU Trillium V6",
    description: "Protótipo futuro de eficiência energética.",
    cost: 1200000, // Increased significantly
    type: 'COMPUTE',
    compute: 13500,
    heatGen: 1000,
    energyCons: 180,
    color: '#fbbc04',
    height: 1.5,
    modelType: 'RACK'
  },

  // --- COOLING ---
  [ItemType.COOLING_CRAC_STD]: {
    id: ItemType.COOLING_CRAC_STD,
    name: "CRAC Standard",
    description: "Ar condicionado básico. Essencial.",
    cost: 2000,
    type: 'COOLING',
    cooling: 120,
    energyCons: 3,
    maintenance: 5, 
    color: '#94a3b8',
    height: 1,
    modelType: 'BOX'
  },
  [ItemType.COOLING_IN_ROW]: {
    id: ItemType.COOLING_IN_ROW,
    name: "Resfriamento In-Row",
    description: "Alta eficiência para corredores quentes.",
    cost: 6500,
    type: 'COOLING',
    cooling: 400,
    energyCons: 8,
    maintenance: 15,
    color: '#38bdf8',
    height: 1.2,
    modelType: 'BOX'
  },
  [ItemType.COOLING_IMMERSION_TANK]: {
    id: ItemType.COOLING_IMMERSION_TANK,
    name: "Tanque de Imersão",
    description: "Resfriamento líquido de alta performance.",
    cost: 25000,
    type: 'COOLING',
    cooling: 1800,
    energyCons: 15,
    maintenance: 50,
    color: '#0ea5e9',
    height: 0.8,
    modelType: 'TANK'
  },
  [ItemType.COOLING_CRYOGENIC]: {
    id: ItemType.COOLING_CRYOGENIC,
    name: "Sistema Criogênico",
    description: "Zero absoluto para sistemas quânticos.",
    cost: 85000,
    type: 'COOLING',
    cooling: 6000,
    energyCons: 120,
    maintenance: 300,
    color: '#cffafe',
    height: 1.5,
    modelType: 'TANK'
  },

  // --- POWER ---
  [ItemType.POWER_DIESEL_GEN]: {
    id: ItemType.POWER_DIESEL_GEN,
    name: "Gerador Diesel",
    description: "Barato de instalar, custo médio de operação.",
    cost: 1500,
    type: 'POWER',
    energyProv: 150,
    heatGen: 15,
    maintenance: 12, 
    color: '#ca8a04',
    height: 1,
    modelType: 'BOX'
  },
  [ItemType.POWER_TESLA_PACK]: {
    id: ItemType.POWER_TESLA_PACK,
    name: "Megapack de Bateria",
    description: "Armazenamento limpo e silencioso.",
    cost: 8000,
    type: 'POWER',
    energyProv: 350,
    heatGen: 5,
    maintenance: 5,
    color: '#fff',
    height: 0.9,
    modelType: 'BOX'
  },
  [ItemType.POWER_SOLAR_ARRAY]: {
    id: ItemType.POWER_SOLAR_ARRAY,
    name: "Painel Solar Industrial",
    description: "Energia grátis após instalação.",
    cost: 15000,
    type: 'POWER',
    energyProv: 200,
    heatGen: 0,
    maintenance: 2,
    color: '#1e293b',
    height: 0.2,
    modelType: 'SOLAR'
  },
  [ItemType.POWER_WIND_TURBINE]: {
    id: ItemType.POWER_WIND_TURBINE,
    name: "Turbina Eólica",
    description: "Geração de alta voltagem.",
    cost: 35000,
    type: 'POWER',
    energyProv: 550,
    heatGen: 5,
    maintenance: 15,
    color: '#f1f5f9',
    height: 3,
    modelType: 'WIND'
  },
  [ItemType.POWER_HYDRO_STATION]: {
    id: ItemType.POWER_HYDRO_STATION,
    name: "Mini-Hidrelétrica",
    description: "Fluxo de energia constante e massivo.",
    cost: 250000,
    type: 'POWER',
    energyProv: 4500,
    heatGen: 20,
    maintenance: 150,
    color: '#1d4ed8',
    height: 1.5,
    modelType: 'BOX'
  },
  [ItemType.POWER_SMR_NUCLEAR]: {
    id: ItemType.POWER_SMR_NUCLEAR,
    name: "Reator Nuclear SMR",
    description: "Energia infinita, risco controlado.",
    cost: 1500000,
    type: 'POWER',
    energyProv: 45000,
    heatGen: 1500,
    maintenance: 5000,
    color: '#22c55e',
    height: 2,
    modelType: 'REACTOR'
  }
};

export const ALGORITHMS: Record<AlgorithmType, Algorithm> = {
  [AlgorithmType.BASIC_INFERENCE]: {
    id: AlgorithmType.BASIC_INFERENCE,
    name: "Inferência Básica (Chatbot)",
    description: "Baixo retorno, mas estável e seguro.",
    revenuePerFlops: 0.80, // Reduced from 1.50
    energyPenalty: 1.0,
    heatPenalty: 1.0,
    unlockCost: 0
  },
  [AlgorithmType.TRAINING_LLM]: {
    id: AlgorithmType.TRAINING_LLM,
    name: "Treinamento de LLM",
    description: "Uso intensivo de GPU. Lucro alto.",
    revenuePerFlops: 1.80, // Reduced from 2.80
    energyPenalty: 1.4,
    heatPenalty: 1.6,
    unlockCost: 15000
  },
  [AlgorithmType.CRYPTO_MINING]: {
    id: AlgorithmType.CRYPTO_MINING,
    name: "Mineração de Cripto",
    description: "Transforma eletricidade em dinheiro. Gera muito calor.",
    revenuePerFlops: 1.40, // Reduced from 2.10
    energyPenalty: 2.2,
    heatPenalty: 2.5,
    unlockCost: 8000
  },
  [AlgorithmType.SCIENTIFIC_SIM]: {
    id: AlgorithmType.SCIENTIFIC_SIM,
    name: "Simulação Científica",
    description: "Contratos de longo prazo. Eficiente.",
    revenuePerFlops: 1.50, // Reduced from 2.30
    energyPenalty: 1.1,
    heatPenalty: 1.1,
    unlockCost: 35000
  },
  [AlgorithmType.AGI_RESEARCH]: {
    id: AlgorithmType.AGI_RESEARCH,
    name: "Pesquisa de AGI",
    description: "O futuro. Retornos exponenciais.",
    revenuePerFlops: 4.50, // Reduced from 6.00
    energyPenalty: 2.5,
    heatPenalty: 2.5,
    unlockCost: 2000000
  }
};

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'loc_garage',
    name: 'Garagem de Startup',
    gridSize: 10,
    items: [],
    unlocked: true,
    cost: 0
  },
  {
    id: 'loc_warehouse',
    name: 'Galpão Logístico',
    gridSize: 20,
    items: [],
    unlocked: false,
    cost: 150000
  },
  {
    id: 'loc_underwater',
    name: 'Cápsula Submarina',
    gridSize: 30,
    items: [],
    unlocked: false,
    cost: 1000000
  },
  {
    id: 'loc_desert',
    name: 'Gigafactory no Deserto',
    gridSize: 50,
    items: [],
    unlocked: false,
    cost: 10000000
  }
];

export const CLIENT_NAMES = [
  "OpenAI", "Anthropic", "DeepMind", "Meta AI", "Tesla", 
  "Mistral", "Cohere", "Hugging Face", "Stability AI", "Midjourney",
  "Scale AI", "Databricks", "Snowflake", "Palantir", "Anduril"
];

export const CONTRACT_TASKS = [
  "Treinamento de GPT-5",
  "Inferência de Carro Autônomo",
  "Simulação de Dobra de Proteínas",
  "Geração de Vídeo 8K",
  "Análise de Dados Genômicos",
  "Renderização de Metaverso",
  "Fine-tuning de Modelo Financeiro"
];