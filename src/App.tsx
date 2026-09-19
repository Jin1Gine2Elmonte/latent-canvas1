import React, { useState, useEffect } from "react";
import { Navbar, NavTab } from "./components/Navbar";
import { VisualStudio } from "./components/VisualStudio";
import { BenchmarkLab } from "./components/BenchmarkLab";
import { CodebaseExplorer } from "./components/CodebaseExplorer";
import { PromptViewer } from "./components/PromptViewer";
import { GrantProposalViewer } from "./components/GrantProposalViewer";
import { ExecutionResult, ProjectFile } from "./types";
import { Terminal, Github, ExternalLink, Sparkles } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("studio");
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLiveAvailable, setIsLiveAvailable] = useState(false);

  // Initialize initial files and default benchmark run
  useEffect(() => {
    // Fetch project files
    fetch("/api/project/files")
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          setFiles(data.files);
        }
      })
      .catch((err) => console.error("Error loading files:", err));

    // Load initial benchmark run so user sees visual DAG immediately
    handleRunQuery(
      "Four agents (A, B, C, D) report on a cluster: A says 'B is compromised'. B says 'C is compromised'. C says 'A and D share the exact same status (both honest or both compromised)'. D says 'A is honest'. Honest agents always tell the truth; compromised agents always lie. Determine the exact truth assignment.",
      "epistemic-parity"
    );
  }, []);

  const handleRunQuery = async (query: string, benchmarkId?: string): Promise<ExecutionResult | null> => {
    setLoading(true);
    try {
      const res = await fetch("/api/latent-canvas/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, benchmarkId }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setIsLiveAvailable(data.isLiveExecution || false);
        return data;
      } else {
        console.error("Run error:", data.error);
        return null;
      }
    } catch (err) {
      console.error("Network error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLiveAvailable={isLiveAvailable}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "studio" && (
          <VisualStudio
            onRun={handleRunQuery}
            result={result}
            loading={loading}
          />
        )}

        {activeTab === "benchmark" && <BenchmarkLab />}

        {activeTab === "codebase" && <CodebaseExplorer files={files} />}

        {activeTab === "prompt" && <PromptViewer />}

        {activeTab === "grant" && <GrantProposalViewer />}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-300">Latent Canvas</span>
            <span>—</span>
            <span>Open-Source Visual Chain-of-Thought (Visual-CoT) Framework</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span className="text-slate-400">License: MIT</span>
            <span className="text-slate-400">Google GenAI SDK v2.4+</span>
            <span className="text-slate-400">Python 3.10+</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
