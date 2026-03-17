import { useEffect, useRef, useState, useCallback } from "react";

export const useNoveltyAudio = (novelty: number) => {
  const audioCtx = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const filter = useRef<BiquadFilterNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const initAudio = useCallback(() => {
    if (audioCtx.current) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx.current = new AudioContextClass();

    // Create nodes
    oscillator.current = audioCtx.current.createOscillator();
    filter.current = audioCtx.current.createBiquadFilter();
    gainNode.current = audioCtx.current.createGain();

    // Configure nodes
    oscillator.current.type = "sine";
    filter.current.type = "lowpass";
    filter.current.Q.value = 5;
    gainNode.current.gain.value = 0; // Start silent

    // Connect nodes: Osc -> Filter -> Gain -> Destination
    oscillator.current.connect(filter.current);
    filter.current.connect(gainNode.current);
    gainNode.current.connect(audioCtx.current.destination);

    // Start oscillator
    oscillator.current.start();
  }, []);

  const togglePlayback = useCallback(() => {
    if (!audioCtx.current) {
      initAudio();
    }

    if (audioCtx.current?.state === "suspended") {
      audioCtx.current.resume();
    }

    if (isPlaying) {
      gainNode.current?.gain.setTargetAtTime(
        0,
        audioCtx.current!.currentTime,
        0.1,
      );
      setIsPlaying(false);
    } else {
      gainNode.current?.gain.setTargetAtTime(
        0.2,
        audioCtx.current!.currentTime,
        0.1,
      );
      setIsPlaying(true);
    }
  }, [isPlaying, initAudio]);

  // Update audio parameters based on novelty
  useEffect(() => {
    if (!audioCtx.current || !isPlaying) return;

    const now = audioCtx.current.currentTime;

    // Mapping novelty to frequency
    // Higher novelty (less order) = more chaotic frequency/filter
    // Lower novelty (approaching 0) = base drone gets "purer" and lower?
    // Actually novelty increases as we approach zero (in the formal sense of 'decreasing novelty' being 'increasing numerical value' in some versions, but McKenna usually says novelty peaks at the attractor).
    // In our engine, getNoveltyAtDate returns higher values for higher "chaos" (patterns of decreasing novelty).
    // Let's map high novelty to higher harmonics/intensity.

    const baseFreq = 80 + novelty * 400;
    oscillator.current?.frequency.setTargetAtTime(baseFreq, now, 0.1);

    const filterCutoff = 200 + novelty * 2000;
    filter.current?.frequency.setTargetAtTime(filterCutoff, now, 0.1);
  }, [novelty, isPlaying]);

  // Clean up
  useEffect(() => {
    return () => {
      audioCtx.current?.close();
    };
  }, []);

  return { isPlaying, togglePlayback };
};
