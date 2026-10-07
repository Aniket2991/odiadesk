import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OdiaDesk — Your Odisha. Your Local Desk.",
    short_name: "OdiaDesk",
    description: "Local news, district updates, jobs, events and useful information for Odisha.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#173c2d",
    lang: "en-IN",
    categories: ["news", "lifestyle", "utilities"],
  };
}
