/**
 * Handle Google Calendar tool operations with production-grade error handling
 */
export declare function handleCalendarTool(name: string, args: any): Promise<import("../utils/error-handler.js").ErrorResult | {
    status: string;
    count: number;
    slots: {
        start: string;
        end: string;
    }[];
} | {
    status: string;
    count: number;
    events: {
        id: string | null | undefined;
        title: string | null | undefined;
        start: string | null | undefined;
        end: string | null | undefined;
        attendees: (string | null | undefined)[];
        htmlLink: string | null | undefined;
        hangoutLink: any;
        description: string | null | undefined;
        location: string | null | undefined;
    }[];
} | {
    status: string;
    eventId: string | null | undefined;
    htmlLink: string | null | undefined;
} | {
    status: string;
    deletedEventId: any;
} | {
    status: string;
    error: string;
}>;
//# sourceMappingURL=calendar.handler.d.ts.map