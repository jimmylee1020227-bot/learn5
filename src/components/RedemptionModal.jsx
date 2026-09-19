import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { redeemCode, getRedemptionCodes } from '../services/cloudStorage';
import { Ticket, Sparkles, CheckCircle2, AlertCircle, X, ArrowRight, Gift } from 'lucide-react';

export default function RedemptionModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const { grantDirectPoints, setGameState, activateUserMultiplier } = useGame();

  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successReward, setSuccessReward] = useState(null);

  if (!isOpen) return null;

  const availableCodes = getRedemptionCodes();

  const handleRedeem = (codeToUse) => {
    const targetCode = (codeToUse || inputCode).trim();
    if (!targetCode) {
      setErrorMsg('請輸入兌換碼！');
      return;
    }
    setErrorMsg('');
    try {
      const reward = redeemCode(currentUser?.id || 'guest_student', targetCode, currentUser?.displayName);
      
      // 套用獎勵
      if (reward.type === 'points') {
        grantDirectPoints(reward.rewardValue);
      } else if (reward.type === 'lottery_ticket') {
        setGameState(prev => ({
          ...prev,
          tickets: (prev.tickets || 0) + reward.rewardValue
        }));
      } else if (reward.type === 'multiplier') {
        activateUserMultiplier(reward.rewardValue * 60);
      }

      setSuccessReward(reward);
      setInputCode('');
    } catch (err) {
      setErrorMsg(err.message || '兌換失敗，請確認序號是否正確');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '500px', 
          background: '#fffdf9',
          border: '2.5px solid #17324d',
          borderRadius: '24px',
          boxShadow: '8px 8px 0px #17324d',
          color: '#17324d'
        }}
      >
        <div className="modal-header" style={{ borderBottom: '2px solid #17324d', background: '#fffdf9', padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#fff7d9', border: '1.5px solid #17324d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#806523' }}>
              <Ticket size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#17324d' }}>輸入兌換碼，領取獎勵</h3>
              <p style={{ fontSize: '0.78rem', color: '#78818a', fontWeight: 600 }}>
                會考讀書網專屬序號兌換
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#78818a' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '24px' }}>
          
          {successReward ? (
            <div style={{ textAlign: 'center', padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e8f6ed', border: '2px solid #347650', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#347650' }}>
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#17324d' }}>恭喜兌換成功！</h4>
              <p style={{ fontSize: '0.95rem', color: '#347650', fontWeight: 800 }}>
                {successReward.label}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#78818a', fontWeight: 600 }}>
                獎勵已立即加載至你的帳號中，快去題庫練習或排行榜衝刺吧！
              </p>
              <button 
                onClick={() => setSuccessReward(null)} 
                className="btn btn-secondary" 
                style={{ marginTop: '8px', fontSize: '0.85rem' }}
              >
                兌換另一組序號
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.88rem', color: '#5b6772', lineHeight: 1.6, fontWeight: 600 }}>
                兌換碼可領取週排行榜積分、幸運抽獎券或限時雙倍加成。同一組序號每位同學限兌換一次。
              </p>

              {/* 輸入框 */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#5b6772', display: 'block', marginBottom: '6px' }}>
                  請輸入序號代碼
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={inputCode} 
                    onChange={e => setInputCode(e.target.value.toUpperCase())}
                    placeholder="例如：117PASS"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: '#f8f3eb',
                      border: '1.5px solid #ded3c5',
                      borderRadius: '12px',
                      color: '#17324d',
                      fontSize: '1rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      outline: 'none'
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleRedeem()}
                  />
                  <button 
                    onClick={() => handleRedeem()}
                    className="btn btn-primary"
                    style={{ padding: '0 20px', borderRadius: '12px', fontWeight: 800 }}
                  >
                    兌換
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div style={{ background: '#fff0e9', border: '1px solid #efb7a6', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#c8643d', fontSize: '0.85rem', fontWeight: 700 }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 官方限時推薦兌換碼 (動態支援管理員新增之自訂序號) */}
              <div style={{ background: '#f8f3eb', border: '1.5px solid #e8ded0', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#5b6772', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#ef8354" /> 官方福利序號（點擊直接填入兌換）：
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {availableCodes.map(codeItem => (
                    <div 
                      key={codeItem.code}
                      onClick={() => { setInputCode(codeItem.code); handleRedeem(codeItem.code); }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '10px 14px', 
                        background: '#fffdf9', 
                        borderRadius: '10px', 
                        cursor: 'pointer', 
                        border: '1.5px dashed #ded3c5',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#17324d' }}>{codeItem.code}</span>
                        <span className={`badge ${codeItem.type === 'multiplier' ? 'badge-fire' : codeItem.type === 'lottery_ticket' ? 'badge-coral' : 'badge-gold'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          {codeItem.type === 'multiplier' ? '🔥 雙倍狂暴' : codeItem.type === 'lottery_ticket' ? '🎫 抽獎券' : '🏆 積分'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#5b6772', fontWeight: 700 }}>
                        {codeItem.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        <div className="modal-footer" style={{ borderTop: '2px solid #17324d', background: '#fffdf9', padding: '14px 24px' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
