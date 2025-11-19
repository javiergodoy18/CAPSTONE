export function calculateDispatchCost(merchandiseValue: number): {
  cost: number;
  percentage: number;
  breakdown: string;
} {
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
    breakdown: `${percentage}% de ${merchandiseValue.toLocaleString('es-CL')} = ${cost.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  };
}

export function generateDispatchNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  return `VJ-${year}${month}-${random}`;
}
