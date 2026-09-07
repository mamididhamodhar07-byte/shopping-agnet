import React, { useState } from 'react';
import { Share2, Copy, Check, Printer, X, Download } from 'lucide-react';
import { PartyPlan, ShoppingItem } from '../types';
import { formatCurrency } from '../utils/calculator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
  items: ShoppingItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  plan,
  items,
}) => {
  const [copied, setCopied] = useState(false);
  const [groupBy, setGroupBy] = useState<'store' | 'category'>('store');

  if (!isOpen) return null;

  const totalCost = items.reduce((sum, item) => sum + (item.estimatedTotal || 0), 0);

  // Generate formatted text
  const generateFormattedText = () => {
    let output = `🛒 PARTY SHOPPING CHECKLIST: ${plan.title}\n`;
    output += `📅 Date: ${plan.date} at ${plan.startTime} (${plan.durationHours} hrs)\n`;
    output += `👥 Guests: ${plan.adultCount + plan.kidCount} (${plan.adultCount} adults, ${plan.kidCount} kids)\n`;
    output += `💰 Est. Total: ${formatCurrency(totalCost)} / Target Budget: ${formatCurrency(plan.budget)}\n\n`;

    if (groupBy === 'store') {
      const storeGroups: Record<string, ShoppingItem[]> = {};
      items.forEach((it) => {
        storeGroups[it.storeType] = storeGroups[it.storeType] || [];
        storeGroups[it.storeType].push(it);
      });

      Object.entries(storeGroups).forEach(([store, storeItems]) => {
        const storeSubtotal = storeItems.reduce((acc, it) => acc + (it.estimatedTotal || 0), 0);
        output += `🏬 === ${store.toUpperCase().replace('_', ' ')} (Est. ${formatCurrency(storeSubtotal)}) ===\n`;
        storeItems.forEach((it) => {
          const check = it.purchased ? '[x]' : '[ ]';
          output += `${check} ${it.name} - ${it.quantity} ${it.unit} (~${formatCurrency(it.estimatedTotal)})\n`;
          if (it.notes) output += `    Note: ${it.notes}\n`;
        });
        output += '\n';
      });
    } else {
      const catGroups: Record<string, ShoppingItem[]> = {};
      items.forEach((it) => {
        catGroups[it.category] = catGroups[it.category] || [];
        catGroups[it.category].push(it);
      });

      Object.entries(catGroups).forEach(([cat, catItems]) => {
        const catSubtotal = catItems.reduce((acc, it) => acc + (it.estimatedTotal || 0), 0);
        output += `📂 === ${cat.toUpperCase()} (Est. ${formatCurrency(catSubtotal)}) ===\n`;
        catItems.forEach((it) => {
          const check = it.purchased ? '[x]' : '[ ]';
          output += `${check} ${it.name} - ${it.quantity} ${it.unit} (~${formatCurrency(it.estimatedTotal)}) [${it.storeType}]\n`;
          if (it.notes) output += `    Note: ${it.notes}\n`;
        });
        output += '\n';
      });
    }

    return output;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateFormattedText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-neutral-200 p-6 text-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-neutral-100 text-neutral-800">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">
                Export & Share Shopping List
              </h3>
              <p className="text-xs text-neutral-500">
                Ready for messaging to a partner, printing for store runs, or taking on mobile.
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

        {/* Group By Selector */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-neutral-600">Group list by:</span>
            <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-100 p-0.5">
              <button
                onClick={() => setGroupBy('store')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  groupBy === 'store' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Store Trip (Costco, Grocery, etc.)
              </button>
              <button
                onClick={() => setGroupBy('category')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  groupBy === 'category' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Item Category
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Text
                </>
              )}
            </button>
          </div>
        </div>

        {/* Formatted Text Preview */}
        <div className="mt-3">
          <textarea
            readOnly
            value={generateFormattedText()}
            rows={14}
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50/70 p-4 font-mono text-xs text-neutral-800 focus:outline-none selection:bg-rose-200"
          />
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
