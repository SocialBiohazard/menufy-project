import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isOperatorEmail } from "@/lib/operator-access";

/** Current operator user, or null. */
export async function getOperator() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user && isOperatorEmail(user.email) ? user : null;
}

/** Require an explicitly allowlisted operator; redirect to /login otherwise. */
export async function requireOperator() {
  const user = await getOperator();
  if (!user) redirect("/login?error=unauthorized");
  return user;
}
