"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TwoPageBookProps {
    leftContent: React.ReactNode;
    rightContent: React.ReactNode;
    className?: string;
    turningDirection?: "next" | "prev" | null;
    onAnimationComplete?: () => void;
    onLeftClick?: () => void;
    onRightClick?: () => void;
    onBookmarkClick?: () => void;
    bookState?: "closed" | "opening" | "open";
}

export function TwoPageBook({
    leftContent,
    rightContent,
    className,
    turningDirection = null,
    onAnimationComplete,
    onLeftClick,
    onRightClick,
    onBookmarkClick,
    bookState = "open",
}: TwoPageBookProps) {
    const [prevLeft, setPrevLeft] = useState<React.ReactNode>(null);
    const [prevRight, setPrevRight] = useState<React.ReactNode>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    // Store content to refs to manage snapshots
    const currentLeftRef = useRef(leftContent);
    const currentRightRef = useRef(rightContent);

    useEffect(() => {
        if (turningDirection && !isAnimating) {
            setPrevLeft(currentLeftRef.current);
            setPrevRight(currentRightRef.current);
            setIsAnimating(true);

            const timer = setTimeout(() => {
                setIsAnimating(false);
                if (onAnimationComplete) onAnimationComplete();
            }, 1000);

            return () => clearTimeout(timer);
        }

        if (!isAnimating) {
            currentLeftRef.current = leftContent;
            currentRightRef.current = rightContent;
        }
    }, [turningDirection, leftContent, rightContent, onAnimationComplete]);

    // Derived content for layers
    let baseLeft = leftContent;
    let baseRight = rightContent;

    let flipperFront = null;
    let flipperBack = null;

    if (isAnimating && turningDirection === "next") {
        baseLeft = prevLeft;
        baseRight = rightContent;
        flipperFront = prevRight;
        flipperBack = leftContent;
    } else if (isAnimating && turningDirection === "prev") {
        baseLeft = leftContent;
        baseRight = prevRight;
        flipperFront = rightContent;
        flipperBack = prevLeft;
    }

    // Centering Logic check:
    // If bookState is "closed", we want to shift the book so the Right Page (Cover) is centered.
    // The book width is e.g. 1000px. Left is 500, Right is 500.
    // Center of book is at 500.
    // To center Right Page (at 750 center relative to book), we move -25% of width?
    // Left edge = 0. Center = 50%.
    // Right Page center is at 75%.
    // We want 75% point to be at viewport 50%.
    // So translate X by -25%.

    const translateClass = bookState === "closed"
        ? "translate-x-[-25%]"
        : "translate-x-0";

    return (
        <div className={cn("perspective-[2000px] w-full h-full flex justify-center items-center select-none", className)}>
            <div className={cn(
                "relative flex w-full h-full max-w-6xl transition-transform duration-1000 ease-in-out bg-transparent",
                translateClass
            )}>

                {/* Traditional Weathered Spine */}
                <div className="absolute left-1/2 top-0 bottom-0 w-14 -ml-7 z-40 pointer-events-none">
                    <div className="h-full w-full bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 shadow-inner relative overflow-hidden">
                        {/* Frayed Edges Detail */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-transparent to-neutral-800/20" style={{ clipPath: 'polygon(0 0, 10% 50%, 20% 0, 30% 60%, 40% 0, 50% 55%, 60% 0, 70% 65%, 80% 0, 90% 50%, 100% 0, 100% 100%, 0 100%)' }} />
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-transparent to-neutral-800/20" style={{ clipPath: 'polygon(0 100%, 10% 50%, 20% 100%, 30% 40%, 40% 100%, 50% 45%, 60% 100%, 70% 35%, 80% 100%, 90% 50%, 100% 100%, 100% 0, 0 0)' }} />

                        {/* Spine Creases */}
                        <div className="absolute inset-y-0 left-2 w-px bg-white/5 shadow-sm" />
                        <div className="absolute inset-y-0 right-2 w-px bg-white/5 shadow-sm" />

                        {/* Wear and Tear */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,0,0,0)_0%,_rgba(0,0,0,0.8)_100%)]" />
                    </div>
                </div>

                {/* LEFT BASE PAGE */}
                <div
                    className={cn(
                        "w-1/2 h-full bg-transparent relative overflow-hidden rounded-l-md border-r border-white/5 z-0",
                    )}
                >
                    {/* Left Page Touch Zone - Navigates Prev */}
                    {!isAnimating && onLeftClick && (
                        <div
                            className="absolute top-0 left-0 w-16 h-full z-20 cursor-pointer hover:bg-white/5 transition-colors group"
                            onClick={onLeftClick}
                            title="Previous Page"
                        >
                            {/* Subtle indicator content could go here */}
                        </div>
                    )}

                    {baseLeft && (
                        <>
                            <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none z-10 mix-blend-multiply" />
                            {baseLeft}
                        </>
                    )}
                </div>

                {/* RIGHT BASE PAGE */}
                <div
                    className={cn(
                        "w-1/2 h-full bg-transparent relative overflow-hidden rounded-r-md border-l border-white/5 z-0",
                    )}
                >
                    {/* Right Page Touch Zone - Navigates Next */}
                    {!isAnimating && onRightClick && (
                        <div
                            className="absolute top-0 right-0 w-16 h-full z-20 cursor-pointer hover:bg-white/5 transition-colors group"
                            onClick={onRightClick}
                            title="Next Page"
                        >
                            {/* Subtle indicator content could go here */}
                        </div>
                    )}

                    {baseRight && (
                        <>
                            <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10 mix-blend-multiply" />
                            {baseRight}
                        </>
                    )}
                </div>

                {/* BOOKMARK RIBBON (Quick Close) */}
                {/* Only visible when book is open */}
                {bookState === "open" && onBookmarkClick && (
                    <div
                        className="absolute -top-12 right-16 z-50 cursor-pointer group transition-all duration-500 hover:top-[-4px] opacity-20 hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            onBookmarkClick();
                        }}
                        title="Close Diary"
                    >
                        <div className="w-8 h-32 bg-zinc-200/10 shadow-lg backdrop-blur-[2px] relative flex flex-col items-center justify-end pb-4 border-x border-white/5 group-hover:bg-zinc-100/20 transition-colors">
                            {/* Stitching detail */}
                            <div className="absolute top-0 bottom-0 left-1 w-px border-l border-dashed border-white/10" />
                            <div className="absolute top-0 bottom-0 right-1 w-px border-r border-dashed border-white/10" />

                            {/* Bottom triangle cut */}
                            <div className="absolute bottom-0 w-full h-8 bg-[#1a1a1a]" style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} />
                        </div>
                    </div>
                )}

                {/* FLIPPER OVERLAY */}
                {isAnimating && turningDirection && (
                    <div
                        className={cn(
                            "absolute right-0 top-0 w-1/2 h-full z-20 origin-left preserve-3d transition-transform duration-1000 ease-in-out",
                        )}
                        style={{
                            transformStyle: "preserve-3d",
                            animation: turningDirection === "next" ? "flipNext 1s forwards" : "flipPrev 1s forwards",
                        }}
                    >
                        {/* Front Face (Recto) - The side facing right initially */}
                        <div className="absolute inset-0 w-full h-full bg-[#1a1a1a] backface-hidden z-20 rounded-r-md overflow-hidden border-l border-white/5 shadow-[10px_0_20px_rgba(0,0,0,0.5)_inset]">
                            {flipperFront && (
                                <>
                                    <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10 mix-blend-multiply" />
                                    {flipperFront}
                                </>
                            )}
                        </div>

                        {/* Back Face (Verso) - The side facing left initially (rotated 180) */}
                        <div
                            className="absolute inset-0 w-full h-full bg-[#1a1a1a] backface-hidden z-10 rounded-l-md overflow-hidden border-r border-white/5 shadow-[-10px_0_20px_rgba(0,0,0,0.5)_inset]"
                            style={{ transform: "rotateY(180deg)" }}
                        >
                            {flipperBack && (
                                <>
                                    <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none z-10 mix-blend-multiply" />
                                    {flipperBack}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .perspective-book {
                    perspective: 2500px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                @keyframes flipNext {
                    from { transform: rotateY(0deg); }
                    to { transform: rotateY(-180deg); }
                }
                @keyframes flipPrev {
                    from { transform: rotateY(-180deg); }
                    to { transform: rotateY(0deg); }
                }
            `}</style>
        </div >
    );
}
