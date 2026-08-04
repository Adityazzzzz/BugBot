import React,{useState} from 'react';
import {HelpCircle,User,MessageSquareCode,X } from 'lucide-react';
import styles from './workspace.module.css';

export default function DoubtBoard({ doubts,activeUser,onPostDoubt}){
  const [showModal,setShowModal] = useState(false);
  const [title,setTitle] = useState('');
  const [content,setContent] = useState('');
  const [error,setError] = useState('');
  const [isPosting,setIsPosting] = useState(false);

  const handleSubmit = async (e) =>{
    e.preventDefault();
    if (!title.trim() || !content.trim()){
      setError('Title and description cannot be empty.');
      return;
    }
    setError('');
    setIsPosting(true);
    
    const success = await onPostDoubt(title,content);
    if (success){
      setShowModal(false);
      setTitle('');
      setContent('');
    } 
    else{
      setError('Failed to post doubt. Please try again.');
    }
    setIsPosting(false);
  };

  return (
    <div className={styles.doubtsSection}>
      <div className={styles.doubtsHeader}>
        <h2>Doubt Resolution Board</h2>
    {activeUser?.role === 'STUDENT' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            Ask a Question
          </button>
        )}
      </div>

      <div className={styles.doubtsList}>
    {doubts.length === 0 ? (
          <div className={styles.emptyDoubts}>
            <HelpCircle size={40} className={styles.emptyIcon} style={{ margin: '0 auto' }} />
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
                    {ans.content.split('\n').map((line,aIdx) => (
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

    {showModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalCard} glass-card`}>
            <div className={styles.modalHeader}>
              <h3>Ask the Doubt Board</h3>
              <button onClick={() => setShowModal(false)} className={styles.closeBtn}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
            {error && <div className={styles.modalError}>{error}</div>}
              <div className={styles.formGroup}>
                <label>Question Summary (Title)</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Why does my loop fail on negative targets?"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Detailed Question Description</label>
                <textarea 
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Explain exactly what issues you are encountering,or details of your logic flow."
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={isPosting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isPosting}>
                {isPosting ? 'Posting Question...' : 'Post Doubt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}