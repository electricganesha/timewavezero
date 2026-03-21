import React, { useMemo, useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";
import { ZERO_DATE, dateToX } from "../../../engine/timewaveEngine";
import { MAJOR_EVENTS } from "../../../engine/timewaveConstants";
import type { ArchaeologistReport as ReportType } from "../../../services/aiArchaeologist";

// Extracted sub-components
import { LogarithmicVortex } from "./LogarithmicVortex";
import { NavigationController } from "./NavigationController";
import { VortexOverlay } from "./VortexOverlay";

interface NoveltyChart3DProps {
  startTime: number;
  endTime: number;
  theme: "dark" | "light";
  onHoverValue?: (val: number | null) => void;
  isArchaeologistActive?: boolean;
  archaeologistReport?: ReportType | null;
  archaeologistDate?: Date;
}

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
