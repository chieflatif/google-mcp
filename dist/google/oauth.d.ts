import { OAuth2Client } from 'google-auth-library';
export interface StoredTokens {
    gmail?: any;
    calendar?: any;
    sheets?: any;
    docs?: any;
    drive?: any;
}
export declare function getGmailOAuthClient(scopes: string[]): Promise<OAuth2Client>;
export declare function getCalendarOAuthClient(scopes: string[]): Promise<OAuth2Client>;
export declare function getSheetsOAuthClient(scopes: string[]): Promise<OAuth2Client>;
export declare function getDocsOAuthClient(scopes: string[]): Promise<OAuth2Client>;
export declare function getDriveOAuthClient(scopes: string[]): Promise<OAuth2Client>;
//# sourceMappingURL=oauth.d.ts.map