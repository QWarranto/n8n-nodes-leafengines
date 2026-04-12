"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoilData = void 0;
module.exports = function (RED) {
    function LeafEnginesSoilNode(config) {
        RED.nodes.createNode(this, config);
        this.endpoint = 'get-soil-data';
    }
};
class SoilData {
    description = {
        displayName: 'LeafEngines Soil',
        name: 'leafEnginesSoil',
    };
    async execute() {
        const countyFips = this.getNodeParameter('countyFips', 0);
        const response = await leafEnginesApiRequest.call(this, {
            method: 'POST',
            url: '/get-soil-data',
            body: { county_fips: countyFips }
        });
    }
}
exports.SoilData = SoilData;
//# sourceMappingURL=Porting.js.map