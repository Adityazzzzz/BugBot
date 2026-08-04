'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Code, HelpCircle, Terminal, Layers, 
  Activity, Shield, Play, HelpCircle as HelpIcon, FileCode, CheckCircle2 
} from 'lucide-react';
import styles from './page.module.css';

export default function HomePage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProblems() {
      try {
        const res = await fetch('http://localhost:5000/api/problems');
        if (!res.ok) {
          throw new Error('Server responded with an error');
        }
        const data = await res.json();
        setProblems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProblems();
  }, []);

  // Mock activity stream log for high-fidelity SaaS dashboard
  const activities = [
    { user: 'john_student', action: 'submitted solution for', target: 'Two Sum', status: 'PASSED', score: 100, time: '3 mins ago' },
    { user: 'sarah_teacher', action: 'approved AI reply on doubt:', target: 'Loop boundaries', status: 'MODERATED', score: null, time: '12 mins ago' },
    { user: 'john_student', action: 'submitted solution for', target: 'Palindrome Number', status: 'FAILED', score: 33, time: '25 mins ago' },
    { user: 'AI Mentor', action: 'generated feedback for', target: 'Reverse String', status: 'COMPLETED', score: null, time: '40 mins ago' },
  ];

  return (
    <div className={`${styles.dashboardContainer} container animated-fade`}>
      {/* LEFT COLUMN: Main Bento Grid Content */}
      <div className={styles.mainContent}>
        {/* Hero Area */}
        <section className={styles.hero}>
          <div className={styles.topBadge}>
            <span className={styles.badgePulse}></span>
            <span>Automated Grading Portal Active</span>
          </div>
          <h1 className={styles.title}>
            Compile Code. Resolve Doubts. <br />
            <span className={styles.glowText}>Accelerated by AI.</span>
          </h1>
          <p className={styles.subtitle}>
            A safe, sandboxed environment for practicing Python & JavaScript. Get instant test outcomes and structured AI qualitative feedback on complexity and style.
          </p>
        </section>

        {/* Bento Grid Header */}
        <div className={styles.sectionHeader}>
          <h2>
            <Terminal size={18} className={styles.sectionIcon} />
            Coding Challenges
          </h2>
        </div>

        {loading ? (
          <div className={styles.loaderWrapper}>
            <div className={styles.spinner}></div>
            <p>Retrieving assignments...</p>
          </div>
        ) : error ? (
          <div className={styles.errorCard}>
            <p className={styles.errorMsg}>Grading Backend Offline</p>
            <p className={styles.errorHint}>Please ensure the Express server is running on port 5000: <code>npm run dev</code> inside the backend folder.</p>
          </div>
        ) : (
          <div className={styles.bentoGrid}>
            {problems.map((prob) => {
              let tcCount = 0;
              try {
                tcCount = prob.testCases ? JSON.parse(prob.testCases).length : 0;
              } catch (e) {
                console.error("Failed to parse testCases on list card:", e);
              }
              
              // Custom code block preview depending on problem to make it look highly tailored and human-made
              let codePreview = '';
              if (prob.id === 'problem-two-sum') {
                codePreview = `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        # ...`;
              } else if (prob.id === 'problem-palindrome-number') {
                codePreview = `function isPalindrome(x) {\n  if (x < 0) return false;\n  let rev = 0, temp = x;\n  # ...`;
              } else {
                codePreview = `def reverseString(s):\n    left, right = 0, len(s)-1\n    while left < right:\n        # ...`;
              }

              return (
                <div key={prob.id} className={`${styles.bentoCard} glass-card`}>
                  <div className={styles.bentoCardBody}>
                    <div className={styles.cardHeader}>
                      <span className={`badge badge-${prob.difficulty.toLowerCase()}`}>
                        {prob.difficulty}
                      </span>
                      <div className={styles.langTagsRow}>
                        <span className={styles.langTag}>JS</span>
                        <span className={styles.langTag}>Python</span>
                      </div>
                    </div>

                    <h3 className={styles.problemTitle}>{prob.title}</h3>
                    <p className={styles.problemDesc}>
                      {prob.description.split('\n')[0].replace(/[`*]/g, '')}
                    </p>

                    {/* Integrated Syntax Highlighted Mock Code Block */}
                    <div className={styles.codeSnippetBlock}>
                      <pre><code>{codePreview}</code></pre>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.tcLabel}>
                      <strong>{tcCount}</strong> test cases
                    </span>
                    <Link href={`/workspace/${prob.id}`} className="btn btn-primary">
                      Solve Challenge
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Sidebar Stats & Activity (SaaS Look) */}
      <aside className={styles.sidebar}>
        {/* Sandbox Metrics Panel */}
        <div className={`${styles.sidebarWidget} glass-card`}>
          <div className={styles.widgetHeader}>
            <Shield size={16} className={styles.widgetIcon} />
            <h3>Sandbox Environment</h3>
          </div>
          <div className={styles.metricsList}>
            <div className={styles.metricItem}>
              <span>Status</span>
              <span className={styles.metricValSuccess}>ONLINE</span>
            </div>
            <div className={styles.metricItem}>
              <span>Timeout Limit</span>
              <span className={styles.metricVal}>2.0s</span>
            </div>
            <div className={styles.metricItem}>
              <span>Compiler Checks</span>
              <span className={styles.metricVal}>14 active</span>
            </div>
            <div className={styles.metricItem}>
              <span>Gemini Engine</span>
              <span className={styles.metricVal}>gemini-2.5-flash</span>
            </div>
            <div className={styles.metricItem}>
              <span>Injection Guard</span>
              <span className={styles.metricValSuccess}>SHIELD ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Live Activity Stream Panel */}
        <div className={`${styles.sidebarWidget} glass-card`}>
          <div className={styles.widgetHeader}>
            <Activity size={16} className={styles.widgetIcon} style={{ color: 'var(--accent-purple)' }} />
            <h3>Activity Stream</h3>
          </div>
          <div className={styles.activityList}>
            {activities.map((act, index) => (
              <div key={index} className={styles.activityItem}>
                <div className={styles.activityIndicator}>
                  {act.status === 'PASSED' ? (
                    <span className={`${styles.statusDot} ${styles.dotPassed}`}></span>
                  ) : act.status === 'FAILED' ? (
                    <span className={`${styles.statusDot} ${styles.dotFailed}`}></span>
                  ) : (
                    <span className={`${styles.statusDot} ${styles.dotNeutral}`}></span>
                  )}
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>
                    <strong>{act.user}</strong> {act.action}{' '}
                    <span className={styles.activityTarget}>{act.target}</span>
                  </p>
                  <div className={styles.activityMeta}>
                    <span>{act.time}</span>
                    {act.score !== null && (
                      <span className={act.score === 100 ? styles.txtSuccess : styles.txtDanger}>
                        ({act.score}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
