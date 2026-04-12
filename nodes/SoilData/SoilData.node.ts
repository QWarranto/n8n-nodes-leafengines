import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import {
	leafEnginesApiRequest,
	validateTierAccess,
} from '../GenericFunctions';

export class SoilData implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LeafEngines Soil',
		name: 'leafEnginesSoil',
		icon: 'file:leafengines.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'USDA Soil Composition Analysis - Ported from Node-RED node-red-contrib-leafengines',
		defaults: {
			name: 'LeafEngines Soil',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
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
						name: 'Get Soil Composition',
						value: 'getSoilComposition',
						description: 'USDA soil composition by county (sand, silt, clay percentages)',
						action: 'Get soil composition data',
					},
					{
						name: 'Get Soil Health Score',
						value: 'getSoilHealth',
						description: 'Soil health assessment (0-100 score)',
						action: 'Get soil health score',
					},
					{
						name: 'Get Nutrient Levels',
						value: 'getNutrientLevels',
						description: 'N, P, K, pH, organic matter levels',
						action: 'Get nutrient levels',
					},
					{
						name: 'Get Erosion Risk',
						value: 'getErosionRisk',
						description: 'Wind/water erosion potential assessment',
						action: 'Get erosion risk assessment',
					},
				],
				default: 'getSoilComposition',
			},
			{
				displayName: 'County FIPS Code',
				name: 'countyFips',
				type: 'string',
				default: '',
				required: true,
				description: '5-digit county FIPS code (e.g., "06019" for Fresno County, CA). Find codes at: https://www.epa.gov/waterdata/fips-code-search',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'Full Analysis',
						value: 'full',
						description: 'Complete soil analysis with all data points',
					},
					{
						name: 'Summary Only',
						value: 'summary',
						description: 'Key metrics and health score only (optimized for dashboards)',
					},
					{
						name: 'Minimal Data',
						value: 'minimal',
						description: 'Essential data for automation workflows (lightweight)',
					},
				],
				default: 'full',
				description: 'Level of detail in the API response',
			},
			{
				displayName: 'Include Recommendations',
				name: 'includeRecommendations',
				type: 'boolean',
				default: true,
				description: 'Whether to include AI-powered soil improvement recommendations',
			},
			{
				displayName: 'Cache Behavior',
				name: 'cacheBehavior',
				type: 'options',
				options: [
					{
						name: 'Use Cache If Available',
						value: 'cache',
						description: 'Return cached data if available (faster)',
					},
					{
						name: 'Force Fresh Data',
						value: 'fresh',
						description: 'Always fetch fresh data from source (slower)',
					},
				],
				default: 'cache',
				description: 'How to handle cached soil data',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		// Validate tier access for operation
		const credentials = await this.getCredentials('leafEnginesApi');
		validateTierAccess(credentials.tier as string, operation);

		for (let i = 0; i < items.length; i++) {
			try {
				const countyFips = this.getNodeParameter('countyFips', i) as string;
				const outputFormat = this.getNodeParameter('outputFormat', i) as string;
				const includeRecommendations = this.getNodeParameter('includeRecommendations', i) as boolean;
				const cacheBehavior = this.getNodeParameter('cacheBehavior', i) as string;

				// Validate FIPS code format (from Node-RED implementation)
				if (!countyFips || !/^\d{5}$/.test(countyFips)) {
					throw new Error('Valid 5-digit county FIPS code required (e.g., "06019"). Find codes at: https://www.epa.gov/waterdata/fips-code-search');
				}

				let endpoint: string;
				let body: any = {
					county_fips: countyFips,
					output_format: outputFormat,
					include_recommendations: includeRecommendations,
					cache_behavior: cacheBehavior,
				};

				// Map operations to endpoints (based on Node-RED implementation)
				switch (operation) {
					case 'getSoilComposition':
						endpoint = '/get-soil-data';
						break;
					case 'getSoilHealth':
						endpoint = '/soil-health';
						body.metrics_only = (outputFormat === 'summary' || outputFormat === 'minimal');
						break;
					case 'getNutrientLevels':
						endpoint = '/soil-nutrients';
						break;
					case 'getErosionRisk':
						endpoint = '/erosion-risk';
						break;
					default:
						throw new Error(`Operation "${operation}" not implemented`);
				}

				// Make API call (pattern from Node-RED)
				const responseData = await leafEnginesApiRequest.call(this, {
					method: 'POST',
					url: endpoint,
					body,
				});

				// Format response for n8n
				const formattedData = {
					soil: {
						composition: responseData.composition || {},
						healthScore: responseData.health_score || 0,
						nutrients: responseData.nutrients || {},
						erosionRisk: responseData.erosion_risk || {},
						recommendations: responseData.recommendations || [],
					},
					metadata: {
						county: responseData.county || {},
						fips: countyFips,
						timestamp: responseData.timestamp || new Date().toISOString(),
						dataSources: responseData.data_sources || ['USDA NRCS'],
						confidence: responseData.confidence || 0.95,
						cacheStatus: responseData.cache_status || 'fresh',
					},
					raw: outputFormat === 'full' ? responseData : undefined,
				};

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(formattedData),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);

			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							itemIndex: i,
							countyFips: this.getNodeParameter('countyFips', i, '') as string,
							operation,
							timestamp: new Date().toISOString(),
						},
						pairedItem: { item: i },
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}