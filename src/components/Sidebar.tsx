import React from "react";

import { NavLink, useNavigate, useLocation } from "react-router-dom";

import {
  Folder,
  HardDrive,
  Users,
  Star,
  Clock,
  Trash2,
  Settings,
  HelpCircle,
  LayoutDashboard,
  Shield,
  Cloud,
  ChevronDown,
  User,
} from "lucide-react";

import { useAppContext } from "../lib/AppContext";

import { cn, formatBytes } from "../lib/utils";

import { motion } from "framer-motion";

const SidebarItem = ({
  icon: Icon,
  label,
  to,
  badge,
}: {
  icon: any;

  label: string;

  to: string;

  badge?: number;
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-blue-600 text-theme-text"
            : "text-theme-muted hover:text-theme-text hover:bg-theme-card"
        )
      }
    >
      {" "}
      <div className="flex items-center gap-3">
        {" "}
        <Icon className="w-4 h-4" /> <span>{label}</span>{" "}
      </div>{" "}
      {badge !== undefined && (
        <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs font-semibold">
          {" "}
          {badge}{" "}
        </span>
      )}{" "}
    </NavLink>
  );
};
export default function Sidebar() {
  const { user, isSidebarOpen } = useAppContext();

  if (!user) return null;

  const storagePercentage = Math.min(100, Math.max(0, (Number(user.storageUsed || 0) / Number(user.storageLimit || 1)) * 100)) || 0;

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isSidebarOpen ? 256 : 0,
        opacity: isSidebarOpen ? 1 : 0,
      }}
      className={cn(
        "flex flex-col h-screen bg-theme-card overflow-hidden shrink-0"
      )}
    >
      {" "}
      <div className="p-6 flex items-center gap-2">
        {" "}
        <img src="/logo.svg" alt="DocFlow Logo" className="w-8 h-8 object-contain" />{" "}
        <span className="text-theme-text font-bold text-xl tracking-tight">
          {" "}
          DOCFLOW{" "}
        </span>{" "}
      </div>{" "}
      <div className="px-4 py-2 hidden">
        {" "}
        <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-theme-text px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          {" "}
          <span className="text-xl leading-none">+</span> New{" "}
        </button>{" "}
      </div>{" "}
      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-4">
        {" "}
        <div className="space-y-1">
          {" "}
          <SidebarItem icon={HardDrive} label="My Drive" to="/dashboard" />{" "}
          <SidebarItem icon={Users} label="Shared with Me" to="/shared" />{" "}
          <SidebarItem icon={Star} label="Starred" to="/starred" />{" "}
          <SidebarItem icon={Clock} label="Recent" to="/recent" />{" "}
          <SidebarItem icon={Trash2} label="Trash" to="/trash" />{" "}
          <SidebarItem icon={User} label="Profile" to="/profile" />{" "}
          <SidebarItem icon={Settings} label="Settings" to="/settings" />{" "}
        </div>{" "}
        {user.role === "admin" && (
          <div>
            {" "}
            <div className="space-y-1">
              {" "}
              <SidebarItem
                icon={LayoutDashboard}
                label="Admin Dashboard"
                to="/admin"
              />{" "}
              <SidebarItem
                icon={Shield}
                label="Access Control"
                to="/admin/access"
              />{" "}
            </div>{" "}
          </div>
        )}{" "}
      </nav>{" "}
      <div className="p-6">
        {" "}
        <div className="bg-theme-card rounded-xl p-4">
          {" "}
          <div className="flex justify-between items-center mb-2">
            {" "}
            <span className="text-xs text-theme-muted">Storage Used</span>{" "}
            <span className="text-xs text-theme-muted font-medium">
              {" "}
              {storagePercentage > 0 && storagePercentage < 1 ? '< 1' : Math.round(storagePercentage)}%{" "}
            </span>{" "}
          </div>{" "}
          <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2 overflow-hidden">
            {" "}
            <div
              className={cn(
                "h-full rounded-full",
                storagePercentage > 90
                  ? "bg-red-500"
                  : storagePercentage > 75
                  ? "bg-amber-500"
                  : "bg-blue-600"
              )}
              style={{
                width: `${storagePercentage}%`,
              }}
            />{" "}
          </div>{" "}
          <p className="text-[10px] text-theme-muted">
            {" "}
            {formatBytes(user.storageUsed)} of {formatBytes(user.storageLimit)} used{" "}
          </p>{" "}
          <button
            onClick={() => (window.location.href = "/pricing")}
            className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-theme-text rounded text-xs font-medium transition-colors"
          >
            {" "}
            Upgrade Plan{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </motion.aside>
  );
}
