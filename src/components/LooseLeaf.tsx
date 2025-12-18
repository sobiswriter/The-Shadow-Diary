"use client";

import React, { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LooseLeafProps {
    content: string;
    onClose: () => void;
    className?: string;
    isVisible: boolean;
}

export function LooseLeaf({ content, onClose, className, isVisible }: LooseLeafProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!isVisible && !content) return null;

    return (
        <div
            className={cn(
                "absolute transition-all duration-700 ease-in-out cursor-pointer z-30",
                // Positioned naturally on the page
                isExpanded
                    ? "inset-4 z-50 transform-none"
                    : "top-10 right-10 w-64 rotate-3 hover:rotate-0 hover:scale-105",
                // Entrance animation
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10 pointer-events-none",
                className
            )}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div
                className={cn(
                    "relative bg-[#f0e6d2] text-neutral-900 shadow-xl overflow-hidden transition-all duration-500",
                    !isExpanded && "rounded-sm",
                    isExpanded ? "p-12 shadow-2xl rounded-sm" : "p-4"
                )}
                style={{
                    // Parchment texture effect
                    backgroundImage: `url("https://www.transparenttextures.com/patterns/aged-paper.png"), linear-gradient(to bottom right, #e8dfc8, #f5ecd9)`,
                    boxShadow: "5px 5px 15px rgba(0,0,0,0.3), inset 0 0 20px rgba(139, 69, 19, 0.1)",
                    transform: isExpanded ? 'none' : 'rotate(2deg)'
                }}
            >
                {/* Ragged edges effect (visual only, simple borders for now) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-neutral-900/10" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-neutral-900/10" />

                {/* Header / Dismiss */}
                <div className="flex justify-between items-start mb-2">
                    <div className={cn("text-xs font-serif text-red-900/60 uppercase tracking-widest", isExpanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden")}>
                        The Shadow Speaks
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="text-neutral-500 hover:text-red-900 transition-colors p-1"
                        title="Dismiss Note"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className={cn(
                    "font-handwriting text-neutral-800 leading-relaxed",
                    isExpanded ? "text-xl" : "text-xs line-clamp-3 opacity-70"
                )} style={{ fontFamily: '"Caveat", cursive' }}>
                    {content}
                </div>

                {/* Decorative footer */}
                {isExpanded && (
                    <div className="mt-8 flex justify-center">
                        <Sparkles className="h-4 w-4 text-red-900/20" />
                    </div>
                )}
            </div>
        </div>
    );
}
