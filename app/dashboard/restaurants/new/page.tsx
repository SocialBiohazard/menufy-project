import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewRestaurantForm } from "@/components/admin/NewRestaurantForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewRestaurantPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New restaurant</CardTitle>
          <CardDescription>
            Start with the basics — you can configure everything else after.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewRestaurantForm />
        </CardContent>
      </Card>
    </div>
  );
}
