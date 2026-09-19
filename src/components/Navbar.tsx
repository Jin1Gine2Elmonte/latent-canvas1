import React from "react";
import {
  Compass,
  Cpu,
  FolderTree,
  FileCode2,
  Award,
  Sparkles,
  Terminal,
  ExternalLink,
} from "lucide-react";

export type NavTab = "studio" | "benchmark" | "codebase" | "prompt" | "grant";

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isLiveAvailable: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isLiveAvailable,
}) => {
  const tabs = [
    { id: "studio" as NavTab, label: "Visual-CoT Studio", icon: Compass },
    { id: "benchmark" as NavTab, label: "Paradigm Benchmark", icon: Cpu },
    { id: "codebase" as NavTab, label: "Codebase & Artifacts", icon: FolderTree },
    { id: "prompt" as NavTab, label: "System Instruction & Schema", icon: FileCode2 },
    { id: "grant" as NavTab, label: "Grant Proposal (Pitch)", icon: Award },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white font-mono">
                  Latent Canvas
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  v0.1.0-alpha
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Visual Chain-of-Thought (Visual-CoT) Multimodal Harness
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Indicator */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-mono text-[11px]">
                {isLiveAvailable ? "Gemini Live" : "Topological Simulator"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
