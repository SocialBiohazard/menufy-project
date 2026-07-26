import { redirect } from "next/navigation";
import { CustomerLoginForm } from "@/components/customer/CustomerLoginForm";
import { getCustomerUser } from "@/lib/customer-auth";

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ changed?: string }>;
}) {
  if (await getCustomerUser()) redirect("/portal");
  const query = await searchParams;
  return <CustomerLoginForm message={query.changed ? "Password updated. Sign in again." : undefined} />;
}
