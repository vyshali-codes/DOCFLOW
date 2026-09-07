import React, { useState } from "react";

import {
  Folder,
  FileText,
  FileImage,
  FileCode,
  FileType,
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Edit2,
  Star,
  Clock,
  FileCheck,
  FileArchive,
  FileAudio,
  FileVideo,
  Users,
  Loader2,
} from "lucide-react";

import { formatBytes, cn } from "../lib/utils";

import { FileItem } from "../lib/mockData";

import { motion, AnimatePresence } from "framer-motion";

import { fileService } from "../lib/fileService";

import { VersionHistoryModal } from "./VersionHistoryModal";

import { auth } from "../lib/firebase";

import { toast } from "react-toastify";

export const getFileIcon = (type: string, color?: string) => {
  switch (type) {
    case "folder":
      return (
        <Folder
          className="w-5 h-5 fill-current"
          style={{
            color: color || "#3B82F6",
          }}
        />
      );

    case "pdf":
      return <FileType className="w-5 h-5 text-red-500" />;

    case "word":
      return <FileText className="w-5 h-5 text-blue-600" />;

    case "excel":
      return <FileCheck className="w-5 h-5 text-green-600" />;

    case "image":
      return <FileImage className="w-5 h-5 text-purple-500" />;

    case "video":
      return <FileVideo className="w-5 h-5 text-pink-500" />;

    case "audio":
      return <FileAudio className="w-5 h-5 text-amber-500" />;

    case "text":
      return (
        <FileCode className="w-5 h-5 text-theme-muted dark:text-theme-muted" />
      );

    case "archive":
      return <FileArchive className="w-5 h-5 text-orange-500" />;

    default:
      return <FileText className="w-5 h-5 text-theme-muted" />;
  }
};

import { ConfirmModal } from "./ConfirmModal";

const ContextMenu = ({
  isOpen,
  onClose,
  file,
}: {
  isOpen: boolean;

  onClose: () => void;

  file: FileItem;
}) => {
  const [isRenaming, setIsRenaming] = useState(false);

  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [newName, setNewName] = useState(file.name);

  if (!isOpen && !isRenaming && !showVersionHistory && !showDeleteConfirm)
    return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (file.url) {
      window.open(file.url, "_blank");
    }

    fileService.logActivity("downloaded", file.name);

    onClose();
  };
  const handleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();

    await fileService.updateDocument(
      file.id,
      {
        starred: !file.starred,
      },
      file.type === "folder"
    );

    onClose();
  };
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    setShowDeleteConfirm(true);
  };
  const executeDelete = async () => {
    if (file.isDeleted) {
      await fileService.deletePermanently(file.id, file.type === "folder");
    } else {
      await fileService.moveToTrash(file.id, file.name, file.type === "folder");
    }

    setShowDeleteConfirm(false);

    onClose();
  };
  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation();

    await fileService.restoreFromTrash(
      file.id,
      file.name,
      file.type === "folder"
    );

    onClose();
  };
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const shareLink =
        window.location.origin +
        (file.type === "document"
          ? `/editor/${file.id}
 `
          : `/dashboard?file=${file.id}
 `);

      await navigator.clipboard.writeText(shareLink);

      toast.success("Link copied to clipboard!");

      fileService.logActivity("shared", file.name);
    } catch (err) {
      toast.error("Failed to copy link");
    }

    onClose();
  };
  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newName.trim() && newName !== file.name) {
      await fileService.updateDocument(
        file.id,
        {
          name: newName,
        },
        file.type === "folder"
      );

      fileService.logActivity("renamed", newName);
    }

    setIsRenaming(false);

    onClose();
  };
  return (
    <>
      {" "}
      <div
        className="fixed inset-0 z-40"
        onClick={() => {
          setIsRenaming(false);

          onClose();
        }}
      />{" "}
      <AnimatePresence>
        {" "}
        {isOpen && !isRenaming && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
            }}
            transition={{
              duration: 0.1,
            }}
            className="absolute right-0 top-10 w-48 bg-theme-card rounded-lg shadow-xl border border-theme-border dark:border-theme-border py-1 z-50 overflow-hidden"
          >
            {" "}
            {file.isDeleted ? (
              <>
                {" "}
                <button
                  onClick={handleRestore}
                  className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-card-hover flex items-center gap-2"
                >
                  {" "}
                  <Clock className="w-4 h-4" /> Restore{" "}
                </button>{" "}
                <div className="border-t border-theme-border dark:border-theme-border my-1" />{" "}
                <button
                  onClick={handleDeleteClick}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  {" "}
                  <Trash2 className="w-4 h-4" /> Delete Permanently{" "}
                </button>{" "}
              </>
            ) : (
              <>
                {" "}
                <button
                  onClick={handleShare}
                  className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-card-hover flex items-center gap-2"
                >
                  {" "}
                  <Share2 className="w-4 h-4" /> Share link{" "}
                </button>{" "}
                {file.type !== "folder" && (
                  <button
                    onClick={handleDownload}
                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-card-hover flex items-center gap-2"
                  >
                    {" "}
                    <Download className="w-4 h-4" /> Download{" "}
                  </button>
                )}{" "}
                {file.type !== "folder" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      setShowVersionHistory(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-bg flex items-center gap-2"
                  >
                    {" "}
                    <Clock className="w-4 h-4" /> Version History{" "}
                  </button>
                )}{" "}
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    setIsRenaming(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-card-hover flex items-center gap-2"
                >
                  {" "}
                  <Edit2 className="w-4 h-4" /> Rename{" "}
                </button>{" "}
                <button
                  onClick={handleStar}
                  className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-card-hover flex items-center gap-2"
                >
                  {" "}
                  <Star
                    className={`w-4 h-4 ${
                      file.starred ? "fill-amber-400 text-amber-400" : ""
                    }
 `}
                  />{" "}
                  {file.starred ? "Remove Star" : "Add to Starred"}{" "}
                </button>{" "}
                <div className="border-t border-theme-border dark:border-theme-border my-1" />{" "}
                <button
                  onClick={handleDeleteClick}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  {" "}
                  <Trash2 className="w-4 h-4" /> Move to Trash{" "}
                </button>{" "}
              </>
            )}{" "}
          </motion.div>
        )}{" "}
      </AnimatePresence>{" "}
      {isRenaming && (
        <div className="absolute right-0 top-10 w-64 bg-theme-card rounded-lg shadow-xl border border-theme-border p-3 z-50">
          {" "}
          <form onSubmit={handleRename}>
            {" "}
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-theme-border rounded text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />{" "}
            <div className="flex justify-end gap-2">
              {" "}
              <button
                type="button"
                onClick={() => setIsRenaming(false)}
                className="px-2 py-1 text-xs text-theme-muted dark:text-theme-muted"
              >
                {" "}
                Cancel{" "}
              </button>{" "}
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
              >
                {" "}
                Save{" "}
              </button>{" "}
            </div>{" "}
          </form>{" "}
        </div>
      )}{" "}
      {showVersionHistory && (
        <VersionHistoryModal
          file={file}
          onClose={() => {
            setShowVersionHistory(false);

            onClose();
          }}
        />
      )}{" "}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={file.isDeleted ? "Delete Permanently" : "Move to Trash"}
        message={
          file.isDeleted
            ? "Are you sure you want to delete this permanently? This cannot be undone."
            : `Are you sure you want to move "${file.name}
 " to the trash?`
        }
        confirmText={file.isDeleted ? "Delete" : "Move to Trash"}
        isDestructive={true}
        onConfirm={executeDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);

          onClose();
        }}
      />{" "}
    </>
  );
};
export function FileGrid({
  files,
  onFileClick,
  onFileDoubleClick,
  selectedFileId,
  onMoveFile,
}: {
  files: FileItem[];
  onFileClick: (id: string, type: string) => void;
  onFileDoubleClick?: (id: string, type: string) => void;
  selectedFileId?: string | null;
  onMoveFile?: (fileId: string, folderId: string | null) => void;
}) {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, file: FileItem, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onFileDoubleClick) onFileDoubleClick(file.id, file.type);
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      onFileClick(file.id, file.type);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextEl = document.getElementById(`grid-item-${index + 1}`);
      if (nextEl) (nextEl as HTMLElement).focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevEl = document.getElementById(`grid-item-${index - 1}`);
      if (prevEl) (prevEl as HTMLElement).focus();
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };
  const handleDragOver = (e: React.DragEvent, file: FileItem) => {
    if (file.type === "folder") {
      e.preventDefault();
      setDragOverId(file.id);
    }
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverId(null);
  };
  const handleDrop = (e: React.DragEvent, targetFolder: FileItem) => {
    e.preventDefault();
    setDragOverId(null);
    if (targetFolder.type === "folder" && onMoveFile) {
      const sourceId = e.dataTransfer.getData("text/plain");
      if (sourceId && sourceId !== targetFolder.id) {
        onMoveFile(sourceId, targetFolder.id);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 outline-none">
      {" "}
      {files.map((file, index) => (
        <div
          key={file.id}
          id={`grid-item-${index}`}
          tabIndex={0}
          role="button"
          aria-pressed={selectedFileId === file.id}
          onKeyDown={(e) => handleKeyDown(e, file, index)}
          draggable
          onDragStart={(e) => handleDragStart(e, file.id)}
          onDragOver={(e) => handleDragOver(e, file)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, file)}
          onClick={(e) => {
            e.stopPropagation();
            onFileClick(file.id, file.type);
          }}
          className={cn(
            "relative group bg-theme-card p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3 select-none",
            dragOverId === file.id
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
              : selectedFileId === file.id
              ? "border-blue-500 bg-blue-50/50"
              : "border-theme-border hover:border-blue-300 shadow-sm hover:shadow"
          )}
          onDoubleClick={(e) => {
            e.stopPropagation();

            if (onFileDoubleClick) onFileDoubleClick(file.id, file.type);
          }}
        >
          {" "}
          {file.starred && (
            <Star className="absolute top-2 left-2 w-3 h-3 text-amber-400 fill-amber-400" />
          )}{" "}
          <div className="absolute top-2 right-2">
            {" "}
            <button
              onClick={(e) => {
                e.stopPropagation();

                setActiveMenu(activeMenu === file.id ? null : file.id);
              }}
              className="p-1 text-theme-muted hover:bg-theme-card-hover rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              {" "}
              <MoreVertical className="w-4 h-4" />{" "}
            </button>{" "}
            <ContextMenu
              isOpen={activeMenu === file.id}
              onClose={() => setActiveMenu(null)}
              file={file}
            />{" "}
          </div>{" "}
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-theme-bg">
            {" "}
            {getFileIcon(file.type, file.color)}{" "}
          </div>{" "}
          <div className="min-w-0 flex-1">
            {" "}
            <h3
              className="text-sm font-semibold text-theme-text truncate w-full"
              title={file.name}
            >
              {" "}
              {file.name}{" "}
            </h3>{" "}
            {file.isUploading ? (
              <div className="mt-1">
                {" "}
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  {" "}
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${file.uploadProgress || 0}
 %`,
                    }}
                  />{" "}
                </div>{" "}
                <p className="text-[10px] text-theme-muted dark:text-theme-muted mt-0.5 text-right">
                  {" "}
                  {Math.round(file.uploadProgress || 0)}%{" "}
                </p>{" "}
              </div>
            ) : (
              <p className="text-[11px] text-theme-muted dark:text-theme-muted truncate mt-0.5">
                {" "}
                {file.type === "folder"
                  ? "Folder"
                  : file.size
                  ? typeof file.size === "string"
                    ? file.size
                    : formatBytes(file.size)
                  : "--"}{" "}
              </p>
            )}{" "}
          </div>{" "}
        </div>
      ))}{" "}
    </div>
  );
}

export function FileList({
  files,
  onFileClick,
  onFileDoubleClick,
  selectedFileId,
  onMoveFile,
}: {
  files: FileItem[];
  onFileClick: (id: string, type: string) => void;
  onFileDoubleClick?: (id: string, type: string) => void;
  selectedFileId?: string | null;
  onMoveFile?: (fileId: string, folderId: string | null) => void;
}) {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, file: FileItem, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onFileDoubleClick) onFileDoubleClick(file.id, file.type);
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      onFileClick(file.id, file.type);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextEl = document.getElementById(`list-item-${index + 1}`);
      if (nextEl) (nextEl as HTMLElement).focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevEl = document.getElementById(`list-item-${index - 1}`);
      if (prevEl) (prevEl as HTMLElement).focus();
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };
  const handleDragOver = (e: React.DragEvent, file: FileItem) => {
    if (file.type === "folder") {
      e.preventDefault();
      setDragOverId(file.id);
    }
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverId(null);
  };
  const handleDrop = (e: React.DragEvent, targetFolder: FileItem) => {
    e.preventDefault();
    setDragOverId(null);
    if (targetFolder.type === "folder" && onMoveFile) {
      const sourceId = e.dataTransfer.getData("text/plain");
      if (sourceId && sourceId !== targetFolder.id) {
        onMoveFile(sourceId, targetFolder.id);
      }
    }
  };
  return (
    <div className="bg-theme-card rounded-xl border border-theme-border flex-1 flex flex-col overflow-hidden">
      {" "}
      <div className="grid grid-cols-12 border-b border-theme-border bg-theme-bg px-6 py-3 text-[11px] font-bold text-theme-muted dark:text-theme-muted uppercase tracking-wider">
        {" "}
        <div className="col-span-6">Name</div>{" "}
        <div className="col-span-2 text-center hidden sm:block">Owner</div>{" "}
        <div className="col-span-2 text-center hidden md:block">Modified</div>{" "}
        <div className="col-span-2 text-right hidden lg:block">Size</div>{" "}
      </div>{" "}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 outline-none" role="list">
        {" "}
        {files.map((file, index) => (
          <div
            key={file.id}
            id={`list-item-${index}`}
            tabIndex={0}
            role="listitem"
            aria-selected={selectedFileId === file.id}
            onKeyDown={(e) => handleKeyDown(e, file, index)}
            draggable
            onDragStart={(e) => handleDragStart(e, file.id)}
            onDragOver={(e) => handleDragOver(e, file)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, file)}
            onClick={(e) => {
              e.stopPropagation();
              onFileClick(file.id, file.type);
            }}
            className={cn(
              "grid grid-cols-1 lg:grid-cols-12 px-6 py-3 text-sm items-center transition-colors group cursor-pointer relative select-none focus:outline-none focus:bg-blue-50/40",
              dragOverId === file.id
                ? "bg-blue-50/80 ring-1 ring-inset ring-blue-300"
                : selectedFileId === file.id
                ? "bg-blue-50/60"
                : "hover:bg-theme-bg"
            )}
            onDoubleClick={(e) => {
              e.stopPropagation();

              if (onFileDoubleClick) onFileDoubleClick(file.id, file.type);
            }}
          >
            {" "}
            <div className="col-span-6 flex items-center gap-3 min-w-0">
              {" "}
              <div className="w-8 h-8 flex items-center justify-center bg-theme-bg rounded shrink-0">
                {" "}
                {getFileIcon(file.type, file.color)}{" "}
              </div>{" "}
              <div className="flex flex-col min-w-0 flex-1">
                {" "}
                <div className="flex items-center gap-1 min-w-0">
                  {" "}
                  <span className="font-medium text-theme-text truncate">
                    {" "}
                    {file.name}{" "}
                  </span>{" "}
                  {file.starred && (
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                  )}{" "}
                </div>{" "}
                {file.isUploading && (
                  <div className="w-full max-w-[200px] mt-1 flex items-center gap-2">
                    {" "}
                    <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      {" "}
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${file.uploadProgress || 0}
 %`,
                        }}
                      />{" "}
                    </div>{" "}
                    <span className="text-[10px] text-theme-muted dark:text-theme-muted">
                      {" "}
                      {Math.round(file.uploadProgress || 0)}%{" "}
                    </span>{" "}
                  </div>
                )}{" "}
              </div>{" "}
            </div>{" "}
            <div className="col-span-2 hidden sm:flex justify-center">
              {" "}
              <span className="text-xs bg-theme-card-hover text-theme-muted dark:text-theme-muted px-2 py-1 rounded-full truncate max-w-full">
                {" "}
                {file.ownerId === auth.currentUser?.uid
                  ? "me"
                  : file.ownerName || file.owner || "Unknown"}{" "}
              </span>{" "}
            </div>{" "}
            <div className="col-span-2 text-center text-xs text-theme-muted dark:text-theme-muted truncate hidden md:block">
              {" "}
              {new Date(file.updatedAt).toLocaleDateString()}{" "}
            </div>{" "}
            <div className="col-span-2 text-right text-xs text-theme-muted dark:text-theme-muted lg:flex items-center justify-end gap-2 hidden">
              {" "}
              <span className="truncate">
                {" "}
                {file.size
                  ? typeof file.size === "string"
                    ? file.size
                    : formatBytes(file.size)
                  : "--"}{" "}
              </span>{" "}
              <div className="flex justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity absolute right-6 bg-theme-card/90 px-2 rounded">
                {" "}
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    setActiveMenu(activeMenu === file.id ? null : file.id);
                  }}
                  className="p-1 text-theme-muted hover:text-theme-text hover:bg-theme-card-hover rounded transition-colors"
                >
                  {" "}
                  <MoreVertical className="w-4 h-4" />{" "}
                </button>{" "}
                <ContextMenu
                  isOpen={activeMenu === file.id}
                  onClose={() => setActiveMenu(null)}
                  file={file}
                />{" "}
              </div>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
    </div>
  );
}
