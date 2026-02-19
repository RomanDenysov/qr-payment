import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QR Platby - Generátor QR kódov",
    short_name: "QR Platby",
    description: "Bezplatný generátor QR kódov pre platby v BySquare formáte",
    start_url: "/",
    display: "standalone",
    theme_color: "#000000",
    background_color: "#000000",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
