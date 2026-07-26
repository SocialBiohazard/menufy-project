import { getManagedImage } from "@/lib/media-storage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const media = await getManagedImage(key.join("/"));
  if (!media) return new Response(null, { status: 404 });

  if (media.kind === "redirect") {
    return Response.redirect(media.url, 307);
  }

  return new Response(new Uint8Array(media.body), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
