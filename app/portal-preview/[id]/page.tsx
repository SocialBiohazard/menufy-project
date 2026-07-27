import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MenuTemplate } from "@/components/menu/MenuTemplate";
import { DraftPreviewTracker } from "@/components/customer/DraftPreviewTracker";
import { Button } from "@/components/ui/button";
import { requireRestaurantAccess } from "@/lib/authorization";
import { currentMenuData } from "@/lib/menu";

export default async function CustomerDraftPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await requireRestaurantAccess(id, "VIEWER");
  const restaurant = await currentMenuData(id);
  if (!restaurant) notFound();
  const exitHref =
    actor.type === "OPERATOR"
      ? `/dashboard/restaurants/${id}/menu`
      : `/portal/restaurants/${id}/menu`;
  return (
    <>
      <DraftPreviewTracker restaurantId={id} />
      <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between gap-3 bg-amber-300 px-3 py-2 text-sm text-amber-950 shadow-md">
        <p className="font-semibold">Draft preview — diners cannot see these changes yet.</p>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 border-amber-700 bg-amber-50 text-amber-950 hover:bg-white"
          nativeButton={false}
          render={<Link href={exitHref} />}
        >
          <ArrowLeft className="size-4" />
          Exit preview
        </Button>
      </div>
      <div className="pt-12">
        <MenuTemplate menu={restaurant} />
      </div>
    </>
  );
}
