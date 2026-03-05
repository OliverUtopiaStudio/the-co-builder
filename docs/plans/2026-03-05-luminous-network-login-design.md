# Luminous Network Login Page — Design

**Date**: 2026-03-05
**Status**: Approved
**Scope**: Full reimagine of the login page

## Summary

Replace the stark CSS tesseract + GenerativeArt canvas login with a Three.js luminous particle network. Keep the Utopia Studio palette (#CC5536 terracotta, dark base, warm greys). The login page becomes an inspiring, organic, 3D experience.

## Visual Specification

### Color Palette

| Element | Color |
|---------|-------|
| Background | `#080608` → `#0F0A0C` gradient |
| Node core | `#CC5536` (brick red) |
| Node glow/bloom | `#CC5536` halo |
| Connection lines | `#EEEEEE` at 0.03–0.15 opacity |
| Bright accent nodes | `#E8A070` (warm peach) |
| Ambient fog | `#1A0E0A` |

### Network Geometry

- ~200 nodes in organic blob shape (simplex noise deformation)
- Instanced sphere meshes + custom glow shader
- Proximity-based connection lines (BufferGeometry)
- Gaussian density falloff (dense center, sparse edges)

### Animation

1. **Breathing**: Simplex noise drift (freq 0.3, amp ~5% radius)
2. **Rotation**: Y-axis at ~0.001 rad/frame (~100s per revolution)
3. **Pulse**: Random nodes brighten, pulse travels along connections
4. **Rewiring**: Lines appear/disappear as nodes drift in/out of range

### Post-Processing

- UnrealBloomPass: strength 1.5, radius 0.6, threshold 0.2
- Subtle depth of field
- Edge vignette

### Entrance Sequence (2.5s)

1. 0–0.8s: Single terracotta point pulses at center
2. 0.8–2.0s: Particles scatter outward to positions, connections form
3. 2.0–2.5s: Form + brand fade in

### Form Design

- Glassmorphism card: `rgba(10,8,8,0.6)`, `blur(20px)`, terracotta border accent
- Password input: bottom-border style, centered text
- Button: `#CC5536` filled with glow shadow
- Footer: "The Utopia Studio" in warm grey
- Brand: "Co-Build OS" fixed top-left

### Mouse Interactivity

- Parallax tilt toward cursor (max ±5 degrees)
- Proximity glow: nodes near cursor brighten

## Technical Approach

### Dependencies

- `three` — WebGL rendering
- `@react-three/fiber` — React Three.js renderer
- `@react-three/drei` — Helpers
- `@react-three/postprocessing` — Bloom effects

### File Changes

| File | Action |
|------|--------|
| `src/components/LuminousNetwork.tsx` | Create — Three.js scene |
| `src/app/(auth)/login/page.tsx` | Rewrite — new layout with R3F canvas |
| `src/app/(auth)/layout.tsx` | Simplify — remove GenerativeArt wrapper |
| `src/app/globals.css` | Remove tesseract CSS, add new login styles |

### Performance

- Instanced geometries (single draw call per type)
- BufferGeometry lines (single draw call)
- Target 60fps on integrated GPU
- Fallback: static radial gradient if WebGL unavailable
