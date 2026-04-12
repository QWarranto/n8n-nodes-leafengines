"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeafEngines = void 0;
const GenericFunctions_1 = require("../GenericFunctions");
class LeafEngines {
    description = {
        displayName: 'LeafEngines',
        name: 'leafEngines',
        icon: 'file:leafengines.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Agricultural Intelligence Platform',
        defaults: {
            name: 'LeafEngines',
        },
        inputs: [n8n_workflow_1.NodeConnectionType.Main],
        outputs: [n8n_workflow_1.NodeConnectionType.Main],
        credentials: [
            {
                name: 'leafEnginesApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'County Lookup',
                        value: 'countyLookup',
                        description: 'Resolve county by name or FIPS code',
                        action: 'Lookup county information',
                    },
                    {
                        name: 'Get All Data',
                        value: 'getAllData',
                        description: 'Comprehensive agricultural intelligence for a location',
                        action: 'Get all agricultural data',
                    },
                    {
                        name: 'Batch Analysis',
                        value: 'batchAnalysis',
                        description: 'Process multiple locations in parallel',
                        action: 'Process batch analysis',
                    },
                ],
                default: 'countyLookup',
            },
            {
                displayName: 'County Name',
                name: 'countyName',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['countyLookup'],
                    },
                },
                description: 'Name of the county (e.g., "Fresno County")',
            },
            {
                displayName: 'State Code',
                name: 'stateCode',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['countyLookup'],
                    },
                },
                description: 'Two-letter state code (e.g., "CA")',
            },
            {
                displayName: 'FIPS Code',
                name: 'fipsCode',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['getAllData'],
                    },
                },
                description: 'County FIPS code (e.g., "06019" for Fresno County, CA). Leave empty to use County Name/State.',
            },
            {
                displayName: 'County Name',
                name: 'countyName',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['getAllData'],
                    },
                },
                description: 'Name of the county (required if FIPS not provided)',
            },
            {
                displayName: 'State Code',
                name: 'stateCode',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['getAllData'],
                    },
                },
                description: 'Two-letter state code (required if FIPS not provided)',
            },
            {
                displayName: 'Include Recommendations',
                name: 'includeRecommendations',
                type: 'boolean',
                default: true,
                displayOptions: {
                    show: {
                        operation: ['getAllData'],
                    },
                },
                description: 'Whether to include AI-powered recommendations',
            },
            {
                displayName: 'Batch Items',
                name: 'items',
                type: 'string',
                typeOptions: {
                    rows: 4,
                },
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['batchAnalysis'],
                    },
                },
                description: 'JSON array of items to process. Each item should have countyName and stateCode or fipsCode.',
            },
            {
                displayName: 'Parallel Processing',
                name: 'parallel',
                type: 'number',
                default: 5,
                displayOptions: {
                    show: {
                        operation: ['batchAnalysis'],
                    },
                },
                description: 'Number of items to process in parallel (max 10 for Starter, 100 for Pro)',
            },
        ],
    };
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const operation = this.getNodeParameter('operation', 0);
        const credentials = await this.getCredentials('leafEnginesApi');
        (0, GenericFunctions_1.validateTierAccess)(credentials.tier, operation);
        for (let i = 0; i < items.length; i++) {
            try {
                let responseData;
                if (operation === 'countyLookup') {
                    const countyName = this.getNodeParameter('countyName', i);
                    const stateCode = this.getNodeParameter('stateCode', i);
                    responseData = await GenericFunctions_1.leafEnginesApiRequest.call(this, {
                        method: 'POST',
                        url: '/county-lookup',
                        body: {
                            countyName,
                            stateCode,
                        },
                    });
                }
                else if (operation === 'getAllData') {
                    const fipsCode = this.getNodeParameter('fipsCode', i, '');
                    const countyName = this.getNodeParameter('countyName', i, '');
                    const stateCode = this.getNodeParameter('stateCode', i, '');
                    const includeRecommendations = this.getNodeParameter('includeRecommendations', i);
                    const body = {
                        includeRecommendations,
                    };
                    if (fipsCode) {
                        body.fipsCode = fipsCode;
                    }
                    else if (countyName && stateCode) {
                        body.countyName = countyName;
                        body.stateCode = stateCode;
                    }
                    else {
                        throw new Error('Either FIPS code or County Name/State Code must be provided');
                    }
                    responseData = await GenericFunctions_1.leafEnginesApiRequest.call(this, {
                        method: 'POST',
                        url: '/agricultural-intelligence',
                        body,
                    });
                }
                else if (operation === 'batchAnalysis') {
                    const itemsJson = this.getNodeParameter('items', i);
                    const parallel = this.getNodeParameter('parallel', i);
                    let batchItems;
                    try {
                        batchItems = JSON.parse(itemsJson);
                    }
                    catch (error) {
                        throw new Error('Invalid JSON format for batch items');
                    }
                    if (!Array.isArray(batchItems)) {
                        throw new Error('Batch items must be a JSON array');
                    }
                    responseData = {
                        processed: batchItems.length,
                        results: [],
                        errors: [],
                    };
                    for (const item of batchItems) {
                        responseData.results.push({
                            item,
                            status: 'pending',
                            message: 'Batch processing would be implemented in full version',
                        });
                    }
                }
                else {
                    throw new Error(`Operation "${operation}" not implemented`);
                }
                const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData), { itemData: { item: i } });
                returnData.push(...executionData);
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                            itemIndex: i,
                        },
                        pairedItem: { item: i },
                    });
                }
                else {
                    throw error;
                }
            }
        }
        return [returnData];
    }
}
exports.LeafEngines = LeafEngines;
//# sourceMappingURL=LeafEngines.node.js.map