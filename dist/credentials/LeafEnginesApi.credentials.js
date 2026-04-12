"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeafEnginesApi = void 0;
class LeafEnginesApi {
    name = 'leafEnginesApi';
    displayName = 'LeafEngines API';
    documentationUrl = 'https://leafengines.example.com/api-docs';
    properties = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: { password: true },
            default: '',
            description: 'Your LeafEngines API key. Get one at app.soilsidekickpro.com',
            required: true,
        },
        {
            displayName: 'Environment',
            name: 'environment',
            type: 'options',
            options: [
                {
                    name: 'Sandbox',
                    value: 'sandbox',
                    description: 'For testing and development',
                },
                {
                    name: 'Production',
                    value: 'production',
                    description: 'For live workflows',
                },
            ],
            default: 'sandbox',
            description: 'API environment to use',
        },
        {
            displayName: 'Tier',
            name: 'tier',
            type: 'options',
            options: [
                {
                    name: 'Free',
                    value: 'free',
                    description: '100 requests/month, basic features',
                },
                {
                    name: 'Starter',
                    value: 'starter',
                    description: '$149/month, 10,000 requests, advanced features',
                },
                {
                    name: 'Professional',
                    value: 'pro',
                    description: '$499/month, 100,000 requests, all features',
                },
            ],
            default: 'free',
            description: 'Your subscription tier (affects available operations)',
        },
    ];
}
exports.LeafEnginesApi = LeafEnginesApi;
//# sourceMappingURL=LeafEnginesApi.credentials.js.map