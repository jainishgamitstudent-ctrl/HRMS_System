import { redirect } from "next/navigation";

export default function BlockedAccessPage() {
  redirect("/login");
}
