# 🚀 Release Guide

This guide explains how to create releases for RockApiClient.

## 📋 Prerequisites

1. **GitHub Repository**: Make sure your code is pushed to GitHub
2. **GitHub Actions**: Ensure GitHub Actions are enabled for your repository
3. **Node.js**: Version 18 or later
4. **Clean Working Directory**: No uncommitted changes

## 🎯 Quick Release (Recommended)

### Option 1: Using the Release Script

```bash
# Make sure you're in the project root
cd /path/to/rock-api-client

# Run the release script
./scripts/release.sh
```

The script will:
- ✅ Check for uncommitted changes
- ✅ Run linting
- ✅ Build the application
- ✅ Update version number
- ✅ Create git tag
- ✅ Push to GitHub
- ✅ Trigger GitHub Actions build

### Option 2: Manual Release

```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Push changes and tags
git push origin main
git push --tags

# 3. GitHub Actions will automatically build and create release
```

## 🏗️ What Happens During Release

1. **GitHub Actions Workflow** (`release.yml`) is triggered
2. **Multi-platform Build**:
   - macOS (Intel + Apple Silicon)
   - Windows (x64)
   - Linux (x64)
3. **Artifacts Created**:
   - macOS: `.dmg` and `.zip`
   - Windows: `.exe` installer and `.zip`
   - Linux: `.AppImage` and `.deb`
4. **GitHub Release** created with all downloads

## 📦 Release Types

- **Patch** (1.0.0 → 1.0.1): Bug fixes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

## 🔧 Manual Build (Local Testing)

If you want to test builds locally:

```bash
# Build for current platform
npm run dist

# Build for specific platforms
npm run dist:mac    # macOS
npm run dist:win    # Windows
npm run dist:linux  # Linux
```

## 📁 Build Outputs

After building, you'll find the installers in the `dist/` directory:

```
dist/
├── RockApiClient-1.0.0-arm64.dmg          # macOS DMG
├── RockApiClient-1.0.0-arm64-mac.zip      # macOS ZIP
├── RockApiClient Setup 1.0.0.exe          # Windows Installer
├── RockApiClient-1.0.0-win.zip            # Windows ZIP
├── RockApiClient-1.0.0.AppImage           # Linux AppImage
└── rock-api-client_1.0.0_amd64.deb        # Linux DEB
```

## 🐛 Troubleshooting

### Build Fails
- Check that all dependencies are installed: `npm ci`
- Ensure linting passes: `npm run lint`
- Verify webpack build works: `npm run build`

### GitHub Actions Fails
- Check the Actions tab in your GitHub repository
- Look for error messages in the build logs
- Ensure you have proper permissions for the repository

### Missing Icons
- Add app icons to the `public/` directory:
  - `icon.icns` (macOS)
  - `icon.ico` (Windows)
  - `icon.png` (Linux)

## 📝 Release Notes Template

When creating a release, include:

```markdown
## 🚀 What's New
- Feature 1
- Feature 2
- Bug fixes

## 📥 Downloads
- [macOS](link)
- [Windows](link)
- [Linux](link)

## 🐛 Bug Reports
Report issues at: [GitHub Issues](link)
```

## 🎉 Creating Your First Release (v1.0.0)

1. **Ensure everything is working**:
   ```bash
   npm run lint
   npm run build
   npm run dist
   ```

2. **Commit all changes**:
   ```bash
   git add .
   git commit -m "feat: prepare for v1.0.0 release"
   git push origin main
   ```

3. **Create the release**:
   ```bash
   ./scripts/release.sh
   # Choose option 4 (Custom version)
   # Enter: 1.0.0
   ```

4. **Monitor the build**:
   - Go to your GitHub repository
   - Click on "Actions" tab
   - Watch the "Build and Release" workflow

5. **Share your release**:
   - Once complete, the release will be available at:
   - `https://github.com/YOUR_USERNAME/YOUR_REPO/releases`

## 🔄 Updating the Release Workflow

The release workflow is in `.github/workflows/release.yml`. You can modify it to:
- Add more platforms
- Change build configurations
- Update release notes format
- Add additional build steps

---

**Happy Releasing! 🎉**
