import React, { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { t as t_novelty, ZERO_DATE } from "../../../engine/timewaveEngine";

interface NoveltyParticlesProps {
  count: number;
  effectiveStartTime: number;
  WINDS: number;
  localMaxNovelty: number;
  scrollOffset: number;
  theme: "dark" | "light";
}

export const NoveltyParticles: React.FC<NoveltyParticlesProps> = ({ 
  count, 
  effectiveStartTime, 
  WINDS, 
  localMaxNovelty, 
  scrollOffset, 
  theme 
}) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const lastOffset = useRef(scrollOffset);
  const flowIntensity = useRef(0);
  
  const [particles] = useState(() => {
    const temp = [];
    const maxDays = Math.max(0.1, Math.abs(ZERO_DATE.getTime() - effectiveStartTime) / 86400000);
    const minDays = 0.0001;
    
    for (let i = 0; i < count; i++) {
        const t = Math.random();
        const days = minDays * Math.pow(maxDays / minDays, t);
        const speed = 0.001 + Math.random() * 0.002;
        const phase = Math.random() * Math.PI * 2;
        const size = 0.1 + Math.random() * 0.3;
        temp.push({ t, days, speed, phase, size });
    }
    return temp;
  });

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const Z_LENGTH = 300;

  useFrame((_state, delta) => {
    if (!mesh.current) return;
    
    // Calculate movement intensity based on scroll changes
    const targetIntensity = Math.abs(scrollOffset - lastOffset.current) * 1000;
    lastOffset.current = scrollOffset;
    
    // Smooth the intensity to avoid jerky movement
    flowIntensity.current = THREE.MathUtils.lerp(flowIntensity.current, targetIntensity, 0.1);
    
    // Skip update if static to save resources
    if (flowIntensity.current < 0.0001) return;

    particles.forEach((p, i) => {
        p.t += p.speed * delta * 15 * Math.min(10, flowIntensity.current);
        if (p.t > 1) p.t = 0;
        
        const maxDays = Math.max(0.1, Math.abs(ZERO_DATE.getTime() - effectiveStartTime) / 86400000);
        const minDays = 0.0001;
        const days = minDays * Math.pow(maxDays / minDays, p.t);
        
        const logP = 1 - (Math.log(days / minDays) / Math.log(maxDays / minDays));
        const z = -Z_LENGTH * (1 - logP);
        const angle = logP * Math.PI * 2 * WINDS + p.phase;
        
        const novelty = t_novelty(days);
        const normalizedNovelty = novelty / localMaxNovelty;
        
        const baseRadius = 50 * (1 - logP);
        const radius = Math.max(0.1, baseRadius + (normalizedNovelty * baseRadius * 0.3) + (Math.sin(p.phase + p.t * 10) * 2));
        
        dummy.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            z
        );
        dummy.scale.setScalar(p.size * (1 + normalizedNovelty));
        dummy.updateMatrix();
        mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial 
        color={theme === "dark" ? "#00f2ff" : "#0066cc"} 
        transparent 
        opacity={theme === "dark" ? 0.6 : 0.85} 
      />
    </instancedMesh>
  );
};
