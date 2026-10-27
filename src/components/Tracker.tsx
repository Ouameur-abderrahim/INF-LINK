"use client";

import { useEffect } from "react";

export function Tracker({ userId, productId }: { userId: string; productId?: string }) {
  useEffect(() => {
    const key = `vt:${userId}:${productId ?? "store"}`;
    if (sessionStorage.getItem(key)) return; // one hit per tab session
    sessionStorage.setItem(key, "1");
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, productId, kind: productId ? "click" : "view" }),
      keepalive: true,
    });
  }, [userId, productId]);
  return null;
}
