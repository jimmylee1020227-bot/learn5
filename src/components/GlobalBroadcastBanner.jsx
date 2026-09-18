import React from 'react';
import { useGame } from '../context/GameContext';
import { Megaphone, Flame } from 'lucide-react';

export default function GlobalBroadcastBanner() {
  const { globalSettings, isGlobal2x } = useGame();
  const broadcast = globalSettings?.activeBroadcast;

  if (!broadcast && !isGlobal2x) return null;

  return (
    <div className="marquee-bar">
      <div className="marquee-content">
        <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Megaphone size={13} />
          {broadcast?.sender || '系統公告'}
        </span>
        <span style={{ fontSize: '0.88rem' }}>{broadcast?.message || '歡迎來到 108 課綱全科學習網！'}</span>

        {isGlobal2x && (
          <span className="badge badge-fire fire-pulse" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}>
            <Flame size={13} />
            全服限時 2 倍積分狂歡中！此時抽中雙倍直接疊加為 4 倍狂暴！
          </span>
        )}
      </div>

      <div style={{ fontSize: '0.75rem', opacity: 0.8, flexShrink: 0, marginLeft: '16px' }}>
        {new Date(broadcast?.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
