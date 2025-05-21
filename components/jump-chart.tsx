"use client"
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts"
import { motion } from "framer-motion"

interface JumpTimestamp {
  start: number
  end: number
}

interface JumpChartProps {
  jumpData: JumpTimestamp[]
}

export default function JumpChart({ jumpData }: JumpChartProps) {
  // Generate a simulated dataset based on the jump timestamps
  const generateChartData = () => {
    const data = []
    const videoLength = Math.max(...jumpData.map((jump) => jump.end)) + 5 // Add 5 seconds buffer

    // Generate data points every 0.1 seconds
    for (let time = 0; time < videoLength; time += 0.1) {
      const point = {
        time: Number.parseFloat(time.toFixed(1)),
        height: 0,
        velocity: 0,
        inJump: false,
      }

      // Check if this time point is within any jump
      for (const jump of jumpData) {
        if (time >= jump.start && time <= jump.end) {
          point.inJump = true

          // Create a parabolic curve for height during jump
          const jumpProgress = (time - jump.start) / (jump.end - jump.start)
          const jumpHeight = Math.sin(jumpProgress * Math.PI) * 100
          point.height = jumpHeight

          // Create a velocity curve (derivative of height)
          const velocityCurve = ((Math.cos(jumpProgress * Math.PI) * Math.PI) / (jump.end - jump.start)) * 100
          point.velocity = velocityCurve

          break
        }
      }

      data.push(point)
    }

    return data
  }

  const chartData = generateChartData()

  // Generate reference lines for each jump
  const jumpReferenceLines = jumpData.flatMap((jump, index) => [
    <ReferenceLine key={`start-${index}`} x={jump.start} stroke="#8884d8" label={`跳跃 ${index + 1} 开始`} />,
    <ReferenceLine key={`end-${index}`} x={jump.end} stroke="#82ca9d" label={`跳跃 ${index + 1} 结束`} />,
  ])

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-6 flex items-center">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="mr-2 text-blue-500"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L14.5 9H21L16 13.5L18 21L12 17L6 21L8 13.5L3 9H9.5L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
        跳跃可视化
      </h3>
      <motion.div
        className="h-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="time"
              label={{ value: "时间 (秒)", position: "insideBottomRight", offset: -10 }}
              stroke="#9ca3af"
            />
            <YAxis label={{ value: "高度 / 速度", angle: -90, position: "insideLeft" }} stroke="#9ca3af" />
            <Tooltip
              formatter={(value, name) => [
                Number.parseFloat(value).toFixed(2),
                name === "height" ? "跳跃高度" : "垂直速度",
              ]}
              labelFormatter={(label) => `时间: ${label}秒`}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            />
            <Legend
              formatter={(value) => (value === "height" ? "跳跃高度" : "垂直速度")}
              wrapperStyle={{ paddingTop: "10px" }}
            />
            <Area
              type="monotone"
              dataKey="height"
              stroke="#8884d8"
              strokeWidth={2}
              fill="url(#colorHeight)"
              name="height"
              filter="url(#glow)"
            />
            <Area
              type="monotone"
              dataKey="velocity"
              stroke="#82ca9d"
              strokeWidth={2}
              fill="url(#colorVelocity)"
              name="velocity"
              filter="url(#glow)"
            />
            {jumpReferenceLines}
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
