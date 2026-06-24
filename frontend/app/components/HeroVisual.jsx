"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import FlowNetwork from "./FlowNetwork";

// Lazy-load the 3D layer only on the client, only when used.
const FinancialNetwork3D = dynamic(() => import("./visuals/FinancialNetwork3D"), { ssr: false });

export default function HeroVisual({ nodes }) {
  // SSR + first client render = static SVG (matches markup, SEO-friendly, no shift).
  const [three, setThree] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 820;
    if (!reduced && !small) setThree(true);
  }, []);

  return three ? <FinancialNetwork3D nodes={nodes} /> : <FlowNetwork nodes={nodes} />;
}
