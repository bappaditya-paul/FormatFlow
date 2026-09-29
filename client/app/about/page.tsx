"use client"

import React from "react"
import Link from "next/link"

export default function AboutPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background text-primary-text font-sans selection:bg-accent/30 selection:text-white">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between border-b border-border/40 relative">
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="/website_logo.png" 
            alt="FormatFlow Logo" 
            className="size-8 object-contain rounded-lg border border-border/60 transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-bold text-lg tracking-tight">FormatFlow</span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-4">
          <Link 
            href="/" 
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-surface border border-border/80 text-secondary-text hover:text-primary-text hover:border-border transition-all"
          >
            ← Back to Editor
          </Link>
        </div>

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
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-border/30 transition-colors"
                >
                  <svg className="size-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                  Editor
                </Link>
                <Link
                  href="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-primary-text hover:bg-border/30 transition-colors"
                >
                  <svg className="size-4 text-primary-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  About
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl mx-auto px-6 py-16 flex flex-col gap-16">
        
        {/* 1. Hero Section */}
        <section className="flex flex-col gap-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-surface border border-border/80 text-[11px] font-mono text-secondary-text tracking-wider uppercase">
            <span>Product Documentation & Vision</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif italic tracking-tight text-primary-text leading-tight">
            One image. Every screen.
          </h1>
          <p className="text-secondary-text text-base leading-relaxed">
            FormatFlow is a specialized canvas transformation engine built to adapt any photograph, digital artwork, or Pinterest wallpaper to fit any mobile or desktop display aspect ratio — cleanly and without destructive cropping.
          </p>
        </section>

        <hr className="border-border/40" />

        {/* 2. The Problem & Vision Story */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-secondary-text uppercase tracking-widest">01 / The Origin</span>
            <h2 className="text-2xl font-bold tracking-tight text-primary-text">Why We Built FormatFlow</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-7 flex flex-col gap-4 text-sm leading-relaxed text-secondary-text">
              <p>
                Like many designers and digital curation fans, I collect hundreds of high-resolution aesthetic photos from Pinterest, Unsplash, and photography portfolios. But whenever I tried applying a vertical portrait image to a widescreen 4K monitor or a landscape painting to a smartphone lockscreen, existing online tools forced terrible center crops that cut out the main subject.
              </p>
              <p>
                No simple web application existed that allowed non-destructive canvas expansion using exact computer vision boundary algorithms. FormatFlow was created to fill this gap.
              </p>
            </div>

            <div className="md:col-span-5 p-6 rounded-2xl bg-surface/50 border border-border/80 flex flex-col gap-4 text-xs font-mono text-secondary-text">
              <span className="font-semibold text-primary-text uppercase tracking-wider text-[11px]">Core Architectural Goals</span>
              <ul className="flex flex-col gap-3 leading-normal">
                <li className="flex gap-2">
                  <span className="text-primary-text font-bold">—</span>
                  <span><strong>Zero Destructive Cropping:</strong> Preserve 100% of original photo subject matter.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary-text font-bold">—</span>
                  <span><strong>Parallel Batch Execution:</strong> Generate all 5 spatial algorithms in under 100 milliseconds.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary-text font-bold">—</span>
                  <span><strong>Format Precision:</strong> Direct export to lossless PNG, 24-bit JPEG, or next-gen WebP.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <hr className="border-border/40" />

        {/* 3. Interactive Video Walkthrough Placeholder */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-secondary-text uppercase tracking-widest">02 / Video Walkthrough</span>
            <h2 className="text-2xl font-bold tracking-tight text-primary-text">Product Demonstration</h2>
            <p className="text-xs text-secondary-text">
              Watch how FormatFlow expands a portrait photo to desktop aspect ratios in real time.
            </p>
          </div>

          {/* Video Player Container */}
          <div className="relative w-full aspect-video rounded-2xl border border-border/80 bg-black/80 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
            <video 
              controls 
              poster="/website_logo.png"
              className="w-full h-full object-cover"
            >
              <source src="/demo_video.mp4" type="video/mp4" />
              Your browser does not support HTML5 video playback.
            </video>

            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-wider bg-surface/90 border border-border text-primary-text px-2.5 py-1 rounded">
                FormatFlow Walkthrough
              </span>
            </div>
          </div>
        </section>

        <hr className="border-border/40" />

        {/* 4. Technical Documentation: 5 Expansion Algorithms */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-secondary-text uppercase tracking-widest">03 / Computer Vision Engine</span>
            <h2 className="text-2xl font-bold tracking-tight text-primary-text">Spatial & Expansion Algorithms</h2>
            <p className="text-xs text-secondary-text">
              FormatFlow utilizes OpenCV SIMD spatial boundary operators and mathematical interpolation for canvas extension.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            
            {/* Nearest Neighbor */}
            <div className="p-6 rounded-2xl bg-surface/40 border border-border/70 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-primary-text">Resize: Nearest Neighbor</h3>
                <span className="text-[10px] font-mono text-secondary-text bg-surface border border-border px-2 py-0.5 rounded">Point Sampling</span>
              </div>
              <p className="text-xs text-secondary-text leading-relaxed">
                Maps each destination pixel to the single nearest coordinate in the source array without color blending or anti-aliasing. Preserves sharp high-contrast boundary transitions.
              </p>
              <div className="text-[11px] font-mono text-secondary-text bg-black/40 p-3 rounded-lg border border-border/40">
                Primary Use Cases: Pixel art, 8-bit retro graphics, vector screenshots, and high-contrast logos.
              </div>
            </div>

            {/* Bilinear */}
            <div className="p-6 rounded-2xl bg-surface/40 border border-border/70 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-primary-text">Resize: Bilinear</h3>
                <span className="text-[10px] font-mono text-secondary-text bg-surface border border-border px-2 py-0.5 rounded">2x2 Grid Weighted Interpolation</span>
              </div>
              <p className="text-xs text-secondary-text leading-relaxed">
                Computes a weighted linear average across the 4 surrounding pixels in a 2x2 grid to produce smooth color transitions across scaled dimensions.
              </p>
              <div className="text-[11px] font-mono text-secondary-text bg-black/40 p-3 rounded-lg border border-border/40">
                Primary Use Cases: Camera photography, portraits, soft landscapes, and continuous color gradients.
              </div>
            </div>

            {/* Border Replicate */}
            <div className="p-6 rounded-2xl bg-surface/40 border border-border/70 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-primary-text">Border: Replicate</h3>
                <span className="text-[10px] font-mono text-secondary-text bg-surface border border-border px-2 py-0.5 rounded">OpenCV BORDER_REPLICATE</span>
              </div>
              <p className="text-xs text-secondary-text leading-relaxed">
                Clamps edge pixels along the image perimeter and extends those exact boundary color values outward into extended canvas margins.
              </p>
              <div className="text-[11px] font-mono text-secondary-text bg-black/40 p-3 rounded-lg border border-border/40">
                Primary Use Cases: Studio portraits, solid background photos, sky horizons, and minimalist wallpapers.
              </div>
            </div>

            {/* Border Reflect */}
            <div className="p-6 rounded-2xl bg-surface/40 border border-border/70 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-primary-text">Border: Reflect</h3>
                <span className="text-[10px] font-mono text-secondary-text bg-surface border border-border px-2 py-0.5 rounded">OpenCV BORDER_REFLECT_101</span>
              </div>
              <p className="text-xs text-secondary-text leading-relaxed">
                Mirrors perimeter pixels across canvas borders symmetrically (101-reflection), eliminating boundary color seams.
              </p>
              <div className="text-[11px] font-mono text-secondary-text bg-black/40 p-3 rounded-lg border border-border/40">
                Primary Use Cases: Complex organic textures, foliage, forest scenes, and fine art photography.
              </div>
            </div>

            {/* Border Wrap */}
            <div className="p-6 rounded-2xl bg-surface/40 border border-border/70 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-primary-text">Border: Wrap</h3>
                <span className="text-[10px] font-mono text-secondary-text bg-surface border border-border px-2 py-0.5 rounded">OpenCV BORDER_WRAP</span>
              </div>
              <p className="text-xs text-secondary-text leading-relaxed">
                Tiles perimeter pixels across extended margins by wrapping top-to-bottom and left-to-right toroidal boundaries.
              </p>
              <div className="text-[11px] font-mono text-secondary-text bg-black/40 p-3 rounded-lg border border-border/40">
                Primary Use Cases: Seamless repeating patterns, geometric artwork, and abstract digital wallpapers.
              </div>
            </div>

          </div>
        </section>

        <hr className="border-border/40" />

        {/* 5. Supported Formats Documentation */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-secondary-text uppercase tracking-widest">04 / Export Formats</span>
            <h2 className="text-2xl font-bold tracking-tight text-primary-text">Image Encoding Specifications</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-surface/40 border border-border/70 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-primary-text">PNG</h3>
                <span className="text-[10px] font-mono text-secondary-text bg-surface border border-border px-2 py-0.5 rounded">Lossless</span>
              </div>
              <p className="text-xs text-secondary-text leading-relaxed">
                Portable Network Graphics using DEFLATE lossless encoding with 8-bit alpha channel transparency support.
              </p>
              <span className="text-[11px] font-mono text-primary-text">Best for: UI design, screenshots & vector graphics.</span>
            </div>

            <div className="p-6 rounded-2xl bg-surface/40 border border-border/70 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-primary-text">JPEG / JPG</h3>
                <span className="text-[10px] font-mono text-secondary-text bg-surface border border-border px-2 py-0.5 rounded">24-Bit Color</span>
              </div>
              <p className="text-xs text-secondary-text leading-relaxed">
                Discrete Cosine Transform (DCT) lossy encoding optimized for 16.7M color photo spectrum with small file size footprints.
              </p>
              <span className="text-[11px] font-mono text-primary-text">Best for: Scenery, photography & mobile wallpapers.</span>
            </div>

            <div className="p-6 rounded-2xl bg-surface/40 border border-border/70 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-primary-text">WEBP</h3>
                <span className="text-[10px] font-mono text-secondary-text bg-surface border border-border px-2 py-0.5 rounded">Next-Gen Web</span>
              </div>
              <p className="text-xs text-secondary-text leading-relaxed">
                Google VP8 keyframe encoding format delivering 25%–34% smaller file sizes than JPEG with high visual fidelity.
              </p>
              <span className="text-[11px] font-mono text-primary-text">Best for: Fast web loading & storage optimization.</span>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-secondary-text">
          <span>FormatFlow v1.0 • Universal Canvas Engine</span>
          <Link href="/" className="hover:text-primary-text transition-colors">
            Open Image Editor →
          </Link>
        </footer>

      </main>
    </div>
  )
}
