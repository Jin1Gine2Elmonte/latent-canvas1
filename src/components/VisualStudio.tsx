import React, { useState } from "react";
import DOMPurify from "dompurify";
import {
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileDown,
  Sparkles,
  Activity,
  Image as ImageIcon,
  Code2
} from "lucide-react";
import { ExecutionResult } from "../types";

interface VisualStudioProps {
  onRun: (query: string, benchmarkId?: string) => Promise<ExecutionResult | null>;
  result: ExecutionResult | null;
  loading: boolean;
}

const PRESET_QUERIES = [
  {
    id: "epistemic-parity",
    title: "4-Agent Epistemic Parity Dilemma",
    tag: "Circular Paradox",
    prompt:
      "Four agents (A, B, C, D) report on a cluster: A says 'B is compromised'. B says 'C is compromised'. C says 'A and D share the exact same status (both honest or both compromised)'. D says 'A is honest'. Honest agents always tell the truth; compromised agents always lie. Determine the exact truth assignment.",
  },
  {
    id: "confounding-dag",
    title: "Confounded Clinical Trial DAG",
    tag: "Causal Inference",
    prompt:
      "In an observational healthcare dataset, treatment T positively correlates with recovery Y (Risk Ratio = 1.45). However, a genetic biomarker Z influences both treatment choice T and recovery rate Y. Additionally, patient diet X affects biomarker Z. Construct the causal DAG and determine whether treatment T causally improves recovery or if confounding explains the association.",
  },
  {
    id: "circular-deadlock",
    title: "Dijkstra Distributed Circular Wait",
    tag: "State Machine",
    prompt:
      "Four concurrent worker threads (T1, T2, T3, T4) acquire locks on resources R1, R2, R3, R4. T1 holds R1 and awaits R2. T2 holds R2 and awaits R3. T3 holds R3 and awaits R4. T4 holds R4 and requests R1. Deconstruct the resource-allocation topological graph and resolve whether a deadlock exists.",
  },
  {
    id: "knights-knaves",
    title: "Nested Inverted Knights & Knaves",
    tag: "Discrete Logic",
    prompt:
      "On an island where Knights only tell truth and Knaves only lie: Person X claims 'Person Y is a Knave'. Person Y claims 'Neither X nor Z is a Knight'. What are the identities of X, Y, and Z?",
  },
];

export const VisualStudio: React.FC<VisualStudioProps> = ({
  onRun,
  result,
  loading,
}) => {
  const [query, setQuery] = useState(PRESET_QUERIES[0].prompt);
  const [selectedPreset, setSelectedPreset] = useState(PRESET_QUERIES[0].id);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<"visual" | "raster" | "raw_svg">("visual");

  const handleSelectPreset = (preset: typeof PRESET_QUERIES[0]) => {
    setSelectedPreset(preset.id);
    setQuery(preset.prompt);
  };

  const handleExecute = () => {
    if (!query.trim()) return;
    onRun(query, selectedPreset);
  };

  const handleCopySvg = () => {
    if (result?.pass1.latent_graph_svg) {
      navigator.clipboard.writeText(result.pass1.latent_graph_svg);
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    }
  };

  const handleDownloadSvg = () => {
    if (!result?.pass1.latent_graph_svg) return;
    const blob = new Blob([result.pass1.latent_graph_svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `latent-canvas-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportReport = () => {
    if (!result) return;
    const reportContent = `# Latent Canvas Run Verification Report
**Timestamp:** ${new Date().toISOString()}
**Model Backend:** ${result.model || "Local Simulator"}
**Execution Latency:** ${result.metrics.executionTimeMs.toFixed(1)}ms
**Confidence Score:** ${(result.pass2.confidence_score * 100).toFixed(1)}%

---

## 1. Input Problem Query
> ${result.query}

---

## 2. Pass 1: Topological Deconstruction
### Extracted Observations:
${result.pass1.topological_observations.map((obs, i) => `${i + 1}.${obs}`).join("\n")}

### Preliminary Hypothesis:
> ${result.pass1.initial_hypothesis}

### Intermediate SVG Graph:
\`\`\`xml
${result.pass1.latent_graph_svg}
\`\`\`

---

## 3. Pass 2: Multimodal Verification Audit
- **Cycle / Deadlock Detected:** ${result.pass2.cycle_detected ? "YES" : "NO"}
- **Discrepancy Analysis:** ${result.pass2.discrepancy_analysis}
- **Visual Anomalies Checked:**
${(result.pass2.visual_anomalies_detected || []).map((a) => `- ${a}`).join("\n") || "None"}

---

## 4. Final Verified Resolution
### Definitive Answer:
${result.pass2.final_answer}

### Proof Summary:
${result.pass2.proof_summary}
`;

    const blob = new Blob([reportContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `latent-canvas-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sanitizedSvg = result?.pass1.latent_graph_svg
    ? DOMPurify.sanitize(result.pass1.latent_graph_svg, { USE_PROFILES: { svg: true } })
    : "";

  return (
    <div className="space-y-6">
      {/* Query Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="h-5 w-5 text-sky-400" />
              Visual-CoT Interactive Studio
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Construct intermediate 2D topological graphs in raw SVG, rasterize in-memory,
              and perform multimodal self-critique before emitting verified resolutions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_QUERIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                    selectedPreset === p.id
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50"
                  }`}
                >
                  {p.tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter complex logic problem, causal DAG puzzle, or state machine condition..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all font-sans resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              <span>Two-Pass: Pass 1 (SVG Graph) → In-Memory Rasterization → Pass 2 (Multimodal Vision Audit)</span>
            </div>
            <button
              onClick={handleExecute}
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-md shadow-sky-500/20 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Executing Visual-CoT...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Run Latent Canvas</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Workspace */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Canvas View Area */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-950/70 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  <span className="font-semibold text-slate-200 uppercase tracking-wider font-mono">
                    Pass 1 // Intermediate Scratchpad
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveViewMode("visual")}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      activeViewMode === "visual"
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    SVG Visual
                  </button>
                  <button
                    onClick={() => setActiveViewMode("raster")}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      activeViewMode === "raster"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <ImageIcon className="h-3 w-3" />
                    Raster (PNG)
                  </button>
                  <button
                    onClick={() => setActiveViewMode("raw_svg")}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                      activeViewMode === "raw_svg"
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Raw SVG
                  </button>
                  <div className="h-3.5 w-px bg-slate-800 mx-1" />
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[11px] text-slate-500 font-mono w-8 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.2))}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <div className="h-3.5 w-px bg-slate-800 mx-1" />
                  <button
                    onClick={handleCopySvg}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                    title="Copy SVG"
                  >
                    {copiedSvg ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={handleDownloadSvg}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                    title="Download SVG"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* View Container */}
              <div className="p-4 bg-slate-950/90 flex items-center justify-center overflow-auto min-h-[380px] max-h-[500px]">
                {activeViewMode === "visual" && (
                  <div
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                    className="transition-transform duration-150 w-full flex justify-center"
                    dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
                  />
                )}
                {activeViewMode === "raster" && (
                  <div
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                    className="transition-transform duration-150 w-full flex justify-center"
                  >
                    {result.pass1.rasterized_png_base64 ? (
                      <img
                        src={`data:image/png;base64,${result.pass1.rasterized_png_base64}`}
                        alt="In-memory Rasterized Topological Graph"
                        className="rounded-lg shadow-lg border border-slate-800 max-w-full"
                      />
                    ) : (
                      <div className="text-slate-500 text-xs">No rasterized frame generated.</div>
                    )}
                  </div>
                )}
                {activeViewMode === "raw_svg" && (
                  <pre className="w-full text-[11px] font-mono text-sky-300/90 p-4 bg-slate-950 overflow-x-auto max-h-[460px] whitespace-pre-wrap leading-relaxed">
                    {result.pass1.latent_graph_svg}
                  </pre>
                )}
              </div>

              <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span>ViewBox: 800x500</span>
                  <span>•</span>
                  <span>Payload: {(result.metrics.svgLength / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>Latency: {result.metrics.executionTimeMs.toFixed(1)}ms</span>
                </div>
                <button
                  onClick={handleExportReport}
                  className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors font-mono cursor-pointer"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  <span>Export Report (MD)</span>
                </button>
              </div>
            </div>

            {/* Observations List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-2 flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-sky-400" />
                Pass 1 Topological Findings ({result.pass1.topological_observations.length})
              </h3>
              <ul className="space-y-1.5">
                {result.pass1.topological_observations.map((obs, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/60 p-2 rounded border border-slate-800/50"
                  >
                    <span className="text-sky-400 font-mono font-bold mt-0.5">{idx + 1}.</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="text-amber-400 font-bold uppercase tracking-wide font-mono block mb-1">
                  Pass 1 Preliminary Hypothesis:
                </span>
                <p className="text-slate-200">{result.pass1.initial_hypothesis}</p>
              </div>
            </div>
          </div>

          {/* Pass 2 Multimodal Verification Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-400" />
                  Pass 2 // Multimodal Self-Critique
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                      result.pass2.cycle_detected
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {result.pass2.cycle_detected ? "Cycle Detected" : "Acyclic DAG"}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {(result.pass2.confidence_score * 100).toFixed(0)}% Confidence
                  </span>
                </div>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-purple-500/20">
                  <span className="text-slate-400 font-medium block mb-1">
                    Spatial Discrepancy Analysis:
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {result.pass2.discrepancy_analysis}
                  </p>
                </div>
                {result.pass2.visual_anomalies_detected &&
                  result.pass2.visual_anomalies_detected.length > 0 && (
                    <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 font-medium block mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3 text-amber-400" />
                        Visual Anomalies Checked:
                      </span>
                      <ul className="space-y-1 mt-1">
                        {result.pass2.visual_anomalies_detected.map((anomaly, idx) => (
                          <li key={idx} className="text-slate-300 text-[11px] flex gap-1.5">
                            <span className="text-purple-400">•</span>
                            <span>{anomaly}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>

            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-xl p-5 shadow-2xl relative">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Verified Final Resolution
                </h3>
                <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Audit Passed
                </span>
              </div>
              <div className="bg-slate-950/90 border border-emerald-500/30 rounded-lg p-3.5 mb-4">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                  Definitive Answer:
                </span>
                <p className="text-sm sm:text-base font-bold text-white leading-snug">
                  {result.pass2.final_answer}
                </p>
              </div>
              {result.pass2.proof_summary && (
                <div className="text-xs text-slate-300 space-y-2">
                  <span className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Topological Proof Summary:
                  </span>
                  <p className="leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800 text-slate-300">
                    {result.pass2.proof_summary}
                  </p>
                </div>
              )}
              {result.notice && (
                <div className="mt-3 text-[11px] text-amber-400/90 bg-amber-500/10 p-2.5 rounded border border-amber-500/20">
                  {result.notice}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
