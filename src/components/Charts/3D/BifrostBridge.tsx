import React, { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";

interface BifrostBridgeProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color?: string;
  theme: "dark" | "light";
}

export const BifrostBridge: React.FC<BifrostBridgeProps> = ({ 
  start, 
  end, 
  color, 
  theme 
}) => {
  const curve = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    // Lift the midpoint to create an arc
    mid.y += start.distanceTo(end) * 0.4;
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(50), [curve]);
  const defaultColor = theme === "dark" ? "#ff00f2" : "#bf00b0";

  return (
    <group>
      <Line
        points={points}
        color={color || defaultColor}
        lineWidth={3}
        transparent
        opacity={0.8}
      />
      <mesh position={start}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#00f2ff" />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#ff00f2" />
      </mesh>
    </group>
  );
};
