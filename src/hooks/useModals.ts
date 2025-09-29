import { useState, useCallback } from 'react';
import { CodeGenType } from '../utils/codeGenerator';

export interface ModalState {
  // Code generation modals
  isEnhancedCodeGenVisible: boolean;
  setIsEnhancedCodeGenVisible: (visible: boolean) => void;
  isCodeGenModalVisible: boolean;
  setIsCodeGenModalVisible: (visible: boolean) => void;
  codeGenType: CodeGenType;
  setCodeGenType: (type: CodeGenType) => void;
  
  // Feature modals
  isCommandPaletteVisible: boolean;
  setIsCommandPaletteVisible: (visible: boolean) => void;
  isTemplatesModalVisible: boolean;
  setIsTemplatesModalVisible: (visible: boolean) => void;
  isThemeSettingsVisible: boolean;
  setIsThemeSettingsVisible: (visible: boolean) => void;
  isTourVisible: boolean;
  setIsTourVisible: (visible: boolean) => void;
  isMockServerManagerVisible: boolean;
  setIsMockServerManagerVisible: (visible: boolean) => void;
  
  // Mood selector
  showMoodSelector: boolean;
  setShowMoodSelector: (show: boolean) => void;
}

export function useModals(): ModalState {
  // Code generation modals
  const [isEnhancedCodeGenVisible, setIsEnhancedCodeGenVisible] = useState(false);
  const [isCodeGenModalVisible, setIsCodeGenModalVisible] = useState(false);
  const [codeGenType, setCodeGenType] = useState<CodeGenType>('curl');
  
  // Feature modals
  const [isCommandPaletteVisible, setIsCommandPaletteVisible] = useState(false);
  const [isTemplatesModalVisible, setIsTemplatesModalVisible] = useState(false);
  const [isThemeSettingsVisible, setIsThemeSettingsVisible] = useState(false);
  const [isTourVisible, setIsTourVisible] = useState(false);
  const [isMockServerManagerVisible, setIsMockServerManagerVisible] = useState(false);
  
  // Mood selector
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  return {
    isEnhancedCodeGenVisible,
    setIsEnhancedCodeGenVisible,
    isCodeGenModalVisible,
    setIsCodeGenModalVisible,
    codeGenType,
    setCodeGenType,
    isCommandPaletteVisible,
    setIsCommandPaletteVisible,
    isTemplatesModalVisible,
    setIsTemplatesModalVisible,
    isThemeSettingsVisible,
    setIsThemeSettingsVisible,
    isTourVisible,
    setIsTourVisible,
    isMockServerManagerVisible,
    setIsMockServerManagerVisible,
    showMoodSelector,
    setShowMoodSelector
  };
}

export function useModalActions() {
  const openCommandPalette = useCallback(() => {
    // Implementation for opening command palette
  }, []);

  const openTemplates = useCallback(() => {
    // Implementation for opening templates
  }, []);

  const openThemeSettings = useCallback(() => {
    // Implementation for opening theme settings
  }, []);

  const openTour = useCallback(() => {
    // Implementation for opening tour
  }, []);

  const openCodeGenerator = useCallback(() => {
    // Implementation for opening code generator
  }, []);

  return {
    openCommandPalette,
    openTemplates,
    openThemeSettings,
    openTour,
    openCodeGenerator
  };
}
