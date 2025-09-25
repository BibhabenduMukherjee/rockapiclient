# 🖼️ Electron App Icons Guide

This guide explains the **best practices** for creating, managing, and automating app icons in an Electron application.

---

## 🎯 Best Practices for App Icons

1. **Start with a Vector (SVG/AI)**
   - Always design your icon in vector format (e.g., Figma, Illustrator, Inkscape).
   - Export a **1024x1024 PNG** as your source image.

2. **Use an Icon Generator**
   - Manually resizing icons is error-prone. Instead, use a generator such as:
     - [`electron-icon-builder`](https://github.com/felixrieseberg/electron-icon-builder)
     - [`electron-builder`](https://www.electron.build/icons)
     - [`app-icon`](https://www.npmjs.com/package/app-icon)

3. **Platform-specific Formats**
   - **Windows:** `.ico` (multiple sizes embedded)
   - **macOS:** `.icns`
   - **Linux:** `.png` (various resolutions: 256x256, 512x512, etc.)

4. **File Placement**
   - Keep icons in a dedicated folder (e.g., `/assets/icons/`).
   - Name them clearly:
     ```
     assets/icons/icon.png         # Master 1024x1024 PNG
     build/icons/icon.icns         # Generated for macOS
     build/icons/icon.ico          # Generated for Windows
     build/icons/512x512.png       # For Linux
     ```

---

## 🔧 Local Icon Generation

Install tools:

```bash
npm install --save-dev electron-icon-builder
```

Generate icons

```bash
npx electron-icon-builder --input=assets/icons/icon.png --output=build --flatten
```

GitHub Action: Auto-Generate Icons
You can automate icon generation during CI/CD.

```bash
name: Generate Icons

on:
  push:
    paths:
      - "assets/icons/icon.png"
      - ".github/workflows/icons.yml"
  workflow_dispatch:

jobs:
  build-icons:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Generate icons
        run: npx electron-icon-builder --input=assets/icons/icon.png --output=build --flatten

      - name: Upload icons as artifact
        uses: actions/upload-artifact@v4
        with:
          name: electron-icons
          path: build/icons

```



