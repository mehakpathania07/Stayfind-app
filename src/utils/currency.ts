import { CurrencyCode } from '../types';

export const CURRENCY_RATES: Record<CurrencyCode, { symbol: string; rate: number; name: string }> = {
  USD: { symbol: '$', rate: 1, name: 'USD ($)' },
  INR: { symbol: '₹', rate: 86.5, name: 'INR (₹)' },
  GBP: { symbol: '£', rate: 0.78, name: 'GBP (£)' },
  EUR: { symbol: '€', rate: 0.92, name: 'EUR (€)' },
};

export function formatPrice(amountInUSD: number, currency: CurrencyCode = 'USD'): string {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = Math.round(amountInUSD * info.rate);
  
  if (currency === 'INR') {
    return `${info.symbol}${converted.toLocaleString('en-IN')}`;
  }
  return `${info.symbol}${converted.toLocaleString('en-US')}`;
}

export function convertPrice(amountInUSD: number, currency: CurrencyCode = 'USD'): number {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  return Math.round(amountInUSD * info.rate);
}
