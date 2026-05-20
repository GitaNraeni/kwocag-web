"use client";

import { useEffect, useRef } from "react";

export function DynamicFavicon() {
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    fetch("/api/site")
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) return;

        // Update favicon
        if (d.data.siteLogo) {
          // Remove existing favicons
          document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']").forEach(el => el.remove());

          const link = document.createElement("link");
          link.rel = "icon";
          link.type = "image/x-icon";
          link.href = d.data.siteLogo;
          document.head.appendChild(link);
        } else {
          // Default favicon
          let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = "https://files.catbox.moe/vms1wj.jpg";
        }

        // Update title
        if (d.data.siteName) {
          document.title = `${d.data.siteName} - Sewa Bot WhatsApp`;
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
