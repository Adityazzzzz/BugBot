'use client';

/**
 * TeacherPortal component.
 * Implements the teacher review queue dashboard for pending AI-drafted answers,
 * and lists student submission history with code viewer and qualitative feedback tabs.
 */
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { 
  Check, X, Edit3, Save, Code, HelpCircle, 
  User, CheckCircle, AlertTriangle, BookOpen, Clock, BarChart3
} from 'lucide-react';
import styles from './teacher.module.css';

export default function TeacherPortal() {
  const { activeUser } = useUser();

  // Review Queue States
  const [pendingDrafts, setPendingDrafts] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  // Submissions States
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  // Fetch pending AI drafts for review
  async function fetchPendingDrafts() {
    try {
      const res = await fetch('http://localhost:5000/api/doubts/pending');
      if (res.ok) {
        const data = await res.json();
        setPendingDrafts(data);
      }
    } catch (e) {
      console.error('Failed to load pending drafts:', e);
    } finally {
      setLoadingDrafts(false);
    }
  }

  // Fetch all submissions for review
  async function fetchAllSubmissions() {
    try {
      const res = await fetch('http://localhost:5000/api/submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (e) {
      console.error('Failed to load submissions:', e);
    } finally {
      setLoadingSubmissions(false);
    }
  }

  useEffect(() => {
    fetchPendingDrafts();
    fetchAllSubmissions();
  }, []);

  // Handle Review (APPROVE / REJECT)
  const handleReview = async (draftAnswerId, status, finalContent = null) => {
    if (!activeUser) return;
    
    try {
      const body = {
        status,
        reviewerId: activeUser.id,
        content: finalContent
      };
      
      const res = await fetch(`http://localhost:5000/api/doubts/review/${draftAnswerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit review');
      }

      setEditingDraftId(null);
      fetchPendingDrafts(); // refresh queue
      alert(`Answer has been successfully ${status.toLowerCase()}!`);
    } catch (err) {
      alert('Error updating draft: ' + err.message);
    }
  };

  // Open edit mode
  const startEditing = (draftId, currentContent) => {
    setEditingDraftId(draftId);
    setEditedContent(currentContent);
  };

  if (activeUser?.role !== 'TEACHER') {
    return (
      <div className={`${styles.unauthorizedScreen} container animated-fade`}>
        <AlertTriangle size={48} className={styles.warningIcon} />
        <h2>Access Denied</h2>
        <p>Only verified instructors can access the Teacher Portal. Please use the profile switcher in the top right to log in as Sarah (Teacher).</p>
      </div>
    );
  }

  // Calculate statistics
  const totalSubmissions = submissions.length;
  const passRate = totalSubmissions > 0 
    ? Math.round((submissions.filter(s => s.status === 'COMPLETED').length / totalSubmissions) * 100) 
    : 0;

  return (
    <div className={`${styles.teacherContainer} container animated-fade`}>
      <header className={styles.header}>
        <h1>Teacher Moderation Portal</h1>
        <p>Manage code grading analytics and review AI draft responses before student publication.</p>
      </header>

      {/* Analytics Dashboard Grid */}
      <section className={styles.statsGrid}>
        <div className={`${styles.statCard} glass-card`}>
          <BarChart3 size={24} className={styles.statIcon} />
          <div>
            <h3>{totalSubmissions}</h3>
            <p>Total Submissions</p>
          </div>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <CheckCircle size={24} className={styles.statIcon} style={{ color: 'var(--color-success)' }} />
          <div>
            <h3>{passRate}%</h3>
            <p>Student Success Rate</p>
          </div>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <HelpCircle size={24} className={styles.statIcon} style={{ color: 'var(--color-warning)' }} />
          <div>
            <h3>{pendingDrafts.length}</h3>
            <p>Pending AI Doubts</p>
          </div>
        </div>
      </section>

      {/* Workspace split: Left = Pending AI Drafts, Right = Student Submissions List */}
      <div className={styles.splitLayout}>
        {/* REVIEW QUEUE (LEFT SIDE) */}
        <div className={`${styles.reviewQueueSection} glass-card`}>
          <div className={styles.sectionHeader}>
            <h2>Pending AI Doubt Drafts ({pendingDrafts.length})</h2>
          </div>

          {loadingDrafts ? (
            <div className={styles.sectionLoader}>
              <div className={styles.spinner}></div>
            </div>
          ) : pendingDrafts.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle size={40} className={styles.emptyIconSuccess} />
              <h3>All doubts cleared!</h3>
              <p>There are no pending AI answers requiring moderation.</p>
            </div>
          ) : (
            <div className={styles.draftsList}>
              {pendingDrafts.map((d) => (
                <div key={d.id} className={styles.draftCard}>
                  <div className={styles.draftMeta}>
                    <span><strong>Student:</strong> {d.doubt.student.username}</span>
                    <span><strong>Problem:</strong> {d.doubt.problem.title}</span>
                  </div>
                  <h4 className={styles.doubtTitle}>{d.doubt.title}</h4>
                  <p className={styles.doubtText}>{d.doubt.content}</p>

                  <div className={styles.aiDraftBlock}>
                    <div className={styles.aiHeader}>
                      <BookOpen size={16} />
                      <strong>AI Draft Reply:</strong>
                    </div>
                    
                    {editingDraftId === d.id ? (
                      <textarea
                        className={styles.editArea}
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={8}
                      />
                    ) : (
                      <div className={styles.aiContent}>
                        {d.content.split('\n').map((line, idx) => <p key={idx}>{line}</p>)}
                      </div>
                    )}

                    <div className={styles.reviewActions}>
                      {editingDraftId === d.id ? (
                        <>
                          <button 
                            onClick={() => handleReview(d.id, 'APPROVED', editedContent)} 
                            className={`${styles.actionBtn} btn btn-primary`}
                          >
                            <Save size={16} />
                            Save & Approve
                          </button>
                          <button 
                            onClick={() => setEditingDraftId(null)} 
                            className={`${styles.actionBtn} btn btn-secondary`}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleReview(d.id, 'APPROVED')} 
                            className={`${styles.actionBtn} ${styles.btnApprove}`}
                          >
                            <Check size={16} />
                            Approve
                          </button>
                          <button 
                            onClick={() => startEditing(d.id, d.content)} 
                            className={`${styles.actionBtn} ${styles.btnEdit}`}
                          >
                            <Edit3 size={16} />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleReview(d.id, 'REJECTED')} 
                            className={`${styles.actionBtn} ${styles.btnReject}`}
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUBMISSIONS BROWSER (RIGHT SIDE) */}
        <div className={`${styles.submissionsSection} glass-card`}>
          <div className={styles.sectionHeader}>
            <h2>Student Submissions Log</h2>
          </div>

          {loadingSubmissions ? (
            <div className={styles.sectionLoader}>
              <div className={styles.spinner}></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className={styles.emptyState}>
              <Code size={40} className={styles.emptyIcon} />
              <h3>No submissions yet</h3>
              <p>Student assignments will appear here once run.</p>
            </div>
          ) : (
            <div className={styles.submissionsList}>
              {submissions.map((sub) => {
                const isSelected = selectedSubmissionId === sub.id;
                const aiFeedbackParsed = sub.aiFeedback ? JSON.parse(sub.aiFeedback) : null;
                const formattedDate = new Date(sub.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div 
                    key={sub.id} 
                    className={`${styles.submissionRowCard} ${isSelected ? styles.selectedRowCard : ''}`}
                    onClick={() => setSelectedSubmissionId(isSelected ? null : sub.id)}
                  >
                    <div className={styles.rowSummary}>
                      <div className={styles.rowMain}>
                        <strong>{sub.student.username}</strong>
                        <span>submitted {sub.problem.title}</span>
                      </div>
                      <div className={styles.rowMeta}>
                        <span className={styles.languageTag}>{sub.language}</span>
                        <span className={sub.status === 'COMPLETED' ? styles.statusPassed : styles.statusFailed}>
                          {sub.status} ({Math.round(sub.score)}%)
                        </span>
                        <span className={styles.dateTag}>
                          <Clock size={12} />
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className={styles.rowDetails} onClick={(e) => e.stopPropagation()}>
                        {/* Student Code display */}
                        <div className={styles.codeBlockContainer}>
                          <div className={styles.codeBlockHeader}>
                            <span>Submitted Code ({sub.language}):</span>
                          </div>
                          <pre className={styles.submittedCode}><code>{sub.code}</code></pre>
                        </div>

                        {/* AI feedback details */}
                        {aiFeedbackParsed && (
                          <div className={styles.teacherAiFeedback}>
                            <h4>AI Qualitative Mentoring</h4>
                            <div className={styles.statsRow}>
                              <div>
                                <strong>Score:</strong> {aiFeedbackParsed.readabilityScore}/10
                              </div>
                              <div>
                                <strong>Time:</strong> {aiFeedbackParsed.timeComplexity}
                              </div>
                              <div>
                                <strong>Space:</strong> {aiFeedbackParsed.spaceComplexity}
                              </div>
                            </div>
                            
                            <div className={styles.feedbackLists}>
                              {aiFeedbackParsed.strengths?.length > 0 && (
                                <div className={styles.feedbackCol}>
                                  <h5>Strengths:</h5>
                                  <ul>
                                    {aiFeedbackParsed.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                                  </ul>
                                </div>
                              )}
                              {aiFeedbackParsed.improvements?.length > 0 && (
                                <div className={styles.feedbackCol}>
                                  <h5>Improvements:</h5>
                                  <ul>
                                    {aiFeedbackParsed.improvements.map((s, idx) => <li key={idx}>{s}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
