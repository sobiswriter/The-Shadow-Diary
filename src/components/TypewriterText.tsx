"use client";

import { useState, useEffect, useMemo, useRef } from "react";

interface TypewriterTextProps {
    content: string;
    speed?: number; // ms per char
    className?: string;
    onComplete?: () => void;
    isMuted?: boolean;
}

export function TypewriterText({ content, speed = 30, className, onComplete, isMuted }: TypewriterTextProps) {
    const [displayedContent, setDisplayedContent] = useState("");
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize audio only once
        if (typeof window !== "undefined") {
            // Using a softer, more "thocky" typewriter sound
            const audio = new Audio("https://www.soundjay.com/communication/typewriter-key-3.mp3");
            audio.volume = 0.1;
            audioRef.current = audio;
        }
    }, []);

    const processedContent = useMemo(() => {
        if (!content) return "";

        // Simple heuristic: find words and randomly redact 1-2 of them.
        // We only redact plain text words to avoid breaking HTML structure.
        const parts = content.split(/(<[^>]*>)/);
        let redactionCount = 0;
        const maxRedactions = 2;

        const results = parts.map(part => {
            if (part.startsWith('<')) return part;

            // In text parts, find candidate words (length > 5)
            const words = part.split(/\b/);
            return words.map(word => {
                if (word.length > 5 && redactionCount < maxRedactions && Math.random() > 0.8) {
                    redactionCount++;
                    return `<span class="redacted">${word}</span>`;
                }
                return word;
            }).join('');
        });

        return results.join('');
    }, [content]);

    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (!processedContent) {
            setDisplayedContent("");
            return;
        }

        setDisplayedContent("");

        let currentIndex = 0;
        const fullContent = processedContent;

        const interval = setInterval(() => {
            if (currentIndex >= fullContent.length) {
                clearInterval(interval);
                onCompleteRef.current?.();
                return;
            }

            let nextIndex = currentIndex + 1;

            if (fullContent[currentIndex] === '<') {
                while (nextIndex < fullContent.length && fullContent[nextIndex] !== '>') {
                    nextIndex++;
                }
                nextIndex++;
            }

            // Play sound if not muted
            if (!isMuted && audioRef.current && nextIndex > currentIndex) {
                const sound = audioRef.current.cloneNode() as HTMLAudioElement;
                sound.volume = 0.02;
                sound.play().catch(() => { });
            }

            setDisplayedContent(fullContent.slice(0, nextIndex));
            currentIndex = nextIndex;
        }, speed);

        return () => clearInterval(interval);
    }, [processedContent, speed, isMuted]);

    return (
        <div
            className={`font-mono leading-relaxed ${className}`}
            dangerouslySetInnerHTML={{ __html: displayedContent }}
        />
    );
}
