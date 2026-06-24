"use client";
import { useEffect, useRef } from "react";

/**
 * Animated financial-network background (floating nodes + liquidity links).
 * - Three.js is dynamically imported so it never touches the main bundle.
 * - Skipped entirely on prefers-reduced-motion; node count halved on small screens.
 * - Pauses when the tab is hidden; fully disposes on unmount.
 */
export default function HeroBackground() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let mounted = true;
    let raf = 0;
    let dispose = () => {};

    import("three")
      .then((THREE) => {
        if (!mounted || !el) return;
        const small = window.innerWidth < 760;
        const w = () => el.clientWidth || 1;
        const h = () => el.clientHeight || 1;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(58, w() / h(), 0.1, 100);
        camera.position.z = 14;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(w(), h());
        el.appendChild(renderer.domElement);

        const N = small ? 32 : 64;
        const SPREAD = 18;
        const LINK = 4.6;
        const limX = SPREAD / 2, limY = SPREAD * 0.32, limZ = SPREAD * 0.26;
        const nodes = [];
        for (let i = 0; i < N; i++) {
          nodes.push({
            p: new THREE.Vector3((Math.random() - 0.5) * SPREAD, (Math.random() - 0.5) * SPREAD * 0.64, (Math.random() - 0.5) * SPREAD * 0.52),
            v: new THREE.Vector3((Math.random() - 0.5) * 0.012, (Math.random() - 0.5) * 0.012, (Math.random() - 0.5) * 0.01),
          });
        }

        const pPos = new Float32Array(N * 3);
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ color: 0x9aa6ff, size: 0.14, transparent: true, opacity: 0.9 });
        const points = new THREE.Points(pGeo, pMat);
        scene.add(points);

        const lPos = new Float32Array(N * N * 3);
        const lGeo = new THREE.BufferGeometry();
        lGeo.setAttribute("position", new THREE.BufferAttribute(lPos, 3));
        const lMat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.2 });
        const lines = new THREE.LineSegments(lGeo, lMat);
        scene.add(lines);

        const onResize = () => {
          camera.aspect = w() / h();
          camera.updateProjectionMatrix();
          renderer.setSize(w(), h());
        };
        window.addEventListener("resize", onResize);

        const start = Date.now();
        const frame = () => {
          raf = requestAnimationFrame(frame);
          if (document.hidden) return;
          for (let i = 0; i < N; i++) {
            const nd = nodes[i];
            nd.p.add(nd.v);
            if (nd.p.x > limX || nd.p.x < -limX) nd.v.x *= -1;
            if (nd.p.y > limY || nd.p.y < -limY) nd.v.y *= -1;
            if (nd.p.z > limZ || nd.p.z < -limZ) nd.v.z *= -1;
            pPos[i * 3] = nd.p.x; pPos[i * 3 + 1] = nd.p.y; pPos[i * 3 + 2] = nd.p.z;
          }
          pGeo.attributes.position.needsUpdate = true;

          let s = 0;
          for (let i = 0; i < N; i++) {
            for (let j = i + 1; j < N; j++) {
              const a = nodes[i].p, b = nodes[j].p;
              if (a.distanceTo(b) < LINK) {
                lPos[s++] = a.x; lPos[s++] = a.y; lPos[s++] = a.z;
                lPos[s++] = b.x; lPos[s++] = b.y; lPos[s++] = b.z;
              }
            }
          }
          lGeo.setDrawRange(0, s / 3);
          lGeo.attributes.position.needsUpdate = true;

          scene.rotation.y += 0.0008;
          scene.rotation.x = Math.sin((Date.now() - start) * 0.00006) * 0.12;
          renderer.render(scene, camera);
        };
        frame();

        dispose = () => {
          window.removeEventListener("resize", onResize);
          pGeo.dispose(); lGeo.dispose(); pMat.dispose(); lMat.dispose(); renderer.dispose();
          if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
      })
      .catch(() => {});

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      dispose();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-60"
      style={{ maskImage: "radial-gradient(120% 100% at 70% 30%, #000 35%, transparent 78%)", WebkitMaskImage: "radial-gradient(120% 100% at 70% 30%, #000 35%, transparent 78%)" }}
    />
  );
}
