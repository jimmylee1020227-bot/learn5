// ─── 學習網 教師系統、班級系統與課綱單元掌握度分析服務 (Class & Teacher Service) ───
import { 
  db, 
  ref, 
  set, 
  get, 
  onValue, 
  update 
} from './firebase.js';
import { 
  getJson, 
  setJson, 
  safeSetLocalStorage, 
  sanitizeForFirebase,
  pushDirectToFirebaseRest,
  getUserPracticeHistory
} from './cloudStorage.js';
import { CURRICULUM_UNITS, SUBJECTS, GRADES } from '../data/curriculum108.js';
import { generateQuestion } from '../data/questionGenerator.js';
import { addStudentPoints, getTaiwanWeekId } from './leaderboardService.js';

const STORAGE_PREFIX = 'studyhub_cloud_';

// ── 1. 班級代碼產生器（6 碼唯一英數大寫，例如：M8A701、TW992X）──
export function generateClassCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去除易混淆字元 0/O, 1/I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ── 2. 教師帳號申請與權限審核模組 ──
export const TEACHER_APPS_KEY = 'teacher_applications';
export const TEACHERS_LIST_KEY = 'teachers_list';

// 檢查使用者是否具備教師身分 (含系統管理員)
export function checkIsTeacher(user) {
  if (!user) return false;
  if (user.role === 'teacher' || user.role === 'admin' || user.role === 'super_admin') {
    return true;
  }
  const teachersRaw = getJson(TEACHERS_LIST_KEY, []);
  const teachers = Array.isArray(teachersRaw) 
    ? teachersRaw 
    : (teachersRaw && typeof teachersRaw === 'object' ? Object.values(teachersRaw) : []);
  const uEmail = (user.email || '').trim().toLowerCase();
  const uId = user.id || user.userId;
  return teachers.some(t => 
    t && (
      (t.id && t.id === uId) || 
      (t.email && typeof t.email === 'string' && t.email.trim().toLowerCase() === uEmail)
    )
  );
}

// 取得所有教師申請清單
export function getTeacherApplications() {
  const list = getJson(TEACHER_APPS_KEY, []);
  return Array.isArray(list) ? list : (list && typeof list === 'object' ? Object.values(list) : []);
}

// 提交教師帳號申請
export async function submitTeacherApplication({ applicantId, applicantName, applicantEmail, schoolName, subjectTaught, reason }) {
  if (!applicantId || !applicantEmail) {
    throw new Error('缺少申請人基本資料');
  }

  const appId = `t_app_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const newApp = {
    id: appId,
    applicantId,
    applicantName: applicantName || '熱血教師',
    applicantEmail: applicantEmail.trim().toLowerCase(),
    schoolName: schoolName || '國中/高中',
    subjectTaught: subjectTaught || '全科',
    reason: reason || '引導班級學生系統化複習與派發題庫任務',
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    appliedAt: new Date().toISOString()
  };

  const apps = getTeacherApplications();
  const existingIdx = apps.findIndex(a => a.applicantEmail === newApp.applicantEmail && a.status === 'pending');
  if (existingIdx >= 0) {
    apps[existingIdx] = newApp;
  } else {
    apps.unshift(newApp);
  }

  setJson(TEACHER_APPS_KEY, apps);
  if (db) {
    set(ref(db, `studyhub/teacher_applications/${appId}`), sanitizeForFirebase(newApp)).catch(() => {});
  }
  pushDirectToFirebaseRest(`studyhub/teacher_applications/${appId}`, newApp);

  return newApp;
}

// 審核核准教師申請 (管理員使用，或測試快速開通)
export async function approveTeacherApplication(appId, reviewerUser) {
  const apps = getTeacherApplications();
  const targetApp = apps.find(a => a.id === appId);
  if (!targetApp) throw new Error('找不到該筆申請紀錄');

  targetApp.status = 'approved';
  targetApp.reviewedAt = new Date().toISOString();
  targetApp.reviewedBy = reviewerUser?.displayName || reviewerUser?.name || '系統總管';
  setJson(TEACHER_APPS_KEY, apps);

  // 加入正式教師清單
  const teachersRaw = getJson(TEACHERS_LIST_KEY, []);
  const teachers = Array.isArray(teachersRaw) 
    ? teachersRaw 
    : (teachersRaw && typeof teachersRaw === 'object' ? Object.values(teachersRaw) : []);
  const teacherProfile = {
    id: targetApp.applicantId,
    name: targetApp.applicantName,
    email: targetApp.applicantEmail,
    school: targetApp.schoolName,
    subject: targetApp.subjectTaught,
    role: 'teacher',
    approvedAt: targetApp.reviewedAt
  };
  if (!teachers.some(t => t && (t.id === teacherProfile.id || t.email === teacherProfile.email))) {
    teachers.push(teacherProfile);
    setJson(TEACHERS_LIST_KEY, teachers);
  }

  // 雲端同步
  if (db) {
    set(ref(db, `studyhub/teacher_applications/${appId}`), sanitizeForFirebase(targetApp)).catch(() => {});
    set(ref(db, `studyhub/teachers_list/${teacherProfile.id}`), sanitizeForFirebase(teacherProfile)).catch(() => {});
    // 同步更新 user_registry 角色為 teacher
    update(ref(db, `studyhub/user_registry/${targetApp.applicantId}`), { role: 'teacher' }).catch(() => {});
  }
  pushDirectToFirebaseRest(`studyhub/teacher_applications/${appId}`, targetApp);
  pushDirectToFirebaseRest(`studyhub/teachers_list/${teacherProfile.id}`, teacherProfile);

  return targetApp;
}

// 快速體驗開通教師身分（讓使用者能直接一鍵變更並體驗教師後台）
export async function instantEnableTeacherRole(user) {
  if (!user || !user.id) return null;
  const teacherProfile = {
    id: user.id,
    name: user.displayName || user.name || '老師',
    email: (user.email || '').trim().toLowerCase(),
    school: user.school || '會考衝刺名校',
    subject: '國中全科',
    role: 'teacher',
    approvedAt: new Date().toISOString()
  };

  const teachersRaw = getJson(TEACHERS_LIST_KEY, []);
  const teachers = Array.isArray(teachersRaw) 
    ? teachersRaw 
    : (teachersRaw && typeof teachersRaw === 'object' ? Object.values(teachersRaw) : []);
  if (!teachers.some(t => t && (t.id === teacherProfile.id || t.email === teacherProfile.email))) {
    teachers.push(teacherProfile);
    setJson(TEACHERS_LIST_KEY, teachers);
  }

  if (db) {
    set(ref(db, `studyhub/teachers_list/${teacherProfile.id}`), sanitizeForFirebase(teacherProfile)).catch(() => {});
    update(ref(db, `studyhub/user_registry/${user.id}`), { role: 'teacher' }).catch(() => {});
  }
  pushDirectToFirebaseRest(`studyhub/teachers_list/${teacherProfile.id}`, teacherProfile);

  return teacherProfile;
}

// ── 3. 班級系統核心 (Class Management) ──
export const CLASSES_KEY = 'studyhub_classes';

export function getAllClasses() {
  const classes = getJson(CLASSES_KEY, []);
  return Array.isArray(classes) ? classes : (classes && typeof classes === 'object' ? Object.values(classes) : []);
}

// 取得某位老師所開設的所有班級
export function getClassesByTeacher(teacherId) {
  if (!teacherId) return [];
  const allClasses = getAllClasses();
  return allClasses.filter(c => c && (c.teacherId === teacherId || c.teacherEmail === teacherId));
}

// 取得某位學生所加入的所有班級
export function getClassesByStudent(studentId, studentEmail = '') {
  if (!studentId && !studentEmail) return [];
  const cleanEmail = (studentEmail || '').trim().toLowerCase();
  const allClasses = getAllClasses();
  return allClasses.filter(c => {
    if (!c || !Array.isArray(c.students)) return false;
    return c.students.some(s => 
      s.id === studentId || 
      (cleanEmail && s.email && s.email.trim().toLowerCase() === cleanEmail)
    );
  });
}

// 根據班級 6 碼代碼查詢班級
export function findClassByCode(code) {
  if (!code || typeof code !== 'string') return null;
  const clean = code.trim().toUpperCase();
  const allClasses = getAllClasses();
  return allClasses.find(c => c && c.classCode && c.classCode.toUpperCase() === clean) || null;
}

// 建立新班級
export async function createClass({ teacherUser, className, school, grade, subject, leaderboardSettings }) {
  if (!teacherUser || !className) {
    throw new Error('請填寫完整班級名稱與授課教師');
  }

  let code = generateClassCode();
  const allClasses = getAllClasses();
  // 確保代碼全站唯一
  while (allClasses.some(c => c.classCode === code)) {
    code = generateClassCode();
  }

  const classId = `cls_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newClass = {
    id: classId,
    classCode: code,
    className: className.trim(),
    school: school || teacherUser.school || '會考衝刺國中',
    grade: grade || 'g8',
    subject: subject || 'math',
    teacherId: teacherUser.id,
    teacherName: teacherUser.displayName || teacherUser.name || '班級導師',
    teacherEmail: (teacherUser.email || '').trim().toLowerCase(),
    students: [], // [{ id, name, email, avatar, joinedAt }]
    announcements: [
      {
        id: 'ann_init',
        title: '🎉 歡迎加入班級！',
        content: `歡迎各位同學加入 ${className}！老師會定期在此派發段考重點題庫，請隨時留意作業與班級排行榜喔！`,
        createdAt: new Date().toISOString(),
        teacherName: teacherUser.displayName || '班級導師'
      }
    ],
    // 班級專屬排行榜控制機制
    leaderboardSettings: {
      isEnabled: true, // 是否開啟排行榜 (關閉後學生只看到全服排行榜)
      resetMode: leaderboardSettings?.resetMode || 'interval', // 'manual' | 'interval' | 'specific_date'
      intervalType: leaderboardSettings?.intervalType || 'weekly', // 'weekly' (每週一) | 'biweekly' (雙週) | 'monthly' (每月1號)
      specificResetDate: leaderboardSettings?.specificResetDate || '', // 幾月幾號幾點重置 (ISO字串)
      lastResetAt: new Date().toISOString(),
      currentCycleId: getTaiwanWeekId()
    },
    createdAt: new Date().toISOString()
  };

  allClasses.unshift(newClass);
  setJson(CLASSES_KEY, allClasses);

  if (db) {
    set(ref(db, `studyhub/classes/${classId}`), sanitizeForFirebase(newClass)).catch(() => {});
  }
  pushDirectToFirebaseRest(`studyhub/classes/${classId}`, newClass);

  return newClass;
}

// 學生透過班級代碼加入班級
export async function joinClassByCode(code, studentUser) {
  if (!code || !studentUser || !studentUser.id) {
    throw new Error('請輸入正確的 6 碼班級代碼並確認登入');
  }

  const targetClass = findClassByCode(code);
  if (!targetClass) {
    throw new Error('查無此班級代碼，請確認代碼是否輸入正確！');
  }

  const cleanEmail = (studentUser.email || '').trim().toLowerCase();
  const existing = (targetClass.students || []).find(s => 
    s.id === studentUser.id || 
    (cleanEmail && s.email && s.email.trim().toLowerCase() === cleanEmail)
  );

  if (existing) {
    return { classItem: targetClass, isNew: false, message: '您已經在此班級中囉！' };
  }

  const newStudentEntry = {
    id: studentUser.id,
    name: studentUser.displayName || studentUser.name || '同學',
    email: cleanEmail,
    avatar: studentUser.avatar || '',
    school: studentUser.school || '會考戰友',
    joinedAt: new Date().toISOString(),
    classPoints: 0 // 班級內獨立積分
  };

  targetClass.students = targetClass.students || [];
  targetClass.students.push(newStudentEntry);

  const allClasses = getAllClasses();
  const idx = allClasses.findIndex(c => c.id === targetClass.id);
  if (idx >= 0) allClasses[idx] = targetClass;
  setJson(CLASSES_KEY, allClasses);

  // 雲端同步
  if (db) {
    set(ref(db, `studyhub/classes/${targetClass.id}/students`), sanitizeForFirebase(targetClass.students)).catch(() => {});
  }
  pushDirectToFirebaseRest(`studyhub/classes/${targetClass.id}/students`, targetClass.students);

  return { classItem: targetClass, isNew: true, message: `成功加入 ${targetClass.className}！` };
}

// 學生退出班級
export async function leaveClass(classId, studentId) {
  const allClasses = getAllClasses();
  const cls = allClasses.find(c => c.id === classId);
  if (!cls) return;

  cls.students = (cls.students || []).filter(s => s.id !== studentId);
  setJson(CLASSES_KEY, allClasses);

  if (db) {
    set(ref(db, `studyhub/classes/${classId}/students`), sanitizeForFirebase(cls.students)).catch(() => {});
  }
  pushDirectToFirebaseRest(`studyhub/classes/${classId}/students`, cls.students);
}

// 導師更新班級設定（重置模式、排行開關等）
export async function updateClassSettings(classId, updates) {
  const allClasses = getAllClasses();
  const cls = allClasses.find(c => c.id === classId);
  if (!cls) throw new Error('找不到該班級');

  Object.assign(cls, updates);
  setJson(CLASSES_KEY, allClasses);

  if (db) {
    update(ref(db, `studyhub/classes/${classId}`), sanitizeForFirebase(updates)).catch(() => {});
  }
  pushDirectToFirebaseRest(`studyhub/classes/${classId}`, cls);
  return cls;
}

// 導師手動重置班級排行榜 (立即清空班級內學生的積分)
export async function resetClassLeaderboard(classId, operatorTeacher) {
  const allClasses = getAllClasses();
  const cls = allClasses.find(c => c.id === classId);
  if (!cls) throw new Error('找不到該班級');

  // 封存上一期班級得獎者
  const prevRankings = [...(cls.students || [])].sort((a, b) => (b.classPoints || 0) - (a.classPoints || 0));
  const archiveEntry = {
    cycleId: cls.leaderboardSettings?.currentCycleId || getTaiwanWeekId(),
    resetAt: new Date().toISOString(),
    operator: operatorTeacher?.displayName || '導師',
    topStudents: prevRankings.slice(0, 3).map(s => ({ name: s.name, points: s.classPoints || 0 }))
  };

  cls.leaderboardHistory = cls.leaderboardHistory || [];
  cls.leaderboardHistory.unshift(archiveEntry);

  // 學生班級積分歸零
  cls.students = (cls.students || []).map(s => ({
    ...s,
    classPoints: 0
  }));

  cls.leaderboardSettings = {
    ...cls.leaderboardSettings,
    lastResetAt: new Date().toISOString(),
    currentCycleId: `cycle_${Date.now()}`
  };

  setJson(CLASSES_KEY, allClasses);

  if (db) {
    set(ref(db, `studyhub/classes/${classId}`), sanitizeForFirebase(cls)).catch(() => {});
  }
  pushDirectToFirebaseRest(`studyhub/classes/${classId}`, cls);

  return cls;
}

// 檢查並自動執行週期重置 (每週/特定日期)
export function checkAndAutoResetClass(cls) {
  if (!cls || !cls.leaderboardSettings) return cls;
  const settings = cls.leaderboardSettings;
  const now = Date.now();

  // 若設定特定日期重置
  if (settings.resetMode === 'specific_date' && settings.specificResetDate) {
    const targetTime = new Date(settings.specificResetDate).getTime();
    const lastReset = new Date(settings.lastResetAt || 0).getTime();
    if (now >= targetTime && lastReset < targetTime) {
      cls.students = (cls.students || []).map(s => ({ ...s, classPoints: 0 }));
      settings.lastResetAt = new Date().toISOString();
      return cls;
    }
  }

  // 若設定每週一重置
  if (settings.resetMode === 'interval' && settings.intervalType === 'weekly') {
    const currentWeek = getTaiwanWeekId();
    if (settings.currentCycleId !== currentWeek) {
      cls.students = (cls.students || []).map(s => ({ ...s, classPoints: 0 }));
      settings.currentCycleId = currentWeek;
      settings.lastResetAt = new Date().toISOString();
      return cls;
    }
  }

  return cls;
}

// 取得班級即時排行榜
export function getClassLeaderboard(classId) {
  const allClasses = getAllClasses();
  let cls = allClasses.find(c => c.id === classId);
  if (!cls) return [];

  cls = checkAndAutoResetClass(cls);

  const students = Array.isArray(cls.students) ? cls.students : [];
  return [...students].sort((a, b) => (b.classPoints || 0) - (a.classPoints || 0));
}

// 學生獲得點數時：同時累加全服總排行點數與其所屬所有班級的班級點數！
export function recordPointsForClassAndGlobal(user, pointsEarned, includeGlobal = false) {
  if (!user || !user.id || typeof pointsEarned !== 'number' || pointsEarned <= 0) return;

  try {
    // 1. 若呼叫端未另外發放全服點數，才在此同步累加全服總榜，嚴防雙重給分
    if (includeGlobal) {
      try {
        addStudentPoints(user, pointsEarned);
      } catch (err) {
        console.warn('[ClassService] addStudentPoints error in recordPointsForClassAndGlobal:', err);
      }
    }

    // 2. 同步累加該生加入的所有班級的內部競賽積分
    const allClasses = getAllClasses();
    const cleanEmail = (user.email || '').trim().toLowerCase();
    let hasClassUpdated = false;

    allClasses.forEach(cls => {
      if (!cls || !Array.isArray(cls.students)) return;
      const student = cls.students.find(s => 
        s && (s.id === user.id || (cleanEmail && s.email && s.email.trim().toLowerCase() === cleanEmail))
      );
      if (student) {
        student.classPoints = (student.classPoints || 0) + pointsEarned;
        student.lastActive = new Date().toISOString();
        hasClassUpdated = true;

        // 雲端單點推播
        if (db) {
          update(ref(db, `studyhub/classes/${cls.id}/students`), sanitizeForFirebase(cls.students)).catch(() => {});
        }
        pushDirectToFirebaseRest(`studyhub/classes/${cls.id}/students`, cls.students);
      }
    });

    if (hasClassUpdated) {
      setJson(CLASSES_KEY, allClasses);
    }
  } catch (globalErr) {
    console.warn('[ClassService] recordPointsForClassAndGlobal warning:', globalErr);
  }
}

// ── 4. 學習進度與課綱單元強弱診斷矩陣 (Unit Mastery & Learning Progress Matrix) ──
// 不論學生是否加入班級，所有人皆能查閱；管理員與班級導師亦可調閱該生報告
export function calculateStudentUnitMastery(studentId) {
  if (!studentId) return null;

  // 1. 取得該生的做題歷程與錯題本
  const historyKey = `practice_history_${studentId}`;
  const mistakeKey = `mistake_notebook_${studentId}`;
  
  const rawHistory = getJson(historyKey, null);
  const historyLogs = Array.isArray(rawHistory)
    ? rawHistory
    : (rawHistory && typeof rawHistory === 'object'
        ? Object.values(rawHistory)
        : (Array.isArray(getJson('practice_history', [])) ? getJson('practice_history', []).filter(l => l && l.userId === studentId) : []));

  const rawMistakes = getJson(mistakeKey, null);
  const activeMistakes = Array.isArray(rawMistakes)
    ? rawMistakes
    : (rawMistakes && typeof rawMistakes === 'object'
        ? Object.values(rawMistakes)
        : (((getJson('mistake_notebook', {}) || {})[studentId]) || []));

  const mistakeQuestionIds = new Set(
    (Array.isArray(activeMistakes) ? activeMistakes : [])
      .filter(m => m && m.status !== 'resolved')
      .map(m => m.questionId || m.id)
  );

  // 2. 統計每個課綱單元的答題數據
  // unitStatsMap: unitId => { total: 0, correct: 0, wrong: 0, unresolvedMistakes: 0, lastPracticed: '' }
  const unitStatsMap = new Map();

  (Array.isArray(historyLogs) ? historyLogs : []).forEach(log => {
    if (!log || !log.unitId) return;
    const uId = log.unitId;
    if (!unitStatsMap.has(uId)) {
      unitStatsMap.set(uId, {
        total: 0,
        correct: 0,
        wrong: 0,
        unresolvedMistakes: 0,
        lastPracticed: log.timestamp || ''
      });
    }
    const stat = unitStatsMap.get(uId);
    stat.total += 1;
    if (log.isCorrect) {
      stat.correct += 1;
    } else {
      stat.wrong += 1;
    }
    if (log.timestamp && (!stat.lastPracticed || new Date(log.timestamp) > new Date(stat.lastPracticed))) {
      stat.lastPracticed = log.timestamp;
    }
  });

  // 統計未消滅錯題數量
  (Array.isArray(activeMistakes) ? activeMistakes : []).forEach(m => {
    if (!m || !m.unitId || m.status === 'resolved') return;
    const uId = m.unitId;
    if (!unitStatsMap.has(uId)) {
      unitStatsMap.set(uId, {
        total: 1,
        correct: 0,
        wrong: 1,
        unresolvedMistakes: 1,
        lastPracticed: m.timestamp || ''
      });
    } else {
      unitStatsMap.get(uId).unresolvedMistakes += 1;
    }
  });

  // 3. 對齊 108 課綱完整架構進行熟練度分級
  const subjectMastery = {};
  let totalMasteredUnits = 0;
  let totalWeakUnits = 0;
  let totalAttemptedQuestions = 0;

  SUBJECTS.forEach(subj => {
    const sId = subj.id;
    subjectMastery[sId] = {
      subjectInfo: subj,
      grades: {}
    };

    const subjUnits = CURRICULUM_UNITS[sId] || {};
    Object.entries(subjUnits).forEach(([gId, unitsList]) => {
      if (!Array.isArray(unitsList)) return;

      const unitDetails = unitsList.map(unit => {
        const stat = unitStatsMap.get(unit.id) || { total: 0, correct: 0, wrong: 0, unresolvedMistakes: 0, lastPracticed: '' };
        totalAttemptedQuestions += stat.total;
        const accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;

        let status = 'untested'; // 'mastered' | 'proficient' | 'weak' | 'untested'
        if (stat.total === 0) {
          status = 'untested';
        } else if (accuracy >= 85 && stat.total >= 5 && stat.unresolvedMistakes === 0) {
          status = 'mastered';
          totalMasteredUnits += 1;
        } else if (accuracy >= 60 && stat.unresolvedMistakes <= 1) {
          status = 'proficient';
        } else {
          status = 'weak';
          totalWeakUnits += 1;
        }

        return {
          id: unit.id,
          name: unit.name,
          tags: unit.tags || [],
          total: stat.total,
          correct: stat.correct,
          wrong: stat.wrong,
          accuracy,
          unresolvedMistakes: stat.unresolvedMistakes,
          status,
          lastPracticed: stat.lastPracticed
        };
      });

      subjectMastery[sId].grades[gId] = unitDetails;
    });
  });

  return {
    studentId,
    totalAttemptedQuestions,
    totalMasteredUnits,
    totalWeakUnits,
    subjectMastery,
    generatedAt: new Date().toISOString()
  };
}

// ── 5. 老師手動派題與作業成效診斷矩陣 (Teacher Assignments & Diagnostic Matrix) ──
export const ASSIGNMENTS_KEY = 'studyhub_assignments';

export function getAllAssignments() {
  const list = getJson(ASSIGNMENTS_KEY, []);
  return Array.isArray(list) ? list : (list && typeof list === 'object' ? Object.values(list) : []);
}

// 取得某班級的所有作業
export function getAssignmentsByClass(classId) {
  if (!classId) return [];
  const all = getAllAssignments();
  return all.filter(a => a && a.classId === classId);
}

// 老師手動建立並派發班級作業
export async function createClassAssignment({ teacherUser, classId, title, deadline, subjectId, gradeId, unitId, questionCount = 10, difficulty = 'medium', customQuestions = null }) {
  if (!teacherUser || !classId || !title) {
    throw new Error('請提供完整的作業資訊與指派班級');
  }

  let finalQuestions = [];

  if (Array.isArray(customQuestions) && customQuestions.length > 0) {
    finalQuestions = customQuestions;
  } else {
    // 依指定科目、年級與單元自動生成標準題庫作業卷
    const count = Math.min(Math.max(3, questionCount), 30);
    for (let i = 1; i <= count; i++) {
      const q = generateQuestion(subjectId || 'math', gradeId || 'g8', unitId || 'm-8-u1', i, difficulty);
      if (q) {
        finalQuestions.push({
          id: q.id || `asg_q_${i}`,
          index: i,
          subjectId: q.subjectId,
          gradeId: q.gradeId,
          unitId: q.unitId,
          unitName: q.unitName || '單元作業',
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation || '詳見教材觀念解析',
          hint: q.hint || '',
          conceptTag: q.conceptTag || '課綱核心考點'
        });
      }
    }
  }

  const assignmentId = `asg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newAssignment = {
    id: assignmentId,
    classId,
    title: title.trim(),
    teacherId: teacherUser.id,
    teacherName: teacherUser.displayName || '老師',
    subjectId: subjectId || 'math',
    gradeId: gradeId || 'g8',
    unitId: unitId || 'm-8-u1',
    deadline: deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
    totalQuestions: finalQuestions.length,
    questions: finalQuestions,
    createdAt: new Date().toISOString()
  };

  const all = getAllAssignments();
  all.unshift(newAssignment);
  setJson(ASSIGNMENTS_KEY, all);

  if (db) {
    set(ref(db, `studyhub/assignments/${assignmentId}`), sanitizeForFirebase(newAssignment)).catch(() => {});
  }
  pushDirectToFirebaseRest(`studyhub/assignments/${assignmentId}`, newAssignment);

  return newAssignment;
}

// 學生繳交作業
export async function submitAssignment({ assignmentId, studentUser, results, timeSpentSec }) {
  if (!assignmentId || !studentUser || !studentUser.id) {
    throw new Error('缺少作業或學生身分資訊');
  }

  const subKey = `asg_sub_${assignmentId}_${studentUser.id}`;
  const correctCount = results.filter(r => r.isCorrect).length;
  const score = Math.round((correctCount / results.length) * 100);

  const submission = {
    assignmentId,
    studentId: studentUser.id,
    studentName: studentUser.displayName || studentUser.name || '同學',
    studentEmail: (studentUser.email || '').trim().toLowerCase(),
    studentAvatar: studentUser.avatar || '',
    score,
    correctCount,
    totalQuestions: results.length,
    timeSpentSec: timeSpentSec || 60,
    answers: results.map(r => ({
      questionId: r.id,
      index: r.index,
      userChoice: r.userChoice !== undefined ? r.userChoice : null,
      isCorrect: !!r.isCorrect,
      correctAnswer: r.answer
    })),
    submittedAt: new Date().toISOString()
  };

  safeSetLocalStorage(STORAGE_PREFIX + subKey, JSON.stringify(submission));

  if (db) {
    set(ref(db, `studyhub/assignment_submissions/${assignmentId}/${studentUser.id}`), sanitizeForFirebase(submission)).catch(() => {});
  }
  pushDirectToFirebaseRest(`studyhub/assignment_submissions/${assignmentId}/${studentUser.id}`, submission);

  // 繳交作業獲得點數（同步班級與全服）
  recordPointsForClassAndGlobal(studentUser, correctCount);

  return submission;
}

// 取得某學生在特定作業的繳交狀況
export function getStudentSubmission(assignmentId, studentId) {
  const subKey = `asg_sub_${assignmentId}_${studentId}`;
  return getJson(subKey, null);
}

// 老師查看作業【成效診斷矩陣】：全班答對率、每一題有誰錯選了哪個答案
export async function fetchAssignmentDiagnosticReport(assignmentId, classId) {
  const allAssignments = getAllAssignments();
  const assignment = allAssignments.find(a => a.id === assignmentId);
  if (!assignment) throw new Error('找不到該項作業');

  const allClasses = getAllClasses();
  const targetClass = allClasses.find(c => c.id === classId);
  const classStudents = targetClass?.students || [];

  // 從 Firebase 調閱該作業的所有學生繳交紀錄
  let submissions = [];
  if (db) {
    try {
      const snap = await get(ref(db, `studyhub/assignment_submissions/${assignmentId}`));
      const val = snap.val();
      if (val) {
        submissions = Array.isArray(val) ? val : (val && typeof val === 'object' ? Object.values(val) : []);
      }
    } catch (e) {
      console.warn('Failed to fetch cloud assignment submissions', e);
    }
  }

  // 補充本地暫存的繳交紀錄（防弱網）
  if (submissions.length === 0) {
    classStudents.forEach(st => {
      const localSub = getStudentSubmission(assignmentId, st.id);
      if (localSub) submissions.push(localSub);
    });
  }

  const submittedStudentIds = new Set(submissions.map(s => s.studentId));
  const unsubmittedStudents = classStudents.filter(st => !submittedStudentIds.has(st.id));

  // 逐題診斷分析 (Per-Question Breakdown)
  const questionDiagnostics = (assignment.questions || []).map((q, qIndex) => {
    let answeredCount = 0;
    let correctCount = 0;
    const optionDistribution = { 0: 0, 1: 0, 2: 0, 3: 0 };
    const wrongStudentDetails = []; // [{ studentName, studentEmail, userChoice }]
    const correctStudentDetails = [];

    submissions.forEach(sub => {
      const ans = (sub.answers || []).find(a => a.index === q.index || a.questionId === q.id);
      if (ans && ans.userChoice !== null && ans.userChoice !== undefined) {
        answeredCount += 1;
        if (optionDistribution[ans.userChoice] !== undefined) {
          optionDistribution[ans.userChoice] += 1;
        }

        if (ans.isCorrect) {
          correctCount += 1;
          correctStudentDetails.push({
            studentId: sub.studentId,
            studentName: sub.studentName,
            userChoice: ans.userChoice
          });
        } else {
          wrongStudentDetails.push({
            studentId: sub.studentId,
            studentName: sub.studentName,
            studentEmail: sub.studentEmail,
            userChoice: ans.userChoice
          });
        }
      }
    });

    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    return {
      index: q.index || (qIndex + 1),
      questionId: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.answer,
      explanation: q.explanation,
      conceptTag: q.conceptTag,
      answeredCount,
      correctCount,
      accuracy,
      optionDistribution,
      wrongStudentDetails,
      correctStudentDetails
    };
  });

  const totalClassCount = classStudents.length;
  const submittedCount = submissions.length;
  const avgScore = submittedCount > 0 
    ? Math.round(submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submittedCount) 
    : 0;

  return {
    assignment,
    totalClassCount,
    submittedCount,
    unsubmittedCount: unsubmittedStudents.length,
    unsubmittedStudents,
    avgScore,
    submissions,
    questionDiagnostics,
    generatedAt: new Date().toISOString()
  };
}
