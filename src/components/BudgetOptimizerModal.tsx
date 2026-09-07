import React, { useState } from 'react';
import { 
  TrendingDown, 
  DollarSign, 
  X, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Layers,
  Scissors
} from 'lucide-react';
import { PartyPlan, ShoppingItem, BudgetOptimizationSuggestion } from '../types';
import { formatCurrency } from '../utils/calculator';

interface BudgetOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
  items: ShoppingItem[];
  onApplySwap?: (removeName: string, addName: string, costDiff: number) => void;
  onRemoveOptionalItems: () => void;
}

export const BudgetOptimizerModal: React.FC<BudgetOptimizerModalProps> = ({
  isOpen,
  onClose,
  plan,
  items,
  onRemoveOptionalItems,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    summary: string;
    suggestions: BudgetOptimizationSuggestion[];
  } | null>(null);

  if (!isOpen) return null;

  const totalCost = items.reduce((acc, it) => acc + (it.estimatedTotal || 0), 0);
  const isOver = totalCost > plan.budget;
  const difference = Math.abs(totalCost - plan.budget);
  const optionalItems = items.filter((it) => it.priority === 'optional');
  const optionalSum = optionalItems.reduce((acc, it) => acc + (it.estimatedTotal || 0), 0);

  const fetchOptimizations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/agent/optimize-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, items }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAnalysis(json.data);
      }
    } catch (err) {
      console.error('Failed to optimize budget', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-neutral-200 p-6 text-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">
                AI Budget Optimizer & Swaps
              </h3>
              <p className="text-xs text-neutral-500">
                Smart cost-cutting strategies without diminishing the guest experience.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Budget Status Card */}
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">
                Cart Total
              </span>
              <div className="text-2xl font-black text-neutral-900">
                {formatCurrency(totalCost)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">
                Budget Target
              </span>
              <div className="text-2xl font-black text-neutral-900">
                {formatCurrency(plan.budget)}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isOver ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (totalCost / plan.budget) * 100)}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs font-semibold">
              <span className={isOver ? 'text-rose-600 flex items-center gap-1' : 'text-emerald-700'}>
                {isOver ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5" />
                    Over target by {formatCurrency(difference)}
                  </>
                ) : (
                  `Under budget by ${formatCurrency(difference)}`
                )}
              </span>
              <span className="text-neutral-500">
                {items.length} items planned
              </span>
            </div>
          </div>
        </div>

        {/* Quick Trim Action */}
        {optionalItems.length > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <Scissors className="h-4 w-4 text-amber-600" />
              <span>
                Found <strong>{optionalItems.length} optional items</strong> worth{' '}
                <strong>{formatCurrency(optionalSum)}</strong>.
              </span>
            </div>
            <button
              onClick={() => {
                onRemoveOptionalItems();
                onClose();
              }}
              className="rounded-lg bg-amber-700 px-2.5 py-1 font-semibold text-white hover:bg-amber-800 transition-colors shrink-0"
            >
              Trim Optional Items
            </button>
          </div>
        )}

        {/* AI Recommendations Area */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              AI Smart Saving Opportunities
            </h4>
            {!analysis && !isLoading && (
              <button
                onClick={fetchOptimizations}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Run AI Optimization Scan
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-neutral-200 p-8 text-center bg-neutral-50/50">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-rose-600 mb-2" />
              <p className="text-xs text-neutral-600 font-medium">
                Gemini is analyzing item categories, bulk wholesale substitutions, and portion tradeoffs...
              </p>
            </div>
          ) : analysis ? (
            <div className="space-y-3">
              <p className="text-xs text-neutral-600 bg-neutral-100 p-2.5 rounded-xl">
                {analysis.summary}
              </p>

              <div className="space-y-2">
                {analysis.suggestions.map((sug, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-neutral-200 bg-white p-3 shadow-xs text-xs hover:border-neutral-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-neutral-900 text-sm">
                        {sug.title}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                        Save ~{formatCurrency(sug.potentialSavings)}
                      </span>
                    </div>

                    <p className="text-neutral-600 leading-relaxed text-xs">
                      {sug.explanation}
                    </p>

                    {sug.recommendedSwap && (
                      <div className="mt-2 flex items-center justify-between rounded-lg bg-neutral-50 border border-neutral-150 p-2 text-[11px]">
                        <span className="text-rose-700 font-medium">
                          Swap out: {sug.recommendedSwap.removeName}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-emerald-700 font-medium">
                          Swap in: {sug.recommendedSwap.addName}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-rose-500 mb-2" />
              <p className="text-xs text-neutral-600 mb-3">
                Click below to let our shopping agent scan your cart against wholesale bulk discounts, DIY beverage recipes, and decor cost-savers.
              </p>
              <button
                onClick={fetchOptimizations}
                className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                Analyze Cart for Savings
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 pt-3 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
