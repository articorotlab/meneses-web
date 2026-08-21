import {
  NextResponse,
} from "next/server";

import {
  API_BASE_URL,
  getSessionHeaders,
} from "@/lib/admin-api";


export async function PUT(
  request:
    Request
) {

  const headers =
    await getSessionHeaders();


  const formData =
    await request.formData();


  const response =
    await fetch(
      `${API_BASE_URL}/web/admin/content/cover`,
      {
        method:
          "PUT",

        headers,

        body:
          formData,

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
