import React from 'react';
import Editor from '@monaco-editor/react';
import {Play,Send} from 'lucide-react';
import styles from './workspace.module.css';

export default function EditorPanel({ 
  problem, language, code, setCode, onLanguageChange, 
  onRun, onSubmit, isRunning, isSubmitting 
}){
  return (
    <>
      <div className={`${styles.editorHeader} glass-card`}>
        <div className={styles.languageSelector}>
          <button 
            className={`${styles.langBtn} ${language === 'javascript' ? styles.langActive : ''}`}
            onClick={() => onLanguageChange('javascript')}
          >
            JavaScript
          </button>
          <button 
            className={`${styles.langBtn} ${language === 'python' ? styles.langActive : ''}`}
            onClick={() => onLanguageChange('python')}
          >
            Python
          </button>
        </div>

        <div className={styles.editorActions}>
          <button onClick={onRun} disabled={isRunning || isSubmitting} className="btn btn-secondary">
            <Play size={14} /> Run Code
          </button>
          <button onClick={onSubmit} disabled={isRunning || isSubmitting} className="btn btn-primary">
            <Send size={14} /> Submit Solution
          </button>
        </div>
      </div>

      <div className={styles.editorFrame}>
        <div className={styles.frameHeader}>
          <div className="window-controls">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <span className={styles.frameFileTitle}>
        {problem.title.replace(/\s+/g, '_')}.{language === 'javascript' ? 'js' : 'py'}
          </span>
        </div>
        <div className={styles.editorWrapper}>
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 14,
              fontFamily: 'JetBrains Mono',
              minimap:{ enabled: false },
              scrollbar:{ vertical: 'visible', horizontal: 'visible' },
              automaticLayout: true,
              padding:{ top: 12 }
            }}
          />
        </div>
      </div>
    </>
  );
}