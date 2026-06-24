"use client";
import { useEffect, useState } from "react";
import { track } from "../lib/track";

// Save/restore a screener view locally (advisor workflow). Stores the query string only.
export default function ScreenerPresets() {
  const [saved, setSaved] = useState(null);
  useEffect(() => {
    try { setSaved(localStorage.getItem("mfp_screener") || null); } catch {}
  }, []);

  function save() {
    const qs = window.location.search || "?";
    try { localStorage.setItem("mfp_screener", qs); } catch {}
    setSaved(qs);
    track("fund_filter_saved", { qs });
  }
  function load() {
    if (saved) window.location.search = saved;
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={save} className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-ink-muted hover:text-ink">Save view</button>
      {saved && <button onClick={load} className="rounded-lg border border-line px-3 py-1.5 text-[12px] text-ink-muted hover:text-ink">Load saved</button>}
    </div>
  );
}
