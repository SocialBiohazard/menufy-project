import type { CustomerRole } from "@/generated/prisma/client";

const ROLE_LEVEL: Record<CustomerRole, number> = {
  VIEWER: 0,
  EDITOR: 1,
  OWNER: 2,
};

export function roleAllows(role: CustomerRole, minimumRole: CustomerRole) {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[minimumRole];
}

export function restaurantAccessRole(
  memberships: ReadonlyArray<{ restaurantId: string; role: CustomerRole }>,
  restaurantId: string,
): CustomerRole | null {
  return memberships.find((membership) => membership.restaurantId === restaurantId)?.role ?? null;
}

export function membershipsAllowRestaurantAccess(
  memberships: ReadonlyArray<{ restaurantId: string; role: CustomerRole }>,
  restaurantId: string,
  minimumRole: CustomerRole,
): boolean {
  const role = restaurantAccessRole(memberships, restaurantId);
  return role ? roleAllows(role, minimumRole) : false;
}
