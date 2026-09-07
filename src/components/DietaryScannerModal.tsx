import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Loader2, 
  Plus, 
  Utensils 
} from 'lucide-react';
import { PartyPlan, ShoppingItem, DietaryScanAlert } from '../types';

interface DietaryScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
  items: ShoppingItem[];
  onAddRecommendation: (item: Omit<ShoppingItem, 'id' | 'purchased'>) => void;
}

export const DietaryScannerModal: React.FC<DietaryScannerModalProps> = ({
  isOpen,
  onClose,
  plan,
  items,
  onAddRecommendation,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{
    overallStatus: 'safe' | 'needs_attention' | 'high_risk';
    summary: string;
    alerts: DietaryScanAlert[];
  } | null>(null);

  if (!isOpen) return null;

  const runDietaryScan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/agent/dietary-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, items }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setScanResult(json.data);
      }
    } catch (err) {
      console.error('Dietary scan failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'covered':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'missing':
      default:
        return <AlertTriangle className="h-4 w-4 text-rose-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-neutral-200 p-6 text-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">
                Dietary & Allergen Hospitality Scan
              </h3>
              <p className="text-xs text-neutral-500">
                Audits your food & beverage items to ensure all guests are cared for safely.
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

        {/* Current Stated Restrictions */}
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5 text-xs">
          <span className="font-semibold uppercase tracking-wider text-neutral-400 text-[10px]">
            Host's Stated Dietary Restrictions
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {plan.dietaryRestrictions && plan.dietaryRestrictions.length > 0 ? (
              plan.dietaryRestrictions.map((req, i) => (
                <span
                  key={i}
                  className="rounded-md bg-emerald-100/70 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200"
                >
                  {req}
                </span>
              ))
            ) : (
              <span className="text-neutral-500 italic">
                No specific restrictions added to event details yet.
              </span>
            )}
          </div>
        </div>

        {/* Scan Actions & Results */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Audit Findings
            </span>
            {!scanResult && !isLoading && (
              <button
                onClick={runDietaryScan}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Run Allergen Audit
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-neutral-200 p-8 text-center bg-neutral-50/50">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-600 mb-2" />
              <p className="text-xs text-neutral-600 font-medium">
                Scanning recipes, cross-contact hazards, and non-alcoholic options...
              </p>
            </div>
          ) : scanResult ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-neutral-100 p-3 text-xs text-neutral-700 leading-relaxed">
                {scanResult.summary}
              </div>

              <div className="space-y-2">
                {scanResult.alerts.map((alert, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-xs text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-neutral-900 text-sm">
                        {getStatusIcon(alert.status)}
                        <span>{alert.dietaryType}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          alert.status === 'covered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : alert.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    <p className="text-neutral-600">{alert.message}</p>

                    {alert.recommendations && alert.recommendations.length > 0 && (
                      <div className="mt-2 space-y-1 border-t border-neutral-100 pt-2">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">
                          Recommendations:
                        </span>
                        {alert.recommendations.map((rec, rIdx) => (
                          <div
                            key={rIdx}
                            className="flex items-center justify-between rounded-lg bg-emerald-50/50 px-2 py-1 text-[11px] text-emerald-900"
                          >
                            <span>• {rec}</span>
                            <button
                              onClick={() => {
                                onAddRecommendation({
                                  name: rec.replace(/^(Add|Consider)\s+/i, ''),
                                  category: 'food',
                                  storeType: 'supermarket',
                                  quantity: 1,
                                  unit: 'pack',
                                  estimatedPrice: 7.50,
                                  estimatedTotal: 7.50,
                                  priority: 'recommended',
                                  dietaryTags: [alert.dietaryType],
                                  notes: `Added for ${alert.dietaryType}`,
                                });
                              }}
                              className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-0.5 font-semibold text-white hover:bg-emerald-700 shadow-xs"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center">
              <ShieldCheck className="mx-auto h-6 w-6 text-emerald-600 mb-2" />
              <p className="text-xs text-neutral-600 mb-3">
                Run an audit to check if your food items cover all dietary restrictions without awkward gaps.
              </p>
              <button
                onClick={runDietaryScan}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors shadow-xs"
              >
                <Sparkles className="h-4 w-4 text-emerald-200" />
                Run Dietary Audit Now
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
