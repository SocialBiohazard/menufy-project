"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  LayoutList,
  Settings,
} from "lucide-react";
import { QrDialog } from "@/components/admin/QrDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePanelI18n } from "@/components/shared/PanelI18nProvider";

export function RestaurantWorkspaceHeader({
  id,
  name,
  slug,
  publicHostname,
  publicHref,
  isPublished,
  mode,
  current,
}: {
  id: string;
  name: string;
  slug: string;
  publicHostname: string | null;
  publicHref: string;
  isPublished: boolean;
  mode: "operator" | "customer";
  current: "settings" | "menu";
}) {
  const { t } = usePanelI18n();
  const root =
    mode === "operator"
      ? `/dashboard/restaurants/${id}`
      : `/portal/restaurants/${id}`;
  const backHref = mode === "operator" ? "/dashboard" : "/portal";

  return (
    <header className="space-y-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t(mode === "operator" ? "All restaurants" : "Restaurant overview")}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t("Restaurant workspace")}
            </p>
            <Badge variant={isPublished ? "default" : "secondary"}>
              {t(isPublished ? "Live" : "Draft")}
            </Badge>
          </div>
          <h1 className="truncate text-2xl font-semibold sm:text-3xl">{name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">/{slug}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <QrDialog slug={slug} name={name} publicHostname={publicHostname} />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={`/portal-preview/${id}`} target="_blank" />}
          >
            <Eye className="size-4" />
            {t("Preview draft")}
          </Button>
          {isPublished && (
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<a href={publicHref} target="_blank" rel="noreferrer" />}
            >
              <ExternalLink className="size-4" />
              {t("View live")}
            </Button>
          )}
        </div>
      </div>

      <nav
        aria-label={`${name} ${t("workspace")}`}
        className="flex gap-1 overflow-x-auto rounded-lg border bg-background p-1"
      >
        <Button
          size="sm"
          variant={current === "settings" ? "secondary" : "ghost"}
          nativeButton={false}
          render={<Link href={root} aria-current={current === "settings" ? "page" : undefined} />}
        >
          <Settings className="size-4" />
          {t("Settings")}
        </Button>
        <Button
          size="sm"
          variant={current === "menu" ? "secondary" : "ghost"}
          nativeButton={false}
          render={<Link href={`${root}/menu`} aria-current={current === "menu" ? "page" : undefined} />}
        >
          <LayoutList className="size-4" />
          {t("Menu builder")}
        </Button>
      </nav>
    </header>
  );
}
