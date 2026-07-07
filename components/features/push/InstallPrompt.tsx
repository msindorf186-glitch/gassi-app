"use client";

import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    queueMicrotask(() => {
      setIsIOS(iOS);
      setIsStandalone(standalone);
    });
  }, []);

  if (isStandalone || !isIOS) return null;

  return (
    <p className="rounded-xl bg-amber-soft px-3 py-2 text-xs text-ink">
      Damit Erinnerungen zuverlässig ankommen: Teilen-Symbol ⎋ antippen und
      „Zum Home-Bildschirm“ wählen.
    </p>
  );
}
