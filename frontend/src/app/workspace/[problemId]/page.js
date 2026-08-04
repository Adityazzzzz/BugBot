'use client';

/**
 * WorkspacePage component.
 * Integrates Monaco Editor with sandboxed run/submit routes on the backend.
 * Features coding templates, test case console reports, qualitative AI feedback sheets,
 * and inline doubt board postings for students.
 */
import React, { useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useUser } from '../../context/UserContext';
import { 
  Play, Send, HelpCircle, Code2, AlertTriangle, 
  CheckCircle, ChevronRight, X, User, MessageSquareCode
} from 'lucide-react';
import styles from './workspace.module.css';

export default function WorkspacePage({ params }) {
  const { problemId } = params;
  const { activeUser } = useUser();

  // Problem State
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editor State
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const codeCache = useRef({ javascript: '', python: '' });

  // UI Tabs State
  const [leftTab, setLeftTab] = useState('desc'); // 'desc' or 'doubts'
  const [consoleTab, setConsoleTab] = useState('results'); // 'results' or 'ai'

  // Run/Submit States
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);

  // Doubt Board States for this problem
  const [doubts, setDoubts] = useState([]);
  const [showDoubtModal, setShowDoubtModal] = useState(false);
  const [newDoubtTitle, setNewDoubtTitle] = useState('');
  const [newDoubtContent, setNewDoubtContent] = useState('');
  const [doubtError, setDoubtError] = useState('');
  const [isPostingDoubt, setIsPostingDoubt] = useState(false);

  // Fetch Problem Details
  useEffect(() => {
    async function fetchProblem() {
      try {
        const res = await fetch(`/api/problems/${problemId}`);
        if (!res.ok) throw new Error('Failed to load coding assignment details');
        const data = await res.json();
        setProblem(data);
        
        // Initialize boilerplates
        codeCache.current.javascript = data.boilerplateJs;
        codeCache.current.python = data.boilerplatePy;
        setCode(language === 'javascript' ? data.boilerplateJs : data.boilerplatePy);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProblem();
    fetchProblemDoubts();
  }, [problemId]);

  // Fetch Doubt board threads for this problem
  async function fetchProblemDoubts() {
    try {
      const res = await fetch(`/api/doubts/problem/${problemId}`);
      if (res.ok) {
        const data = await res.json();
        setDoubts(data);
      }
    } catch (e) {
      console.error('Failed to fetch doubts:', e);
    }
  }

  // Handle language switch
  const handleLanguageChange = (newLang) => {
    // Cache current code before switching
    codeCache.current[language] = code;
    setLanguage(newLang);
    
    // Load from cache or defaults
    const cached = codeCache.current[newLang];
    if (cached) {
      setCode(cached);
    } else {
      setCode(newLang === 'javascript' ? problem.boilerplateJs : problem.boilerplatePy);
    }
  };

  // Run Code logic (against sample cases)
  const handleRunCode = async () => {
    setIsRunning(true);
    setConsoleTab('results');
    setConsoleOutput({ running: true });
    
    try {
      const res = await fetch('/api/submissions/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, code, language })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');
      
      setConsoleOutput({
        type: 'run',
        results: data.results
      });
    } catch (err) {
      setConsoleOutput({
        type: 'error',
        message: err.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code logic (grade all, triggers AI qualitative review)
  const handleSubmitCode = async () => {
    if (!activeUser) {
      alert('Please select a user profile in the Navbar.');
      return;
    }
    
    setIsSubmitting(true);
    setConsoleTab('results');
    setConsoleOutput({ submitting: true });
    setAiFeedback(null);

    try {
      const res = await fetch('/api/submissions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId,
          studentId: activeUser.id,
          code,
          language
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setConsoleOutput({
        type: 'submit',
        score: data.score,
        status: data.status,
        results: data.results
      });

      if (data.aiFeedback) {
        const feedbackObj = data.aiFeedback;
        setAiFeedback(feedbackObj);
      }
    } catch (err) {
      setConsoleOutput({
        type: 'error',
        message: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Post Doubt logic
  const handlePostDoubt = async (e) => {
    e.preventDefault();
    if (!newDoubtTitle.trim() || !newDoubtContent.trim()) {
      setDoubtError('Title and description cannot be empty.');
      return;
    }

    setDoubtError('');
    setIsPostingDoubt(true);

    try {
      const res = await fetch('/api/doubts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId,
          studentId: activeUser.id,
          title: newDoubtTitle,
          content: newDoubtContent
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit doubt.');
      }

      // Success
      setShowDoubtModal(false);
      setNewDoubtTitle('');
      setNewDoubtContent('');
      fetchProblemDoubts(); // refresh listing
      alert('Your doubt has been posted! An AI response has been generated and sent to the teacher queue for moderation.');
    } catch (err) {
      setDoubtError(err.message);
    } finally {
      setIsPostingDoubt(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner}></div>
        <p>Loading coding environment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.errorScreen} container`}>
        <h2>Failed to initialize workspace</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.workspaceGrid}>
      {/* LEFT COLUMN: Problem Details / Doubts Board */}
      <div className={`${styles.leftCol} glass-card`}>
        <div className={styles.tabHeaders}>
          <button 
            className={`${styles.tabBtn} ${leftTab === 'desc' ? styles.activeTab : ''}`}
            onClick={() => setLeftTab('desc')}
          >
            Problem Description
          </button>
          <button 
            className={`${styles.tabBtn} ${leftTab === 'doubts' ? styles.activeTab : ''}`}
            onClick={() => setLeftTab('doubts')}
          >
            Doubts Board ({doubts.length})
          </button>
        </div>

        <div className={styles.tabContent}>
          {leftTab === 'desc' ? (
            <div className={styles.descriptionSection}>
              <div className={styles.descHeader}>
                <h1>{problem.title}</h1>
                <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </span>
              </div>
              
              <div className={styles.descText}>
                {/* Process description formatting simply for display */}
                {problem.description.split('\n').map((line, idx) => {
                  if (line.startsWith('###')) {
                    return <h3 key={idx}>{line.replace('###', '').trim()}</h3>;
                  }
                  if (line.startsWith('**')) {
                    return <p key={idx} className={styles.highlightLine}>{line.replace(/\*\*/g, '')}</p>;
                  }
                  return <p key={idx}>{line}</p>;
                })}
              </div>

              {/* Example Tests Block */}
              <div className={styles.sampleTestSection}>
                <h3>Public Sample Cases</h3>
                {JSON.parse(problem.testCases).slice(0, 1).map((tc, idx) => (
                  <div key={idx} className={styles.sampleCase}>
                    <div className={styles.sampleLine}>
                      <strong>Input:</strong> <code>{tc.input}</code>
                    </div>
                    <div className={styles.sampleLine}>
                      <strong>Expected Output:</strong> <code>{tc.expectedOutput}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.doubtsSection}>
              <div className={styles.doubtsHeader}>
                <h2>Doubt Resolution Board</h2>
                {activeUser?.role === 'STUDENT' && (
                  <button onClick={() => setShowDoubtModal(true)} className="btn btn-primary">
                    Ask a Question
                  </button>
                )}
              </div>

              <div className={styles.doubtsList}>
                {doubts.length === 0 ? (
                  <div className={styles.emptyDoubts}>
                    <HelpCircle size={40} className={styles.emptyIcon} />
                    <p>No doubts posted yet for this problem.</p>
                    {activeUser?.role === 'STUDENT' && <p className={styles.emptySub}>Be the first to ask a question!</p>}
                  </div>
                ) : (
                  doubts.map((d) => (
                    <div key={d.id} className={styles.doubtCard}>
                      <div className={styles.doubtAuthor}>
                        <User size={14} />
                        <span>{d.student.username} asked:</span>
                      </div>
                      <h4 className={styles.doubtTitle}>{d.title}</h4>
                      <p className={styles.doubtContentText}>{d.content}</p>

                      {/* Display approved answers */}
                      <div className={styles.answersSection}>
                        {d.answers.length === 0 ? (
                          <div className={styles.pendingAnswerTag}>
                            <span>AI drafted response is pending teacher approval.</span>
                          </div>
                        ) : (
                          d.answers.map((ans) => (
                            <div key={ans.id} className={styles.answerCard}>
                              <div className={styles.answerHeader}>
                                <MessageSquareCode size={14} className={styles.mentorIcon} />
                                <strong>Mentor Response (Approved):</strong>
                              </div>
                              <div className={styles.answerBody}>
                                {ans.content.split('\n').map((line, aIdx) => (
                                  <p key={aIdx}>{line}</p>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Code Editor & Console */}
      <div className={styles.rightCol}>
        {/* Editor Controls */}
        <div className={`${styles.editorHeader} glass-card`}>
          <div className={styles.languageSelector}>
            <button 
              className={`${styles.langBtn} ${language === 'javascript' ? styles.langActive : ''}`}
              onClick={() => handleLanguageChange('javascript')}
            >
              JavaScript
            </button>
            <button 
              className={`${styles.langBtn} ${language === 'python' ? styles.langActive : ''}`}
              onClick={() => handleLanguageChange('python')}
            >
              Python
            </button>
          </div>

          <div className={styles.editorActions}>
            <button 
              onClick={handleRunCode} 
              disabled={isRunning || isSubmitting} 
              className="btn btn-secondary"
            >
              <Play size={16} />
              Run Code
            </button>
            <button 
              onClick={handleSubmitCode} 
              disabled={isRunning || isSubmitting} 
              className="btn btn-primary"
            >
              <Send size={16} />
              Submit Solution
            </button>
          </div>
        </div>

        {/* Monaco Editor Component styled as a Mac terminal frame */}
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
                minimap: { enabled: false },
                scrollbar: { vertical: 'visible', horizontal: 'visible' },
                automaticLayout: true,
                padding: { top: 12 }
              }}
            />
          </div>
        </div>

        {/* CONSOLE OUTPUT PANEL */}
        <div className={`${styles.consolePanel} glass-card`}>
          <div className={styles.consoleHeaders}>
            <button 
              className={`${styles.consoleBtn} ${consoleTab === 'results' ? styles.activeConsoleTab : ''}`}
              onClick={() => setConsoleTab('results')}
            >
              Test Outcomes
            </button>
            {aiFeedback && (
              <button 
                className={`${styles.consoleBtn} ${consoleTab === 'ai' ? styles.activeConsoleTab : ''}`}
                onClick={() => setConsoleTab('ai')}
              >
                AI Mentor Feedback
              </button>
            )}
          </div>

          <div className={styles.consoleBody}>
            {consoleTab === 'results' ? (
              <div className={styles.resultsTabContent}>
                {!consoleOutput ? (
                  <p className={styles.emptyConsole}>Your code execution logs will appear here after running tests.</p>
                ) : consoleOutput.running ? (
                  <div className={styles.consoleLoading}>
                    <div className={styles.spinner}></div>
                    <p>Executing sample test cases inside the sandbox...</p>
                  </div>
                ) : consoleOutput.submitting ? (
                  <div className={styles.consoleLoading}>
                    <div className={styles.spinner}></div>
                    <p>Submitting, running full grading suite and requesting AI qualitative analysis...</p>
                  </div>
                ) : consoleOutput.type === 'error' ? (
                  <div className={styles.runError}>
                    <AlertTriangle size={24} />
                    <div>
                      <strong>Failed to execute solution:</strong>
                      <pre>{consoleOutput.message}</pre>
                    </div>
                  </div>
                ) : (
                  <div className={styles.outcomesWrapper}>
                    {consoleOutput.type === 'submit' && (
                      <div className={`${styles.gradingHeader} ${consoleOutput.score === 100 ? styles.passedGrade : styles.failedGrade}`}>
                        {consoleOutput.score === 100 ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
                        <div>
                          <h3>Submission Outcome: {consoleOutput.status}</h3>
                          <p>Grading Score: {consoleOutput.score}% of cases passed</p>
                        </div>
                      </div>
                    )}
                    
                    <div className={styles.testList}>
                      {consoleOutput.results.map((res, i) => (
                        <div key={i} className={`${styles.testItem} ${res.passed ? styles.testPassed : styles.testFailed}`}>
                          <div className={styles.testItemHeader}>
                            <span>Test Case #{i + 1}</span>
                            <span className={res.passed ? styles.txtSuccess : styles.txtDanger}>
                              {res.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          
                          <div className={styles.testItemDetails}>
                            <div><strong>Input:</strong> <code>{res.input}</code></div>
                            <div><strong>Expected:</strong> <code>{res.expected}</code></div>
                            {res.got && <div><strong>Got:</strong> <code>{res.got}</code></div>}
                            {res.error && <div className={styles.txtDanger}><strong>Error:</strong> <pre>{res.error}</pre></div>}
                            {res.logs && (
                              <div className={styles.consoleLogs}>
                                <strong>Stdout logs:</strong>
                                <pre>{res.logs}</pre>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // AI feedback display
              <div className={styles.aiTabContent}>
                <div className={styles.aiStatsRow}>
                  <div className={styles.aiStatCard}>
                    <span className={styles.statLabel}>Readability Score</span>
                    <span className={styles.statVal}>{aiFeedback.readabilityScore} / 10</span>
                  </div>
                  <div className={styles.aiStatCard}>
                    <span className={styles.statLabel}>Time Complexity</span>
                    <span className={styles.statVal}>{aiFeedback.timeComplexity}</span>
                  </div>
                  <div className={styles.aiStatCard}>
                    <span className={styles.statLabel}>Space Complexity</span>
                    <span className={styles.statVal}>{aiFeedback.spaceComplexity}</span>
                  </div>
                </div>

                <div className={styles.aiFeedbackGrid}>
                  <div className={styles.feedbackSection}>
                    <h4 className={styles.txtSuccess}>Strengths</h4>
                    <ul>
                      {aiFeedback.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                    </ul>
                  </div>

                  {aiFeedback.bugs && aiFeedback.bugs.length > 0 && (
                    <div className={styles.feedbackSection}>
                      <h4 className={styles.txtDanger}>Bugs & Deficiencies</h4>
                      <ul>
                        {aiFeedback.bugs.map((bug, idx) => <li key={idx}>{bug}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className={styles.feedbackSection}>
                    <h4 className={styles.txtPrimary}>Recommended Improvements</h4>
                    <ul>
                      {aiFeedback.improvements.map((imp, idx) => <li key={idx}>{imp}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* POST DOUBT MODAL */}
      {showDoubtModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} glass-card`}>
            <div className={styles.modalHeader}>
              <h3>Ask the Doubt Board</h3>
              <button onClick={() => setShowDoubtModal(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePostDoubt} className={styles.modalForm}>
              {doubtError && <div className={styles.modalError}>{doubtError}</div>}
              
              <div className={styles.formGroup}>
                <label>Question Summary (Title)</label>
                <input 
                  type="text" 
                  value={newDoubtTitle}
                  onChange={(e) => setNewDoubtTitle(e.target.value)}
                  placeholder="e.g. Why does my loop fail on negative targets?"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Detailed Question Description</label>
                <textarea 
                  rows={5}
                  value={newDoubtContent}
                  onChange={(e) => setNewDoubtContent(e.target.value)}
                  placeholder="Explain exactly what issues you are encountering, or details of your logic flow."
                  required
                ></textarea>
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowDoubtModal(false)} 
                  className="btn btn-secondary"
                  disabled={isPostingDoubt}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isPostingDoubt}
                >
                  {isPostingDoubt ? 'Posting Question...' : 'Post Doubt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
