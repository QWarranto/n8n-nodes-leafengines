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
	createTierGatedProperty,
} from '../GenericFunctions';

export class SoilData implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LeafEngines Soil Data',
		name: 'soilData',
		icon: 'file:soil.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Soil analysis and health assessment',
		defaults: {
			name: 'Soil Data',
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
						description: 'Get sand, silt, clay percentages and texture',
						action: 'Get soil composition',
					},
					{
						name: 'Get Soil Health Score',
						value: 'getSoilHealth',
						description: 'Get overall soil health score (0-100)',
						action: 'Get soil health score',
					},
					{
						name: 'Get Nutrient Levels',
						value: 'getNutrientLevels',
						description: 'Get N, P, K, pH, organic matter levels',
						action: 'Get nutrient levels',
					},
					{
						name: 'Get Erosion Risk',
						value: 'getErosionRisk',
						description: 'Get wind and water erosion risk assessment',
						action: 'Get erosion risk',
					},
					createTierGatedProperty(
						{
							name: 'Get Soil Recommendations',
							value: 'getSoilRecommendations',
							description: 'Get AI-powered soil improvement recommendations (Starter+ tier)',
							action: 'Get soil recommendations',
						},
						['starter', 'pro']
					),
				].filter(Boolean) as any[],
				default: 'getSoilComposition',
			},
			{
				displayName: 'FIPS Code',
				name: 'fipsCode',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'getSoilComposition',
							'getSoilHealth',
							'getNutrientLevels',
							'getErosionRisk',
							'getSoilRecommendations',
						],
					},
				},
				description: 'County FIPS code (e.g., "06019" for Fresno County, CA)',
			},
			{
				displayName: 'County Name',
				name: 'countyName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'getSoilComposition',
							'getSoilHealth',
							'getNutrientLevels',
							'getErosionRisk',
							'getSoilRecommendations',
						],
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
						operation: [
							'getSoilComposition',
							'getSoilHealth',
							'getNutrientLevels',
							'getErosionRisk',
							'getSoilRecommendations',
						],
					},
				},
				description: 'Two-letter state code (required if FIPS not provided)',
			},
			{
				displayName: 'Include Historical Data',
				name: 'includeHistorical',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: [
							'getSoilComposition',
							'getSoilHealth',
							'getNutrientLevels',
						],
					},
				},
				description: 'Whether to include historical soil data trends',
			},
			{
				displayName: 'Soil Depth (cm)',
				name: 'soilDepth',
				type: 'number',
				default: 30,
				typeOptions: {
					minValue: 5,
					maxValue: 200,
				},
				displayOptions: {
					show: {
						operation: [
							'getSoilComposition',
							'getNutrientLevels',
						],
					},
				},
				description: 'Soil depth to analyze in centimeters',
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
				const fipsCode = this.getNodeParameter('fipsCode', i, '') as string;
				const countyName = this.getNodeParameter('countyName', i, '') as string;
				const stateCode = this.getNodeParameter('stateCode', i, '') as string;

				// Build request body
				const body: any = {};
				
				if (fipsCode) {
					body.fipsCode = fipsCode;
				} else if (countyName && stateCode) {
					body.countyName = countyName;
					body.stateCode = stateCode;
				} else {
					throw new Error('Either FIPS code or County Name/State Code must be provided');
				}

				// Add operation-specific parameters
				if (operation === 'getSoilComposition' || operation === 'getNutrientLevels') {
					body.includeHistorical = this.getNodeParameter('includeHistorical', i, false) as boolean;
					body.soilDepth = this.getNodeParameter('soilDepth', i, 30) as number;
				} else if (operation === 'getSoilHealth') {
					body.includeHistorical = this.getNodeParameter('includeHistorical', i, false) as boolean;
				}

				let endpoint;
				switch (operation) {
					case 'getSoilComposition':
						endpoint = '/soil/composition';
						break;
					case 'getSoilHealth':
						endpoint = '/soil/health';
						break;
					case 'getNutrientLevels':
						endpoint = '/soil/nutrients';
						break;
					case 'getErosionRisk':
						endpoint = '/soil/erosion-risk';
						break;
					case 'getSoilRecommendations':
						endpoint = '/soil/recommendations';
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