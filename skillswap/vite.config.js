import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Target modern browsers for better optimization
    target: "esnext",
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize chunk size - using simplified config for Rolldown compatibility
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor code
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "vendor";
            }
            if (id.includes("lucide-react") || id.includes("framer-motion") || id.includes("headlessui")) {
              return "ui";
            }
            return "vendor-other";
          }
        },
      },
    },
    // Increase chunk size warning limit (default is 500kb)
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "lucide-react"],
  },
});
