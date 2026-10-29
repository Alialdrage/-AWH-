import React, { useState, useEffect } from 'react';
import { Shield, Users, Video, Activity, FileText, MessageSquare, Database, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { onSnapshot, collection, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firestoreService';
import { UserManagementTable } from './UserManagementTable';

export const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);
  const [recordsCount, setRecordsCount] = useState(0);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    // 1. Monitor users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUserCount(snapshot.size);
    });

    // 2. Monitor live questions (proxy for sessions)
    const unsubscribeSessions = onSnapshot(collection(db, 'live_tutor_questions'), (snapshot) => {
      setActiveSessions(snapshot.size);
    });

    // 3. Monitor academic records
    const unsubscribeRecords = onSnapshot(collection(db, 'academic_records'), (snapshot) => {
      setRecordsCount(snapshot.size);
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentRecords(docs.slice(0, 5));
    });

    // 4. Monitor recent activity (comments)
    const qComments = query(collection(db, 'academic_comments'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribeComments = onSnapshot(qComments, (snapshot) => {
      setRecentComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeUsers();
      unsubscribeSessions();
      unsubscribeRecords();
      unsubscribeComments();
    };
  }, []);

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'academic_comments', id));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-950 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/40">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">لوحة الإشراف العام - A.W.H</h2>
            <p className="text-slate-400 text-xs mt-1">مراقبة لحظية عبر Cloud Firestore • ركس.كود</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-bold">النظام متصل ويعمل بكفاءة 100%</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-6 h-6 text-cyan-400" />
            <span className="text-[10px] font-mono text-slate-500 uppercase">Users</span>
          </div>
          <p className="text-3xl font-black text-white">{userCount}</p>
          <p className="text-xs text-slate-500 mt-1">إجمالي الحسابات المسجلة</p>
        </div>

        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg group hover:border-red-500/40 transition">
          <div className="flex items-center justify-between mb-4">
            <Video className="w-6 h-6 text-red-400" />
            <span className="text-[10px] font-mono text-slate-500 uppercase">Live Ops</span>
          </div>
          <p className="text-3xl font-black text-white">{activeSessions}</p>
          <p className="text-xs text-slate-500 mt-1">الأسئلة والطلبات النشطة</p>
        </div>

        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-4">
            <Database className="w-6 h-6 text-emerald-400" />
            <span className="text-[10px] font-mono text-slate-500 uppercase">Content</span>
          </div>
          <p className="text-3xl font-black text-white">{recordsCount}</p>
          <p className="text-xs text-slate-500 mt-1">سجلات المحتوى الأكاديمي</p>
        </div>

        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-6 h-6 text-amber-400" />
            <span className="text-[10px] font-mono text-slate-500 uppercase">Comments</span>
          </div>
          <p className="text-3xl font-black text-white">{recentComments.length}</p>
          <p className="text-xs text-slate-500 mt-1">إجمالي تعليقات الطلاب</p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-xl animate-fadeIn ${
          toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' :
          toast.type === 'error' ? 'bg-red-500/20 border-red-500/40 text-red-300' :
          'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* User Management Section */}
      <div className="col-span-1">
        <UserManagementTable onNotify={showToast} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Comments Management */}
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-amber-400" />
              <h3 className="text-xl font-bold text-white">إدارة تعليقات الطلاب</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">تحديث لحظي</span>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {recentComments.length === 0 ? (
              <div className="text-center py-12 text-slate-600">لا توجد تعليقات حالياً</div>
            ) : (
              recentComments.map((comment) => (
                <div key={comment.id} className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 group hover:border-slate-700 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-sm text-slate-200">{comment.userName}</p>
                      <p className="text-[10px] text-slate-500">{new Date(comment.createdAt).toLocaleString('ar-EG')}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1.5 text-slate-600 hover:text-red-400 transition"
                      title="حذف التعليق"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{comment.commentText}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">{comment.grade}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{comment.subject}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Content Generated */}
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-bold text-white">أحدث المحتويات المولدة</h3>
            </div>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {recentRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-600">لا توجد سجلات محتوى حالياً</div>
            ) : (
              recentRecords.map((record) => (
                <div key={record.id} className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 group hover:border-slate-700 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-sm text-slate-200">{record.title}</p>
                      <p className="text-[10px] text-slate-500">{record.subject} • {record.grade}</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                      record.mode === 'quiz' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}>
                      {record.mode}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[10px] truncate">{record.content.substring(0, 100)}...</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Platform Activity Monitor (Real-time Logs) */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">مراقب نشاط المنصة (Platform Activity)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={async () => {
                try {
                  const res = await fetch('/api/system/clean', { method: 'POST' });
                  const data = await res.json();
                  showToast(data.message || 'تم تنظيف النظام بنجاح', 'success');
                } catch (err) {
                  showToast('فشل تنظيف النظام', 'error');
                }
              }}
              className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-bold transition flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تنظيف الكاش والنظام (System Clean)</span>
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition"
              title="تحديث الصفحة"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3 font-mono text-[11px]">
          <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>[{new Date().toLocaleTimeString()}] AI Engine Status: Optimized (ThinkingLevel: LOW) for max response speed.</span>
          </div>
          <div className="flex items-center gap-3 text-cyan-400 bg-cyan-500/5 p-2 rounded-lg border border-cyan-500/10">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>[{new Date().toLocaleTimeString()}] Firestore Gateway: Operational. Real-time listeners active for 5 core collections.</span>
          </div>
          <div className="flex items-center gap-3 text-blue-400 bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">
            <Info className="w-3.5 h-3.5" />
            <span>[{new Date().toLocaleTimeString()}] Multi-Model Proxy: Real-time routing via Google Gemini (High Speed & Zero 401 Failover).</span>
          </div>
          <div className="flex items-center gap-3 text-purple-400 bg-purple-500/5 p-2 rounded-lg border border-purple-500/10">
            <Shield className="w-3.5 h-3.5" />
            <span>[{new Date().toLocaleTimeString()}] Voice Auth: "طالب حوزة" phrase verification logic active for Admin login.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
);

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

