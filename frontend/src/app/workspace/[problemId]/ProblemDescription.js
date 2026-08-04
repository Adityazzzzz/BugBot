import React from 'react';
import styles from './workspace.module.css';

export default function ProblemDescription({problem}){
  return (
    <div className={styles.descriptionSection}>
      <div className={styles.descHeader}>
        <h1>{problem.title}</h1>
        <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
          {problem.difficulty}
        </span>
      </div>
      
      <div className={styles.descText}>
        {problem.description.split('\n').map((line, idx) => {
          if (line.startsWith('###')) return <h3 key={idx}>{line.replace('###', '').trim()}</h3>;
          if (line.startsWith('**')) return <p key={idx} className={styles.highlightLine}>{line.replace(/\*\*/g, '')}</p>;
          return <p key={idx}>{line}</p>;
        })}
      </div>

      <div className={styles.sampleTestSection}>
        <h3>Public Sample Cases</h3>
        {JSON.parse(problem.testCases).slice(0, 1).map((tc, idx) => (
          <div key={idx} className={styles.sampleCase}>
            <div><strong>Input:</strong> <code>{tc.input}</code></div>
            <div><strong>Expected Output:</strong> <code>{tc.expectedOutput}</code></div>
          </div>
        ))}
      </div>
    </div>
  );
}