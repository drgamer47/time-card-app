// Indiana state tax rate: 3.05%
// Federal tax estimates (rough - actual depends on filing status, deductions, etc)
// Using simplified rates for hourly workers

interface TaxRates {
  federalRate: number;    // Rough federal withholding %
  stateRate: number;      // Indiana state tax
  socialSecurity: number; // FICA Social Security
  medicare: number;       // FICA Medicare
}

export const TAX_RATES: TaxRates = {
  federalRate: 0.12,      // ~12% federal (rough estimate for your bracket)
  stateRate: 0.0305,      // 3.05% Indiana state
  socialSecurity: 0.062,  // 6.2% Social Security
  medicare: 0.0145,       // 1.45% Medicare
};

export interface NetPayDetails {
  grossPay: number;
  federal: number;
  state: number;
  socialSecurity: number;
  medicare: number;
  totalTax: number;
  netPay: number;
}

export function calculateNetPay(grossPay: number): NetPayDetails {
  const federal = grossPay * TAX_RATES.federalRate;
  const state = grossPay * TAX_RATES.stateRate;
  const socialSecurity = grossPay * TAX_RATES.socialSecurity;
  const medicare = grossPay * TAX_RATES.medicare;
  
  const totalTax = federal + state + socialSecurity + medicare;
  const netPay = grossPay - totalTax;

  return {
    grossPay,
    federal: Number(federal.toFixed(2)),
    state: Number(state.toFixed(2)),
    socialSecurity: Number(socialSecurity.toFixed(2)),
    medicare: Number(medicare.toFixed(2)),
    totalTax: Number(totalTax.toFixed(2)),
    netPay: Number(netPay.toFixed(2))
  };
}



