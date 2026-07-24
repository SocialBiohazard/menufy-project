import { redirect } from "next/navigation";

// Root goes straight to the operator app (middleware bounces to /login if
// signed out). No public marketing site for now.
export default function Home() {
  redirect("/dashboard");
}
