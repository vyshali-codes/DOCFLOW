import React, { useState } from "react";

import { useAppContext } from "../lib/AppContext";

import {
  File,
  CheckCircle2,
  XCircle,
  X,
  ChevronUp,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

export function UploadToast() {
  const { uploads, cancelUpload, retryUpload, removeUpload } = useAppContext();

  const [isExpanded, setIsExpanded] = useState(true);

  if (uploads.length === 0) return null;

  const uploadingCount = uploads.filter((u) => u.status === "uploading").length;

  const hasErrors = uploads.some(
    (u) => u.status === "error" || u.status === "canceled"
  );

  const allComplete = uploads.every((u) => u.status === "success");

  const title =
    uploadingCount > 0
      ? `Uploading ${uploadingCount}
 item${uploadingCount > 1 ? "s" : ""}
 `
      : hasErrors
      ? "Upload completed with errors"
      : "Upload completed successfully";

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-theme-card rounded-lg shadow-2xl border border-theme-border dark:border-theme-border overflow-hidden flex flex-col max-h-[60vh]">
      {" "}
      <div
        className="bg-theme-bg px-4 py-3 flex items-center justify-between cursor-pointer border-b border-theme-border dark:border-theme-border"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {" "}
        <div className="flex items-center gap-2 font-medium text-sm text-theme-text ">
          {" "}
          {uploadingCount > 0 ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : hasErrors ? (
            <XCircle className="w-5 h-5 text-red-500" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}{" "}
          {title}{" "}
        </div>{" "}
        <div className="flex items-center gap-1">
          {" "}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-theme-muted" />
          ) : (
            <ChevronUp className="w-4 h-4 text-theme-muted" />
          )}{" "}
        </div>{" "}
      </div>{" "}
      <AnimatePresence>
        {" "}
        {isExpanded && (
          <motion.div
            initial={{
              height: 0,
            }}
            animate={{
              height: "auto",
            }}
            exit={{
              height: 0,
            }}
            className="overflow-y-auto"
          >
            {" "}
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="p-4 border-b border-theme-border dark:border-theme-border/50 last:border-0 hover:bg-theme-bg dark:hover:bg-theme-card/50 transition-colors"
              >
                {" "}
                <div className="flex items-start gap-3">
                  {" "}
                  <div className="mt-0.5">
                    {" "}
                    <File className="w-8 h-8 text-theme-muted" />{" "}
                  </div>{" "}
                  <div className="flex-1 min-w-0">
                    {" "}
                    <div className="flex justify-between items-start mb-1">
                      {" "}
                      <p className="text-sm font-medium text-theme-text truncate pr-2">
                        {" "}
                        {upload.name}{" "}
                      </p>{" "}
                      <div className="flex gap-1">
                        {" "}
                        {(upload.status === "error" ||
                          upload.status === "canceled") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              retryUpload(upload.id);
                            }}
                            className="p-1 text-theme-muted hover:text-blue-500 rounded"
                            title="Retry"
                          >
                            {" "}
                            <RotateCcw className="w-4 h-4" />{" "}
                          </button>
                        )}{" "}
                        {upload.status === "uploading" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              cancelUpload(upload.id);
                            }}
                            className="p-1 text-theme-muted hover:text-theme-text dark:hover:text-slate-200 rounded"
                            title="Cancel"
                          >
                            {" "}
                            <X className="w-4 h-4" />{" "}
                          </button>
                        )}{" "}
                        {upload.status !== "uploading" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              removeUpload(upload.id);
                            }}
                            className="p-1 text-theme-muted hover:text-theme-text dark:hover:text-slate-200 rounded"
                            title="Dismiss"
                          >
                            {" "}
                            <X className="w-4 h-4" />{" "}
                          </button>
                        )}{" "}
                      </div>{" "}
                    </div>{" "}
                    {upload.status === "uploading" && (
                      <div>
                        {" "}
                        <div className="flex justify-between text-xs text-theme-muted mb-1">
                          {" "}
                          <span>Uploading...</span>{" "}
                          <span>{Math.round(upload.progress)}%</span>{" "}
                        </div>{" "}
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          {" "}
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${upload.progress}
 %`,
                            }}
                          />{" "}
                        </div>{" "}
                      </div>
                    )}{" "}
                    {upload.status === "success" && (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        {" "}
                        <CheckCircle2 className="w-3 h-3" /> Complete{" "}
                      </p>
                    )}{" "}
                    {upload.status === "error" && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        {" "}
                        <XCircle className="w-3 h-3" /> Failed{" "}
                      </p>
                    )}{" "}
                    {upload.status === "canceled" && (
                      <p className="text-xs text-theme-muted flex items-center gap-1">
                        {" "}
                        <XCircle className="w-3 h-3" /> Canceled{" "}
                      </p>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            ))}{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
    </div>
  );
}
