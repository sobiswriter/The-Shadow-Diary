"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface HauntedEditorProps {
    content: string;
    onContentChange: (newContent: string) => void;
    onPause?: () => void;
    suggestion?: string | null; // The ghost text to display
    onAcceptSuggestion?: () => void; // Called when user hits Tab
    onDiscardSuggestion?: () => void; // Called when user types something else
    pauseDuration?: number;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
}

export function HauntedEditor({
    content,
    onContentChange,
    onPause,
    suggestion,
    onAcceptSuggestion,
    onDiscardSuggestion,
    pauseDuration = 3000,
    disabled = false,
    className,
    placeholder,
}: HauntedEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);
    const insertedSuggestionRef = useRef<HTMLElement | null>(null);

    // Sync content (only if not typing)
    useEffect(() => {
        if (editorRef.current && content !== editorRef.current.innerHTML && !isTypingRef.current) {
            // If we are syncing external content, we might lose the cursor.
            // This usually happens on load or if parent forces update.
            editorRef.current.innerHTML = content;
        }
    }, [content]);

    // Handle Suggestion rendering (Imperative DOM manipulation)
    useEffect(() => {
        if (!editorRef.current || !suggestion) return;

        // If we already have a suggestion displayed, don't double up unless it changed
        // For simplicity, always remove old one first
        removeGhostSpan();

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);

        // Check if cursor is inside our editor
        if (!editorRef.current.contains(range.commonAncestorContainer)) return;

        // Create the ghost span
        const span = document.createElement("span");
        span.className = "ghost-suggestion pointer-events-none select-none text-muted-foreground/50 italic";
        span.contentEditable = "false";
        span.innerText = suggestion;
        span.dataset.ghost = "true";

        // Insert at cursor
        range.insertNode(span);

        // Move cursor back to BEFORE the span (so user types "over" it or sees it ahead)
        // Wait, VS Code style: Cursor is at start of ghost text.
        // User types -> Ghost disappears.
        // Tab -> Ghost becomes real.

        // Correct behavior: Cursor stays *before* the span.
        range.setStartBefore(span);
        range.setEndBefore(span);
        selection.removeAllRanges();
        selection.addRange(range);

        insertedSuggestionRef.current = span;

        // Cleanup on unmount or change
        return () => {
            // We generally handle cleanup via keydown/input, but here just in case?
            // No, don't auto-remove on unmount of effect, as that flickers.
        };
    }, [suggestion]);

    const removeGhostSpan = () => {
        if (insertedSuggestionRef.current && insertedSuggestionRef.current.parentNode) {
            insertedSuggestionRef.current.remove();
            insertedSuggestionRef.current = null;
        }
        // Also cleanup any strays
        if (editorRef.current) {
            const ghosts = editorRef.current.querySelectorAll('[data-ghost="true"]');
            ghosts.forEach(g => g.remove());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (insertedSuggestionRef.current) {
            if (e.key === "Tab") {
                e.preventDefault();
                // Accept: Make it real text
                const text = insertedSuggestionRef.current.innerText;
                removeGhostSpan();

                // Insert text at current cursor
                document.execCommand("insertText", false, text);

                if (onAcceptSuggestion) onAcceptSuggestion();
                return;
            } else if (e.key !== "Shift" && e.key !== "Control" && e.key !== "Alt" && e.key !== "Meta") {
                // Any other key (that produces text or moves cursor significantly) kills the ghost
                // We let the event proceed, but remove ghost first
                removeGhostSpan();
                if (onDiscardSuggestion) onDiscardSuggestion();
            }
        }
    };

    const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
        // If we typed, ghost is likely gone (removed by keydown) or needs to be removed
        removeGhostSpan();
        if (onDiscardSuggestion) onDiscardSuggestion();

        const newHtml = e.currentTarget.innerHTML;
        onContentChange(newHtml);
        isTypingRef.current = true;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (onPause) {
            timeoutRef.current = setTimeout(() => {
                isTypingRef.current = false;
                onPause();
            }, pauseDuration);
        }
    }, [onContentChange, onPause, pauseDuration, onDiscardSuggestion]);

    return (
        <div
            ref={editorRef}
            contentEditable={!disabled}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onBlur={() => { isTypingRef.current = false; }}
            className={cn(
                "w-full h-full outline-none focus:outline-none whitespace-pre-wrap",
                "font-body text-base leading-[36px] text-foreground/90",
                "empty:before:content-[attr(placeholder)] empty:before:text-muted-foreground/40",
                className
            )}
            placeholder={placeholder}
            spellCheck={false}
            style={{ minHeight: "100%" }}
        />
    );
}
