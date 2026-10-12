export const CURRENCY_SYMBOL = '₹';

/**
 * Format a number or numeric string as Indian Rupees (INR)
 * Example: 1499 => "₹1,499.00"
 */
export function formatPrice(amount, showDecimals = true) {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export default formatPrice;
