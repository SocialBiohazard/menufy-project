import { LoginForm } from "@/components/admin/LoginForm";
import { getOperator } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PanelI18nProvider } from "@/components/shared/PanelI18nProvider";
import { getPanelLocale } from "@/lib/panel-i18n";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getOperator()) redirect("/dashboard");
  const locale = await getPanelLocale();
  const { error } = await searchParams;
  const initialError = error === "unauthorized"
    ? "This account is not authorized to access the operator dashboard."
    : null;

  return <PanelI18nProvider locale={locale}><LoginForm initialError={initialError} /></PanelI18nProvider>;
}
