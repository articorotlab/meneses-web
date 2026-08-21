import {
  NextResponse,
} from "next/server";

import {
  API_BASE_URL,
  getSessionHeaders,
} from "@/lib/admin-api";


type RouteContext = {
  params:
    Promise<{
      attractionId:
        string;
    }>;
};


export async function POST(
  request:
    Request,
  context:
    RouteContext
) {

  const {
    attractionId,
  } =
    await context.params;


  const headers =
    await getSessionHeaders();


  const formData =
    await request.formData();


  const response =
    await fetch(
      `${API_BASE_URL}/web/admin/attractions/${attractionId}/images`,
      {
        method:
          "POST",

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
