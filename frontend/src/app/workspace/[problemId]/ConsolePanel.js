import React from 'react';
import {AlertTriangle,CheckCircle} from 'lucide-react';
import styles from './workspace.module.css';

export default function ConsolePanel({consoleTab,setConsoleTab,consoleOutput,aiFeedback}){
  return (
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
                <p>Submitting,running full grading suite and requesting AI analysis...</p>
              </div>
            ) : consoleOutput.type === 'error' ? (
              <div className={styles.runError}>
                <AlertTriangle size={24} style={{ flexShrink: 0 }} />
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
                  {consoleOutput.results.map((res,i) => (
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
                <ul>{aiFeedback.strengths.map((str,idx) => <li key={idx}>{str}</li>)}</ul>
              </div>
              {aiFeedback.bugs && aiFeedback.bugs.length > 0 && (
                <div className={styles.feedbackSection}>
                  <h4 className={styles.txtDanger}>Bugs & Deficiencies</h4>
                  <ul>{aiFeedback.bugs.map((bug,idx) => <li key={idx}>{bug}</li>)}</ul>
                </div>
              )}
              <div className={styles.feedbackSection}>
                <h4 className={styles.txtPrimary}>Recommended Improvements</h4>
                <ul>{aiFeedback.improvements.map((imp,idx) => <li key={idx}>{imp}</li>)}</ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}