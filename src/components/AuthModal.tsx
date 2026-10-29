/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Firebase Authentication & User Profile Dashboard (AuthModal & DashboardView)
 * Providing:
 * - Email / Password Sign In & Sign Up
 * - Firestore User Subscription Management (Free Plan 10 Questions vs Premium Unlimited)
 * - Quota Counter & Upgrade Modal
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, getUserSubscriptionProfile, upgradeUserToPremium, UserSubscriptionProfile } from '../services/firestoreService';
import {
  User as UserIcon,
  Mail,
  Lock,
  ShieldCheck,
  Zap,
  Crown,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  LogOut,
  X,
  CreditCard,
  UserPlus,
  LogIn,
  Check,
  ArrowRight,
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell 
} from 'recharts';
import { 
  AcademicNotification, 
  saveNotification, 
  getNotifications, 
  deleteNotification,
  VideoGenerationRecord,
  getVideoRecords,
  deleteVideoRecord
} from '../services/firestoreService';
import { Bell, Trash2, Plus, Calendar, Film } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onNotify,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'signup' && !displayName)) {
      onNotify('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName });
        onNotify(`مرحباً بك ${displayName}! تم إنشاء الحساب بنجاح وتفعيل الباقة المجانية (10 أسئلة)`, 'success');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onNotify('تم تسجيل الدخول بنجاح!', 'success');
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'فشل عملية المصادقة';
      if (err.code === 'auth/email-already-in-use') errorMsg = 'البريد الإلكتروني مستخدم بالفعل';
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') errorMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      else if (err.code === 'auth/weak-password') errorMsg = 'كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل)';
      else errorMsg = err.message || errorMsg;
      onNotify(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-right space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {mode === 'signup' ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {mode === 'signup' ? 'إنشاء حساب جديد في منصة A.W.H' : 'تسجيل الدخول إلى حسابك'}
            </h3>
            <p className="text-xs text-slate-400">
              {mode === 'signup' ? 'احصل على باقة مجانية مع رصيد 10 أسئلة ذكية فورية' : 'تابع استخدام المساعد الأكاديمي والتحليل الذكي'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">الاسم الكامل *</label>
              <div className="relative flex items-center">
                <UserIcon className="absolute right-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="مثال: محمد أحمد"
                  className="w-full pl-3 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">البريد الإلكتروني *</label>
            <div className="relative flex items-center">
              <Mail className="absolute right-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-3 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">كلمة المرور *</label>
            <div className="relative flex items-center">
              <Lock className="absolute right-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-950 transition active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>جاري المعالجة...</span>
              </>
            ) : (
              <span>{mode === 'signup' ? 'إنشاء الحساب المجاني' : 'تسجيل الدخول'}</span>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center text-xs">
          {mode === 'signup' ? (
            <p className="text-slate-400">
              لديك حساب بالفعل؟{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-cyan-400 font-bold hover:underline"
              >
                تسجيل الدخول
              </button>
            </p>
          ) : (
            <p className="text-slate-400">
              ليس لديك حساب بعد؟{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-cyan-400 font-bold hover:underline"
              >
                انشئ حساباً جديداً مجاناً
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface UserDashboardViewProps {
  user: User;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateHome: () => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  user,
  onNotify,
  onNavigateHome,
}) => {
  const [profile, setProfile] = useState<UserSubscriptionProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [notifications, setNotifications] = useState<AcademicNotification[]>([]);
  const [videoRecords, setVideoRecords] = useState<VideoGenerationRecord[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteMsg, setNewNoteMsg] = useState('');
  const [newNoteDate, setNewNoteDate] = useState('');

  useEffect(() => {
    loadNotifications();
    loadVideoRecords();
  }, [user]);

  const loadNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data || []);
  };

  const loadVideoRecords = async () => {
    const data = await getVideoRecords();
    setVideoRecords(data || []);
  };

  const handleAddNotification = async () => {
    if (!newNoteTitle || !newNoteMsg || !newNoteDate) return;
    await saveNotification({
      userId: user.uid,
      title: newNoteTitle,
      message: newNoteMsg,
      scheduledAt: newNoteDate,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    setNewNoteTitle('');
    setNewNoteMsg('');
    setNewNoteDate('');
    loadNotifications();
    onNotify('تمت إضافة التنبيه بنجاح', 'success');
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id);
    loadNotifications();
    onNotify('تم حذف التنبيه', 'info');
  };

  const handleDeleteVideo = async (id: string) => {
    await deleteVideoRecord(id);
    loadVideoRecords();
    onNotify('تم حذف الفيديو من السجل', 'info');
  };

  useEffect(() => {
    getUserSubscriptionProfile(user.uid, user.email || undefined, user.displayName || undefined)
      .then((p) => {
        setProfile(p);
      })
      .catch((e) => {
        console.error(e);
        onNotify('تعذر تحميل بيانات الملف الشخصي', 'error');
      })
      .finally(() => setLoading(false));
  }, [user, onNotify]);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const updated = await upgradeUserToPremium(user.uid);
      setProfile(updated);
      onNotify('🎉 مبروك! تم ترقية حسابك إلى الباقة المدفوعة (Premium) بنجاح وأصبح لديك وصول غير محدود!', 'success');
    } catch (err: any) {
      console.error(err);
      onNotify('حدث خطأ أثناء ترقية الحساب', 'error');
    } finally {
      setUpgrading(false);
    }
  };

  const handleSignOutUser = async () => {
    try {
      await signOut(auth);
      onNotify('تم تسجيل الخروج بنجاح', 'info');
      onNavigateHome();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">جاري تحميل لوحة التحكم وبروفايل المستخدم...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى المنصة التعليمية</span>
        </button>

        <button
          onClick={handleSignOutUser}
          className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>

      {/* User Profile Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center gap-6 text-right">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-cyan-950">
          {user.displayName ? user.displayName[0].toUpperCase() : (user.email?.[0].toUpperCase() || 'U')}
        </div>

        <div className="flex-1 space-y-1.5 text-center sm:text-right">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-white">{user.displayName || 'مستخدم منصة A.W.H'}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                profile?.plan !== 'Free'
                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                  : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
              }`}
            >
              {profile?.plan !== 'Free' ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <Zap className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{profile?.plan !== 'Free' ? `باقة ${profile?.plan}` : 'الباقة المجانية (Free Plan)'}</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs font-mono">{user.email}</p>
          <p className="text-[11px] text-slate-500">
            تاريخ الانضمام: {new Date(profile?.createdAt || Date.now()).toLocaleDateString('ar-EG')}
          </p>
        </div>
      </div>

      {/* Activity Chart Section */}
      <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">نشاط المستخدم عبر أقسام المنصة</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'التعليم', value: 40 },
              { name: 'التحليل', value: 30 },
              { name: 'التوليد', value: 20 },
              { name: 'البناء', value: 15 },
              { name: 'العلوم', value: 25 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {[40,30,20,15,25].map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#06b6d4' : '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Notification Management Section */}
      <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">إدارة التنبيهات المجدولة</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" placeholder="عنوان التنبيه" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} className="bg-slate-950 p-3 rounded-xl border border-slate-700 text-sm" />
          <input type="text" placeholder="نص الرسالة" value={newNoteMsg} onChange={(e) => setNewNoteMsg(e.target.value)} className="bg-slate-950 p-3 rounded-xl border border-slate-700 text-sm md:col-span-2" />
          <div className="flex gap-2">
            <input type="datetime-local" value={newNoteDate} onChange={(e) => setNewNoteDate(e.target.value)} className="bg-slate-950 p-3 rounded-xl border border-slate-700 text-sm flex-1" />
            <button onClick={handleAddNotification} className="bg-cyan-600 p-3 rounded-xl"><Plus className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          {notifications.map(n => (
            <div key={n.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <h4 className="font-bold">{n.title}</h4>
                <p className="text-sm text-slate-400">{n.message} - <span className="text-cyan-400">{new Date(n.scheduledAt).toLocaleString('ar-EG')}</span></p>
              </div>
              <button onClick={() => handleDeleteNotification(n.id)} className="text-rose-400"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Video Gallery Section */}
      <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Film className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">معرض الفيديوهات المولدة</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videoRecords.map(v => (
            <div key={v.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold">{v.title}</h4>
                <p className="text-xs text-slate-400 truncate max-w-xs">{v.prompt}</p>
                <p className="text-[10px] text-purple-400">{new Date(v.createdAt).toLocaleString('ar-EG')}</p>
              </div>
              <button onClick={() => handleDeleteVideo(v.id)} className="text-rose-400"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
      </div>


      {/* Quota & Subscription Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Remaining Questions Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>رصيد الأسئلة والاستفسارات الذكية</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {profile?.plan !== 'Free' ? 'غير محدود ♾️' : 'باقة مجانية'}
            </span>
          </div>

          <div className="py-2">
            {profile?.plan !== 'Free' ? (
              <div className="space-y-1">
                <span className="text-3xl font-black text-purple-300 font-mono">غير محدود</span>
                <p className="text-xs text-slate-400">يمكنك سؤال المساعد والتحليل بلا أي حدود أو قيود يومية.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white font-mono">{profile?.remainingQuestions ?? 10}</span>
                  <span className="text-xs text-slate-400 font-medium">متبقي من أصل 10 أسئلة</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      (profile?.remainingQuestions ?? 10) <= 2 ? 'bg-rose-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, ((profile?.remainingQuestions ?? 10) / 10) * 100))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {(profile?.remainingQuestions ?? 10) <= 0
                    ? '⚠️ لقد استنفذت رصيدك المجاني! يرجى الترقية للمتابعة.'
                    : 'يتم خصم سؤال واحد بعد كل استفسار ناجح للمساعد الذكي.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upgrade / Plan Management Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-cyan-500/30 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">الباقة المدفوعة الشاملة (Premium)</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              احصل على وصول غير محدود لجميع نماذج Gemini وتوليد الصور والعلوم الحيوية وبدون قيود على عدد الأسئلة.
            </p>
          </div>

          {profile?.plan !== 'Free' ? (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>أنت مشترك في الباقة المدفوعة الفاخرة!</span>
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
            >
              {upgrading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>جاري ترقية الحساب...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>ترقية الحساب الآن (فعل الباقة غير المحدودة)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
