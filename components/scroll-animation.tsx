"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

interface ScrollAnimationProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  duration?: number
  threshold?: number
  once?: boolean
}

export default function ScrollAnimation({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.5,
  threshold = 0.1,
  once = true,
}: ScrollAnimationProps) {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: once,
  })

  const directionOffset = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  }

  const initial = {
    opacity: 0,
    ...directionOffset[direction],
  }

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
