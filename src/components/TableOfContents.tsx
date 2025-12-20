"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/lib/utils";
import { type DiaryPage } from "@/lib/diary";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
    pages: DiaryPage[];
    onNavigate: (pageNumber: number) => void;
}

export function TableOfContents({ pages, onNavigate }: TableOfContentsProps) {
    // Sort pages by page number just in case
    const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);

    return (
        <div className="h-full diary-page-container relative flex flex-col">
            {/* Header */}
            <div className="diary-page-header px-8 pt-8 pb-4 text-center">
                <h2 className="text-2xl font-serif font-bold text-foreground/80 tracking-wider">Contents</h2>
                <div className="w-16 h-px bg-foreground/20 mx-auto mt-4" />
            </div>

            {/* Scrollable List */}
            <div className="flex-grow relative px-8 pb-8 overflow-hidden">
                <ScrollArea className="h-full w-full pr-4">
                    <div className="flex flex-col gap-1 py-2">
                        {sortedPages.length === 0 ? (
                            <p className="text-center text-muted-foreground/50 italic mt-10">
                                The pages are yet to be written...
                            </p>
                        ) : (
                            sortedPages.map((page) => (
                                <button
                                    key={page.id}
                                    onClick={() => onNavigate(page.pageNumber)}
                                    className={cn(
                                        "group flex items-baseline justify-between py-2 border-b border-dashed border-accent/20 hover:bg-accent/5 rounded-sm px-2 transition-colors text-left",
                                    )}
                                >
                                    <div className="flex flex-col gap-1 overflow-hidden mr-4">
                                        <span className="text-sm font-headline font-medium text-foreground/80 truncate">
                                            {page.customDate || formatDate(new Date(page.modifiedAt))}
                                        </span>
                                        <span className="text-xs text-muted-foreground/50 truncate max-w-[200px]">
                                            {page.content.replace(/<[^>]*>/g, ' ').trim().slice(0, 30) || "Empty page..."}...
                                        </span>
                                    </div>
                                    <span className="text-sm font-serif text-foreground/60 whitespace-nowrap">
                                        p. {page.pageNumber}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </ScrollArea>

                {/* Decorative bottom element */}
                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
            </div>

            {/* Footer */}
            <div className="diary-page-footer absolute bottom-4 right-8">
                <span className="text-xs font-headline text-muted-foreground/50">
                    Index
                </span>
            </div>
        </div>
    );
}
