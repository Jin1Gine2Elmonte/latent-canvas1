import React, { useState } from "react";
import {
  FileCode,
  Copy,
  Check,
  Download,
  Folder,
  ChevronRight,
  Terminal,
  FileText,
  Settings,
  Shield,
  Layers,
} from "lucide-react";
import { ProjectFile } from "../types";

interface CodebaseExplorerProps {
  files: ProjectFile[];
}

export const CodebaseExplorer: React.FC<CodebaseExplorerProps> = ({ files }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    files[0]?.path || "latent_canvas/core.py"
  );
  const [copied, setCopied] = useState(false);

  const selectedFile =
    files.find((f) => f.path === selectedFilePath) || files[0];

  const handleCopy = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!selectedFile?.content) return;
    const blob = new Blob([selectedFile.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile.path.split("/").pop() || "file.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = Array.from(new Set(files.map((f) => f.category)));

  const getFileIcon = (lang: string) => {
    switch (lang) {
      case "python":
        return <FileCode className="h-4 w-4 text-sky-400" />;
      case "toml":
      case "yaml":
        return <Settings className="h-4 w-4 text-amber-400" />;
      case "markdown":
        return <FileText className="h-4 w-4 text-indigo-400" />;
      default:
        return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal className="h-4 w-4 text-sky-400" />
            Complete Project Codebase & Production Artifacts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full Python engine, Pydantic V2 schemas, Cairo rasterizer, Typer CLI, CI matrix, and documentation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy File</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
        {/* Left Sidebar: File Tree (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-800 bg-slate-950/40 p-4 overflow-y-auto max-h-[620px]">
          <div className="text-[11px] font-mono uppercase text-slate-500 font-bold mb-3 tracking-wider">
            Repository Manifest
          </div>

          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat}>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                  <Folder className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{cat}</span>
                </div>
                <div className="space-y-1 pl-2">
                  {files
                    .filter((f) => f.category === cat)
                    .map((file) => {
                      const isSelected = selectedFilePath === file.path;
                      return (
                        <button
                          key={file.path}
                          onClick={() => setSelectedFilePath(file.path)}
                          className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-md text-xs font-mono transition-all ${
                            isSelected
                              ? "bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {getFileIcon(file.language)}
                            <span className="truncate">{file.path}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                            {file.lines}L
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Code Viewer (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950">
          {/* File Tab Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-sky-400 font-bold">{selectedFile?.path}</span>
              <span className="text-slate-600">•</span>
              <span>{selectedFile?.lines} lines</span>
              <span className="text-slate-600">•</span>
              <span>{((selectedFile?.sizeBytes || 0) / 1024).toFixed(1)} KB</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase">
              {selectedFile?.language}
            </span>
          </div>

          {/* Code Content with Line Numbers */}
          <div className="p-4 font-mono text-xs overflow-auto max-h-[580px] leading-relaxed select-text">
            <pre className="text-slate-200 whitespace-pre font-mono">
              {selectedFile?.content.split("\n").map((line, idx) => (
                <div key={idx} className="table-row hover:bg-slate-900/40">
                  <span className="table-cell select-none text-right pr-4 text-slate-600 w-10 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre">{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
