import Link from "next/link";
import { ArrowLeft, Bell, Building2, Plus, Users } from "lucide-react";
import {
  AssignRestaurantForm,
  CustomerAccountSettings,
} from "@/components/admin/CustomerAccountControls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOperator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CustomerManagementPage() {
  const operator = await requireOperator();
  const [accounts, availableRestaurants, notifications] = await Promise.all([
    prisma.customerAccount.findMany({
      include: {
        users: {
          include: {
            memberships: {
              include: { restaurant: { select: { businessName: true } } },
            },
          },
          orderBy: { email: "asc" },
        },
        restaurants: { orderBy: { businessName: "asc" } },
        invitations: { orderBy: { createdAt: "desc" }, take: 5 },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.restaurant.findMany({
      where: { customerAccountId: null },
      select: { id: true, businessName: true },
      orderBy: { businessName: "asc" },
    }),
    prisma.notification.findMany({
      where: { operatorId: operator.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
        <Link href="/dashboard" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Dashboard</Link>
        <h1 className="text-2xl font-semibold">Customer workspaces</h1>
        <p className="text-muted-foreground">Manage existing accounts, access, locations, and limits.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/customers/new" />}>
          <Plus className="size-4" /> Onboard customer
        </Button>
      </div>
      {accounts.length > 0 && availableRestaurants.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">Add a location</h2>
          <AssignRestaurantForm accounts={accounts.map(({ id, name }) => ({ id, name }))} restaurants={availableRestaurants} />
        </section>
      )}
      <section className="space-y-4">
        <div className="flex items-center gap-2"><Building2 className="size-5" /><h2 className="font-semibold">Accounts</h2><Badge variant="secondary">{accounts.length}</Badge></div>
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-base">{account.name}</CardTitle>
                <div className="flex gap-2"><Badge variant={account.isActive ? "default" : "destructive"}>{account.isActive ? "Active" : "Suspended"}</Badge><Badge variant="outline">{account.plan.toLowerCase()}</Badge></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div><p className="font-medium">Locations</p><p className="text-muted-foreground">{account.restaurants.map((restaurant) => restaurant.businessName).join(", ") || "None"}</p></div>
                <div><p className="font-medium">Activated users</p><p className="text-muted-foreground">{account.users.map((user) => user.email).join(", ") || "None yet"}</p></div>
              </div>
              <CustomerAccountSettings account={{
                id: account.id,
                plan: account.plan,
                maxRestaurants: account.maxRestaurants,
                maxStorageMb: Number(
                  account.maxStorageBytes / (BigInt(1024) * BigInt(1024)),
                ),
                isActive: account.isActive,
              }} />
              {account.users.length > 0 && (
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-medium"><Users className="size-4" /> Access</p>
                  {account.users.map((user) => <div key={user.id} className="flex flex-wrap justify-between gap-2 text-sm"><span>{user.email}</span><span className="text-muted-foreground">{user.memberships.map((membership) => `${membership.restaurant.businessName} (${membership.role.toLowerCase()})`).join(", ") || "No locations"}</span></div>)}
                </div>
              )}
              {account.invitations.length > 0 && <p className="text-xs text-muted-foreground">{account.invitations.filter((invite) => !invite.acceptedAt && invite.expiresAt > new Date()).length} pending invitation(s)</p>}
            </CardContent>
          </Card>
        ))}
        {!accounts.length && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Users className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 font-medium">No customer workspaces yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Onboard the first customer and assign one or more restaurant locations.
            </p>
            <Button
              className="mt-4"
              nativeButton={false}
              render={<Link href="/dashboard/customers/new" />}
            >
              <Plus className="size-4" />
              Onboard first customer
            </Button>
          </div>
        )}
      </section>
      {notifications.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Bell className="size-4" /> Operator notifications</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">{notifications.map((notice) => <div key={notice.id}><span className="font-medium">{notice.title}</span><span className="ml-2 text-xs text-muted-foreground">{notice.createdAt.toLocaleString()}</span></div>)}</CardContent>
        </Card>
      )}
    </div>
  );
}
