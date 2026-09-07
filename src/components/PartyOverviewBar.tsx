import React from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Sparkles, 
  Edit3, 
  ShieldCheck, 
  TrendingDown, 
  Coffee, 
  Wine, 
  GlassWater,
  Layers,
  UtensilsCrossed
} from 'lucide-react';
import { PartyPlan } from '../types';
import { calculateConsumption } from '../utils/calculator';

interface PartyOverviewBarProps {
  plan: PartyPlan;
  onEditPlan: () => void;
  onOpenBudgetModal: () => void;
  onOpenDietaryModal: () => void;
}

export const PartyOverviewBar: React.FC<PartyOverviewBarProps> = ({
  plan,
  onEditPlan,
  onOpenBudgetModal,
  onOpenDietaryModal,
}) => {
  const estimates = calculateConsumption(plan);
  const totalGuests = plan.adultCount + plan.kidCount;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Event Main Details */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200/60">
              {plan.eventType}
            </span>
            <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              Theme: {plan.theme}
            </span>
            {plan.dietaryRestrictions && plan.dietaryRestrictions.length > 0 && (
              <button
                onClick={onOpenDietaryModal}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                title="View dietary alerts & checks"
              >
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                {plan.dietaryRestrictions.length} Dietary Notes
              </button>
            )}
          </div>

          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            {plan.title}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-sm text-neutral-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-neutral-400" />
              <span>{plan.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-neutral-400" />
              <span>{plan.startTime} ({plan.durationHours} hrs)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-neutral-400" />
              <span>
                <strong>{totalGuests}</strong> Guests ({plan.adultCount} Adults, {plan.kidCount} Kids)
              </span>
            </div>
            <div className="flex items-center gap-1.5 capitalize">
              <MapPin className="h-4 w-4 text-neutral-400" />
              <span>{plan.locationType} Venue</span>
            </div>
          </div>
        </div>

        {/* Quick actions for event */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
          <button
            id="btn-edit-party-details"
            onClick={onEditPlan}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5 text-neutral-500" />
            Edit Details
          </button>
          <button
            id="btn-quick-dietary-scan"
            onClick={onOpenDietaryModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Dietary Scan
          </button>
          <button
            id="btn-quick-budget-optimize"
            onClick={onOpenBudgetModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <TrendingDown className="h-3.5 w-3.5 text-amber-400" />
            Optimize Budget
          </button>
        </div>
      </div>

      {/* Live AI / Mathematical Consumption Rule of Thumb Metrics */}
      <div className="mt-4 pt-4 border-t border-neutral-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Rule-of-Thumb Consumption Benchmarks ({totalGuests} Guests, {plan.durationHours}h)
          </span>
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            Industry standard formulas based on headcount & venue
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {/* Ice */}
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-2.5">
            <div className="flex items-center justify-between text-xs text-sky-800 font-medium">
              <span>Party Ice</span>
              <span className="text-[10px] text-sky-600 font-normal">
                {plan.locationType === 'backyard' ? '2 lb/guest' : '1.5 lb/guest'}
              </span>
            </div>
            <div className="mt-1 text-base font-bold text-sky-950">
              {estimates.icePounds} lbs
            </div>
            <div className="text-[11px] text-sky-700">
              ~{Math.ceil(estimates.icePounds / 10)} bags (10 lb)
            </div>
          </div>

          {/* Drinks */}
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-2.5">
            <div className="flex items-center justify-between text-xs text-amber-800 font-medium">
              <span>Total Drinks</span>
              <Wine className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div className="mt-1 text-base font-bold text-amber-950">
              {estimates.drinksTotal} drinks
            </div>
            <div className="text-[11px] text-amber-700">
              {estimates.alcoholicDrinks} alc / {estimates.nonAlcoholicDrinks} non-alc
            </div>
          </div>

          {/* Food Servings */}
          <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-2.5">
            <div className="flex items-center justify-between text-xs text-orange-800 font-medium">
              <span>Food Portions</span>
              <UtensilsCrossed className="h-3.5 w-3.5 text-orange-600" />
            </div>
            <div className="mt-1 text-base font-bold text-orange-950">
              {estimates.mainPortions} mains
            </div>
            <div className="text-[11px] text-orange-700">
              +{estimates.appetizerPieces} appetizer bites
            </div>
          </div>

          {/* Tableware Napkins */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
              <span>Napkins</span>
              <Layers className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="mt-1 text-base font-bold text-emerald-950">
              {estimates.napkinsCount} count
            </div>
            <div className="text-[11px] text-emerald-700">
              ~3.5 per guest
            </div>
          </div>

          {/* Cups */}
          <div className="col-span-2 sm:col-span-1 rounded-xl border border-purple-100 bg-purple-50/50 p-2.5">
            <div className="flex items-center justify-between text-xs text-purple-800 font-medium">
              <span>Cups / Glasses</span>
              <GlassWater className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <div className="mt-1 text-base font-bold text-purple-950">
              {estimates.cupsCount} cups
            </div>
            <div className="text-[11px] text-purple-700">
              ~2.5 per guest
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
