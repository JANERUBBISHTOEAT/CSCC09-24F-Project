import type { ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import HashMap from "~/utils/hashmap.server";
import { json, redirect } from "@remix-run/node";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  console.log("Action params:", params);
  invariant(params.fileId, "Missing fileId param");

  // Check intent
  const formData = await request.formData();
  const formObj = Object.fromEntries(formData) as {
    intent: "acquireToken" | "acquireMagnet";
    magnet?: string;
    token?: string;
  };
  console.log("formObj:", formObj);

  // [ ] Add new file record if fileId="new"
  // Need to return both magnet and token

  if (params.fileId === "new") {
    console.log("intent: newFile");
    // [ ] Create new file record
  }

  // * Acquire token
  if (formObj.intent === "acquireToken") {
    console.log("intent: acquireToken");
    // No magnet provided, return
    if (!formObj.magnet) {
      return json({
        token: "",
        magnet: formObj.magnet,
        intent: "acquireToken",
      });
    }

    // Try get magnet first
    const magnet = await HashMap.get(formObj.magnet as string);
    if (magnet) {
      return json({ token: magnet, magnet: formObj.magnet });
    }

    // Generate & save token
    const token = await HashMap.genToken(formObj.magnet as string);
    console.log("Token:", token);

    return json({
      token: token,
      magnet: formObj.magnet,
      intent: "acquireToken",
    });
  }

  // * Acquire magnet
  if (formObj.intent === "acquireMagnet") {
    console.log("intent: acquireMagnet");
    // No token provided, return
    if (!formObj.token) {
      return json({ magnet: "" });
    }

    // Retrieve magnet
    const magnet = await HashMap.get(formObj.token as string);
    console.log("Magnet:", magnet);

    return json({
      magnet: magnet,
      token: formObj.token,
      intent: "acquireMagnet",
    });
  }
};
