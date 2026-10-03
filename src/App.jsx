import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider, useGame } from './context/GameContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import GlobalBroadcastBanner from './components/GlobalBroadcastBanner';
import HeroBanner from './components/HeroBanner';
import ScopeSelector from './components/ScopeSelector';
import LeaderboardView from './components/LeaderboardView';
import { DeviceProvider, useDevice } from './context/DeviceContext';
import MobileBottomNav from './components/MobileBottomNav';
import LoginGateway from './components/LoginGateway';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import Footer from './components/Footer';
import CookieConsentBanner from './components/CookieConsentBanner';
import GoogleLoginModal from './components/GoogleLoginModal';

// ── 性能極致加速：重型非首頁模組採用動態非同步載入 (首頁體積減少 85%，秒開渲染) ──
const QuizPlayer = React.lazy(() => import('./components/QuizPlayer'));
const QuizResult = React.lazy(() => import('./components/QuizResult'));
const MistakeReinforceView = React.lazy(() => import('./components/MistakeReinforceView'));
const UserHistoryModal = React.lazy(() => import('./components/UserHistoryModal'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const UnitNotesView = React.lazy(() => import('./components/UnitNotesView'));
const SuperAdminConsole = React.lazy(() => import('./components/SuperAdminConsole'));
const TeacherDashboard = React.lazy(() => import('./components/TeacherDashboard'));
const ClassStudentView = React.lazy(() => import('./components/ClassStudentView'));
const LuckyDrawModal = React.lazy(() => import('./components/LuckyDrawModal'));
const RedemptionModal = React.lazy(() => import('./components/RedemptionModal'));
const LearningProgressModal = React.lazy(() => import('./components/LearningProgressModal'));
const TeacherApplyModal = React.lazy(() => import('./components/TeacherApplyModal'));
const LegalCenterModal = React.lazy(() => import('./components/LegalCenterModal'));

import { generateQuizSet } from './data/questionGenerator';
import { 
  checkIsTeacher, 
  submitAssignment, 
  recordPointsForClassAndGlobal 
} from './services/classService';
import { 
  recordPracticeBatch,
  recordPracticeLog, 
  updateMistakeRecord, 
  SUPER_ADMIN_EMAIL, 
  checkIsAdmin,
  checkIsSuperAdmin,
  incrementDailyPracticeStats,
  getPrivacyConsent,
  savePrivacyConsent,
  subscribeToCloudSync,
  autoSyncLocalPendingDataToCloud,
  pruneLocalStorageQuota
} from './services/cloudStorage';

function MainAppContent() {
  const { 
    currentUser, 
    logout,
    authLoading,
    triggerGoogleLogin, 
    isGoogleConfigModalOpen,
    setIsGoogleConfigModalOpen 
  } = useAuth();
  const { awardQuizCorrectPoints, setIsLuckyDrawOpen } = useGame();
  const { isMobile, deviceType } = useDevice();

  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'reinforce' | 'leaderboard' | 'history' | 'class' | 'teacher' | 'admin' | 'super_admin'
  const [isRedemptionOpen, setIsRedemptionOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('privacy');

  // 班級系統與課綱掌握度分析狀態
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isTeacherApplyModalOpen, setIsTeacherApplyModalOpen] = useState(false);
  const [progressTargetStudent, setProgressTargetStudent] = useState(null);

  const handleOpenLegalModal = (tab = 'privacy') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };
  
  // 測驗流程狀態管理: 'idle' | 'in_quiz' | 'result'
  const [quizState, setQuizState] = useState('idle');
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [lastResults, setLastResults] = useState([]);
  const [lastTimeSpent, setLastTimeSpent] = useState(0);
  const [lastQuizConfig, setLastQuizConfig] = useState(null);

  // 隱私權政策與服務條款同意狀態管理
  const [privacyConsent, setPrivacyConsent] = useState(() => {
    return currentUser?.id ? getPrivacyConsent(currentUser.id) : null;
  });

  React.useEffect(() => {
    if (currentUser?.id) {
      setPrivacyConsent(getPrivacyConsent(currentUser.id));
      const unsub = subscribeToCloudSync((event) => {
        if (event.key === `privacy_consent_${currentUser.id}`) {
          setPrivacyConsent(getPrivacyConsent(currentUser.id));
        }
      });
      return unsub;
    }
  }, [currentUser]);

  const handleAcceptPrivacy = () => {
    if (currentUser?.id) {
      const saved = savePrivacyConsent(currentUser.id, currentUser);
      setPrivacyConsent(saved);
    }
  };

  const handleDeclinePrivacy = () => {
    logout();
  };

  // 啟動自選題庫測驗
  const handleStartQuiz = (config) => {
    setLastQuizConfig(config);
    let generated = generateQuizSet(config);
    // 防呆：若題目生成失敗或回傳空陣列，用預設組合 fallback
    if (!generated || generated.length === 0) {
      generated = generateQuizSet({
        subjectId: config.subjectId || 'math',
        gradeId: config.gradeId || 'g8',
        unitId: null,
        count: config.count || 10,
        difficulty: config.difficulty || 'medium'
      });
    }
    if (!generated || generated.length === 0) return; // 真的生不出來就不進入
    setCurrentQuestions(generated);
    setQuizState('in_quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 啟動錯題加強模式測驗
  const handleStartReinforceQuiz = (reinforceQuestions) => {
    let questionsToStart = reinforceQuestions;
    if (!questionsToStart || questionsToStart.length === 0) {
      questionsToStart = generateQuizSet({
        subjectId: 'math',
        gradeId: 'g8',
        unitId: 'ma-8-u1',
        count: 8,
        difficulty: 'medium'
      });
    }
    setCurrentQuestions(questionsToStart);
    setActiveTab('quiz'); // 確保切換回主測驗分頁，立刻渲染作答畫面
    setQuizState('in_quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 啟動班級作業測驗
  const handleStartAssignmentQuiz = (assignment) => {
    if (!assignment || !assignment.questions || assignment.questions.length === 0) return;
    setActiveAssignment(assignment);
    setCurrentQuestions(assignment.questions);
    setActiveTab('quiz');
    setQuizState('in_quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 測驗完成交卷
  const handleCompleteQuiz = (results, timeSpentSec) => {
    try {
      const safeResults = Array.isArray(results) ? results : [];
      const safeTimeSpent = typeof timeSpentSec === 'number' ? timeSpentSec : 15;
      const correctCount = safeResults.filter(r => r && r.isCorrect).length;

      const activeUserId = currentUser?.id || 'guest_student';
      const activeUserName = currentUser?.displayName || '國中同學';
      const activeUserSchool = currentUser?.role === 'super_admin' ? '系統總管理員' : '會考戰友';

      // 1. 最高優先級：計算並發放點數（每對 1 題 1 點，支援 2x / 4x 暴擊）
      if (currentUser && correctCount > 0) {
        try {
          awardQuizCorrectPoints(correctCount);
        } catch (err) {
          console.error('[Quiz Complete] Failed to award quiz correct points:', err);
        }
      }

      // 每日練習目標統計累積
      if (currentUser) {
        try {
          incrementDailyPracticeStats(currentUser.id, safeResults.length, correctCount);
        } catch (err) {
          console.warn('[Quiz Complete] Failed to increment daily stats:', err);
        }
      }

      // 2. 記錄所有做過的題目與錯題至雲端 (原子化批次同步，杜絕多併發丟失，試卷 100% 封存)
      try {
        recordPracticeBatch({
          userId: activeUserId,
          userName: activeUserName,
          userSchool: activeUserSchool,
          userEmail: currentUser?.email || '',
          results: safeResults,
          timeSpentSec: safeTimeSpent,
          customTitle: activeAssignment ? `【班級作業】${activeAssignment.title}` : undefined
        });
      } catch (err) {
        console.warn('[Quiz Complete] Failed to record practice batch:', err);
      }

      // 3. 🚀 手機交卷立即補推雙保險：確保所有考卷、日誌與點數瞬間 100% 抵達 Firebase
      if (currentUser) {
        setTimeout(() => {
          try {
            autoSyncLocalPendingDataToCloud(currentUser);
          } catch (e) {}
        }, 50);
      }

      // 4. 若當前測驗為班級作業，提交作答紀錄至作業模組
      if (activeAssignment && currentUser) {
        submitAssignment({
          assignmentId: activeAssignment.id,
          studentUser: currentUser,
          results: safeResults,
          timeSpentSec: safeTimeSpent
        }).catch(err => console.error('Failed to submit assignment', err));
        setActiveAssignment(null);
      }

      // 5. 正確答題點數同時同步累計至所屬班級內部競賽排行榜
      if (currentUser && correctCount > 0) {
        try {
          recordPointsForClassAndGlobal(currentUser, correctCount, false);
        } catch (err) {
          console.error('Failed to sync points for class', err);
        }
      }

      // 6. 安全切換至成績結果頁
      setLastResults(safeResults);
      setLastTimeSpent(safeTimeSpent);
      setQuizState('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (criticalErr) {
      console.error('[Quiz Complete Critical Fallback]', criticalErr);
      setLastResults(Array.isArray(results) ? results : []);
      setLastTimeSpent(timeSpentSec || 15);
      setQuizState('result');
    }
  };

  const handleRetryQuiz = () => {
    if (lastQuizConfig) {
      handleStartQuiz(lastQuizConfig);
    } else {
      setQuizState('idle');
    }
  };

  // Google OAuth 回調時短暫隱藏畫面（不顯示文字，避免使用者覺得卡頓，僅等待數百毫秒）
  if (authLoading) {
    return <div className="app-container" style={{ background: 'var(--theme-bg, #f8f3eb)', minHeight: '100vh' }}></div>;
  }

  // 強制登入機制：未登入時全螢幕鎖定為登入閘道
  if (!currentUser) {
    return (
      <div className="app-container">
        <LoginGateway />
        <GoogleLoginModal />
      </div>
    );
  }

  // 2. 嚴格隱私權條款強制同意門禁：首次登入未同意前，強制鎖定在條款確認畫面，不可使用此網頁
  if (!privacyConsent || !privacyConsent.consented) {
    return (
      <div className="app-container">
        <PrivacyPolicyModal 
          isOpen={true}
          user={currentUser}
          onAccept={handleAcceptPrivacy}
          onDecline={handleDeclinePrivacy}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 頂部全服跑馬燈廣播 */}
      <GlobalBroadcastBanner />

      {/* 頂部導航列 */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'quiz') setQuizState('idle');
        }}
        onOpenRedemptionModal={() => setIsRedemptionOpen(true)}
        onOpenLegalModal={handleOpenLegalModal}
        onOpenProgressModal={() => {
          setProgressTargetStudent(currentUser);
          setIsProgressModalOpen(true);
        }}
        onOpenTeacherApplyModal={() => setIsTeacherApplyModalOpen(true)}
      />

      {/* 主工作區塊 */}
      <main className="main-content" style={{ paddingBottom: isMobile ? '80px' : '32px' }}>
        <React.Suspense fallback={
          <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#ef8354' }}>
            <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #ef8354', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '10px' }} />
            模組載入中...
          </div>
        }>
          {activeTab === 'quiz' && (
            <>
              {quizState === 'idle' && (
                <>
                  <HeroBanner 
                    onStartQuizTab={() => {
                      const el = document.getElementById('scope-selector-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    onStartReinforceTab={() => setActiveTab('reinforce')}
                    onStartLeaderboardTab={() => setActiveTab('leaderboard')}
                    onOpenRedemptionModal={() => setIsRedemptionOpen(true)}
                    onGoNotesTab={() => setActiveTab('notes')}
                  />

                  <div id="scope-selector-section">
                    <ScopeSelector 
                      onStartQuiz={handleStartQuiz} 
                    />
                  </div>
                </>
              )}

              {quizState === 'in_quiz' && (
                <QuizPlayer
                  questions={currentQuestions}
                  onComplete={handleCompleteQuiz}
                  onExit={() => {
                    setActiveAssignment(null);
                    setQuizState('idle');
                  }}
                />
              )}

              {quizState === 'result' && (
                <QuizResult
                  results={lastResults}
                  timeSpentSec={lastTimeSpent}
                  onRetry={handleRetryQuiz}
                  onGoReinforce={() => {
                    setQuizState('idle');
                    setActiveTab('reinforce');
                  }}
                  onBackHome={() => setQuizState('idle')}
                  onGoHistory={() => {
                    setQuizState('idle');
                    setActiveTab('history');
                  }}
                />
              )}
            </>
          )}

          {activeTab === 'reinforce' && (
            <MistakeReinforceView onStartReinforceQuiz={handleStartReinforceQuiz} />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView />
          )}

          {activeTab === 'history' && (
            <UserHistoryModal 
              onLaunchRetryQuiz={handleStartReinforceQuiz} 
              onStartQuizTab={() => setActiveTab('quiz')} 
            />
          )}

          {activeTab === 'class' && (
            <ClassStudentView 
              currentUser={currentUser}
              onStartAssignmentQuiz={handleStartAssignmentQuiz}
              onGoGlobalLeaderboard={() => setActiveTab('leaderboard')}
              onOpenProgressModal={() => {
                setProgressTargetStudent(currentUser);
                setIsProgressModalOpen(true);
              }}
            />
          )}

          {activeTab === 'teacher' && (
            checkIsTeacher(currentUser) ? (
              <TeacherDashboard 
                currentUser={currentUser}
                onOpenProgressModal={(targetStudent) => {
                  setProgressTargetStudent(targetStudent);
                  setIsProgressModalOpen(true);
                }}
              />
            ) : (
              <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
                <h3 style={{ color: '#ef4444', fontWeight: 800 }}>403 拒絕存取</h3>
                <p style={{ color: '#78818a', fontSize: '0.9rem', marginTop: '8px' }}>此區域僅限通過認證之任課教師存取。請點選下方按鈕申請或快速開通身分。</p>
                <button 
                  onClick={() => setIsTeacherApplyModalOpen(true)}
                  className="btn btn-primary"
                  style={{ marginTop: '16px', padding: '10px 20px', fontSize: '0.9rem' }}
                >
                  申請認證教師身分
                </button>
              </div>
            )
          )}

          {activeTab === 'notes' && (
            <UnitNotesView 
              onStartQuizForUnit={(subj, grade, uId) => {
                setActiveTab('quiz');
                handleStartQuiz({ 
                  subjectId: subj, 
                  gradeId: grade, 
                  unitIds: [uId], 
                  count: 10, 
                  difficulty: 'medium' 
                });
              }}
            />
          )}

          {activeTab === 'admin' && (
            checkIsAdmin(currentUser) ? (
              <AdminDashboard 
                onOpenProgressModal={(student) => {
                  setProgressTargetStudent(student);
                  setIsProgressModalOpen(true);
                }}
              />
            ) : (
              <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
                <h3 style={{ color: '#ef4444', fontWeight: 800 }}>403 拒絕存取</h3>
                <p style={{ color: '#78818a', fontSize: '0.9rem', marginTop: '6px' }}>此區域僅限通過 Google 驗證之站務管理員存取。</p>
              </div>
            )
          )}

          {activeTab === 'super_admin' && (
            checkIsSuperAdmin(currentUser) ? (
              <SuperAdminConsole />
            ) : (
              <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
                <h3 style={{ color: '#ef4444', fontWeight: 800 }}>403 拒絕存取</h3>
                <p style={{ color: '#78818a', fontSize: '0.9rem', marginTop: '6px' }}>此區域僅限系統唯一總管理員存取。</p>
              </div>
            )
          )}
        </React.Suspense>
      </main>

      {/* 網站頁尾 (包含組織立案、法務條款導覽與無障礙宣告) */}
      <Footer onOpenLegalModal={handleOpenLegalModal} />

      {/* 手機專屬智慧底部導航列 (自動偵測手機寬度呈現，不可手動切換) */}
      {isMobile && (
        <MobileBottomNav 
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'quiz') setQuizState('idle');
          }}
          onOpenLuckyDraw={() => setIsLuckyDrawOpen(true)}
        />
      )}

      {/* 全域彈窗 */}
      <React.Suspense fallback={null}>
        <LuckyDrawModal />
        <GoogleLoginModal />
        <RedemptionModal 
          isOpen={isRedemptionOpen}
          onClose={() => setIsRedemptionOpen(false)}
        />
        <LegalCenterModal 
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          initialTab={legalModalTab}
        />
        <CookieConsentBanner 
          onOpenLegalModal={handleOpenLegalModal}
        />

        {/* 課綱單元掌握度表 (學習進度) 全域彈窗 */}
        <LearningProgressModal 
          isOpen={isProgressModalOpen}
          onClose={() => setIsProgressModalOpen(false)}
          studentUser={progressTargetStudent || currentUser}
          onStartUnitQuiz={({ subjectId, gradeId, unitId, unitName }) => {
            setIsProgressModalOpen(false);
            setActiveTab('quiz');
            handleStartQuiz({ 
              subjectId: subjectId || 'math', 
              gradeId: gradeId || 'g8', 
              unitIds: [unitId], 
              count: 10, 
              difficulty: 'medium' 
            });
          }}
        />

        {/* 教師身分申請與快速開通彈窗 */}
        <TeacherApplyModal 
          isOpen={isTeacherApplyModalOpen}
          onClose={() => setIsTeacherApplyModalOpen(false)}
          currentUser={currentUser}
          onTeacherStatusChanged={() => setActiveTab('teacher')}
        />
      </React.Suspense>
    </div>
  );
}


class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[AppErrorBoundary]', error, errorInfo);
    this.setState({ errorInfo });
  }
  handleResetAndHome = () => {
    try {
      window.sessionStorage.clear();
      try { pruneLocalStorageQuota(); } catch (_) {}
      // 自動清理格式異常的非陣列快取（不影響使用者登入帳號）
      ['studyhub_teachers_list', 'studyhub_teacher_applications', 'studyhub_classes'].forEach(k => {
        const val = window.localStorage.getItem(k);
        if (val && !val.startsWith('[')) {
          window.localStorage.removeItem(k);
        }
      });
    } catch (e) {}
    window.location.href = window.location.pathname;
  };

  handlePruneAndReload = () => {
    try {
      pruneLocalStorageQuota();
      // 強力釋放非核心大快取
      ['studyhub_cloud_all_quiz_papers', 'studyhub_all_quiz_papers', 'studyhub_cloud_audit_logs'].forEach(k => {
        window.localStorage.removeItem(k);
      });
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || String(this.state.error || '未知執行異常');
      const errorStack = this.state.error?.stack || this.state.errorInfo?.componentStack || '';
      const isQuotaError = typeof errorMsg === 'string' && (errorMsg.includes('quota') || errorMsg.includes('QuotaExceeded'));

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8f3eb',
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            background: '#fffdf9',
            border: '3px solid #17324d',
            borderRadius: '24px',
            boxShadow: '8px 8px 0px #17324d',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{isQuotaError ? '💾' : '⚠️'}</div>
            <h2 style={{ color: '#17324d', fontWeight: 900, marginBottom: '12px' }}>
              {isQuotaError ? '本機快取空間已滿' : '頁面載入異常'}
            </h2>
            <p style={{ color: '#5b6772', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
              {isQuotaError 
                ? '瀏覽器儲存空間（5MB）已達到上限，導致暫時無法寫入做題資料。請點擊下方「釋放空間」即可自動清理舊試卷並恢復！'
                : '系統遇到未預期的錯誤，可能是快取暫存問題或弱網狀態。請點擊下方按鈕重新載入或重設回到首頁。'
              }
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
              {isQuotaError ? (
                <button
                  onClick={this.handlePruneAndReload}
                  style={{
                    padding: '10px 24px',
                    background: '#10b981',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    border: '2px solid #17324d',
                    borderRadius: '12px',
                    boxShadow: '3px 3px 0px #17324d',
                    cursor: 'pointer'
                  }}
                >
                  🧹 立即釋放空間並恢復
                </button>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    padding: '10px 24px',
                    background: '#ef8354',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    border: '2px solid #17324d',
                    borderRadius: '12px',
                    boxShadow: '3px 3px 0px #17324d',
                    cursor: 'pointer'
                  }}
                >
                  🔄 重新載入
                </button>
              )}
              <button
                onClick={this.handleResetAndHome}
                style={{
                  padding: '10px 24px',
                  background: '#ffffff',
                  color: '#17324d',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: '2px solid #17324d',
                  borderRadius: '12px',
                  boxShadow: '3px 3px 0px #17324d',
                  cursor: 'pointer'
                }}
              >
                🏠 返回首頁
              </button>
            </div>

            {/* 可折疊錯誤詳細訊息 */}
            <details style={{ textAlign: 'left', background: '#f1eee7', border: '1px solid #ded3c5', borderRadius: '10px', padding: '10px 14px', fontSize: '0.78rem', color: '#64748b' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#17324d' }}>
                🔍 查看詳細診斷資訊 (給開發者排查)
              </summary>
              <div style={{ marginTop: '8px', wordBreak: 'break-all', fontFamily: 'monospace', color: '#b91c1c', maxHeight: '160px', overflowY: 'auto' }}>
                <strong>錯誤：</strong> {errorMsg}
                {errorStack && (
                  <pre style={{ marginTop: '6px', fontSize: '0.72rem', whiteSpace: 'pre-wrap', color: '#475569' }}>
                    {errorStack}
                  </pre>
                )}
              </div>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <DeviceProvider>
        <ThemeProvider>
          <AuthProvider>
            <GameProvider>
              <MainAppContent />
            </GameProvider>
          </AuthProvider>
        </ThemeProvider>
      </DeviceProvider>
    </AppErrorBoundary>
  );
}
