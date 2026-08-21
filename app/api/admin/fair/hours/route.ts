import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.MENESES_API_BASE_URL ?? "http://localhost:3001";

export async function PUT(
  request: Request
) {
  const cookieStore =
    await cookies();

  const session =
    cookieStore.get(
      "meneses_web_session"
    );

  const body =
    await request.json();

  const headers =
    new Headers();

  headers.set(
    "Content-Type",
    "application/json"
  );

  if (session) {
    headers.set(
      "Cookie",
      `meneses_web_session=${session.value}`
    );
  }

  const response =
    await fetch(
      `${API_BASE_URL}/web/admin/fair/hours`,
      {
        method: "PUT",
        headers,
        body:
          JSON.stringify(
            body
          ),
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