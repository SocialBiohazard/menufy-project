"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { slugify } from "@/lib/slug";
import { THEMES } from "@/lib/themes";
import { createRestaurant } from "@/lib/actions/restaurant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const themeOptions = Object.entries(THEMES).map(([id, t]) => ({
  value: id,
  label: t.label,
}));

export function NewRestaurantForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [templateType, setTemplateType] = useState(themeOptions[0]?.value ?? "");
  const slugEdited = useRef(false);

  function onNameChange(v: string) {
    setBusinessName(v);
    if (!slugEdited.current) setSlug(slugify(v));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createRestaurant({
        businessName,
        slug,
        businessType,
        templateType,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Restaurant created");
      router.push(`/dashboard/restaurants/${res.data!.id}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="businessName">Business name</Label>
        <Input
          id="businessName"
          required
          value={businessName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Zeytin & Ateş"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug (public URL)</Label>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>/</span>
          <Input
            id="slug"
            required
            value={slug}
            onChange={(e) => {
              slugEdited.current = true;
              setSlug(slugify(e.target.value));
            }}
            placeholder="zeytin-atesi"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="businessType">Business type (optional)</Label>
        <Input
          id="businessType"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          placeholder="Anadolu Ateş Mutfağı"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Template</Label>
        <Select value={templateType} onValueChange={(v) => setTemplateType(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a template" />
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

      <Button type="submit" disabled={pending || !businessName || !slug}>
        {pending ? "Creating…" : "Create restaurant"}
      </Button>
    </form>
  );
}
