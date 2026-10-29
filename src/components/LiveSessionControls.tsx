import React, { useState } from 'react';
import {
  Hand,
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  CheckCircle2,
  XCircle,
  Award,
  VolumeX,
  Sparkles,
  Download,
  Search,
  UserCheck,
  Shield,
  Clock,
  Send,
  Star,
  UserMinus,
  MessageSquare,
  Crown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LiveTutorQuestion } from '../services/firestoreService';

export interface StudentAttendee {
  id: string;
  name: string;
  stage: string;
  joinTime: string;
  isHandRaised: boolean;
  isSpeaking: boolean;
  isMicMuted: boolean;
  isCameraActive: boolean;
  starsCount: number;
  badge?: string;
  status: 'active' | 'speaking' | 'hand_raised' | 'muted';
}

interface LiveSessionControlsProps {
  tutorName: string;
  liveQuestions: LiveTutorQuestion[];
  onGrantSpeaking: (question: LiveTutorQuestion) => void;
  onLowerHand: (questionId: string) => void;
  onLowerAllHands: () => void;
  onMuteAllMics: () => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LiveSessionControls: React.FC<LiveSessionControlsProps> = ({
  tutorName,
  liveQuestions,
  onGrantSpeaking,
  onLowerHand,
  onLowerAllHands,
  onMuteAllMics,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'hand_raises' | 'attendance_roster' | 'stream_moderation'>('hand_raises');
  const [rosterSearch, setRosterSearch] = useState('');

  // Sample Live Attendees Roster State
  const [attendees, setAttendees] = useState<StudentAttendee[]>([
    {
      id: 'att_1',
      name: 'محمد البغدادي',
      stage: 'السادس العلمي (الوزاري)',
      joinTime: '10:01 ص',
      isHandRaised: true,
      isSpeaking: false,
      isMicMuted: true,
      isCameraActive: false,
      starsCount: 3,
      badge: 'طالب متميز ⭐️',
      status: 'hand_raised',
    },
    {
      id: 'att_2',
      name: 'سارة الكرخي',
      stage: 'السادس العلمي (الوزاري)',
      joinTime: '10:03 ص',
      isHandRaised: true,
      isSpeaking: false,
      isMicMuted: true,
      isCameraActive: true,
      starsCount: 5,
      badge: 'نخبة العراق 👑',
      status: 'hand_raised',
    },
    {
      id: 'att_3',
      name: 'علي الحلي',
      stage: 'السادس العلمي (الوزاري)',
      joinTime: '10:05 ص',
      isHandRaised: false,
      isSpeaking: true,
      isMicMuted: false,
      isCameraActive: true,
      starsCount: 2,
      badge: 'مشارك نشط 🎤',
      status: 'speaking',
    },
    {
      id: 'att_4',
      name: 'زينب النجفية',
      stage: 'السادس العلمي (الوزاري)',
      joinTime: '10:07 ص',
      isHandRaised: false,
      isSpeaking: false,
      isMicMuted: true,
      isCameraActive: false,
      starsCount: 1,
      status: 'active',
    },
    {
      id: 'att_5',
      name: 'أحمد البصري',
      stage: 'الثالث المتوسط',
      joinTime: '10:10 ص',
      isHandRaised: false,
      isSpeaking: false,
      isMicMuted: true,
      isCameraActive: false,
      starsCount: 4,
      badge: 'بطل المسائل 🔢',
      status: 'active',
    },
  ]);

  // Extract pending hand raise requests from Firestore live questions
  const handRaiseRequests = liveQuestions.filter(
    (q) => q.isHandRaise && q.status === 'pending'
  );

  // Toggle student mic in roster
  const toggleStudentMic = (studentId: string) => {
    setAttendees((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const nextMuted = !s.isMicMuted;
          onNotify(
            nextMuted
              ? `تم كتم صوت الطالب (${s.name})`
              : `تم تفعيل المايك للطالب (${s.name}) لإتاحة المداخلة! 🎤`,
            nextMuted ? 'info' : 'success'
          );
          return {
            ...s,
            isMicMuted: nextMuted,
            isSpeaking: !nextMuted,
            status: !nextMuted ? 'speaking' : 'active',
          };
        }
        return s;
      })
    );
  };

  // Award star to student
  const rewardStudentStar = (studentId: string) => {
    setAttendees((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const newStars = s.starsCount + 1;
          onNotify(`تم منح نجمة تميز ⭐️ للطالب (${s.name})! إجمالي النجوم: ${newStars}`, 'success');
          return { ...s, starsCount: newStars };
        }
        return s;
      })
    );
  };

  // Remove student from live room
  const removeStudentFromSession = (studentId: string, studentName: string) => {
    setAttendees((prev) => prev.filter((s) => s.id !== studentId));
    onNotify(`تم استبعاد الطالب (${studentName}) من الجلسة المباشرة`, 'info');
  };

  // Export Attendance Roster as CSV
  const exportAttendanceCSV = () => {
    const headers = 'اسم الطالب,المرحلة الدراسية,وقت الانضمام,الحالة,عدد النجوم\n';
    const rows = attendees
      .map(
        (a) =>
          `"${a.name}","${a.stage}","${a.joinTime}","${a.status}","${a.starsCount}"`
      )
      .join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `سجل_حضور_البث_المباشر_${tutorName}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onNotify('تم تصدير سجل الحضور المباشر بنجاح! 📄', 'success');
  };

  const filteredAttendees = attendees.filter(
    (a) =>
      a.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      a.stage.toLowerCase().includes(rosterSearch.toLowerCase())
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-5" dir="rtl">
      {/* Component Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-950/40">
            <Hand className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">وحدة التحكم بالبث والحضور (LiveSessionControls)</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                تحكم المحاضر
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              إدارة طلبات رفع اليد من الطلاب، منح المايك والكلمة، وضبط قائمة الحضور المباشر للأستاذ ({tutorName})
            </p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('hand_raises')}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${
              activeTab === 'hand_raises'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white font-extrabold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hand className="w-4 h-4 text-amber-300" />
            <span>طلبات رفع اليد</span>
            {handRaiseRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-mono animate-ping">
                {handRaiseRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('attendance_roster')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${
              activeTab === 'attendance_roster'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-extrabold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-300" />
            <span>سجل الحضور المباشر ({attendees.length})</span>
          </button>
        </div>
      </div>

      {/* TABS CONTENT */}
      {activeTab === 'hand_raises' ? (
        /* 1. RAISE HAND REQUESTS MANAGEMENT */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-slate-200 font-semibold">
                طلبات المشاركة الصوتية ورفع اليد النشطة حالياً: <strong className="text-amber-400 font-mono text-sm">{handRaiseRequests.length}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onMuteAllMics}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 font-bold transition active:scale-95"
              >
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>كتم مايكات الجميع</span>
              </button>

              <button
                onClick={onLowerAllHands}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold transition active:scale-95"
              >
                <Hand className="w-3.5 h-3.5 text-slate-400" />
                <span>إنزال جميع الأيدي</span>
              </button>
            </div>
          </div>

          {handRaiseRequests.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
              <Hand className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">لا توجد طلبات رفع يد معلقة حالياً</h4>
              <p className="text-xs text-slate-500">
                عندما يرفع أحد الطلاب يده لطلب المداخلة مع الأستاذ ({tutorName})، ستظهر هنا فوراً لمنحه الكلمة أو المايك.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {handRaiseRequests.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 shadow-lg hover:border-amber-400 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                        <Hand className="w-4 h-4 animate-bounce" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{q.studentName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{q.createdAt}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 animate-pulse">
                      طالب يرفع يده ✋
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    {q.text}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onGrantSpeaking(q)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>إعطاء الكلمة والمايك</span>
                    </button>

                    <button
                      onClick={() => onLowerHand(q.id)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1"
                      title="إنزال يد الطالب"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>إنزال اليد</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 2. LIVE ATTENDANCE ROSTER MANAGEMENT */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
              <input
                type="text"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="البحث في قائمة الحضور باسم الطالب أو المرحلة..."
                className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-cyan-500"
              />
            </div>

            {/* Export Roster Button */}
            <button
              onClick={exportAttendanceCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>تصدير سجل الحضور المباشر (CSV)</span>
            </button>
          </div>

          {/* Roster Table */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/80">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-slate-300">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                  <tr>
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">المرحلة الدراسية</th>
                    <th className="p-3">وقت الانضمام</th>
                    <th className="p-3">حالة المشاركة</th>
                    <th className="p-3">أوسمة التفوق</th>
                    <th className="p-3 text-center">الإجراءات والتحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAttendees.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-900/50 transition">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <span>{student.name}</span>
                      </td>

                      <td className="p-3 text-slate-400 font-mono">{student.stage}</td>
                      <td className="p-3 text-slate-500 font-mono">{student.joinTime}</td>

                      <td className="p-3">
                        {student.isSpeaking ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold animate-pulse inline-flex items-center gap-1">
                            <Mic className="w-3 h-3" />
                            يتحدث الآن
                          </span>
                        ) : student.isHandRaised ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-bounce inline-flex items-center gap-1">
                            <Hand className="w-3 h-3" />
                            رافع إيده ✋
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                            حاضر وصامت
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{student.starsCount}</span>
                          {student.badge && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/20 ml-1">
                              {student.badge}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Toggle Mic */}
                          <button
                            onClick={() => toggleStudentMic(student.id)}
                            className={`p-1.5 rounded-lg transition ${
                              student.isMicMuted
                                ? 'bg-slate-800 text-slate-400 hover:text-white'
                                : 'bg-emerald-600 text-white shadow-md'
                            }`}
                            title={student.isMicMuted ? 'تفعيل مايك الطالب' : 'كتم مايك الطالب'}
                          >
                            {student.isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                          </button>

                          {/* Reward Star */}
                          <button
                            onClick={() => rewardStudentStar(student.id)}
                            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition"
                            title="منح نجمة تميز للطالب"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove Student */}
                          <button
                            onClick={() => removeStudentFromSession(student.id, student.name)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition"
                            title="إخراج الطالب من الجلسة"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
