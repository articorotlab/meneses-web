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


export async function PUT(
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
    await getSessionHeaders(
      true
    );


  const body =
    await request.json();


  const response =
    await fetch(
      `${API_BASE_URL}/web/admin/attractions/${attractionId}`,
      {
        method:
          "PUT",

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


export async function DELETE(
  _request:
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


  const response =
    await fetch(
      `${API_BASE_URL}/web/admin/attractions/${attractionId}`,
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
