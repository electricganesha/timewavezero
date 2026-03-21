import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NavigationControllerProps {
  targetIndex: number;
  markersCount: number;
  onUpdate: (val: number) => void;
}

export const NavigationController: React.FC<NavigationControllerProps> = ({ 
  targetIndex, 
  markersCount, 
  onUpdate 
}) => {
  const currentOffset = useRef(0);
  const targetOffset = markersCount > 1 ? targetIndex / (markersCount - 1) : 0;
  
  useFrame(() => {
    // Smooth lerping to the target marker
    currentOffset.current = THREE.MathUtils.lerp(currentOffset.current, targetOffset, 0.1);
    onUpdate(currentOffset.current);
  });
  
  return null;
};
