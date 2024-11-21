import { useLocation } from "@remix-run/react";
import { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import invariant from "tiny-invariant";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

export default function Index() {
  const location = useLocation();
  const clientRef = useRef<any | null>(null);

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
    invariant(clientRef.current, "WebTorrent client not ready");
    const client = clientRef.current;

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
  };
  clientRef.current; //.something

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
      <iframe
        src="https://instant.io/"
        style={{ width: "100%", height: "500px", border: "none" }}
        title="Instant.io"
      ></iframe>
    </div>
  );
}
