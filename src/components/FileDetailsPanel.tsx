import React from "react";

import {
  X,
  Info,
  Calendar,
  HardDrive,
  Share2,
  Tag,
  User,
  MapPin,
} from "lucide-react";

import { useAppContext } from "../lib/AppContext";

import { formatBytes } from "../lib/utils";

import { getFileIcon } from "./FileViews";

export function FileDetailsPanel({
  fileId,
  onClose,
}: {
  fileId: string;

  onClose: () => void;
}) {
  const { files } = useAppContext();

  const file = files.find((f) => f.id === fileId);

  if (!file) return null;

  return (
    <div className="w-80 border-l border-theme-border bg-theme-card h-full flex flex-col shrink-0 overflow-y-auto">
      {" "}
      <div className="flex items-center justify-between p-4 border-b border-theme-border">
        {" "}
        <h3 className="text-sm font-semibold text-theme-text flex items-center gap-2">
          {" "}
          <Info className="w-4 h-4 text-theme-muted dark:text-theme-muted" />{" "}
          Details{" "}
        </h3>{" "}
        <button
          onClick={onClose}
          className="p-1 hover:bg-theme-card-hover rounded-md text-theme-muted dark:text-theme-muted"
        >
          {" "}
          <X className="w-4 h-4" />{" "}
        </button>{" "}
      </div>{" "}
      <div className="p-6 border-b border-theme-border flex flex-col items-center text-center">
        {" "}
        <div className="w-16 h-16 rounded-2xl bg-theme-bg flex items-center justify-center mb-4">
          {" "}
          {getFileIcon(file.type)}{" "}
        </div>{" "}
        <h4 className="text-sm font-bold text-theme-text break-words w-full">
          {" "}
          {file.name}{" "}
        </h4>{" "}
        <p className="text-xs text-theme-muted dark:text-theme-muted uppercase tracking-wider mt-1">
          {" "}
          {file.type}•{" "}
          {typeof file.size === "number"
            ? formatBytes(file.size)
            : String(file.size)}{" "}
        </p>{" "}
      </div>{" "}
      <div className="p-4 space-y-4">
        {" "}
        <div className="space-y-3">
          {" "}
          <DetailRow
            icon={<User className="w-4 h-4" />}
            label="Owner"
            value={file.ownerName || "Unknown"}
          />{" "}
          <DetailRow
            icon={<Calendar className="w-4 h-4" />}
            label="Created"
            value={new Date(file.createdAt || Date.now()).toLocaleDateString()}
          />{" "}
          <DetailRow
            icon={<Calendar className="w-4 h-4" />}
            label="Modified"
            value={new Date(file.updatedAt || Date.now()).toLocaleDateString()}
          />{" "}
          <DetailRow
            icon={<HardDrive className="w-4 h-4" />}
            label="Size"
            value={
              typeof file.size === "number"
                ? formatBytes(file.size)
                : String(file.size)
            }
          />{" "}
          <DetailRow
            icon={<MapPin className="w-4 h-4" />}
            label="Location"
            value={file.parentId ? "Folder" : "My Drive"}
          />{" "}
          <DetailRow
            icon={<Share2 className="w-4 h-4" />}
            label="Shared"
            value={
              file.sharedWith && file.sharedWith.length > 0
                ? `${file.sharedWith.length}
 users`
                : "Not shared"
            }
          />{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;

  label: string;

  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      {" "}
      <div className="text-theme-muted mt-0.5">{icon}</div>{" "}
      <div>
        {" "}
        <p className="text-[10px] font-medium text-theme-muted uppercase tracking-wider">
          {" "}
          {label}{" "}
        </p>{" "}
        <p className="text-sm text-theme-text ">{value}</p>{" "}
      </div>{" "}
    </div>
  );
}
