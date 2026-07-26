"use client";

import { useEffect, useRef, useTransition } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { discardUploadedImage, uploadImage } from "@/lib/actions/media";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ImageField({
  value,
  onChange,
  slug,
  kind = "items",
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  slug: string;
  kind?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionUploadRef = useRef<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      const uploaded = sessionUploadRef.current;
      if (uploaded) void discardUploadedImage(uploaded, slug);
    };
  }, [slug]);

  function onFile(file: File) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Use a PNG, JPEG, or WebP image");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be smaller than 8 MB");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", slug);
    fd.append("kind", kind);
    startTransition(async () => {
      const res = await uploadImage(fd);
      if (!res.ok) toast.error(res.error);
      else {
        const previousSessionUpload = sessionUploadRef.current;
        sessionUploadRef.current = res.url;
        if (previousSessionUpload) {
          void discardUploadedImage(previousSessionUpload, slug);
        }
        onChange(res.url);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" />
          )}
          {pending && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="size-5 animate-spin" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {value ? "Replace" : "Upload"}
          </Button>
          {value && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                const uploaded = sessionUploadRef.current;
                sessionUploadRef.current = null;
                if (uploaded) void discardUploadedImage(uploaded, slug);
                onChange("");
              }}
            >
              <X className="size-4" />
              Remove
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
