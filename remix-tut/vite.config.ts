import { vitePlugin as remix } from "@remix-run/dev";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      // ssr: false,
      ignoredRouteFiles: ["**/*.css"],
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      crypto: resolve(__dirname, "node_modules/crypto-browserify"),
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
