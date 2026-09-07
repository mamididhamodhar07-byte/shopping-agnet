import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, Users, DollarSign, X, ShieldAlert, Loader2 } from 'lucide-react';
import { PartyPlan } from '../types';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PartyPlan;
  onSavePlan: (updatedPlan: PartyPlan) => void;
  onGenerateWithAI: (planData: Partial<PartyPlan>) => Promise<void>;
  isGenerating: boolean;
}

const COMMON_EVENT_TYPES = [
  'Birthday Bash',
  'Backyard BBQ & Grill',
  'Cocktail & Tapas Soirée',
  'Kids Themed Birthday',
  'Dinner Party',
  'Game Night & Tacos',
  'Graduation Celebration',
  'Holiday Gathering',
  'Baby Shower / Bridal Shower',
];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Nut-Free (Strict)',
  'Dairy-Free',
  'Halal',
  'Kosher',
];

export const PlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onSavePlan,
  onGenerateWithAI,
  isGenerating,
}) => {
  const [title, setTitle] = useState(currentPlan.title);
  const [eventType, setEventType] = useState(currentPlan.eventType);
  const [theme, setTheme] = useState(currentPlan.theme);
  const [date, setDate] = useState(currentPlan.date);
  const [startTime, setStartTime] = useState(currentPlan.startTime);
  const [durationHours, setDurationHours] = useState(currentPlan.durationHours);
  const [adultCount, setAdultCount] = useState(currentPlan.adultCount);
  const [kidCount, setKidCount] = useState(currentPlan.kidCount);
  const [locationType, setLocationType] = useState(currentPlan.locationType);
  const [budget, setBudget] = useState(currentPlan.budget);
  const [dietary, setDietary] = useState<string[]>(currentPlan.dietaryRestrictions || []);
  const [customNotes, setCustomNotes] = useState(currentPlan.customNotes);
  const [specialRequests, setSpecialRequests] = useState(currentPlan.specialRequests || '');
  const [customDietaryInput, setCustomDietaryInput] = useState('');

  if (!isOpen) return null;

  const toggleDietary = (item: string) => {
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const addCustomDietary = (e: React.FormEvent) => {
    e.preventDefault();
    if (customDietaryInput.trim() && !dietary.includes(customDietaryInput.trim())) {
      setDietary([...dietary, customDietaryInput.trim()]);
      setCustomDietaryInput('');
    }
  };

  const appendSpecialRequest = (tag: string) => {
    setSpecialRequests((prev) => {
      if (!prev) return tag;
      if (prev.includes(tag)) return prev;
      return `${prev}, ${tag}`;
    });
  };

  const handleSaveOnly = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePlan({
      ...currentPlan,
      title,
      eventType,
      theme,
      date,
      startTime,
      durationHours,
      adultCount,
      kidCount,
      locationType,
      budget,
      dietaryRestrictions: dietary,
      customNotes,
      specialRequests,
    });
    onClose();
  };

  const handleAiGenerate = async () => {
    await onGenerateWithAI({
      title,
      eventType,
      theme,
      date,
      startTime,
      durationHours,
      adultCount,
      kidCount,
      locationType,
      budget,
      dietaryRestrictions: dietary,
      customNotes,
      specialRequests,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-neutral-200 p-6 text-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 border border-blue-200">
                CUJ Step 1
              </span>
              <span className="text-xs font-semibold text-neutral-500">CymbalMart Event Concierge</span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mt-1">
              Define Event, Budget & Special Requests
            </h3>
            <p className="text-xs text-neutral-500">
              Set party type, theme, budget target, guest counts, and special host requests for curated shopping list generation.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSaveOnly} className="mt-4 space-y-4 text-xs sm:text-sm">
          {/* Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Event Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Leo's 7th Birthday Party"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 py-2 text-xs sm:text-sm focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Event Type
              </label>
              <input
                type="text"
                list="event-types-list"
                required
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder="Choose or type..."
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 py-2 text-xs sm:text-sm focus:border-rose-500 focus:bg-white focus:outline-none"
              />
              <datalist id="event-types-list">
                {COMMON_EVENT_TYPES.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Theme & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Theme / Atmosphere
              </label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Rustic Campfire, Outer Space, Tropical Luau"
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 py-2 text-xs sm:text-sm focus:border-rose-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Venue / Location
              </label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as any)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 py-2 text-xs sm:text-sm focus:border-rose-500 focus:bg-white focus:outline-none"
              >
                <option value="indoor">Indoor House / Apartment</option>
                <option value="backyard">Backyard / Patio</option>
                <option value="park">Public Park / Outdoor Lawn</option>
                <option value="venue">Rented Event Hall / Club</option>
              </select>
            </div>
          </div>

          {/* Date, Time, Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-2 py-2 text-xs sm:text-sm focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-2 py-2 text-xs sm:text-sm focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Duration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={durationHours}
                onChange={(e) => setDurationHours(parseInt(e.target.value) || 3)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 py-2 text-xs sm:text-sm focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Headcount: Adults, Kids, Budget */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Adults Count
              </label>
              <input
                type="number"
                min="0"
                value={adultCount}
                onChange={(e) => setAdultCount(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 py-2 text-xs sm:text-sm focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Kids Count
              </label>
              <input
                type="number"
                min="0"
                value={kidCount}
                onChange={(e) => setKidCount(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 py-2 text-xs sm:text-sm focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Budget Target ($)
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 py-2 text-xs sm:text-sm focus:border-rose-500 focus:outline-none font-bold text-neutral-900"
              />
            </div>
          </div>

          {/* Dietary restrictions */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Dietary Restrictions & Allergens
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {DIETARY_OPTIONS.map((opt) => {
                const isSelected = dietary.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => toggleDietary(opt)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom dietary note (e.g. 2 shellfish allergies)..."
                value={customDietaryInput}
                onChange={(e) => setCustomDietaryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomDietary(e);
                  }
                }}
                className="flex-1 rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 py-1.5 text-xs focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustomDietary}
                className="rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Special Requests (CUJ requirement) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-700">
                Special Requests
              </label>
              <span className="text-[11px] text-neutral-400">Dietary, kids, bar & equipment requests</span>
            </div>
            <input
              type="text"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Nut-free kid snacks, mocktail ingredients, compostable plates, need bags of ice..."
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 px-3 py-2 text-xs sm:text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-neutral-400">Quick add:</span>
              {[
                'Kid-Friendly Snacks',
                'Signature Mocktails',
                'Nut-Free Safe',
                'Eco Tableware',
                'Extra Chilled Ice',
                'Finger Foods Only'
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => appendSpecialRequest(tag)}
                  className="rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-neutral-600 hover:bg-neutral-200 transition-colors"
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Host Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Additional Host Notes & Preferences
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Signature cocktail is Aperol Spritz; we already own a cooler; need good mocktails for pregnant friends."
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50/50 p-2.5 text-xs sm:text-sm focus:border-rose-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleAiGenerate}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-200 hover:from-rose-700 hover:to-amber-700 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Plan & Shopping List...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Auto-Generate Shopping List with AI
                </>
              )}
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-neutral-300 px-3 py-2 text-xs sm:text-sm font-medium text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-neutral-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                Save Details Only
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
