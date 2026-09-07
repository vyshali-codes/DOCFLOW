import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { Cloud, Lock, Mail, ArrowRight } from "lucide-react";

import { motion } from "framer-motion";

import { useAppContext } from "../lib/AppContext";

import { auth, googleProvider } from "../lib/firebase";

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();

  const { theme, authLoading } = useAppContext();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [isSignUp, setIsSignUp] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/operation-not-allowed") {
        setError(
          "Email/Password login is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method, or use Google Login."
        );
      } else if (!isSignUp && err.code === "auth/user-not-found") {
        setError("User not found. Please sign up instead.");
      } else {
        setError(
          err.message || (isSignUp ? "Failed to sign up" : "Failed to login")
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    setError(null);

    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);

      navigate("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/popup-blocked") {
        setError(
          'Google Sign-In popup was blocked by your browser. Please use the "Open in new tab" button at the top right of the preview window, or log in with email and password.'
        );
      } else {
        setError(err.message || "Google sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };
  if (authLoading) {
    return (
      <div className="min-h-screen bg-theme-bg flex flex-col items-center justify-center">
        {" "}
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow-sm"></div>{" "}
        <p className="text-theme-muted dark:text-theme-muted font-medium text-lg tracking-tight">
          {" "}
          Initializing DOCFLOW...{" "}
        </p>{" "}
        <p className="text-theme-muted dark:text-theme-muted text-sm mt-2">
          {" "}
          Connecting to secure servers{" "}
        </p>{" "}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {" "}
      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        {" "}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-500 mb-6"
        >
          {" "}
          <img src="/logo.svg" alt="DocFlow Logo" className="w-10 h-10 object-contain" />{" "}
          <span className="text-3xl font-bold tracking-tight text-theme-text dark:text-white">
            {" "}
            DOCFLOW{" "}
          </span>{" "}
        </Link>{" "}
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-theme-text dark:text-white">
          {" "}
          {isSignUp ? "Create your account" : "Sign in to your account"}{" "}
        </h2>{" "}
      </motion.div>{" "}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          delay: 0.1,
        }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        {" "}
        <div className="bg-theme-card py-8 px-4 shadow-xl border border-theme-border dark:border-theme-border sm:rounded-2xl sm:px-10">
          {" "}
          <form className="space-y-6" onSubmit={handleEmailLogin}>
            {" "}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {" "}
                {error}{" "}
              </div>
            )}{" "}
            <div>
              {" "}
              <label
                htmlFor="email"
                className="block text-sm font-medium text-theme-text "
              >
                {" "}
                Email address{" "}
              </label>{" "}
              <div className="mt-2 relative">
                {" "}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-muted">
                  {" "}
                  <Mail className="h-5 w-5" />{" "}
                </div>{" "}
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-theme-border dark:border-theme-border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-theme-card text-theme-text dark:text-white transition-all"
                />{" "}
              </div>{" "}
            </div>{" "}
            <div>
              {" "}
              <label
                htmlFor="password"
                className="block text-sm font-medium text-theme-text "
              >
                {" "}
                Password{" "}
              </label>{" "}
              <div className="mt-2 relative">
                {" "}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-theme-muted">
                  {" "}
                  <Lock className="h-5 w-5" />{" "}
                </div>{" "}
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-theme-border dark:border-theme-border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-theme-card text-theme-text dark:text-white transition-all"
                />{" "}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-muted hover:text-theme-muted"
                >
                  {" "}
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      {" "}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />{" "}
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      {" "}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />{" "}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />{" "}
                    </svg>
                  )}{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            <div>
              {" "}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                {" "}
                {loading
                  ? isSignUp
                    ? "Signing up..."
                    : "Signing in..."
                  : isSignUp
                  ? "Sign up"
                  : "Sign in"}{" "}
                <ArrowRight className="w-4 h-4" />{" "}
              </button>{" "}
            </div>{" "}
            <div className="text-center text-sm">
              {" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {" "}
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Need an account? Sign up"}{" "}
              </button>{" "}
            </div>{" "}
          </form>{" "}
          <div className="mt-6">
            {" "}
            <div className="relative">
              {" "}
              <div className="absolute inset-0 flex items-center">
                {" "}
                <div className="w-full border-t border-theme-border dark:border-theme-border" />{" "}
              </div>{" "}
              <div className="relative flex justify-center text-sm">
                {" "}
                <span className="px-2 bg-theme-card text-theme-muted">
                  {" "}
                  Or continue with{" "}
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <div className="mt-6">
              {" "}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full inline-flex justify-center items-center gap-3 py-2.5 px-4 border border-theme-border dark:border-theme-border rounded-lg shadow-sm bg-theme-card text-sm font-medium text-theme-muted hover:bg-theme-bg transition-colors"
              >
                {" "}
                <svg className="w-5 h-5" aria-hidden="true" viewBox="0 0 24 24">
                  {" "}
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />{" "}
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />{" "}
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />{" "}
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />{" "}
                </svg>{" "}
                Sign in with Google{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </motion.div>{" "}
    </div>
  );
}
