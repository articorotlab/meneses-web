import { redirect } from "next/navigation";

import LoginForm from "./login-form";
import { getCurrentWebUser } from "@/lib/web-auth";

export default async function AdminLoginPage() {
  const user = await getCurrentWebUser();

  if (user) {
    redirect("/admin");
  }

  return <LoginForm />;
}