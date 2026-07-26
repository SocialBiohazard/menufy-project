import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CustomerManagementForm } from "@/components/admin/CustomerManagementForm";
import { requireOperator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPanelI18n } from "@/lib/panel-i18n";

export default async function NewCustomerPage() {
  await requireOperator();
  const { t } = await getPanelI18n();
  const restaurants = await prisma.restaurant.findMany({
    where: { customerAccountId: null },
    select: { id: true, businessName: true },
    orderBy: { businessName: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/dashboard/customers" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {t("Customer overview")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("Onboard a customer")}</h1>
        <p className="text-muted-foreground">{t("Create the workspace in four clear steps, then hand off one activation link.")}</p>
      </div>
      <CustomerManagementForm restaurants={restaurants} />
    </div>
  );
}
