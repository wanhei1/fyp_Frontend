"use client"

import { motion } from "framer-motion"

interface IceFlakeProps {
  size?: number
  top?: string
  left?: string
  right?: string
  bottom?: string
  delay?: number
  duration?: number
  opacity?: number
  color?: string
}

export default function IceFlake({
  size = 30,
  top,
  left,
  right,
  bottom,
  delay = 0,
  duration = 20,
  opacity = 0.3,
  color = "#a5b4fc",
}: IceFlakeProps) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        opacity,
      }}
      initial={{ scale: 0.5, rotate: 0 }}
      animate={{
        scale: [0.5, 0.8, 0.5],
        rotate: 360,
        opacity: [opacity, opacity * 1.5, opacity],
      }}
      transition={{
        duration,
        repeat: Number.POSITIVE_INFINITY,
        delay,
        ease: "linear",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
        <path d="M7.76 7.76 16.24 16.24M16.24 7.76 7.76 16.24" />
      </svg>
    </motion.div>
  )
}
