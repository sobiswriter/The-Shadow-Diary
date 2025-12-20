"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
    content: string;
    speed?: number; // ms per char
    className?: string;
}

export function TypewriterText({ content, speed = 15, className }: TypewriterTextProps) {
    const [displayedContent, setDisplayedContent] = useState("");

    // Simple HTML stripping for counting/typing or just safe rendering?
    // If we type raw HTML tags, it looks bad. 
    // But 'content' here is usually HTML from the Shadow Analysis (<div class="shadow-analysis"><p>...</p></div>).
    // If we type char-by-char on HTML string, we break tags.
    // So we must simply fade it in, OR render the final HTML and Typewrite the TEXT nodes.
    // Complexity: High.

    // Alternative: Just simple text typing. Shadow Analysis is mostly text.
    // Let's strip tags for specific visuals? No, we want paragraphs.

    // Easier approach for "Legacy" feel:
    // Render the HTML fully, but use CSS animation to reveal it?
    // Or logic: Parse HTML -> Typewriter Text Nodes.

    // Let's try the CSS 'reveal' approach or a simple text-only typewriter if content is simple.
    // Actually, the previous step wraps it in `<div class="shadow-analysis">...</div>`.

    // For now, let's treat it as *text* if possible, or render deeply.
    // Let's assume content is the *raw string* from AI if we can, but we saved HTML.

    // Hack: Just display it. The user said "typing stuff".
    // Let's implement a simple text-reveal if it's just text.
    // If it contains tags, let's render it normally but maybe animate opacity of paragraphs.

    // Let's go with formatted HTML rendering but animate the container.
    // Wait, user explicitly said "typing stuff".

    // Let's try to type it.
    // If we use `dangerouslySetInnerHTML`, checking completion.

    useEffect(() => {
        if (!content) {
            setDisplayedContent("");
            return;
        }

        setDisplayedContent("");

        let currentIndex = 0;
        const fullContent = content;

        // This is a complex typing effect for HTML.
        // To avoid breaking tags, we can either:
        // 1. Progressively reveal the string but only update state when not inside a tag.
        // 2. Or simply use a CSS-based reveal (cleaner for complex HTML).

        // Let's implement a logical typewriter that skips tags.
        const interval = setInterval(() => {
            if (currentIndex >= fullContent.length) {
                clearInterval(interval);
                return;
            }

            // Find the next "safe" point to stop (not in the middle of a tag)
            let nextIndex = currentIndex + 1;

            // If we are starting a tag, find the end of it
            if (fullContent[currentIndex] === '<') {
                while (nextIndex < fullContent.length && fullContent[nextIndex] !== '>') {
                    nextIndex++;
                }
                nextIndex++; // Include the closing '>'
            }

            setDisplayedContent(fullContent.slice(0, nextIndex));
            currentIndex = nextIndex;
        }, speed);

        return () => clearInterval(interval);
    }, [content, speed]);

    return (
        <div
            className={`font-mono leading-relaxed ${className}`}
            dangerouslySetInnerHTML={{ __html: displayedContent }}
        />
    );
}
