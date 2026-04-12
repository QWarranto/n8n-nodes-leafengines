#!/bin/bash

echo "🧹 Clean n8n Fix Publication"
echo "============================"
echo ""

echo "🔍 Current Git Status"
echo "-------------------"
git status --short
echo ""

echo "📝 Step 1: Commit README Fix"
echo "---------------------------"
echo ""
echo "Committing the README fix..."
git add README.md
git commit -m "Fix: Update README for accuracy and community appropriateness

- Change 'Coming Soon' to 'Available in API'
- Replace 'Success Story' with 'Why n8n for Agriculture'
- Remove promotional content, focus on accuracy
- Community-appropriate documentation"
echo "✅ README fix committed"
echo ""

echo "🔄 Step 2: Update npm Version"
echo "---------------------------"
echo ""
echo "Current version: $(cat package.json | grep '"version"' | head -1 | cut -d'"' -f4)"
echo ""
echo "Updating to next patch version..."
npm version patch
echo "✅ Version updated"
echo ""

echo "🚀 Step 3: Publish to npm"
echo "-----------------------"
echo ""
echo "Publishing n8n-nodes-leafengines..."
npm publish --access public
echo ""

echo "📊 Step 4: Verify Publication"
echo "---------------------------"
echo ""
echo "Checking published version..."
npm view n8n-nodes-leafengines version
echo ""
echo "✅ Fix published!"
echo ""
echo "🌐 Check on npm website:"
echo "https://www.npmjs.com/package/n8n-nodes-leafengines"
echo ""
echo "📦 Other uncommitted files remain local:"
git status --short | grep -v "^M README.md"
echo ""
echo "🎯 Done! Misinformation fixed on npm."