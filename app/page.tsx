"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useState } from "react";

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

const IMAGE_W = 800;
const IMAGE_H = 570;

// From the provided map screenshot (approx px coords)
// Album content destinations (map stations)
const DESTINATIONS: Destination[] = [
  {
    key: "intro",
    label: "Ghetto Haiku (Intro)",
    code: "P-01",
    systemLine: "Purple",
    lineColor: "#7c3aed",
    href: "https://untitled.stream/buy/project/hGBEJT3s3ZGDzItNJYgC6",
    u: 190 / IMAGE_W,
    v: 400 / IMAGE_H,
  },
  {
    key: "more-than-friends",
    label: "More Than Friends",
    code: "G-02",
    systemLine: "Gold",
    lineColor: "#fbbf24",
    href: "https://untitled.stream/buy/project/hGBEJT3s3ZGDzItNJYgC6",
    u: 195 / IMAGE_W,
    v: 275 / IMAGE_H,
  },
  {
    key: "amber",
    label: "Amber",
    code: "P-03",
    systemLine: "Purple",
    lineColor: "#7c3aed",
    href: "https://untitled.stream/buy/project/hGBEJT3s3ZGDzItNJYgC6",
    u: 310 / IMAGE_W,
    v: 430 / IMAGE_H,
  },
  {
    key: "golden-boba",
    label: "Golden Boba",
    code: "G-04",
    systemLine: "Gold",
    lineColor: "#fbbf24",
    href: "https://untitled.stream/buy/project/7knQBmL1NgffFXMw9LT2w",
    u: 330 / IMAGE_W,
    v: 315 / IMAGE_H,
  },
  {
    key: "mind-body-soul",
    label: "Mind Body Soul",
    code: "B-05",
    systemLine: "Blue",
    lineColor: "#60a5fa",
    href: "https://untitled.stream/buy/project/7knQBmL1NgffFXMw9LT2w",
    u: 245 / IMAGE_W,
    v: 350 / IMAGE_H,
  },
  {
    key: "tris-me",
    label: "Tris Me",
    code: "R-06",
    systemLine: "Red",
    lineColor: "#ff0a2b",
    href: "https://untitled.stream/buy/project/7knQBmL1NgffFXMw9LT2w",
    u: 240 / IMAGE_W,
    v: 455 / IMAGE_H,
  },
  {
    key: "pink-50s",
    label: "Pink 50s",
    code: "R-07",
    systemLine: "Red",
    lineColor: "#ff0a2b",
    href: "https://untitled.stream/buy/project/7knQBmL1NgffFXMw9LT2w",
    u: 420 / IMAGE_W,
    v: 420 / IMAGE_H,
  },
  {
    key: "cherry-blossom-serenade",
    label: "Cherry Blossom Serenade",
    code: "B-08",
    systemLine: "Blue",
    lineColor: "#60a5fa",
    href: "https://untitled.stream/buy/project/7knQBmL1NgffFXMw9LT2w",
    u: 460 / IMAGE_W,
    v: 280 / IMAGE_H,
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
  onSelect,
}: {
  onSelect: (d: Destination) => void;
}) {
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    // Minimal artistic map (SVG rendered as texture by the browser)
    const tex = loader.load("/tokyo-minimal.svg");
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);

  // Plane size in world units (keep aspect)
  const planeW = 10;
  const planeH = (IMAGE_H / IMAGE_W) * planeW;

  return (
    <group>
      <mesh>
        <planeGeometry args={[planeW, planeH]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {DESTINATIONS.map((d) => {
        const x = (d.u - 0.5) * planeW;
        const y = (0.5 - d.v) * planeH;
        return (
          <group key={d.key} position={[x, y, 0.05]}>
            <mesh
              onClick={() => onSelect(d)}
              onPointerOver={(e) => (document.body.style.cursor = "pointer")}
              onPointerOut={(e) => (document.body.style.cursor = "default")}
            >
              <circleGeometry args={[0.16, 32]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.95} />
            </mesh>
            <mesh>
              <ringGeometry args={[0.20, 0.24, 48]} />
              <meshBasicMaterial color="#fbbf24" transparent opacity={0.55} />
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

  const planeW = 10;
  const planeH = (IMAGE_H / IMAGE_W) * planeW;

  function destinationToWorld(d: Destination) {
    const x = (d.u - 0.5) * planeW;
    const y = (0.5 - d.v) * planeH;
    return new THREE.Vector3(x, y, 0);
  }

  const allowedKeys = new Set(NARRATIVE_ASSIGN[activeNarrative]);
  const activeDestinations = DESTINATIONS.filter((d) => allowedKeys.has(d.key));

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        background: "radial-gradient(1200px 700px at 20% 10%, rgba(0,212,255,0.18), transparent 60%), radial-gradient(900px 500px at 70% 30%, rgba(255,45,123,0.16), transparent 60%), #06070a",
      }}
    >
      {/* Hero */}
      <div style={{ padding: "18px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#F0E8DC", fontWeight: 950, letterSpacing: 2, fontSize: 18 }}>GHETTO HAIKU</div>
            <div style={{ color: "rgba(240,232,220,0.7)", fontSize: 12, marginTop: 4 }}>THE HAIKU TRANSIT SYSTEM</div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {NARRATIVE_LINES.map((l) => {
              const active = l.key === activeNarrative;
              return (
                <button
                  key={l.key}
                  onClick={() => setActiveNarrative(l.key)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: active ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.25)",
                    color: "#F0E8DC",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {l.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", height: "100%" }}>
        {/* Modules */}
        <div style={{ borderRight: "1px solid rgba(255,255,255,0.08)", padding: 14 }}>
          <div style={{ color: "rgba(240,232,220,0.7)", fontSize: 12, fontWeight: 900, letterSpacing: 1, marginBottom: 10 }}>MODULES</div>
          {[
            "Tracks",
            "Lyrics",
            "Visuals",
            "Lore",
            "Community",
          ].map((m) => (
            <button
              key={m}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(10,10,10,0.35)",
                color: "#F0E8DC",
                fontWeight: 900,
                marginBottom: 10,
                cursor: "pointer",
              }}
              onClick={() => {
                // v1: modules are visual only; we can wire behaviors next
              }}
            >
              {m}
            </button>
          ))}

          <div style={{ marginTop: 10, padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(10,10,10,0.25)", color: "rgba(240,232,220,0.78)", fontSize: 12 }}>
            <div style={{ fontWeight: 950, color: "#F0E8DC" }}>System Lines</div>
            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              <div><span style={{ color: "#ff0a2b", fontWeight: 900 }}>Red</span> — Hustle</div>
              <div><span style={{ color: "#60a5fa", fontWeight: 900 }}>Blue</span> — Wisdom</div>
              <div><span style={{ color: "#7c3aed", fontWeight: 900 }}>Purple</span> — Legacy</div>
              <div><span style={{ color: "#fbbf24", fontWeight: 900 }}>Gold</span> — Divine N9NE</div>
            </div>
          </div>
        </div>

        {/* Map canvas */}
        <div style={{ position: "relative" }}>
          <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 2]}>
            <color attach="background" args={["#06070a"]} />
            <ambientLight intensity={1.0} />

            <MapScene
              onSelect={(d) => {
                setSelected(d);
                setShowModal(false);
                setTravelTarget(destinationToWorld(d));
              }}
            />

            {/* Hide markers not in current narrative by keeping list in MapScene global.
                v2: We will pass activeDestinations into MapScene for true filtering.
            */}
            <CameraTravel
              target={travelTarget}
              onArrive={() => {
                setShowModal(true);
              }}
            />
          </Canvas>

          {/* v1 overlay note */}
          <div style={{ position: "absolute", left: 14, bottom: 14, padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(10,10,10,0.35)", color: "rgba(240,232,220,0.78)", fontSize: 12 }}>
            Active route: <span style={{ fontWeight: 950, color: "#F0E8DC" }}>{NARRATIVE_LINES.find((l) => l.key === activeNarrative)?.name}</span>
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
