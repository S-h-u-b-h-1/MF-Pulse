"use client";
import { useEffect, useRef } from "react";

/**
 * Product-specific 3D capital-allocation network.
 * - Category hubs (Equity / Debt / Hybrid) as glowing nodes.
 * - AMC nodes clustered toward their dominant category; radius ∝ |flow|.
 * - Liquidity "pulses" travel AMC → category along flow lines.
 * - Colour: positive flow = category colour (emerald/blue/gold); negative = amber.
 * Three.js is dynamically imported (never in the main bundle). Pauses on hidden
 * tab, halves node load on mobile, disposes everything on unmount.
 */
export default function FinancialNetwork3D({ nodes = [] }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0, mounted = true, dispose = () => {};

    import("three").then((THREE) => {
      if (!mounted || !el) return;
      const small = window.innerWidth < 1000;
      const w = () => el.clientWidth || 1;
      const h = () => el.clientHeight || 1;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(52, w() / h(), 0.1, 100);
      camera.position.set(0, 0, 17);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(w(), h());
      el.appendChild(renderer.domElement);

      const root = new THREE.Group();
      scene.add(root);

      const CATS = {
        Equity: { pos: new THREE.Vector3(-6.5, 2.2, 0), color: 0x34d399 },
        Debt: { pos: new THREE.Vector3(6.5, 2.2, 0), color: 0x60a5fa },
        Hybrid: { pos: new THREE.Vector3(0, -5, 0), color: 0xfbbf24 },
      };
      const NEG = 0xf59e0b;

      // glowing category hubs
      for (const c of Object.values(CATS)) {
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 24), new THREE.MeshBasicMaterial({ color: c.color }));
        const halo = new THREE.Mesh(new THREE.SphereGeometry(1.5, 20, 20), new THREE.MeshBasicMaterial({ color: c.color, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending }));
        core.position.copy(c.pos); halo.position.copy(c.pos);
        root.add(core, halo);
      }

      const maxFlow = Math.max(...nodes.flatMap((n) => [Math.abs(n.equity || 0), Math.abs(n.debt || 0)]), 1);
      const list = (small ? nodes.slice(0, 5) : nodes).slice(0, 9);
      const pulses = [];
      const disposables = [];

      list.forEach((n, i) => {
        // one link per dominant category the AMC moves into
        const links = [
          { cat: "Equity", v: n.equity || 0 },
          { cat: "Debt", v: n.debt || 0 },
        ].filter((l) => Math.abs(l.v) > 0);

        links.forEach((l) => {
          const hub = CATS[l.cat];
          const ang = (i / list.length) * Math.PI * 2;
          const reach = 4 + (Math.abs(l.v) / maxFlow) * 3.5;
          const node = hub.pos.clone().add(new THREE.Vector3(Math.cos(ang) * reach, Math.sin(ang) * reach * 0.5, (Math.random() - 0.5) * 3));
          const positive = l.v >= 0;
          const color = positive ? hub.color : NEG;
          const rad = 0.12 + (Math.abs(l.v) / maxFlow) * 0.34;

          const dotGeo = new THREE.SphereGeometry(rad, 14, 14);
          const dotMat = new THREE.MeshBasicMaterial({ color });
          const dot = new THREE.Mesh(dotGeo, dotMat);
          dot.position.copy(node);
          root.add(dot);
          disposables.push(dotGeo, dotMat);

          const curve = new THREE.CatmullRomCurve3([node, node.clone().lerp(hub.pos, 0.5).add(new THREE.Vector3(0, 1.2, 1)), hub.pos]);
          const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));
          const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.16 });
          root.add(new THREE.Line(lineGeo, lineMat));
          disposables.push(lineGeo, lineMat);

          const pGeo = new THREE.SphereGeometry(0.09, 10, 10);
          const pMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
          const pulse = new THREE.Mesh(pGeo, pMat);
          root.add(pulse);
          disposables.push(pGeo, pMat);
          pulses.push({ pulse, curve, t: Math.random(), speed: 0.0016 + Math.random() * 0.0016 });
        });
      });

      const onResize = () => { camera.aspect = w() / h(); camera.updateProjectionMatrix(); renderer.setSize(w(), h()); };
      window.addEventListener("resize", onResize);

      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (document.hidden) return;
        for (const p of pulses) {
          p.t = (p.t + p.speed) % 1;
          p.pulse.position.copy(p.curve.getPointAt(p.t));
        }
        root.rotation.y += 0.0011;
        root.rotation.x = Math.sin(Date.now() * 0.00007) * 0.08;
        renderer.render(scene, camera);
      };
      frame();

      dispose = () => {
        window.removeEventListener("resize", onResize);
        disposables.forEach((d) => d.dispose && d.dispose());
        scene.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      };
    }).catch(() => {});

    return () => { mounted = false; cancelAnimationFrame(raf); dispose(); };
  }, [nodes]);

  return (
    <div className="relative">
      <div ref={ref} className="h-[300px] w-full sm:h-[360px]" aria-hidden />
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-ink-faint">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "#34d399" }} />Equity</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "#60a5fa" }} />Debt</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "#fbbf24" }} />Hybrid</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "#f59e0b" }} />Outflow</span>
        <span>· node size ∝ net flow · pulses = capital movement</span>
      </div>
    </div>
  );
}
