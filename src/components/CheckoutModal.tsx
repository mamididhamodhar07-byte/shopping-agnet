import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShoppingBag, 
  Truck, 
  Store, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  Share2, 
  Copy, 
  Printer, 
  X, 
  ArrowRight,
  Receipt,
  QrCode
} from 'lucide-react';
import { PartyPlan, ShoppingItem, FulfillmentMethod, CheckoutDetails } from '../types';
import { formatCurrency } from '../utils/calculator';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
  items: ShoppingItem[];
  onOpenBudgetOptimizer: () => void;
  onOpenDietaryAudit?: () => void;
  onCompleteOrder?: (details: CheckoutDetails) => void;
  onRemoveOptionalItems?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  plan,
  items,
  onOpenBudgetOptimizer,
  onOpenDietaryAudit,
  onCompleteOrder,
  onRemoveOptionalItems,
}) => {
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('pickup');
  const [selectedStore, setSelectedStore] = useState('CymbalMart Supercenter #104 (750 Market Blvd)');
  const [deliveryAddress, setDeliveryAddress] = useState('124 Elm Street, Apt 4B');
  const [fulfillmentTime, setFulfillmentTime] = useState(
    plan.startTime ? `${plan.date} at ${plan.startTime.split(':')[0]}:00 (Pre-Party)` : 'Day of Party, 2 hours prior'
  );
  const [specialInstructions, setSpecialInstructions] = useState('Please pack ice bags in insulated tote and keep bakery boxes flat.');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalCost = items.reduce((sum, it) => sum + (it.estimatedTotal || 0), 0);
  const isOverBudget = totalCost > plan.budget;
  const budgetDiff = Math.abs(totalCost - plan.budget);
  const cymbalSelectItems = items.filter((it) => it.isCymbalSelect);
  const estimatedSavings = cymbalSelectItems.length > 0 
    ? cymbalSelectItems.reduce((acc, it) => acc + (it.estimatedTotal * 0.25), 0)
    : totalCost * 0.08;

  const handlePlaceOrder = () => {
    const generatedId = `CM-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);
    setIsOrderPlaced(true);
    if (onCompleteOrder) {
      onCompleteOrder({
        fulfillmentMethod,
        fulfillmentTime,
        storeLocation: selectedStore,
        deliveryAddress: fulfillmentMethod === 'delivery' ? deliveryAddress : undefined,
        specialInstructions,
        orderPlaced: true,
        orderNumber: generatedId,
        orderDate: new Date().toISOString(),
        totalCharged: totalCost,
      });
    }
  };

  const handleCopyReceipt = () => {
    const text = `🎉 CYMBALMART PARTY ORDER RECEIPT\nOrder #: ${orderId || 'CM-PENDING'}\nEvent: ${plan.title} (${plan.date} at ${plan.startTime})\nFulfillment: ${fulfillmentMethod.toUpperCase()} (${fulfillmentTime})\nTotal Items: ${items.length}\nEstimated Cost: ${formatCurrency(totalCost)}\n\nItems:\n${items.map((it) => `• [${it.aisle || it.category}] ${it.name} (${it.quantity} ${it.unit}) - ${formatCurrency(it.estimatedTotal)}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-neutral-200 p-6 sm:p-8 text-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-200">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                  {isOrderPlaced ? 'Order Confirmed!' : 'CUJ Step 3: Refine & Checkout'}
                </h3>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                  CymbalMart Express
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                {isOrderPlaced 
                  ? 'Your party groceries are scheduled for preparation.' 
                  : 'Review budget alignment, adjust constraints, and finalize your party fulfillment.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isOrderPlaced ? (
          <div className="mt-5 space-y-6">
            {/* Constraint & Budget Alignment Status Bar */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/60">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                    Budget Alignment Check
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xl font-black text-neutral-900">
                      {formatCurrency(totalCost)}
                    </span>
                    <span className="text-xs text-neutral-500">
                      of {formatCurrency(plan.budget)} budget
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border ${
                      isOverBudget
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isOverBudget ? (
                      `Over budget by ${formatCurrency(budgetDiff)}`
                    ) : (
                      `✓ Under budget by ${formatCurrency(budgetDiff)}`
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenBudgetOptimizer}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                  >
                    Refine Swaps
                  </button>
                </div>
              </div>

              {/* Constraint Checks Pill Grid */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 rounded-xl bg-white p-2.5 border border-neutral-200 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-neutral-800">{items.length} Items Selected</div>
                    <div className="text-[10px] text-neutral-500">
                      {items.filter(i => i.priority === 'essential').length} essentials
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white p-2.5 border border-neutral-200 shadow-2xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-neutral-800 truncate">
                      {plan.dietaryRestrictions && plan.dietaryRestrictions.length > 0 
                        ? `${plan.dietaryRestrictions.length} Dietary Checked` 
                        : 'No Dietary Limits'}
                    </div>
                    <button
                      onClick={onOpenDietaryAudit}
                      className="text-[10px] text-emerald-700 font-medium hover:underline text-left block"
                    >
                      Audit Allergen Safety
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-white p-2.5 border border-neutral-200 shadow-2xs">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <div className="font-semibold text-neutral-800">
                      ~{formatCurrency(estimatedSavings)} Saved
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Cymbal Select Value
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Choose Fulfillment Method */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                1. Select CymbalMart Fulfillment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod('pickup')}
                  className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all ${
                    fulfillmentMethod === 'pickup'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <Store className={`h-5 w-5 ${fulfillmentMethod === 'pickup' ? 'text-blue-600' : 'text-neutral-500'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      FREE
                    </span>
                  </div>
                  <span className="font-bold text-sm text-neutral-900">Curbside Pickup</span>
                  <span className="text-xs text-neutral-500 mt-0.5">
                    Ready 2 hours before party. Trunk-loaded by staff.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentMethod('delivery')}
                  className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all ${
                    fulfillmentMethod === 'delivery'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <Truck className={`h-5 w-5 ${fulfillmentMethod === 'delivery' ? 'text-blue-600' : 'text-neutral-500'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      SAME-DAY
                    </span>
                  </div>
                  <span className="font-bold text-sm text-neutral-900">Express Delivery</span>
                  <span className="text-xs text-neutral-500 mt-0.5">
                    Delivered directly to your party venue or home.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentMethod('instore')}
                  className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all ${
                    fulfillmentMethod === 'instore'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <Receipt className={`h-5 w-5 ${fulfillmentMethod === 'instore' ? 'text-blue-600' : 'text-neutral-500'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      SMART MAP
                    </span>
                  </div>
                  <span className="font-bold text-sm text-neutral-900">In-Store Navigator</span>
                  <span className="text-xs text-neutral-500 mt-0.5">
                    Walk aisles sequentially (Aisle 1 to Aisle 14).
                  </span>
                </button>
              </div>
            </div>

            {/* Fulfillment Configuration Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              {fulfillmentMethod === 'pickup' || fulfillmentMethod === 'instore' ? (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    CymbalMart Location
                  </label>
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 py-2 text-xs sm:text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="CymbalMart Supercenter #104 (750 Market Blvd)">
                      CymbalMart Supercenter #104 (750 Market Blvd) • 1.8 mi
                    </option>
                    <option value="CymbalMart Express #212 (410 Downtown Way)">
                      CymbalMart Express #212 (410 Downtown Way) • 3.2 mi
                    </option>
                    <option value="CymbalMart MegaMart #088 (1200 North Loop)">
                      CymbalMart MegaMart #088 (1200 North Loop) • 5.0 mi
                    </option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Street Address, Apt/Suite"
                    className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 py-2 text-xs sm:text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Target Timing Window
                </label>
                <input
                  type="text"
                  value={fulfillmentTime}
                  onChange={(e) => setFulfillmentTime(e.target.value)}
                  placeholder="e.g. Saturday 1:00 PM - 2:00 PM"
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 py-2 text-xs sm:text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Special Shopper Instructions */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Special Requests for Personal Shopper
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Choose firmer avocados, keep ice in separate cooler bag..."
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 py-2 text-xs sm:text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Order Summary & Final Total Bar */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-900 text-white p-5">
              <div className="flex items-center justify-between text-xs text-neutral-400 pb-3 border-b border-neutral-800">
                <span>Party Order: {plan.title}</span>
                <span>{plan.adultCount + plan.kidCount} guests ({plan.durationHours}h)</span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-neutral-400">Total Cart ({items.length} items)</div>
                  <div className="text-2xl font-black text-white">
                    {formatCurrency(totalCost)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Member Savings Applied
                  </div>
                  <div className="text-sm font-semibold text-emerald-400">
                    -{formatCurrency(estimatedSavings)}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-neutral-400">
                  Ready with CymbalMart Freshness Guarantee.
                </div>
                <button
                  type="button"
                  id="btn-finalize-cymbalmart-order"
                  onClick={handlePlaceOrder}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-900/40 hover:bg-blue-500 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Finalize Plan & Place Order
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Order Confirmed Screen */
          <div className="mt-6 space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Success • Order #{orderId}
              </span>
              <h4 className="mt-1 text-2xl font-black text-neutral-900">
                Party Shopping List Finalized!
              </h4>
              <p className="mt-1 text-xs text-neutral-500 max-w-md mx-auto">
                Your order has been transmitted to {selectedStore}. Your items are scheduled for {fulfillmentMethod === 'delivery' ? 'delivery' : 'curbside preparation'} on {fulfillmentTime}.
              </p>
            </div>

            {/* QR / Barcode Card */}
            <div className="mx-auto max-w-sm rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-center">
              <div className="flex justify-center text-neutral-800 mb-2">
                <QrCode className="h-28 w-28 text-neutral-900" />
              </div>
              <div className="font-mono text-xs font-bold text-neutral-700 tracking-wider">
                {orderId} • PASS-CODE: CYMBAL-HOST
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Show this code upon arrival at designated CymbalMart Curbside spots.
              </p>
            </div>

            {/* Action Buttons for Confirmed Order */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyReceipt}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Receipt Copied!' : 'Copy Packing Receipt'}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print Aisle Checklist
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-neutral-900 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-neutral-800 transition-colors"
              >
                Return to Planner
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
