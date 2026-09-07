import React from 'react';
import { 
  ClipboardEdit, 
  CheckCircle2, 
  Scale, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { PartyPlan, ShoppingItem, CUJStep } from '../types';
import { formatCurrency } from '../utils/calculator';

interface CUJStepBannerProps {
  currentStep: CUJStep;
  onSelectStep: (step: CUJStep) => void;
  plan: PartyPlan;
  items: ShoppingItem[];
  onOpenPlanModal: () => void;
  onOpenBudgetModal: () => void;
  onOpenCheckoutModal: () => void;
}

export const CUJStepBanner: React.FC<CUJStepBannerProps> = ({
  currentStep,
  onSelectStep,
  plan,
  items,
  onOpenPlanModal,
  onOpenBudgetModal,
  onOpenCheckoutModal,
}) => {
  const totalCost = items.reduce((sum, item) => sum + (item.estimatedTotal || 0), 0);
  const isOverBudget = totalCost > plan.budget;
  const budgetRatio = plan.budget > 0 ? Math.round((totalCost / plan.budget) * 100) : 0;
  const essentialsCount = items.filter((it) => it.priority === 'essential').length;

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-2xs">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Step 1: Define Event */}
        <button
          type="button"
          onClick={() => {
            onSelectStep('define');
            onOpenPlanModal();
          }}
          className={`flex-1 text-left p-3 rounded-xl border transition-all cursor-pointer ${
            currentStep === 'define'
              ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
              Task 1
            </span>
            <ClipboardEdit className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="mt-1 font-bold text-sm text-neutral-900">Define Event</div>
          <div className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
            {plan.eventType} • {plan.adultCount + plan.kidCount} guests • {plan.theme}
          </div>
        </button>

        <div className="hidden md:flex items-center text-neutral-300">
          <ArrowRight className="h-4 w-4" />
        </div>

        {/* Step 2: Review List */}
        <button
          type="button"
          onClick={() => {
            onSelectStep('review');
          }}
          className={`flex-1 text-left p-3 rounded-xl border transition-all cursor-pointer ${
            currentStep === 'review'
              ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
              Task 2
            </span>
            <Scale className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-bold text-sm text-neutral-900">Review List</span>
            <span className={`text-xs font-bold ${isOverBudget ? 'text-rose-600' : 'text-emerald-700'}`}>
              {formatCurrency(totalCost)} / {formatCurrency(plan.budget)}
            </span>
          </div>
          <div className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
            {items.length} items ({essentialsCount} essentials) • {budgetRatio}% budget aligned
          </div>
        </button>

        <div className="hidden md:flex items-center text-neutral-300">
          <ArrowRight className="h-4 w-4" />
        </div>

        {/* Step 3: Refine & Checkout */}
        <button
          type="button"
          onClick={() => {
            onSelectStep('refine_checkout');
            onOpenCheckoutModal();
          }}
          className={`flex-1 text-left p-3 rounded-xl border transition-all cursor-pointer ${
            currentStep === 'refine_checkout'
              ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20'
              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
              Task 3
            </span>
            <ShoppingBag className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-bold text-sm text-neutral-900">Refine & Checkout</span>
            <span className="text-[10px] font-bold uppercase bg-neutral-900 text-white px-2 py-0.5 rounded-full">
              Finalize
            </span>
          </div>
          <div className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
            Adjust constraints, verify allergens & choose CymbalMart pickup/delivery
          </div>
        </button>
      </div>
    </div>
  );
};
