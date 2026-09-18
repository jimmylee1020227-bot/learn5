import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { addStudentPoints } from '../services/leaderboardService';
import { getGlobalSettings, subscribeToCloudSync } from '../services/cloudStorage';
import confetti from 'canvas-confetti';

const GameContext = createContext();

const STORAGE_GAME_KEY = 'studyhub_game_state';

export function GameProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'guest_student';

  const [globalSettings, setGlobalSettings] = useState(getGlobalSettings());
  
  // 學生個人遊戲狀態：抽獎券、點數倍率、每日簽到日期
  const [gameState, setGameState] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_GAME_KEY}_${userId}`);
      return saved ? JSON.parse(saved) : {
        tickets: 1,
        lastDailyClaimDate: '',
        personalMultiplier: 1,
        multiplierExpiresAt: 0,
        unlockedBadges: []
      };
    } catch (e) {
      return {
        tickets: 1,
        lastDailyClaimDate: '',
        personalMultiplier: 1,
        multiplierExpiresAt: 0,
        unlockedBadges: []
      };
    }
  });

  const [isLuckyDrawOpen, setIsLuckyDrawOpen] = useState(false);
  const [multiplierRemainingSec, setMultiplierRemainingSec] = useState(0);

  // 跨視窗同步全服廣播與活動
  useEffect(() => {
    const unsub = subscribeToCloudSync(() => {
      setGlobalSettings(getGlobalSettings());
    });
    return unsub;
  }, []);

  // 每日贈送一張抽獎券邏輯
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (gameState.lastDailyClaimDate !== todayStr) {
      setGameState(prev => ({
        ...prev,
        tickets: (prev.tickets || 0) + 1,
        lastDailyClaimDate: todayStr
      }));
    }
  }, [gameState.lastDailyClaimDate]);

  // 儲存狀態至本地與雲端
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`${STORAGE_GAME_KEY}_${userId}`, JSON.stringify(gameState));
    }
  }, [gameState, userId]);

  // 倍率倒數計時器
  useEffect(() => {
    const timer = setInterval(() => {
      if (gameState.multiplierExpiresAt > Date.now()) {
        const diff = Math.floor((gameState.multiplierExpiresAt - Date.now()) / 1000);
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
  const isPersonal2x = gameState.personalMultiplier >= 2 && gameState.multiplierExpiresAt > Date.now();

  let effectiveMultiplier = 1;
  if (isGlobal2x && isPersonal2x) {
    effectiveMultiplier = 4; // 4 倍暴擊！
  } else if (isGlobal2x || isPersonal2x) {
    effectiveMultiplier = 2; // 2 倍
  }

  // 答對題目結算加分
  const awardQuizCorrectPoints = (correctCount = 1) => {
    const userToAward = currentUser || { id: 'guest_student', displayName: '國中同學' };
    const earned = correctCount * effectiveMultiplier;
    addStudentPoints(userToAward, earned);
    if (earned >= 5) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
    return earned;
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
      // 必定抽出金色大獎：100點 或 限時雙倍/四倍
      const grandPrizes = [
        { id: 'pts_100', name: '👑 滿級 +100 點數大獎', type: 'points', value: 100 },
        { id: 'multi_2x', name: '⚡ 限時 2 倍積分 (15分鐘)', type: 'multiplier', durationMins: 15 }
      ];
      chosenPrize = grandPrizes[Math.floor(Math.random() * grandPrizes.length)];
    } else {
      // 2. 常規低機率抽獎池 (未中獎率 88%，小獎 10%，金色大獎極低稀有)
      const prizes = [
        { id: 'miss', name: '💭 銘謝惠顧，再接再厲', type: 'miss', weight: 880 },
        { id: 'pts_15', name: '+15 點數', type: 'points', value: 15, weight: 70 },
        { id: 'pts_30', name: '+30 點數', type: 'points', value: 30, weight: 35 },
        { id: 'pts_60', name: '+60 點數', type: 'points', value: 60, weight: 10 },
        { id: 'pts_100', name: '👑 +100 點數大獎', type: 'points', value: 100, weight: 2 },
        { id: 'multi_2x', name: '⚡ 限時 2 倍積分 (15分鐘)', type: 'multiplier', durationMins: 15, weight: 3 }
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

    // 3. 更新保底計數：若抽中金色大獎 (pts_100 或 multi_2x)，保底歸零；否則累積
    const isGrandPrize = chosenPrize.id === 'pts_100' || chosenPrize.id === 'multi_2x';
    const nextPity = isGrandPrize ? 0 : currentPity;

    setGameState(prev => ({
      ...prev,
      tickets: Math.max(0, prev.tickets - 1),
      pityCount: nextPity
    }));

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
      confetti({ particleCount: isGrandPrize ? 120 : 60, spread: 80, origin: { y: 0.5 } });
    } else if (chosenPrize.type === 'multiplier') {
      const expires = Date.now() + (chosenPrize.durationMins * 60 * 1000);
      setGameState(prev => ({
        ...prev,
        personalMultiplier: 2,
        multiplierExpiresAt: expires
      }));
      if (isGlobal2x) {
        resultNotice = `🔥 管理員全服雙倍中！觸發【限時 4 倍狂暴暴擊 (15分鐘)】！做題點數狂飆！`;
      } else {
        resultNotice = isPityTriggered 
          ? `👑 恭喜觸發【第 50 抽必中保底】！獲得【限時 2 倍積分 (15分鐘)】！保底重置！`
          : `⚡ 恭喜獲得【限時 2 倍積分 (15分鐘)】！期間答對題目點數雙倍計算！`;
      }
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
    }

    return { 
      success: true, 
      prize: chosenPrize, 
      notice: resultNotice, 
      isSuper4x: chosenPrize.type === 'multiplier' && isGlobal2x,
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
