"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { slugify } from "@/lib/slug";
import { THEMES, resolveTheme } from "@/lib/themes";
import { updateRestaurantCore } from "@/lib/actions/restaurant";
import type { Lang } from "@/lib/i18n";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANG_LABEL: Record<Lang, string> = {
  tr: "Türkçe",
  en: "English",
  ar: "العربية",
};

const themeOptions = Object.entries(THEMES).map(([id, t]) => ({
  value: id,
  label: t.label,
}));

const OVERRIDES = [
  { key: "themeAccent", token: "accent", label: "Accent" },
  { key: "themePrimary", token: "primary", label: "Primary" },
  { key: "themeSecondary", token: "secondary", label: "Secondary" },
  { key: "themeBackground", token: "background", label: "Background" },
  { key: "themeBorder", token: "border", label: "Border" },
  { key: "themeText", token: "text", label: "Text" },
] as const;

export interface CoreFormData {
  id: string;
  businessName: string;
  slug: string;
  businessType: string;
  templateType: string;
  categoryNavigationStyle: "DRILLDOWN" | "ACCORDION";
  defaultLang: Lang;
  enabledLangs: Lang[];
  logo: string;
  coverImage: string;
  splashImage: string;
  splashEnabled: boolean;
  publicHostname: string;
  slogan: string;
  sloganEn: string;
  sloganAr: string;
  establishedYear: number | null;
  currencyCode: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  websiteUrl: string;
  address: string;
  city: string;
  district: string;
  workingHours: string;
  workingHoursEn: string;
  workingHoursAr: string;
  instagramUrl: string;
  tiktokUrl: string;
  googleMapsUrl: string;
  googleReviewsUrl: string;
  kdvNotice: string;
  kdvNoticeEn: string;
  kdvNoticeAr: string;
  allergenNotice: string;
  allergenNoticeEn: string;
  allergenNoticeAr: string;
  nutritionNotice: string;
  nutritionNoticeEn: string;
  nutritionNoticeAr: string;
  lastPriceChangeAt: string;
  attributionText: string;
  attributionUrl: string;
  themeAccent: string;
  themePrimary: string;
  themeSecondary: string;
  themeBackground: string;
  themeBorder: string;
  themeText: string;
}

export function CoreEditorForm({
  restaurant,
  customerMode = false,
}: {
  restaurant: CoreFormData;
  customerMode?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState<CoreFormData>(restaurant);

  function set<K extends keyof CoreFormData>(key: K, value: CoreFormData[K]) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  const themeDefaults = resolveTheme(f.templateType, {}).colors;

  function toggleLang(l: Lang) {
    const has = f.enabledLangs.includes(l);
    const next = has
      ? f.enabledLangs.filter((x) => x !== l)
      : [...f.enabledLangs, l];
    if (next.length === 0) return; // keep at least one
    const defaultLang = next.includes(f.defaultLang) ? f.defaultLang : next[0];
    setF((prev) => ({ ...prev, enabledLangs: next, defaultLang }));
  }

  function onSave() {
    startTransition(async () => {
      const res = await updateRestaurantCore(f.id, {
        businessName: f.businessName,
        slug: f.slug,
        businessType: f.businessType,
        templateType: f.templateType,
        categoryNavigationStyle: f.categoryNavigationStyle,
        defaultLang: f.defaultLang,
        enabledLangs: f.enabledLangs,
        logo: f.logo,
        coverImage: f.coverImage,
        splashImage: f.splashImage,
        splashEnabled: f.splashEnabled,
        publicHostname: f.publicHostname.trim().toLowerCase(),
        slogan: f.slogan,
        sloganEn: f.sloganEn,
        sloganAr: f.sloganAr,
        establishedYear: f.establishedYear,
        currencyCode: f.currencyCode.trim().toUpperCase(),
        phone: f.phone,
        email: f.email,
        whatsappNumber: f.whatsappNumber,
        websiteUrl: f.websiteUrl,
        address: f.address,
        city: f.city,
        district: f.district,
        workingHours: f.workingHours,
        workingHoursEn: f.workingHoursEn,
        workingHoursAr: f.workingHoursAr,
        instagramUrl: f.instagramUrl,
        tiktokUrl: f.tiktokUrl,
        googleMapsUrl: f.googleMapsUrl,
        googleReviewsUrl: f.googleReviewsUrl,
        kdvNotice: f.kdvNotice,
        kdvNoticeEn: f.kdvNoticeEn,
        kdvNoticeAr: f.kdvNoticeAr,
        allergenNotice: f.allergenNotice,
        allergenNoticeEn: f.allergenNoticeEn,
        allergenNoticeAr: f.allergenNoticeAr,
        nutritionNotice: f.nutritionNotice,
        nutritionNoticeEn: f.nutritionNoticeEn,
        nutritionNoticeAr: f.nutritionNoticeAr,
        lastPriceChangeAt: f.lastPriceChangeAt,
        attributionText: f.attributionText,
        attributionUrl: f.attributionUrl,
        themeAccent: f.themeAccent,
        themePrimary: f.themePrimary,
        themeSecondary: f.themeSecondary,
        themeBackground: f.themeBackground,
        themeBorder: f.themeBorder,
        themeText: f.themeText,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Saved");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Basics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              value={f.businessName}
              onChange={(e) => set("businessName", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>/</span>
              <Input
                id="slug"
                value={f.slug}
                onChange={(e) => set("slug", slugify(e.target.value))}
                disabled={customerMode}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="businessType">Business type</Label>
            <Input
              id="businessType"
              value={f.businessType}
              onChange={(e) => set("businessType", e.target.value)}
              placeholder="e.g. Kebapçı"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Template</Label>
            <Select
              value={f.templateType}
              onValueChange={(v) => set("templateType", v ?? f.templateType)}
              disabled={customerMode}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-6">
            <ImageField
              value={f.logo}
              onChange={(url) => set("logo", url)}
              slug={f.slug}
              kind="logo"
              label="Logo"
            />
            <ImageField
              value={f.coverImage}
              onChange={(url) => set("coverImage", url)}
              slug={f.slug}
              kind="cover"
              label="Cover image"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slogan">Slogan (Türkçe)</Label>
            <Input id="slogan" value={f.slogan} onChange={(e) => set("slogan", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sloganEn">Slogan (EN)</Label>
              <Input id="sloganEn" value={f.sloganEn} onChange={(e) => set("sloganEn", e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sloganAr">Slogan (AR)</Label>
              <Input id="sloganAr" value={f.sloganAr} onChange={(e) => set("sloganAr", e.target.value)} dir="rtl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Splash and public address</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label className="flex items-center gap-3 text-sm">
            <Checkbox
              checked={f.splashEnabled}
              onCheckedChange={(checked) => set("splashEnabled", Boolean(checked))}
            />
            Show the branded welcome screen before the menu
          </label>
          <ImageField
            value={f.splashImage}
            onChange={(url) => set("splashImage", url)}
            slug={f.slug}
            kind="splash"
            label="Splash background (optional)"
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="publicHostname">Custom hostname</Label>
            <Input
              id="publicHostname"
              value={f.publicHostname}
              onChange={(e) => set("publicHostname", e.target.value.trim().toLowerCase())}
              placeholder="menu.example.com"
              disabled={customerMode}
            />
            <p className="text-xs text-muted-foreground">
              Hostname only—no protocol or path. DNS is configured separately.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Restaurant details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" value={f.phone} onChange={(v) => set("phone", v)} placeholder="+90 …" />
            <Field label="Email" value={f.email} onChange={(v) => set("email", v)} placeholder="hello@example.com" type="email" />
            <Field label="WhatsApp number" value={f.whatsappNumber} onChange={(v) => set("whatsappNumber", v)} placeholder="+90 …" />
            <Field label="Website URL" value={f.websiteUrl} onChange={(v) => set("websiteUrl", v)} placeholder="https://…" type="url" />
            <Field label="District" value={f.district} onChange={(v) => set("district", v)} />
            <Field label="City" value={f.city} onChange={(v) => set("city", v)} />
            <Field
              label="Established year"
              value={f.establishedYear?.toString() ?? ""}
              onChange={(v) => set("establishedYear", v ? Number(v) : null)}
              placeholder="1978"
              type="number"
            />
            <Field
              label="Currency code"
              value={f.currencyCode}
              onChange={(v) => set("currencyCode", v.toUpperCase().slice(0, 3))}
              placeholder="TRY"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" value={f.address} onChange={(e) => set("address", e.target.value)} rows={2} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Google Maps URL" value={f.googleMapsUrl} onChange={(v) => set("googleMapsUrl", v)} />
            <Field label="Google Reviews URL" value={f.googleReviewsUrl} onChange={(v) => set("googleReviewsUrl", v)} />
            <Field label="Instagram URL" value={f.instagramUrl} onChange={(v) => set("instagramUrl", v)} />
            <Field label="TikTok URL" value={f.tiktokUrl} onChange={(v) => set("tiktokUrl", v)} />
          </div>
          <LocalizedTextareas
            label="Working hours"
            values={[f.workingHours, f.workingHoursEn, f.workingHoursAr]}
            onChange={(index, value) => set((["workingHours", "workingHoursEn", "workingHoursAr"] as const)[index], value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Menu notices</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <LocalizedTextareas
            label="KDV / tax notice"
            values={[f.kdvNotice, f.kdvNoticeEn, f.kdvNoticeAr]}
            onChange={(index, value) => set((["kdvNotice", "kdvNoticeEn", "kdvNoticeAr"] as const)[index], value)}
          />
          <Field
            label="Last price update"
            value={f.lastPriceChangeAt}
            onChange={(v) => set("lastPriceChangeAt", v)}
            type="date"
          />
          <LocalizedTextareas
            label="Allergen notice"
            values={[f.allergenNotice, f.allergenNoticeEn, f.allergenNoticeAr]}
            onChange={(index, value) => set((["allergenNotice", "allergenNoticeEn", "allergenNoticeAr"] as const)[index], value)}
          />
          <LocalizedTextareas
            label="Nutrition notice"
            values={[f.nutritionNotice, f.nutritionNoticeEn, f.nutritionNoticeAr]}
            onChange={(index, value) => set((["nutritionNotice", "nutritionNoticeEn", "nutritionNoticeAr"] as const)[index], value)}
          />
          <p className="text-xs text-muted-foreground">
            Leave notices and dates blank when the restaurant has not supplied or approved the facts.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Footer attribution</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Attribution text"
            value={f.attributionText}
            onChange={(v) => set("attributionText", v)}
            placeholder="Powered by Menufy"
          />
          <Field
            label="Attribution URL"
            value={f.attributionUrl}
            onChange={(v) => set("attributionUrl", v)}
            placeholder="https://…"
            type="url"
          />
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Optional. Leave the text blank to hide attribution.
          </p>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Languages</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Enabled languages</Label>
            <div className="flex flex-wrap gap-4">
              {(["tr", "en", "ar"] as Lang[]).map((l) => (
                <label key={l} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={f.enabledLangs.includes(l)}
                    onCheckedChange={() => toggleLang(l)}
                  />
                  {LANG_LABEL[l]}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Default language</Label>
            <Select
              value={f.defaultLang}
              onValueChange={(v) => v && set("defaultLang", v as Lang)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {f.enabledLangs.map((l) => (
                  <SelectItem key={l} value={l}>
                    {LANG_LABEL[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label>Category navigation style</Label>
            <Select
              value={f.categoryNavigationStyle}
              onValueChange={(v) =>
                v && set("categoryNavigationStyle", v as CoreFormData["categoryNavigationStyle"])
              }
            >
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRILLDOWN">Drilldown (sticky tabs)</SelectItem>
                <SelectItem value="ACCORDION">Accordion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Palette overrides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Colors (optional)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Override the template&apos;s palette. Unchecked = use the template default.
          </p>
          {OVERRIDES.map((o) => {
            const val = f[o.key] as string;
            const enabled = val !== "";
            const def = themeDefaults[o.token];
            return (
              <div key={o.key} className="flex items-center gap-3">
                <Checkbox
                  checked={enabled}
                  onCheckedChange={(c) => set(o.key, c ? def : "")}
                />
                <Label className="w-24 shrink-0">{o.label}</Label>
                <input
                  type="color"
                  disabled={!enabled}
                  value={enabled ? val : def}
                  onChange={(e) => set(o.key, e.target.value)}
                  className="h-8 w-12 cursor-pointer rounded border disabled:opacity-40"
                />
                <span className="font-mono text-xs text-muted-foreground">
                  {enabled ? val : `default ${def}`}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={onSave} disabled={pending} size="lg" className="shadow-lg">
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
}) {
  const id = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input type={type} id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function LocalizedTextareas({
  label,
  values,
  onChange,
}: {
  label: string;
  values: [string, string, string];
  onChange: (index: number, value: string) => void;
}) {
  const placeholders = ["Türkçe", "English", "العربية"];
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {values.map((value, index) => (
        <Textarea
          key={placeholders[index]}
          value={value}
          onChange={(e) => onChange(index, e.target.value)}
          placeholder={placeholders[index]}
          dir={index === 2 ? "rtl" : "ltr"}
          rows={2}
        />
      ))}
    </div>
  );
}
