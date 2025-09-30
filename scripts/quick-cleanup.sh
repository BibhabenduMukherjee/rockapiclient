#!/bin/bash

# Quick Codebase Cleanup Script
# Simple script to remove common temporary and empty files
# Usage: ./scripts/quick-cleanup.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 Quick Codebase Cleanup${NC}"
echo

# Count files before cleanup
before_count=$(find . -type f | wc -l)

# Remove empty files
echo -e "${YELLOW}Removing empty files...${NC}"
find . -type f -size 0 -delete 2>/dev/null || true

# Remove common temporary files
echo -e "${YELLOW}Removing temporary files...${NC}"
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true
find . -name "*.log" -delete 2>/dev/null || true
find . -name "*.swp" -delete 2>/dev/null || true
find . -name "*.swo" -delete 2>/dev/null || true
find . -name "*~" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true
find . -name "*.bak" -delete 2>/dev/null || true
find . -name "*.backup" -delete 2>/dev/null || true

# Remove empty directories (except important ones)
echo -e "${YELLOW}Removing empty directories...${NC}"
find . -type d -empty -not -path "./node_modules*" -not -path "./.git*" -not -path "./dist*" -not -path "./build*" -delete 2>/dev/null || true

# Count files after cleanup
after_count=$(find . -type f | wc -l)
removed_count=$((before_count - after_count))

echo
echo -e "${GREEN}✅ Cleanup completed!${NC}"
echo -e "${GREEN}Removed $removed_count files/directories${NC}"
echo
