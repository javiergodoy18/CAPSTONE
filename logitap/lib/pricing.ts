// Pricing calculation for dispatch based on merchandise value

export interface PricingResult {
  cost: number;
  percentage: number;
  breakdown: string;
}

export interface PickupPricingInput {
  pricingType: 'percentage' | 'custom';
  merchandiseValue: number;
  customPrice?: number | null;
}

export interface PickupPricingResult {
  cost: number;
  percentage: number;
  source: 'percentage' | 'custom';
  breakdown: string;
}

/**
 * Calculate dispatch cost based on merchandise value using tiered percentages
 */
export function calculateDispatchCost(merchandiseValue: number): PricingResult {
  let percentage: number;

  if (merchandiseValue <= 22000) {
    percentage = 3.0;
  } else if (merchandiseValue > 22000 && merchandiseValue <= 30000) {
    percentage = 2.75;
  } else {
    percentage = 2.5;
  }

  const cost = merchandiseValue * (percentage / 100);

  return {
    cost: parseFloat(cost.toFixed(2)),
    percentage,
    breakdown: `${percentage}% de $${merchandiseValue.toLocaleString('es-CL')}`
  };
}

/**
 * Calculate pickup cost - supports both percentage-based and custom pricing
 */
export function calculatePickupCost(pickup: PickupPricingInput): PickupPricingResult {
  // If custom pricing is selected and has a value, use it
  if (pickup.pricingType === 'custom' && pickup.customPrice && pickup.customPrice > 0) {
    return {
      cost: pickup.customPrice,
      percentage: 0,
      source: 'custom',
      breakdown: `Valor personalizado: $${pickup.customPrice.toLocaleString('es-CL')}`
    };
  }

  // Otherwise, use percentage-based calculation
  const result = calculateDispatchCost(pickup.merchandiseValue);
  return {
    ...result,
    source: 'percentage'
  };
}

/**
 * Generate a unique dispatch number
 */
export function generateDispatchNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  return `VJ-${year}${month}-${random}`;
}
