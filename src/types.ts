export type ShoppingCategory = 'food' | 'beverage' | 'decor' | 'tableware' | 'entertainment';

export type StoreType = 
  | 'wholesale' 
  | 'supermarket' 
  | 'party_store' 
  | 'dollar_store' 
  | 'liquor_store' 
  | 'specialty';

export type CUJStep = 'define' | 'review' | 'refine_checkout';

export interface ShoppingItem {
  id: string;
  name: string;
  category: ShoppingCategory;
  quantity: number;
  unit: string;
  estimatedPrice: number; // per unit cost
  estimatedTotal: number;
  storeType: StoreType;
  priority: 'essential' | 'recommended' | 'optional';
  purchased: boolean;
  dietaryTags?: string[];
  notes?: string;
  aisle?: string;
  isCymbalSelect?: boolean;
}

export interface PartyPlan {
  id: string;
  title: string;
  eventType: string;
  theme: string;
  date: string;
  startTime: string;
  durationHours: number;
  adultCount: number;
  kidCount: number;
  locationType: 'indoor' | 'backyard' | 'park' | 'venue';
  budget: number;
  dietaryRestrictions: string[];
  customNotes: string;
  specialRequests?: string;
}

export type FulfillmentMethod = 'pickup' | 'delivery' | 'instore';

export interface CheckoutDetails {
  fulfillmentMethod: FulfillmentMethod;
  fulfillmentTime: string;
  storeLocation: string;
  deliveryAddress?: string;
  specialInstructions?: string;
  orderPlaced: boolean;
  orderNumber?: string;
  orderDate?: string;
  totalCharged?: number;
}

export interface ConsumptionEstimates {
  totalGuests: number;
  drinksTotal: number;
  alcoholicDrinks: number;
  nonAlcoholicDrinks: number;
  icePounds: number;
  mainPortions: number;
  appetizerPieces: number;
  dessertPortions: number;
  napkinsCount: number;
  platesCount: number;
  cupsCount: number;
}

export interface AgentAction {
  type: 'add_items' | 'remove_items' | 'update_budget' | 'update_quantities' | 'swap_items';
  label: string;
  description?: string;
  itemsToAdd?: ShoppingItem[];
  itemIdsToRemove?: string[];
  budgetUpdate?: number;
  itemsToUpdate?: Partial<ShoppingItem>[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: AgentAction[];
  isThinking?: boolean;
}

export interface BudgetOptimizationSuggestion {
  category: string;
  title: string;
  potentialSavings: number;
  explanation: string;
  recommendedSwap?: {
    removeName: string;
    addName: string;
    costDiff: number;
  };
}

export interface DietaryScanAlert {
  dietaryType: string;
  status: 'covered' | 'missing' | 'warning';
  message: string;
  recommendations: string[];
}
