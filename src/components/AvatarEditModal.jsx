import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Upload, 
  Check, 
  Sparkles, 
  Camera, 
  Image as ImageIcon, 
  RefreshCw, 
  Link as LinkIcon,
  ShieldCheck,
  Smile
} from 'lucide-react';
import siteLogo from '../assets/logo.jpg';

// 精選預設頭像庫
const PRESET_AVATARS = [
  {
    category: '學習網專屬',
    items: [
      { id: 'official_logo', name: '學習網官方標誌', url: siteLogo },
    ]
  },
  {
    category: '可愛萌寵與學霸獸',
    items: [
      { id: 'pet_shiba', name: '柴犬同學', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=shiba_smart' },
      { id: 'pet_cat', name: '橘貓學長', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=clever_kitty' },
      { id: 'pet_panda', name: '功夫熊貓', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=panda_ace' },
      { id: 'pet_owl', name: '智慧貓頭鷹', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=wise_owl' },
      { id: 'pet_penguin', name: '博士企鵝', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=penguin_dr' },
      { id: 'pet_fox', name: '靈巧赤狐', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=swift_fox' }
    ]
  },
  {
    category: '科技機器人',
    items: [
      { id: 'bot_blue', name: '運算藍俠', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=cyber_blue' },
      { id: 'bot_gold', name: '金色冠軍', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=gold_champion' },
      { id: 'bot_green', name: '自然綠影', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=nature_spark' },
      { id: 'bot_purple', name: '量子紫光', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=quantum_violet' },
      { id: 'bot_fire', name: '烈焰戰魂', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=flame_heart' },
      { id: 'bot_silver', name: '未來銀翼', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=silver_wing' }
    ]
  },
  {
    category: '學霸卡通人物',
    items: [
      { id: 'stu_boy1', name: '數學資優生', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=math_genius' },
      { id: 'stu_girl1', name: '英文榜首', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=english_star' },
      { id: 'stu_boy2', name: '理化實驗家', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=science_lab' },
      { id: 'stu_girl2', name: '國文才女', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=literature_gem' },
      { id: 'stu_glasses', name: '眼鏡學霸', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=spectacle_pro' },
      { id: 'stu_winner', name: '滿分狀元', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=top_scorer' }
    ]
  }
];

export default function AvatarEditModal({ isOpen, onClose }) {
  const { currentUser, updateUserAvatar } = useAuth();
  
  const currentAvatar = currentUser?.avatar || siteLogo;
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'upload' | 'url'
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // 處理本機圖片上傳與自動壓縮（限制於 256x256，JPEG 格式，確保雲端傳輸極快無延遲）
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 格式驗證
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片檔案（支援 JPG、PNG、GIF、WebP）！');
      return;
    }

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 利用 HTML5 Canvas 等比例居中縮放並裁切為正方形 256x256
        const canvas = document.createElement('canvas');
        const TARGET_SIZE = 256;
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;
        const ctx = canvas.getContext('2d');

        // 計算裁切尺寸居中
        const minSide = Math.min(img.width, img.height);
        const startX = (img.width - minSide) / 2;
        const startY = (img.height - minSide) / 2;

        ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, TARGET_SIZE, TARGET_SIZE);
        
        // 壓縮成高品質輕量 Base64 JPEG (約 20KB~35KB)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedAvatar(compressedBase64);
        setIsCompressing(false);
      };
      img.onerror = () => {
        alert('圖片載入失敗，請嘗試其他圖片！');
        setIsCompressing(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // 儲存頭像並同步雲端
  const handleSave = async () => {
    if (!selectedAvatar) return;
    setIsSaving(true);
    try {
      if (updateUserAvatar) {
        await updateUserAvatar(selectedAvatar);
      }
      setToastMessage('🎉 頭像更新成功！已同步至 Firebase 雲端與排行榜！');
      setTimeout(() => {
        setToastMessage('');
        setIsSaving(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      alert('頭像同步發生異常，請重試！');
      setIsSaving(false);
    }
  };

  const handleApplyUrl = () => {
    if (customUrlInput.trim()) {
      setSelectedAvatar(customUrlInput.trim());
      setToastMessage('已載入網路圖片預覽！');
      setTimeout(() => setToastMessage(''), 1500);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: 'var(--theme-card, #fffdf9)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: '3px solid var(--theme-border, #17324d)',
        overflow: 'hidden',
        animation: 'modalSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* 頂部標題 */}
        <div style={{
          padding: '20px 24px',
          background: 'var(--theme-bg, #f8f3eb)',
          borderBottom: '2px solid var(--theme-border, #17324d)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '2px 2px 0 var(--theme-border, #17324d)',
              border: '2px solid var(--theme-border, #17324d)'
            }}>
              <Camera size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                自訂個人頭像
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                更換後自動跨裝置 100% 雲端同步，排行榜即時更新
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 內容主體 */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 當前預覽區塊 */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
            borderRadius: '18px',
            padding: '16px 20px',
            border: '2px dashed #93c5fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={selectedAvatar}
                  alt="預覽頭像"
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--theme-border, #17324d)',
                    background: '#ffffff',
                    boxShadow: '3px 3px 0 var(--theme-accent, #ef8354)'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = siteLogo;
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  background: '#10b981',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff'
                }}>
                  <Check size={14} strokeWidth={3} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#3b82f6', marginBottom: '2px' }}>
                  目前選擇預覽
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--theme-border, #17324d)' }}>
                  {currentUser?.displayName || '學習網學員'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <ShieldCheck size={13} color="#10b981" />
                  <span>支援 Firebase Realtime 雲端同步</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedAvatar(currentAvatar)}
              style={{
                padding: '6px 12px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={13} />
              重設為目前
            </button>
          </div>

          {/* 分頁切換 (精選頭像庫 / 上傳本地照片 / 貼上圖片網址) */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'presets' ? 'var(--theme-border, #17324d)' : 'transparent',
                color: activeTab === 'presets' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Smile size={16} />
              <span>精選頭像庫</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'upload' ? 'var(--theme-border, #17324d)' : 'transparent',
                color: activeTab === 'upload' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Upload size={16} />
              <span>自選照片上傳</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'url' ? 'var(--theme-border, #17324d)' : 'transparent',
                color: activeTab === 'url' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <LinkIcon size={16} />
              <span>圖片網址</span>
            </button>
          </div>

          {/* 1. 精選頭像庫分頁 */}
          {activeTab === 'presets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {PRESET_AVATARS.map((cat, cIdx) => (
                <div key={cIdx}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color="#f59e0b" />
                    <span>{cat.category}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: '10px' }}>
                    {cat.items.map((item) => {
                      const isSelected = selectedAvatar === item.url;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedAvatar(item.url)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '8px 4px',
                            borderRadius: '14px',
                            border: isSelected ? '2.5px solid var(--theme-accent, #ef8354)' : '1.5px solid #e2e8f0',
                            background: isSelected ? 'rgba(239, 131, 84, 0.1)' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            transform: isSelected ? 'scale(1.05)' : 'none'
                          }}
                          title={item.name}
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid #cbd5e1',
                              background: '#f8fafc'
                            }}
                          />
                          <span style={{
                            fontSize: '0.66rem',
                            fontWeight: isSelected ? 800 : 600,
                            color: isSelected ? 'var(--theme-border, #17324d)' : '#64748b',
                            textAlign: 'center',
                            maxWidth: '68px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. 本地上傳照片分頁 */}
          {activeTab === 'upload' && (
            <div style={{
              background: '#f8fafc',
              borderRadius: '16px',
              padding: '30px 20px',
              border: '2px dashed #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '12px'
            }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ImageIcon size={30} />
              </div>

              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--theme-border, #17324d)' }}>
                  選擇裝置中的照片或圖片
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                  系統將自動居中裁切並進行輕量壓縮（約 20KB），保證雲端同步流暢無阻！
                </div>
              </div>

              <button
                type="button"
                disabled={isCompressing}
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary"
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                <Upload size={16} />
                <span>{isCompressing ? '壓縮處理中...' : '選取本地圖片'}</span>
              </button>
            </div>
          )}

          {/* 3. 圖片網址分頁 */}
          {activeTab === 'url' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 700 }}>
                輸入圖片的公開直連網址（URL）：
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.86rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'var(--theme-border, #17324d)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  載入預覽
                </button>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                提示：請確保輸入的圖片網址可公開存取且支援 HTTPS。
              </div>
            </div>
          )}

          {/* Toast 通知訊息 */}
          {toastMessage && (
            <div style={{
              background: '#dcfce7',
              border: '1.5px solid #86efac',
              color: '#15803d',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '0.84rem',
              fontWeight: 800,
              textAlign: 'center',
              animation: 'fadeIn 0.2s'
            }}>
              {toastMessage}
            </div>
          )}

        </div>

        {/* 底部操作按鈕 */}
        <div style={{
          padding: '16px 24px',
          background: 'var(--theme-bg, #f8f3eb)',
          borderTop: '2px solid var(--theme-border, #17324d)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            取消
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary"
            style={{
              padding: '10px 22px',
              borderRadius: '12px',
              fontWeight: 900,
              fontSize: '0.92rem',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '3px 3px 0 var(--theme-border, #17324d)'
            }}
          >
            {isSaving ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>雲端同步中...</span>
              </>
            ) : (
              <>
                <Check size={17} strokeWidth={2.5} />
                <span>儲存並雲端同步</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
