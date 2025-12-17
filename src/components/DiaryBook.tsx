"use client";

import { useState, useEffect, useCallback } from "react";
import { TwoPageBook } from "./TwoPageBook";
import { DiaryPage } from "./DiaryPage";
import { BookControls } from "./BookControls";
import { BookOpen, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    savePage,
    getPage,
    getTotalPages,
    initializeDiary,
    type DiaryPage as DiaryPageType,
} from "@/lib/diary";

export function DiaryBook() {
    // Current Left Page Number
    // 0 = Closed (Cover is on Right)
    // 1 = Open (Page 1 is Inner Left? No waiting.)
    // Let's rethink the spread mapping for "Seamless Cover".

    // Spread Logic:
    // When "Closed": Left = NULL, Right = COVER (Page 0)
    // When "Open 1": Left = INNER COVER (or Page 1?), Right = Page 1 (or Page 2?)

    // User wants: Cover (Page 0) -> Open -> Page 1 & 2.
    // Transition:
    // Start: [VOID] [COVER]
    // Turn Next: Cover Flips Left.
    // End: [COVER BACK?] [PAGE 1]

    // Usually Diaries: Cover -> Page 1 (Right). Left is "Inside Cover".
    // Then Page 1 flips -> Page 2 (Left) & Page 3 (Right).

    // Let's stick to the current "Spread" logic but map 0 differently.
    // If currentLeftPageNum == 0:
    // Left = Null
    // Right = Cover Component

    // If currentLeftPageNum == 1: 
    // Left = Inside Cover (Static text?) or Page 1?
    // Let's make Page 1 be the LEFT page for simplicity and matching previous "Pages 1 & 2" design.
    // So:
    // Spread 0: [Null] [Cover]
    // Spread 1: [Page 1] [Page 2]

    // This implies a jarring jump if we don't have "Inside Cover".
    // Transition Spread 0 -> Spread 1:
    // Flipper Front: Cover (Old Right)
    // Flipper Back: Page 1 (New Left)
    // Base Left: Page 1? No. Base Left is New Left.
    // Wait.
    // Spread 0: Left=Null, Right=Cover
    // Spread 1: Left=Page 1, Right=Page 2
    // Turn Next:
    // Flipper Front (Old Right) = Cover.
    // Flipper Back (New Left) = Page 1.
    // Base Right (New Right) = Page 2.
    // Base Left (Old Left) = Null.

    // This works perfect!

    const [currentLeftPageNum, setCurrentLeftPageNum] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Animation Control
    const [turningDirection, setTurningDirection] = useState<"next" | "prev" | null>(null);
    const isAnimating = turningDirection !== null;

    // Page Data State
    const [leftPageData, setLeftPageData] = useState<DiaryPageType | null>(null);
    const [rightPageData, setRightPageData] = useState<DiaryPageType | null>(null);

    useEffect(() => {
        initializeDiary();
        updateTotalPages();
    }, []);

    const updateTotalPages = () => {
        setTotalPages(getTotalPages());
    };

    // Load a Spread
    const loadSpread = (leftNum: number) => {
        if (leftNum === 0) {
            // Spread 0: Closed
            setLeftPageData(null);
            setRightPageData(null); // Right is cover, handled specially in render
            return;
        }

        const pLeft = getPage(leftNum) || createNewPage(leftNum);
        const pRight = getPage(leftNum + 1) || createNewPage(leftNum + 1);

        setLeftPageData(pLeft);
        setRightPageData(pRight);
    };

    const createNewPage = (pageNum: number): DiaryPageType => {
        return {
            id: `page-${pageNum}-${Date.now()}`,
            pageNumber: pageNum,
            content: "",
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        };
    };

    const handleContentChange = useCallback((pageData: DiaryPageType, newContent: string, isLeft: boolean) => {
        const updatedPage = { ...pageData, content: newContent, modifiedAt: new Date().toISOString() };
        savePage(updatedPage);

        if (isLeft) setLeftPageData(updatedPage);
        else setRightPageData(updatedPage);
    }, []);

    const handleDateChange = useCallback((pageData: DiaryPageType, newDate: string, isLeft: boolean) => {
        const updatedPage = { ...pageData, customDate: newDate, modifiedAt: new Date().toISOString() };
        savePage(updatedPage);

        if (isLeft) setLeftPageData(updatedPage);
        else setRightPageData(updatedPage);
    }, []);

    const goToNextSpread = useCallback(() => {
        if (isAnimating) return;

        // If 0 -> 1.
        // If 1 -> 3.
        const nextLeft = currentLeftPageNum === 0 ? 1 : currentLeftPageNum + 2;

        setCurrentLeftPageNum(nextLeft);
        loadSpread(nextLeft);
        updateTotalPages();
        setTurningDirection("next");

    }, [currentLeftPageNum, isAnimating]);

    const goToPrevSpread = useCallback(() => {
        if (isAnimating) return;

        // If 1 -> 0 (Close).
        // If 3 -> 1.
        if (currentLeftPageNum === 0) return; // Already closed

        const prevLeft = currentLeftPageNum === 1 ? 0 : currentLeftPageNum - 2;

        setCurrentLeftPageNum(prevLeft);
        loadSpread(prevLeft);
        setTurningDirection("prev");

    }, [currentLeftPageNum, isAnimating]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input or textarea
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === "ArrowRight") {
                goToNextSpread();
            } else if (e.key === "ArrowLeft") {
                if (currentLeftPageNum > 0) {
                    goToPrevSpread();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [goToNextSpread, goToPrevSpread, currentLeftPageNum]);

    const onAnimationComplete = useCallback(() => {
        setTurningDirection(null);
    }, []);

    // ... Book Cover Content ...
    const bookCoverContent = (
        <div className="h-full w-full book-cover flex items-center justify-center relative shadow-inner select-none pointer-events-none group">
            {/* Remove big spine divs, using TwoPageBook spine */}
            <div className="absolute top-0 right-12 w-8 h-full">
                <div className="w-full h-32 bg-accent/40 shadow-lg" style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)'
                }} />
            </div>
            <div className="flex flex-col items-center justify-center gap-6 px-12">
                <BookOpen className="h-20 w-20 text-foreground/80 transform group-hover:scale-110 transition-transform duration-500" />
                <h1 className="book-title text-3xl md:text-5xl text-foreground/90 text-center font-bold tracking-wider">My Diary</h1>
                <p className="text-sm text-foreground/50 font-headline tracking-widest uppercase mt-4">Confidential</p>
            </div>
            {/* Texture overlay */}
            <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay" />
        </div>
    );

    // Determine contents for TwoPageBook
    let leftContent: React.ReactNode = null;
    let rightContent: React.ReactNode = null;

    if (currentLeftPageNum === 0) {
        // Spread 0: Void | Cover
        leftContent = null;
        rightContent = bookCoverContent;
    } else {
        // Spread N: Page Left | Page Right
        leftContent = leftPageData ? (
            <DiaryPage
                pageNumber={leftPageData.pageNumber}
                content={leftPageData.content}
                onContentChange={(c) => handleContentChange(leftPageData, c, true)}
                date={new Date(leftPageData.modifiedAt)}
                customDate={leftPageData.customDate}
                onDateChange={(d) => handleDateChange(leftPageData, d, true)}
            />
        ) : <div className="p-8">Loading...</div>;

        rightContent = rightPageData ? (
            <DiaryPage
                pageNumber={rightPageData.pageNumber}
                content={rightPageData.content}
                onContentChange={(c) => handleContentChange(rightPageData, c, false)}
                date={new Date(rightPageData.modifiedAt)}
                customDate={rightPageData.customDate}
                onDateChange={(d) => handleDateChange(rightPageData, d, false)}
            />
        ) : <div className="p-8">Loading...</div>;
    }

    return (
        <div className="w-full max-w-6xl relative h-[600px] flex flex-col justify-center">

            {/* Schemeless Navigation - Appears on Hover */}
            <div className="absolute -top-16 left-0 right-0 z-50 flex justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2 bg-background/90 p-2 rounded-full border border-border/40 backdrop-blur-md shadow-2xl">
                    <Button variant="ghost" size="sm" onClick={goToPrevSpread} disabled={isAnimating || currentLeftPageNum === 0}>
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                    </Button>
                    <span className="text-sm font-headline text-foreground/70 px-4 min-w-[100px] text-center">
                        {currentLeftPageNum === 0 ? "Cover" : `Pages ${currentLeftPageNum} & ${currentLeftPageNum + 1}`}
                    </span>
                    <Button variant="ghost" size="sm" onClick={goToNextSpread} disabled={isAnimating}>
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-2" />
                    <BookControls onDataChange={() => loadSpread(currentLeftPageNum)} />
                    <Button variant="ghost" size="icon" onClick={() => { setCurrentLeftPageNum(0); loadSpread(0); setTurningDirection("prev"); }} className="h-8 w-8 ml-1" disabled={currentLeftPageNum === 0}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <TwoPageBook
                leftContent={leftContent}
                rightContent={rightContent}
                turningDirection={turningDirection}
                onAnimationComplete={onAnimationComplete}
                onLeftClick={currentLeftPageNum > 0 ? goToPrevSpread : undefined} // Left page click = Prev (unless void)
                onRightClick={goToNextSpread} // Right page click = Next (Open or Turn)
                bookState={currentLeftPageNum === 0 ? "closed" : "open"}
            />

            {/* Hint for interaction when closed */}
            {currentLeftPageNum === 0 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-foreground/30 text-sm animate-pulse pointer-events-none">
                    Click cover to open
                </div>
            )}
        </div>
    );
}
