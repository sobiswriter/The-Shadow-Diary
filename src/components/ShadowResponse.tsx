"use client";

import { useEffect, useState, useMemo } from "react";
import * as Tone from "tone";

interface ShadowResponseProps {
  text: string;
}

export function ShadowResponse({ text }: ShadowResponseProps) {
  const [displayedText, setDisplayedText] = useState("");

  const synth = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new Tone.MembraneSynth({
      pitchDecay: 0.01,
      octaves: 2,
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0.01,
        release: 0.4,
        attackCurve: "exponential",
      },
    }).toDestination();
  }, []);

  useEffect(() => {
    setDisplayedText(""); 
    if (text && synth) {
      let i = 0;
      const intervalId = setInterval(() => {
        setDisplayedText((prev) => prev + text.charAt(i));

        try {
          if (Tone.context.state !== "running") {
            Tone.context.resume();
          }
          synth.triggerAttackRelease("C1", "8n");
        } catch (error) {
          console.error("Tone.js error:", error);
        }

        if (typeof window !== "undefined" && "vibrate" in navigator) {
          if (i % 5 === 0) { 
             navigator.vibrate(20);
          }
        }

        i++;
        if (i >= text.length) {
          clearInterval(intervalId);
        }
      }, 90);

      return () => clearInterval(intervalId);
    }
  }, [text, synth]);

  if (!text) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground italic font-headline">The shadow is listening...</p>
      </div>
    );
  }

  return (
    <p className="font-headline text-lg sm:text-xl leading-relaxed whitespace-pre-wrap">
      {displayedText}
      <span className="animate-ping">_</span>
    </p>
  );
}
