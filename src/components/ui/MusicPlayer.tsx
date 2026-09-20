"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Music, VolumeX } from "lucide-react";

// ─── Frieren-inspired calm, pastoral melody ─────────────────────────
// Key of C major / A minor — gentle, warm, nostalgic
// Think: soft piano arpeggios + floating melody + warm pad

const BPM = 72;
const BEAT = 60 / BPM;

// Gentle arpeggio pattern (harp/piano-like)
// [note frequency, beat offset, duration in beats]
const ARPEGGIO: [number, number, number][] = [
  // Bar 1: C major (C-E-G-C)
  [261.63, 0, 0.8],      // C4
  [329.63, 0.5, 0.8],    // E4
  [392.00, 1.0, 0.8],    // G4
  [523.25, 1.5, 0.8],    // C5
  [392.00, 2.0, 0.8],    // G4
  [329.63, 2.5, 0.8],    // E4
  [261.63, 3.0, 0.8],    // C4
  [329.63, 3.5, 0.8],    // E4

  // Bar 2: Am (A-C-E-A)
  [220.00, 4, 0.8],      // A3
  [261.63, 4.5, 0.8],    // C4
  [329.63, 5.0, 0.8],    // E4
  [440.00, 5.5, 0.8],    // A4
  [329.63, 6.0, 0.8],    // E4
  [261.63, 6.5, 0.8],    // C4
  [220.00, 7.0, 0.8],    // A3
  [261.63, 7.5, 0.8],    // C4

  // Bar 3: F major (F-A-C-F)
  [174.61, 8, 0.8],      // F3
  [220.00, 8.5, 0.8],    // A3
  [261.63, 9.0, 0.8],    // C4
  [349.23, 9.5, 0.8],    // F4
  [261.63, 10.0, 0.8],   // C4
  [220.00, 10.5, 0.8],   // A3
  [174.61, 11.0, 0.8],   // F3
  [220.00, 11.5, 0.8],   // A3

  // Bar 4: G major (G-B-D-G)
  [196.00, 12, 0.8],     // G3
  [246.94, 12.5, 0.8],   // B3
  [293.66, 13.0, 0.8],   // D4
  [392.00, 13.5, 0.8],   // G4
  [293.66, 14.0, 0.8],   // D4
  [246.94, 14.5, 0.8],   // B3
  [196.00, 15.0, 0.8],   // G3
  [246.94, 15.5, 0.8],   // B3

  // Bar 5: Em (E-G-B-E)
  [164.81, 16, 0.8],     // E3
  [196.00, 16.5, 0.8],   // G3
  [246.94, 17.0, 0.8],   // B3
  [329.63, 17.5, 0.8],   // E4
  [246.94, 18.0, 0.8],   // B3
  [196.00, 18.5, 0.8],   // G3
  [164.81, 19.0, 0.8],   // E3
  [196.00, 19.5, 0.8],   // G3

  // Bar 6: Am (A-C-E-A)
  [220.00, 20, 0.8],     // A3
  [261.63, 20.5, 0.8],   // C4
  [329.63, 21.0, 0.8],   // E4
  [440.00, 21.5, 0.8],   // A4
  [329.63, 22.0, 0.8],   // E4
  [261.63, 22.5, 0.8],   // C4
  [220.00, 23.0, 0.8],   // A3
  [261.63, 23.5, 0.8],   // C4

  // Bar 7: Dm (D-F-A-D)
  [146.83, 24, 0.8],     // D3
  [174.61, 24.5, 0.8],   // F3
  [220.00, 25.0, 0.8],   // A3
  [293.66, 25.5, 0.8],   // D4
  [220.00, 26.0, 0.8],   // A3
  [174.61, 26.5, 0.8],   // F3
  [146.83, 27.0, 0.8],   // D3
  [174.61, 27.5, 0.8],   // F3

  // Bar 8: G → C (resolution)
  [196.00, 28, 0.8],     // G3
  [246.94, 28.5, 0.8],   // B3
  [293.66, 29.0, 0.8],   // D4
  [392.00, 29.5, 1.2],   // G4 (held longer)
  [329.63, 30.5, 0.8],   // E4
  [261.63, 31.0, 1.5],   // C4 (resolving, long)
];

// Floating melody on top (like a flute or celesta)
const MELODY: [number, number, number][] = [
  // Phrase 1: gentle, ascending
  [523.25, 1.0, 2.0],    // C5
  [587.33, 3.0, 1.5],    // D5
  [659.25, 5.0, 2.5],    // E5
  [587.33, 7.5, 1.5],    // D5

  // Phrase 2: reaching higher, then gently falling
  [659.25, 10.0, 1.5],   // E5
  [783.99, 11.5, 2.5],   // G5
  [698.46, 14.0, 1.5],   // F5
  [659.25, 15.5, 2.0],   // E5

  // Phrase 3: tender, reflective
  [523.25, 18.0, 1.0],   // C5
  [587.33, 19.5, 1.0],   // D5
  [523.25, 21.0, 2.0],   // C5
  [440.00, 23.0, 2.5],   // A4

  // Phrase 4: gentle resolution
  [523.25, 26.0, 1.5],   // C5
  [493.88, 27.5, 1.0],   // B4
  [440.00, 29.0, 1.5],   // A4
  [523.25, 31.0, 3.0],   // C5 (long, fading)
];

// Warm pad chords (very soft, sustained background)
const PAD_CHORDS: [number[], number, number][] = [
  [[261.63, 329.63, 392.00], 0, 4],      // C major
  [[220.00, 261.63, 329.63], 4, 4],       // Am
  [[174.61, 220.00, 261.63], 8, 4],       // F
  [[196.00, 246.94, 293.66], 12, 4],      // G
  [[164.81, 196.00, 246.94], 16, 4],      // Em
  [[220.00, 261.63, 329.63], 20, 4],      // Am
  [[146.83, 174.61, 220.00], 24, 4],      // Dm
  [[196.00, 246.94, 392.00], 28, 4],      // G (wider voicing)
];

const LOOP_BEATS = 33;
const LOOP_DURATION = LOOP_BEATS * BEAT;

// ─── Audio helpers ──────────────────────────────────────────────────

function createReverb(ctx: AudioContext): ConvolverNode {
  const convolver = ctx.createConvolver();
  const rate = ctx.sampleRate;
  const length = rate * 2.5;
  const impulse = ctx.createBuffer(2, length, rate);

  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
    }
  }
  convolver.buffer = impulse;
  return convolver;
}

function playArpeggioNote(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  startTime: number,
  duration: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startTime);

  // Soft pluck-like envelope
  const vol = 0.045;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(vol * 0.4, startTime + duration * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.1);
}

function playMelodyNote(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  startTime: number,
  duration: number
) {
  // Main tone (sine, pure, like a music box)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(freq, startTime);

  const vol = 0.035;
  gain1.gain.setValueAtTime(0, startTime);
  gain1.gain.linearRampToValueAtTime(vol, startTime + 0.08);
  gain1.gain.setValueAtTime(vol, startTime + duration * 0.5);
  gain1.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc1.connect(gain1);
  gain1.connect(dest);
  osc1.start(startTime);
  osc1.stop(startTime + duration + 0.1);

  // Subtle octave shimmer (very quiet)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(freq * 2, startTime);

  gain2.gain.setValueAtTime(0, startTime);
  gain2.gain.linearRampToValueAtTime(vol * 0.15, startTime + 0.1);
  gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.7);

  osc2.connect(gain2);
  gain2.connect(dest);
  osc2.start(startTime);
  osc2.stop(startTime + duration + 0.1);
}

function playPadChord(
  ctx: AudioContext,
  dest: AudioNode,
  frequencies: number[],
  startTime: number,
  duration: number
) {
  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    const vol = 0.018;
    const dur = duration * BEAT;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + dur * 0.2);
    gain.gain.setValueAtTime(vol, startTime + dur * 0.6);
    gain.gain.linearRampToValueAtTime(0, startTime + dur);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(startTime);
    osc.stop(startTime + dur + 0.5);
  });
}

// ─── Schedule one full loop ─────────────────────────────────────────

function scheduleLoop(ctx: AudioContext, reverb: ConvolverNode, baseTime: number) {
  // Dry/wet mix node
  const dryGain = ctx.createGain();
  dryGain.gain.value = 0.7;
  dryGain.connect(ctx.destination);

  const wetGain = ctx.createGain();
  wetGain.gain.value = 0.4;
  wetGain.connect(reverb);
  reverb.connect(ctx.destination);

  // Arpeggios (with reverb)
  ARPEGGIO.forEach(([freq, beatOffset, dur]) => {
    const t = baseTime + beatOffset * BEAT;
    playArpeggioNote(ctx, dryGain, freq, t, dur * BEAT);
    playArpeggioNote(ctx, wetGain, freq, t, dur * BEAT);
  });

  // Melody (mostly dry with some reverb)
  MELODY.forEach(([freq, beatOffset, dur]) => {
    const t = baseTime + beatOffset * BEAT;
    playMelodyNote(ctx, dryGain, freq, t, dur * BEAT);
    playMelodyNote(ctx, wetGain, freq, t, dur * BEAT * 0.5);
  });

  // Pad chords (dry, very soft)
  PAD_CHORDS.forEach(([freqs, beatOffset, dur]) => {
    const t = baseTime + beatOffset * BEAT;
    playPadChord(ctx, dryGain, freqs, t, dur);
  });
}

// ─── Component ──────────────────────────────────────────────────────

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const startMusic = useCallback(() => {
    if (ctxRef.current) return;

    const ctx = new AudioContext();
    const reverb = createReverb(ctx);
    ctxRef.current = ctx;
    reverbRef.current = reverb;

    // Schedule first loop
    scheduleLoop(ctx, reverb, ctx.currentTime + 0.3);

    // Schedule subsequent loops with a small gap for breathing room
    intervalRef.current = setInterval(() => {
      if (ctxRef.current && reverbRef.current) {
        scheduleLoop(ctxRef.current, reverbRef.current, ctxRef.current.currentTime + 0.3);
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
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    reverbRef.current = null;
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) stopMusic();
    else startMusic();
  }, [isPlaying, startMusic, stopMusic]);

  useEffect(() => {
    return () => { stopMusic(); };
  }, [stopMusic]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip */}
      {showTooltip && !isPlaying && (
        <div className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-brand-blue-light text-sm font-bold text-brand-blue animate-bounce hidden md:block">
          🎵 Play some music?
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
