'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/store/editor-store';

export function KeyboardShortcuts() {
  const {
    selectedElementId,
    deleteElement,
    duplicateElement,
    copyElement,
    pasteElement,
    undo,
    redo,
    saveHistory,
    selectElement,
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        deleteElement(selectedElementId);
        saveHistory();
      }

      // Duplicate (Ctrl/Cmd + D)
      if (ctrlKey && e.key === 'd' && selectedElementId) {
        e.preventDefault();
        duplicateElement(selectedElementId);
        saveHistory();
      }

      // Copy (Ctrl/Cmd + C)
      if (ctrlKey && e.key === 'c' && selectedElementId) {
        e.preventDefault();
        copyElement(selectedElementId);
      }

      // Paste (Ctrl/Cmd + V)
      if (ctrlKey && e.key === 'v') {
        e.preventDefault();
        pasteElement();
        saveHistory();
      }

      // Undo (Ctrl/Cmd + Z)
      if (ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo (Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y)
      if ((ctrlKey && e.shiftKey && e.key === 'z') || (ctrlKey && e.key === 'y')) {
        e.preventDefault();
        redo();
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        selectElement(null);
      }

      // Save (Ctrl/Cmd + S)
      if (ctrlKey && e.key === 's') {
        e.preventDefault();
        // TODO: Implement save to file
        console.log('Save triggered');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedElementId,
    deleteElement,
    duplicateElement,
    copyElement,
    pasteElement,
    undo,
    redo,
    saveHistory,
    selectElement,
  ]);

  return null;
}

