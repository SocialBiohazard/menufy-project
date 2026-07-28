import { notFound, redirect } from "next/navigation";
import { CoreEditorForm } from "@/components/admin/CoreEditorForm";
import { RestaurantWorkspaceHeader } from "@/components/shared/RestaurantWorkspaceHeader";
import { getRestaurantAccess } from "@/lib/authorization";
import { restaurantToCoreFormData } from "@/lib/core-form-data";
import { prisma } from "@/lib/prisma";
import { publicMenuUrl } from "@/lib/public-url";

export default async function CustomerRestaurantSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await getRestaurantAccess(id, "EDITOR");
  if (!actor) redirect("/portal");
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) notFound();
  const publicHref = publicMenuUrl({
    slug: restaurant.slug,
    publicHostname: restaurant.publicHostname,
    applicationOrigin: process.env.NEXT_PUBLIC_SITE_URL,
    preferApplicationOrigin: process.env.NODE_ENV === "development",
  });
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <RestaurantWorkspaceHeader
        id={restaurant.id}
        name={restaurant.businessName}
        slug={restaurant.slug}
        publicHostname={restaurant.publicHostname}
        publicHref={publicHref}
        isPublished={restaurant.isPublished}
        hasUnpublishedChanges={Boolean(
          restaurant.draftUpdatedAt &&
          (!restaurant.publishedAt || restaurant.draftUpdatedAt > restaurant.publishedAt)
        )}
        mode="customer"
        current="settings"
      />
      <CoreEditorForm restaurant={restaurantToCoreFormData(restaurant)} customerMode />
    </div>
  );
}
