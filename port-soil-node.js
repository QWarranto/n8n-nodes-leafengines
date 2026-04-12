#!/usr/bin/env node

/**
 * Simple porting script to convert Node-RED soil.js to n8n SoilData.node.ts
 * Usage: node port-soil-node.js
 */

const fs = require('fs');
const path = require('path');

// Read Node-RED soil.js
const nodeRedSoilPath = path.join(__dirname, '../node-red-contrib-leafengines/nodes/soil.js');
const nodeRedSoilContent = fs.readFileSync(nodeRedSoilPath, 'utf8');

// Extract key patterns from Node-RED implementation
console.log('🔍 Analyzing Node-RED soil.js implementation...');

// Look for key patterns
const patterns = {
  endpoint: /this\.endpoint\s*=\s*['"]([^'"]+)['"]/,
  fipsValidation: /countyFips.*?\/\^\\d\{5\}\$\/\.test\(countyFips\)/,
  apiCall: /await axios\.post\(url.*?\{/s,
  errorHandling: /node\.error\(.*?\)/g,
  statusUpdates: /node\.status\(.*?\)/g
};

// Create n8n SoilData.node.ts template
const n8nSoilTemplate = `import {
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
		description: 'USDA Soil Composition Analysis - Ported from Node-RED implementation',
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
				const outputFormat = this.getNodeParameter('outputFormat', i) as string;

				// Validate FIPS code format (from Node-RED implementation)
				if (!countyFips || !/^\\d{5}$/.test(countyFips)) {
					throw new Error('Valid 5-digit county FIPS code required (e.g., "06019")');
				}

				let endpoint: string;
				let body: any = {
					county_fips: countyFips,
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
					default:
						throw new Error(\`Operation "\${operation}" not implemented\`);
				}

				// Make API call (pattern from Node-RED)
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
`;

// Write the n8n SoilData.node.ts file
const n8nSoilPath = path.join(__dirname, 'nodes/SoilData/SoilData.node.ts');
const n8nDir = path.dirname(n8nSoilPath);

// Create directory if it doesn't exist
if (!fs.existsSync(n8nDir)) {
  fs.mkdirSync(n8nDir, { recursive: true });
}

fs.writeFileSync(n8nSoilPath, n8nSoilTemplate);
console.log(`✅ Created n8n SoilData.node.ts at: ${n8nSoilPath}`);

// Also create the node description file
const nodeDescTemplate = `{
  "node": {
    "version": 1,
    "name": "leafEnginesSoil",
    "displayName": "LeafEngines Soil",
    "description": "USDA Soil Composition Analysis",
    "icon": "file:leafengines.svg",
    "group": ["transform"],
    "inputs": ["main"],
    "outputs": ["main"],
    "properties": [
      {
        "displayName": "County FIPS Code",
        "name": "countyFips",
        "type": "string",
        "default": "",
        "required": true,
        "description": "5-digit county FIPS code"
      },
      {
        "displayName": "Output Format",
        "name": "outputFormat",
        "type": "options",
        "options": [
          {
            "name": "Full Analysis",
            "value": "full"
          },
          {
            "name": "Summary Only",
            "value": "summary"
          },
          {
            "name": "Minimal Data",
            "value": "minimal"
          }
        ],
        "default": "full",
        "description": "Level of detail in response"
      }
    ]
  }
}`;

const nodeDescPath = path.join(__dirname, 'nodes/SoilData/SoilData.node.json');
fs.writeFileSync(nodeDescPath, nodeDescTemplate);
console.log(`✅ Created n8n SoilData.node.json at: ${nodeDescPath}`);

console.log('\n🎯 Next steps:');
console.log('1. Run: cd /Users/reginaldrice/.openclaw/workspace/n8n-nodes-leafengines');
console.log('2. Run: npm install');
console.log('3. Run: npm run build');
console.log('4. Test in n8n: Copy dist/nodes/SoilData/SoilData.node.js to your n8n nodes directory');