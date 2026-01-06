"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { RotateCcw, Plus, MonitorPlay } from "lucide-react";

export default function Home() {
  const [min, setmin] = useState(0);
  const [sec, setsec] = useState(0);
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    console.log(isActive);
    if (isActive) {
      interval = setInterval(() => {
        setsec((prev) => {
          if (prev >= 59) {
            setmin((min) => min + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950 text-white">
      <h1 className={`text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 
                     to-cyan-300 bg-clip-text text-transparent
                     ${isActive ? "text-blue-400" : ""}`}
      >
        ピアノ学習帳
      </h1>

      <div className={`p-8 border border-slate-800 rounded-2xl 
                      bg-slate-900/50 backdrop-blur-sm 
                      shadow-xl text-center
                      `}
      >
        <p className="text-slate-400 mb-2">今日の練習時間</p>
        <div className="text-6xl font-mono font-bold mb-8 text-blue-400">{min}:{sec.toString().padStart(2, "0")}
        </div>

        <div className="flex gap-4 item-center">
          <Button
            onClick={() => setIsActive(true)}
            className="bg-blue-600 hover:bg-blue-500"
          >
            <Plus className="mr-2 h-5 w-5" />1分
          </Button>
          <Button
            onClick={() => setIsActive(!isActive)}
            className="bg-blue-600 hover:bg-green-500 transition-colors animation-pulse"
          >
            <MonitorPlay size={16} />{isActive ? "一時停止" : "練習開始"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setmin(0);
              setsec(0);
              console.log("reset");
            }}
            className="text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            リセット
          </Button>
        </div>
      </div>
    </main>
  );
}