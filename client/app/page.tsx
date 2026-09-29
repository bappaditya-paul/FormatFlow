"use client"

import React, { useState } from "react"
import { useWallpaperConverter } from "@/lib/hooks/useWallpaperConverter"
import { ImageUploader } from "@/components/upload/ImageUploader"
import { PlatformSelector } from "@/components/platform/PlatformSelector"
import { DeviceSelector } from "@/components/devices/DeviceSelector"
import { AspectRatioPreview } from "@/components/preview/AspectRatioPreview"
import { GenerateButton } from "@/components/generation/GenerateButton"
import { DownloadButton } from "@/components/download/DownloadButton"
import Link from "next/link"

export default function Home() {
  const converter = useWallpaperConverter()
  const [projectName, setProjectName] = useState("Untitled Wallpaper")
  const [isEditingName, setIsEditingName] = useState(false)
  const [exportFormat, setExportFormat] = useState("PNG")
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const handleFormatChange = (newFormat: string) => {
    setExportFormat(newFormat)
  }

  const variants = converter.result?.variants || []
  const activeVariant = variants[selectedVariantIndex] || {
    expansion_method: "Border: Replicate",
    output_url: converter.result?.url || "",
    action_taken: "border_replicate",
    execution_time_seconds: 0.005
  }

  return (
    <div className="min-h-screen bg-background text-primary-text font-sans selection:bg-accent/30">
      {/* Enhanced Responsive Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-border/40 gap-3 mb-2 relative">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <img 
              src="/website_logo.png" 
              alt="FormatFlow Logo" 
              className="size-8 sm:size-9 object-contain rounded-xl"
              style={{ boxShadow: "0 0 0 1px oklch(1 0 0 / 0.1)" }}
            />
            <span className="font-bold text-lg sm:text-xl tracking-tight">FormatFlow</span>
          </Link>
        </div>

        {/* Project Name Editable Header (Framer / Figma style) */}
        {converter.imageSrc && (
          <div className="hidden sm:flex items-center justify-center">
            {isEditingName ? (
              <div className="flex items-center gap-2 bg-surface border border-accent ring-2 ring-accent/20 px-3 py-1.5 rounded-xl shadow-lg transition-all">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Escape") {
                      setIsEditingName(false)
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  autoFocus
                  className="bg-transparent text-xs font-semibold text-primary-text focus:outline-none w-36 sm:w-48 tracking-tight"
                  placeholder="Enter wallpaper title..."
                />
                <span className="text-[10px] font-mono text-secondary-text bg-border/40 px-1.5 py-0.5 rounded select-none">⏎</span>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="group flex items-center gap-2 bg-surface/80 hover:bg-surface border border-border/60 hover:border-border/90 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
                title="Click to rename project"
              >
                <span className="text-xs font-semibold text-primary-text tracking-tight group-hover:text-accent transition-colors max-w-[140px] sm:max-w-[200px] truncate">
                  {projectName || "Untitled Wallpaper"}
                </span>
                <svg 
                  className="size-3 text-secondary-text group-hover:text-accent transition-colors shrink-0" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Right Navigation & Mobile Hamburger Menu */}
        <div className="flex items-center gap-3">
          {converter.imageSrc && converter.displayProfile && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <select
                value={exportFormat}
                onChange={(e) => handleFormatChange(e.target.value)}
                className="bg-surface border border-border text-xs px-2 py-1.5 rounded-lg text-secondary-text hover:text-primary-text focus:outline-none cursor-pointer"
              >
                <option value="PNG">PNG</option>
                <option value="JPG">JPG</option>
                <option value="WEBP">WEBP</option>
              </select>
              <button
                onClick={() => converter.generate(exportFormat)}
                disabled={converter.status === "generating"}
                className="bg-accent text-white font-medium text-xs px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {converter.status === "generating" ? "Exporting..." : "Generate"}
              </button>
            </div>
          )}

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-5 text-xs sm:text-sm font-medium">
            <Link 
              href="/" 
              className="text-primary-text font-semibold hover:text-accent transition-colors"
            >
              Editor
            </Link>
            <Link 
              href="/about"
              className="text-secondary-text hover:text-primary-text transition-colors font-medium"
            >
              About
            </Link>
          </nav>

          {/* Mobile Hamburger Menu Button & Dropdown Drawer */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-primary-text bg-surface border border-border/80 rounded-xl hover:border-accent/50 focus:outline-none transition-all cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="size-5 text-primary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>

            {isMobileMenuOpen && (
              <div className="absolute right-0 top-12 z-50 w-44 bg-surface border border-border/90 rounded-2xl p-2 shadow-2xl">
                <div className="flex flex-col gap-1">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-primary-text hover:bg-border/30 transition-colors"
                  >
                    <svg className="size-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                    Editor
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-border/30 transition-colors"
                  >
                    <svg className="size-4 text-secondary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    About
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>




      <main className="w-full max-w-6xl mx-auto px-6 pb-24 flex flex-col items-center">
        {!converter.imageSrc ? (
          // Landing State
          <div className="flex flex-col items-center justify-center mt-24 max-w-2xl text-center w-full">
            <h1 className="font-serif text-5xl md:text-7xl italic tracking-tight leading-tight mb-8">
              One image.<br />Every screen.
            </h1>
            <p className="text-secondary-text mb-12 max-w-md mx-auto">
              Upload once. Make it fit any display.
            </p>
            <div className="w-full max-w-md">
              <ImageUploader imageSrc={null} onUpload={converter.handleUpload} />
            </div>
          </div>
        ) : (
          // Converter State
          <div className="w-full flex flex-col mt-8">
            {converter.status === "complete" && converter.result ? (
              // Multi-Variant Dashboard Result State
              <div className="flex flex-col w-full gap-8">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Expansion Dashboard</h2>
                    <p className="text-xs text-secondary-text mt-1">
                      Compare all 5 non-AI transformation methods side-by-side & select your favorite wallpaper.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
                      ⚡ 5 Variants in {converter.result.total_execution_time_seconds || 0.05}s
                    </span>
                    <button
                      onClick={() => converter.reset()}
                      className="text-xs font-medium text-secondary-text hover:text-primary-text px-3 py-1 rounded-lg border border-border bg-surface transition-colors cursor-pointer"
                    >
                      ← New Image
                    </button>
                  </div>
                </div>

                {/* Dashboard Grid: Active Focused Preview + Variant Selection Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                  
                  {/* Active Variant High-Res Preview (Left Column - 7 Cols) */}
                  <div className="lg:col-span-7 flex flex-col gap-3 lg:sticky lg:top-8">
                    <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="uppercase tracking-widest text-secondary-text font-bold text-[11px]">Selected:</span>
                        <span className="text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded border border-accent/20 text-xs">
                          {activeVariant.expansion_method}
                        </span>
                      </div>
                      <span className="font-mono text-secondary-text text-[11px] shrink-0">
                        {converter.result.width} &times; {converter.result.height} px
                      </span>
                    </div>

                    {/* Main Preview Container with Tap-to-Expand */}
                    <div 
                      onClick={() => setIsLightboxOpen(true)}
                      className="w-full border border-border/80 bg-surface/40 p-3 sm:p-4 rounded-2xl flex items-center justify-center relative overflow-hidden group min-h-[260px] sm:min-h-[420px] max-h-[360px] sm:max-h-[520px] cursor-zoom-in"
                      title="Click to view full screen preview"
                    >
                      <img 
                        src={activeVariant.output_url} 
                        alt={activeVariant.expansion_method} 
                        className="max-h-[340px] sm:max-h-[500px] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]" 
                      />
                      
                      {/* Tap to expand overlay indicator */}
                      <div className="absolute bottom-3 right-3 bg-black/70 hover:bg-black/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1.5 shadow-lg transition-opacity opacity-90 sm:opacity-0 group-hover:opacity-100">
                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                        </svg>
                        <span>Fullscreen</span>
                      </div>
                    </div>

                    {/* Mobile Horizontal Variant Carousel (Visible on Mobile Screens) */}
                    <div className="flex sm:hidden flex-col gap-2 mt-1">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] uppercase tracking-widest text-secondary-text font-bold">All 5 Variants</span>
                        <span className="text-[10px] text-secondary-text font-mono">Tap variant to select</span>
                      </div>
                      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
                        {variants.map((variant, idx) => {
                          const isSelected = selectedVariantIndex === idx
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedVariantIndex(idx)}
                              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border shrink-0 w-28 snap-start transition-all cursor-pointer ${
                                isSelected
                                  ? "border-accent bg-accent/10 ring-1 ring-accent"
                                  : "border-border/60 bg-surface/50 hover:bg-surface"
                              }`}
                            >
                              <div className="w-full h-20 rounded-lg bg-black/40 border border-border/60 overflow-hidden flex items-center justify-center">
                                <img src={variant.output_url} className="w-full h-full object-cover" alt={variant.expansion_method} />
                              </div>
                              <span className={`text-[10px] font-semibold truncate w-full text-center ${isSelected ? "text-accent" : "text-primary-text"}`}>
                                {variant.expansion_method}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 5 Variant Comparison List & Format Actions (Right Column - 5 Cols) */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="hidden sm:flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-secondary-text font-bold">All 5 Variants</span>
                      <span className="text-xs text-secondary-text font-mono">Select to preview</span>
                    </div>

                    <div className="hidden sm:flex flex-col gap-3 max-h-[440px] overflow-y-auto pr-1">
                      {variants.map((variant, idx) => {
                        const isSelected = selectedVariantIndex === idx
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedVariantIndex(idx)}
                            className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-accent bg-accent/10 shadow-md shadow-accent/5 ring-1 ring-accent"
                                : "border-border/60 bg-surface/50 hover:bg-surface hover:border-border"
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-12 rounded-lg bg-black/40 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                                <img src={variant.output_url} className="w-full h-full object-cover" alt={variant.expansion_method} />
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-xs font-semibold ${isSelected ? "text-accent" : "text-primary-text"}`}>
                                  {variant.expansion_method}
                                </span>
                                <span className="text-[10px] text-secondary-text font-mono mt-0.5">
                                  Time: {variant.execution_time_seconds}s
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <span className="text-accent text-xs font-bold px-2 py-0.5 rounded bg-accent/20">Selected</span>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {/* Format Selector & Download Section */}
                    <div className="border-t border-border/60 pt-4 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-secondary-text uppercase tracking-wider">Export Format</label>
                        <div className="flex items-center gap-2">
                          {["PNG", "JPG", "WEBP"].map((fmt) => (
                            <button
                              key={fmt}
                              onClick={() => handleFormatChange(fmt)}
                              className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                                exportFormat.toUpperCase() === fmt
                                  ? "bg-accent text-white border-accent"
                                  : "bg-surface border-border text-secondary-text hover:text-primary-text"
                              }`}
                            >
                              {fmt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <DownloadButton 
                        result={converter.result} 
                        exportFormat={exportFormat}
                        variantName={activeVariant.expansion_method}
                        activeUrl={activeVariant.output_url}
                        onReset={converter.reset} 
                      />
                    </div>

                  </div>

                </div>
              </div>
            ) : (
              // Editor State
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start w-full">
                
                {/* Left Column: Preview */}
                <div className="order-2 lg:order-1 flex flex-col gap-6 sticky top-8">
                  <div className="flex justify-between items-end border-b border-border pb-4">
                    <span className="text-xs uppercase tracking-widest text-secondary-text font-semibold">Preview Canvas</span>
                    {converter.displayProfile && (
                      <span className="text-xs font-mono text-accent font-medium bg-accent/10 px-2 py-0.5 rounded">
                        {converter.displayProfile.width} &times; {converter.displayProfile.height}
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-surface/50 border border-border rounded-2xl overflow-hidden relative">
                    <AspectRatioPreview profile={converter.displayProfile} imageSrc={converter.imageSrc} />
                  </div>
                </div>

                {/* Right Column: Controls */}
                <div className="order-1 lg:order-2 flex flex-col gap-10">
                  
                  {/* Source Image Info */}
                  <div className="flex flex-col gap-4 border-b border-border pb-8">
                    <span className="text-xs uppercase tracking-widest text-secondary-text font-semibold">Source</span>
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded bg-surface border border-border overflow-hidden shrink-0">
                        <img src={converter.imageSrc} className="w-full h-full object-cover" alt="Source" />
                      </div>
                      <button 
                        onClick={() => converter.reset()}
                        className="text-sm font-medium text-secondary-text hover:text-primary-text transition-colors"
                      >
                        Replace Image
                      </button>
                    </div>
                  </div>

                  {/* Target Selection */}
                  <div className="flex flex-col gap-6">
                    <span className="text-xs uppercase tracking-widest text-secondary-text font-semibold">Target</span>
                    
                    <PlatformSelector 
                      platform={converter.platform} 
                      onChange={converter.setPlatform} 
                    />

                    {converter.platform && (
                      <DeviceSelector 
                        platform={converter.platform}
                        selectedDevice={converter.device}
                        selectedProfile={converter.displayProfile}
                        onSelectDevice={converter.selectDevice}
                        onSelectCustom={converter.selectCustomProfile}
                      />
                    )}
                  </div>

                  {/* Action */}
                  <div className="pt-6">
                    <GenerateButton 
                      status={converter.status} 
                      disabled={!converter.displayProfile} 
                      onGenerate={() => converter.generate(exportFormat)} 
                    />
                  </div>

                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && activeVariant && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Top Bar */}
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-4 pb-3 border-b border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                {activeVariant.expansion_method}
              </span>
              <span className="text-[11px] font-mono text-white/60">
                {converter.result?.width} &times; {converter.result?.height} px
              </span>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Close</span>
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Lightbox Main Image View */}
          <div className="flex-1 w-full max-w-4xl mx-auto flex items-center justify-center py-4 relative overflow-hidden">
            <img
              src={activeVariant.output_url}
              alt={activeVariant.expansion_method}
              className="max-h-[72vh] sm:max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl transition-all"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Prev Arrow */}
            {selectedVariantIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedVariantIndex((prev) => prev - 1)
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white shadow-xl backdrop-blur-md transition-all cursor-pointer"
                title="Previous variant"
              >
                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}

            {/* Next Arrow */}
            {selectedVariantIndex < variants.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedVariantIndex((prev) => prev + 1)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white shadow-xl backdrop-blur-md transition-all cursor-pointer"
                title="Next variant"
              >
                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>

          {/* Lightbox Bottom Quick Variant Switcher */}
          <div className="w-full max-w-xl mx-auto flex items-center justify-center gap-2.5 overflow-x-auto py-2 scrollbar-none" onClick={(e) => e.stopPropagation()}>
            {variants.map((v, i) => (
              <button
                key={i}
                onClick={() => setSelectedVariantIndex(i)}
                className={`h-12 w-12 rounded-lg border-2 overflow-hidden shrink-0 transition-all cursor-pointer ${
                  selectedVariantIndex === i
                    ? "border-accent scale-110 shadow-lg ring-2 ring-accent/50"
                    : "border-white/20 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={v.output_url} alt={v.expansion_method} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
