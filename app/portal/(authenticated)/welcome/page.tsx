import Link from "next/link";
import {
  Check,
  Circle,
  Eye,
  ImageIcon,
  LayoutList,
  Rocket,
  Store,
  UserRoundCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCustomerUser } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

type SetupStep = {
  title: string;
  description: string;
  complete: boolean;
  href: string;
  action: string;
  icon: typeof Check;
  external?: boolean;
};

export default async function CustomerWelcomePage() {
  const customer = await requireCustomerUser();
  const editableRestaurantIds = customer.memberships
    .filter((membership) => membership.role !== "VIEWER")
    .map((membership) => membership.restaurantId);
  const restaurants = await prisma.restaurant.findMany({
    where: { id: { in: editableRestaurantIds } },
    include: {
      categories: { select: { _count: { select: { items: true } } } },
    },
    orderBy: { businessName: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="secondary" className="mb-3">Welcome to Menufy</Badge>
        <h1 className="text-3xl font-semibold">Let’s get your menu ready</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Follow these steps in order. Your live menu will not change until you explicitly publish.
        </p>
      </div>

      {restaurants.map((restaurant) => {
        const hasDetails = Boolean(
          restaurant.businessType &&
          (restaurant.phone || restaurant.email || restaurant.address),
        );
        const hasBranding = Boolean(restaurant.logo);
        const hasMenu = restaurant.categories.some(
          (category) => category._count.items > 0,
        );
        const steps: SetupStep[] = [
          {
            title: "Account activated",
            description: "Your secure customer access is ready.",
            complete: true,
            href: "/portal/account",
            action: "View account",
            icon: UserRoundCheck,
          },
          {
            title: "Confirm restaurant details",
            description: "Add contact details, address, hours, links, and notices.",
            complete: hasDetails,
            href: `/portal/restaurants/${restaurant.id}#restaurant-details`,
            action: "Edit details",
            icon: Store,
          },
          {
            title: "Add your branding",
            description: "Upload the restaurant logo and optional imagery.",
            complete: hasBranding,
            href: `/portal/restaurants/${restaurant.id}#branding`,
            action: "Add branding",
            icon: ImageIcon,
          },
          {
            title: "Build the menu",
            description: "Create categories, products, prices, translations, and dietary details.",
            complete: hasMenu,
            href: `/portal/restaurants/${restaurant.id}/menu`,
            action: "Open menu builder",
            icon: LayoutList,
          },
          {
            title: "Preview the draft",
            description: "Review exactly how the current draft looks before publishing.",
            complete: hasMenu,
            href: `/portal-preview/${restaurant.id}`,
            action: "Preview draft",
            icon: Eye,
            external: true,
          },
          {
            title: "Publish",
            description: "Make the reviewed draft available to diners.",
            complete: restaurant.isPublished,
            href: "/portal",
            action: "Review and publish",
            icon: Rocket,
          },
        ];
        const nextIndex = steps.findIndex((step) => !step.complete);
        const completed = steps.filter((step) => step.complete).length;

        return (
          <Card key={restaurant.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>{restaurant.businessName}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{completed} of {steps.length} steps complete</p>
                </div>
                <Badge variant={restaurant.isPublished ? "default" : "outline"}>
                  {restaurant.isPublished ? "Live" : "Setup in progress"}
                </Badge>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${Math.round((completed / steps.length) * 100)}%` }} />
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isNext = index === nextIndex;
                  return (
                    <li key={step.title} className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center ${isNext ? "border-primary bg-primary/5" : ""}`}>
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${step.complete ? "bg-emerald-100 text-emerald-700" : isNext ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {step.complete ? <Check className="size-4" /> : isNext ? <Icon className="size-4" /> : <Circle className="size-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2"><p className="font-medium">{index + 1}. {step.title}</p>{isNext && <Badge>Next</Badge>}</div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <Button size="sm" variant={isNext ? "default" : "outline"} nativeButton={false} render={<Link href={step.href} target={step.external ? "_blank" : undefined} />}>
                        {step.action}
                      </Button>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        );
      })}
      {!restaurants.length && <div className="rounded-lg border border-dashed p-8 text-center"><p className="text-muted-foreground">Your access is read-only, or no editable restaurant is assigned.</p><Button className="mt-3" variant="outline" nativeButton={false} render={<Link href="/portal" />}>Go to overview</Button></div>}
    </div>
  );
}
