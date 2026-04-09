const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMonth(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

const CURRENCY_LOCALES = { USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', BDT: 'bn-BD' };

export function formatCurrencyByCode(amount, currencyCode = 'USD') {
  const locale = CURRENCY_LOCALES[currencyCode] ?? 'en-US';
  const code = CURRENCY_LOCALES[currencyCode] ? currencyCode : 'USD';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
