#!/bin/bash

# RockApiClient Release Script
# This script helps create a new release

set -e

echo "🚀 RockApiClient Release Script"
echo "================================"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "Error: You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"

# Ask for release type
echo ""
echo "What type of release do you want to create?"
echo "1) Patch (1.0.0 -> 1.0.1)"
echo "2) Minor (1.0.0 -> 1.1.0)"
echo "3) Major (1.0.0 -> 2.0.0)"
echo "4) Custom version"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        RELEASE_TYPE="patch"
        ;;
    2)
        RELEASE_TYPE="minor"
        ;;
    3)
        RELEASE_TYPE="major"
        ;;
    4)
        read -p "Enter custom version (e.g., 1.0.0): " CUSTOM_VERSION
        RELEASE_TYPE="custom"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

# Confirm release
echo ""
echo "📋 Release Summary:"
echo "   Current version: $CURRENT_VERSION"
if [ "$RELEASE_TYPE" = "custom" ]; then
    echo "   New version: $CUSTOM_VERSION"
else
    echo "   Release type: $RELEASE_TYPE"
fi
echo ""

read -p "Do you want to proceed with this release? (y/N): " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Release cancelled"
    exit 1
fi

# Create release
echo ""
echo "🏗️  Building and releasing..."

# Run tests and linting
echo "   Running linting..."
npm run lint

# Build the application
echo "   Building application..."
npm run build

# Update version
if [ "$RELEASE_TYPE" = "custom" ]; then
    npm version $CUSTOM_VERSION --no-git-tag-version
    NEW_VERSION=$CUSTOM_VERSION
else
    NEW_VERSION=$(npm version $RELEASE_TYPE --no-git-tag-version)
    NEW_VERSION=${NEW_VERSION#v}  # Remove 'v' prefix
fi

echo "   New version: $NEW_VERSION"

# Commit version change
git add package.json package-lock.json
git commit -m "chore: bump version to $NEW_VERSION"

# Create and push tag
git tag "v$NEW_VERSION"
git push origin main
git push origin "v$NEW_VERSION"

echo ""
echo "✅ Release $NEW_VERSION created successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. The GitHub Actions workflow will automatically build and create the release"
echo "   2. Check the Actions tab in your GitHub repository to monitor the build progress"
echo "   3. Once complete, the release will be available at:"
echo "      https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/releases/tag/v$NEW_VERSION"
echo ""
echo "🎉 Happy releasing!"
