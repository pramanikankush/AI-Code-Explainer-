"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels";
import { 
  Play, Code2, Cpu, ShieldAlert, TestTube, CheckCircle2, Copy, AlertCircle, 
  Loader2, Settings, Box, Database, Sparkles, FolderGit2, BookOpen, UserCircle, RefreshCcw
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

export default function Home() {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>("java");
  const [mode, setMode] = useState<"beginner" | "expert" | "architect">("expert");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "security" | "tests">("overview");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const loadSample = () => {
    setCode(`public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        throw new IllegalArgumentException("No two sum solution");\n    }\n}`);
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
      setError(err.response?.data?.detail || "Failed to analyze code. Ensure the backend is running.");
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
      
      {/* 1. TOP NAVBAR */}
      <header className="h-14 border-b border-[#262626] flex items-center justify-between px-4 shrink-0 bg-[#0a0a0a]/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Box className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-semibold text-sm tracking-tight leading-none text-white">Code Explainer</h1>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">Enterprise SaaS</span>
          </div>
        </div>
        
        {/* Omnibar Placeholder */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="w-full h-8 bg-[#141414] border border-[#262626] rounded-md flex items-center px-3 text-xs text-gray-500 hover:border-gray-600 transition-colors cursor-text">
            <span className="flex-1">Ask anything about this code...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-gray-500 bg-[#1e1e1e] px-1.5 py-0.5 rounded border border-[#333]">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 mr-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-400 font-medium tracking-wide">API ONLINE</span>
          </div>
          <button className="text-gray-400 hover:text-white p-1.5 transition-colors"><BookOpen className="w-4 h-4" /></button>
          <button className="text-gray-400 hover:text-white p-1.5 transition-colors"><Settings className="w-4 h-4" /></button>
          <button className="text-gray-400 hover:text-white p-1.5 transition-colors"><UserCircle className="w-5 h-5" /></button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE WITH SPLIT PANES */}
      <main className="flex-1 flex overflow-hidden h-[calc(100vh-56px)] min-h-0 w-full relative">
        <PanelGroup orientation="horizontal" className="h-full w-full">
          
          {/* SIDEBAR (FILE TREE PLACEHOLDER) */}
          <Panel defaultSize={15} minSize={10} maxSize={20} className="hidden lg:block bg-[#0a0a0a] border-r border-[#262626]">
            <div className="p-3 text-xs font-semibold text-gray-400 tracking-wider flex items-center justify-between">
              EXPLORER
            </div>
            <div className="px-2 space-y-1">
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-300 hover:bg-[#1a1a1a] rounded cursor-pointer group">
                <FolderGit2 className="w-4 h-4 text-blue-400" />
                <span>Project Root</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-white bg-[#1a1a1a] rounded cursor-pointer ml-4 border border-[#333]">
                <Code2 className="w-4 h-4 text-gray-400" />
                <span>main.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'cpp' ? 'cpp' : 'java'}</span>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 hover:bg-blue-500/50 transition-colors cursor-col-resize active:bg-blue-500" />

          {/* EDITOR PANEL */}
          <Panel defaultSize={40} minSize={30} className="flex flex-col bg-[#0f0f0f] h-full min-h-0 min-w-0">
            {/* Editor Toolbar */}
            <div className="h-10 border-b border-[#262626] flex items-center justify-between px-2 bg-[#141414] shrink-0">
              <div className="flex items-center gap-2">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-gray-300 hover:text-white px-2 py-1 text-xs font-mono focus:outline-none cursor-pointer"
                >
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="go">Go</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#1e1e1e] rounded-md border border-[#333] p-0.5">
                  {["beginner", "expert", "architect"].map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m as any)}
                      className={`px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-sm transition-all ${mode === m ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !code.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-lg shadow-blue-900/20"
                >
                  {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
                </button>
              </div>
            </div>
            
            {/* Monaco Editor */}
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "var(--font-geist-mono)",
                  padding: { top: 20, bottom: 20 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  formatOnPaste: true,
                  renderLineHighlight: "all",
                  lineHeight: 1.5,
                }}
              />
              
              {/* Empty State Overlay inside Editor */}
              {!code && !isAnalyzing && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-[#0f0f0f]/80 backdrop-blur-sm z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center mb-6 shadow-2xl">
                    <Code2 className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">Understand any codebase instantly.</h3>
                  <p className="text-sm text-gray-500 mb-8 max-w-sm text-center">Paste your code, upload a file, or import from GitHub to begin deep technical analysis.</p>
                  
                  <div className="pointer-events-auto flex gap-3">
                    <button onClick={loadSample} className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#262626] border border-[#333] rounded-lg text-sm text-gray-300 hover:text-white transition-all shadow-lg flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" /> Load Sample Snippet
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Editor Footer */}
            <div className="h-7 border-t border-[#262626] bg-[#0a0a0a] flex items-center px-4 justify-between shrink-0">
              <span className="text-[10px] text-gray-500 font-mono flex items-center gap-2">
                <Database className="w-3 h-3" /> UTF-8
              </span>
              <span className="text-[10px] text-blue-400 font-mono tracking-wider uppercase">
                {mode} Mode Active
              </span>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 hover:bg-blue-500/50 transition-colors cursor-col-resize active:bg-blue-500 relative z-20">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-[#333]" />
          </PanelResizeHandle>

          {/* RIGHT PANE: ANALYSIS DASHBOARD (BENTO GRID) */}
          <Panel defaultSize={45} minSize={30} className="flex flex-col bg-[#050505] relative h-full min-h-0 min-w-0 overflow-hidden">
            
            {error && (
              <div className="absolute top-4 left-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-md text-sm flex items-center gap-3 z-30 shadow-2xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050505]/90 backdrop-blur-md">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-b-2 border-purple-500 animate-[spin_1.5s_linear_infinite_reverse]" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white animate-pulse" />
                </div>
                <h3 className="text-lg font-medium text-white mt-6 mb-2">Analyzing Architecture...</h3>
                <p className="text-sm text-gray-500">Evaluating complexity, patterns, and security risks in {mode} mode.</p>
              </div>
            )}

            {!analysis && !isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                <Cpu className="w-16 h-16 text-gray-600 mb-4 stroke-1" />
                <p className="text-sm text-gray-500 font-mono tracking-widest uppercase">AWAITING INPUT</p>
              </div>
            )}

            {analysis && !isAnalyzing && (
              <>
                {/* Tabs */}
                <div className="h-14 border-b border-[#1a1a1a] flex items-center px-4 shrink-0 bg-[#0a0a0a] gap-2 overflow-x-auto custom-scrollbar">
                  {[
                    { id: "overview", label: "Overview", icon: Code2 },
                    { id: "architecture", label: "Architecture", icon: Box },
                    { id: "security", label: "Security & Refactor", icon: ShieldAlert },
                    { id: "tests", label: "Unit Tests", icon: TestTube }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`h-9 px-4 text-xs font-medium flex items-center gap-2 rounded-full relative transition-colors whitespace-nowrap
                        ${activeTab === tab.id ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}
                      `}
                    >
                      <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-blue-400' : ''}`} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Dashboard Scroll Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#050505]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="max-w-4xl mx-auto space-y-6"
                    >
                      
                      {activeTab === "overview" && (
                        <>
                          {/* Bento Grid: Metrics */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-[#111] border border-[#222] rounded-2xl p-5 relative overflow-hidden group hover:border-[#333] transition-colors">
                              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <RefreshCcw className="w-16 h-16 text-blue-500" />
                              </div>
                              <h3 className="text-xs font-mono text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" /> Time Complexity
                              </h3>
                              <div className="text-lg font-medium text-white leading-relaxed">{analysis.time_complexity}</div>
                            </div>
                            <div className="bg-[#111] border border-[#222] rounded-2xl p-5 relative overflow-hidden group hover:border-[#333] transition-colors">
                              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Database className="w-16 h-16 text-purple-500" />
                              </div>
                              <h3 className="text-xs font-mono text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500" /> Space Complexity
                              </h3>
                              <div className="text-lg font-medium text-white leading-relaxed">{analysis.space_complexity}</div>
                            </div>
                          </div>

                          {/* Explanation Card */}
                          <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
                            <h2 className="text-sm font-semibold tracking-wide text-white uppercase mb-4 pb-4 border-b border-[#222]">Deep Dive Explanation</h2>
                            <div className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-400 prose-headings:text-white prose-headings:font-medium prose-p:mb-4">
                              {analysis.explanation?.split('\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {activeTab === "architecture" && (
                        <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
                          <h2 className="text-sm font-semibold tracking-wide text-white uppercase mb-4 pb-4 border-b border-[#222] flex items-center gap-2">
                            <Box className="w-4 h-4 text-blue-400" /> Design Patterns & Structure
                          </h2>
                          <div className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-400">
                            {analysis.architecture?.split('\n').map((paragraph, i) => (
                              <p key={i} className="mb-4">{paragraph}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === "security" && (
                        <div className="space-y-6">
                          {/* Security Module */}
                          <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
                            <h2 className="text-sm font-semibold tracking-wide text-white uppercase mb-4 pb-4 border-b border-[#222] flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4 text-red-400" /> Security Audit
                            </h2>
                            {(!analysis.security_vulnerabilities || analysis.security_vulnerabilities.length === 0) ? (
                              <div className="bg-green-500/5 border border-green-500/10 text-green-400 p-4 rounded-xl flex items-center gap-3 text-sm">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                <p>No critical security vulnerabilities or code smells detected.</p>
                              </div>
                            ) : (
                              <ul className="space-y-3">
                                {analysis.security_vulnerabilities.map((vuln, i) => (
                                  <li key={i} className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex gap-3 text-sm text-gray-300">
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                    <span>{vuln}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          {/* Refactor Module */}
                          <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
                            <h2 className="text-sm font-semibold tracking-wide text-white uppercase mb-4 pb-4 border-b border-[#222] flex items-center gap-2">
                              <Code2 className="w-4 h-4 text-yellow-400" /> Refactoring Suggestions
                            </h2>
                            {(!analysis.refactor_suggestions || analysis.refactor_suggestions.length === 0) ? (
                              <p className="text-sm text-gray-500">Code looks highly optimized. No major refactoring needed.</p>
                            ) : (
                              <ul className="space-y-3">
                                {analysis.refactor_suggestions.map((suggestion, i) => (
                                  <li key={i} className="bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-xl flex gap-3 text-sm text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0 mt-2" />
                                    <span>{suggestion}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === "tests" && (
                        <div className="space-y-6">
                          <h2 className="text-sm font-semibold tracking-wide text-white uppercase mb-2 flex items-center gap-2">
                            <TestTube className="w-4 h-4 text-blue-400" /> Production-Ready Unit Tests
                          </h2>
                          {analysis.junit_tests.length === 0 ? (
                            <p className="text-sm text-gray-500">No tests generated for this code.</p>
                          ) : (
                            <div className="space-y-6">
                              {analysis.junit_tests.map((testCode, i) => (
                                <div key={i} className="relative group border border-[#333] rounded-xl overflow-hidden bg-[#0a0a0a]">
                                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#141414] border-b border-[#333]">
                                    <span className="text-xs font-mono text-gray-400">test_suite_{i + 1}.{language === 'python' ? 'py' : language === 'javascript' ? 'test.js' : language === 'typescript' ? 'test.ts' : 'java'}</span>
                                    <button 
                                      onClick={() => copyToClipboard(testCode, i)}
                                      className="text-gray-500 hover:text-white transition-colors bg-[#222] hover:bg-[#333] px-2 py-1 rounded text-xs flex items-center gap-1.5"
                                      title="Copy code"
                                    >
                                      {copiedIndex === i ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                      {copiedIndex === i ? 'Copied' : 'Copy'}
                                    </button>
                                  </div>
                                  <pre className="p-5 text-[13px] leading-relaxed font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
                                    {testCode}
                                  </pre>
                                </div>
                              ))}
                            </div>
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
