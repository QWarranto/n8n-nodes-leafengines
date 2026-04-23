# n8n-nodes-leafengines

[![npm version](https://img.shields.io/npm/v/n8n-nodes-leafengines.svg)](https://www.npmjs.com/package/n8n-nodes-leafengines)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Agricultural Intelligence for n8n** - Business automation for precision agriculture.

## 🎯 What This Package Does

Transform n8n into an agricultural intelligence platform with:

- **Soil Analysis** - USDA soil composition, nutrient levels, health scoring
- **Water Quality Monitoring** - EPA water data, contamination risk assessment
- **Crop Recommendations** - Location-specific planting advice, yield optimization
- **Carbon Credit Calculations** - Emissions tracking, sustainability reporting
- **Weather Data Fusion** - NOAA climate insights, forecast integration
- **Environmental Impact Assessment** - Sustainability metrics, compliance reporting

## 🚀 Quick Start

### 1. Installation
```bash
npm install n8n-nodes-leafengines
```

### 2. Get Your API Key
1. **Emergency API (Available Now):** Use test key `leaf-test-370df0a2e62e`
   - Base URL: `https://leafengines-agricultural-intelligence.onrender.com`
   - Endpoint: `/v1/soil/analyze`
   - No signup required - works immediately

2. **Production API :**
   - Visit [leafengines.com/api](https://leafengines.com/api)
#### 1. Get API Key
Immediate access with test key: leaf-test-370df0a2e62e
No forms, no waiting, no approval
Works across all platforms
**Test key gives you:**n- Full soil analysis capabilitiesn- Crop recommendationsn- All free tier features

✅ Try It Now (No Waiting
Use test key: leaf-test-370df0a2e62e
Immediate access to several key features

For premium access
- **Starter:** normally $149/month (5k commoditized + 3k enhanced + 1.5k proprietary + 500 exclusive)
- or via Stripe checkout (Starter: $49 Founder Pricing vs $149/mo after June 1, 2026)
- ->https://buy.stripe.com/14A7sL30y8bR2F4fbgaMU02
- Or, Visit: [https://soilsidekickpro.com/api-docs](https://soilsidekickpro.com/api-docs) 
    

### 3. Configure in n8n
1. Go to **Credentials** → **Add Credential**
2. Search for "LeafEngines"
3. Enter your API key and select Free tier to start

### 4. Create Your First Workflow
```
[Schedule Trigger] → [LeafEngines Soil] → [Google Sheets] → [Email]
```

## 📊 Available Nodes

### **Currently Available:**
- **LeafEngines Soil** - USDA soil composition and health scoring

### **Available in SoilSidekick Pro API (can be accessed via HTTP Request node):**
- LeafEngines Water - EPA water quality monitoring
- LeafEngines Crop - AI crop recommendations  
- LeafEngines Carbon - Carbon credit calculations
- LeafEngines Weather - Live weather and soil fusion
- LeafEngines Batch - Optimized batch processing

*Note: These additional features are available through the SoilSidekick Pro API and can be integrated using n8n's HTTP Request node. Dedicated n8n nodes for these features are planned based on community feedback.*

## 🎯 Why n8n for Agriculture?

n8n provides business automation capabilities that complement our Node-RED implementation for IoT/edge scenarios:

| Use Case | n8n Advantage |
|----------|---------------|
| **Business Integration** | Connect to CRM, ERP, accounting systems |
| **Team Collaboration** | Share workflows, version control, permissions |
| **Enterprise Features** | Audit trails, SOC 2 compliance, logging |
| **Agricultural Automation** | Schedule reports, data exports, notifications |

## 🔧 Available Nodes

### LeafEngines Soil
Retrieve USDA soil data for any US location.

**Inputs:**
- County & State
- Latitude & Longitude (optional)
- Soil depth preference

**Outputs:**
- Soil composition (sand, silt, clay)
- Nutrient levels (N, P, K)
- Drainage classification
- Health score (0-100)

## 📖 Example Workflows

### Example 1: Automated Soil Reporting
```json
{
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {"rule": {"interval": "weekly"}}
    },
    {
      "name": "LeafEngines Soil",
      "type": "n8n-nodes-leafengines.leafenginesSoil",
      "parameters": {"county": "Fulton", "state": "GA"}
    },
    {
      "name": "Google Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {"operation": "append"}
    }
  ]
}
```

### Example 2: Farm Management Integration
- **Input:** Multiple field locations via CSV
- **Processing:** Batch soil analysis
- **Output:** Airtable records + email alerts
- **Integration:** Slack notifications for critical findings

## ⚙️ Configuration

### API Access
- **Free Tier:** 100 requests/month, soil data only
- **Starter Tier:** 1,000 requests/month, $49/month
- **Pro Tier:** 10,000 requests/month, $149/month
- **Enterprise:** Custom volumes, contact sales

### Authentication
1. Request API key from SoilSidekick Pro
2. Configure in n8n credentials
3. Select appropriate tier for your needs

## 🔗 Related Packages

- **[node-red-contrib-leafengines](https://www.npmjs.com/package/node-red-contrib-leafengines)** - For IoT/edge computing and device integration
- **[@ancientwhispers54/leafengines-mcp-server](https://www.npmjs.com/package/@ancientwhispers54/leafengines-mcp-server)** - For AI agent integration
- **[@soilsidekick/sdk](https://www.npmjs.com/package/@soilsidekick/sdk)** - Core JavaScript SDK for custom integrations

## 🤝 Community & Development

This package is actively developed with feedback from both the n8n and agricultural communities. We welcome:
- **Feature requests** for additional n8n nodes
- **Bug reports** and improvement suggestions
- **Use case examples** from agricultural businesses

## 📄 License

MIT License

Copyright (c) 2026 SoilSidekick Pro

## 📞 Support

- **Documentation:** [LeafEngines n8n Integration Guide](https://docs.leafengines.com/n8n)
- **GitHub Issues:** [Feature Requests & Bugs](https://github.com/QWarranto/n8n-nodes-leafengines/issues)
- **Developers:** developers@leafengines.com
- **OEM Partnerships:** partners@soilsidekickpro.com
- **Enterprise:** enterprise@soilsidekickpro.com
- **Community:** [n8n Community Forum](https://community.n8n.io)
