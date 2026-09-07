import React from "react";

import { motion, AnimatePresence } from "framer-motion";

import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;

  title: string;

  message: string;

  confirmText?: string;

  cancelText?: string;

  isDestructive?: boolean;

  onConfirm: () => void;

  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {" "}
      {isOpen && (
        <>
          {" "}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={onCancel}
            className="fixed inset-0 bg-theme-bg/50 backdrop-blur-sm z-[9998]"
          />{" "}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-theme-card rounded-xl shadow-2xl border border-theme-border dark:border-theme-border z-[9999] overflow-hidden"
          >
            {" "}
            <div className="p-6">
              {" "}
              <div className="flex items-start gap-4">
                {" "}
                <div
                  className={`p-3 rounded-full shrink-0 ${
                    isDestructive
                      ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  }
 `}
                >
                  {" "}
                  {isDestructive ? (
                    <Trash2 className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h3 className="text-lg font-bold text-theme-text dark:text-white mb-2">
                    {" "}
                    {title}{" "}
                  </h3>{" "}
                  <p className="text-sm text-theme-muted dark:text-theme-muted">
                    {" "}
                    {message}{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="px-6 py-4 bg-theme-bg /50 border-t border-theme-border dark:border-theme-border flex justify-end gap-3">
              {" "}
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-sm font-medium text-theme-text hover:bg-theme-card-hover transition-colors"
              >
                {" "}
                {cancelText}{" "}
              </button>{" "}
              <button
                onClick={() => {
                  onConfirm();

                  onCancel();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-sm ${
                  isDestructive
                    ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                }
 `}
              >
                {" "}
                {confirmText}{" "}
              </button>{" "}
            </div>{" "}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-2 text-theme-muted hover:text-theme-muted dark:hover:text-slate-300 rounded-full hover:bg-theme-card-hover transition-colors"
            >
              {" "}
              <X className="w-5 h-5" />{" "}
            </button>{" "}
          </motion.div>{" "}
        </>
      )}{" "}
    </AnimatePresence>
  );
}
