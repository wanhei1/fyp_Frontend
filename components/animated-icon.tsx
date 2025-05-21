"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface AnimatedIconProps {
  icon: LucideIcon
  className?: string
  size?: number
  color?: string
  hoverColor?: string
  hoverScale?: number
  hoverRotate?: number
  delay?: number
}

export default function AnimatedIcon({
  icon: Icon,
  className = "",
  size = 24,
  color = "currentColor",
  hoverColor,
  hoverScale = 1.2,
  hoverRotate = 0,
  delay = 0,
}: AnimatedIconProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, type: "spring" }}
      whileHover={{
        scale: hoverScale,
        rotate: hoverRotate,
        color: hoverColor || color,
      }}
      className={`transition-colors duration-300 ${className}`}
    >
      <Icon size={size} color={color} />
    </motion.div>
  )
}
