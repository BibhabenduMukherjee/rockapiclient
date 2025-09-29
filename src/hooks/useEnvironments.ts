import { useEffect, useState } from 'react';
import { EnvironmentsState, EnvironmentItem } from '../types';

export function useEnvironments() {
  const [state, setState] = useState<EnvironmentsState>({ activeKey: undefined, items: [] });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // @ts-ignore
    if (window.electronAPI?.loadEnvironments) {
      // @ts-ignore
      window.electronAPI.loadEnvironments().then((s: EnvironmentsState) => {
        setState(s || { activeKey: undefined, items: [] });
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // @ts-ignore
    if (window.electronAPI?.saveEnvironments && !loading) {
      // @ts-ignore
      window.electronAPI.saveEnvironments(state);
    }
  }, [state, loading]);

  const addEnvironment = (name: string) => {
    const item: EnvironmentItem = { key: `env-${Date.now()}`, name, variables: {} };
    setState(s => ({ ...s, items: [...s.items, item] }));
  };

  const removeEnvironment = (key: string) => {
    setState(s => ({
      activeKey: s.activeKey === key ? undefined : s.activeKey,
      items: s.items.filter(i => i.key !== key),
    }));
  };

  const setActiveEnvironment = (key?: string) => setState(s => ({ ...s, activeKey: key }));

  const updateVariables = (key: string, variables: Record<string, string>) => {
    setState(s => ({
      ...s,
      items: s.items.map(i => i.key === key ? { ...i, variables } : i),
    }));
  };

  return { state, loading, addEnvironment, removeEnvironment, setActiveEnvironment, updateVariables };
}

export function substituteTemplate(input: string, variables: Record<string, string>) {
  if (!input) return input;
  return input.replace(/\{\{\s*([A-Za-z0-9_\.\-]+)\s*\}\}/g, (_m, key) => {
    const v = variables[key];
    return v != null ? String(v) : _m;
  });
}

