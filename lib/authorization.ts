import "server-only";

import type { CustomerRole } from "@/generated/prisma/client";
import { getOperator } from "@/lib/auth";
import { getCustomerUser } from "@/lib/customer-auth";
import { roleAllows } from "@/lib/customer-roles";

export type AppActor =
  | { type: "OPERATOR"; id: string; email: string; role: "OPERATOR" }
  | { type: "CUSTOMER"; id: string; email: string; role: CustomerRole };

export async function getAuthenticatedActor(): Promise<AppActor | null> {
  const operator = await getOperator();
  if (operator) return { type: "OPERATOR", ...operator, role: "OPERATOR" };
  const customer = await getCustomerUser();
  if (!customer) return null;
  return {
    type: "CUSTOMER",
    id: customer.id,
    email: customer.email,
    role: "VIEWER",
  };
}

export async function requireAuthenticatedActor(): Promise<AppActor> {
  const actor = await getAuthenticatedActor();
  if (!actor) throw new Error("Unauthorized");
  return actor;
}

export async function getRestaurantAccess(
  restaurantId: string,
  minimumRole: CustomerRole = "VIEWER",
): Promise<AppActor | null> {
  const operator = await getOperator();
  if (operator) return { type: "OPERATOR", ...operator, role: "OPERATOR" };

  const customer = await getCustomerUser();
  const membership = customer?.memberships.find(
    (entry) => entry.restaurantId === restaurantId,
  );
  if (
    !customer ||
    !membership ||
    !roleAllows(membership.role, minimumRole)
  ) {
    return null;
  }
  return {
    type: "CUSTOMER",
    id: customer.id,
    email: customer.email,
    role: membership.role,
  };
}

export async function requireRestaurantAccess(
  restaurantId: string,
  minimumRole: CustomerRole = "VIEWER",
): Promise<AppActor> {
  const actor = await getRestaurantAccess(restaurantId, minimumRole);
  if (!actor) throw new Error("You do not have permission for this restaurant");
  return actor;
}
