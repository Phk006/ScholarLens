"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Text, OrbitControls, Line } from "@react-three/drei";
import type * as THREE from "three";

interface Node {
  id: string;
  label: string;
  score: number;
  color: string;
  position: [number, number, number];
}

function generateNodes(scholarships: { name: string; id: string; score: number }[]): Node[] {
  const nodes: Node[] = [
    {
      id: "you",
      label: "YOU",
      score: 100,
      color: "#059669",
      position: [0, 0, 0],
    },
  ];

  scholarships.forEach((s, i) => {
    const angle = (i / scholarships.length) * Math.PI * 2;
    const radius = 3 + (100 - s.score) * 0.02;
    const y = (Math.random() - 0.5) * 2;

    let color = "#10b981";
    if (s.score < 50) color = "#ef4444";
    else if (s.score < 70) color = "#f59e0b";

    nodes.push({
      id: s.id,
      label: s.name.length > 25 ? s.name.slice(0, 22) + "…" : s.name,
      score: s.score,
      color,
      position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
    });
  });

  return nodes;
}

function SphereNode({
  node,
  isCenter,
  onHover,
}: {
  node: Node;
  isCenter: boolean;
  onHover: (node: Node | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current && !isCenter) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  const size = isCenter ? 0.6 : 0.15 + (node.score / 100) * 0.2;

  return (
    <group position={node.position}>
      <Float speed={isCenter ? 0 : 2} floatIntensity={isCenter ? 0 : 0.3}>
        <mesh
          ref={meshRef}
          onPointerOver={() => onHover(node)}
          onPointerOut={() => onHover(null)}
        >
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={isCenter ? 0.5 : 0.2}
            roughness={0.4}
          />
        </mesh>
        {isCenter && (
          <Text
            position={[0, size + 0.3, 0]}
            fontSize={0.25}
            color="#059669"
            anchorX="center"
            anchorY="middle"
          >
            YOU
          </Text>
        )}
        {!isCenter && (
          <Text
            position={[0, size + 0.25, 0]}
            fontSize={0.12}
            color="#64748b"
            anchorX="center"
            anchorY="middle"
            maxWidth={2}
          >
            {node.label}
          </Text>
        )}
        {!isCenter && (
          <Text
            position={[0, -(size + 0.2), 0]}
            fontSize={0.1}
            color={node.color}
            anchorX="center"
            anchorY="middle"
          >
            {node.score}%
          </Text>
        )}
      </Float>
    </group>
  );
}

function ConnectionLine({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  return <Line points={[from, to]} color="#e2e8f0" lineWidth={1} transparent opacity={0.3} />;
}

function Scene({
  nodes,
}: {
  nodes: Node[];
}) {
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  const centerPos: [number, number, number] = [0, 0, 0];

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />

      {nodes.map((node) => (
        <SphereNode
          key={node.id}
          node={node}
          isCenter={node.id === "you"}
          onHover={setHoveredNode}
        />
      ))}

      {/* Connection lines from center to each node */}
      {nodes
        .filter((n) => n.id !== "you")
        .map((node) => (
          <ConnectionLine key={`line-${node.id}`} from={centerPos} to={node.position} />
        ))}

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxDistance={12}
        minDistance={3}
      />

      {/* Tooltip */}
      {hoveredNode && hoveredNode.id !== "you" && (
        <group position={hoveredNode.position}>
          <Float speed={0} floatIntensity={0}>
            <mesh position={[0, 0.8, 0]}>
              <planeGeometry args={[2.5, 0.5]} />
              <meshBasicMaterial color="#1e293b" transparent opacity={0.9} />
            </mesh>
            <Text
              position={[0, 0.85, 0.01]}
              fontSize={0.12}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {`${hoveredNode.label} — ${hoveredNode.score}% match`}
            </Text>
          </Float>
        </group>
      )}
    </>
  );
}

export default function ScholarshipUniverse({
  scholarships,
}: {
  scholarships: { name: string; id: string; score: number }[];
}) {
  const nodes = useMemo(() => generateNodes(scholarships), [scholarships]);

  return (
    <div className="h-[400px] w-full rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Scene nodes={nodes} />
      </Canvas>
      <div className="flex items-center justify-center gap-4 border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400">
        <span>Drag to explore</span>
        <span>·</span>
        <span>Scroll to zoom</span>
        <span>·</span>
        <span>Hover for details</span>
      </div>
    </div>
  );
}
