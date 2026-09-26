import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getCommunityPosts, 
  fetchCloudCommunityPosts,
  addCommunityPost, 
  likeCommunityPost, 
  deleteCommunityPost,
  getCommunityReports,
  reportCommunityPost,
  subscribeToCloudSync,
  checkIsAdmin 
} from '../services/cloudStorage';
import { MessageSquareHeart, Heart, Send, Sparkles, X, User, Trash2, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';

const REPORT_REASONS = [
  '惡意洗版、重複發文或無意義灌水',
  '謾罵、人身攻擊、歧視或不當言詞',
  '商業廣告、色情或非學習外部連結',
  '洩漏他人隱私或散播不實資訊',
  '其他違反學習網學習秩序行為'
];

export default function CommunityWallModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 檢舉彈窗狀態
  const [reportingPost, setReportingPost] = useState(null);
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [reportNote, setReportNote] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [userReportedPostIds, setUserReportedPostIds] = useState(new Set());

  const refreshReportedStatus = () => {
    const reports = getCommunityReports();
    const currentUserId = currentUser?.id || 'guest';
    const reported = new Set(
      reports
        .filter(r => r.reporterId === currentUserId && r.status === 'pending')
        .map(r => r.postId)
    );
    setUserReportedPostIds(reported);
  };

  useEffect(() => {
    if (isOpen) {
      setPosts(getCommunityPosts());
      refreshReportedStatus();
      fetchCloudCommunityPosts().then(latest => {
        if (latest) setPosts(latest);
      }).catch(() => {});
      const unsubscribe = subscribeToCloudSync((event) => {
        if (event.key === 'community_posts' || event.key === 'deleted_community_post_ids') {
          setPosts(getCommunityPosts());
        }
        if (event.key === 'community_reports') {
          refreshReportedStatus();
        }
      });
      return () => unsubscribe();
    }
  }, [isOpen, currentUser]);

  const lastLikeRef = React.useRef(new Map());

  if (!isOpen) return null;

  const handlePost = (e) => {
    e?.preventDefault();
    if (!inputMsg.trim() || inputMsg.trim().length < 3) {
      setErrorMsg('請至少輸入 3 個字以上的打氣心語！');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      addCommunityPost({
        authorId: currentUser?.id || 'guest',
        userName: currentUser?.displayName || '匿名同學',
        userSchool: currentUser?.role === 'super_admin' ? '系統總管理員' : '會考戰友',
        message: inputMsg.trim()
      });
      setInputMsg('');
      setPosts(getCommunityPosts());
    } catch (err) {
      setErrorMsg(err.message || '發布失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = checkIsAdmin(currentUser);

  const handleDeletePost = (postId) => {
    if (!window.confirm('確定要刪除這則打氣留言嗎？')) return;
    try {
      const updated = deleteCommunityPost(postId, currentUser);
      setPosts([...updated]);
    } catch (err) {
      alert(err.message || '刪除失敗');
      setPosts(getCommunityPosts());
    }
  };


  const handleLike = (postId) => {
    const now = Date.now();
    const last = lastLikeRef.current.get(postId) || 0;
    if (now - last < 800) return;
    lastLikeRef.current.set(postId, now);
    const updated = likeCommunityPost(postId, currentUser?.id || 'guest');
    setPosts([...updated]);
  };

  const handleOpenReport = (post) => {
    setReportingPost(post);
    setSelectedReason(REPORT_REASONS[0]);
    setReportNote('');
    setReportError('');
  };

  const handleSubmitReport = (e) => {
    e?.preventDefault();
    if (!reportingPost) return;
    setIsSubmitting(true);
    setReportError('');
    try {
      reportCommunityPost({
        postId: reportingPost.id,
        postMessage: reportingPost.message,
        authorName: reportingPost.userName,
        authorSchool: reportingPost.userSchool,
        reporterId: currentUser?.id || 'guest_student',
        reporterName: currentUser?.displayName || '同學',
        reason: selectedReason,
        note: reportNote
      });
      setReportSuccess('檢舉已成功送交後台管理團隊審核，感謝維護讀書環境！');
      refreshReportedStatus();
      setTimeout(() => {
        setReportingPost(null);
        setReportSuccess('');
      }, 1500);
    } catch (err) {
      setReportError(err.message || '檢舉送出失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '640px', 
          background: 'var(--theme-card, var(--theme-card, #fffdf9))',
          border: '2.5px solid var(--theme-border, #17324d)',
          borderRadius: '24px',
          boxShadow: '8px 8px 0px var(--theme-border, #17324d)',
          color: 'var(--theme-border, var(--theme-border, #17324d))',
          position: 'relative'
        }}
      >
        {/* 檢舉彈窗 Overlay */}
        {reportingPost && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(23, 50, 77, 0.75)',
              backdropFilter: 'blur(4px)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 100
            }}
          >
            <div 
              style={{
                background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                border: '2.5px solid var(--theme-border, #17324d)',
                borderRadius: '20px',
                boxShadow: '6px 6px 0px var(--theme-border, #17324d)',
                width: '100%',
                maxWidth: '480px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={18} /> 檢舉不當留言
                </h4>
                <button 
                  onClick={() => setReportingPost(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#78818a' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* 被檢舉留言摘要 */}
              <div style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1.5px solid #ded3c5', borderRadius: '12px', padding: '10px 14px', fontSize: '0.84rem' }}>
                <div style={{ fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))', marginBottom: '4px' }}>
                  發布者：{reportingPost.userName} ({reportingPost.userSchool})
                </div>
                <div style={{ color: '#5b6772', fontStyle: 'italic', fontWeight: 600 }}>
                  「{reportingPost.message}」
                </div>
              </div>

              {reportSuccess ? (
                <div style={{ padding: '16px', background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: '12px', color: '#047857', fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} /> {reportSuccess}
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))', display: 'block', marginBottom: '6px' }}>
                      請選擇檢舉原因：
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {REPORT_REASONS.map(r => (
                        <label 
                          key={r}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: selectedReason === r ? '2px solid #b91c1c' : '1.5px solid #e8ded0',
                            background: selectedReason === r ? '#fff0f0' : 'var(--theme-card, var(--theme-card, #fffdf9))',
                            cursor: 'pointer',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            color: selectedReason === r ? '#b91c1c' : 'var(--theme-border, var(--theme-border, #17324d))'
                          }}
                        >
                          <input 
                            type="radio" 
                            name="reportReason" 
                            value={r}
                            checked={selectedReason === r}
                            onChange={() => setSelectedReason(r)}
                          />
                          {r}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))', display: 'block', marginBottom: '6px' }}>
                      補充說明（選填）：
                    </label>
                    <textarea
                      rows={2}
                      value={reportNote}
                      onChange={e => setReportNote(e.target.value)}
                      placeholder="可簡述具體違規情況，協助管理員快速核實..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #ded3c5',
                        background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                        fontSize: '0.84rem',
                        color: 'var(--theme-border, var(--theme-border, #17324d))',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                  </div>

                  {reportError && (
                    <div style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 700 }}>
                      {reportError}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                    <button 
                      type="button" 
                      onClick={() => setReportingPost(null)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                    >
                      取消
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="btn btn-fire"
                      style={{ padding: '6px 16px', fontSize: '0.82rem', fontWeight: 800 }}
                    >
                      {isSubmitting ? '送出中...' : '確定送出檢舉'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        <div className="modal-header" style={{ borderBottom: '2px solid var(--theme-border, #17324d)', background: 'var(--theme-card, var(--theme-card, #fffdf9))', padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: '#fff0e9', border: '1.5px solid var(--theme-border, #17324d)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8643d' }}>
              <MessageSquareHeart size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))' }}>學習網｜一起讀，穩穩上岸</h3>
              <p style={{ fontSize: '0.78rem', color: '#78818a', fontWeight: 600 }}>
                同學打氣留言牆・你不是一個人在戰鬥
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#78818a' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
          
          {/* 留言發布框 */}
          <form onSubmit={handlePost} style={{ background: 'var(--theme-bg, var(--theme-bg, #f8f3eb))', border: '1.5px solid #e8ded0', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--theme-border, var(--theme-border, #17324d))', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} color="var(--theme-accent, var(--theme-accent, #ef8354))" /> 留下你的今天進度或加油打氣：
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                maxLength={200}
                value={inputMsg} 
                onChange={e => setInputMsg(e.target.value)}
                placeholder="例如：今天完成 10 題數學，錯題已加強掌握！大家一起上岸！"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'var(--theme-card, var(--theme-card, #fffdf9))',
                  border: '1.5px solid #ded3c5',
                  borderRadius: '12px',
                  color: 'var(--theme-border, var(--theme-border, #17324d))',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ borderRadius: '12px', padding: '0 18px', fontWeight: 800 }}
              >
                <Send size={16} />
                發布
              </button>
            </div>

            {errorMsg && (
              <span style={{ fontSize: '0.78rem', color: '#c8643d', fontWeight: 700 }}>{errorMsg}</span>
            )}
          </form>

          {/* 留言列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
            {posts.map(post => (
              <div 
                key={post.id} 
                style={{ 
                  background: 'var(--theme-card, var(--theme-card, #fffdf9))', 
                  border: '1.5px solid #e8ded0', 
                  borderRadius: '16px', 
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(23, 50, 77, 0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(post.userName)}`}
                      alt="avatar" 
                      style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ded3c5' }} 
                    />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--theme-border, var(--theme-border, #17324d))' }}>
                      {post.userName}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#78818a', fontWeight: 600 }}>
                      • {post.userSchool}
                    </span>
                  </div>

                  {/* 檢舉狀態按鈕 */}
                  {userReportedPostIds.has(post.id) ? (
                    <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} color="#10b981" /> 已送交審核
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenReport(post)}
                      title="檢舉此留言"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#9aa2a8',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#c8643d'}
                      onMouseLeave={e => e.currentTarget.style.color = '#9aa2a8'}
                    >
                      <Flag size={12} /> 檢舉
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '0.88rem', color: '#5b6772', lineHeight: 1.6, fontWeight: 600 }}>
                  {post.message}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid #f1eae0' }}>
                  <span style={{ fontSize: '0.72rem', color: '#9aa2a8', fontWeight: 600 }}>
                    {new Date(post.timestamp).toLocaleTimeString('zh-TW', { timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {(isAdmin || (currentUser?.id && post.authorId === currentUser.id)) && (
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        title={isAdmin ? "管理員刪除此留言" : "刪除我的打氣留言"}
                        style={{ 
                          background: '#fee2e2', 
                          border: '1.5px solid #ef4444', 
                          borderRadius: '8px', 
                          padding: '4px 10px', 
                          fontSize: '0.74rem', 
                          color: '#b91c1c', 
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Trash2 size={13} />
                        刪除
                      </button>
                    )}

                    <button 
                      onClick={() => handleLike(post.id)}
                      className="btn btn-ghost"
                      style={{ padding: '4px 10px', fontSize: '0.78rem', color: 'var(--theme-accent, var(--theme-accent, #ef8354))', gap: '5px', fontWeight: 700 }}
                    >
                      <Heart size={14} fill="var(--theme-accent, var(--theme-accent, #ef8354))" />
                      為他打氣 ({post.likes || 1})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        <div className="modal-footer" style={{ borderTop: '2px solid var(--theme-border, #17324d)', background: 'var(--theme-card, var(--theme-card, #fffdf9))', padding: '14px 24px' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
