import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Settings } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getRestaurantForEdit } from "@/lib/admin-data";
import { toBuilderCategory } from "@/lib/builder-types";
import { MenuBuilder } from "@/components/admin/MenuBuilder";
import { Button } from "@/components/ui/button";
import { publicMenuUrl } from "@/lib/public-url";

export default async function MenuBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [restaurant, allergens] = await Promise.all([
    getRestaurantForEdit(id),
    prisma.allergen.findMany({ orderBy: { id: "asc" } }),
  ]);
  if (!restaurant) notFound();
  const publicHref = publicMenuUrl({
    slug: restaurant.slug,
    publicHostname: restaurant.publicHostname,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{restaurant.businessName}</h1>
            <p className="text-sm text-muted-foreground">Menu builder</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={`/dashboard/restaurants/${restaurant.id}`} />}
            >
              <Settings className="size-4" />
              Settings
            </Button>
            {restaurant.isPublished && (
              <Button
                size="sm"
                variant="ghost"
                nativeButton={false}
                render={
                  <a href={publicHref} target="_blank" rel="noreferrer" />
                }
              >
                <ExternalLink className="size-4" />
                View live
              </Button>
            )}
          </div>
        </div>
      </div>

      <MenuBuilder
        restaurantId={restaurant.id}
        restaurantSlug={restaurant.slug}
        initialCategories={restaurant.categories.map(toBuilderCategory)}
        allergens={allergens.map((a) => ({
          id: a.id,
          nameTr: a.nameTr,
          nameEn: a.nameEn,
          icon: a.icon,
        }))}
      />
    </div>
  );
}
