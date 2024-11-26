import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getFile, updateFile } from "~/utils/data.server";
import { getUserSession, getVisitorSession } from "~/utils/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  // Check intent
  const formData = await request.formData();
  const formObj = Object.fromEntries(formData) as unknown as {
    intent: "updateFile";
    fileid: string;
    magnet?: string;
    filename?: string;
    filesize?: number;
    filetype?: string;
  };
  console.log("formObj:", formObj);

  //  Update file
  const user = await getUserSession(request);
  const visitor = await getVisitorSession(request);
  const sub = user?.sub || visitor?.sub;

  // Check if file exists
  const file = await getFile(sub, formObj.fileid);
  if (!file) {
    return json({ error: "File not found" }, { status: 404 });
  }

  // Update file
  const updatedFile = await updateFile(
    sub,
    formObj.fileid,
    {
      magnet: formObj.magnet,
      filename: formObj.filename,
      size: formObj.filesize,
      type: formObj.filetype,
    },
    false, // not force update
    true // allow delete when duplicate
  );
  return json({ file: updatedFile });
};
