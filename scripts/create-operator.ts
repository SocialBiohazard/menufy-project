import "dotenv/config";

// One-off: create the single operator account via the Supabase Auth Admin REST
// API (using fetch, so it works in bare Node without the SDK's WebSocket dep).
// Usage: npx tsx scripts/create-operator.ts <email> <password>
async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-operator.ts <email> <password>");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret || secret.includes("<paste")) {
    console.error("Set SUPABASE_SECRET_KEY in .env first.");
    process.exit(1);
  }

  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });

  const body = await res.json();
  if (!res.ok) {
    console.error("Failed:", body.msg ?? body.error_description ?? JSON.stringify(body));
    process.exit(1);
  }
  console.log("✓ Operator account created:", body.email ?? email);
}

main();
