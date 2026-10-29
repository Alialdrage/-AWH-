import React from 'react';
import { Share2, Globe, Video, MessageCircle, ExternalLink } from 'lucide-react';

interface SocialShareBarProps {
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateHome?: () => void;
}

export const SocialShareBar: React.FC<SocialShareBarProps> = ({ onNotify, onNavigateHome }) => {
  const socialLinks = [
    {
      name: 'فيسبوك (Facebook)',
      url: 'https://facebook.com',
      color: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30',
      icon: '📘',
    },
    {
      name: 'تيك توك (TikTok)',
      url: 'https://tiktok.com',
      color: 'bg-slate-900 hover:bg-black text-white border border-slate-700 shadow-slate-900/40',
      icon: '🎵',
    },
    {
      name: 'انستغرام (Instagram)',
      url: 'https://instagram.com',
      color: 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white shadow-purple-950/40',
      icon: '📸',
    },
    {
      name: 'تيليجرام (Telegram)',
      url: 'https://telegram.org',
      color: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/40',
      icon: '✈️',
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl my-4 text-xs" dir="rtl">
      {/* Home Button (Requested by User) */}
      {onNavigateHome && (
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition shadow-md active:scale-95"
        >
          <Globe className="w-4 h-4" />
          <span>العودة إلى الصفحة الرئيسية</span>
        </button>
      )}

      {/* Social Media Follow Buttons (Requested by User) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-slate-400 font-semibold flex items-center gap-1">
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>تابعنا على المنصات:</span>
        </span>
        {socialLinks.map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.preventDefault();
              window.open(item.url, '_blank');
              onNotify(`تم الانتقال إلى صفحة المنصة الرسمية على ${item.name}`, 'info');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition shadow-sm active:scale-95 ${item.color}`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        ))}
      </div>
    </div>
  );
};
