import { redirect } from "next/navigation";

// Redirect root path requests to active dashboard
export default function RootPage() {
  redirect("/dashboard");
}
