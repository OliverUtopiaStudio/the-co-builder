"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { createNoise3D } from "simplex-noise";

/* ─── Constants ─── */
const NODE_COUNT = 200;
const NETWORK_RADIUS = 4.5;
const CONNECTION_DISTANCE = 1.6;
const ROTATION_SPEED = 0.0008;
const NOISE_FREQ = 0.3;
const NOISE_AMP = 0.22;

/* ─── Colors (Utopia Studio palette) ─── */
const TERRACOTTA = new THREE.Color("#CC5536");
const PEACH = new THREE.Color("#E8A070");
const LINE_COLOR = new THREE.Color("#EEEEEE");

/* ─── Generate initial node positions in an organic blob ─── */
function generateNodes(count: number, radius: number): Float32Array {
  const noise3D = createNoise3D();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Fibonacci sphere for even distribution
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;

    // Gaussian-ish density: more nodes near center
    const r = radius * Math.pow(Math.random(), 0.4);

    let x = r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.sin(phi) * Math.sin(theta);
    let z = r * Math.cos(phi);

    // Deform with noise for organic blob shape
    const noiseVal = noise3D(x * 0.3, y * 0.3, z * 0.3);
    const scale = 1 + noiseVal * 0.35;
    x *= scale;
    y *= scale;
    z *= scale;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  return positions;
}

/* ─── Nodes (instanced spheres) ─── */
function Nodes({
  basePositions,
  nodeRef,
}: {
  basePositions: Float32Array;
  nodeRef: React.RefObject<THREE.InstancedMesh | null>;
}) {
  const noise3D = useMemo(() => createNoise3D(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorArray = useMemo(() => {
    const colors = new Float32Array(NODE_COUNT * 3);
    for (let i = 0; i < NODE_COUNT; i++) {
      // Most nodes terracotta, ~20% peach accent
      const c = Math.random() > 0.8 ? PEACH : TERRACOTTA;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return colors;
  }, []);

  // Pulse state — random nodes brighten
  const pulsePhases = useMemo(
    () => Array.from({ length: NODE_COUNT }, () => Math.random() * Math.PI * 2),
    []
  );

  const entranceRef = useRef(0);

  useFrame(({ clock }) => {
    if (!nodeRef.current) return;
    const t = clock.getElapsedTime();

    // Entrance: 0→1 over first 2 seconds, easeOutCubic
    entranceRef.current = Math.min(1, t / 2);
    const ease = 1 - Math.pow(1 - entranceRef.current, 3);

    for (let i = 0; i < NODE_COUNT; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];

      // Breathing: simplex noise drift
      const nx = noise3D(bx * NOISE_FREQ + t * 0.15, by * NOISE_FREQ, bz * NOISE_FREQ) * NOISE_AMP;
      const ny = noise3D(bx * NOISE_FREQ, by * NOISE_FREQ + t * 0.15, bz * NOISE_FREQ) * NOISE_AMP;
      const nz = noise3D(bx * NOISE_FREQ, by * NOISE_FREQ, bz * NOISE_FREQ + t * 0.15) * NOISE_AMP;

      const finalX = bx + nx;
      const finalY = by + ny;
      const finalZ = bz + nz;

      // During entrance, lerp from center to actual position
      dummy.position.set(finalX * ease, finalY * ease, finalZ * ease);

      // Pulse: scale oscillation
      const pulse = 0.8 + 0.4 * Math.sin(t * 1.5 + pulsePhases[i]);
      const s = 0.03 * pulse;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      nodeRef.current.setMatrixAt(i, dummy.matrix);
    }
    nodeRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={nodeRef} args={[undefined, undefined, NODE_COUNT]} count={NODE_COUNT}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false} vertexColors />
      <instancedBufferAttribute attach="instanceColor" args={[colorArray, 3]} />
    </instancedMesh>
  );
}

/* ─── Connection Lines ─── */
function Connections({
  nodeRef,
}: {
  nodeRef: React.RefObject<THREE.InstancedMesh | null>;
}) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const positionBuffer = useMemo(
    () => new Float32Array(NODE_COUNT * NODE_COUNT * 6),
    []
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positionBuffer, 3));
    geo.setDrawRange(0, 0);
    return geo;
  }, [positionBuffer]);

  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);

  useFrame(() => {
    if (!nodeRef.current || !lineRef.current) return;
    const geo = lineRef.current.geometry;

    // Extract current node positions from instanced mesh
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodeRef.current.getMatrixAt(i, tempMatrix);
      tempVec.setFromMatrixPosition(tempMatrix);
      positions.push(tempVec.clone());
    }

    // Build line segments for nodes within connection distance
    let lineCount = 0;
    const maxDist2 = CONNECTION_DISTANCE * CONNECTION_DISTANCE;

    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = positions[i].x - positions[j].x;
        const dy = positions[i].y - positions[j].y;
        const dz = positions[i].z - positions[j].z;
        const dist2 = dx * dx + dy * dy + dz * dz;

        if (dist2 < maxDist2) {
          const idx = lineCount * 6;
          positionBuffer[idx] = positions[i].x;
          positionBuffer[idx + 1] = positions[i].y;
          positionBuffer[idx + 2] = positions[i].z;
          positionBuffer[idx + 3] = positions[j].x;
          positionBuffer[idx + 4] = positions[j].y;
          positionBuffer[idx + 5] = positions[j].z;
          lineCount++;
        }
      }
    }

    geo.setDrawRange(0, lineCount * 2);
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={LINE_COLOR}
        transparent
        opacity={0.08}
        depthWrite={false}
      />
    </lineSegments>
  );
}

/* ─── Main Scene Content ─── */
function NetworkScene() {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRef = useRef<THREE.InstancedMesh>(null);
  const basePositions = useMemo(() => generateNodes(NODE_COUNT, NETWORK_RADIUS), []);

  // Mouse parallax
  const mouse = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Slow Y-axis rotation + parallax tilt toward mouse (max ±5° ≈ ±0.087 rad)
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += ROTATION_SPEED;
      groupRef.current.rotation.x += (mouse.current.y * 0.087 - groupRef.current.rotation.x) * 0.02;
    }
  });

  return (
    <>
      {/* Deep warm background */}
      <color attach="background" args={["#080608"]} />
      <fog attach="fog" args={["#1A0E0A", 8, 18]} />

      <group ref={groupRef}>
        <Nodes basePositions={basePositions} nodeRef={nodeRef} />
        <Connections nodeRef={nodeRef} />
      </group>

      {/* Post-processing: bloom for luminous glow */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.6}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

/* ─── Exported Canvas Wrapper ─── */
export default function LuminousNetwork() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        style={{ background: "#080608" }}
      >
        <NetworkScene />
      </Canvas>
    </div>
  );
}
