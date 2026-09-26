import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider, useGame } from './context/GameContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import GlobalBroadcastBanner from './components/GlobalBroadcastBanner';
import HeroBanner from './components/HeroBanner';
import ScopeSelector from './components/ScopeSelector';
import QuizPlayer from './components/QuizPlayer';
import QuizResult from './components/QuizResult';
import MistakeReinforceView from './components/MistakeReinforceView';
import LeaderboardView from './components/LeaderboardView';
import UserHistoryModal from './components/UserHistoryModal';
import AdminDashboard from './components/AdminDashboard';
import UnitNotesView from './components/UnitNotesView';
import SuperAdminConsole from './components/SuperAdminConsole';
import LuckyDrawModal from './components/LuckyDrawModal';
import GoogleLoginModal from './components/GoogleLoginModal';
import RedemptionModal from './components/RedemptionModal';
import { DeviceProvider, useDevice } from './context/DeviceContext';
import MobileBottomNav from './components/MobileBottomNav';
import LoginGateway from './components/LoginGateway';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import Footer from './components/Footer';
import LegalCenterModal from './components/LegalCenterModal';
import CookieConsentBanner from './components/CookieConsentBanner';
import { generateQuizSet } from './data/questionGenerator';
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
  subscribeToCloudSync
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

  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'reinforce' | 'leaderboard' | 'history' | 'admin' | 'super_admin'
  const [isRedemptionOpen, setIsRedemptionOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('privacy');

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
    const generated = generateQuizSet(config);
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

  // 測驗完成交卷
  const handleCompleteQuiz = (results, timeSpentSec) => {
    setLastResults(results);
    setLastTimeSpent(timeSpentSec);
    setQuizState('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const correctCount = results.filter(r => r.isCorrect).length;

    const activeUserId = currentUser?.id || 'guest_student';
    const activeUserName = currentUser?.displayName || '國中同學';
    const activeUserSchool = currentUser?.role === 'super_admin' ? '系統總管理員' : '會考戰友';

    // 1. 計算並發放點數（每對 1 題 1 點，支援 2x / 4x 暴擊）
    if (currentUser) {
      awardQuizCorrectPoints(correctCount);

      // 每日練習目標統計累積
      incrementDailyPracticeStats(currentUser.id, results.length, correctCount);
    }

    // 2. 記錄所有做過的題目與錯題至雲端 (原子化批次同步，杜絕多併發丟失，試卷 100% 封存)
    recordPracticeBatch({
      userId: activeUserId,
      userName: activeUserName,
      userSchool: activeUserSchool,
      userEmail: currentUser?.email || '',
      results,
      timeSpentSec
    });
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
      />

      {/* 主工作區塊 */}
      <main className="main-content" style={{ paddingBottom: isMobile ? '80px' : '32px' }}>
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
                onExit={() => setQuizState('idle')}
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
            <AdminDashboard />
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
    </div>
  );
}


class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[AppErrorBoundary]', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
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
            maxWidth: '440px',
            background: '#fffdf9',
            border: '3px solid #17324d',
            borderRadius: '24px',
            boxShadow: '8px 8px 0px #17324d',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ color: '#17324d', fontWeight: 900, marginBottom: '12px' }}>
              頁面載入異常
            </h2>
            <p style={{ color: '#5b6772', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
              系統遇到未預期的錯誤，可能是網路連線問題或暫時性異常。請嘗試重新載入頁面。
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 32px',
                background: '#ef8354',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1rem',
                border: '2.5px solid #17324d',
                borderRadius: '14px',
                boxShadow: '4px 4px 0px #17324d',
                cursor: 'pointer'
              }}
            >
              🔄 重新載入
            </button>
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
