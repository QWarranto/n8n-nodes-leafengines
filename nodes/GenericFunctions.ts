import {
	IExecuteFunctions,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';
import axios from 'axios';

// Telemetry ingestion endpoint (anonymous, opt-out available via NO_ANALYTICS=1)
const TELEMETRY_INGEST_ENDPOINT = 'https://wzgnxkoeqzvueypwzvyn.supabase.co/functions/v1/telemetry-ingest';
const TELEMETRY_VERSION = '1.0.7';
const ENABLE_TELEMETRY = process.env.NO_ANALYTICS !== '1';

// Send telemetry event to the ingestion pipeline (fires downstream digest emails)
async function sendTelemetryEvent(event: Record<string, unknown>) {
	if (!ENABLE_TELEMETRY) return;
	try {
		await axios.post(
			TELEMETRY_INGEST_ENDPOINT,
			{
				...event,
				surface: (event.surface as string) ?? 'n8n',
				event_type: (event.event_type as string) ?? 'tool_call',
			},
			{
				timeout: 1000,
				headers: {
					'x-surface': (event.surface as string) ?? 'n8n',
					'x-client-version': TELEMETRY_VERSION,
				},
			}
		);
	} catch {
		// Silently fail — telemetry must never block user workflows
	}
}

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
	const apiKey = (credentials.apiKey as string) || '';
	const environment = (credentials.environment as string) || 'sandbox';

    const baseUrl = API_BASE_URLS[environment as keyof typeof API_BASE_URLS];
	if (!baseUrl) {
		throw new Error(`Invalid environment: ${environment}. Valid environments are: ${Object.keys(API_BASE_URLS).join(', ')}`);
	}

	const requestOptions: IHttpRequestOptions = {
		url: `${baseUrl}${options.url}`,
		method: options.method,
		headers: {
			'Content-Type': 'application/json',
			'User-Agent': `n8n-nodes-leafengines/${TELEMETRY_VERSION}`,
			...(apiKey ? { 'x-api-key': apiKey } : { 'x-free-tier': 'true' }),
			...options.headers,
		},
		body: options.body,
		qs: options.qs,
		json: true,
	};

	const startMs = Date.now();
	let toolName = options.url.replace(/^\//, '').split('?')[0];

	try {
		const response = await this.helpers.httpRequest(requestOptions);
		const latencyMs = Date.now() - startMs;

		// Telemetry: successful tool call
		sendTelemetryEvent({
				surface: 'n8n',
				event_type: 'tool_call',
				tool_name: toolName,
				latency_ms: latencyMs,
				status_code: 200,
				api_key_prefix: apiKey ? apiKey.slice(0, 8) : null,
				metadata: { success: true, method: options.method, version: TELEMETRY_VERSION },
			});

		return response;
	} catch (error: any) {
		const latencyMs = Date.now() - startMs;
		const status = error.response?.status ?? 0;

		// Telemetry: error event
		sendTelemetryEvent({
			surface: 'n8n',
			event_type: 'error',
			tool_name: toolName,
			latency_ms: latencyMs,
			status_code: status,
			api_key_prefix: apiKey ? apiKey.slice(0, 8) : null,
			error_message: (error.message as string)?.slice(0, 1000) ?? null,
			metadata: {
				error_type: error.code ?? 'unknown',
				has_response: !!error.response,
				method: options.method,
				version: TELEMETRY_VERSION,
			},
		});

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