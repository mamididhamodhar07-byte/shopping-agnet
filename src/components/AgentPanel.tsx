import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Plus, 
  Check, 
  ArrowRight, 
  X, 
  Loader2, 
  HelpCircle,
  Lightbulb,
  ShoppingBag,
  Store,
  RefreshCw,
  Trash2,
  Tag,
  MapPin
} from 'lucide-react';
import { PartyPlan, ShoppingItem, ChatMessage, AgentAction } from '../types';
import { formatCurrency } from '../utils/calculator';

interface AgentPanelProps {
  plan: PartyPlan;
  items: ShoppingItem[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onApplyAction: (action: AgentAction) => void;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

const QUICK_PROMPTS = [
  '🛒 Recommend Cymbal Select store brand savings',
  '📍 Which aisles are my party items located in?',
  '🧊 Calculate ice & drink needs for our hours',
  '🥦 Add vegetarian & allergy-safe crowd-pleasers',
  '💰 What can I trim or swap to save $35?',
  '🚗 How does CymbalMart Curbside Pickup work?',
];

export const AgentPanel: React.FC<AgentPanelProps> = ({
  plan,
  items,
  messages,
  onSendMessage,
  onApplyAction,
  isOpen,
  onClose,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const [appliedActionIds, setAppliedActionIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    await onSendMessage(text);
  };

  const handlePromptClick = async (prompt: string) => {
    if (isLoading) return;
    await onSendMessage(prompt);
  };

  const handleExecuteAction = (action: AgentAction, actionKey: string) => {
    onApplyAction(action);
    setAppliedActionIds((prev) => new Set(prev).add(actionKey));
  };

  if (!isOpen) return null;

  return (
    <aside className="flex flex-col h-full bg-white border-l border-neutral-200 shadow-xl w-full max-w-md shrink-0">
      {/* CymbalMart Assistant Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-200 bg-neutral-900 text-white">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-sm ring-2 ring-white/10">
            <Store className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-neutral-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm tracking-tight">CymbalMart Assistant</h3>
              <span className="rounded-full bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-rose-300 border border-rose-400/30">
                Official
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Customer Concierge • Aisles, Budget & Inventory
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          aria-label="Close CymbalMart Assistant"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Customer Quick Help Shortcuts */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-100/80 border-b border-neutral-200 text-xs gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handlePromptClick('Which aisles are my party items located in?')}
          disabled={isLoading}
          className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-neutral-700 border border-neutral-200 hover:border-rose-300 hover:text-rose-700 transition-colors shrink-0 shadow-2xs"
        >
          <MapPin className="h-3 w-3 text-rose-500" />
          <span>Aisles</span>
        </button>
        <button
          onClick={() => handlePromptClick('Recommend Cymbal Select store brand savings to reduce my cost')}
          disabled={isLoading}
          className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-neutral-700 border border-neutral-200 hover:border-rose-300 hover:text-rose-700 transition-colors shrink-0 shadow-2xs"
        >
          <Tag className="h-3 w-3 text-blue-600" />
          <span>Cymbal Select</span>
        </button>
        <button
          onClick={() => handlePromptClick('Calculate precise ice and drink requirements for our guests')}
          disabled={isLoading}
          className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-neutral-700 border border-neutral-200 hover:border-rose-300 hover:text-rose-700 transition-colors shrink-0 shadow-2xs"
        >
          <span>🧊 Ice Math</span>
        </button>
        <button
          onClick={() => handlePromptClick('What can I trim or swap to save $35 and stay on budget?')}
          disabled={isLoading}
          className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-neutral-700 border border-neutral-200 hover:border-rose-300 hover:text-rose-700 transition-colors shrink-0 shadow-2xs"
        >
          <span>💰 Save $35</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-neutral-50/50">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white text-[10px] font-black tracking-tighter mt-0.5 shadow-2xs">
                  CM
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                  isAssistant
                    ? 'bg-white border border-neutral-200/80 text-neutral-800 shadow-xs'
                    : 'bg-neutral-900 text-white rounded-br-none shadow-xs'
                }`}
              >
                {/* Assistant Label */}
                {isAssistant && (
                  <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-neutral-100 text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                    <Store className="h-3 w-3" />
                    <span>CymbalMart Assistant</span>
                  </div>
                )}

                {/* Content text */}
                <div className="whitespace-pre-line text-xs sm:text-sm">
                  {msg.content}
                </div>

                {/* Structured Agent Actions (if provided) */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-neutral-100 pt-2.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>One-Click List Actions:</span>
                    </span>

                    {msg.actions.map((act, index) => {
                      const actionKey = `${msg.id}-${index}`;
                      const isApplied = appliedActionIds.has(actionKey);

                      return (
                        <div
                          key={actionKey}
                          className="rounded-xl border border-rose-100 bg-rose-50/60 p-2.5 text-xs text-neutral-800"
                        >
                          <div className="font-semibold text-neutral-900 flex items-center justify-between">
                            <span>{act.label}</span>
                            {act.budgetUpdate && (
                              <span className="text-[11px] font-bold text-amber-800">
                                {act.budgetUpdate > 0 ? `+${formatCurrency(act.budgetUpdate)}` : formatCurrency(act.budgetUpdate)}
                              </span>
                            )}
                          </div>

                          {act.description && (
                            <p className="mt-0.5 text-[11px] text-neutral-600">
                              {act.description}
                            </p>
                          )}

                          {act.itemsToAdd && act.itemsToAdd.length > 0 && (
                            <div className="mt-1.5 space-y-1">
                              {act.itemsToAdd.map((it, i) => (
                                <div key={i} className="flex items-center justify-between text-[11px] text-neutral-600 bg-white/80 px-2 py-1 rounded-lg border border-rose-200/50">
                                  <div className="flex items-center gap-1 truncate">
                                    <span className="font-bold text-neutral-900">+{it.quantity} {it.unit}</span>
                                    <span className="truncate">{it.name}</span>
                                    {it.aisle && (
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-rose-100 text-rose-800 font-semibold">
                                        {it.aisle.split(' - ')[0]}
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-medium text-neutral-800 shrink-0 ml-1">{formatCurrency(it.estimatedTotal)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => handleExecuteAction(act, actionKey)}
                            disabled={isApplied}
                            className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 text-xs font-semibold transition-all ${
                              isApplied
                                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-600" />
                                Added to List
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3" />
                                Add to CymbalMart List
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div
                  className={`mt-1 text-[10px] ${
                    isAssistant ? 'text-neutral-400' : 'text-neutral-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isAssistant && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-200 text-neutral-700 text-xs font-bold mt-0.5">
                  Me
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white text-[10px] font-black tracking-tighter shadow-2xs">
              CM
            </div>
            <div className="rounded-2xl bg-white border border-neutral-200 p-3 shadow-xs flex items-center gap-2 text-xs text-neutral-600">
              <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
              <span>CymbalMart Assistant is checking aisles & inventory...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="border-t border-neutral-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 mb-1.5">
          <Lightbulb className="h-3 w-3 text-amber-500" />
          <span>Common Customer Questions:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(prompt)}
              disabled={isLoading}
              className="text-[11px] text-left rounded-lg bg-neutral-100 hover:bg-neutral-200/80 px-2 py-1 text-neutral-700 transition-colors shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-200 bg-white">
        <div className="relative flex items-center">
          <input
            id="agent-chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask CymbalMart Assistant: items, aisles, budget..."
            disabled={isLoading}
            className="w-full rounded-xl border border-neutral-300 bg-neutral-50 py-2.5 pl-3.5 pr-10 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white disabled:opacity-40 hover:bg-rose-700 transition-colors shadow-xs"
            aria-label="Send message to CymbalMart Assistant"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </aside>
  );
};

