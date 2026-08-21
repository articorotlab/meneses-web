import { redirect } from "next/navigation";

import {
  getCurrentWebUser,
} from "@/lib/web-auth";

import ReportsDashboard
  from "./reports-dashboard";

import "./reportes.css";


const REPORT_TIMEZONE =
  "America/Mexico_City";


function getDateInTimezone() {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          REPORT_TIMEZONE,

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",
      }
    )
      .formatToParts(
        new Date()
      );


  const year =
    parts.find(
      (part) =>
        part.type ===
        "year"
    )?.value;

  const month =
    parts.find(
      (part) =>
        part.type ===
        "month"
    )?.value;

  const day =
    parts.find(
      (part) =>
        part.type ===
        "day"
    )?.value;


  if (
    !year ||
    !month ||
    !day
  ) {
    return new Date()
      .toISOString()
      .slice(
        0,
        10
      );
  }


  return (
    `${year}-` +
    `${month}-` +
    `${day}`
  );
}


export default async function ReportsPage() {

  const user =
    await getCurrentWebUser();


  if (
    !user
  ) {

    redirect(
      "/admin/login"
    );
  }


  const today =
    getDateInTimezone();


  return (
    <ReportsDashboard
      userName={
        user.fullName
      }
      initialDate={
        today
      }
    />
  );
}