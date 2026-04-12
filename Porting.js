// Example: Porting soil.js to SoilData.node.ts
// Node-RED (soil.js):
module.exports = function(RED) {
    function LeafEnginesSoilNode(config) {
        RED.nodes.createNode(this, config);
        this.endpoint = 'get-soil-data';
        // ... implementation
    }
}

// n8n (SoilData.node.ts):
export class SoilData implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'LeafEngines Soil',
        name: 'leafEnginesSoil',
        // ... n8n metadata
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        // Same API calls, same error handling, same tier-gating
        const countyFips = this.getNodeParameter('countyFips', 0) as string;
        const response = await leafEnginesApiRequest.call(this, {
            method: 'POST',
            url: '/get-soil-data',
            body: { county_fips: countyFips }
        });
        // ... return data
    }
}
