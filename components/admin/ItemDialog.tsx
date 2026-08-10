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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EMPTY = {
  name: "", nameEn: "", nameAr: "", nameRu: "",
  description: "", descriptionEn: "", descriptionAr: "", descriptionRu: "",
  price: "", imageUrl: "", ingredients: "", portionGrams: "",
  isNew: false, isFeatured: false, isAvailable: true, hasAlcohol: false, hasPork: false,
  allergenIds: [] as number[],
  energyKcal: "", protein: "", fat: "", saturatedFat: "", carbohydrate: "",
  sugar: "", fiber: "", saltG: "", nutritionBasis: "", nutritionEstimated: false,
};

type FormState = typeof EMPTY;

function numOrNull(s: string): number | null {
  return s.trim() === "" ? null : Number(s);
}

function stateFor(editing?: BuilderItem): FormState {
  if (!editing) return { ...EMPTY, allergenIds: [] };
  return {
    name: editing.name, nameEn: editing.nameEn, nameAr: editing.nameAr, nameRu: editing.nameRu,
    description: editing.description, descriptionEn: editing.descriptionEn, descriptionAr: editing.descriptionAr, descriptionRu: editing.descriptionRu,
    price: String(editing.price), imageUrl: editing.imageUrl, ingredients: editing.ingredients,
    portionGrams: editing.portionGrams?.toString() ?? "",
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
  const imageFieldRef = useRef<ImageFieldHandle>(null);

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
        name: f.name, nameEn: f.nameEn, nameAr: f.nameAr, nameRu: f.nameRu,
        description: f.description, descriptionEn: f.descriptionEn, descriptionAr: f.descriptionAr, descriptionRu: f.descriptionRu,
        price: Number(f.price) || 0,
        portionGrams: numOrNull(f.portionGrams),
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

          {/* Names */}
          <FieldTrio
            label="Name"
            required
            values={[f.name, f.nameEn, f.nameAr, f.nameRu]}
            onChange={(i, v) => set((["name", "nameEn", "nameAr", "nameRu"] as const)[i], v)}
          />

          <div className="flex flex-col gap-2">
            <Label>{t("Description")}</Label>
            <Textarea value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Türkçe" rows={2} />
            <Textarea value={f.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} placeholder="English" rows={2} />
            <Textarea value={f.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} placeholder="العربية" dir="rtl" rows={2} />
            <Textarea value={f.descriptionRu} onChange={(e) => set("descriptionRu", e.target.value)} placeholder="Русский" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
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
              <Label htmlFor="portionGrams">{t("Portion (g)")}</Label>
              <Input
                id="portionGrams"
                inputMode="numeric"
                value={f.portionGrams}
                onChange={(e) => set("portionGrams", e.target.value.replace(/[^0-9]/g, ""))}
              />
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

function FieldTrio({
  label,
  required,
  values,
  onChange,
}: {
  label: string;
  required?: boolean;
  values: [string, string, string, string];
  onChange: (i: number, v: string) => void;
}) {
  const ph = ["Türkçe", "English", "العربية", "Русский"];
  return (
    <div className="flex flex-col gap-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {values.map((v, i) => (
        <Input
          key={i}
          value={v}
          placeholder={ph[i]}
          dir={i === 2 ? "rtl" : "ltr"}
          required={required && i === 0}
          onChange={(e) => onChange(i, e.target.value)}
        />
      ))}
    </div>
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
