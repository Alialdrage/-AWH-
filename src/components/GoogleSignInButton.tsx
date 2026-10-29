import React from 'react';
import { User } from 'firebase/auth';
import { LogOut, Cloud, CheckCircle2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  user: User | null;
  isLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  user,
  isLoading,
  onSignIn,
  onSignOut,
}) => {
  if (user) {
    return (
      <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-full pl-2 pr-4 py-1.5 shadow-md">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/30"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-xs font-bold text-white">
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}

        <div className="flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-200 leading-tight">
            {user.displayName || 'مستخدم Google'}
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-2.5 h-2.5" />
            متصل بـ Google Drive
          </span>
        </div>

        <button
          onClick={onSignOut}
          className="mr-2 p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition"
          title="تسجيل الخروج من Google Drive"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onSignIn}
      disabled={isLoading}
      className="inline-flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs rounded-xl shadow-md transition border border-slate-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      title="تسجيل الدخول باستخدام Google لربط ملفات Google Drive"
    >
      {/* Official Google 'G' Logo SVG */}
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 flex-shrink-0">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
      </svg>
      <span>{isLoading ? 'جاري الاتصال...' : 'ربط Google Drive'}</span>
    </button>
  );
};
