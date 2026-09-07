import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Maximize2,
  Minimize2,
  Mic,
  MicOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../lib/AppContext";
import { useLiveAPI } from "../lib/useLiveAPI";
interface Message {
  role: "user" | "model";
  parts: {
    text: string;
  } [];
}
export function Chatbot() {
  const { startLive, stopLive, isRecording, isConnecting } = useLiveAPI();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      parts: [
        {
          text: "Hello! I am your AI assistant. How can I help you today?",
        },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { files, user } = useAppContext();
  /* Custom system instruction for the chatbot */ const systemInstruction = `You are a helpful and polite AI assistant built into a modern file management drive app (similar to Google Drive). You assist the user with any tasks they have. Keep your answers concise, clear, and relevant to document management when possible. Current User Context: - Name: ${
    user?.name || "Unknown"
  }
 - Total Files: ${files.length}
 - File Names: ${files.map((f) => f.name).join(", ")}
 `;
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isExpanded]);
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage: Message = {
      role: "user",
      parts: [
        {
          text: input,
        },
      ],
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    try {
      /* Filter out the initial greeting which has role m */ /* because Gemini API requires the first message to */ const apiContents =
        newMessages.filter(
          (msg, index) => !(index === 0 && msg.role === "model")
        );
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: apiContents,
          systemInstruction,
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch response");
      const data = await response.json();
      setMessages([
        ...newMessages,
        {
          role: "model",
          parts: [
            {
              text: data.text,
            },
          ],
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages,
        {
          role: "model",
          parts: [
            {
              text: "Sorry, I encountered an error while processing your request.",
            },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      {" "}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl transition-all hover:scale-105 z-40 ${
          isOpen ? "scale-0" : "scale-100"
        }
 `}
      >
        {" "}
        <MessageSquare className="w-6 h-6" />{" "}
      </button>{" "}
      <AnimatePresence>
        {" "}
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.95,
            }}
            transition={{
              duration: 0.2,
            }}
            className={`fixed z-50 bg-theme-card border border-theme-border dark:border-theme-border shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded
                ? "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] h-[calc(100vh-32px)] sm:w-[600px] sm:h-[800px]"
                : "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[400px] h-[500px]"
            }
 `}
          >
            {" "}
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between shrink-0">
              {" "}
              <div className="flex items-center gap-3">
                {" "}
                <div className="bg-theme-card/20 p-2 rounded-full">
                  {" "}
                  <Bot className="w-5 h-5" />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h3 className="font-semibold text-sm">
                    DocFlow Assistant
                  </h3>{" "}
                  <p className="text-blue-100 text-xs">Gemini 3.5 Flash</p>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex items-center gap-1">
                {" "}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-theme-card/20 rounded-md transition-colors hidden sm:block"
                >
                  {" "}
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>{" "}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-theme-card/20 rounded-md transition-colors"
                >
                  {" "}
                  <X className="w-5 h-5" />{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-theme-bg min-h-0">
              {" "}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }
 `}
                >
                  {" "}
                  {msg.role === "model" && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      {" "}
                      <Bot className="w-4 h-4" />{" "}
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-theme-card border border-theme-border dark:border-theme-border text-theme-text rounded-tl-sm shadow-sm"
                    }
 `}
                  >
                    {" "}
                    {msg.parts[0].text}
                  </div>{" "}
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-theme-muted flex items-center justify-center shrink-0">
                      {" "}
                      <User className="w-4 h-4" />{" "}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  {" "}
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    {" "}
                    <Bot className="w-4 h-4" />{" "}
                  </div>{" "}
                  <div className="bg-theme-card border border-theme-border dark:border-theme-border text-theme-text rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-1">
                    {" "}
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>{" "}
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{
                        animationDelay: "0.2s",
                      }}
                    ></div>{" "}
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{
                        animationDelay: "0.4s",
                      }}
                    ></div>{" "}
                  </div>{" "}
                </div>
              )}
              <div ref={messagesEndRef} />{" "}
            </div>{" "}
            {/* Input Area */}
            <div className="p-3 bg-theme-card border-t border-theme-border dark:border-theme-border shrink-0">
              {" "}
              <form
                onSubmit={handleSend}
                className="flex items-end gap-2 bg-theme-card-hover rounded-xl p-1"
              >
                {" "}
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-3 text-sm text-theme-text dark:text-white"
                  rows={1}
                />{" "}
                <button
                  type="button"
                  onClick={isRecording ? stopLive : startLive}
                  className={`p-2.5 rounded-lg transition-colors m-1 shrink-0 flex items-center justify-center ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}
                  title={isRecording ? "Stop voice conversation" : "Start voice conversation (Live API)"}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-theme-muted text-white rounded-lg transition-colors m-1 shrink-0"
                >
                  {" "}
                  <Send className="w-4 h-4" />{" "}
                </button>{" "}
              </form>{" "}
            </div>{" "}
          </motion.div>
        )}
      </AnimatePresence>{" "}
    </>
  );
}
