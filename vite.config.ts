import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // you can set a custom port
  },
  build: {
    outDir: "dist",
  },
  base: "./", // ensures relative paths when local
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})



