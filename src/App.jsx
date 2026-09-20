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
import SuperAdminConsole from './components/SuperAdminConsole';
import LuckyDrawModal from './components/LuckyDrawModal';
import GoogleLoginModal from './components/GoogleLoginModal';
import RedemptionModal from './components/RedemptionModal';
import { DeviceProvider, useDevice } from './context/DeviceContext';
import MobileBottomNav from './components/MobileBottomNav';
import LoginGateway from './components/LoginGateway';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
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
    triggerGoogleLogin, 
    isGoogleConfigModalOpen,
    setIsGoogleConfigModalOpen 
  } = useAuth();
  const { awardQuizCorrectPoints, setIsLuckyDrawOpen } = useGame();
  const { isMobile, deviceType } = useDevice();

  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'reinforce' | 'leaderboard' | 'history' | 'admin' | 'super_admin'
  const [isRedemptionOpen, setIsRedemptionOpen] = useState(false);
  
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
    if (!reinforceQuestions || reinforceQuestions.length === 0) return;
    setCurrentQuestions(reinforceQuestions);
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

    // 1. 計算並發放點數（每對 1 題 1 點，支援 2x / 4x 暴擊）
    if (currentUser) {
      awardQuizCorrectPoints(correctCount);

      // 每日練習目標統計累積
      incrementDailyPracticeStats(currentUser.id, results.length, correctCount);

      // 2. 記錄所有做過的題目與錯題至雲端 (原子化批次同步，杜絕多併發丟失)
      recordPracticeBatch({
        userId: currentUser.id,
        userName: currentUser.displayName,
        userSchool: currentUser.role === 'super_admin' ? '系統總管理員' : '會考戰友',
        results,
        timeSpentSec
      });
    }
  };

  const handleRetryQuiz = () => {
    if (lastQuizConfig) {
      handleStartQuiz(lastQuizConfig);
    } else {
      setQuizState('idle');
    }
  };

  // 1. 嚴格強制登入機制：未登入時全螢幕鎖定為登入閘道，禁止任何訪客操作
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
                />
                <div id="scope-selector-section">
                  <ScopeSelector onStartQuiz={handleStartQuiz} />
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
          <UserHistoryModal onLaunchRetryQuiz={handleStartReinforceQuiz} />
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
    </div>
  );
}

export default function App() {
  return (
    <DeviceProvider>
      <ThemeProvider>
        <AuthProvider>
          <GameProvider>
            <MainAppContent />
          </GameProvider>
        </AuthProvider>
      </ThemeProvider>
    </DeviceProvider>
  );
}
