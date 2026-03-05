"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useState } from "react";

type Destination = {
  key: string;
  label: string;
  href: string;
  // normalized coords (0..1) from top-left of the image
  u: number;
  v: number;
};

const IMAGE_W = 800;
const IMAGE_H = 570;

// From the provided map screenshot (approx px coords)
const DESTINATIONS: Destination[] = [
  {
    key: "album",
    label: "Album — Shibuya",
    href: "https://untitled.stream/buy/project/hGBEJT3s3ZGDzItNJYgC6",
    u: 190 / IMAGE_W,
    v: 400 / IMAGE_H,
  },
  {
    key: "deluxe",
    label: "Deluxe — Shinjuku",
    href: "https://untitled.stream/buy/project/7knQBmL1NgffFXMw9LT2w",
    u: 195 / IMAGE_W,
    v: 275 / IMAGE_H,
  },
  {
    key: "booklet",
    label: "Booklet — Roppongi",
    href: "https://www.canva.com/design/DAGsvyn8uMg/gILQh1m5JRHNTxnNaTvfYg/watch?utm_content=DAGsvyn8uMg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hffab9ca1a1",
    u: 310 / IMAGE_W,
    v: 430 / IMAGE_H,
  },
];

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
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
            <Text
              position={[0.0, 0.35, 0]}
              fontSize={0.28}
              color="#e5e7eb"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.008}
              outlineColor="#0a0a0a"
            >
              {d.label}
            </Text>
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

  const planeW = 10;
  const planeH = (IMAGE_H / IMAGE_W) * planeW;

  function destinationToWorld(d: Destination) {
    const x = (d.u - 0.5) * planeW;
    const y = (0.5 - d.v) * planeH;
    return new THREE.Vector3(x, y, 0);
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#06070a"]} />
        <ambientLight intensity={1.0} />

        <MapScene
          onSelect={(d) => {
            setSelected(d);
            setShowModal(false);
            setTravelTarget(destinationToWorld(d));
          }}
        />

        <CameraTravel
          target={travelTarget}
          onArrive={() => {
            setShowModal(true);
          }}
        />
      </Canvas>

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
            <div style={{ fontSize: 16, fontWeight: 800 }}>{selected.label}</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
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
                background: "#f59e0b",
                color: "#0a0a0a",
                fontWeight: 800,
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
