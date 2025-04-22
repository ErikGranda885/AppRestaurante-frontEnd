export const safePrice = (value: number | null | undefined): string =>
  (value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
