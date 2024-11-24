import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { deleteFile } from "~/utils/data.server";
import { getUserSession } from "~/utils/session.server";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.fileId, "Missing fileId param");
  const user = await getUserSession(request);
  await deleteFile(user.sub, params.fileId);
  return redirect("/");
};
