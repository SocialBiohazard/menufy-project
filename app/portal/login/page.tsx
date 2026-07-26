import { redirect } from "next/navigation";
import { CustomerLoginForm } from "@/components/customer/CustomerLoginForm";
import { getCustomerUser } from "@/lib/customer-auth";
import { PanelI18nProvider } from "@/components/shared/PanelI18nProvider";
import { getPanelLocale } from "@/lib/panel-i18n";

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ changed?: string }>;
}) {
  if (await getCustomerUser()) redirect("/portal");
  const locale = await getPanelLocale();
  const query = await searchParams;
  return <PanelI18nProvider locale={locale}><CustomerLoginForm message={query.changed ? "Password updated. Sign in again." : undefined} /></PanelI18nProvider>;
}
