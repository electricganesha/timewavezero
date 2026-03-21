import React from "react";
import { formatChartDate } from "../../../utils/dateUtils";

interface VortexOverlayProps {
  offset: number;
  markers: { label: string; time: number; logP: number }[];
  theme: "dark" | "light";
  activeIndex: number;
}

export const VortexOverlay: React.FC<VortexOverlayProps> = ({ 
  offset, 
  markers, 
  theme, 
  activeIndex 
}) => {
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
          transform: `translateY(${120 + distance * 20}px) scale(${1 - distance * 0.1})`,
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
          {formatChartDate(m.time)}
        </div>
        <div style={{ letterSpacing: '0.05em' }}>{m.label.toUpperCase()}</div>
      </div>
    </div>
  );
};
