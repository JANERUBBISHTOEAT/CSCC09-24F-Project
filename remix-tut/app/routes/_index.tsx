import { useLocation } from "@remix-run/react";
import { useEffect } from "react";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

export default function Index() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const message = params.get("message");
    if (message) {
      toastr.info(message);
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
