'use client';

import { useEffect, useRef } from 'react';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { bracketMatching, indentOnInput, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { Compartment, EditorState } from '@codemirror/state';
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { classHighlighter } from '@lezer/highlight';
import type { RunLanguage } from './engine';

interface CodeEditorProps {
  value: string;
  language: RunLanguage;
  onChange: (value: string) => void;
  /** Ctrl/Cmd + Enter. */
  onRun?: () => void;
  ariaLabel?: string;
}

const languageExtension = (language: RunLanguage) => (language === 'cpp' ? cpp() : python());

/**
 * CodeMirror 6 editor. Colors come from the site's CSS variables and the
 * `.tok-*` classes in global.css, so it follows the light/dark theme.
 */
export function CodeEditor({ value, language, onChange, onRun, ariaLabel }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const languageCompartment = useRef(new Compartment());
  const callbacks = useRef({ onChange, onRun });

  useEffect(() => {
    callbacks.current = { onChange, onRun };
  });

  // Create the editor once; later prop changes are dispatched below.
  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          drawSelection(),
          history(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          indentUnit.of('    '),
          EditorState.tabSize.of(4),
          syntaxHighlighting(classHighlighter),
          languageCompartment.current.of(languageExtension(language)),
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                callbacks.current.onRun?.();
                return true;
              },
            },
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...historyKeymap,
            indentWithTab,
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) callbacks.current.onChange(update.state.doc.toString());
          }),
          EditorView.contentAttributes.of({
            'aria-label': ariaLabel ?? 'Editor kode',
            autocapitalize: 'off',
            autocorrect: 'off',
            spellcheck: 'false',
          }),
        ],
      }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- created once, synced below
  }, []);

  useEffect(() => {
    viewRef.current?.dispatch({ effects: languageCompartment.current.reconfigure(languageExtension(language)) });
  }, [language]);

  // Replace the document when the value changes from outside (Reset, language switch).
  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.state.doc.toString() === value) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
  }, [value]);

  return <div ref={hostRef} className="playground-editor" />;
}
