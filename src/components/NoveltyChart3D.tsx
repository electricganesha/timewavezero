import React, { useMemo, useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, Stars, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";
import { t as t_novelty, ZERO_DATE, dateToX, getFractalResonance } from "../engine/timewaveEngine";
import { MAJOR_EVENTS } from "../engine/timewaveConstants";
import type { ArchaeologistReport as ReportType } from "../services/aiArchaeologist";

const formatDate = (timeMs: number): string => {
  const d = new Date(timeMs);
  if (isNaN(d.getTime())) return "";
  const year = d.getUTCFullYear();
  if (year <= -20e9) return "Big Bang";
  if (year <= -1e9) return `${Math.abs(year / 1e9).toFixed(1)}B Yrs Ago`;
  if (year <= -1e6) return `${Math.abs(year / 1e6).toFixed(1)}M Yrs Ago`;
  if (year < 0) return `${Math.abs(year)} BC`;
  return d.toLocaleDateString();
};

interface NoveltyChart3DProps {
  startTime: number;
  endTime: number;
  theme: "dark" | "light";
  onHoverValue?: (val: number | null) => void;
  isArchaeologistActive?: boolean;
  archaeologistReport?: ReportType | null;
  archaeologistDate?: Date;
}

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

interface NoveltyParticlesProps {
  count: number;
  effectiveStartTime: number;
  WINDS: number;
  localMaxNovelty: number;
  scrollOffset: number;
  theme: "dark" | "light";
}

// Particle system following the vortex path
const NoveltyParticles: React.FC<NoveltyParticlesProps> = ({ count, effectiveStartTime, WINDS, localMaxNovelty, scrollOffset, theme }) => {
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
        // Move backward in time (towards the singularity) 
        // Speed is now scaled by movement intensity
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

// The glowing bridge between the current time and its fractal echo
const BifrostBridge: React.FC<{ 
  start: THREE.Vector3; 
  end: THREE.Vector3; 
  color?: string;
  theme: "dark" | "light";
}> = ({ start, end, color, theme }) => {
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
      {/* Glow particles along the bridge could be added here */}
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

const LogarithmicVortex: React.FC<LogarithmicVortexProps> = ({ 
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
  const orbitRef = React.useRef<any>(null);
  const hasReachedHeroShot = React.useRef(false);

  React.useEffect(() => {
    if (!isArchaeologistActive) {
      hasReachedHeroShot.current = false;
    }
  }, [isArchaeologistActive]);
  
  // Vortex parameters
  const Z_LENGTH = 300; 
  
  // Calculate shared vortex parameters (winds, local peak novelty)
  const { WINDS, localMaxNovelty } = useMemo(() => {
    const daysSpan = Math.max(0.1, Math.abs(endTime - effectiveStartTime) / 86400000);
    const exp = Math.max(1, Math.round(Math.log(daysSpan / 6) / Math.log(64)));
    
    // Dynamic winds: more loops for larger time spans
    const winds = 5 + exp * 1.5;

    // Sample novelty to find local peak for normalization
    let localMax = 0.0001;
    const steps = 200; // Efficient sampling for max
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

  // Helper to convert time remaining to "log progress" (0 to 1)
  const getLogProgress = React.useCallback((timeAtPoint: number) => {
    const daysRemaining = Math.max(0.0001, Math.abs(ZERO_DATE.getTime() - timeAtPoint) / 86400000);
    const maxDaysInDataset = Math.max(0.0001, Math.abs(ZERO_DATE.getTime() - effectiveStartTime) / 86400000);
    const minDays = 0.0001;
    return 1 - (Math.log(daysRemaining / minDays) / Math.log(maxDaysInDataset / minDays));
  }, [effectiveStartTime]);

  // Helper to get position for a specific date
  const getPositionForDate = React.useCallback((date: Date) => {
    const x = Math.abs(dateToX(date)); // Use Math.abs for novelty lookup to support reflected dates
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
    
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      z
    );
  }, [getLogProgress, WINDS, localMaxNovelty]);

  // Generate markers position using the same log logic AND same wiggle logic
  const markers = useMemo(() => {
    return MAJOR_EVENTS.filter(ev => ev.time >= effectiveStartTime && ev.time <= endTime)
      .sort((a, b) => a.time - b.time)
      .map((ev, index) => {
         const logP = getLogProgress(ev.time);
         
         const z = -Z_LENGTH * (1 - logP);
         const angle = logP * Math.PI * 2 * WINDS;
         
         const baseRadius = 50 * (1 - logP);
         
         // Use the date (in days before singularity) for novelty lookup
         const daysRemaining = Math.max(0.0001, Math.abs(ZERO_DATE.getTime() - ev.time) / 86400000);
         const val = t_novelty(daysRemaining); 
         
         // Use exactly the same scale-aware logic as the line points
         const normalizedNovelty = val / localMaxNovelty;
         const wiggleIntensity = 0.3 + logP * 0.4;
         const fractalWiggle = normalizedNovelty * (baseRadius * wiggleIntensity + 0.5);
         const radius = Math.max(0.1, baseRadius + fractalWiggle);
         
         const px = Math.cos(angle) * radius;
         const py = Math.sin(angle) * radius;
         
         return { ...ev, pos: new THREE.Vector3(px, py, z), logP, markerIndex: index };
      });
  }, [effectiveStartTime, endTime, getLogProgress, WINDS, localMaxNovelty]);

  const bridgePaths = useMemo(() => {
    if (!isArchaeologistActive || !archaeologistReport || !archaeologistDate) return [];
    
    // Calculate position for the primary date
    const startPos = getPositionForDate(archaeologistDate);

    // Calculate positions for all resonance echoes
    return archaeologistReport.echoDates.map((_dateStr, i) => {
      const echoDate = getFractalResonance(archaeologistDate, i + 1);
      const endPos = getPositionForDate(echoDate);
      return { start: startPos, end: endPos };
    });
  }, [isArchaeologistActive, archaeologistReport, archaeologistDate, getPositionForDate]);

  // Calculate vertices and colors using logarithmic time sampling and novelty amplification
  const { points, colors: vertexColors } = useMemo(() => {
    const steps = 4000;
    const rawData = [];
    const minDays = 0.0001;
    const maxDays = Math.max(0.1, Math.abs(ZERO_DATE.getTime() - effectiveStartTime) / 86400000);

    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const daysAtPoint = minDays * Math.pow(maxDays / minDays, t);
        
        // Past and Future checks (Reflection)
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

    // Second pass: Calculate positions and colors
    const pts = [];
    const clrs = [];
    
    const baseWaveColor = new THREE.Color(theme === "dark" ? "#00f2ff" : "#007aff");
    const peakWaveColor = new THREE.Color(theme === "dark" ? "#ff00fb" : "#d100c3");

    for (const data of rawData) {
        const logP = getLogProgress(data.timeAtPoint);
        const z = -Z_LENGTH * (1 - logP);
        const angle = logP * Math.PI * 2 * WINDS;
        
        // Normalize novelty (0 to 1) against local peak
        const normalizedNovelty = data.novelty / localMaxNovelty;
        
        // Amplify radius perturbation (up to 30% of base radius)
        // Amplify radius perturbation with scale-aware intensity
        const baseRadius = 50 * (1 - logP);
        const wiggleIntensity = 0.3 + logP * 0.4; // Increases as we go deeper
        const fractalWiggle = normalizedNovelty * (baseRadius * wiggleIntensity + 0.5); 
        const radius = Math.max(0.1, baseRadius + fractalWiggle);
        
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        
        pts.push(new THREE.Vector3(px, py, z));
        
        // Vertex colors based on novelty
        const vertexColor = baseWaveColor.clone().lerp(peakWaveColor, normalizedNovelty * 0.8);
        clrs.push(vertexColor);
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
            // Find the "deepest" resonance point to frame the shot
            const deepestBridge = bridgePaths[bridgePaths.length - 1];
            const targetCamZ = deepestBridge.end.z - 150; 
            const targetCamX = 80;
            const targetCamY = 80;
            const targetPos = new THREE.Vector3(targetCamX, targetCamY, targetCamZ);
            
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
        
        // Even if reached, we still need to emit novelty for audio
        if (onHoverValue && archaeologistDate) {
            const currentNovelty = t_novelty(dateToX(archaeologistDate));
            onHoverValue(currentNovelty);
        }
        return;
    }

    if (markers.length === 1) {
       // Single marker logic: just approach its Z position
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

    // Smoothly traverse the markers based on scrollOffset
    let interpolatedIndex = scrollOffset * (markers.length - 1);
    if (interpolatedIndex >= markers.length - 1) interpolatedIndex = markers.length - 1.0001;
    if (interpolatedIndex < 0) interpolatedIndex = 0;
    
    const floorIndex = Math.floor(interpolatedIndex);
    const ceilIndex = floorIndex + 1;
    const fraction = interpolatedIndex - floorIndex;
    
    const m1 = markers[floorIndex];
    const m2 = markers[ceilIndex];
    
    if (!m1 || !m2) return; // Final safety
    
    const zPos = THREE.MathUtils.lerp(m1.pos.z, m2.pos.z, fraction);
    
    if (orbitRef.current) {
      const currentTargetZ = orbitRef.current.target.z;
      const idealTargetZ = zPos;
      const nextTargetZ = THREE.MathUtils.lerp(currentTargetZ, idealTargetZ, 0.1);
      const deltaZ = nextTargetZ - currentTargetZ;
      
      orbitRef.current.target.z += deltaZ;
      state.camera.position.z += deltaZ;

      // Reset X/Y and restore standard zoom distance if we just came from archaeologist mode
      if (!isArchaeologistActive) {
        const standardDist = 80; // Reasonable default
        const currentRelZ = state.camera.position.z - orbitRef.current.target.z;
        const targetRelZ = currentRelZ > 0 ? standardDist : -standardDist;

        // Only adjust relZ if it's significantly different (was stretched by deep resonance)
        if (Math.abs(Math.abs(currentRelZ) - standardDist) > 5) {
            const nextRelZ = THREE.MathUtils.lerp(currentRelZ, targetRelZ, 0.05);
            state.camera.position.z = orbitRef.current.target.z + nextRelZ;
        }
      }
    }

    // Emit the current novelty at this travel position to drive the audio
    const currentLogP = THREE.MathUtils.lerp(m1.logP, m2.logP, fraction);
    const maxDays = Math.max(0.1, Math.abs(ZERO_DATE.getTime() - effectiveStartTime) / 86400000);
    const minDays = 0.0001;
    // inverse of: logP = 1 - (Math.log(days / minDays) / Math.log(maxDays / minDays))
    // Math.log(days / minDays) = (1 - logP) * Math.log(maxDays / minDays)
    // days / minDays = Math.exp((1 - logP) * Math.log(maxDays / minDays))
    // days / minDays = Math.pow(maxDays / minDays, 1 - logP)
    const daysRemaining = minDays * Math.pow(maxDays / minDays, 1 - currentLogP);
    const currentNovelty = t_novelty(daysRemaining);
    onHoverValue?.(currentNovelty);
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
      
      {/* Singularity Core (Z=0) */}
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

const NavigationController: React.FC<{ 
  targetIndex: number; 
  markersCount: number; 
  onUpdate: (val: number) => void 
}> = ({ targetIndex, markersCount, onUpdate }) => {
  const currentOffset = React.useRef(0);
  const targetOffset = markersCount > 1 ? targetIndex / (markersCount - 1) : 0;
  
  useFrame(() => {
    // Smooth lerping to the target marker
    currentOffset.current = THREE.MathUtils.lerp(currentOffset.current, targetOffset, 0.1);
    onUpdate(currentOffset.current);
  });
  
  return null;
};

interface VortexOverlayProps {
  offset: number;
  markers: { label: string; time: number; logP: number }[];
  theme: "dark" | "light";
  activeIndex: number;
}

const VortexOverlay: React.FC<VortexOverlayProps> = ({ offset, markers, theme, activeIndex }) => {
  if (markers.length === 0) return null;
  
  // Map 0-1 offset to current marker index
  const currentScrollIndex = offset * (markers.length - 1);
  const index = Math.round(currentScrollIndex);
  const m = markers[index];
  
  if (!m) return null;

  // Calculate opacity based on proximity to the "current" marker
  const distance = Math.abs(currentScrollIndex - index);
  const opacity = Math.max(0, 1 - distance * 3.5);
  
  const markerColor = theme === "dark" ? "hotpink" : "#d100c3";
  const isActive = index === activeIndex;

  return (
    <div style={{ 
      position: "absolute", 
      inset: 0, 
      pointerEvents: "none", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      zIndex: 10
    }}>
      <div 
        style={{ 
          opacity,
          color: isActive ? (theme === 'dark' ? '#ffffff' : '#000000') : markerColor, 
          fontFamily: "JetBrains Mono", 
          fontSize: "20px", 
          fontWeight: 800,
          whiteSpace: "nowrap", 
          background: isActive 
            ? (theme === 'dark' ? 'rgba(255, 0, 242, 0.95)' : 'rgba(191, 0, 176, 0.95)')
            : (theme === 'dark' ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.92)'),
          padding: '16px 32px',
          borderRadius: '12px',
          border: isActive ? 'none' : `1.5px solid ${markerColor}`,
          transform: `translateY(${distance * 20}px) scale(${1 - distance * 0.1})`,
          transition: 'transform 0.1s ease-out, background 0.3s ease',
          textAlign: 'center',
          boxShadow: theme === 'dark' 
            ? '0 20px 50px rgba(0,0,0,0.6)' 
            : '0 10px 30px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(15px)'
        }}
      >
        <div style={{ 
          fontSize: '11px', 
          opacity: 0.8, 
          marginBottom: '6px', 
          letterSpacing: '0.2em',
          color: isActive ? (theme === 'dark' ? '#ffffff' : '#000000') : 'inherit'
        }}>
          {formatDate(m.time)}
        </div>
        <div style={{ letterSpacing: '0.05em' }}>{m.label.toUpperCase()}</div>
      </div>
    </div>
  );
};

export const NoveltyChart3D: React.FC<NoveltyChart3DProps> = ({ 
  startTime, 
  endTime, 
  theme, 
  onHoverValue,
  isArchaeologistActive,
  archaeologistReport,
  archaeologistDate
}) => {
  const [targetIndex, setTargetIndex] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  // calculate "effective range" (ancestor to singularity) if archaeologist is active
  const effectiveStartTime = useMemo(() => {
    if (!isArchaeologistActive || !archaeologistDate) return startTime;
    
    // Calculate echoMs carefully
    const x = Math.abs(dateToX(archaeologistDate));
    const echoX = x + 384 * 64; 
    const echoMs = ZERO_DATE.getTime() - echoX * 86400000;
    
    // The range must reach at least the echo date
    return Math.min(startTime, echoMs);
  }, [startTime, isArchaeologistActive, archaeologistDate]);

  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const lastWheelTime = useRef(0);
  
  // Cleanup novelty state on unmount
  useEffect(() => {
    return () => {
      onHoverValue?.(null);
    };
  }, [onHoverValue]);

  const { markersForOverlay, exponent } = useMemo(() => {
    const daysSpan = Math.max(0.1, Math.abs(endTime - effectiveStartTime) / 86400000);
    const exp = Math.max(1, Math.round(Math.log(daysSpan / 6) / Math.log(64)));

    const ms = MAJOR_EVENTS.filter(ev => ev.time >= effectiveStartTime && ev.time <= endTime)
      .sort((a, b) => a.time - b.time)
      .map((ev, index) => {
        const daysRemaining = Math.max(0.0001, Math.abs(ZERO_DATE.getTime() - ev.time) / 86400000);
        const maxDaysInDataset = Math.max(0.0001, Math.abs(ZERO_DATE.getTime() - effectiveStartTime) / 86400000);
        const logP = 1 - (Math.log(daysRemaining / 0.0001) / Math.log(maxDaysInDataset / 0.0001));
        return { ...ev, markerIndex: index, logP };
      });
    return { markersForOverlay: ms, exponent: exp };
  }, [effectiveStartTime, endTime]);

  useEffect(() => {
    const el = scrollTargetRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      // Throttle to prevent skipping multiple events too fast
      if (now - lastWheelTime.current < 150) return;
      
      if (e.deltaY < 0) {
        // Scroll Up -> Forward In Time
        setTargetIndex(prev => Math.min(markersForOverlay.length - 1, prev + 1));
        lastWheelTime.current = now;
      } else if (e.deltaY > 0) {
        // Scroll Down -> Backward In Time
        setTargetIndex(prev => Math.max(0, prev - 1));
        lastWheelTime.current = now;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [markersForOverlay.length]);

  return (
    <div 
      ref={scrollTargetRef}
      style={{ 
        position: "absolute", 
        inset: 0, 
        backgroundColor: theme === 'dark' ? '#050505' : '#f5f5f7',
        overflow: 'hidden',
        touchAction: 'none'
      }}
    >
      <VortexOverlay 
        offset={scrollOffset} 
        markers={markersForOverlay} 
        theme={theme} 
        activeIndex={targetIndex}
      />

      <Canvas 
        camera={{ position: [0, 10, -380], fov: 60 }} 
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
          gl.domElement.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        }}
      >
        <fog attach="fog" args={[theme === 'dark' ? '#050505' : '#f5f5f7', 10, 450]} />
        {theme === 'dark' && <Stars radius={150} depth={100} count={6000} factor={6} saturation={0} fade speed={2} />}
        
        <ambientLight intensity={theme === 'dark' ? 0.2 : 0.7} />
        <pointLight position={[0, 0, 10]} intensity={5} color={"#00f2ff"} />
        
        <NavigationController 
          targetIndex={targetIndex} 
          markersCount={markersForOverlay.length} 
          onUpdate={setScrollOffset} 
        />
        
        <LogarithmicVortex 
          startTime={startTime} 
          endTime={endTime} 
          theme={theme} 
          setTargetT={(val) => val !== null && setTargetIndex(val)}
          scrollOffset={scrollOffset}
          activeIndex={targetIndex}
          onHoverValue={onHoverValue}
          isArchaeologistActive={isArchaeologistActive}
          archaeologistReport={archaeologistReport}
          archaeologistDate={archaeologistDate}
          effectiveStartTime={effectiveStartTime}
        />

        <EffectComposer>
            <Bloom 
                intensity={theme === 'dark' ? 1.5 : 0.8} 
                luminanceThreshold={0.1} 
                luminanceSmoothing={0.9} 
                mipmapBlur 
            />
            <Noise opacity={0.05} />
            <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
        </EffectComposer>
      </Canvas>
      
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          pointerEvents: "none",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
        }}
      >
        <div style={{
          fontSize: "10px",
          fontFamily: "JetBrains Mono",
          color: "var(--meta-text, var(--text-very-muted))",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          gap: "4px",
        }}>
          <span>FRACTAL_SCALE: 64<sup>{exponent}</sup></span>
          <span>TERMINAL_SINGULARITY: 2012-12-21</span>
        </div>
        
        <div className="glass" style={{ padding: "8px", fontSize: "10px", fontFamily: "JetBrains Mono", color: "var(--text-muted)", pointerEvents: "auto", textAlign: "right" }}>
          <b>Scroll down</b> to travel through time.<br/>
          Click an event to jump. Orbit with mouse.
        </div>
      </div>
    </div>
  );
};
