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
import AdminSupportChat from './components/AdminSupportChat';
import AdminDashboard from './components/AdminDashboard';
import SuperAdminConsole from './components/SuperAdminConsole';
import LuckyDrawModal from './components/LuckyDrawModal';
import GoogleLoginModal from './components/GoogleLoginModal';
import RedemptionModal from './components/RedemptionModal';
import CommunityWallModal from './components/CommunityWallModal';
import { DeviceProvider, useDevice } from './context/DeviceContext';
import MobileBottomNav from './components/MobileBottomNav';
import LoginGateway from './components/LoginGateway';
import { generateQuizSet } from './data/questionGenerator';
import { 
  recordPracticeBatch,
  recordPracticeLog, 
  updateMistakeRecord, 
  SUPER_ADMIN_EMAIL, 
  incrementDailyPracticeStats 
} from './services/cloudStorage';

function MainAppContent() {
  const { 
    currentUser, 
    triggerGoogleLogin, 
    isGoogleConfigModalOpen,
    setIsGoogleConfigModalOpen 
  } = useAuth();
  const { awardQuizCorrectPoints, setIsLuckyDrawOpen } = useGame();
  const { isMobile, deviceType } = useDevice();

  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'reinforce' | 'leaderboard' | 'history' | 'chat' | 'admin' | 'super_admin'
  const [isRedemptionOpen, setIsRedemptionOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  
  // 測驗流程狀態管理: 'idle' | 'in_quiz' | 'result'
  const [quizState, setQuizState] = useState('idle');
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [lastResults, setLastResults] = useState([]);
  const [lastTimeSpent, setLastTimeSpent] = useState(0);
  const [lastQuizConfig, setLastQuizConfig] = useState(null);

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
    setCurrentQuestions(reinforceQuestions);
    setActiveTab('quiz');
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

  // 嚴格強制登入機制：未登入時全螢幕鎖定為登入閘道，禁止任何訪客操作
  if (!currentUser) {
    return (
      <div className="app-container">
        <LoginGateway />
        <GoogleLoginModal />
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
        onOpenCommunityModal={() => setIsCommunityOpen(true)}
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
                  onOpenCommunityModal={() => setIsCommunityOpen(true)}
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
                onGoReinforce={() => setActiveTab('reinforce')}
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

        {activeTab === 'chat' && (
          <AdminSupportChat />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}

        {activeTab === 'super_admin' && (
          <SuperAdminConsole />
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
          onOpenCommunity={() => setIsCommunityOpen(true)}
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
      <CommunityWallModal 
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
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
