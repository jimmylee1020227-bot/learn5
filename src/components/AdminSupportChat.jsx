import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { 
  getAdminsList, 
  getAllChatThreads, 
  getChatMessages, 
  sendChatMessage, 
  markThreadAsRead,
  getKnownStudents,
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
  UserCheck,
  ToggleLeft,
  ToggleRight,
  Users
} from 'lucide-react';

export default function AdminSupportChat() {
  const { currentUser } = useAuth();
  const { isMobile } = useDevice();
  const messagesEndRef = useRef(null);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdmin = isSuperAdmin || currentUser?.role === 'admin';

  // 模式切換：若為管理員，可自由切換「管理員收件回覆視角」與「學生發問體驗視角」
  const [activeViewMode, setActiveViewMode] = useState(isAdmin ? 'admin' : 'student');

  const [admins, setAdmins] = useState(getAdminsList());
  const [threads, setThreads] = useState(getAllChatThreads());
  const [knownStudents, setKnownStudents] = useState(getKnownStudents());
  
  // 管理員視角下的左側子分頁: 'active_threads' | 'all_students'
  const [adminSubTab, setAdminSubTab] = useState('active_threads');

  // 學生視角：選中的管理員 ID
  const [selectedAdminId, setSelectedAdminId] = useState(admins[0]?.id || 'admin_super_jimmy');
  
  // 管理員視角：選中的學生 ID 與 姓名 (預設自動選中第一個，確保輸入框立即可用！)
  const initialThreads = getAllChatThreads();
  const [selectedStudentId, setSelectedStudentId] = useState(initialThreads[0]?.studentId || 'student_lin');
  const [selectedStudentName, setSelectedStudentName] = useState(initialThreads[0]?.studentName || '建中前鋒‧林同學');

  // 手機版全螢幕聊天檢視狀態
  const [mobileInChat, setMobileInChat] = useState(!isMobile);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // 1. 即時多端資料監聽
  useEffect(() => {
    const refreshData = () => {
      const currentAdmins = getAdminsList();
      const currentThreads = getAllChatThreads();
      const currentStudents = getKnownStudents();
      setAdmins(currentAdmins);
      setThreads(currentThreads);
      setKnownStudents(currentStudents);
    };

    refreshData();
    const unsub = subscribeToCloudSync(refreshData);
    return () => unsub();
  }, []);

  // 2. 載入對話訊息
  useEffect(() => {
    if (activeViewMode === 'admin') {
      const targetStudent = selectedStudentId || 'student_lin';
      const msgs = getChatMessages(targetStudent, 'admin_super_jimmy');
      setMessages(msgs);
      markThreadAsRead(targetStudent, 'admin_super_jimmy');
    } else {
      // 學生視角：載入目前使用者與選中管理員的對話
      const myStudentId = currentUser?.id || 'student_lin';
      const msgs = getChatMessages(myStudentId, selectedAdminId);
      setMessages(msgs);
    }
  }, [activeViewMode, selectedStudentId, selectedAdminId, currentUser?.id]);

  // 3. 自動捲動到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 發送訊息處理
  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    if (activeViewMode === 'admin') {
      // --- 管理員回覆學生 ---
      const targetStudentId = selectedStudentId || 'student_lin';
      const adminName = currentUser?.displayName || '總管理員 (Jimmy)';

      const newMsg = sendChatMessage(targetStudentId, 'admin_super_jimmy', {
        studentId: targetStudentId,
        studentName: selectedStudentName,
        adminId: 'admin_super_jimmy',
        adminName: adminName,
        senderId: 'admin_super_jimmy',
        senderName: adminName,
        senderRole: isSuperAdmin ? 'super_admin' : 'admin',
        text: inputText.trim()
      });

      if (newMsg) {
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
        setThreads(getAllChatThreads());
      }
    } else {
      // --- 學生向管理員提問 ---
      const myStudentId = currentUser?.id || 'student_lin';
      const myStudentName = currentUser?.displayName || '會考戰友';
      const targetAdmin = admins.find(a => a.id === selectedAdminId) || admins[0];

      const newMsg = sendChatMessage(myStudentId, selectedAdminId, {
        studentId: myStudentId,
        studentName: myStudentName,
        adminId: selectedAdminId,
        adminName: targetAdmin?.displayName || '總管理員 (Jimmy)',
        senderId: myStudentId,
        senderName: myStudentName,
        senderRole: 'student',
        text: inputText.trim()
      });

      if (newMsg) {
        setMessages(prev => [...prev, newMsg]);
        setInputText('');
        setThreads(getAllChatThreads());


      }
    }
  };

  const currentAdmin = admins.find(a => a.id === selectedAdminId) || admins[0];

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: isMobile ? '8px 0' : '16px 0' }}>
      
      {/* 頂部身分切換與狀態列 (管理員專屬快速切換工具) */}
      {isAdmin && (
        <div 
          style={{ 
            background: '#fffdf9', 
            border: '2.5px solid #17324d', 
            borderRadius: '16px', 
            boxShadow: '4px 4px 0 #17324d',
            padding: '10px 16px', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="#ef8354" />
            <span style={{ fontWeight: 900, fontSize: '0.88rem', color: '#17324d' }}>
              1 對 1 諮詢通道主控台 (唯一總管 Jimmy)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                setActiveViewMode('admin');
                setMobileInChat(false);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                border: activeViewMode === 'admin' ? '2px solid #ef8354' : '1.5px solid #ded3c5',
                background: activeViewMode === 'admin' ? '#ef8354' : '#fffdf9',
                color: activeViewMode === 'admin' ? '#ffffff' : '#17324d',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Shield size={14} />
              <span>🛡️ 管理員收件與回覆視角 ({threads.length} 則)</span>
            </button>

            <button
              onClick={() => {
                setActiveViewMode('student');
                setMobileInChat(false);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                border: activeViewMode === 'student' ? '2px solid #ef8354' : '1.5px solid #ded3c5',
                background: activeViewMode === 'student' ? '#ef8354' : '#fffdf9',
                color: activeViewMode === 'student' ? '#ffffff' : '#17324d',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={14} />
              <span>🎓 模擬學生發問視角</span>
            </button>
          </div>
        </div>
      )}

      {/* 主聊天介面 (雙欄佈局) */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '340px 1fr',
          gap: '20px',
          minHeight: isMobile ? 'calc(100vh - 180px)' : '620px'
        }}
      >
        {/* ============================================================ */}
        {/* 左欄：清單列表 */}
        {/* ============================================================ */}
        {(!isMobile || !mobileInChat) && (
          <div 
            className="glass-panel" 
            style={{ 
              padding: '18px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              borderRadius: '24px',
              border: '3px solid #17324d',
              boxShadow: '6px 6px 0 #17324d',
              background: '#fffdf9',
              height: 'fit-content',
              maxHeight: isMobile ? 'none' : '620px',
              overflowY: 'auto'
            }}
          >
            {/* 左欄頂部標題 */}
            <div style={{ paddingBottom: '10px', borderBottom: '2px solid #17324d' }}>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 900, color: '#17324d', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                {activeViewMode === 'admin' ? (
                  <>
                    <MessageSquare size={18} color="#ef8354" />
                    <span>學生進線諮詢清單 (1 對 1 通道)</span>
                  </>
                ) : (
                  <>
                    <Shield size={18} color="#ef8354" />
                    <span>選擇諮詢管理員 (1 對 1 通道)</span>
                  </>
                )}
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#5b6772', marginTop: '4px', fontWeight: 600 }}>
                {activeViewMode === 'admin' 
                  ? '點選任一同學即可於右側獨立對話框進行即時解答回覆' 
                  : '點選管理員即可開啟專屬 1 對 1 諮詢通道'}
              </div>

              {/* 管理員子分頁切換：進行中提問 vs 所有在線學生 */}
              {activeViewMode === 'admin' && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  <button
                    onClick={() => setAdminSubTab('active_threads')}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: '1.5px solid #17324d',
                      background: adminSubTab === 'active_threads' ? '#17324d' : '#f8f3eb',
                      color: adminSubTab === 'active_threads' ? '#f7cf68' : '#17324d',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    進線提問 ({threads.length})
                  </button>
                  <button
                    onClick={() => setAdminSubTab('all_students')}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      borderRadius: '8px',
                      border: '1.5px solid #17324d',
                      background: adminSubTab === 'all_students' ? '#17324d' : '#f8f3eb',
                      color: adminSubTab === 'all_students' ? '#f7cf68' : '#17324d',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    所有學生名冊 ({knownStudents.length})
                  </button>
                </div>
              )}
            </div>

            {/* 清單項目列表 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeViewMode === 'admin' ? (
                // --- 管理員視角列表 ---
                adminSubTab === 'active_threads' ? (
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
                          padding: '11px 13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          border: isSelected ? '2.5px solid #ef8354' : '2px solid #ded3c5',
                          background: isSelected ? '#fff0e9' : '#ffffff',
                          borderRadius: '14px',
                          boxShadow: isSelected ? '3px 3px 0 #ef8354' : '2px 2px 0 #17324d',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <img 
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(t.studentId)}`} 
                          alt="" 
                          style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid #17324d', background: '#f8f3eb' }} 
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#17324d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {t.studentName}
                            </span>
                            {t.unreadCount > 0 && (
                              <span style={{ background: '#ef8354', color: '#fff', fontSize: '0.62rem', fontWeight: 900, padding: '1px 6px', borderRadius: '999px' }}>
                                {t.unreadCount} 則新訊息
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#5b6772', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.latestMsg?.text || '尚未有訊息'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // 所有學生名冊
                  knownStudents.map(s => {
                    const isSelected = s.id === selectedStudentId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          setSelectedStudentName(s.name);
                          if (isMobile) setMobileInChat(true);
                        }}
                        style={{
                          padding: '11px 13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          border: isSelected ? '2.5px solid #ef8354' : '2px solid #ded3c5',
                          background: isSelected ? '#fff0e9' : '#ffffff',
                          borderRadius: '14px',
                          boxShadow: isSelected ? '3px 3px 0 #ef8354' : '2px 2px 0 #17324d'
                        }}
                      >
                        <img 
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(s.id)}`} 
                          alt="" 
                          style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #17324d' }} 
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#17324d' }}>{s.name}</div>
                          <div style={{ fontSize: '0.68rem', color: '#78818a' }}>{s.school}</div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                // --- 學生視角：管理員名冊 ---
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
        {/* 右欄：1 對 1 即時對話視窗 */}
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
              height: isMobile ? 'calc(100vh - 180px)' : '620px'
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
                  src={activeViewMode === 'admin' 
                    ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(selectedStudentId || 'student_lin')}` 
                    : (currentAdmin?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=jimmylee1020227`)} 
                  alt="" 
                  style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid #17324d', background: '#fff' }} 
                />
                <div>
                  <div style={{ fontWeight: 900, fontSize: '0.98rem', color: '#17324d' }}>
                    {activeViewMode === 'admin' 
                      ? `與【${selectedStudentName || '學生戰友'}】的 1 對 1 諮詢通道`
                      : `與 ${currentAdmin?.displayName} 的獨立諮詢室`}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
                    {activeViewMode === 'admin' 
                      ? '在線即時審查中・任何回覆將立即同步給該同學' 
                      : '管理員駐站線上中・歡迎提問學科盲點、題庫勘誤與解題思路'}
                  </div>
                </div>
              </div>

              <span className="badge badge-coral" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                1-on-1 專屬頻道
              </span>
            </div>

            {/* 訊息流動區域 */}
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
                    輸入內容後點擊發送，即可開始 1 對 1 即時對話！
                  </div>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMe = activeViewMode === 'admin' 
                    ? (m.senderRole !== 'student') 
                    : (m.senderRole === 'student' || m.senderId === currentUser?.id);
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

            {/* 訊息輸入與發送欄 */}
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
                placeholder={activeViewMode === 'admin' 
                  ? `回覆【${selectedStudentName || '學生'}】的學科疑問或說明...` 
                  : `輸入對 ${currentAdmin?.displayName} 的學科疑義、題目勘誤或反饋...`}
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
                disabled={!inputText.trim()}
                className="btn btn-primary" 
                style={{ 
                  padding: '0 20px', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  opacity: !inputText.trim() ? 0.6 : 1
                }}
              >
                <Send size={16} /> 
                <span>{activeViewMode === 'admin' ? '回覆學生' : '發送諮詢'}</span>
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
