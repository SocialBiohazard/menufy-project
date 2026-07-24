"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode } from "lucide-react";
import { publicMenuUrl } from "@/lib/public-url";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function QrDialog({ slug, name, publicHostname }: { slug: string; name: string; publicHostname?: string | null }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  function targetUrl() {
    const base =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    return publicMenuUrl({ slug, publicHostname, applicationOrigin: base });
  }

  async function generate() {
    const url = await QRCode.toDataURL(targetUrl(), {
      width: 512,
      margin: 2,
      errorCorrectionLevel: "M",
    });
    setDataUrl(url);
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open && !dataUrl) generate();
      }}
    >
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <QrCode className="size-4" />
        QR
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR code — {name}</DialogTitle>
          <DialogDescription className="break-all">{targetUrl()}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt={`QR code for ${name}`}
              className="size-56 rounded-md border"
            />
          ) : (
            <div className="size-56 animate-pulse rounded-md bg-muted" />
          )}
          <Button
            disabled={!dataUrl}
            className="w-full"
            nativeButton={false}
            render={<a href={dataUrl ?? "#"} download={`${slug}-qr.png`} />}
          >
            <Download className="size-4" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
