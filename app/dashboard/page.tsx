import Link from "next/link";
import { Plus, UtensilsCrossed } from "lucide-react";
import { listRestaurants } from "@/lib/admin-data";
import { Button } from "@/components/ui/button";
import { RestaurantCard } from "@/components/admin/RestaurantCard";

export default async function DashboardPage() {
  const restaurants = await listRestaurants();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Restaurants</h1>
          <p className="text-sm text-muted-foreground">
            {restaurants.length} total
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/restaurants/new" />}>
          <Plus className="size-4" />
          New restaurant
        </Button>
      </div>

      {restaurants.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <UtensilsCrossed className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">No restaurants yet.</p>
          <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/restaurants/new" />}>
            Create your first one
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={{
                id: r.id,
                slug: r.slug,
                businessName: r.businessName,
                businessType: r.businessType,
                isPublished: r.isPublished,
                categoryCount: r._count.categories,
                publicHostname: r.publicHostname,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
