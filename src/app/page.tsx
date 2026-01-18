"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { RotateCcw, Plus, MonitorPlay, History, Settings, Trash2 } from "lucide-react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"

// 型定義
interface Log {
  _id: string;
  duration: number;
  createdAt: string;
}

export default function Home() {
  const [min, setmin] = useState(0);
  const [sec, setsec] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isPending, setIsPenting] = useState(false);
  const { user, isLoaded } = useUser();

  const totalSeconds = logs.reduce((sum, log) => sum + log.duration, 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);

  const handleSave = async () => {
    setIsPenting(true); // 1. 保存開始！
    try {
      const response = await fetch('/api/save-time', {
        method: 'POST',
        // ... 他の設定
      });
      // 保存成功後の処理
    } catch (error) {
      console.error(error);
    } finally {
      setIsPenting(false); // 2. 成功しても失敗しても、保存終了！
    }
  };

  // --- 履歴を取得する関数 ---
  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/save-time");
      if (!res.ok) throw new Error("ネットワークエラー");
      const json = await res.json();
      if (json && json.data) {
        setLogs(json.data);
      } else if (Array.isArray(json)) {
        setLogs(json);
      }
    } catch (err) {
      console.error("履歴取得エラー:", err);
    }
  };

  useEffect(() => {
    if (user) fetchLogs();
  }, [user]);

  // --- タイマーロジック ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setsec((prev) => {
          if (prev === 59) {
            setmin((m) => m + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isLoaded) return null;

  // --- 保存関数 ---
  const saveTime = async () => {
    if (!user) return alert("ログインしてください");
    if (min === 0 && sec === 0) {
      alert("練習時間を計測してから保存してください");
      return;
    }

    try {
      const response = await fetch("/api/save-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: min * 60 + sec }),
      });
      if (response.ok) {
        alert("保存しました！");
        setmin(0);
        setsec(0);
        setIsActive(false);
        fetchLogs();
      }
    } catch (error) {
      alert("エラーが発生しました");
    }
  };

  // --- 削除関数 ---
  const deleteLog = async (id: string) => {
    if (!confirm("この練習記録を削除してもよろしいですか？")) return;
    try {
      const response = await fetch(`/api/save-time?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchLogs();
      } else {
        alert("削除に失敗しました");
      }
    } catch (error) {
      alert("通信エラーが発生しました");
    }
  };

  // --- カレンダーの内容設定 ---
  const getTileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const dateString = date.toLocaleDateString();
      const dailyLogs = logs.filter(log => new Date(log.createdAt).toLocaleDateString() === dateString);

      if (dailyLogs.length > 0) {
        const totalSec = dailyLogs.reduce((sum, log) => sum + log.duration, 0);
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;

        return (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute inset-0">
                  <div className="absolute inset-0 flex items-end justify-center pb-1 z-10">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_5px_rgba(96,165,250,0.8)]" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800 border-slate-700 text-slate-100 shadow-xl">
                <p className="text-xs font-medium">練習時間: <span className="text-blue-400">{mins}分{secs}秒</span></p>
                <p className="text-[10px] text-slate-500 border-t border-slate-700 pt-1">練習回数: {dailyLogs.length}回</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    }
    return null;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center p-4 relative overflow-y-auto">
      <div className="absolute top-8 right-8 z-10">
        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-full border border-slate-800 backdrop-blur-sm">
          {!user ? (
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium hover:text-blue-400 transition-colors">Sign In</button>
            </SignInButton>
          ) : (
            <>
              <button onClick={saveTime} disabled={isPending} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all">
                {isPending ? (
                  <span className="flex items-center">
                    {/* 小さなぐるぐるアイコン（SVG） */}
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </span>
                ) : (
                  '保存する'
                )}
              </button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:text-white hover:bg-slate-800">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                      <Settings className="h-5 w-5" />設定・統計
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs">
                      アカウント管理と履歴の削除が可能です。
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4 space-y-6">
                    <div className="flex items-center p-4 bg-slate-800 rounded-xl border border-slate-700">
                      <div className="mr-4 flex-shrink-0">
                        <UserButton afterSignOutUrl="/" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">アカウント</p>
                        <p className="text-xs font-medium text-slate-100 break-all">{user.primaryEmailAddress?.emailAddress}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">総練習回数</p>
                        <p className="text-xl font-bold text-blue-500">{logs.length}回</p>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">累計時間</p>
                        <p className="text-xl font-bold text-blue-400">
                          {totalHours > 0 ? `${totalHours}h ` : ""}{totalMinutes}m
                        </p>
                      </div>
                    </div>

                    {/* 履歴の削除リスト */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase px-1">最近の履歴</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {logs.length > 0 ? (
                          [...logs].reverse().slice(0, 10).map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 group">
                              <div className="text-sm">
                                <span className="text-slate-400 mr-3">{new Date(item.createdAt).toLocaleDateString()}</span>
                                <span className="font-mono text-blue-400 font-bold">
                                  {Math.floor(item.duration / 60)}分{item.duration % 60}秒
                                </span>
                              </div>
                              <button
                                onClick={() => deleteLog(item._id)}
                                className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-xs text-slate-600 py-4">履歴がありません</p>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <h1 className="text-4xl font-bold mt-20 mb-8 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
        ピアノ学習帳
      </h1>

      <div className="text-6xl font-mono font-bold mb-8 text-blue-400">
        {min}:{sec.toString().padStart(2, "0")}
      </div>

      <div className="flex gap-4 mb-12">
        <Button onClick={() => setmin(min + 1)} className="bg-blue-600 hover:bg-blue-500"><Plus className="mr-2 h-5 w-5" />1分</Button>
        <Button onClick={() => setIsActive(!isActive)} className={isActive ? "bg-red-600" : "bg-green-600"}>
          <MonitorPlay className="mr-2 h-5 w-5" />{isActive ? "停止" : "開始"}
        </Button>
        <Button variant="outline" onClick={() => { setIsActive(false); setmin(0); setsec(0); }} className="border-slate-700">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      <div className="w-full max-w-md bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold"><History className="w-5 h-5 text-blue-400" /> 練習カレンダー</h2>
        <div className="text-slate-900 rounded-lg overflow-hidden">
          <Calendar
            locale="ja-JP"
            tileContent={getTileContent}
            tileClassName={({ date, view }) => {
              if (view === 'month') {
                const dateStr = date.toLocaleDateString();
                const hasLog = logs.some(l => new Date(l.createdAt).toLocaleDateString() === dateStr);
                return hasLog ? 'highlight-practice' : null;
              }
            }}
          />
        </div>
      </div>

      <style jsx global>{`
        .react-calendar { border: none !important; width: 100% !important; background: white !important; border-radius: 12px; padding: 10px; }
        .react-calendar__tile { position: relative; border-radius: 8px !important; }
        .react-calendar__tile--now { background: none !important; border: 2px solid #00000077 !important; color: #3b82f6 !important; }
        .highlight-practice { background: #3b82f6 !important; color: white !important; }
        .react-calendar__tile--active.highlight-practice { background: #3b82f6 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </main>
  );
}