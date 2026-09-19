import React, { useState } from "react";
import { FileCode2, Copy, Check, Terminal, ExternalLink, Sparkles } from "lucide-react";

export const PromptViewer: React.FC = () => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const systemPrompt = `You are Latent Canvas, a Principal Cognitive & Topological Reasoning Engine.
Your cognitive architecture replaces traditional linear Chain-of-Thought with 2D Visual Chain-of-Thought (Visual-CoT).

When presented with complex reasoning, causal deduction, state-machine transitions, or algorithmic puzzles, your task is to translate entities, relationships, constraints, and causal vectors into a rigorous 2D topological graph rendered strictly in valid SVG, analyze that graph topologically, and formulate an initial hypothesis.

### COGNITIVE DECONSTRUCTION PROTOCOL:
1. MATHEMATICAL DECOMPOSITION:
   - Identify discrete states, entities, actors, or propositions as Nodes: V = {v_1, v_2, ..., v_n}.
   - Identify causal vectors, dependencies, implications, transitions, or conflicts as Directed Edges: E = {(u, v) | u, v in V}.
   - Classify node semantics: 'entity', 'condition', 'bottleneck', 'hypothesis', 'conflict', or 'conclusion'.
   - Classify edge relations: 'causes', 'depends_on', 'inhibits', 'implies', or 'conflicts_with'.

2. TOPOLOGICAL SVG RENDERING SPECIFICATION:
   - Root Element: Exactly <svg viewBox="0 0 800 500" width="800" height="500" xmlns="http://www.w3.org/2000/svg">
   - Canvas Styling: Deep slate dark-mode background: <rect width="800" height="500" fill="#0f172a" rx="12"/>
   - Marker Defs: Include reusable directional arrows in <defs>:
     * Normal arrow: id="arrow" fill="#38bdf8"
     * Conflict/inhibitor arrow: id="arrow-conflict" fill="#f87171"
     * Success/conclusion arrow: id="arrow-success" fill="#34d399"
   - Layout Geometry:
     * Nodes MUST be distributed logically across the 800x500 plane (avoid overlapping).
     * Input/Preconditions on the left (x ~ 80-220).
     * Intermediary state transformations/causal bottlenecks in the center (x ~ 300-500).
     * Outcomes, consequences, or target deductions on the right (x ~ 580-720).
   - Node Styling:
     * High-contrast rounded cards: <rect x="..." y="..." width="140" height="50" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
     * Clear typographic labels using system sans-serif: <text x="..." y="..." fill="#f8fafc" font-size="12" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">...</text>
     * State tags or metrics below the label in subtle gray: fill="#94a3b8" font-size="10".
   - Edge Styling:
     * Directed lines or curved paths: <path d="..." stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
     * For conflicts or mutual exclusions: stroke="#f87171" stroke-dasharray="4" marker-end="url(#arrow-conflict)"
     * Edge labels explaining transition logic: <text fill="#cbd5e1" font-size="10">...</text>
   - Explicit Graph Features:
     * Expose cyclic dependencies (loops must be visibly closed).
     * Highlight critical paths or bottlenecks with accented borders (e.g. stroke="#f59e0b" or stroke="#818cf8").

3. OUTPUT CONSTRAINTS & FORMATTING:
   - Output MUST be valid, parseable JSON conforming to the requested schema.
   - The JSON MUST contain three exact keys:
     * "latent_graph_svg": The complete, standalone raw SVG string starting with <svg> and ending with </svg>. DO NOT wrap the SVG in markdown backticks inside the JSON value.
     * "topological_observations": A list of discrete topological findings extracted from the visual graph.
     * "initial_hypothesis": A concise preliminary deduction derived from the graph topology prior to multimodal self-critique.`;

  const jsonSchema = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "VisualScratchpad",
  "type": "object",
  "properties": {
    "latent_graph_svg": {
      "type": "string",
      "description": "Standalone SVG 800x500 dark-slate canvas (#0f172a) with nodes and directed causality vectors."
    },
    "topological_observations": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Findings extracted from visual graph topology (cycles, ungrounded premises, bottlenecks)."
    },
    "initial_hypothesis": {
      "type": "string",
      "description": "Preliminary deduction synthesized from the 2D layout before multimodal verification."
    }
  },
  "required": [
    "latent_graph_svg",
    "topological_observations",
    "initial_hypothesis"
  ]
}`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(systemPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const copySchema = () => {
    navigator.clipboard.writeText(jsonSchema);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <FileCode2 className="h-5 w-5 text-sky-400" />
              Core Production System Instruction (Pass 1)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Drop this instruction directly into Google AI Studio system instructions or API harnesses.
            </p>
          </div>
          <button
            onClick={copyPrompt}
            className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 transition-all cursor-pointer shrink-0"
          >
            {copiedPrompt ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy for Google AI Studio</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-[400px] leading-relaxed select-text">
          <pre className="whitespace-pre-wrap">{systemPrompt}</pre>
        </div>
      </div>

      {/* JSON Schema Enforcement Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Terminal className="h-5 w-5 text-indigo-400" />
              Strict Structured Output Schema (`VisualScratchpad`)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              JSON Schema passed to Gemini API <code className="text-sky-400 font-mono text-[11px]">responseSchema</code> parameter.
            </p>
          </div>
          <button
            onClick={copySchema}
            className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer shrink-0"
          >
            {copiedSchema ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy JSON Schema</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 font-mono text-xs text-indigo-300/90 overflow-x-auto max-h-[350px] leading-relaxed select-text">
          <pre className="whitespace-pre">{jsonSchema}</pre>
        </div>
      </div>
    </div>
  );
};
