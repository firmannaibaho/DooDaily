"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  RoundedBox,
  Text,
  Environment,
  Float,
} from "@react-three/drei";
import * as THREE from "three";

export type KeychainShape = "circle" | "rounded";

// ─── Double-Sided Custom Canvas Texture Face Component ─────────────────────
function CustomArtworkFace({
  textureUrl,
  shape,
  name,
  color,
}: {
  textureUrl: string;
  shape: KeychainShape;
  name?: string;
  color: string;
}) {
  const texture = useMemo(() => {
    if (!textureUrl) return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(textureUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, [textureUrl]);

  if (!texture) return null;

  return (
    <group>
      {/* FRONT SIDE ARTWORK */}
      <mesh position={[0, 0.1, 0.22]}>
        {shape === "circle" ? (
          <circleGeometry args={[0.78, 32]} />
        ) : (
          <planeGeometry args={[1.22, 1.45]} />
        )}
        <meshStandardMaterial
          map={texture}
          transparent
          side={THREE.FrontSide}
          roughness={0.15}
        />
      </mesh>

      {/* BACK SIDE ARTWORK (Mirrored/Backing with Brand & Name) */}
      <group position={[0, 0.1, -0.22]} rotation={[0, Math.PI, 0]}>
        <mesh>
          {shape === "circle" ? (
            <circleGeometry args={[0.78, 32]} />
          ) : (
            <planeGeometry args={[1.22, 1.45]} />
          )}
          <meshStandardMaterial
            map={texture}
            transparent
            side={THREE.FrontSide}
            roughness={0.2}
          />
        </mesh>
        
        {/* Backside Branding Stamp */}
        <Text
          position={[0, shape === "circle" ? -0.45 : -0.55, 0.01]}
          fontSize={0.09}
          color="#2B4C7E"
          anchorY="middle"
          fontWeight="bold"
        >
          {name ? `© Doodaily • ${name}` : "✨ Doodaily Original Art ✨"}
        </Text>
      </group>
    </group>
  );
}

// ─── Default Cat Face (drawn with basic shapes) ─────────────────────
function CatFace({ color, name }: { color: string; name?: string }) {
  const faceColor = new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.6);

  return (
    <group>
      {/* FRONT SIDE CAT FACE */}
      <group position={[0, 0.15, 0.22]}>
        {/* Face base */}
        <mesh>
          <circleGeometry args={[0.55, 32]} />
          <meshStandardMaterial color={faceColor} side={THREE.FrontSide} />
        </mesh>

        {/* Left ear */}
        <mesh position={[-0.38, 0.48, 0]} rotation={[0, 0, 0.3]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([0, 0, 0, 0.22, 0.35, 0, -0.18, 0.25, 0]), 3]}
            />
          </bufferGeometry>
          <meshStandardMaterial color={faceColor} side={THREE.FrontSide} />
        </mesh>

        {/* Right ear */}
        <mesh position={[0.38, 0.48, 0]} rotation={[0, 0, -0.3]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([0, 0, 0, 0.18, 0.25, 0, -0.22, 0.35, 0]), 3]}
            />
          </bufferGeometry>
          <meshStandardMaterial color={faceColor} side={THREE.FrontSide} />
        </mesh>

        {/* Eyes & Nose */}
        <mesh position={[-0.18, 0.1, 0.01]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color="#4776B9" />
        </mesh>
        <mesh position={[0.18, 0.1, 0.01]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color="#4776B9" />
        </mesh>
        <mesh position={[0, -0.05, 0.01]}>
          <circleGeometry args={[0.04, 3]} />
          <meshStandardMaterial color="#4776B9" />
        </mesh>
      </group>

      {/* BACK SIDE CAT FACE (Backing design) */}
      <group position={[0, 0.15, -0.22]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <circleGeometry args={[0.55, 32]} />
          <meshStandardMaterial color={faceColor} side={THREE.FrontSide} />
        </mesh>

        <Text
          position={[0, -0.7, 0.01]}
          fontSize={0.12}
          color="#4776B9"
          anchorY="middle"
          fontWeight="bold"
        >
          {name ? `© ${name} • Doodaily` : "✨ Doodaily Art ✨"}
        </Text>
      </group>
    </group>
  );
}

// ─── The Keychain Body ──────────────────────────────────────────────
function KeychainBody({
  color,
  name,
  accessoryEmoji,
  textureUrl,
  shape = "rounded",
}: {
  color: string;
  name: string;
  accessoryEmoji: string;
  textureUrl?: string;
  shape?: KeychainShape;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Slow 360 degree rotation showcase
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.4;
    }
  });

  const isCircle = shape === "circle";

  return (
    <group ref={groupRef}>
      {/* ── Keyring (top ring) ── */}
      <mesh position={[0, isCircle ? 1.45 : 1.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.04, 16, 32]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ── Connector ── */}
      <mesh position={[0, isCircle ? 1.22 : 1.38, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ── Hole for ring ── */}
      <mesh position={[0, isCircle ? 1.1 : 1.25, 0]}>
        <torusGeometry args={[0.06, 0.025, 8, 16]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.4} />
      </mesh>

      {/* ── Main Acrylic Outer Body (Shape Aware) ── */}
      {isCircle ? (
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.0, 1.0, 0.4, 48]} />
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.85}
            transmission={0.2}
            roughness={0.15}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      ) : (
        <RoundedBox args={[1.5, 1.9, 0.4]} radius={0.2} smoothness={8} position={[0, 0.1, 0]}>
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.85}
            transmission={0.2}
            roughness={0.15}
            metalness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </RoundedBox>
      )}

      {/* ── White Inner Panel (Shape Aware) ── */}
      {isCircle ? (
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.88, 0.88, 0.32, 48]} />
          <meshStandardMaterial color="#FFFBF2" roughness={0.3} />
        </mesh>
      ) : (
        <RoundedBox args={[1.3, 1.7, 0.32]} radius={0.15} smoothness={8} position={[0, 0.1, 0]}>
          <meshStandardMaterial color="#FFFBF2" roughness={0.3} />
        </RoundedBox>
      )}

      {/* ── Double-Sided Artwork / Face (Front & Back) ── */}
      {textureUrl ? (
        <CustomArtworkFace
          textureUrl={textureUrl}
          shape={shape}
          name={name}
          color={color}
        />
      ) : (
        <CatFace color={color} name={name} />
      )}

      {/* ── Front Custom Name Text ── */}
      {name && !textureUrl && (
        <Text
          position={[0, -0.6, 0.22]}
          fontSize={0.18}
          maxWidth={1.2}
          textAlign="center"
          color={color}
          anchorY="middle"
          fontWeight="bold"
        >
          {name}
        </Text>
      )}

      {/* ── Accessory Charm ── */}
      {accessoryEmoji && accessoryEmoji !== "🚫" && (
        <Float speed={2} floatIntensity={0.3} rotationIntensity={0.2}>
          <group position={[isCircle ? 0.8 : 0.65, -0.85, 0.15]}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#FBBF24" metalness={0.3} roughness={0.3} />
            </mesh>
            <Text position={[0, 0, 0.13]} fontSize={0.14} anchorY="middle">
              {accessoryEmoji}
            </Text>
          </group>
        </Float>
      )}
    </group>
  );
}

// ─── Main Exported Component ────────────────────────────────────────
interface KeychainViewer3DProps {
  color: string;
  name: string;
  accessoryEmoji: string;
  character: string;
  textureUrl?: string;
  shape?: KeychainShape;
}

export default function KeychainViewer3D({
  color,
  name,
  accessoryEmoji,
  character,
  textureUrl,
  shape = "rounded",
}: KeychainViewer3DProps) {
  return (
    <div className="w-full h-full min-h-[400px] rounded-[3rem] overflow-hidden relative">
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.4} />
        <pointLight position={[0, 2, 3]} intensity={0.5} color="#F5A03A" />

        <Environment preset="city" environmentIntensity={0.3} />

        <Float speed={1.5} floatIntensity={0.15} rotationIntensity={0.05}>
          <KeychainBody
            color={color}
            name={name}
            accessoryEmoji={accessoryEmoji}
            textureUrl={textureUrl}
            shape={shape}
          />
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(3 * Math.PI) / 4}
          autoRotate
          autoRotateSpeed={1.5}
        />
      </Canvas>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-foreground/50 pointer-events-none select-none flex items-center gap-2">
        <span>🔄 Putar 360° Depan &amp; Belakang</span>
      </div>
    </div>
  );
}
