import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { ActionFunctionArgs, json, LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData, useLocation } from "@remix-run/react";
import dotenv from "dotenv";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import invariant from "tiny-invariant";
import toastr from "toastr";
import { mergeFiles } from "~/utils/data.server";
import { prettyBytes } from "~/utils/functions";
import HashMap from "~/utils/hashmap.server";
import {
  commitSession,
  destroySession,
  getSession,
  getUserSession,
  getVisitorSession,
} from "~/utils/session.server";

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

  // * Is acquireMagnet
  if (formObj.intent === "acquireMagnet") {
    console.log("intent: acquireMagnet");
    const token = formObj.token as string;
    const magnet = await HashMap.get(token);
    console.log("Magnet:", magnet);
    return json({ magnet: magnet });
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
    fileId?: string;
    magnet?: string;
    token?: string;
    intent?: string;
  }>();
  const [loggedIn, setLoggedIn] = useState(initialUser ? true : false);
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const debounce = (value: string, type: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Clear input CSS
    const token_elem = document.getElementById(
      "tokenInput"
    ) as HTMLInputElement;
    const magnet_elem = document.getElementById(
      "magnetInput"
    ) as HTMLInputElement;

    if (type === "token") {
      token_elem.className = "";
    } else {
      magnet_elem.className = "";
    }
    void token_elem.offsetWidth;

    debounceTimeout.current = setTimeout(() => {
      handleDownload(value, type);
    }, 500);
  };

  const handleDownload = async (magnet_or_token: string, type: string) => {
    invariant(magnet_or_token, "No magnet link provided");

    // Load module if not ready
    if (!clientRef.current) {
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

    // Get magnet link if token
    // ! Cannot get response here, use useEffect in Index()
    if (type === "token") {
      // * Is token, get magnet link & save to history
      console.log("Downloading using token:", magnet_or_token);
      // Fetch magnet link
      const formData = new FormData();
      formData.append("intent", "acquireMagnet");
      formData.append("token", magnet_or_token);
      fetcher.submit(formData, {
        method: "POST",
        action: "/api/" + "new" + "/token",
      });
    } else {
      // * Is magnet, get token & save to history
      console.log("Downloading using magnet:", magnet_or_token);
      const formData = new FormData();
      formData.append("intent", "acquireToken");
      formData.append("magnet", magnet_or_token);
      fetcher.submit(formData, {
        method: "POST",
        action: "/api/" + "new" + "/token",
      });
    }
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
    if (!fetcher.data) {
      console.error("No data found");
      return;
    }

    console.log("Fetcher data:", fetcher.data);

    // Acquire user data
    if (fetcher.data.user) {
      setUser(fetcher.data.user);
      return;
    }

    const token_elem = document.getElementById(
      "tokenInput"
    ) as HTMLInputElement;
    const magnet_elem = document.getElementById(
      "magnetInput"
    ) as HTMLInputElement;

    // [x] Acquire magnet link & save to history
    if (fetcher.data.intent === "acquireMagnet") {
      if (!fetcher.data.magnet) {
        console.error("No magnet link found");
        token_elem.className = "";
        void token_elem.offsetWidth;
        token_elem.classList.add("wrong-input");
        return;
      } else {
        // Correct token
        token_elem.className = "";
        void token_elem.offsetWidth;
        token_elem.classList.add("correct-input");
      }
    }

    // [x] Tested download by magnet link
    else if (fetcher.data.intent === "acquireToken") {
      console.log("Acquiring token...");
      if (!fetcher.data.token) {
        console.error("No token found");
        console.error("No token found");
        magnet_elem.className = "";
        void token_elem.offsetWidth;
        magnet_elem.classList.add("wrong-input");
        // return;
      } else {
        console.log("Token acquired:", fetcher.data.token);
        // Pulse anyway
        magnet_elem.className = "";
        void token_elem.offsetWidth;
        magnet_elem.classList.add("correct-input");
      }
    }

    const magnet = fetcher.data.magnet;
    const torrent = clientRef.current.add(magnet);
    console.log("Client is downloading:", torrent.infoHash);
    console.log("Torrent ready", torrent);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    setTorrent(torrent);

    // Show progress bar
    const progress_div: any = document.getElementById("progress");
    const down_speed_div: any = document.getElementById("down_speed");
    const up_speed_div: any = document.getElementById("up_speed");
    const peers_div: any = document.getElementById("peers");

    torrent.on("ready", () => {
      console.log("Download started.");
      progress_div.innerHTML = `Progress: ${(0).toFixed(2)}%`;
      // [ ] Update file history (fileName, fileSize, ...)
      if (fetcher.data?.fileId) {
        const formData = new FormData();
        formData.append("intent", "updateFile");
        formData.append("fileid", fetcher.data.fileId);
        formData.append("magnet", torrent.magnetURI);
        formData.append("filename", torrent.name);
        formData.append("filesize", torrent.length);
        formData.append("filetype", torrent.files[0].type);
        fetcher.submit(formData, {
          method: "POST",
          action: "/api/files",
        });
      }
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

    torrent.on("done", async () => {
      console.log("Download finished.");
      progress_div.innerHTML = `Progress: ${(100).toFixed(2)}%`;
      down_speed_div.innerHTML = "";
      up_speed_div.innerHTML = "";
      peers_div.innerHTML = "";

      Swal.fire({
        icon: "success",
        title: "Download finished!",
        text: "Your file is ready for use 🎉",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });

      for (const file of torrent.files) {
        console.log("File:", file);
        downloadTorrentFile(file);
      }

      // Clear input
      token_elem.value = "";
      magnet_elem.value = "";
      token_elem.className = "";
      magnet_elem.className = "";
    });

    debounceTimeout.current = setTimeout(() => {
      console.log("Download in progress, please wait...");
      toastr.info("Download in progress, please wait...");
    }, 1000);
  }, [fetcher.data]);

  async function downloadTorrentFile(file: any) {
    const blob = await file.blob();
    console.log("Blob:", blob);
    const url = URL.createObjectURL(blob);

    const index_elem = document.getElementById("fileList") as HTMLElement;
    const a = document.createElement("a");
    a.href = url;
    a.innerText = "Download file" + file.name;
    a.download = file.name;
    a.click();
    index_elem.appendChild(a);
  }

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
      <div className="">
        {/* [x]: Make a soft warning here not Swal */}
        <p>Download using your token:</p>
        <input
          type="text"
          name="token"
          title="Token"
          onChange={(e) => {
            debounce(e.target.value, "token");
          }}
          id="tokenInput"
        />
      </div>

      <div className="">
        <p>or using magnet link:</p>
        <input
          type="text"
          name="magnet"
          title="Magnet link"
          onChange={(e) => {
            debounce(e.target.value, "magnet");
          }}
          id="magnetInput"
        />
      </div>

      <div id="progress"></div>
      <div id="down_speed"></div>
      <div id="up_speed"></div>
      <div id="peers"></div>

      <div id="fileList"></div>

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
