let currencyNameToCodeMap: { [key: string]: string } | null = null;

export function generateCurrencyMap(codes?: string[]): { [key: string]: string } {
  const map: { [key: string]: string } = {};
  const currencyNames = new Intl.DisplayNames(['en'], { type: 'currency' });

  const codesToProcess = codes || [
    // Default common codes if none are provided
    'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'BRL', 'RUB', 'KRW', 'SGD'
  ];

  for (const code of codesToProcess) {
    const name = currencyNames.of(code);
    if (name && name !== code) {
      map[name] = code;
    }
  }

  // Add manual overrides for common variations
  map['British Pound Sterling'] = 'GBP';

  return map;
}

export const getCurrencyCode = (currency: string): string => {
  // We can't rely on a global map anymore since it can be different based on the data
  const map = generateCurrencyMap(); // This will use default codes
  return map[currency] || currency;
};

export function resetCurrencyMap() {
  currencyNameToCodeMap = null;
}
