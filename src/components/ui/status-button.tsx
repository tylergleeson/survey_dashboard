"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface StatusButtonProps {
  initialStatus?: boolean
  onToggle?: (status: boolean) => void
  className?: string
}

export default function StatusButton({ initialStatus = false, onToggle, className }: StatusButtonProps) {
  const [isOnline, setIsOnline] = useState(initialStatus)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<"online" | "offline" | null>(null)
  const [showParticles, setShowParticles] = useState(false)

  const handleToggle = () => {
    setIsAnimating(true)
    setDirection(isOnline ? "offline" : "online")

    // Show particles when going online
    if (!isOnline) {
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 1000)
    }

    setTimeout(() => {
      const newStatus = !isOnline
      setIsOnline(newStatus)
      if (onToggle) {
        onToggle(newStatus)
      }

      // Keep animation going a bit longer after state change
      setTimeout(() => {
        setIsAnimating(false)
        setDirection(null)
      }, 800)
    }, 400)
  }

  // Generate random particles for the celebration effect
  const particles = Array.from({ length: 20 }).map((_, i) => {
    const angle = Math.random() * Math.PI * 2
    const distance = 30 + Math.random() * 70
    const duration = 0.6 + Math.random() * 0.8
    const size = 5 + Math.random() * 8
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance

    return {
      id: i,
      x,
      y,
      size,
      duration,
      color: `hsl(${Math.random() * 60 + 200}, 100%, 70%)`,
    }
  })

  return (
    <div className="relative flex items-center justify-center overflow-visible">
      {/* Celebration particles when going online */}
      {showParticles && (
        <div className="absolute inset-0 z-10">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full opacity-0 animate-particle"
              style={
                {
                  left: "50%",
                  top: "50%",
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  transform: `translate(-50%, -50%)`,
                  animation: `particle ${particle.duration}s ease-out forwards`,
                  "--x": `${particle.x}px`,
                  "--y": `${particle.y}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* Flash and Ripple overlays OUTSIDE the button to avoid clipping */}
      {isAnimating && direction === "online" && (
        <div className="absolute z-20 inset-0 rounded-full bg-blue-100 animate-flash-bright pointer-events-none"></div>
      )}
      {isAnimating && (
        <div
          className={cn(
            "absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ripple pointer-events-none",
            direction === "online" ? "bg-blue-400/30" : "bg-gray-400/30",
          )}
          style={{ width: '100%', height: '100%' }}
        ></div>
      )}

      <button
        onClick={handleToggle}
        className={cn(
          "relative z-10 w-32 h-32 rounded-full transition-all duration-700 transform focus:outline-none focus:ring-4 focus:ring-offset-2 overflow-hidden",
          isOnline
            ? "bg-gradient-to-r from-slate-600 to-slate-700 shadow-[0_0_25px_rgba(100,116,139,0.6)]"
            : "bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg",
          isAnimating && direction === "offline"
            ? "scale-90 animate-deflate"
            : isAnimating && direction === "online"
              ? "scale-110 animate-power-up"
              : !isOnline
                ? "hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(96,165,250,0.5)]"
                : "hover:scale-105",
          isOnline ? "focus:ring-slate-400" : "focus:ring-blue-400",
          className,
        )}
        aria-pressed={isOnline}
        aria-label={isOnline ? "Go offline" : "Go online"}
        disabled={isAnimating}
      >
        {/* Radial gradient background */}
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-700",
            isAnimating && direction === "online"
              ? "opacity-80 bg-[radial-gradient(circle,_rgba(255,255,255,0.9)_0%,_rgba(96,165,250,0)_70%)]"
              : isAnimating && direction === "offline"
                ? "opacity-30 bg-[radial-gradient(circle,_rgba(200,200,200,0.5)_0%,_rgba(100,116,139,0)_70%)]"
                : isOnline
                  ? "opacity-50 bg-[radial-gradient(circle,_rgba(255,255,255,0.5)_0%,_rgba(100,116,139,0)_70%)]"
                  : "opacity-40 bg-[radial-gradient(circle,_rgba(255,255,255,0.6)_0%,_rgba(107,114,128,0)_70%)]",
          )}
        />

        {/* Inner circle */}
        <div
          className={cn(
            "relative absolute inset-1 rounded-full flex items-center justify-center transition-all duration-700",
            isAnimating && direction === "offline" ? "scale-90" : "",
            isAnimating && direction === "online" ? "scale-105" : "",
            isOnline ? "bg-slate-500" : "bg-gradient-to-br from-blue-300 to-gray-300",
          )}
        >
          {/* White ripple effect around 'GO' when offline */}
          {!isOnline && (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-2 border-white bg-transparent pointer-events-none z-0 white-ripple-slow"
            />
          )}
          <span
            className={cn(
              "font-bold text-xl transition-all duration-500 flex items-center gap-1 z-10",
              isAnimating ? "opacity-0" : "opacity-100",
              isOnline ? "text-white" : "text-gray-700",
            )}
          >
            {isOnline ? "OFF" : "GO"}
          </span>
        </div>
      </button>

      {/* Hidden div to ensure Tailwind JIT picks up the animation class */}
      <div className="hidden animate-white-ripple"></div>

      {/* Hidden div to force Tailwind to include the animation */}
      <div className="hidden animate-white-ripple-slow"></div>
    </div>
  )
} 