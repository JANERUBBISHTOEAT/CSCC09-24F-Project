import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { deleteFile } from "~/utils/data.server";
import { getUserSession, getVisitorSession } from "~/utils/session.server";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.fileId, "Missing fileId param");
  const user = await getUserSession(request);
  const visitor = await getVisitorSession(request);
  const sub = user?.sub || visitor?.sub;
  await deleteFile(sub, params.fileId);
  return redirect("/");
};
