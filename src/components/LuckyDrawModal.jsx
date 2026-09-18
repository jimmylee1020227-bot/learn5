import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Gift, 
  Flame, 
  Sparkles, 
  Coins, 
  X, 
  AlertCircle,
  Crown
} from 'lucide-react';

export default function LuckyDrawModal() {
  const { 
    gameState, 
    isLuckyDrawOpen, 
    setIsLuckyDrawOpen, 
    executeLuckyDraw, 
    isGlobal2x 
  } = useGame();

  const [isSpinning, setIsSpinning] = useState(false);
  const [prizeResult, setPrizeResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isLuckyDrawOpen) return null;

  const handleSpin = () => {
    if (gameState.tickets <= 0) {
      setErrorMessage('今日抽獎券已用完！系統每日 00:00 自動贈送 1 張，或請管理員空投！');
      return;
    }
    setErrorMessage('');
    setIsSpinning(true);
    setPrizeResult(null);

    // 旋轉動態模擬
    setTimeout(() => {
      const res = executeLuckyDraw();
      setIsSpinning(false);
      if (res.success) {
        setPrizeResult(res);
      } else {
        setErrorMessage(res.message);
      }
    }, 1000);
  };

  const pityCount = gameState?.pityCount ?? 0;
  const pityPercent = Math.min(100, Math.round((pityCount / 50) * 100));

  return (
    <div className="modal-overlay" onClick={() => setIsLuckyDrawOpen(false)}>
      <div 
        className="modal-card rounded-[28px] border-2 border-[#17324d] bg-[#fffdf9] shadow-[8px_8px_0_#17324d]" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        
        {/* Modal Header */}
        <div className="modal-header border-b-2 border-[#17324d] bg-[#fffdf9] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7d9] border border-[#e8d69a] text-[#806523]">
              <Gift size={22} />
            </div>
            <div>
              <h3 className="display-font text-lg font-extrabold text-[#17324d]">天天幸運抽獎機</h3>
              <div className="text-xs font-semibold text-[#78818a]">
                每位同學每天登入免費獲贈 1 張抽獎券
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsLuckyDrawOpen(false)} 
            className="rounded-xl p-2 text-[#78818a] hover:bg-[#f8f3eb] hover:text-[#17324d]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body p-6 flex flex-col items-center text-center">
          
          {/* 管理員全服雙倍活動標籤 */}
          {isGlobal2x && (
            <div className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#ef8354] bg-[#fff0e9] p-3 text-xs font-black text-[#ef8354]">
              <Flame size={16} className="pulse-dot" />
              <span>全服雙倍活動中！抽中 2 倍將升級為【4 倍狂暴暴擊 (15分鐘)】！</span>
            </div>
          )}

          {/* 👑 50 抽必中金色大獎保底進度看板 */}
          <div className="mb-5 w-full rounded-2xl border-2 border-[#17324d] bg-[#f8f3eb] p-4 text-left shadow-[3px_3px_0_#17324d]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#9a741e]">
                <Crown size={17} className="text-[#f7cf68]" />
                <span>50 抽必中金色大獎保底：</span>
              </div>
              <span className="font-mono text-sm font-black text-[#17324d]">
                {pityCount} / 50 抽 ({pityPercent}%)
              </span>
            </div>
            
            {/* 實體外框進度條 */}
            <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full border border-[#17324d] bg-white">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#f7cf68] to-[#ef8354] transition-all duration-400"
                style={{ width: `${pityPercent}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[11px] font-bold text-[#78818a]">
              <span>未抽中金色大獎進度 +1</span>
              <span className="text-[#ef8354]">滿 50 抽 100% 必出金色大獎</span>
            </div>
          </div>

          {/* 持有券數 */}
          <div className="mb-5 flex items-center gap-2 text-sm font-extrabold text-[#5b6772]">
            <span>持有抽獎券：</span>
            <span className="rounded-full bg-[#17324d] px-3 py-1 text-sm font-black text-[#f7cf68]">
              {gameState.tickets || 0} 張
            </span>
          </div>

          {/* 轉盤圓盤 (Manus Paper Neo-brutalist Circle) */}
          <div 
            className="relative mb-6 flex h-48 w-48 flex-col items-center justify-center rounded-full border-3 border-[#17324d] bg-[#f8f3eb] shadow-[5px_5px_0_#17324d] transition-all"
          >
            {isSpinning ? (
              <div className="flex flex-col items-center gap-2">
                <Sparkles size={40} className="text-[#ef8354] animate-spin" />
                <span className="text-sm font-black text-[#17324d]">好運抽取中...</span>
              </div>
            ) : prizeResult ? (
              <div className="flex flex-col items-center gap-1 p-3">
                {prizeResult.prize?.type === 'miss' ? (
                  <div className="text-3xl">🍀</div>
                ) : prizeResult.isSuper4x ? (
                  <Flame size={36} className="text-[#ef8354] pulse-dot" />
                ) : (
                  <Coins size={36} className="text-[#9a741e]" />
                )}
                <span className="text-base font-black text-[#17324d]">
                  {prizeResult.prize?.name}
                </span>
                <span className="text-[11px] font-bold text-[#78818a]">
                  {prizeResult.notice}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Gift size={38} className="text-[#ef8354]" />
                <span className="text-xs font-black text-[#17324d]">點擊下方按鈕啟動</span>
                <span className="text-[10px] font-bold text-[#9aa2a8]">50 抽金色保底中</span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mb-4 flex items-center gap-1.5 rounded-xl bg-[#fff0e9] p-3 text-xs font-extrabold text-[#c8643d]">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 抽獎按鈕 (Manus 3D 珊瑚按鈕) */}
          <button
            onClick={() => {
              if (gameState.tickets <= 0) {
                alert('今日抽獎券已用完！可至頂部「兌換碼」輸入 117LUCKY 立即免費領取 5 張抽獎券！');
                return;
              }
              handleSpin();
            }}
            disabled={isSpinning}
            className="btn btn-primary flex w-full items-center justify-center gap-2 rounded-2xl !py-3.5 text-base font-extrabold shadow-[0_6px_0_#d76740]"
          >
            <Sparkles size={18} />
            <span>
              {isSpinning ? '轉動抽獎中...' : gameState.tickets > 0 ? '消耗 1 張抽獎券並轉動' : '抽獎券已用完 (點擊兌換新券)'}
            </span>
          </button>

          {/* 機制說明 */}
          <div className="mt-5 w-full rounded-xl bg-[#f8f3eb] p-3.5 text-left text-[11px] font-medium leading-5 text-[#78818a] border border-[#e8ded0]">
            <span className="font-extrabold text-[#17324d] block mb-1">💡 50 抽保底與機率機制：</span>
            <ul className="space-y-1 list-disc pl-4">
              <li><strong>低中獎率設定</strong>：銘謝惠顧 (88%)、小額點數 (10%)、金色大獎 (2%)。</li>
              <li><strong>50 抽硬保底機制</strong>：累積滿 50 抽若未獲獎，<strong>第 50 抽 100% 必出金色頂級大獎</strong>（+100 點或加倍卡）！抽中金色大獎後重置保底。</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
