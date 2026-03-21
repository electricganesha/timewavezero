import React, { useMemo, useRef, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { t as t_novelty, ZERO_DATE, dateToX, getFractalResonance } from "../../../engine/timewaveEngine";
import { MAJOR_EVENTS } from "../../../engine/timewaveConstants";
import type { ArchaeologistReport as ReportType } from "../../../services/aiArchaeologist";
import { NoveltyParticles } from "./NoveltyParticles";
import { BifrostBridge } from "./BifrostBridge";

interface LogarithmicVortexProps {
  startTime: number;
  endTime: number;
  theme: "dark" | "light";
  onHoverValue?: (val: number | null) => void;
  isArchaeologistActive?: boolean;
  archaeologistReport?: ReportType | null;
  archaeologistDate?: Date;
  setTargetT: (val: number | null) => void;
  scrollOffset: number;
  activeIndex: number;
  effectiveStartTime: number;
}

export const LogarithmicVortex: React.FC<LogarithmicVortexProps> = ({ 
  endTime, 
  theme, 
  setTargetT, 
  scrollOffset, 
  activeIndex, 
  onHoverValue,
  isArchaeologistActive,
  archaeologistReport,
  archaeologistDate,
  effectiveStartTime
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orbitRef = useRef<any>(null);
  const hasReachedHeroShot = useRef(false);

  useEffect(() => {
    if (!isArchaeologistActive) {
      hasReachedHeroShot.current = false;
    }
  }, [isArchaeologistActive]);
  
  const Z_LENGTH = 300; 
  
  const { WINDS, localMaxNovelty } = useMemo(() => {
    const daysSpan = Math.max(0.1, Math.abs(endTime - effectiveStartTime) / 86400000);
    const exp = Math.max(1, Math.round(Math.log(daysSpan / 6) / Math.log(64)));
    const winds = 5 + exp * 1.5;

    let localMax = 0.0001;
    const steps = 200;
    const maxDays = Math.max(0.1, Math.abs(ZERO_DATE.getTime() - effectiveStartTime) / 86400000);
    const minDays = 0.0001;

    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const days = minDays * Math.pow(maxDays / minDays, t);
        const novelty = t_novelty(days);
        if (novelty > localMax) localMax = novelty;
    }

    return { WINDS: winds, localMaxNovelty: localMax };
  }, [effectiveStartTime, endTime]);

  const getLogProgress = useCallback((timeAtPoint: number) => {
    const daysRemaining = Math.max(0.0001, Math.abs(ZERO_DATE.getTime() - timeAtPoint) / 86400000);
    const maxDaysInDataset = Math.max(0.0001, Math.abs(ZERO_DATE.getTime() - effectiveStartTime) / 86400000);
    const minDays = 0.0001;
    return 1 - (Math.log(daysRemaining / minDays) / Math.log(maxDaysInDataset / minDays));
  }, [effectiveStartTime]);

  const getPositionForDate = useCallback((date: Date) => {
    const x = Math.abs(dateToX(date));
    const ms = ZERO_DATE.getTime() - (dateToX(date) * 86400000);
    const logP = getLogProgress(ms);
    const z = -Z_LENGTH * (1 - logP);
    const angle = logP * Math.PI * 2 * WINDS;
    const baseRadius = 50 * (1 - logP);
    const val = t_novelty(x); 
    const normalizedNovelty = val / localMaxNovelty;
    const wiggleIntensity = 0.3 + logP * 0.4;
    const fractalWiggle = normalizedNovelty * (baseRadius * wiggleIntensity + 0.5);
    const radius = Math.max(0.1, baseRadius + fractalWiggle);
    
    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
  }, [getLogProgress, WINDS, localMaxNovelty]);

  const markers = useMemo(() => {
    return MAJOR_EVENTS.filter(ev => ev.time >= effectiveStartTime && ev.time <= endTime)
      .sort((a, b) => a.time - b.time)
      .map((ev, index) => {
         const logP = getLogProgress(ev.time);
         const z = -Z_LENGTH * (1 - logP);
         const angle = logP * Math.PI * 2 * WINDS;
         const baseRadius = 50 * (1 - logP);
         const daysRemaining = Math.max(0.0001, Math.abs(ZERO_DATE.getTime() - ev.time) / 86400000);
         const val = t_novelty(daysRemaining); 
         const normalizedNovelty = val / localMaxNovelty;
         const wiggleIntensity = 0.3 + logP * 0.4;
         const fractalWiggle = normalizedNovelty * (baseRadius * wiggleIntensity + 0.5);
         const radius = Math.max(0.1, baseRadius + fractalWiggle);
         return { ...ev, pos: new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z), logP, markerIndex: index };
      });
  }, [effectiveStartTime, endTime, getLogProgress, WINDS, localMaxNovelty]);

  const bridgePaths = useMemo(() => {
    if (!isArchaeologistActive || !archaeologistReport || !archaeologistDate) return [];
    const startPos = getPositionForDate(archaeologistDate);
    return archaeologistReport.echoDates.map((_dateStr, i) => {
      const echoDate = getFractalResonance(archaeologistDate, i + 1);
      const endPos = getPositionForDate(echoDate);
      return { start: startPos, end: endPos };
    });
  }, [isArchaeologistActive, archaeologistReport, archaeologistDate, getPositionForDate]);

  const { points, colors: vertexColors } = useMemo(() => {
    const steps = 4000;
    const rawData = [];
    const minDays = 0.0001;
    const maxDays = Math.max(0.1, Math.abs(ZERO_DATE.getTime() - effectiveStartTime) / 86400000);

    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const daysAtPoint = minDays * Math.pow(maxDays / minDays, t);
        const timeAtPointPast = ZERO_DATE.getTime() - (daysAtPoint * 86400000);
        const timeAtPointFuture = ZERO_DATE.getTime() + (daysAtPoint * 86400000);
        let timeAtPoint = timeAtPointPast;
        if (timeAtPoint < effectiveStartTime || timeAtPoint > endTime) {
           timeAtPoint = timeAtPointFuture;
        }
        if (timeAtPoint < effectiveStartTime || timeAtPoint > endTime) continue;
        const novelty = t_novelty(daysAtPoint);
        rawData.push({ timeAtPoint, daysAtPoint, novelty });
    }

    const pts = [];
    const clrs = [];
    const baseWaveColor = new THREE.Color(theme === "dark" ? "#00f2ff" : "#007aff");
    const peakWaveColor = new THREE.Color(theme === "dark" ? "#ff00fb" : "#d100c3");

    for (const data of rawData) {
        const logP = getLogProgress(data.timeAtPoint);
        const z = -Z_LENGTH * (1 - logP);
        const angle = logP * Math.PI * 2 * WINDS;
        const normalizedNovelty = data.novelty / localMaxNovelty;
        const baseRadius = 50 * (1 - logP);
        const wiggleIntensity = 0.3 + logP * 0.4;
        const fractalWiggle = normalizedNovelty * (baseRadius * wiggleIntensity + 0.5); 
        const radius = Math.max(0.1, baseRadius + fractalWiggle);
        pts.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z));
        clrs.push(baseWaveColor.clone().lerp(peakWaveColor, normalizedNovelty * 0.8));
    }
    
    if (pts.length < 2) {
       return { 
         points: [new THREE.Vector3(0,0,-300), new THREE.Vector3(0,0,0)],
         colors: [baseWaveColor, baseWaveColor]
       };
    }
    return { points: pts, colors: clrs };
  }, [effectiveStartTime, endTime, getLogProgress, theme, WINDS, localMaxNovelty]);

  useFrame((state) => {
    if (markers.length === 0) return;
    
    if (isArchaeologistActive && bridgePaths.length > 0) {
        if (!hasReachedHeroShot.current) {
            const deepestBridge = bridgePaths[bridgePaths.length - 1];
            const targetPos = new THREE.Vector3(80, 80, deepestBridge.end.z - 150);
            if (state.camera.position.distanceTo(targetPos) > 1) {
              state.camera.position.lerp(targetPos, 0.05);
              if (orbitRef.current) {
                  const midZ = (bridgePaths[0].start.z + deepestBridge.end.z) / 2;
                  orbitRef.current.target.lerp(new THREE.Vector3(0, 0, midZ), 0.05);
              }
            } else {
              hasReachedHeroShot.current = true;
            }
        }
        if (onHoverValue && archaeologistDate) {
            onHoverValue(t_novelty(dateToX(archaeologistDate)));
        }
        return;
    }

    if (markers.length === 1) {
       if (orbitRef.current) {
         const zPos = markers[0].pos.z;
         const currentTargetZ = orbitRef.current.target.z;
         const nextTargetZ = THREE.MathUtils.lerp(currentTargetZ, zPos, 0.1);
         const deltaZ = nextTargetZ - currentTargetZ;
         orbitRef.current.target.z += deltaZ;
         state.camera.position.z += deltaZ;
        }
        return;
    }

    let interpolatedIndex = scrollOffset * (markers.length - 1);
    if (interpolatedIndex >= markers.length - 1) interpolatedIndex = markers.length - 1.0001;
    if (interpolatedIndex < 0) interpolatedIndex = 0;
    
    const floorIndex = Math.floor(interpolatedIndex);
    const ceilIndex = floorIndex + 1;
    const fraction = interpolatedIndex - floorIndex;
    const m1 = markers[floorIndex];
    const m2 = markers[ceilIndex];
    
    if (!m1 || !m2) return;
    
    const zPos = THREE.MathUtils.lerp(m1.pos.z, m2.pos.z, fraction);
    
    if (orbitRef.current) {
      const currentTargetZ = orbitRef.current.target.z;
      const nextTargetZ = THREE.MathUtils.lerp(currentTargetZ, zPos, 0.1);
      const deltaZ = nextTargetZ - currentTargetZ;
      orbitRef.current.target.z += deltaZ;
      state.camera.position.z += deltaZ;

      if (!isArchaeologistActive) {
        const standardDist = 80;
        const currentRelZ = state.camera.position.z - orbitRef.current.target.z;
        const targetRelZ = currentRelZ > 0 ? standardDist : -standardDist;
        if (Math.abs(Math.abs(currentRelZ) - standardDist) > 5) {
            state.camera.position.z = orbitRef.current.target.z + THREE.MathUtils.lerp(currentRelZ, targetRelZ, 0.05);
        }
      }
    }

    const currentLogP = THREE.MathUtils.lerp(m1.logP, m2.logP, fraction);
    const maxDays = Math.max(0.1, Math.abs(ZERO_DATE.getTime() - effectiveStartTime) / 86400000);
    const minDays = 0.0001;
    const daysRemaining = minDays * Math.pow(maxDays / minDays, 1 - currentLogP);
    onHoverValue?.(t_novelty(daysRemaining));
  });

  const markerColor = theme === "dark" ? "hotpink" : "#d100c3";

  return (
    <group>
      <NoveltyParticles 
        count={500} 
        effectiveStartTime={effectiveStartTime}
        WINDS={WINDS} 
        localMaxNovelty={localMaxNovelty} 
        scrollOffset={scrollOffset}
        theme={theme}
      />
      
      <Line
        points={points}
        vertexColors={vertexColors}
        lineWidth={3}
        transparent
        opacity={0.9}
      />
      
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={"#ffffff"} />
        <pointLight intensity={10} color={"#ffffff"} distance={30} />
      </mesh>

      {markers.map((m, i) => {
        const isActive = i === activeIndex;
        return (
          <group position={m.pos} key={i}>
              <mesh
              onClick={(e) => { e.stopPropagation(); setTargetT(m.markerIndex); }}
              onPointerOver={() => document.body.style.cursor = 'pointer'}
              onPointerOut={() => document.body.style.cursor = 'auto'}
              >
              <sphereGeometry args={[isActive ? 1.2 : 0.6, 16, 16]} />
              <meshStandardMaterial 
                  color={isActive ? "#ffffff" : markerColor} 
                  emissive={isActive ? "#ffffff" : markerColor}
                  emissiveIntensity={isActive ? 2 : 1}
                  transparent
                  opacity={isActive ? 1 : 0.8}
              />
              </mesh>
              {isActive && <pointLight intensity={5} color="#ffffff" distance={15} />}
          </group>
        );
      })}

      <OrbitControls 
        ref={orbitRef} 
        makeDefault 
        enablePan={true}
        enableZoom={false}
        enableRotate={true}
      />

      {isArchaeologistActive && bridgePaths.map((path, i) => (
        <BifrostBridge 
          key={i}
          start={path.start} 
          end={path.end} 
          theme={theme}
          color={i === 0 ? "#00f2ff" : i === 1 ? "#ff00f2" : "#7000ff"}
        />
      ))}
    </group>
  );
};
