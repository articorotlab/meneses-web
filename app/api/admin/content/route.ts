import {
  NextResponse,
} from "next/server";

import {
  API_BASE_URL,
  getSessionHeaders,
} from "@/lib/admin-api";


export async function GET() {

  const headers =
    await getSessionHeaders();


  const response =
    await fetch(
      `${API_BASE_URL}/web/admin/content`,
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
