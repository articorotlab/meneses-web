import {
  NextResponse,
} from "next/server";

import {
  API_BASE_URL,
  getSessionHeaders,
} from "@/lib/admin-api";


export async function POST(
  request:
    Request
) {

  const headers =
    await getSessionHeaders(
      true
    );


  const body =
    await request.json();


  const response =
    await fetch(
      `${API_BASE_URL}/web/admin/attractions`,
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
