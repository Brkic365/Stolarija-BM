// Croatian number formatting: 1.250 € instead of €1,250
const priceFormatter = new Intl.NumberFormat("hr-HR", {
  maximumFractionDigits: 0,
});

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || Number.isNaN(Number(price))) {
    return "Na upit";
  }
  return `${priceFormatter.format(Number(price))} €`;
}
