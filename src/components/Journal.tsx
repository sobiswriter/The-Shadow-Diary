"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageTurnBook } from "./PageTurnBook";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, BookHeart, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateShadowResponse } from "@/ai/flows/generate-shadow-response";
import { analyzeEmotionalTags } from "@/ai/flows/analyze-emotional-tags";
import { saveEntry, hasGeneratedReportThisMonth } from "@/lib/journal";
import { ShadowResponse } from "./ShadowResponse";
import { formatDate } from "@/lib/utils";

export function Journal() {
  const [entry, setEntry] = useState("");
  const [shadowResponse, setShadowResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showReportLink, setShowReportLink] = useState(false);
  const { toast } = useToast();

  const lastSubmittedEntry = useRef("");
  const isProcessing = useRef(false);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(formatDate(new Date()));
    // Check for monthly report eligibility on mount
    const today = new Date();
    // Use `getDate() === 1` for the first day of the month
    if (today.getDate() === 1 && !hasGeneratedReportThisMonth()) {
      setShowReportLink(true);
    }
  }, []);

  const handleTurnPage = useCallback(async () => {
    if (isProcessing.current || !entry.trim() || entry === lastSubmittedEntry.current) {
      // If no new entry, just flip the page to show previous response
      setIsFlipped(true);
      return;
    }

    isProcessing.current = true;
    setIsLoading(true);
    setShadowResponse("");
    lastSubmittedEntry.current = entry;
    setIsFlipped(true);

    try {
      const [shadowResult, tagsResult] = await Promise.all([
        generateShadowResponse({ journalEntry: entry }),
        analyzeEmotionalTags({ entry: entry }),
      ]);

      const newShadowResponse = shadowResult.shadowResponse;
      const emotionalTags = tagsResult.emotionalTags;

      setShadowResponse(newShadowResponse);
      saveEntry(entry, emotionalTags, newShadowResponse);

    } catch (error) {
      console.error("AI generation failed:", error);
      toast({
        title: "An Error Occurred",
        description: "Could not generate a response. Please try again.",
        variant: "destructive",
      });
      setIsFlipped(false); // Go back if there's an error
    } finally {
      setIsLoading(false);
      isProcessing.current = false;
    }
  }, [entry, toast]);

  const handleTurnBack = useCallback(() => {
    setIsFlipped(false);
  }, []);


  // Front page content (user's journal entry)
  const frontContent = (
    <div className="h-full page-texture relative flex flex-col notebook">
      <div className="w-full p-6 sm:p-8 md:p-10 flex flex-col flex-grow">
        <div className="text-sm font-headline text-muted-foreground mb-4">{currentDate}</div>
        <Textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="What's on your mind?"
          className="flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg leading-relaxed resize-none p-0 font-body overflow-hidden"
          disabled={isLoading}
        />
      </div>
      <div className="absolute bottom-6 right-6 text-accent/50 flex items-center gap-2 pointer-events-none">
        <p className="text-sm font-headline opacity-60">Swipe or click corner to turn page</p>
        <ArrowRight className="h-4 w-4 opacity-60" />
      </div>
    </div>
  );

  // Back page content (Shadow's response)
  const backContent = (
    <div className="h-full p-8 sm:p-10 shadow-page-texture text-gray-300 relative notebook">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
        </div>
      ) : (
        <ShadowResponse text={shadowResponse} />
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl relative">
      {showReportLink && (
        <Link href="/profile" className="absolute -top-14 right-0 z-10" aria-label="View Monthly Report">
          <div className="group relative">
            <BookHeart className="h-10 w-10 text-amber-300/80 hover:text-amber-200 transition-colors" />
            <div className="absolute bottom-full mb-2 right-0 w-max hidden group-hover:block bg-primary text-primary-foreground text-xs rounded py-1 px-2 font-headline">
              Monthly Report Available
            </div>
          </div>
        </Link>
      )}
      <PageTurnBook
        frontContent={frontContent}
        backContent={backContent}
        isFlipped={isFlipped}
        onTurnToBack={handleTurnPage}
        onTurnToFront={handleTurnBack}
        disabled={isLoading}
        className="shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
      />
    </div>
  );
}

