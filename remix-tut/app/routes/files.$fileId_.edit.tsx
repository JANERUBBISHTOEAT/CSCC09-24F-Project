import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { useState } from "react";
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
  const { file: loadedFile } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const submit = useSubmit();

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
    setDragging(false);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      submit(formData, { method: "post", encType: "multipart/form-data" });
    }
  };

  return (
    // File drop zone
    <Form
      key={loadedFile.id}
      id="contact-form"
      method="post"
      encType="multipart/form-data"
    >
      <div
        // htmlFor="fileInput"
        onDrop={(event) => {
          event.preventDefault();
          const droppedFile = event.dataTransfer.files[0];
          if (droppedFile) {
            setFile(droppedFile);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        {file ? (
          <div>Selected file: {file.name}</div>
        ) : (
          <div>Drag & Drop files here</div>
        )}
        <input
          type="file"
          name="file"
          title="Upload file"
          onChange={(e) => {
            const selectedFile = e.target.files ? e.target.files[0] : null;
            setFile(selectedFile);
          }}
          id="fileInput"
        />
      </div>

      <p>
        <span>Name</span>
        <input
          aria-label="Filename"
          defaultValue={loadedFile.filename}
          name="filename"
          placeholder="Filename"
          type="text"
        />
        <input
          aria-label="Token"
          defaultValue={loadedFile.token}
          name="token"
          placeholder="Token"
          type="text"
        />
      </p>
      <label>
        <span>Share with</span>
        <input
          defaultValue={loadedFile.notes}
          name="notes"
          placeholder="TODO"
          type="text"
        />
      </label>
      <label>
        <span>File Link</span>
        <input
          aria-label="File Link"
          defaultValue={loadedFile.magnet}
          name="avatar"
          placeholder="magnet:?"
          type="text"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea defaultValue={loadedFile.notes} name="notes" rows={6} />
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
