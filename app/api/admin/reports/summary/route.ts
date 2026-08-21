import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.MENESES_API_BASE_URL ??
  "http://localhost:3001";


async function getSessionCookieHeader() {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get(
      "meneses_web_session"
    );

  return session
    ? `meneses_web_session=${session.value}`
    : null;
}


export async function GET(
  request: Request
) {
  const cookieHeader =
    await getSessionCookieHeader();

  const requestUrl =
    new URL(request.url);

  const from =
    requestUrl.searchParams.get(
      "from"
    );

  const to =
    requestUrl.searchParams.get(
      "to"
    );


  const headers =
    new Headers();


  if (cookieHeader) {
    headers.set(
      "Cookie",
      cookieHeader
    );
  }


  const searchParams =
    new URLSearchParams();

  if (from) {
    searchParams.set(
      "from",
      from
    );
  }

  if (to) {
    searchParams.set(
      "to",
      to
    );
  }


  const response =
    await fetch(
      `${API_BASE_URL}/web/admin/reports/summary?${searchParams.toString()}`,
      {
        headers,
        cache:
          "no-store",
      }
    );


  const data =
    await response.json();


  return NextResponse.json(
    data,
    {
      status:
        response.status,
    }
  );
}