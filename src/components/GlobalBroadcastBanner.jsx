import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getAdminNotifications, subscribeToCloudSync } from '../services/cloudStorage';
import { getRealTime } from '../services/timeService';
import { Megaphone, Flame, Sparkles, X, BellRing } from 'lucide-react';

export default function GlobalBroadcastBanner() {
  const { globalSettings, isGlobal2x } = useGame();
  const [isDismissed, setIsDismissed] = useState(false);
  const [lastDismissedBroadcast, setLastDismissedBroadcast] = useState('');
  const [latestNotif, setLatestNotif] = useState(null);
  const [currentTime, setCurrentTime] = useState(getRealTime());

  const broadcast = globalSettings?.activeBroadcast;

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(getRealTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 監聽雲端系統通知變動
  useEffect(() => {
    const fetchLatest = () => {
      const notifs = getAdminNotifications();
      if (notifs && notifs.length > 0) {
        setLatestNotif(notifs[0]);
      }
    };
    fetchLatest();

    const unsub = subscribeToCloudSync((event) => {
      if (!event || event.key === 'admin_notifications' || event.key === 'global_settings') {
        fetchLatest();
      }
    });
    return () => unsub();
  }, []);

  // 當有新廣播發布時，自動重新展開（即使先前曾手動點擊關閉）
  useEffect(() => {
    if (broadcast?.message && broadcast.message !== lastDismissedBroadcast) {
      setIsDismissed(false);
    }
  }, [broadcast?.message, lastDismissedBroadcast]);

  // 如果使用者手動收合，且當前無雙倍狂歡
  if (isDismissed) return null;

  // 整理要輪播的跑馬燈公告清單
  const notices = [];

  if (isGlobal2x) {
    notices.push({
      id: '2x_event',
      isFire: true,
      tag: '🔥 2 倍狂歡',
      text: '全服限時雙倍積分狂歡中！期間做題答對題目積分 2 倍狂飆計算！'
    });
  }

  if (broadcast?.message) {
    notices.push({
      id: 'active_broadcast',
      isFire: false,
      tag: broadcast.sender ? `📢 ${broadcast.sender}` : '📢 全服廣播',
      text: broadcast.message
    });
  }

  if (latestNotif?.message && latestNotif.message !== broadcast?.message) {
    notices.push({
      id: latestNotif.id || 'admin_notif',
      isFire: false,
      tag: `📌 ${latestNotif.title || '站務公告'}`,
      text: latestNotif.message
    });
  }

  // 若目前無自訂公告，提供常駐會考衝刺跑馬燈
  if (notices.length === 0) {
    notices.push({
      id: 'default_tip',
      isFire: false,
      tag: '🎯 會考衝刺',
      text: '歡迎來到 讀書網！每日登入做題累積點數，每週一結算爭奪全校榮譽榜！'
    });
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (broadcast?.message) {
      setLastDismissedBroadcast(broadcast.message);
    }
  };

  const isFireTheme = isGlobal2x || notices.some(n => n.isFire);

  return (
    <div 
      className={`marquee-bar ${isFireTheme ? 'marquee-fire' : ''}`}
      role="region"
      aria-label="全服即時公告跑馬燈"
    >
      {/* 左側固定標籤膠囊 */}
      <div className={`marquee-badge-pill ${isFireTheme ? 'fire' : ''}`}>
        {isFireTheme ? <Flame size={13} /> : <Megaphone size={13} />}
        <span>{isFireTheme ? '全服狂歡' : (broadcast?.sender || '即時公告')}</span>
      </div>

      {/* 左側漸隱銜接邊緣遮罩 */}
      <div className="marquee-fade-left" />

      {/* 跑馬燈軌道視窗 */}
      <div className="marquee-track-container" title="滑鼠懸停可暫停跑馬燈">
        <div className="marquee-track">
          {/* 第一組公告序列 */}
          {notices.map((n, idx) => (
            <span key={`group1-${n.id || idx}`} className="marquee-item">
              <span style={{ opacity: 0.85, fontWeight: 700 }}>[{n.tag}]</span>
              <span className={n.isFire ? '' : 'marquee-item-normal'}>{n.text}</span>
              <Sparkles size={13} style={{ opacity: 0.6, margin: '0 8px' }} />
            </span>
          ))}

          {/* 第二組公告序列（實現無縫連續滾動） */}
          {notices.map((n, idx) => (
            <span key={`group2-${n.id || idx}`} className="marquee-item" aria-hidden="true">
              <span style={{ opacity: 0.85, fontWeight: 700 }}>[{n.tag}]</span>
              <span className={n.isFire ? '' : 'marquee-item-normal'}>{n.text}</span>
              <Sparkles size={13} style={{ opacity: 0.6, margin: '0 8px' }} />
            </span>
          ))}
        </div>
      </div>

      {/* 右側漸隱銜接邊緣遮罩 */}
      <div className="marquee-fade-right" />

      {/* 右側時間標籤與收合按鈕 */}
      <div className="marquee-right-actions">
        <span className="marquee-time-tag">
          {new Date(currentTime).toLocaleTimeString('zh-TW', { timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>

        <button
          className="marquee-close-btn"
          onClick={handleDismiss}
          title="暫時收合公告欄"
          aria-label="關閉公告"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
