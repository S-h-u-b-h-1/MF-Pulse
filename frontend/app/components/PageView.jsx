"use client";
import { useEffect } from "react";
import { track } from "../lib/track";

// Fires one page_view per mount (Phase 4 collection). Dedup in track() guards double-fires.
export default function PageView() {
  useEffect(() => {
    track("page_view", {});
  }, []);
  return null;
}
