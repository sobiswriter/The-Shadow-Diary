"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateMonthlyPsychologicalProfile } from "@/ai/flows/generate-monthly-psychological-profile";
import { getRecentJournalData, setReportGeneratedFlag } from "@/lib/journal";
import { Loader2 } from "lucide-react";

export function PatientFile() {
  const [profile, setProfile] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const generateProfile = async () => {
      setIsLoading(true);
      try {
        const { emotionalTags, journalEntries } = getRecentJournalData(30);

        if (journalEntries.length === 0) {
            setProfile("No journal entries found in the last 30 days. Write in your journal to generate a profile at the beginning of next month.");
            return;
        }

        const result = await generateMonthlyPsychologicalProfile({
          emotionalTags,
          journalEntries,
        });

        setProfile(result.psychologicalProfile);
        setReportGeneratedFlag();
      } catch (error) {
        console.error("Failed to generate profile:", error);
        toast({
          title: "Profile Generation Failed",
          description: "Could not generate your monthly profile. Please try again later.",
          variant: "destructive",
        });
        setProfile("An error occurred while generating the profile.");
      } finally {
        setIsLoading(false);
      }
    };

    generateProfile();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4 rounded-lg bg-white/50">
        <Loader2 className="h-12 w-12 animate-spin text-slate-500" />
        <p className="mt-4 text-slate-600 font-headline">
          Analyzing your patient file...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg bg-white/50 min-h-[300px]">
        <p className="whitespace-pre-wrap font-headline text-base leading-loose text-slate-800">
            {profile}
        </p>
    </div>
  );
}
