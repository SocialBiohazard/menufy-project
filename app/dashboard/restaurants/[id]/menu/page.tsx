import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRestaurantForEdit } from "@/lib/admin-data";
import { toBuilderCategory } from "@/lib/builder-types";
import { MenuBuilder } from "@/components/admin/MenuBuilder";
import { RestaurantWorkspaceHeader } from "@/components/shared/RestaurantWorkspaceHeader";
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
    applicationOrigin: process.env.NEXT_PUBLIC_SITE_URL,
    preferApplicationOrigin: process.env.NODE_ENV === "development",
  });

  return (
    <div className="flex flex-col gap-6">
      <RestaurantWorkspaceHeader
        id={restaurant.id}
        name={restaurant.businessName}
        slug={restaurant.slug}
        publicHostname={restaurant.publicHostname}
        publicHref={publicHref}
        isPublished={restaurant.isPublished}
        mode="operator"
        current="menu"
      />

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
