import {
  cookies,
} from "next/headers";

import {
  NextResponse,
} from "next/server";


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


/*
 * =========================================================
 * GET DEVICES
 * =========================================================
 */

export async function GET() {

  const cookieHeader =
    await getSessionCookieHeader();


  const headers =
    new Headers();


  if (cookieHeader) {

    headers.set(
      "Cookie",
      cookieHeader
    );
  }


  const response =
    await fetch(
      `${API_BASE_URL}/web/admin/devices`,
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


/*
 * =========================================================
 * CREATE DEVICE
 * =========================================================
 */

export async function POST(
  request: Request
) {

  const cookieHeader =
    await getSessionCookieHeader();


  const body =
    await request.json();


  const headers =
    new Headers();


  headers.set(
    "Content-Type",
    "application/json"
  );


  if (cookieHeader) {

    headers.set(
      "Cookie",
      cookieHeader
    );
  }


  const response =
    await fetch(
      `${API_BASE_URL}/web/admin/devices`,
      {
        method:
          "POST",

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
