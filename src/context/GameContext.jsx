import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { addStudentPoints } from '../services/leaderboardService';
import { getGlobalSettings, subscribeToCloudSync, getJson, setJson, updateServerSync, fetchCloudUserGameState, getTaiwanDateStr } from '../services/cloudStorage';
import { getRealDate, getRealTime, syncServerTime } from '../services/timeService';
import confetti from 'canvas-confetti';

const GameContext = createContext();

const STORAGE_GAME_KEY = 'studyhub_game_state';

const DEFAULT_GAME_STATE = {
  tickets: 0,
  pityCount: 0,
  lastDailyClaimDate: '',
  personalMultiplier: 1,
  multiplierExpiresAt: 0,
  unlockedBadges: [],
  updatedAt: 0
};

export function GameProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'guest_student';

  const [globalSettings, setGlobalSettings] = useState(getGlobalSettings());
  
  // 學生個人遊戲狀態：抽獎券、點數倍率、每日簽到日期 (雲端即時同步)
  const [gameState, setLocalGameState] = useState(() => {
    return getJson(`${STORAGE_GAME_KEY}_${userId}`, DEFAULT_GAME_STATE) || DEFAULT_GAME_STATE;
  });

  // 全域包裹 setGameState，確保從任何組件 (如兌換碼) 呼叫時，都會自動同步到雲端
  const setGameState = useCallback((action) => {
    setLocalGameState(prev => {
      const nextState = typeof action === 'function' ? action(prev) : { ...prev, ...action };
      nextState.updatedAt = getRealTime();
      setJson(`${STORAGE_GAME_KEY}_${userId}`, nextState);
      if (userId && userId !== 'guest_student') {
        updateServerSync(`${STORAGE_GAME_KEY}_${userId}`, nextState);
      }
      return nextState;
    });
  }, [userId]);

  const [isLuckyDrawOpen, setIsLuckyDrawOpen] = useState(false);
  const hasClaimedTodayRef = useRef(false);

  // 初始化同步伺服器時間
  useEffect(() => {
    syncServerTime();
  }, []);
  const [multiplierRemainingSec, setMultiplierRemainingSec] = useState(0);

  // 跨裝置同步狀態鎖：初次載入未自雲端讀取前，禁止以本地預設空值覆蓋雲端！
  const isHydratedRef = React.useRef(false);
  const isRemoteSyncingRef = React.useRef(false);

  // 跨裝置同步全服設定與學生個人遊戲狀態 (監聽遠端 Firebase 與其他分頁)
  useEffect(() => {
    const unsub = subscribeToCloudSync((data) => {
      setGlobalSettings(getGlobalSettings());
      if (data?.key === `${STORAGE_GAME_KEY}_${userId}` && data?.fromRemote) {
        isRemoteSyncingRef.current = true;
        const remoteData = getJson(`${STORAGE_GAME_KEY}_${userId}`, null);
        if (remoteData) {
          setLocalGameState(prev => {
            const remoteTime = remoteData.updatedAt || 0;
            const localTime = prev.updatedAt || 0;
            // 嚴格依據時間戳決定是否採納遠端資料，若本地尚未真正異動 (localTime === 0) 或遠端更新，立即同步
            if (localTime === 0 || remoteTime >= localTime) {
              return {
                ...remoteData,
                tickets: remoteData.tickets ?? 0,
                pityCount: remoteData.pityCount ?? prev.pityCount ?? 0
              };
            }
            return prev;
          });
        }
        isHydratedRef.current = true;
        setTimeout(() => { isRemoteSyncingRef.current = false; }, 50);
      }
    });
    return unsub;
  }, [userId]);

  // 當 userId 改變 (例如登入後或跨裝置切換)，主動自 Firebase 雲端讀取最新狀態
  useEffect(() => {
    isHydratedRef.current = false;
    hasClaimedTodayRef.current = false;
    const localCached = getJson(`${STORAGE_GAME_KEY}_${userId}`, null);
    if (localCached) {
      setLocalGameState(localCached);
    } else {
      setLocalGameState(DEFAULT_GAME_STATE);
    }
    
    if (userId && userId !== 'guest_student') {
      // 主動自 Firebase 雲端拉取確認，新設備或時間戳較新者為準
      fetchCloudUserGameState(userId).then(cloudState => {
        if (cloudState) {
          setLocalGameState(prev => {
            const cloudTime = cloudState.updatedAt || 0;
            const localTime = prev.updatedAt || 0;
            if (!localCached || cloudTime >= localTime) {
              const merged = {
                ...cloudState,
                tickets: cloudState.tickets ?? 0,
                pityCount: cloudState.pityCount ?? prev.pityCount ?? 0
              };
              setJson(`${STORAGE_GAME_KEY}_${userId}`, merged);
              return merged;
            }
            return prev;
          });
        }
        isHydratedRef.current = true;
      }).catch(() => {
        isHydratedRef.current = true;
      });
    } else {
      isHydratedRef.current = true;
    }
  }, [userId]);

  // 每日贈送一張抽獎券邏輯 (已水合後才觸發，嚴格採用台北 UTC+8 時區防誤判)
  useEffect(() => {
    if (!isHydratedRef.current) return;
    const todayStr = getTaiwanDateStr();
    
    // 如果今天還沒領過，且同步鎖定還沒開啟，才給予抽獎券
    if (gameState.lastDailyClaimDate !== todayStr && !hasClaimedTodayRef.current) {
      hasClaimedTodayRef.current = true; // 立即鎖定，防止 React 18 兩次執行
      setLocalGameState(prev => {
        if (prev.lastDailyClaimDate === todayStr) return prev;
        const nextState = {
          ...prev,
          tickets: (prev.tickets || 0) + 1,
          lastDailyClaimDate: todayStr,
          updatedAt: getRealTime()
        };
        setJson(`${STORAGE_GAME_KEY}_${userId}`, nextState);
        updateServerSync(`${STORAGE_GAME_KEY}_${userId}`, nextState);
        return nextState;
      });
    } else if (gameState.lastDailyClaimDate === todayStr) {
      hasClaimedTodayRef.current = true; // 已經是今天，鎖定
    }
  }, [gameState.lastDailyClaimDate, userId]);

  // 儲存狀態至雲端 Firebase (即時推播 - 嚴格保護遠端資料不被預設值覆蓋)
  useEffect(() => {
    if (userId && userId !== 'guest_student') {
      if (isRemoteSyncingRef.current) return;
      if (!isHydratedRef.current) return;
      setJson(`${STORAGE_GAME_KEY}_${userId}`, gameState);
      updateServerSync(`${STORAGE_GAME_KEY}_${userId}`, gameState);
    }
  }, [gameState, userId]);

  // 倍率倒數計時器
  useEffect(() => {
    const timer = setInterval(() => {
      const now = getRealTime();
      if (gameState.multiplierExpiresAt > now) {
        const diff = Math.floor((gameState.multiplierExpiresAt - now) / 1000);
        setMultiplierRemainingSec(diff);
      } else {
        if (gameState.personalMultiplier > 1) {
          setGameState(prev => ({ ...prev, personalMultiplier: 1, multiplierExpiresAt: 0 }));
        }
        setMultiplierRemainingSec(0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState.multiplierExpiresAt, gameState.personalMultiplier]);

  // 計算目前真實生效倍率
  const isGlobal2x = !!globalSettings.global2xActive;
  const isPersonal2x = gameState.personalMultiplier >= 2 && gameState.multiplierExpiresAt > getRealTime();

  let effectiveMultiplier = 1;
  if (isGlobal2x && isPersonal2x) {
    effectiveMultiplier = 4; // 4 倍暴擊！
  } else if (isGlobal2x || isPersonal2x) {
    effectiveMultiplier = 2; // 2 倍
  }

  // 答對題目結算加分 (受測驗暴擊倍率影響)
  const awardQuizCorrectPoints = (correctCount = 1) => {
    const userToAward = currentUser || { id: 'guest_student', displayName: '國中同學' };
    const earned = correctCount * effectiveMultiplier;
    addStudentPoints(userToAward, earned);
    if (earned >= 5) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
    return earned;
  };

  // 直接贈予固定點數（用於兌換碼、活動補償，不受測驗倍率重複暴擊放大）
  const grantDirectPoints = (points) => {
    if (typeof points !== 'number' || points <= 0 || !Number.isFinite(points)) return;
    const clampedPoints = Math.min(Math.floor(points), 5000);
    const userToAward = currentUser || { id: 'guest_student', displayName: '國中同學' };
    addStudentPoints(userToAward, clampedPoints);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
  };

  // 啟用個人限時倍率 Buff (用於幸運抽獎、兌換碼獎勵)
  const activateUserMultiplier = (durationSec = 900) => {
    const safeDuration = Math.min(Math.max(60, durationSec), 86400); // 1分鐘至24小時
    const expires = getRealTime() + (safeDuration * 1000);
    setGameState(prev => ({
      ...prev,
      personalMultiplier: 2,
      multiplierExpiresAt: expires
    }));
  };

  // 幸運抽獎執行函式 (具備 50 抽保底機制與硬核低機率)
  const executeLuckyDraw = () => {
    if (gameState.tickets <= 0) {
      return { success: false, message: '今日抽獎券已用完，明天 00:00 再來領取喔！' };
    }

    const currentPity = (gameState.pityCount || 0) + 1;
    let chosenPrize = null;
    let isPityTriggered = false;

    // 1. 檢查是否觸發 50 抽保底大獎
    if (currentPity >= 50) {
      isPityTriggered = true;
      // 必定抽出保底大獎：最高 5 點
      chosenPrize = { id: 'pts_5', name: '🎯 保底 +5 點數', type: 'points', value: 5 };
    } else {
      // 2. 常規低機率抽獎池 (未中獎率 88%，小獎 10%，金色大獎極低稀有)
      const prizes = [
        { id: 'miss', name: '💭 銘謝惠顧，再接再厲', type: 'miss', weight: 880 },
        { id: 'pts_1', name: '+1 點數', type: 'points', value: 1, weight: 60 },
        { id: 'pts_3', name: '+3 點數', type: 'points', value: 3, weight: 45 },
        { id: 'pts_5', name: '🎯 +5 點數大獎', type: 'points', value: 5, weight: 15 }
      ];

      const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
      let rand = Math.random() * totalWeight;
      chosenPrize = prizes[0];
      for (const p of prizes) {
        if (rand < p.weight) {
          chosenPrize = p;
          break;
        }
        rand -= p.weight;
      }
    }

    // 3. 更新保底計數：只有觸發第 50 抽保底時才歸零；常規抽到 pts_5 不重置
    const nextPity = isPityTriggered ? 0 : currentPity;
    const isGrandPrize = isPityTriggered || chosenPrize.id === 'pts_5';

    const updatedState = {
      ...gameState,
      tickets: Math.max(0, (gameState.tickets || 0) - 1),
      pityCount: nextPity,
      updatedAt: getRealTime()
    };

    // 同步立即寫入 localStorage 與 state，防止連點抽獎時狀態遺失或被舊快取反彈
    // 這裡直接使用新的 setGameState 函式，它已經內建了 setJson 與 updateServerSync
    setGameState(updatedState);

    let resultNotice = '';
    const userToAward = currentUser || { id: 'guest_student', displayName: '國中同學' };

    if (chosenPrize.type === 'miss') {
      resultNotice = `銘謝惠顧！保底進度 +1（目前 ${nextPity}/50 抽），離金色大獎更近了！`;
    } else if (chosenPrize.type === 'points') {
      addStudentPoints(userToAward, chosenPrize.value);
      if (isPityTriggered) {
        resultNotice = `👑 恭喜觸發【第 50 抽必中保底】！獲得頂級 ${chosenPrize.name}！保底重置！`;
      } else {
        resultNotice = `🎉 恭喜抽中 ${chosenPrize.name}！已自動加進每週排行榜！`;
      }
      try {
        confetti({ particleCount: isGrandPrize ? 120 : 60, spread: 80, origin: { y: 0.5 } });
      } catch (e) {}
    }

    return { 
      success: true, 
      prize: chosenPrize, 
      notice: resultNotice, 
      isSuper4x: false,
      isPityTriggered,
      currentPity: nextPity
    };
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        globalSettings,
        setGlobalSettings,
        effectiveMultiplier,
        isGlobal2x,
        isPersonal2x,
        multiplierRemainingSec,
        awardQuizCorrectPoints,
        grantDirectPoints,
        activateUserMultiplier,
        executeLuckyDraw,
        isLuckyDrawOpen,
        setIsLuckyDrawOpen
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  return context || {};
}
