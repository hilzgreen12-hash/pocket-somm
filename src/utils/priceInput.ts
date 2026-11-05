// Read a typed price. A comma is a DECIMAL point only when it's the sole
// separator with 1–2 digits after it ("150,74" from a comma-decimal keypad);
// otherwise commas are thousands separators ("1,250", "1,250.00").
export function normalisePriceText(text: string): string {
  const t = (text ?? '').trim();
  const decimalComma = !t.includes('.') && /^[^,]*,\d{1,2}$/.test(t);
  return decimalComma ? t.replace(',', '.') : t.replace(/,/g, '');
}
export function parsePriceText(text: string): number {
  return parseFloat(normalisePriceText(text));
}
