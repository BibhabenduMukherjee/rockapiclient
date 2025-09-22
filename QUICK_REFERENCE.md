# Quick Reference Guide

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Development
npm run build && npm start

# Production build
npm run build && npm run dist
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Send Request |
| `Ctrl+/` | Command Palette |
| `Ctrl+S` | Save Collection |
| `Ctrl+L` | Focus URL Field |
| `Ctrl+P` | Focus Params Tab |
| `Ctrl+H` | Focus Headers Tab |
| `Ctrl+B` | Focus Body Tab |

## 🏗️ Project Structure

```
src/
├── components/          # UI Components
├── hooks/              # Custom React Hooks
├── utils/              # Utility Functions
├── types.ts            # TypeScript Definitions
├── App.tsx             # Main App Component
└── theme.css           # Theme System
```

## 🔧 Key Components

### Core Components
- `App.tsx` - Main application component
- `Sidebar.tsx` - Collection and history management
- `HeadersTab.tsx` - Request headers editor
- `BodyTab.tsx` - Request body editor
- `AuthorizationTab.tsx` - Authentication configuration

### Feature Components
- `CommandPalette.tsx` - Quick command interface
- `RequestTemplates.tsx` - Pre-built request templates
- `RequestDiff.tsx` - Request comparison tool
- `EnhancedNotifications.tsx` - Smart notification system
- `ThemeSettings.tsx` - Theme customization

### Custom Hooks
- `useCollections.ts` - Collection management
- `useEnvironments.ts` - Environment variables
- `useKeyboardShortcuts.ts` - Keyboard shortcut handling
- `useTheme.ts` - Theme system management

## 📝 TypeScript Interfaces

### Core Types
```typescript
interface ApiRequest {
  key: string;
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  body?: string;
  collectionKey?: string;
}

interface HistoryItem {
  id: string;
  method: ApiRequest['method'];
  url: string;
  status: number | null;
  durationMs: number;
  timestamp: number;
  request: Pick<ApiRequest, 'params' | 'headers' | 'body'>;
  response: { headers: Record<string, string>; body: string; } | null;
}
```

## 🎨 Theme System

### CSS Variables
```css
:root {
  --theme-primary: #1890ff;
  --theme-background: #ffffff;
  --theme-text: #262626;
  --theme-border: #d9d9d9;
  /* ... more variables */
}
```

### Theme Application
```typescript
// Apply theme variables
useEffect(() => {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });
}, [theme]);
```

## 🔐 Authentication Types

```typescript
type AuthType = 'none' | 'apiKey' | 'bearer' | 'basic' | 'jwt';

interface AuthConfig {
  type: AuthType;
  apiKey: { key: string; value: string; addTo: 'header' | 'query' };
  bearer: { token: string };
  basic: { username: string; password: string };
  jwt: { token: string };
}
```

## 📊 Request Templates

### Template Structure
```typescript
interface RequestTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  request: Partial<ApiRequest>;
  tags: string[];
}
```

### Variable Substitution
Templates use `{{variable}}` syntax for dynamic values:
- `{{userId}}` - User ID placeholder
- `{{token}}` - Authentication token
- `{{baseUrl}}` - Base URL for environment

## 🚨 Error Handling Patterns

### Request Error Handling
```typescript
try {
  const result = await sendRequest(config, signal);
  showRequestSuccess(result.durationMs, result.status);
} catch (err: any) {
  showRequestError(err.message, () => handleSendRequest());
}
```

### Validation Patterns
```typescript
const paramsError = useMemo(() => {
  try { 
    JSON.parse(paramsJson || '{}'); 
    return null; 
  } catch (e: any) { 
    return 'Invalid JSON'; 
  }
}, [paramsJson]);
```

## 🎯 Performance Tips

### Memoization
```typescript
// Expensive calculations
const constructedUrl = useMemo(() => {
  // URL construction logic
}, [url, paramsJson, activeEnvVars]);

// Stable callbacks
const handleSendRequest = useCallback(async () => {
  // Request logic
}, [method, url, paramsJson, headers]);
```

### Event Cleanup
```typescript
useEffect(() => {
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [handleKeyDown]);
```

## 🧪 Testing Patterns

### Component Testing
```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName {...props} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Hook Testing
```typescript
describe('useCustomHook', () => {
  it('should return expected values', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe(expectedValue);
  });
});
```

## 🔧 Development Commands

```bash
# Build and start
npm run build && npm start

# Development with hot reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check

# Build for production
npm run build

# Package for distribution
npm run dist
```

## 📦 Build Configuration

### Webpack
- TypeScript compilation
- CSS processing with PostCSS
- Hot module replacement (dev)
- Code splitting and optimization (prod)

### Electron
- Main process: `main.js`
- Preload script: `preload.js`
- Renderer: React application
- IPC for file operations

## 🐛 Common Issues & Solutions

### Build Errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Electron Startup Issues
```bash
# Use npm start, not node main.js
npm start
```

### Theme Not Applying
- Check CSS variables in DevTools
- Clear browser cache
- Restart application

## 📚 Useful Resources

- [Electron Documentation](https://electronjs.org/docs)
- [React Hooks Guide](https://reactjs.org/docs/hooks-intro.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Ant Design Components](https://ant.design/components/overview/)
- [Webpack Configuration](https://webpack.js.org/configuration/)

## 🔍 Debugging Tools

- React Developer Tools
- Chrome DevTools
- Electron DevTools
- VS Code TypeScript support
- ESLint integration

---

**Quick tip**: Use `Ctrl+/` to open the command palette for quick access to all features!
