/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  Zap,
  Cpu,
  Image as ImageIcon,
  Download,
  RefreshCw,
  AlertTriangle,
  Info
} from "lucide-react";
import { cn } from './lib/utils';

type ImageSize = "1K" | "2K" | "4K";

const IMAGE_DIMENSIONS: Record<ImageSize, { width: number; height: number }> = {
  "1K": { width: 1024, height: 576 },
  "2K": { width: 2048, height: 1152 },
  "4K": { width: 3840, height: 2160 },
};

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("A cinematic blend between catastrophic natural disasters (tsunamis, wildfires, storms) and futuristic AI neural networks. High-tech digital overlays, glowing data streams monitoring the earth, professional PPT title slide aesthetic, 16:9 aspect ratio, hyper-realistic, 8k resolution.");
  const [imageSize, setImageSize] = useState<ImageSize>("1K");
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const { width, height } = IMAGE_DIMENSIONS[imageSize];
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${Date.now()}&nologo=true`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Image service responded with ${res.status}.`);
      }

      const blob = await res.blob();
      setGeneratedImage((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {generatedImage ? (
            <motion.img
              key={generatedImage}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.4, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              src={generatedImage}
              alt="Background"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900/20 via-black to-red-900/20 opacity-50" />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side: Title & Info */}
        <div className="flex-1 flex flex-col justify-center p-8 lg:p-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                AtherGuard &middot; Agentic AI System v1.0
              </div>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] tracking-tighter mb-6 uppercase max-w-2xl">
              Smart Disaster <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-500">
                Detection
              </span> & Early Warning
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-400 max-w-xl leading-relaxed mb-10 font-light">
              Harnessing agentic intelligence to monitor global catastrophic risks, providing real-time alerts and strategic mitigation protocols.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl">
              {[
                { icon: ShieldAlert, label: "Risk Mitigation", value: "99.9%" },
                { icon: Zap, label: "Latency", value: "< 50ms" },
                { icon: Cpu, label: "Neural Nodes", value: "12.4k" },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
                  <item.icon className="w-5 h-5 text-blue-400 mb-2" />
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{item.label}</div>
                  <div className="text-xl font-mono font-bold">{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side: Visual Generator Controls */}
        <div className="w-full lg:w-[450px] bg-black/40 backdrop-blur-xl border-l border-white/10 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Visual Generator
              </h2>
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Info className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Creative Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                  placeholder="Describe the disaster/AI blend..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                  Resolution Output
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["1K", "2K", "4K"] as ImageSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setImageSize(size)}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold transition-all border",
                        imageSize === size 
                          ? "bg-blue-600 border-blue-500 text-white" 
                          : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                >
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400 leading-tight">{error}</p>
                </motion.div>
              )}

              <button
                onClick={generateImage}
                disabled={isGenerating}
                className={cn(
                  "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all",
                  isGenerating 
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                    : "bg-white text-black hover:bg-gray-200 active:scale-[0.98]"
                )}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Synthesizing Visual...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    Generate PPT Cover
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            {generatedImage && (
              <div className="space-y-4">
                <div className="aspect-video rounded-xl overflow-hidden border border-white/20 shadow-2xl group relative">
                  <img 
                    src={generatedImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a 
                      href={generatedImage} 
                      download="atherguard-cover.jpg"
                      className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>
                <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest">
                  Click image to download high-res asset
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-6 text-[10px] text-gray-600 font-mono">
              <span>SYSTEM STATUS: OPTIMAL</span>
              <span>COORD: 37.7749° N, 122.4194° W</span>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 opacity-30" />
      <div className="fixed top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-transparent opacity-10" />
    </div>
  );
}
