"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface ShineEffectProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  angle?: number
}

export default function ShineEffect({
  children,
  className = "",
  delay = 0,
  duration = 2,
  angle = 45,
}: ShineEffectProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 0.5, 0],
          left: ["-100%", "200%", "200%"],
        }}
        transition={{
          duration,
          delay,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 5,
        }}
        style={{
          background: `linear-gradient(${angle}deg, transparent, rgba(255, 255, 255, 0.5), transparent)`,
        }}
      />
    </div>
  )
}
