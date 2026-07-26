"use client";

import { useState, useTransition } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import type {
  AllergenOption,
  BuilderCategory,
  BuilderItem,
} from "@/lib/builder-types";
import { toBuilderCategory } from "@/lib/builder-types";
import {
  deleteCategory,
  reorderCategories,
} from "@/lib/actions/category";
import {
  deleteItem,
  reorderItems,
  toggleAvailability,
} from "@/lib/actions/item";
import { formatPrice } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CategoryDialog } from "@/components/admin/CategoryDialog";
import { ItemDialog } from "@/components/admin/ItemDialog";
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

export function MenuBuilder({
  restaurantId,
  restaurantSlug,
  initialCategories,
  allergens,
}: {
  restaurantId: string;
  restaurantSlug: string;
  initialCategories: BuilderCategory[];
  allergens: AllergenOption[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialCategories[0]?.id ?? null,
  );
  const [, startTransition] = useTransition();

  // Dialog state
  const [catDialog, setCatDialog] = useState<{ open: boolean; editing?: BuilderCategory }>({ open: false });
  const [itemDialog, setItemDialog] = useState<{ open: boolean; editing?: BuilderItem }>({ open: false });

  const selected = categories.find((c) => c.id === selectedId) ?? null;

  // ---- category ops ----
  function onCategorySaved(cat: BuilderCategory) {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === cat.id);
      return exists
        ? prev.map((c) => (c.id === cat.id ? { ...c, ...cat, items: c.items } : c))
        : [...prev, cat];
    });
    setSelectedId(cat.id);
  }

  function removeCategory(id: string) {
    const prev = categories;
    const next = prev.filter((c) => c.id !== id);
    setCategories(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (!res.ok) {
        setCategories(prev);
        toast.error(res.error);
      }
    });
  }

  function moveCategory(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= categories.length) return;
    const next = [...categories];
    [next[index], next[j]] = [next[j], next[index]];
    setCategories(next);
    startTransition(async () => {
      const res = await reorderCategories(restaurantId, next.map((c) => c.id));
      if (!res.ok) toast.error(res.error);
    });
  }

  // ---- item ops ----
  function onItemSaved(item: BuilderItem) {
    if (!selected) return;
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== selected.id) return c;
        const exists = c.items.some((i) => i.id === item.id);
        return {
          ...c,
          items: exists
            ? c.items.map((i) => (i.id === item.id ? item : i))
            : [...c.items, item],
        };
      }),
    );
  }

  function removeItem(itemId: string) {
    if (!selected) return;
    const prev = categories;
    setCategories((cs) =>
      cs.map((c) =>
        c.id === selected.id
          ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
          : c,
      ),
    );
    startTransition(async () => {
      const res = await deleteItem(itemId);
      if (!res.ok) {
        setCategories(prev);
        toast.error(res.error);
      }
    });
  }

  function onToggleAvailable(item: BuilderItem, next: boolean) {
    if (!selected) return;
    setCategories((cs) =>
      cs.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === item.id ? { ...i, isAvailable: next } : i,
              ),
            }
          : c,
      ),
    );
    startTransition(async () => {
      const res = await toggleAvailability(item.id, next);
      if (!res.ok) toast.error(res.error);
    });
  }

  function moveItem(index: number, dir: -1 | 1) {
    if (!selected) return;
    const j = index + dir;
    if (j < 0 || j >= selected.items.length) return;
    const items = [...selected.items];
    [items[index], items[j]] = [items[j], items[index]];
    setCategories((cs) =>
      cs.map((c) => (c.id === selected.id ? { ...c, items } : c)),
    );
    startTransition(async () => {
      const res = await reorderItems(selected.id, items.map((i) => i.id));
      if (!res.ok) toast.error(res.error);
    });
  }

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      {/* Categories pane */}
      <aside className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Categories
          </h2>
          <Button
            size="xs"
            variant="outline"
            onClick={() => setCatDialog({ open: true })}
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>

        {categories.length === 0 && (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            No categories yet.
          </p>
        )}

        <ul className="flex flex-col gap-1">
          {categories.map((c, i) => (
            <li
              key={c.id}
              className={`group flex items-center gap-1 rounded-md border px-2 py-1.5 ${
                c.id === selectedId ? "border-primary bg-muted" : "bg-background"
              }`}
            >
              <button
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                onClick={() => setSelectedId(c.id)}
              >
                <span className="truncate text-sm font-medium">{c.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {c.items.length}
                </span>
              </button>
              <div className="flex opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Move ${c.name} up`}
                  disabled={i === 0}
                  onClick={() => moveCategory(i, -1)}
                >
                  <ChevronUp className="size-3.5" />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Move ${c.name} down`}
                  disabled={i === categories.length - 1}
                  onClick={() => moveCategory(i, 1)}
                >
                  <ChevronDown className="size-3.5" />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Edit ${c.name}`}
                  onClick={() => setCatDialog({ open: true, editing: c })}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <ConfirmDelete
                  title={`Delete "${c.name}"?`}
                  description="This removes the category and all its items."
                  ariaLabel={`Delete ${c.name}`}
                  onConfirm={() => removeCategory(c.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Items pane */}
      <section className="flex flex-col gap-3">
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center text-muted-foreground">
            <UtensilsCrossed className="size-8" />
            <p>Select or create a category to add items.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{selected.name}</h2>
              <Button size="sm" onClick={() => setItemDialog({ open: true })}>
                <Plus className="size-4" />
                Add item
              </Button>
            </div>

            {selected.items.length === 0 ? (
              <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                No items in this category yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {selected.items.map((it, i) => (
                  <li
                    key={it.id}
                    className="group flex items-center gap-3 rounded-lg border bg-background p-2.5"
                  >
                    <div className="flex flex-col">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        aria-label={`Move ${it.name} up`}
                        disabled={i === 0}
                        onClick={() => moveItem(i, -1)}
                      >
                        <ChevronUp className="size-3.5" />
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        aria-label={`Move ${it.name} down`}
                        disabled={i === selected.items.length - 1}
                        onClick={() => moveItem(i, 1)}
                      >
                        <ChevronDown className="size-3.5" />
                      </Button>
                    </div>
                    <div className="size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {it.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <GripVertical className="size-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate text-sm font-medium">{it.name}</span>
                        {it.isNew && <Badge variant="secondary" className="text-[10px]">New</Badge>}
                        {it.isFeatured && <Badge variant="secondary" className="text-[10px]">Featured</Badge>}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatPrice(it.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={it.isAvailable}
                        onCheckedChange={(v) => onToggleAvailable(it, v)}
                        aria-label={`${it.name} availability`}
                      />
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Edit ${it.name}`}
                        onClick={() => setItemDialog({ open: true, editing: it })}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDelete
                        title={`Delete "${it.name}"?`}
                        ariaLabel={`Delete ${it.name}`}
                        onConfirm={() => removeItem(it.id)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      {/* Dialogs */}
      <CategoryDialog
        key={`category-${catDialog.open}-${catDialog.editing?.id ?? "new"}`}
        restaurantId={restaurantId}
        restaurantSlug={restaurantSlug}
        open={catDialog.open}
        editing={catDialog.editing}
        onOpenChange={(open) => setCatDialog((s) => ({ ...s, open }))}
        onSaved={(cat) => onCategorySaved(toBuilderCategory({ ...cat, items: [] }))}
      />
      {selected && (
        <ItemDialog
          key={`item-${itemDialog.open}-${itemDialog.editing?.id ?? "new"}`}
          categoryId={selected.id}
          restaurantSlug={restaurantSlug}
          allergens={allergens}
          open={itemDialog.open}
          editing={itemDialog.editing}
          onOpenChange={(open) => setItemDialog((s) => ({ ...s, open }))}
          onSaved={onItemSaved}
        />
      )}
    </div>
  );
}

function ConfirmDelete({
  title,
  description,
  ariaLabel,
  onConfirm,
}: {
  title: string;
  description?: string;
  ariaLabel: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            size="icon-xs"
            variant="ghost"
            className="text-destructive"
            aria-label={ariaLabel}
          />
        }
      >
        <Trash2 className="size-3.5" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
