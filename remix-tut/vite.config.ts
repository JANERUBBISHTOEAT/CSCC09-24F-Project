import { vitePlugin as remix } from "@remix-run/dev";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    https: {
      key: "./server.key",
      cert: "./server.crt",
    },
    host: "0.0.0.0",
    port: 3100,
  },
  plugins: [
    remix({
      // ssr: false,
      ignoredRouteFiles: ["**/*.css"],
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      webtorrent: fileURLToPath(
        new URL(
          "./node_modules/webtorrent/dist/webtorrent.min.js",
          import.meta.url
        )
      ),
    },
  },
  ssr: {
    external: ["crypto", "webtorrent", "../../public/webtorrent.min.js"],
  },
  optimizeDeps: {
    exclude: ["crypto", "webtorrent", "../../public/webtorrent.min.js"],
  },
});
