export declare function handleOtterTool(name: string, args: any): Promise<{
    found: boolean;
    count: number;
    transcripts: {
        id: string;
        title: string;
        date: string;
        duration: number;
        transcript: string;
        summary: string;
        actionItems: string[];
        attendees: string[];
    }[];
    query?: undefined;
    meetingsFound?: undefined;
    results?: undefined;
    totalMatches?: undefined;
} | {
    count: number;
    transcripts: {
        id: string;
        title: string;
        date: string;
        duration: number;
        hasSummary: boolean;
        hasActionItems: boolean;
        wordCount: number;
    }[];
    found?: undefined;
    query?: undefined;
    meetingsFound?: undefined;
    results?: undefined;
    totalMatches?: undefined;
} | {
    query: any;
    meetingsFound: number;
    results: {
        title: string;
        date: string;
        excerpts: string[];
        matchCount: number;
    }[];
    totalMatches: number;
    found?: undefined;
    count?: undefined;
    transcripts?: undefined;
}>;
//# sourceMappingURL=otter.handler.d.ts.map