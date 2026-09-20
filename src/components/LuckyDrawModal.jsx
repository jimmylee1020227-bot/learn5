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

const S = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
  },
  card: {
    background: 'var(--theme-card, var(--theme-card, #fffdf9))',
    border: '2.5px solid var(--theme-border, #17324d)',
    borderRadius: '28px',
    boxShadow: '8px 8px 0 var(--theme-border, #17324d)',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    borderBottom: '2px solid var(--theme-border, #17324d)',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--theme-card, var(--theme-card, #fffdf9))',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconBox: {
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '14px',
    background: '#fff7d9',
    border: '1px solid #e8d69a',
    color: '#806523',
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: '17px',
    fontWeight: 900,
    color: 'var(--theme-border, var(--theme-border, #17324d))',
    fontFamily: '"Noto Serif TC", serif',
  },
  subtitle: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 600,
    color: '#78818a',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '10px',
    padding: '8px',
    color: '#78818a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    overflowY: 'auto',
  },
  doubleBanner: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: '#fff0e9',
    border: '1px solid var(--theme-accent, #ef8354)',
    borderRadius: '12px',
    padding: '10px 14px',
    marginBottom: '16px',
    fontSize: '12px',
    fontWeight: 900,
    color: 'var(--theme-accent, var(--theme-accent, #ef8354))',
  },
  pityBox: {
    width: '100%',
    background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
    border: '2px solid var(--theme-border, #17324d)',
    borderRadius: '16px',
    boxShadow: '3px 3px 0 var(--theme-border, #17324d)',
    padding: '14px 16px',
    marginBottom: '20px',
    textAlign: 'left',
  },
  pityRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pityLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 900,
    color: '#9a741e',
  },
  pityCount: {
    fontFamily: 'monospace',
    fontSize: '14px',
    fontWeight: 900,
    color: 'var(--theme-border, var(--theme-border, #17324d))',
  },
  progressTrack: {
    marginTop: '10px',
    height: '12px',
    width: '100%',
    background: 'white',
    border: '1px solid var(--theme-border, #17324d)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressFooter: {
    marginTop: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    fontWeight: 700,
    color: '#78818a',
  },
  ticketsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 800,
    color: '#5b6772',
    marginBottom: '20px',
  },
  ticketBadge: {
    background: 'var(--theme-border, var(--theme-border, #17324d))',
    color: '#f7cf68',
    borderRadius: '999px',
    padding: '4px 14px',
    fontSize: '14px',
    fontWeight: 900,
  },
  wheel: {
    position: 'relative',
    width: '192px',
    height: '192px',
    borderRadius: '50%',
    border: '3px solid var(--theme-border, #17324d)',
    background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
    boxShadow: '5px 5px 0 var(--theme-border, #17324d)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    transition: 'all 0.3s',
  },
  wheelInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  wheelPrizeName: {
    fontSize: '15px',
    fontWeight: 900,
    color: 'var(--theme-border, var(--theme-border, #17324d))',
    margin: 0,
  },
  wheelNotice: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#78818a',
    margin: 0,
  },
  errorBox: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#fff0e9',
    borderRadius: '12px',
    padding: '10px 14px',
    marginBottom: '16px',
    fontSize: '12px',
    fontWeight: 800,
    color: '#c8643d',
  },
  spinBtn: {
    width: '100%',
    background: 'var(--theme-accent, var(--theme-accent, #ef8354))',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    padding: '14px 0',
    fontSize: '15px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 6px 0 #d76740',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
  spinBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    boxShadow: '0 3px 0 #d76740',
  },
  infoBox: {
    marginTop: '20px',
    width: '100%',
    background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))',
    border: '1px solid #e8ded0',
    borderRadius: '12px',
    padding: '14px',
    textAlign: 'left',
    fontSize: '11px',
    lineHeight: '1.7',
    color: '#78818a',
    fontWeight: 500,
  },
  infoTitle: {
    fontWeight: 900,
    color: 'var(--theme-border, var(--theme-border, #17324d))',
    display: 'block',
    marginBottom: '6px',
  },
};

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
      setErrorMessage('今日抽獎券已用完！系統每日 00:00 自動贈送 1 張，或等待管理員發放！');
      return;
    }
    setErrorMessage('');
    setIsSpinning(true);
    setPrizeResult(null);

    // 立即結算抽獎並扣除票券，避免非同步 Race Condition
    let drawRes = null;
    try {
      drawRes = executeLuckyDraw();
    } catch (err) {
      console.error('[LuckyDraw Error]', err);
    }

    // 播放 700ms 轉盤動畫後展示結果
    setTimeout(() => {
      setIsSpinning(false);
      if (drawRes && drawRes.success) {
        setPrizeResult(drawRes);
      } else {
        setErrorMessage(drawRes?.message || '抽獎失敗，請稍後再試！');
      }
    }, 700);
  };

  const pityCount = gameState?.pityCount ?? 0;
  const pityPercent = Math.min(100, Math.round((pityCount / 50) * 100));

  return (
    <div style={S.overlay} onClick={() => setIsLuckyDrawOpen(false)}>
      <div style={S.card} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <div style={S.iconBox}>
              <Gift size={22} />
            </div>
            <div>
              <h3 style={S.title}>天天幸運抽獎機</h3>
              <p style={S.subtitle}>每位同學每天登入免費獲贈 1 張抽獎券</p>
            </div>
          </div>
          <button style={S.closeBtn} onClick={() => setIsLuckyDrawOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={S.body}>

          {/* 全服雙倍 */}
          {isGlobal2x && (
            <div style={S.doubleBanner}>
              <Flame size={16} />
              <span>🔥 全服雙倍積分狂歡中！做題獲得積分 2 倍計算！</span>
            </div>
          )}

          {/* 保底進度 */}
          <div style={S.pityBox}>
            <div style={S.pityRow}>
              <div style={S.pityLabel}>
                <Crown size={17} style={{ color: '#f7cf68' }} />
                <span>50 抽必中金色大獎保底：</span>
              </div>
              <span style={S.pityCount}>{pityCount} / 50 抽 ({pityPercent}%)</span>
            </div>
            <div style={S.progressTrack}>
              <div style={{
                height: '100%',
                width: `${pityPercent}%`,
                background: 'linear-gradient(to right, #f7cf68, var(--theme-accent, #ef8354))',
                borderRadius: '999px',
                transition: 'width 0.4s',
              }} />
            </div>
            <div style={S.progressFooter}>
              <span>每抽累積進度 +1</span>
              <span style={{ color: 'var(--theme-accent, var(--theme-accent, #ef8354))' }}>滿 50 抽 100% 必出最高 +5 點金色大獎</span>
            </div>
          </div>

          {/* 持有券數 */}
          <div style={S.ticketsRow}>
            <span>持有抽獎券：</span>
            <span style={S.ticketBadge}>{gameState.tickets || 0} 張</span>
          </div>

          {/* 轉盤 */}
          <div style={S.wheel}>
            {isSpinning ? (
              <div style={S.wheelInner}>
                <Sparkles size={40} style={{ color: 'var(--theme-accent, var(--theme-accent, #ef8354))', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: '13px', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>好運抽取中...</span>
              </div>
            ) : prizeResult ? (
              <div style={{ ...S.wheelInner, padding: '10px' }}>
                {prizeResult.prize?.type === 'miss' ? (
                  <div style={{ fontSize: '36px' }}>🍀</div>
                ) : (
                  <Coins size={36} style={{ color: '#9a741e' }} />
                )}
                <p style={S.wheelPrizeName}>{prizeResult.prize?.name}</p>
                <p style={S.wheelNotice}>{prizeResult.notice}</p>
              </div>
            ) : (
              <div style={S.wheelInner}>
                <Gift size={38} style={{ color: 'var(--theme-accent, var(--theme-accent, #ef8354))' }} />
                <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>點擊下方按鈕啟動</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#9aa2a8' }}>50 抽必中金色大獎進行中</span>
              </div>
            )}
          </div>

          {/* 錯誤訊息 */}
          {errorMessage && (
            <div style={S.errorBox}>
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 抽獎按鈕 */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || (gameState.tickets || 0) <= 0}
            style={{ 
              ...S.spinBtn, 
              ...((isSpinning || (gameState.tickets || 0) <= 0) ? S.spinBtnDisabled : {}) 
            }}
          >
            <Sparkles size={18} />
            <span>
              {isSpinning 
                ? '轉動抽獎中...' 
                : (gameState.tickets || 0) > 0 
                  ? `消耗 1 張抽獎券並轉動 (剩餘 ${gameState.tickets} 張)` 
                  : '今日抽獎券已用完'}
            </span>
          </button>

          {/* 機制說明 */}
          <div style={S.infoBox}>
            <span style={S.infoTitle}>💡 抽獎與 50 抽保底機制：</span>
            <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><strong>獎池設定</strong>：銘謝惠顧 (88%)、+1 點 (6%)、+3 點 (4.5%)、🎯 +5 點大獎 (1.5%)。</li>
              <li><strong>50 抽必中保底</strong>：累積滿 50 抽時，<strong>第 50 抽 100% 必定抽出最高 🎯 +5 點金色大獎</strong>，並重置保底進度！</li>
              <li><strong>抽獎券獲取</strong>：系統每日 00:00 自動贈送 1 張，或由管理員空投發放！</li>
            </ul>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
