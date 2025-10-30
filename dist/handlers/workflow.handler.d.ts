export declare function handleWorkflowTool(name: string, args: any): Promise<{
    status: string;
    meeting: import("../utils/error-handler.js").ErrorResult | {
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
    };
    invite: import("../utils/error-handler.js").ErrorResult | {
        status: string;
        count: number;
        threads: any[];
    } | {
        status: string;
        count: number;
        messages: import("@googleapis/gmail").gmail_v1.Schema$Message[] | undefined;
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
    };
    message?: undefined;
} | {
    status: string;
    message: string;
    meeting?: undefined;
    transcript?: undefined;
    email?: undefined;
    contact?: undefined;
    invite?: undefined;
    agenda?: undefined;
    emails?: undefined;
    count?: undefined;
    drafts?: undefined;
    sent?: undefined;
} | {
    status: string;
    meeting: {
        title: string;
        date: string;
        attendees: string[];
    };
    transcript: {
        original: string;
        summary: string | {
            original: string;
            enhanced: string;
            keyPoints: string[];
            nextSteps: string[];
        };
        actionItems: string[];
    };
    email: import("../utils/error-handler.js").ErrorResult | {
        status: string;
        count: number;
        threads: any[];
    } | {
        status: string;
        count: number;
        messages: import("@googleapis/gmail").gmail_v1.Schema$Message[] | undefined;
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
    } | null;
    message?: undefined;
    contact?: undefined;
    invite?: undefined;
    agenda?: undefined;
    emails?: undefined;
    count?: undefined;
    drafts?: undefined;
    sent?: undefined;
} | {
    status: string;
    contact: {
        name: string;
        email: string;
        company: string;
    };
    meeting: import("../utils/error-handler.js").ErrorResult | {
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
    };
    invite: import("../utils/error-handler.js").ErrorResult | {
        status: string;
        count: number;
        threads: any[];
    } | {
        status: string;
        count: number;
        messages: import("@googleapis/gmail").gmail_v1.Schema$Message[] | undefined;
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
    };
    message?: undefined;
    transcript?: undefined;
    email?: undefined;
    agenda?: undefined;
    emails?: undefined;
    count?: undefined;
    drafts?: undefined;
    sent?: undefined;
} | {
    status: string;
    agenda: import("../utils/error-handler.js").ErrorResult | {
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
    };
    emails: any;
    message?: undefined;
    meeting?: undefined;
    transcript?: undefined;
    email?: undefined;
    contact?: undefined;
    invite?: undefined;
    count?: undefined;
    drafts?: undefined;
    sent?: undefined;
} | {
    status: string;
    count: number;
    drafts: {
        threadId: any;
        draft: {
            subject: any;
            bodyPreview: any;
        };
    }[];
    message?: undefined;
    meeting?: undefined;
    transcript?: undefined;
    email?: undefined;
    contact?: undefined;
    invite?: undefined;
    agenda?: undefined;
    emails?: undefined;
    sent?: undefined;
} | {
    status: string;
    sent: number;
    message?: undefined;
    meeting?: undefined;
    transcript?: undefined;
    email?: undefined;
    contact?: undefined;
    invite?: undefined;
    agenda?: undefined;
    emails?: undefined;
    count?: undefined;
    drafts?: undefined;
}>;
export declare function handleWorkflowScheduleAndInvite(args: any): Promise<{
    status: string;
    message: string;
    meeting?: undefined;
    invite?: undefined;
} | {
    status: string;
    meeting: import("../utils/error-handler.js").ErrorResult | {
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
    };
    invite: import("../utils/error-handler.js").ErrorResult | {
        status: string;
        count: number;
        threads: any[];
    } | {
        status: string;
        count: number;
        messages: import("@googleapis/gmail").gmail_v1.Schema$Message[] | undefined;
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
    };
    message?: undefined;
}>;
//# sourceMappingURL=workflow.handler.d.ts.map