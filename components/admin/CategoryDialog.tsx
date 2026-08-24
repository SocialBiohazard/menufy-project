"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import type { BuilderCategory } from "@/lib/builder-types";
import { createCategory, updateCategory } from "@/lib/actions/category";
import { ImageField, type ImageFieldHandle } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePanelI18n } from "@/components/shared/PanelI18nProvider";
import { LocalizedLanguageSelector } from "@/components/admin/LocalizedLanguageSelector";
import { LANGS, type Lang } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SavedCategory = {
  id: string;
  name: string;
  nameEn: string | null;
  nameAr: string | null;
  nameRu: string | null;
  nameDe: string | null;
  nameFr: string | null;
  nameEs: string | null;
  nameIt: string | null;
  namePl: string | null;
  nameZh: string | null;
  imageUrl: string | null;
};

export function CategoryDialog({
  restaurantId,
  restaurantSlug,
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  restaurantId: string;
  restaurantSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: BuilderCategory;
  onSaved: (cat: SavedCategory) => void;
}) {
  const { t } = usePanelI18n();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(editing?.name ?? "");
  const [nameEn, setNameEn] = useState(editing?.nameEn ?? "");
  const [nameAr, setNameAr] = useState(editing?.nameAr ?? "");
  const [nameRu, setNameRu] = useState(editing?.nameRu ?? "");
  const [nameDe, setNameDe] = useState(editing?.nameDe ?? "");
  const [nameFr, setNameFr] = useState(editing?.nameFr ?? "");
  const [nameEs, setNameEs] = useState(editing?.nameEs ?? "");
  const [nameIt, setNameIt] = useState(editing?.nameIt ?? "");
  const [namePl, setNamePl] = useState(editing?.namePl ?? "");
  const [nameZh, setNameZh] = useState(editing?.nameZh ?? "");
  const [activeLanguage, setActiveLanguage] = useState<Lang>("tr");
  const [imageUrl, setImageUrl] = useState(editing?.imageUrl ?? "");
  const imageFieldRef = useRef<ImageFieldHandle>(null);
  const localizedNames = {
    tr: { value: name, setValue: setName },
    en: { value: nameEn, setValue: setNameEn },
    ar: { value: nameAr, setValue: setNameAr },
    ru: { value: nameRu, setValue: setNameRu },
    de: { value: nameDe, setValue: setNameDe },
    fr: { value: nameFr, setValue: setNameFr },
    es: { value: nameEs, setValue: setNameEs },
    it: { value: nameIt, setValue: setNameIt },
    pl: { value: namePl, setValue: setNamePl },
    zh: { value: nameZh, setValue: setNameZh },
  } satisfies Record<Lang, { value: string; setValue: (value: string) => void }>;
  const filledLanguages = new Set(
    LANGS.filter((language) => localizedNames[language].value.trim()),
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const input = { name, nameEn, nameAr, nameRu, nameDe, nameFr, nameEs, nameIt, namePl, nameZh, imageUrl };
      const res = editing
        ? await updateCategory(editing.id, input)
        : await createCategory(restaurantId, input);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      imageFieldRef.current?.commitUpload();
      onSaved(res.data);
      onOpenChange(false);
      toast.success(editing ? "Category updated" : "Category added");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t(editing ? "Edit category" : "New category")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <ImageField
            ref={imageFieldRef}
            value={imageUrl}
            onChange={setImageUrl}
            slug={restaurantSlug}
            kind="categories"
            label="Category image"
          />
          <div className="flex flex-col gap-3 rounded-lg border p-3">
            <LocalizedLanguageSelector
              activeLanguage={activeLanguage}
              filledLanguages={filledLanguages}
              onChange={setActiveLanguage}
            />
            <Label htmlFor={`cat-name-${activeLanguage}`}>{t("Name")}</Label>
            <Input
              key={activeLanguage}
              id={`cat-name-${activeLanguage}`}
              value={localizedNames[activeLanguage].value}
              onChange={(event) =>
                localizedNames[activeLanguage].setValue(event.target.value)
              }
              dir={activeLanguage === "ar" ? "rtl" : "ltr"}
              required={activeLanguage === "tr"}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending || !name}>
              {pending ? t("Saving…") : t("Save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
