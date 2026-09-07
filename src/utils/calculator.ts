import { ConsumptionEstimates, PartyPlan } from '../types';

export function calculateConsumption(plan: PartyPlan): ConsumptionEstimates {
  const totalGuests = Math.max(1, plan.adultCount + plan.kidCount);
  const adults = Math.max(0, plan.adultCount);
  const kids = Math.max(0, plan.kidCount);
  const hours = Math.max(1, plan.durationHours);

  // Drink formulas:
  // Adults: 2 drinks first hour + 1 drink per subsequent hour
  const adultDrinksPerPerson = 2 + (hours - 1) * 1;
  const adultDrinksTotal = Math.round(adults * adultDrinksPerPerson);
  const alcoholicDrinks = Math.round(adultDrinksTotal * 0.65);
  const adultNonAlcoholic = adultDrinksTotal - alcoholicDrinks;

  // Kids: 1.5 drinks per hour
  const kidDrinksTotal = Math.round(kids * (hours * 1.5));
  const nonAlcoholicDrinks = adultNonAlcoholic + kidDrinksTotal;
  const drinksTotal = alcoholicDrinks + nonAlcoholicDrinks;

  // Ice formulas:
  // 1.5 lbs per person indoor, 2.0 lbs per person outdoor/backyard
  const icePerGuest = plan.locationType === 'backyard' || plan.locationType === 'park' ? 2.0 : 1.5;
  const icePounds = Math.ceil(totalGuests * icePerGuest);

  // Food portions
  const mainPortions = Math.ceil(adults * 1.1 + kids * 0.85);
  const appetizerPieces = Math.ceil(totalGuests * (hours > 3 ? 6 : 4));
  const dessertPortions = Math.ceil(totalGuests * 1.15);

  // Tableware:
  const napkinsCount = Math.ceil(totalGuests * 3.5);
  const platesCount = Math.ceil(totalGuests * 2.2);
  const cupsCount = Math.ceil(totalGuests * 2.5);

  return {
    totalGuests,
    drinksTotal,
    alcoholicDrinks,
    nonAlcoholicDrinks,
    icePounds,
    mainPortions,
    appetizerPieces,
    dessertPortions,
    napkinsCount,
    platesCount,
    cupsCount,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
