import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { useEffect } from "react";
import { createEmptyFile, getFiles } from "~/utils/data.server";
import { getUserSession } from "./utils/session.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "/css/app.css" },
  { rel: "stylesheet", href: "/css/all.min.css" },
  { rel: "stylesheet", href: "/css/toastr.min.css" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // TODO: Add user authentication
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const user = await getUserSession(request);
  const files = await getFiles(user.sub, q);
  return json({ files: files, q });
};

export const action = async ({ request }) => {
  const user = await getUserSession(request);
  const file = await createEmptyFile(user.sub);
  return redirect(`/files/${file.id}/edit`);
};

export default function App() {
  const { files: files, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* <script type="module">
          import WebTorrent from 'webtorrent.min.js'
        </script> */}
        {/* ! HTML embed: import no complain, but module not found anywhere (waited) */}
        <div id="sidebar">
          <Link to=".">
            <h1>Receive Files</h1>
          </Link>
          <div>
            <Form
              id="search-form"
              onChange={(event) => {
                const isFirstSearch = q === null;
                submit(event.currentTarget, {
                  replace: !isFirstSearch,
                });
              }}
              role="search"
            >
              <input
                id="q"
                className={searching ? "loading" : ""}
                defaultValue={q || ""}
                aria-label="Search files"
                placeholder="Search"
                type="search"
                name="q"
              />
              <div id="search-spinner" hidden={!searching} aria-hidden />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {files.length ? (
              <ul>
                {files.map((file) => (
                  <li key={file.id}>
                    {" "}
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                      to={`files/${file.id}`}
                    >
                      {file.filename || file.token ? (
                        <>
                          {file.filename} #{file.token ? file.token : "------"}
                          {/* TODO: Make file.token grey*/}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {file.favorite ? <span>★</span> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No files</i>
              </p>
            )}
          </nav>
        </div>
        <div
          className={
            navigation.state === "loading" && !searching ? "loading" : ""
          }
          id="detail"
        >
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
