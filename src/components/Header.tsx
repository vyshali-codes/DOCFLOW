import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  User as UserIcon,
  Filter,
  X,
} from "lucide-react";
import { useAppContext } from "../lib/AppContext";
import { useNavigate } from "react-router-dom";
export default function Header() {
  const {
    user,
    isSidebarOpen,
    setIsSidebarOpen,
    searchQuery,
    setSearchQuery,
    logout,
    theme,
    setTheme,
    advancedFilters,
    setAdvancedFilters,
  } = useAppContext();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchPopover, setShowSearchPopover] = useState(false);
  /* Local state for the popover so it only applies wh */ const [
    fileType,
    setFileType,
  ] = useState(advancedFilters.type);
  const [owner, setOwner] = useState(advancedFilters.owner);
  const [dateFrom, setDateFrom] = useState(advancedFilters.dateFrom);
  const [dateTo, setDateTo] = useState(advancedFilters.dateTo);
  const [tags, setTags] = useState(advancedFilters.tags);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchPopover(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  if (!user) return null;
  return (
    <header className="h-16 bg-theme-card border-b border-theme-border flex items-center justify-between px-8 sticky top-0 z-20">
      {" "}
      <div className="flex-1 max-w-xl flex items-center gap-4">
        {" "}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 -ml-2 text-theme-muted hover:text-theme-text bg-theme-card rounded-md transition-colors sm:hidden"
        >
          {" "}
          <Menu className="w-5 h-5" />{" "}
        </button>{" "}
        <div className="w-full relative group" ref={searchRef}>
          {" "}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-muted">
            {" "}
            <Search className="h-4 w-4" />{" "}
          </div>{" "}
          <input
            ref={searchInputRef}
            type="text"
            className="block w-full bg-theme-card-hover border-none rounded-lg py-2 pl-10 pr-10 text-sm text-theme-text placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Search in DOCFLOW... (Ctrl+F)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchPopover(true)}
          />{" "}
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-muted hover:text-blue-500"
            onClick={() => setShowSearchPopover(!showSearchPopover)}
          >
            {" "}
            <Filter className="h-4 w-4" />{" "}
          </button>{" "}
          {showSearchPopover && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-theme-card border border-theme-border rounded-xl shadow-lg p-4 z-50">
              {" "}
              {/* Auto suggestions */}
              <div className="mb-4 pb-4 border-b border-theme-border">
                {" "}
                <h3 className="text-xs font-semibold text-theme-muted dark:text-theme-muted mb-2 uppercase tracking-wider">
                  Recent & Popular Searches
                </h3>{" "}
                <div className="flex flex-wrap gap-2">
                  {" "}
                  {[
                    "Q4 Report",
                    "Budget 2024",
                    "Marketing Assets",
                    "Meeting Notes",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSearchPopover(false);
                      }}
                      className="text-xs bg-theme-card-hover text-theme-muted dark:text-theme-muted hover:bg-blue-50 hover:text-blue-600 px-2 py-1 rounded-md transition-colors"
                    >
                      {" "}
                      {suggestion}
                    </button>
                  ))}
                </div>{" "}
              </div>{" "}
              <div className="flex justify-between items-center mb-4">
                {" "}
                <h3 className="font-semibold text-sm">Advanced Search</h3>{" "}
                <button
                  onClick={() => setShowSearchPopover(false)}
                  className="text-theme-muted hover:text-theme-text "
                >
                  {" "}
                  <X className="w-4 h-4" />{" "}
                </button>{" "}
              </div>{" "}
              <div className="space-y-4">
                {" "}
                <div>
                  {" "}
                  <label className="block text-xs font-medium text-theme-text mb-1">
                    File Type
                  </label>{" "}
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full text-sm border-theme-border rounded-lg p-2 bg-theme-bg"
                  >
                    {" "}
                    <option value="all">Any type</option>{" "}
                    <option value="pdf">PDF</option>{" "}
                    <option value="word">Word Document</option>{" "}
                    <option value="excel">Spreadsheet</option>{" "}
                    <option value="image">Image</option>{" "}
                    <option value="text">Text</option>{" "}
                  </select>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-xs font-medium text-theme-text mb-1">
                    Owner
                  </label>{" "}
                  <select
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full text-sm border-theme-border rounded-lg p-2 bg-theme-bg"
                  >
                    {" "}
                    <option value="all">Anyone</option>{" "}
                    <option value="me">Owned by me</option>{" "}
                    <option value="others">Not owned by me</option>{" "}
                  </select>{" "}
                </div>{" "}
                <div className="grid grid-cols-2 gap-2">
                  {" "}
                  <div>
                    {" "}
                    <label className="block text-xs font-medium text-theme-text mb-1">
                      Modified After
                    </label>{" "}
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full text-sm border-theme-border rounded-lg p-2 bg-theme-bg"
                    />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <label className="block text-xs font-medium text-theme-text mb-1">
                      Modified Before
                    </label>{" "}
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full text-sm border-theme-border rounded-lg p-2 bg-theme-bg"
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="block text-xs font-medium text-theme-text mb-1">
                    Tags (comma separated)
                  </label>{" "}
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. design, q4"
                    className="w-full text-sm border-theme-border rounded-lg p-2 bg-theme-bg"
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="mt-4 pt-4 border-t border-theme-border flex justify-end gap-2">
                {" "}
                <button
                  onClick={() => {
                    const reset = {
                      type: "all",
                      owner: "all",
                      dateFrom: "",
                      dateTo: "",
                      tags: "",
                    };
                    setFileType("all");
                    setOwner("all");
                    setDateFrom("");
                    setDateTo("");
                    setTags("");
                    setSearchQuery("");
                    setAdvancedFilters(reset);
                    setShowSearchPopover(false);
                  }}
                  className="px-3 py-1.5 text-xs text-theme-muted dark:text-theme-muted hover:bg-theme-card-hover rounded-md"
                >
                  {" "}
                  Reset{" "}
                </button>{" "}
                <button
                  onClick={() => {
                    setAdvancedFilters({
                      type: fileType,
                      owner,
                      dateFrom,
                      dateTo,
                      tags,
                    });
                    setShowSearchPopover(false);
                  }}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-md shadow-sm"
                >
                  {" "}
                  Apply Filters{" "}
                </button>{" "}
              </div>{" "}
            </div>
          )}
        </div>{" "}
      </div>{" "}
      <div className="flex items-center gap-4 ml-4">
        {" "}
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hidden sm:flex items-center gap-2 shadow-sm transition-all">
          {" "}
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>{" "}
          New Document{" "}
        </button>{" "}
        <div className="relative">
          {" "}
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center focus:outline-none"
          >
            {" "}
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-theme-muted dark:text-theme-muted border border-theme-border">
              {" "}
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()}
            </div>{" "}
          </button>{" "}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-theme-card border border-theme-border rounded-lg shadow-lg py-1 z-50">
              {" "}
              <div className="px-4 py-2 border-b border-theme-border">
                {" "}
                <p className="text-sm font-medium text-theme-text truncate">
                  {user.name}
                </p>{" "}
                <p className="text-xs text-theme-muted dark:text-theme-muted truncate">
                  {user.email}
                </p>{" "}
              </div>{" "}
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/settings");
                }}
                className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-bg flex items-center"
              >
                {" "}
                <UserIcon className="w-4 h-4 mr-2" /> Profile{" "}
              </button>{" "}
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/settings");
                }}
                className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-bg flex items-center"
              >
                {" "}
                <Settings className="w-4 h-4 mr-2" /> Settings{" "}
              </button>{" "}
              <div className="border-t border-theme-border my-1"></div>{" "}
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate("/login");
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                {" "}
                <LogOut className="w-4 h-4 mr-2" /> Sign out{" "}
              </button>{" "}
            </div>
          )}
        </div>{" "}
      </div>{" "}
    </header>
  );
}
