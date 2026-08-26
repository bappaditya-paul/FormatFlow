"use client"

import React from "react"
import { useWallpaperConverter } from "@/lib/hooks/useWallpaperConverter"
import { ImageUploader } from "@/components/upload/ImageUploader"
import { PlatformSelector } from "@/components/platform/PlatformSelector"
import { DeviceSelector } from "@/components/devices/DeviceSelector"
import { AspectRatioPreview } from "@/components/preview/AspectRatioPreview"
import { GenerateButton } from "@/components/generation/GenerateButton"
import { DownloadButton } from "@/components/download/DownloadButton"

export default function Home() {
  const converter = useWallpaperConverter()

  return (
    <div className="min-h-screen bg-background text-primary-text font-sans selection:bg-accent/30">
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mock Logo matching FF from old design */}
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-text text-background font-bold text-lg">
            FF
          </div>
          <span className="font-bold text-xl tracking-tight">FormatFlow</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <span className="text-primary-text">Editor</span>
          <span className="text-secondary-text cursor-pointer hover:text-primary-text transition-colors">About</span>
        </nav>
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
              // Result State
              <div className="flex flex-col items-center justify-center max-w-xl mx-auto w-full gap-8">
                <h2 className="text-2xl font-semibold">Ready</h2>
                <div className="w-full border border-border p-4 bg-surface flex justify-center rounded-xl">
                  <img 
                    src={converter.result.url} 
                    alt="Result" 
                    className="max-h-[500px] object-contain border border-border shadow-2xl" 
                  />
                </div>
                <div className="text-center font-mono">
                  {converter.device ? <div className="text-primary-text mb-1">{converter.device.model}</div> : null}
                  <div className="text-secondary-text text-sm">{converter.result.width} &times; {converter.result.height}</div>
                </div>
                <div className="w-full max-w-xs">
                  <DownloadButton result={converter.result} onReset={converter.reset} />
                </div>
              </div>
            ) : (
              // Editor State
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start w-full">
                
                {/* Left Column: Preview */}
                <div className="order-2 lg:order-1 flex flex-col gap-6 sticky top-8">
                  <div className="flex justify-between items-end border-b border-border pb-4">
                    <span className="text-xs uppercase tracking-widest text-secondary-text font-semibold">Preview</span>
                  </div>
                  <div className="w-full bg-surface/50 border border-border rounded-2xl overflow-hidden">
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
                      onGenerate={converter.generate} 
                    />
                  </div>

                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
