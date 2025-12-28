"use client";

export type DiaryPage = {
    id: string;
    pageNumber: number;
    content: string;
    createdAt: string;
    modifiedAt: string;
    title?: string;
    customDate?: string;
    shadowResponse?: string;
};

const DIARY_KEY = "normal_diary_pages";
const LOCK_KEY = "shadow_diary_lock";

/**
 * Get all diary pages from localStorage
 */
const getAllPagesInternal = (): DiaryPage[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(DIARY_KEY);
    return data ? JSON.parse(data) : [];
};

/**
 * Save all diary pages to localStorage
 */
const saveAllPages = (pages: DiaryPage[]): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(DIARY_KEY, JSON.stringify(pages));
};

/**
 * Get a specific page by page number
 */
export const getPage = (pageNumber: number): DiaryPage | null => {
    const pages = getAllPagesInternal();
    return pages.find((p) => p.pageNumber === pageNumber) || null;
};

/**
 * Get all diary pages
 */
export const getAllPages = (): DiaryPage[] => {
    return getAllPagesInternal();
};

/**
 * Save or update a diary page
 */
export const savePage = (page: Partial<DiaryPage> & { pageNumber: number }): void => {
    if (typeof window === "undefined") return;

    const pages = getAllPagesInternal();
    const existingIndex = pages.findIndex((p) => p.pageNumber === page.pageNumber);

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
        // Update existing page
        pages[existingIndex] = {
            ...pages[existingIndex],
            ...page,
            modifiedAt: now,
        };
    } else {
        // Create new page
        const newPage: DiaryPage = {
            id: `page-${page.pageNumber}-${Date.now()}`,
            pageNumber: page.pageNumber,
            content: page.content || "",
            createdAt: now,
            modifiedAt: now,
            title: page.title,
        };
        pages.push(newPage);
    }

    // Sort pages by page number
    pages.sort((a, b) => a.pageNumber - b.pageNumber);
    saveAllPages(pages);
};

/**
 * Delete a specific page
 */
export const deletePage = (pageNumber: number): void => {
    if (typeof window === "undefined") return;

    const pages = getAllPagesInternal();
    const filteredPages = pages.filter((p) => p.pageNumber !== pageNumber);
    saveAllPages(filteredPages);
};

/**
 * Get the total number of pages
 */
export const getTotalPages = (): number => {
    const pages = getAllPagesInternal();
    return pages.length;
};

/**
 * Get the highest page number (useful for determining next page)
 */
export const getMaxPageNumber = (): number => {
    const pages = getAllPagesInternal();
    if (pages.length === 0) return 0;
    return Math.max(...pages.map((p) => p.pageNumber));
};

/**
 * Export diary as JSON string
 */
export const exportDiary = (): string => {
    const pages = getAllPagesInternal();
    return JSON.stringify(pages, null, 2);
};

/**
 * Import diary from JSON string
 */
export const importDiary = (data: string): boolean => {
    if (typeof window === "undefined") return false;

    try {
        const pages = JSON.parse(data) as DiaryPage[];

        // Validate the data structure
        if (!Array.isArray(pages)) {
            throw new Error("Invalid diary format");
        }

        // Basic validation
        for (const page of pages) {
            if (
                typeof page.pageNumber !== "number" ||
                typeof page.content !== "string"
            ) {
                throw new Error("Invalid page format");
            }
        }

        saveAllPages(pages);
        return true;
    } catch (error) {
        console.error("Failed to import diary:", error);
        return false;
    }
};

/**
 * Clear all diary pages
 */
export const clearDiary = (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(DIARY_KEY);
};

/**
 * Initialize diary with first page if empty
 */
export const initializeDiary = (): void => {
    const pages = getAllPagesInternal();
    if (pages.length === 0) {
        savePage({
            pageNumber: 1,
            content: "",
            title: "My First Page",
        });
    }
};

/**
 * Lock Management
 */
export const getLockCode = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(LOCK_KEY);
};

export const setLockCode = (code: string | null): void => {
    if (typeof window === "undefined") return;
    if (code === null) {
        localStorage.removeItem(LOCK_KEY);
    } else {
        localStorage.setItem(LOCK_KEY, code);
    }
};

export const isLockEnabled = (): boolean => {
    return getLockCode() !== null;
};
