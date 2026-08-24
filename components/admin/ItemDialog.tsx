"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import type { AllergenOption, BuilderItem } from "@/lib/builder-types";
import { toBuilderItem } from "@/lib/builder-types";
import { createItem, updateItem } from "@/lib/actions/item";
import { ImageField, type ImageFieldHandle } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePanelI18n } from "@/components/shared/PanelI18nProvider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { LocalizedLanguageSelector } from "@/components/admin/LocalizedLanguageSelector";
import { LANGS, type Lang } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EMPTY = {
  name: "", nameEn: "", nameAr: "", nameRu: "", nameDe: "", nameFr: "", nameEs: "", nameIt: "", namePl: "", nameZh: "",
  description: "", descriptionEn: "", descriptionAr: "", descriptionRu: "", descriptionDe: "", descriptionFr: "", descriptionEs: "", descriptionIt: "", descriptionPl: "", descriptionZh: "",
  price: "", imageUrl: "", ingredients: "", portionAmount: "", portionUnit: "G" as "G" | "ML" | "L",
  isNew: false, isFeatured: false, isAvailable: true, hasAlcohol: false, hasPork: false,
  allergenIds: [] as number[],
  energyKcal: "", protein: "", fat: "", saturatedFat: "", carbohydrate: "",
  sugar: "", fiber: "", saltG: "", nutritionBasis: "", nutritionEstimated: false,
};

type FormState = typeof EMPTY;

const NAME_FIELDS = ["name", "nameEn", "nameAr", "nameRu", "nameDe", "nameFr", "nameEs", "nameIt", "namePl", "nameZh"] as const;
const DESCRIPTION_FIELDS = ["description", "descriptionEn", "descriptionAr", "descriptionRu", "descriptionDe", "descriptionFr", "descriptionEs", "descriptionIt", "descriptionPl", "descriptionZh"] as const;

function numOrNull(s: string): number | null {
  return s.trim() === "" ? null : Number(s);
}

function stateFor(editing?: BuilderItem): FormState {
  if (!editing) return { ...EMPTY, allergenIds: [] };
  return {
    name: editing.name, nameEn: editing.nameEn, nameAr: editing.nameAr, nameRu: editing.nameRu, nameDe: editing.nameDe, nameFr: editing.nameFr, nameEs: editing.nameEs, nameIt: editing.nameIt, namePl: editing.namePl, nameZh: editing.nameZh,
    description: editing.description, descriptionEn: editing.descriptionEn, descriptionAr: editing.descriptionAr, descriptionRu: editing.descriptionRu, descriptionDe: editing.descriptionDe, descriptionFr: editing.descriptionFr, descriptionEs: editing.descriptionEs, descriptionIt: editing.descriptionIt, descriptionPl: editing.descriptionPl, descriptionZh: editing.descriptionZh,
    price: String(editing.price), imageUrl: editing.imageUrl, ingredients: editing.ingredients,
    portionAmount: editing.portionAmount?.toString() ?? "",
    portionUnit: editing.portionUnit ?? "G",
    isNew: editing.isNew, isFeatured: editing.isFeatured, isAvailable: editing.isAvailable,
    hasAlcohol: editing.hasAlcohol, hasPork: editing.hasPork,
    allergenIds: editing.allergenIds,
    energyKcal: editing.energyKcal?.toString() ?? "",
    protein: editing.protein?.toString() ?? "",
    fat: editing.fat?.toString() ?? "",
    saturatedFat: editing.saturatedFat?.toString() ?? "",
    carbohydrate: editing.carbohydrate?.toString() ?? "",
    sugar: editing.sugar?.toString() ?? "",
    fiber: editing.fiber?.toString() ?? "",
    saltG: editing.saltG?.toString() ?? "",
    nutritionBasis: editing.nutritionBasis,
    nutritionEstimated: editing.nutritionEstimated,
  };
}

export function ItemDialog({
  categoryId,
  restaurantSlug,
  allergens,
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  categoryId: string;
  restaurantSlug: string;
  allergens: AllergenOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: BuilderItem;
  onSaved: (item: BuilderItem) => void;
}) {
  const { t } = usePanelI18n();
  const [pending, startTransition] = useTransition();
  const [f, setF] = useState<FormState>(() => stateFor(editing));
  const [activeLanguage, setActiveLanguage] = useState<Lang>("tr");
  const imageFieldRef = useRef<ImageFieldHandle>(null);
  const activeLanguageIndex = LANGS.indexOf(activeLanguage);
  const activeNameField = NAME_FIELDS[activeLanguageIndex];
  const activeDescriptionField = DESCRIPTION_FIELDS[activeLanguageIndex];
  const filledLanguages = new Set(
    LANGS.filter((_, index) =>
      Boolean(
        f[NAME_FIELDS[index]].trim() ||
          f[DESCRIPTION_FIELDS[index]].trim(),
      ),
    ),
  );

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  function toggleAllergen(id: number) {
    setF((prev) => ({
      ...prev,
      allergenIds: prev.allergenIds.includes(id)
        ? prev.allergenIds.filter((x) => x !== id)
        : [...prev.allergenIds, id],
    }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const input = {
        name: f.name, nameEn: f.nameEn, nameAr: f.nameAr, nameRu: f.nameRu, nameDe: f.nameDe, nameFr: f.nameFr, nameEs: f.nameEs, nameIt: f.nameIt, namePl: f.namePl, nameZh: f.nameZh,
        description: f.description, descriptionEn: f.descriptionEn, descriptionAr: f.descriptionAr, descriptionRu: f.descriptionRu, descriptionDe: f.descriptionDe, descriptionFr: f.descriptionFr, descriptionEs: f.descriptionEs, descriptionIt: f.descriptionIt, descriptionPl: f.descriptionPl, descriptionZh: f.descriptionZh,
        price: Number(f.price) || 0,
        portionAmount: numOrNull(f.portionAmount),
        portionUnit: f.portionAmount.trim() ? f.portionUnit : null,
        imageUrl: f.imageUrl,
        ingredients: f.ingredients,
        isNew: f.isNew, isFeatured: f.isFeatured, isAvailable: f.isAvailable,
        hasAlcohol: f.hasAlcohol, hasPork: f.hasPork,
        allergenIds: f.allergenIds,
        energyKcal: numOrNull(f.energyKcal),
        protein: numOrNull(f.protein),
        fat: numOrNull(f.fat),
        saturatedFat: numOrNull(f.saturatedFat),
        carbohydrate: numOrNull(f.carbohydrate),
        sugar: numOrNull(f.sugar),
        fiber: numOrNull(f.fiber),
        saltG: numOrNull(f.saltG),
        nutritionBasis: f.nutritionBasis
          ? (f.nutritionBasis as "100g" | "100ml" | "per portion")
          : null,
        nutritionEstimated: f.nutritionEstimated,
      };
      const res = editing
        ? await updateItem(editing.id, input)
        : await createItem(categoryId, input);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      imageFieldRef.current?.commitUpload();
      onSaved(toBuilderItem(res.data));
      onOpenChange(false);
      toast.success(editing ? "Item updated" : "Item added");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t(editing ? "Edit item" : "New item")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <ImageField
            ref={imageFieldRef}
            value={f.imageUrl}
            onChange={(url) => set("imageUrl", url)}
            slug={restaurantSlug}
            label="Photo"
          />

          <div className="flex flex-col gap-3 rounded-lg border p-3">
            <LocalizedLanguageSelector
              activeLanguage={activeLanguage}
              filledLanguages={filledLanguages}
              onChange={setActiveLanguage}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor={`item-name-${activeLanguage}`}>{t("Name")}</Label>
              <Input
                key={`name-${activeLanguage}`}
                id={`item-name-${activeLanguage}`}
                value={f[activeNameField]}
                dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                required={activeLanguage === "tr"}
                onChange={(event) => set(activeNameField, event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`item-description-${activeLanguage}`}>{t("Description")}</Label>
              <Textarea
                key={`description-${activeLanguage}`}
                id={`item-description-${activeLanguage}`}
                value={f[activeDescriptionField]}
                dir={activeLanguage === "ar" ? "rtl" : "ltr"}
                rows={2}
                onChange={(event) => set(activeDescriptionField, event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_5rem] gap-4 sm:grid-cols-[1fr_1fr_6rem]">
            <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
              <Label htmlFor="price">{t("Price (₺)")}</Label>
              <Input
                id="price"
                inputMode="numeric"
                value={f.price}
                onChange={(e) => set("price", e.target.value.replace(/[^0-9]/g, ""))}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="portionAmount">{t("Portion")}</Label>
              <Input
                id="portionAmount"
                type="number"
                inputMode="decimal"
                min="0.01"
                max="100000"
                step="any"
                value={f.portionAmount}
                onChange={(e) => set("portionAmount", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="portionUnit">{t("Unit")}</Label>
              <select
                id="portionUnit"
                value={f.portionUnit}
                onChange={(e) => set("portionUnit", e.target.value as FormState["portionUnit"])}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              >
                <option value="G">g</option>
                <option value="ML">ml</option>
                <option value="L">L</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ingredients">{t("Ingredients (TR)")}</Label>
            <Input id="ingredients" value={f.ingredients} onChange={(e) => set("ingredients", e.target.value)} />
          </div>

          {/* Allergens */}
          <div className="flex flex-col gap-2">
            <Label>{t("Allergens")}</Label>
            <div className="flex flex-wrap gap-1.5">
              {allergens.map((a) => {
                const on = f.allergenIds.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAllergen(a.id)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition ${
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="mr-1">{a.icon}</span>
                    {a.nameTr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flags */}
          <div className="grid grid-cols-2 gap-3">
            <Toggle label="Available" checked={f.isAvailable} onChange={(v) => set("isAvailable", v)} />
            <Toggle label="New" checked={f.isNew} onChange={(v) => set("isNew", v)} />
            <Toggle label="Featured" checked={f.isFeatured} onChange={(v) => set("isFeatured", v)} />
            <Toggle label="Contains alcohol" checked={f.hasAlcohol} onChange={(v) => set("hasAlcohol", v)} />
            <Toggle label="Contains pork" checked={f.hasPork} onChange={(v) => set("hasPork", v)} />
          </div>

          <Separator />

          {/* Nutrition (optional) */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label className="text-muted-foreground">{t("Nutrition (optional)")}</Label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                Estimated
                <Switch checked={f.nutritionEstimated} onCheckedChange={(v) => set("nutritionEstimated", v)} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <NumField label="kcal" value={f.energyKcal} onChange={(v) => set("energyKcal", v)} />
              <NumField label="Protein" value={f.protein} onChange={(v) => set("protein", v)} />
              <NumField label="Fat" value={f.fat} onChange={(v) => set("fat", v)} />
              <NumField label="Saturated" value={f.saturatedFat} onChange={(v) => set("saturatedFat", v)} />
              <NumField label="Carbs" value={f.carbohydrate} onChange={(v) => set("carbohydrate", v)} />
              <NumField label="Sugar" value={f.sugar} onChange={(v) => set("sugar", v)} />
              <NumField label="Fiber" value={f.fiber} onChange={(v) => set("fiber", v)} />
              <NumField label="Salt" value={f.saltG} onChange={(v) => set("saltG", v)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="nutritionBasis" className="text-xs text-muted-foreground">{t("Basis")}</Label>
              <select
                id="nutritionBasis"
                value={f.nutritionBasis}
                onChange={(e) => set("nutritionBasis", e.target.value)}
                className="h-9 rounded-md border bg-background px-3 text-sm"
              >
                <option value="">{t("Not specified")}</option>
                <option value="per portion">{t("Per portion")}</option>
                <option value="100g">{t("Per 100 g")}</option>
                <option value="100ml">{t("Per 100 ml")}</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending || !f.name || f.price === ""}>
              {pending ? t("Saving…") : t("Save item")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
      {label}
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        className="h-8"
      />
    </div>
  );
}
