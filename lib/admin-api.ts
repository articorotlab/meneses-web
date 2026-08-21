import {
  cookies,
} from "next/headers";


export const API_BASE_URL =
  process.env.MENESES_API_BASE_URL ??
  "http://localhost:3001";


export async function getSessionHeaders(
  includeJson:
    boolean = false
) {

  const cookieStore =
    await cookies();


  const session =
    cookieStore.get(
      "meneses_web_session"
    );


  const headers =
    new Headers();


  if (
    includeJson
  ) {

    headers.set(
      "Content-Type",
      "application/json"
    );
  }


  if (
    session
  ) {

    headers.set(
      "Cookie",
      `meneses_web_session=${session.value}`
    );
  }


  return headers;
}
