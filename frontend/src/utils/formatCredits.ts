const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatCredits = (amount: number): string =>
  compactNumber.format(amount);
