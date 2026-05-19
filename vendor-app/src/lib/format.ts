/**
 * Format paise to ₹ display. Uses Indian thousand-separators (lakhs/crores).
 */
export function formatINR(paise: number | null | undefined): string {
  const n = (paise ?? 0) / 100;
  return "₹" + n.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
}
