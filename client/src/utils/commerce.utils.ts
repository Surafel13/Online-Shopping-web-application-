export const selectCls =
  "h-9 rounded-md border border-input bg-background px-3 text-sm";

export const money = (value: number) =>
  `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
