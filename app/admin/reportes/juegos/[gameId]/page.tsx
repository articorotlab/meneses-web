import { redirect } from "next/navigation";

import {
  getCurrentWebUser,
} from "@/lib/web-auth";

import GameReportDetail
  from "./game-report-detail";

import "./game-report-detail.css";


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
        part.type === "year"
    )?.value;

  const month =
    parts.find(
      (part) =>
        part.type === "month"
    )?.value;

  const day =
    parts.find(
      (part) =>
        part.type === "day"
    )?.value;

  if (
    !year ||
    !month ||
    !day
  ) {
    return new Date()
      .toISOString()
      .slice(0, 10);
  }

  return `${year}-${month}-${day}`;
}


function validDate(
  value: string | undefined
) {
  return Boolean(
    value &&
      /^\d{4}-\d{2}-\d{2}$/.test(
        value
      )
  );
}


type PageProps = {
  params: Promise<{
    gameId: string;
  }>;

  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
};


export default async function GameReportPage({
  params,
  searchParams,
}: PageProps) {
  const user =
    await getCurrentWebUser();

  if (!user) {
    redirect(
      "/admin/login"
    );
  }

  const {
    gameId,
  } =
    await params;

  const query =
    await searchParams;

  const today =
    getDateInTimezone();

  const from =
    validDate(query.from)
      ? query.from!
      : today;

  const to =
    validDate(query.to)
      ? query.to!
      : from;

  return (
    <GameReportDetail
      gameId={gameId}
      from={from}
      to={to}
      userName={user.fullName}
    />
  );
}
