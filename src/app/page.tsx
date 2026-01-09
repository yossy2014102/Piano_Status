"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { RotateCcw, Plus, MonitorPlay } from "lucide-react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const [min, setmin] = useState(0);
  const [sec, setsec] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const { user, isLoaded } = useUser();

  // --- タイマーを動かす仕組み ---
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

  // --- 【修正ポイント1】Loading判定は関数の外に出す ---
  if (!isLoaded) {
    return null; // または Loading... という文字
  }

  // --- 保存関数 ---
  const saveTime = async () => {
    if (!user) return alert("ログインしてください");

    try {
      const response = await fetch("/api/save-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration: min * 60 + sec,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "保存に失敗しました");
      }

      alert("保存しました");
    } catch (error: any) {
      console.error(error);
      alert("エラー: " + error.message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* ログイン・ユーザー管理エリア */}
      <div className="absolute top-8 right-8 z-10">
        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-full border border-slate-800 backdrop-blur-sm">
          {!user ? (
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium hover:text-blue-400 transition-colors">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <>
              <UserButton afterSignOutUrl="/" />
              <button
                onClick={saveTime}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-green-900/20"
              >
                練習時間を保存
              </button>
            </>
          )}
        </div>
      </div>

      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
        ピアノ学習帳
      </h1>

      <p className="text-slate-400 mb-2">今日の練習時間</p>
      <div className="text-6xl font-mono font-bold mb-8 text-blue-400">
        {min}:{sec.toString().padStart(2, "0")}
      </div>

      <div className="flex gap-4 items-center justify-center">
        <Button onClick={() => setmin(min + 1)} className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/40">
          <Plus className="mr-2 h-5 w-5" />1分
        </Button>

        <Button
          onClick={() => setIsActive(!isActive)}
          className={`transition-colors w-32 ${isActive ? "bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/40" : "bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/40"}`}
        >
          <MonitorPlay className="mr-2 h-5 w-5" />
          {isActive ? "停止" : "開始"}
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            setIsActive(false);
            setmin(0);
            setsec(0);
          }}
          className="border-slate-700 hover:bg-slate-800 text-slate-300"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          リセット
        </Button>
      </div>
    </main>
  );
}