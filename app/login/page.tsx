import { LoginForm } from "@/components/admin/LoginForm";
import { getOperator } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getOperator()) redirect("/dashboard");
  const { error } = await searchParams;
  const initialError = error === "unauthorized"
    ? "This account is not authorized to access the operator dashboard."
    : null;

  return <LoginForm initialError={initialError} />;
}
