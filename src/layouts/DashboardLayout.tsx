import React from "react";

import { Outlet, Navigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";

import Header from "../components/Header";

import { useAppContext } from "../lib/AppContext";

import { UploadToast } from "../components/UploadToast";
import { Keyboard } from "lucide-react";

export default function DashboardLayout() {
  const { user, authLoading } = useAppContext();

  if (authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-theme-bg ">
        {" "}
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow-sm"></div>{" "}
        <p className="text-theme-muted font-medium text-lg tracking-tight">
          {" "}
          Initializing DOCFLOW...{" "}
        </p>{" "}
        <p className="text-theme-muted text-sm mt-2">
          {" "}
          Connecting to secure servers{" "}
        </p>{" "}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-theme-bg font-sans text-theme-text overflow-hidden">
      {" "}
      <Sidebar />{" "}
      <div className="flex flex-col flex-1 min-w-0">
        {" "}
        <Header />{" "}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {" "}
          <Outlet />{" "}
        </main>{" "}
        {/* STATUS BAR */}{" "}
        <footer className="h-8 bg-theme-card border-t border-theme-border dark:border-theme-border flex items-center justify-between px-6 shrink-0 relative z-40">
          {" "}
          <div className="flex items-center gap-4 text-[10px] text-theme-muted font-medium uppercase tracking-wide">
            {" "}
            <span className="flex items-center gap-1">
              {" "}
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{" "}
              Cloud Sync Active{" "}
            </span>{" "}
            <span>v4.2.0-stable</span>{" "}
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-shortcuts'))}
              className="flex items-center gap-1 hover:text-theme-text transition-colors border-l border-theme-border pl-4"
              title="Keyboard Shortcuts (Ctrl+/)"
            >
              <Keyboard className="w-3 h-3" />
              Shortcuts
            </button>
          </div>{" "}
          <div className="flex items-center gap-3 text-[10px] text-theme-muted">
            {" "}
            <span>Region: AWS-US-EAST-1</span>{" "}
            <span className="h-3 w-[1px] bg-slate-200"></span>{" "}
            <span>
              {" "}
              Last update:{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
            </span>{" "}
          </div>{" "}
        </footer>{" "}
      </div>{" "}
      <UploadToast />{" "}
    </div>
  );
}
