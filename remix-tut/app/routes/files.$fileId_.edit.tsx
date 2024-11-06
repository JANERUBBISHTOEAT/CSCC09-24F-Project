import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getFile, updateFile } from "../data";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.fileId, "Missing fileId param");
  const file = await getFile(params.fileId);
  if (!file) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ file: file });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.fileId, "Missing fileId param");
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  await updateFile(params.fileId, updates);
  return redirect(`/files/${params.fileId}`);
};

export default function EditFile() {
  const { file: file } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Form key={file.id} id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          aria-label="Filename"
          defaultValue={file.filename}
          name="filename"
          placeholder="Filename"
          type="text"
        />
        <input
          aria-label="Token"
          defaultValue={file.token}
          name="token"
          placeholder="Token"
          type="text"
        />
      </p>
      <label>
        <span>Share with</span>
        <input
          defaultValue={file.notes}
          name="notes"
          placeholder="TODO"
          type="text"
        />
      </label>
      <label>
        <span>File Link</span>
        <input
          aria-label="File Link"
          defaultValue={file.magnet}
          name="avatar"
          placeholder="magnet:?"
          type="text"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea defaultValue={file.notes} name="notes" rows={6} />
      </label>
      <p>
        <button type="submit">Save</button>
        <button onClick={() => navigate(-1)} type="button">
          Cancel
        </button>
      </p>
    </Form>
  );
}
