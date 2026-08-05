'use client';
import React,{useEffect,useState,useRef} from 'react';
import {useUser} from '../../context/UserContext';
import styles from './workspace.module.css';

import ProblemDescription from './ProblemDescription';
import DoubtBoard from './DoubtBoard';
import EditorPanel from './EditorPanel';
import ConsolePanel from './ConsolePanel';

export default function WorkspacePage({params}){
  const {problemId} = params;
  const {activeUser} = useUser();

  const [problem,setProblem] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);

  const [language,setLanguage] = useState('javascript');
  const [code,setCode] = useState('');
  const codeCache = useRef({ javascript: '',python: '' });

  const [leftTab,setLeftTab] = useState('desc'); 
  const [consoleTab,setConsoleTab] = useState('results'); 

  const gridRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() =>{
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !gridRef.current) return;
      const newWidth = e.clientX;
      if (newWidth > 320 && newWidth < window.innerWidth - 400){
        gridRef.current.style.gridTemplateColumns = `${newWidth}px 6px 1fr`;
      }
    };

    const handleMouseUp = () =>{
      if (isDraggingRef.current){
        isDraggingRef.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    window.addEventListener('mousemove',handleMouseMove);
    window.addEventListener('mouseup',handleMouseUp);

    return () =>{
      window.removeEventListener('mousemove',handleMouseMove);
      window.removeEventListener('mouseup',handleMouseUp);
    };
  },[]);

  const startDragging = (e) =>{
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Execution States
  const [isRunning,setIsRunning] = useState(false);
  const [isSubmitting,setIsSubmitting] = useState(false);
  const [consoleOutput,setConsoleOutput] = useState(null);
  const [aiFeedback,setAiFeedback] = useState(null);
  const [doubts,setDoubts] = useState([]);
  const [toast,setToast] = useState(null);

  const showToast = (message,type = 'success') => {
    setToast({message,type});
    setTimeout(() => setToast(null),4000);
  };

  useEffect(() => {
    async function fetchProblem(){
      try{
        const res = await fetch(`/api/problems/${problemId}`);
        if (!res.ok) throw new Error('Failed to load coding assignment details');
        
        const data = await res.json();
        setProblem(data);

        codeCache.current.javascript = data.boilerplateJs;
        codeCache.current.python = data.boilerplatePy;
        setCode(data.boilerplateJs);
      } 
      catch (err){
        setError(err.message);
      } 
      finally{
        setLoading(false);
      }
    }
    fetchProblem();
    fetchProblemDoubts();
  },[problemId]);

  async function fetchProblemDoubts(){
    try{
      const res = await fetch(`/api/doubts/problem/${problemId}`);
      if (res.ok){
        const data = await res.json();
        setDoubts(data);
      }
    } catch (e){
      console.error('Failed to fetch doubts:',e);
    }
  }

  const handleLanguageChange = (newLang) =>{
    codeCache.current[language] = code;
    setLanguage(newLang);
    const cached = codeCache.current[newLang];
    if (cached){
      setCode(cached);
    } else{
      if (newLang === 'javascript') setCode(problem.boilerplateJs);
      else if (newLang === 'python') setCode(problem.boilerplatePy);
    }
  };

  const handleRunCode = async () =>{
    setIsRunning(true);
    setConsoleTab('results');
    setConsoleOutput({ running: true });
    try{
      const res = await fetch('/api/submissions/run',{
        method: 'POST',
        headers:{ 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId,code,language })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');
      setConsoleOutput({ type: 'run',results: data.results });
    } catch (err){
      setConsoleOutput({ type: 'error',message: err.message });
    } finally{
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () =>{
    if (!activeUser){
      showToast('Please select a user profile in the Navbar.','error');
      return;
    }
    setIsSubmitting(true);
    setConsoleTab('results');
    setConsoleOutput({ submitting: true });
    setAiFeedback(null);
    try{
      const res = await fetch('/api/submissions/submit',{
        method: 'POST',
        headers:{ 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId,studentId: activeUser.id,code,language })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      
      const parsedResults = typeof data.results === 'string' ? JSON.parse(data.results) : data.results;
      const parsedFeedback = typeof data.aiFeedback === 'string' ? JSON.parse(data.aiFeedback) : data.aiFeedback;

      setConsoleOutput({ 
        type: 'submit',
        score: data.score,
        status: data.status,
        results: parsedResults 
      });
      
      if (parsedFeedback) setAiFeedback(parsedFeedback);
      
    } catch (err){
      setConsoleOutput({ type: 'error',message: err.message });
    } finally{
      setIsSubmitting(false);
    }
  };

  const handlePostDoubt = async (title,content) =>{
    try{
      const res = await fetch('/api/doubts',{
        method: 'POST',
        headers:{ 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId,studentId: activeUser.id,title,content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit doubt.');
      fetchProblemDoubts();
      showToast('Doubt posted! AI response is pending teacher moderation.','success');
      return true;
    } catch (err){
      return false;
    }
  };

  if (loading) return (
    <div className={styles.consoleLoading} style={{ height: '100vh' }}>
      <div className={styles.spinner}></div>
      <p>Loading workspace environment...</p>
    </div>
  );

  if (error) return (
    <div className="container" style={{ paddingTop: '100px',textAlign: 'center' }}>
      <h2>Failed to initialize workspace</h2>
      <p className="txtDanger">{error}</p>
    </div>
  );

  return (
    <div ref={gridRef} className={styles.workspaceGrid} style={{ gridTemplateColumns: '480px 6px 1fr' }}>
      
    {/* LEFT COLUMN: Orchestrated Components */}
      <div className={`${styles.leftCol} glass-card`}>
        <div className={styles.tabHeaders}>
          <button 
            className={`${styles.tabBtn} ${leftTab === 'desc' ? styles.activeTab : ''}`}
            onClick={() => setLeftTab('desc')}
          >
            Problem Description
          </button>
          <button 
            className={`${styles.tabBtn} ${leftTab === 'doubts' ? styles.activeTab : ''}`}
            onClick={() => setLeftTab('doubts')}
          >
            Doubts Board ({doubts.length})
          </button>
        </div>
        <div className={styles.tabContent}>
        {leftTab === 'desc' ? (
            <ProblemDescription problem={problem} />
          ) : (
            <DoubtBoard doubts={doubts} activeUser={activeUser} onPostDoubt={handlePostDoubt} />
          )}
        </div>
      </div>

    {/* DRAGGABLE RESIZER BAR */}
      <div className={styles.resizerBar} onMouseDown={startDragging} title="Drag to resize panels" />

    {/* RIGHT COLUMN: Orchestrated Components */}
      <div className={styles.rightCol}>
        <EditorPanel 
          problem={problem} 
          language={language} 
          code={code} 
          setCode={setCode} 
          onLanguageChange={handleLanguageChange}
          onRun={handleRunCode}
          onSubmit={handleSubmitCode}
          isRunning={isRunning}
          isSubmitting={isSubmitting}
        />
        <ConsolePanel 
          consoleTab={consoleTab}
          setConsoleTab={setConsoleTab}
          consoleOutput={consoleOutput}
          aiFeedback={aiFeedback}
        />
      </div>

    {toast && (
        <div className={`${styles.toast} toast-${toast.type}`}>
        {toast.message}
        </div>
      )}
    </div>
  );
}