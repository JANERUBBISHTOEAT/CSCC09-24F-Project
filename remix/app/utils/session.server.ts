import { createCookieSessionStorage } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET || "super-secret-key";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function commitSession(session: any) {
  return sessionStorage.commitSession(session);
}

export async function destroySession(session: any) {
  return sessionStorage.destroySession(session);
}

export async function getUserSession(
  request: Request
): Promise<{ sub: string }> {
  const session = await getSession(request);
  return session.get("user");
}
export async function getVisitorSession(
  request: Request
): Promise<{ sub: string }> {
  const session = await getSession(request);
  return session.get("visitor");
}
