import React, { useState, useMemo } from 'react';
import { 
  ShoppingItem, 
  ShoppingCategory, 
  StoreType 
} from '../types';
import { 
  Check, 
  Plus, 
  Trash2, 
  Store, 
  Search, 
  Filter, 
  Utensils, 
  Wine, 
  Sparkles, 
  Layers, 
  Gamepad2,
  ChevronDown,
  ChevronUp,
  Tag,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '../utils/calculator';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onTogglePurchased: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'purchased'>) => void;
  viewMode: 'category' | 'aisle' | 'store';
  setViewMode: (mode: 'category' | 'aisle' | 'store') => void;
  planBudget?: number;
  onOpenBudgetOptimizer?: () => void;
  onOpenCheckoutModal?: () => void;
}

const CATEGORY_META: Record<ShoppingCategory, { label: string; icon: any; color: string; bg: string }> = {
  food: { label: 'Food & Catering', icon: Utensils, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  beverage: { label: 'Beverages & Bar', icon: Wine, color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
  decor: { label: 'Decor & Ambiance', icon: Sparkles, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  tableware: { label: 'Tableware & Disposables', icon: Layers, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  entertainment: { label: 'Games, Favors & Extras', icon: Gamepad2, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
};

const STORE_META: Record<StoreType, { label: string; badge: string; color: string }> = {
  wholesale: { label: 'Wholesale Club (Costco / Sam\'s)', badge: 'Wholesale', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  supermarket: { label: 'CymbalMart Supermarket', badge: 'CymbalMart', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  party_store: { label: 'Party Supply Store', badge: 'Party Store', color: 'bg-pink-50 text-pink-800 border-pink-200' },
  dollar_store: { label: 'Dollar Store / Discount', badge: 'Dollar Store', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  liquor_store: { label: 'Liquor / Wine Shop', badge: 'Liquor Store', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  specialty: { label: 'Specialty / Bakery', badge: 'Specialty', color: 'bg-orange-50 text-orange-800 border-orange-200' },
};

const CYMBAL_AISLES = [
  'Aisle 1 - Fresh Produce & Bakery',
  'Aisle 3 - Butcher & Deli Counter',
  'Aisle 6 - Beverages & Party Ice',
  'Aisle 8 - Cymbal Select Pantry & Snacks',
  'Aisle 11 - Tableware & Paper Goods',
  'Aisle 14 - Party Supplies & Decor',
  'General Grocery & Seasonal',
];

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  onTogglePurchased,
  onUpdateQuantity,
  onDeleteItem,
  onAddItem,
  viewMode,
  setViewMode,
  planBudget,
  onOpenBudgetOptimizer,
  onOpenCheckoutModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpurchased' | 'purchased' | 'essential'>('all');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // New item form states
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ShoppingCategory>('food');
  const [newStore, setNewStore] = useState<StoreType>('supermarket');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newUnit, setNewUnit] = useState('pack');
  const [newPrice, setNewPrice] = useState('8.00');
  const [newPriority, setNewPriority] = useState<'essential' | 'recommended' | 'optional'>('essential');
  const [newNotes, setNewNotes] = useState('');

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.dietaryTags && item.dietaryTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      if (!matchesSearch) return false;

      if (statusFilter === 'unpurchased') return !item.purchased;
      if (statusFilter === 'purchased') return item.purchased;
      if (statusFilter === 'essential') return item.priority === 'essential';

      return true;
    });
  }, [items, searchQuery, statusFilter]);

  const totalFilteredCost = filteredItems.reduce((acc, it) => acc + (it.estimatedTotal || 0), 0);
  const purchasedCount = items.filter((it) => it.purchased).length;

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const price = Math.max(0, parseFloat(newPrice) || 0);
    const qty = Math.max(1, newQuantity);

    onAddItem({
      name: newName.trim(),
      category: newCategory,
      storeType: newStore,
      quantity: qty,
      unit: newUnit.trim() || 'pack',
      estimatedPrice: price,
      estimatedTotal: price * qty,
      priority: newPriority,
      notes: newNotes.trim() || undefined,
      dietaryTags: [],
    });

    setNewName('');
    setNewPrice('8.00');
    setNewNotes('');
    setIsAddingItem(false);
  };

  // Group items by category
  const categoriesList: ShoppingCategory[] = ['food', 'beverage', 'tableware', 'decor', 'entertainment'];
  const storesList: StoreType[] = ['wholesale', 'supermarket', 'party_store', 'dollar_store', 'liquor_store', 'specialty'];

  return (
    <div className="space-y-4">
      {/* List Control Bar */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              id="search-items-input"
              type="text"
              placeholder="Search items, brands, dietary tags (e.g. GF, ice, cups)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 py-2 pl-9 pr-3 text-xs sm:text-sm placeholder:text-neutral-400 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* View Mode & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl border border-neutral-200 p-0.5 bg-neutral-100">
              <button
                onClick={() => setViewMode('category')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  viewMode === 'category'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                By Category
              </button>
              <button
                onClick={() => setViewMode('aisle')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  viewMode === 'aisle'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                By CymbalMart Aisle
              </button>
              <button
                onClick={() => setViewMode('store')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  viewMode === 'store'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                By Store Run
              </button>
            </div>

            {/* Status Filter */}
            <select
              aria-label="Filter items by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Items ({items.length})</option>
              <option value="unpurchased">To Buy ({items.length - purchasedCount})</option>
              <option value="purchased">Purchased ({purchasedCount})</option>
              <option value="essential">Must-Have / Essential</option>
            </select>

            {/* Quick Add Button */}
            <button
              id="btn-add-item-toggle"
              onClick={() => setIsAddingItem(!isAddingItem)}
              className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Progress pill indicator */}
        <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2.5 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">
              {purchasedCount} of {items.length} items checked
            </span>
            <span className="text-neutral-300">•</span>
            <span>Subtotal: <strong>{formatCurrency(totalFilteredCost)}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-24 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${items.length > 0 ? (purchasedCount / items.length) * 100 : 0}%` }}
              />
            </div>
            <span className="font-medium text-[11px] text-neutral-600">
              {items.length > 0 ? Math.round((purchasedCount / items.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* New Item Form Drawer */}
      {isAddingItem && (
        <form
          onSubmit={handleCreateItem}
          className="rounded-2xl border-2 border-rose-200 bg-rose-50/40 p-4 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Add Custom Shopping Item
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                Item Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sourdough burger buns, Party cups..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs sm:text-sm focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ShoppingCategory)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-2 py-2 text-xs focus:border-rose-500 focus:outline-none"
              >
                <option value="food">🍕 Food & Catering</option>
                <option value="beverage">🍹 Beverages & Bar</option>
                <option value="decor">🎈 Decor & Ambiance</option>
                <option value="tableware">🍽️ Tableware & Disposables</option>
                <option value="entertainment">🎲 Games & Extras</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                Store Recommendation
              </label>
              <select
                value={newStore}
                onChange={(e) => setNewStore(e.target.value as StoreType)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-2 py-2 text-xs focus:border-rose-500 focus:outline-none"
              >
                <option value="wholesale">Wholesale Club</option>
                <option value="supermarket">Supermarket</option>
                <option value="party_store">Party Supply Store</option>
                <option value="dollar_store">Dollar Store</option>
                <option value="liquor_store">Liquor Store</option>
                <option value="specialty">Specialty / Bakery</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                Quantity & Unit
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="1"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 rounded-xl border border-neutral-300 bg-white px-2 py-2 text-xs text-center focus:border-rose-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="pack, box, lbs"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="flex-1 rounded-xl border border-neutral-300 bg-white px-2 py-2 text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                Est. Unit Price ($)
              </label>
              <input
                type="number"
                step="0.25"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-2 py-2 text-xs focus:border-rose-500 focus:outline-none"
              >
                <option value="essential">Must-Have</option>
                <option value="recommended">Recommended</option>
                <option value="optional">Optional</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                Notes / Dietary
              </label>
              <input
                type="text"
                placeholder="e.g. GF, keep chilled"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="rounded-xl border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700"
            >
              Save to List
            </button>
          </div>
        </form>
      )}

      {/* Task 2: Review List & Budget Alignment Banner */}
      {planBudget !== undefined && (
        <div className="rounded-2xl border border-neutral-200 bg-gradient-to-r from-neutral-50 via-white to-neutral-50 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl flex items-center justify-center ${
                  totalFilteredCost > planBudget
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {totalFilteredCost > planBudget ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <Check className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                    CUJ Step 2 • Review List
                  </span>
                  <span className="text-xs font-semibold text-neutral-500">
                    Budget Target: {formatCurrency(planBudget)}
                  </span>
                </div>
                <div className="text-sm font-bold text-neutral-900 mt-0.5">
                  Cart Total: <span className={totalFilteredCost > planBudget ? 'text-rose-600' : 'text-emerald-700'}>{formatCurrency(totalFilteredCost)}</span>
                  {' '}
                  <span className="text-xs font-medium text-neutral-500">
                    {totalFilteredCost > planBudget
                      ? `(${formatCurrency(totalFilteredCost - planBudget)} over budget)`
                      : `(${formatCurrency(planBudget - totalFilteredCost)} remaining under budget)`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onOpenBudgetOptimizer && (
                <button
                  type="button"
                  onClick={onOpenBudgetOptimizer}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>Align with Budget</span>
                </button>
              )}

              {onOpenCheckoutModal && (
                <button
                  type="button"
                  onClick={onOpenCheckoutModal}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-xs"
                >
                  <span>Refine & Checkout</span>
                  <span>→</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Items Rendering: Grouped by Category, Aisle, or Store */}
      {viewMode === 'category' ? (
        <div className="space-y-4">
          {categoriesList.map((catKey) => {
            const catMeta = CATEGORY_META[catKey];
            const catItems = filteredItems.filter((it) => it.category === catKey);
            if (catItems.length === 0 && searchQuery) return null;

            const subtotal = catItems.reduce((acc, it) => acc + (it.estimatedTotal || 0), 0);
            const catPurchased = catItems.filter((it) => it.purchased).length;
            const Icon = catMeta.icon;

            return (
              <div
                key={catKey}
                className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-neutral-50/80 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${catMeta.bg}`}>
                      <Icon className={`h-4 w-4 ${catMeta.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900">
                        {catMeta.label}
                      </h3>
                      <span className="text-[11px] text-neutral-500">
                        {catPurchased}/{catItems.length} purchased
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm text-neutral-900">
                      {formatCurrency(subtotal)}
                    </div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      Subtotal
                    </span>
                  </div>
                </div>

                {/* Items in this category */}
                <div className="divide-y divide-neutral-100">
                  {catItems.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400">
                      No items in this category yet.
                    </div>
                  ) : (
                    catItems.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        onTogglePurchased={onTogglePurchased}
                        onUpdateQuantity={onUpdateQuantity}
                        onDeleteItem={onDeleteItem}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'aisle' ? (
        /* CymbalMart Aisle Walk Route View */
        <div className="space-y-4">
          {CYMBAL_AISLES.map((aisleName) => {
            const aisleItems = filteredItems.filter((it) => {
              if (aisleName.includes('General')) {
                return !it.aisle || !CYMBAL_AISLES.slice(0, 6).includes(it.aisle);
              }
              return it.aisle === aisleName;
            });

            if (aisleItems.length === 0) return null;

            const subtotal = aisleItems.reduce((acc, it) => acc + (it.estimatedTotal || 0), 0);
            const aislePurchased = aisleItems.filter((it) => it.purchased).length;

            return (
              <div
                key={aisleName}
                className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-neutral-50/80 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-neutral-900">
                          {aisleName}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-rose-100 text-rose-800">
                          CymbalMart In-Store Route
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        {aislePurchased}/{aisleItems.length} checked
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm text-neutral-900">
                      {formatCurrency(subtotal)}
                    </div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      Aisle Total
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-neutral-100">
                  {aisleItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onTogglePurchased={onTogglePurchased}
                      onUpdateQuantity={onUpdateQuantity}
                      onDeleteItem={onDeleteItem}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Store Run View */
        <div className="space-y-4">
          {storesList.map((storeKey) => {
            const storeMeta = STORE_META[storeKey];
            const storeItems = filteredItems.filter((it) => it.storeType === storeKey);
            if (storeItems.length === 0 && searchQuery) return null;

            const subtotal = storeItems.reduce((acc, it) => acc + (it.estimatedTotal || 0), 0);
            const storePurchased = storeItems.filter((it) => it.purchased).length;

            return (
              <div
                key={storeKey}
                className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs"
              >
                {/* Store Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-neutral-50/80 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-neutral-200/60 text-neutral-700">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-neutral-900">
                          {storeMeta.label}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${storeMeta.color}`}>
                          {storeMeta.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        {storePurchased}/{storeItems.length} checked
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm text-neutral-900">
                      {formatCurrency(subtotal)}
                    </div>
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                      Trip Total
                    </span>
                  </div>
                </div>

                {/* Items in this store */}
                <div className="divide-y divide-neutral-100">
                  {storeItems.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400">
                      No items tagged for this store.
                    </div>
                  ) : (
                    storeItems.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        onTogglePurchased={onTogglePurchased}
                        onUpdateQuantity={onUpdateQuantity}
                        onDeleteItem={onDeleteItem}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ItemRowProps {
  item: ShoppingItem;
  onTogglePurchased: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onDeleteItem: (id: string) => void;
}

const ItemRow: React.FC<ItemRowProps> = ({
  item,
  onTogglePurchased,
  onUpdateQuantity,
  onDeleteItem,
}) => {
  const storeBadge = STORE_META[item.storeType]?.badge || item.storeType;

  return (
    <div
      className={`flex items-center justify-between p-3 sm:p-4 gap-3 transition-colors ${
        item.purchased ? 'bg-neutral-50/60' : 'hover:bg-neutral-50/30'
      }`}
    >
      {/* Checkbox + Name & Info */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={() => onTogglePurchased(item.id)}
          className={`mt-0.5 sm:mt-0 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all ${
            item.purchased
              ? 'border-emerald-600 bg-emerald-600 text-white'
              : 'border-neutral-300 bg-white hover:border-neutral-400'
          }`}
          aria-label={`Mark ${item.name} as ${item.purchased ? 'unpurchased' : 'purchased'}`}
        >
          {item.purchased && <Check className="h-3.5 w-3.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-xs sm:text-sm font-semibold transition-all ${
                item.purchased ? 'line-through text-neutral-400' : 'text-neutral-900'
              }`}
            >
              {item.name}
            </span>

            {/* Cymbal Select Value Badge */}
            {item.isCymbalSelect && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                ★ Cymbal Select
              </span>
            )}

            {/* Aisle Tag */}
            {item.aisle && (
              <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                {item.aisle.split(' - ')[0]}
              </span>
            )}

            {/* Store Tag */}
            <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
              {storeBadge}
            </span>

            {/* Priority tag */}
            {item.priority === 'essential' && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Must-Have
              </span>
            )}
            {item.priority === 'optional' && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">
                Optional
              </span>
            )}

            {/* Dietary Tags */}
            {item.dietaryTags?.map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Notes or rationale */}
          {item.notes && (
            <p className="mt-0.5 text-[11px] text-neutral-500 italic truncate">
              {item.notes}
            </p>
          )}
        </div>
      </div>

      {/* Quantity adjustment & Price */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quantity Controls */}
        <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50 p-0.5 text-xs">
          <button
            type="button"
            disabled={item.quantity <= 1}
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
            className="h-5 w-5 rounded flex items-center justify-center text-neutral-600 hover:bg-neutral-200 disabled:opacity-30"
          >
            -
          </button>
          <span className="px-2 font-semibold text-neutral-800 text-[11px] whitespace-nowrap">
            {item.quantity} {item.unit}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="h-5 w-5 rounded flex items-center justify-center text-neutral-600 hover:bg-neutral-200"
          >
            +
          </button>
        </div>

        {/* Calculated Total Price */}
        <div className="text-right min-w-[70px]">
          <div
            className={`font-bold text-xs sm:text-sm ${
              item.purchased ? 'text-neutral-400 line-through' : 'text-neutral-900'
            }`}
          >
            {formatCurrency(item.estimatedTotal)}
          </div>
          <div className="text-[10px] text-neutral-400">
            {formatCurrency(item.estimatedPrice)}/ea
          </div>
        </div>

        {/* Delete Item button */}
        <button
          type="button"
          onClick={() => onDeleteItem(item.id)}
          className="rounded-lg p-1 text-neutral-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Remove from list"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
