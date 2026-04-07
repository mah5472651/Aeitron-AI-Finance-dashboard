const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
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
