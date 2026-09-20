"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Music, VolumeX } from "lucide-react";

// ─── Frieren-inspired calm, pastoral melody with MULTIPLE INSTRUMENTS ───
const BPM = 72;
const BEAT = 60 / BPM;

// 1. HARP (Arpeggios) - Gentle plucked strings
const HARP_NOTES: [number, number, number][] = [
  // C major
  [261.63, 0, 0.8], [329.63, 0.5, 0.8], [392.00, 1.0, 0.8], [523.25, 1.5, 0.8],
  [392.00, 2.0, 0.8], [329.63, 2.5, 0.8], [261.63, 3.0, 0.8], [329.63, 3.5, 0.8],
  // Am
  [220.00, 4, 0.8], [261.63, 4.5, 0.8], [329.63, 5.0, 0.8], [440.00, 5.5, 0.8],
  [329.63, 6.0, 0.8], [261.63, 6.5, 0.8], [220.00, 7.0, 0.8], [261.63, 7.5, 0.8],
  // F major
  [174.61, 8, 0.8], [220.00, 8.5, 0.8], [261.63, 9.0, 0.8], [349.23, 9.5, 0.8],
  [261.63, 10.0, 0.8], [220.00, 10.5, 0.8], [174.61, 11.0, 0.8], [220.00, 11.5, 0.8],
  // G major
  [196.00, 12, 0.8], [246.94, 12.5, 0.8], [293.66, 13.0, 0.8], [392.00, 13.5, 0.8],
  [293.66, 14.0, 0.8], [246.94, 14.5, 0.8], [196.00, 15.0, 0.8], [246.94, 15.5, 0.8],
  // Em
  [164.81, 16, 0.8], [196.00, 16.5, 0.8], [246.94, 17.0, 0.8], [329.63, 17.5, 0.8],
  [246.94, 18.0, 0.8], [196.00, 18.5, 0.8], [164.81, 19.0, 0.8], [196.00, 19.5, 0.8],
  // Am
  [220.00, 20, 0.8], [261.63, 20.5, 0.8], [329.63, 21.0, 0.8], [440.00, 21.5, 0.8],
  [329.63, 22.0, 0.8], [261.63, 22.5, 0.8], [220.00, 23.0, 0.8], [261.63, 23.5, 0.8],
  // Dm
  [146.83, 24, 0.8], [174.61, 24.5, 0.8], [220.00, 25.0, 0.8], [293.66, 25.5, 0.8],
  [220.00, 26.0, 0.8], [174.61, 26.5, 0.8], [146.83, 27.0, 0.8], [174.61, 27.5, 0.8],
  // G -> C
  [196.00, 28, 0.8], [246.94, 28.5, 0.8], [293.66, 29.0, 0.8], [392.00, 29.5, 1.2],
  [329.63, 30.5, 0.8], [261.63, 31.0, 1.5],
];

// 2. FLUTE (Melody) - Soft wind instrument with vibrato
const FLUTE_NOTES: [number, number, number][] = [
  [523.25, 1.0, 2.0],  [587.33, 3.0, 1.5],  [659.25, 5.0, 2.5],  [587.33, 7.5, 1.5],
  [659.25, 10.0, 1.5], [783.99, 11.5, 2.5], [698.46, 14.0, 1.5], [659.25, 15.5, 2.0],
  [523.25, 18.0, 1.0], [587.33, 19.5, 1.0], [523.25, 21.0, 2.0], [440.00, 23.0, 2.5],
  [523.25, 26.0, 1.5], [493.88, 27.5, 1.0], [440.00, 29.0, 1.5], [523.25, 31.0, 3.0],
];

// 3. STRINGS (Pad) - Sustained chords (sawtooth + lowpass filter)
const STRINGS_CHORDS: [number[], number, number][] = [
  [[261.63, 329.63, 392.00], 0, 4],  // C
  [[220.00, 261.63, 329.63], 4, 4],  // Am
  [[174.61, 220.00, 261.63], 8, 4],  // F
  [[196.00, 246.94, 293.66], 12, 4], // G
  [[164.81, 196.00, 246.94], 16, 4], // Em
  [[220.00, 261.63, 329.63], 20, 4], // Am
  [[146.83, 174.61, 220.00], 24, 4], // Dm
  [[196.00, 246.94, 392.00], 28, 4], // G
];

// 4. BASS (Deep roots) - Very low, warm triangle wave
const BASS_NOTES: [number, number, number][] = [
  [65.41, 0, 4],   // C2
  [55.00, 4, 4],   // A1
  [43.65, 8, 4],   // F1
  [49.00, 12, 4],  // G1
  [41.20, 16, 4],  // E1
  [55.00, 20, 4],  // A1
  [73.42, 24, 4],  // D2
  [49.00, 28, 4],  // G1
];

// 5. GLOCKENSPIEL / BELLS - Magical high accents
const BELL_NOTES: [number, number, number][] = [
  [1046.50, 0, 1],   // C6
  [1567.98, 4, 1],   // G6
  [1396.91, 8, 1],   // F6
  [1174.66, 12, 1],  // D6
  [1318.51, 16, 1],  // E6
  [1760.00, 20, 1],  // A6
  [1174.66, 24, 1],  // D6
  [1567.98, 28, 2],  // G6
];

const LOOP_BEATS = 33;
const LOOP_DURATION = LOOP_BEATS * BEAT;

// ─── SYNTHESIS ENGINES ────────────────────────────────────────────────

// Reverb (Spacious anime environment)
function createReverb(ctx: AudioContext): ConvolverNode {
  const convolver = ctx.createConvolver();
  const rate = ctx.sampleRate;
  const length = rate * 3.0; // 3 seconds decay
  const impulse = ctx.createBuffer(2, length, rate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.0);
    }
  }
  convolver.buffer = impulse;
  return convolver;
}

// 1. HARP SYNTH
function playHarp(ctx: AudioContext, dest: AudioNode, freq: number, startTime: number, duration: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, startTime);
  
  const vol = 0.05;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.02); // Pluck
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Fade

  osc.connect(gain);
  gain.connect(dest);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.1);
}

// 2. FLUTE SYNTH
function playFlute(ctx: AudioContext, dest: AudioNode, freq: number, startTime: number, duration: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startTime);

  // Vibrato LFO
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(5, startTime); // 5Hz vibrato
  lfoGain.gain.setValueAtTime(0, startTime);
  lfoGain.gain.linearRampToValueAtTime(freq * 0.015, startTime + 0.5); // Delay vibrato slightly
  
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  // Breath envelope
  const vol = 0.06;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.1); // Soft breath attack
  gain.gain.setValueAtTime(vol, startTime + duration * 0.8);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain);
  gain.connect(dest);
  
  osc.start(startTime);
  lfo.start(startTime);
  osc.stop(startTime + duration + 0.1);
  lfo.stop(startTime + duration + 0.1);
}

// 3. STRINGS SYNTH
function playStrings(ctx: AudioContext, dest: AudioNode, freqs: number[], startTime: number, duration: number) {
  const durSec = duration * BEAT;
  
  freqs.forEach((freq) => {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, startTime);

    // Filter envelope (swelling strings)
    filter.type = "lowpass";
    filter.Q.value = 1;
    filter.frequency.setValueAtTime(freq, startTime);
    filter.frequency.linearRampToValueAtTime(freq * 3, startTime + durSec * 0.4);
    filter.frequency.linearRampToValueAtTime(freq * 1.5, startTime + durSec);

    // Volume envelope
    const vol = 0.015;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + durSec * 0.3); // Slow bow attack
    gain.gain.setValueAtTime(vol, startTime + durSec * 0.7);
    gain.gain.linearRampToValueAtTime(0, startTime + durSec + 0.5); // Slow release

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(startTime);
    osc.stop(startTime + durSec + 0.6);
  });
}

// 4. BASS SYNTH
function playBass(ctx: AudioContext, dest: AudioNode, freq: number, startTime: number, duration: number) {
  const durSec = duration * BEAT;
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, startTime);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(freq * 2, startTime); // Very warm and muffled

  const vol = 0.08;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.1);
  gain.gain.setValueAtTime(vol, startTime + durSec * 0.9);
  gain.gain.linearRampToValueAtTime(0, startTime + durSec);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  osc.start(startTime);
  osc.stop(startTime + durSec + 0.1);
}

// 5. BELLS SYNTH
function playBell(ctx: AudioContext, dest: AudioNode, freq: number, startTime: number, duration: number) {
  // Main tone
  const osc1 = ctx.createOscillator();
  // Inharmonic overtone for metallic sound
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(freq, startTime);
  
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(freq * 2.76, startTime);

  const vol = 0.02;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.01); // Instant strike
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.0); // Very long ring

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(dest);

  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + 2.5);
  osc2.stop(startTime + 2.5);
}

// ─── MUSIC SCHEDULER ────────────────────────────────────────────────

function scheduleLoop(ctx: AudioContext, reverb: ConvolverNode, masterGain: GainNode, baseTime: number) {
  // Split signals for Reverb (Wet) and Direct (Dry)
  const dry = ctx.createGain();
  dry.gain.value = 0.8;
  dry.connect(masterGain);

  const wet = ctx.createGain();
  wet.gain.value = 0.5; // Amount of reverb
  wet.connect(reverb);
  reverb.connect(masterGain);

  // 1. Harp
  HARP_NOTES.forEach(([freq, beatOffset, dur]) => {
    const t = baseTime + beatOffset * BEAT;
    playHarp(ctx, dry, freq, t, dur * BEAT);
    playHarp(ctx, wet, freq, t, dur * BEAT);
  });

  // 2. Flute
  FLUTE_NOTES.forEach(([freq, beatOffset, dur]) => {
    const t = baseTime + beatOffset * BEAT;
    playFlute(ctx, dry, freq, t, dur * BEAT);
    playFlute(ctx, wet, freq, t, dur * BEAT);
  });

  // 3. Strings
  STRINGS_CHORDS.forEach(([freqs, beatOffset, dur]) => {
    const t = baseTime + beatOffset * BEAT;
    playStrings(ctx, dry, freqs, t, dur);
    playStrings(ctx, wet, freqs, t, dur);
  });

  // 4. Bass (mostly dry so it doesn't get muddy)
  BASS_NOTES.forEach(([freq, beatOffset, dur]) => {
    const t = baseTime + beatOffset * BEAT;
    playBass(ctx, dry, freq, t, dur);
  });

  // 5. Bells (extra wet for magic feel)
  BELL_NOTES.forEach(([freq, beatOffset]) => {
    const t = baseTime + beatOffset * BEAT;
    playBell(ctx, dry, freq, t, 0);
    playBell(ctx, wet, freq, t, 0);
    // Add an extra connection to wet for bells
    playBell(ctx, wet, freq, t, 0); 
  });
}

// ─── COMPONENT ──────────────────────────────────────────────────────

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const startMusic = useCallback(() => {
    if (ctxRef.current) return;

    const ctx = new AudioContext();
    
    // Master compressor to glue the 5 instruments together and prevent clipping
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-20, ctx.currentTime);
    compressor.knee.setValueAtTime(10, ctx.currentTime);
    compressor.ratio.setValueAtTime(4, ctx.currentTime);
    compressor.attack.setValueAtTime(0.05, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);
    compressor.connect(ctx.destination);

    // Master volume control
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(compressor);

    const reverb = createReverb(ctx);
    
    ctxRef.current = ctx;
    reverbRef.current = reverb;
    masterRef.current = masterGain;

    // Schedule first loop
    scheduleLoop(ctx, reverb, masterGain, ctx.currentTime + 0.3);

    // Schedule subsequent loops
    intervalRef.current = setInterval(() => {
      if (ctxRef.current && reverbRef.current && masterRef.current) {
        scheduleLoop(ctxRef.current, reverbRef.current, masterRef.current, ctxRef.current.currentTime + 0.3);
      }
    }, LOOP_DURATION * 1000);

    setIsPlaying(true);
    setShowTooltip(false);
  }, []);

  const stopMusic = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (masterRef.current && ctxRef.current) {
      // Fade out smoothly instead of cutting instantly
      masterRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 1.0);
      setTimeout(() => {
        if (ctxRef.current) {
          ctxRef.current.close();
          ctxRef.current = null;
        }
        reverbRef.current = null;
        masterRef.current = null;
      }, 1000);
    }
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) stopMusic();
    else startMusic();
  }, [isPlaying, startMusic, stopMusic]);

  useEffect(() => {
    return () => { 
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (ctxRef.current) ctxRef.current.close();
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip */}
      {showTooltip && !isPlaying && (
        <div className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-brand-blue-light text-sm font-bold text-brand-blue animate-bounce hidden md:block">
          🎵 Full Orchestra Mode?
        </div>
      )}

      {/* Music Button */}
      <button
        onClick={toggle}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 transition-all duration-300 group",
          isPlaying
            ? "bg-brand-blue border-white text-white hover:bg-[#3A649E]"
            : "bg-white border-brand-blue-light text-brand-blue hover:border-brand-blue hover:bg-brand-blue-light"
        )}
        aria-label={isPlaying ? "Mute music" : "Play music"}
        title={isPlaying ? "Mute music" : "Play music"}
      >
        {isPlaying ? (
          <Music className="w-6 h-6 group-hover:scale-110 transition-transform" />
        ) : (
          <VolumeX className="w-6 h-6 group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Soft glow when playing */}
      {isPlaying && (
        <div className="absolute inset-0 w-14 h-14 rounded-full bg-brand-blue/20 animate-ping pointer-events-none"></div>
      )}
    </div>
  );
}
