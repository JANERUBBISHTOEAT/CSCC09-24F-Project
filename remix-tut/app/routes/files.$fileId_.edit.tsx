import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { getFile, updateFile } from "../data";
// import WebTorrent from "webtorrent";
// import WebTorrent from "../../public/webtorrent.min.js";

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
  const [torrent, setTorrent] = useState<WebTorrent.Torrent | null>(null);
  const [client, setClient] = useState(null);
  const submit = useSubmit();

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Running in the browser. (Client-side/SPA)");
    } else {
      console.log("Running on the server. (Node.js/SSR)");
    }
    // if (typeof window !== "undefined") {
    //   // import("webtorrent")
    //   import("../../public/webtorrent.min.js")
    //     .then((WebTorrent) => {
    //       const client = new WebTorrent();
    //       setClient(client);
    //     })
    //     .catch((error) => {
    //       console.error("Failed to load WebTorrent:", error);
    //     });
    // }
    console.log("WebTorrent:", window.WebTorrent);
    if (typeof window !== "undefined" && window.WebTorrent) {
      const client = new window.WebTorrent();
      setClient(client);
    } else {
      const interval = setInterval(() => {
        console.log("Checking for WebTorrent...");
        if (window.WebTorrent) {
          console.log("WebTorrent loaded:", window.WebTorrent);
          setClient(client);
          clearInterval(interval);
        }
      }, 100);
    }
  });

  const handleSubmit = (files: FileList | null) => {
    invariant(files, "No file selected");
    console.log("Submitting files:", files);
    console.log("Client:", client);
    console.log("Files:", files);
    if (client && files) {
      const file = files[0];
      client.seed(file, (torrent) => {
        setTorrent(torrent);
        console.log("Client is seeding:", torrent.magnetURI);
      });
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
            handleSubmit(e.target.files);
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
          disabled
        />
        <input
          aria-label="Token"
          defaultValue={loadedFile.token}
          name="token"
          placeholder="Token"
          type="text"
          disabled
        />
      </p>
      <label>
        <span>Share with</span>
        <input
          defaultValue={loadedFile.notes}
          name="notes"
          placeholder="TODO"
          type="text"
          disabled
        />
      </label>
      <label>
        <span>File Link</span>
        <input
          aria-label="File Link"
          defaultValue={loadedFile.magnet}
          name="link"
          value={torrent?.magnetURI}
          placeholder="magnet:?"
          type="password"
          disabled
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
