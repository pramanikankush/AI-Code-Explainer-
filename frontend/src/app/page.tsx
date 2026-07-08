"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import {
  Play, Code2, Cpu, ShieldAlert, TestTube, CheckCircle2, Copy, AlertCircle,
  Loader2, Settings, Box, Database, Sparkles, FolderGit2, BookOpen, UserCircle,
  RefreshCcw, ChevronDown, X, Zap, Clock, Shield, GitBranch, Terminal, MessageSquare, Send
} from "lucide-react";
import axios from "axios";

interface AnalysisResponse {
  explanation: string;
  architecture: string;
  time_complexity: string;
  space_complexity: string;
  junit_tests: string[];
  security_vulnerabilities: string[];
  refactor_suggestions: string[];
}

interface ChatResponse {
  answer: string;
}

const LANGUAGES = [
  { value: "java",       label: "Java",       ext: "java", color: "#f89820" },
  { value: "python",     label: "Python",     ext: "py",   color: "#3776ab" },
  { value: "javascript", label: "JavaScript", ext: "js",   color: "#f7df1e" },
  { value: "typescript", label: "TypeScript", ext: "ts",   color: "#3178c6" },
  { value: "go",         label: "Go",         ext: "go",   color: "#00add8" },
  { value: "cpp",        label: "C++",        ext: "cpp",  color: "#00599c" },
];

function LanguageDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.value === value) ?? LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1a1a1a] border border-[#333] hover:border-[#555] text-xs font-mono text-gray-300 hover:text-white transition-all"
      >
        <span style={{ color: current.color }} className="font-semibold">{current.label}</span>
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1.5 min-w-[130px] bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden py-1"
          >
            {LANGUAGES.map(lang => (
              <button
                key={lang.value}
                onClick={() => { onChange(lang.value); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-left hover:bg-[#222] transition-colors ${value === lang.value ? "bg-[#1e1e1e] text-white" : "text-gray-400"}`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: lang.color }} />
                <span>{lang.label}</span>
                {value === lang.value && <CheckCircle2 className="w-3 h-3 text-blue-400 ml-auto" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md"
          >
            <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Settings className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">API Settings</h2>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Backend Configuration</h3>
                  <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">API Endpoint</span>
                      <code className="text-xs text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded">localhost:8000</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">AI Model</span>
                      <code className="text-xs text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded">gemini-2.5-flash</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Status</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-green-400 font-mono">ONLINE</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Rate Limiting</h3>
                  <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" /> Requests / Minute
                      </div>
                      <span className="text-xs text-white font-mono font-semibold">5</span>
                    </div>
                    <div className="w-full bg-[#1a1a1a] rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 rounded-full" style={{ width: "40%" }} />
                    </div>
                    <p className="text-[10px] text-gray-600">Sliding window rate limit per IP address. Returns 429 when exceeded.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Response Cache</h3>
                  <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5 text-blue-400" /> Cache TTL
                      </div>
                      <span className="text-xs text-white font-mono font-semibold">60 min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Database className="w-3.5 h-3.5 text-purple-400" /> Max Entries
                      </div>
                      <span className="text-xs text-white font-mono font-semibold">100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Shield className="w-3.5 h-3.5 text-green-400" /> Eviction Policy
                      </div>
                      <span className="text-xs text-white font-mono font-semibold">LRU</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-[#222] bg-[#0a0a0a]/50">
                <p className="text-[10px] text-gray-600 text-center font-mono">Settings are read-only in the UI. Edit <code className="text-gray-400">backend/core/config.py</code> to change limits.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DocsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-80 bg-[#111] border-l border-[#222] z-[101] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Documentation</h2>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {[
                {
                  icon: Terminal, color: "text-green-400", title: "Quick Start",
                  items: ["Paste code in the editor", "Select language from the dropdown", "Choose analysis mode (Beginner / Expert / Architect)", "Click Analyze to run AI analysis"]
                },
                {
                  icon: GitBranch, color: "text-purple-400", title: "Analysis Modes",
                  items: ["Beginner – Simple explanations, line-by-line", "Expert – Deep technical + algorithmic analysis", "Architect – SOLID, design patterns, scalability"]
                },
                {
                  icon: Shield, color: "text-red-400", title: "Security Audit",
                  items: ["Detects injection vulnerabilities", "Identifies insecure patterns", "Flags code smells and anti-patterns"]
                },
                {
                  icon: TestTube, color: "text-yellow-400", title: "Unit Tests",
                  items: ["Generates production-ready test code", "Language-appropriate test frameworks", "Edge case and boundary coverage"]
                },
                {
                  icon: MessageSquare, color: "text-blue-400", title: "Code Chat (New)",
                  items: ["Use the omnibar (Cmd+K) to ask specific questions about the provided code snippet."]
                }
              ].map(section => (
                <div key={section.title}>
                  <div className="flex items-center gap-2 mb-3">
                    <section.icon className={`w-4 h-4 ${section.color}`} />
                    <h3 className="text-xs font-semibold text-white">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                        <div className="w-1 h-1 rounded-full bg-gray-600 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-blue-400 mb-2">API Endpoints</h3>
                <div className="space-y-1.5 font-mono">
                  <div className="text-[11px] text-gray-400"><span className="text-green-400">GET</span>  /health</div>
                  <div className="text-[11px] text-gray-400"><span className="text-blue-400">POST</span> /api/v1/analyze</div>
                  <div className="text-[11px] text-gray-400"><span className="text-blue-400">POST</span> /api/v1/chat</div>
                  <div className="text-[11px] text-gray-400"><span className="text-green-400">GET</span>  /api/v1/openapi.json</div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProfilePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed top-14 right-4 w-64 bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl z-[100] overflow-hidden"
          >
            <div className="p-4 border-b border-[#222] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                CE
              </div>
              <div>
                <p className="text-sm font-medium text-white">Code Explainer</p>
                <p className="text-xs text-gray-500">Enterprise Edition v1.1.0</p>
              </div>
            </div>
            <div className="p-2">
              {["OpenAPI Docs", "GitHub Repo", "Report Issue"].map(item => (
                <button key={item} className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ChatOverlay({ open, onClose, code, language }: { open: boolean; onClose: () => void; code: string; language: string; }) {
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setAnswer(null);
      setError(null);
      setQuestion("");
    }
  }, [open]);

  const handleAsk = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim()) return;
    if (!code.trim()) {
      setError("Please add some code to the editor first.");
      return;
    }
    
    setIsAsking(true);
    setError(null);
    setAnswer(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const response = await axios.post<ChatResponse>(`${apiUrl}/chat`, {
        code,
        language,
        question
      });
      setAnswer(response.data.answer);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(detail || "Failed to get an answer. Ensure the backend is running.");
      console.error(err);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[120] w-full max-w-2xl px-4"
          >
            <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
              
              <form onSubmit={handleAsk} className="relative border-b border-[#222]">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything about the provided code..."
                  className="w-full bg-transparent text-white placeholder-gray-500 py-4 pl-12 pr-12 outline-none text-sm font-medium"
                />
                <button
                  type="submit"
                  disabled={isAsking || !question.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-lg transition-colors"
                >
                  {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-950/30 border-b border-red-900/30 text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Answer Area */}
              {answer && (
                <div className="p-5 overflow-y-auto bg-[#0a0a0a] min-h-[100px]">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 text-sm leading-relaxed text-gray-300 space-y-3 font-sans pb-4 whitespace-pre-wrap">
                      {answer}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Help footer if no answer yet */}
              {!answer && !error && !isAsking && (
                 <div className="p-3 bg-[#0a0a0a] text-[10px] text-gray-500 font-mono text-center flex justify-center items-center gap-4">
                   <span>Press <kbd className="bg-[#1e1e1e] border border-[#333] rounded px-1">Esc</kbd> to close</span>
                   <span>Press <kbd className="bg-[#1e1e1e] border border-[#333] rounded px-1">Enter</kbd> to ask</span>
                 </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>("java");
  const [mode, setMode] = useState<"beginner" | "expert" | "architect">("expert");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "security" | "tests">("overview");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const currentLang = LANGUAGES.find(l => l.value === language) ?? LANGUAGES[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowChat(true);
      }
      if (e.key === 'Escape') {
        setShowChat(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadSample = () => {
    setCode(`public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        throw new IllegalArgumentException("No two sum solution");\n    }\n}`);
    setLanguage("java");
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError("Please enter some code to analyze.");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const response = await axios.post<AnalysisResponse>(`${apiUrl}/analyze`, {
        code,
        language,
        mode
      });
      setAnalysis(response.data);
      setActiveTab("overview");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (err.response?.status === 429) {
        setError("Rate limit exceeded. Please wait a minute before analyzing again.");
      } else {
        setError(detail || "Failed to analyze code. Ensure the backend is running on port 8000.");
      }
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, index: number = -1) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#0a0a0a] text-[#ededed] font-sans selection:bg-blue-500/30">

      {/* Modals & Drawers */}
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      <DocsDrawer open={showDocs} onClose={() => setShowDocs(false)} />
      <ProfilePanel open={showProfile} onClose={() => setShowProfile(false)} />
      <ChatOverlay open={showChat} onClose={() => setShowChat(false)} code={code} language={language} />

      {/* TOP NAVBAR */}
      <header className="h-14 border-b border-[#1e1e1e] flex items-center justify-between px-4 shrink-0 bg-[#0a0a0a]/90 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-900/30">
            <Box className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-semibold text-sm tracking-tight leading-none text-white">Code Explainer</h1>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">Enterprise</span>
          </div>
        </div>

        {/* Omnibar / Chat trigger */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div 
            onClick={() => setShowChat(true)}
            className="w-full h-8 bg-[#141414] border border-[#252525] rounded-lg flex items-center px-3 text-xs text-gray-500 hover:border-gray-600 transition-colors cursor-text group"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-2 text-gray-600 group-hover:text-blue-400 transition-colors" />
            <span className="flex-1 group-hover:text-gray-300 transition-colors">Ask anything about this code...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-gray-600 bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333]">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 mr-1 px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-400 font-semibold tracking-wide">API ONLINE</span>
          </div>
          <button
            onClick={() => setShowDocs(v => !v)}
            className="text-gray-400 hover:text-white p-2 transition-colors rounded-lg hover:bg-white/5"
            title="Documentation"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(v => !v)}
            className="text-gray-400 hover:text-white p-2 transition-colors rounded-lg hover:bg-white/5"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowProfile(v => !v)}
            className="text-gray-400 hover:text-white p-2 transition-colors rounded-lg hover:bg-white/5"
            title="Profile"
          >
            <UserCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex overflow-hidden h-[calc(100vh-56px)] min-h-0 w-full relative">
        <PanelGroup orientation="horizontal" className="h-full w-full">

          {/* SIDEBAR */}
          <Panel defaultSize={15} minSize={10} maxSize={20} className="hidden lg:block bg-[#0a0a0a] border-r border-[#1e1e1e]">
            <div className="p-3 text-[10px] font-semibold text-gray-500 tracking-widest uppercase flex items-center justify-between">
              Explorer
            </div>
            <div className="px-2 space-y-0.5">
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-400 hover:bg-[#1a1a1a] rounded cursor-pointer">
                <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Project Root</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-white bg-[#1a1a1a] rounded cursor-pointer ml-3 border-l-2" style={{ borderColor: currentLang.color }}>
                <Code2 className="w-3.5 h-3.5 text-gray-400" />
                <span>main.{currentLang.ext}</span>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-px hover:w-1 bg-[#1e1e1e] hover:bg-blue-500/50 transition-all cursor-col-resize relative z-10" />

          {/* EDITOR PANEL */}
          <Panel defaultSize={42} minSize={28} className="flex flex-col bg-[#0f0f0f] h-full min-h-0 min-w-0">
            {/* Editor Toolbar */}
            <div className="h-11 border-b border-[#1e1e1e] flex items-center justify-between px-3 bg-[#0f0f0f] shrink-0">
              <LanguageDropdown value={language} onChange={setLanguage} />

              <div className="flex items-center gap-2">
                {/* Mode Selector */}
                <div className="flex items-center bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-0.5">
                  {(["beginner", "expert", "architect"] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md transition-all ${
                        mode === m
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-900/40"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !code.trim()}
                  className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                >
                  {isAnalyzing
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Play className="w-3.5 h-3.5 fill-current" />
                  }
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 20, bottom: 20 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  renderLineHighlight: "all",
                  lineHeight: 1.6,
                  fontLigatures: true,
                }}
              />

              {/* Empty State */}
              {!code && !isAnalyzing && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-[#0f0f0f]/90 backdrop-blur-sm z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-5 shadow-2xl">
                    <Code2 className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Understand any codebase instantly.</h3>
                  <p className="text-xs text-gray-500 mb-7 max-w-xs text-center leading-relaxed">
                    Paste code or load a sample to begin AI-powered deep analysis.
                  </p>
                  <div className="pointer-events-auto">
                    <button
                      onClick={loadSample}
                      className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-[#444] rounded-xl text-sm text-gray-300 hover:text-white transition-all flex items-center gap-2 shadow-lg"
                    >
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      Load Sample Snippet
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Editor Footer */}
            <div className="h-7 border-t border-[#1e1e1e] bg-[#0a0a0a] flex items-center px-4 justify-between shrink-0">
              <span className="text-[10px] text-gray-600 font-mono flex items-center gap-1.5">
                <Database className="w-3 h-3" /> UTF-8
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase" style={{ color: currentLang.color }}>
                {currentLang.label} · {mode} mode
              </span>
            </div>
          </Panel>

          <PanelResizeHandle className="w-px hover:w-1 bg-[#1e1e1e] hover:bg-blue-500/50 transition-all cursor-col-resize relative z-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-[#2a2a2a]" />
          </PanelResizeHandle>

          {/* RIGHT PANE: ANALYSIS DASHBOARD */}
          <Panel defaultSize={43} minSize={30} className="flex flex-col bg-[#080808] relative h-full min-h-0 min-w-0 overflow-hidden">

            {/* Error Toast */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute top-4 left-4 right-4 bg-red-950/80 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-3 z-30 shadow-2xl backdrop-blur-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <p className="flex-1">{error}</p>
                  <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analyzing Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#080808]/95 backdrop-blur-md">
                <div className="w-16 h-16 relative mb-6">
                  <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-b-2 border-purple-500 animate-[spin_1.5s_linear_infinite_reverse]" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-300 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Analyzing Architecture...</h3>
                <p className="text-xs text-gray-500 font-mono">Running in <span className="text-blue-400">{mode}</span> mode</p>
              </div>
            )}

            {/* Empty State */}
            {!analysis && !isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-30">
                <Cpu className="w-16 h-16 text-gray-600 stroke-1" />
                <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">Awaiting Input</p>
              </div>
            )}

            {/* Analysis Results */}
            {analysis && !isAnalyzing && (
              <>
                {/* Tabs */}
                <div className="h-12 border-b border-[#161616] flex items-center px-3 shrink-0 bg-[#0a0a0a] gap-1 overflow-x-auto">
                  {[
                    { id: "overview",      label: "Overview",          icon: Code2      },
                    { id: "architecture",  label: "Architecture",      icon: Box        },
                    { id: "security",      label: "Security",          icon: ShieldAlert },
                    { id: "tests",         label: "Tests",             icon: TestTube   },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`h-8 px-3.5 text-[11px] font-medium flex items-center gap-1.5 rounded-lg transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? "bg-white/10 text-white"
                          : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                      }`}
                    >
                      <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? "text-blue-400" : ""}`} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      {activeTab === "overview" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: "Time Complexity",  value: analysis.time_complexity,  color: "blue",   icon: RefreshCcw },
                              { label: "Space Complexity", value: analysis.space_complexity, color: "purple", icon: Database   },
                            ].map(card => (
                              <div key={card.label} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-4 hover:border-[#2a2a2a] transition-colors">
                                <p className={`text-[10px] font-mono uppercase tracking-wider text-${card.color}-400/70 mb-2 flex items-center gap-1.5`}>
                                  <card.icon className="w-3 h-3" /> {card.label}
                                </p>
                                <p className="text-sm font-semibold text-white leading-snug">{card.value}</p>
                              </div>
                            ))}
                          </div>

                          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
                            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-[#1e1e1e]">
                              Deep Dive Explanation
                            </h2>
                            <div className="text-sm leading-relaxed text-gray-300 space-y-3">
                              {analysis.explanation.split('\n').filter(Boolean).map((p, i) => (
                                <p key={i}>{p}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "architecture" && (
                        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
                          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-[#1e1e1e] flex items-center gap-2">
                            <Box className="w-4 h-4 text-blue-400" /> Design Patterns & Structure
                          </h2>
                          <div className="text-sm leading-relaxed text-gray-300 space-y-3">
                            {analysis.architecture.split('\n').filter(Boolean).map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === "security" && (
                        <div className="space-y-4">
                          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
                            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-[#1e1e1e] flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4 text-red-400" /> Security Audit
                            </h2>
                            {(!analysis.security_vulnerabilities || analysis.security_vulnerabilities.length === 0) ? (
                              <div className="flex items-center gap-3 text-sm text-green-400 bg-green-500/5 border border-green-500/10 rounded-xl p-4">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                No critical vulnerabilities detected.
                              </div>
                            ) : (
                              <ul className="space-y-2">
                                {analysis.security_vulnerabilities.map((v, i) => (
                                  <li key={i} className="flex gap-3 text-sm text-gray-300 bg-red-500/5 border border-red-500/10 p-3.5 rounded-xl">
                                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                    {v}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
                            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 pb-3 border-b border-[#1e1e1e] flex items-center gap-2">
                              <Code2 className="w-4 h-4 text-yellow-400" /> Refactoring Suggestions
                            </h2>
                            {(!analysis.refactor_suggestions || analysis.refactor_suggestions.length === 0) ? (
                              <p className="text-sm text-gray-500">No major refactoring needed.</p>
                            ) : (
                              <ul className="space-y-2">
                                {analysis.refactor_suggestions.map((s, i) => (
                                  <li key={i} className="flex gap-3 text-sm text-gray-300 bg-yellow-500/5 border border-yellow-500/10 p-3.5 rounded-xl">
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0 mt-2" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === "tests" && (
                        <div className="space-y-4">
                          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <TestTube className="w-4 h-4 text-blue-400" /> Production-Ready Unit Tests
                          </h2>
                          {analysis.junit_tests.length === 0 ? (
                            <p className="text-sm text-gray-500">No tests generated.</p>
                          ) : (
                            analysis.junit_tests.map((testCode, i) => (
                              <div key={i} className="border border-[#222] rounded-xl overflow-hidden bg-[#0a0a0a]">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-[#111] border-b border-[#222]">
                                  <span className="text-[11px] font-mono text-gray-400">
                                    test_suite_{i + 1}.{currentLang.ext}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(testCode, i)}
                                    className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-white bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] px-2.5 py-1 rounded-md transition-all"
                                  >
                                    {copiedIndex === i ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copiedIndex === i ? "Copied!" : "Copy"}
                                  </button>
                                </div>
                                <pre className="p-4 text-[12px] leading-relaxed font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                  {testCode}
                                </pre>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </>
            )}
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}
