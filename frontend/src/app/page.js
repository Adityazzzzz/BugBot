'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Terminal, Activity, Shield, CheckCircle2, Award, Clock
} from 'lucide-react';
import { useUser } from './context/UserContext';
import styles from './page.module.css';

export default function HomePage() {
  const { activeUser } = useUser();
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [probRes, subRes] = await Promise.all([
          fetch('http://localhost:5000/api/problems'),
          fetch('http://localhost:5000/api/submissions')
        ]);
        
        if (!probRes.ok || !subRes.ok) {
          throw new Error('Server responded with an error');
        }
        
        const probData = await probRes.json();
        const subData = await subRes.json();
        
        setProblems(probData);
        setSubmissions(subData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute live statistics for the active user
  const userSubmissions = submissions.filter(s => s.userId === activeUser?.id);
  const solvedProblemIds = new Set(userSubmissions.filter(s => s.score === 100).map(s => s.problemId));
  const solvedCount = solvedProblemIds.size;
  const totalProblems = problems.length || 1;
  const completionPercentage = Math.round((solvedCount / totalProblems) * 100);

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
            A safe, sandboxed environment for practicing C++, Python & JavaScript. Get instant test outcomes and structured AI qualitative feedback on complexity and style.
          </p>
        </section>

        {/* Bento Grid Header */}
        <div className={styles.sectionHeader}>
          <h2>
            <Terminal size={18} className={styles.sectionIcon} />
            Coding Challenges ({problems.length})
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
                console.error("Failed to parse testCases:", e);
              }

              const isSolved = solvedProblemIds.has(prob.id);

              let codePreview = '';
              if (prob.id === 'problem-two-sum') {
                codePreview = `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        # ...`;
              } else if (prob.id === 'problem-palindrome-number') {
                codePreview = `function isPalindrome(x) {\n  if (x < 0) return false;\n  let rev = 0;\n  # ...`;
              } else {
                codePreview = `int main() {\n    vector<int> nums;\n    // C++ Solution\n  # ...`;
              }

              return (
                <div key={prob.id} className={`${styles.bentoCard} glass-card`}>
                  <div className={styles.bentoCardBody}>
                    <div className={styles.cardHeader}>
                      <span className={`badge badge-${prob.difficulty.toLowerCase()}`}>
                        {prob.difficulty}
                      </span>
                      <div className={styles.langTagsRow}>
                        <span className={styles.langTag}>CPP</span>
                        <span className={styles.langTag}>JS</span>
                        <span className={styles.langTag}>Python</span>
                      </div>
                    </div>

                    <h3 className={styles.problemTitle}>
                      {isSolved && <CheckCircle2 size={16} className="txtSuccess" style={{ display: 'inline', marginRight: '6px' }} />}
                      {prob.title}
                    </h3>
                    <p className={styles.problemDesc}>
                      {prob.description.split('\n')[0].replace(/[`*]/g, '')}
                    </p>

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

      {/* RIGHT COLUMN: Dynamic Live Sidebar */}
      <aside className={styles.sidebar}>
        {/* User Progress Analytics Widget */}
        <div className={`${styles.sidebarWidget} glass-card`}>
          <div className={styles.widgetHeader}>
            <Award size={16} className={styles.widgetIcon} />
            <h3>Session Progress</h3>
          </div>
          <div className={styles.metricsList}>
            <div className={styles.metricItem}>
              <span>Active User</span>
              <span className={styles.metricVal}>{activeUser?.username || 'ADITYA SING'}</span>
            </div>
            <div className={styles.metricItem}>
              <span>Student ID</span>
              <span className={styles.metricVal}>23U03031</span>
            </div>
            <div className={styles.metricItem}>
              <span>Problems Solved</span>
              <span className={styles.metricValSuccess}>{solvedCount} / {problems.length}</span>
            </div>
            <div className={styles.metricItem}>
              <span>Completion Rate</span>
              <span className={styles.metricVal}>{completionPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Live Database Activity Stream */}
        <div className={`${styles.sidebarWidget} glass-card`}>
          <div className={styles.widgetHeader}>
            <Activity size={16} className={styles.widgetIcon} style={{ color: 'var(--accent-purple)' }} />
            <h3>Live Activity Stream</h3>
          </div>
          <div className={styles.activityList}>
            {submissions.slice(0, 5).map((sub) => {
              const username = sub.user?.username || 'student';
              const problemTitle = sub.problem?.title || 'Challenge';
              const passed = sub.score === 100;

              return (
                <div key={sub.id} className={styles.activityItem}>
                  <div className={styles.activityIndicator}>
                    <span className={`${styles.statusDot} ${passed ? styles.dotPassed : styles.dotFailed}`}></span>
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>
                      <strong>{username}</strong> submitted{' '}
                      <span className={styles.activityTarget}>{problemTitle}</span>
                    </p>
                    <div className={styles.activityMeta}>
                      <span>{new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className={passed ? styles.txtSuccess : styles.txtDanger}>
                        ({sub.score}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {submissions.length === 0 && (
              <p className="txtSecondary" style={{ fontSize: '0.85rem', textAlign: 'center', padding: '12px 0' }}>
                No submissions recorded yet. Run code to populate stream!
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}