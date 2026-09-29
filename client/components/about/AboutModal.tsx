"use client"

import React, { useState } from "react"

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function AboutModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"vision" | "demo" | "algorithms" | "formats">("vision")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-surface border border-border/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-primary-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border/60 bg-surface/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <img 
              src="/website_logo.png" 
              alt="FormatFlow" 
              className="size-8 object-contain rounded-lg border border-border/60"
            />
            <div>
              <h2 className="text-base font-bold tracking-tight">FormatFlow</h2>
              <p className="text-[11px] text-secondary-text font-mono">Vision & Technical Documentation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="size-8 rounded-full bg-border/40 hover:bg-border flex items-center justify-center text-secondary-text hover:text-primary-text transition-colors text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-8 py-3 border-b border-border/40 bg-surface/40 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab("vision")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "vision"
                ? "bg-accent text-white font-semibold shadow-md shadow-accent/20"
                : "text-secondary-text hover:text-primary-text hover:bg-surface/80"
            }`}
          >
            💡 Our Vision & Story
          </button>
          <button
            onClick={() => setActiveTab("demo")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "demo"
                ? "bg-accent text-white font-semibold shadow-md shadow-accent/20"
                : "text-secondary-text hover:text-primary-text hover:bg-surface/80"
            }`}
          >
            🎬 Product Demo Video
          </button>
          <button
            onClick={() => setActiveTab("algorithms")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "algorithms"
                ? "bg-accent text-white font-semibold shadow-md shadow-accent/20"
                : "text-secondary-text hover:text-primary-text hover:bg-surface/80"
            }`}
          >
            ⚙️ 5 Expansion Algorithms
          </button>
          <button
            onClick={() => setActiveTab("formats")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === "formats"
                ? "bg-accent text-white font-semibold shadow-md shadow-accent/20"
                : "text-secondary-text hover:text-primary-text hover:bg-surface/80"
            }`}
          >
            📦 Image Formats (PNG/JPG/WEBP)
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 text-sm leading-relaxed">
          
          {/* TAB 1: VISION & STORY */}
          {activeTab === "vision" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 via-surface to-surface border border-accent/20">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">The Origin Story</span>
                <h3 className="text-2xl font-serif italic mt-2 text-primary-text">
                  "One image. Every screen. No ugly crops."
                </h3>
                <p className="text-secondary-text mt-4 leading-relaxed">
                  Like many design enthusiasts, I collect hundreds of high-resolution aesthetic wallpapers from 
                  <strong> Pinterest, Unsplash, and digital art repositories</strong>. But I ran into a constant, frustrating problem:
                </p>
                <div className="mt-4 p-4 rounded-xl bg-black/40 border border-border/50 text-xs font-mono text-secondary-text space-y-2">
                  <p className="text-amber-400 font-semibold">❌ The Problem online today:</p>
                  <p>1. A vertical Pinterest photo looks great on mobile, but gets severely cropped when set as a laptop wallpaper.</p>
                  <p>2. Traditional online tools force destructive center cropping, cutting out key artistic details.</p>
                  <p>3. Existing image resizers introduce distortion, blurry resampling, or lock you into single file formats.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-border/60 bg-surface/50">
                  <h4 className="font-semibold text-primary-text flex items-center gap-2">
                    🎯 Our Mission
                  </h4>
                  <p className="text-secondary-text text-xs mt-2">
                    To make any image fit any screen profile — from iPhone 16 Pro Max to 4K Ultra-Wide Desktop Monitors — preserving 100% of the original subject matter using advanced mathematical border expansion and resampling algorithms.
                  </p>
                </div>
                <div className="p-5 rounded-2xl border border-border/60 bg-surface/50">
                  <h4 className="font-semibold text-primary-text flex items-center gap-2">
                    ⚡ Instant & Local Performance
                  </h4>
                  <p className="text-secondary-text text-xs mt-2">
                    FormatFlow processes image canvas expansion in sub-100 milliseconds using OpenCV and Python SIMD vectorization. All 5 expansion variations generate in parallel so you can compare and pick the perfect wallpaper instantly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT DEMO VIDEO */}
          {activeTab === "demo" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">Watch FormatFlow in Action</h3>
                <p className="text-xs text-secondary-text">
                  See how FormatFlow transforms a single Pinterest portrait photo into perfect mobile and desktop wallpapers in under 2 seconds.
                </p>
              </div>

              {/* Video Player Container / Placeholder Slot */}
              <div className="relative w-full aspect-video rounded-2xl border border-border bg-black/60 overflow-hidden flex flex-col items-center justify-center group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10 pointer-events-none" />
                
                {/* Embedded Video Element Placeholder */}
                <video 
                  controls 
                  poster="/website_logo.png"
                  className="w-full h-full object-cover"
                >
                  <source src="/demo_video.mp4" type="video/mp4" />
                  Your browser does not support video playback.
                </video>

                {/* Overlaid Guide text */}
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold bg-accent text-white px-2.5 py-1 rounded-lg">
                    DEMO WALKTHROUGH
                  </span>
                  <span className="text-xs text-secondary-text font-mono">
                    FormatFlow Universal Canvas Transformer
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-surface/40 text-xs text-secondary-text font-mono">
                💡 <strong>Tip for Video Creator:</strong> You can replace <code className="text-accent">public/demo_video.mp4</code> or paste an YouTube/Loom iframe inside this slot anytime.
              </div>
            </div>
          )}

          {/* TAB 3: 5 EXPANSION ALGORITHMS */}
          {activeTab === "algorithms" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold">The Math Behind the 5 Expansion Methods</h3>
                <p className="text-xs text-secondary-text mt-1">
                  FormatFlow provides 5 mathematical and spatial algorithms to extend or resize your image to fit any aspect ratio.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                
                {/* 1. Nearest Neighbor */}
                <div className="p-5 rounded-2xl border border-border/60 bg-surface/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary-text text-base">1. 📏 Resize: Nearest Neighbor</span>
                    <span className="text-[10px] font-mono bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded">Zero-Blur Point Sampling</span>
                  </div>
                  <p className="text-xs text-secondary-text">
                    <strong>How it works:</strong> Nearest Neighbor maps each destination pixel to the single closest pixel in the source image, taking its exact color value without averaging neighboring pixels.
                  </p>
                  <p className="text-xs text-secondary-text">
                    <strong>Best for:</strong> Pixel art, 8-bit retro wallpapers, screenshots, high-contrast diagrams, and logos where sharp pixel boundaries must be preserved without any anti-aliasing blur.
                  </p>
                </div>

                {/* 2. Bilinear Interpolation */}
                <div className="p-5 rounded-2xl border border-border/60 bg-surface/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary-text text-base">2. 📐 Resize: Bilinear</span>
                    <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">2x2 Weighted Linear Average</span>
                  </div>
                  <p className="text-xs text-secondary-text">
                    <strong>How it works:</strong> Calculates a weighted average of the 4 nearest surrounding pixels (2x2 grid) in the original image to compute continuous color values for scaled pixels.
                  </p>
                  <p className="text-xs text-secondary-text">
                    <strong>Best for:</strong> Smooth photographic transitions, portraits, landscape wallpapers, and continuous color gradients where soft anti-aliasing produces clean scaling.
                  </p>
                </div>

                {/* 3. Border Replicate */}
                <div className="p-5 rounded-2xl border border-border/60 bg-surface/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary-text text-base">3. 🔁 Border: Replicate</span>
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">OpenCV BORDER_REPLICATE</span>
                  </div>
                  <p className="text-xs text-secondary-text">
                    <strong>How it works:</strong> Clamps edge pixels of the source image and extends those exact border colors straight outwards across the newly added canvas margins.
                  </p>
                  <p className="text-xs text-secondary-text">
                    <strong>Best for:</strong> Photos with solid backgrounds, sky horizons, studio portraits, or minimalist wallpapers with uniform edge tones.
                  </p>
                </div>

                {/* 4. Border Reflect */}
                <div className="p-5 rounded-2xl border border-border/60 bg-surface/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary-text text-base">4. 🪞 Border: Reflect</span>
                    <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">OpenCV BORDER_REFLECT_101</span>
                  </div>
                  <p className="text-xs text-secondary-text">
                    <strong>How it works:</strong> Mirrors the pixels of the image edges outward (like looking into a mirror), creating continuous visual patterns across expanded canvas borders without harsh color seams.
                  </p>
                  <p className="text-xs text-secondary-text">
                    <strong>Best for:</strong> Complex patterns, nature scenes, foliage, and artistic photography where mirrored reflections blend naturally into the wallpaper backdrop.
                  </p>
                </div>

                {/* 5. Border Wrap */}
                <div className="p-5 rounded-2xl border border-border/60 bg-surface/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary-text text-base">5. 🌀 Border: Wrap</span>
                    <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">OpenCV BORDER_WRAP</span>
                  </div>
                  <p className="text-xs text-secondary-text">
                    <strong>How it works:</strong> Tiles the image repeatedly across extended margins by wrapping opposite boundary edges (top to bottom, left to right).
                  </p>
                  <p className="text-xs text-secondary-text">
                    <strong>Best for:</strong> Seamless repeating textures, wallpaper patterns, geometric graphics, and abstract digital art.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: FORMATS DOCUMENTATION */}
          {activeTab === "formats" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold">Image Formats Explained</h3>
                <p className="text-xs text-secondary-text mt-1">
                  Choose the optimal file format for your phone, desktop, or tablet lockscreen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* PNG */}
                <div className="p-5 rounded-2xl border border-border/60 bg-surface/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-primary-text">PNG</span>
                    <span className="text-[10px] font-mono bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded">Lossless</span>
                  </div>
                  <p className="text-xs text-secondary-text">
                    Portable Network Graphics uses DEFLATE lossless compression. Retains 100% pixel fidelity with zero compression artifacts and alpha channel transparency support.
                  </p>
                  <p className="text-[11px] font-mono text-primary-text bg-black/40 p-2 rounded-lg">
                    ✨ Ideal for: UI design, vector graphics, logos & high-detail wallpapers.
                  </p>
                </div>

                {/* JPEG */}
                <div className="p-5 rounded-2xl border border-border/60 bg-surface/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-primary-text">JPEG / JPG</span>
                    <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">24-Bit Color</span>
                  </div>
                  <p className="text-xs text-secondary-text">
                    Joint Photographic Experts Group format uses Discrete Cosine Transform (DCT) lossy compression. Produces tiny file sizes for 16.7 million color spectrum photographs.
                  </p>
                  <p className="text-[11px] font-mono text-primary-text bg-black/40 p-2 rounded-lg">
                    ✨ Ideal for: Real camera photographs, rich scenery & mobile wallpapers.
                  </p>
                </div>

                {/* WEBP */}
                <div className="p-5 rounded-2xl border border-border/60 bg-surface/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-primary-text">WEBP</span>
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Next-Gen Web</span>
                  </div>
                  <p className="text-xs text-secondary-text">
                    Developed by Google using VP8 keyframe encoding. Provides 25%–34% smaller file sizes than JPEG with identical visual quality and transparency support.
                  </p>
                  <p className="text-[11px] font-mono text-primary-text bg-black/40 p-2 rounded-lg">
                    ✨ Ideal for: Fast downloading, low data usage & modern device screens.
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-border/60 bg-surface/80 flex items-center justify-between text-xs text-secondary-text font-mono">
          <span>FormatFlow v1.0 • Engineered for Every Screen</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-accent text-white font-sans font-medium text-xs hover:opacity-90 transition-opacity"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  )
}
