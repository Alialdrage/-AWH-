import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  limit,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);
export const auth = getAuth(app);

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return true;
  }
}

export interface AcademicRecord {
  id: string;
  userId: string;
  stage: 'primary' | 'intermediate' | 'preparatory' | 'assistant';
  grade?: string;
  title: string;
  subject: string;
  mode: string;
  content: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface QuizScoreRecord {
  id: string;
  userId: string;
  stage: 'primary' | 'intermediate' | 'preparatory' | 'assistant';
  quizTitle: string;
  score: number;
  total: number;
  percentage: number;
  createdAt: string;
}

export interface StudyScheduleRecord {
  id: string;
  userId: string;
  stage: 'primary' | 'intermediate' | 'preparatory' | 'assistant';
  title: string;
  hoursPerDay: number;
  scheduleData: string;
  createdAt: string;
}

export interface AcademicComment {
  id: string;
  userId: string;
  userName: string;
  stage: string;
  grade: string;
  subject: string;
  topic: string;
  commentText: string;
  createdAt: string;
}

export async function saveAcademicRecord(record: Omit<AcademicRecord, 'id'>): Promise<string> {
  const recordId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `academic_records/${recordId}`;
  try {
    await setDoc(doc(db, 'academic_records', recordId), {
      ...record,
      userId: auth.currentUser?.uid || record.userId,
    });
    return recordId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getAcademicRecords(stage?: string): Promise<AcademicRecord[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const path = 'academic_records';
  try {
    const q = query(collection(db, path), where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    const results: AcademicRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!stage || data.stage === stage) {
        results.push({
          id: docSnap.id,
          userId: data.userId,
          stage: data.stage,
          grade: data.grade,
          title: data.title,
          subject: data.subject,
          mode: data.mode,
          content: data.content,
          createdAt: data.createdAt,
          metadata: data.metadata,
        });
      }
    });
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return results;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function deleteAcademicRecord(recordId: string): Promise<void> {
  const path = `academic_records/${recordId}`;
  try {
    await deleteDoc(doc(db, 'academic_records', recordId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveQuizScore(quizScore: Omit<QuizScoreRecord, 'id'>): Promise<string> {
  const scoreId = `qs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `quiz_scores/${scoreId}`;
  try {
    await setDoc(doc(db, 'quiz_scores', scoreId), {
      ...quizScore,
      userId: auth.currentUser?.uid || quizScore.userId,
    });
    return scoreId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getQuizScores(): Promise<QuizScoreRecord[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const path = 'quiz_scores';
  try {
    const q = query(collection(db, path), where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    const list: QuizScoreRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        userId: data.userId,
        stage: data.stage,
        quizTitle: data.quizTitle,
        score: data.score,
        total: data.total,
        percentage: data.percentage,
        createdAt: data.createdAt,
      });
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveStudySchedule(schedule: Omit<StudyScheduleRecord, 'id'>): Promise<string> {
  const schedId = `sched_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `study_schedules/${schedId}`;
  try {
    await setDoc(doc(db, 'study_schedules', schedId), {
      ...schedule,
      userId: auth.currentUser?.uid || schedule.userId,
    });
    return schedId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getStudySchedules(): Promise<StudyScheduleRecord[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const path = 'study_schedules';
  try {
    const q = query(collection(db, path), where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    const list: StudyScheduleRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        userId: data.userId,
        stage: data.stage,
        title: data.title,
        hoursPerDay: data.hoursPerDay,
        scheduleData: data.scheduleData,
        createdAt: data.createdAt,
      });
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveAcademicComment(comment: Omit<AcademicComment, 'id'>): Promise<string> {
  const commentId = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `academic_comments/${commentId}`;
  try {
    await setDoc(doc(db, 'academic_comments', commentId), {
      ...comment,
      userId: auth.currentUser?.uid || comment.userId,
      userName: auth.currentUser?.displayName || comment.userName || 'طالب منصة A.W.H',
    });
    return commentId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getAcademicComments(gradeFilter?: string): Promise<AcademicComment[]> {
  const path = 'academic_comments';
  try {
    const q = query(collection(db, path), limit(40));
    const snapshot = await getDocs(q);
    const list: AcademicComment[] = [];

    if (snapshot.empty) {
      // Seed initial sample comments
      const sampleComments = [
        {
          userId: 'seed_user_1',
          userName: 'سارة محمد (طالبة سادس علمي)',
          stage: 'preparatory',
          grade: 'السادس العلمي (البكالوريا الوزاري)',
          subject: 'الرياضيات التخصصية',
          topic: 'مبرهنة دي موافر والنتيجة',
          commentText: 'مرحباً أستاذ، هل يمكن توضيح متى نستخدم صيغة ديموافر في إيجاد الجذور التربيعية للعدد المركب؟ شكراً للمنصة الرائعة!',
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
        {
          userId: 'seed_user_2',
          userName: 'علي حسين (طالب ثالث متوسط)',
          stage: 'intermediate',
          grade: 'الصف الثالث المتوسط',
          subject: 'الفيزياء الوزارية',
          topic: 'قانون أوم وربط المقاومات',
          commentText: 'الشرح في قسم الفيزياء مبسط جداً وساعدني أفهم ربط التوالي والتوازي بسرعة. جزاكم الله خيراً.',
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
        {
          userId: 'seed_user_3',
          userName: 'زينب أحمد (طالبة خامس ابتدائي)',
          stage: 'primary',
          grade: 'الصف الخامس الابتدائي',
          subject: 'قواعد اللغة العربية',
          topic: 'الفاعل والمفعول به',
          commentText: 'التمارين التفاعلية في قواعد اللغة العربية ممتعة جداً ومفيدة للامتحانات الشهرية.',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
      ];

      for (const sample of sampleComments) {
        const commentId = `seed_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await setDoc(doc(db, 'academic_comments', commentId), sample);
        list.push({ id: commentId, ...sample });
      }
    } else {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (!gradeFilter || data.grade === gradeFilter) {
          list.push({
            id: docSnap.id,
            userId: data.userId,
            userName: data.userName,
            stage: data.stage,
            grade: data.grade,
            subject: data.subject,
            topic: data.topic,
            commentText: data.commentText,
            createdAt: data.createdAt,
          });
        }
      });
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function deleteAcademicComment(commentId: string): Promise<void> {
  const path = `academic_comments/${commentId}`;
  try {
    await deleteDoc(doc(db, 'academic_comments', commentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==========================================
// Notifications
// ==========================================

export interface AcademicNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  scheduledAt: string;
  isRead: boolean;
  createdAt: string;
}

export async function saveNotification(notification: Omit<AcademicNotification, 'id'>): Promise<string> {
  const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `academic_notifications/${noteId}`;
  try {
    await setDoc(doc(db, 'academic_notifications', noteId), {
      ...notification,
      userId: auth.currentUser?.uid || notification.userId,
    });
    return noteId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getNotifications(): Promise<AcademicNotification[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const path = 'academic_notifications';
  try {
    const q = query(collection(db, path), where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    const list: AcademicNotification[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        userId: data.userId,
        title: data.title,
        message: data.message,
        scheduledAt: data.scheduledAt,
        isRead: data.isRead,
        createdAt: data.createdAt,
      });
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function deleteNotification(noteId: string): Promise<void> {
  const path = `academic_notifications/${noteId}`;
  try {
    await deleteDoc(doc(db, 'academic_notifications', noteId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==========================================
// User Subscription & AI Usage Quota Management
// ==========================================

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'Admin' | 'Teacher' | 'Student';
  plan: 'Free' | 'Smart' | 'VIP';
  remainingQuestions: number;
  totalQuestionsAsked: number;
  createdAt: string;
  updatedAt: string;
}

export type UserSubscriptionProfile = UserProfile; // Backward compatibility

/**
 * Get or initialize user profile in Firestore
 */
export async function getUserProfile(uid: string, email?: string, displayName?: string): Promise<UserProfile> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDocFromServer(docRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: data.uid || uid,
        email: data.email || email || '',
        displayName: data.displayName || displayName || 'مستخدم المنصة',
        role: data.role || 'Student',
        plan: data.plan || 'Free',
        remainingQuestions: typeof data.remainingQuestions === 'number' ? data.remainingQuestions : 10,
        totalQuestionsAsked: data.totalQuestionsAsked || 0,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    } else {
      // Create initial free profile
      const newProfile: UserProfile = {
        uid,
        email: email || auth.currentUser?.email || '',
        displayName: displayName || auth.currentUser?.displayName || 'طالب منصة A.W.H',
        role: 'Student',
        plan: 'Free',
        remainingQuestions: 10,
        totalQuestionsAsked: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, newProfile);
      return newProfile;
    }
  } catch (err) {
    console.warn('Fallback profile due to offline or rules:', err);
    return {
      uid,
      email: email || auth.currentUser?.email || '',
      displayName: displayName || auth.currentUser?.displayName || 'مستخدم المنصة',
      role: 'Student',
      plan: 'Free',
      remainingQuestions: 10,
      totalQuestionsAsked: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const getUserSubscriptionProfile = getUserProfile; // Backward compatibility

/**
 * Consume one question credit for free users. Returns updated profile or throws if limit reached.
 */
export async function consumeAiQuestionCredit(uid: string): Promise<{ allowed: boolean; profile: UserProfile; message?: string }> {
  const profile = await getUserProfile(uid);

  if (profile.plan !== 'Free') {
    // Premium (Smart/VIP) is unlimited
    profile.totalQuestionsAsked += 1;
    await setDoc(doc(db, 'users', uid), {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { allowed: true, profile };
  }

  // Free plan check
  if (profile.remainingQuestions <= 0) {
    return {
      allowed: false,
      profile,
      message: 'لقد استنفذت رصيدك المجاني (10 أسئلة). يرجى الترقية إلى الباقة المدفوعة للاستمرار بلا حدود!',
    };
  }

  profile.remainingQuestions -= 1;
  profile.totalQuestionsAsked += 1;

  await setDoc(doc(db, 'users', uid), {
    ...profile,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return { allowed: true, profile };
}

/**
 * Upgrade user to Premium plan (Smart) in Firestore
 */
export async function upgradeUserToPremium(uid: string): Promise<UserProfile> {
  const profile = await getUserProfile(uid);
  profile.plan = 'Smart';
  profile.remainingQuestions = 999999; // Unlimited

  await setDoc(doc(db, 'users', uid), {
    ...profile,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return profile;
}

/**
 * Admin: Get all users from Firestore
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const snapshot = await getDocs(collection(db, path));
    const users: UserProfile[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      users.push({
        uid: d.id,
        email: data.email || '',
        displayName: data.displayName || '',
        role: data.role || 'Student',
        plan: data.plan || 'Free',
        remainingQuestions: data.remainingQuestions || 0,
        totalQuestionsAsked: data.totalQuestionsAsked || 0,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
      });
    });
    return users;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * Admin: Update user role or plan
 */
export async function adminUpdateUser(uid: string, updates: Partial<Pick<UserProfile, 'role' | 'plan'>>): Promise<void> {
  const path = `users/${uid}`;
  try {
    await setDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// ==========================================
// Video Generation Persistence
// ==========================================

export interface VideoGenerationRecord {
  id: string;
  userId: string;
  title: string;
  summary: string;
  prompt: string;
  videoData: any;
  createdAt: string;
}

export async function saveVideoRecord(record: Omit<VideoGenerationRecord, 'id'>): Promise<string> {
  const videoId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `video_records/${videoId}`;
  try {
    await setDoc(doc(db, 'video_records', videoId), {
      ...record,
      userId: auth.currentUser?.uid || record.userId,
    });
    return videoId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getVideoRecords(): Promise<VideoGenerationRecord[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const path = 'video_records';
  try {
    const q = query(collection(db, path), where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    const list: VideoGenerationRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        userId: data.userId,
        title: data.title,
        summary: data.summary,
        prompt: data.prompt,
        videoData: data.videoData,
        createdAt: data.createdAt,
      });
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function deleteVideoRecord(videoId: string): Promise<void> {
  const path = `video_records/${videoId}`;
  try {
    await deleteDoc(doc(db, 'video_records', videoId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==========================================
// Live Tutor Questions & Real-time Chat Sync
// ==========================================

export interface LiveTutorQuestion {
  id: string;
  tutorId: string;
  studentName: string;
  userId?: string;
  text: string;
  status: 'pending' | 'pinned' | 'answered' | 'dismissed';
  isHandRaise?: boolean;
  createdAt: string;
  answerText?: string;
  answeredAt?: string;
}

export async function sendLiveTutorQuestion(
  qData: Omit<LiveTutorQuestion, 'id'>
): Promise<string> {
  const path = 'live_tutor_questions';
  const newId = `Q-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  try {
    await setDoc(doc(db, path, newId), {
      tutorId: qData.tutorId,
      studentName: qData.studentName,
      userId: qData.userId || auth.currentUser?.uid || 'guest_student',
      text: qData.text,
      status: qData.status || 'pending',
      isHandRaise: !!qData.isHandRaise,
      createdAt: qData.createdAt || new Date().toISOString(),
      answerText: qData.answerText || '',
    });
    return newId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${path}/${newId}`);
  }
}

export function subscribeLiveTutorQuestions(
  tutorId: string,
  onUpdate: (questions: LiveTutorQuestion[]) => void
): () => void {
  const path = 'live_tutor_questions';
  try {
    const q = query(
      collection(db, path),
      where('tutorId', '==', tutorId),
      limit(50)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const questions: LiveTutorQuestion[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          questions.push({
            id: docSnap.id,
            tutorId: d.tutorId,
            studentName: d.studentName,
            userId: d.userId,
            text: d.text,
            status: d.status || 'pending',
            isHandRaise: !!d.isHandRaise,
            createdAt: d.createdAt,
            answerText: d.answerText,
            answeredAt: d.answeredAt,
          });
        });
        questions.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        onUpdate(questions);
      },
      (error) => {
        console.warn('Realtime live questions listener note:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Realtime live questions subscribe error:', err);
    return () => {};
  }
}

export async function updateLiveTutorQuestionStatus(
  questionId: string,
  status: 'pending' | 'pinned' | 'answered' | 'dismissed',
  answerText?: string
): Promise<void> {
  const path = `live_tutor_questions/${questionId}`;
  try {
    const updatePayload: any = { status };
    if (answerText !== undefined) {
      updatePayload.answerText = answerText;
      updatePayload.answeredAt = new Date().toISOString();
    }
    await setDoc(doc(db, 'live_tutor_questions', questionId), updatePayload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// ---------------------------------------------------------------------------
// Physics Challenge Leaderboard (لوحة متصدرين تحدي الفيزياء)
// ---------------------------------------------------------------------------

export interface PhysicsLeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  levelId: number;
  levelName: string;
  timeSeconds: number;
  movesCount?: number;
  stars?: number;
  solvedAt?: string;
  createdAt: string;
}

export async function savePhysicsLeaderboardScore(
  entry: Omit<PhysicsLeaderboardEntry, 'id'>
): Promise<string> {
  const path = 'physics_leaderboard';
  const cleanId = `phy_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  try {
    const payload = {
      userId: entry.userId || auth.currentUser?.uid || 'guest_player',
      userName: entry.userName || auth.currentUser?.displayName || 'متحدي الفيزياء',
      levelId: Number(entry.levelId) || 1,
      levelName: String(entry.levelName || 'المستوى 1'),
      timeSeconds: Number(entry.timeSeconds.toFixed(2)),
      movesCount: Number(entry.movesCount || 1),
      stars: Number(entry.stars || 3),
      solvedAt: entry.solvedAt || new Date().toISOString(),
      createdAt: entry.createdAt || new Date().toISOString(),
    };

    await setDoc(doc(db, path, cleanId), payload);
    return cleanId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${path}/${cleanId}`);
  }
}

export async function getPhysicsLeaderboard(
  levelId?: number,
  maxCount = 50
): Promise<PhysicsLeaderboardEntry[]> {
  const path = 'physics_leaderboard';
  try {
    const baseCol = collection(db, path);
    const q = levelId
      ? query(baseCol, where('levelId', '==', levelId), limit(maxCount))
      : query(baseCol, limit(maxCount));

    const snap = await getDocs(q);
    const results: PhysicsLeaderboardEntry[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      results.push({
        id: docSnap.id,
        userId: d.userId,
        userName: d.userName,
        levelId: d.levelId,
        levelName: d.levelName,
        timeSeconds: Number(d.timeSeconds || 0),
        movesCount: d.movesCount,
        stars: d.stars,
        solvedAt: d.solvedAt,
        createdAt: d.createdAt,
      });
    });

    // Sort by fastest solving time (timeSeconds ascending)
    return results.sort((a, b) => a.timeSeconds - b.timeSeconds);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export function subscribePhysicsLeaderboard(
  levelId: number | undefined,
  onUpdate: (entries: PhysicsLeaderboardEntry[]) => void
): () => void {
  const path = 'physics_leaderboard';
  try {
    const baseCol = collection(db, path);
    const q = levelId
      ? query(baseCol, where('levelId', '==', levelId), limit(50))
      : query(baseCol, limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results: PhysicsLeaderboardEntry[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          results.push({
            id: docSnap.id,
            userId: d.userId,
            userName: d.userName,
            levelId: d.levelId,
            levelName: d.levelName,
            timeSeconds: Number(d.timeSeconds || 0),
            movesCount: d.movesCount,
            stars: d.stars,
            solvedAt: d.solvedAt,
            createdAt: d.createdAt,
          });
        });
        results.sort((a, b) => a.timeSeconds - b.timeSeconds);
        onUpdate(results);
      },
      (error) => {
        console.warn('Physics leaderboard snapshot note:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Physics leaderboard subscribe error:', err);
    return () => {};
  }
}


