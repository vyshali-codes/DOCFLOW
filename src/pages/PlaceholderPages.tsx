import React, { useState } from "react";

import { Settings, Users, Clock, Star, Trash2, CreditCard } from "lucide-react";

import { useAppContext } from "../lib/AppContext";

import { formatBytes } from "../lib/utils";

import { useNavigate } from "react-router-dom";

import { FileGrid, FileList } from "../components/FileViews";

import { fileService } from "../lib/fileService";

import { ConfirmModal } from "../components/ConfirmModal";

export function SettingsPage() {
  const { user, theme, setTheme } = useAppContext();

  const navigate = useNavigate();

  const [showEmptyTrashConfirm, setShowEmptyTrashConfirm] = useState(false);

  if (!user) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      {" "}
      <div className="flex items-center gap-3 mb-8">
        {" "}
        <Settings className="w-8 h-8 text-theme-muted" />{" "}
        <h1 className="text-2xl font-bold text-theme-text dark:text-white">
          {" "}
          Settings & Billing{" "}
        </h1>{" "}
      </div>{" "}
      <div className="space-y-6">
        {" "}
        <div className="bg-theme-card rounded-xl border border-theme-border dark:border-theme-border shadow-sm overflow-hidden mb-6">
          {" "}
          <div className="p-6 border-b border-theme-border dark:border-theme-border">
            {" "}
            <h2 className="text-lg font-medium text-theme-text dark:text-white">
              {" "}
              Theme Preference{" "}
            </h2>{" "}
            <p className="text-sm text-theme-muted dark:text-theme-muted">
              {" "}
              Choose how DocFlow looks to you.{" "}
            </p>{" "}
          </div>{" "}
          <div className="p-6">
            {" "}
            <div className="flex gap-4">
              {" "}
              <button
                onClick={() => setTheme("light")}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                  theme === "light"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-theme-border dark:border-theme-border hover:border-blue-300 dark:hover:border-blue-700"
                }
 `}
              >
                {" "}
                <div className="w-12 h-12 rounded-full bg-theme-card-hover flex items-center justify-center">
                  {" "}
                  <svg
                    className="w-6 h-6 text-theme-text"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {" "}
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />{" "}
                  </svg>{" "}
                </div>{" "}
                <span className="font-medium text-theme-text dark:text-white">
                  {" "}
                  Light Mode{" "}
                </span>{" "}
              </button>{" "}
              <button
                onClick={() => setTheme("dark")}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                  theme === "dark"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-theme-border dark:border-theme-border hover:border-blue-300 dark:hover:border-blue-700"
                }
 `}
              >
                {" "}
                <div className="w-12 h-12 rounded-full bg-theme-bg flex items-center justify-center">
                  {" "}
                  <svg
                    className="w-6 h-6 text-slate-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {" "}
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />{" "}
                  </svg>{" "}
                </div>{" "}
                <span className="font-medium text-theme-text dark:text-white">
                  {" "}
                  Dark Mode{" "}
                </span>{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="bg-theme-card rounded-xl border border-theme-border dark:border-theme-border shadow-sm overflow-hidden">
          {" "}
          <div className="p-6 border-b border-theme-border dark:border-theme-border flex justify-between items-center">
            {" "}
            <div>
              {" "}
              <h2 className="text-lg font-medium text-theme-text dark:text-white flex items-center gap-2 capitalize">
                {" "}
                {user.plan || "Free"}
                Plan{" "}
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  {" "}
                  Active{" "}
                </span>{" "}
              </h2>{" "}
              <p className="text-sm text-theme-muted mt-1">
                {" "}
                {user.plan === "business"
                  ? "For growing organizations needing control."
                  : user.plan === "pro"
                  ? "Ideal for professionals and small teams."
                  : "Free forever. Great for getting started."}{" "}
              </p>{" "}
            </div>{" "}
            <button
              onClick={() => navigate("/pricing")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-500/20"
            >
              {" "}
              Upgrade Plan{" "}
            </button>{" "}
          </div>{" "}
          <div className="p-6">
            {" "}
            <div className="mb-4 flex justify-between text-sm">
              {" "}
              <span className="text-theme-muted">Storage Usage</span>{" "}
              <span className="font-medium text-theme-text dark:text-white">
                {" "}
                {formatBytes(user.storageUsed)}/{" "}
                {formatBytes(user.storageLimit)}{" "}
              </span>{" "}
            </div>{" "}
            <div className="w-full bg-theme-card-hover rounded-full h-2 overflow-hidden mb-2">
              {" "}
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0, (Number(user.storageUsed || 0) / Number(user.storageLimit || 1)) * 100)) || 0}%`,
                }}
              />{" "}
            </div>{" "}
            <p className="text-xs text-theme-muted">
              {" "}
              Using {Math.round((user.storageUsed / user.storageLimit) * 100)}%
              of your available storage.{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
        <div className="bg-theme-card rounded-xl border border-theme-border dark:border-theme-border shadow-sm overflow-hidden">
          {" "}
          <div className="p-6 border-b border-theme-border dark:border-theme-border">
            {" "}
            <h3 className="text-sm font-semibold text-theme-text dark:text-white uppercase tracking-wider">
              {" "}
              Payment History{" "}
            </h3>{" "}
          </div>{" "}
          <div className="p-8 text-center text-theme-muted">
            {" "}
            <p className="text-sm">No payment history available.</p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAppContext();

  if (!user) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      {" "}
      <div className="flex items-center gap-3 mb-8">
        {" "}
        <Users className="w-8 h-8 text-theme-muted" />{" "}
        <h1 className="text-2xl font-bold text-theme-text dark:text-white">
          {" "}
          Profile{" "}
        </h1>{" "}
      </div>{" "}
      <div className="bg-theme-card rounded-xl border border-theme-border dark:border-theme-border shadow-sm overflow-hidden mb-6">
        {" "}
        <div className="p-6 border-b border-theme-border dark:border-theme-border">
          {" "}
          <h2 className="text-lg font-medium text-theme-text dark:text-white">
            {" "}
            Personal Details{" "}
          </h2>{" "}
          <p className="text-sm text-theme-muted dark:text-theme-muted">
            {" "}
            Update your photo and personal details.{" "}
          </p>{" "}
        </div>{" "}
        <div className="p-6 space-y-6">
          {" "}
          <div className="flex items-center gap-6">
            {" "}
            <img
              src={user.avatar}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />{" "}
            <div>
              {" "}
              <button className="bg-theme-card border border-theme-border text-theme-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-theme-bg transition-colors shadow-sm">
                {" "}
                Change avatar{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-theme-text mb-1">
                {" "}
                Name{" "}
              </label>{" "}
              <input
                type="text"
                defaultValue={user.name}
                className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-card text-theme-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-theme-text mb-1">
                {" "}
                Email{" "}
              </label>{" "}
              <input
                type="email"
                defaultValue={user.email}
                className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-card text-theme-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-theme-text mb-1">
                {" "}
                Job Title{" "}
              </label>{" "}
              <input
                type="text"
                placeholder="e.g. Senior Designer"
                className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-card text-theme-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-theme-text mb-1">
                {" "}
                Timezone{" "}
              </label>{" "}
              <select className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-card text-theme-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                {" "}
                <option>UTC (Coordinated Universal Time)</option>{" "}
                <option>PST (Pacific Standard Time)</option>{" "}
                <option>EST (Eastern Standard Time)</option>{" "}
                <option>CET (Central European Time)</option>{" "}
              </select>{" "}
            </div>{" "}
            <div className="sm:col-span-2">
              {" "}
              <label className="block text-sm font-medium text-theme-text mb-1">
                {" "}
                Bio{" "}
              </label>{" "}
              <textarea
                rows={3}
                placeholder="A short bio..."
                className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-card text-theme-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />{" "}
            </div>{" "}
          </div>{" "}
          <div className="pt-4 flex justify-end gap-3 border-t border-theme-border dark:border-theme-border/50 mt-6">
            {" "}
            <button className="px-4 py-2 text-sm font-medium text-theme-muted hover:text-theme-text dark:hover:text-white transition-colors">
              {" "}
              Cancel{" "}
            </button>{" "}
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-500/20">
              {" "}
              Save Profile{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

export function SharedPage() {
  const { files, viewMode } = useAppContext();

  const sharedFiles = files.filter(
    (f) => f.sharedWith && f.sharedWith.length > 0 && !f.isDeleted
  );

  const navigate = useNavigate();

  return (
    <div className="p-8 flex flex-col h-full bg-theme-bg ">
      {" "}
      <div className="flex items-center gap-3 mb-6">
        {" "}
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
          {" "}
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />{" "}
        </div>{" "}
        <h1 className="text-2xl font-bold text-theme-text dark:text-white">
          {" "}
          Shared with me{" "}
        </h1>{" "}
      </div>{" "}
      {sharedFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center p-8 bg-theme-card rounded-2xl shadow-sm border border-theme-border dark:border-theme-border">
          {" "}
          <div className="w-48 h-48 mb-2 flex items-center justify-center opacity-80 mix-blend-multiply dark:mix-blend-normal">
            {" "}
            <img
              src="https://illustrations.popsy.co/blue/team-communication.svg"
              alt="Shared With Me"
              className="w-full h-full object-contain dark:invert"
            />{" "}
          </div>{" "}
          <h2 className="text-xl font-bold text-theme-text dark:text-white mb-2">
            {" "}
            Nothing Shared Yet{" "}
          </h2>{" "}
          <p className="text-theme-muted dark:text-theme-muted max-w-md mx-auto">
            {" "}
            Documents shared by other users will appear here.{" "}
          </p>{" "}
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          {" "}
          {viewMode === "grid" ? (
            <FileGrid
              files={sharedFiles}
              onFileClick={(id, type) =>
                navigate(`/editor/${id}
 `)
              }
            />
          ) : (
            <FileList
              files={sharedFiles}
              onFileClick={(id, type) =>
                navigate(`/editor/${id}
 `)
              }
            />
          )}{" "}
        </div>
      )}{" "}
    </div>
  );
}

export function RecentPage() {
  const { files, viewMode } = useAppContext();

  const recentFiles = files
    .filter((f) => !f.isDeleted)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 20);

  const navigate = useNavigate();

  return (
    <div className="p-8 flex flex-col h-full bg-theme-bg ">
      {" "}
      <div className="flex items-center gap-3 mb-6">
        {" "}
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
          {" "}
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />{" "}
        </div>{" "}
        <h1 className="text-2xl font-bold text-theme-text dark:text-white">
          {" "}
          Recent files{" "}
        </h1>{" "}
      </div>{" "}
      {recentFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center p-8 bg-theme-card rounded-2xl shadow-sm border border-theme-border dark:border-theme-border">
          {" "}
          <div className="w-48 h-48 mb-2 flex items-center justify-center opacity-80 mix-blend-multiply dark:mix-blend-normal">
            {" "}
            <img
              src="https://illustrations.popsy.co/blue/time-management.svg"
              alt="Recent"
              className="w-full h-full object-contain dark:invert"
            />{" "}
          </div>{" "}
          <h2 className="text-xl font-bold text-theme-text dark:text-white mb-2">
            {" "}
            Nothing Here Yet{" "}
          </h2>{" "}
          <p className="text-theme-muted dark:text-theme-muted max-w-md mx-auto">
            {" "}
            Recently opened files will appear here.{" "}
          </p>{" "}
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          {" "}
          {viewMode === "grid" ? (
            <FileGrid
              files={recentFiles}
              onFileClick={(id, type) =>
                navigate(`/editor/${id}
 `)
              }
            />
          ) : (
            <FileList
              files={recentFiles}
              onFileClick={(id, type) =>
                navigate(`/editor/${id}
 `)
              }
            />
          )}{" "}
        </div>
      )}{" "}
    </div>
  );
}

export function StarredPage() {
  const { files, viewMode } = useAppContext();

  const starredFiles = files.filter((f) => f.starred && !f.isDeleted);

  const navigate = useNavigate();

  return (
    <div className="p-8 flex flex-col h-full bg-theme-bg ">
      {" "}
      <div className="flex items-center gap-3 mb-6">
        {" "}
        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center">
          {" "}
          <Star className="w-5 h-5 text-amber-500" />{" "}
        </div>{" "}
        <h1 className="text-2xl font-bold text-theme-text dark:text-white">
          {" "}
          Starred items{" "}
        </h1>{" "}
      </div>{" "}
      {starredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center p-8 bg-theme-card rounded-2xl shadow-sm border border-theme-border dark:border-theme-border">
          {" "}
          <div className="w-48 h-48 mb-2 flex items-center justify-center opacity-80 mix-blend-multiply dark:mix-blend-normal">
            {" "}
            <img
              src="https://illustrations.popsy.co/blue/success.svg"
              alt="Starred"
              className="w-full h-full object-contain dark:invert"
            />{" "}
          </div>{" "}
          <h2 className="text-xl font-bold text-theme-text dark:text-white mb-2">
            {" "}
            No Starred Files{" "}
          </h2>{" "}
          <p className="text-theme-muted dark:text-theme-muted max-w-md mx-auto">
            {" "}
            Star important files for quick access.{" "}
          </p>{" "}
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          {" "}
          {viewMode === "grid" ? (
            <FileGrid
              files={starredFiles}
              onFileClick={(id, type) =>
                navigate(`/editor/${id}
 `)
              }
            />
          ) : (
            <FileList
              files={starredFiles}
              onFileClick={(id, type) =>
                navigate(`/editor/${id}
 `)
              }
            />
          )}{" "}
        </div>
      )}{" "}
    </div>
  );
}

export function TrashPage() {
  const { files, viewMode } = useAppContext();

  const deletedFiles = files.filter((f) => f.isDeleted);

  const handleEmptyTrash = async () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete all items in trash?"
      )
    ) {
      for (const file of deletedFiles) {
        await fileService.deletePermanently(file.id, file.type === "folder");
      }
    }
  };
  return (
    <div className="p-8 flex flex-col h-full bg-theme-bg ">
      {" "}
      <div className="flex justify-between items-end mb-6">
        {" "}
        <div className="flex items-center gap-3">
          {" "}
          <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
            {" "}
            <Trash2 className="w-5 h-5 text-theme-muted dark:text-theme-muted" />{" "}
          </div>{" "}
          <div>
            {" "}
            <h1 className="text-2xl font-bold text-theme-text dark:text-white">
              {" "}
              Trash{" "}
            </h1>{" "}
            <p className="text-sm text-theme-muted dark:text-theme-muted">
              {" "}
              Items in the trash are deleted forever after 30 days.{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
        {deletedFiles.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="bg-theme-card border border-theme-border dark:border-theme-border text-theme-text hover:text-red-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            {" "}
            Empty Trash{" "}
          </button>
        )}{" "}
      </div>{" "}
      {deletedFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center p-8 bg-theme-card rounded-2xl shadow-sm border border-theme-border dark:border-theme-border">
          {" "}
          <div className="w-48 h-48 mb-2 flex items-center justify-center opacity-80 mix-blend-multiply dark:mix-blend-normal">
            {" "}
            <img
              src="https://illustrations.popsy.co/blue/cleaning.svg"
              alt="Trash"
              className="w-full h-full object-contain dark:invert"
            />{" "}
          </div>{" "}
          <h2 className="text-xl font-bold text-theme-text dark:text-white mb-2">
            {" "}
            Trash is Empty{" "}
          </h2>{" "}
          <p className="text-theme-muted dark:text-theme-muted max-w-md mx-auto mb-6">
            {" "}
            Deleted documents stay here for 30 days.{" "}
          </p>{" "}
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          {" "}
          {viewMode === "grid" ? (
            <FileGrid files={deletedFiles} onFileClick={() => {}} />
          ) : (
            <FileList files={deletedFiles} onFileClick={() => {}} />
          )}{" "}
        </div>
      )}{" "}
    </div>
  );
}
