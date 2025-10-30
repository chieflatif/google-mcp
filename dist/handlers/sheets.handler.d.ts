/**
 * Handle Google Sheets tool operations with production-grade error handling
 */
export declare function handleSheetsTool(name: string, args: any): Promise<import("../utils/error-handler.js").ErrorResult | {
    status: string;
    spreadsheetId: string | null | undefined;
    spreadsheetUrl: string | null | undefined;
    title: string | null | undefined;
} | {
    status: string;
    range: string | null | undefined;
    values: any[][];
    rowCount: number;
} | {
    status: string;
    updatedRange: string | null | undefined;
    updatedRows: number | null | undefined;
    updatedCells: number | null | undefined;
} | {
    status: string;
    count: number;
    spreadsheets: {
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
//# sourceMappingURL=sheets.handler.d.ts.map