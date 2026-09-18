import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { 
  getAdminsList, 
  getAllChatThreads, 
  getChatMessages, 
  sendChatMessage, 
  markThreadAsRead,
  subscribeToCloudSync 
} from '../services/cloudStorage';
import { 
  MessageSquare, 
  Send, 
  User, 
  Shield, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  Clock,
  MessageCircle,
  Crown,
  UserCheck
} from 'lucide-react';

export default function AdminSupportChat() {
  const { currentUser } = useAuth();
  const { isMobile } = useDevice();
  const messagesEndRef = useRef(null);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdmin = isSuperAdmin || currentUser?.role === 'admin';

  const [admins, setAdmins] = useState(getAdminsList());
  const [threads, setThreads] = useState(getAllChatThreads());
  
  // 學生身分時：選中諮詢哪位管理員
  const [selectedAdminId, setSelectedAdminId] = useState(admins[0]?.id || 'admin_super_jimmy');
  
  // 管理員身分時：選中哪位學生的進線諮詢
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState('');

  // 行動裝置專屬：是否正在檢視對話內容（手機點選後全螢幕開啟）
  const [mobileInChat, setMobileInChat] = useState(!isMobile);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // 1. 初始化資料與即時多端事件監聽
  useEffect(() => {
    const refreshData = () => {
      const currentAdmins = getAdminsList();
      const currentThreads = getAllChatThreads();
      setAdmins(currentAdmins);
      setThreads(currentThreads);

      if (isAdmin) {
        if (!selectedStudentId && currentThreads.length > 0) {
          setSelectedStudentId(currentThreads[0].studentId);
          setSelectedStudentName(currentThreads[0].studentName);
        }
      }
    };

    refreshData();
    const unsub = subscribeToCloudSync(refreshData);
    return () => unsub();
  }, [isAdmin]);

  // 2. 當切換諮詢對象時，載入歷史對話
  useEffect(() => {
    if (isAdmin) {
      if (selectedStudentId) {
        const adminId = currentUser?.id || 'admin_super_jimmy';
        const msgs = getChatMessages(selectedStudentId, adminId);
        setMessages(msgs);
        markThreadAsRead(selectedStudentId, adminId);
      } else {
        setMessages([]);
      }
    } else {
      if (selectedAdminId && currentUser?.id) {
        const msgs = getChatMessages(currentUser.id, selectedAdminId);
        setMessages(msgs);
      }
    }
  }, [isAdmin, selectedStudentId, selectedAdminId, currentUser?.id]);

  // 自動捲動至最新訊息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 發送訊息處理
  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    if (isAdmin) {
      // 管理員回覆學生
      if (!selectedStudentId) return;
      const adminId = currentUser?.id || 'admin_super_jimmy';
      const adminName = currentUser?.displayName || '總管理員 (Jimmy)';

      const newMsg = sendChatMessage(selectedStudentId, adminId, {
        studentId: selectedStudentId,
        studentName: selectedStudentName,
        adminId: adminId,
        adminName: adminName,
        senderId: adminId,
        senderName: adminName,
        senderRole: currentUser?.role || 'super_admin',
        text: inputText.trim()
      });

      if (newMsg) {
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
        setThreads(getAllChatThreads());
      }
    } else {
      // 學生向管理員提問
      const studentId = currentUser?.id || 'guest_student';
      const studentName = currentUser?.displayName || '會考戰友';
      const targetAdmin = admins.find(a => a.id === selectedAdminId) || admins[0];

      const newMsg = sendChatMessage(studentId, selectedAdminId, {
        studentId: studentId,
        studentName: studentName,
        adminId: selectedAdminId,
        adminName: targetAdmin?.displayName || '管理員',
        senderId: studentId,
        senderName: studentName,
        senderRole: 'student',
        text: inputText.trim()
      });

      if (newMsg) {
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
        setThreads(getAllChatThreads());

        // 智慧初次提問自動回覆確認
        setTimeout(() => {
          const autoConfirm = sendChatMessage(studentId, selectedAdminId, {
            studentId: studentId,
            studentName: studentName,
            adminId: selectedAdminId,
            adminName: targetAdmin?.displayName || '管理員',
            senderId: selectedAdminId,
            senderName: targetAdmin?.displayName || '管理員',
            senderRole: 'admin',
            text: `收到你的訊息囉！我是${targetAdmin?.displayName || '管理員'}，已為你記錄此反饋，後台確認題庫或課綱後會立即為你處理並同步！`
          });
          if (autoConfirm) {
            setMessages(prev => [...prev, autoConfirm]);
          }
        }, 1200);
      }
    }
  };

  // 管理員專屬：若目前無學生進線，提供一鍵建立示範諮詢對話供即時驗證
  const handleCreateTestThread = () => {
    const testStudentId = 'test_student_' + Math.floor(Math.random() * 899 + 100);
    const testStudentName = '建中會考模範生';
    const adminId = currentUser?.id || 'admin_super_jimmy';
    const adminName = currentUser?.displayName || '總管理員 (Jimmy)';

    sendChatMessage(testStudentId, adminId, {
      studentId: testStudentId,
      studentName: testStudentName,
      adminId: adminId,
      adminName: adminName,
      senderId: testStudentId,
      senderName: testStudentName,
      senderRole: 'student',
      text: '老師您好！想請教數學科多項式十字交乘法第 42 題詳解第二步驟是否有更快公式解？'
    });

    const refreshed = getAllChatThreads();
    setThreads(refreshed);
    setSelectedStudentId(testStudentId);
    setSelectedStudentName(testStudentName);
    setMobileInChat(true);
  };

  const currentAdmin = admins.find(a => a.id === selectedAdminId) || admins[0];

  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
        gap: '20px',
        minHeight: isMobile ? 'calc(100vh - 180px)' : '620px',
        maxWidth: '1240px',
        margin: '0 auto',
        padding: isMobile ? '8px 0' : '16px 0'
      }}
    >
      {/* ============================================================ */}
      {/* 左欄：通道切換清單（依身分動態顯示：學生看管理員名冊；管理員看進線學生名冊） */}
      {/* ============================================================ */}
      {(!isMobile || !mobileInChat) && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '14px',
            height: 'fit-content',
            maxHeight: isMobile ? 'none' : '620px',
            overflowY: 'auto'
          }}
        >
          {/* 標題與說明 */}
          <div style={{ paddingBottom: '12px', borderBottom: '2px solid #17324d' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#17324d', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Shield size={20} color="#ef8354" />
              {isAdmin ? '學生進線諮詢清單 (1 對 1 通道)' : '選擇諮詢管理員 (1 對 1 通道)'}
            </h3>
            <div style={{ fontSize: '0.74rem', color: '#5b6772', marginTop: '6px', fontWeight: 600, lineHeight: 1.4 }}>
              {isAdmin 
                ? '同學發送提問或勘誤時，獨立對話視窗將即時進線供管理員回覆。' 
                : '有幾位駐站老師就有幾個獨立諮詢室，可針對學科疑問一對一深入諮詢。'}
            </div>
          </div>

          {/* 清單項目列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isAdmin ? (
              // --- 管理員視角：顯示學生提問對話列表 ---
              threads.length > 0 ? (
                threads.map(t => {
                  const isSelected = t.studentId === selectedStudentId;
                  return (
                    <div
                      key={t.threadKey}
                      onClick={() => {
                        setSelectedStudentId(t.studentId);
                        setSelectedStudentName(t.studentName);
                        if (isMobile) setMobileInChat(true);
                      }}
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        border: isSelected ? '2.5px solid #ef8354' : '2px solid #ded3c5',
                        background: isSelected ? '#fff0e9' : '#fffdf9',
                        borderRadius: '16px',
                        boxShadow: isSelected ? '3px 3px 0 #ef8354' : '2px 2px 0 #17324d',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <img 
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(t.studentId)}`} 
                        alt="" 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #17324d', background: '#f8f3eb' }} 
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#17324d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.studentName}
                          </span>
                          {t.unreadCount > 0 && (
                            <span style={{ background: '#ef8354', color: '#fff', fontSize: '0.65rem', fontWeight: 900, padding: '1px 7px', borderRadius: '999px' }}>
                              {t.unreadCount} 則未讀
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#5b6772', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.latestMsg?.text || '尚未有發言記錄'}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 12px', background: '#fffdf9', border: '2px dashed #ded3c5', borderRadius: '16px' }}>
                  <MessageCircle size={32} color="#78818a" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#17324d' }}>
                    目前尚無學生發起諮詢
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#78818a', marginTop: '4px', lineHeight: 1.4 }}>
                    當前線上題庫正常運行中，學生送出學科提問時此處將即時跳出！
                  </div>
                  <button
                    onClick={handleCreateTestThread}
                    className="btn btn-secondary"
                    style={{ marginTop: '14px', fontSize: '0.75rem', padding: '6px 12px' }}
                  >
                    ✨ 模擬建立 1 則學生諮詢
                  </button>
                </div>
              )
            ) : (
              // --- 學生視角：顯示可諮詢的管理員列表 ---
              admins.map(admin => {
                const isSelected = admin.id === selectedAdminId;
                return (
                  <div
                    key={admin.id}
                    onClick={() => {
                      setSelectedAdminId(admin.id);
                      if (isMobile) setMobileInChat(true);
                    }}
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      border: isSelected ? '2.5px solid #ef8354' : '2px solid #ded3c5',
                      background: isSelected ? '#fff0e9' : '#fffdf9',
                      borderRadius: '16px',
                      boxShadow: isSelected ? '3px 3px 0 #ef8354' : '2px 2px 0 #17324d',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <img 
                      src={admin.avatar} 
                      alt="" 
                      style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #17324d', background: '#fff' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? '#c8643d' : '#17324d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {admin.displayName}
                        {admin.role === 'super_admin' && <Crown size={14} color="#f59e0b" />}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {admin.specialties?.map((s, i) => (
                          <span key={i} className="badge badge-coral" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 右欄：1 對 1 獨立對話視窗 */}
      {/* ============================================================ */}
      {(!isMobile || mobileInChat) && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: '24px',
            border: '3px solid #17324d',
            boxShadow: '6px 6px 0px #17324d',
            overflow: 'hidden',
            background: '#fffdf9',
            height: isMobile ? 'calc(100vh - 200px)' : '620px'
          }}
        >
          {/* 聊天室 Header */}
          <div 
            style={{ 
              padding: '14px 18px', 
              borderBottom: '2.5px solid #17324d', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              background: '#fcf8f2' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isMobile && (
                <button
                  onClick={() => setMobileInChat(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '4px 6px',
                    cursor: 'pointer',
                    color: '#17324d',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="返回名單"
                >
                  <ArrowLeft size={20} />
                </button>
              )}

              <img 
                src={isAdmin 
                  ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedStudentId || 'student')}` 
                  : (currentAdmin?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=jimmylee1020227`)} 
                alt="" 
                style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid #17324d', background: '#fff' }} 
              />
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.98rem', color: '#17324d' }}>
                  {isAdmin 
                    ? (selectedStudentName ? `與【${selectedStudentName}】的 1 對 1 即時諮詢室` : '請由左側選擇欲回覆的學生')
                    : `與 ${currentAdmin?.displayName} 的獨立諮詢室`}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
                  {isAdmin ? '線上諮詢通道就緒・支援跨端即時互通' : '在線協助審核題庫・每題詳解與課綱爭議解答'}
                </div>
              </div>
            </div>

            <span className="badge badge-coral" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
              專屬 1-on-1 諮詢
            </span>
          </div>

          {/* 訊息串流區域 */}
          <div 
            style={{ 
              flex: 1, 
              padding: '18px', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              background: '#f8f3eb' 
            }}
          >
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#78818a' }}>
                <MessageSquare size={36} style={{ margin: '0 auto 8px auto', opacity: 0.6 }} />
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>尚無通訊記錄</div>
                <div style={{ fontSize: '0.76rem', marginTop: '4px' }}>
                  {isAdmin ? '選取左側學生對話即可開始回覆' : '輸入你的學科疑問或題目反饋，按下發送立即送達管理員！'}
                </div>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isMe = m.senderId === currentUser?.id || (isAdmin && m.senderRole !== 'student');
                return (
                  <div
                    key={m.id || idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      alignSelf: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#78818a', fontWeight: 700, marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isMe ? '我' : m.senderName}
                      {m.senderRole === 'super_admin' && <span style={{ color: '#f59e0b', fontSize: '0.62rem' }}>[總管理員]</span>}
                      {m.senderRole === 'admin' && <span style={{ color: '#0284c7', fontSize: '0.62rem' }}>[駐站教師]</span>}
                    </div>
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: isMe ? '#ef8354' : '#ffffff',
                        color: isMe ? '#ffffff' : '#17324d',
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        lineHeight: 1.5,
                        border: '2px solid #17324d',
                        boxShadow: isMe ? '3px 3px 0 #17324d' : '3px 3px 0 #17324d',
                        wordBreak: 'break-word'
                      }}
                    >
                      {m.text}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#9aa2a8', marginTop: '3px', fontWeight: 600 }}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 底部輸入區域 */}
          <form 
            onSubmit={handleSend} 
            style={{ 
              padding: '14px 18px', 
              borderTop: '2.5px solid #17324d', 
              display: 'flex', 
              gap: '10px', 
              background: '#ffffff' 
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={isAdmin 
                ? (selectedStudentId ? `回覆【${selectedStudentName}】的學科疑問或說明...` : '請先由左側點選要回覆的學生通道') 
                : `輸入對 ${currentAdmin?.displayName} 的學科疑義、題目勘誤或反饋...`}
              disabled={isAdmin && !selectedStudentId}
              style={{
                flex: 1,
                background: '#f8f3eb',
                border: '2px solid #17324d',
                borderRadius: '12px',
                padding: '11px 14px',
                color: '#17324d',
                fontSize: '0.92rem',
                fontWeight: 600,
                outline: 'none'
              }}
            />
            <button 
              type="submit" 
              disabled={(isAdmin && !selectedStudentId) || !inputText.trim()}
              className="btn btn-primary" 
              style={{ 
                padding: '0 20px', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.92rem',
                fontWeight: 800
              }}
            >
              <Send size={16} /> 
              <span>{isAdmin ? '回覆學生' : '發送諮詢'}</span>
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
