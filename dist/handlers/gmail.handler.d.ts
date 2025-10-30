import { gmail_v1 } from '@googleapis/gmail';
/**
 * Handle Gmail tool operations with production-grade error handling
 */
export declare function handleGmailTool(name: string, args: any): Promise<import("../utils/error-handler.js").ErrorResult | {
    status: string;
    count: number;
    threads: any[];
} | {
    status: string;
    count: number;
    messages: gmail_v1.Schema$Message[] | undefined;
} | {
    status: string;
    error: string;
    code: string;
    threadId?: undefined;
    bodyLength?: undefined;
    message?: undefined;
    id?: undefined;
} | {
    status: string;
    threadId: string;
    bodyLength: any;
    message: string;
    error?: undefined;
    code?: undefined;
    id?: undefined;
} | {
    status: string;
    modified: number;
} | {
    status: string;
    id: string | null | undefined;
    threadId: string | null | undefined;
} | {
    status: string;
    draftId: string | null | undefined;
    messageId: string | null | undefined;
} | {
    status: string;
    threadId: any;
    messagesCount: number;
    messages: {
        id: string | null | undefined;
        snippet: string | null | undefined;
        internalDate: string | null | undefined;
    }[];
} | {
    status: string;
    error: string;
    message?: undefined;
    preview?: undefined;
} | {
    status: string;
    message: string;
    preview: {
        to: any[];
        cc: any;
        bcc: any;
        subject: any;
        bodyLength: any;
        attachments: any;
    };
    error?: undefined;
}>;
//# sourceMappingURL=gmail.handler.d.ts.map