export const PORTION_UNITS = ["G", "ML", "L"] as const;

export type PortionUnitValue = (typeof PORTION_UNITS)[number];

const UNIT_LABEL: Record<PortionUnitValue, string> = {
  G: "g",
  ML: "ml",
  L: "L",
};

export function formatPortion(
  amount: number | null | undefined,
  unit: PortionUnitValue | null | undefined,
): string | null {
  if (amount == null || !unit || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return `${amount} ${UNIT_LABEL[unit]}`;
}
