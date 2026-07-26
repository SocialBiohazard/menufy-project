import type { CustomerRole } from "@/generated/prisma/client";

const ROLE_LEVEL: Record<CustomerRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  OWNER: 2,
};

export function roleAllows(role: CustomerRole, minimumRole: CustomerRole) {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[minimumRole];
}
