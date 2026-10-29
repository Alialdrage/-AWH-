import React, { useState, useEffect, useRef } from 'react';
import { Lock, Mic, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminLogin = ({ onAuthSuccess, onNotify }: { onAuthSuccess: () => void, onNotify: (msg: string, type: 'success' | 'error' | 'info') => void }) => {
  const [password, setPassword] = useState('');
  const [isVoiceAuthenticated, setIsVoiceAuthenticated] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Speech recognition setup
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ar-IQ'; // Iraqi Arabic
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.includes('طالب حوزة')) {
          setIsVoiceAuthenticated(true);
          onNotify('تم التحقق من البصمة الصوتية بنجاح!', 'success');
        } else {
          onNotify('لم يتم التعرف على العبارة الصحيحة، حاول مرة أخرى.', 'error');
        }
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        onNotify('حدث خطأ في التعرف على الصوت.', 'error');
      };
    }
  }, [onNotify]);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      onNotify('متصفحك لا يدعم التعرف على الصوت.', 'error');
    }
  };

  const handleLogin = () => {
    if (password === 'admin123' && isVoiceAuthenticated) {
      onAuthSuccess();
    } else {
      onNotify('كلمة السر أو البصمة الصوتية غير صحيحة.', 'error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 bg-slate-900 rounded-3xl border border-slate-700">
      <Lock className="w-16 h-16 text-cyan-500 mb-6" />
      <h2 className="text-2xl font-bold mb-6 text-white">دخول لوحة تحكم الأدمن</h2>
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="كلمة السر"
        className="w-full max-w-sm p-3 mb-4 rounded-xl bg-slate-950 border border-slate-700 text-white"
      />
      
      <button
        onClick={startListening}
        className={`flex items-center gap-2 px-6 py-3 mb-4 rounded-xl font-bold transition ${isVoiceAuthenticated ? 'bg-emerald-600' : 'bg-cyan-600'} text-white`}
      >
        <Mic className="w-5 h-5" />
        {isListening ? 'جاري الاستماع...' : isVoiceAuthenticated ? 'البصمة الصوتية تم التحقق منها' : 'التحقق من البصمة الصوتية (طالب حوزة)'}
      </button>

      <button
        onClick={handleLogin}
        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition w-full max-w-sm"
      >
        دخول
      </button>
    </div>
  );
};
