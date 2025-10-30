/**
 * Handle Google Drive tool operations with production-grade error handling
 */
export declare function handleDriveTool(name: string, args: any): Promise<import("../utils/error-handler.js").ErrorResult | {
    status: string;
    count: number;
    files: {
        id: string | null | undefined;
        name: string | null | undefined;
        type: string | null | undefined;
        url: string | null | undefined;
        created: string | null | undefined;
        modified: string | null | undefined;
        size: string | null | undefined;
    }[];
} | {
    status: string;
    error: string;
    code: string;
    fileId?: undefined;
    fileName?: undefined;
    mimeType?: undefined;
    size?: undefined;
    content?: undefined;
    encoding?: undefined;
} | {
    status: string;
    fileId: any;
    fileName: string;
    mimeType: string;
    size: number;
    content: string;
    encoding: string;
    error?: undefined;
    code?: undefined;
} | {
    status: string;
    error: string;
    code: string;
    fileId?: undefined;
    fileName?: undefined;
    url?: undefined;
    mimeType?: undefined;
} | {
    status: string;
    fileId: string | null | undefined;
    fileName: string | null | undefined;
    url: string | null | undefined;
    mimeType: string | null | undefined;
    error?: undefined;
    code?: undefined;
} | {
    status: string;
    fileId: any;
    sharedWith: any;
    role: any;
    permissionId: string | null | undefined;
} | {
    status: string;
    folderId: string | null | undefined;
    folderName: string | null | undefined;
    url: string | null | undefined;
} | {
    status: string;
    error: string;
}>;
//# sourceMappingURL=drive.handler.d.ts.map