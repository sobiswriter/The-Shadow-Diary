"use client";

import { useState, useRef, useCallback, useEffect, ReactNode } from "react";

interface PageTurnBookProps {
    frontContent: ReactNode;
    backContent: ReactNode;
    onTurnToBack?: () => void;
    onTurnToFront?: () => void;
    isFlipped?: boolean;
    disabled?: boolean;
    className?: string;
}

export function PageTurnBook({
    frontContent,
    backContent,
    onTurnToBack,
    onTurnToFront,
    isFlipped: controlledFlipped,
    disabled = false,
    className = "",
}: PageTurnBookProps) {
    const [internalFlipped, setInternalFlipped] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragProgress, setDragProgress] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef(0);
    const startTimeRef = useRef(0);

    // Use controlled state if provided, otherwise internal state
    const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

    const flipToBack = useCallback(() => {
        if (disabled || isAnimating) return;

        setIsAnimating(true);
        if (controlledFlipped === undefined) {
            setInternalFlipped(true);
        }
        onTurnToBack?.();

        // Reset animation lock after transition completes
        setTimeout(() => setIsAnimating(false), 1200);
    }, [disabled, isAnimating, controlledFlipped, onTurnToBack]);

    const flipToFront = useCallback(() => {
        if (disabled || isAnimating) return;

        setIsAnimating(true);
        if (controlledFlipped === undefined) {
            setInternalFlipped(false);
        }
        onTurnToFront?.();

        setTimeout(() => setIsAnimating(false), 1200);
    }, [disabled, isAnimating, controlledFlipped, onTurnToFront]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (disabled) return;

            if (e.key === "ArrowRight" && !isFlipped) {
                flipToBack();
            } else if (e.key === "ArrowLeft" && isFlipped) {
                flipToFront();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [disabled, isFlipped, flipToBack, flipToFront]);

    // Touch/Mouse event handlers for swipe gestures
    const handleDragStart = useCallback((clientX: number) => {
        if (disabled || isAnimating) return;

        setIsDragging(true);
        startXRef.current = clientX;
        startTimeRef.current = Date.now();
        setDragProgress(0);
    }, [disabled, isAnimating]);

    const handleDragMove = useCallback((clientX: number) => {
        if (!isDragging || !containerRef.current) return;

        const containerWidth = containerRef.current.offsetWidth;
        const deltaX = startXRef.current - clientX;

        // Calculate progress based on drag direction
        let progress: number;
        if (!isFlipped) {
            // Dragging left to flip forward
            progress = Math.max(0, Math.min(1, deltaX / (containerWidth * 0.5)));
        } else {
            // Dragging right to flip back
            progress = Math.max(0, Math.min(1, -deltaX / (containerWidth * 0.5)));
        }

        setDragProgress(progress);
    }, [isDragging, isFlipped]);

    const handleDragEnd = useCallback((clientX: number) => {
        if (!isDragging) return;

        const deltaX = startXRef.current - clientX;
        const deltaTime = Date.now() - startTimeRef.current;
        const velocity = Math.abs(deltaX) / deltaTime;

        // Thresholds for triggering flip
        const distanceThreshold = 80;
        const velocityThreshold = 0.3;
        const progressThreshold = 0.3;

        const shouldFlip =
            Math.abs(deltaX) > distanceThreshold ||
            velocity > velocityThreshold ||
            dragProgress > progressThreshold;

        if (shouldFlip) {
            if (!isFlipped && deltaX > 0) {
                flipToBack();
            } else if (isFlipped && deltaX < 0) {
                flipToFront();
            }
        }

        setIsDragging(false);
        setDragProgress(0);
    }, [isDragging, isFlipped, dragProgress, flipToBack, flipToFront]);

    // Helper to check if event target is an interactive element
    const isInteractiveElement = (target: EventTarget | null): boolean => {
        if (!target || !(target instanceof HTMLElement)) return false;
        const interactiveTags = ['INPUT', 'TEXTAREA', 'BUTTON', 'A', 'SELECT'];
        return interactiveTags.includes(target.tagName) ||
            target.isContentEditable ||
            target.closest('input, textarea, button, a, select, [contenteditable="true"]') !== null;
    };

    // Mouse events - only handle drag on non-interactive elements
    const handleMouseDown = (e: React.MouseEvent) => {
        // Don't capture events on interactive elements
        if (isInteractiveElement(e.target)) return;

        e.preventDefault();
        handleDragStart(e.clientX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        handleDragMove(e.clientX);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!isDragging) return;
        handleDragEnd(e.clientX);
    };

    const handleMouseLeave = (e: React.MouseEvent) => {
        if (isDragging) {
            handleDragEnd(e.clientX);
        }
    };

    // Touch events - only handle on non-interactive elements
    const handleTouchStart = (e: React.TouchEvent) => {
        // Don't capture events on interactive elements
        if (isInteractiveElement(e.target)) return;

        handleDragStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        handleDragMove(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!isDragging) return;
        handleDragEnd(e.changedTouches[0].clientX);
    };

    // Calculate rotation based on flip state and drag progress
    const getRotation = () => {
        if (isDragging) {
            if (!isFlipped) {
                return -180 * dragProgress;
            } else {
                return -180 + (180 * dragProgress);
            }
        }
        return isFlipped ? -180 : 0;
    };

    const rotation = getRotation();

    return (
        <div
            ref={containerRef}
            className={`book-container ${className}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ cursor: disabled ? "default" : "grab" }}
        >
            <div className="book-wrapper">
                {/* The flipping page */}
                <div
                    className="page-3d"
                    style={{
                        transform: `rotateY(${rotation}deg)`,
                        transition: isDragging ? "none" : "transform 1.2s cubic-bezier(0.645, 0.045, 0.355, 1.000)",
                    }}
                >
                    {/* Front of page (user entry) */}
                    <div className="page-face page-front">
                        {frontContent}
                    </div>

                    {/* Back of page (shadow response) */}
                    <div className="page-face page-back">
                        {backContent}
                    </div>
                </div>

                {/* Dynamic shadow during flip */}
                <div
                    className="page-flip-shadow"
                    style={{
                        opacity: Math.abs(rotation) > 10 && Math.abs(rotation) < 170 ? 0.3 : 0,
                        transition: isDragging ? "none" : "opacity 0.3s ease",
                    }}
                />

                {/* Page corner curl indicator (only when not flipped) */}
                {!isFlipped && !isDragging && !disabled && (
                    <div
                        className="page-corner"
                        onClick={(e) => {
                            e.stopPropagation();
                            flipToBack();
                        }}
                    />
                )}

                {/* Back button indicator (only when flipped) */}
                {isFlipped && !isDragging && !disabled && (
                    <div
                        className="page-corner-back"
                        onClick={(e) => {
                            e.stopPropagation();
                            flipToFront();
                        }}
                    />
                )}
            </div>
        </div>
    );
}
