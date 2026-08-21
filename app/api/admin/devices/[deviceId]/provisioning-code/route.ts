import {
  cookies,
} from "next/headers";

import {
  NextResponse,
} from "next/server";


const API_BASE_URL =
  process.env.MENESES_API_BASE_URL ??
  "http://localhost:3001";


type RouteContext = {
  params:
    Promise<{
      deviceId: string;
    }>;
};


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
 * GENERATE CODE
 * =========================================================
 */

export async function POST(
  _request: Request,
  context: RouteContext
) {

  const {
    deviceId,
  } =
    await context.params;


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
      `${API_BASE_URL}/web/admin/devices/${encodeURIComponent(deviceId)}/provisioning-code`,
      {
        method:
          "POST",

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
 * REVOKE CODE
 * =========================================================
 */

export async function DELETE(
  _request: Request,
  context: RouteContext
) {

  const {
    deviceId,
  } =
    await context.params;


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
      `${API_BASE_URL}/web/admin/devices/${encodeURIComponent(deviceId)}/provisioning-code`,
      {
        method:
          "DELETE",

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