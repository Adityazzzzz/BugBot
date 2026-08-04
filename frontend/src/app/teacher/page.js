'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { CheckCircle, XCircle, Clock, ShieldAlert, Edit3 } from 'lucide-react';
import styles from './teacher.module.css';

export default function TeacherPortal() {
  const { activeUser } = useUser();
  const [pendingDrafts, setPendingDrafts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const [draftsRes, subsRes] = await Promise.all([
        fetch('/api/doubts/pending'),
        fetch('/api/submissions')
      ]);

      if (draftsRes.ok) setPendingDrafts(await draftsRes.json());
      if (subsRes.ok) setSubmissions(await subsRes.json());
    } catch (err) {
      console.error('Failed to load teacher dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleReview = async (answerId, status, content = null) => {
    try {
      const res = await fetch(`/api/doubts/review/${answerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewerId: activeUser.id,
          content: content // If the teacher edited the AI draft
        })
      });

      if (!res.ok) throw new Error('Failed to submit review');
      
      // Remove the reviewed item from the UI
      setPendingDrafts(prev => prev.filter(draft => draft.id !== answerId));
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  if (activeUser?.role !== 'TEACHER') {
    return (
      <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ margin: '0 auto 20px', color: 'var(--color-danger)' }} />
        <h2>Access Denied</h2>
        <p className="txtDanger">You must be logged in as an Instructor to view this page.</p>
      </div>
    );
  }

  // Calculate quick stats
  const successRate = submissions.length > 0 
    ? Math.round((submissions.filter(s => s.score === 100).length / submissions.length) * 100) 
    : 0;

  return (
    <div className={`${styles.dashboard} container animated-fade`}>
      <header className={styles.header}>
        <div>
          <h1>Instructor Moderation Portal</h1>
          <p>Review AI-drafted responses before they are published to the shared student board.</p>
        </div>
      </header>

      <div className={styles.statsRow}>
        <div className={`${styles.statCard} glass-card`}>
          <span className={styles.statLabel}>Total Submissions</span>
          <span className={styles.statVal}>{submissions.length}</span>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <span className={styles.statLabel}>Student Success Rate</span>
          <span className={`${styles.statVal} txtSuccess`}>{successRate}%</span>
        </div>
        <div className={`${styles.statCard} glass-card`}>
          <span className={styles.statLabel}>Pending AI Drafts</span>
          <span className={`${styles.statVal} txtWarning`}>{pendingDrafts.length}</span>
        </div>
      </div>

      <div className={styles.queuesWrapper}>
        <div className={`${styles.queuePanel} glass-card`}>
          <div className={styles.panelHeader}>
            <h3><Clock size={18} className="txtWarning" /> Pending AI Drafts Queue</h3>
          </div>
          
          <div className={styles.queueBody}>
            {loading ? (
              <p className={styles.emptyMsg}>Loading queue...</p>
            ) : pendingDrafts.length === 0 ? (
              <p className={styles.emptyMsg}>The moderation queue is currently empty. All AI drafts have been reviewed.</p>
            ) : (
              pendingDrafts.map(draft => (
                <div key={draft.id} className={styles.draftCard}>
                  <div className={styles.draftContext}>
                    <div className={styles.contextHeader}>
                      <span className="badge badge-medium">{draft.doubt.problem.title}</span>
                      <span className={styles.studentName}>Question from: {draft.doubt.student.username}</span>
                    </div>
                    <h4 className={styles.doubtTitle}>{draft.doubt.title}</h4>
                    <p className={styles.doubtContent}>{draft.doubt.content}</p>
                  </div>

                  <div className={styles.aiResponse}>
                    <div className={styles.aiHeader}>
                      <strong>AI Drafted Response:</strong>
                      {editingId !== draft.id && (
                        <button 
                          onClick={() => { setEditingId(draft.id); setEditContent(draft.content); }}
                          className={styles.editBtn}
                        >
                          <Edit3 size={14} /> Edit Draft
                        </button>
                      )}
                    </div>
                    
                    {editingId === draft.id ? (
                      <textarea 
                        className={styles.editArea} 
                        value={editContent} 
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={6}
                      />
                    ) : (
                      <div className={styles.aiText}>
                        {draft.content.split('\n').map((line, idx) => <p key={idx}>{line}</p>)}
                      </div>
                    )}
                  </div>

                  <div className={styles.draftActions}>
                    {editingId === draft.id ? (
                      <>
                        <button onClick={() => setEditingId(null)} className="btn btn-secondary">Cancel</button>
                        <button onClick={() => handleReview(draft.id, 'APPROVED', editContent)} className="btn btn-primary">
                          Save & Approve
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleReview(draft.id, 'REJECTED')} className="btn btn-secondary txtDanger" style={{ borderColor: 'var(--color-danger)' }}>
                          <XCircle size={16} /> Reject & Discard
                        </button>
                        <button onClick={() => handleReview(draft.id, 'APPROVED')} className="btn btn-primary">
                          <CheckCircle size={16} /> Approve & Publish
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}