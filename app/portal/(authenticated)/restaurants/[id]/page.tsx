import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, LayoutList } from "lucide-react";
import { CoreEditorForm } from "@/components/admin/CoreEditorForm";
import { QrDialog } from "@/components/admin/QrDialog";
import { Button } from "@/components/ui/button";
import { requireRestaurantAccess } from "@/lib/authorization";
import { restaurantToCoreFormData } from "@/lib/core-form-data";
import { prisma } from "@/lib/prisma";
import { publicMenuUrl } from "@/lib/public-url";

export default async function CustomerRestaurantSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRestaurantAccess(id, "EDITOR");
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) notFound();
  const publicHref = publicMenuUrl({
    slug: restaurant.slug,
    publicHostname: restaurant.publicHostname,
    applicationOrigin: process.env.NEXT_PUBLIC_SITE_URL,
    preferApplicationOrigin: process.env.NODE_ENV === "development",
  });
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/portal" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Overview</Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-semibold">{restaurant.businessName}</h1><p className="text-sm text-muted-foreground">Restaurant settings</p></div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" nativeButton={false} render={<Link href={`/portal/restaurants/${id}/menu`} />}><LayoutList className="size-4" /> Menu</Button>
            <QrDialog slug={restaurant.slug} name={restaurant.businessName} publicHostname={restaurant.publicHostname} />
            {restaurant.isPublished && <Button size="sm" variant="outline" nativeButton={false} render={<a href={publicHref} target="_blank" rel="noreferrer" />}><ExternalLink className="size-4" /> View live</Button>}
          </div>
        </div>
      </div>
      <CoreEditorForm restaurant={restaurantToCoreFormData(restaurant)} customerMode />
    </div>
  );
}
