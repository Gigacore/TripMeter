let currencyNameToCodeMap: { [key: string]: string } | null = null;

function generateCurrencyMap(): { [key: string]: string } {
  if (currencyNameToCodeMap) {
    return currencyNameToCodeMap;
  }

  const map: { [key: string]: string } = {};
  // Use a well-supported locale like 'en' for broad compatibility
  const currencyNames = new Intl.DisplayNames(['en'], { type: 'currency' });

  // A list of common currency codes to generate names for.
  // This can be expanded if needed.
  const commonCodes = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'BRL', 'RUB', 'KRW', 'SGD'];

  for (const code of commonCodes) {
    const name = currencyNames.of(code);
    if (name && name !== code) {
      map[name] = code;
    }
  }

  // Add manual overrides for common variations
  map['British Pound Sterling'] = 'GBP';

  currencyNameToCodeMap = map;
  return currencyNameToCodeMap;
}

export const getCurrencyCode = (currency: string): string => {
  const map = generateCurrencyMap();
  return map[currency] || currency;
};