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
1. **Request an API Key:**
   - Visit [SoilSidekick Pro API Docs](https://soilsidekickpro.com/api-docs) to request your key
   - Or comment on our [GitHub API Access Issue](https://github.com/QWarranto/leafengines-claude-mcp/issues) with your name, email, and use case
   - Receive your key via email within 24 hours

2. **Base URL:**
   - `https://leafengines-agricultural-intelligence.onrender.com`

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

## 💰 Founder Pricing (First 100 Only)

Act now to lock in lifetime rates. After the first 100 founders or 30 days, pricing increases to normal rates.

| Tier | First 30 Days | After 30 Days (Lifetime Lock) | Normal Price |
|------|--------------|-------------------------------|-------------|
| **Starter** | $10/mo | $49/mo for life | $149/mo |
| **Pro** | $49/mo | $149/mo for life | $499/mo |

### Get Started Now
- **Starter:** [Subscribe for $10/month](https://buy.stripe.com/14A7sL30y8bR2F4fbgaMU02) *(Limited to first 100)*
- **Pro:** [Subscribe for $49/month](https://buy.stripe.com/cNi3cv1WuajZcfE7IOaMU03) *(Limited to first 100)*

After payment, you'll receive your API key within 24 hours.

### Alternative Payment Methods
- PayPal: `teamclreg@gmail.com`
- Cash App: `$Sumer54`
- Venmo: `@Reginald-Rice`
- Bitcoin, Ethereum, Solana (addresses provided on request)

## ⚡ Why Act Now?

1. **Be one of the first 100** → Lock in lifetime pricing
2. **After 100 founders** → Limited incentives remain for 30 days
3. **After 30 days** → Full pricing, no early advantages

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