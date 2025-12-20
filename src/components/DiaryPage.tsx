"use client";

import { useEffect, useState, useRef } from "react";
import { formatDate } from "@/lib/utils";
import { HauntedEditor } from "./HauntedEditor";
import { TypewriterText } from "./TypewriterText";

interface DiaryPageProps {
    pageNumber: number;
    content: string;
    onContentChange: (content: string) => void;
    isEditable?: boolean;
    showDate?: boolean;
    date?: Date;
    customDate?: string;
    onDateChange?: (date: string) => void;
    onPause?: () => void;
    suggestion?: string | null;
    onAcceptSuggestion?: () => void;
    onDiscardSuggestion?: () => void;
    isMuted?: boolean;
}

export function DiaryPage({
    pageNumber,
    content,
    onContentChange,
    isEditable = true,
    showDate = true,
    date = new Date(),
    customDate,
    onDateChange,
    onPause,
    suggestion,
    onAcceptSuggestion,
    onDiscardSuggestion,
    isMuted,
}: DiaryPageProps) {
    const [localContent, setLocalContent] = useState(content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [shadowTypingComplete, setShadowTypingComplete] = useState(false);

    // Initial display date: use customDate if exists, else format the date prop
    const [displayDate, setDisplayDate] = useState(customDate || formatDate(date));

    // Reset stamp and sync content when page or content changes
    useEffect(() => {
        setLocalContent(content);
        if (pageNumber % 2 === 0) {
            setShadowTypingComplete(false);
        }
    }, [content, pageNumber]);

    useEffect(() => {
        // When prop customDate updates (e.g. navigation), sync local state
        // If no customDate from prop, default to formatted date
        setDisplayDate(customDate || formatDate(date));
    }, [customDate, date]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setLocalContent(newContent);
        onContentChange(newContent);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setDisplayDate(newDate);
        if (onDateChange) {
            onDateChange(newDate);
        }
    };

    return (
        <div className="h-full diary-page-container relative flex flex-col overflow-hidden">
            {/* Page header with editable date */}
            {showDate && (
                <div className="diary-page-header px-8 pt-6 pb-4">
                    <input
                        type="text"
                        value={displayDate}
                        onChange={handleDateChange}
                        disabled={!isEditable}
                        placeholder={formatDate(new Date())}
                        className="text-sm font-headline text-muted-foreground/70 bg-transparent border-none focus:outline-none focus:ring-0 w-full placeholder:text-muted-foreground/30"
                    />
                </div>
            )}

            {/* Main content area with ruled lines */}
            <div className="flex-grow relative diary-page-content px-8 pb-8 overflow-hidden flex flex-col">
                {/* Left margin indicator */}
                <div className="diary-margin absolute left-12 top-0 bottom-0 w-px bg-accent/20 h-full" />

                {/* Content Area */}
                {pageNumber % 2 === 0 ? (
                    /* Shadow Page (Read Only, Archival Document Style) */
                    <div className="px-12 md:px-16 pt-12 h-full relative overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto diary-scrollbar pr-2 mb-16 distressed-typewriter select-none">
                            <TypewriterText
                                content={localContent}
                                speed={40}
                                onComplete={() => setShadowTypingComplete(true)}
                                isMuted={isMuted}
                            />
                        </div>

                        {/* Archival Stamp (Delayed) */}
                        <div className={`absolute bottom-12 right-12 z-20 transition-all duration-1000 transform ${shadowTypingComplete ? 'opacity-70 scale-100 rotate-[-5deg]' : 'opacity-0 scale-110 rotate-0'}`}>
                            <div className="shadow-mirror-stamp">
                                [DIAGNOSIS COMPLETE]
                            </div>
                        </div>
                    </div>
                ) : (
                    /* User Page (Editable, Haunted) */
                    <div className="flex-1 overflow-y-auto diary-scrollbar">
                        <HauntedEditor
                            content={localContent}
                            onContentChange={(newContent) => {
                                setLocalContent(newContent);
                                onContentChange(newContent);
                            }}
                            onPause={onPause}
                            suggestion={suggestion}
                            onAcceptSuggestion={onAcceptSuggestion}
                            onDiscardSuggestion={onDiscardSuggestion}
                            disabled={!isEditable}
                            className="pl-8 diary-ruled-lines min-h-full"
                            placeholder={pageNumber === 1 ? "Dear Diary..." : "Continue writing..."}
                        />
                    </div>
                )}
            </div>

            {/* Page number footer */}
            <div className="diary-page-footer absolute bottom-4 right-8 z-20">
                <span className="text-xs font-headline text-muted-foreground/50">
                    {pageNumber}
                </span>
            </div>
        </div>
    );
}
