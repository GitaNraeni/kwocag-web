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

        // Update favicon — pakai siteIcon (square), bukan siteLogo (wide)
        const iconUrl = d.data.siteIcon || d.data.siteLogo;
        if (iconUrl) {
          document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']").forEach(el => el.remove());
          const link = document.createElement("link");
          link.rel = "icon";
          link.href = iconUrl;
          document.head.appendChild(link);
        } else {
          let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
          if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
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
