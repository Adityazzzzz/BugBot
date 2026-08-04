'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Terminal, Activity, Shield, CheckCircle2, Award, Search, Sparkles
} from 'lucide-react';
import { useUser } from './context/UserContext';
import styles from './page.module.css';

export default function HomePage() {
  const { activeUser } = useUser();
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');

  useEffect(() => {
    async function fetchData() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const [probRes, subRes] = await Promise.all([
          fetch(`${API_URL}/problems`),
          fetch(`${API_URL}/submissions`)
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

  // Compute live statistics for active user
  const userSubmissions = submissions.filter(s => s.userId === activeUser?.id);
  const solvedProblemIds = new Set(userSubmissions.filter(s => s.score === 100).map(s => s.problemId));
  const solvedCount = solvedProblemIds.size;
  const totalProblems = problems.length || 1;
  const completionPercentage = Math.round((solvedCount / totalProblems) * 100);

  // Filter problems
  const filteredProblems = problems.filter(prob => {
    const matchesSearch = prob.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prob.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = selectedDifficulty === 'ALL' || prob.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className={`${styles.dashboardContainer} container animated-fade`}>
      {/* LEFT COLUMN: Main Problem Matrix */}
      <div className={styles.mainContent}>
        
        {/* Header & Command Bar */}
        <div className={styles.matrixHeader}>
          <div>
            <div className={styles.topBadge}>
              <span>Algorithmic Repository</span>
            </div>
            <h1>Coding Challenges</h1>
            <p className="txtSecondary">
              Explore {problems.length > 0 ? `${problems.length} active modules` : '3,600+ problems'}. Select a challenge to run sandboxed code or test AI feedback.
            </p>
            <span>Can be extended till (3,600+ Problems)</span>
          </div>

          <div className={styles.commandBar}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search 53+ challenges..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className={styles.filterTabs}>
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`${styles.tabBtn} ${selectedDifficulty === diff ? styles.activeTab : ''}`}
            >
              {diff === 'ALL' ? `All Challenges (${problems.length})` : diff.charAt(0) + diff.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Problems Grid Container */}
        {loading ? (
          <div className={styles.loaderWrapper}>
            <div className={styles.spinner}></div>
            <p>Loading repository...</p>
          </div>
        ) : error ? (
          <div className={styles.errorCard}>
            <p className={styles.errorMsg}>Backend Offline</p>
            <p className={styles.errorHint}>Ensure Express is running on port 5000: <code>npm run dev</code></p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No challenges match your criteria.</p>
          </div>
        ) : (
          <div className={styles.cardScrollContainer}>
            <div className={styles.problemsGrid}>
              {filteredProblems.map((prob) => {
                const isSolved = solvedProblemIds.has(prob.id);
                let tcCount = 3;
                try {
                  tcCount = prob.testCases ? JSON.parse(prob.testCases).length : 3;
                } catch (e) {}

                return (
                  <Link href={`/workspace/${prob.id}`} key={prob.id} className={`${styles.problemCard} glass-card`}>
                    <div className={styles.cardTopRow}>
                      <span className={`badge badge-${prob.difficulty.toLowerCase()}`}>
                        {prob.difficulty}
                      </span>
                      {isSolved ? (
                        <span className={styles.solvedBadge}>
                          <CheckCircle2 size={14} className="txtSuccess" /> Solved
                        </span>
                      ) : (
                        <span className={styles.testCount}>{tcCount} test cases</span>
                      )}
                    </div>

                    <div className={styles.cardBodyContent}>
                      <h3 className={styles.cardTitle}>{prob.title}</h3>
                      <p className={styles.cardDesc}>
                        {prob.description.split('\n')[0].replace(/[`*]/g, '')}
                      </p>
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.langPills}>
                        <span className={styles.langBadgeItem}>C++</span>
                        <span className={styles.langBadgeItem}>JS</span>
                        <span className={styles.langBadgeItem}>Py</span>
                      </div>
                      <span className={styles.solveAction}>
                        <span>Solve</span>
                        <ArrowRight size={14} className={styles.arrowIcon} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Dynamic Live Sidebar */}
      <aside className={styles.sidebar}>
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
              <span>Solved</span>
              <span className={styles.metricValSuccess}>{solvedCount} / {problems.length}</span>
            </div>
            <div className={styles.metricItem}>
              <span>Completion</span>
              <span className={styles.metricVal}>{completionPercentage}%</span>
            </div>
          </div>
        </div>

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
                No submissions recorded yet.
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}