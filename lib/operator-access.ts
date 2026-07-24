const normalizeEmail = (value: string) => value.trim().toLowerCase();

export function configuredOperatorEmails(
  value = process.env.OPERATOR_EMAILS ?? "",
): string[] {
  return [...new Set(value.split(",").map(normalizeEmail).filter(Boolean))];
}

export function isOperatorEmail(
  email: string | null | undefined,
  configured = process.env.OPERATOR_EMAILS ?? "",
): boolean {
  if (!email) return false;
  return configuredOperatorEmails(configured).includes(normalizeEmail(email));
}
