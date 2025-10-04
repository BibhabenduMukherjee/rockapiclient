// Global polyfill for Node.js compatibility
if (typeof global === 'undefined') {
  (window as any).global = globalThis;
}

import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import './theme.css';
import App from './App';
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App/>)