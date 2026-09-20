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

// ─── Custom Canvas Texture Face Component ──────────────────────────
function CanvasTextureFace({ textureUrl }: { textureUrl: string }) {
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
    <mesh position={[0, 0.1, 0.26]}>
      <planeGeometry args={[1.25, 1.4]} />
      <meshStandardMaterial map={texture} transparent side={THREE.DoubleSide} roughness={0.2} />
    </mesh>
  );
}

// ─── Default Cat Face (drawn with basic shapes) ─────────────────────
function CatFace({ color }: { color: string }) {
  const faceColor = new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.6);

  return (
    <group position={[0, 0.15, 0.26]}>
      {/* Face base */}
      <mesh>
        <circleGeometry args={[0.55, 32]} />
        <meshStandardMaterial color={faceColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Left ear */}
      <mesh position={[-0.38, 0.48, 0]} rotation={[0, 0, 0.3]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, 0.22, 0.35, 0, -0.18, 0.25, 0]), 3]}
          />
        </bufferGeometry>
        <meshStandardMaterial color={faceColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Right ear */}
      <mesh position={[0.38, 0.48, 0]} rotation={[0, 0, -0.3]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, 0.18, 0.25, 0, -0.22, 0.35, 0]), 3]}
          />
        </bufferGeometry>
        <meshStandardMaterial color={faceColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner ear stripes (orange) */}
      <mesh position={[-0.28, 0.6, 0.01]}>
        <circleGeometry args={[0.04, 8]} />
        <meshStandardMaterial color="#F5A03A" />
      </mesh>
      <mesh position={[-0.22, 0.62, 0.01]}>
        <circleGeometry args={[0.04, 8]} />
        <meshStandardMaterial color="#F5A03A" />
      </mesh>
      <mesh position={[-0.16, 0.6, 0.01]}>
        <circleGeometry args={[0.04, 8]} />
        <meshStandardMaterial color="#F5A03A" />
      </mesh>

      {/* Left eye */}
      <mesh position={[-0.18, 0.1, 0.01]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color="#4776B9" />
      </mesh>
      {/* Left eye highlight */}
      <mesh position={[-0.15, 0.13, 0.02]}>
        <circleGeometry args={[0.03, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Right eye */}
      <mesh position={[0.18, 0.1, 0.01]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color="#4776B9" />
      </mesh>
      {/* Right eye highlight */}
      <mesh position={[0.21, 0.13, 0.02]}>
        <circleGeometry args={[0.03, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, -0.05, 0.01]}>
        <circleGeometry args={[0.04, 3]} />
        <meshStandardMaterial color="#4776B9" />
      </mesh>

      {/* Mouth */}
      <mesh position={[-0.06, -0.12, 0.01]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.012, 0.1, 4, 8]} />
        <meshStandardMaterial color="#4776B9" />
      </mesh>
      <mesh position={[0.06, -0.12, 0.01]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[0.012, 0.1, 4, 8]} />
        <meshStandardMaterial color="#4776B9" />
      </mesh>

      {/* Whiskers */}
      <mesh position={[-0.45, 0.05, 0.01]} rotation={[0, 0, 0.1]}>
        <capsuleGeometry args={[0.008, 0.25, 4, 8]} />
        <meshStandardMaterial color="#4776B9" />
      </mesh>
      <mesh position={[-0.45, -0.05, 0.01]} rotation={[0, 0, -0.05]}>
        <capsuleGeometry args={[0.008, 0.25, 4, 8]} />
        <meshStandardMaterial color="#4776B9" />
      </mesh>
      <mesh position={[0.45, 0.05, 0.01]} rotation={[0, 0, -0.1]}>
        <capsuleGeometry args={[0.008, 0.25, 4, 8]} />
        <meshStandardMaterial color="#4776B9" />
      </mesh>
      <mesh position={[0.45, -0.05, 0.01]} rotation={[0, 0, 0.05]}>
        <capsuleGeometry args={[0.008, 0.25, 4, 8]} />
        <meshStandardMaterial color="#4776B9" />
      </mesh>

      {/* Paws */}
      <mesh position={[-0.25, -0.5, 0.01]}>
        <circleGeometry args={[0.12, 16, 0, Math.PI]} />
        <meshStandardMaterial color={faceColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.25, -0.5, 0.01]}>
        <circleGeometry args={[0.12, 16, 0, Math.PI]} />
        <meshStandardMaterial color={faceColor} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── The Keychain Body ──────────────────────────────────────────────
function KeychainBody({
  color,
  name,
  accessoryEmoji,
  textureUrl,
}: {
  color: string;
  name: string;
  accessoryEmoji: string;
  textureUrl?: string;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Slow auto-rotate
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* ── Keyring ── */}
      <mesh position={[0, 1.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.04, 16, 32]} />
        <meshStandardMaterial
          color="#C0C0C0"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* ── Connector ── */}
      <mesh position={[0, 1.38, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
        <meshStandardMaterial
          color="#C0C0C0"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* ── Hole ── */}
      <mesh position={[0, 1.25, 0]}>
        <torusGeometry args={[0.06, 0.025, 8, 16]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.4} />
      </mesh>

      {/* ── Main acrylic body ── */}
      <RoundedBox
        args={[1.6, 2.0, 0.5]}
        radius={0.2}
        smoothness={8}
        position={[0, 0.1, 0]}
      >
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.85}
          transmission={0.2}
          roughness={0.15}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={0.5}
        />
      </RoundedBox>

      {/* ── White inner panel ── */}
      <RoundedBox
        args={[1.35, 1.75, 0.35]}
        radius={0.15}
        smoothness={8}
        position={[0, 0.1, 0]}
      >
        <meshStandardMaterial color="#FFFBF2" roughness={0.3} />
      </RoundedBox>

      {/* ── Front Artwork (Either Custom Canvas Texture or Default Cat Face) ── */}
      {textureUrl ? (
        <CanvasTextureFace textureUrl={textureUrl} />
      ) : (
        <CatFace color={color} />
      )}

      {/* ── Custom Name Text (Only if no custom texture or if name specified) ── */}
      {name && (
        <Text
          position={[0, -0.65, 0.26]}
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

      {/* ── Accessory charm ── */}
      {accessoryEmoji && accessoryEmoji !== "🚫" && (
        <Float speed={2} floatIntensity={0.3} rotationIntensity={0.2}>
          <group position={[0.6, -0.9, 0.15]}>
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

      {/* ── Border outline effect ── */}
      <RoundedBox
        args={[1.65, 2.05, 0.52]}
        radius={0.22}
        smoothness={8}
        position={[0, 0.1, 0]}
      >
        <meshBasicMaterial color={color} wireframe opacity={0.15} transparent />
      </RoundedBox>
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
}

export default function KeychainViewer3D({
  color,
  name,
  accessoryEmoji,
  character,
  textureUrl,
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

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-foreground/50 pointer-events-none select-none">
        🖱️ Drag to rotate • 3D Realtime Texture
      </div>
    </div>
  );
}
