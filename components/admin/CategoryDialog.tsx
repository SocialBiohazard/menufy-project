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
  const [imageUrl, setImageUrl] = useState(editing?.imageUrl ?? "");
  const imageFieldRef = useRef<ImageFieldHandle>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const input = { name, nameEn, nameAr, imageUrl };
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="cat-name">Name (Türkçe)</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cat-en">Name (English)</Label>
            <Input id="cat-en" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cat-ar">Name (العربية)</Label>
            <Input id="cat-ar" value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
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
