"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { slugify } from "@/lib/slug";
import { THEMES, resolveTheme } from "@/lib/themes";
import { updateRestaurantCore } from "@/lib/actions/restaurant";
import type { Lang } from "@/lib/i18n";
import { ImageField, type ImageFieldHandle } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import type { DayHours, FooterFieldKey, FooterVisibility } from "@/lib/restaurant-footer";
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
import { usePanelI18n } from "@/components/shared/PanelI18nProvider";

const LANG_LABEL: Record<Lang, string> = {
  tr: "Türkçe",
  en: "English",
  ar: "العربية",
  ru: "Русский",
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

const SETTINGS_SECTIONS = [
  { id: "basics", label: "Basics" },
  { id: "branding", label: "Branding" },
  { id: "public-address", label: "Public address" },
  { id: "restaurant-details", label: "Details" },
  { id: "footer", label: "Footer" },
  { id: "menu-notices", label: "Notices" },
  { id: "languages", label: "Languages" },
  { id: "appearance", label: "Appearance" },
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
  sloganRu: string;
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
  workingHoursRu: string;
  timezone: string;
  weeklyHours: DayHours[];
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  xUrl: string;
  youtubeUrl: string;
  googleMapsUrl: string;
  googleReviewsUrl: string;
  kdvNotice: string;
  kdvNoticeEn: string;
  kdvNoticeAr: string;
  kdvNoticeRu: string;
  allergenNotice: string;
  allergenNoticeEn: string;
  allergenNoticeAr: string;
  allergenNoticeRu: string;
  nutritionNotice: string;
  nutritionNoticeEn: string;
  nutritionNoticeAr: string;
  nutritionNoticeRu: string;
  footerDescription: string;
  footerDescriptionEn: string;
  footerDescriptionAr: string;
  footerDescriptionRu: string;
  footerCopyright: string;
  footerVisibility: FooterVisibility;
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
  const { t } = usePanelI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState<CoreFormData>(restaurant);
  const logoFieldRef = useRef<ImageFieldHandle>(null);
  const coverFieldRef = useRef<ImageFieldHandle>(null);
  const splashFieldRef = useRef<ImageFieldHandle>(null);

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
        sloganRu: f.sloganRu,
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
        workingHoursRu: f.workingHoursRu,
        timezone: f.timezone,
        weeklyHours: f.weeklyHours,
        instagramUrl: f.instagramUrl,
        facebookUrl: f.facebookUrl,
        tiktokUrl: f.tiktokUrl,
        xUrl: f.xUrl,
        youtubeUrl: f.youtubeUrl,
        googleMapsUrl: f.googleMapsUrl,
        googleReviewsUrl: f.googleReviewsUrl,
        kdvNotice: f.kdvNotice,
        kdvNoticeEn: f.kdvNoticeEn,
        kdvNoticeAr: f.kdvNoticeAr,
        kdvNoticeRu: f.kdvNoticeRu,
        allergenNotice: f.allergenNotice,
        allergenNoticeEn: f.allergenNoticeEn,
        allergenNoticeAr: f.allergenNoticeAr,
        allergenNoticeRu: f.allergenNoticeRu,
        nutritionNotice: f.nutritionNotice,
        nutritionNoticeEn: f.nutritionNoticeEn,
        nutritionNoticeAr: f.nutritionNoticeAr,
        nutritionNoticeRu: f.nutritionNoticeRu,
        footerDescription: f.footerDescription,
        footerDescriptionEn: f.footerDescriptionEn,
        footerDescriptionAr: f.footerDescriptionAr,
        footerDescriptionRu: f.footerDescriptionRu,
        footerCopyright: f.footerCopyright,
        footerVisibility: f.footerVisibility,
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
      logoFieldRef.current?.commitUpload();
      coverFieldRef.current?.commitUpload();
      splashFieldRef.current?.commitUpload();
      toast.success(t("Saved"));
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <nav
        aria-label={t("Settings sections")}
        className="sticky top-[6.6rem] z-20 -mx-1 flex gap-1 overflow-x-auto rounded-lg border bg-background/95 p-1 shadow-sm backdrop-blur md:top-20"
      >
        {SETTINGS_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
              {t(section.label)}
          </a>
        ))}
      </nav>

      {/* Basics */}
      <Card id="basics" className="scroll-mt-36">
        <CardHeader>
          <CardTitle className="text-base">{t("Basics")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="businessName">{t("Business name")}</Label>
            <Input
              id="businessName"
              value={f.businessName}
              onChange={(e) => set("businessName", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">{t("Slug")}</Label>
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
            <Label htmlFor="businessType">{t("Business type")}</Label>
            <Input
              id="businessType"
              value={f.businessType}
              onChange={(e) => set("businessType", e.target.value)}
              placeholder="e.g. Kebapçı"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("Template")}</Label>
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
      <Card id="branding" className="scroll-mt-36">
        <CardHeader>
          <CardTitle className="text-base">{t("Branding")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-6">
            <ImageField
              ref={logoFieldRef}
              value={f.logo}
              onChange={(url) => set("logo", url)}
              slug={f.slug}
              kind="logo"
              label="Logo"
            />
            <ImageField
              ref={coverFieldRef}
              value={f.coverImage}
              onChange={(url) => set("coverImage", url)}
              slug={f.slug}
              kind="cover"
              label="Cover image"
            />
          </div>
          <LocalizedTextareas
            label="Slogan"
            values={[f.slogan, f.sloganEn, f.sloganAr, f.sloganRu]}
            onChange={(index, value) => set(([
              "slogan", "sloganEn", "sloganAr", "sloganRu",
            ] as const)[index], value)}
            rows={1}
          />
        </CardContent>
      </Card>

      <Card id="public-address" className="scroll-mt-36">
        <CardHeader>
          <CardTitle className="text-base">{t("Splash and public address")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label className="flex items-center gap-3 text-sm">
            <Checkbox
              checked={f.splashEnabled}
              onCheckedChange={(checked) => set("splashEnabled", Boolean(checked))}
            />
            {t("Show the branded welcome screen before the menu")}
          </label>
          <ImageField
            ref={splashFieldRef}
            value={f.splashImage}
            onChange={(url) => set("splashImage", url)}
            slug={f.slug}
            kind="splash"
            label="Splash background (optional)"
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="publicHostname">{t("Custom hostname")}</Label>
            <Input
              id="publicHostname"
              value={f.publicHostname}
              onChange={(e) => set("publicHostname", e.target.value.trim().toLowerCase())}
              placeholder="menu.example.com"
              disabled={customerMode}
            />
            <p className="text-xs text-muted-foreground">
              {t("Hostname only—no protocol or path. DNS is configured separately.")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card id="restaurant-details" className="scroll-mt-36">
        <CardHeader>
          <CardTitle className="text-base">{t("Restaurant details")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      <Card id="footer" className="scroll-mt-36">
        <CardHeader>
          <CardTitle className="text-base">{t("Restaurant footer")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            {t("Empty fields are hidden automatically. Visibility switches let you keep saved information private.")}
          </p>

          <FooterBlock
            label="Footer description"
            visible={f.footerVisibility.description}
            onVisible={(visible) => set("footerVisibility", { ...f.footerVisibility, description: visible })}
          >
            <LocalizedTextareas
              label="Footer description"
              values={[f.footerDescription, f.footerDescriptionEn, f.footerDescriptionAr, f.footerDescriptionRu]}
              onChange={(index, value) => set(([
                "footerDescription", "footerDescriptionEn", "footerDescriptionAr", "footerDescriptionRu",
              ] as const)[index], value)}
            />
          </FooterBlock>

          <div className="grid gap-4 lg:grid-cols-2">
            <FooterTextField field="phone" label="Phone" value={f.phone} onChange={(v) => set("phone", v)} visibility={f.footerVisibility} onVisibility={(next) => set("footerVisibility", next)} placeholder="+90 …" />
            <FooterTextField field="whatsapp" label="WhatsApp number" value={f.whatsappNumber} onChange={(v) => set("whatsappNumber", v)} visibility={f.footerVisibility} onVisibility={(next) => set("footerVisibility", next)} placeholder={t("Leave blank to use the phone number")} />
            <FooterTextField field="email" label="Email" value={f.email} onChange={(v) => set("email", v)} visibility={f.footerVisibility} onVisibility={(next) => set("footerVisibility", next)} placeholder="hello@example.com" type="email" />
            <FooterTextField field="website" label="Website URL" value={f.websiteUrl} onChange={(v) => set("websiteUrl", v)} visibility={f.footerVisibility} onVisibility={(next) => set("footerVisibility", next)} placeholder="https://…" type="url" />
          </div>

          <FooterBlock
            label="Address"
            visible={f.footerVisibility.address}
            onVisible={(visible) => set("footerVisibility", { ...f.footerVisibility, address: visible })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="District" value={f.district} onChange={(v) => set("district", v)} />
              <Field label="City" value={f.city} onChange={(v) => set("city", v)} />
            </div>
            <Textarea value={f.address} onChange={(e) => set("address", e.target.value)} rows={2} placeholder={t("Street address")} />
          </FooterBlock>

          <div className="grid gap-4 lg:grid-cols-2">
            <FooterTextField field="maps" label="Google Maps URL" value={f.googleMapsUrl} onChange={(v) => set("googleMapsUrl", v)} visibility={f.footerVisibility} onVisibility={(next) => set("footerVisibility", next)} placeholder={t("Optional; generated from the address when empty")} type="url" />
            <FooterTextField field="reviews" label="Google Reviews URL" value={f.googleReviewsUrl} onChange={(v) => set("googleReviewsUrl", v)} visibility={f.footerVisibility} onVisibility={(next) => set("footerVisibility", next)} type="url" />
          </div>

          <FooterBlock
            label="Opening hours"
            visible={f.footerVisibility.hours}
            onVisible={(visible) => set("footerVisibility", { ...f.footerVisibility, hours: visible })}
          >
            <Field label="Restaurant timezone" value={f.timezone} onChange={(v) => set("timezone", v)} placeholder="Europe/Istanbul" />
            <WeeklyHoursEditor value={f.weeklyHours} onChange={(weeklyHours) => set("weeklyHours", weeklyHours)} />
          </FooterBlock>

          <div>
            <h3 className="mb-3 text-sm font-semibold">{t("Social media")}</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <FooterTextField field="instagram" label="Instagram URL" value={f.instagramUrl} onChange={(v) => set("instagramUrl", v)} visibility={f.footerVisibility} onVisibility={(next) => set("footerVisibility", next)} type="url" />
              <FooterTextField field="facebook" label="Facebook URL" value={f.facebookUrl} onChange={(v) => set("facebookUrl", v)} visibility={f.footerVisibility} onVisibility={(next) => set("footerVisibility", next)} type="url" />
              <FooterTextField field="tiktok" label="TikTok URL" value={f.tiktokUrl} onChange={(v) => set("tiktokUrl", v)} visibility={f.footerVisibility} onVisibility={(next) => set("footerVisibility", next)} type="url" />
              <FooterTextField field="x" label="X URL" value={f.xUrl} onChange={(v) => set("xUrl", v)} visibility={f.footerVisibility} onVisibility={(next) => set("footerVisibility", next)} type="url" />
              <FooterTextField field="youtube" label="YouTube URL" value={f.youtubeUrl} onChange={(v) => set("youtubeUrl", v)} visibility={f.footerVisibility} onVisibility={(next) => set("footerVisibility", next)} type="url" />
            </div>
          </div>

          <FooterTextField
            field="copyright"
            label="Copyright line"
            value={f.footerCopyright}
            onChange={(v) => set("footerCopyright", v)}
            visibility={f.footerVisibility}
            onVisibility={(next) => set("footerVisibility", next)}
            placeholder={`© ${new Date().getFullYear()} ${f.businessName}.`}
          />
          <p className="text-xs text-muted-foreground">
            {t("Leave copyright empty to use the automatically generated line.")}
          </p>
        </CardContent>
      </Card>

      <Card id="menu-notices" className="scroll-mt-36">
        <CardHeader>
          <CardTitle className="text-base">{t("Menu notices")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <LocalizedTextareas
            label="KDV / tax notice"
            values={[f.kdvNotice, f.kdvNoticeEn, f.kdvNoticeAr, f.kdvNoticeRu]}
            onChange={(index, value) => set((["kdvNotice", "kdvNoticeEn", "kdvNoticeAr", "kdvNoticeRu"] as const)[index], value)}
          />
          <Field
            label="Last price update"
            value={f.lastPriceChangeAt}
            onChange={(v) => set("lastPriceChangeAt", v)}
            type="date"
          />
          <LocalizedTextareas
            label="Allergen notice"
            values={[f.allergenNotice, f.allergenNoticeEn, f.allergenNoticeAr, f.allergenNoticeRu]}
            onChange={(index, value) => set((["allergenNotice", "allergenNoticeEn", "allergenNoticeAr", "allergenNoticeRu"] as const)[index], value)}
          />
          <LocalizedTextareas
            label="Nutrition notice"
            values={[f.nutritionNotice, f.nutritionNoticeEn, f.nutritionNoticeAr, f.nutritionNoticeRu]}
            onChange={(index, value) => set((["nutritionNotice", "nutritionNoticeEn", "nutritionNoticeAr", "nutritionNoticeRu"] as const)[index], value)}
          />
          <p className="text-xs text-muted-foreground">
            {t("Leave notices and dates blank when the restaurant has not supplied or approved the facts.")}
          </p>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card id="languages" className="scroll-mt-36">
        <CardHeader>
          <CardTitle className="text-base">{t("Languages")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>{t("Enabled languages")}</Label>
            <div className="flex flex-wrap gap-4">
              {(["tr", "en", "ar", "ru"] as Lang[]).map((l) => (
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
            <Label>{t("Default language")}</Label>
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
      <Card id="appearance" className="scroll-mt-36">
        <CardHeader>
          <CardTitle className="text-base">{t("Navigation")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label>{t("Category navigation style")}</Label>
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
                <SelectItem value="DRILLDOWN">{t("Drilldown (sticky tabs)")}</SelectItem>
                <SelectItem value="ACCORDION">{t("Accordion")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Palette overrides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Colors (optional)")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {t("Override the template's palette. Unchecked = use the template default.")}
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
          {pending ? t("Saving…") : t("Save changes")}
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
  const { t } = usePanelI18n();
  const id = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{t(label)}</Label>
      <Input type={type} id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function LocalizedTextareas({
  label,
  values,
  onChange,
  rows = 2,
}: {
  label: string;
  values: [string, string, string, string];
  onChange: (index: number, value: string) => void;
  rows?: number;
}) {
  const { t } = usePanelI18n();
  const placeholders = ["Türkçe", "English", "العربية", "Русский"];
  return (
    <div className="flex flex-col gap-2">
      <Label>{t(label)}</Label>
      {values.map((value, index) => (
        <Textarea
          key={placeholders[index]}
          value={value}
          onChange={(e) => onChange(index, e.target.value)}
          placeholder={placeholders[index]}
          dir={index === 2 ? "rtl" : "ltr"}
          rows={rows}
        />
      ))}
    </div>
  );
}

function FooterBlock({
  label,
  visible,
  onVisible,
  children,
}: {
  label: string;
  visible: boolean;
  onVisible: (visible: boolean) => void;
  children: React.ReactNode;
}) {
  const { t } = usePanelI18n();
  return (
    <section className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold">{t(label)}</h3>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          {t("Show in footer")}
          <Switch checked={visible} onCheckedChange={onVisible} />
        </label>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function FooterTextField({
  field,
  label,
  value,
  onChange,
  visibility,
  onVisibility,
  placeholder,
  type = "text",
}: {
  field: FooterFieldKey;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visibility: FooterVisibility;
  onVisibility: (visibility: FooterVisibility) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
}) {
  const { t } = usePanelI18n();
  const id = `footer-${field}`;
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <Label htmlFor={id}>{t(label)}</Label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          {t("Show")}
          <Switch
            checked={visibility[field]}
            onCheckedChange={(visible) => onVisibility({ ...visibility, [field]: visible })}
          />
        </label>
      </div>
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

function WeeklyHoursEditor({
  value,
  onChange,
}: {
  value: DayHours[];
  onChange: (value: DayHours[]) => void;
}) {
  const { t } = usePanelI18n();
  const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function updateDay(day: number, patch: Partial<DayHours>) {
    onChange(value.map((entry) => entry.day === day ? { ...entry, ...patch } : entry));
  }

  function updatePeriod(day: number, index: number, key: "start" | "end", next: string) {
    const target = value.find((entry) => entry.day === day);
    if (!target) return;
    updateDay(day, {
      periods: target.periods.map((period, periodIndex) =>
        periodIndex === index ? { ...period, [key]: next } : period,
      ),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {value.map((entry) => (
        <div key={entry.day} className="rounded-lg border p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-24 text-sm font-medium">{t(dayLabels[entry.day])}</p>
            <div className="flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2">
                <Checkbox checked={entry.closed} onCheckedChange={(checked) => updateDay(entry.day, { closed: Boolean(checked), allDay: false })} />
                {t("Closed")}
              </label>
              <label className="flex items-center gap-2">
                <Checkbox checked={entry.allDay} disabled={entry.closed} onCheckedChange={(checked) => updateDay(entry.day, { allDay: Boolean(checked) })} />
                {t("Open 24 hours")}
              </label>
            </div>
          </div>
          {!entry.closed && !entry.allDay && (
            <div className="mt-3 flex flex-col gap-2">
              {entry.periods.map((period, index) => (
                <div key={`${entry.day}-${index}`} className="flex flex-wrap items-center gap-2">
                  <Input className="w-32" type="time" value={period.start} onChange={(event) => updatePeriod(entry.day, index, "start", event.target.value)} />
                  <span className="text-muted-foreground">–</span>
                  <Input className="w-32" type="time" value={period.end} onChange={(event) => updatePeriod(entry.day, index, "end", event.target.value)} />
                  {entry.periods.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => updateDay(entry.day, { periods: entry.periods.filter((_, periodIndex) => periodIndex !== index) })}>
                      {t("Remove")}
                    </Button>
                  )}
                </div>
              ))}
              {entry.periods.length < 4 && (
                <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => updateDay(entry.day, { periods: [...entry.periods, { start: "17:00", end: "22:00" }] })}>
                  {t("Add time period")}
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
