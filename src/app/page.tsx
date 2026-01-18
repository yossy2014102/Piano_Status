"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { RotateCcw, Plus, MonitorPlay, History, Settings } from "lucide-react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import Calendar from 'react-calendar'; // 追加
import 'react-calendar/dist/Calendar.css'; // 標準スタイル
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
  const [logs, setLogs] = useState<Log[]>([]); // 履歴用
  const { user, isLoaded } = useUser();
  const totalSeconds = logs.reduce((sum, log) => sum + log.duration, 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);

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

    // --- 追加：0分0秒のときは保存させない ---
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
        fetchLogs(); // カレンダーを更新
      }
    } catch (error) {
      alert("エラーが発生しました");
    }
  };

  const getTileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const dateString = date.toLocaleDateString();
      const dailyLogs = logs.filter(log => new Date(log.createdAt).toLocaleDateString() === dateString);

      if (dailyLogs.length > 0) {
        const totalSeconds = dailyLogs.reduce((sum, log) => sum + log.duration, 0);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return (
          <TooltipProvider delayDuration={0}> {/* delayDuration={0} で即表示 */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute inset-0">
                  <div className="absolute inset-0 flex items-end justify-center pb-1 z-10">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_5px_rgba(96,165,250,0.8)]" />
                  </div>
                  <div className="absolute inset-0 z-10" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800 border-slate-700 text-slate-100 shadow-xl">
                <p className="text-xs font-medium">
                  練習時間: <span className="text-blue-400">{minutes}分{seconds}秒</span>
                </p>
                <p className="text-[10px] text-slate-500 border-t border-slate-700 pt-1">
                  練習回数: {dailyLogs.length}回
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    }
    return null;
  };

  // カレンダーの「練習した日」を特定する関数
  const getTileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const dateString = date.toLocaleDateString();
      const hasLog = logs.some(log => new Date(log.createdAt).toLocaleDateString() === dateString);
      return hasLog ? 'highlight-practice' : null; // 練習した日にクラスを付与
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center p-4 relative overflow-y-auto">
      {/* ログインエリア */}
      <div className="absolute top-8 right-8 z-10">
        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-full border border-slate-800 backdrop-blur-sm">
          {!user ? (
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium hover:text-blue-400 transition-colors">Sign In</button>
            </SignInButton>
          ) : (
            <>
              <button onClick={saveTime} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all">
                保存
              </button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:text-white hover:bg-slate-800">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />設定
                    </DialogTitle>

                    <DialogDescription className="text-slate-500 text-xs">
                      アカウント管理と練習データの確認ができます。
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-6 space-y-6">
                    <div className="flex items-center justify-center juxtify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
                      <div className="mr-4 flex-shrink-0">
                        <UserButton afterSignOutUrl="/" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">アカウント</p>
                        <p className="text-xs font-medium text-slate-100 break-all">{user.primaryEmailAddress?.emailAddress}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-900 rounded-lg border text-center">
                        <p className="text-[10px] text-slate-100 uppercase">総練習回数</p>
                        <p className="text-xl font-bold text-blue-500">{logs.length}回</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-lg text-center">
                        <p className="text-[10px] text-slate-500 uppercase">累計データ</p>
                        <p className="text-xl font-bold text-blue-400">
                          {totalHours > 0 ? `${totalHours}h ` : ""}{totalMinutes}m
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-500/10 rounded-full border border-blue-500/20">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-[10px] font-medium text-blue-400 uppercase tracking-widest">クラウドに同期中</span>
                    </div>

                    <div className="text-[10px] text-center text-slate-600 uppercase tracking-tighter">
                      Piano Status v1.0.0
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

      {/* タイマー表示 */}
      <div className="text-6xl font-mono font-bold mb-8 text-blue-400">
        {min}:{sec.toString().padStart(2, "0")}
      </div>

      {/* コントロールボタン */}
      <div className="flex gap-4 mb-12">
        <Button onClick={() => setmin(min + 1)} className="bg-blue-600 hover:bg-blue-500"><Plus className="mr-2 h-5 w-5" />1分</Button>
        <Button onClick={() => setIsActive(!isActive)} className={isActive ? "bg-red-600" : "bg-green-600"}>
          <MonitorPlay className="mr-2 h-5 w-5" />{isActive ? "停止" : "開始"}
        </Button>
        <Button variant="outline" onClick={() => { setIsActive(false); setmin(0); setsec(0); }} className="border-slate-700">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* カレンダー表示 */}
      <div className="w-full max-w-md bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold"><History className="w-5 h-5 text-blue-400" /> 練習カレンダー</h2>
        <div className="text-slate-900 rounded-lg overflow-hidden">
          <Calendar
            locale="ja-JP"
            tileContent={getTileContent}
          />
        </div>
      </div>

      {/* スタイル調整（カレンダーの色など） */}
      <style jsx global>{`
        .react-calendar {
          border: none !important;
          width: 100% !important;
          background: white !important;
          border-radius: 12px;
          padding: 10px;
          font-family: sans-serif;
        }

        .highlight-practice::after {
          display: block;
          font-size: 8px;
          color: #3b82f6;
          margin-top: -5px;
        }

        .react-calendar__tile {
          position: relative;
          border-radius: 8px !important;
        }

        .react-calendar__tile--now {
          background: none !important;
          border: 2px solid #00000077 !important;
          color: #3b82f6 !important;
        }

        .react-calendar__tile:enabled:hover {
          background-color: #f1f5f9 !important;
        }

        .highlight-practice {
          background: #3b82f6 !important;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
        .react-calendar__tile--active.highlight-practice {
          background: #3b82f6 !important; /* 練習した日の青を維持 */
          color: white !important;
        }

/* 2. 練習していない日をクリックした時は、スタンプっぽくならないように白（または透明）にする */
        .react-calendar__tile--active:not(.highlight-practice) {
          background: #f1f5f9 !important; /* 選択したことがわかる程度の薄いグレー */
          color: #1e293b !important;
        }

/* 3. フォーカス（枠線）が気になる場合はこれも追加 */
        .react-calendar__tile:enabled:focus {
          background: inherit;
        }
      `}</style>
    </main >
  );
}