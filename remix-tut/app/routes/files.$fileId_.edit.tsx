import "@fortawesome/fontawesome-free/css/all.min.css";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigate,
  useSubmit,
  useFetcher,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import invariant from "tiny-invariant";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import { fileIconMap } from "~/utils/constants";
import { deleteFile, getFile, updateFile } from "~/utils/data.server";
import HashMap from "~/utils/hashmap.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.fileId, "Missing fileId param");
  const file = await getFile(params.fileId);
  if (!file) {
    redirect("/?message=Page+Not+Found");
    throw new Response("Not Found", { status: 404 });
  }
  return json({ file: file });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  console.log("Action params:", params);
  invariant(params.fileId, "Missing fileId param");

  // Check intent
  const formData = await request.formData();
  const formObj = Object.fromEntries(formData);
  console.log("formObj:", formObj);

  // * Is torrent callback
  if (formObj.intent === "acquireToken") {
    console.log("intent: acquireToken");
    // No magnet provided, return
    if (!formObj.magnet) {
      return json({ token: "" });
    }

    // Generate & save token
    const token = await HashMap.genToken(formObj.magnet as string);
    console.log("Token:", token);

    return json({ token: token });
  }

  // Get file which is gonna use anyway
  const file = await getFile(params.fileId);
  if (!file) {
    redirect("/?message=Page+Not+Found");
    throw new Response("Not Found", { status: 404 });
  }
  console.log("File:", file);

  // * is human cancel submission
  if (formObj.intent === "cancelSubmission") {
    console.log("intent: cancelSubmission");
    // if file is newly created, delete it
    if (!file.magnet) {
      deleteFile(params.fileId);
    }

    // else, don't save changes
    // * no need to redirect, client side will navigate(-1)
    return null;
  }

  // * Is human clicking button
  console.log("intent: saveFile");

  // No file or link provided, delete this record
  if (!formObj.file || !formObj.magnet) {
    deleteFile(params.fileId);
    return redirect("/?message=File+not+saved");
  }

  const updates = {
    filename:
      (formObj.file as File).name || file.filename || params.fileId || "",
    type: (formObj.file as File).type || file.type || "",
    size: (formObj.file as File).size || file.size || -1,
    magnet: (formObj.magnet as string) || file.magnet || "",
    token: (formObj.token as string) || file.token || "",
    notes: (formObj.notes as string) || file.notes || "",
  };

  console.log("Updates:", updates);

  const newFile = await updateFile(params.fileId, updates);
  // TODO: Update token element
  return redirect(`/files/${params.fileId}/?message=File+saved`);
};

export default function EditFile() {
  const { file: dbFileJson } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null); // TODO: Check if this was unused
  const [token, setToken] = useState<string | null>(null);
  const [torrent, setTorrent] = useState<WebTorrent.Torrent | null>(null);
  const [client, setClient] = useState(null);
  const fetcher = useFetcher();

  useEffect(() => {
    // TODO: Adopt a better way to load WebTorrent
    // ? 1. use the same way as hashmap.server.ts::crypto
    // ? 2. import normally, and config in tsconfig.json
    const loadWebTorrent = async () => {
      // Get URL to conform to Vite's policy
      const webTorrentUrl = new URL(
        "/webtorrent.min.js",
        import.meta.url
      ).toString();

      // console.log("Loading WebTorrent from:", webTorrentUrl);

      const script = document.createElement("script");
      script.src = webTorrentUrl;
      script.type = "module";
      script.onload = () => {
        // console.log("WebTorrent loaded");
        setClient(new WebTorrent());
      };
      script.onerror = () => {
        console.error("WebTorrent failed to load");
      };
      document.head.appendChild(script);
    };

    if (typeof WebTorrent !== "undefined") {
      // console.log("WebTorrent already loaded");
      setClient(new WebTorrent());
    } else {
      loadWebTorrent();
    }
  }, []);

  const handleSubmit = (files: FileList | null) => {
    invariant(files, "No file selected");
    // console.log("Submitting files:", files);
    // console.log("Client:", client);
    // console.log("Files:", files);
    if (!client || !files) {
      Swal.fire({
        icon: "error",
        title: "Client not ready",
        text: "Please try again later",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return;
    }

    // Seed the file
    const selectedFile = files[0];
    client.seed(selectedFile, async (torrent) => {
      clearTimeout(timeoutId);
      setTorrent(torrent);
      console.log("Client is seeding:", torrent.magnetURI);

      // [ ] Call action with intend to acquire token
      const formData = new FormData();
      formData.append("intent", "acquireToken");
      formData.append("magnet", torrent.magnetURI);
      fetcher.submit(formData, {
        method: "POST",
        action: ".",
      });

      Swal.fire({
        icon: "success",
        title: "File seeded!",
        text: "Your link is ready for sharing 🎉",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
    });

    const timeoutId = setTimeout(() => {
      // Prompt user that file is being seeded
      console.log("Seeding in progress, please wait...");
      toastr.info("Seeding in progress, please wait...");
    }, 1000);
  };

  useEffect(() => {
    if (fetcher.data) {
      console.log("Response data:", fetcher.data);
      const receivedToken = fetcher.data.token || "";
      setToken(receivedToken);
    }
  }, [fetcher.data]);

  const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    let text: HTMLInputElement | null = null;
    if (event.currentTarget.id === "copy-magnet") {
      text = document.querySelector("input[name=magnet]");
    } else if (event.currentTarget.id === "copy-token") {
      text = document.querySelector("input[name=token]");
    } else {
      console.error("Unknown copy target");
      return;
    }

    if (text instanceof HTMLInputElement) {
      // text.select();
      navigator.clipboard.writeText(text.value).then(
        () => {
          console.log("Text copied to clipboard");
          toastr.success("Copied to clipboard");
        },
        (err) => {
          console.error("Failed to copy text: ", err);
          toastr.error("Failed to copy text");
        }
      );
    }
  };

  return (
    // File drop zone
    <Form
      key={dbFileJson.id}
      id="contact-form"
      method="post"
      encType="multipart/form-data"
    >
      <div
        id="dropzone"
        // htmlFor="fileInput"
        onDrop={(event) => {
          event.preventDefault();
          const droppedFile = event.dataTransfer.files[0];
          if (droppedFile) {
            setFile(droppedFile);
            handleSubmit(event.dataTransfer.files);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <i
          className={
            (file
              ? fileIconMap[file.type] || "fas fa-file"
              : "fas fa-file-upload") + " fa-2x file-icon"
          }
        ></i>
        {file ? (
          <div>{file.name}</div>
        ) : (
          <div className="grey">Drag & Drop files here</div>
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
          name="filename"
          defaultValue={dbFileJson.filename || file?.name || ""}
          placeholder="Filename"
          type="text"
        />
        <input
          aria-label="Token"
          name="token"
          defaultValue={dbFileJson.token || token || ""}
          placeholder="Token"
          type="text"
          disabled
        />
        <button id="copy-token" type="button" onClick={handleCopy}>
          Copy
        </button>
      </p>
      <label>
        <span>Share with</span>
        <input
          defaultValue={dbFileJson.notes || ""}
          name="notes"
          placeholder="TODO"
          type="text"
          disabled
        />
      </label>
      <label>
        <span>File Link</span>
        <input
          name="_magnet"
          defaultValue={dbFileJson.magnet || torrent?.magnetURI || ""}
          placeholder="magnet:?"
          type="text"
          // type="password"
          disabled
        />
        <input
          className="hidden"
          type="text"
          name="magnet"
          value={dbFileJson.magnet || torrent?.magnetURI || ""}
          readOnly
        />
        <button id="copy-magnet" type="button" onClick={handleCopy}>
          Copy
        </button>
      </label>
      <label>
        <span>Notes</span>
        <textarea defaultValue={dbFileJson.notes || ""} name="notes" rows={6} />
      </label>
      <p>
        <button type="submit">Save</button>
        <button
          onClick={async () => {
            fetcher.submit(
              { intent: "cancelSubmission" },
              { method: "POST", action: `.` }
            );
            navigate(-1);
          }}
          type="button"
        >
          Cancel
        </button>
      </p>
    </Form>
  );
}
