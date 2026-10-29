import React, { useState } from 'react';
import {
  Megaphone,
  CheckCircle,
  CreditCard,
  Send,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Users,
  Eye,
  Award,
  ArrowRight,
  DollarSign,
  PhoneCall,
  Mail,
  Building,
  Calendar,
  FileText,
  Check,
} from 'lucide-react';

interface AdsViewProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateHome: () => void;
}

export const AdsView: React.FC<AdsViewProps> = ({ onNotify, onNavigateHome }) => {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'silver' | 'diamond'>('silver');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    placement: 'banner_top',
    durationMonths: '1',
    paymentMethod: 'zain_cash',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'starter' as const,
      name: 'باقة الانطلاق (Starter)',
      price: '$150',
      period: 'شهرياً',
      color: 'from-slate-700 to-slate-900',
      border: 'border-slate-700',
      badge: 'الشركات الناشئة',
      features: [
        'بانر إعلاني في الشريط الجانبي للصفحة',
        'ظهور مقترح في نهاية المحاضرات الأكاديمية',
        'تقرير شهري بعدد النقرات والمشاهدات',
        'دعم فني وتنسيق التصميم الإعلاني',
      ],
    },
    {
      id: 'silver' as const,
      name: 'الباقة الفضية المتقدمة (Silver)',
      price: '$350',
      period: 'شهرياً',
      color: 'from-blue-600 to-cyan-700',
      border: 'border-cyan-500',
      badge: 'الأكثر طلباً ⭐',
      features: [
        'بانر رأسي عريض أعلى المنصة (Header Banner)',
        'تنويه إعلاني داخل قاعات التعليم الابتدائي والإعدادي',
        'رعاية أسبوعية لقسم من أقسام المنصة',
        'ظهور في صفحات البث المباشر الآمن',
        'لوحة قياس فورية للتحويلات (CTR Analytics)',
      ],
    },
    {
      id: 'diamond' as const,
      name: 'الباقة الماسية الحصرية (Diamond VIP)',
      price: '$750',
      period: 'شهرياً',
      color: 'from-purple-600 to-indigo-800',
      border: 'border-purple-500',
      badge: 'شريك استراتيجي 💎',
      features: [
        'استحواذ كامل على المساحات الترويجية الرئيسية',
        'بانر متحرك تفاعلي في واجهة الاستقبال والبداية',
        'رعاية حصرية لغرف البث التلفزيوني والتعليمي',
        'مشاركة في الرسائل البريدية للأكاديميين والطلاب',
        'مدير حساب إعلاني مخصص مع تقارير أسبوعية تفصيلية',
      ],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      onNotify('يرجى ملء جميع الحقول الإلزامية', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ads/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('فشل إرسال طلب الحجز الإعلاني');
      }

      setSubmitted(true);
      onNotify('تم استلام طلبك الإعلاني بنجاح! سيتواصل معك فريق التسويق خلال ساعات.', 'success');
    } catch (err: any) {
      console.error(err);
      onNotify(err.message || 'حدث خطأ أثناء الإرسال', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى المنصة التعليمية</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>مسار منعزل: /ads (بدون استهلاك ذكاء اصطناعي)</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-3 py-6 px-4 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
          <Megaphone className="w-4 h-4 text-cyan-400" />
          <span>شبكة A.W.H الإعلانية المتخصصة</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          أعلن معنا ووصّل علامتك التجارية لآلاف الطلاب والباحثين
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          مساحات إعلانية مستهدفة ومحترمة وموثوقة ضمن منصة A.W.H التعليمية والأكاديمية، مع باقات مرنة وتغطية للجمهور العراقي والعربي.
        </p>

        {/* Audience Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 max-w-3xl mx-auto text-center">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <Users className="w-5 h-5 mx-auto text-cyan-400 mb-1" />
            <span className="text-lg font-bold text-white font-mono">+120,000</span>
            <span className="text-[11px] text-slate-400 block">طالب وباحث نشط</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <Eye className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
            <span className="text-lg font-bold text-white font-mono">+850,000</span>
            <span className="text-[11px] text-slate-400 block">مشاهدة شهرية</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <TrendingUp className="w-5 h-5 mx-auto text-amber-400 mb-1" />
            <span className="text-lg font-bold text-white font-mono">4.8%</span>
            <span className="text-[11px] text-slate-400 block">معدل نقر عالي (CTR)</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <ShieldCheck className="w-5 h-5 mx-auto text-purple-400 mb-1" />
            <span className="text-lg font-bold text-white font-mono">100%</span>
            <span className="text-[11px] text-slate-400 block">بيئة آمنة ونظيفة</span>
          </div>
        </div>
      </div>

      {/* Pricing Packages Table */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-100">باقات "أعلن معنا" المرنة</h2>
          <p className="text-xs text-slate-400 mt-1">اختر الباقة المناسبة لأهداف حملتك التسويقية</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`cursor-pointer rounded-3xl p-6 transition-all duration-200 border-2 flex flex-col justify-between relative shadow-xl backdrop-blur-md ${
                selectedPlan === p.id
                  ? `${p.border} bg-slate-900/90 shadow-cyan-900/20 scale-[1.02]`
                  : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[11px] font-bold text-slate-300">
                    {p.badge}
                  </span>
                  {selectedPlan === p.id && (
                    <span className="flex items-center gap-1 text-xs text-cyan-400 font-bold">
                      <CheckCircle className="w-4 h-4 text-cyan-400" />
                      <span>محددة</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white">{p.name}</h3>

                <div className="my-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-mono">{p.price}</span>
                  <span className="text-xs text-slate-400 font-medium">/ {p.period}</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs transition ${
                  selectedPlan === p.id
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {selectedPlan === p.id ? 'الباقة المختارة للحجز' : 'اختيار هذه الباقة'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Form & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base text-slate-100">نموذج حجز مساحة إعلانية والتعاقد</h3>
          </div>

          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white">تم استلام طلب الحجز الإعلاني بنجاح!</h4>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                شكراً لاهتمامك بالإعلان عبر منصة A.W.H. سيقوم مسؤول العلاقات الإعلانية بالتواصل معك خلال ساعتي عمل لتفعيل الحملة وتزويدك برابط الفاتورة.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white transition"
              >
                تقديم طلب حجز إضافي
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: أحمد عبد الله"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">اسم الشركة أو المؤسسة</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="مثال: أكاديمية المستقبل التعليمية"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@company.com"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">رقم الهاتف أو واتساب *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+964 770 000 0000"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">مدة الحملة الإعلانية</label>
                  <select
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="1">شهر واحد (حملة قياسية)</option>
                    <option value="3">3 أشهر (خصم 10%)</option>
                    <option value="6">6 أشهر (خصم 20%)</option>
                    <option value="12">سنة كاملة (خصم 30% وشريك سنوي)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">طريقة الدفع المفضلة</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="zain_cash">زين كاش (Zain Cash - العراق)</option>
                    <option value="visa_master">بطاقة فيزا / ماستركارد (Visa / Master)</option>
                    <option value="fastpay">فاست بي (FastPay)</option>
                    <option value="bank_transfer">حوالة بنكية رسمية (Bank Transfer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">ملاحظات أو مواصفات خاصة بالإعلان</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="حدد الجمهور المستهدف (مثل طلاب الإعدادي، طلبة الطب، أو أساتذة الجامعات) وأي متطلبات..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-950 transition active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>جاري تسجيل الطلب...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال طلب الحجز الإعلاني</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Payment & Contact Side Card */}
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 backdrop-blur-md space-y-4 text-xs">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span>طرق الدفع والفوترة الرسمية</span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              نوفر فواتير ضريبية رسمية للشركات والمؤسسات التعليمية مع دعم شامل لوسائل الدفع المحلية والدولية.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-200">زين كاش (Zain Cash):</span>
                <span className="font-mono text-emerald-400 font-bold">0780 XXXXXXX</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-200">بطاقات الائتمان:</span>
                <span className="text-slate-300">Visa / MasterCard</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-200">التحويل البنكي:</span>
                <span className="text-slate-300">IBAN متوفر للشركات</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 backdrop-blur-md space-y-3 text-xs">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>فريق التسويق والرعاية</span>
            </h4>
            <p className="text-slate-400">للاستفسارات والاتفاقيات الخاصة:</p>
            <div className="space-y-1.5 font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>ads@awh-platform.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                <span>+964 770 123 4567</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
