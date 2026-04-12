#!/bin/bash

echo "🚀 n8n-nodes-leafengines Build & Test Script"
echo "==========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the n8n-nodes-leafengines directory."
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🔧 Step 2: Checking TypeScript installation..."
if ! command -v tsc &> /dev/null; then
    echo "TypeScript not found globally. Installing locally..."
    npm install -D typescript
else
    echo "✅ TypeScript is installed"
fi

echo ""
echo "🏗️ Step 3: Building package..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo ""
    echo "📁 Step 4: Checking built files..."
    if [ -d "dist" ]; then
        echo "✅ dist directory created"
        ls -la dist/
        
        echo ""
        echo "📄 Checking for SoilData node..."
        if [ -f "dist/nodes/SoilData/SoilData.node.js" ]; then
            echo "✅ SoilData.node.js built successfully"
            echo "File size: $(wc -l < dist/nodes/SoilData/SoilData.node.js) lines"
        else
            echo "❌ SoilData.node.js not found in dist/"
        fi
        
        echo ""
        echo "📄 Checking for LeafEngines node..."
        if [ -f "dist/nodes/LeafEngines/LeafEngines.node.js" ]; then
            echo "✅ LeafEngines.node.js built successfully"
            echo "File size: $(wc -l < dist/nodes/LeafEngines/LeafEngines.node.js) lines"
        else
            echo "❌ LeafEngines.node.js not found in dist/"
        fi
    else
        echo "❌ dist directory not created"
    fi
else
    echo "❌ Build failed. Check TypeScript errors above."
    echo ""
    echo "💡 Troubleshooting tips:"
    echo "1. Check if all dependencies are installed: npm install"
    echo "2. Check TypeScript version: npx tsc --version"
    echo "3. Try building manually: npx tsc"
    echo "4. Check for syntax errors in .ts files"
fi

echo ""
echo "🎯 Step 5: Quick syntax check..."
npx tsc --noEmit --skipLibCheck

if [ $? -eq 0 ]; then
    echo "✅ TypeScript syntax check passed"
else
    echo "❌ TypeScript syntax errors found"
fi

echo ""
echo "📋 Step 6: Package information..."
echo "Package name: $(node -p "require('./package.json').name")"
echo "Version: $(node -p "require('./package.json').version")"
echo "Description: $(node -p "require('./package.json').description")"

echo ""
echo "🚀 Next steps:"
echo "1. Test in n8n: Copy dist/ files to your n8n custom nodes directory"
echo "2. Or install globally: npm install -g ."
echo "3. Create GitHub repository: git init && git add . && git commit -m 'Initial commit'"
echo "4. Publish to npm: npm publish --access public"
echo ""
echo "📝 For n8n testing:"
echo "Custom nodes directory is usually: ~/.n8n/custom/"
echo "Copy: cp -r dist/* ~/.n8n/custom/"
echo "Restart n8n and check Palette Manager for 'LeafEngines' nodes"