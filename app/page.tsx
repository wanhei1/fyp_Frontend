"use client";

import { Suspense } from "react";
import JumpAnalyzerForm from "@/components/jump-analyzer-form";
import ResultsPanel from "@/components/results-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import ParticleBackground from "@/components/particle-background";
import AnimatedTitle from "@/components/animated-title";
import IceFlakesContainer from "@/components/ice-flakes-container";
import AnimatedIcon from "@/components/animated-icon";
import { Code, Snowflake, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/40 relative overflow-hidden">
      <ParticleBackground />
      <IceFlakesContainer />

      <div className="absolute top-20 right-10 opacity-20 dark:opacity-10 pointer-events-none">
        <Snowflake size={120} strokeWidth={1} />
      </div>
      <div className="absolute bottom-20 left-10 opacity-20 dark:opacity-10 pointer-events-none">
        <Sparkles size={100} strokeWidth={1} />
      </div>

      <header className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <AnimatedIcon
              icon={Code}
              size={32}
              className="mr-3 text-blue-500"
              hoverRotate={180}
              hoverScale={1.3}
            />
            <AnimatedTitle
              text="滑冰跳跃分析器"
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 text-transparent bg-clip-text"
            />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="order-1 lg:order-1">
            <Suspense
              fallback={<Skeleton className="h-[600px] w-full rounded-xl" />}
            >
              <JumpAnalyzerForm />
            </Suspense>
          </div>

          <div className="order-2 lg:order-2">
            <Suspense
              fallback={<Skeleton className="h-[600px] w-full rounded-xl" />}
            >
              <ResultsPanel />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
