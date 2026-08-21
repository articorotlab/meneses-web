import {
  redirect,
} from "next/navigation";

import {
  getCurrentWebUser,
} from "@/lib/web-auth";

import DevicesDashboard
  from "./devices-dashboard";

import "./dispositivos.css";


export default async function DevicesPage() {

  const user =
    await getCurrentWebUser();


  if (!user) {

    redirect(
      "/admin/login"
    );
  }


  return (
    <DevicesDashboard
      userName={
        user.fullName
      }
    />
  );
}