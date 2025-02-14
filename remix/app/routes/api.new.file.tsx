import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { createEmptyFile } from "~/utils/data.server";
import { getUserSession, getVisitorSession } from "~/utils/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getUserSession(request);
  const visitor = await getVisitorSession(request);
  console.log("User:", user);
  console.log("Visitor:", visitor);
  const sub = user?.sub || visitor?.sub;
  const newFile = await createEmptyFile(sub, false);
  const formData = await request.formData();

  return redirect(
    `/files/${newFile.id}/edit` +
      `?pasted=true` +
      `&fileName=${formData.get("fileName")}` +
      `&mimeType=${formData.get("mimeType")}`
  );
};
