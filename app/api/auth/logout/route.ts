import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.MENESES_API_BASE_URL ?? "http://localhost:3001";

export async function POST() {
  const cookieStore =
    await cookies();

  const sessionCookie =
    cookieStore.get(
      "meneses_web_session"
    );

  const response = await fetch(
    `${API_BASE_URL}/web/auth/logout`,
    {
      method: "POST",
      headers: sessionCookie
        ? {
            Cookie:
              `meneses_web_session=${sessionCookie.value}`,
          }
        : {},
      cache: "no-store",
    }
  );

  const data = await response.json();

  const nextResponse =
    NextResponse.json(
      data,
      {
        status: response.status,
      }
    );

  const setCookie =
    response.headers.get("set-cookie");

  if (setCookie) {
    nextResponse.headers.set(
      "set-cookie",
      setCookie
    );
  }

  return nextResponse;
}
