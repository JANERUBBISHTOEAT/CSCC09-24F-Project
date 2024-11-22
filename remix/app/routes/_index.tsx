import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { json, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useLocation } from "@remix-run/react";
import dotenv from "dotenv";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import invariant from "tiny-invariant";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import { prettyBytes } from "../utils/functions";

if (typeof window === "undefined") {
  // Server-side
  dotenv.config();
}

export const loader: LoaderFunction = async () => {
  return json({ googleClientId: process.env.GOOGLE_CLIENT_ID });
};

export default function Index() {
  const { googleClientId } = useLoaderData<{ googleClientId: string }>();
  const location = useLocation();
  const [torrent, setTorrent] = useState<any | null>(null);
  const clientRef = useRef<any | null>(null);
  const client_id = googleClientId || "";

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

  return (
    <div id="index-page">
      <p>
        Download page under construction 🚧
        <br />
        Check out download sample{" "}
        <a href="https://instant.io/">https://instant.io/</a>.
      </p>
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
        <GoogleOAuthProvider clientId={client_id}>
          <div>
            <h1>Login</h1>
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                console.log(credentialResponse);
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
