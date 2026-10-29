import React, { useState, useEffect } from 'react';
import {
  Cloud,
  FileText,
  Image as ImageIcon,
  Code,
  Trash2,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  DriveItem,
  listDriveFiles,
  deleteFileFromDrive,
  googleSignIn,
} from '../services/googleDriveService';
import { SocialShareBar } from './SocialShareBar';

interface DriveHubViewProps {
  user: User | null;
  isDriveConnected: boolean;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onRequestDriveConfirmation: (details: {
    title: string;
    message: string;
    itemDetails: string;
    onConfirm: () => Promise<void>;
  }) => void;
  onTriggerSignIn: () => void;
  onNavigateHome?: () => void;
}

export const DriveHubView: React.FC<DriveHubViewProps> = ({
  user,
  isDriveConnected,
  onNotify,
  onRequestDriveConfirmation,
  onTriggerSignIn,
  onNavigateHome,
}) => {
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'image' | 'text' | 'json'>('all');

  const fetchFiles = async () => {
    if (!isDriveConnected) return;
    setLoading(true);
    try {
      const driveFiles = await listDriveFiles();
      setFiles(driveFiles);
    } catch (err: any) {
      console.error(err);
      onNotify(err.message || 'تعذر جلب ملفات Google Drive', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDriveConnected) {
      fetchFiles();
    }
  }, [isDriveConnected]);

  const handleDeleteFile = (file: DriveItem) => {
    // MANDATORY USER CONFIRMATION FOR DESTRUCTIVE OPERATIONS
    onRequestDriveConfirmation({
      title: 'حذف ملف من Google Drive',
      message: `هل أنت متأكد من رغبتك في حذف الملف "${file.name}" نهائياً من حساب Google Drive الخاص بك؟ هذا الإجراء لا يمكن التراجع عنه.`,
      itemDetails: `اسم الملف: ${file.name}\nالمعرف: ${file.id}\nالنوع: ${file.mimeType}`,
      onConfirm: async () => {
        await deleteFileFromDrive(file.id);
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
        onNotify(`تم حذف الملف "${file.name}" من Google Drive`, 'success');
      },
    });
  };

  const filteredFiles = files.filter((f) => {
    if (filter === 'all') return true;
    if (filter === 'image') return f.mimeType.startsWith('image/');
    if (filter === 'text') return f.mimeType.includes('text') || f.mimeType.includes('markdown');
    if (filter === 'json') return f.mimeType.includes('json');
    return true;
  });

  return (
    <div className="space-y-6">
      <SocialShareBar onNotify={onNotify} onNavigateHome={onNavigateHome} />

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Cloud className="w-6 h-6 text-cyan-400" />
            <span>مدير ملفات Google Drive (Cloud Workspace)</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            إدارة، استعراض، وتنظيم تقارير التحليل والصور المعمارية المولدة المخزنة في حساب Google Drive الخاص بك.
          </p>
        </div>

        {isDriveConnected && (
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition shadow-sm self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث القائمة</span>
          </button>
        )}
      </div>

      {!isDriveConnected ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-md shadow-xl text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
            <Cloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">اربط حساب Google Drive الخاص بك</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            يتيح لك الربط تخزين تقارير التحليل العميق، والصور فائقة الدقة (1K, 2K, 4K)، ومخططات المشاريع المعمارية، والملفات البيولوجية مباشرة في مجلدك السحابي مع الاحتفاظ بخصوصية ملفاتك الكاملة وبإذنك الصريح.
          </p>
          <div className="pt-2">
            <button
              onClick={onTriggerSignIn}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-xl shadow-lg transition active:scale-95"
            >
              <span>تسجيل الدخول وربط Google Drive</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filter tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-2.5 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: `جميع الملفات (${files.length})` },
                { id: 'text', label: 'التقارير والمستندات' },
                { id: 'image', label: 'الصور المولدة' },
                { id: 'json', label: 'المخططات البرمجية' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    filter === tab.id
                      ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>متصل بحساب: {user?.email}</span>
            </div>
          </div>

          {/* Files List / Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>جاري تحميل الملفات من Google Drive...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 space-y-2">
              <FolderOpen className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">لا توجد ملفات في هذا التصنيف حالياً</p>
              <p className="text-xs text-slate-500">
                يمكنك توليد تقرير تحليل أو صورة 4K أو حزمة مشروع واستخدام زر "حفظ في Google Drive" لإضافتها هنا.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredFiles.map((file) => {
                const isImage = file.mimeType.startsWith('image/');
                const isCode = file.mimeType.includes('json');

                return (
                  <div
                    key={file.id}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between shadow-lg backdrop-blur-md"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
                        <div className="flex items-center gap-2">
                          {isImage ? (
                            <ImageIcon className="w-4 h-4 text-indigo-400" />
                          ) : isCode ? (
                            <Code className="w-4 h-4 text-amber-400" />
                          ) : (
                            <FileText className="w-4 h-4 text-cyan-400" />
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            {file.createdTime
                              ? new Date(file.createdTime).toLocaleDateString('ar-EG')
                              : 'حديثاً'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteFile(file)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="حذف الملف من Google Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="font-semibold text-xs text-slate-200 line-clamp-2 leading-snug font-mono">
                        {file.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 truncate font-mono">
                        {file.mimeType}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {file.size ? `${(parseInt(file.size, 10) / 1024).toFixed(1)} KB` : 'ملف سحابي'}
                      </span>

                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          <span>فتح في Drive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
