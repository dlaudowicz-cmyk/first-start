// Centralized calculation utilities — never compute taxes inside UI components.

export type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type DocumentTotals = {
  net: number;
  vat: number;
  gross: number;
  itemTotals: number[];
};

export function calculateItemNet(item: Pick<LineItem, "quantity" | "unitPrice">): number {
  return round2((item.quantity || 0) * (item.unitPrice || 0));
}

export function calculateTotals(items: LineItem[], vatRatePercent: number): DocumentTotals {
  const itemTotals = items.map(calculateItemNet);
  const net = round2(itemTotals.reduce((sum, t) => sum + t, 0));
  const vat = round2(net * (vatRatePercent / 100));
  const gross = round2(net + vat);
  return { net, vat, gross, itemTotals };
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
