# Rock API Client

![Rock API Client](https://img.shields.io/badge/Electron-API%20Client-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue)
![React](https://img.shields.io/badge/React-18+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📥 Download

**Latest Release:** [Download RockApiClient](https://github.com/BibhabenduMukherjee/rockapiclient/releases/latest)

### Supported Platforms:
- 🍎 **macOS** (Intel & Apple Silicon) - `.dmg` installer
- 🪟 **Windows** (x64) - `.exe` installer  
- 🐧 **Linux** (x64) - `.AppImage` or `.deb` package

### Quick Install:
1. Go to [Releases](https://github.com/BibhabenduMukherjee/rockapiclient/releases)
2. Download the installer for your platform
3. Run the installer and start testing APIs!

## ✨ Features

### 🚀 Core API Testing
- **HTTP Methods**: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- **WebSocket Support**: Real-time WebSocket connections with message handling
- **Request Builder**: Intuitive URL, query parameters, headers, and body composition
- **Multiple Body Types**: JSON, form-data, URL-encoded, raw text, XML, HTML
- **Real-time Validation**: JSON syntax checking with error highlighting
- **Request History**: Persistent storage with advanced search and filtering
- **Response Analysis**: Status codes, timing, size, headers, and formatted response body

### 🎨 User Experience
- **Keyboard Shortcuts**: Power-user productivity (Ctrl+Enter to send, Ctrl+/ for command palette)
- **Command Palette**: Quick access to all features with fuzzy search
- **Request Templates**: Pre-built templates for REST APIs, e-commerce, social media, and cloud services
- **Enhanced Notifications**: Smart notifications with retry options and actions
- **Theme System**: 4 built-in themes (Light, Dark, High Contrast, Blue Ocean) + custom color customization
- **Mood Selector**: Choose UI themes based on your working mood
- **Custom Buttons**: Theme-adaptive button components with consistent styling

### 🔐 Authentication & Security
- **Multiple Auth Types**: Basic Auth, Bearer Token, JWT
- **Environment Variables**: Secure variable substitution with template support
- **Request/Response Security**: Safe handling of sensitive data

### 🏗️ Mock Server Management
- **HTTP Mock Servers**: Create local HTTP servers with custom routes
- **WebSocket Mock Servers**: Real-time WebSocket server simulation
- **Route Configuration**: Define custom endpoints with status codes and responses
- **Message Handlers**: Configure WebSocket message handling and responses
- **Server Persistence**: Save and reload server configurations
- **Real-time Logs**: Monitor server activity and message flow
- **Array Templates**: Pre-built response templates for common use cases

### 📊 Advanced Features
- **Request Comparison**: Side-by-side diff of current vs historical requests
- **Request Duplication**: Clone and modify existing requests
- **Code Generation**: Export requests as cURL, fetch, axios, HTTPie with syntax highlighting
- **Collection Management**: Organize requests into collections with CRUD operations
- **Environment Management**: Multiple environments with variable substitution
- **Bookmarks**: Save and organize favorite requests with tagging
- **Response Analytics**: Performance metrics and response time charts
- **Data Transformation**: Transform response data with various operations

### 🎯 Developer Productivity
- **Request Persistence**: Automatic saving of request configurations
- **History Search**: Advanced filtering by method, status, date, URL patterns
- **Bulk Operations**: Multi-select operations on history items
- **Import/Export**: Collection sharing via JSON format
- **Performance Optimization**: Lazy loading and code splitting for better performance
- **Bundle Optimization**: Optimized webpack configuration for smaller app size

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rock-api-client

# Install dependencies
npm install

# Build the application
npm run build

# Start the application
npm start
```

### Development Mode

```bash
# Start in development mode with hot reload
npm run dev

# Build for production
npm run build

# Package for distribution
npm run dist
```

## 📖 Usage Guide

### Basic Workflow

1. **Create Collections**: Organize your API requests into logical groups
2. **Build Requests**: Use the intuitive request builder with method, URL, headers, and body
3. **Send & Analyze**: Execute requests and analyze responses with detailed metrics
4. **Save & Reuse**: Persist successful requests for future use

### Keyboard Shortcuts

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+Enter` | Send Request | Execute the current request |
| `Ctrl+/` | Command Palette | Open quick command interface |
| `Ctrl+S` | Save Collection | Persist collection changes |
| `Ctrl+L` | Focus URL | Jump to URL input field |
| `Ctrl+P` | Focus Params | Switch to query parameters tab |
| `Ctrl+H` | Focus Headers | Switch to headers tab |
| `Ctrl+B` | Focus Body | Switch to request body tab |

### Request Templates

Access pre-built templates for common API patterns:
- **REST API**: CRUD operations for users, products, etc.
- **E-commerce**: Product catalog, order management
- **Social Media**: Posts, feeds, user interactions
- **Cloud Services**: File upload, storage management
- **Authentication**: Login, token refresh, OAuth flows

### Theme Customization

Choose from 4 built-in themes or create custom themes:
- **Light**: Clean, professional appearance
- **Dark**: Easy on the eyes for extended use
- **High Contrast**: Accessibility-focused design
- **Blue Ocean**: Calming blue color scheme

Customize:
- Colors for all UI elements
- Font family and size
- Layout spacing and border radius
- Sidebar width

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron (main process + renderer)
- **UI Framework**: Ant Design 5.x
- **Bundling**: Webpack 5 with optimization (code splitting, tree shaking, minification)
- **Styling**: CSS Variables + Custom CSS
- **State Management**: React Hooks + Context
- **Performance**: Lazy loading, bundle optimization, highlight.js for syntax highlighting

### Project Structure

```
src/
├── components/           # React components
│   ├── AuthorizationTab.tsx
│   ├── BodyTab.tsx
│   ├── BookmarksPanel.tsx
│   ├── CommandPalette.tsx
│   ├── CustomButton.tsx
│   ├── DataTransformation.tsx
│   ├── EnhancedCodeGenerator.tsx
│   ├── EnhancedNotifications.tsx
│   ├── HeadersTab.tsx
│   ├── HistorySearch.tsx
│   ├── MockServerManager.tsx
│   ├── MoodSelector.tsx
│   ├── Preloader.tsx
│   ├── RequestDiff.tsx
│   ├── RequestDuplication.tsx
│   ├── RequestPanel.tsx
│   ├── RequestTabs.tsx
│   ├── RequestTemplates.tsx
│   ├── ResponseAnalytics.tsx
│   ├── ResponseTimeChart.tsx
│   ├── Sidebar.tsx
│   ├── ThemeSettings.tsx
│   ├── VerticalSidebar.tsx
│   ├── WebSocketTabs.tsx
│   └── sidebar/
│       └── CollectionsTab.tsx
├── hooks/               # Custom React hooks
│   ├── useAppState.ts
│   ├── useBookmarks.ts
│   ├── useCollections.ts
│   ├── useEnvironments.ts
│   ├── useFirstLaunch.ts
│   ├── useFocusManagement.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useModals.ts
│   ├── usePerformanceOptimization.ts
│   ├── usePreloader.ts
│   └── useTheme.ts
├── utils/               # Utility functions
│   ├── codeGenerator.ts
│   ├── dataTransformation.ts
│   └── requestSender.ts
├── types/               # TypeScript type definitions
│   ├── electron.d.ts
│   └── RequestPanel.ts
├── types.ts             # Main type definitions
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
├── index.css            # Global styles
└── theme.css            # Theme system styles
```

## 🛠️ Developer Practices

### Code Organization

#### 1. Component Architecture
```typescript
// ✅ Good: Modular, focused components
interface RequestDiffProps {
  currentRequest: ApiRequest;
  history: HistoryItem[];
  disabled?: boolean;
}

export default function RequestDiff({ 
  currentRequest, 
  history, 
  disabled = false 
}: RequestDiffProps) {
  // Component logic
}
```

#### 2. Custom Hooks Pattern
```typescript
// ✅ Good: Reusable logic extraction
export function useKeyboardShortcuts({
  onSendRequest,
  onSaveCollection,
  // ... other handlers
}: UseKeyboardShortcutsProps) {
  // Hook logic
  return { shortcuts, handleKeyDown };
}
```

#### 3. Type Safety
```typescript
// ✅ Good: Comprehensive type definitions
export interface ApiRequest {
  key: string;
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  body?: string;
  collectionKey?: string;
}
```

### State Management

#### 1. Local State with Hooks
```typescript
// ✅ Good: Appropriate state scope
const [method, setMethod] = useState<ApiRequest['method']>('GET');
const [url, setUrl] = useState('');
const [isSending, setIsSending] = useState(false);
```

#### 2. Custom Hooks for Complex Logic
```typescript
// ✅ Good: Encapsulated business logic
const { collections, addCollection, updateRequest } = useCollections();
const { state: envState, addEnvironment } = useEnvironments();
```

#### 3. Effect Dependencies
```typescript
// ✅ Good: Proper dependency management
useEffect(() => {
  // Effect logic
}, [method, url, paramsJson, headers, rawBody, selectedRequest]);
```

### Error Handling

#### 1. Try-Catch with User Feedback
```typescript
// ✅ Good: Comprehensive error handling
try {
  const result = await sendRequest(requestConfig, controller.signal);
  showRequestSuccess(result.responseMeta.durationMs, result.responseMeta.status);
} catch (err: any) {
  const errorMessage = err?.message || 'Unknown error';
  showRequestError(errorMessage, () => handleSendRequest());
}
```

#### 2. Validation Patterns
```typescript
// ✅ Good: Input validation with user feedback
const paramsError = useMemo(() => {
  try { 
    JSON.parse(paramsJson || '{}'); 
    return null; 
  } catch (e: any) { 
    return 'Invalid JSON'; 
  }
}, [paramsJson]);
```

### Performance Optimization

#### 1. Memoization
```typescript
// ✅ Good: Expensive calculations memoized
const constructedUrl = useMemo(() => {
  // URL construction logic
}, [url, paramsJson, activeEnvVars]);
```

#### 2. Callback Optimization
```typescript
// ✅ Good: Stable callback references
const handleSendRequest = useCallback(async () => {
  // Request logic
}, [method, url, paramsJson, headers, auth, bodyType, rawBodyType, rawBody, formData, urlEncoded, activeEnvVars]);
```

#### 3. Lazy Loading
```typescript
// ✅ Good: Component lazy loading for large modals
const ThemeSettings = React.lazy(() => import('./components/ThemeSettings'));
```

### Accessibility

#### 1. Keyboard Navigation
```typescript
// ✅ Good: Full keyboard support
const handleKeyDown = useCallback((event: KeyboardEvent) => {
  // Keyboard shortcut handling
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    onSendRequest();
  }
}, [onSendRequest]);
```

#### 2. ARIA Labels
```typescript
// ✅ Good: Screen reader support
<Button
  type="text"
  icon={<DiffOutlined />}
  title="Compare with history"
  aria-label="Compare current request with history"
>
  Diff
</Button>
```

### Testing Strategy

#### 1. Component Testing
```typescript
// ✅ Good: Component unit tests
describe('RequestDiff', () => {
  it('should display method and URL differences', () => {
    // Test implementation
  });
});
```

#### 2. Hook Testing
```typescript
// ✅ Good: Custom hook testing
describe('useKeyboardShortcuts', () => {
  it('should trigger send request on Ctrl+Enter', () => {
    // Test implementation
  });
});
```

### Security Considerations

#### 1. Input Sanitization
```typescript
// ✅ Good: Safe input handling
const sanitizedUrl = url.replace(/[<>]/g, ''); // Remove potential XSS
```

#### 2. Environment Variable Security
```typescript
// ✅ Good: Secure variable substitution
const substitutedUrl = substituteTemplate(url, activeEnvVars);
```

## 🔧 Configuration

### Environment Variables
```bash
# Development
NODE_ENV=development
ELECTRON_IS_DEV=1

# Production
NODE_ENV=production
```

### Webpack Configuration
The project uses Webpack 5 with:
- TypeScript compilation
- CSS processing with PostCSS
- Hot module replacement for development
- Code splitting and optimization for production

### Electron Configuration
- Main process: `main.js`
- Preload script: `preload.js`
- Renderer process: React application
- IPC communication for file operations

## 📦 Building & Distribution

### Development Build
```bash
npm run build
npm start
```

### Production Build
```bash
npm run build
npm run dist
```

### Platform-specific Builds
```bash
# macOS
npm run dist:mac

# Windows
npm run dist:win

# Linux
npm run dist:linux
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Coding Standards
- Use TypeScript for all new code
- Follow the existing component patterns
- Add proper error handling
- Include JSDoc comments for public APIs
- Write tests for new features
- Ensure accessibility compliance

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Error handling is comprehensive
- [ ] Performance implications considered
- [ ] Accessibility features included
- [ ] Tests cover new functionality
- [ ] Documentation updated

## 🐛 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Electron Startup Issues
```bash
# Ensure you're running via npm start, not node main.js
npm start
```

#### Theme Not Applying
```bash
# Clear browser cache and restart
# Check CSS variables in DevTools
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=rock-api-client npm start
```

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Electron](https://electronjs.org/) - Cross-platform desktop apps
- [React](https://reactjs.org/) - UI library
- [Ant Design](https://ant.design/) - UI components
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Webpack](https://webpack.js.org/) - Module bundler

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)

---

**Made with ❤️ for developers who love clean, efficient API testing tools.**
