"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

interface CombinationLockProps {
    combination: string;
    onUnlock: () => void;
    className?: string;
    isMuted?: boolean;
    triggerShake?: number; // Increment to trigger shake
}

export function CombinationLock({
    combination,
    onUnlock,
    className,
    isMuted = false,
    triggerShake = 0,
}: CombinationLockProps) {
    const [digits, setDigits] = useState([0, 0, 0, 0]);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    // Watch for external shake triggers
    useEffect(() => {
        if (triggerShake > 0) {
            setIsShaking(true);
            const timer = setTimeout(() => setIsShaking(false), 500);
            return () => clearTimeout(timer);
        }
    }, [triggerShake]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            // Mechanical click sound
            const clickSound = new Audio("https://www.soundjay.com/mechanical/sounds/mechanical-clonk-1.mp3");
            clickSound.volume = 0.2;
            setAudio(clickSound);
        }
    }, []);

    const playClick = useCallback(() => {
        if (!isMuted && audio) {
            const sound = audio.cloneNode() as HTMLAudioElement;
            sound.volume = 0.15;
            sound.play().catch(() => { });
        }
    }, [audio, isMuted]);

    const changeDigit = (index: number, direction: 'up' | 'down') => {
        if (isUnlocking) return;

        const newDigits = [...digits];
        if (direction === 'up') {
            newDigits[index] = (newDigits[index] + 1) % 10;
        } else {
            newDigits[index] = (newDigits[index] - 1 + 10) % 10;
        }

        setDigits(newDigits);
        playClick();

        // Check unlock
        if (newDigits.join("") === combination) {
            setIsUnlocking(true);
            setTimeout(onUnlock, 500);
        }
    };

    return (
        <div className={cn("flex flex-col items-center", className)}>
            {/* Lock Housing */}
            <div className={cn(
                "relative flex items-center gap-1 p-3 rounded-md shadow-2xl transition-all duration-300", // Smoother duration
                // Textured Metal Background
                "bg-[#1a1a1a]",
                "border border-white/5",
                "shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.05)]",
                isUnlocking && "translate-y-1 opacity-50",
                isShaking && "animate-shake border-red-900/50" // Visual red tint on error
            )}
                style={{
                    // Rust Overlay
                    backgroundImage: `
                    radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%),
                    url("https://www.transparenttextures.com/patterns/black-scales.png")
                `,
                }}>

                {/* Metallic Bracket Screws (Visual) */}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-neutral-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)]" />
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-neutral-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)]" />

                {digits.map((digit, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 relative z-10">
                        {/* Up Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); changeDigit(i, 'up'); }}
                            className="text-neutral-600 hover:text-amber-700/80 transition-colors p-1 active:translate-y-px"
                        >
                            <ChevronUp className="w-3 h-3" strokeWidth={3} />
                        </button>

                        {/* Roller Window */}
                        <div className="w-8 h-10 bg-black rounded-sm border-x border-neutral-800 relative overflow-hidden flex items-center justify-center shadow-[inset_0_4px_8px_rgba(0,0,0,0.9)]">
                            {/* Metallic Roller Texture */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-800 to-black opacity-80" />

                            {/* The Number - Debossed Look */}
                            <span className={cn(
                                "relative z-10 font-serif text-xl font-bold text-neutral-400 select-none",
                                "drop-shadow-[0_1px_0_rgba(255,255,255,0.1)]",
                                isUnlocking && "text-amber-500/50"
                            )} style={{
                                textShadow: '0 -1px 1px rgba(0,0,0,1)'
                            }}>
                                {digit}
                            </span>
                        </div>

                        {/* Down Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); changeDigit(i, 'down'); }}
                            className="text-neutral-600 hover:text-amber-700/80 transition-colors p-1 active:translate-y-px"
                        >
                            <ChevronDown className="w-3 h-3" strokeWidth={3} />
                        </button>
                    </div>
                ))}

            </div>

            {/* Label engraved below */}
            <div className="mt-2 text-[8px] font-serif tracking-[0.2em] text-neutral-600 opacity-60 uppercase">
                Secured
            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                    20%, 40%, 60%, 80% { transform: translateX(2px); }
                }
                .animate-shake {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
}
