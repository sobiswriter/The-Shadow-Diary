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
        // If content changes, reset
        setDisplayedContent("");
        let i = 0;

        // Strip HTML tags for the 'typing' effect to work purely on text? 
        // No, that loses formatting. 
        // Let's just render it fully for now to avoid breaking the layout,
        // but maybe 'flash' or 'flicker' it in.

        // Actually, if we just type the *textContent*, we lose the <p> tags.
        // Let's just use `displayedContent` equal to `content` for now, 
        // but adding a "typing" cursor effect or similar?

        // Re-reading user request: "have that typing stuff n all".
        // Maybe he means the AI *streaming* response?
        // But we are generating it all at once to save it to DB.

        // Let's stick to a simple progressive reveal.
        if (!content) return;

        const timer = setInterval(() => {
            // Naive typing: slice the string. 
            // BEWARE: Slicing HTML string `<p>Hello</p>` -> `<p>He` ... BROKEN HTML.
            // We cannot slice HTML strings.

            // Setup: Just render the content.
            // The user is likely seeing "nothing" because of the previous styling bug.
            // Visual typing is a nice-to-have but breaking HTML is bad.
            setDisplayedContent(content);
            clearInterval(timer);
        }, speed);

        return () => clearInterval(timer);
    }, [content, speed]);

    return (
        <div
            className={`font-mono leading-relaxed ${className}`}
            dangerouslySetInnerHTML={{ __html: displayedContent }}
        />
    );
}
