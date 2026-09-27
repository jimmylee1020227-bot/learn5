import { db } from '../src/services/firebase.js';
import { ref, get } from 'firebase/database';
import { 
  fetchAllCloudPracticeLogs,
  fetchAllCloudQuizPapers,
  fetchCloudAuditLogs,
  getUserPracticeHistory
} from '../src/services/cloudStorage.js';
import { fetchCloudLeaderboard } from '../src/services/leaderboardService.js';

async function run() {
  console.log('1. Loading data from cloud...');
  const userRegistry = (await get(ref(db, 'studyhub/user_registry'))).val() || {};
  const registeredStudents = Object.values(userRegistry);
  const allHistory = await fetchAllCloudPracticeLogs(true);
  const quizPapers = await fetchAllCloudQuizPapers();
  const players = (await get(ref(db, 'studyhub/leaderboard_players'))).val() || {};
  const auditLogs = await fetchCloudAuditLogs({ id: 'admin', role: 'admin' });
  const reports = (await get(ref(db, 'studyhub/question_reports'))).val() || [];
  
  console.log('2. Running studentAnalytics...');
  const isTestData = (n, e, u) => {
    n = (n || '').toLowerCase();
    e = (e || '').toLowerCase();
    u = (u || '').toLowerCase();
    return (
      n.includes('測試') || 
      n.includes('test') || 
      e.includes('test@') || 
      e.includes('example.com') ||
      u.startsWith('test_') ||
      u.includes('_test_') ||
      u === 'student_test_all_sync' ||
      u === 'test_student_fix_check' ||
      u === 'test_student_synctest' ||
      u === 'u_btnvoclzbcu'
    );
  };

  const studentMap = {};
  const conceptMap = {};

  (Array.isArray(registeredStudents) ? registeredStudents : []).forEach(st => {
    if (!st) return;
    let targetEmail = st.email || (st.id && userRegistry[st.id]?.email) || '';
    targetEmail = targetEmail.trim().toLowerCase();
    if (isTestData(st.name || st.displayName, targetEmail, st.id)) return;

    const key = st.id || (targetEmail && targetEmail !== 'test@example.com' ? `email_${targetEmail}` : (st.name || '匿名同學'));
    const sName = st.name || '匿名同學';
    studentMap[key] = {
      name: sName,
      displayName: st.displayName || sName,
      school: st.school || '會考戰友',
      total: 0,
      correct: 0,
      wrong: 0,
      userId: st.id,
      email: targetEmail,
      lastActive: st.lastActive || '',
      accuracy: 0,
      registryTotal: st.totalQuestions || 0,
      registryCorrect: st.totalCorrect || 0,
      registryWrong: Math.max(0, (st.totalQuestions || 0) - (st.totalCorrect || 0)),
      hasHistoryLogs: false
    };
  });

  (Array.isArray(allHistory) ? allHistory : []).forEach(log => {
    if (!log) return;
    const regEntry = (log.userId && userRegistry[log.userId]) || {};
    let targetEmail = regEntry.email || log.userEmail || '';
    targetEmail = targetEmail.trim().toLowerCase();
    const sName = log.userName || '匿名同學';
    if (isTestData(regEntry.name || sName, targetEmail, log.userId)) return;
    
    const key = log.userId || (targetEmail && targetEmail !== 'test@example.com' ? `email_${targetEmail}` : (log.userName || '匿名同學'));
    if (!studentMap[key]) {
      studentMap[key] = {
        name: regEntry.name || sName,
        displayName: regEntry.name || sName,
        school: log.userSchool || regEntry.school || '會考戰友',
        total: 0,
        correct: 0,
        wrong: 0,
        userId: log.userId,
        email: targetEmail,
        lastActive: log.timestamp || '',
        accuracy: 0,
        registryTotal: 0,
        registryCorrect: 0,
        registryWrong: 0,
        hasHistoryLogs: true
      };
    }
    
    if (targetEmail && !studentMap[key].email) studentMap[key].email = targetEmail;
    studentMap[key].hasHistoryLogs = true;
    studentMap[key].total += 1;
    if (log.isCorrect) {
      studentMap[key].correct += 1;
    } else {
      studentMap[key].wrong += 1;
    }
    if (log.timestamp && (!studentMap[key].lastActive || new Date(log.timestamp) > new Date(studentMap[key].lastActive))) {
      studentMap[key].lastActive = log.timestamp;
    }

    const tag = log.conceptTag || log.unitName || '基礎核心綜合';
    if (!conceptMap[tag]) {
      conceptMap[tag] = {
        tag,
        unitName: log.unitName || '',
        total: 0,
        correct: 0,
        wrong: 0
      };
    }
    conceptMap[tag].total += 1;
    if (log.isCorrect) {
      conceptMap[tag].correct += 1;
    } else {
      conceptMap[tag].wrong += 1;
    }
  });

  Object.values(studentMap).forEach(s => {
    if (!s.hasHistoryLogs && s.registryTotal > 0) {
      s.total = s.registryTotal;
      s.correct = s.registryCorrect;
      s.wrong = s.registryWrong;
    }
    if (s.total > 0) {
      s.accuracy = Math.round((s.correct / s.total) * 100);
    }
  });

  let studentsList = Object.values(studentMap);
  studentsList.sort((a, b) => new Date(a.lastActive || 0) - new Date(b.lastActive || 0));
  const nameMap = {};
  studentsList.forEach(s => {
    if (!s) return;
    const raw = (s.name || '會考戰友').trim();
    if (!nameMap[raw]) nameMap[raw] = [];
    nameMap[raw].push(s);
  });

  Object.entries(nameMap).forEach(([rawName, list]) => {
    if (!Array.isArray(list)) return;
    if (list.length > 1) {
      list.forEach((s, idx) => {
        if (s) s.displayName = `${rawName} (${s.school || '校區'} · #${idx + 1})`;
      });
    } else if (list.length === 1 && list[0]) {
      list[0].displayName = list[0].name;
    }
  });

  console.log('studentAnalytics done, studentsList count:', studentsList.length);

  console.log('3. Running filteredHistory...');
  const deferredStudentSearchKeyword = '';
  const deferredQuestionSearchKeyword = '';
  const selectedStudent = 'ALL';
  const selectedStudentId = null;
  const selectedStudentEmail = null;
  const onlyMistakes = false;

  const filteredHistory = (Array.isArray(allHistory) ? allHistory : []).filter(log => {
    if (!log) return false;
    if (onlyMistakes && log.isCorrect) return false;
    return true;
  });
  console.log('filteredHistory done, count:', filteredHistory.length);

  console.log('4. Running filteredQuizPapers...');
  const filteredQuizPapers = (Array.isArray(quizPapers) ? quizPapers : []).filter(paper => {
    if (!paper) return false;
    return true;
  });
  console.log('filteredQuizPapers done, count:', filteredQuizPapers.length);

  console.log('5. Running hourlyActivityStats...');
  const hours = Array(24).fill(0);
  (Array.isArray(allHistory) ? allHistory : []).forEach(log => {
    if (!log || !log.timestamp) return;
    try {
      const d = new Date(log.timestamp);
      const hr = d.getHours();
      if (hr >= 0 && hr < 24) hours[hr]++;
    } catch (e) {}
  });
  console.log('hourlyActivityStats done');

  console.log('6. Running accuracyDistribution...');
  const dist = [
    { range: '90-100%', count: 0, color: '#10b981' },
    { range: '80-89%', count: 0, color: '#3b82f6' },
    { range: '70-79%', count: 0, color: '#f59e0b' },
    { range: '60-69%', count: 0, color: '#ec4899' },
    { range: '0-59%', count: 0, color: '#ef4444' }
  ];
  studentsList.forEach(s => {
    if (!s || s.total === 0) return;
    const acc = s.accuracy || 0;
    if (acc >= 90) dist[0].count++;
    else if (acc >= 80) dist[1].count++;
    else if (acc >= 70) dist[2].count++;
    else if (acc >= 60) dist[3].count++;
    else dist[4].count++;
  });
  console.log('accuracyDistribution done');

  console.log('7. Running duplicateNameGroups...');
  const dupMap = {};
  studentsList.forEach(s => {
    if (!s) return;
    const raw = (s.name || '').trim();
    if (!raw) return;
    if (!dupMap[raw]) dupMap[raw] = [];
    dupMap[raw].push(s);
  });
  const duplicateNameGroups = Object.entries(dupMap)
    .filter(([_, list]) => list.length > 1)
    .map(([name, list]) => ({ name, count: list.length, students: list }));
  console.log('duplicateNameGroups done, count:', duplicateNameGroups.length);

  console.log('8. Checking studentAnalytics.studentsList render code...');
  studentsList.forEach(s => {
    const sName = (s.name || s.displayName || '').toLowerCase();
    const sSchool = (s.school || '').toLowerCase();
    const sEmail = (s.email || '').toLowerCase();
  });

  console.log('All calculations passed without error!');
}

run().catch(err => {
  console.error('CRASHED WITH ERROR:', err);
});
