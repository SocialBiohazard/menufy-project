"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, LayoutList, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { togglePublish, deleteRestaurant } from "@/lib/actions/restaurant";
import { publicMenuUrl } from "@/lib/public-url";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { QrDialog } from "@/components/admin/QrDialog";
import { usePanelI18n } from "@/components/shared/PanelI18nProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface RestaurantCardData {
  id: string;
  slug: string;
  businessName: string;
  businessType: string | null;
  isPublished: boolean;
  categoryCount: number;
  publicHostname: string | null;
}

export function RestaurantCard({ restaurant }: { restaurant: RestaurantCardData }) {
  const { t } = usePanelI18n();
  const [published, setPublished] = useState(restaurant.isPublished);
  const [pending, startTransition] = useTransition();
  const publicHref = publicMenuUrl({
    slug: restaurant.slug,
    publicHostname: restaurant.publicHostname,
    preferApplicationOrigin: process.env.NODE_ENV === "development",
  });

  function onTogglePublish(next: boolean) {
    setPublished(next);
    startTransition(async () => {
      const res = await togglePublish(restaurant.id, next);
      if (!res.ok) {
        setPublished(!next);
        toast.error(res.error);
      } else {
        toast.success(t(next ? "Published" : "Unpublished"));
      }
    });
  }

  function onDelete() {
    startTransition(async () => {
      const res = await deleteRestaurant(restaurant.id);
      if (!res.ok) toast.error(res.error);
      else toast.success(t("Restaurant deleted"));
    });
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">
              <Link
                href={`/dashboard/restaurants/${restaurant.id}`}
                className="hover:underline"
              >
                {restaurant.businessName}
              </Link>
            </h3>
            <p className="truncate text-sm text-muted-foreground">
              /{restaurant.slug}
              {restaurant.businessType ? ` · ${restaurant.businessType}` : ""}
            </p>
          </div>
          <Badge variant={published ? "default" : "secondary"}>
            {t(published ? "Live" : "Draft")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">
          {restaurant.categoryCount} {t(restaurant.categoryCount === 1 ? "category" : "categories")}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Switch
            id={`pub-${restaurant.id}`}
            checked={published}
            onCheckedChange={onTogglePublish}
            disabled={pending}
          />
          <Label htmlFor={`pub-${restaurant.id}`} className="text-sm">
            {t("Published")}
          </Label>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          nativeButton={false}
          render={<Link href={`/dashboard/restaurants/${restaurant.id}/menu`} />}
        >
          <LayoutList className="size-4" />
          {t("Menu")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href={`/dashboard/restaurants/${restaurant.id}`} />}
        >
          <Settings className="size-4" />
          {t("Settings")}
        </Button>
        <QrDialog slug={restaurant.slug} name={restaurant.businessName} publicHostname={restaurant.publicHostname} />
        {published && (
          <Button
            size="sm"
            variant="ghost"
            nativeButton={false}
            render={
              <a href={publicHref} target="_blank" rel="noreferrer" />
            }
          >
            <ExternalLink className="size-4" />
            {t("View")}
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                aria-label={`Delete ${restaurant.businessName}`}
              />
            }
          >
            <Trash2 className="size-4" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {restaurant.businessName}?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes the restaurant and its entire menu. This
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {t("Delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
