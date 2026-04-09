import {
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

// API Base URLs
const API_BASE_URLS = {
	sandbox: 'https://wzgnxkoeqzvueypwzvyn.supabase.co/functions/v1',
	production: 'https://api.leafengines.com/v1',
};

// Tier access configuration
const TIER_ACCESS = {
	free: {
		operations: ['countyLookup', 'getAllData'],
		maxParallel: 1,
		maxBatchSize: 1,
	},
	starter: {
		operations: ['countyLookup', 'getAllData', 'batchAnalysis'],
		maxParallel: 10,
		maxBatchSize: 100,
	},
	pro: {
		operations: ['countyLookup', 'getAllData', 'batchAnalysis'],
		maxParallel: 100,
		maxBatchSize: 1000,
	},
};

/**
 * Validate if the current tier has access to the requested operation
 */
export function validateTierAccess(tier: string, operation: string): void {
	const tierConfig = TIER_ACCESS[tier as keyof typeof TIER_ACCESS];
	
	if (!tierConfig) {
		throw new Error(`Invalid tier: ${tier}. Valid tiers are: ${Object.keys(TIER_ACCESS).join(', ')}`);
	}

	if (!tierConfig.operations.includes(operation)) {
		throw new Error(`Operation "${operation}" is not available in the ${tier} tier. Available operations: ${tierConfig.operations.join(', ')}`);
	}
}

/**
 * Make a request to the LeafEngines API
 */
export async function leafEnginesApiRequest(
	this: IExecuteFunctions,
	options: {
		method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
		url: string;
		body?: any;
		qs?: any;
		headers?: any;
	}
): Promise<any> {
	const credentials = await this.getCredentials('leafEnginesApi');
	const apiKey = credentials.apiKey as string;
	const environment = (credentials.environment as string) || 'sandbox';

	const baseUrl = API_BASE_URLS[environment as keyof typeof API_BASE_URLS];
	if (!baseUrl) {
		throw new Error(`Invalid environment: ${environment}. Valid environments are: ${Object.keys(API_BASE_URLS).join(', ')}`);
	}

	const requestOptions: IHttpRequestOptions = {
		url: `${baseUrl}${options.url}`,
		method: options.method,
		headers: {
			'x-api-key': apiKey,
			'Content-Type': 'application/json',
			'User-Agent': 'n8n-nodes-leafengines/1.0.0',
			...options.headers,
		},
		body: options.body,
		qs: options.qs,
		json: true,
	};

	try {
		const response = await this.helpers.httpRequest(requestOptions);
		return response;
	} catch (error: any) {
		// Enhanced error handling
		if (error.response) {
			const status = error.response.status;
			const data = error.response.data;

			switch (status) {
				case 401:
					throw new Error('Invalid API key. Please check your credentials.');
				case 403:
					throw new Error('Access denied. Your tier may not have access to this operation.');
				case 429:
					throw new Error('Rate limit exceeded. Please upgrade your tier or wait before trying again.');
				case 500:
					throw new Error('LeafEngines API server error. Please try again later.');
				default:
					throw new Error(`API Error (${status}): ${data?.message || data?.error || 'Unknown error'}`);
			}
		} else if (error.request) {
			throw new Error('Network error: Unable to reach LeafEngines API. Please check your internet connection.');
		} else {
			throw new Error(`Request setup error: ${error.message}`);
		}
	}
}

/**
 * Get API base URL based on environment
 */
export function getApiBaseUrl(environment: string): string {
	const url = API_BASE_URLS[environment as keyof typeof API_BASE_URLS];
	if (!url) {
		throw new Error(`Invalid environment: ${environment}`);
	}
	return url;
}

/**
 * Create tier-gated property
 */
export function createTierGatedProperty(
	property: INodeProperties,
	requiredTiers: string[]
): INodeProperties {
	return {
		...property,
		displayOptions: {
			...(property.displayOptions || {}),
			hide: {
				...(property.displayOptions?.hide || {}),
				'/credentials.tier': requiredTiers.map(tier => `!${tier}`),
			},
		},
	};
}

/**
 * Validate batch processing parameters
 */
export function validateBatchParameters(tier: string, parallel: number, batchSize: number): void {
	const tierConfig = TIER_ACCESS[tier as keyof typeof TIER_ACCESS];
	
	if (parallel > tierConfig.maxParallel) {
		throw new Error(`Parallel processing limit exceeded. ${tier} tier allows max ${tierConfig.maxParallel} parallel processes.`);
	}

	if (batchSize > tierConfig.maxBatchSize) {
		throw new Error(`Batch size limit exceeded. ${tier} tier allows max ${tierConfig.maxBatchSize} items per batch.`);
	}
}

/**
 * Format agricultural data for n8n output
 */
export function formatAgriculturalData(data: any): any {
	return {
		soil: {
			composition: data.soil?.composition || {},
			healthScore: data.soil?.healthScore || 0,
			nutrients: data.soil?.nutrients || {},
			recommendations: data.soil?.recommendations || [],
		},
		water: {
			qualityScore: data.water?.qualityScore || 0,
			contaminants: data.water?.contaminants || {},
			irrigationSuitability: data.water?.irrigationSuitability || {},
			treatmentRecommendations: data.water?.treatmentRecommendations || [],
		},
		crops: {
			recommendations: data.crops?.recommendations || [],
			yieldPredictions: data.crops?.yieldPredictions || {},
			growthStages: data.crops?.growthStages || {},
			riskAssessment: data.crops?.riskAssessment || {},
		},
		carbon: {
			sequestrationPotential: data.carbon?.sequestrationPotential || 0,
			creditValue: data.carbon?.creditValue || 0,
			improvementPlans: data.carbon?.improvementPlans || [],
			verificationData: data.carbon?.verificationData || {},
		},
		environment: {
			sustainabilityScore: data.environment?.sustainabilityScore || 0,
			climateRisks: data.environment?.climateRisks || {},
			biodiversityImpact: data.environment?.biodiversityImpact || {},
			regulatoryCompliance: data.environment?.regulatoryCompliance || {},
		},
		metadata: {
			county: data.metadata?.county || {},
			timestamp: new Date().toISOString(),
			dataSources: data.metadata?.dataSources || [],
			confidenceScores: data.metadata?.confidenceScores || {},
		},
	};
}

/**
 * Create pagination parameters
 */
export function createPaginationParameters(): INodeProperties[] {
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: false,
			description: 'Whether to return all results or only up to a given limit',
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			default: 50,
			description: 'Max number of results to return',
			typeOptions: {
				minValue: 1,
				maxValue: 1000,
			},
			displayOptions: {
				show: {
					returnAll: [false],
				},
			},
		},
		{
			displayName: 'Page',
			name: 'page',
			type: 'number',
			default: 1,
			description: 'Page number to return',
			typeOptions: {
				minValue: 1,
			},
			displayOptions: {
				show: {
					returnAll: [false],
				},
			},
		},
	];
}