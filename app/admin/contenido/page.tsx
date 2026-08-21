import {
  redirect,
} from "next/navigation";

import {
  getCurrentWebUser,
} from "@/lib/web-auth";

import ContentDashboard
  from "./content-dashboard";

import "./contenido.css";


export default async function ContentPage() {

  const user =
    await getCurrentWebUser();


  if (
    !user
  ) {

    redirect(
      "/admin/login"
    );
  }


  return (
    <ContentDashboard
      userName={
        user.fullName
      }
    />
  );
}
