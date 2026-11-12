/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { User } from 'firebase/auth';
import {
  Search,
  Image as ImageIcon,
  Hammer,
  Dna,
  MessageSquare,
  Cloud,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  ExternalLink,
  Globe,
  Copy,
  Check,
  GraduationCap,
  Bot,
  Database,
  Radio,
  Megaphone,
  Crown,
  Cpu,
  Video,
  Palette,
  Shield,
  BookOpen,
  Gamepad2,
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
} from './services/googleDriveService';
import { testConnection } from './services/firestoreService';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { ConfirmationModal } from './components/ConfirmationModal';
import { MainPage } from './components/MainPage';
import { SplashPage } from './components/SplashPage';
import { KnowledgeSectionView } from './components/KnowledgeSectionView';
import { universityCurriculum, gameIndustryCurriculum } from './services/knowledgeSections';
import { AuthModal, UserDashboardView } from './components/AuthModal';
import { GlobalQuickSearchBar } from './components/GlobalQuickSearchBar';
import { auth } from './services/firestoreService';
import { onAuthStateChanged } from 'firebase/auth';
import { SubscriptionsModal } from './components/SubscriptionsModal';
import { DatabaseExplorerModal } from './components/DatabaseExplorerModal';

// Heavy views are loaded on demand to keep the initial bundle small.
const AnalysisView = lazy(() =>
  import('./components/AnalysisView').then((m) => ({ default: m.AnalysisView }))
);
const GenerationView = lazy(() =>
  import('./components/GenerationView').then((m) => ({ default: m.GenerationView }))
);
const BuilderView = lazy(() =>
  import('./components/BuilderView').then((m) => ({ default: m.BuilderView }))
);
const BioscienceView = lazy(() =>
  import('./components/BioscienceView').then((m) => ({ default: m.BioscienceView }))
);
const AcademicEducationView = lazy(() =>
  import('./components/AcademicEducationView').then((m) => ({ default: m.AcademicEducationView }))
);
const ChatbotView = lazy(() =>
  import('./components/ChatbotView').then((m) => ({ default: m.ChatbotView }))
);
const DriveHubView = lazy(() =>
  import('./components/DriveHubView').then((m) => ({ default: m.DriveHubView }))
);
const PrivateTutorLiveView = lazy(() =>
  import('./components/PrivateTutorLiveView').then((m) => ({ default: m.PrivateTutorLiveView }))
);
const AdsView = lazy(() =>
  import('./components/AdsView').then((m) => ({ default: m.AdsView }))
);
const LessonsBroadcastView = lazy(() =>
  import('./components/LessonsBroadcastView').then((m) => ({ default: m.LessonsBroadcastView }))
);
const GameView = lazy(() =>
  import('./game/GameView').then((m) => ({ default: m.GameView }))
);
const GraphicsEnginesStudio = lazy(() =>
  import('./components/GraphicsEnginesStudio').then((m) => ({ default: m.GraphicsEnginesStudio }))
);
const AdminLogin = lazy(() =>
  import('./components/AdminLogin').then((m) => ({ default: m.AdminLogin }))
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

type ActiveTab =
  | 'analysis' | 'generation' | 'builder' | 'bioscience' | 'academic' | 'chat' | 'drive' | 'ads' | 'private_tutor' | 'live' | 'dashboard' | 'game' | 'main' | 'lessons_broadcast' | 'graphics' | 'admin_login' | 'admin_dashboard' | 'university' | 'game_industry';

// Map a URL path to the view it should show, so a reload or back/forward
// keeps the user on the same page instead of falling back to 'main'.
const tabFromPath = (path: string): ActiveTab => {
  if (path === '/ads') return 'ads';
  if (path === '/private-tutor' || path === '/live') return 'private_tutor';
  return 'main';
};

const STARTED_KEY = 'awh_started';

export default function App() {
  // Remember that the splash screen was passed, so a page reload does not
  // send the user back to the start screen.
  const [hasStarted, setHasStarted] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STARTED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>(() =>
    tabFromPath(window.location.pathname)
  );

  useEffect(() => {
    if (!hasStarted) return;
    try {
      sessionStorage.setItem(STARTED_KEY, '1');
    } catch {
      /* storage unavailable: fall back to the splash screen on reload */
    }
  }, [hasStarted]);

  // Keep the view in sync with browser back/forward navigation.
  useEffect(() => {
    const onPopState = () => setActiveTab(tabFromPath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Auth & Drive State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(true);

  // Notification Toast State
  const [notification, setNotification] = useState<{
    msg: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Link & Google Publishing Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // Confirmation Modal State (MANDATORY for destructive / mutating Drive actions)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemDetails?: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });

  // Firebase Auth & Modal State
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isNightMode, setIsNightMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);
  const [isDatabaseExplorerOpen, setIsDatabaseExplorerOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);


  // Initialize Auth listener & validate Firestore connection on mount
  useEffect(() => {
    // Night Mode Check (7 PM to 7 AM)
    const checkNight = () => {
      const hour = new Date().getHours();
      setIsNightMode(hour >= 19 || hour < 7);
    };
    checkNight();
    const interval = setInterval(checkNight, 60000);
    
    testConnection().then((connected) => {
      setIsFirestoreConnected(connected);
    });

    const unsubscribeDrive = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );

    const unsubscribeFirebase = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
    });

    return () => {
      if (unsubscribeDrive) unsubscribeDrive();
      if (unsubscribeFirebase) unsubscribeFirebase();
      clearInterval(interval);
    };
  }, []);

  const navigateToTab = (tab: typeof activeTab) => {
    if (tab === 'private_tutor' || (tab as any) === 'live') {
      setActiveTab('private_tutor');
      window.history.pushState({}, '', '/private-tutor');
      return;
    }
    setActiveTab(tab);
    if (tab === 'ads') {
      window.history.pushState({}, '', '/ads');
    } else {
      if (window.location.pathname === '/ads' || window.location.pathname === '/live' || window.location.pathname === '/private-tutor') {
        window.history.pushState({}, '', '/');
      }
    }
  };

  const showNotification = (
    msg: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.msg === msg ? null : prev));
    }, 4500);
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        showNotification(
          `تم تسجيل الدخول بنجاح! مرحباً ${res.user.displayName || 'بك'}`,
          'success'
        );
      }
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'تعذر تسجيل الدخول مع Google', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      setUser(null);
      setToken(null);
      showNotification('تم تسجيل الخروج بنجاح', 'info');
    } catch (err: any) {
      console.error(err);
      showNotification('حدث خطأ أثناء تسجيل الخروج', 'error');
    }
  };

  const triggerDriveConfirmation = ({
    title,
    message,
    itemDetails,
    confirmLabel = 'موافق ومتابعة',
    isDestructive = false,
    onConfirm,
  }: {
    title: string;
    message: string;
    itemDetails?: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void>;
  }) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      itemDetails,
      confirmLabel,
      isDestructive,
      onConfirm,
    });
  };

  const handleModalConfirm = async () => {
    const action = confirmationModal.onConfirm;
    setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
    try {
      await action();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'فشلت العملية السحابية', 'error');
    }
  };

  const handleSystemClean = async () => {
    try {
      // 1. Reset browser speech synthesis if running
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      // 2. Clear temporary session storage
      try {
        sessionStorage.clear();
      } catch (e) {
        console.warn('Session clean note:', e);
      }

      // 3. Clear temporary local storage keys
      try {
        const toDelete: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('temp_') || k.startsWith('awh_temp_') || k.startsWith('cache_'))) {
            toDelete.push(k);
          }
        }
        toDelete.forEach((k) => localStorage.removeItem(k));
      } catch (e) {
        console.warn('Local cache clean note:', e);
      }

      // 4. Clean server cache
      try {
        await fetch('/api/system/clean', { method: 'POST' });
      } catch (e) {
        console.warn('Server cache clean note:', e);
      }

      showNotification('تم تنظيف الذاكرة المؤقتة والكاش بنجاح! المنصة تعمل الآن بأعلى كفاءة وسرعة.', 'success');
    } catch (err: any) {
      console.error(err);
      showNotification('حدث خطأ أثناء تنظيف الذاكرة', 'error');
    }
  };

  // Render Start / Splash Screen first if user hasn't entered platform yet
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        <SplashPage
          onStart={(tab) => {
            setHasStarted(true);
            if (tab) navigateToTab(tab as any);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center p-10 text-sm text-slate-400">جارٍ التحميل...</div>}>
      {/* Global Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 shadow-lg shadow-cyan-900/30 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 text-sm tracking-widest font-mono">
                  AWH
                </span>
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>منصة A.W.H</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    AI 2026
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                التحليل • التوليد • البناء (Analysis • Writing & Gen • Harnessing)
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
            {[
              { id: 'main', label: 'الرئيسية', icon: Bot },
              { id: 'private_tutor', label: 'المدرس الخصوصي (بث مباشر)', icon: Video, highlight: true },
              { id: 'academic', label: 'التعليم الأكاديمي', icon: GraduationCap },
              { id: 'university', label: 'الجامعي والدراسات العليا', icon: BookOpen },
              { id: 'game_industry', label: 'صناعة الألعاب والمحتوى', icon: Gamepad2 },
              { id: 'lessons_broadcast', label: 'بث الدروس', icon: Radio },
              { id: 'graphics', label: 'محركات التصميم والجرافيكس', icon: Palette },
              { id: 'ads', label: 'أعلن معنا', icon: Megaphone },
              { id: 'analysis', label: 'التحليل الذكي', icon: Search },
              { id: 'generation', label: 'استوديو الصور (4K)', icon: ImageIcon },
              { id: 'builder', label: 'مختبر البناء', icon: Hammer },
              { id: 'bioscience', label: 'العلوم الحيوية (3D)', icon: Dna },
              { id: 'chat', label: 'المساعد الذكي', icon: MessageSquare },
              { id: 'drive', label: 'Google Drive', icon: Cloud },
              { id: 'game', label: 'تحدي الفيزياء', icon: Cpu },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id || (tab.id === 'private_tutor' && activeTab === 'live');
              const isTutorLive = tab.id === 'private_tutor';
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateToTab(tab.id as any)}
                  title={tab.label}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] ${
                    isActive
                      ? isTutorLive
                        ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-black shadow-md shadow-red-950/40 ring-1 ring-white/20'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md shadow-cyan-950/40'
                      : isTutorLive
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-950/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isTutorLive ? 'animate-pulse text-red-400' : ''}`} />
                  <span>{tab.label}</span>
                  {isTutorLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping mr-0.5" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header: Firestore DB Badge + Avatar Return + Link & Google Publishing + Google Sign-In */}
          <div className="flex items-center gap-2">
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border ${
                isFirestoreConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
              title="حالة قاعدة البيانات السحابية الحقيقية (Cloud Firestore)"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>قاعدة البيانات: متصلة</span>
            </div>

            <button
              onClick={() => setIsDatabaseExplorerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-500/30 text-xs font-semibold transition active:scale-95 shadow-sm"
              title="إدارة وعرض قواعد البيانات المتوفرة"
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">قواعد البيانات</span>
            </button>

            <button
              onClick={() => setIsSubscriptionsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition active:scale-95 shadow-sm"
              title="الدخول المجاني والباقات والاشتراكات"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">الاشتراكات والدخول المجاني</span>
              <span className="sm:hidden">الاشتراكات</span>
            </button>

            <button
              onClick={() => navigateToTab('main')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95 shadow-sm"
              title="العودة إلى الصفحة الرئيسية"
            >
              <span>الرئيسية</span>
            </button>

            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition active:scale-95 shadow-sm"
              title="رابط المنصة والنشر على محرك بحث Google"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">ركس.كود (الرابط)</span>
              <span className="sm:hidden">الرابط</span>
            </button>

            <button
              onClick={handleSystemClean}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-semibold transition active:scale-95 shadow-sm"
              title="تنظيف وتفريغ الذاكرة المؤقتة والكاش"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">تنظيف</span>
            </button>

            <GoogleSignInButton
              user={user}
              isLoading={isLoggingIn}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
            />

            {/* Firebase Auth & Dashboard Button */}
            {firebaseUser ? (
              <button
                onClick={() => navigateToTab('dashboard' as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-purple-300 border-purple-500/30'
                }`}
                title="لوحة تحكم المستخدم وبروفايل الباقة"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">حسابي (بروفايل)</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setAuthModalMode('signin');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition"
                >
                  دخول
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('signup');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md"
                >
                  حساب جديد
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Quick Search Bar with Real-time Filtering */}
        <div className="border-t border-slate-800/80 bg-slate-950/75 py-2 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="w-full sm:max-w-xl">
              <GlobalQuickSearchBar
                onNavigateToTab={(tabId, extra) => {
                  navigateToTab(tabId as any);
                  if (extra?.topic) {
                    showNotification(`تم الانتقال إلى "${extra.topic}"`, 'info');
                  }
                }}
              />
            </div>
            <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>بحث سريع فوري</span>
              </span>
              <span>•</span>
              <span>تصفية لحظية للدروس والمناهج وأقسام المنصة</span>
            </div>
          </div>
        </div>

        {/* Mobile / Compact Tab Navigation */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 text-xs">
          {[
            { id: 'private_tutor', label: 'مدرس خصوصي LIVE', icon: Video },
            { id: 'academic', label: 'التعليم', icon: GraduationCap },
            { id: 'university', label: 'الجامعي', icon: BookOpen },
            { id: 'game_industry', label: 'الألعاب', icon: Gamepad2 },
            { id: 'lessons_broadcast', label: 'بث الدروس', icon: Radio },
            { id: 'graphics', label: 'محركات التصميم', icon: Palette },
            { id: 'ads', label: 'إعلانات', icon: Megaphone },
            { id: 'analysis', label: 'التحليل', icon: Search },
            { id: 'generation', label: 'الصور (4K)', icon: ImageIcon },
            { id: 'builder', label: 'البناء', icon: Hammer },
            { id: 'bioscience', label: 'العلوم الحيوية', icon: Dna },
            { id: 'chat', label: 'المساعد', icon: MessageSquare },
            { id: 'drive', label: 'Drive', icon: Cloud },
            { id: 'game', label: 'تحدي', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'private_tutor' && activeTab === 'live');
            const isTutorLive = tab.id === 'private_tutor';
            return (
              <button
                key={tab.id}
                onClick={() => navigateToTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition flex-shrink-0 ${
                  isActive
                    ? isTutorLive
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold'
                      : 'bg-cyan-600 text-white font-bold'
                    : isTutorLive
                    ? 'text-red-400 hover:text-red-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3 h-3 ${isTutorLive ? 'animate-pulse text-red-400' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {(activeTab === 'private_tutor' || (activeTab as any) === 'live') && (
          <PrivateTutorLiveView
            onNotify={showNotification}
            onRequestDriveConfirmation={triggerDriveConfirmation}
            isDriveConnected={!!token}
            onNavigateHome={() => navigateToTab('academic')}
            onOpenSubscriptions={() => setIsSubscriptionsOpen(true)}
            onNavigateToBroadcast={() => navigateToTab('lessons_broadcast')}
          />
        )}

        {activeTab === 'ads' && (
          <AdsView
            onNotify={showNotification}
            onNavigateHome={() => navigateToTab('academic')}
          />
        )}

        {activeTab === 'analysis' && (
          <AnalysisView
            onNotify={showNotification}
            onRequestDriveConfirmation={triggerDriveConfirmation}
            isDriveConnected={!!user}
            onNavigateHome={() => navigateToTab('main')}
          />
        )}

        {activeTab === 'generation' && (
          <GenerationView
            onNotify={showNotification}
            onRequestDriveConfirmation={triggerDriveConfirmation}
            isDriveConnected={!!user}
            onNavigateHome={() => navigateToTab('main')}
          />
        )}

        {activeTab === 'builder' && (
          <BuilderView
            onNotify={showNotification}
            onRequestDriveConfirmation={triggerDriveConfirmation}
            isDriveConnected={!!user}
            onNavigateHome={() => navigateToTab('main')}
          />
        )}

        {activeTab === 'bioscience' && (
          <BioscienceView
            onNotify={showNotification}
            onRequestDriveConfirmation={triggerDriveConfirmation}
            isDriveConnected={!!user}
            onNavigateHome={() => navigateToTab('main')}
          />
        )}

        {activeTab === 'academic' && (
          <AcademicEducationView
            onNotify={showNotification}
            onRequestDriveConfirmation={triggerDriveConfirmation}
            isDriveConnected={!!user}
            onNavigateHome={() => navigateToTab('main')}
            onNavigateToBroadcast={() => navigateToTab('lessons_broadcast')}
          />
        )}

        {activeTab === 'university' && (
          <KnowledgeSectionView
            storageKey="awh_progress_university"
            curriculum={universityCurriculum}
            accentClass="text-cyan-400"
            onNavigateHome={() => navigateToTab('main')}
          />
        )}

        {activeTab === 'game_industry' && (
          <KnowledgeSectionView
            storageKey="awh_progress_game_industry"
            curriculum={gameIndustryCurriculum}
            accentClass="text-emerald-400"
            onNavigateHome={() => navigateToTab('main')}
          />
        )}

        {activeTab === 'chat' && (
          <ChatbotView
            onNotify={showNotification}
            onRequestDriveConfirmation={triggerDriveConfirmation}
            isDriveConnected={!!user}
            onNavigateHome={() => navigateToTab('main')}
            onOpenSubscriptions={() => setIsSubscriptionsOpen(true)}
          />
        )}

        {activeTab === 'drive' && (
          <DriveHubView
            user={user}
            isDriveConnected={!!user}
            onNotify={showNotification}
            onRequestDriveConfirmation={triggerDriveConfirmation}
            onTriggerSignIn={handleSignIn}
            onNavigateHome={() => navigateToTab('main')}
          />
        )}

        {activeTab === 'graphics' && (
          <GraphicsEnginesStudio
            onNotify={showNotification}
            onRequestDriveConfirmation={triggerDriveConfirmation}
            isDriveConnected={!!user}
            onNavigateHome={() => navigateToTab('main')}
          />
        )}

        {activeTab === 'lessons_broadcast' && (
          <LessonsBroadcastView
            onNotify={showNotification}
            onNavigateHome={() => navigateToTab('main')}
            onOpenSubscriptions={() => setIsSubscriptionsOpen(true)}
            onNavigateToTutor={() => navigateToTab('private_tutor')}
          />
        )}

        {activeTab === 'game' && (
          <GameView onExit={() => navigateToTab('academic')} />
        )}

        {activeTab === 'main' && (
          <MainPage onNavigate={(tab) => navigateToTab(tab as any)} />
        )}

        {activeTab === 'dashboard' && firebaseUser && (
          <UserDashboardView
            user={firebaseUser}
            onNotify={showNotification}
            onNavigateHome={() => navigateToTab('academic')}
          />
        )}

        {activeTab === 'admin_login' && (
          <AdminLogin
            onAuthSuccess={() => {
              setIsAdminAuthenticated(true);
              setActiveTab('admin_dashboard');
            }}
            onNotify={showNotification}
          />
        )}

        {activeTab === 'admin_dashboard' && isAdminAuthenticated && (
          <AdminDashboard />
        )}
      </main>

      {/* Link & Google Publishing Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-right space-y-4">
            <button
              onClick={() => setIsLinkModalOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">رابط المنصة المختصر والنشر على Google</h3>
                <p className="text-xs text-slate-400">الرابط العربي المختصر: «ركس.كود» • الاسم المختصر: «awh»</p>
              </div>
            </div>

            {/* Arabic Shortened Brand Domain Box (User Requested: ركس.كود) */}
            <div className="space-y-1.5 p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-950 to-indigo-950/40 border border-cyan-500/40 shadow-inner">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>الرابط العربي المخصص للمنصة:</span>
                </label>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  نطاق عربي مختصر
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-cyan-500/30">
                <span className="text-sm font-extrabold text-white font-mono flex-1">
                  ركس.كود <span className="text-slate-500 text-xs font-normal">(https://ركس.كود)</span>
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("ركس.كود");
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                    showNotification('تم نسخ الرابط العربي المختصر «ركس.كود» بنجاح!', 'success');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition flex-shrink-0 shadow-md"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'تم النسخ' : 'نسخ «ركس.كود»'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
                يمكن للزوار كتابة <strong className="text-cyan-300">ركس.كود</strong> أو البحث في Google باسم <strong className="text-cyan-300">A.W.H</strong> أو <strong className="text-cyan-300">ركس كود</strong> للوصول المباشر للمنصة.
              </p>
            </div>

            {/* Production / Live URL Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">الرابط السحابي المباشر المنشور (Cloud Run URL):</label>
              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value="https://ais-pre-zo4ioldilagqsmuf6whnnc-920993121097.europe-west2.run.app"
                  className="flex-1 bg-transparent text-xs text-cyan-300 font-mono outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("https://ais-pre-zo4ioldilagqsmuf6whnnc-920993121097.europe-west2.run.app");
                    showNotification('تم نسخ الرابط السحابي المباشر!', 'success');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex-shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ</span>
                </button>
                <a
                  href="https://ais-pre-zo4ioldilagqsmuf6whnnc-920993121097.europe-west2.run.app"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex-shrink-0"
                  title="فتح في نافذة جديدة"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Development URL Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">رابط بيئة التطوير (Development URL):</label>
              <div className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
                <span className="flex-1 truncate">https://ais-dev-zo4ioldilagqsmuf6whnnc-920993121097.europe-west2.run.app</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("https://ais-dev-zo4ioldilagqsmuf6whnnc-920993121097.europe-west2.run.app");
                    showNotification('تم نسخ رابط بيئة التطوير!', 'info');
                  }}
                  className="p-1.5 rounded text-slate-400 hover:text-white"
                  title="نسخ رابط التطوير"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Google Readiness Status */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-slate-200 flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span>عناصر الفهرسة والأرشفة المنفذة لمحرك قوقل:</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>ملف خريطة الموقع (Sitemap):</strong> مفعل على <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">/sitemap.xml</code> لجدولة زحف محرك Google.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>ملف توجيه الزواحف (Robots.txt):</strong> متوفر على <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">/robots.txt</code> مع السماح الكامل بالفهرسة.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>البيانات المنظمة Schema.org (JSON-LD):</strong> تم تضمين نموذج <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">WebApplication</code> الكامل للظهور في نتائج البحث المتقدمة.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span><strong>وسوم التواصل OpenGraph & Twitter Cards:</strong> مهيأة للعرض البصري الجذاب عند مشاركة الرابط.</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Firebase Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onNotify={showNotification}
      />

      {/* Global Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        itemDetails={confirmationModal.itemDetails}
        confirmLabel={confirmationModal.confirmLabel}
        isDestructive={confirmationModal.isDestructive}
        onConfirm={handleModalConfirm}
        onCancel={() =>
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
        }
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border text-xs md:text-sm animate-in slide-in-from-bottom duration-200 max-w-md bg-slate-900/95 border-slate-700 text-slate-100">
          {notification.type === 'success' && (
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          )}
          {notification.type === 'error' && (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          {notification.type === 'info' && (
            <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          )}
          <span className="flex-1 leading-snug">{notification.msg}</span>
          <button
            onClick={() => setNotification(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer with Isolated Route Links */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span>
              منصة <strong>A.W.H</strong> التعليمية والأكاديمية
            </span>
            <span className="text-slate-700 hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateToTab('admin_login')}
                  className="hover:text-purple-400 text-slate-400 font-medium transition flex items-center gap-1"
                >
                  <Shield className="w-3 h-3 text-purple-500" />
                  <span>الأدمن</span>
                </button>
                <span className="text-slate-700">•</span>
                <button
                  onClick={() => navigateToTab('live')}
                  className="hover:text-red-400 text-slate-400 font-medium transition flex items-center gap-1"
                >
                  <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                  <span>النقل المباشر (/live)</span>
                </button>
              <span className="text-slate-700">•</span>
              <button
                onClick={() => navigateToTab('ads')}
                className="hover:text-cyan-300 text-slate-400 font-medium transition flex items-center gap-1"
              >
                <Megaphone className="w-3 h-3 text-cyan-400" />
                <span>أعلن معنا (/ads)</span>
              </button>
            </div>
          </div>
          <span className="font-mono text-[11px] text-slate-600">
            مسارات منعزلة 100% عن استهلاك الـ API Key • أمان وفلترة صارمة
          </span>
        </div>
      </footer>

      {/* Subscriptions & Free Access Modal */}
      <SubscriptionsModal
        isOpen={isSubscriptionsOpen}
        onClose={() => setIsSubscriptionsOpen(false)}
        onSuccess={(plan) => showNotification(`تم تفعيل الاشتراك بنجاح: ${plan}`, 'success')}
      />

      {/* Database Explorer & Available DBs Modal */}
      <DatabaseExplorerModal
        isOpen={isDatabaseExplorerOpen}
        onClose={() => setIsDatabaseExplorerOpen(false)}
      />
      </Suspense>
    </div>
  );
}
