'use client';

import { useState, useEffect, useCallback } from 'react';
import { PersonaId, getVisibleToolIds, isValidPersonaId } from '@/lib/persona-config';

type UserPersonaData = {
  user_id: string;
  persona_id: PersonaId;
  enabled_tool_ids: string[];
  show_all_tools: boolean;
  persona_selected_at: string | null;
};

type UseUserPersonaReturn = {
  persona: PersonaId | null;
  enabledToolIds: string[];
  showAllTools: boolean;
  isLoading: boolean;
  isPersonaSelected: boolean;
  visibleToolIds: string[] | null; // null = 全ツール表示
  setPersona: (personaId: PersonaId) => Promise<void>;
  addTool: (toolId: string) => Promise<void>;
  removeTool: (toolId: string) => Promise<void>;
  toggleShowAll: () => Promise<void>;
  skipSelection: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function useUserPersona(userId?: string): UseUserPersonaReturn {
  const [data, setData] = useState<UserPersonaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPersona = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/user-persona');
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('ペルソナデータ取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPersona();
  }, [fetchPersona]);

  const setPersona = useCallback(async (personaId: PersonaId) => {
    if (!isValidPersonaId(personaId)) return;

    try {
      const method = data ? 'PATCH' : 'POST';
      const res = await fetch('/api/user-persona', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona_id: personaId }),
      });
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('ペルソナ設定エラー:', err);
    }
  }, [data]);

  const addTool = useCallback(async (toolId: string) => {
    if (!data) return;
    const newTools = [...new Set([...data.enabled_tool_ids, toolId])];

    try {
      const res = await fetch('/api/user-persona', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled_tool_ids: newTools }),
      });
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('ツール追加エラー:', err);
    }
  }, [data]);

  const removeTool = useCallback(async (toolId: string) => {
    if (!data) return;
    const newTools = data.enabled_tool_ids.filter((id) => id !== toolId);

    try {
      const res = await fetch('/api/user-persona', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled_tool_ids: newTools }),
      });
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('ツール削除エラー:', err);
    }
  }, [data]);

  const toggleShowAll = useCallback(async () => {
    if (!data) return;

    try {
      const res = await fetch('/api/user-persona', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_all_tools: !data.show_all_tools }),
      });
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('表示切替エラー:', err);
    }
  }, [data]);

  const skipSelection = useCallback(async () => {
    try {
      const method = data ? 'PATCH' : 'POST';
      const body = data
        ? { show_all_tools: true, mark_selected: true }
        : { persona_id: 'startup', show_all_tools: true };

      const res = await fetch('/api/user-persona', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('スキップエラー:', err);
    }
  }, [data]);

  const persona = data?.persona_id as PersonaId ?? null;
  const enabledToolIds = data?.enabled_tool_ids ?? [];
  const showAllTools = data?.show_all_tools ?? false;
  const isPersonaSelected = !!data?.persona_selected_at;

  const visibleToolIds = persona
    ? getVisibleToolIds(persona, enabledToolIds, showAllTools)
    : null;

  return {
    persona,
    enabledToolIds,
    showAllTools,
    isLoading,
    isPersonaSelected,
    visibleToolIds,
    setPersona,
    addTool,
    removeTool,
    toggleShowAll,
    skipSelection,
    refresh: fetchPersona,
  };
}
