import { redirect } from "next/navigation";

import "./configuracion.css";

import {
  getCurrentWebUser,
} from "@/lib/web-auth";

import ConfigurationForm
  from "./configuration-form";

export default async function ConfigurationPage() {
  const user =
    await getCurrentWebUser();

  if (!user) {
    redirect(
      "/admin/login"
    );
  }

  return (
    <ConfigurationForm
      userName={
        user.fullName
      }
    />
  );
}