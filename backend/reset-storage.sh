#!/bin/bash
# backend/reset-storage.sh - Manual storage reset script

echo "🔧 Resetting log storage..."

# Navigate to backend directory
cd "$(dirname "$0")"

# Remove data directory
rm -rf data/

# Create fresh data directory and file
mkdir -p data
echo '{"logs":[]}' > data/logs.json

echo "✅ Storage reset complete!"
echo "📁 Created: $(pwd)/data/logs.json"

# Check if file was created correctly
if [ -f "data/logs.json" ]; then
    echo "📊 File size: $(du -h data/logs.json | cut -f1)"
    echo "📝 Contents: $(cat data/logs.json)"
else
    echo "❌ Error: Could not create logs.json file"
    exit 1
fi