"use client";

export type JournalEntry = {
  id: string;
  date: string;
  entry: string;
  tags: string[];
  shadowResponse: string;
};

const JOURNAL_KEY = "shadowscribe_journal";
const REPORT_GENERATED_KEY_PREFIX = "shadowscribe_report_generated_";

const getJournal = (): JournalEntry[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(JOURNAL_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEntry = (entry: string, tags: string[], shadowResponse: string) => {
  if (typeof window === "undefined") return;
  const journal = getJournal();
  const newEntry: JournalEntry = {
    id: new Date().toISOString(),
    date: new Date().toISOString(),
    entry,
    tags,
    shadowResponse,
  };
  journal.unshift(newEntry); // Add to the beginning
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
};

export const getRecentJournalData = (days: number): { emotionalTags: string[]; journalEntries: string[] } => {
  if (typeof window === "undefined") return { emotionalTags: [], journalEntries: [] };
  const journal = getJournal();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentEntries = journal.filter(
    (item) => new Date(item.date) > cutoffDate
  );

  const emotionalTags = recentEntries.flatMap((item) => item.tags);
  const journalEntries = recentEntries.map((item) => item.entry);

  return { emotionalTags, journalEntries };
};

const getReportGeneratedKey = (): string => {
  const now = new Date();
  return `${REPORT_GENERATED_KEY_PREFIX}${now.getFullYear()}-${now.getMonth()}`;
};


export const hasGeneratedReportThisMonth = (): boolean => {
  if (typeof window === "undefined") return true; // prevent generation on server
  const key = getReportGeneratedKey();
  return localStorage.getItem(key) === "true";
};

export const setReportGeneratedFlag = () => {
  if (typeof window === "undefined") return;
  const key = getReportGeneratedKey();
  localStorage.setItem(key, "true");
};
