'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Code, HelpCircle } from 'lucide-react';
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

  return (
    <div className={`${styles.mainContainer} container animated-fade`}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.title}>AI-Powered Code Grading & Doubt Portal</h1>
        <p className={styles.subtitle}>
          Select a programming assignment below to practice your skills. Receive real-time sandboxed execution reports and detailed qualitative AI reviews.
        </p>
      </section>

      {/* Main Problems Grid */}
      <div className={styles.sectionHeader}>
        <h2>Coding Challenges</h2>
        <span className={styles.problemCount}>{problems.length} assignment(s) available</span>
      </div>

      {loading ? (
        <div className={styles.loaderWrapper}>
          <div className={styles.spinner}></div>
          <p>Loading problems...</p>
        </div>
      ) : error ? (
        <div className={styles.errorCard}>
          <p>Failed to load problems: {error}</p>
          <p className={styles.errorHint}>Please ensure the backend server is running on port 5000.</p>
        </div>
      ) : (
        <div className={styles.problemsGrid}>
          {problems.map((prob) => (
            <div key={prob.id} className={`${styles.problemCard} glass-card`}>
              <div className={styles.cardHeader}>
                <span className={`${styles.difficultyBadge} badge badge-${prob.difficulty.toLowerCase()}`}>
                  {prob.difficulty}
                </span>
                <Code className={styles.codeIcon} size={20} />
              </div>
              <h3 className={styles.problemTitle}>{prob.title}</h3>
              <p className={styles.problemDesc}>
                {prob.description.split('\n')[0].replace(/[`*]/g, '')}
              </p>
              <div className={styles.cardFooter}>
                <Link href={`/workspace/${prob.id}`} className="btn btn-primary">
                  Solve Challenge
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
