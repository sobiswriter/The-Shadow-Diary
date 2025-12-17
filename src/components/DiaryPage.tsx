"use client";

import { useEffect, useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";

interface DiaryPageProps {
    pageNumber: number;
    content: string;
    onContentChange: (content: string) => void;
    isEditable?: boolean;
    showDate?: boolean;
    date?: Date;
    customDate?: string;
    onDateChange?: (date: string) => void;
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
}: DiaryPageProps) {
    const [localContent, setLocalContent] = useState(content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initial display date: use customDate if exists, else format the date prop
    const [displayDate, setDisplayDate] = useState(customDate || formatDate(date));

    useEffect(() => {
        setLocalContent(content);
    }, [content]);

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
        <div className="h-full diary-page-container relative flex flex-col">
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
            <div className="flex-grow relative diary-page-content px-8 pb-8">
                {/* Left margin indicator */}
                <div className="diary-margin absolute left-12 top-0 bottom-0 w-px bg-accent/20" />

                {/* Content textarea */}
                <Textarea
                    ref={textareaRef}
                    value={localContent}
                    onChange={handleChange}
                    placeholder={pageNumber === 1 ? "Dear Diary..." : "Continue writing..."}
                    disabled={!isEditable}
                    className="
            w-full h-full
            bg-transparent
            border-none
            focus-visible:ring-0 
            focus-visible:ring-offset-0
            text-base leading-[36px]
            resize-none
            p-0
            pl-8
            font-body
            text-foreground/90
            placeholder:text-muted-foreground/40
            diary-ruled-lines
          "
                />
            </div>

            {/* Page number footer */}
            <div className="diary-page-footer absolute bottom-4 right-8">
                <span className="text-xs font-headline text-muted-foreground/50">
                    {pageNumber}
                </span>
            </div>
        </div>
    );
}
