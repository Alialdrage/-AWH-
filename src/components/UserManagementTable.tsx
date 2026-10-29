import React, { useState, useEffect } from 'react';
import { UserProfile, getAllUsers, adminUpdateUser } from '../services/firestoreService';
import { Users, Shield, Crown, Search, Filter, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface UserManagementTableProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({ onNotify }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      onNotify('فشل تحميل قائمة المستخدمين', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (uid: string, updates: Partial<Pick<UserProfile, 'role' | 'plan'>>) => {
    setUpdatingId(uid);
    try {
      await adminUpdateUser(uid, updates);
      onNotify('تم تحديث بيانات المستخدم بنجاح', 'success');
      // Update local state
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...updates } : u));
    } catch (err) {
      console.error('Failed to update user:', err);
      onNotify('فشل تحديث بيانات المستخدم', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesPlan = planFilter === 'all' || u.plan === planFilter;
    return matchesSearch && matchesRole && matchesPlan;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">جاري جلب بيانات المستخدمين من Firestore...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 rounded-xl border border-purple-500/40">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white">إدارة المستخدمين والأدوار</h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="بحث بالاسم أو البريد..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500 w-full md:w-64"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">كل الأدوار</option>
            <option value="Admin">مشرف (Admin)</option>
            <option value="Teacher">مدرس (Teacher)</option>
            <option value="Student">طالب (Student)</option>
          </select>
          <select 
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">كل الباقات</option>
            <option value="Free">مجانية (Free)</option>
            <option value="Smart">ذكية (Smart)</option>
            <option value="VIP">ذهبية (VIP)</option>
          </select>
          <button 
            onClick={fetchUsers}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition"
            title="تحديث القائمة"
          >
            <Users className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <th className="px-6 py-4 font-black">المستخدم</th>
              <th className="px-6 py-4 font-black">الدور (Role)</th>
              <th className="px-6 py-4 font-black">الباقة (Plan)</th>
              <th className="px-6 py-4 font-black">النشاط</th>
              <th className="px-6 py-4 font-black">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-600 text-sm">
                  لا يوجد مستخدمين يطابقون خيارات البحث
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-800/30 transition group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                        {u.displayName ? u.displayName[0].toUpperCase() : (u.email?.[0].toUpperCase() || 'U')}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-200">{u.displayName || 'بدون اسم'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                        <div className="text-[9px] text-slate-600 font-mono mt-0.5">UID: {u.uid.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={u.role}
                      onChange={(e) => handleUpdateUser(u.uid, { role: e.target.value as any })}
                      disabled={updatingId === u.uid}
                      className={`text-xs px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none transition ${
                        u.role === 'Admin' ? 'text-purple-400 border-purple-500/30' : 
                        u.role === 'Teacher' ? 'text-blue-400 border-blue-500/30' : 'text-slate-400'
                      }`}
                    >
                      <option value="Admin">مشرف (Admin)</option>
                      <option value="Teacher">مدرس (Teacher)</option>
                      <option value="Student">طالب (Student)</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={u.plan}
                      onChange={(e) => handleUpdateUser(u.uid, { plan: e.target.value as any })}
                      disabled={updatingId === u.uid}
                      className={`text-xs px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 focus:outline-none transition ${
                        u.plan === 'VIP' ? 'text-amber-400 border-amber-500/30' : 
                        u.plan === 'Smart' ? 'text-emerald-400 border-emerald-500/30' : 'text-slate-400'
                      }`}
                    >
                      <option value="Free">مجانية (Free)</option>
                      <option value="Smart">ذكية (Smart)</option>
                      <option value="VIP">ذهبية (VIP)</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">الأسئلة:</span>
                        <span className="text-slate-300 font-bold">{u.totalQuestionsAsked}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">المتبقي:</span>
                        <span className="text-cyan-400 font-bold">{u.plan !== 'Free' ? '∞' : u.remainingQuestions}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                    <div className="text-[9px] opacity-50 mt-1">{new Date(u.createdAt).toLocaleTimeString('ar-EG')}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
        <p className="text-[10px] text-slate-500">
          إجمالي المستخدمين في النظام: <span className="text-white font-bold">{users.length}</span>
        </p>
        <div className="flex items-center gap-2 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-slate-400">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-400">Teacher</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span className="text-slate-400">Student</span>
          </div>
        </div>
      </div>
    </div>
  );
};
