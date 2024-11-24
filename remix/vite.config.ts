import { vitePlugin as remix } from "@remix-run/dev";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  esbuild: {
    drop: ["console", "debugger"],
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*.css"],
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "~": "/app",
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
