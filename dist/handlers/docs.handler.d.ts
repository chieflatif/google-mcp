/**
 * Handle Google Docs tool operations with production-grade error handling
 */
export declare function handleDocsTool(name: string, args: any): Promise<import("../utils/error-handler.js").ErrorResult | {
    status: string;
    documentId: string;
    title: string | null | undefined;
    documentUrl: string;
} | {
    status: string;
    documentId: any;
    title: string | null | undefined;
    text: string;
    characterCount: number;
    documentUrl: string;
} | {
    status: string;
    documentId: any;
    inserted: any;
    documentUrl: string;
} | {
    status: string;
    count: number;
    documents: {
        id: any;
        name: any;
        url: any;
        created: any;
        modified: any;
    }[];
} | {
    status: string;
    error: string;
}>;
//# sourceMappingURL=docs.handler.d.ts.map