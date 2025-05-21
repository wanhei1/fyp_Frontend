"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Upload,
  FileVideo,
  Folder,
  Trash2,
  Sparkles,
  Cpu,
  Clock,
  Settings,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import ScrollAnimation from "@/components/scroll-animation";
import ShineEffect from "@/components/shine-effect";
import PulseButton from "@/components/pulse-button";
import AnimatedIcon from "@/components/animated-icon";

export default function JumpAnalyzerForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [folderName, setFolderName] = useState<string>("");
  const [uploadMode, setUploadMode] = useState<"single" | "folder">("single");
  const [jumpDuration, setJumpDuration] = useState<[number, number]>([
    0.8, 4.0,
  ]);
  const [maxCpuUsage, setMaxCpuUsage] = useState(10);
  const [numWorkers, setNumWorkers] = useState(6);
  const [advancedSettings, setAdvancedSettings] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to array and filter for video files
      const filesArray = Array.from(e.target.files).filter(
        (file) =>
          file.type.startsWith("video/") ||
          file.name.toLowerCase().endsWith(".mp4") ||
          file.name.toLowerCase().endsWith(".mov") ||
          file.name.toLowerCase().endsWith(".avi")
      );

      setSelectedFiles(filesArray);

      // Try to extract folder name if in folder mode
      if (
        uploadMode === "folder" &&
        filesArray.length > 0 &&
        filesArray[0].webkitRelativePath
      ) {
        const pathParts = filesArray[0].webkitRelativePath.split("/");
        if (pathParts.length > 1) {
          setFolderName(pathParts[0]);
        }
      } else {
        setFolderName("");
      }

      // Show success toast
      if (filesArray.length > 0) {
        toast({
          title: "文件已选择",
          description: `已选择 ${filesArray.length} 个视频文件`,
          variant: "default",
        });
      }
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Filter for video files
      const filesArray = Array.from(e.dataTransfer.files).filter(
        (file) =>
          file.type.startsWith("video/") ||
          file.name.toLowerCase().endsWith(".mp4") ||
          file.name.toLowerCase().endsWith(".mov") ||
          file.name.toLowerCase().endsWith(".avi")
      );

      setSelectedFiles(filesArray);
      setFolderName("");

      // Show success toast
      if (filesArray.length > 0) {
        toast({
          title: "文件已上传",
          description: `已上传 ${filesArray.length} 个视频文件`,
          variant: "default",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      toast({
        title: "错误",
        description: "请选择视频文件进行分析",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Set a reasonable size threshold for chunked uploads on Windows
      const MAX_DIRECT_UPLOAD_SIZE_MB = 10; // 10MB to avoid Windows buffer issues

      // Start file processing
      const formData = new FormData();

      // Append all selected files
      selectedFiles.forEach((file, index) => {
        formData.append(`video_${index}`, file);
      });

      // Append other parameters
      formData.append("fileCount", selectedFiles.length.toString());
      formData.append("minJumpDuration", jumpDuration[0].toString());
      formData.append("maxJumpDuration", jumpDuration[1].toString());
      formData.append("maxCpuUsage", maxCpuUsage.toString());
      formData.append("numWorkers", numWorkers.toString());

      // Inform user about large file handling
      if (
        selectedFiles.some(
          (file) => file.size > MAX_DIRECT_UPLOAD_SIZE_MB * 1024 * 1024
        )
      ) {
        toast({
          title: "大文件上传",
          description: `视频将使用分块上传方式，以解决Windows网络缓冲区限制问题。上传可能需要一些时间，请耐心等待。`,
          duration: 5000,
        });
      }

      // Send to backend API
      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process videos");
      }

      const result = await response.json();

      toast({
        title: "上传成功",
        description: `正在处理 ${selectedFiles.length} 个视频${
          selectedFiles.length > 1 ? "s" : ""
        }。处理完成后将通知您。`,
      });

      // Trigger a refresh to show results
      router.refresh();
    } catch (error) {
      console.error("Error processing videos:", error);
      toast({
        title: "错误",
        description:
          error instanceof Error
            ? error.message
            : "视频处理失败。请检查网络连接或尝试减少文件大小。",
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setFolderName("");
  };

  const fileVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600/10 to-violet-600/10 dark:from-blue-600/20 dark:to-violet-600/20 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 text-transparent bg-clip-text">
            视频分析设置
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            上传滑冰视频并配置跳跃检测参数
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  上传视频
                </Label>
                {selectedFiles.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    清除选择
                  </Button>
                )}
              </div>

              <Tabs
                defaultValue="single"
                value={uploadMode}
                onValueChange={(value) =>
                  setUploadMode(value as "single" | "folder")
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <TabsTrigger
                    value="single"
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md"
                  >
                    <AnimatedIcon icon={FileVideo} size={16} delay={0.1} />
                    单个视频
                  </TabsTrigger>
                  <TabsTrigger
                    value="folder"
                    className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md"
                  >
                    <AnimatedIcon icon={Folder} size={16} delay={0.2} />
                    文件夹上传
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="single" className="mt-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="single-video-upload"
                      className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                        dragActive
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div
                          className={`w-16 h-16 mb-3 rounded-full flex items-center justify-center ${
                            dragActive
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          <Upload className="w-8 h-8" />
                        </div>
                        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">点击上传</span>{" "}
                          或拖放文件
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          支持 MP4, MOV 或 AVI 格式 (无大小限制)
                        </p>
                      </div>
                      <Input
                        id="single-video-upload"
                        type="file"
                        accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </TabsContent>

                <TabsContent value="folder" className="mt-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="folder-video-upload"
                      className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                        dragActive
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="w-16 h-16 mb-3 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 flex items-center justify-center">
                          <Folder className="w-8 h-8" />
                        </div>
                        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">点击上传文件夹</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          将处理所有 MP4, MOV 或 AVI 文件
                        </p>
                      </div>
                      <Input
                        id="folder-video-upload"
                        type="file"
                        accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi"
                        className="hidden"
                        onChange={handleFileChange}
                        // @ts-ignore - webkitdirectory is a non-standard attribute but works in most browsers
                        webkitdirectory="true"
                        // @ts-ignore - directory is a non-standard attribute
                        directory="true"
                        multiple
                      />
                    </label>
                  </div>
                </TabsContent>
              </Tabs>

              {selectedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {uploadMode === "folder" && folderName
                        ? `文件夹: ${folderName}`
                        : "已选择文件"}
                    </span>
                    <ShineEffect delay={1}>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        {selectedFiles.length}{" "}
                        {selectedFiles.length === 1 ? "个视频" : "个视频"}
                      </Badge>
                    </ShineEffect>
                  </div>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-800/50 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                    <AnimatePresence>
                      <ul className="text-sm space-y-1">
                        {selectedFiles.slice(0, 5).map((file, index) => (
                          <motion.li
                            key={index}
                            custom={index}
                            variants={fileVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="truncate text-gray-600 dark:text-gray-400 py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <FileVideo className="h-3.5 w-3.5 inline-block mr-2 text-gray-500 dark:text-gray-500" />
                            {file.name}
                          </motion.li>
                        ))}
                        {selectedFiles.length > 5 && (
                          <motion.li
                            variants={fileVariants}
                            custom={5}
                            initial="hidden"
                            animate="visible"
                            className="text-gray-500 dark:text-gray-500 italic py-1 px-2"
                          >
                            ...以及其他 {selectedFiles.length - 5} 个文件
                          </motion.li>
                        )}
                      </ul>
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  跳跃持续时间范围 (秒)
                </Label>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {jumpDuration[0].toFixed(1)} - {jumpDuration[1].toFixed(1)}s
                </span>
              </div>
              <div className="pt-4 px-1">
                <Slider
                  defaultValue={[0.8, 4.0]}
                  min={0.5}
                  max={6.0}
                  step={0.1}
                  value={jumpDuration}
                  onValueChange={(value) =>
                    setJumpDuration(value as [number, number])
                  }
                  className="my-4"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                  <span>0.5s</span>
                  <span>6.0s</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="advanced-settings"
                checked={advancedSettings}
                onCheckedChange={setAdvancedSettings}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label
                htmlFor="advanced-settings"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center"
              >
                <AnimatedIcon
                  icon={Settings}
                  size={16}
                  className="mr-1.5"
                  hoverRotate={180}
                />
                显示高级 CPU 设置
              </Label>
            </div>

            {advancedSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pt-2 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg border border-gray-100 dark:border-gray-800"
              >
                <ScrollAnimation direction="right" delay={0.1}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label
                        htmlFor="max-cpu-usage"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                      >
                        <AnimatedIcon icon={Cpu} size={16} className="mr-1.5" />
                        最大 CPU 使用率 (%)
                      </Label>
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {maxCpuUsage}%
                      </span>
                    </div>
                    <Slider
                      id="max-cpu-usage"
                      defaultValue={[10]}
                      min={5}
                      max={100}
                      step={5}
                      value={[maxCpuUsage]}
                      onValueChange={(value) => setMaxCpuUsage(value[0])}
                      className="my-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                      <span>5%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </ScrollAnimation>

                <ScrollAnimation direction="left" delay={0.2}>
                  <div className="space-y-2">
                    <Label
                      htmlFor="num-workers"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                    >
                      <AnimatedIcon icon={Clock} size={16} className="mr-1.5" />
                      工作进程数量
                    </Label>
                    <Select
                      value={numWorkers.toString()}
                      onValueChange={(value) =>
                        setNumWorkers(Number.parseInt(value))
                      }
                    >
                      <SelectTrigger
                        id="num-workers"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      >
                        <SelectValue placeholder="选择工作进程数量" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 4, 6, 8, 10, 12].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "个进程" : "个进程"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </ScrollAnimation>
              </motion.div>
            )}
          </form>
        </CardContent>
        <CardFooter className="bg-gradient-to-r from-blue-600/5 to-violet-600/5 dark:from-blue-600/10 dark:to-violet-600/10 border-t border-gray-100 dark:border-gray-800 p-6">
          <PulseButton
            onClick={handleSubmit}
            disabled={isSubmitting || selectedFiles.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg transition-all duration-200 h-11"
            pulseColor="rgba(79, 70, 229, 0.2)"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                正在处理 {selectedFiles.length}{" "}
                {selectedFiles.length === 1 ? "个视频" : "个视频"}...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                分析 {selectedFiles.length > 0 ? selectedFiles.length : ""}{" "}
                {selectedFiles.length === 1 ? "个视频" : "个视频"}
              </>
            )}
          </PulseButton>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
