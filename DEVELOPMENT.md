# n8n-nodes-leafengines Development Guide

## 🚀 Quick Start

### **1. Prerequisites**
```bash
# Node.js 18.10 or higher
node --version

# n8n CLI tools
npm install -g n8n
```

### **2. Setup Development Environment**
```bash
# Clone repository
git clone https://github.com/QWarranto/n8n-nodes-leafengines.git
cd n8n-nodes-leafengines

# Install dependencies
npm install

# Build the package
npm run build

# Development watch mode
npm run dev
```

### **3. Testing with Local n8n**
```bash
# Method 1: Symbolic link
cd ~/.n8n/custom
ln -s /path/to/n8n-nodes-leafengines .

# Method 2: npm link
cd n8n-nodes-leafengines
npm link
cd ~/.n8n
npm link n8n-nodes-leafengines

# Start n8n
n8n start
```

## 📁 Project Structure

```
n8n-nodes-leafengines/
├── credentials/
│   └── LeafEnginesApi.credentials.ts    # API credentials
├── nodes/
│   ├── GenericFunctions.ts              # Shared utilities
│   ├── LeafEngines/
│   │   └── LeafEngines.node.ts          # Main node
│   ├── SoilData/
│   │   └── SoilData.node.ts             # Soil analysis node
│   ├── WaterQuality/                    # (To be implemented)
│   ├── CropIntelligence/                # (To be implemented)
│   ├── CarbonCredits/                   # (To be implemented)
│   └── EnvironmentalIntelligence/       # (To be implemented)
├── package.json
├── tsconfig.json
├── index.ts
└── README.md
```

## 🔧 Building Nodes

### **Node Structure**
Each node consists of:
1. **Node Class** - Main implementation
2. **Node Description** - Metadata and properties
3. **Execute Method** - Business logic

### **Example: Creating a New Node**
```typescript
// nodes/WaterQuality/WaterQuality.node.ts
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

export class WaterQuality implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LeafEngines Water Quality',
		name: 'waterQuality',
		icon: 'file:water.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Water quality analysis and assessment',
		defaults: {
			name: 'Water Quality',
		},
		// ... rest of implementation
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Implementation
	}
}
```

### **Adding to Index**
```typescript
// index.ts
import { WaterQuality } from './nodes/WaterQuality/WaterQuality.node';

export {
	// ... existing exports
	WaterQuality,
};
```

## 🎯 Tier Gating Implementation

### **1. Define Tier Access**
```typescript
// GenericFunctions.ts
const TIER_ACCESS = {
	free: {
		operations: ['countyLookup', 'getAllData'],
		maxParallel: 1,
		maxBatchSize: 1,
	},
	starter: {
		operations: ['countyLookup', 'getAllData', 'batchAnalysis'],
		maxParallel: 10,
		maxBatchSize: 100,
	},
	pro: {
		operations: ['countyLookup', 'getAllData', 'batchAnalysis'],
		maxParallel: 100,
		maxBatchSize: 1000,
	},
};
```

### **2. Validate Tier Access**
```typescript
export function validateTierAccess(tier: string, operation: string): void {
	const tierConfig = TIER_ACCESS[tier];
	if (!tierConfig.operations.includes(operation)) {
		throw new Error(`Operation "${operation}" not available in ${tier} tier`);
	}
}
```

### **3. Tier-Gated Properties**
```typescript
import { createTierGatedProperty } from '../GenericFunctions';

// In node properties array
createTierGatedProperty(
	{
		name: 'Advanced Operation',
		value: 'advancedOperation',
		description: 'Advanced feature (Starter+ tier)',
	},
	['starter', 'pro']
),
```

## 🔌 API Integration

### **API Request Helper**
```typescript
// GenericFunctions.ts
export async function leafEnginesApiRequest(
	this: IExecuteFunctions,
	options: {
		method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
		url: string;
		body?: any;
		qs?: any;
		headers?: any;
	}
): Promise<any> {
	// Implementation
}
```

### **Using in Nodes**
```typescript
const responseData = await leafEnginesApiRequest.call(this, {
	method: 'POST',
	url: '/soil/composition',
	body: {
		fipsCode: '06019',
		includeHistorical: true,
	},
});
```

## 🧪 Testing

### **Unit Tests**
```bash
# Run tests
npm test

# Test coverage
npm run test:coverage
```

### **Integration Testing**
1. Start local n8n instance
2. Install the package
3. Create test workflows
4. Verify API calls and responses

### **Mock API for Development**
```typescript
// For development without real API
const MOCK_RESPONSES = {
	'/soil/composition': {
		sand: 45,
		silt: 35,
		clay: 20,
		texture: 'Loam',
	},
	// ... other endpoints
};
```

## 📦 Publishing

### **1. Build Package**
```bash
npm run build
npm run lint
```

### **2. Update Version**
```bash
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

### **3. Publish to npm**
```bash
npm publish --access public
```

### **4. Submit to n8n Registry**
1. Create PR to [n8n-io/n8n-nodes](https://github.com/n8n-io/n8n-nodes)
2. Include package details
3. Wait for review and merge

## 🚀 Deployment Options

### **Option 1: npm Package**
```bash
# Users install via npm
npm install n8n-nodes-leafengines
```

### **Option 2: n8n Registry**
- Appears in n8n UI under "Community Nodes"
- Automatic updates
- Higher visibility

### **Option 3: Direct Import**
```bash
# Manual installation
cd ~/.n8n/custom
git clone https://github.com/QWarranto/n8n-nodes-leafengines.git
```

## 🔐 Security Considerations

### **API Key Security**
- Never log API keys
- Use credential type with password field
- Validate keys before use

### **Rate Limiting**
- Implement retry logic
- Respect API rate limits
- Queue requests if needed

### **Error Handling**
- Graceful degradation
- Informative error messages
- Circuit breaker pattern

## 📈 Performance Optimization

### **Batch Processing**
```typescript
// Process items in parallel batches
const BATCH_SIZE = 10;
for (let i = 0; i < items.length; i += BATCH_SIZE) {
	const batch = items.slice(i, i + BATCH_SIZE);
	const promises = batch.map(item => processItem(item));
	await Promise.all(promises);
}
```

### **Caching**
```typescript
// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): any | null {
	const entry = cache.get(key);
	if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
		return entry.data;
	}
	return null;
}
```

## 🔄 Versioning Strategy

### **Semantic Versioning**
- **MAJOR** - Breaking changes
- **MINOR** - New features, backward compatible
- **PATCH** - Bug fixes

### **API Compatibility**
- Maintain backward compatibility for at least 6 months
- Deprecate features with warning before removal
- Document breaking changes

## 🆘 Troubleshooting

### **Common Issues**

#### **Node not appearing in n8n:**
- Check package is in `~/.n8n/custom` directory
- Verify `package.json` has correct `n8n` section
- Restart n8n

#### **API errors:**
- Check API key validity
- Verify tier access
- Check network connectivity

#### **Build errors:**
- Clear TypeScript cache: `rm -rf dist node_modules/.cache`
- Reinstall dependencies: `npm ci`
- Check TypeScript version compatibility

### **Debugging**
```typescript
// Enable debug logging
const debug = require('debug')('n8n-nodes-leafengines');

// Add to execute method
debug('Processing item %d', i);
debug('Request body: %o', body);
```

## 📚 Resources

### **Documentation**
- [n8n Node Development Guide](https://docs.n8n.io/integrations/creating-nodes/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [LeafEngines API Docs](https://leafengines.example.com/api-docs)

### **Community**
- [n8n Community Forum](https://community.n8n.io/)
- [GitHub Discussions](https://github.com/QWarranto/n8n-nodes-leafengines/discussions)
- [Discord](https://discord.gg/n8n)

### **Tools**
- [n8n Node Dev CLI](https://github.com/n8n-io/n8n-node-dev)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/) for testing

---

## 🎯 Next Steps

### **Phase 1 (Week 1-2):**
- Complete SoilData, WaterQuality, CropIntelligence nodes
- Basic testing and documentation
- Initial npm release

### **Phase 2 (Week 3-4):**
- Complete CarbonCredits, EnvironmentalIntelligence nodes
- Advanced features (batch processing, caching)
- Submit to n8n registry

### **Phase 3 (Week 5-6):**
- AI Agent integration
- Performance optimization
- Enterprise features

### **Phase 4 (Week 7-8):**
- Machine learning predictions
- Real-time monitoring
- Advanced error handling

---

**Ready to build? Start with implementing the WaterQuality node following the SoilData pattern!**