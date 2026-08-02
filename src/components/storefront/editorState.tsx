'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import { Device, SiteBlock } from './blockTypes';

interface ContextMenuState {
  x: number;
  y: number;
  blockId: string;
}

interface EditorStateValue {
  device: Device;
  setDevice: (d: Device) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  leftTab: 'blocks' | 'layers' | 'pages' | 'saved';
  setLeftTab: (t: 'blocks' | 'layers' | 'pages' | 'saved') => void;
  rightTab: 'content' | 'style';
  setRightTab: (t: 'content' | 'style') => void;
  clipboard: SiteBlock | null;
  setClipboard: (b: SiteBlock | null) => void;
  contextMenu: ContextMenuState | null;
  openContextMenu: (state: ContextMenuState) => void;
  closeContextMenu: () => void;
}

const EditorStateContext = createContext<EditorStateValue | null>(null);

export function EditorStateProvider({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<Device>('desktop');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<'blocks' | 'layers' | 'pages' | 'saved'>('blocks');
  const [rightTab, setRightTab] = useState<'content' | 'style'>('content');
  const [clipboard, setClipboard] = useState<SiteBlock | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const value = useMemo<EditorStateValue>(() => ({
    device, setDevice,
    selectedId, setSelectedId,
    leftTab, setLeftTab,
    rightTab, setRightTab,
    clipboard, setClipboard,
    contextMenu,
    openContextMenu: (state) => setContextMenu(state),
    closeContextMenu: () => setContextMenu(null),
  }), [device, selectedId, leftTab, rightTab, clipboard, contextMenu]);

  return <EditorStateContext.Provider value={value}>{children}</EditorStateContext.Provider>;
}

export function useEditorState(): EditorStateValue {
  const ctx = useContext(EditorStateContext);
  if (!ctx) throw new Error('useEditorState must be used within EditorStateProvider');
  return ctx;
}
