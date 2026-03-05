# Luminous Network Login Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the stark CSS tesseract login page with an inspiring Three.js luminous particle network that uses the Utopia Studio palette.

**Architecture:** A React Three Fiber canvas renders ~200 instanced particle nodes connected by proximity lines, with UnrealBloom post-processing for the luminous glow. The network breathes via simplex noise, rotates slowly, and pulses with terracotta light. The login form floats over it with a glassmorphism card.

**Tech Stack:** Three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing, simplex-noise

---

## Task 1: Install Three.js Dependencies

**Step 1: Install packages**

Run:
```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing simplex-noise
```

**Step 2: Install type definitions**

Run:
```bash
npm install -D @types/three
```

**Step 3: Verify installation**

Run:
```bash
node -e "require('three'); require('simplex-noise'); console.log('OK')"
```
Expected: `OK`

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add three.js ecosystem for luminous network login"
```

---

## Task 2: Create the LuminousNetwork Component — Node System

**Files:**
- Create: `src/components/LuminousNetwork.tsx`

This is the core Three.js scene. Build it in stages. Start with the node particle system.

**Step 1: Create the component file with node generation**

Create `src/components/LuminousNetwork.tsx` with:

```tsx
"use client";

import { useRef, useMemo, useCallback } from "react";
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

  useFrame(({ clock }) => {
    if (!nodeRef.current) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < NODE_COUNT; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];

      // Breathing: simplex noise drift
      const nx = noise3D(bx * NOISE_FREQ + t * 0.15, by * NOISE_FREQ, bz * NOISE_FREQ) * NOISE_AMP;
      const ny = noise3D(bx * NOISE_FREQ, by * NOISE_FREQ + t * 0.15, bz * NOISE_FREQ) * NOISE_AMP;
      const nz = noise3D(bx * NOISE_FREQ, by * NOISE_FREQ, bz * NOISE_FREQ + t * 0.15) * NOISE_AMP;

      dummy.position.set(bx + nx, by + ny, bz + nz);

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
    <instancedMesh ref={nodeRef} args={[undefined, undefined, NODE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false}>
        {/* Per-instance colors via attribute */}
      </meshBasicMaterial>
      <instancedBufferAttribute
        attach="geometry-attributes-color"
        args={[colorArray, 3]}
      />
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
  ); // over-allocated, trimmed each frame
  const opacityBuffer = useMemo(
    () => new Float32Array(NODE_COUNT * NODE_COUNT * 2),
    []
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positionBuffer, 3));
    geo.setAttribute("opacity", new THREE.BufferAttribute(opacityBuffer, 1));
    return geo;
  }, [positionBuffer, opacityBuffer]);

  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const tempVec2 = useMemo(() => new THREE.Vector3(), []);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);

  useFrame(() => {
    if (!nodeRef.current || !lineRef.current) return;

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

          // Opacity fades with distance
          const dist = Math.sqrt(dist2);
          const alpha = 1 - dist / CONNECTION_DISTANCE;
          opacityBuffer[lineCount * 2] = alpha;
          opacityBuffer[lineCount * 2 + 1] = alpha;

          lineCount++;
        }
      }
    }

    geometry.setDrawRange(0, lineCount * 2);
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.opacity.needsUpdate = true;
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

  // Slow Y-axis rotation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += ROTATION_SPEED;
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
```

**Step 2: Verify the file compiles**

Run:
```bash
npx tsc --noEmit src/components/LuminousNetwork.tsx 2>&1 | head -20
```

Note: This may show import errors since we're checking in isolation. The main check is syntax correctness. A full `npm run build` will validate later.

**Step 3: Commit**

```bash
git add src/components/LuminousNetwork.tsx
git commit -m "feat: add LuminousNetwork Three.js component — nodes + connections + bloom"
```

---

## Task 3: Rewrite the Login Page

**Files:**
- Modify: `src/app/(auth)/login/page.tsx` (full rewrite)
- Modify: `src/app/(auth)/layout.tsx` (simplify — remove GenerativeArt)

**Step 1: Rewrite the auth layout**

The layout currently wraps children with a GenerativeArt canvas. Replace it with a clean passthrough — the login page itself will mount the LuminousNetwork.

Replace `src/app/(auth)/layout.tsx` with:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {children}
    </div>
  );
}
```

This removes:
- The `"use client"` directive (no longer needed)
- The dynamic GenerativeArt import
- The z-index layering

**Step 2: Rewrite the login page**

Replace `src/app/(auth)/login/page.tsx` with:

```tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const LuminousNetwork = dynamic(() => import("@/components/LuminousNetwork"), {
  ssr: false,
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Invalid password.");
        return;
      }

      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Three.js background */}
      <LuminousNetwork />

      {/* Content layer */}
      <div className="login-page">
        {/* Brand */}
        <div className="login-brand">Co-Build OS</div>

        {/* Spacer to push form below center (network occupies upper area) */}
        <div className="login-spacer" />

        {/* Login card */}
        <div className="login-card">
          <form onSubmit={handleSubmit} className="login-form-inner">
            {error && <div className="login-error">{error}</div>}

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
              placeholder="Enter access password"
            />

            <button type="submit" disabled={loading} className="login-button">
              {loading ? "Checking..." : "Enter workspace \u2192"}
            </button>
          </form>

          <p className="login-footer">The Utopia Studio</p>
        </div>
      </div>
    </>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/\(auth\)/login/page.tsx src/app/\(auth\)/layout.tsx
git commit -m "feat: rewrite login page with LuminousNetwork background"
```

---

## Task 4: Replace CSS — Remove Tesseract, Add Glassmorphism Login

**Files:**
- Modify: `src/app/globals.css` (lines 72–368 — replace tesseract section)

**Step 1: Remove old tesseract CSS and add new login styles**

Delete everything from line 72 (the `/* ═══ Login page — Infinite Tesseract v5 */` comment) through line 368 (the responsive media query closing brace).

Replace with:

```css
/* ═══════════════════════════════════════════════════════ */
/* Login page — Luminous Network                          */
/* Three.js WebGL background + glassmorphism form card    */
/* ═══════════════════════════════════════════════════════ */

.login-page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 20px 20px 15vh;
  gap: 0;
}

/* ─── CO-BUILD OS BRANDING ─── */
.login-brand {
  position: fixed;
  top: 28px;
  left: 32px;
  color: #EEEEEE;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  z-index: 10;
  opacity: 0;
  animation: brand-in 0.8s ease-out 1.8s forwards;
}

@keyframes brand-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 0.8; transform: translateY(0); }
}

/* ─── SPACER (pushes form to lower third) ─── */
.login-spacer {
  flex: 1;
}

/* ─── GLASSMORPHISM CARD ─── */
.login-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 32px 28px 24px;
  background: rgba(10, 8, 8, 0.55);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(204, 85, 54, 0.06);
  border-radius: 12px;
  opacity: 0;
  animation: card-appear 0.9s ease-out 2.0s forwards;
}

@keyframes card-appear {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ─── FORM ─── */
.login-form-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: min(320px, 75vw);
}

.login-input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: none;
  border-bottom: 1px solid rgba(238, 238, 238, 0.15);
  color: #EEEEEE;
  font-size: 14px;
  font-weight: 350;
  text-align: center;
  border-radius: 0;
  transition: border-color 0.3s;
  font-family: inherit;
  letter-spacing: 0.02em;
}

.login-input::placeholder {
  color: rgba(143, 137, 139, 0.7);
  font-weight: 350;
}

.login-input:focus {
  outline: none;
  border-bottom-color: #CC5536;
}

.login-button {
  width: 100%;
  padding: 14px 24px;
  background: #CC5536;
  color: #fff;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.02em;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.3s, box-shadow 0.3s;
  font-family: inherit;
  box-shadow: 0 0 20px rgba(204, 85, 54, 0.2);
}

.login-button:hover {
  opacity: 0.9;
  box-shadow: 0 0 30px rgba(204, 85, 54, 0.35);
}

.login-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.login-error {
  width: 100%;
  padding: 10px 14px;
  background: rgba(204, 85, 54, 0.1);
  border: 1px solid rgba(204, 85, 54, 0.2);
  border-radius: 6px;
  color: #D77A59;
  font-size: 13px;
  text-align: center;
}

.login-footer {
  color: rgba(143, 137, 139, 0.6);
  font-size: 10px;
  font-weight: 350;
  letter-spacing: 0.25em;
  text-transform: uppercase;
}

/* ─── RESPONSIVE ─── */
@media (max-height: 700px) {
  .login-page { padding-bottom: 8vh; }
  .login-card { padding: 24px 20px 18px; }
}
```

**Step 2: Verify build compiles**

Run:
```bash
npm run build 2>&1 | tail -20
```
Expected: Build succeeds with no errors.

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: replace tesseract CSS with glassmorphism login card styles"
```

---

## Task 5: Add Mouse Parallax Interactivity

**Files:**
- Modify: `src/components/LuminousNetwork.tsx`

**Step 1: Add mouse parallax to the NetworkScene**

In `NetworkScene`, add a mouse-tracking ref and tilt the group toward the cursor.

Add this inside `NetworkScene` (before the return):

```tsx
// Mouse parallax
const mouse = useRef({ x: 0, y: 0 });

const handleMouseMove = useCallback((e: MouseEvent) => {
  mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
}, []);

// Attach/detach listener
useFrame(() => {
  if (groupRef.current) {
    groupRef.current.rotation.y += ROTATION_SPEED;
    // Parallax tilt toward mouse (max ±5 degrees = ±0.087 radians)
    groupRef.current.rotation.x += (mouse.current.y * 0.087 - groupRef.current.rotation.x) * 0.02;
    // Y rotation is cumulative, so just add mouse offset indirectly via a slight wobble
  }
});
```

Note: Remove the duplicate `useFrame` that only did rotation. Merge the rotation into this one.

Also add this effect to mount the listener:

```tsx
import { useEffect } from "react";

// Inside NetworkScene:
useEffect(() => {
  window.addEventListener("mousemove", handleMouseMove);
  return () => window.removeEventListener("mousemove", handleMouseMove);
}, [handleMouseMove]);
```

**Step 2: Commit**

```bash
git add src/components/LuminousNetwork.tsx
git commit -m "feat: add mouse parallax tilt to luminous network"
```

---

## Task 6: Add Entrance Animation

**Files:**
- Modify: `src/components/LuminousNetwork.tsx`

**Step 1: Add entrance animation to nodes**

The entrance should animate nodes from center outward. Add an `entranceProgress` ref that goes from 0→1 over the first 2 seconds.

In the `Nodes` component's `useFrame`:

```tsx
const entranceRef = useRef(0);

useFrame(({ clock }) => {
  if (!nodeRef.current) return;
  const t = clock.getElapsedTime();

  // Entrance: 0→1 over first 2 seconds
  entranceRef.current = Math.min(1, t / 2);
  const ease = 1 - Math.pow(1 - entranceRef.current, 3); // easeOutCubic

  for (let i = 0; i < NODE_COUNT; i++) {
    // ... existing position calculation ...

    // During entrance, lerp from center to actual position
    const finalX = bx + nx;
    const finalY = by + ny;
    const finalZ = bz + nz;

    dummy.position.set(finalX * ease, finalY * ease, finalZ * ease);

    // ... rest of scale/matrix code ...
  }
});
```

**Step 2: Commit**

```bash
git add src/components/LuminousNetwork.tsx
git commit -m "feat: add entrance animation — nodes expand from center"
```

---

## Task 7: Verify & Polish

**Step 1: Run the full build**

```bash
npm run build
```
Expected: Successful build, no errors.

**Step 2: Run dev server and visually verify**

```bash
npm run dev
```

Open http://localhost:3000/login and verify:
- [ ] Three.js canvas renders with luminous particle network
- [ ] Nodes glow with terracotta/peach colors
- [ ] Connection lines appear between nearby nodes
- [ ] Bloom effect creates luminous halos
- [ ] Network slowly rotates
- [ ] Nodes breathe/drift with noise
- [ ] Mouse movement tilts the network
- [ ] Entrance animation: nodes expand from center
- [ ] Glassmorphism card is visible with blur backdrop
- [ ] Password form works (enter password → submits → redirects)
- [ ] "Co-Build OS" brand appears top-left
- [ ] "The Utopia Studio" footer appears below form
- [ ] Responsive on mobile viewport (shrink browser)

**Step 3: Fix any visual issues found during verification**

Common adjustments:
- Bloom too strong/weak → adjust `intensity` in EffectComposer
- Network too large/small → adjust `NETWORK_RADIUS` and camera `position`
- Lines too visible/invisible → adjust `opacity` on lineBasicMaterial
- Form card position → adjust `padding-bottom` on `.login-page`

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: luminous network login page — complete implementation"
```

---

## Task 8: Clean Up Old GenerativeArt (if unused elsewhere)

**Step 1: Check if GenerativeArt is used outside auth layout**

Run:
```bash
grep -r "GenerativeArt" src/ --include="*.tsx" --include="*.ts"
```

If only referenced in the old auth layout (which we already removed), delete it:

```bash
rm src/components/GenerativeArt.tsx
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove unused GenerativeArt component"
```
