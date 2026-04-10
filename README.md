# n8n-nodes-leafengines

[![npm version](https://img.shields.io/npm/v/n8n-nodes-leafengines.svg)](https://www.npmjs.com/package/n8n-nodes-leafengines)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**n8n nodes for LeafEngines Agricultural Intelligence API** - Business automation for agriculture. Ported from the successful [Node-RED implementation](https://github.com/QWarranto/node-red-contrib-leafengines).

## 🚀 Quick Start

### 1. Installation
```bash
# Install via npm
npm install n8n-nodes-leafengines

# Or install directly in n8n
# 1. Go to Settings → Community Nodes
# 2. Click "Install"
# 3. Enter: n8n-nodes-leafengines
# 4. Click "Install"
```

### 2. Get Your API Key
1. Visit [app.soilsidekickpro.com/api-docs](https://app.soilsidekickpro.com/api-docs)
2. Request a sandbox API key (starts with `ak_sandbox_`)
3. Receive key via email (typically within a few hours)

### 3. Configure in n8n
1. Go to **Credentials** → **Add Credential**
2. Search for "LeafEngines"
3. Enter:
   - **API Key**: Your `ak_sandbox_*` key
   - **Environment**: Sandbox (for testing)
   - **Tier**: Free (to start)

### 4. Create Your First Workflow
```
[Schedule Trigger] → [LeafEngines Soil] → [Google Sheets] → [Email]
```

Configure the **LeafEngines Soil** node:
- **Operation**: Get Soil Composition
- **County FIPS**: Enter a 5-digit code (e.g., `06019` for Fresno County, CA)
- **Output Format**: Full Analysis

## 🚨 **Complete Workflow Example: Property Assessment with Alert System**

### **Import this workflow:** `examples/address-soil-impact-alert-airtable.json`

**Complete Environmental Due Diligence Pipeline:**
```
Webhook → County Lookup → Soil Analysis → Environmental Impact → Conditional Alert → Airtable
```

### **Trigger Example:**
```json
{
  "address": "123 Rural Rd, Polk County, IA",
  "lat": 41.6270,
  "lng": -93.5000
}
```

### **Step-by-Step Processing:**

#### **1. Webhook Trigger**
- Receives property data from: CRM, mobile app, form submission, IoT device
- Contains: address, latitude, longitude

#### **2. County Lookup** (Reverse Geocoding)
- Converts lat/lng → county FIPS code
- Uses geocoding API (Google Maps, Mapbox, OpenStreetMap)

#### **3. Get Soil Data** (LeafEngines Soil Node)
- Retrieves USDA soil composition for county
- Returns: pH, NPK nutrients, organic matter %, drainage class

#### **4. Environmental Impact Analysis** (LeafEngines API)
- Combines soil data + precise coordinates
- Returns proprietary scores:
  - `runoff_risk` (0-100): Water runoff potential
  - `contamination_risk` (low/medium/high): Pollution risk
  - `biodiversity_impact`: Ecosystem effect
  - `carbon_score`: Carbon sequestration potential

#### **5. Conditional Alert System**
- **If** `contamination_risk = "high"` → Send Slack alert
- **Alert includes:** Property details, risk scores, coordinates
- **Team notified immediately** for urgent review

#### **6. Store in Airtable**
- Complete environmental record
- All data fields preserved for reporting
- `alert_sent` flag tracks notification status

### **Business Use Cases:**

#### **Real Estate Due Diligence:**
```
Property listing → Automated environmental assessment → Risk alert → Database record
```

#### **Agricultural Land Purchase:**
```
Farm evaluation → Soil analysis → Contamination check → Alert team → Document
```

#### **Environmental Compliance:**
```
Site inspection → Automated risk assessment → Regulatory reporting → Audit trail
```

#### **Insurance Underwriting:**
```
Property application → Environmental risk scoring → Underwriting decision → Record
```

### **How to Use This Example:**

1. **Download the workflow:** `examples/address-soil-impact-alert-airtable.json`
2. **Import into n8n:** Workflows → Import from File
3. **Configure credentials:**
   - Geocoding API (for county lookup)
   - LeafEngines API (soil + impact analysis)
   - Slack (for alerts)
   - Airtable (for database storage)
4. **Test with sample data**
5. **Customize for your needs**

## 📊 Available Nodes

### Free Tiere:
- **LeafEngines Soil** - USDA soil composition and health scoring

### Paid Tiers:
- LeafEngines Water - EPA water quality monitoring
- LeafEngines Crop - AI crop recommendations
- LeafEngines Carbon - Carbon credit calculations
- LeafEngines Weather - Live weather and soil fusion
- LeafEngines Batch - Optimized batch processing

## 🎯 Why n8n Over Node-RED?

| Feature | Node-RED | n8n |
|---------|----------|-----|
| **Audience** | IoT hobbyists, makers | Business automation, SaaS builders |
| **Monetization** | Lower willingness to pay | $149–$499/month tiers expected |
| **Integrations** | IoT devices, MQTT | Salesforce, HubSpot, SAP, ERP systems |
| **Team Features** | Limited | Workflow sharing, version control, audit trails |
| **Enterprise Ready** | Basic | SOC 2 compliance, SLA support |

## 📈 Based on Proven Architecture

This n8n package ports the agricultural intelligence algorithms from our Node-RED implementation, adapted for business automation workflows in n8n.

**Includes complete workflow examples for:**
- Property assessment with environmental risk alerts
- Farm management automation
- Soil data integration with business systems

## 💰 Tier Pricing

| Tier | Price | Features | Best For |
|------|-------|----------|----------|
| **Free** | $0 | 100 requests/month, soil data | Testing, hobbyists |
| **Starter** | $149/month | 10,000 requests, all endpoints | Small farms, consultants |
| **Professional** | $499/month | 100,000 requests, priority support | Enterprises, SaaS builders |
| **Enterprise** | Custom | Unlimited, SLA, dedicated support | Large corporations |

## 🔧 Technical Compatibility

### **n8n API Version: 1**
This package uses n8n Nodes API Version 1, introduced in n8n 0.198.0.

### **Minimum Requirements:**
- **n8n:** 0.198.0 or higher
- **Node.js:** 16.x or higher
- **npm:** 7.x or higher

### **Why n8n 0.198.0 Minimum?**
The node uses these post-0.198.0 APIs:
- `functionArgs.getNodeParameter()` (not `this.getNodeParameter()`)
- `await functionArgs.getCredentials()` (async credential handling)
- `INodeType` / `INodeTypeDescription` interfaces
- `NodeConnectionType` enumeration

### **Incompatible With:**
❌ n8n < 0.198.0 (uses deprecated `this.` methods)  
❌ Node.js < 16.x (n8n requirement)  
❌ Older credential patterns (sync `getCredentials()`)

## 🛠️ Development

### From Node-RED to n8n:
This package directly ports the successful Node-RED implementation:
- Same API endpoints
- Same error handling
- Same tier-gating system
- Same agricultural intelligence

### Building from Source:
```bash
# Clone repository
git clone https://github.com/QWarranto/n8n-nodes-leafengines.git
cd n8n-nodes-leafengines

# Install dependencies
npm install

# Test in n8n
cp -r . ~/.n8n/custom/nodes/n8n-nodes-leafengines
```

## 🆘 Support

- **Documentation**: [app.soilsidekickpro.com/api-docs](https://app.soilsidekickpro.com/api-docs)
- **GitHub Issues**: [github.com/QWarranto/n8n-nodes-leafengines/issues](https://github.com/QWarranto/n8n-nodes-leafengines/issues)
- **Email**: support@soilsidekickpro.com
- **Node-RED Reference**: [github.com/QWarranto/node-red-contrib-leafengines](https://github.com/QWarranto/node-red-contrib-leafengines)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [soilsidekickpro.com](https://soilsidekickpro.com)
- **Node-RED Package**: [node-red-contrib-leafengines](https://www.npmjs.com/package/node-red-contrib-leafengines)
- **GitHub**: [github.com/QWarranto/n8n-nodes-leafengines](https://github.com/QWarranto/n8n-nodes-leafengines)
- **npm**: [npmjs.com/package/n8n-nodes-leafengines](https://www.npmjs.com/package/n8n-nodes-leafengines)

---

**Ready to automate your agricultural business?** Start with the free tier and scale as needed. 🚀
## 🔍 Keywords

**Agricultural Intelligence:** offline-first, USDA soil data, carbon credit calculations, GPS-denied environments, environmental compliance, farm management automation, business workflow integration

**Technical:** n8n nodes, business automation, workflow integration, API integration, agricultural technology

**Use Cases:** farm management, environmental reporting, carbon credit verification, soil health monitoring, precision agriculture
