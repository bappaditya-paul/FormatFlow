"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Footer02 from "@/components/originkit/footer-02";

// Preset definitions (matching preset_service.py)
const PRESETS = [
  { id: "phone_wallpaper", label: "Phone Wallpaper", width: 1080, height: 1920, icon: "📱", ratio: "9:16" },
  { id: "desktop_wallpaper", label: "Desktop Wallpaper", width: 1920, height: 1080, icon: "💻", ratio: "16:9" },
  { id: "instagram_post", label: "Instagram Post", width: 1080, height: 1080, icon: "📸", ratio: "1:1" },
  { id: "instagram_story", label: "Instagram Story", width: 1080, height: 1920, icon: "⚡", ratio: "9:16" },
  { id: "youtube_thumbnail", label: "YouTube Thumbnail", width: 1280, height: 720, icon: "▶️", ratio: "16:9" },
  { id: "twitter_post", label: "Twitter / X Post", width: 1200, height: 675, icon: "🐦", ratio: "16:9" },
  { id: "og_image", label: "Open Graph Image", width: 1200, height: 630, icon: "🌐", ratio: "1.91:1" },
];

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [imageSize, setImageSize] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<string>("instagram_post");
  
  // Dimensions
  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(1080);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  
  // Transformation options
  const [fitMode, setFitMode] = useState<"cover" | "contain" | "crop" | "fit">("cover");
  const [outputFormat, setOutputFormat] = useState<"webp" | "jpeg" | "png" | "avif">("webp");
  const [quality, setQuality] = useState<number>(85);

  // States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Preset Select
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setWidth(preset.width);
      setHeight(preset.height);
    }
  };

  // Sync preset if dimensions match
  useEffect(() => {
    const matchingPreset = PRESETS.find(
      (p) => p.width === width && p.height === height
    );
    if (matchingPreset) {
      setSelectedPreset(matchingPreset.id);
    } else {
      setSelectedPreset("custom");
    }
  }, [width, height]);

  // Handle Dimension Change
  const handleWidthChange = (val: number) => {
    const parsed = Math.max(1, Math.min(8000, val));
    if (lockAspect && selectedPreset !== "custom") {
      const preset = PRESETS.find((p) => p.id === selectedPreset);
      if (preset) {
        const ratio = preset.height / preset.width;
        setHeight(Math.round(parsed * ratio));
      }
    }
    setWidth(parsed);
  };

  const handleHeightChange = (val: number) => {
    const parsed = Math.max(1, Math.min(8000, val));
    if (lockAspect && selectedPreset !== "custom") {
      const preset = PRESETS.find((p) => p.id === selectedPreset);
      if (preset) {
        const ratio = preset.width / preset.height;
        setWidth(Math.round(parsed * ratio));
      }
    }
    setHeight(parsed);
  };

  // Image Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  const loadImage = (file: File) => {
    setImageName(file.name);
    setImageSize((file.size / 1024 / 1024).toFixed(2) + " MB");
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      setImageSrc(imageUrl);
      setImageName("url-imported-image.jpg");
      setImageSize("External Resource");
    }
  };

  // Generate Simulation
  const handleGenerate = () => {
    if (!imageSrc) return;
    setIsGenerating(true);
    
    const steps = [
      "Analyzing image properties...",
      "Reading metadata & EXIF orientation...",
      "Executing high-performance lanczos3 scaling...",
      "Applying fit layout & letterbox margins...",
      `Converting color profile to output target (${outputFormat.toUpperCase()})...`,
      `Applying ${quality}% compression metrics...`,
      "Saving optimized buffer..."
    ];

    let currentStep = 0;
    setGenerationStep(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setGenerationStep(steps[currentStep]);
      } else {
        clearInterval(interval);
        // Simulate output image
        setGeneratedImage(imageSrc); // In MVP frontend, we show original as simulated result
        setIsGenerating(false);
        setShowResultModal(true);
      }
    }, 600);
  };

  const triggerDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `formatflow-optimized.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/share/sample-token");
    alert("Shareable link copied to clipboard!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfbfa] text-zinc-900 font-sans antialiased">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/50 bg-[#fcfbfa]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-white font-bold text-lg">
              FF
            </div>
            <span className="font-urbanist text-xl font-bold tracking-tight text-zinc-950">
              FormatFlow
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/" className="text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors">
              Editor
            </a>
            <a href="/dashboard" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              Dashboard
            </a>
            <a href="/docs/api" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              API Docs
            </a>
          </nav>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-urbanist font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
            Optimized Images, <span className="text-zinc-500">Instantly</span>.
          </h1>
          <p className="text-lg text-zinc-600 leading-relaxed">
            Upload your high-res image and format it perfectly for any wallpaper, social cover, or custom dimension.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-5 flex flex-col gap-8 bg-white p-8 rounded-2xl border border-zinc-200/60 shadow-sm">
            {/* Step 1: Upload */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-urbanist font-bold text-zinc-900 flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-semibold">1</span>
                Upload Source Image
              </h3>

              {!imageSrc ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 transition-all rounded-xl p-8 text-center cursor-pointer bg-zinc-50/50 hover:bg-zinc-50 flex flex-col items-center justify-center gap-3 group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <div className="size-12 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-500 group-hover:scale-105 transition-transform">
                    📥
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">Click to upload image</p>
                    <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WebP, AVIF up to 50MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 border border-zinc-100 rounded-xl bg-zinc-50/50">
                  <div className="relative size-16 rounded-lg overflow-hidden border border-zinc-200 shrink-0 bg-white">
                    <img src={imageSrc} alt="source" className="size-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-800 truncate">{imageName}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{imageSize}</p>
                  </div>
                  <button 
                    onClick={() => { setImageSrc(null); setImageName(""); }}
                    className="text-xs font-medium text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-200"></div>
                <span className="flex-shrink mx-4 text-xs text-zinc-400 font-medium tracking-wider uppercase">or url</span>
                <div className="flex-grow border-t border-zinc-200"></div>
              </div>

              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <input 
                  type="url" 
                  placeholder="Paste direct image URL..." 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-grow text-sm border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-all"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Import
                </button>
              </form>
            </div>

            {/* Step 2: Format & Preset Selector */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-urbanist font-bold text-zinc-900 flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-semibold">2</span>
                Choose Format Preset
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetChange(preset.id)}
                    className={`flex flex-col items-center justify-center p-3 border rounded-xl text-center transition-all ${
                      selectedPreset === preset.id
                        ? "border-zinc-900 bg-zinc-900/5 ring-1 ring-zinc-900"
                        : "border-zinc-200/80 bg-white hover:bg-zinc-50"
                    }`}
                  >
                    <span className="text-xl mb-1">{preset.icon}</span>
                    <span className="text-xs font-bold text-zinc-800 truncate w-full">{preset.label}</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">{preset.ratio}</span>
                  </button>
                ))}
                
                <button
                  onClick={() => setSelectedPreset("custom")}
                  className={`flex flex-col items-center justify-center p-3 border rounded-xl text-center transition-all ${
                    selectedPreset === "custom"
                      ? "border-zinc-900 bg-zinc-900/5 ring-1 ring-zinc-900"
                      : "border-zinc-200/80 bg-white hover:bg-zinc-50"
                  }`}
                >
                  <span className="text-xl mb-1">🛠️</span>
                  <span className="text-xs font-bold text-zinc-800">Custom Size</span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">Define aspect</span>
                </button>
              </div>
            </div>

            {/* Step 3: Custom Dimensions */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-urbanist font-bold text-zinc-900 flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-semibold">3</span>
                  Dimensions & Crop
                </h3>
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={lockAspect} 
                    onChange={(e) => setLockAspect(e.target.checked)}
                    disabled={selectedPreset === "custom"}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  Lock Aspect Ratio
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-500">Width (px)</label>
                  <input 
                    type="number" 
                    value={width}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                    className="border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-zinc-50/20 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-all font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-500">Height (px)</label>
                  <input 
                    type="number" 
                    value={height}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                    className="border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-zinc-50/20 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-zinc-500">Fit Mode</label>
                <div className="grid grid-cols-4 gap-1.5 border border-zinc-150 p-1 rounded-xl bg-zinc-50">
                  {(["cover", "contain", "crop", "fit"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFitMode(mode)}
                      className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        fitMode === mode
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-800"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 4: Output Options */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-urbanist font-bold text-zinc-900 flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-semibold">4</span>
                Output Quality & Format
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-500">Format</label>
                  <select 
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value as any)}
                    className="border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-zinc-50/20 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950 transition-all font-semibold text-zinc-700"
                  >
                    <option value="webp">WebP (Optimized)</option>
                    <option value="jpeg">JPEG (Standard)</option>
                    <option value="png">PNG (Lossless)</option>
                    <option value="avif">AVIF (Next-Gen)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-zinc-500">Quality</label>
                    <span className="text-xs font-mono font-bold text-zinc-700">{quality}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="100" 
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900 mt-3"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Action Button */}
            <button
              onClick={handleGenerate}
              disabled={!imageSrc || isGenerating}
              className={`w-full py-4 rounded-xl font-urbanist font-extrabold text-base tracking-wide flex items-center justify-center gap-2 transition-all ${
                !imageSrc
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  : "bg-zinc-950 text-white hover:bg-zinc-800 shadow-md active:scale-[0.98]"
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing Image...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Transform Image</span>
                </>
              )}
            </button>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-7 flex flex-col gap-6 h-full">
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col h-full min-h-[480px]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-zinc-400 tracking-wider uppercase">Live Preview Frame</span>
                {imageSrc && (
                  <span className="text-xs px-2.5 py-1 bg-zinc-100 rounded-full text-zinc-600 font-bold">
                    Target: {width} x {height} ({fitMode})
                  </span>
                )}
              </div>

              <div className="flex-grow flex items-center justify-center bg-[#faf9f6] border border-zinc-100 rounded-xl overflow-hidden p-6 relative min-h-[360px]">
                {!imageSrc ? (
                  <div className="text-center max-w-sm flex flex-col items-center gap-3">
                    <div className="size-16 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-2xl">
                      🖼️
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-700">No Image Uploaded</p>
                      <p className="text-xs text-zinc-400 mt-1">Upload a photo to see how it fits the selected dimensions live</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="relative shadow-lg border border-zinc-200/50 overflow-hidden bg-zinc-200 transition-all duration-300 flex items-center justify-center"
                    style={{
                      aspectRatio: `${width}/${height}`,
                      width: "100%",
                      maxWidth: "340px",
                      height: "auto",
                      maxHeight: "340px",
                    }}
                  >
                    {/* Render Image based on fitMode */}
                    <img 
                      src={imageSrc} 
                      alt="Preview Source" 
                      className={`w-full h-full transition-all duration-300 ${
                        fitMode === "cover" ? "object-cover" : 
                        fitMode === "contain" ? "object-contain" : 
                        fitMode === "fit" ? "object-fill" : "object-none"
                      }`}
                    />

                    {/* Overlay guidelines for crop layout feedback */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-white/20">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-white/10"></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Loading Steps Modal Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-2xl max-w-sm w-full mx-6 flex flex-col items-center gap-6">
            <div className="relative size-16">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-zinc-900 animate-spin"></div>
            </div>
            <div className="text-center flex flex-col gap-1 w-full">
              <p className="font-urbanist font-extrabold text-lg text-zinc-900">Processing Engine Active</p>
              <div className="h-6 overflow-hidden mt-2">
                <p className="text-xs text-zinc-500 font-mono animate-pulse truncate">{generationStep}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Display Modal */}
      {showResultModal && generatedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-md px-6">
          <div className="bg-white rounded-3xl border border-zinc-100 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col transform transition-all">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="font-urbanist font-extrabold text-xl text-zinc-900">Transformation Complete!</h3>
              <button 
                onClick={() => setShowResultModal(false)}
                className="text-zinc-400 hover:text-zinc-600 font-bold p-1 rounded-full hover:bg-zinc-50"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-zinc-50 flex items-center justify-center min-h-[300px]">
              <div className="relative max-h-[320px] max-w-sm rounded-xl overflow-hidden shadow-md bg-white border border-zinc-150 flex items-center justify-center">
                <img 
                  src={generatedImage} 
                  alt="Transformed Result" 
                  className="max-h-[300px] w-auto object-contain"
                />
              </div>
            </div>

            <div className="p-6 flex flex-col sm:flex-row gap-3 border-t border-zinc-100 bg-white">
              <button
                onClick={triggerDownload}
                className="flex-1 py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>💾</span>
                <span>Download Result</span>
              </button>
              <button
                onClick={copyShareLink}
                className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>🔗</span>
                <span>Copy Shareable Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wired Site Footer (Originkit) */}
      <Footer02 />
    </div>
  );
}
