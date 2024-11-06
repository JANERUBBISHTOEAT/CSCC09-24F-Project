import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { deleteFile } from "../data";

export const action = async ({ params }: ActionFunctionArgs) => {
  invariant(params.fileId, "Missing fileId param");
  await deleteFile(params.fileId);
  return redirect("/");
};
