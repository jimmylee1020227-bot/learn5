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
  Scissors,
  FileText,
  Shield,
  Maximize,
  Minimize
} from 'lucide-react';


import MathText from './MathText';
import MathSymbolLegend from './MathSymbolLegend';
export default function QuizPlayer({ questions, onComplete, onExit, onOpenPrintExamModal }) {
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
  const [reportConsent, setReportConsent] = useState(false);
  const [reportSuccessNotice, setReportSuccessNotice] = useState(false);

  // 🛡️ 防作弊與安全監控狀態
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [showCheatAlert, setShowCheatAlert] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastViolationTimeRef = useRef(0);

  // 🛡️ 強制交卷 (違規累計滿 3 次)
  const handleForceSubmit = () => {
    setShowCheatAlert(false);
    const results = questions.map((q, idx) => {
      const qKey = (q && (q.id || q.questionId)) || `q_${idx}`;
      const chosen = userAnswers[qKey];
      const isCorrect = chosen === q.answer;
      return {
        ...q,
        id: qKey,
        userChoice: chosen,
        isCorrect
      };
    });
    onComplete(results, secondsSpent);
  };

  // 🛡️ 全螢幕切換
  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('全螢幕啟用受限:', err);
        });
      } else {
        document.exitFullscreen().catch(err => {
          console.warn('退出全螢幕受限:', err);
        });
      }
    } catch (e) {
      console.warn('全螢幕 API 不支援:', e);
    }
  };

  // 🛡️ 違規偵測處理 (帶 2.5 秒防抖)
  const handleCheatViolation = (reason = '切換分頁或離開測驗畫面') => {
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 2500) return;
    lastViolationTimeRef.current = now;

    setCheatWarnings(prev => {
      const nextCount = prev + 1;
      if (nextCount >= 3) {
        setTimeout(() => {
          alert(`【系統強制交卷】偵測到您已累計違規離開考試畫面達 3 次 (${reason})，系統已依防作弊規範強制收卷！`);
          handleForceSubmit();
        }, 100);
      } else {
        setShowCheatAlert(true);
      }
      return nextCount;
    });
  };

  // 🛡️ 防作弊全方位安全事件監聽
  useEffect(() => {
    // 1. 禁用右鍵選單
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. 禁用文字選取與複製
    const handleCopy = (e) => {
      e.preventDefault();
      alert('【防作弊提醒】測驗進行中嚴禁複製題目內容！');
      return false;
    };

    // 3. 攔截開發者工具與列印快捷鍵
    const handleKeyDown = (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        alert('【防作弊提醒】測驗進行中嚴禁開啟開發者工具 (F12)！');
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && (e.key === 'i' || e.key === 'I' || e.key === 'c' || e.key === 'C' || e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        alert('【防作弊提醒】測驗進行中嚴禁使用開發人員除錯工具！');
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        alert('【防作弊提醒】測驗進行中嚴禁檢視網頁原始碼！');
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        alert('【防作弊提醒】測驗進行中禁止列印畫面！如需紙本請使用官方「紙本考卷列印下載」功能。');
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
    };

    // 4. 偵測切換瀏覽器分頁 (已關閉)
    // const handleVisibilityChange = () => {
    //   if (document.hidden && !isSubmitModalOpen) {
    //     handleCheatViolation('切換至其他分頁');
    //   }
    // };

    // 5. 偵測視窗失焦（例如點擊跳出至其他軟體） (已關閉)
    // const handleBlur = () => {
    //   if (!document.hidden && !isSubmitModalOpen) {
    //     handleCheatViolation('跳出測驗視窗');
    //   }
    // };

    // 6. 全螢幕狀態同步
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('keydown', handleKeyDown);
    // document.addEventListener('visibilitychange', handleVisibilityChange);
    // window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('keydown', handleKeyDown);
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
      // window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isSubmitModalOpen, questions, userAnswers, secondsSpent]);

  const getQKey = (q, idx) => (q && (q.id || q.questionId)) || `q_${idx}`;
  const currentQ = questions[currentIndex] || questions[0];
  const currentQKey = getQKey(currentQ, currentIndex);

  // 當題目組合改變（例如重測、換批題目或新測驗啟動）時，徹底重置測驗狀態，杜絕上一回答案殘留
  useEffect(() => {
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setEliminatedOptions({});
    setSecondsSpent(0);
    setIsPaused(false);
    setShowHint(false);
    setShowAnswerSheet(false);
  }, [questions]);

  // 考試計時器 (支援暫停)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => setSecondsSpent(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    setShowHint(false);
  }, [currentIndex]);

  // 作答選擇 (保證選中，永不因誤觸或重複事件反向取消)
  const handleSelectOption = (optIndex) => {
    if (isPaused) return;
    const qKey = getQKey(currentQ, currentIndex);

    // 如果已被消去劃線，點選時自動取消消去
    const elimKey = `${qKey}_${optIndex}`;
    if (eliminatedOptions[elimKey]) {
      setEliminatedOptions(prev => ({ ...prev, [elimKey]: false }));
    }

    setUserAnswers(prev => ({
      ...prev,
      [qKey]: optIndex
    }));
  };

  // 切換消去法劃線 (刪去法)
  const toggleEliminate = (e, optIndex) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const qKey = getQKey(currentQ, currentIndex);
    const elimKey = `${qKey}_${optIndex}`;
    setEliminatedOptions(prev => ({
      ...prev,
      [elimKey]: !prev[elimKey]
    }));
  };

  // 切換待檢查標記
  const toggleFlagCurrent = () => {
    const qKey = getQKey(currentQ, currentIndex);
    setFlaggedQuestions(prev => ({
      ...prev,
      [qKey]: !prev[qKey]
    }));
  };

  // 交卷動作
  const handleConfirmSubmit = () => {
    setIsSubmitModalOpen(false);
    const results = questions.map((q, idx) => {
      const qKey = getQKey(q, idx);
      const chosen = userAnswers[qKey];
      const isCorrect = chosen === q.answer;
      return {
        ...q,
        id: qKey,
        userChoice: chosen,
        isCorrect
      };
    });
    onComplete(results, secondsSpent);
  };

  // 疑義回報
  const handleSubmitReport = () => {
    const qKey = getQKey(currentQ, currentIndex);
    submitQuestionReport({
      questionId: qKey,
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
        question_id: qKey,
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
  const answeredCount = questions.filter((q, idx) => userAnswers[getQKey(q, idx)] !== undefined).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

  // 字級設定
  const fontSizes = {
    sm: { stem: '1.02rem', opt: '0.92rem', line: '1.75' },
    md: { stem: '1.18rem', opt: '1.02rem', line: '1.85' },
    lg: { stem: '1.35rem', opt: '1.14rem', line: '1.95' }
  };
  const activeFont = fontSizes[fontSize] || fontSizes.md;

  // 切換題目或退出時取消語音播放
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
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

  if (!currentQ || questions.length === 0) {
    return (
      <div 
        style={{ 
          maxWidth: '520px', 
          margin: '60px auto', 
          padding: '40px 24px', 
          textAlign: 'center',
          background: 'var(--theme-card, #fffdf9)',
          border: '2.5px solid var(--theme-border, #17324d)',
          borderRadius: '24px',
          boxShadow: '6px 6px 0px var(--theme-border, #17324d)'
        }}
      >
        <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>📚</div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--theme-border, #17324d)', marginBottom: '8px' }}>
          目前沒有可作答的題目
        </h3>
        <p style={{ color: '#78818a', fontSize: '0.9rem', marginBottom: '24px' }}>
          請檢查單元選取範圍，或點擊下方按鈕重新選題開始測驗！
        </p>
        <button 
          onClick={onExit} 
          className="btn btn-primary"
          style={{ padding: '10px 24px', fontSize: '0.95rem', borderRadius: '12px' }}
        >
          返回題庫首頁
        </button>
      </div>
    );
  }

  // 🛡️ 動態產生防翻拍動態浮水印
  const watermarkText = `讀書網 線上作答測驗 • ${currentUser?.displayName || '考生'} • 嚴禁翻拍作弊`;
  const watermarks = Array.from({ length: 48 }).map((_, i) => (
    <div key={i} className="watermark-item">{watermarkText}</div>
  ));

  return (
    <div className="no-select watermark-container" style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
      
      {/* 🛡️ 全螢幕防翻拍動態浮水印 */}
      <div className="watermark-overlay" aria-hidden="true">
        {watermarks}
      </div>

      {/* 🛡️ 切換分頁／離開視窗違規警告彈窗 */}
      {showCheatAlert && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            background: 'rgba(220, 38, 38, 0.95)', 
            zIndex: 99999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexDirection: 'column', 
            padding: '24px', 
            textAlign: 'center', 
            backdropFilter: 'blur(8px)',
            animation: 'popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div style={{ background: '#ffffff', width: '84px', height: '84px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', marginBottom: '18px' }}>
            <AlertTriangle size={52} color="#dc2626" />
          </div>
          <h2 style={{ color: '#ffffff', fontSize: '2rem', fontWeight: 900, margin: '0 0 10px 0', textShadow: '0 2px 4px rgba(0,0,0,0.25)' }}>
            ⚠️ 嚴正警告：請勿離開測驗畫面！
          </h2>
          <div style={{ background: 'rgba(0, 0, 0, 0.28)', padding: '16px 24px', borderRadius: '16px', maxWidth: '520px', color: '#ffffff', fontSize: '1rem', lineHeight: 1.6, marginBottom: '22px' }}>
            系統偵測到您已切換分頁或離開測驗視窗。<br/>
            為維護測驗公平性，作答期間嚴禁搜尋答案、截圖或切換軟體。<br/>
            <div style={{ marginTop: '10px', fontSize: '1.25rem', fontWeight: 900, color: '#fef08a' }}>
              累計違規警告：{cheatWarnings} / 3 次
            </div>
            <div style={{ fontSize: '0.86rem', opacity: 0.9, marginTop: '4px' }}>
              （⚠️ 警告達 3 次系統將立即自動強制收卷並計算成績！）
            </div>
          </div>
          <button 
            type="button"
            className="btn" 
            style={{ 
              padding: '12px 32px', 
              fontSize: '1.05rem', 
              fontWeight: 900, 
              background: '#ffffff', 
              color: '#dc2626', 
              border: '2px solid #ffffff', 
              borderRadius: '14px', 
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)', 
              cursor: 'pointer' 
            }}
            onClick={() => setShowCheatAlert(false)}
          >
            我已知悉違規，立即返回測驗
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
            線上作答測驗
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

          {/* 4. 紙本考卷列印下載 */}
          <button
            type="button"
            onClick={onOpenPrintExamModal}
            className="btn"
            style={{ 
              padding: '7px 13px', 
              fontSize: '0.82rem', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              color: '#1e40af',
              border: '2px solid #3b82f6',
              boxShadow: '2px 2px 0px #3b82f6',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
            title="紙本考卷列印下載 (官方下載中心 https://examcommunit-mdqeyikj.manus.space/ 與 A4 考卷輸出)"
          >
            <FileText size={15} color="#2563eb" />
            <span>紙本考卷列印下載</span>
          </button>

          {/* 5. 🛡️ 智能防作弊安全監控指示燈 */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 11px', 
              background: cheatWarnings > 0 ? '#fef2f2' : 'var(--theme-bg, #f8f3eb)', 
              border: `1.5px solid ${cheatWarnings > 0 ? '#ef4444' : 'var(--theme-border, #17324d)'}`, 
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.8rem',
              color: cheatWarnings > 0 ? '#b91c1c' : 'var(--theme-border, #17324d)'
            }}
            title="智能防作弊安全監控系統：切換分頁、離開畫面累計達 3 次將強制收卷"
          >
            <Shield size={15} color={cheatWarnings > 0 ? '#ef4444' : '#10b981'} />
            <span>防作弊監控 ({cheatWarnings}/3)</span>
          </div>

          {/* 6. 全螢幕專注作答切換按鈕 */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="btn btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.82rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            title={isFullscreen ? '退出全螢幕' : '切換全螢幕專注作答'}
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            <span>{isFullscreen ? '視窗模式' : '全螢幕專注'}</span>
          </button>

          {/* 7. 結束交卷大按鈕 */}
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
                border: flaggedQuestions[getQKey(currentQ, currentIndex)] ? '2px solid var(--theme-accent, #ef8354)' : '1.5px solid #ded3c5',
                background: flaggedQuestions[getQKey(currentQ, currentIndex)] ? '#fff0e9' : 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
                color: flaggedQuestions[getQKey(currentQ, currentIndex)] ? '#c8643d' : '#5b6772',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {flaggedQuestions[getQKey(currentQ, currentIndex)] ? (
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

          {/* 聽力播放區塊（僅英文科顯示） */}
          {currentQ.isListening && currentQ.audioText && currentQ.subjectId === 'english' && (

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
          {(currentQ.isReading || currentQ.readingText) && currentQ.readingText && (
            <div style={{ background: '#fcf8e3', border: '1.5px solid #faebcc', borderRadius: '16px', padding: '20px 24px', marginBottom: '8px', maxHeight: '380px', overflowY: 'auto' }}>
              <span style={{ display: 'inline-block', background: '#8a6d3b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 900, marginBottom: '12px' }}>
                📖 閱讀素養文本
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
          {(currentQ.isSvg || currentQ.svgContent) && currentQ.svgContent && (
            <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '16px', padding: '20px', marginBottom: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'visible', minHeight: '160px' }}>
              <div
                className="quiz-svg-wrapper"
                style={{ maxWidth: '100%', width: '100%', display: 'flex', justifyContent: 'center' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentQ.svgContent, {
                  USE_PROFILES: { svg: true, svgFilters: true },
                  ADD_TAGS: ['svg', 'path', 'line', 'circle', 'rect', 'text', 'g', 'polyline', 'polygon', 'ellipse', 'defs', 'marker', 'linearGradient', 'stop'],
                  ADD_ATTR: ['viewBox', 'xmlns', 'style', 'fill', 'stroke', 'stroke-width', 'rx', 'ry', 'text-anchor', 'font-size', 'font-weight', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'points', 'width', 'height', 'transform', 'd'],
                  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
                  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
                }) }}
              />
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
            
            {currentQ.tts && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const u = new SpeechSynthesisUtterance(currentQ.tts);
                  u.lang = currentQ.ttsLang || 'en-US';
                  u.rate = 0.85;
                  window.speechSynthesis.speak(u);
                }}
                style={{ marginBottom: '10px', padding: '8px 16px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                🔊 播放聽力測驗
              </button>
            )}
            <MathText text={currentQ.question} />
            {currentQ.html && (
              <div 
                style={{ marginTop: '10px', marginBottom: '10px' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentQ.html, { USE_PROFILES: { svg: true, html: true }, ADD_TAGS: ['svg','path','line','circle','rect','text','g','polyline','polygon'] }) }} 
              />
            )}


          </div>

          {/* 四個選項卡 (支援經典消去法 ✂️ 劃線排除) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQ.options.map((opt, optIdx) => {
              const letter = ['A', 'B', 'C', 'D'][optIdx];
              const currentQKey = getQKey(currentQ, currentIndex);
              const isSelected = userAnswers[currentQKey] === optIdx;
              const elimKey = `${currentQKey}_${optIdx}`;
              const isEliminated = Boolean(eliminatedOptions[elimKey]);

              return (
                <div
                  key={optIdx}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectOption(optIdx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectOption(optIdx);
                    }
                  }}
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
                    cursor: 'pointer',
                    opacity: isEliminated ? 0.6 : 1,
                    transition: 'all 0.15s ease',
                    width: '100%',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    WebkitTapHighlightColor: 'transparent',
                    pointerEvents: 'auto'
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
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
                <span>回報題目疑義 (題號: {getQKey(currentQ, currentIndex)})</span>
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

                  {/* 表單個資與隱私授權勾選 (Form Consent) */}
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: '#5b6772', fontWeight: 600, cursor: 'pointer', margin: '4px 0' }}>
                    <input 
                      type="checkbox" 
                      checked={reportConsent} 
                      onChange={e => setReportConsent(e.target.checked)} 
                      style={{ marginTop: '2px', accentColor: 'var(--theme-accent, #ef8354)', width: '16px', height: '16px', cursor: 'pointer' }}
                      aria-required="true"
                    />
                    <span>我同意本平台依《個人資料保護法》及隱私權政策處理上述疑義說明與通訊紀錄。</span>
                  </label>

                  <button
                    onClick={handleSubmitReport}
                    disabled={!reportConsent}
                    className="btn btn-primary"
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      fontWeight: 900,
                      opacity: reportConsent ? 1 : 0.5,
                      cursor: reportConsent ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {reportConsent ? '確認送出疑義報告給管理組' : '請先勾選同意隱私條款'}
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
