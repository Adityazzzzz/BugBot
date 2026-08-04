'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { HelpCircle, MessageSquareCode, Filter, ChevronRight, User, BookOpen } from 'lucide-react';
import styles from './doubt.module.css';

export default function DoubtBoardHub() {
  const { activeUser } = useUser();
  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState('all');
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDoubtId, setExpandedDoubtId] = useState(null);

  useEffect(() => {
    async function initBoard() {
      try {
        const pRes = await fetch('/api/problems');
        if (pRes.ok) {
          const pData = await pRes.json();
          setProblems(pData);
        }
      } catch (e) {
        console.error('Failed to initialize board filter:', e);
      }
    }
    initBoard();
  }, []);

  useEffect(() => {
    async function loadDoubts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/doubts/problem/${selectedProblemId}`);
        if (res.ok) {
          const data = await res.json();
          setDoubts(data);
        }
      } catch (err) {
        console.error('Failed to load doubts:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadDoubts();
  }, [selectedProblemId]);

  const toggleExpandDoubt = (id) => {
    setExpandedDoubtId(expandedDoubtId === id ? null : id);
  };

  return (
    <div className={`${styles.boardContainer} container animated-fade`}>
      <header className={styles.boardHeader}>
        <div>
          <h1>Shared Doubt Resolution Board</h1>
          <p>Browse educational answers drafted by AI and reviewed by your course instructors.</p>
        </div>

        <div className={styles.filterWrapper}>
          <Filter size={16} />
          <span className={styles.filterLabel}>Challenge Filter:</span>
          <select
            value={selectedProblemId}
            onChange={(e) => setSelectedProblemId(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Assignments</option>
            {problems.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </header>

      {loading ? (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
          <p>Retrieving discussion threads...</p>
        </div>
      ) : doubts.length === 0 ? (
        <div className={`${styles.emptyBoard} glass-card`}>
          <HelpCircle size={48} className={styles.emptyIcon} />
          <h3>No approved doubts found</h3>
          <p>There are no doubts posted for this selection, or they are waiting for teacher moderation.</p>
        </div>
      ) : (
        <div className={styles.threadsList}>
          {doubts.map((d) => {
            const isExpanded = expandedDoubtId === d.id;
            return (
              <div 
                key={d.id} 
                className={`${styles.threadCard} glass-card ${isExpanded ? styles.expandedCard : ''}`}
                onClick={() => toggleExpandDoubt(d.id)}
              >
                <div className={styles.threadSummary}>
                  <div className={styles.threadMeta}>
                    <span className={styles.authorTag}>
                      <User size={12} />
                      {d.student.username}
                    </span>
                    <span className={styles.problemTag}>
                      <BookOpen size={12} />
                      {d.problem?.title || 'Coding Assignment'}
                    </span>
                  </div>
                  <h3 className={styles.threadTitle}>{d.title}</h3>
                  <p className={styles.threadExcerpt}>
                    {isExpanded ? d.content : d.content.substring(0, 140) + (d.content.length > 140 ? '...' : '')}
                  </p>
                  
                  <div className={styles.threadFooter}>
                    <span className={styles.answersCount}>
                      {d.answers.length} Approved Answer(s)
                    </span>
                    <ChevronRight 
                      size={18} 
                      className={`${styles.arrowIcon} ${isExpanded ? styles.arrowRotated : ''}`} 
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.expandedContent} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.answersContainer}>
                      {d.answers.length === 0 ? (
                        <div className={styles.pendingBanner}>
                          <p>AI response has been drafted and is currently pending instructor review.</p>
                        </div>
                      ) : (
                        d.answers.map((ans) => (
                          <div key={ans.id} className={styles.replyCard}>
                            <div className={styles.replyHeader}>
                              <MessageSquareCode size={16} className={styles.mentorIcon} />
                              <strong>Mentor Response (Approved)</strong>
                            </div>
                            <div className={styles.replyBody}>
                              {ans.content.split('\n').map((line, idx) => (
                                <p key={idx}>{line}</p>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}