"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { SideMenu, type ModuleKey } from "@/app/components/SideMenu";
import { PlayerPanel, type Track } from "@/app/components/PlayerPanel";

type SystemLine = "Red" | "Blue" | "Purple" | "Gold";

type Destination = {
  key: string;
  label: string;
  code: string;
  // system line (visual identity)
  systemLine: SystemLine;
  lineColor: string;
  href: string;
  // normalized coords (0..1) from top-left of the image
  u: number;
  v: number;
};

type NarrativeLine = {
  key: "intro" | "street" | "kaizen" | "hustle" | "enlightenment";
  name: string;
};

const IMAGE_W = 1280;
const IMAGE_H = 853;

// From the provided map screenshot (approx px coords)
// Finalized placement coordinates (from Placement Mode).
// NOTE: "breakupsong" still needs placement.
const PLACED: Record<string, { u: number; v: number }> = {
  "intro": { "u": 0.4689575712936792, "v": 0.8121974322014552 },
  "more-than-friends": { "u": 0.45971089040243474, "v": 0.6030747077744488 },
  "amber": { "u": 0.6862545722379246, "v": 0.5336975006185696 },
  "golden-boba": { "u": 0.5548196081409494, "v": 0.26015308383253277 },
  "mind-body-soul": { "u": 0.5019814316195523, "v": 0.45341816090962417 },
  "tris-me": { "u": 0.58850394567334, "v": 0.4345872046815997 },
  "pink-50s": { "u": 0.37913267120730426, "v": 0.8875212571135526 },
  "cherry-blossom-serenade": { "u": 0.3870583976855137, "v": 0.6010925018557094 },
  "breakupsong": { "u": 0.44980373230467297, "v": 0.7279536806550306 }
};

function withPlaced(key: string, u: number, v: number) {
  const p = PLACED[key];
  return p ? { u: p.u, v: p.v } : { u, v };
}

// Album content destinations (map stations)
const DESTINATIONS: Destination[] = [
  {
    key: "intro",
    label: "Ghetto Haiku (Intro)",
    code: "P-01",
    systemLine: "Purple",
    lineColor: "#7c3aed",
    href: "https://untitled.stream/buy/project/hGBEJT3s3ZGDzItNJYgC6",
    ...withPlaced("intro", 190 / IMAGE_W, 400 / IMAGE_H),
  },
  {
    key: "more-than-friends",
    label: "More Than Friends",
    code: "G-02",
    systemLine: "Gold",
    lineColor: "#fbbf24",
    href: "https://untitled.stream/buy/project/hGBEJT3s3ZGDzItNJYgC6",
    ...withPlaced("more-than-friends", 195 / IMAGE_W, 275 / IMAGE_H),
  },
  {
    key: "amber",
    label: "Amber",
    code: "P-03",
    systemLine: "Purple",
    lineColor: "#7c3aed",
    href: "https://untitled.stream/buy/project/hGBEJT3s3ZGDzItNJYgC6",
    ...withPlaced("amber", 310 / IMAGE_W, 430 / IMAGE_H),
  },
  {
    key: "golden-boba",
    label: "Golden Boba",
    code: "G-04",
    systemLine: "Gold",
    lineColor: "#fbbf24",
    href: "https://untitled.stream/buy/project/7knQBmL1NgffFXMw9LT2w",
    ...withPlaced("golden-boba", 330 / IMAGE_W, 315 / IMAGE_H),
  },
  {
    key: "mind-body-soul",
    label: "Mind Body Soul",
    code: "B-05",
    systemLine: "Blue",
    lineColor: "#60a5fa",
    href: "https://untitled.stream/buy/project/7knQBmL1NgffFXMw9LT2w",
    ...withPlaced("mind-body-soul", 245 / IMAGE_W, 350 / IMAGE_H),
  },
  {
    key: "tris-me",
    label: "Tris Me",
    code: "R-06",
    systemLine: "Red",
    lineColor: "#ff0a2b",
    href: "https://untitled.stream/buy/project/7knQBmL1NgffFXMw9LT2w",
    ...withPlaced("tris-me", 240 / IMAGE_W, 455 / IMAGE_H),
  },
  {
    key: "pink-50s",
    label: "Pink 50s",
    code: "R-07",
    systemLine: "Red",
    lineColor: "#ff0a2b",
    href: "https://untitled.stream/buy/project/7knQBmL1NgffFXMw9LT2w",
    ...withPlaced("pink-50s", 420 / IMAGE_W, 420 / IMAGE_H),
  },
  {
    key: "cherry-blossom-serenade",
    label: "Cherry Blossom Serenade",
    code: "B-08",
    systemLine: "Blue",
    lineColor: "#60a5fa",
    href: "https://untitled.stream/buy/project/7knQBmL1NgffFXMw9LT2w",
    ...withPlaced("cherry-blossom-serenade", 460 / IMAGE_W, 280 / IMAGE_H),
  },
  {
    key: "breakupsong",
    label: "BreakUpSong",
    code: "G-09",
    systemLine: "Gold",
    lineColor: "#fbbf24",
    href: "https://www.canva.com/design/DAGsvyn8uMg/gILQh1m5JRHNTxnNaTvfYg/watch?utm_content=DAGsvyn8uMg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hffab9ca1a1",
    u: 520 / IMAGE_W,
    v: 360 / IMAGE_H,
  }
];

const NARRATIVE_LINES: NarrativeLine[] = [
  { key: "intro", name: "Line 1 — Intro" },
  { key: "street", name: "Line 2 — Street Philosophy" },
  { key: "kaizen", name: "Line 3 — Kaizen" },
  { key: "hustle", name: "Line 4 — The Hustle" },
  { key: "enlightenment", name: "Line 5 — Enlightenment" }
];

// Default narrative grouping (editable):
const NARRATIVE_ASSIGN: Record<NarrativeLine["key"], string[]> = {
  intro: ["intro"],
  street: ["more-than-friends", "tris-me"],
  kaizen: ["amber", "mind-body-soul"],
  hustle: ["golden-boba", "pink-50s"],
  enlightenment: ["cherry-blossom-serenade", "breakupsong"]
};

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function StationBadge({ d }: { d: Destination }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 10px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.16)",
        background: "rgba(10,10,10,0.75)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 36,
          height: 22,
          borderRadius: 999,
          background: d.lineColor,
          color: "#0a0a0a",
          fontWeight: 950,
          fontSize: 11,
          display: "grid",
          placeItems: "center",
        }}
        title={`${d.systemLine} Line`}
      >
        {d.code.split("-")[0]}
      </div>
      <div style={{ display: "grid", lineHeight: 1.05 }}>
        <div style={{ fontWeight: 900, fontSize: 12, color: "#F0E8DC", letterSpacing: 0.6 }}>
          {d.label.toUpperCase()}
        </div>
        <div style={{ fontSize: 10, color: "rgba(240,232,220,0.72)", fontWeight: 700 }}>
          {d.code} • {d.systemLine}
        </div>
      </div>
    </div>
  );
}

function MapScene({
  destinations,
  placementMode,
  placementKey,
  onSelect,
  onPlace,
}: {
  destinations: Destination[];
  placementMode: boolean;
  placementKey: string | null;
  onSelect: (d: Destination) => void;
  onPlace: (u: number, v: number) => void;
}) {
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    // Full UI backdrop image (reference style)
    const tex = loader.load("/backdrop.jpg");
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);

  // Plane size in world units (keep aspect)
  const planeW = 10;
  const planeH = (IMAGE_H / IMAGE_W) * planeW;

  return (
    <group>
      <mesh
        onPointerDown={(e) => {
          if (!placementMode) return;
          // R3F provides uv on intersections for PlaneGeometry.
          const uv = (e as any).uv as { x: number; y: number } | undefined;
          if (!uv) return;
          // UV: (0,0) bottom-left, (1,1) top-right. Convert to (u,v) top-left.
          const u = uv.x;
          const v = 1 - uv.y;
          onPlace(u, v);
        }}
        onPointerOver={() => {
          if (placementMode) document.body.style.cursor = "crosshair";
        }}
        onPointerOut={() => {
          if (placementMode) document.body.style.cursor = "default";
        }}
      >
        <planeGeometry args={[planeW, planeH]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {destinations.map((d) => {
        const x = (d.u - 0.5) * planeW;
        const y = (0.5 - d.v) * planeH;
        const isPlacing = placementMode && placementKey === d.key;

        return (
          <group key={d.key} position={[x, y, 0.05]}>
            <mesh
              onClick={() => {
                if (placementMode) return;
                onSelect(d);
              }}
              onPointerOver={() => {
                if (!placementMode) document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                if (!placementMode) document.body.style.cursor = "default";
              }}
            >
              <circleGeometry args={[0.16, 32]} />
              <meshBasicMaterial color={isPlacing ? "#FFD540" : d.lineColor} transparent opacity={0.95} />
            </mesh>
            <mesh>
              <ringGeometry args={[0.20, 0.24, 48]} />
              <meshBasicMaterial color={isPlacing ? "#FFD540" : d.lineColor} transparent opacity={0.55} />
            </mesh>
            <Html position={[0.0, 0.55, 0]} center>
              <StationBadge d={d} />
            </Html>
          </group>
        );
      })}

      {/* Title */}
      <Html position={[-4.75, 2.7, 0.2]}>
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
            width: 240,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16 }}>Ghetto Haiku</div>
          <div style={{ opacity: 0.75, fontSize: 12, marginTop: 4 }}>
            Tap a station to travel.
          </div>
        </div>
      </Html>
    </group>
  );
}

function CameraTravel({
  target,
  onArrive,
}: {
  target: THREE.Vector3 | null;
  onArrive: () => void;
}) {
  const { camera } = useThree();
  const startRef = useRef<THREE.Vector3 | null>(null);
  const tRef = useRef(0);
  const arrivedRef = useRef(false);

  useFrame((_, delta) => {
    if (!target) return;
    if (!startRef.current) {
      startRef.current = camera.position.clone();
      tRef.current = 0;
      arrivedRef.current = false;
    }

    tRef.current += delta / 0.9; // ~0.9s travel
    const t = Math.min(1, tRef.current);
    const k = easeInOut(t);

    const desired = new THREE.Vector3(target.x, target.y, 6);
    camera.position.lerpVectors(startRef.current, desired, k);
    camera.lookAt(target.x, target.y, 0);

    if (t >= 1 && !arrivedRef.current) {
      arrivedRef.current = true;
      onArrive();
    }

    if (t >= 1) {
      // reset so another click restarts animation
      startRef.current = null;
    }
  });

  return null;
}

export default function HomePage() {
  const [selected, setSelected] = useState<Destination | null>(null);
  const [travelTarget, setTravelTarget] = useState<THREE.Vector3 | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeNarrative, setActiveNarrative] = useState<NarrativeLine["key"]>("intro");
  const [module, setModule] = useState<ModuleKey>("tracks");

  // Placement Mode (press P)
  const [placementMode, setPlacementMode] = useState(false);
  const [placementIndex, setPlacementIndex] = useState(0);
  const [placed, setPlaced] = useState<Record<string, { u: number; v: number }>>({});

  const planeW = 10;
  const planeH = (IMAGE_H / IMAGE_W) * planeW;

  function destinationToWorld(d: Destination) {
    const x = (d.u - 0.5) * planeW;
    const y = (0.5 - d.v) * planeH;
    return new THREE.Vector3(x, y, 0);
  }

  const allowedKeys = new Set(NARRATIVE_ASSIGN[activeNarrative]);
  const activeDestinations = DESTINATIONS.filter((d) => allowedKeys.has(d.key));

  const placementKey = placementMode ? DESTINATIONS[Math.min(placementIndex, DESTINATIONS.length - 1)]?.key ?? null : null;

  // Keyboard shortcut: P toggles placement mode, Esc exits
  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key.toLowerCase() === "p") {
        setPlacementMode((v) => !v);
      }
      if (ev.key === "Escape") {
        setPlacementMode(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);


  // For the UI player panel
  const currentTrack: Track | null = selected
    ? {
        key: selected.key,
        title: selected.label,
        systemLine: selected.systemLine,
        lineColor: selected.lineColor,
        href: selected.href,
        code: selected.code,
      }
    : null;

  const visibleList = placementMode ? DESTINATIONS : activeDestinations;

  const idx = currentTrack ? visibleList.findIndex((d) => d.key === currentTrack.key) : -1;

  function openSelected() {
    const href = selected?.href;
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  }

  function selectByOffset(delta: number) {
    if (!visibleList.length) return;
    const next = visibleList[(Math.max(0, idx) + delta + visibleList.length) % visibleList.length];
    setSelected(next);
    setShowModal(false);
    setTravelTarget(destinationToWorld(next));
  }

  return (
    <div className="mc-shell">
      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", height: "100%" }}>
        <SideMenu active={module} onChange={setModule} />

        <div style={{ position: "relative" }}>
          <div className="mc-topbar">
            <div className="mc-topTitle">HAIKU TRANSIT SYSTEM</div>
            <div className="mc-linePills">
              <span className="mc-pill" style={{ borderColor: "rgba(255,10,43,0.35)" }}>
                <span style={{ color: "#ff0a2b", fontWeight: 950 }}>Red</span> Hustle
              </span>
              <span className="mc-pill" style={{ borderColor: "rgba(96,165,250,0.35)" }}>
                <span style={{ color: "#60a5fa", fontWeight: 950 }}>Blue</span> Wisdom
              </span>
              <span className="mc-pill" style={{ borderColor: "rgba(124,58,237,0.35)" }}>
                <span style={{ color: "#7c3aed", fontWeight: 950 }}>Purple</span> Legacy
              </span>
              <span className="mc-pill" style={{ borderColor: "rgba(255,213,64,0.35)" }}>
                <span style={{ color: "#ffd540", fontWeight: 950 }}>Gold</span> Divine N9NE
              </span>
            </div>
          </div>

          <div className="mc-mapFrame">
            <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 2]}>
              <color attach="background" args={["#06070a"]} />
              <ambientLight intensity={1.0} />

              <MapScene
                destinations={visibleList}
                placementMode={placementMode}
                placementKey={placementKey}
                onSelect={(d) => {
                  setSelected(d);
                  setShowModal(false);
                  setTravelTarget(destinationToWorld(d));
                }}
                onPlace={(u, v) => {
                  if (!placementKey) return;
                  setPlaced((prev) => ({ ...prev, [placementKey]: { u, v } }));
                  setPlacementIndex((i) => Math.min(i + 1, DESTINATIONS.length - 1));
                }}
              />

              <CameraTravel
                target={travelTarget}
                onArrive={() => {
                  setShowModal(true);
                }}
              />
            </Canvas>

            {/* active route chip */}
            <div style={{ position: "absolute", left: 16, bottom: 16 }}>
              <span className="mc-pill">{NARRATIVE_LINES.find((l) => l.key === activeNarrative)?.name}</span>
            </div>

            {/* placement mode panel (only when active) */}
            {placementMode ? (
              <div style={{ position: "absolute", right: 16, bottom: 16, width: "min(520px, 92vw)" }}>
                <div className="mc-player" style={{ position: "static", width: "100%" }}>
                  <div style={{ fontWeight: 950, letterSpacing: 1 }}>PLACEMENT MODE</div>
                  <div style={{ marginTop: 6, color: "rgba(240,232,220,0.75)", fontSize: 12 }}>
                    Click the exact node on the backdrop. Press <b>P</b> to toggle, <b>Esc</b> to exit.
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12 }}>
                    Now placing: <b>{placementKey ?? "(none)"}</b> ({placementIndex + 1}/{DESTINATIONS.length})
                  </div>
                  <div style={{ marginTop: 10, padding: 10, borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.35)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace", fontSize: 11, whiteSpace: "pre-wrap", color: "rgba(240,232,220,0.9)" }}>
                    {JSON.stringify(placed, null, 2)}
                  </div>
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="mc-iconBtn" onClick={() => { setPlacementIndex(0); setPlaced({}); }}>Reset</button>
                    <button className="mc-iconBtn" onClick={() => navigator.clipboard?.writeText(JSON.stringify(placed, null, 2))}>Copy JSON</button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* player panel */}
            <PlayerPanel
              track={currentTrack}
              module={module}
              onOpen={openSelected}
              onPrev={() => selectByOffset(-1)}
              onNext={() => selectByOffset(1)}
            />
          </div>
        </div>
      </div>

      {showModal && selected ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              width: "min(520px, 92vw)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(10,10,10,0.92)",
              color: "#fff",
              padding: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 950 }}>{selected.label}</div>
                <div style={{ marginTop: 2, fontSize: 12, opacity: 0.75 }}>
                  {selected.code} • {selected.systemLine}
                </div>
              </div>
              <div
                style={{
                  width: 46,
                  height: 28,
                  borderRadius: 999,
                  background: selected.lineColor,
                  color: "#0a0a0a",
                  fontWeight: 950,
                  display: "grid",
                  placeItems: "center",
                }}
                title={`${selected.systemLine} Line`}
              >
                {selected.code.split("-")[0]}
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.78 }}>
              You’ve arrived. Open the destination:
            </div>

            <a
              href={selected.href}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                marginTop: 14,
                width: "100%",
                justifyContent: "center",
                padding: "10px 12px",
                borderRadius: 12,
                background: selected.lineColor,
                color: "#0a0a0a",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              Open
            </a>

            <button
              style={{
                marginTop: 10,
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                background: "transparent",
                color: "#e5e7eb",
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer",
              }}
              onClick={() => setShowModal(false)}
            >
              Back to map
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
