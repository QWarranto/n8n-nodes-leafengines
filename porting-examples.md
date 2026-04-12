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
		description: 'USDA Soil Composition Analysis',
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
						description: 'USDA soil composition by county',
						action: 'Get soil composition data',
					},
					{
						name: 'Get Soil Health Score',
						value: 'getSoilHealth',
						description: 'Soil health assessment (0-100)',
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
						description: 'Wind/water erosion potential',
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
				description: '5-digit county FIPS code (e.g., "06019" for Fresno County, CA)',
			},
			{
				displayName: 'Include Recommendations',
				name: 'includeRecommendations',
				type: 'boolean',
				default: true,
				description: 'Whether to include AI-powered soil improvement recommendations',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'Full Analysis',
						value: 'full',
						description: 'Complete soil analysis with all data',
					},
					{
						name: 'Summary Only',
						value: 'summary',
						description: 'Key metrics and health score only',
					},
					{
						name: 'Minimal Data',
						value: 'minimal',
						description: 'Essential data for automation workflows',
					},
				],
				default: 'full',
				description: 'Level of detail in response',
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
				const includeRecommendations = this.getNodeParameter('includeRecommendations', i) as boolean;
				const outputFormat = this.getNodeParameter('outputFormat', i) as string;

				// Validate FIPS code format
				if (!countyFips || !/^\d{5}$/.test(countyFips)) {
					throw new Error('Valid 5-digit county FIPS code required (e.g., "06019")');
				}

				let endpoint: string;
				let body: any = {
					county_fips: countyFips,
					include_recommendations: includeRecommendations,
					output_format: outputFormat,
				};

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

				const responseData = await leafEnginesApiRequest.call(this, {
					method: 'POST',
					url: endpoint,
					body,
				});

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							itemIndex: i,
							countyFips: this.getNodeParameter('countyFips', i, '') as string,
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