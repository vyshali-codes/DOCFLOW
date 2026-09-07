import React, { useEffect, useRef, useState } from "react";
import { init } from "pptx-preview";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Search,
} from "lucide-react";
export function PptxViewer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewer, setViewer] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<number | "fit">("fit");
  const [fitScale, setFitScale] = useState(1);
  useEffect(() => {
    let isMounted = true;
    if (!containerRef.current) return;
    const renderPptx = async () => {
      try {
        setIsLoading(true);
        let arrayBuffer: ArrayBuffer;
        if (url.startsWith("data:")) {
          const base64 = url.split(",")[1];
          const binary_string = window.atob(base64);
          const len = binary_string.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
          }
          arrayBuffer = bytes.buffer;
        } else if (
          !url.startsWith("http") &&
          !url.startsWith("/") &&
          url.length > 100
        ) {
          /* Assume it's raw base64 that lost its data: prefix */ const binary_string =
            window.atob(url);
          const len = binary_string.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
          }
          arrayBuffer = bytes.buffer;
        } else {
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(`Failed to fetch file: ${res.statusText}
 `);
          }
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("text/html")) {
            throw new Error(
              "Received HTML instead of PPTX file. The URL might be incorrect or the file doesn't exist."
            );
          }
          arrayBuffer = await res.arrayBuffer();
        }
        if (!isMounted || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        const pptxPrviewer = init(containerRef.current, {
          width: 960,
          height: 540,
        });
        /* Using load instead of preview allows us manual co */ await pptxPrviewer.load(
          arrayBuffer
        );
        if (!isMounted) return;
        setViewer(pptxPrviewer);
        setTotalSlides(pptxPrviewer.slideCount);
        setCurrentSlide(1);
        pptxPrviewer.renderSingleSlide(1);
        setIsLoading(false);
      } catch (e: any) {
        console.error("PPTX Preview error:", e);
        if (isMounted) setError(e.message || "Failed to render presentation.");
        setIsLoading(false);
      }
    };
    renderPptx();
    return () => {
      isMounted = false;
    };
  }, [url]);
  /* Handle Resize for Fit-to-Screen */ useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current && zoomLevel === "fit") {
        const wrapper = wrapperRef.current;
        const availableWidth = wrapper.clientWidth - 40;
        /* 20px padding on sides */ const availableHeight =
          wrapper.clientHeight - 40;
        const scaleX = availableWidth / 960;
        const scaleY = availableHeight / 540;
        setFitScale(Math.min(scaleX, scaleY));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [zoomLevel, isLoading]);
  /* Handle Keyboard Navigation */ useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, totalSlides, viewer]);
  const handleNext = () => {
    if (viewer && currentSlide < totalSlides) {
      const next = currentSlide + 1;
      setCurrentSlide(next);
      viewer.renderSingleSlide(next);
    }
  };
  const handlePrev = () => {
    if (viewer && currentSlide > 1) {
      const prev = currentSlide - 1;
      setCurrentSlide(prev);
      viewer.renderSingleSlide(prev);
    }
  };
  const currentScale = zoomLevel === "fit" ? fitScale : zoomLevel;
  if (error) {
    return (
      <div className="p-8 text-red-500 bg-red-50 rounded-lg max-w-lg mx-auto mt-8 text-center">
        {error}
      </div>
    );
  }
  return (
    <div className="flex flex-col w-full h-full bg-theme-bg/5 overflow-hidden relative group">
      {" "}
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-1 bg-theme-card/90 /90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-theme-border dark:border-theme-border z-10 transition-opacity opacity-0 group-hover:opacity-100 focus-within:opacity-100">
        {" "}
        <button
          onClick={() => setZoomLevel("fit")}
          className={`p-1.5 rounded-lg hover:bg-theme-card-hover text-theme-text transition-colors ${
            zoomLevel === "fit" ? "bg-theme-card-hover " : ""
          }
 `}
          title="Fit to Screen"
        >
          {" "}
          <Maximize className="w-4 h-4" />{" "}
        </button>{" "}
        <div className="w-px h-4 bg-slate-300 mx-1"></div>{" "}
        <button
          onClick={() => setZoomLevel(1)}
          className={`p-1.5 rounded-lg hover:bg-theme-card-hover text-theme-text transition-colors ${
            zoomLevel === 1 ? "bg-theme-card-hover " : ""
          }
 `}
          title="100%"
        >
          {" "}
          <Search className="w-4 h-4" />{" "}
        </button>{" "}
        <button
          onClick={() =>
            setZoomLevel(
              (prev) => (prev === "fit" ? fitScale : (prev as number)) - 0.25
            )
          }
          className="p-1.5 rounded-lg hover:bg-theme-card-hover text-theme-text transition-colors"
          title="Zoom Out"
        >
          {" "}
          <ZoomOut className="w-4 h-4" />{" "}
        </button>{" "}
        <span className="text-xs font-medium text-theme-muted dark:text-theme-muted w-12 text-center">
          {" "}
          {Math.round(currentScale * 100)}%{" "}
        </span>{" "}
        <button
          onClick={() =>
            setZoomLevel(
              (prev) => (prev === "fit" ? fitScale : (prev as number)) + 0.25
            )
          }
          className="p-1.5 rounded-lg hover:bg-theme-card-hover text-theme-text transition-colors"
          title="Zoom In"
        >
          {" "}
          <ZoomIn className="w-4 h-4" />{" "}
        </button>{" "}
      </div>{" "}
      {/* Viewer Area */}
      <div
        ref={wrapperRef}
        className="flex-1 w-full flex items-center justify-center overflow-auto relative p-4"
      >
        {" "}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent backdrop-blur-sm">
            {" "}
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow-sm" />{" "}
            <p className="text-theme-text font-medium">
              Loading Presentation...
            </p>{" "}
          </div>
        )}
        <div
          className="relative origin-center bg-theme-card shadow-2xl transition-transform duration-200 ease-out flex-shrink-0"
          style={{
            width: "960px",
            height: "540px",
            transform: `scale(${currentScale}
 )`,
            visibility: isLoading ? "hidden" : "visible",
          }}
        >
          {" "}
          <div
            ref={containerRef}
            className="w-full h-full absolute inset-0 overflow-hidden"
          />{" "}
        </div>{" "}
      </div>{" "}
      {/* Navigation Footer */}
      {!isLoading && totalSlides > 0 && (
        <div className="h-16 flex-shrink-0 border-t border-theme-border/50 dark:border-theme-border/50 bg-theme-card/50 /50 backdrop-blur-md flex items-center justify-between px-6 z-10">
          {" "}
          <button
            onClick={handlePrev}
            disabled={currentSlide <= 1}
            className="flex items-center gap-2 px-4 py-2 bg-theme-card border border-theme-border dark:border-theme-border rounded-lg text-theme-text hover:bg-theme-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {" "}
            <ChevronLeft className="w-4 h-4" /> Previous{" "}
          </button>{" "}
          <div className="text-sm font-medium text-theme-text flex items-center gap-2">
            {" "}
            Slide{" "}
            <span className="bg-slate-200 px-2 py-1 rounded text-theme-text dark:text-white min-w-[2rem] text-center">
              {currentSlide}
            </span>{" "}
            of {totalSlides}
          </div>{" "}
          <button
            onClick={handleNext}
            disabled={currentSlide >= totalSlides}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {" "}
            Next <ChevronRight className="w-4 h-4" />{" "}
          </button>{" "}
        </div>
      )}
    </div>
  );
}
