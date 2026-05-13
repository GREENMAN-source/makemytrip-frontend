import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export default function NotificationToast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMsg("Flight AI-302 is Delayed by 15 mins due to weather.");
    }, 5000); // Pops up after 5 seconds
    return () => clearTimeout(timer);
  }, []);

  if (!msg) return null;

  return (
    <div className="fixed bottom-10 right-10 bg-slate-900 text-white p-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-10">
      <div className="bg-blue-500 p-2 rounded-full">
        <Bell size={20} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time Update</p>
        <p className="text-sm font-medium">{msg}</p>
      </div>
      <button onClick={() => setMsg(null)} className="ml-4 text-slate-500 hover:text-white">
        <X size={18} />
      </button>
    </div>
  );
}