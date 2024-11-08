import "@fortawesome/fontawesome-free/css/all.min.css";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";
import invariant from "tiny-invariant";
import type { FileRecord } from "../data";
import { getFile, updateFile, fileIconMap } from "../data";
import { useLocation } from "@remix-run/react";
import { useEffect } from "react";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

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
  return updateFile(params.fileId, {
    favorite: formData.get("favorite") === "true",
  });
};

// TODO: Remove contact page, use edit page
export default function File() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const message = params.get("message");
    if (message) {
      toastr.success(message);
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location]);

  const { file: file } = useLoaderData<typeof loader>();
  return (
    <div id="contact">
      <div>
        <i
          // alt={`${file.filename} ${file.token} avatar`}
          key={file.magnet}
          // src={file.magnet}
          className={
            (file ? fileIconMap[file.type] : "fas fa-file-question") +
            " fa-2x file-icon"
          }
        ></i>
      </div>

      <div>
        <h1>
          {file.filename || file.token ? (
            <>
              {file.filename} {file.token}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite file={file} />
        </h1>

        {file.notes ? (
          <p>
            Shared with
            <a href={`https://twitter.com/${file.notes}`}>{file.notes}</a>
          </p>
        ) : null}

        {file.notes ? <p>{file.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

const Favorite: FunctionComponent<{
  file: Pick<FileRecord, "favorite">;
}> = ({ file: file }) => {
  const fetcher = useFetcher();
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : file.favorite;

  return (
    <fetcher.Form method="post">
      <button
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
};
