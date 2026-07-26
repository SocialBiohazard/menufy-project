import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, LayoutList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CoreEditorForm } from "@/components/admin/CoreEditorForm";
import { QrDialog } from "@/components/admin/QrDialog";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/lib/i18n";
import { publicMenuUrl } from "@/lib/public-url";

function workingHoursText(value: unknown, field = "display"): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const display = (value as Record<string, unknown>)[field];
  return typeof display === "string" ? display : "";
}

function dateInputValue(value: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : "";
}

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
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/dashboard"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">{r.businessName}</h1>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              nativeButton={false}
              render={<Link href={`/dashboard/restaurants/${r.id}/menu`} />}
            >
              <LayoutList className="size-4" />
              Menu builder
            </Button>
            <QrDialog slug={r.slug} name={r.businessName} publicHostname={r.publicHostname} />
            {r.isPublished && (
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<a href={publicHref} target="_blank" rel="noreferrer" />}
              >
                <ExternalLink className="size-4" />
                View live
              </Button>
            )}
          </div>
        </div>
      </div>

      <CoreEditorForm
        restaurant={{
          id: r.id,
          businessName: r.businessName,
          slug: r.slug,
          businessType: r.businessType ?? "",
          templateType: r.templateType,
          categoryNavigationStyle: r.categoryNavigationStyle,
          defaultLang: r.defaultLang as Lang,
          enabledLangs: r.enabledLangs as Lang[],
          logo: r.logo ?? "",
          coverImage: r.coverImage ?? "",
          splashImage: r.splashImage ?? "",
          splashEnabled: r.splashEnabled,
          publicHostname: r.publicHostname ?? "",
          slogan: r.slogan ?? "",
          sloganEn: r.sloganEn ?? "",
          sloganAr: r.sloganAr ?? "",
          establishedYear: r.establishedYear,
          currencyCode: r.currencyCode,
          phone: r.phone ?? "",
          email: r.email ?? "",
          whatsappNumber: r.whatsappNumber ?? "",
          websiteUrl: r.websiteUrl ?? "",
          address: r.address ?? "",
          city: r.city ?? "",
          district: r.district ?? "",
          workingHours: workingHoursText(r.workingHours),
          workingHoursEn: workingHoursText(r.workingHours, "displayEn"),
          workingHoursAr: workingHoursText(r.workingHours, "displayAr"),
          instagramUrl: r.instagramUrl ?? "",
          tiktokUrl: r.tiktokUrl ?? "",
          googleMapsUrl: r.googleMapsUrl ?? "",
          googleReviewsUrl: r.googleReviewsUrl ?? "",
          kdvNotice: r.kdvNotice ?? "",
          kdvNoticeEn: r.kdvNoticeEn ?? "",
          kdvNoticeAr: r.kdvNoticeAr ?? "",
          allergenNotice: r.allergenNotice ?? "",
          allergenNoticeEn: r.allergenNoticeEn ?? "",
          allergenNoticeAr: r.allergenNoticeAr ?? "",
          nutritionNotice: r.nutritionNotice ?? "",
          nutritionNoticeEn: r.nutritionNoticeEn ?? "",
          nutritionNoticeAr: r.nutritionNoticeAr ?? "",
          lastPriceChangeAt: dateInputValue(r.lastPriceChangeAt),
          attributionText: r.attributionText ?? "",
          attributionUrl: r.attributionUrl ?? "",
          themeAccent: r.themeAccent ?? "",
          themePrimary: r.themePrimary ?? "",
          themeSecondary: r.themeSecondary ?? "",
          themeBackground: r.themeBackground ?? "",
          themeBorder: r.themeBorder ?? "",
          themeText: r.themeText ?? "",
        }}
      />
    </div>
  );
}
