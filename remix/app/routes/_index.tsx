import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { ActionFunctionArgs, json, LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData, useLocation } from "@remix-run/react";
import dotenv from "dotenv";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import toastr from "toastr";
import { mergeFiles } from "~/utils/data.server";
import {
  commitSession,
  destroySession,
  getSession,
  getUserSession,
  getVisitorSession,
} from "~/utils/session.server";
import { prettyBytes } from "../utils/functions";

if (typeof window === "undefined") {
  // Server-side
  dotenv.config();
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUserSession(request);
  return json({ googleClientId: process.env.GOOGLE_CLIENT_ID, user: user });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  console.log("Action params:", params);
  // Invariant check

  // Check intent
  const formData = await request.formData();
  const formObj = Object.fromEntries(formData);
  console.log("formObj:", formObj);

  // * Is OAuth callback
  if (formObj.intent === "OAuthCallback") {
    console.log("intent: OAuthCallback");
    const credential = formObj.credential as string;
    const decoded = jwtDecode(credential);
    console.log("Decoded:", decoded);

    // Login user
    const session = await getSession(request);
    session.set("user", decoded);

    // Merge visitor session
    const visitor = await getVisitorSession(request);
    if (visitor) {
      if (decoded.sub && visitor.sub) {
        mergeFiles(decoded.sub, visitor.sub);
      } else {
        console.error("User ID or Visitor ID is undefined");
      }
    }

    return json(
      { user: decoded },
      { headers: { "Set-Cookie": await commitSession(session) } }
    );
  }

  // * Is Logout
  if (formObj.intent === "Logout") {
    console.log("intent: Logout");
    const session = await getSession(request);

    return json(
      { user: null },
      { headers: { "Set-Cookie": await destroySession(session) } }
    );
  }
};

export default function Index() {
  const { googleClientId, user: initialUser } = useLoaderData<{
    googleClientId: string;
    user: Record<string, any>;
  }>();
  const location = useLocation();
  const [torrent, setTorrent] = useState<any | null>(null);
  const clientRef = useRef<any | null>(null);
  const client_id = googleClientId || "";
  const fetcher = useFetcher<{
    googleClientId: string;
    user: Record<string, any>;
  }>();
  const [loggedIn, setLoggedIn] = useState(initialUser ? true : false);
  const [user, setUser] = useState<Record<string, any> | null>(null);

  async function loadModule() {
    console.log("Loading WebTorrent module");
    if (typeof window !== "undefined" && !clientRef.current) {
      import("webtorrent").then((WebTorrent) => {
        clientRef.current = new WebTorrent.default();
        console.log("WebTorrent client ready", clientRef.current);
      });
    }
  }

  useEffect(() => {
    loadModule();
  }, []);

  const handleDownload = async (magnet: string) => {
    invariant(magnet, "No magnet link provided");

    if (!clientRef.current || !magnet) {
      Swal.fire({
        icon: "error",
        title: "Client not ready",
        text: "Please try again later",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      console.error("Client not ready", clientRef.current);
      loadModule();
      return;
    }

    clientRef.current.add(magnet, async (torrent: any) => {
      console.log("Client is downloading:", torrent.infoHash);
      console.log("Torrent ready", torrent);
      clearTimeout(timeoutId);
      setTorrent(torrent);

      // Show progress bar
      const progress_div: any = document.getElementById("progress");
      const down_speed_div: any = document.getElementById("down_speed");
      const up_speed_div: any = document.getElementById("up_speed");
      const peers_div: any = document.getElementById("peers");

      torrent.on("ready", () => {
        console.log("Download started.");
        progress_div.innerHTML = `Progress: ${(0).toFixed(2)}%`;
      });

      torrent.on("download", (bytes: any) => {
        console.log(`Progress: ${(torrent.progress * 100).toFixed(2)}%`);
        progress_div.innerHTML = `Progress: ${(torrent.progress * 100).toFixed(
          2
        )}%`;
        down_speed_div.innerHTML = `Download speed: ${prettyBytes(
          torrent.downloadSpeed
        )}/s`;
        up_speed_div.innerHTML = `Upload speed: ${prettyBytes(
          torrent.uploadSpeed
        )}/s`;
        peers_div.innerHTML = `Peers: ${torrent.numPeers}`;
      });

      torrent.on("done", () => {
        console.log("Download finished.");
        progress_div.innerHTML = `Progress: ${(100).toFixed(2)}%`;

        Swal.fire({
          icon: "success",
          title: "Download finished!",
          text: "Your file is ready for use 🎉",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        });
      });
    });

    const timeoutId = setTimeout(() => {
      console.log("Download in progress, please wait...");
      toastr.info("Download in progress, please wait...");
    }, 1000);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const message = params.get("message");
    if (message) {
      toastr.warning(message);
      window.history.replaceState({}, "", location.pathname);
    }
  }, [location]);

  useEffect(() => {
    if (fetcher.data?.user) {
      setUser(fetcher.data.user);
    }
  }, [fetcher.data]);

  const handleLogin = (credentialResponse: any) => {
    fetcher.load(".");
    fetcher.submit(
      {
        intent: "OAuthCallback",
        credential: credentialResponse.credential || "",
      },
      {
        method: "POST",
        action: ".",
      }
    );
    setLoggedIn(true);
  };

  const handleLogout = () => {
    fetcher.load(".");
    fetcher.submit(
      {
        intent: "Logout",
      },
      {
        method: "POST",
        action: ".",
      }
    );
    setLoggedIn(false);
  };

  return (
    <div id="index-page">
      <p>Download using magnet link:</p>
      <input
        type="text"
        name="magnet"
        title="Magnet link"
        onChange={(e) => {
          handleDownload(e.target.value);
        }}
        id="fileInput"
      />
      <div id="progress"></div>
      <div id="down_speed"></div>
      <div id="up_speed"></div>
      <div id="peers"></div>
      <div className="google-login-container">
        <div className={loggedIn ? "" : "hidden"}>
          <p>
            You are logged in as {user?.name || initialUser?.name || "visitor"}
          </p>
          <button
            onClick={() => {
              handleLogout();
            }}
          >
            Logout
          </button>
        </div>
        <GoogleOAuthProvider clientId={client_id}>
          <div className={loggedIn ? "hidden" : ""}>
            <p>or log in to see file history:</p>
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                console.log(credentialResponse);
                handleLogin(credentialResponse);
              }}
              onError={() => {
                console.log("Login Failed");
              }}
            />
          </div>
        </GoogleOAuthProvider>
      </div>
    </div>
  );
}
