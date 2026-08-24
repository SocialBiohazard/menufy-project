import { getManagedImage } from "@/lib/media-storage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const media = await getManagedImage(key.join("/"));
  if (!media) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(media.body), {
    headers: {
      "Content-Type": media.contentType,
      ...(media.contentLength
        ? { "Content-Length": String(media.contentLength) }
        : {}),
      "Cache-Control":
        "public, max-age=31536000, s-maxage=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
