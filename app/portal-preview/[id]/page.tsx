import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MenuTemplate } from "@/components/menu/MenuTemplate";
import { Button } from "@/components/ui/button";
import { requireRestaurantAccess } from "@/lib/authorization";
import { currentMenuData } from "@/lib/menu";

export default async function CustomerDraftPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRestaurantAccess(id, "VIEWER");
  const restaurant = await currentMenuData(id);
  if (!restaurant) notFound();
  return (
    <>
      <div className="fixed left-3 top-3 z-[100]">
        <Button size="sm" variant="secondary" nativeButton={false} render={<Link href={`/portal/restaurants/${id}/menu`} />}>
          <ArrowLeft className="size-4" /> Exit draft preview
        </Button>
      </div>
      <MenuTemplate menu={restaurant} />
    </>
  );
}
