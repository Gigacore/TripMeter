/**
 * Formats a number as a currency string using the Intl.NumberFormat API.
 *
 * @param {number} value The numeric value to format.
 * @param {string} currency The ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP').
 * @param {string} [locale=navigator.language] The locale to use for formatting. Defaults to the browser's language.
 * @returns {string} The formatted currency string.
 */
export function formatCurrency(value, currency, locale = navigator.language) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol', // 'symbol' is default, can also be 'narrowSymbol', 'code', 'name'
    }).format(value);
  } catch (error) {
    console.error(`Error formatting currency for locale "${locale}" and currency "${currency}":`, error);
    // Fallback for invalid currency codes or other errors
    return `${currency} ${value.toFixed(2)}`;
  }
}