"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { motion } from "framer-motion"

interface JumpVideoPlayerProps {
  videoUrl: string
  jumpData: {
    start: number
    end: number
  }
}

export default function JumpVideoPlayer({ videoUrl, jumpData }: JumpVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [showVolumeControl, setShowVolumeControl] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handleEnd = () => setIsPlaying(false)

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", updateDuration)
    video.addEventListener("ended", handleEnd)

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("loadedmetadata", updateDuration)
      video.removeEventListener("ended", handleEnd)
    }
  }, [videoUrl])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }

    setIsPlaying(!isPlaying)
  }

  const resetVideo = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = 0
    setIsPlaying(false)
    video.pause()
  }

  const handleTimeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    video.volume = value[0]
    setVolume(value[0])
    setIsMuted(value[0] === 0)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  return (
    <div className="relative group">
      <video ref={videoRef} src={videoUrl} className="w-full h-auto bg-black" playsInline onClick={togglePlay} />

      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full bg-white/20 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm"
            onClick={togglePlay}
          >
            <motion.div
              animate={isPlaying ? { scale: [1, 0.8, 1] } : { rotate: 0 }}
              transition={{ duration: 0.5, repeat: isPlaying ? Number.POSITIVE_INFINITY : 0, repeatDelay: 2 }}
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-2 mb-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.01}
            onValueChange={handleTimeChange}
            className="h-1.5"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                onClick={resetVideo}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </motion.div>

            <div
              className="relative"
              onMouseEnter={() => setShowVolumeControl(true)}
              onMouseLeave={() => setShowVolumeControl(false)}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </motion.div>

              {showVolumeControl && (
                <motion.div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-900/90 backdrop-blur-sm rounded-lg w-24"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                >
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="h-1.5"
                  />
                </motion.div>
              )}
            </div>
          </div>

          <motion.span
            className="text-xs text-white font-mono"
            animate={isPlaying ? { opacity: [1, 0.7, 1] } : { opacity: 1 }}
            transition={{ duration: 2, repeat: isPlaying ? Number.POSITIVE_INFINITY : 0 }}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </motion.span>
        </div>
      </motion.div>
    </div>
  )
}
