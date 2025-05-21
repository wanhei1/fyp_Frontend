"use client"

import { Moon, Sun, Stars } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-10 h-10 bg-white/20 dark:bg-gray-800/40 backdrop-blur-sm relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 dark:from-blue-400/20 dark:to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            animate={{
              background:
                theme === "dark"
                  ? "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(0, 0, 0, 0) 70%)"
                  : "radial-gradient(circle, rgba(253, 224, 71, 0.2) 0%, rgba(0, 0, 0, 0) 70%)",
            }}
          />
          <motion.div
            animate={{
              rotate: theme === "dark" ? 360 : 0,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 0.5, type: "spring" },
              scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </motion.div>
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: theme === "dark" ? [0, 0.5, 0] : 0 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
          >
            <Stars className="absolute h-3 w-3 text-yellow-300" style={{ top: "20%", left: "25%" }} />
            <Stars className="absolute h-2 w-2 text-yellow-300" style={{ top: "60%", left: "65%" }} />
            <Stars className="absolute h-2 w-2 text-yellow-300" style={{ top: "40%", left: "85%" }} />
          </motion.div>
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-gray-200 dark:border-gray-800"
      >
        <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
          <Sun className="h-4 w-4 mr-2 text-amber-500" />
          浅色模式
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
          <Moon className="h-4 w-4 mr-2 text-blue-500" />
          深色模式
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
          <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          系统默认
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
