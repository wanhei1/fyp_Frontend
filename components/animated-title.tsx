"use client"

import { motion } from "framer-motion"

interface AnimatedTitleProps {
  text: string
  className?: string
}

export default function AnimatedTitle({ text, className = "" }: AnimatedTitleProps) {
  // Split text into individual characters
  const characters = text.split("")

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.01,
      },
    },
  }

  const child = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
  }

  return (
    <motion.h1 className={`inline-block ${className}`} variants={container} initial="hidden" animate="visible">
      {characters.map((char, index) => (
        <motion.span key={index} variants={child} className="inline-block">
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  )
}
