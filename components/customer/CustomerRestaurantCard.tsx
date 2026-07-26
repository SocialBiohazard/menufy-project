"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ExternalLink, LayoutList, Settings } from "lucide-react";
import { toast } from "sonner";
import { togglePublish } from "@/lib/actions/restaurant";
import { publicMenuUrl } from "@/lib/public-url";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function CustomerRestaurantCard({
  restaurant,
  canEdit,
}: {
  restaurant: {
    id: string;
    slug: string;
    businessName: string;
    publicHostname: string | null;
    isPublished: boolean;
    hasUnpublishedChanges: boolean;
    categoryCount: number;
    role: string;
  };
  canEdit: boolean;
}) {
  const [published, setPublished] = useState(restaurant.isPublished);
  const [pending, startTransition] = useTransition();
  const href = publicMenuUrl({
    slug: restaurant.slug,
    publicHostname: restaurant.publicHostname,
    preferApplicationOrigin: process.env.NODE_ENV === "development",
  });
  function publish(next: boolean) {
    setPublished(next);
    startTransition(async () => {
      const result = await togglePublish(restaurant.id, next);
      if (!result.ok) {
        setPublished(!next);
        toast.error(result.error);
      } else {
        toast.success(next ? "Published current draft" : "Menu taken offline");
      }
    });
  }
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">{restaurant.businessName}</h2>
            <p className="text-sm text-muted-foreground">/{restaurant.slug} · {restaurant.role.toLowerCase()}</p>
          </div>
          <Badge variant={published ? "default" : "secondary"}>{published ? "Live" : "Offline"}</Badge>
        </div>
        {restaurant.hasUnpublishedChanges && <Badge variant="outline" className="w-fit">Unpublished changes</Badge>}
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{restaurant.categoryCount} categories</p>
        {canEdit && (
          <label className="flex items-center gap-2 text-foreground">
            <Switch checked={published} onCheckedChange={publish} disabled={pending} />
            Published
          </label>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {canEdit && (
          <>
            <Button size="sm" variant="secondary" nativeButton={false} render={<Link href={`/portal/restaurants/${restaurant.id}/menu`} />}>
              <LayoutList className="size-4" /> Menu
            </Button>
            <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/portal/restaurants/${restaurant.id}`} />}>
              <Settings className="size-4" /> Settings
            </Button>
          </>
        )}
        {published && (
          <Button size="sm" variant="ghost" nativeButton={false} render={<a href={href} target="_blank" rel="noreferrer" />}>
            <ExternalLink className="size-4" /> View live
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
