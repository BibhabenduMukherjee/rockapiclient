import React, { useState, useMemo, useEffect } from 'react';
import { Typography } from 'antd';
import { CodeGenConfig, CodeGenType, generateCode } from '../utils/codeGenerator';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface EnhancedCodeGeneratorProps {
  visible: boolean;
  onClose: () => void;
  config: CodeGenConfig;
}

const languageCategories = {
  'Command Line': [
    { value: 'curl', label: 'cURL', icon: '🌐', color: '#1890ff' },
    { value: 'httpie', label: 'HTTPie', icon: '🔧', color: '#52c41a' }
  ],
  'Web Frontend': [
    { value: 'fetch', label: 'JavaScript (fetch)', icon: '⚡', color: '#fadb14' },
    { value: 'axios', label: 'JavaScript (axios)', icon: '📦', color: '#722ed1' },
    { value: 'react', label: 'React (hooks)', icon: '⚛️', color: '#61dafb' },
    { value: 'vue', label: 'Vue.js', icon: '💚', color: '#4fc08d' },
    { value: 'angular', label: 'Angular', icon: '🔴', color: '#dd0031' }
  ],
  'Backend Languages': [
    { value: 'python', label: 'Python', icon: '🐍', color: '#3776ab' },
    { value: 'java', label: 'Java', icon: '☕', color: '#f89820' },
    { value: 'csharp', label: 'C#', icon: '🔷', color: '#239120' },
    { value: 'go', label: 'Go', icon: '🐹', color: '#00add8' },
    { value: 'php', label: 'PHP', icon: '🐘', color: '#777bb4' },
    { value: 'ruby', label: 'Ruby', icon: '💎', color: '#cc342d' },
    { value: 'rust', label: 'Rust', icon: '🦀', color: '#000000' }
  ],
  'Mobile Development': [
    { value: 'swift', label: 'Swift (iOS)', icon: '🍎', color: '#fa7343' },
    { value: 'kotlin', label: 'Kotlin (Android)', icon: '🟣', color: '#7f52ff' },
    { value: 'dart', label: 'Dart (Flutter)', icon: '🎯', color: '#0175c2' }
  ],
  'Data Science': [
    { value: 'r', label: 'R', icon: '📊', color: '#276dc3' }
  ],
  'DevOps': [
    { value: 'powershell', label: 'PowerShell', icon: '💙', color: '#012456' }
  ]
};

// Language mapping for Prism.js
const getPrismLanguage = (language: CodeGenType): string => {
  const languageMap: Record<CodeGenType, string> = {
    'python': 'python',
    'java': 'java',
    'csharp': 'csharp',
    'go': 'go',
    'php': 'php',
    'ruby': 'ruby',
    'rust': 'rust',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'dart': 'dart',
    'r': 'r',
    'powershell': 'powershell',
    'curl': 'bash',
    'httpie': 'bash',
    'fetch': 'javascript',
    'axios': 'javascript',
    'react': 'javascript',
    'vue': 'javascript',
    'angular': 'typescript'
  };

  return languageMap[language] || 'text';
};

export default function EnhancedCodeGenerator({ visible, onClose, config }: EnhancedCodeGeneratorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<CodeGenType>('python');
  const [selectedCategory, setSelectedCategory] = useState<string>('Backend Languages');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    const code = generateCode(config, selectedLanguage);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleLanguageSelect = (language: CodeGenType) => {
    setSelectedLanguage(language);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const currentLanguages = languageCategories[selectedCategory as keyof typeof languageCategories] || [];
  const generatedCode = generateCode(config, selectedLanguage);
  const prismLanguage = getPrismLanguage(selectedLanguage);
  
  // Use highlight.js for syntax highlighting
  const highlightedCode = useMemo(() => {
    try {
      if (hljs.getLanguage(prismLanguage)) {
        return hljs.highlight(generatedCode, { language: prismLanguage }).value;
      }
      return generatedCode;
    } catch (error) {
      console.warn(`Syntax highlighting failed for ${prismLanguage}:`, error);
      return generatedCode;
    }
  }, [generatedCode, prismLanguage]);

  // Re-highlight when language changes
  useEffect(() => {
    if (visible) {
      // Force re-highlight when modal becomes visible
      setTimeout(() => {
        const codeElement = document.querySelector('.code-content code');
        if (codeElement) {
          codeElement.innerHTML = highlightedCode;
        }
      }, 0);
    }
  }, [highlightedCode, visible]);

  if (!visible) return null;

  return (
    <div className="enhanced-code-generator-overlay">
      <div className="enhanced-code-generator-modal">
        {/* Header */}
        <div className="code-generator-header">
          <h2>🚀 Generate Code</h2>
          <p>Choose your programming language and get ready-to-use code</p>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="code-generator-content">
          {/* Language Categories */}
          <div className="language-categories">
            <h3>Categories</h3>
            <div className="category-tabs">
              {Object.keys(languageCategories).map(category => (
                <button
                  key={category}
                  className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Language Selection */}
          <div className="language-selection">
            <h3>Languages</h3>
            <div className="language-grid">
              {currentLanguages.map(language => (
                <button
                  key={language.value}
                  className={`language-option ${selectedLanguage === language.value ? 'selected' : ''}`}
                  onClick={() => handleLanguageSelect(language.value as CodeGenType)}
                  style={{ '--language-color': language.color } as React.CSSProperties}
                >
                  <span className="language-icon">{language.icon}</span>
                  <span className="language-label">{language.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Preview */}
          <div className="code-preview-section">
            <div className="code-preview-header">
              <h3>Generated Code</h3>
              <button 
                className={`copy-button ${copied ? 'copied' : ''}`}
                onClick={handleCopyCode}
              >
                {copied ? '✅ Copied!' : '📋 Copy Code'}
              </button>
            </div>
            <div className="code-preview">
              <div
                className="code-content"
                style={{
                  height: '100%',
                  maxHeight: '600px',
                  overflow: 'auto',
                  margin: 0,
                  padding: '16px',
                  background: '#1e1e1e',
                  color: '#d4d4d4',
                  fontFamily: 'JetBrains Mono, Fira Code, Cascadia Code, SF Mono, Monaco, Inconsolata, Roboto Mono, Source Code Pro, monospace',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  wordBreak: 'break-all',
                  border: 'none',
                  borderRadius: '4px'
                }}
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .enhanced-code-generator-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .enhanced-code-generator-modal {
          background: var(--theme-background);
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          width: 90vw;
          max-width: 1200px;
          height: 85vh;
          min-height: 700px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid var(--theme-border);
        }

        .code-generator-header {
          padding: 24px;
          border-bottom: 1px solid var(--theme-border);
          position: relative;
          background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
          color: white;
        }

        .code-generator-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 700;
        }

        .code-generator-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .close-button {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .code-generator-content {
          display: grid;
          grid-template-columns: 250px 300px 1fr;
          height: 100%;
          min-height: 500px;
          overflow: hidden;
          flex: 1;
          width: 100%;
          max-width: 100%;
        }

        .language-categories {
          padding: 20px;
          border-right: 1px solid var(--theme-border);
          background: var(--theme-surface);
        }

        .language-categories h3 {
          margin: 0 0 24px 0;
          color: var(--theme-text);
          font-size: 16px;
          font-weight: 600;
        }

        .category-tabs {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-tab {
          padding: 12px 16px;
          border: 1px solid var(--theme-border);
          background: var(--theme-background);
          color: var(--theme-text);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          text-align: left;
        }

        .category-tab:hover {
          background: var(--theme-primary);
          color: white;
          transform: translateX(4px) translateY(2px);
        }

        .category-tab.active {
          background: var(--theme-primary);
          color: white;
          border-color: var(--theme-primary);
        }

        .language-selection {
          padding: 20px;
          border-right: 1px solid var(--theme-border);
          background: var(--theme-background);
          overflow-y: auto;
          max-width: 300px;
        }

        .language-selection h3 {
          margin: 0 0 24px 0;
          color: var(--theme-text);
          font-size: 16px;
          font-weight: 600;
        }

        .language-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          max-height: 460px;
          overflow-y: auto;
          width: 100%;
          padding-bottom: 8px;
        }

        .language-grid::-webkit-scrollbar {
          display: none;
        }

        .language-grid {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .language-option {
          padding: 16px;
          border: 1px solid var(--theme-border);
          background: var(--theme-background);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        .language-option:hover {
          border-color: var(--language-color);
          transform: translateY(2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .language-option.selected {
          border-color: var(--language-color);
          background: var(--language-color);
          color: white;
          transform: translateY(2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .language-icon {
          font-size: 24px;
        }

        .language-label {
          font-size: 14px;
          font-weight: 500;
        }

        .code-preview-section {
          padding: 20px;
          background: var(--theme-background);
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 500px;
          flex: 1;
        }

        .code-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .code-preview-header h3 {
          margin: 0;
          color: var(--theme-text);
          font-size: 16px;
          font-weight: 600;
        }

        .copy-button {
          padding: 8px 16px;
          background: var(--theme-primary);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .copy-button:hover {
          background: var(--theme-secondary);
          transform: scale(1.05);
        }

        .copy-button.copied {
          background: #52c41a;
        }

        .code-preview {
          flex: 1;
          border: 1px solid var(--theme-border);
          border-radius: 8px;
          overflow: hidden;
          background: #1e1e1e;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 400px;
          max-width: 100%;
          width: 100%;
        }

        .code-content::-webkit-scrollbar {
          width: 8px;
        }

        .code-content::-webkit-scrollbar-track {
          background: #2d2d2d;
          border-radius: 4px;
        }

        .code-content::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 4px;
        }

        .code-content::-webkit-scrollbar-thumb:hover {
          background: #777;
        }

        /* Prism.js syntax highlighting is handled by the imported CSS */

        @media (max-width: 768px) {
          .code-generator-content {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr;
          }
          
          .language-categories,
          .language-selection {
            border-right: none;
            border-bottom: 1px solid var(--theme-border);
          }
        }
      `}</style>
    </div>
  );
}
