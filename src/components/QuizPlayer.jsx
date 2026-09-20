import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { useAuth } from '../context/AuthContext';
import { submitQuestionReport } from '../services/cloudStorage';
import { 
  Clock, 
  Pause, 
  Play, 
  Bookmark, 
  BookmarkCheck, 
  Sliders, 
  Lightbulb, 
  Edit3, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  CheckCircle2, 
  XCircle, 
  X, 
  HelpCircle,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  Scissors
} from 'lucide-react';


import MathText from './MathText';
import MathSymbolLegend from './MathSymbolLegend';
export default function QuizPlayer({ questions, onComplete, onExit }) {
  const { currentUser } = useAuth();
  
  // 當前題號與作答
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: optionIndex }
  
  // 特色功能：標記待檢查 (Flagged for Review ★)
  const [flaggedQuestions, setFlaggedQuestions] = useState({}); // { [qId]: boolean }

  // 特色功能：消去法劃線 (Option Elimination / 刪去法)
  const [eliminatedOptions, setEliminatedOptions] = useState({}); // { [`${qId}_${optIdx}`]: boolean }

  // 特色功能：字級大小切換 ('sm' | 'md' | 'lg')
  const [fontSize, setFontSize] = useState('md');

  // 計時與暫停
  const [secondsSpent, setSecondsSpent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 🛡️ 防作弊與翻群防護機制
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [showCheatAlert, setShowCheatAlert] = useState(false);
  const lastWarningTime = useRef(0);

  // 輔助工具抽屜
  const [showHint, setShowHint] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchpadNotes, setScratchpadNotes] = useState('');
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);

  // 交卷確認防呆視窗
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // 題目疑義回報
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('答案錯誤');
  const [reportComment, setReportComment] = useState('');
  const [reportSuccessNotice, setReportSuccessNotice] = useState(false);

  const currentQ = questions[currentIndex] || questions[0];

  // 考試計時器 (支援暫停)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => setSecondsSpent(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    setShowHint(false);
  }, [currentIndex]);



  // 作答選擇
  const handleSelectOption = (optIndex) => {
    if (isPaused) return;
    // 如果已被消去劃線，點選時自動取消消去
    const elimKey = `${currentQ.id}_${optIndex}`;
    if (eliminatedOptions[elimKey]) {
      setEliminatedOptions(prev => ({ ...prev, [elimKey]: false }));
    }

    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIndex
    }));
  };

  // 切換消去法劃線 (刪去法)
  const toggleEliminate = (e, optIndex) => {
    e.stopPropagation();
    const elimKey = `${currentQ.id}_${optIndex}`;
    setEliminatedOptions(prev => ({
      ...prev,
      [elimKey]: !prev[elimKey]
    }));
  };

  // 切換待檢查標記
  const toggleFlagCurrent = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  // 交卷動作
  const handleConfirmSubmit = () => {
    setIsSubmitModalOpen(false);
    const results = questions.map(q => {
      const chosen = userAnswers[q.id];
      const isCorrect = chosen === q.answer;
      return {
        ...q,
        userChoice: chosen,
        isCorrect
      };
    });
    onComplete(results, secondsSpent);
  };

  // 疑義回報
  const handleSubmitReport = () => {
    submitQuestionReport({
      questionId: currentQ.id,
      unitName: currentQ.unitName,
      reason: reportReason,
      comment: reportComment,
      reporterId: currentUser?.id || 'guest_student',
      reporterName: currentUser?.displayName || '同學'
    });

    // 觸發 EmailJS 背景寄信
    const emailData = {
      service_id: 'service_928ruqe',
      template_id: 'template_ckgv0wm',
      user_id: '52OwIYNBqyXqUQdgc',
      template_params: {
        reporter_name: currentUser?.displayName || '同學',
        report_reason: reportReason,
        question_id: currentQ.id,
        question_text: currentQ.question || '(無文字內容)',
        question_answer: currentQ.options ? currentQ.options[currentQ.answer] : '(無選項)',
        report_comment: reportComment || '(無補充說明)'
      }
    };

    fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    }).catch(err => console.error('EmailJS Failed:', err));
    setReportSuccessNotice(true);
    setTimeout(() => {
      setReportSuccessNotice(false);
      setIsReportModalOpen(false);
      setReportComment('');
    }, 1500);
  };

  // 統計數據
  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k] !== undefined).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

  // 字級設定
  const fontSizes = {
    sm: { stem: '1.02rem', opt: '0.92rem', line: '1.75' },
    md: { stem: '1.18rem', opt: '1.02rem', line: '1.85' },
    lg: { stem: '1.35rem', opt: '1.14rem', line: '1.95' }
  };
  const activeFont = fontSizes[fontSize] || fontSizes.md;

  // 🛡️ 防作弊：攔截右鍵、複製、快捷鍵與切換分頁
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopy = (e) => {
      e.preventDefault();
      alert('【系統警告】考試期間嚴禁複製題目！');
    };
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 'p') ||
        (e.metaKey && e.key === 'p')
      ) {
        e.preventDefault();
        alert('【系統警告】考試期間嚴禁使用開發者工具或列印功能！');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleCheatViolation();
      }
    };
    
    const handleCheatViolation = () => {
      const now = Date.now();
      if (now - lastWarningTime.current > 2000) {
        lastWarningTime.current = now;
        setCheatWarnings(prev => prev + 1);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const forceSubmitQuiz = () => {
    const results = questions.map(q => {
      const chosen = userAnswers[q.id];
      const isCorrect = chosen === q.answer;
      return {
        ...q,
        userChoice: chosen,
        isCorrect
      };
    });
    onComplete(results, secondsSpent);
  };

  // 監聽警告次數，超過 3 次則觸發強制交卷
  useEffect(() => {
    if (cheatWarnings > 0 && cheatWarnings < 3) {
      setShowCheatAlert(true);
    } else if (cheatWarnings >= 3) {
      alert('【嚴重違規】您已多次切換分頁或離開考試畫面，系統將強制收卷！');
      forceSubmitQuiz();
    }
  }, [cheatWarnings]);

  // 取消語音播放
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [currentIndex]);

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const enVoices = voices.filter(v => v.lang.startsWith('en'));
        const premiumVoice = enVoices.find(v => 
          v.name.includes('Google') || 
          v.name.includes('Premium') || 
          v.name.includes('Samantha') || 
          v.name.includes('Siri') ||
          v.name.includes('Daniel')
        );
        if (premiumVoice) {
          utterance.voice = premiumVoice;
        } else if (enVoices.length > 0) {
          utterance.voice = enVoices[0];
        }
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('您的瀏覽器不支援語音播放功能');
    }
  };

  // 產生 50 個浮水印背景
  const watermarkText = '學習網考試中 禁止拍攝 禁止作弊';
  
  if (!currentQ) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h3>題庫載入中...</h3>
      </div>
    );
  }
  const watermarks = Array.from({ length: 50 }).map((_, i) => (
    <div key={i} className="watermark-item">{watermarkText}</div>
  ));

  return (
    <div className="no-select watermark-container" style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* 🛡️ 全螢幕防翻拍浮水印 */}
      <div className="watermark-overlay">
        {watermarks}
      </div>

      {/* 🛡️ 切換分頁警告彈窗 */}
      {showCheatAlert && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(239, 68, 68, 0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '20px' }}>
          <AlertTriangle size={80} color="#ffffff" style={{ marginBottom: '20px' }} />
          <h2 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 900, marginBottom: '10px' }}>警告：請勿切換分頁！</h2>
          <p style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '30px', textAlign: 'center' }}>
            系統偵測到您離開了考試畫面。為維持考試公平性，嚴禁考試期間搜尋答案。<br/>
            (累計警告: {cheatWarnings} / 3) 達到 3 次將強制收卷！
          </p>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '16px 32px', fontSize: '1.2rem', background: '#ffffff', color: '#ef4444' }}
            onClick={() => setShowCheatAlert(false)}
          >
            我明白了，返回考試
          </button>
        </div>
      )}
      
      {/* =========================================================================
          頂部專業考試抬頭工具列 (Header Bar)
          ========================================================================= */}
      <header 
        style={{ 
          background: 'var(--theme-card, var(--theme-card, #fffdf9))', 
          border: '2.5px solid var(--theme-border, #17324d)', 
          borderRadius: '20px', 
          padding: '14px 22px',
          boxShadow: '5px 5px 0px var(--theme-border, #17324d)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        {/* 左側：科目名稱、年級、單元標籤 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span className="badge badge-coral" style={{ fontSize: '0.74rem' }}>
              {currentQ.gradeId === 'g7' ? '國一' : currentQ.gradeId === 'g8' ? '國二' : '國三'} 108 課綱
            </span>
            <span className="badge badge-indigo" style={{ fontSize: '0.74rem' }}>
              {currentQ.unitName}
            </span>
            <span className="badge badge-gold" style={{ fontSize: '0.74rem' }}>
              難度：{currentQ.difficulty === 'hard' ? '★★★ 精熟' : currentQ.difficulty === 'easy' ? '★☆☆ 基礎' : '★★☆ 核心'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))', margin: 0 }}>
            會考全真線上模擬作答測驗
          </h2>
        </div>

        {/* 右側工具集：計時器、字級、答題卡按鈕、交卷按鈕 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* 1. 測驗計時器 (支援暫停) */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 12px', 
              background: isPaused ? '#fff0e9' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))', 
              border: '1.5px solid var(--theme-border, #17324d)', 
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.9rem',
              color: isPaused ? '#c8643d' : 'var(--theme-border, var(--theme-border, #17324d))'
            }}
          >
            <Clock size={16} color={isPaused ? 'var(--theme-accent, var(--theme-accent, #ef8354))' : 'var(--theme-border, var(--theme-border, #17324d))'} />
            <span style={{ fontFamily: 'var(--font-mono)' }}>
              {Math.floor(secondsSpent / 60)}:{(secondsSpent % 60).toString().padStart(2, '0')}
            </span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              title={isPaused ? '繼續作答' : '暫停計時'}
            >
              {isPaused ? <Play size={14} color="var(--theme-accent, var(--theme-accent, #ef8354))" /> : <Pause size={14} color="#78818a" />}
            </button>
          </div>

          {/* 2. 字級調整按鈕 (小 / 中 / 大) */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1.5px solid var(--theme-border, #17324d)', borderRadius: '12px', padding: '3px' }}>
            <button
              onClick={() => setFontSize('sm')}
              style={{
                padding: '4px 8px',
                background: fontSize === 'sm' ? 'var(--theme-border, var(--theme-border, #17324d))' : 'transparent',
                color: fontSize === 'sm' ? '#fff' : '#5b6772',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              小
            </button>
            <button
              onClick={() => setFontSize('md')}
              style={{
                padding: '4px 8px',
                background: fontSize === 'md' ? 'var(--theme-border, var(--theme-border, #17324d))' : 'transparent',
                color: fontSize === 'md' ? '#fff' : '#5b6772',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              中
            </button>
            <button
              onClick={() => setFontSize('lg')}
              style={{
                padding: '4px 8px',
                background: fontSize === 'lg' ? 'var(--theme-border, var(--theme-border, #17324d))' : 'transparent',
                color: fontSize === 'lg' ? '#fff' : '#5b6772',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              大
            </button>
          </div>

          {/* 3. 展開答題卡按鈕 */}
          <button
            onClick={() => setShowAnswerSheet(!showAnswerSheet)}
            className="btn btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.82rem', borderRadius: '12px' }}
          >
            <Layers size={15} />
            <span>答題卡 ({answeredCount}/{questions.length})</span>
            {flaggedCount > 0 && (
              <span style={{ color: 'var(--theme-accent, var(--theme-accent, #ef8354))', fontWeight: 900 }}>★{flaggedCount}</span>
            )}
          </button>

          {/* 4. 結束交卷大按鈕 */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.88rem', borderRadius: '12px' }}
          >
            <Send size={15} />
            <span>交卷結算</span>
          </button>

          {/* 5. 放棄按鈕 */}
          <button
            onClick={() => {
              if (window.confirm('確定要放棄此次測驗並返回題庫首頁嗎？目前的作答紀錄將不計入成績。')) {
                onExit();
              }
            }}
            className="btn btn-ghost"
            style={{ padding: '6px' }}
            title="離開測驗"
          >
            <X size={18} />
          </button>

        </div>
      </header>

      {/* 暫停遮罩遮蔽畫面 */}
      {isPaused && (
        <div 
          style={{ 
            background: 'var(--theme-card, var(--theme-card, #fffdf9))', 
            border: '2.5px solid var(--theme-border, #17324d)', 
            borderRadius: '24px', 
            padding: '60px 20px', 
            textAlign: 'center',
            boxShadow: '6px 6px 0 var(--theme-border, #17324d)'
          }}
        >
          <Pause size={50} color="var(--theme-accent, var(--theme-accent, #ef8354))" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))', marginBottom: '8px' }}>
            測驗已暫停計時
          </h2>
          <p style={{ color: '#5b6772', fontSize: '0.95rem', marginBottom: '24px' }}>
            題目內容已暫時隱藏以維持會考公平性，點擊下方按鈕即可隨時回到題目繼續作答！
          </p>
          <button
            onClick={() => setIsPaused(false)}
            className="btn btn-primary"
            style={{ padding: '12px 30px', fontSize: '1rem' }}
          >
            <Play size={18} /> 繼續做題
          </button>
        </div>
      )}

      {/* =========================================================================
          答題卡抽屜導航 (Answer Palette Grid)
          ========================================================================= */}
      {showAnswerSheet && !isPaused && (
        <div 
          style={{ 
            background: 'var(--theme-card, var(--theme-card, #fffdf9))', 
            border: '2.5px solid var(--theme-border, #17324d)', 
            borderRadius: '20px', 
            padding: '18px 24px',
            boxShadow: '6px 6px 0 #f7cf68',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.95rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
              <Layers size={18} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
              <span>線上答題卡（點選題號可立即跳轉至該題）</span>
            </div>
            
            {/* 圖例說明 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', fontWeight: 700 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#54a87a', display: 'inline-block' }} />
                <span>已作答 ({answeredCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fff', border: '1.5px solid var(--theme-border, #17324d)', display: 'inline-block' }} />
                <span>未作答 ({unansweredCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: 'var(--theme-accent, var(--theme-accent, #ef8354))', fontSize: '0.9rem' }}>★</span>
                <span>標記待檢查 ({flaggedCount})</span>
              </div>
            </div>
          </div>

          {/* 題號網格 (按鈕陣列) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {questions.map((q, idx) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              const isFlagged = flaggedQuestions[q.id];
              const isCurrent = idx === currentIndex;

              let bg = 'var(--theme-card, var(--theme-card, #fffdf9))';
              let text = 'var(--theme-border, var(--theme-border, #17324d))';
              let border = '2px solid var(--theme-border, #17324d)';

              if (isAnswered) {
                bg = '#e8f6ed';
                text = '#347650';
                border = '2px solid #347650';
              }

              if (isCurrent) {
                border = '2.5px solid var(--theme-accent, #ef8354)';
              }

              return (
                <button
                  key={q.id || idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowAnswerSheet(false);
                  }}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: bg,
                    color: text,
                    border: border,
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    position: 'relative',
                    cursor: 'pointer',
                    boxShadow: isCurrent ? '2px 2px 0 var(--theme-accent, #ef8354)' : '2px 2px 0 var(--theme-border, #17324d)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isCurrent ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.12s ease'
                  }}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span 
                      style={{ 
                        position: 'absolute', 
                        top: '-6px', 
                        right: '-5px', 
                        background: 'var(--theme-accent, var(--theme-accent, #ef8354))', 
                        color: '#fff', 
                        fontSize: '0.65rem', 
                        borderRadius: '50%', 
                        width: '15px', 
                        height: '15px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 900
                      }}
                    >
                      ★
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          核心作答題幹與選項卡片 (Main Question Canvas)
          ========================================================================= */}
      {!isPaused && (
        <main
          style={{
            background: 'var(--theme-card, var(--theme-card, #fffdf9))',
            border: '2.5px solid var(--theme-border, #17324d)',
            borderRadius: '24px',
            padding: '28px 32px',
            boxShadow: '6px 6px 0px var(--theme-border, #17324d)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {/* 題目資訊條：題號、概念標籤、標記此題按鈕 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.5px solid #ded3c5', paddingBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span 
                style={{ 
                  background: 'var(--theme-border, var(--theme-border, #17324d))', 
                  color: '#fff', 
                  fontWeight: 900, 
                  fontSize: '0.95rem', 
                  padding: '4px 14px', 
                  borderRadius: '10px',
                  boxShadow: '2px 2px 0 var(--theme-accent, #ef8354)'
                }}
              >
                第 {currentIndex + 1} 題 / 共 {questions.length} 題
              </span>
              <span style={{ fontSize: '0.85rem', color: '#78818a', fontWeight: 700 }}>
                單選題
              </span>
              <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                #{currentQ.conceptTag}
              </span>
            </div>

            {/* 標記待檢查按鈕 (Flag Question) */}
            <button
              onClick={toggleFlagCurrent}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '12px',
                border: flaggedQuestions[currentQ.id] ? '2px solid var(--theme-accent, #ef8354)' : '1.5px solid #ded3c5',
                background: flaggedQuestions[currentQ.id] ? '#fff0e9' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                color: flaggedQuestions[currentQ.id] ? '#c8643d' : '#5b6772',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {flaggedQuestions[currentQ.id] ? (
                <>
                  <BookmarkCheck size={16} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
                  <span>已標記待檢查 (★)</span>
                </>
              ) : (
                <>
                  <Bookmark size={16} color="#78818a" />
                  <span>標記此題 (交卷前覆查)</span>
                </>
              )}
            </button>
          </div>

          {/* 聽力播放區塊 */}
          {currentQ.isListening && currentQ.audioText && (
            <div style={{ background: '#eef2ff', border: '1.5px solid #c7d2fe', borderRadius: '16px', padding: '16px 20px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={20} style={{ marginLeft: '2px' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#312e81', fontSize: '1rem', fontWeight: 800 }}>英聽測驗題</h4>
                  <p style={{ margin: 0, color: '#4f46e5', fontSize: '0.85rem', fontWeight: 700 }}>點擊右側按鈕聆聽語音，可重複播放</p>
                </div>
              </div>
              <button 
                onClick={() => playAudio(currentQ.audioText)}
                className="btn btn-primary"
                style={{ background: '#4f46e5', boxShadow: '0 4px 0 #3730a3', padding: '8px 16px' }}
              >
                <Play size={16} />
                <span>播放語音</span>
              </button>
            </div>
          )}

          {/* 閱讀測驗長文區塊 */}
          {currentQ.isReading && currentQ.readingText && (
            <div style={{ background: '#fcf8e3', border: '1.5px solid #faebcc', borderRadius: '16px', padding: '20px 24px', marginBottom: '8px' }}>
              <span style={{ display: 'inline-block', background: '#8a6d3b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 900, marginBottom: '12px' }}>
                閱讀素養文本
              </span>
              <div style={{ 
                fontSize: activeFont.stem, 
                lineHeight: activeFont.line, 
                fontWeight: 700, 
                color: '#4a4a4a', 
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-serif)'
              }}>
                {currentQ.readingText}
              </div>
            </div>
          )}

          {/* SVG 向量幾何/圖形題區塊 */}
          {currentQ.isSvg && currentQ.svgContent && (
            <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '16px', padding: '20px', marginBottom: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentQ.svgContent, { USE_PROFILES: { svg: true, svgFilters: true }, FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'], FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'] }) }} />
            </div>
          )}

          {/* Chat 模擬通訊軟體對話題區塊 */}
          {currentQ.isChat && currentQ.chatMessages && (
            <div style={{ background: '#e5e5ea', border: '1.5px solid #d1d1d6', borderRadius: '16px', padding: '16px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                <span style={{ background: '#c7c7cc', color: '#fff', padding: '2px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>今天</span>
              </div>
              {currentQ.chatMessages.map((msg, mIdx) => {
                const isMe = msg.sender === '我' || msg.isRight;
                return (
                  <div key={mIdx} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isMe ? '#007aff' : '#fff', border: '1.5px solid #d1d1d6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, color: isMe ? '#fff' : '#8e8e93', flexShrink: 0 }}>
                      {msg.sender.substring(0, 1)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <span style={{ fontSize: '0.7rem', color: '#8e8e93', marginBottom: '2px', padding: '0 4px' }}>{msg.sender}</span>
                      <div style={{ 
                        background: isMe ? '#007aff' : '#fff', 
                        color: isMe ? '#fff' : '#000', 
                        padding: '10px 14px', 
                        borderRadius: '18px', 
                        borderBottomLeftRadius: isMe ? '18px' : '4px',
                        borderBottomRightRadius: isMe ? '4px' : '18px',
                        fontSize: activeFont.opt,
                        lineHeight: '1.5',
                        maxWidth: '280px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 題目旁的數學符號標註區 */}
          <MathSymbolLegend question={currentQ} />

          {/* 題幹主文 (可縮放字級) */}
          <div 
            style={{ 
              fontSize: activeFont.stem, 
              lineHeight: activeFont.line, 
              fontWeight: 800, 
              color: 'var(--theme-border, var(--theme-border, #17324d))', 
              letterSpacing: '-0.01em',
              whiteSpace: 'pre-line'
            }}
          >
            <MathText text={currentQ.question} />
          </div>

          {/* 四個選項卡 (支援經典消去法 ✂️ 劃線排除) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQ.options.map((opt, optIdx) => {
              const letter = ['A', 'B', 'C', 'D'][optIdx];
              const isSelected = userAnswers[currentQ.id] === optIdx;
              const elimKey = `${currentQ.id}_${optIdx}`;
              const isEliminated = Boolean(eliminatedOptions[elimKey]);

              return (
                <div
                  key={optIdx}
                  onClick={() => !isEliminated && handleSelectOption(optIdx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderRadius: '16px',
                    border: isSelected 
                      ? '2.5px solid var(--theme-accent, #ef8354)' 
                      : isEliminated 
                      ? '1.5px dashed #ded3c5' 
                      : '2px solid var(--theme-border, #17324d)',
                    background: isSelected 
                      ? '#fff0e9' 
                      : isEliminated 
                      ? '#f5f0e6' 
                      : 'var(--theme-card, var(--theme-card, #fffdf9))',
                    boxShadow: isSelected 
                      ? '3px 3px 0 var(--theme-accent, #ef8354)' 
                      : isEliminated 
                      ? 'none' 
                      : '3px 3px 0 var(--theme-border, #17324d)',
                    cursor: isEliminated ? 'not-allowed' : 'pointer',
                    opacity: isEliminated ? 0.45 : 1,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                    {/* 選項字母大圓球 (A, B, C, D) */}
                    <div 
                      style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        background: isSelected ? 'var(--theme-accent, var(--theme-accent, #ef8354))' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))', 
                        color: isSelected ? '#ffffff' : 'var(--theme-border, var(--theme-border, #17324d))',
                        border: '2px solid var(--theme-border, #17324d)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 900,
                        fontSize: '0.98rem',
                        flexShrink: 0
                      }}
                    >
                      {letter}
                    </div>

                    {/* 選項文字 (消去法劃紅刪除線) */}
                    <span 
                      style={{ 
                        fontSize: activeFont.opt, 
                        fontWeight: isSelected ? 900 : 700, 
                        color: isSelected ? '#c8643d' : 'var(--theme-border, var(--theme-border, #17324d))',
                        textDecoration: isEliminated ? 'line-through 2px #ef4444' : 'none',
                        lineHeight: 1.5
                      }}
                    >
                      <MathText text={opt} />
                    </span>
                  </div>

                  {/* 右側操作：消去法按鈕 (✂️ 排除) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isSelected && (
                      <span className="badge badge-coral" style={{ fontWeight: 800 }}>
                        已選中
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => toggleEliminate(e, optIdx)}
                      title={isEliminated ? '取消劃線排除' : '消去法：排除此選項'}
                      style={{
                        background: isEliminated ? '#ef4444' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                        color: isEliminated ? '#fff' : '#78818a',
                        border: '1.5px solid #ded3c5',
                        borderRadius: '8px',
                        padding: '4px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Scissors size={12} />
                      <span>{isEliminated ? '復原' : '消去'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 輔助工作列：提示、計算紙、題目回報 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid #ded3c5', paddingTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* 考前提示 */}
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '10px' }}
              >
                <Lightbulb size={14} color="#f7cf68" />
                <span>{showHint ? '隱藏提示' : '💡 解題思維提示'}</span>
              </button>

              {/* 草稿計算紙 */}
              <button
                type="button"
                onClick={() => setShowScratchpad(!showScratchpad)}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '10px' }}
              >
                <Edit3 size={14} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
                <span>{showScratchpad ? '收合計算紙' : '✏️ 線上草稿計算紙'}</span>
              </button>
            </div>

            {/* 題目回報 */}
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              style={{ background: 'none', border: 'none', color: '#78818a', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <AlertTriangle size={14} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
              <span>題目有誤或超範圍？</span>
            </button>
          </div>

          {/* 解題思路展開卡片 */}
          {showHint && (
            <div 
              style={{ 
                background: '#fff7d9', 
                border: '2px solid #806523', 
                borderRadius: '16px', 
                padding: '16px 20px', 
                color: '#806523', 
                fontSize: '0.88rem', 
                lineHeight: 1.7,
                boxShadow: '3px 3px 0 #806523',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lightbulb size={16} /> 108 課綱命題思維提示：
              </div>
              <div><MathText text={currentQ.hint || '本題檢驗國中課綱之核心素養與運算概念，請注意代數符號與題幹給予之限制條件！'} /></div>
            </div>
          )}

          {/* 線上草稿計算紙 (Scratchpad) */}
          {showScratchpad && (
            <div 
              style={{ 
                background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', 
                border: '2px solid var(--theme-border, #17324d)', 
                borderRadius: '16px', 
                padding: '14px 18px',
                boxShadow: '3px 3px 0 var(--theme-border, #17324d)',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                  ✏️ 本題演算草稿筆記 (隨時記錄計算過程)：
                </span>
                <button
                  type="button"
                  onClick={() => setScratchpadNotes('')}
                  style={{ background: 'none', border: 'none', color: 'var(--theme-accent, var(--theme-accent, #ef8354))', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  清空筆記
                </button>
              </div>
              <textarea
                value={scratchpadNotes}
                onChange={e => setScratchpadNotes(e.target.value)}
                placeholder="可以在這裡鍵入算式過程、代數推導草稿..."
                rows={4}
                style={{
                  width: '100%',
                  background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                  border: '1.5px solid #ded3c5',
                  borderRadius: '10px',
                  padding: '10px',
                  color: 'var(--theme-border, var(--theme-border, #17324d))',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>
          )}
        </main>
      )}

      {/* =========================================================================
          底部題間導航條 (上一題 / 下一題 / 快速交卷)
          ========================================================================= */}
      {!isPaused && (
        <footer 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: 'var(--theme-card, var(--theme-card, #fffdf9))',
            border: '2.5px solid var(--theme-border, #17324d)',
            borderRadius: '20px',
            padding: '14px 24px',
            boxShadow: '5px 5px 0px var(--theme-border, #17324d)'
          }}
        >
          {/* 上一題 */}
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="btn btn-secondary"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            <ArrowLeft size={16} />
            <span>上一題</span>
          </button>

          {/* 題號進度提示 */}
          <div style={{ textAlign: 'center', fontSize: '0.88rem', fontWeight: 800, color: '#5b6772' }}>
            <span>第 {currentIndex + 1} / {questions.length} 題</span>
            <span style={{ marginLeft: '10px', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
              (已作答 {answeredCount} 題，剩餘 {unansweredCount} 題)
            </span>
          </div>

          {/* 下一題 或 最後一題時直接觸發交卷 */}
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.95rem' }}
            >
              <Send size={16} />
              <span>檢查並交卷</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.95rem' }}
            >
              <span>下一題</span>
              <ArrowRight size={16} />
            </button>
          )}
        </footer>
      )}

      {/* =========================================================================
          交卷防呆確認視窗 (Submit Modal)
          ========================================================================= */}
      {isSubmitModalOpen && (
        <div className="modal-overlay">
          <div 
            className="modal-card" 
            style={{ 
              maxWidth: '520px',
              background: 'var(--theme-card, var(--theme-card, #fffdf9))',
              border: '2.5px solid var(--theme-border, #17324d)',
              borderRadius: '24px',
              boxShadow: '10px 10px 0px var(--theme-border, #17324d)'
            }}
          >
            <div className="modal-header" style={{ borderBottom: '2px solid var(--theme-border, #17324d)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={20} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                  確認提交並結算測驗成績
                </h3>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '24px' }}>
              {/* 作答統計看板 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ padding: '12px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1.5px solid var(--theme-border, #17324d)', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#5b6772', fontWeight: 700 }}>總題數</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>{questions.length}</div>
                </div>
                <div style={{ padding: '12px', background: '#e8f6ed', border: '1.5px solid #347650', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#347650', fontWeight: 700 }}>已作答</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#347650' }}>{answeredCount}</div>
                </div>
                <div style={{ padding: '12px', background: unansweredCount > 0 ? '#fff0e9' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: unansweredCount > 0 ? '1.5px solid #ef4444' : '1.5px solid var(--theme-border, #17324d)', borderRadius: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: unansweredCount > 0 ? '#ef4444' : '#5b6772', fontWeight: 700 }}>未作答</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: unansweredCount > 0 ? '#ef4444' : 'var(--theme-border, var(--theme-border, #17324d))' }}>{unansweredCount}</div>
                </div>
              </div>

              {/* 作答警示提示 */}
              {unansweredCount > 0 ? (
                <div style={{ padding: '14px 18px', background: '#fff0e9', border: '2px solid var(--theme-accent, #ef8354)', borderRadius: '14px', color: '#c8643d', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.6 }}>
                  ⚠️ 注意：您還有 <strong>{unansweredCount}</strong> 題尚未作答！未作答題目將直接視為錯誤，強烈建議返回補答。
                </div>
              ) : (
                <div style={{ padding: '14px 18px', background: '#e8f6ed', border: '2px solid #347650', borderRadius: '14px', color: '#347650', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.6 }}>
                  ✅ 太棒了！您已全數完成本測驗的所有題目作答！
                </div>
              )}

              {flaggedCount > 0 && (
                <div style={{ fontSize: '0.82rem', color: '#806523', background: '#fff7d9', border: '1.5px solid #806523', borderRadius: '12px', padding: '10px 14px', fontWeight: 700 }}>
                  💡 您標記了 {flaggedCount} 道待檢查題目 (★)。
                </div>
              )}

              {/* 未答題號快捷跳轉按鈕 */}
              {unansweredCount > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#5b6772', marginBottom: '8px' }}>
                    點選下方未作答題號可直接跳回補答：
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {questions.map((q, idx) => {
                      if (userAnswers[q.id] === undefined) {
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setCurrentIndex(idx);
                              setIsSubmitModalOpen(false);
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '5px 12px', fontSize: '0.8rem', borderColor: 'var(--theme-accent, var(--theme-accent, #ef8354))', color: '#c8643d' }}
                          >
                            第 {idx + 1} 題 補答
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* 耗時資訊 */}
              <div style={{ fontSize: '0.8rem', color: '#78818a', fontWeight: 600, textAlign: 'center' }}>
                本次測驗累計耗時：{Math.floor(secondsSpent / 60)} 分 {secondsSpent % 60} 秒
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '2px solid var(--theme-border, #17324d)', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="btn btn-secondary"
                style={{ padding: '8px 18px' }}
              >
                返回繼續作答
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="btn btn-primary"
                style={{ padding: '8px 22px', fontWeight: 900 }}
              >
                確認交卷結算
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          題目疑義回報 Modal
          ========================================================================= */}
      {isReportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                <AlertTriangle size={18} color="var(--theme-accent, var(--theme-accent, #ef8354))" />
                <span>回報題目疑義 (題號: {currentQ.id})</span>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="btn btn-ghost btn-icon">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>
              {reportSuccessNotice ? (
                <div style={{ padding: '16px', background: '#e8f6ed', border: '2px solid #347650', borderRadius: '12px', color: '#347650', fontWeight: 800, textAlign: 'center' }}>
                  ✅ 感謝你的回報，管理員會盡快查驗並調整題庫！
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#5b6772', marginBottom: '6px' }}>疑義類型：</label>
                    <select
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: '12px', fontWeight: 700 }}
                    >
                      <option value="答案錯誤">答案或選項標示錯誤</option>
                      <option value="題目語意不清">題目語意不清或缺少條件</option>
                      <option value="超出108課綱">超出該年級 108 課綱範圍</option>
                      <option value="其他問題">其他排版或錯字問題</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#5b6772', marginBottom: '6px' }}>補充說明（選填）：</label>
                    <textarea
                      value={reportComment}
                      onChange={e => setReportComment(e.target.value)}
                      rows={3}
                      placeholder="請說明你認為有疑問或需要修正的地方..."
                      style={{ width: '100%', padding: '10px', background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', color: 'var(--theme-border, var(--theme-border, #17324d))', border: '1.5px solid #ded3c5', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600 }}
                    />
                  </div>

                  <button
                    onClick={handleSubmitReport}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', fontWeight: 900 }}
                  >
                    送出回報給管理員
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
