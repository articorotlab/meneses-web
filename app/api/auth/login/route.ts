import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.MENESES_API_BASE_URL ?? "http://localhost:3001";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(
    `${API_BASE_URL}/web/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );

  const data = await response.json();

  const nextResponse = NextResponse.json(
    data,
    {
      status: response.status,
    }
  );

  const setCookie =
    response.headers.get("set-cookie");

  if (setCookie) {
    nextResponse.headers.set(
      "set-cookie",
      setCookie
    );
  }

  return nextResponse;
}
