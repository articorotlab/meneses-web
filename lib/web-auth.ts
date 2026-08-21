import { cookies } from "next/headers";

export type WebAuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: "OWNER" | "ADMIN";
};

export type WebAuthMeResponse = {
  authenticated: boolean;
  user?: WebAuthUser;
  session?: {
    expiresAt: string;
  };
  error?: string;
};

const API_BASE_URL =
  process.env.MENESES_API_BASE_URL ?? "http://localhost:3001";

export async function getCurrentWebUser():
  Promise<WebAuthUser | null> {

  const cookieStore =
    await cookies();

  const sessionCookie =
    cookieStore.get(
      "meneses_web_session"
    );

  if (!sessionCookie) {
    return null;
  }

  const response = await fetch(
    `${API_BASE_URL}/web/auth/me`,
    {
      headers: {
        Cookie:
          `meneses_web_session=${sessionCookie.value}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  const data =
    (await response.json()) as WebAuthMeResponse;

  if (
    !data.authenticated ||
    !data.user
  ) {
    return null;
  }

  return data.user;
}
