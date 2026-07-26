import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import type { AppActor } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function recordAudit(input: {
  actor: AppActor;
  restaurantId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  changes?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      restaurantId: input.restaurantId,
      actorType: input.actor.type,
      actorId: input.actor.id,
      actorEmail: input.actor.email,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      changes: input.changes,
    },
  });
}

export async function notifyRestaurantMembers(input: {
  restaurantId: string;
  type: string;
  title: string;
  body?: string;
  excludeCustomerUserId?: string;
}) {
  const memberships = await prisma.restaurantMembership.findMany({
    where: {
      restaurantId: input.restaurantId,
      customerUserId: input.excludeCustomerUserId
        ? { not: input.excludeCustomerUserId }
        : undefined,
    },
    select: { customerUserId: true },
  });
  if (memberships.length === 0) return;
  await prisma.notification.createMany({
    data: memberships.map(({ customerUserId }) => ({
      customerUserId,
      restaurantId: input.restaurantId,
      type: input.type,
      title: input.title,
      body: input.body,
    })),
  });
}
