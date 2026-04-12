"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTierAccess = validateTierAccess;
exports.leafEnginesApiRequest = leafEnginesApiRequest;
exports.getApiBaseUrl = getApiBaseUrl;
exports.createTierGatedProperty = createTierGatedProperty;
exports.validateBatchParameters = validateBatchParameters;
exports.formatAgriculturalData = formatAgriculturalData;
exports.createPaginationParameters = createPaginationParameters;
const API_BASE_URLS = {
    sandbox: 'https://wzgnxkoeqzvueypwzvyn.supabase.co/functions/v1',
    production: 'https://api.leafengines.com/v1',
};
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
function validateTierAccess(tier, operation) {
    const tierConfig = TIER_ACCESS[tier];
    if (!tierConfig) {
        throw new Error(`Invalid tier: ${tier}. Valid tiers are: ${Object.keys(TIER_ACCESS).join(', ')}`);
    }
    if (!tierConfig.operations.includes(operation)) {
        throw new Error(`Operation "${operation}" is not available in the ${tier} tier. Available operations: ${tierConfig.operations.join(', ')}`);
    }
}
async function leafEnginesApiRequest(options) {
    const credentials = await this.getCredentials('leafEnginesApi');
    const apiKey = credentials.apiKey;
    const environment = credentials.environment || 'sandbox';
    const baseUrl = API_BASE_URLS[environment];
    if (!baseUrl) {
        throw new Error(`Invalid environment: ${environment}. Valid environments are: ${Object.keys(API_BASE_URLS).join(', ')}`);
    }
    const requestOptions = {
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
    }
    catch (error) {
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
        }
        else if (error.request) {
            throw new Error('Network error: Unable to reach LeafEngines API. Please check your internet connection.');
        }
        else {
            throw new Error(`Request setup error: ${error.message}`);
        }
    }
}
function getApiBaseUrl(environment) {
    const url = API_BASE_URLS[environment];
    if (!url) {
        throw new Error(`Invalid environment: ${environment}`);
    }
    return url;
}
function createTierGatedProperty(property, requiredTiers) {
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
function validateBatchParameters(tier, parallel, batchSize) {
    const tierConfig = TIER_ACCESS[tier];
    if (parallel > tierConfig.maxParallel) {
        throw new Error(`Parallel processing limit exceeded. ${tier} tier allows max ${tierConfig.maxParallel} parallel processes.`);
    }
    if (batchSize > tierConfig.maxBatchSize) {
        throw new Error(`Batch size limit exceeded. ${tier} tier allows max ${tierConfig.maxBatchSize} items per batch.`);
    }
}
function formatAgriculturalData(data) {
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
function createPaginationParameters() {
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
//# sourceMappingURL=GenericFunctions.js.map