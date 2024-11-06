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
          aria-label="First name"
          defaultValue={file.filename}
          name="first"
          placeholder="First"
          type="text"
        />
        <input
          aria-label="Last name"
          defaultValue={file.token}
          name="last"
          placeholder="Last"
          type="text"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          defaultValue={file.notes}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={file.magnet}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
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
