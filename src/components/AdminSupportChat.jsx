import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminsList, getChatMessages, sendChatMessage } from '../services/cloudStorage';
import { 
  MessageSquare, 
  Send, 
  User, 
  Shield, 
  Sparkles, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function AdminSupportChat() {
  const { currentUser } = useAuth();
  const [admins, setAdmins] = useState(getAdminsList());
  const [selectedAdminId, setSelectedAdminId] = useState(admins[1]?.id || admins[0]?.id);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // 取得目前選中的管理員資料
  const currentAdmin = admins.find(a => a.id === selectedAdminId) || admins[0];

  useEffect(() => {
    setAdmins(getAdminsList());
  }, []);

  useEffect(() => {
    if (selectedAdminId) {
      const currentId = currentUser?.id || 'guest_student';
      const threadMsgs = getChatMessages(currentId, selectedAdminId);
      setMessages(threadMsgs);
    }
  }, [selectedAdminId, currentUser?.id]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const currentId = currentUser?.id || 'guest_student';
    const currentName = currentUser?.displayName || '國中同學';
    const currentRole = currentUser?.role || 'student';

    const newMsg = sendChatMessage(currentId, selectedAdminId, {
      senderId: currentId,
      senderName: currentName,
      senderRole: currentRole,
      text: inputText.trim()
    });

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    if (currentRole === 'student') {
      setTimeout(() => {
        const autoReply = sendChatMessage(currentId, selectedAdminId, {
          senderId: selectedAdminId,
          senderName: currentAdmin.displayName,
          senderRole: currentAdmin.role,
          text: `收到你的訊息囉！我已將問題記錄下來，如果是題目答案或詳解問題，我會在後台確認並更新題庫！加油！`
        });
        setMessages(prev => [...prev, autoReply]);
      }, 1500);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', minHeight: '600px' }}>
      
      {/* 左欄：管理員選擇清單（有幾個管理員就有幾個單獨通道） */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="#6366f1" />
            選擇諮詢管理員 (1 對 1 通道)
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            有幾位管理員就有幾個獨立聊天室，可針對個別學科發問
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {admins.map(admin => {
            const isSelected = admin.id === selectedAdminId;
            return (
              <div
                key={admin.id}
                onClick={() => setSelectedAdminId(admin.id)}
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #ef8354' : '1.5px solid #ded3c5',
                  background: isSelected ? '#fff0e9' : '#f8f3eb',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: isSelected ? '3px 3px 0 #ef8354' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <img src={admin.avatar} alt="" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #17324d' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isSelected ? '#c8643d' : '#17324d' }}>
                    {admin.displayName}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {admin.specialties?.map((s, i) => (
                      <span key={i} className="badge badge-indigo" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 右欄：1 對 1 獨立對話視窗 */}
      <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* 聊天室 Header */}
        <div style={{ padding: '16px 20px', borderBottom: '2px solid #17324d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fffdf9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={currentAdmin?.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #17324d' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#17324d' }}>
                與 {currentAdmin?.displayName} 的獨立諮詢室
              </div>
              <div style={{ fontSize: '0.72rem', color: '#347650', fontWeight: 700 }}>
                ● 在線協助審核題庫與學科疑義
              </div>
            </div>
          </div>
          <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
            專屬 1-on-1 諮詢
          </span>
        </div>

        {/* 訊息流動區域 */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '440px', background: '#f8f3eb' }}>
          {messages.map((m, idx) => {
            const isMe = m.senderId === currentUser.id;
            return (
              <div
                key={m.id || idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#5b6772', fontWeight: 700, marginBottom: '3px' }}>
                  {m.senderName}
                </div>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: isMe ? '#ef8354' : '#fffdf9',
                    color: isMe ? '#ffffff' : '#17324d',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    lineHeight: 1.5,
                    border: '2px solid #17324d',
                    boxShadow: isMe ? '2px 2px 0 #d76740' : '2px 2px 0 #17324d'
                  }}
                >
                  {m.text}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#78818a', marginTop: '3px', fontWeight: 600 }}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 訊息發送框 */}
        <form onSubmit={handleSend} style={{ padding: '14px 18px', borderTop: '2px solid #17324d', display: 'flex', gap: '10px', background: '#fffdf9' }}>
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`輸入對 ${currentAdmin?.displayName} 的提問或課綱修正建議...`}
            style={{
              flex: 1,
              background: '#f8f3eb',
              border: '2px solid #17324d',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              color: '#17324d',
              fontSize: '0.9rem',
              fontWeight: 600,
              outline: 'none'
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 18px' }}>
            <Send size={16} /> 發送
          </button>
        </form>

      </div>

    </div>
  );
}
