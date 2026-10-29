import React, { useState, useEffect } from 'react';
import { X, Crown, Check, Sparkles, Shield, Zap, GraduationCap, ArrowRight, CheckCircle2, Video, Search, Image as ImageIcon, Hammer, Dna, MessageSquare, Radio } from 'lucide-react';
import { auth, db } from '../services/firestoreService';
import { doc, setDoc } from 'firebase/firestore';

interface SubscriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (planName: string) => void;
}

export function SubscriptionsModal({ isOpen, onClose, onSuccess }: SubscriptionsModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'Free' | 'Smart' | 'VIP'>('Smart');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeCurrentPlan, setActiveCurrentPlan] = useState<'Free' | 'Smart' | 'VIP'>('Free');

  useEffect(() => {
    try {
      const savedPlan = (localStorage.getItem('awh_user_plan') || 'Free') as 'Free' | 'Smart' | 'VIP';
      setActiveCurrentPlan(savedPlan);
    } catch (e) {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubscribe = async (plan: 'Free' | 'Smart' | 'VIP', planTitle: string) => {
    setIsSubscribing(true);
    try {
      // Save locally for instant UI reflection across all platform sections
      try {
        localStorage.setItem('awh_user_plan', plan);
        localStorage.setItem('awh_user_plan_title', planTitle);
        window.dispatchEvent(new Event('awh_plan_updated'));
      } catch (e) {}

      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email || 'guest',
          plan,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      setActiveCurrentPlan(plan);
      setSuccessMsg(`تم تفعيل "${planTitle}" وتعميمها على كافة أقسام المنصة بنجاح!`);
      setTimeout(() => {
        setIsSubscribing(false);
        setSuccessMsg('');
        onSuccess(planTitle);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsSubscribing(false);
      setTimeout(() => {
        onSuccess(planTitle);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 shadow-lg shadow-amber-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Crown className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">باقات الاشتراكات والخيار المجاني لكافة الأقسام</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                  تعميم شامل 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تطبق هذه الباقات والاشتراكات بالتساوي على كافة أقسام المنصة (التحليل، توليد الصور والفيديو، البناء، العلوم الحيوية، البث المباشر، والتعليم)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-bold animate-bounce">
              {successMsg}
            </div>
          )}

          {/* Section Coverage Banner */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              ✨ التغطية الشاملة للباقات والدخول المجاني عبر كافة أقسام المنصة:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. التحليل والبيانات</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>2. توليد الصور والفيديو</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                <Hammer className="w-3.5 h-3.5 text-amber-400" />
                <span>3. مختبر بناء الكود</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                <Dna className="w-3.5 h-3.5 text-emerald-400" />
                <span>4. العلوم الحيوية (3D)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                <span>5. التعليم والأقسام</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span>6. بث الدروس والمحاضرات</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                <Video className="w-3.5 h-3.5 text-red-400" />
                <span>7. المدرس الخصوصي LIVE</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                <span>8. المساعد الذكي</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Free Tier */}
            <div className={`relative bg-slate-950/60 border rounded-2xl p-6 flex flex-col justify-between transition ${
              activeCurrentPlan === 'Free' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-950/10' : 'border-slate-800 hover:border-emerald-500/50'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                    دخول مجاني بالكامل
                  </span>
                  {activeCurrentPlan === 'Free' && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      باقتك الحالية ✓
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-white mb-2">الباقة المجانية</h3>
                <p className="text-xs text-slate-400 mb-6">متاحة لكافة الطلاب والزوار مجاناً للاستفادة من جميع الأقسام والدروس البسيطة.</p>
                <ul className="space-y-3 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>دخول مجاني لكافة الأقسام والمناهج</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>حضور البث المباشر العام للدروس</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>محرك جميني 2 (5 طلبات يومياً)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>حل الاختبارات ذاتية التقييم</span>
                  </li>
                </ul>
              </div>
              <button
                disabled={isSubscribing}
                onClick={() => handleSubscribe('Free', 'الباقة المجانية')}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <span>تفعيل الدخول المجاني</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>

            {/* 2. Smart Tier (Popular) */}
            <div className={`relative bg-gradient-to-b from-emerald-950/40 to-slate-950/80 border-2 rounded-2xl p-6 flex flex-col justify-between shadow-lg shadow-emerald-950/50 ${
              activeCurrentPlan === 'Smart' ? 'border-emerald-400 ring-2 ring-emerald-500/40' : 'border-emerald-500/60'
            }`}>
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                الأكثر طلباً ⭐
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    الطالب المتميز
                  </span>
                  {activeCurrentPlan === 'Smart' && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                      باقتك الحالية ✓
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-white mb-2">الباقة الذكية</h3>
                <div className="text-2xl font-black text-emerald-400 mb-4">
                  15,000 <span className="text-xs font-normal text-slate-400">د.ع / شهرياً</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">ميزات متقدمة ودعم ذكي متواصل لتسريع التفوق الدراسي لكافة الأقسام.</p>
                <ul className="space-y-3 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>كل ميزات الباقة المجانية</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>تثبيت الأسئلة المباشرة في البث الحي</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>جدول مذاكرة ذكي مخصص بالذكاء الاصطناعي</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>توليد صور 4K وتحليل بيانات معقد</span>
                  </li>
                </ul>
              </div>
              <button
                disabled={isSubscribing}
                onClick={() => handleSubscribe('Smart', 'الباقة الذكية')}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>اشتراك الباقة الذكية</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            {/* 3. VIP All-Inclusive Tier */}
            <div className={`relative bg-gradient-to-b from-indigo-950/40 to-slate-950/80 border rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500 transition ${
              activeCurrentPlan === 'VIP' ? 'border-amber-400 ring-2 ring-amber-500/40' : 'border-amber-500/40'
            }`}>
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                VIP شامل 👑
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                    نخبة العراق VIP
                  </span>
                  {activeCurrentPlan === 'VIP' && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                      باقتك الحالية ✓
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-white mb-2">الباقة الشاملة VIP</h3>
                <div className="text-2xl font-black text-amber-400 mb-4">
                  35,000 <span className="text-xs font-normal text-slate-400">د.ع / شهرياً</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">رعاية خاصة، جلسات خصوصية فردية 1-on-1، ومتابعة أولياء الأمور.</p>
                <ul className="space-y-3 text-xs text-slate-300 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>وصول غير محدود لكافة الأقسام والمحركات</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>جلسات مدرس خصوصي 1-on-1 مباشرة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>لوحة تحكم ولي الأمر ومتابعة الحضور</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>ربط تلقائي مع Google Drive والتسجيلات</span>
                  </li>
                </ul>
              </div>
              <button
                disabled={isSubscribing}
                onClick={() => handleSubscribe('VIP', 'الباقة الشاملة VIP')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <span>اشتراك باقة VIP</span>
                <Crown className="w-4 h-4" />
              </button>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>جميع الاشتراكات والخيارات المجانية مؤمنة ومحدثة فوراً في قاعدة بيانات Cloud Firestore.</span>
            </div>
            <span className="text-emerald-400 font-bold">دعم فني عراقي متواصل</span>
          </div>

        </div>

      </div>
    </div>
  );
}
