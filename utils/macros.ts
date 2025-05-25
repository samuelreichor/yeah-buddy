const CAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 };

export type Macros = {
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  totalCalories: number
  carbRatio: number
}

/**
 * Calculates macronutrient breakdown based on:
 * - totalCalories: desired total daily calories
 * - proteinGrams:  target grams of protein
 * - carbRatio:     fraction of remaining calories allocated to carbs (0–1)
 */
export function calculateMacros(
  totalCalories: number,
  proteinGrams: number,
  carbRatio = 0.5
) {
  // 1) Calculate calories from protein
  const proteinCals = proteinGrams * CAL_PER_GRAM.protein;
  // 2) Determine remaining calories after protein
  const remainingCals = Math.max(totalCalories - proteinCals, 0);
  // 3) Split remaining calories between carbs and fats
  const carbsCals = remainingCals * carbRatio;
  const fatCals   = remainingCals * (1 - carbRatio);
  // 4) Convert those calories into grams
  const carbsGrams = carbsCals / CAL_PER_GRAM.carbs;
  const fatGrams   = fatCals   / CAL_PER_GRAM.fat;

  return {
    proteinGrams,
    carbsGrams: Math.round(carbsGrams * 10) / 10,
    fatGrams:   Math.round(fatGrams   * 10) / 10,
    totalCalories,
    carbRatio
  };
}
