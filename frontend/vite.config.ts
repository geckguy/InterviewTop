import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevMode = mode === "development";
  return {
    server: {
      port: 8080,
      strictPort: true,
      hmr: isDevMode ? undefined : false,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ],
  };
});
