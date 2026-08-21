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

      imageId:
        string;
    }>;
};


export async function DELETE(
  _request:
    Request,
  context:
    RouteContext
) {

  const {
    attractionId,
    imageId,
  } =
    await context.params;


  const headers =
    await getSessionHeaders();


  const response =
    await fetch(
      `${API_BASE_URL}/web/admin/attractions/${attractionId}/images/${imageId}`,
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
