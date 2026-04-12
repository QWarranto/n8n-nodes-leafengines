import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
export declare function validateTierAccess(tier: string, operation: string): void;
export declare function leafEnginesApiRequest(this: IExecuteFunctions, options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    body?: any;
    qs?: any;
    headers?: any;
}): Promise<any>;
export declare function getApiBaseUrl(environment: string): string;
export declare function createTierGatedProperty(property: INodeProperties, requiredTiers: string[]): INodeProperties;
export declare function validateBatchParameters(tier: string, parallel: number, batchSize: number): void;
export declare function formatAgriculturalData(data: any): any;
export declare function createPaginationParameters(): INodeProperties[];
//# sourceMappingURL=GenericFunctions.d.ts.map