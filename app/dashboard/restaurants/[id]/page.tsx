import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CoreEditorForm } from "@/components/admin/CoreEditorForm";
import { RestaurantWorkspaceHeader } from "@/components/shared/RestaurantWorkspaceHeader";
import { restaurantToCoreFormData } from "@/lib/core-form-data";
import { publicMenuUrl } from "@/lib/public-url";

export default async function RestaurantEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await prisma.restaurant.findUnique({ where: { id } });
  if (!r) notFound();
  const publicHref = publicMenuUrl({
    slug: r.slug,
    publicHostname: r.publicHostname,
    applicationOrigin: process.env.NEXT_PUBLIC_SITE_URL,
    preferApplicationOrigin: process.env.NODE_ENV === "development",
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <RestaurantWorkspaceHeader
        id={r.id}
        name={r.businessName}
        slug={r.slug}
        publicHostname={r.publicHostname}
        publicHref={publicHref}
        isPublished={r.isPublished}
        hasUnpublishedChanges={Boolean(
          r.draftUpdatedAt && (!r.publishedAt || r.draftUpdatedAt > r.publishedAt)
        )}
        mode="operator"
        current="settings"
      />

      <CoreEditorForm
        restaurant={restaurantToCoreFormData(r)}
      />
    </div>
  );
}
