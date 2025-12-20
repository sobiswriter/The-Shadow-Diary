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
    getAllPages,
} from "@/lib/diary";
import { TableOfContents } from "./TableOfContents";
import { generateShadowResponse } from "@/ai/flows/generate-shadow-response";
import { generateShadowAnalysis } from "@/ai/flows/generate-shadow-analysis";

import { Loader2 } from "lucide-react";

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
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Page Data State
    const [leftPageData, setLeftPageData] = useState<DiaryPageType | null>(null);
    const [rightPageData, setRightPageData] = useState<DiaryPageType | null>(null);
    const [allPages, setAllPages] = useState<DiaryPageType[]>([]);

    // Ghost Text State
    const [ghostSuggestion, setGhostSuggestion] = useState<string | null>(null);

    // Audio State
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        initializeDiary();
        updateTotalPages();
        // Initial load of content
        loadSpread(currentLeftPageNum);
    }, []);

    const updateTotalPages = () => {
        setTotalPages(getTotalPages());
        setAllPages(getAllPages());
    };

    // Mapping Logic:
    // Virtual Book Page 1 (Left) = TOC
    // Virtual Book Page 2 (Right) = DB Page 1
    // Virtual Book Page 3 (Left) = DB Page 2
    // Virtual Book Page 4 (Right) = DB Page 3
    // General: DB Page N = Virtual Page (N + 1)

    const createNewPage = (pageNum: number): DiaryPageType => {
        return {
            id: `page-${pageNum}-${Date.now()}`,
            pageNumber: pageNum,
            content: "",
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        };
    };

    // Trigger Shadow Analysis for Even Pages (Shadow Pages)
    // Only if:
    // 1. It's an Even Page (Left side in our mapping, e.g., Page 2, 4...)
    // 2. It's currently empty (hasn't been analyzed yet)
    // 3. The previous page (User's page) has content
    const checkAndTriggerShadowAnalysis = async (shadowPage: DiaryPageType, userPageNum: number) => {
        if (shadowPage.content.trim().length > 0) return; // Already analyzed
        if (isAnalyzing) return;

        const userPage = getPage(userPageNum);
        if (!userPage || userPage.content.trim().length < 20) return; // Not enough content to analyze

        setIsAnalyzing(true);
        try {
            // Strip HTML
            const plainText = userPage.content.replace(/<[^>]*>/g, ' ');
            const { analysis } = await generateShadowAnalysis({ journalEntry: plainText });

            if (analysis) {
                // Format as simple HTML paragraphs for the Typewriter styling
                // We wrap it in a special div to ensure styling consistency
                const analysisHtml = `<div class="shadow-analysis">${analysis.split('\n').map(p => `<p>${p}</p>`).join('')}</div>`;

                const updatedShadowPage = {
                    ...shadowPage,
                    content: analysisHtml,
                    modifiedAt: new Date().toISOString()
                };

                savePage(updatedShadowPage);
                setLeftPageData(updatedShadowPage); // Live update the view
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Load a Spread
    const loadSpread = (leftNum: number) => {
        setAllPages(getAllPages()); // Refresh TOC data on every turn to be safe

        if (leftNum === 0) {
            // Spread 0: Closed
            setLeftPageData(null);
            setRightPageData(null);
            return;
        }

        // Left Page Logic
        if (leftNum === 1) {
            // Special Case: Page 1 is TOC (No DB data needed for 'content' prop of TOC, passing allPages)
            setLeftPageData(null); // Marker for TOC
        } else {
            // Virtual Page N (where N > 1 and Odd) -> DB Page (N-1)
            const dbPageNum = leftNum - 1;
            const leftPage = getPage(dbPageNum) || createNewPage(dbPageNum);
            setLeftPageData(leftPage);

            // Shadow Logic: If this is an EVEN DB page (e.g. Page 2), it's a Shadow Page.
            // Triggers analysis of Page N-1 (Page 1).
            if (dbPageNum % 2 === 0) {
                checkAndTriggerShadowAnalysis(leftPage, dbPageNum - 1);
            }
        }

        // Right Page Logic
        // Virtual Page N+1 (Even) -> DB Page (N)
        const dbPageNumRight = leftNum;
        // Note: leftNum is the Virtual Left Page #.
        // If leftNum=1 (TOC), Right=2. DB Page = 2-1 = 1.

        setRightPageData(getPage(dbPageNumRight) || createNewPage(dbPageNumRight));
    };

    const handleContentChange = useCallback((pageData: DiaryPageType, newContent: string, isLeft: boolean) => {
        const updatedPage = { ...pageData, content: newContent, modifiedAt: new Date().toISOString() };
        savePage(updatedPage);

        if (isLeft) setLeftPageData(updatedPage);
        else setRightPageData(updatedPage);

        // Update all pages list for TOC if title/date changes (though content change mainly updates preview)
        setAllPages(getAllPages());

        // If content changes, clear any ghost suggestion
        setGhostSuggestion(null);
    }, []);

    const handleDateChange = useCallback((pageData: DiaryPageType, newDate: string, isLeft: boolean) => {
        const updatedPage = { ...pageData, customDate: newDate, modifiedAt: new Date().toISOString() };
        savePage(updatedPage);

        if (isLeft) setLeftPageData(updatedPage);
        else setRightPageData(updatedPage);

        setAllPages(getAllPages());
    }, []);

    const handleGhostPause = useCallback(async () => {
        // Only trigger if content exists and not already analyzing
        if (!rightPageData || !rightPageData.content || rightPageData.content.length < 10 || isAnalyzing) {
            return;
        }

        setIsAnalyzing(true);
        try {
            // Strip HTML for the AI prompt (simplified)
            const plainText = rightPageData.content.replace(/<[^>]*>/g, ' ');
            const { shadowResponse } = await generateShadowResponse({ journalEntry: plainText });

            // Set as suggestion instead of modifying content immediately
            if (shadowResponse && shadowResponse.trim().length > 0) {
                setGhostSuggestion(shadowResponse);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    }, [rightPageData, isAnalyzing]); // Updated dep: isAnalyzing is redundant if using functional set? No, it's fine.


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

    const jumpToPage = useCallback((dbPageNum: number) => {
        if (isAnimating) return;

        // We want to see DB Page #N.
        // It lives on Virtual Page # (N+1).
        // If Virtual Page is Even (Right Side), we want the spread starting at (Virtual - 1).
        // e.g. DB Page 1 -> Virtual 2 (Right). Spread starts at Virtual 1.
        // e.g. DB Page 2 -> Virtual 3 (Left). Spread starts at Virtual 3.

        const virtualPageNum = dbPageNum + 1;

        // If virtual page is even (Right side), subtract 1 to get Spread Left.
        // If virtual page is odd (Left side), use it as is.
        const targetSpreadLeft = virtualPageNum % 2 === 0 ? virtualPageNum - 1 : virtualPageNum;

        setCurrentLeftPageNum(targetSpreadLeft);
        loadSpread(targetSpreadLeft);

        // Decide animation direction based on current
        if (targetSpreadLeft > currentLeftPageNum) setTurningDirection("next");
        else if (targetSpreadLeft < currentLeftPageNum) setTurningDirection("prev");

    }, [isAnimating, currentLeftPageNum]);

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
        <div className="h-full w-full book-cover flex items-center justify-center relative shadow-inner select-none pointer-events-none group overflow-hidden"
            style={{
                background: 'radial-gradient(circle at 30% 20%, #2a2a2a 0%, #1a1a1a 100%)',
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
            }}>

            {/* Ghostly Ribbon Bookmark */}
            <div className="absolute top-0 right-12 w-8 h-full">
                <div className="w-full h-36 bg-zinc-200/10 backdrop-blur-[1px] shadow-sm border-x border-white/5" style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 88%, 0 100%)'
                }}>
                    <div className="absolute top-0 bottom-0 left-1 w-px border-l border-dashed border-white/5" />
                    <div className="absolute top-0 bottom-0 right-1 w-px border-r border-dashed border-white/5" />
                </div>
            </div>

            {/* Ruined Texture Overlay (Water damage / wear) */}
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
                backgroundImage: `
                    radial-gradient(circle at 10% 10%, rgba(0,0,0,0.4) 0%, transparent 40%),
                    radial-gradient(circle at 90% 80%, rgba(0,0,0,0.5) 0%, transparent 50%),
                    linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%)
                `,
                backgroundSize: '100% 100%, 100% 100%, 4px 4px'
            }} />

            {/* Scratched Corners */}
            <div className="absolute top-0 left-0 w-16 h-16 opacity-30 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-20 pointer-events-none" style={{ background: 'linear-gradient(-45deg, rgba(255,255,255,0.1) 0%, transparent 100%)', clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }} />

            <div className="flex flex-col items-center justify-center gap-4 px-12 z-10">
                <div className="w-12 h-[1px] bg-neutral-800 mb-6" />
                <h1 className="book-title text-3xl md:text-5xl text-center font-bold tracking-[0.25em] leading-tight" style={{
                    color: '#8E8E8E', // Tarnished Silver
                    textShadow: '1px 1px 0px rgba(0,0,0,0.8), -0.5px -0.5px 0px rgba(255,255,255,0.05)', // Debossed effect
                }}>
                    THE SHADOW <br /> DIARY
                </h1>
                <div className="w-12 h-[1px] bg-neutral-800 mt-6" />
            </div>

            {/* Final grit overlay */}
            <div className="absolute inset-0 bg-noise opacity-[0.04] mix-blend-overlay" />
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
        // Spread N

        // Left Content: TOC (Page 1) or Diary Page
        if (currentLeftPageNum === 1) {
            leftContent = (
                <TableOfContents
                    pages={allPages}
                    onNavigate={jumpToPage}
                />
            );
        } else {
            leftContent = leftPageData ? (
                <DiaryPage
                    pageNumber={leftPageData.pageNumber}
                    content={leftPageData.content}
                    onContentChange={(c) => handleContentChange(leftPageData, c, true)}
                    date={new Date(leftPageData.modifiedAt)}
                    customDate={leftPageData.customDate}
                    onDateChange={(d) => handleDateChange(leftPageData, d, true)}
                    isMuted={isMuted}
                />
            ) : <div className="p-8">Loading...</div>;
        }

        // Right Content: Diary Page
        rightContent = rightPageData ? (
            <>
                <DiaryPage
                    pageNumber={rightPageData.pageNumber}
                    content={rightPageData.content}
                    onContentChange={(c) => handleContentChange(rightPageData, c, false)}
                    date={new Date(rightPageData.modifiedAt)}
                    customDate={rightPageData.customDate}
                    onDateChange={(d) => handleDateChange(rightPageData, d, false)}
                    onPause={handleGhostPause}
                    suggestion={ghostSuggestion}
                    onAcceptSuggestion={() => setGhostSuggestion(null)}
                    onDiscardSuggestion={() => setGhostSuggestion(null)}
                    isMuted={isMuted}
                />
            </>
        ) : <div className="p-8">Loading...</div>;
    }

    // Determine if we should show the "Summon Shadow" button - REMOVED


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

                    {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />}

                    <BookControls
                        isMuted={isMuted}
                        onMuteToggle={() => setIsMuted(!isMuted)}
                        onDataChange={() => loadSpread(currentLeftPageNum)}
                    />
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
                onBookmarkClick={() => {
                    if (isAnimating) return;
                    setCurrentLeftPageNum(0);
                    loadSpread(0);
                    setTurningDirection("prev");
                }}
                bookState={currentLeftPageNum === 0 ? "closed" : "open"}
            // Pass overlay content for Loose Leaf?
            // TwoPageBook doesn't support generic overlays yet, let's inject it via rightContent for now or overlay it absolutely here.
            // Actually TwoPageBook clips content. Best to place it INSIDE rightContent if possible, or pass as overlay.
            // Let's modify TwoPageBook to accept 'rightOverlay' prop or just stick it in rightContent if it fits?
            // Sticking it in rightContent might be clipped by the page boundary, which is good!
            />
            {/* Overlay for right page (rendered outside TwoPageBook to avoid clipping context? No, we WANT clipping to page) */}
            {/* Wait, TwoPageBook 'rightContent' is INSIDE the page div. So LooseLeaf will be clipped to the page. Perfect. */}

            {/* We need to inject LooseLeaf into the rightContent passed to TwoPageBook */}

            {/* Refined rightContent construction to include LooseLeaf */}
            {/* But we already constructed 'rightContent' above. Let's wrap it? */}


            {/* Hint for interaction when closed */}
            {currentLeftPageNum === 0 && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-zinc-500/40 text-sm font-serif italic tracking-widest animate-pulse pointer-events-none text-center">
                    “Sometimes dead is better.” <br />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-sans not-italic mt-2 opacity-60">— Stephen King</span>
                </div>
            )}
        </div>
    );
}
