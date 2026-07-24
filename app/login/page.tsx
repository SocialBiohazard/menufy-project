import { LoginForm } from "@/components/admin/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialError = error === "unauthorized"
    ? "This account is not authorized to access the operator dashboard."
    : null;

  return <LoginForm initialError={initialError} />;
}
