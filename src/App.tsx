/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PartyPlan, ShoppingItem, ChatMessage, AgentAction, CUJStep, CheckoutDetails } from './types';
import { PARTY_PRESETS } from './data/presets';
import { Header } from './components/Header';
import { CUJStepBanner } from './components/CUJStepBanner';
import { PartyOverviewBar } from './components/PartyOverviewBar';
import { ShoppingListView } from './components/ShoppingListView';
import { AgentPanel } from './components/AgentPanel';
import { PlanModal } from './components/PlanModal';
import { BudgetOptimizerModal } from './components/BudgetOptimizerModal';
import { DietaryScannerModal } from './components/DietaryScannerModal';
import { ExportModal } from './components/ExportModal';
import { CheckoutModal } from './components/CheckoutModal';
import { Sparkles, Bot, Plus } from 'lucide-react';

const STORAGE_KEY_PLAN = 'party_planner_active_plan_v1';
const STORAGE_KEY_ITEMS = 'party_planner_active_items_v1';
const STORAGE_KEY_MESSAGES = 'party_planner_active_messages_v1';

export default function App() {
  // Initialize state with local storage or default preset
  const defaultPreset = PARTY_PRESETS[0];

  const [plan, setPlan] = useState<PartyPlan>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAN);
      return saved ? JSON.parse(saved) : defaultPreset.plan;
    } catch {
      return defaultPreset.plan;
    }
  });

  const [items, setItems] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      return saved ? JSON.parse(saved) : defaultPreset.initialItems;
    } catch {
      return defaultPreset.initialItems;
    }
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `👋 Hello and welcome to CymbalMart! I'm your **CymbalMart Assistant**.
I'm here as your store concierge to help you organize your shopping list for **${defaultPreset.plan.title}**, navigate our aisles, find money-saving **Cymbal Select** items, and keep you comfortably under your $${defaultPreset.plan.budget} budget.

**Here is how I can assist you today:**
• 🛒 **Aisle Navigation**: Ask where any grocery or party supply is located in our aisles (Aisle 1 Produce/Bakery to Aisle 14 Party Decor).
• 🧊 **Smart Party Calculations**: Precise ice, drink, portion, and tableware estimates for your ${defaultPreset.plan.adultCount + defaultPreset.plan.kidCount} guests.
• 💰 **Cymbal Select Savings**: Ask me to recommend private-label swaps to save 20-30% on snacks, drinks, and disposables.
• 🥗 **Special Diets & Allergies**: Need nut-free treats, vegan options, or gluten-free snack trays? Just ask!
• 🚗 **Curbside Pickup & Delivery**: Learn how our associates pack and stage your order with chilled storage.

How can I help you prepare for your event today?`,
        timestamp: 'Just now',
      },
    ];
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'shopping' | 'chat' | 'stores'>('shopping');
  const [viewMode, setViewMode] = useState<'category' | 'aisle' | 'store'>('category');
  const [cujStep, setCujStep] = useState<CUJStep>('review');
  const [isAgentOpen, setIsAgentOpen] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Modal visibility
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isDietaryModalOpen, setIsDietaryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Synchronize with local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAN, JSON.stringify(plan));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [plan]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [messages]);

  // Preset switch
  const handleSelectPreset = (presetId: string) => {
    const found = PARTY_PRESETS.find((p) => p.id === presetId);
    if (!found) return;

    setPlan(found.plan);
    setItems(found.initialItems);
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-preset-${Date.now()}`,
        role: 'assistant',
        content: `Switched to **${found.name}**! I've loaded ${found.initialItems.length} curated shopping items tailored for ${found.plan.adultCount + found.plan.kidCount} guests.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Agent chat handler
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          plan,
          items,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: json.data.reply || "I've reviewed your party details and updated the recommendations.",
          actions: json.data.actions || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(json.error || 'Agent did not return a response');
      }
    } catch (error: any) {
      console.error('Agent chat error:', error);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I couldn't reach the planning engine, but here is standard party rule of thumb: plan for 1.5 lbs of ice per guest, 2 drinks in the first hour and 1 per hour after, and 3-4 napkins per person. Let me know what specific items you want to adjust!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Execute structured action returned by Agent
  const handleApplyAction = (action: AgentAction) => {
    if (action.itemsToAdd && action.itemsToAdd.length > 0) {
      const formattedItems: ShoppingItem[] = action.itemsToAdd.map((it, idx) => ({
        ...it,
        id: `agent-add-${Date.now()}-${idx}`,
        purchased: false,
        estimatedTotal: (Number(it.estimatedPrice) || 0) * (Number(it.quantity) || 1),
      }));

      setItems((prev) => [...prev, ...formattedItems]);
    }

    if (action.itemIdsToRemove && action.itemIdsToRemove.length > 0) {
      setItems((prev) => prev.filter((it) => !action.itemIdsToRemove?.includes(it.id)));
    }

    if (action.budgetUpdate) {
      setPlan((prev) => ({
        ...prev,
        budget: Math.max(10, prev.budget + (action.budgetUpdate || 0)),
      }));
    }
  };

  // Generate full plan with AI
  const handleGenerateWithAI = async (planData: Partial<PartyPlan>) => {
    setIsGeneratingPlan(true);
    try {
      const payload = {
        ...plan,
        ...planData,
      };

      const res = await fetch('/api/agent/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const generated = json.data;

        const newPlan: PartyPlan = {
          ...payload,
          title: generated.partyTitle || payload.title,
          theme: generated.themeDescription || payload.theme,
        };

        const newItems: ShoppingItem[] = (generated.items || []).map((it: any, index: number) => ({
          id: `ai-gen-${Date.now()}-${index}`,
          name: it.name,
          category: it.category || 'food',
          storeType: it.storeType || 'supermarket',
          quantity: it.quantity || 1,
          unit: it.unit || 'pack',
          estimatedPrice: Number(it.estimatedPrice) || 5.0,
          estimatedTotal: Number(it.estimatedTotal) || (it.quantity || 1) * (it.estimatedPrice || 5.0),
          priority: it.priority || 'essential',
          purchased: false,
          dietaryTags: it.dietaryTags || [],
          notes: it.notes || '',
        }));

        setPlan(newPlan);
        setItems(newItems);

        // Notify in chat
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-gen-${Date.now()}`,
            role: 'assistant',
            content: `🎉 I've generated your full shopping plan for **${newPlan.title}**!
• Created **${newItems.length} shopping items** categorized by food, beverage, tableware, decor, and entertainment.
• Optimized quantities for **${newPlan.adultCount + newPlan.kidCount} guests** (${newPlan.durationHours} hours).
• Advice: ${(generated.plannerAdvice || []).join('\n• ')}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to generate with AI:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Shopping list mutations
  const handleTogglePurchased = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, purchased: !item.purchased } : item))
    );
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const qty = Math.max(1, newQuantity);
          return {
            ...item,
            quantity: qty,
            estimatedTotal: qty * item.estimatedPrice,
          };
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = (newItem: Omit<ShoppingItem, 'id' | 'purchased'>) => {
    const item: ShoppingItem = {
      ...newItem,
      id: `custom-${Date.now()}`,
      purchased: false,
    };
    setItems((prev) => [item, ...prev]);
  };

  const handleRemoveOptionalItems = () => {
    setItems((prev) => prev.filter((it) => it.priority !== 'optional'));
  };

  // CUJ Step handling
  const handleStepClick = (step: CUJStep) => {
    setCujStep(step);
    if (step === 'define') {
      setIsPlanModalOpen(true);
    } else if (step === 'review') {
      setActiveTab('shopping');
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } else if (step === 'refine_checkout') {
      setIsCheckoutModalOpen(true);
    }
  };

  const handleCompleteOrder = (details: CheckoutDetails) => {
    setCujStep('review');
    const methodNames = {
      pickup: 'CymbalMart Curbside Express Pickup',
      delivery: 'Same-Day Cold-Chain Home Delivery',
      instore: 'Curated In-Store Aisle Walkthrough'
    };

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-order-${Date.now()}`,
        role: 'assistant',
        content: `🎉 **Order Finalized for ${plan.title}!**
• **Fulfillment**: ${methodNames[details.fulfillmentMethod]}
• **Store Location**: ${details.storeLocation}
• **Selected Slot**: ${details.fulfillmentTime || 'Party Morning Priority Window'}
• **Total Charged**: $${(details.totalCharged || 0).toFixed(2)} (Budget: $${plan.budget.toFixed(2)})
• **Cart Count**: ${items.length} shopping items prepared

Your host shopping journey is complete! You can pick up or receive delivery with zero stress before party time.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-sans text-neutral-900">
      {/* Top Navigation & Budget Bar */}
      <Header
        plan={plan}
        items={items}
        onSelectPreset={handleSelectPreset}
        onOpenNewPlanModal={() => {
          setCujStep('define');
          setIsPlanModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onOpenDietaryModal={() => setIsDietaryModalOpen(true)}
        onOpenCheckoutModal={() => {
          setCujStep('refine_checkout');
          setIsCheckoutModalOpen(true);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAgentOpen={isAgentOpen}
        setIsAgentOpen={setIsAgentOpen}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex gap-6 min-h-0">
        {/* Left / Center Column: Party Overview & Shopping Checklist */}
        <div className={`flex-1 flex flex-col gap-6 min-w-0 ${activeTab === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          {/* CUJ Step Progress Banner (Define -> Review -> Refine & Checkout) */}
          <CUJStepBanner
            currentStep={cujStep}
            onStepClick={handleStepClick}
            plan={plan}
            items={items}
            onProceedToCheckout={() => {
              setCujStep('refine_checkout');
              setIsCheckoutModalOpen(true);
            }}
          />

          {/* Party Overview & Consumption Rules Bar */}
          <PartyOverviewBar
            plan={plan}
            onEditPlan={() => {
              setCujStep('define');
              setIsPlanModalOpen(true);
            }}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            onOpenDietaryModal={() => setIsDietaryModalOpen(true)}
          />

          {/* Interactive Shopping List View with Aisle and Budget Alignment */}
          <ShoppingListView
            items={items}
            onTogglePurchased={handleTogglePurchased}
            onUpdateQuantity={handleUpdateQuantity}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            viewMode={activeTab === 'stores' ? 'store' : viewMode}
            setViewMode={setViewMode}
            planBudget={plan.budget}
            onOpenBudgetOptimizer={() => setIsBudgetModalOpen(true)}
            onOpenCheckoutModal={() => {
              setCujStep('refine_checkout');
              setIsCheckoutModalOpen(true);
            }}
          />
        </div>

        {/* Right Column: Conversational AI Agent Drawer / Panel */}
        <div
          className={`shrink-0 transition-all duration-300 ${
            isAgentOpen
              ? 'fixed inset-y-0 right-0 z-40 w-full sm:w-96 md:static md:w-[380px] lg:w-[420px] flex'
              : 'hidden'
          }`}
        >
          <AgentPanel
            plan={plan}
            items={items}
            messages={messages}
            onSendMessage={handleSendMessage}
            onApplyAction={handleApplyAction}
            isOpen={isAgentOpen}
            onClose={() => setIsAgentOpen(false)}
            isLoading={isChatLoading}
          />
        </div>
      </main>

      {/* Floating button to open CymbalMart Assistant if closed */}
      {!isAgentOpen && (
        <button
          id="btn-floating-assistant"
          onClick={() => setIsAgentOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 rounded-2xl bg-neutral-900 text-white px-4 py-3 font-bold shadow-2xl hover:bg-neutral-800 transition-all border border-neutral-700/50 hover:scale-105"
          title="Chat with CymbalMart Assistant"
        >
          <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-rose-600 text-white text-[10px] font-black">
            CM
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-neutral-900" />
          </div>
          <span className="text-sm">Chat with CymbalMart Assistant</span>
        </button>
      )}

      {/* Modals */}
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false);
          setCujStep('review');
        }}
        currentPlan={plan}
        onSavePlan={(updated) => {
          setPlan(updated);
          setCujStep('review');
        }}
        onGenerateWithAI={handleGenerateWithAI}
        isGenerating={isGeneratingPlan}
      />

      <BudgetOptimizerModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        plan={plan}
        items={items}
        onRemoveOptionalItems={handleRemoveOptionalItems}
      />

      <DietaryScannerModal
        isOpen={isDietaryModalOpen}
        onClose={() => setIsDietaryModalOpen(false)}
        plan={plan}
        items={items}
        onAddRecommendation={handleAddItem}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        plan={plan}
        items={items}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => {
          setIsCheckoutModalOpen(false);
          setCujStep('review');
        }}
        plan={plan}
        items={items}
        onCompleteOrder={handleCompleteOrder}
        onOpenBudgetOptimizer={() => {
          setIsCheckoutModalOpen(false);
          setIsBudgetModalOpen(true);
        }}
        onRemoveOptionalItems={handleRemoveOptionalItems}
      />
    </div>
  );
}
