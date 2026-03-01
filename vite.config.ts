import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      ".ngrok-free.dev",
      ".ngrok.dev",
      "*.ngrok-free.dev",
      "*.ngrok.dev",
    ],
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  },
  preview: {
    allowedHosts: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Physio Calm Flow",
        short_name: "PhysioFlow",
        description: "Physiotherapy and wellness app",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        display_override: ["fullscreen", "standalone"],
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
});