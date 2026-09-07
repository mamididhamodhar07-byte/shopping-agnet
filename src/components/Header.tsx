import React from 'react';
import { Sparkles, Calendar, Plus, Share2, DollarSign, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import { PartyPlan, ShoppingItem } from '../types';
import { PARTY_PRESETS } from '../data/presets';
import { formatCurrency } from '../utils/calculator';

interface HeaderProps {
  plan: PartyPlan;
  items: ShoppingItem[];
  onSelectPreset: (presetId: string) => void;
  onOpenNewPlanModal: () => void;
  onOpenExportModal: () => void;
  onOpenBudgetModal: () => void;
  onOpenDietaryModal: () => void;
  onOpenCheckoutModal?: () => void;
  activeTab: 'shopping' | 'chat' | 'stores';
  setActiveTab: (tab: 'shopping' | 'chat' | 'stores') => void;
  isAgentOpen: boolean;
  setIsAgentOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  plan,
  items,
  onSelectPreset,
  onOpenNewPlanModal,
  onOpenExportModal,
  onOpenBudgetModal,
  onOpenDietaryModal,
  onOpenCheckoutModal,
  activeTab,
  setActiveTab,
  isAgentOpen,
  setIsAgentOpen,
}) => {
  const totalCost = items.reduce((sum, item) => sum + (item.estimatedTotal || 0), 0);
  const purchasedCost = items
    .filter((it) => it.purchased)
    .reduce((sum, item) => sum + (item.estimatedTotal || 0), 0);
  const isOverBudget = totalCost > plan.budget;
  const budgetRatio = plan.budget > 0 ? Math.min(100, Math.round((totalCost / plan.budget) * 100)) : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo & Presets */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-sm shadow-rose-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-black text-neutral-900 sm:text-lg tracking-tight">
                  <span className="text-rose-600">Cymbal</span>Mart Party Planner
                </h1>
                <span className="hidden sm:inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                  Shopping Agent
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="truncate font-medium text-neutral-700">{plan.title}</span>
                <span className="text-neutral-300">•</span>
                <div className="relative inline-block group">
                  <select
                    id="preset-selector"
                    aria-label="Select Party Preset"
                    className="cursor-pointer bg-transparent text-xs font-medium text-amber-700 hover:text-amber-800 underline decoration-dashed decoration-amber-400 focus:outline-none"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        onSelectPreset(e.target.value);
                      }
                    }}
                  >
                    <option value="" disabled>
                      Switch Preset...
                    </option>
                    {PARTY_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Widget */}
          <div
            id="budget-widget-card"
            onClick={onOpenBudgetModal}
            className="hidden md:flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50/80 px-3.5 py-1.5 cursor-pointer hover:bg-neutral-100 transition-colors"
            title="Click to view AI Budget Optimization"
          >
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400">
                Budget Target
              </span>
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <span className={isOverBudget ? 'text-rose-600' : 'text-neutral-900'}>
                  {formatCurrency(totalCost)}
                </span>
                <span className="text-xs text-neutral-400">/ {formatCurrency(plan.budget)}</span>
              </div>
            </div>

            <div className="w-20">
              <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isOverBudget ? 'bg-rose-500' : budgetRatio > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, budgetRatio)}%` }}
                />
              </div>
              <div className="mt-0.5 text-[10px] text-right font-medium text-neutral-500">
                {budgetRatio}%
              </div>
            </div>

            {isOverBudget ? (
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="ai-agent-toggle-btn"
              onClick={() => setIsAgentOpen(!isAgentOpen)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition-all shadow-sm ${
                isAgentOpen
                  ? 'bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
              title="Open CymbalMart Assistant Chatbot"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">CymbalMart Assistant</span>
              <span className="sm:hidden">Assistant</span>
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>

            <button
              id="btn-export-list"
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
              title="Export, Print or Share Shopping Checklist"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden lg:inline">Export / Print</span>
            </button>

            {onOpenCheckoutModal && (
              <button
                id="btn-header-checkout"
                onClick={onOpenCheckoutModal}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                title="Step 3: Refine & Checkout"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Checkout</span>
              </button>
            )}

            <button
              id="btn-new-plan"
              onClick={onOpenNewPlanModal}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Party</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation / Tabs */}
        <div className="flex md:hidden border-t border-neutral-100 py-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('shopping')}
            className={`flex-1 rounded-lg py-1.5 font-semibold text-center transition-colors ${
              activeTab === 'shopping' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            Shopping List ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`flex-1 rounded-lg py-1.5 font-semibold text-center transition-colors ${
              activeTab === 'stores' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            By Store
          </button>
          <button
            onClick={() => {
              setActiveTab('chat');
              setIsAgentOpen(true);
            }}
            className={`flex-1 rounded-lg py-1.5 font-semibold text-center transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'chat' || isAgentOpen ? 'bg-rose-600 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            Assistant
          </button>
          <button
            onClick={onOpenBudgetModal}
            className="flex-1 rounded-lg bg-neutral-100 py-1.5 font-semibold text-center text-neutral-700 flex items-center justify-center gap-1"
          >
            <DollarSign className="h-3 w-3" />
            {formatCurrency(totalCost)}
          </button>
        </div>
      </div>
    </header>
  );
};
