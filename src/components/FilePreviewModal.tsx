import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Download,
  FileText,
  Image,
  Film,
  Music,
  File,
  FileArchive,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
} from "lucide-react";
import { FileItem } from "../lib/mockData";
import { getFileIcon } from "./FileViews";
import { fileService } from "../lib/fileService";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { PptxViewer } from "./PptxViewer";
import { openInGoogleWorkspace } from "../lib/googleWorkspace";
import { toast } from "react-toastify";
import { useAppContext } from "../lib/AppContext";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}
 /build/pdf.worker.min.mjs`;
const IframeViewer = ({ url, title }: { url: string; title: string }) => {
  const [loading, setLoading] = useState(true);
  return (
    <div className="relative w-full h-full bg-theme-card-hover rounded-md overflow-hidden">
      {" "}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-theme-card z-10">
          {" "}
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow-sm" />{" "}
          <p className="text-theme-muted font-medium">
            Loading document viewer...
          </p>{" "}
          <div className="w-48 h-1.5 bg-theme-card-hover rounded-full mt-4 overflow-hidden">
            {" "}
            <div
              className="h-full bg-blue-500 rounded-full animate-pulse"
              style={{
                width: "60%",
              }}
            ></div>{" "}
          </div>{" "}
        </div>
      )}
      <iframe
        src={url}
        className={`w-full h-full border-0 transition-opacity duration-300 ${
          loading ? "opacity-0" : "opacity-100"
        }
 `}
        title={title}
        onLoad={() => setLoading(false)}
      />{" "}
    </div>
  );
};
export function FilePreviewModal({
  file,
  onClose,
}: {
  file: FileItem;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [content, setContent] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [fileContentOrUrl, setFileContentOrUrl] = useState<string | null>(
    file.url || (file as any).content || null
  );
  const [isLoading, setIsLoading] = useState(
    !file.url && !(file as any).content
  );
  /* PDF state */ const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    if (!fileContentOrUrl) return;
    if (file.type === "word" || file.type === "excel") {
      setIsLoading(true);
      const processBuffer = (arrayBuffer: ArrayBuffer) => {
        if (file.type === "word") {
          mammoth
            .convertToHtml({
              arrayBuffer,
            })
            .then((result) => {
              setHtmlContent(result.value);
              setIsLoading(false);
            })
            .catch((err) => {
              console.error(err);
              setHtmlContent(`<div class="text-red-500 p-4">Error loading Word document: ${err.message}
 </div>`);
              setIsLoading(false);
            });
        } else if (file.type === "excel") {
          setTimeout(() => {
            try {
              const workbook = XLSX.read(arrayBuffer, {
                type: "array",
              });
              const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
              const html = XLSX.utils.sheet_to_html(firstSheet);
              setHtmlContent(html);
            } catch (err: any) {
              console.error(err);
              setHtmlContent(`<div class="text-red-500 p-4">Error loading Excel document: ${err.message}
 </div>`);
            }
            setIsLoading(false);
          }, 100);
        }
      };
      if (fileContentOrUrl.startsWith("data:")) {
        const base64str = fileContentOrUrl.split(",")[1];
        const binary_string = window.atob(base64str);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary_string.charCodeAt(i);
        }
        processBuffer(bytes.buffer);
      } else if (
        fileContentOrUrl.startsWith("http") ||
        fileContentOrUrl.startsWith("/")
      ) {
        fetch(fileContentOrUrl)
          .then(async (res) => {
            if (!res.ok)
              throw new Error(`HTTP error! status: ${res.status}
 `);
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("text/html")) {
              throw new Error(
                "Received HTML instead of a valid document file. The file might be missing or deleted."
              );
            }
            return res.arrayBuffer();
          })
          .then((buffer) => processBuffer(buffer))
          .catch((err) => {
            console.error(err);
            setHtmlContent(`<div class="text-red-500 p-4">Error fetching document: ${err.message}
 </div>`);
            setIsLoading(false);
          });
      }
    }
  }, [file.type, fileContentOrUrl]);
  useEffect(() => {
    let isMounted = true;
    if (!file.url && !(file as any).content) {
      setIsLoading(true);
      fileService
        .getFileContent(file.id)
        .then((fullContent) => {
          if (isMounted) {
            setFileContentOrUrl(fullContent);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          if (isMounted) setIsLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [file]);
  useEffect(() => {
    if (file.type === "text" && fileContentOrUrl) {
      if (fileContentOrUrl.startsWith("data:")) {
        /* Parse base64 */ try {
          const base64 = fileContentOrUrl.split(",")[1];
          const text = decodeURIComponent(escape(atob(base64)));
          setContent(text);
        } catch (e) {
          console.error(e);
        }
      } else {
        fetch(fileContentOrUrl)
          .then((res) => res.text())
          .then((text) => setContent(text))
          .catch(console.error);
      }
    }
  }, [file, fileContentOrUrl]);
  const handleDownload = () => {
    if (!fileContentOrUrl) return;
    /* Create an invisible anchor element */ const a =
      document.createElement("a");
    a.href = fileContentOrUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-theme-muted w-full">
          {" "}
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />{" "}
          <p className="font-semibold text-theme-text text-lg">
            Preparing Document Viewer...
          </p>{" "}
          <p className="text-sm text-theme-muted mt-2 mb-8">
            Fetching file data and initializing
          </p>{" "}
          {/* Skeleton blocks */}
          <div className="w-full max-w-3xl space-y-4 px-8 opacity-60">
            {" "}
            <div className="h-4 bg-slate-200 rounded-full w-3/4 animate-pulse"></div>{" "}
            <div className="h-4 bg-slate-200 rounded-full w-full animate-pulse"></div>{" "}
            <div className="h-4 bg-slate-200 rounded-full w-5/6 animate-pulse"></div>{" "}
            <div className="h-4 bg-slate-200 rounded-full w-full animate-pulse"></div>{" "}
            <div className="h-4 bg-slate-200 rounded-full w-2/3 animate-pulse"></div>{" "}
          </div>{" "}
        </div>
      );
    }
    if (!fileContentOrUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-theme-muted">
          {" "}
          <File className="w-16 h-16 mb-4 text-theme-muted" />{" "}
          <p className="font-semibold text-theme-text">
            File cannot be previewed.
          </p>{" "}
          <p className="text-sm mt-2 text-center max-w-sm">
            This file appears to be corrupted or incomplete (missing data). If
            this is an older file, it may not have uploaded correctly. Please
            try re-uploading it.
          </p>{" "}
        </div>
      );
    }
    /* Check if it's base64 or a real URL */ const isBase64 =
      fileContentOrUrl.startsWith("data:");
    const isHttp = fileContentOrUrl.startsWith("http");
    if (file.type === "pdf") {
      if (isHttp) {
        return <IframeViewer url={fileContentOrUrl} title={file.name} />;
      }
      return (
        <div className="relative flex flex-col h-full bg-theme-bg/5 overflow-auto">
          {" "}
          <div className="flex-1 flex justify-center items-start min-h-min p-4">
            {" "}
            <Document
              file={fileContentOrUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={
                <div className="flex flex-col items-center justify-center p-12 text-theme-muted">
                  {" "}
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />{" "}
                  <p>Loading PDF...</p>{" "}
                </div>
              }
              error={
                <div className="bg-red-50 text-red-600 p-6 rounded-lg max-w-lg text-center mt-8">
                  {" "}
                  Failed to load PDF. It may be corrupted or blocked by browser
                  settings.
                  <br />{" "}
                  <span className="text-sm font-mono mt-2 block">
                    Check console or network tab for details
                  </span>{" "}
                </div>
              }
            >
              {" "}
              {numPages &&
                Array.from(new Array(numPages), (el, index) => (
                  <div
                    key={`page_${index + 1}
 `}
                    className="mb-8 flex justify-center"
                  >
                    {" "}
                    <Page
                      pageNumber={index + 1}
                      className="shadow-xl bg-theme-card"
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      scale={1.2}
                    />{" "}
                  </div>
                ))}
            </Document>{" "}
          </div>{" "}
        </div>
      );
    }
    /* For Microsoft Office documents, IF we have an HTT */ /* We removed the iframe viewer because it fails wit */ if (
      file.type === "presentation" ||
      file.type === "powerpoint"
    ) {
      return <PptxViewer url={fileContentOrUrl} />;
    }
    if (file.type === "image") {
      return (
        <div className="relative flex flex-col items-center justify-center h-full bg-theme-bg/5 p-8 rounded-md overflow-hidden group">
          {" "}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {" "}
            <button
              onClick={() => {
                const img = document.getElementById("preview-image");
                if (img)
                  img.style.transform = img.style.transform ? "" : "scale(1.5)";
              }}
              className="p-2 bg-theme-card/80 hover:bg-theme-card rounded-lg shadow-sm text-theme-text"
            >
              Zoom In/Out
            </button>{" "}
            <button
              onClick={() => {
                const container = document.getElementById("image-container");
                if (container) {
                  if (document.fullscreenElement) document.exitFullscreen();
                  else container.requestFullscreen();
                }
              }}
              className="p-2 bg-theme-card/80 hover:bg-theme-card rounded-lg shadow-sm text-theme-text"
            >
              Fullscreen
            </button>{" "}
          </div>{" "}
          <div
            id="image-container"
            className="flex items-center justify-center w-full h-full overflow-auto bg-transparent"
          >
            {" "}
            <img
              id="preview-image"
              src={fileContentOrUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain shadow-lg transition-transform duration-300"
            />{" "}
          </div>{" "}
        </div>
      );
    }
    if (file.type === "video") {
      return (
        <div className="flex items-center justify-center h-full bg-black rounded-md overflow-hidden">
          {" "}
          <video
            src={fileContentOrUrl}
            controls
            className="w-full max-h-full"
          />{" "}
        </div>
      );
    }
    if (file.type === "audio") {
      return (
        <div className="flex items-center justify-center h-full bg-theme-bg rounded-md">
          {" "}
          <audio
            src={fileContentOrUrl}
            controls
            className="w-full max-w-md"
          />{" "}
        </div>
      );
    }
    if (file.type === "text") {
      return (
        <div className="w-full h-full bg-theme-card p-6 overflow-auto rounded-md border border-theme-border text-sm font-mono whitespace-pre-wrap text-theme-text text-left">
          {" "}
          {content !== null ? content : "Loading..."}
        </div>
      );
    }
    if (file.type === "word" || file.type === "excel") {
      if (htmlContent) {
        if (file.type === "word") {
          return (
            <div className="w-full h-full bg-theme-card-hover py-12 px-4 sm:px-12 overflow-auto rounded-md">
              {" "}
              <style
                dangerouslySetInnerHTML={{
                  __html: ` .doc-content h1 {
 font-size: 2em;
 font-weight: bold;
 margin-bottom: 0.5em;
 color: #0f172a;
 
}
 .doc-content h2 {
 font-size: 1.5em;
 font-weight: bold;
 margin-bottom: 0.5em;
 color: #1e293b;
 margin-top: 1em;
 
}
 .doc-content h3 {
 font-size: 1.17em;
 font-weight: bold;
 margin-bottom: 0.5em;
 color: #334155;
 margin-top: 1em;
 
}
 .doc-content p {
 margin-bottom: 1em;
 line-height: 1.6;
 color: #334155;
 
}
 .doc-content ul, .doc-content ol {
 margin-bottom: 1em;
 padding-left: 2em;
 
}
 .doc-content ul {
 list-style-type: disc;
 
}
 .doc-content ol {
 list-style-type: decimal;
 
}
 .doc-content table {
 border-collapse: collapse;
 width: 100%;
 margin-bottom: 1em;
 
}
 .doc-content td, .doc-content th {
 border: 1px solid #cbd5e1;
 padding: 8px;
 
}
 .dark .doc-content {
 color: #f1f5f9;
 
}
 .dark .doc-content h1 {
 color: #f8fafc;
 
}
 .dark .doc-content h2 {
 color: #e2e8f0;
 
}
 .dark .doc-content h3 {
 color: #cbd5e1;
 
}
 .dark .doc-content p {
 color: #e2e8f0;
 
}
 `,
                }}
              />{" "}
              <div
                className="doc-content w-[210mm] max-w-full min-h-[297mm] mx-auto bg-theme-card p-[20mm] shadow-xl border border-theme-border dark:border-theme-border mb-8"
                dangerouslySetInnerHTML={{
                  __html: htmlContent,
                }}
              />{" "}
            </div>
          );
        } else {
          return (
            <div className="w-full h-full bg-theme-card-hover py-8 px-4 overflow-auto rounded-md">
              {" "}
              <style
                dangerouslySetInnerHTML={{
                  __html: ` .xlsx-table {
 border-collapse: collapse;
 width: 100%;
 font-size: 14px;
 color: #334155;
 
}
 .xlsx-table td, .xlsx-table th {
 border: 1px solid #e2e8f0;
 padding: 8px 12px;
 white-space: nowrap;
 
}
 .xlsx-table tr:first-child td {
 background-color: #f8fafc;
 font-weight: bold;
 color: #0f172a;
 
}
 .dark .xlsx-table {
 color: #e2e8f0;
 
}
 .dark .xlsx-table td, .dark .xlsx-table th {
 border-color: #334155;
 
}
 .dark .xlsx-table tr:first-child td {
 background-color: #1e293b;
 color: #f8fafc;
 
}
 `,
                }}
              />{" "}
              <div
                className="bg-theme-card min-w-max min-h-max p-8 shadow-xl border border-theme-border dark:border-theme-border"
                dangerouslySetInnerHTML={{
                  __html: htmlContent.replace(
                    /<table/g,
                    '<table class="xlsx-table"'
                  ),
                }}
              />{" "}
            </div>
          );
        }
      }
    }
    return (
      <div className="flex flex-col items-center justify-center h-full bg-theme-bg text-theme-muted p-8">
        {" "}
        <div className="w-24 h-24 mb-6 flex items-center justify-center bg-theme-card rounded-2xl shadow-sm border border-theme-border">
          {" "}
          {getFileIcon(file.type)}
        </div>{" "}
        <h3 className="text-2xl font-bold text-theme-text mb-2 truncate max-w-lg">
          {file.name}
        </h3>{" "}
        <div className="flex flex-col gap-2 mb-8 mt-4 bg-theme-card p-6 rounded-xl border border-theme-border shadow-sm w-full max-w-sm text-left">
          {" "}
          <div className="flex justify-between items-center border-b border-theme-border pb-2">
            {" "}
            <span className="text-theme-muted font-medium text-sm">
              Type
            </span>{" "}
            <span className="text-theme-text font-semibold text-sm capitalize">
              {file.type === "unknown" || file.type === "file"
                ? "Binary/Unknown"
                : file.type}
            </span>{" "}
          </div>{" "}
          <div className="flex justify-between items-center border-b border-theme-border pb-2">
            {" "}
            <span className="text-theme-muted font-medium text-sm">
              Size
            </span>{" "}
            <span className="text-theme-text font-semibold text-sm">
              {typeof file.size === "number"
                ? (file.size / 1024 / 1024).toFixed(2) + " MB"
                : file.size || "Unknown"}
            </span>{" "}
          </div>{" "}
          <div className="flex justify-between items-center">
            {" "}
            <span className="text-theme-muted font-medium text-sm">
              Uploaded
            </span>{" "}
            <span className="text-theme-text font-semibold text-sm">
              {new Date(file.createdAt || Date.now()).toLocaleDateString()}
            </span>{" "}
          </div>{" "}
        </div>{" "}
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm text-lg"
        >
          {" "}
          <Download className="w-5 h-5" /> Download File{" "}
        </button>{" "}
      </div>
    );
  };
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-theme-bg/80 backdrop-blur-sm transition-all duration-300 ${
        isFullscreen ? "p-0" : "p-4 sm:p-6 md:p-12"
      }
 `}
    >
      {" "}
      <div
        className={`bg-theme-bg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-all ${
          isFullscreen
            ? "w-full h-full rounded-none"
            : "w-full max-w-5xl h-full max-h-full rounded-2xl"
        }
 `}
      >
        {" "}
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border bg-theme-card shrink-0">
          {" "}
          <div className="flex items-center gap-4 min-w-0">
            {" "}
            <div className="p-2 bg-theme-bg rounded-lg">
              {" "}
              {getFileIcon(file.type)}
            </div>{" "}
            <div className="min-w-0">
              {" "}
              <h2 className="text-lg font-bold text-theme-text truncate">
                {file.name}
              </h2>{" "}
              <p className="text-xs text-theme-muted font-medium">
                {file.ownerName ||
                  user?.name ||
                  user?.email?.split("@")[0] ||
                  "Unknown Owner"}
                • {new Date(file.updatedAt || Date.now()).toLocaleDateString()}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex items-center gap-3 shrink-0 ml-4">
            {" "}
            {file.type === "document" && (
              <button
                onClick={() => {
                  onClose();
                  navigate(`/editor/${file.id}
 `);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {" "}
                <FileText className="w-4 h-4" />{" "}
                <span className="hidden sm:inline">Edit</span>{" "}
              </button>
            )}
            {["word", "excel", "powerpoint", "presentation"].includes(
              file.type
            ) && (
              <button
                onClick={async () => {
                  let buffer: ArrayBuffer;
                  if (fileContentOrUrl?.startsWith("data:")) {
                    const base64str = fileContentOrUrl.split(",")[1];
                    const binary_string = window.atob(base64str);
                    const len = binary_string.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                      bytes[i] = binary_string.charCodeAt(i);
                    }
                    buffer = bytes.buffer;
                  } else {
                    const res = await fetch(fileContentOrUrl!);
                    buffer = await res.arrayBuffer();
                  }
                  let mime = "application/octet-stream";
                  if (file.type === "word")
                    mime =
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                  else if (file.type === "excel")
                    mime =
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                  else
                    mime =
                      "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                                    try {
                    // Check if running in iframe (AI Studio preview)
                    if (window.self !== window.top) {
                      toast.warning("Warning: You are in a preview frame. If the Google Auth popup hangs, please open the app in a New Tab.", { autoClose: 6000 });
                    }
                    toast.info("Opening in Google Workspace...");
                    await openInGoogleWorkspace(buffer, file.name, mime);
                  } catch (err: any) {
                    toast.error(err.message || "Failed to open. Ensure popups are allowed.");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {" "}
                <FileText className="w-4 h-4" />{" "}
                <span className="hidden sm:inline">Edit in Office</span>{" "}
              </button>
            )}
            {fileContentOrUrl && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-theme-card-hover hover:bg-theme-card-hover text-theme-text rounded-lg text-sm font-medium transition-colors"
              >
                {" "}
                <Download className="w-4 h-4" />{" "}
                <span className="hidden sm:inline">Download</span>{" "}
              </button>
            )}
            <div className="w-px h-6 bg-slate-200 mx-1"></div>{" "}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-theme-card-hover text-theme-muted hover:text-theme-text rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {" "}
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>{" "}
            <button
              onClick={onClose}
              className="p-2 hover:bg-theme-card-hover text-theme-muted hover:text-theme-text rounded-lg transition-colors"
              title="Close"
            >
              {" "}
              <X className="w-5 h-5" />{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        {/* Preview Area */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6 md:p-8">
          {" "}
          {renderPreview()}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
