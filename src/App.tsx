/** * @license * SPDX-License-Identifier: Apache-2.0 */ import React, { useEffect } from "react";

import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { AppProvider, useAppContext } from "./lib/AppContext";
import { fileService } from "./lib/fileService";

import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";

import AdminDashboard from "./pages/AdminDashboard";

import Editor from "./pages/Editor";

import Pricing from "./pages/Pricing";

import Checkout from "./pages/Checkout";

import {
  SettingsPage,
  ProfilePage,
  SharedPage,
  RecentPage,
  StarredPage,
  TrashPage,
} from "./pages/PlaceholderPages";

import { Chatbot } from "./components/Chatbot";
import { KeyboardShortcutsModal } from "./components/KeyboardShortcutsModal";

function GlobalShortcuts() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (user) {
          fileService.createDocument(user.id, "Untitled Document").then(id => {
            navigate(`/editor/${id}`);
            toast.success("Created new document via shortcut");
          });
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('global-save'));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, navigate]);
  return null;
}

export default function App() {
  return (
    <AppProvider>
      {" "}
      <ToastContainer
        position="bottom-right"
        aria-label="Toast Container"
      />{" "}
      <BrowserRouter>
        {" "}
        <GlobalShortcuts />
        <KeyboardShortcutsModal />
        <Routes>
          {" "}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />{" "}
          <Route path="/login" element={<Login />} />{" "}
          <Route path="/editor/:id" element={<Editor />} />{" "}
          <Route path="/pricing" element={<Pricing />} />{" "}
          <Route path="/checkout" element={<Checkout />} />{" "}
          <Route element={<DashboardLayout />}>
            {" "}
            <Route path="/dashboard" element={<Dashboard />} />{" "}
            <Route path="/folder/:id" element={<Dashboard />} />{" "}
            <Route path="/admin" element={<AdminDashboard />} />{" "}
            <Route path="/settings" element={<SettingsPage />} />{" "}
            <Route path="/profile" element={<ProfilePage />} />{" "}
            <Route path="/shared" element={<Dashboard />} />{" "}
            <Route path="/recent" element={<Dashboard />} />{" "}
            <Route path="/starred" element={<Dashboard />} />{" "}
            <Route path="/trash" element={<Dashboard />} />{" "}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />{" "}
          </Route>{" "}
        </Routes>{" "}
      </BrowserRouter>{" "}
      <Chatbot />{" "}
    </AppProvider>
  );
}
