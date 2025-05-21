"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface PulseButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  pulseColor?: string
  pulseSize?: number
}

export default function PulseButton({
  children,
  onClick,
  className = "",
  disabled = false,
  variant = "default",
  size = "default",
  pulseColor = "rgba(59, 130, 246, 0.5)",
  pulseSize = 100,
}: PulseButtonProps) {
  return (
    <div className="relative inline-flex">
      <Button onClick={onClick} className={className} disabled={disabled} variant={variant} size={size}>
        {children}
      </Button>
      {!disabled && (
        <motion.span
          className="absolute inset-0 rounded-md pointer-events-none"
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
          style={{ backgroundColor: pulseColor }}
        />
      )}
    </div>
  )
}
