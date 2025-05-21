"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InfoIcon,
  Download,
  AlertTriangle,
  BarChart3,
  Video,
  ListFilter,
  Award,
  Clock,
  Calendar,
  FileVideo,
} from "lucide-react";
import JumpChart from "@/components/jump-chart";
import JumpVideoPlayer from "@/components/jump-video-player";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import ScrollAnimation from "@/components/scroll-animation";
import ShineEffect from "@/components/shine-effect";
import AnimatedIcon from "@/components/animated-icon";
import { store } from "@/lib/store";

// Define the types for our results
interface JumpTimestamp {
  video: string;
  start: number;
  end: number;
}

interface ProcessingResult {
  job_id: string;
  jumps_detected: number;
  jump_timestamps: JumpTimestamp[];
  output_files: string[];
  summary_file?: string;
  videos?: string[];
  errors?: ErrorInfo[];
  has_errors?: boolean;
}

interface ErrorInfo {
  video: string;
  error: string;
}

export default function ResultsPanel() {
  const { toast } = useToast();
  const [processingState, setProcessingState] = useState<any>(null);
  const [results, setResults] = useState<ProcessingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJump, setSelectedJump] = useState<number>(0);
  const [selectedVideo, setSelectedVideo] = useState<string>("");

  // Subscribe to the store for processing state changes
  useEffect(() => {
    // Get initial state
    const state = store.getState() || {};
    setProcessingState(state);

    // Subscribe to state changes
    const unsubscribe = store.subscribe((state) => {
      setProcessingState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch results when we have an ID
  useEffect(() => {
    if (
      !processingState ||
      !processingState.id ||
      !["processing", "completed"].includes(processingState.status)
    ) {
      return;
    }

    const jobId = processingState.id;

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/results?jobId=${jobId}`);

        if (!response.ok) {
          const data = await response.json();
          console.error("Error response:", data);
          setError(data.error || "Failed to fetch results");
          return;
        }

        const data = await response.json();

        // Check if we have results
        if (data.status === "completed" && data.results) {
          setResults(data.results);

          // Set first video as selected
          if (data.results.videos && data.results.videos.length > 0) {
            setSelectedVideo(data.results.videos[0]);
          }

          // Update the store
          store.updateProcessingState({
            status: "completed",
            results: data.results,
          });
        } else if (data.status === "error") {
          setError(data.error || "Processing failed");

          // Update the store
          store.updateProcessingState({
            status: "error",
            error: data.error,
          });
        }
        // If still processing, keep the loading state
      } catch (error) {
        console.error("Error fetching results:", error);
        setError("Failed to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

    // Poll for results every 5 seconds while status is "processing"
    const interval = setInterval(() => {
      if (processingState.status === "processing") {
        fetchResults();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [processingState?.id, processingState?.status]);

  // Show results if they're already in the store
  useEffect(() => {
    if (processingState?.results && !results) {
      setResults(processingState.results);

      if (
        processingState.results.videos &&
        processingState.results.videos.length > 0
      ) {
        setSelectedVideo(processingState.results.videos[0]);
      }
    }

    if (processingState?.error && !error) {
      setError(processingState.error);
    }
  }, [processingState, results, error]);

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "下载已开始",
      description: `正在下载 ${filename}`,
    });
  };

  // Show error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="w-full overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600/10 to-violet-600/10 dark:from-blue-600/20 dark:to-violet-600/20 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 text-transparent bg-clip-text">
              处理结果
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              处理过程中发生错误
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Alert
              variant="destructive"
              className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400"
            >
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
              <AlertTitle className="font-medium">处理错误</AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-400">
                {error}
              </AlertDescription>
            </Alert>

            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setError(null);
                  store.setProcessingState({ status: "idle" });
                }}
              >
                返回
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Show loading state
  if (
    loading ||
    processingState?.status === "preparing" ||
    processingState?.status === "uploading" ||
    processingState?.status === "processing"
  ) {
    // Determine the current status message
    let statusMessage = "视频分析正在进行中...";
    let progressValue = undefined;

    if (processingState?.message) {
      statusMessage = processingState.message;
    }

    if (processingState?.progress) {
      progressValue = processingState.progress;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="w-full h-full min-h-[600px] overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600/10 to-violet-600/10 dark:from-blue-600/20 dark:to-violet-600/20 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 text-transparent bg-clip-text flex items-center">
              <AnimatedIcon icon={Clock} className="mr-2" hoverRotate={360} />
              {processingState?.status === "preparing"
                ? "准备中"
                : processingState?.status === "uploading"
                ? "上传中"
                : "处理中"}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {processingState?.status === "preparing"
                ? "正在准备上传视频..."
                : processingState?.status === "uploading"
                ? "正在上传视频到服务器..."
                : "等待分析完成..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[500px]">
            <div className="relative w-24 h-24">
              <motion.div
                className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-900/30 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 border-blue-200 dark:border-t-blue-400 dark:border-blue-900/30 rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            </div>
            <motion.p
              className="mt-8 text-gray-600 dark:text-gray-400 text-center max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {statusMessage}
              <motion.span
                className="inline-block"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                ...
              </motion.span>
            </motion.p>

            {progressValue !== undefined && (
              <div className="w-full max-w-md mt-6">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progressValue}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                  {progressValue}% 完成
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Show welcome state when no processing has started
  if (!processingState || processingState.status === "idle" || !results) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="w-full overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600/10 to-violet-600/10 dark:from-blue-600/20 dark:to-violet-600/20 border-b border-gray-100 dark:border-gray-800">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 text-transparent bg-clip-text">
              处理结果
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              上传并分析视频以查看结果
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Alert
              variant="default"
              className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400"
            >
              <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              <AlertTitle className="font-medium">
                欢迎使用跳跃分析器
              </AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                请在左侧面板中上传视频并开始分析。处理完成后，结果将显示在此处。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Results display - no changes needed for this part
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="w-full overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600/10 to-violet-600/10 dark:from-blue-600/20 dark:to-violet-600/20 border-b border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 text-transparent bg-clip-text">
                跳跃分析结果
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                在视频中检测到 {results.jumps_detected} 个跳跃
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800 px-3 py-1 rounded-full font-medium"
            >
              {results.jumps_detected}{" "}
              {results.jumps_detected === 1 ? "个跳跃" : "个跳跃"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
              <TabsTrigger
                value="summary"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md"
              >
                <AnimatedIcon icon={ListFilter} size={16} delay={0.1} />
                总览
              </TabsTrigger>
              <TabsTrigger
                value="jumps"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md"
              >
                <AnimatedIcon icon={Video} size={16} delay={0.2} />
                跳跃详情
              </TabsTrigger>
              <TabsTrigger
                value="visualization"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md"
              >
                <AnimatedIcon icon={BarChart3} size={16} delay={0.3} />
                可视化
              </TabsTrigger>
              <TabsTrigger
                value="errors"
                className={`flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md ${
                  results.has_errors
                    ? "text-red-500 dark:text-red-400 font-semibold"
                    : ""
                }`}
              >
                <AnimatedIcon
                  icon={AlertTriangle}
                  size={16}
                  delay={0.4}
                  className={results.has_errors ? "text-red-500" : ""}
                />
                错误信息
                {results.has_errors && (
                  <Badge
                    variant="outline"
                    className="ml-1 bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
                  >
                    {results.errors?.length || 0}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-6 pt-2">
              <ScrollAnimation>
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                  {results.summary_file ? (
                    <ShineEffect delay={1} duration={3}>
                      <img
                        src={results.summary_file || "/placeholder.svg"}
                        alt="跳跃分析总结"
                        className="w-full h-auto"
                      />
                    </ShineEffect>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 p-12 text-center">
                      <motion.div
                        className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      >
                        <InfoIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      </motion.div>
                      <p className="mt-4 text-gray-500 dark:text-gray-400">
                        总结可视化不可用
                      </p>
                    </div>
                  )}
                </div>
              </ScrollAnimation>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <ScrollAnimation direction="right" delay={0.2}>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800/30 relative overflow-hidden group">
                    <motion.div
                      className="absolute -right-10 -top-10 w-20 h-20 bg-blue-200/30 dark:bg-blue-700/10 rounded-full blur-xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{
                        duration: 5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                    <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center">
                      <FileVideo className="h-4 w-4 mr-1.5" />
                      视频文件名
                    </h3>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {results.videos?.[0]?.split("/").pop()}
                    </p>
                  </div>
                </ScrollAnimation>

                <ScrollAnimation direction="left" delay={0.3}>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800/30 relative overflow-hidden group">
                    <motion.div
                      className="absolute -left-10 -bottom-10 w-20 h-20 bg-purple-200/30 dark:bg-purple-700/10 rounded-full blur-xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{
                        duration: 5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 1,
                      }}
                    />
                    <h3 className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1.5" />
                      总跳跃时长
                    </h3>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {results.jump_timestamps
                        .reduce(
                          (total, jump) => total + (jump.end - jump.start),
                          0
                        )
                        .toFixed(2)}{" "}
                      秒
                    </p>
                  </div>
                </ScrollAnimation>
              </div>

              {results.videos && results.videos.length > 1 && (
                <ScrollAnimation direction="up" delay={0.4}>
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      已处理的视频
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                      <Select
                        value={selectedVideo}
                        onValueChange={setSelectedVideo}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectValue placeholder="选择视频" />
                        </SelectTrigger>
                        <SelectContent>
                          {results.videos.map((video, index) => (
                            <SelectItem key={index} value={video}>
                              {video}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </ScrollAnimation>
              )}
            </TabsContent>

            <TabsContent value="jumps" className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScrollAnimation direction="right">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
                        <Award className="h-5 w-5 mr-1.5 text-amber-500" />
                        跳跃片段
                      </h3>
                      {results.videos && results.videos.length > 1 && (
                        <Select
                          value={selectedVideo}
                          onValueChange={setSelectedVideo}
                        >
                          <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <SelectValue placeholder="选择视频" />
                          </SelectTrigger>
                          <SelectContent>
                            {results.videos.map((video, index) => (
                              <SelectItem key={index} value={video}>
                                {video}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                      <AnimatePresence>
                        {results.jump_timestamps.map((jump, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                              selectedJump === index
                                ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800/50 shadow-sm"
                                : "bg-white border-gray-200 dark:bg-gray-800/50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                            onClick={() => setSelectedJump(index)}
                          >
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                                <AnimatedIcon
                                  icon={Video}
                                  size={16}
                                  className="mr-1.5"
                                  hoverScale={1.3}
                                  delay={index * 0.1}
                                />
                                跳跃 {index + 1}
                              </span>
                              <ShineEffect delay={index * 0.5}>
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                >
                                  {(jump.end - jump.start).toFixed(2)}秒
                                </Badge>
                              </ShineEffect>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-mono">
                              {jump.start.toFixed(2)}秒 - {jump.end.toFixed(2)}
                              秒
                            </p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </ScrollAnimation>

                <ScrollAnimation direction="left" delay={0.2}>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
                      <Video className="h-5 w-5 mr-1.5 text-blue-500" />
                      已选择的跳跃
                    </h3>
                    {results.jump_timestamps.length > 0 && (
                      <div className="space-y-4">
                        <motion.div
                          className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <JumpVideoPlayer
                            videoUrl={results.output_files[selectedJump]}
                            jumpData={results.jump_timestamps[selectedJump]}
                          />
                        </motion.div>

                        <Button
                          variant="outline"
                          className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-800/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 h-11 group"
                          onClick={() =>
                            handleDownload(
                              results.output_files[selectedJump],
                              `jump_${selectedJump + 1}.mp4`
                            )
                          }
                        >
                          <motion.div
                            className="mr-2"
                            animate={{ y: [0, -3, 0] }}
                            transition={{
                              duration: 1,
                              repeat: Number.POSITIVE_INFINITY,
                              repeatDelay: 1,
                            }}
                          >
                            <Download className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          </motion.div>
                          下载跳跃片段
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollAnimation>
              </div>
            </TabsContent>

            <TabsContent value="visualization" className="pt-2">
              <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <JumpChart jumpData={results.jump_timestamps} />
              </div>
            </TabsContent>

            <TabsContent value="errors" className="pt-2">
              <div className="space-y-6">
                {results.has_errors &&
                results.errors &&
                results.errors.length > 0 ? (
                  <>
                    <Alert
                      variant="destructive"
                      className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400"
                    >
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
                      <AlertTitle className="font-medium">处理错误</AlertTitle>
                      <AlertDescription className="text-red-700 dark:text-red-400">
                        处理过程中遇到了一些问题，但系统尝试完成了尽可能多的处理。以下是详细错误信息。
                      </AlertDescription>
                    </Alert>

                    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                      <div className="space-y-3 max-h-[400px] overflow-y-auto p-4">
                        <AnimatePresence>
                          {results.errors.map((errorInfo, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="p-4 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/10"
                            >
                              <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-2" />
                                <div>
                                  <h4 className="font-medium text-red-700 dark:text-red-400">
                                    {errorInfo.video}
                                  </h4>
                                  <p className="mt-1 text-sm text-red-600 dark:text-red-300 whitespace-pre-wrap break-words">
                                    {errorInfo.error}
                                  </p>

                                  {errorInfo.error.includes("MediaPipe") && (
                                    <div className="mt-3 bg-white dark:bg-gray-800 rounded p-3 border border-red-100 dark:border-red-900/30">
                                      <h5 className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                                        解决方案建议
                                      </h5>
                                      <ul className="text-xs text-red-600 dark:text-red-300 list-disc list-inside space-y-1">
                                        <li>
                                          更新 MediaPipe 库:{" "}
                                          <code className="px-1 py-0.5 bg-red-100 dark:bg-red-900/20 rounded text-red-600 dark:text-red-300">
                                            pip install --upgrade mediapipe
                                          </code>
                                        </li>
                                        <li>检查 Python 环境是否正确设置</li>
                                        <li>
                                          确保没有多个版本的 MediaPipe 冲突
                                        </li>
                                        <li>尝试重启服务器后再试</li>
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 rounded-xl p-6 text-center">
                    <motion.div
                      className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mb-4"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                    <h3 className="text-lg font-medium mb-2">处理正常完成</h3>
                    <p className="text-green-700 dark:text-green-300">
                      视频处理过程中没有遇到错误。
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
