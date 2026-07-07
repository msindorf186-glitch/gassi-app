import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gassi-App für Luca",
    short_name: "Gassi-App",
    description: "Erinnert Luca ans Gassigehen und dokumentiert jeden Spaziergang.",
    start_url: "/",
    display: "standalone",
    background_color: "#eff1e9",
    theme_color: "#3f7859",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
