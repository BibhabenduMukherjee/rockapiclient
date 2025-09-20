# Rock API Client

A lightweight, modern Electron-based REST API client inspired by Postman.

## Features

- Collections and requests management (create, rename, delete)
- Request composer: method, URL, query params, headers, and body (JSON)
- Send requests and view response with:
  - Color-coded status (2xx green, 3xx blue, 4xx red, 5xx dark red)
  - Response time and size
  - Collapsible headers and pretty-printed body
  - Scrollable response panel
  - Cancel in-flight request
- Persistent history (saved across sessions)
- Per-request persistence for URL/params/headers/body

## Getting Started

### Install

```bash
npm install
```

### Develop / Run

```bash
npm run build
npm start
```

If you see a startup error about `app.getPath` ensure you are running via Electron (`npm start`) and not `node main.js`.

### Build for Production

This repo includes `electron-builder` config in `package.json`. Example:
```bash
npm run build && npx electron-builder
```

## Usage

1. Create a collection and add requests from the left sidebar.
2. Select a request to load it into the composer.
3. Fill in URL, method, params, headers, and optional body.
4. Click Send to execute. Use Cancel to abort long-running requests.
5. Inspect response in the card: status, time, size, headers, and body.
6. Use History tab to recall previous requests.

## Tech Stack
- Electron (main, preload)
- React + TypeScript (renderer)
- Ant Design (UI)
- Webpack (bundling)

## Roadmap Ideas
- Environment variables and auth helpers (Bearer, Basic, OAuth 2.0)
- Response tabs: Raw, Pretty, Preview, and Headers
- Code generation (cURL, fetch, axios)
- Import/Export collections (Postman v2.1 JSON)
- Tests and schema validation with JSON Schema
- Workspace sync via cloud/local file
- Theming and keybindings

## License
ISC
