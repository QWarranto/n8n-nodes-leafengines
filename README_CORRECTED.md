# n8n-nodes-leafengines

[![npm version](https://img.shields.io/npm/v/n8n-nodes-leafengines.svg)](https://www.npmjs.com/package/n8n-nodes-leafengines)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**LeafEngines Agricultural Intelligence nodes for n8n** - Business automation for agriculture.

## 🚀 Quick Start

### 1. Installation
```bash
npm install n8n-nodes-leafengines
```

### 2. Get Your API Key
1. Visit [app.soilsidekickpro.com/api-docs](https://app.soilsidekickpro.com/api-docs)
2. Request a sandbox API key (starts with `ak_sandbox_`)
3. Receive key via email

### 3. Configure in n8n
1. Go to **Credentials** → **Add Credential**
2. Search for "LeafEngines"
3. Enter your API key and select Free tier to start

### 4. Create Your First Workflow
```
[Schedule Trigger] → [LeafEngines Soil] → [Google Sheets] → [Email]
```

## 📊 Available Features

### **Free Tier:**
- **LeafEngines Soil** - USDA soil composition and health scoring

### **Paid Tiers Include:**
- LeafEngines Water - EPA water quality monitoring
- LeafEngines Crop - AI crop recommendations
- LeafEngines Carbon - Carbon credit calculations
- LeafEngines Weather - Live weather and soil fusion
- LeafEngines Batch - Optimized batch processing

## 🎯 Why n8n for Agriculture?

| Feature | Benefit |
|---------|---------|
| **Business Automation** | Integrate with CRM/ERP systems |
| **Team Collaboration** | Workflow sharing, version control |
| **Enterprise Ready** | SOC 2 compliance, audit trails |
| **Agricultural Focus** | Built for farm management automation |

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

### LeafEngines Water
EPA water quality monitoring data.

**Inputs:**
- Water body ID or location
- Time range

**Outputs:**
- Contaminant levels
- Water quality index
- Safety recommendations

## 📖 Example Workflows

### Example 1: Weekly Soil Report
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

### Example 2: Farm Management Dashboard
- **Input:** Multiple field locations
- **Process:** Batch soil analysis
- **Output:** CSV export + email alerts
- **Integration:** Airtable, Notion, Slack

## ⚙️ Configuration

### API Tiers
- **Free:** 100 requests/month, soil data only
- **Starter:** 1,000 requests/month, $49/month
- **Pro:** 10,000 requests/month, $149/month
- **Enterprise:** Custom volume, contact sales

### Rate Limits
- Free: 10 requests/minute
- Paid: 100 requests/minute

## 🔗 Related Packages

- **[node-red-contrib-leafengines](https://www.npmjs.com/package/node-red-contrib-leafengines)** - Node-RED version for IoT/edge
- **[@ancientwhispers54/leafengines-mcp-server](https://www.npmjs.com/package/@ancientwhispers54/leafengines-mcp-server)** - AI agent integration
- **[@soilsidekick/sdk](https://www.npmjs.com/package/@soilsidekick/sdk)** - Core JavaScript SDK

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/QWarranto/n8n-nodes-leafengines/blob/main/CONTRIBUTING.md).

## 📄 License

MIT License

Copyright (c) 2026 SoilSidekick Pro

## 📞 Support

- **Documentation:** [LeafEngines n8n Docs](https://docs.leafengines.com/n8n)
- **GitHub Issues:** [Report Bugs](https://github.com/QWarranto/n8n-nodes-leafengines/issues)
- **Email:** n8n-support@leafengines.com
- **Community:** [n8n Community Forum](https://community.n8n.io/t/n8n-nodes-leafengines)