import "dotenv/config";

// One-off: create the public `menu-media` Storage bucket (idempotent).
// Uses the Storage REST API with fetch (no SDK / WebSocket dep in bare Node).
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret || secret.includes("<paste")) {
    console.error("Set SUPABASE_SECRET_KEY in .env first.");
    process.exit(1);
  }

  const res = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: "menu-media",
      name: "menu-media",
      public: true,
      file_size_limit: 5 * 1024 * 1024,
      allowed_mime_types: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (res.ok) {
    console.log("✓ Bucket 'menu-media' created (public).");
  } else if (
    res.status === 409 ||
    JSON.stringify(body).toLowerCase().includes("already exists")
  ) {
    console.log("✓ Bucket 'menu-media' already exists.");
  } else {
    console.error("Failed:", body.message ?? JSON.stringify(body));
    process.exit(1);
  }
}

main();
